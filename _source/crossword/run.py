#!/usr/bin/env python3
"""Grid pools for Crossword Run, the roguelike mode (/crossword/run/).

  python3 run.py build [size ...]   # writes crossword/run/pool/<n>/<k>.json + manifest.json
  python3 run.py topics             # writes crossword/run/pool/topics.json

A run picks its puzzles from these pools by seed, so every grid is made
here ahead of time. Grids use only answers that already have clues in
clues.tsv, so a pool never needs new clues; the clue level (easy, medium,
hard) is chosen by the game as a run gets harder.

Every grid is symmetric, every letter is in an Across and a Down answer,
answers are 3+ letters, and a grid never repeats an answer or pairs a word
with its plural. Each grid lists the topics (topics.py) whose words it uses,
so an act themed on a topic can prefer them.

Pools are big and varied: once a word has been used much more than others
of its length, it's left out of later grids, so the vocabulary spreads over
the whole clue bank instead of SEA and ERA turning up everywhere. A pool is
split into files of CHUNK grids so the game only downloads what it plays.
(7x7 isn't used: with this vocabulary only one 7x7 shape ever fills.)
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
# size: (black squares min-max, longest answer, how many grids)
SIZES = {
    5: ((0, 4), 5, 800),
    6: ((4, 12), 6, 400),  # few 6-letter words have clues: more blocks
    7: ((6, 12), 7, 0),  # daily Small only (daily.py sizes)
    8: ((6, 14), 8, 1500),
    9: ((10, 20), 7, 1500),
    11: ((16, 30), 8, 500),
}
CHUNK = 100
POOL_VERSION = 2
# Words used more than average for their length are ranked lower, the more
# so the more they're used; past HARD_CAP times the average they rest.
HARD_CAP = 5
# A size stops early, keeping what it has, after STALL rounds in a row with
# no new grid (its distinct grids are running out) or MAX_MINUTES.
STALL = 40
MAX_MINUTES = 30

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
    bonus = rest[1] if len(rest) > 1 else None  # {word: +/- weight}
    blocks, max_len, _ = SIZES[n]
    rng = random.Random(seed)
    g = pattern(rng, n, blocks, max_len)
    if g is None:
        return None
    sc = {w: v for w, v in _SC.items() if w not in exclude} if exclude else _SC
    if bonus:
        # Favored words (a topic) move up the list; overused ones move down.
        sc = {w: v + (25 if bonus.get(w, 0) > 0 else 6 * bonus[w] if w in bonus else 0) for w, v in sc.items()}
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
    need = 1 if n <= 6 else 2
    tags = sorted(t for t, ws in topic_sets.items() if len(words & ws) >= need)
    return {
        "b": "".join("1" if ch == grid.BLOCK else "0" for row in g for ch in row),
        "e": entries,
        "t": tags,
    }


def spread(usage, vocab):
    """(words to leave out, {word: negative weight}) from use so far."""
    total = {}
    for w, c in usage.items():
        total[len(w)] = total.get(len(w), 0) + c
    out, weight = set(), {}
    for w, c in usage.items():
        mean = max(1.0, total[len(w)] / max(1, vocab.get(len(w), 1)))
        if c >= max(6, HARD_CAP * mean):
            out.add(w)
        elif c > mean:
            weight[w] = -min(4.0, c / mean)
    return frozenset(out), weight


def cmd_build(sizes=None):
    import collections
    import shutil
    clues = lib.load_clues()
    topic_sets = {t: topics.bonus_words(t) for t in topics.TOPICS}
    _init()
    vocab = collections.Counter(len(w) for w in _SC)
    OUT.mkdir(parents=True, exist_ok=True)
    manifest_path = OUT / "manifest.json"
    manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
    if manifest.get("v") != POOL_VERSION:
        manifest = {"v": POOL_VERSION, "chunk": CHUNK, "sizes": {}}
    with Pool(initializer=_init) as pool:
        for n, (_, _, want) in SIZES.items():
            if not want or (sizes and n not in sizes):
                continue
            seen, out, usage = set(), [], collections.Counter()
            seed = n * 10_000_000 + 1
            t0 = time.time()
            idle = 0
            while len(out) < want and idle < STALL and time.time() - t0 < MAX_MINUTES * 60:
                exclude, weight = spread(usage, vocab)
                res = pool.map(_make, [(n, seed + i, exclude, weight) for i in range(64)])
                seed += 64
                idle += 1
                for text in res:
                    if text and text not in seen and good(text):
                        ws = [w for *_, w in daily.answers(grid.parse_grid(text))]
                        if any(w in exclude for w in ws):
                            continue
                        seen.add(text)
                        idle = 0
                        usage.update(ws)
                        out.append(encode(text, clues, topic_sets))
                print(f"{n}x{n}: {len(out)}/{want}, {len(usage)} distinct answers, "
                      f"{len(exclude)} resting, {time.time() - t0:.0f}s", flush=True)
            out = out[:want]
            d = OUT / str(n)
            if d.exists():
                shutil.rmtree(d)
            d.mkdir()
            for k in range(0, len(out), CHUNK):
                (d / f"{k // CHUNK}.json").write_text(
                    json.dumps({"size": n, "grids": out[k:k + CHUNK]}, ensure_ascii=False, separators=(",", ":")) + "\n")
            old = OUT / f"{n}.json"
            if old.exists():
                old.unlink()
            manifest["sizes"][str(n)] = len(out)
            manifest_path.write_text(json.dumps(manifest) + "\n")
            top = usage.most_common(3)
            print(f"wrote {d}: {len(out)} grids in {len(out) // CHUNK + bool(len(out) % CHUNK)} files, "
                  f"{len(usage)} distinct answers, most used {top}", flush=True)


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
        cmd_build({int(x) for x in sys.argv[2:]} or None)
        cmd_topics()
