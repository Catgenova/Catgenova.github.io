#!/usr/bin/env python3
"""Replace words in an event draft: python3 event_repair.py thanksgiving WORD [WORD ...]

Like repair.py, for events/: clears the words and everything crossing them
(theme answers stay) and refills that patch. Ban the words first.
"""
import random
import sys

import daily
import event
import grid
from themes import EVENTS


def main():
    eid, bad = sys.argv[1], {w.upper() for w in sys.argv[2:]}
    cfg = EVENTS[eid]
    path = event.DRAFTS / f"{eid}.txt"
    lines = path.read_text().splitlines()
    g = grid.parse_grid("\n".join(lines[2:]))
    theme = {"".join(ch for ch in t if ch.isalpha()) for t in cfg["theme"]}
    slots = grid.slots_of(g)
    word = lambda cells: "".join(g[x][y] for x, y in cells)
    keep = {c for *_, cells in slots if word(cells) in theme for c in cells}
    badcells = {c for *_, cells in slots if word(cells) in bad for c in cells}
    if not badcells:
        sys.exit("none of those words are in the grid")
    clear = set(badcells)
    for *_, cells in slots:
        if set(cells) & badcells and word(cells) not in theme:
            clear.update(cells)
    for x, y in clear - keep:
        g[x][y] = grid.EMPTY
    scores = event.scores_for(cfg)
    for seed in range(150):
        h = [row[:] for row in g]
        rng = random.Random(seed)
        if grid.fill(h, grid.Dictionary(scores, rng), rng, node_limit=3000):
            ws = [w for *_, w in daily.answers(h)]
            assert len(ws) == len(set(ws))
            path.write_text("\n".join(lines[:2]) + "\n" + grid.grid_text(h) + "\n")
            print(grid.grid_text(h))
            return
    sys.exit("couldn't refill that patch")


if __name__ == "__main__":
    main()
