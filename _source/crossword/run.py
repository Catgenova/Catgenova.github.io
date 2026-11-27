#!/usr/bin/env python3
"""Grid pools for Crossword Run, the roguelike mode (/crossword/run/).

  python3 run.py build [count per size]   # writes crossword/run/pool/<n>.json
  python3 run.py topics                   # writes crossword/run/pool/topics.json

A run picks its puzzles from these pools by seed, so every grid is made
here ahead of time. Grids use only answers that already have clues in
clues.tsv, so a pool never needs new clues; the clue level (easy, medium,
hard) is chosen by the game as a run gets harder.

Every grid is symmetric, every letter is in an Across and a Down answer,
answers are 3+ letters, and a grid never repeats an answer or pairs a word
with its plural. Each grid lists the topics (topics.py) whose words it uses,
so an act themed on a topic can prefer them.
"""
import json
import random
import sys
import time
from multiprocessing import Pool

import daily
import grid
import lib
import topics

OUT = lib.ROOT / "crossword" / "run" / "pool"
# size: (black squares min-max, longest answer, how many grids by default)
SIZES = {5: ((0, 4), 5, 400), 7: ((6, 12), 7, 300), 9: ((10, 20), 7, 200), 11: ((16, 30), 8, 80)}

_DIC = None
_SC = None


def banned():
    exact, prefixes = set(), []
    for line in (lib.HERE / "banned.txt").read_text().splitlines():
        line = line.strip().upper()
        if not line or line.startswith("#"):
            continue
        (prefixes.append(line[:-1]) if line.endswith("*") else exact.add(line))
    return exact, tuple(prefixes)


def _init():
    global _SC
    clued = lib.load_clues()
    scores, _ = daily.word_scores()
    exact, prefixes = banned()
    _SC = {w: v for w, v in scores.items()
           if w in clued and w not in exact and not w.startswith(prefixes)}


def checked(g):
    """Every white square is in an Across and a Down answer of 3+ letters."""
    n = len(g)
    count = {}
    for _, _, _, cells in grid.slots_of(g):
        if len(cells) < 3:
            return False
        for cell in cells:
            count[cell] = count.get(cell, 0) + 1
    whites = [(r, c) for r in range(n) for c in range(n) if g[r][c] != grid.BLOCK]
    return all(count.get(cell) == 2 for cell in whites)


def pattern(rng, n, blocks, max_len, tries=200):
    """Random symmetric pattern for a small grid."""
    for _ in range(tries):
        g = [[grid.EMPTY] * n for _ in range(n)]
        target = rng.randint(*blocks)
        stuck = 0
        while stuck < 60:
            count = sum(row.count(grid.BLOCK) for row in g)
            long_run = any(len(cells) > max_len for *_, cells in grid.slots_of(g))
            if count >= target and not long_run:
                break
            r, c = rng.randrange(n), rng.randrange(n)
            rr, cc = n - 1 - r, n - 1 - c
            if g[r][c] == grid.BLOCK:
                stuck += 1
                continue
            g[r][c] = g[rr][cc] = grid.BLOCK
            if grid.short_ok(g) and grid.connected(g) and checked(g):
                stuck = 0
            else:
                g[r][c] = g[rr][cc] = grid.EMPTY
                stuck += 1
        if (checked(g) and grid.connected(g)
                and not any(len(cells) > max_len for *_, cells in grid.slots_of(g))
                and blocks[0] <= sum(row.count(grid.BLOCK) for row in g) <= blocks[1]):
            return g
    return None


def _make(args):
    """One grid of size n, or None. Optional: answers to leave out, and a
    {word: bonus} the filler should lean toward (a topic's words)."""
    n, seed, *rest = args
    exclude = rest[0] if rest else frozenset()
    bonus = rest[1] if len(rest) > 1 else None
    blocks, max_len, _ = SIZES[n]
    rng = random.Random(seed)
    g = pattern(rng, n, blocks, max_len)
    if g is None:
        return None
    sc = {w: v for w, v in _SC.items() if w not in exclude} if exclude else _SC
    if bonus:
        sc = {w: v + (25 if w in bonus else 0) for w, v in sc.items()}
    for k in range(3):
        h = [row[:] for row in g]
        r2 = random.Random(seed * 10 + k)
        if grid.fill(h, grid.Dictionary(sc, r2, noise=20.0, bonus=bonus), r2, node_limit=1500):
            return grid.grid_text(h)
    return None


def good(text):
    g = grid.parse_grid(text)
    ws = [w for *_, w in daily.answers(g)]
    if len(ws) != len(set(ws)):
        return False
    if any(w + "S" in ws or w + "ES" in ws for w in ws):
        return False
    return not daily.near_dupes(text)


def encode(text, clues, topic_sets):
    g = grid.parse_grid(text)
    n = len(g)
    entries = []
    words = set()
    for d, r, c, w in daily.answers(g):
        cl = clues[w]
        words.add(w)
        e = [d, r, c, lib.rot13(w), cl["e"], cl["m"], cl["h"]]
        if " " in cl["display"] or "-" in cl["display"]:
            e.append(lib.enumeration(cl["display"]))
        entries.append(e)
    tags = sorted(t for t, ws in topic_sets.items() if words & ws)
    return {
        "b": "".join("1" if ch == grid.BLOCK else "0" for row in g for ch in row),
        "e": entries,
        "t": tags,
    }


def cmd_build(count=None):
    clues = lib.load_clues()
    topic_sets = {t: topics.bonus_words(t) for t in topics.TOPICS}
    OUT.mkdir(parents=True, exist_ok=True)
    with Pool(initializer=_init) as pool:
        for n, (_, _, default) in SIZES.items():
            want = count or default
            seen, out = set(), []
            seed = n * 1_000_000
            t0 = time.time()
            while len(out) < want:
                res = pool.map(_make, [(n, seed + i) for i in range(64)])
                seed += 64
                for text in res:
                    if text and text not in seen and good(text):
                        seen.add(text)
                        out.append(encode(text, clues, topic_sets))
                print(f"{n}x{n}: {len(out)}/{want}, {time.time() - t0:.0f}s", flush=True)
            out = out[:want]
            path = OUT / f"{n}.json"
            path.write_text(json.dumps({"size": n, "grids": out}, ensure_ascii=False, separators=(",", ":")) + "\n")
            print(f"wrote {path} ({path.stat().st_size // 1024} KB)")


def cmd_topics():
    """Act themes: each topic's title and its one-word answers (5-8 letters)
    with clues, used for an act's name, grid choice and word events."""
    clues = lib.load_clues()
    out = {}
    for slug, (title, entries) in topics.TOPICS.items():
        words = []
        for e in entries:
            w = lib.clean(e)
            if " " not in e and 5 <= len(w) <= 8 and w in clues:
                words.append([lib.rot13(w), clues[w]["e"], clues[w]["m"]])
        if len(words) >= 6:
            out[slug] = {"title": title, "words": words}
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / "topics.json"
    path.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")) + "\n")
    print(f"wrote {path}: {len(out)} topics")


if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] not in ("build", "topics"):
        sys.exit(__doc__)
    if sys.argv[1] == "topics":
        cmd_topics()
    else:
        cmd_build(int(sys.argv[2]) if len(sys.argv) > 2 else None)
        cmd_topics()
