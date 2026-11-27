#!/usr/bin/env python3
"""Replace words in a daily draft: python3 repair.py 2026-11-28 WORD [WORD ...]

Clears the given answers and every answer crossing them (theme answers stay),
then refills that patch from the word list. The given words can't come back
in this refill; add them to banned.txt too if they should never be used.
"""
import random
import sys

import daily
import grid


def pairs(ws):
    return {(w, w + e) for w in ws for e in ("S", "ES") if w + e in ws}


def main():
    date, bad = sys.argv[1], set(w.upper() for w in sys.argv[2:])
    title, entries, g = daily.read_draft(date)
    theme = {"".join(ch for ch in e if ch.isalpha()) for e in entries}
    slots = grid.slots_of(g)
    word = lambda cells: "".join(g[x][y] for x, y in cells)
    keep = set()
    for *_, cells in slots:
        if word(cells) in theme:
            keep.update(cells)
    badcells = set()
    for *_, cells in slots:
        if word(cells) in bad:
            badcells.update(cells)
    if not badcells:
        sys.exit("none of those words are in the grid")
    clear = set(badcells)
    for *_, cells in slots:
        if set(cells) & badcells and word(cells) not in theme:
            clear.update(cells)
    for x, y in clear - keep:
        g[x][y] = grid.EMPTY
    before = pairs([w for *_, w in daily.answers(g)])
    scores, _ = daily.word_scores()
    # Don't put the removed words straight back.
    scores = {w: v for w, v in scores.items() if w not in bad}
    for seed in range(200):
        h = [row[:] for row in g]
        rng = random.Random(seed)
        if grid.fill(h, grid.Dictionary(scores, rng), rng, node_limit=3000):
            ws = [w for *_, w in daily.answers(h)]
            # No repeats, and no new word-and-plural pair (ERA and ERAS);
            # pairs already elsewhere in the grid aren't this repair's doing.
            if len(ws) != len(set(ws)) or pairs(ws) - before:
                continue
            (daily.DRAFTS / f"{date}.txt").write_text(
                f"# {title}\n# theme: {' | '.join(entries)}\n{grid.grid_text(h)}\n")
            print(grid.grid_text(h))
            return
    sys.exit("couldn't refill that patch; delete the draft and run fill again")


if __name__ == "__main__":
    main()
