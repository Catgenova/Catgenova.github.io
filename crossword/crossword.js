// Pere Games crossword player.
//
// /crossword/play/?d=2026-11-27&level=hard   a daily puzzle (default: today's)
// /crossword/play/?p=thanksgiving            a special puzzle
//
// Puzzles are JSON files in /crossword/puzzles/ (built by _source/crossword).
// Two styles: "grid" (newspaper style: black squares, every letter checked)
// and "crisscross" (free-form, words cross where they can).
(() => {
  'use strict';

  const BASE = new URL('./', document.currentScript.src).href; // /crossword/
  const ZOOMS = [14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 37, 40, 44, 48];
  const LEVEL_NAMES = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
  const LEVEL_KEYS = { easy: 'e', medium: 'm', hard: 'h' };
  const SENTINEL = '​';
  const PREFS = 'pere-crossword:prefs';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const $ = (s) => document.querySelector(s);
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode etc. */ } },
  };
  const rot13 = (s) => s.replace(/[A-Z]/g, (c) => String.fromCharCode(((c.charCodeAt(0) - 52) % 26) + 65));

  function today() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function longDate(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }

  function notice(msg) {
    document.body.classList.remove('loading');
    document.body.classList.add('has-notice');
    $('#notice-text').textContent = msg;
    $('#notice').hidden = false;
  }

  async function getJSON(path) {
    const res = await fetch(BASE + path, { cache: 'no-cache' });
    if (!res.ok) throw new Error(path + ': ' + res.status);
    return res.json();
  }

  async function load() {
    const params = new URLSearchParams(location.search);
    let path;
    if (params.get('p')) {
      if (!/^[a-z0-9-]+$/.test(params.get('p'))) return notice('That puzzle doesn’t exist.');
      path = 'puzzles/' + params.get('p') + '.json';
    } else {
      let date = params.get('d');
      const now = today();
      if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return notice('That puzzle doesn’t exist.');
      if (date && date > now) return notice('That puzzle isn’t out yet. Come back on ' + longDate(date) + '.');
      if (!date) {
        const index = await getJSON('puzzles/index.json');
        const past = index.daily.map((x) => x.date).filter((x) => x <= now).sort();
        if (!past.length) return notice('The first daily puzzle isn’t out yet.');
        date = past[past.length - 1];
      }
      path = 'puzzles/daily/' + date + '.json';
    }
    let P;
    try {
      P = await getJSON(path);
    } catch (e) {
      return notice('That puzzle couldn’t be found.');
    }
    const prefs = store.get(PREFS) || {};
    let level = params.get('level');
    if (!P.levels.includes(level)) level = P.levels.includes(prefs.level) ? prefs.level : (P.levels.includes('medium') ? 'medium' : P.levels[0]);
    start(P, level);
  }

  function start(P, level) {
    const W = P.width;
    const H = P.height;
    const lk = LEVEL_KEYS[level];
    // A puzzle that gets a new grid bumps its rev, so old progress isn't reused.
    const KEY = 'pere-crossword:' + P.id + (P.rev > 1 ? '@' + P.rev : '') + ':' + level;
    const isGrid = P.style === 'grid';
    const hard = level === 'hard';
    const daily = P.kind === 'daily';

    const gridEl = $('#grid');
    const viewport = $('#viewport');
    const input = $('#entry');
    const clockEl = $('#clock');
    const timerBtn = $('#timer');
    const progressEl = $('#progress');
    const pausedEl = $('#paused');
    const toastEl = $('#toast');
    const doneDlg = $('#done');
    const autocheckBox = $('#autocheck');

    // ---- Header -----------------------------------------------------------
    $('#title').textContent = daily ? 'Daily Crossword' : P.title;
    document.title = (daily ? 'Daily Crossword, ' + longDate(P.date) : P.title) + ' · Pere Games';
    const meta = $('#meta');
    const bits = daily ? [longDate(P.date), P.title] : [P.width + '\u00d7' + P.height, P.entries.length + ' clues'];
    for (const b of bits) { const s = document.createElement('span'); s.textContent = b; meta.append(s); }
    if (P.levels.length > 1) {
      const box = $('#levels');
      box.hidden = false;
      for (const l of P.levels) {
        const a = document.createElement('a');
        a.className = 'level' + (l === level ? ' on' : '');
        a.textContent = LEVEL_NAMES[l];
        const u = new URL(location.href);
        u.searchParams.set('level', l);
        if (daily && !u.searchParams.get('d')) u.searchParams.set('d', P.date);
        a.href = u.pathname + u.search;
        if (l === level) a.setAttribute('aria-current', 'true');
        a.addEventListener('click', () => { const p = store.get(PREFS) || {}; p.level = l; store.set(PREFS, p); });
        box.append(a);
      }
    }
    if (daily) {
      // Previous / next day, among puzzles that are out.
      getJSON('puzzles/index.json').then((index) => {
        const days = index.daily.map((x) => x.date).filter((x) => x <= today()).sort();
        const i = days.indexOf(P.date);
        const link = (el, date) => {
          if (!date) { el.classList.add('off'); el.removeAttribute('href'); el.setAttribute('aria-disabled', 'true'); return; }
          const u = new URL(location.href);
          u.searchParams.set('d', date);
          u.searchParams.set('level', level);
          el.href = u.pathname + u.search;
          el.title = longDate(date);
        };
        link($('#day-prev'), i > 0 ? days[i - 1] : null);
        link($('#day-next'), i >= 0 && i < days.length - 1 ? days[i + 1] : null);
        $('#daynav').hidden = false;
      }).catch(() => {});
    }
    if (hard) {
      autocheckBox.disabled = true;
      $('#autocheck-label').textContent = 'Autocheck (not on Hard)';
    }
    document.body.classList.toggle('level-hard', hard);
    gridEl.classList.toggle('style-grid', isGrid);

    // ---- Model ------------------------------------------------------------
    const cells = new Map(); // r * W + c -> cell
    const entries = P.entries.map((e) => {
      const ans = rot13(e.a);
      const dr = e.d === 'd' ? 1 : 0;
      const dc = e.d === 'a' ? 1 : 0;
      const ent = { n: e.n, dir: e.d, clue: e.q[lk] || e.q.m, enumr: e.len, ans, cells: [] };
      for (let k = 0; k < ans.length; k++) {
        const r = e.r + dr * k;
        const c = e.c + dc * k;
        const id = r * W + c;
        let cell = cells.get(id);
        if (!cell) {
          cell = { id, r, c, ans: ans[k], val: '', a: null, d: null, num: 0, wrong: false, revealed: false, locked: false };
          cells.set(id, cell);
        }
        cell[e.d] = ent;
        ent.cells.push(cell);
      }
      ent.cells[0].num = e.n;
      return ent;
    });
    const across = entries.filter((e) => e.dir === 'a').sort((x, y) => x.n - y.n);
    const down = entries.filter((e) => e.dir === 'd').sort((x, y) => x.n - y.n);
    const ordered = across.concat(down);
    ordered.forEach((e, k) => { e.k = k; });
    const cellList = [...cells.values()].sort((x, y) => x.id - y.id);
    const label = (ent) => ent.n + (ent.dir === 'a' ? ' Across' : ' Down');
    const full = (ent) => ent.cells.every((c) => c.val);
    const showEnum = !hard;

    // ---- State ------------------------------------------------------------
    let cur = { cell: null, dir: 'a' };
    let elapsed = 0;
    let tickFrom = 0;
    let paused = false;
    let solved = false;
    let helped = 0;   // squares revealed
    let checks = 0;   // check actions used
    let wrongNoticeShown = false;
    let zoom = 8;
    let fitSize = 0;
    let autocheck = false;

    // ---- Render -----------------------------------------------------------
    gridEl.style.setProperty('--cols', W);
    gridEl.style.setProperty('--rows', H);
    const frag = document.createDocumentFragment();
    if (isGrid) {
      for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
          if (cells.has(r * W + c)) continue;
          const b = document.createElement('div');
          b.className = 'cell block';
          b.style.gridRow = r + 1;
          b.style.gridColumn = c + 1;
          frag.append(b);
        }
      }
    }
    for (const cell of cellList) {
      const el = document.createElement('div');
      el.className = 'cell';
      el.style.gridRow = cell.r + 1;
      el.style.gridColumn = cell.c + 1;
      el.style.setProperty('--wave', cell.r + cell.c);
      el.dataset.id = cell.id;
      if (cell.num) {
        const n = document.createElement('span');
        n.className = 'num';
        n.textContent = cell.num;
        el.append(n);
      }
      const l = document.createElement('span');
      l.className = 'let';
      el.append(l);
      cell.el = el;
      cell.letEl = l;
      frag.append(el);
    }
    gridEl.append(frag);

    function renderList(list, ol) {
      for (const ent of list) {
        const li = document.createElement('li');
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'clue';
        const n = document.createElement('span');
        n.className = 'cn';
        n.textContent = ent.n;
        const t = document.createElement('span');
        t.className = 'ct';
        t.textContent = ent.clue;
        if (showEnum) {
          const en = document.createElement('span');
          en.className = 'enum';
          en.textContent = ' ' + ent.enumr;
          t.append(en);
        }
        b.append(n, t);
        b.addEventListener('click', () => {
          select(firstEmpty(ent) || ent.cells[0], ent.dir);
          focusInput();
        });
        li.append(b);
        ol.append(li);
        ent.li = b;
      }
    }
    renderList(across, $('#across'));
    renderList(down, $('#down'));

    function paintCell(cell) {
      cell.letEl.textContent = cell.val;
      cell.el.classList.toggle('wrong', cell.wrong);
      cell.el.classList.toggle('revealed', cell.revealed);
    }
    function paintEntry(ent) { ent.li.classList.toggle('done', full(ent)); }
    function paintProgress() {
      const n = entries.reduce((s, e) => s + (full(e) ? 1 : 0), 0);
      progressEl.textContent = n + '/' + entries.length;
      progressEl.title = n + ' of ' + entries.length + ' answers filled';
    }

    // ---- Selection --------------------------------------------------------
    let lit = [];
    let litClues = [];

    function select(cell, dir, opts = {}) {
      if (!cell) return;
      if (!cell[dir]) dir = dir === 'a' ? 'd' : 'a';
      for (const c of lit) c.el.classList.remove('hl', 'active');
      for (const li of litClues) li.classList.remove('active', 'cross');
      cur = { cell, dir };
      const ent = cell[dir];
      lit = ent.cells.slice();
      for (const c of lit) c.el.classList.add('hl');
      cell.el.classList.add('active');
      ent.li.classList.add('active');
      litClues = [ent.li];
      const other = cell[dir === 'a' ? 'd' : 'a'];
      if (other) { other.li.classList.add('cross'); litClues.push(other.li); }

      $('#cb-num').textContent = label(ent);
      $('#cb-text').textContent = ent.clue;
      $('#cb-enum').textContent = showEnum ? ent.enumr : '';

      input.style.gridRow = cell.r + 1;
      input.style.gridColumn = cell.c + 1;
      const pos = ent.cells.indexOf(cell) + 1;
      input.setAttribute('aria-label', label(ent) + ': ' + ent.clue + ', ' + ent.ans.length + ' letters, square ' + pos +
        (cell.val ? ', filled ' + cell.val : ', empty'));

      showClueTab(dir);
      scrollClue(ent.li);
      if (other) scrollClue(other.li);
      if (!opts.noScroll) scrollToWord(ent, cell);
    }

    function showClueTab(dir) {
      if (window.matchMedia('(min-width: 900px)').matches) return;
      setTab(dir);
    }
    function setTab(dir) {
      $('#tab-a').setAttribute('aria-selected', String(dir === 'a'));
      $('#tab-d').setAttribute('aria-selected', String(dir === 'd'));
      $('#list-a').classList.toggle('show', dir === 'a');
      $('#list-d').classList.toggle('show', dir === 'd');
    }

    function scrollClue(li) {
      const list = li.closest('.list');
      if (!list || list.scrollHeight <= list.clientHeight) return;
      const head = list.querySelector('h2');
      const top = li.offsetTop - (head ? head.offsetHeight : 0);
      const bottom = li.offsetTop + li.offsetHeight;
      if (top < list.scrollTop + 8 || bottom > list.scrollTop + list.clientHeight - 8) {
        list.scrollTo({ top: top - list.clientHeight / 3, behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    }

    function cellPx() { return fitSize || ZOOMS[zoom]; }
    function pad() { return parseFloat(getComputedStyle(gridEl).paddingLeft) || 0; }

    function scrollToWord(ent, cell, instant) {
      const cs = cellPx();
      const PAD = pad();
      const first = ent.cells[0];
      const last = ent.cells[ent.cells.length - 1];
      const m = cs * 1.5;
      const vw = viewport.clientWidth;
      const vh = viewport.clientHeight;
      const axis = (a0, a1, act, size, pos, off) => {
        const lo = off + PAD + a0 * cs;
        const hi = off + PAD + (a1 + 1) * cs;
        if (hi - lo + 2 * m <= size) {
          if (lo - m < pos) return lo - m;
          if (hi + m > pos + size) return hi + m - size;
          return pos;
        }
        const alo = off + PAD + act * cs;
        if (alo - m < pos || alo + cs + m > pos + size) return alo - size / 2 + cs / 2;
        return pos;
      };
      const left = axis(first.c, last.c, cell.c, vw, viewport.scrollLeft, gridEl.offsetLeft);
      const top = axis(first.r, last.r, cell.r, vh, viewport.scrollTop, gridEl.offsetTop);
      if (Math.abs(left - viewport.scrollLeft) < 1 && Math.abs(top - viewport.scrollTop) < 1) return;
      viewport.scrollTo({ left, top, behavior: reduceMotion || instant ? 'auto' : 'smooth' });
    }

    function focusInput() {
      if (document.activeElement !== input) input.focus({ preventScroll: true });
      resetInput();
    }
    function resetInput() {
      input.value = SENTINEL;
      try { input.setSelectionRange(1, 1); } catch (e) { /* ignore */ }
    }
    function firstEmpty(ent) { return ent.cells.find((c) => !c.val); }

    function nextEntry(ent, step) {
      const n = ordered.length;
      for (let i = 1; i <= n; i++) {
        const e = ordered[(ent.k + step * i + n * n) % n];
        if (!full(e)) return e;
      }
      return ordered[(ent.k + step + n) % n];
    }
    function gotoEntry(step) {
      const ent = nextEntry(cur.cell[cur.dir], step);
      select(firstEmpty(ent) || ent.cells[0], ent.dir);
    }

    // ---- Editing ----------------------------------------------------------
    function setVal(cell, v) {
      if (cell.locked || cell.val === v) return false;
      cell.val = v;
      cell.wrong = autocheck && !hard && !!v && v !== cell.ans;
      paintCell(cell);
      if (cell.a) paintEntry(cell.a);
      if (cell.d) paintEntry(cell.d);
      return true;
    }

    function typeLetter(ch) {
      if (paused || solved || !cur.cell) return;
      startClock();
      const cell = cur.cell;
      const ent = cell[cur.dir];
      const wasFull = full(ent);
      setVal(cell, ch);
      const i = ent.cells.indexOf(cell);
      let next = null;
      if (wasFull) {
        next = ent.cells[i + 1] || null;
      } else {
        next = ent.cells.slice(i + 1).find((c) => !c.val) || firstEmpty(ent) || null;
        if (!next) {
          const ne = nextEntry(ent, 1);
          if (ne !== ent) { changed(); select(firstEmpty(ne) || ne.cells[0], ne.dir); return; }
        }
      }
      if (next) select(next, cur.dir);
      else select(cell, cur.dir, { noScroll: true });
      changed();
    }

    function backspace() {
      if (paused || solved || !cur.cell) return;
      const cell = cur.cell;
      const ent = cell[cur.dir];
      if (cell.val && !cell.locked) {
        setVal(cell, '');
        select(cell, cur.dir, { noScroll: true });
      } else {
        const prev = ent.cells[ent.cells.indexOf(cell) - 1];
        if (prev) {
          setVal(prev, '');
          select(prev, cur.dir);
        }
      }
      changed();
    }

    function del() {
      if (paused || solved || !cur.cell) return;
      setVal(cur.cell, '');
      select(cur.cell, cur.dir, { noScroll: true });
      changed();
    }

    function arrow(dr, dc) {
      if (!cur.cell) return;
      const dir = dc ? 'a' : 'd';
      if (cur.dir !== dir && cur.cell[dir]) { select(cur.cell, dir); return; }
      let r = cur.cell.r + dr;
      let c = cur.cell.c + dc;
      while (r >= 0 && r < H && c >= 0 && c < W) {
        const cell = cells.get(r * W + c);
        if (cell) { select(cell, cell[dir] ? dir : cur.dir); return; }
        r += dr;
        c += dc;
      }
    }

    function toggleDir() {
      if (!cur.cell) return;
      const other = cur.dir === 'a' ? 'd' : 'a';
      if (cur.cell[other]) select(cur.cell, other);
    }

    function changed() {
      paintProgress();
      save();
      const filled = cellList.every((c) => c.val);
      if (!filled) { wrongNoticeShown = false; return; }
      if (cellList.every((c) => c.val === c.ans)) {
        win();
      } else if (!wrongNoticeShown) {
        wrongNoticeShown = true;
        toast('Every square is filled, but something isn’t right yet.');
      }
    }

    let toastTimer = 0;
    function toast(msg) {
      toastEl.textContent = msg;
      toastEl.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
    }

    // ---- Check / reveal / clear -------------------------------------------
    function scope(kind) {
      if (!cur.cell) return [];
      if (kind === 'cell') return [cur.cell];
      if (kind === 'word') return cur.cell[cur.dir].cells;
      return cellList;
    }

    function check(kind) {
      if (solved) return;
      let wrong = 0;
      let checked = 0;
      for (const c of scope(kind)) {
        if (!c.val) continue;
        checked++;
        if (c.val === c.ans) { c.locked = true; c.wrong = false; } else { c.wrong = true; wrong++; }
        paintCell(c);
      }
      if (checked) checks++;
      if (!checked) toast('Nothing to check there yet.');
      else if (wrong) toast(wrong === 1 ? '1 square is wrong.' : wrong + ' squares are wrong.');
      else toast(kind === 'cell' ? 'That square is right.' : 'All correct so far.');
      select(cur.cell, cur.dir, { noScroll: true });
      save();
    }

    function reveal(kind) {
      if (solved) return;
      if (kind === 'all' && !confirm('Reveal the whole puzzle? It will count as solved with help.')) return;
      for (const c of scope(kind)) {
        if (c.val !== c.ans) {
          c.val = c.ans;
          c.revealed = true;
          helped++;
        }
        c.wrong = false;
        c.locked = true;
        paintCell(c);
      }
      entries.forEach(paintEntry);
      select(cur.cell, cur.dir, { noScroll: true });
      changed();
    }

    function clear(kind) {
      if (kind === 'all') {
        if (!confirm('Clear every square and reset the timer?')) return;
        for (const c of cellList) Object.assign(c, { val: '', wrong: false, revealed: false, locked: false });
        elapsed = 0;
        helped = 0;
        checks = 0;
        solved = false;
        tickFrom = 0;
        document.body.classList.remove('solved');
        timerBtn.disabled = false;
        cellList.forEach(paintCell);
        entries.forEach(paintEntry);
        paintClock();
        select(ordered[0].cells[0], ordered[0].dir);
        startClock();
      } else {
        const list = kind === 'wrong' ? cellList.filter((c) => c.val && c.val !== c.ans) : scope('word');
        for (const c of list) {
          if (c.locked) continue;
          c.val = '';
          c.wrong = false;
          paintCell(c);
        }
        entries.forEach(paintEntry);
        if (kind === 'wrong') {
          toast(list.length ? 'Cleared ' + list.length + (list.length === 1 ? ' square.' : ' squares.') : 'No wrong letters.');
          if (list.length) checks++;
        }
        select(cur.cell, cur.dir, { noScroll: true });
      }
      changed();
    }

    // ---- Clock ------------------------------------------------------------
    function now() { return elapsed + (tickFrom ? Date.now() - tickFrom : 0); }
    function fmt(ms) {
      const s = Math.floor(ms / 1000);
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      const ss = String(s % 60).padStart(2, '0');
      return h ? h + ':' + String(m).padStart(2, '0') + ':' + ss : m + ':' + ss;
    }
    function paintClock() { clockEl.textContent = fmt(now()); }
    function startClock() {
      if (tickFrom || paused || solved || document.hidden) return;
      tickFrom = Date.now();
    }
    function stopClock() {
      if (!tickFrom) return;
      elapsed += Date.now() - tickFrom;
      tickFrom = 0;
    }
    setInterval(() => {
      paintClock();
      if (tickFrom && Math.floor(now() / 1000) % 10 === 0) save();
    }, 1000);

    function setPaused(p) {
      if (solved) p = false;
      paused = p;
      if (p) stopClock(); else startClock();
      pausedEl.hidden = !p;
      timerBtn.classList.toggle('is-paused', p);
      timerBtn.setAttribute('aria-label', p ? 'Resume timer' : 'Pause timer');
      paintClock();
      save();
      if (!p) focusInput();
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { stopClock(); saveNow(); } else startClock();
    });
    window.addEventListener('pagehide', () => { stopClock(); saveNow(); });

    function win() {
      if (solved) return;
      stopClock();
      solved = true;
      timerBtn.disabled = true;
      paintClock();
      saveNow();
      for (const c of cellList) { c.locked = true; c.wrong = false; paintCell(c); }
      document.body.classList.add('solved');
      const t = fmt(elapsed);
      const where = daily ? ' on ' + LEVEL_NAMES[level] : '';
      let text;
      if (helped) text = 'Finished in ' + t + where + ', with ' + helped + (helped === 1 ? ' square' : ' squares') + ' revealed.';
      else if (checks) text = 'Solved in ' + t + where + ', with a little checking along the way.';
      else text = 'A clean solve in ' + t + where + ': no checks, no reveals.';
      $('#done-text').textContent = text;
      const harder = { easy: 'medium', medium: 'hard' }[level];
      const btn = $('#done-harder');
      if (harder && P.levels.includes(harder)) {
        const u = new URL(location.href);
        u.searchParams.set('level', harder);
        if (daily && !u.searchParams.get('d')) u.searchParams.set('d', P.date);
        btn.href = u.pathname + u.search;
        btn.textContent = 'Try it on ' + LEVEL_NAMES[harder];
        btn.hidden = false;
      }
      setTimeout(() => { if (doneDlg.showModal) doneDlg.showModal(); }, reduceMotion ? 0 : 900);
    }

    // ---- Zoom -------------------------------------------------------------
    function applyZoom(before, keepCenter) {
      const PAD = pad();
      const cx = (viewport.scrollLeft + viewport.clientWidth / 2 - PAD) / before;
      const cy = (viewport.scrollTop + viewport.clientHeight / 2 - PAD) / before;
      const cs = cellPx();
      document.documentElement.style.setProperty('--cell', cs + 'px');
      gridEl.classList.toggle('small', cs < 20);
      if (keepCenter) {
        viewport.scrollLeft = cx * cs + PAD - viewport.clientWidth / 2;
        viewport.scrollTop = cy * cs + PAD - viewport.clientHeight / 2;
      }
    }
    function setZoom(z, remember = true) {
      const before = cellPx();
      const leavingFit = !!fitSize;
      fitSize = 0;
      zoom = Math.max(0, Math.min(ZOOMS.length - 1, z));
      applyZoom(before, !leavingFit);
      if (cur.cell) scrollToWord(cur.cell[cur.dir], cur.cell, true);
      if (remember && !isGrid) { const p = store.get(PREFS) || {}; p.zoom = ZOOMS[zoom]; store.set(PREFS, p); }
    }
    // Space taken around the cells: grid padding, or (newspaper style) the
    // viewport's padding plus the grid's border.
    function inset() {
      const vs = getComputedStyle(viewport);
      return pad() + (isGrid ? (parseFloat(vs.paddingLeft) || 0) + 3 : 0);
    }
    function bestFit() {
      // Largest standard size at which the whole grid fits.
      const PAD = inset();
      const s = Math.min((viewport.clientWidth - 2 * PAD) / W, (viewport.clientHeight - 2 * PAD) / H);
      let z = 0;
      for (let i = 0; i < ZOOMS.length; i++) if (ZOOMS[i] <= s) z = i;
      return z;
    }
    function fit() {
      const before = cellPx();
      const PAD = inset();
      const s = Math.floor(Math.min((viewport.clientWidth - 2 * PAD) / W, (viewport.clientHeight - 2 * PAD) / H));
      fitSize = Math.max(6, Math.min(s, ZOOMS[ZOOMS.length - 1]));
      applyZoom(before, false);
      viewport.scrollTo(0, 0);
    }
    viewport.addEventListener('wheel', (e) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      if (fitSize) { if (e.deltaY < 0) setZoom(zoom); return; }
      setZoom(zoom + (e.deltaY < 0 ? 1 : -1));
    }, { passive: false });

    // ---- Save / load ------------------------------------------------------
    let saveTimer = 0;
    function save() {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(saveNow, 250);
    }
    function saveNow() {
      clearTimeout(saveTimer);
      const filled = cellList.filter((c) => c.val).length;
      store.set(KEY, {
        v: 2,
        fill: cellList.map((c) => c.val || '.').join(''),
        flags: cellList.map((c) => (c.revealed ? 'r' : c.locked ? 'l' : c.wrong ? 'w' : '.')).join(''),
        time: now(),
        solved,
        helped,
        checks,
        pct: Math.round((filled / cellList.length) * 100),
        at: cur.cell ? [cur.cell.id, cur.dir] : null,
      });
    }

    function restore() {
      const prefs = store.get(PREFS) || {};
      autocheck = !!prefs.autocheck && !hard;
      autocheckBox.checked = autocheck;
      if (!isGrid) {
        const z = ZOOMS.indexOf(prefs.zoom || (window.matchMedia('(max-width: 899px)').matches ? 34 : 30));
        if (z >= 0) zoom = z;
      }
      const s = store.get(KEY);
      let at = null;
      if (s && s.fill && s.fill.length === cellList.length) {
        cellList.forEach((c, i) => {
          const v = s.fill[i];
          c.val = v && v !== '.' ? v : '';
          const f = (s.flags || '')[i];
          c.revealed = f === 'r';
          c.locked = f === 'r' || f === 'l';
          c.wrong = f === 'w';
        });
        elapsed = +s.time || 0;
        solved = !!s.solved;
        helped = +s.helped || 0;
        checks = +s.checks || 0;
        if (s.at) at = s.at;
      }
      cellList.forEach(paintCell);
      entries.forEach(paintEntry);
      paintProgress();
      paintClock();
      if (solved) cellList.forEach((c) => { c.locked = true; });
      return at;
    }

    // ---- Events -----------------------------------------------------------
    gridEl.addEventListener('click', (e) => {
      const el = e.target.closest('.cell');
      if (!el || !el.dataset.id) return;
      const cell = cells.get(+el.dataset.id);
      if (fitSize) {
        select(cell, cur.dir, { noScroll: true });
        setZoom(zoom, false);
      } else if (cell === cur.cell) {
        toggleDir();
      } else {
        select(cell, cur.dir);
      }
      focusInput();
      startClock();
    });

    input.addEventListener('keydown', (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.isComposing) return;
      const k = e.key;
      if (/^[a-z]$/i.test(k)) { e.preventDefault(); typeLetter(k.toUpperCase()); return; }
      let handled = true;
      switch (k) {
        case 'Backspace': backspace(); break;
        case 'Delete': del(); break;
        case 'ArrowLeft': arrow(0, -1); break;
        case 'ArrowRight': arrow(0, 1); break;
        case 'ArrowUp': arrow(-1, 0); break;
        case 'ArrowDown': arrow(1, 0); break;
        case ' ': toggleDir(); break;
        case 'Tab': gotoEntry(e.shiftKey ? -1 : 1); break;
        case 'Enter': gotoEntry(e.shiftKey ? -1 : 1); break;
        case 'Escape': input.blur(); break;
        default: handled = false;
      }
      if (handled) e.preventDefault();
    });

    // Phones send letters (and backspace) through input events instead of keydown.
    input.addEventListener('input', () => {
      const v = input.value;
      if (v.length === 0) {
        backspace();
      } else {
        const typed = v.split(SENTINEL).join('');
        const letters = typed.replace(/[^a-z]/gi, '');
        if (letters) typeLetter(letters.slice(-1).toUpperCase());
        else if (typed.includes(' ')) toggleDir();
      }
      resetInput();
    });
    input.addEventListener('focus', resetInput);

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-act]');
      if (!btn) {
        document.querySelectorAll('details.menu[open]').forEach((d) => { if (!d.contains(e.target)) d.open = false; });
        return;
      }
      const act = btn.dataset.act;
      document.querySelectorAll('details.menu[open]').forEach((d) => { d.open = false; });
      const [verb, what] = act.split('-');
      switch (verb) {
        case 'check': check(what); break;
        case 'reveal': reveal(what); break;
        case 'clear': clear(what); break;
        case 'zoom':
          if (what === 'in') setZoom(fitSize ? zoom : zoom + 1);
          else if (what === 'out') setZoom(fitSize ? zoom : zoom - 1);
          else fit();
          break;
        case 'prev': gotoEntry(-1); break;
        case 'next': gotoEntry(1); break;
        case 'resume': setPaused(false); return;
        case 'close': doneDlg.close(); return;
        default: return;
      }
      if (verb !== 'zoom' || what !== 'fit') focusInput();
    });

    document.querySelectorAll('details.menu').forEach((d) => {
      d.addEventListener('toggle', () => {
        if (!d.open) return;
        document.querySelectorAll('details.menu[open]').forEach((o) => { if (o !== d) o.open = false; });
        const pop = d.querySelector('.pop');
        pop.style.transform = '';
        const r = pop.getBoundingClientRect();
        const vw = document.documentElement.clientWidth;
        if (r.left < 8) pop.style.transform = 'translateX(' + (8 - r.left) + 'px)';
        else if (r.right > vw - 8) pop.style.transform = 'translateX(' + (vw - 8 - r.right) + 'px)';
      });
    });

    timerBtn.addEventListener('click', () => setPaused(!paused));
    autocheckBox.addEventListener('change', () => {
      if (hard) return;
      autocheck = autocheckBox.checked;
      if (autocheck) {
        for (const c of cellList) if (c.val && c.val !== c.ans) { c.wrong = true; paintCell(c); }
      }
      const p = store.get(PREFS) || {};
      p.autocheck = autocheck;
      store.set(PREFS, p);
      save();
    });

    $('#tab-a').addEventListener('click', () => setTab('a'));
    $('#tab-d').addEventListener('click', () => setTab('d'));

    document.addEventListener('keydown', (e) => {
      if (e.target === input || e.metaKey || e.ctrlKey || e.altKey) return;
      if (doneDlg.open || e.target.closest('details, dialog, input, a')) return;
      if (/^[a-z]$/i.test(e.key) && !paused) {
        e.preventDefault();
        focusInput();
        typeLetter(e.key.toUpperCase());
      }
    });

    // ---- Start ------------------------------------------------------------
    document.body.classList.remove('loading');
    const at = restore();
    if (isGrid) zoom = bestFit();
    applyZoom(cellPx(), false);
    const startCell = at && cells.get(at[0]);
    if (startCell) select(startCell, at[1], { noScroll: true });
    else select(ordered[0].cells[0], ordered[0].dir, { noScroll: true });
    requestAnimationFrame(() => scrollToWord(cur.cell[cur.dir], cur.cell, true));
    if (window.matchMedia('(pointer: fine)').matches) focusInput();
    if (solved) {
      timerBtn.disabled = true;
      paintClock();
    } else {
      startClock();
    }
  }

  load().catch(() => notice('Something went wrong loading the puzzle. Try reloading the page.'));
})();
