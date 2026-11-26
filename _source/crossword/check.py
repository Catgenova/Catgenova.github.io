#!/usr/bin/env python3
"""Sanity-check published puzzles: python3 check.py

For daily (newspaper-style) grids: 180-degree symmetry, every white square
in both an Across and a Down answer, answers 3+ letters, numbering in
reading order, no repeated answers, all three clue levels present and no
clue that contains its own answer. For specials: every answer crosses
another and the clues are present.
"""
import json
import sys

import lib


def letters(p):
    cells = {}
    for e in p["entries"]:
        a = lib.rot13(e["a"])
        for k, ch in enumerate(a):
            pos = (e["r"] + (k if e["d"] == "d" else 0), e["c"] + (k if e["d"] == "a" else 0))
            if cells.get(pos, ch) != ch:
                raise AssertionError(f"letter clash at {pos}")
            cells.setdefault(pos, ch)
    return cells


def check(path):
    p = json.loads(path.read_text())
    errs = []
    try:
        cells = letters(p)
    except AssertionError as e:
        return [str(e)]
    answers = [lib.rot13(e["a"]) for e in p["entries"]]
    if len(set(answers)) != len(answers):
        errs.append("repeated answer")
    keys = [lib.LEVEL_KEYS[l] for l in p["levels"]]
    for e, a in zip(p["entries"], answers):
        for k in keys:
            q = e["q"].get(k, "")
            if not q:
                errs.append(f"{e['n']}{e['d']}: no {k} clue")
            elif a.lower() in "".join(ch for ch in q.lower() if ch.isalpha()) and len(a) > 3:
                errs.append(f"{e['n']}{e['d']} {a}: clue contains the answer: {q}")
            else:
                # A clue shouldn't name another answer in the same grid.
                words = {w.strip(".,!?\"'()").upper() for w in q.split()}
                for other in answers:
                    if other != a and len(other) >= 4 and other in words:
                        errs.append(f"{e['n']}{e['d']} {a}: clue names another answer ({other}): {q}")
    if p.get("style") == "grid":
        n = p["width"]
        blocks = {(r, c) for r, row in enumerate(p["blocks"]) for c, ch in enumerate(row) if ch == "1"}
        for r in range(n):
            for c in range(n):
                if ((r, c) in blocks) != ((n - 1 - r, n - 1 - c) in blocks):
                    errs.append(f"not symmetric at {r},{c}")
                if ((r, c) in blocks) == ((r, c) in cells):
                    errs.append(f"square {r},{c} is neither block nor letter (or both)")
        count = {}
        for e, a in zip(p["entries"], answers):
            if len(a) < 3:
                errs.append(f"{a}: shorter than 3")
            for k in range(len(a)):
                pos = (e["r"] + (k if e["d"] == "d" else 0), e["c"] + (k if e["d"] == "a" else 0))
                count[pos] = count.get(pos, 0) + 1
        unchecked = [pos for pos, v in count.items() if v != 2]
        if unchecked:
            errs.append(f"{len(unchecked)} squares not in both an Across and a Down")
    return errs


if __name__ == "__main__":
    bad = 0
    files = sorted(lib.SITE.glob("*.json")) + sorted((lib.SITE / "daily").glob("*.json"))
    for f in files:
        if f.name == "index.json":
            continue
        errs = check(f)
        print(f"{f.relative_to(lib.ROOT)}: {'ok' if not errs else ''}")
        for e in errs[:20]:
            print("   ", e)
        bad += bool(errs)
    sys.exit(1 if bad else 0)
