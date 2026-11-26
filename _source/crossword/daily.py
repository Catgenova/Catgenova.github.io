#!/usr/bin/env python3
"""Daily 15x15 newspaper-style crosswords.

  python3 daily.py fill 2026-11-26 [more dates]   # make the grid (slow-ish)
  python3 daily.py missing 2026-11-26 [...]       # answers that still need clues
  python3 daily.py publish 2026-11-26 [...]       # write crossword/puzzles/daily/*.json
  python3 daily.py publish all

`fill` writes a draft grid to _source/crossword/daily/<date>.txt. Drafts are
committed, so a published grid never changes when the word list or clue bank
does. Delete a draft and run `fill` again to get a new grid for that date.

Every answer needs three clues (easy, medium, hard) in clues.tsv before
`publish` will write the puzzle. The filler prefers words that already have
clues, so the bank gets reused as it grows.
"""
import random
import re
import sys
import time
from multiprocessing import Pool
from pathlib import Path

import grid
import lib
from themes import DAILY

DRAFTS = lib.HERE / "daily"
SIZE = 15
# Word quality by SCOWL level: common words first, obscure ones only to rescue a corner.
LEVEL_SCORE = {10: 60, 20: 55, 35: 40, 40: 20, 50: 0}
CLUED_BONUS = 8
# Answers of 5+ letters aren't reused within this many days.
REPEAT_DAYS = 7


def word_scores():
    words = grid.load_wordlist(50)
    clued = lib.load_clues()
    scores = {}
    for w, level in words.items():
        if len(w) <= 4 and level > 35:
            continue  # short obscure words are the worst kind of crosswordese
        scores[w] = LEVEL_SCORE[level] + (CLUED_BONUS if w in clued else 0)
    for w in clued:
        if w not in scores and 3 <= len(w) <= SIZE:
            scores[w] = LEVEL_SCORE[35] + CLUED_BONUS
    return scores, words


_SCORES = None
_DIC0 = None


def _init():
    global _SCORES, _DIC0
    _SCORES, _ = word_scores()
    _DIC0 = grid.Dictionary(_SCORES, random.Random(0))


def _attempt(args):
    theme, seed, recent = args
    scores = {w: v for w, v in _SCORES.items() if w not in recent} if recent else _SCORES
    rng = random.Random(seed)
    g = grid.make_pattern(rng, n=SIZE, theme=theme, blocks=(36, 46), max_words=80, dic=_DIC0, tries=60)
    if g is None:
        return None
    for k in range(3):
        h = [row[:] for row in g]
        r2 = random.Random(seed * 1000 + k)
        if grid.fill(h, grid.Dictionary(scores, r2), r2, node_limit=1500):
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
        path = DRAFTS / f"{d0 - datetime.timedelta(days=k)}.txt"
        if path.exists():
            _, _, g = read_draft(path.stem)
            out.update(w for *_, w in answers(g) if len(w) >= min_len)
    return frozenset(out)


def cmd_fill(dates, attempts=320, want=2):
    _, levels = word_scores()
    with Pool(initializer=_init) as pool:
        for date in dates:
            title, entries = DAILY[date]
            theme = [lib.clean(e) for e in entries]
            recent = recent_words(date) | theme_parts(entries)
            seed0 = int(date.replace("-", "")) * 1000
            t0 = time.time()
            found = []
            for batch in range(0, attempts, 16):
                res = pool.map(_attempt, [(theme, seed0 + batch + i, recent) for i in range(16)])
                found += [r for r in res if r]
                print(f"{date}: {batch + 16} tries, {len(found)} grids, {time.time() - t0:.0f}s", flush=True)
                if len(found) >= want:
                    break
            if not found:
                print(f"{date}: no grid found; try a different theme or more attempts")
                continue
            # Prefer grids without near-duplicate answers (OASES and OASIS).
            clean = [t for t in found if not near_dupes(t)] or found
            best = min(clean, key=lambda t: quality(t, levels))
            DRAFTS.mkdir(exist_ok=True)
            (DRAFTS / f"{date}.txt").write_text(
                f"# {title}\n# theme: {' | '.join(entries)}\n{best}\n")
            print(f"{date}: wrote draft (average word level {quality(best, levels):.1f})\n{best}\n")


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
        for _, _, _, w in answers(g):
            if w not in clues:
                need.setdefault(w, []).append(date)
    for w in sorted(need):
        print(w)
    print(f"# {len(need)} answers need clues", file=sys.stderr)


def cmd_publish(dates):
    clues = lib.load_clues()
    if dates == ["all"]:
        dates = sorted(p.stem for p in DRAFTS.glob("*.txt"))
    bad = False
    for date in dates:
        title, theme, g = read_draft(date)
        theme_display = {lib.clean(t): t for t in theme}
        # Number squares in reading order.
        nums = {}
        n = 0
        for r in range(SIZE):
            for c in range(SIZE):
                if g[r][c] == grid.BLOCK:
                    continue
                starts_a = (c == 0 or g[r][c - 1] == grid.BLOCK) and c + 1 < SIZE and g[r][c + 1] != grid.BLOCK
                starts_d = (r == 0 or g[r - 1][c] == grid.BLOCK) and r + 1 < SIZE and g[r + 1][c] != grid.BLOCK
                if starts_a or starts_d:
                    n += 1
                    nums[(r, c)] = n
        entries = []
        missing = False
        for d, r, c, w in answers(g):
            cl = clues.get(w)
            if not cl:
                print(f"{date}: no clues for {w}")
                missing = bad = True
                continue
            display = theme_display.get(w, cl["display"])
            entries.append({
                "n": nums[(r, c)], "d": d, "r": r, "c": c, "a": lib.rot13(w),
                "q": {"e": cl["e"], "m": cl["m"], "h": cl["h"]},
                "len": lib.enumeration(display),
                **({"t": 1} if w in theme_display else {}),
            })
        if missing:
            continue
        entries.sort(key=lambda e: (e["d"], e["n"]))
        lib.write_json(lib.SITE / "daily" / f"{date}.json", {
            "id": "daily-" + date, "kind": "daily", "date": date, "title": title,
            "style": "grid", "levels": list(lib.LEVELS), "width": SIZE, "height": SIZE,
            "blocks": ["".join("1" if ch == grid.BLOCK else "0" for ch in row) for row in g],
            "entries": entries,
        })
        print(f"{date}: published {len(entries)} answers")
    lib.write_index()
    if bad:
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) < 3 or sys.argv[1] not in ("fill", "missing", "publish"):
        sys.exit(__doc__)
    cmd, dates = sys.argv[1], sys.argv[2:]
    for d in dates:
        if d != "all" and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", d):
            sys.exit(f"bad date {d}")
    {"fill": cmd_fill, "missing": cmd_missing, "publish": cmd_publish}[cmd](dates)
