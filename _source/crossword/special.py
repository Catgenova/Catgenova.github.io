#!/usr/bin/env python3
"""Build a special (event) criss-cross crossword from a themed word list.

Usage: python3 special.py thanksgiving [attempts]

Reads WORDS, TITLE, SLUG, BLURB and DATE from <name>.py next to this file,
tries many random layouts, keeps the most compact one that places every
word, and writes crossword/puzzles/<slug>.json for the site. Daily puzzles
are newspaper-style grids instead; see daily.py.

Rules every layout follows, so each run of two or more letters in the grid
is exactly one answer:
  - a new word must cross at least one placed word;
  - it may only touch other letters where it crosses them;
  - the cells just before and after it stay empty.
"""
import importlib
import json
import random
import re
import sys
import time
from pathlib import Path

import lib

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
ACROSS, DOWN = (0, 1), (1, 0)


def clean(answer):
    return re.sub(r"[^A-Z]", "", answer.upper())


def enumeration(answer):
    parts = []
    for word in answer.split():
        parts.append("-".join(str(len(clean(p))) for p in word.split("-")))
    return "(" + ",".join(parts) + ")"


class Layout:
    def __init__(self):
        self.cells = {}  # (r, c) -> letter
        self.dirs = {}   # (r, c) -> set of directions through the cell
        self.by_letter = {}
        self.placed = []  # (word_index, r, c, d)
        self.box = None

    def fits(self, word, r, c, d):
        dr, dc = d
        if (r - dr, c - dc) in self.cells:
            return -1
        n = len(word)
        if (r + n * dr, c + n * dc) in self.cells:
            return -1
        crossings = 0
        for i, ch in enumerate(word):
            pos = (r + i * dr, c + i * dc)
            got = self.cells.get(pos)
            if got is not None:
                if got != ch or d in self.dirs[pos]:
                    return -1
                crossings += 1
            else:
                if (pos[0] + dc, pos[1] + dr) in self.cells or (pos[0] - dc, pos[1] - dr) in self.cells:
                    return -1
        return crossings

    def put(self, idx, word, r, c, d):
        dr, dc = d
        for i, ch in enumerate(word):
            pos = (r + i * dr, c + i * dc)
            if pos not in self.cells:
                self.cells[pos] = ch
                self.dirs[pos] = set()
                self.by_letter.setdefault(ch, []).append(pos)
            self.dirs[pos].add(d)
        self.placed.append((idx, r, c, d))
        end = (r + (len(word) - 1) * dr, c + (len(word) - 1) * dc)
        if self.box is None:
            self.box = [r, c, end[0], end[1]]
        else:
            b = self.box
            self.box = [min(b[0], r), min(b[1], c), max(b[2], end[0]), max(b[3], end[1])]

    def grown_box(self, word, r, c, d):
        end = (r + (len(word) - 1) * d[0], c + (len(word) - 1) * d[1])
        b = self.box
        return min(b[0], r), min(b[1], c), max(b[2], end[0]), max(b[3], end[1])


def attempt(words, rng, max_w, max_h, wx=40, wg=0.0, wa=0.0, wr=8, shuffle=1):
    order = list(range(len(words)))
    # Long words first, shuffled a little so attempts differ.
    order.sort(key=lambda i: -len(words[i]) + rng.random() * shuffle)
    lay = Layout()
    first = order.pop(0)
    lay.put(first, words[first], 0, 0, ACROSS if rng.random() < 0.5 else DOWN)
    pending = order
    while pending:
        progress = False
        left = []
        for idx in pending:
            word = words[idx]
            best = None
            for i, ch in enumerate(word):
                for (pr, pc) in lay.by_letter.get(ch, ()):
                    for d in (ACROSS, DOWN):
                        if d in lay.dirs[(pr, pc)]:
                            continue
                        r, c = pr - i * d[0], pc - i * d[1]
                        x = lay.fits(word, r, c, d)
                        if x < 1:
                            continue
                        b = lay.grown_box(word, r, c, d)
                        h, w = b[2] - b[0] + 1, b[3] - b[1] + 1
                        if h > max_h or w > max_w:
                            continue
                        old = lay.box
                        grow = h * w - (old[2] - old[0] + 1) * (old[3] - old[1] + 1)
                        score = x * wx - grow * wg - abs(h - w) * wa + rng.random() * wr
                        if best is None or score > best[0]:
                            best = (score, r, c, d)
            if best:
                lay.put(idx, word, best[1], best[2], best[3])
                progress = True
            else:
                left.append(idx)
        pending = left
        if not progress:
            break
    return lay, pending


def verify(lay, words):
    """Every maximal run of 2+ letters must be exactly one placed answer."""
    runs = set()
    for (r, c) in lay.cells:
        for d in (ACROSS, DOWN):
            if (r - d[0], c - d[1]) in lay.cells:
                continue
            s, n = "", 0
            while (r + n * d[0], c + n * d[1]) in lay.cells:
                s += lay.cells[(r + n * d[0], c + n * d[1])]
                n += 1
            if n > 1:
                runs.add((r, c, d, s))
    placed = {(r, c, d, words[i]) for i, r, c, d in lay.placed}
    assert runs == placed, (len(runs), len(placed), runs ^ placed)


def rot13(s):
    return "".join(chr((ord(ch) - 65 + 13) % 26 + 65) for ch in s)


def main():
    name = sys.argv[1] if len(sys.argv) > 1 else "thanksgiving"
    attempts = int(sys.argv[2]) if len(sys.argv) > 2 else 400
    seed = int(sys.argv[3]) if len(sys.argv) > 3 else 2026
    sys.path.insert(0, str(HERE))
    src = importlib.import_module(name)
    words = [clean(a) for a, _ in src.WORDS]
    assert len(set(words)) == len(words), "duplicate answers"

    rng = random.Random(seed)
    best = None
    t0 = time.time()
    size = 55
    for n in range(attempts):
        lay, missing = attempt(words, rng, size, size)
        if missing:
            continue
        b = lay.box
        h, w = b[2] - b[0] + 1, b[3] - b[1] + 1
        crossings = sum(1 for v in lay.dirs.values() if len(v) == 2)
        key = (h * w, -crossings)
        if best is None or key < best[0]:
            best = (key, lay, h, w, crossings)
            print(f"#{n}: {w}x{h}, {len(lay.cells)} cells, {crossings} crossings", flush=True)
            size = max(h, w)  # later attempts must be at least this compact
    if best is None:
        sys.exit("no layout placed every word; try more attempts")
    _, lay, h, w, crossings = best
    verify(lay, words)
    print(f"best: {w}x{h} in {time.time() - t0:.0f}s")

    # Normalise to (0, 0) and number the grid in reading order.
    r0, c0 = lay.box[0], lay.box[1]
    starts = {}
    for idx, r, c, d in lay.placed:
        starts.setdefault((r - r0, c - c0), []).append((idx, d))
    entries = []
    for num, (pos, items) in enumerate(sorted(starts.items()), start=1):
        for idx, d in items:
            answer, clue = src.WORDS[idx]
            entries.append({
                "n": num,
                "d": "a" if d == ACROSS else "d",
                "r": pos[0],
                "c": pos[1],
                "a": rot13(words[idx]),
                "q": {"m": clue},
                "len": enumeration(answer),
            })
    entries.sort(key=lambda e: (e["d"], e["n"]))
    lib.write_json(lib.SITE / f"{src.SLUG}.json", {
        "id": src.SLUG, "kind": "special", "title": src.TITLE, "blurb": src.BLURB, "date": src.DATE,
        "style": "crisscross", "levels": ["medium"], "width": w, "height": h, "entries": entries,
    })
    lib.write_index()
    print(f"wrote crossword/puzzles/{src.SLUG}.json: {len(entries)} entries, {crossings} crossings")


if __name__ == "__main__":
    main()
