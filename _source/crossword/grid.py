"""Newspaper-style grids: a symmetric black-square pattern, then a fill.

Rules every grid follows (the usual American crossword conventions):
  - 180-degree rotational symmetry of the black squares;
  - every answer is at least 3 letters, so every white square is part of
    both an Across and a Down answer;
  - all white squares are connected;
  - no answer appears twice.
"""
import math
import random
from pathlib import Path

HERE = Path(__file__).resolve().parent
BLOCK = "#"
EMPTY = "."


# ---- Word list --------------------------------------------------------------

def load_wordlist(max_level=50):
    """WORD -> SCOWL level (10 = most common), minus banned words."""
    banned_exact, banned_prefix = set(), []
    for line in (HERE / "banned.txt").read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if line.endswith("*"):
            banned_prefix.append(line[:-1])
        else:
            banned_exact.add(line)
    words = {}
    for line in (HERE / "wordlist.txt").read_text().splitlines():
        if not line or line.startswith("#"):
            continue
        w, level = line.split("\t")
        level = int(level)
        if level > max_level or w in banned_exact or any(w.startswith(p) for p in banned_prefix):
            continue
        words[w] = level
    return words


class Dictionary:
    """Words grouped by length, with bitsets for fast pattern matching.

    Words are ranked once per fill (best first, with some randomness), so
    the lowest set bit of a candidate mask is always the best candidate.
    """

    def __init__(self, scores, rng, noise=12.0, bonus=None):
        self.score = scores
        # Extra weight when ranking candidates, e.g. an event's theme words.
        self.bonus = bonus or {}
        self.by_len = {}
        for w, s in scores.items():
            self.by_len.setdefault(len(w), []).append((s + rng.random() * noise, w))
        self.words = {}
        self.index = {}
        self.masks = {}
        self.full = {}
        for n, items in self.by_len.items():
            items.sort(reverse=True)
            ws = [w for _, w in items]
            self.words[n] = ws
            self.index[n] = {w: i for i, w in enumerate(ws)}
            m = {}
            for i, w in enumerate(ws):
                bit = 1 << i
                for p, ch in enumerate(w):
                    m[(p, ch)] = m.get((p, ch), 0) | bit
            self.masks[n] = m
            self.full[n] = (1 << len(ws)) - 1

    def match(self, pattern):
        n = len(pattern)
        if n not in self.masks:
            return 0
        m = self.full[n]
        masks = self.masks[n]
        for p, ch in enumerate(pattern):
            if ch != EMPTY:
                m &= masks.get((p, ch), 0)
                if not m:
                    return 0
        return m

    def iter_match(self, mask, n):
        ws = self.words[n]
        while mask:
            low = mask & -mask
            yield ws[low.bit_length() - 1]
            mask ^= low


# ---- Patterns ---------------------------------------------------------------

def slots_of(g):
    """All answers in grid g: (dir, r, c, length) with cells."""
    n = len(g)
    out = []
    for r in range(n):
        c = 0
        while c < n:
            if g[r][c] == BLOCK:
                c += 1
                continue
            s = c
            while c < n and g[r][c] != BLOCK:
                c += 1
            out.append(("a", r, s, [(r, k) for k in range(s, c)]))
    for c in range(n):
        r = 0
        while r < n:
            if g[r][c] == BLOCK:
                r += 1
                continue
            s = r
            while r < n and g[r][c] != BLOCK:
                r += 1
            out.append(("d", s, c, [(k, c) for k in range(s, r)]))
    return out


def connected(g):
    n = len(g)
    whites = [(r, c) for r in range(n) for c in range(n) if g[r][c] != BLOCK]
    if not whites:
        return False
    seen = {whites[0]}
    stack = [whites[0]]
    while stack:
        r, c = stack.pop()
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            q = (r + dr, c + dc)
            if 0 <= q[0] < n and 0 <= q[1] < n and q not in seen and g[q[0]][q[1]] != BLOCK:
                seen.add(q)
                stack.append(q)
    return len(seen) == len(whites)


def short_ok(g):
    return all(len(cells) >= 3 for _, _, _, cells in slots_of(g))


def open_areas(g, a=3, b=6):
    """White rectangles a x b or b x a (no black square inside). Big open
    areas mean stacked long answers, which are the hardest to fill."""
    n = len(g)
    out = []
    for h, w in ((a, b), (b, a)):
        for r in range(n - h + 1):
            for c in range(n - w + 1):
                if all(g[r + i][c + j] != BLOCK for i in range(h) for j in range(w)):
                    out.append([(r + i, c + j) for i in range(h) for j in range(w)])
    return out


def place_theme(n, entries, rows=None):
    """Put theme answers in symmetric rows. entries: list of answers, as
    (pair, pair) or (pair, pair, center). Returns grid with letters and the
    blocks that end each entry, or None if they don't fit."""
    g = [[EMPTY] * n for _ in range(n)]
    mid = n // 2

    def put(r, c, word):
        for k, ch in enumerate(word):
            if g[r][c + k] not in (EMPTY, ch):
                return False
            g[r][c + k] = ch
        for cc in (c - 1, c + len(word)):
            if 0 <= cc < n:
                if g[r][cc] not in (EMPTY, BLOCK):
                    return False
                g[r][cc] = BLOCK
                g[n - 1 - r][n - 1 - cc] = BLOCK
        return True

    if len(entries) not in (2, 3, 4, 5):
        return None
    a, b = entries[0], entries[1]
    if len(a) != len(b):
        return None
    if rows is None:
        rows = [3, n - 4] if len(entries) != 4 else [2, n - 3]
    # First of the pair starts at the left edge (one in for a 13 in a 15
    # grid, so no 1-square gap is left); its partner is the mirror image.
    def start_for(length):
        gap = n - length
        return 0 if gap in (0, 1) or gap >= 4 else 1 if gap == 2 else None

    start = start_for(len(a))
    if start is None:
        return None
    if not put(rows[0], start, a) or not put(rows[1], n - start - len(b), b):
        return None
    if len(entries) == 5:
        # Second pair: right-aligned on the upper row, mirrored below.
        c, d = entries[2], entries[3]
        s2 = start_for(len(c))
        if len(c) != len(d) or s2 is None or len(rows) < 4:
            return None
        if not put(rows[2], n - s2 - len(c), c) or not put(rows[3], s2, d):
            return None
    if len(entries) in (3, 5):
        c = entries[-1]
        half = (n - len(c)) // 2
        if half not in (0,) and half < 4:
            return None
        if len(c) % 2 != n % 2:
            return None
        if not put(mid, (n - len(c)) // 2, c):
            return None
    if len(entries) == 4:
        c, d = entries[2], entries[3]
        if len(c) != len(d) or not put(mid - 2 if n > 11 else mid - 1, n - len(c), c) \
                or not put(n - 1 - (mid - 2 if n > 11 else mid - 1), 0, d):
            return None
    for r in range(n):
        for cc in range(n):
            if g[r][cc] == BLOCK and g[n - 1 - r][n - 1 - cc] != BLOCK:
                if g[n - 1 - r][n - 1 - cc] != EMPTY:
                    return None
                g[n - 1 - r][n - 1 - cc] = BLOCK
    return g


def make_pattern(rng, n=15, theme=None, max_len=8, blocks=(36, 42), max_words=78, tries=400, dic=None):
    """Random symmetric pattern. Theme entries (if any) keep their slots."""
    for _ in range(tries):
        if theme and len(theme) == 5:
            r0 = rng.choice((2, 3))
            r1 = rng.choice((6, 7)) if n >= 19 else r0 + 3
            g = place_theme(n, theme, [r0, n - 1 - r0, r1, n - 1 - r1])
        elif theme:
            r0 = rng.choice((2, 3, 4)) if len(theme) != 4 else 2
            g = place_theme(n, theme, [r0, n - 1 - r0])
        else:
            g = [[EMPTY] * n for _ in range(n)]
        if g is None:
            continue
        # Black out any 1- or 2-square stub the theme rows leave behind.
        while True:
            stubs = [cells for _, _, _, cells in slots_of(g) if len(cells) < 3]
            if not stubs:
                break
            if any(g[r][c] != EMPTY for cells in stubs for r, c in cells):
                g = None
                break
            for cells in stubs:
                for r, c in cells:
                    g[r][c] = g[n - 1 - r][n - 1 - c] = BLOCK
        if g is None or not connected(g):
            continue
        theme_slots = set()
        if theme:
            for d, r, c, cells in slots_of(g):
                if all(g[x][y] not in (EMPTY, BLOCK) for x, y in cells):
                    theme_slots.add((d, r, c, len(cells)))
        # A centre block is common and helps symmetry; skip if a theme word is there.
        failed = False
        guard = 0
        while True:
            guard += 1
            if guard > 400 * (n * n) // 225:
                failed = True
                break
            count = sum(row.count(BLOCK) for row in g)
            long_runs = [s for s in slots_of(g)
                         if len(s[3]) > max_len and (s[0], s[1], s[2], len(s[3])) not in theme_slots]
            if not long_runs and count >= blocks[0] and not open_areas(g):
                break
            areas = [] if long_runs else open_areas(g)
            if long_runs:
                d, r, c, cells = rng.choice(long_runs)
                choices = [cells[k] for k in range(3, len(cells) - 3)]
            elif areas:
                choices = [cell for cell in rng.choice(areas) if g[cell[0]][cell[1]] == EMPTY]
            else:
                choices = [(r, c) for r in range(n) for c in range(n) if g[r][c] == EMPTY]
            rng.shuffle(choices)
            placed = False
            for (r, c) in choices[:20]:
                rr, cc = n - 1 - r, n - 1 - c
                if g[r][c] != EMPTY or g[rr][cc] != EMPTY:
                    continue
                g[r][c] = g[rr][cc] = BLOCK
                if short_ok(g) and connected(g):
                    placed = True
                    break
                g[r][c] = g[rr][cc] = EMPTY
            if not placed and not long_runs and not areas:
                # Can't add more blocks anywhere useful; accept what we have.
                break
        if failed:
            continue
        count = sum(row.count(BLOCK) for row in g)
        nslots = len(slots_of(g))
        if blocks[0] <= count <= blocks[1] and nslots <= max_words and short_ok(g) and connected(g) \
                and not open_areas(g):
            # Every answer that crosses a theme letter must have some word that fits.
            if dic is not None and any(
                    dic.match(p).bit_count() < 3
                    for p in ("".join(g[r][c] for r, c in cells) for _, _, _, cells in slots_of(g))
                    if EMPTY in p and p.strip(EMPTY)):
                continue
            if dic is not None and theme and not fill([row[:] for row in g], dic, rng, check_only=True):
                continue
            return g
    return None


# ---- Fill -------------------------------------------------------------------

def fill(g, dic, rng, node_limit=3000, beam=6, look=120, rank_weight=0.02, check_only=False):
    """Fill the EMPTY squares of g in place. Returns True on success.

    Each unfilled answer keeps the set of dictionary words that still fit
    (a bitset). Choosing a word narrows the letters allowed in its squares,
    which narrows the crossing answers, and so on until nothing changes
    (arc consistency). A dead end shows up as an answer with no words left,
    and the search backs up. Answers are chosen fewest-options-first; words
    are tried best-first, with a little randomness.
    """
    all_slots = [cells for _, _, _, cells in slots_of(g)]
    fixed_words = set()
    var = []  # indices into all_slots that still need words
    for i, cells in enumerate(all_slots):
        p = "".join(g[r][c] for r, c in cells)
        if EMPTY in p:
            var.append(i)
        else:
            fixed_words.add(p)
    slots = [all_slots[i] for i in var]
    lens = [len(c) for c in slots]
    pos_of = {}
    for i, cells in enumerate(slots):
        for p, cell in enumerate(cells):
            pos_of.setdefault(cell, []).append((i, p))
    # links[i] = [(p, j, q)]: square p of slot i is square q of slot j
    links = [[] for _ in slots]
    for cell, items in pos_of.items():
        if len(items) == 2:
            (i, p), (j, q) = items
            links[i].append((p, j, q))
            links[j].append((q, i, p))
    masks = []
    for i, cells in enumerate(slots):
        m = dic.match("".join(g[r][c] for r, c in cells))
        # A word already fixed in the grid (a theme answer) can't repeat.
        for w in fixed_words:
            if len(w) == lens[i] and w in dic.index.get(lens[i], {}):
                m &= ~(1 << dic.index[lens[i]][w])
        masks.append(m)
    letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

    def allowed(i, p, m):
        mk = dic.masks[lens[i]]
        out = 0
        for k, ch in enumerate(letters):
            x = mk.get((p, ch))
            if x and (m & x):
                out |= 1 << k
        return out

    def restrict(j, q, letterset, m):
        mk = dic.masks[lens[j]]
        allow = 0
        k = 0
        while letterset:
            if letterset & 1:
                x = mk.get((q, letters[k]))
                if x:
                    allow |= x
            letterset >>= 1
            k += 1
        return m & allow

    def propagate(ms, queue):
        queue = set(queue)
        while queue:
            i = queue.pop()
            mi = ms[i]
            for p, j, q in links[i]:
                nm = restrict(j, q, allowed(i, p, mi), ms[j])
                if nm != ms[j]:
                    if not nm:
                        return False
                    ms[j] = nm
                    queue.add(j)
            if mi.bit_count() == 1:
                # All different: nobody else of this length may use it.
                for j in range(len(slots)):
                    if j != i and lens[j] == lens[i] and ms[j] & mi:
                        nm = ms[j] & ~mi
                        if not nm:
                            return False
                        ms[j] = nm
                        queue.add(j)
        return True

    nodes = [0]

    def search(ms):
        nodes[0] += 1
        if nodes[0] > node_limit:
            return None
        best = None
        for i, m in enumerate(ms):
            c = m.bit_count()
            if c > 1 and (best is None or (c, -lens[i]) < best[0]):
                best = ((c, -lens[i]), i)
        if best is None:
            return ms
        i = best[1]
        n_i = lens[i]
        mk_i = dic.masks[n_i]
        # Rank candidate words by the room they leave each crossing answer.
        ranked = []
        m = ms[i]
        k = 0
        while m and k < look:
            low = m & -m
            m ^= low
            k += 1
            w = dic.words[n_i][low.bit_length() - 1]
            room = 0.0
            ok = True
            for p, j, q in links[i]:
                x = dic.masks[lens[j]].get((q, w[p]))
                c = (ms[j] & x).bit_count() if x else 0
                if not c:
                    ok = False
                    break
                room += math.log(c + 1)
            if ok:
                ranked.append((room - k * rank_weight + dic.bonus.get(w, 0.0) + rng.random() * 0.3, low))
        ranked.sort(reverse=True)
        for _, low in ranked[:beam]:
            child = list(ms)
            child[i] = low
            if propagate(child, [i]):
                out = search(child)
                if out is not None:
                    return out
            if nodes[0] > node_limit:
                return None
        return None

    ms = list(masks)
    if any(not m for m in ms) or not propagate(ms, range(len(slots))):
        return False
    if check_only:
        return True
    out = search(ms)
    if out is None:
        return False
    for i, m in enumerate(out):
        w = dic.words[lens[i]][m.bit_length() - 1]
        for (r, c), ch in zip(slots[i], w):
            g[r][c] = ch
    return True


def grid_text(g):
    return "\n".join("".join(row) for row in g)


def parse_grid(text):
    return [list(line) for line in text.strip().splitlines()]
