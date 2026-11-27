#!/usr/bin/env python3
"""Special-event crosswords (newspaper style, any size).

  python3 event.py fill thanksgiving      # make the grid (can take a while)
  python3 event.py missing thanksgiving   # answers that still need clues
  python3 event.py publish thanksgiving   # write crossword/puzzles/<id>.json

Events are configured in themes.py (EVENTS). The grid follows the same rules
as the dailies; the filler gives a big bonus to the event's vocabulary list,
so as much of the fill as possible is on theme. Drafts live in events/.
Clues come from clues.tsv, like the dailies; `missing` shows the vocabulary
list's existing clue as a starting point.
"""
import importlib
import random
import sys
import time
from multiprocessing import Pool

import daily
import grid
import lib
from themes import EVENTS

DRAFTS = lib.HERE / "events"
VOCAB_BONUS = 45
SEED0 = int(__import__("os").environ.get("EVENT_SEED0", "9000"))

_SCORES = None
_DIC0 = None
_CFG = None
_BONUS = None
# How much an on-theme word is favored when the filler ranks candidates
# (each crossing's room counts about 1-4).
VOCAB_RANK_BONUS = 4.0


def vocab(cfg):
    """An event's preferred words: a topic from topics.py, or a module with WORDS."""
    if not cfg.get("vocab"):
        return {}
    import topics
    if cfg["vocab"] in topics.TOPICS:
        return {w: None for w in topics.bonus_words(cfg["vocab"])}
    mod = importlib.import_module(cfg["vocab"])
    return {lib.clean(a): c for a, c in mod.WORDS}


def scores_for(cfg):
    scores, _ = daily.word_scores()
    n = cfg["size"]
    for w in vocab(cfg):
        if 3 <= len(w) <= n and w not in {lib.clean(t) for t in cfg["theme"]}:
            scores[w] = max(scores.get(w, 0), daily.LEVEL_SCORE[20]) + VOCAB_BONUS
    return scores


def _init(cfg):
    global _SCORES, _DIC0, _CFG, _BONUS
    _CFG = cfg
    _SCORES = scores_for(cfg)
    _BONUS = {w: VOCAB_RANK_BONUS for w in vocab(cfg)}
    _DIC0 = grid.Dictionary(_SCORES, random.Random(0))


def _attempt(seed):
    n = _CFG["size"]
    theme = [lib.clean(t) for t in _CFG["theme"]]
    rng = random.Random(seed)
    big = n > 15
    g = grid.make_pattern(rng, n=n, theme=theme, max_len=9 if big else 8,
                          blocks=(62, 92) if big else (36, 46), max_words=150 if big else 80,
                          tries=40, dic=_DIC0)
    if g is None:
        return None
    for k in range(4):
        h = [row[:] for row in g]
        r2 = random.Random(seed * 1000 + k)
        if grid.fill(h, grid.Dictionary(_SCORES, r2, bonus=_BONUS), r2, node_limit=4000):
            return grid.grid_text(h)
    return None


def on_theme(text, words):
    g = grid.parse_grid(text)
    ws = [w for *_, w in daily.answers(g)]
    return sum(1 for w in ws if w in words)


def cmd_fill(eid, attempts=400, want=1):
    cfg = EVENTS[eid]
    words = vocab(cfg)
    t0 = time.time()
    found = []
    with Pool(initializer=_init, initargs=(cfg,)) as pool:
        for batch in range(0, attempts, 16):
            res = pool.map(_attempt, [SEED0 + batch + i for i in range(16)])
            found += [r for r in res if r]
            print(f"{eid}: {batch + 16} tries, {len(found)} grids, {time.time() - t0:.0f}s", flush=True)
            if len(found) >= want:
                break
    if not found:
        sys.exit(f"{eid}: no grid found")
    best = max(found, key=lambda t: on_theme(t, words))
    DRAFTS.mkdir(exist_ok=True)
    (DRAFTS / f"{eid}.txt").write_text(f"# {cfg['title']}\n# theme: {' | '.join(cfg['theme'])}\n{best}\n")
    print(f"{eid}: wrote draft, {on_theme(best, words)} answers from the event's word list\n{best}")


def read(eid):
    lines = (DRAFTS / f"{eid}.txt").read_text().splitlines()
    return grid.parse_grid("\n".join(lines[2:]))


def cmd_missing(eid):
    clues = lib.load_clues()
    words = vocab(EVENTS[eid])
    need = sorted({w for *_, w in daily.answers(read(eid)) if w not in clues})
    for w in need:
        print(w + (f"\t(list clue: {words[w]})" if words.get(w) else ""))
    print(f"# {len(need)} answers need clues", file=sys.stderr)


def cmd_publish(eid):
    cfg = EVENTS[eid]
    clues = lib.load_clues()
    g = read(eid)
    n = cfg["size"]
    theme_display = {lib.clean(t): t for t in cfg["theme"]}
    nums, k = {}, 0
    for r in range(n):
        for c in range(n):
            if g[r][c] == grid.BLOCK:
                continue
            a = (c == 0 or g[r][c - 1] == grid.BLOCK) and c + 1 < n and g[r][c + 1] != grid.BLOCK
            d = (r == 0 or g[r - 1][c] == grid.BLOCK) and r + 1 < n and g[r + 1][c] != grid.BLOCK
            if a or d:
                k += 1
                nums[(r, c)] = k
    entries, missing = [], []
    for d, r, c, w in daily.answers(g):
        cl = clues.get(w)
        if not cl:
            missing.append(w)
            continue
        entries.append({
            "n": nums[(r, c)], "d": d, "r": r, "c": c, "a": lib.rot13(w),
            "q": {"e": cl["e"], "m": cl["m"], "h": cl["h"]},
            "len": lib.enumeration(theme_display.get(w, cl["display"])),
            **({"t": 1} if w in theme_display else {}),
        })
    if missing:
        sys.exit(f"{eid}: no clues for {', '.join(missing)}")
    entries.sort(key=lambda e: (e["d"], e["n"]))
    lib.write_json(lib.SITE / f"{eid}.json", {
        "id": eid, "rev": cfg.get("rev", 1), "kind": "special", "title": cfg["title"], "blurb": cfg["blurb"],
        "date": cfg["date"], "style": "grid", "levels": list(lib.LEVELS), "width": n, "height": n,
        "blocks": ["".join("1" if ch == grid.BLOCK else "0" for ch in row) for row in g],
        "entries": entries,
    })
    lib.write_index()
    print(f"{eid}: published {len(entries)} answers")


if __name__ == "__main__":
    if len(sys.argv) != 3 or sys.argv[1] not in ("fill", "missing", "publish") or sys.argv[2] not in EVENTS:
        sys.exit(__doc__)
    {"fill": cmd_fill, "missing": cmd_missing, "publish": cmd_publish}[sys.argv[1]](sys.argv[2])
