"""Helpers shared by the crossword builders."""
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
SITE = ROOT / "crossword" / "puzzles"
LEVELS = ("easy", "medium", "hard")
LEVEL_KEYS = {"easy": "e", "medium": "m", "hard": "h"}


def clean(answer):
    return re.sub(r"[^A-Z]", "", answer.upper())


def enumeration(answer):
    """'POP-UP TIMER' -> '(3-2,5)'."""
    parts = []
    for word in answer.split():
        parts.append("-".join(str(len(clean(p))) for p in word.split("-")))
    return "(" + ",".join(parts) + ")"


def rot13(s):
    return "".join(chr((ord(ch) - 65 + 13) % 26 + 65) for ch in s)


def load_clues():
    """clues.tsv: ANSWER, easy, medium, hard (tab separated). The answer may
    be written with spaces ('SNOW ANGELS') to give its enumeration."""
    out = {}
    path = HERE / "clues.tsv"
    if not path.exists():
        return out
    for n, line in enumerate(path.read_text().splitlines(), 1):
        if not line.strip() or line.startswith("#"):
            continue
        parts = line.split("\t")
        if len(parts) != 4 or not all(p.strip() for p in parts):
            raise SystemExit(f"clues.tsv line {n}: need ANSWER<TAB>easy<TAB>medium<TAB>hard")
        display, e, m, h = (p.strip() for p in parts)
        key = clean(display)
        if key in out:
            raise SystemExit(f"clues.tsv line {n}: {key} is listed twice")
        out[key] = {"display": display, "e": e, "m": m, "h": h}
    return out


def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps({k: v for k, v in data.items() if k != "entries"}, ensure_ascii=False)[:-1]
    text += ',\n"entries": [\n' + ",\n".join(json.dumps(e, ensure_ascii=False) for e in data["entries"]) + "\n]}\n"
    path.write_text(text)


def write_index():
    """crossword/puzzles/index.json: every published puzzle, for the hub page."""
    specials, daily = [], []
    for p in sorted(SITE.glob("*.json")):
        if p.name == "index.json":
            continue
        d = json.loads(p.read_text())
        specials.append({k: d[k] for k in ("id", "rev", "title", "blurb", "date", "levels", "style") if k in d}
                        | {"count": len(d["entries"])})
    for p in sorted((SITE / "daily").glob("*.json")):
        d = json.loads(p.read_text())
        daily.append({"date": d["date"], "title": d["title"], "count": len(d["entries"]), "levels": d["levels"]})
    (SITE / "index.json").write_text(json.dumps({"specials": specials, "daily": daily}, indent=1) + "\n")
