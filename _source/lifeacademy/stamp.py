#!/usr/bin/env python3
"""Cache-busting for /lifeacademy/: stamps each CSS/JS link in index.html with a hash of
that file, so phones and browsers fetch the new file as soon as it changes.
Run from the repo root before committing changes to lifeacademy/:  python3 _source/lifeacademy/stamp.py"""
import hashlib, pathlib, re

site = pathlib.Path(__file__).resolve().parents[2] / 'lifeacademy'
index = site / 'index.html'
html = index.read_text()
for name in ['lens.css', 'data.js', 'art.js', 'lens.js', 'replay.js']:
    v = hashlib.sha1((site / name).read_bytes()).hexdigest()[:8]
    html, n = re.subn(r'(["\'])' + re.escape(name) + r'(\?v=[0-9a-f]+)?\1', r'\g<1>' + name + '?v=' + v + r'\g<1>', html)
    assert n == 1, (name, n)
index.write_text(html)
print('stamped', index)
