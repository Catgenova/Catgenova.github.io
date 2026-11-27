// Crossword hub: today's daily (three puzzles: Small, Medium, Large),
// specials and the archive, with this browser's progress for each.
(() => {
  'use strict';

  const LEVEL_NAMES = { easy: 'Easy', medium: 'Medium', hard: 'Hard', small: 'Small', large: 'Large' };
  const CLUES = { small: 'easy', medium: 'medium', large: 'hard, themed' };
  // One button per puzzle (a day's Small, Medium and Large) or per level.
  function levelButton(d, l) {
    const st = status('daily-' + d.date, l, d.rev);
    const a = document.createElement('a');
    a.className = 'play-level ' + st.kind;
    a.href = play({ d: d.date, level: l });
    const b = document.createElement('b');
    b.textContent = LEVEL_NAMES[l];
    const s = document.createElement('small');
    s.textContent = st.kind === 'new' && d.sizes ? d.sizes[l] + '\u00d7' + d.sizes[l] + ' · ' + CLUES[l] : st.text;
    a.append(b, s);
    return a;
  }
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
      $('#today-sub').textContent = longDate(cur.date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) +
        (cur.sizes ? ' · three puzzles, pick a size' : ' · ' + cur.count + ' clues');
      const box = $('#today-levels');
      for (const l of cur.levels) box.append(levelButton(cur, l));
      // Small picture of the grid's black squares.
      try {
        const day = await (await fetch('puzzles/daily/' + cur.date + '.json', { cache: 'no-cache' })).json();
        const P = day.sizes ? day.sizes.large : day;
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

    // Archive: a month calendar of every daily that's out. Picking a day
    // shows its theme and a button per difficulty.
    const byDate = new Map(dailies.map((d) => [d.date, d]));
    if (dailies.length) {
      $('#archive-section').hidden = false;
      const ym = (iso) => iso.slice(0, 7);
      const first = ym(dailies[dailies.length - 1].date);
      const last = ym(dailies[0].date);
      let view = last;
      let selected = dailies[0].date;

      const shift = (m, k) => {
        const [y, mo] = m.split('-').map(Number);
        const d = new Date(y, mo - 1 + k, 1);
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      };

      const renderDetail = () => {
        const box = $('#cal-detail');
        box.textContent = '';
        const d = byDate.get(selected);
        if (!d) return;
        const h = document.createElement('h3');
        h.textContent = d.title;
        const p = document.createElement('p');
        p.className = 'muted';
        p.textContent = longDate(d.date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        const chips = document.createElement('div');
        chips.className = 'play-levels';
        for (const l of d.levels) chips.append(levelButton(d, l));
        box.append(h, p, chips);
      };

      const renderCal = () => {
        const [y, mo] = view.split('-').map(Number);
        $('#cal-month').textContent = new Date(y, mo - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
        $('#cal-prev').disabled = view <= first;
        $('#cal-next').disabled = view >= last;
        const grid = $('#cal-grid');
        grid.textContent = '';
        for (let i = 0; i < 7; i++) {
          const w = document.createElement('span');
          w.className = 'cal-wd';
          w.textContent = new Date(2026, 1, 1 + i).toLocaleDateString(undefined, { weekday: 'narrow' }); // Feb 1 2026 is a Sunday
          w.setAttribute('aria-hidden', 'true');
          grid.append(w);
        }
        const startDay = new Date(y, mo - 1, 1).getDay();
        const days = new Date(y, mo, 0).getDate();
        for (let i = 0; i < startDay; i++) grid.append(document.createElement('span'));
        for (let dnum = 1; dnum <= days; dnum++) {
          const iso = view + '-' + String(dnum).padStart(2, '0');
          const d = byDate.get(iso);
          let cell;
          if (d) {
            cell = document.createElement('button');
            cell.type = 'button';
            cell.className = 'cal-day has' + (iso === selected ? ' sel' : '') + (iso === now ? ' is-today' : '');
            const states = d.levels.map((l) => status('daily-' + iso, l, d.rev).kind);
            cell.setAttribute('aria-label', longDate(iso, { weekday: 'long', month: 'long', day: 'numeric' }) + ': ' + d.title +
              (states.includes('done') ? ', solved' : states.includes('started') ? ', started' : ''));
            cell.setAttribute('aria-pressed', String(iso === selected));
            const n = document.createElement('span');
            n.textContent = dnum;
            const dots = document.createElement('span');
            dots.className = 'dots';
            for (const k of states) {
              const i = document.createElement('i');
              i.className = 'dot ' + k;
              dots.append(i);
            }
            cell.append(n, dots);
            cell.addEventListener('click', () => { selected = iso; renderCal(); renderDetail(); });
          } else {
            cell = document.createElement('span');
            cell.className = 'cal-day' + (iso === now ? ' is-today' : '');
            cell.textContent = dnum;
          }
          grid.append(cell);
        }
      };
      $('#cal-prev').addEventListener('click', () => { view = shift(view, -1); renderCal(); });
      $('#cal-next').addEventListener('click', () => { view = shift(view, 1); renderCal(); });
      renderCal();
      renderDetail();
    }
  }

  main().catch(() => { $('#today-title').textContent = 'Puzzles couldn’t be loaded. Try reloading the page.'; });
})();

// Crossword Run card: show a run in progress or the player's record.
(() => {
  const el = document.getElementById('run-status');
  if (!el) return;
  try {
    const run = JSON.parse(localStorage.getItem('pere-crossword-run:v1'));
    const st = JSON.parse(localStorage.getItem('pere-crossword-run:stats'));
    if (run && !run.over) el.textContent = `Run in progress: Act ${run.act + 1} of 3`;
    else if (st && st.runs) el.textContent = `${st.runs} run${st.runs === 1 ? '' : 's'} · ${st.wins} won`;
  } catch (e) { /* storage unavailable */ }
})();
