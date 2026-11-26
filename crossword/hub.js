// Crossword hub: today's daily, specials and the archive, with this
// browser's progress for each puzzle and difficulty.
(() => {
  'use strict';

  const LEVEL_NAMES = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
  const $ = (s) => document.querySelector(s);
  const store = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };

  function today() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function longDate(iso, opts) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(undefined, opts || { weekday: 'long', month: 'long', day: 'numeric' });
  }
  function fmt(ms) {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const ss = String(s % 60).padStart(2, '0');
    return h ? h + ':' + String(m).padStart(2, '0') + ':' + ss : m + ':' + ss;
  }
  // Progress for one puzzle at one level: { kind: 'done'|'started'|'new', text }
  function status(id, level, rev) {
    const s = store('pere-crossword:' + id + (rev > 1 ? '@' + rev : '') + ':' + level);
    if (!s) return { kind: 'new', text: 'Not started' };
    if (s.solved) return { kind: 'done', text: '✓ ' + fmt(s.time || 0) + (s.helped ? ' (helped)' : '') };
    const pct = s.pct != null ? s.pct : Math.round(((s.fill || '').replace(/\./g, '').length / Math.max(1, (s.fill || '').length)) * 100);
    return pct ? { kind: 'started', text: pct + '% done' } : { kind: 'new', text: 'Not started' };
  }
  const play = (q) => 'play/?' + new URLSearchParams(q).toString();

  async function main() {
    const index = await (await fetch('puzzles/index.json', { cache: 'no-cache' })).json();
    const now = today();
    const dailies = index.daily.filter((d) => d.date <= now).sort((a, b) => (a.date < b.date ? 1 : -1));

    // Today (or the latest one out).
    const cur = dailies[0];
    if (cur) {
      $('#today-eyebrow').textContent = cur.date === now ? 'Today’s puzzle' : 'Latest puzzle';
      $('#today-title').textContent = cur.title;
      $('#today-sub').textContent = longDate(cur.date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) + ' · ' + cur.count + ' clues';
      const box = $('#today-levels');
      for (const l of cur.levels) {
        const st = status('daily-' + cur.date, l);
        const a = document.createElement('a');
        a.className = 'play-level ' + st.kind;
        a.href = play({ d: cur.date, level: l });
        const b = document.createElement('b');
        b.textContent = LEVEL_NAMES[l];
        const s = document.createElement('small');
        s.textContent = st.text;
        a.append(b, s);
        box.append(a);
      }
      // Small picture of the grid's black squares.
      try {
        const P = await (await fetch('puzzles/daily/' + cur.date + '.json', { cache: 'no-cache' })).json();
        const pv = $('#preview');
        pv.style.setProperty('--n', P.width);
        for (const row of P.blocks) for (const ch of row) {
          const i = document.createElement('i');
          if (ch === '1') i.className = 'b';
          pv.append(i);
        }
      } catch (e) { $('#preview').hidden = true; }
    } else {
      $('#today-title').textContent = 'The first daily puzzle is on its way.';
      $('#preview').hidden = true;
    }

    // Specials.
    if (index.specials.length) {
      $('#specials-section').hidden = false;
      for (const sp of index.specials.filter((x) => !x.date || x.date <= now)) {
        const a = document.createElement('a');
        a.className = 'special';
        a.href = play({ p: sp.id });
        const h = document.createElement('h3');
        h.textContent = sp.title;
        const p = document.createElement('p');
        p.textContent = sp.blurb || sp.count + ' clues';
        const st = status(sp.id, sp.levels.includes('medium') ? 'medium' : sp.levels[0], sp.rev);
        const s = document.createElement('span');
        s.className = 'status-line';
        s.textContent = st.kind === 'new' ? sp.count + ' clues' : st.text;
        a.append(h, p, s);
        $('#specials').append(a);
      }
    }

    // Archive: every past daily except the one featured above.
    const past = dailies.slice(1);
    if (past.length) {
      $('#archive-section').hidden = false;
      for (const d of past) {
        const li = document.createElement('li');
        const day = document.createElement('div');
        day.className = 'day';
        const b = document.createElement('b');
        b.textContent = longDate(d.date, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        const t = document.createElement('span');
        t.textContent = d.title;
        day.append(b, t);
        const chips = document.createElement('div');
        chips.className = 'chips';
        for (const l of d.levels) {
          const st = status('daily-' + d.date, l);
          const a = document.createElement('a');
          a.className = 'chip ' + st.kind;
          a.href = play({ d: d.date, level: l });
          a.textContent = (st.kind === 'done' ? '✓ ' : '') + LEVEL_NAMES[l];
          a.title = LEVEL_NAMES[l] + ': ' + st.text;
          chips.append(a);
        }
        li.append(day, chips);
        $('#archive').append(li);
      }
    }
  }

  main().catch(() => { $('#today-title').textContent = 'Puzzles couldn’t be loaded. Try reloading the page.'; });
})();
