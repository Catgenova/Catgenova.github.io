#!/usr/bin/env python3
"""Daily 15x15 newspaper-style crosswords.

  python3 daily.py fill 2026-11-26 [more dates]   # the Large themed 15x15 (slow-ish)
  python3 daily.py sizes 2026-11-26 [...] | all   # the Small and Medium grids
  python3 daily.py missing 2026-11-26 [...]       # answers that still need clues
  python3 daily.py publish 2026-11-26 [...]       # write crossword/puzzles/daily/*.json
  python3 daily.py publish all

Each day has three different puzzles: Small (7x7, easy clues), Medium
(11x11, medium clues) and Large (the themed 15x15, hard clues). No answer
is used in more than one of a day's puzzles.

`fill` writes the Large draft to _source/crossword/daily/<date>.txt and
`sizes` writes daily/small/<date>.txt and daily/medium/<date>.txt, using
only answers that already have clues. Drafts are committed, so a published grid never changes when the word list or clue bank
does. Delete a draft and run `fill` again to get a new grid for that date.

Every answer needs three clues (easy, medium, hard) in clues.tsv before
`publish` will write the puzzle. The filler prefers words that already have
clues, so the bank gets reused as it grows. A daily can name a topic from
topics.py (third item in its themes.py entry) to lean the fill toward it.
"""
import json
import random
import re
import sys
import time
from multiprocessing import Pool
from pathlib import Path

import grid
import lib
import topics
from themes import DAILY

DRAFTS = lib.HERE / "daily"
SIZE = 15
# Word quality by SCOWL level: common words first, obscure ones only to rescue a corner.
LEVEL_SCORE = {10: 60, 20: 55, 35: 40, 40: 20, 50: 0}
CLUED_BONUS = 8
# Answers of 5+ letters aren't reused within this many days.
REPEAT_DAYS = 7
# A daily that names a topic (topics.py) nudges the fill toward that topic's
# words: a higher base score, so they're tried earlier, plus a ranking bonus,
# and among the grids found, the one with the most topic words wins. (Most
# squares are forced by their crossings, so expect one to three extra topic
# words a grid; these settings didn't lower the fill rate in tests.)
TOPIC_SCORE_BONUS = 25
TOPIC_RANK_BONUS = 3.0
TOPIC_WANT = 4
# A day's three puzzles: grid size and clue level.
DAY_SIZES = {"small": (7, "e"), "medium": (11, "m"), "large": (SIZE, "h")}
EXTRAS = ("small", "medium")  # made by `sizes`; large is the themed `fill` grid
EXTRA_WANT = 6  # grids to compare for each; the one with the commonest words wins


def word_scores():
    words = grid.load_wordlist(50)
    clued = lib.load_clues()
    scores = {}
    for w, level in words.items():
        if len(w) <= 4 and level > 35:
            continue  # short obscure words are the worst kind of crosswordese
        scores[w] = LEVEL_SCORE[level] + (CLUED_BONUS if w in clued else 0)
    exact, prefixes = banned_words()
    for w in clued:
        # Clued answers outside the word list (phrases, names) still obey banned.txt.
        if w not in scores and 3 <= len(w) <= SIZE and w not in exact and not w.startswith(prefixes):
            scores[w] = LEVEL_SCORE[35] + CLUED_BONUS
    return scores, words


def banned_words():
    """banned.txt as (exact words, prefixes)."""
    exact, prefixes = set(), []
    for line in (lib.HERE / "banned.txt").read_text().splitlines():
        line = line.strip().upper()
        if line and not line.startswith("#"):
            (prefixes.append(line[:-1]) if line.endswith("*") else exact.add(line))
    return exact, tuple(prefixes)


_SCORES = None
_DIC0 = None


def _init():
    global _SCORES, _DIC0
    _SCORES, _ = word_scores()
    _DIC0 = grid.Dictionary(_SCORES, random.Random(0))


def _attempt(args):
    theme, seed, recent, topic_words = args
    scores = {w: v for w, v in _SCORES.items() if w not in recent} if recent else _SCORES
    bonus = None
    if topic_words:
        scores = dict(scores)
        for w in topic_words:
            if w in scores:
                scores[w] += TOPIC_SCORE_BONUS
        bonus = {w: TOPIC_RANK_BONUS for w in topic_words if w in scores}
    rng = random.Random(seed)
    g = grid.make_pattern(rng, n=SIZE, theme=theme, blocks=(36, 46), max_words=80, dic=_DIC0, tries=60)
    if g is None:
        return None
    for k in range(3):
        h = [row[:] for row in g]
        r2 = random.Random(seed * 1000 + k)
        if grid.fill(h, grid.Dictionary(scores, r2, bonus=bonus), r2, node_limit=1500):
            return grid.grid_text(h)
    return None


def stem(w):
    for end in ("IES", "ES", "IS", "S", "ED", "ING", "EST", "ER", "Y"):
        if w.endswith(end) and len(w) - len(end) >= 3:
            return w[: -len(end)]
    return w


def near_dupes(text):
    """Answers that are forms of one word (SPEEDS and SPEEDY, OASES and
    OASIS), which editors avoid putting in one grid."""
    g = grid.parse_grid(text)
    seen = {}
    out = []
    for *_, w in answers(g):
        if len(w) < 4:
            continue
        k = stem(w)
        if k in seen and seen[k] != w:
            out.append((seen[k], w))
        seen.setdefault(k, w)
    return out


def quality(text, levels):
    g = grid.parse_grid(text)
    ws = ["".join(g[r][c] for r, c in cells) for _, _, _, cells in grid.slots_of(g)]
    scored = [levels.get(w, 35) for w in ws if w in levels]
    return sum(scored) / max(1, len(scored))


def topic_hits(text, words):
    return len({w for *_, w in answers(grid.parse_grid(text))} & words) if words else 0


def theme_parts(entries):
    """Words inside the theme answers (MUSIC BOXES -> MUSIC, BOXES, BOX...),
    which shouldn't also turn up elsewhere in the same grid."""
    out = set()
    for e in entries:
        for part in e.upper().replace("-", " ").split():
            part = "".join(ch for ch in part if ch.isalpha())
            if len(part) >= 3:
                bases = {part}
                for end in ("ERS", "ER", "ING", "ES", "S", "ED"):
                    if part.endswith(end) and len(part) - len(end) >= 3:
                        bases.add(part[: -len(end)])
                        bases.add(part[: -len(end)] + "E")
                for b in bases:
                    out |= {b, b + "S", b + "ES", b + "ER", b + "ERS", b + "ED", b + "ING"}
    return frozenset(out)


def recent_words(date, days=REPEAT_DAYS, min_len=5):
    """Answers of min_len+ letters used in drafts within `days` of date
    (before or after, so a refilled day doesn't clash with its neighbours)."""
    import datetime
    d0 = datetime.date.fromisoformat(date)
    out = set()
    for k in [*range(-days, 0), *range(1, days + 1)]:
        day = str(d0 - datetime.timedelta(days=k))
        for path in [DRAFTS / f"{day}.txt"] + [DRAFTS / size / f"{day}.txt" for size in EXTRAS]:
            if path.exists():
                out.update(w for w in draft_words(path) if len(w) >= min_len)
    return frozenset(out)


def draft_words(path):
    """Answers in a draft file (any size)."""
    text = "\n".join(l for l in path.read_text().splitlines() if not l.startswith("# "))
    return [w for *_, w in answers(grid.parse_grid(text))]


def read_extra(size, date):
    path = DRAFTS / size / f"{date}.txt"
    if not path.exists():
        return None
    return grid.parse_grid("\n".join(l for l in path.read_text().splitlines() if not l.startswith("# ")))


def cmd_fill(dates, attempts=320, want=2):
    _, levels = word_scores()
    with Pool(initializer=_init) as pool:
        for date in dates:
            title, entries, *rest = DAILY[date]
            theme = [lib.clean(e) for e in entries]
            recent = recent_words(date) | theme_parts(entries)
            topic_words = frozenset(topics.bonus_words(rest[0]) - recent - set(theme)) if rest else frozenset()
            need = max(want, TOPIC_WANT) if topic_words else want
            seed0 = int(date.replace("-", "")) * 1000
            t0 = time.time()
            found = []
            for batch in range(0, attempts, 16):
                res = pool.map(_attempt, [(theme, seed0 + batch + i, recent, topic_words) for i in range(16)])
                found += [r for r in res if r]
                print(f"{date}: {batch + 16} tries, {len(found)} grids, {time.time() - t0:.0f}s", flush=True)
                if len(found) >= need:
                    break
            if not found:
                print(f"{date}: no grid found; try a different theme or more attempts")
                continue
            # Prefer grids without near-duplicate answers (OASES and OASIS).
            clean = [t for t in found if not near_dupes(t)] or found
            best = min(clean, key=lambda t: (-topic_hits(t, topic_words), quality(t, levels)))
            DRAFTS.mkdir(exist_ok=True)
            (DRAFTS / f"{date}.txt").write_text(
                f"# {title}\n# theme: {' | '.join(entries)}\n{best}\n")
            hits = topic_hits(best, topic_words)
            print(f"{date}: wrote draft (average word level {quality(best, levels):.1f}"
                  f"{f', {hits} topic words' if topic_words else ''})\n{best}\n")


def cmd_sizes(dates):
    """Small and Medium grids for each date, from answers that already have
    clues, with no answer shared with the day's other puzzles."""
    import run
    if dates == ["all"]:
        dates = sorted(p.stem for p in DRAFTS.glob("*.txt"))
    _, levels = word_scores()
    with Pool(initializer=run._init) as pool:
        for date in dates:
            if not (DRAFTS / f"{date}.txt").exists():
                print(f"{date}: no Large grid yet; run `daily.py fill {date}` first")
                continue
            title, entries, g = read_draft(date)
            used = {w for *_, w in answers(g)} | theme_parts(entries)
            spec = DAILY.get(date, ())
            topic = spec[2] if len(spec) > 2 else None
            bonus = {w: TOPIC_RANK_BONUS for w in topics.bonus_words(topic)} if topic else None
            for size in EXTRAS:
                path = DRAFTS / size / f"{date}.txt"
                if path.exists():
                    used |= set(draft_words(path))
                    continue
                n = DAY_SIZES[size][0]
                exclude = frozenset(used | recent_words(date))
                seed0 = (int(date.replace("-", "")) * 100 + n) * 10_000
                found, seen, t0 = [], set(), time.time()
                for batch in range(0, 960, 32):
                    res = pool.map(run._make, [(n, seed0 + batch + i, exclude, bonus) for i in range(32)])
                    for text in res:
                        if text and text not in seen and run.good(text):
                            seen.add(text)
                            found.append(text)
                    if len(found) >= EXTRA_WANT:
                        break
                if not found:
                    print(f"{date} {size}: no grid found")
                    continue
                best = min(found, key=lambda t: quality(t, levels))
                path.parent.mkdir(exist_ok=True)
                path.write_text(f"# {size} {n}x{n}\n{best}\n")
                used |= set(draft_words(path))
                print(f"{date} {size}: {len(found)} grids in {time.time() - t0:.0f}s, "
                      f"average word level {quality(best, levels):.1f}\n{best}\n", flush=True)


def read_draft(date):
    lines = (DRAFTS / f"{date}.txt").read_text().splitlines()
    title = lines[0][2:].strip()
    entries = [e.strip() for e in lines[1].split(":", 1)[1].split("|")]
    return title, entries, grid.parse_grid("\n".join(lines[2:]))


def answers(g):
    """(dir, r, c, word) in grid order."""
    return [(d, r, c, "".join(g[x][y] for x, y in cells)) for d, r, c, cells in grid.slots_of(g)]


def cmd_missing(dates):
    clues = lib.load_clues()
    need = {}
    for date in dates:
        _, _, g = read_draft(date)
        grids = [g] + [x for x in (read_extra(size, date) for size in EXTRAS) if x]
        for gg in grids:
            for _, _, _, w in answers(gg):
                if w not in clues:
                    need.setdefault(w, []).append(date)
    for w in sorted(need):
        print(w)
    print(f"# {len(need)} answers need clues", file=sys.stderr)


def encode(g, clues, lk, theme_display=None):
    """One grid as published: size, black squares and numbered entries with
    their clue at level lk. Returns (puzzle, answers missing a clue)."""
    theme_display = theme_display or {}
    n = len(g)
    nums = {}
    k = 0
    for r in range(n):
        for c in range(n):
            if g[r][c] == grid.BLOCK:
                continue
            starts_a = (c == 0 or g[r][c - 1] == grid.BLOCK) and c + 1 < n and g[r][c + 1] != grid.BLOCK
            starts_d = (r == 0 or g[r - 1][c] == grid.BLOCK) and r + 1 < n and g[r + 1][c] != grid.BLOCK
            if starts_a or starts_d:
                k += 1
                nums[(r, c)] = k
    entries, missing = [], []
    for d, r, c, w in answers(g):
        cl = clues.get(w)
        if not cl:
            missing.append(w)
            continue
        display = theme_display.get(w, cl["display"])
        entries.append({
            "n": nums[(r, c)], "d": d, "r": r, "c": c, "a": lib.rot13(w), "q": cl[lk],
            "len": lib.enumeration(display), **({"t": 1} if w in theme_display else {}),
        })
    entries.sort(key=lambda e: (e["d"], e["n"]))
    return {
        "width": n, "height": n,
        "blocks": ["".join("1" if ch == grid.BLOCK else "0" for ch in row) for row in g],
        "entries": entries,
    }, missing


def write_daily(path, data):
    """Like lib.write_json, one entry per line, for each size."""
    head = {k: v for k, v in data.items() if k != "sizes"}
    parts = []
    for size, sub in data["sizes"].items():
        meta = json.dumps({k: v for k, v in sub.items() if k != "entries"}, ensure_ascii=False)[:-1]
        body = ",\n".join(json.dumps(e, ensure_ascii=False) for e in sub["entries"])
        parts.append(f'"{size}": {meta}, "entries": [\n{body}\n]}}')
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(head, ensure_ascii=False)[:-1] + ',\n"sizes": {\n' + ",\n".join(parts) + "\n}}\n")


def cmd_publish(dates):
    clues = lib.load_clues()
    if dates == ["all"]:
        dates = sorted(p.stem for p in DRAFTS.glob("*.txt"))
    bad = False
    for date in dates:
        title, theme, g = read_draft(date)
        theme_display = {lib.clean(t): t for t in theme}
        grids = {"large": g}
        for size in EXTRAS:
            grids[size] = read_extra(size, date)
        if not all(grids.values()):
            print(f"{date}: no {' or '.join(s for s, x in grids.items() if not x)} grid; run `daily.py sizes {date}`")
            bad = True
            continue
        sizes, missing = {}, []
        for size in DAY_SIZES:
            sub, miss = encode(grids[size], clues, DAY_SIZES[size][1], theme_display if size == "large" else None)
            sizes[size] = sub
            missing += miss
        if missing:
            for w in missing:
                print(f"{date}: no clues for {w}")
            bad = True
            continue
        # rev 2: three different puzzles a day (before, one grid at three
        # clue levels). Saved progress is keyed by rev, so old saves aren't
        # applied to the new Small and Medium grids.
        write_daily(lib.SITE / "daily" / f"{date}.json", {
            "id": "daily-" + date, "kind": "daily", "date": date, "title": title, "rev": 2,
            "style": "grid", "levels": list(DAY_SIZES), "sizes": sizes,
        })
        print(f"{date}: published " + ", ".join(f"{s} {len(x['entries'])}" for s, x in sizes.items()))
    lib.write_index()
    if bad:
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) < 3 or sys.argv[1] not in ("fill", "sizes", "missing", "publish"):
        sys.exit(__doc__)
    cmd, dates = sys.argv[1], sys.argv[2:]
    for d in dates:
        if d != "all" and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", d):
            sys.exit(f"bad date {d}")
    {"fill": cmd_fill, "sizes": cmd_sizes, "missing": cmd_missing, "publish": cmd_publish}[cmd](dates)
