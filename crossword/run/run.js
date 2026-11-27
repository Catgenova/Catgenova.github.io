/* Crossword Run: a roguelike crossword.

   A run is three acts. Each act is five steps on a map, where you pick one
   of two or three nodes (puzzle, elite, shop, rest, encounter), then a boss
   grid. Ink is health: finishing a word wrong costs one drop per wrong
   letter, and correct words lock in. Puzzles come from pools built by
   _source/crossword/run.py (pool/<size>.json); a run's choices all derive
   from its seed, so a daily run is the same for everyone.

   State is saved to localStorage after every move. */
(() => {
  'use strict';

  const SAVE_KEY = 'pere-crossword-run:v1';
  const STATS_KEY = 'pere-crossword-run:stats';
  const $ = (id) => document.getElementById(id);

  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } },
  };

  // ---------- Seeded randomness ----------
  function seedOf(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^ (h >>> 16)) >>> 0;
  }
  function rng(...parts) {
    let a = seedOf(parts.join('|'));
    return () => {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
  function shuffle(r, arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const rot13 = (s) => s.replace(/[A-Z]/g, (c) => String.fromCharCode(((c.charCodeAt(0) - 52) % 26) + 65));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function today() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // ---------- Rules ----------
  const START_INK = 15;
  const STEPS = 5; // choice steps per act; the boss comes after them
  const LV = ['e', 'm', 'h'];
  const LV_NAME = ['Easy', 'Medium', 'Hard'];
  // n: grid size, or a list of sizes to pick from (fixed per map node).
  const ACTS = [
    { name: 'Act I', puzzle: { n: [5, 6], lv: 0 }, elite: { n: 8, lv: 0, curse: true }, boss: { n: 8, lv: 1 } },
    { name: 'Act II', puzzle: { n: 8, lv: 1 }, elite: { n: 9, lv: 1, curse: true }, boss: { n: 9, lv: 1, curse: true } },
    { name: 'Act III', puzzle: { n: 9, lv: 1 }, elite: { n: 9, lv: 2, curse: true }, boss: { n: 11, lv: 2, curse: true } },
  ];
  // Pools of pre-built grids (see _source/crossword/run.py): a manifest of
  // how many grids each size has, and files of CHUNK grids each. Bump POOL_V
  // after a rebuild so browsers fetch the new files.
  const POOL_V = 2;
  const SEEN_KEY = 'pere-crossword-run:seen';
  // Grid size for a map node: fixed by the run's seed so the label and the
  // puzzle agree.
  function sizeOf(type, a, s, i) {
    const n = ACTS[a][type].n;
    return Array.isArray(n) ? pick(rng(S.seed, 'size', a, s, i), n) : n;
  }
  const BASE_COINS = { puzzle: 10, elite: 20, boss: 30 };
  const NODES = {
    puzzle: { ico: '✏️', lbl: 'Puzzle' },
    elite: { ico: '⚔️', lbl: 'Elite' },
    shop: { ico: '🛒', lbl: 'Shop' },
    rest: { ico: '⛺', lbl: 'Rest' },
    event: { ico: '❓', lbl: 'Encounter' },
    boss: { ico: '👑', lbl: 'Boss' },
  };
  const CURSES = {
    timer: { name: 'Against the clock', desc: 'Past the time limit, every 30 seconds costs 1 ink.' },
    oneway: { name: 'One way', desc: 'Down clues are hidden. Solve them from the crossings.' },
    fog: { name: 'Fog', desc: 'A clue shows only once its word crosses a solved word.' },
  };
  const PERKS = {
    thrifty: { ico: '🧾', name: 'Thrifty', desc: 'The first wrong word in each puzzle costs no ink.' },
    inkwell: { ico: '🫙', name: 'Ink Well', desc: '+4 maximum ink, and refill 4 now.' },
    vowels: { ico: '🔤', name: 'Vowel Sense', desc: 'Squares that hold a vowel are marked with a dot.' },
    headstart: { ico: '🚩', name: 'Head Start', desc: 'Every puzzle begins with 1 Across filled in.' },
    steady: { ico: '🪨', name: 'Steady Hand', desc: 'A wrong guess never costs more than 2 ink.' },
    haggler: { ico: '🏷️', name: 'Haggler', desc: 'Shop prices are 30% lower.' },
    scholar: { ico: '📚', name: 'Scholar', desc: 'Rest stops refill all of your ink.' },
    secondwind: { ico: '💨', name: 'Second Wind', desc: 'Once per run, when your ink runs out, come back with 5.' },
    sharp: { ico: '🎯', name: 'Sharpshooter', desc: '+1 coin for every word you get right on the first try.' },
    pencilcase: { ico: '🖍️', name: 'Pencil Case', desc: 'Start every puzzle with a free Pencil.' },
    lucky: { ico: '🍀', name: 'Lucky Charm', desc: '+5 coins after every puzzle.' },
    clearskies: { ico: '🌤️', name: 'Clear Skies', desc: 'Fog and One way have no effect, and time limits are 50% longer.' },
  };
  const TOOLS = {
    pencil: { ico: '✏️', name: 'Pencil', desc: 'Reveal the selected square.', price: 8 },
    lamp: { ico: '🔦', name: 'Lamp', desc: 'Reveal the selected word.', price: 18 },
    lens: { ico: '🔍', name: 'Lens', desc: 'Reveal the first letter of every answer.', price: 15 },
    tonic: { ico: '🧪', name: 'Ink Tonic', desc: 'Refill 4 ink.', price: 12 },
  };
  const PERK_PRICE = 40;

  // ---------- State ----------
  let S = null; // the run, saved after every move
  let P = null; // the current puzzle's derived structure (rebuilt from the pool)
  let sel = { cell: 0, dir: 'a' };
  let timerId = 0;
  const pools = {};
  let topicData = null;

  const has = (perk) => S && S.perks.includes(perk);
  // True only while a puzzle is on screen (a saved run can say 'puzzle' while
  // the title screen is showing).
  const inPuzzle = () => !!(S && S.puzzle && P && !$('s-puzzle').hidden);
  const save = () => { if (S) store.set(SAVE_KEY, S); };
  const stats = () => store.get(STATS_KEY) || { runs: 0, wins: 0, bestAct: 0, bestCoins: 0, daily: {} };

  async function loadJSON(path) {
    const res = await fetch(new URL(path, document.baseURI), { cache: 'force-cache' });
    if (!res.ok) throw new Error(`${path}: ${res.status}`);
    return res.json();
  }
  let manifest = null;
  async function poolCount(n) {
    if (!manifest) manifest = await loadJSON(`pool/manifest.json?v=${POOL_V}`);
    return manifest.sizes[n] || 0;
  }
  async function chunk(n, k) {
    const key = `${n}/${k}`;
    if (!pools[key]) pools[key] = await loadJSON(`pool/${n}/${k}.json?v=${POOL_V}`);
    return pools[key];
  }
  async function gridAt(n, idx) {
    if (!manifest) await poolCount(n);
    const c = await chunk(n, Math.floor(idx / manifest.chunk));
    return c.grids[idx % manifest.chunk];
  }
  // Grids this browser has played recently, per size, so new runs don't
  // repeat them (daily runs ignore this so everyone gets the same grids).
  function seenGrids() {
    const s = store.get(SEEN_KEY);
    return s && s.v === POOL_V ? s : { v: POOL_V, sizes: {} };
  }
  function markSeen(n, idx, count) {
    const s = seenGrids();
    const list = (s.sizes[n] = (s.sizes[n] || []).filter((x) => x !== idx));
    list.push(idx);
    if (list.length > count * 0.8) list.splice(0, Math.ceil(list.length / 2)); // forget the oldest half
    store.set(SEEN_KEY, s);
  }
  async function topicsJSON() {
    if (!topicData) topicData = await loadJSON('pool/topics.json?v=1');
    return topicData;
  }

  // ---------- Run setup ----------
  function makeMap(seed) {
    const map = [];
    const weights = { puzzle: 5, elite: 2.5, shop: 1.5, rest: 1.5, event: 1.6 };
    for (let a = 0; a < ACTS.length; a++) {
      const steps = [];
      for (let s = 0; s < STEPS; s++) {
        const r = rng(seed, 'map', a, s);
        if (s === 0) {
          steps.push(shuffle(r, ['puzzle', a === 0 ? 'event' : 'elite']));
          continue;
        }
        const k = r() < 0.55 ? 3 : 2;
        let opts;
        do {
          const left = Object.keys(weights);
          opts = [];
          while (opts.length < k) {
            const total = left.reduce((t, x) => t + weights[x], 0);
            let x = r() * total;
            const i = left.findIndex((t) => (x -= weights[t]) < 0);
            opts.push(left.splice(i < 0 ? 0 : i, 1)[0]);
          }
        } while (!opts.some((o) => o === 'puzzle' || o === 'elite'));
        steps.push(opts);
      }
      steps.push(['boss']);
      map.push(steps);
    }
    return map;
  }

  async function newRun({ daily = false, hard = false } = {}) {
    const date = today();
    const seed = daily ? `daily-${date}` : `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
    const td = await topicsJSON();
    const actTopics = shuffle(rng(seed, 'topics'), Object.keys(td)).slice(0, ACTS.length);
    S = {
      v: 1, seed, daily, date, hard,
      act: 0, step: 0,
      ink: START_INK, maxInk: START_INK, coins: 0,
      perks: [], tools: { pencil: 1, lamp: 0, lens: 0, tonic: 1 },
      map: makeMap(seed), picks: ACTS.map(() => []), topics: actTopics,
      used: {}, log: [], wind: false,
      screen: 'map', puzzle: null, panel: null,
      stats: { puzzles: 0, words: 0, mistakes: 0, coins: 0 },
    };
    const st = stats();
    st.runs++;
    store.set(STATS_KEY, st);
    save();
    showMap();
  }

  // ---------- Screens ----------
  function show(id) {
    for (const s of document.querySelectorAll('.screen')) s.hidden = s.id !== id;
    $('hud').hidden = !S || id === 's-title';
    window.scrollTo(0, 0);
  }
  function hud() {
    if (!S) return;
    $('hud-ink').textContent = `${S.ink}/${S.maxInk}`;
    $('hud-coins').textContent = S.coins;
    $('hud-ink').parentElement.classList.toggle('low', S.ink <= 4);
  }
  function bump(which) {
    const el = $(which).parentElement;
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
  }
  let toastTimer = 0;
  function toast(msg, ms = 2200) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), ms);
  }
  function buzz(ms) { if (navigator.vibrate) try { navigator.vibrate(ms); } catch (e) { /* ignore */ } }

  function showTitle() {
    S = store.get(SAVE_KEY);
    if (S && S.v !== 1) S = null;
    const st = stats();
    const date = today();
    const dailyResult = st.daily[date];
    const acts = [];
    if (S && !S.over) acts.push(`<button type="button" class="btn primary" data-act="continue">Continue run <small>${ACTS[S.act] ? ACTS[S.act].name : ''}${S.daily ? ' · daily' : ''}</small></button>`);
    acts.push(`<button type="button" class="btn ${S && !S.over ? '' : 'primary'}" data-act="new">New run</button>`);
    acts.push(dailyResult
      ? `<button type="button" class="btn" data-act="daily-result">Today's daily: ${dailyResult.won ? '🏆 won' : `💀 act ${dailyResult.act}`}</button>`
      : `<button type="button" class="btn" data-act="daily">Daily run <small>same for everyone</small></button>`);
    if (st.wins > 0) acts.push(`<button type="button" class="btn" data-act="new-hard">Hard run <small>clues one level harder</small></button>`);
    $('title-actions').innerHTML = acts.join('');
    $('title-stats').innerHTML = `
      <div><b>${st.runs}</b><span>runs</span></div>
      <div><b>${st.wins}</b><span>wins</span></div>
      <div><b>${st.bestAct ? (st.bestAct > 3 ? '🏆' : 'Act ' + st.bestAct) : '–'}</b><span>best</span></div>
      <div><b>${st.bestCoins}</b><span>most coins</span></div>`;
    $('title-stats').hidden = st.runs === 0;
    if (S && S.over) S = null;
    show('s-title');
  }

  function showMap() {
    S.screen = 'map';
    S.panel = null;
    save();
    stopTimer();
    hud();
    const td = topicData || {};
    const topic = td[S.topics[S.act]];
    $('map-act').textContent = `${ACTS[S.act].name} of 3${S.hard ? ' · Hard' : ''}${S.daily ? ' · Daily' : ''}`;
    $('map-topic').textContent = topic ? topic.title : '';
    const steps = S.map[S.act];
    $('map-path').innerHTML = steps.map((opts, s) => {
      const state = s < S.step ? 'done' : s === S.step ? 'now' : 'later';
      const picked = S.picks[S.act][s];
      const nodes = opts.map((t, i) => {
        const node = NODES[t];
        const cfg = ACTS[S.act][t];
        const sz = cfg ? sizeOf(t, S.act, s, i) : 0;
        const sub = cfg ? `${sz}×${sz}` : node.lbl;
        return `<button type="button" class="node ${t === 'boss' ? 'boss' : ''} ${picked === i ? 'picked' : ''}"
          ${state === 'now' ? `data-act="go" data-i="${i}"` : 'disabled'}
          aria-label="${node.lbl}${cfg ? ', ' + sub : ''}">
          <span class="ico" aria-hidden="true">${node.ico}</span>
          <span class="lbl">${cfg ? `${node.lbl} ${sub}` : node.lbl}</span></button>`;
      }).join('');
      return `<li class="step ${state}"><span class="num">${s === STEPS ? '★' : s + 1}</span><div class="opts">${nodes}</div></li>`;
    }).join('');
    renderKit($('map-kit'), true);
    show('s-map');
  }

  function renderKit(el, usable) {
    const chips = [];
    for (const [k, n] of Object.entries(S.tools)) {
      if (!n) continue;
      const t = TOOLS[k];
      if (k === 'tonic' && usable) chips.push(`<button type="button" class="chip" data-act="tonic" title="${esc(t.desc)}">${t.ico} ${t.name} ×${n} · use</button>`);
      else chips.push(`<span class="chip" title="${esc(t.desc)}">${t.ico} ${t.name} ×${n}</span>`);
    }
    for (const p of S.perks) {
      const k = PERKS[p];
      chips.push(`<button type="button" class="chip" data-act="perk-info" data-p="${p}" title="${esc(k.desc)}">${k.ico} ${k.name}</button>`);
    }
    el.innerHTML = chips.join('') || '<span class="chip">No perks yet</span>';
  }

  async function go(i) {
    const type = S.map[S.act][S.step][i];
    S.picks[S.act][S.step] = i;
    if (type === 'puzzle' || type === 'elite' || type === 'boss') await startPuzzle(type, sizeOf(type, S.act, S.step, i));
    else if (type === 'shop') openShop();
    else if (type === 'rest') openRest();
    else openEvent();
  }

  function advance() {
    S.step++;
    if (S.step > STEPS) {
      S.act++;
      S.step = 0;
      if (S.act >= ACTS.length) return endRun(true);
    }
    showMap();
  }

  // ---------- Puzzle ----------
  async function startPuzzle(type, n) {
    const cfg = ACTS[S.act][type];
    n = n || sizeOf(type, S.act, S.step, S.picks[S.act][S.step] || 0);
    const count = await poolCount(n);
    const per = manifest.chunk;
    const used = new Set(S.used[n] || []);
    const seen = new Set(S.daily ? [] : seenGrids().sizes[n] || []);
    const r = rng(S.seed, 'grid', S.act, S.step);
    // Pick a file of grids at random, then a grid in it this player hasn't
    // had lately (in this run or a recent one).
    let data;
    let cands = [];
    let base = 0;
    for (let tries = 0; tries < 4 && cands.length < 3; tries++) {
      const k = Math.floor(r() * Math.ceil(count / per));
      data = await chunk(n, k);
      base = k * per;
      cands = data.grids.map((_, i) => base + i).filter((i) => !used.has(i) && !seen.has(i));
    }
    if (!cands.length) cands = data.grids.map((_, i) => base + i).filter((i) => !used.has(i));
    if (!cands.length) cands = data.grids.map((_, i) => base + i);
    // Lean toward grids that use the act's topic words.
    const topic = S.topics[S.act];
    const tagged = cands.filter((i) => data.grids[i - base].t.includes(topic));
    const idx = pick(r, tagged.length && r() < 0.5 ? tagged : cands);
    const g = data.grids[idx - base];
    (S.used[n] = S.used[n] || []).push(idx);
    if (!S.daily) markSeen(n, idx, count);
    let curse = null;
    if (cfg.curse) curse = pick(r, Object.keys(CURSES));
    const lv = Math.min(2, cfg.lv + (S.hard ? 1 : 0));
    S.puzzle = {
      type, n, idx, lv, curse,
      letters: Array(n * n).fill(''),
      st: Array(n * n).fill(0), // 0 open, 1 solved, 2 revealed
      solved: [], tries: {}, thriftyUsed: false,
      elapsed: 0, freePencil: has('pencilcase') ? 1 : 0, done: false,
      b: g.b, pv: POOL_V, // to spot a rebuilt pool on resume
    };
    S.screen = 'puzzle';
    buildP(g, n);
    if (has('headstart')) {
      const w = P.words.find((x) => x.d === 'a');
      if (w) for (const c of w.cells) { S.puzzle.letters[c] = w.ans[w.cells.indexOf(c)]; S.puzzle.st[c] = 2; }
      settle();
    }
    save();
    openPuzzle();
  }

  function buildP(g, n) {
    const blocks = g.b.split('').map((ch) => ch === '1');
    const words = g.e.map(([d, r, c, a, e, m, h, en]) => {
      const ans = rot13(a);
      const cells = [];
      for (let k = 0; k < ans.length; k++) cells.push(d === 'a' ? r * n + c + k : (r + k) * n + c);
      return { d, r, c, ans, clue: { e, m, h }, en: en || '', cells, num: 0 };
    });
    // Number squares in reading order.
    const nums = {};
    let k = 0;
    for (let i = 0; i < n * n; i++) {
      if (blocks[i]) continue;
      if (words.some((w) => w.cells[0] === i)) nums[i] = ++k;
    }
    for (const w of words) w.num = nums[w.cells[0]];
    words.sort((a, b) => (a.d === b.d ? a.num - b.num : a.d === 'a' ? -1 : 1));
    const cellWords = {};
    words.forEach((w, wi) => w.cells.forEach((c) => { (cellWords[c] = cellWords[c] || {})[w.d] = wi; }));
    P = { n, blocks, words, nums, cellWords, letterAt: {} };
    for (const w of words) w.cells.forEach((c, i) => { P.letterAt[c] = w.ans[i]; });
  }

  function openPuzzle() {
    const p = S.puzzle;
    $('p-title').textContent = `${NODES[p.type].lbl} · ${p.n}×${p.n} · ${LV_NAME[p.lv]} clues`;
    const curse = activeCurse();
    $('p-curse').hidden = !p.curse;
    if (p.curse) {
      $('p-curse').textContent = curse ? CURSES[p.curse].name : `${CURSES[p.curse].name} (cleared)`;
      $('p-curse').title = CURSES[p.curse].desc;
    }
    renderGrid();
    renderKeyboard();
    const first = P.words.findIndex((w, i) => !p.solved.includes(i));
    selectWord(first < 0 ? 0 : first);
    show('s-puzzle');
    sizeGrid();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (inPuzzle()) sizeGrid(); });
    hud();
    startTimer();
    if (curse && p.elapsed === 0) toast(`${CURSES[p.curse].name}: ${CURSES[p.curse].desc}`, 3500);
  }

  function activeCurse() {
    const c = S.puzzle && S.puzzle.curse;
    if (!c) return null;
    if (has('clearskies') && c !== 'timer') return null;
    return c;
  }
  const timeLimit = () => Math.round(S.puzzle.n * S.puzzle.n * 4.5 * (has('clearskies') ? 1.5 : 1));

  function renderGrid() {
    const g = $('grid');
    g.style.setProperty('--n', P.n);
    let html = '';
    for (let i = 0; i < P.n * P.n; i++) {
      if (P.blocks[i]) { html += '<div class="cell block" aria-hidden="true"></div>'; continue; }
      html += `<div class="cell" data-c="${i}" role="gridcell">${P.nums[i] ? `<span class="n">${P.nums[i]}</span>` : ''}<span class="l"></span></div>`;
    }
    g.innerHTML = html;
    g.classList.toggle('done', S.puzzle.done);
    paint();
  }

  function paint() {
    const p = S.puzzle;
    const w = curWord();
    const inWord = new Set(w ? w.cells : []);
    for (const el of $('grid').querySelectorAll('.cell[data-c]')) {
      const c = +el.dataset.c;
      el.querySelector('.l').textContent = p.letters[c];
      el.classList.toggle('word', inWord.has(c));
      el.classList.toggle('cur', c === sel.cell);
      el.classList.toggle('ok', p.st[c] === 1);
      el.classList.toggle('rev', p.st[c] === 2);
      el.classList.toggle('vowel', has('vowels') && 'AEIOU'.includes(P.letterAt[c]) && !p.letters[c]);
    }
    renderClueBar();
    renderTools();
  }

  function curWord() {
    const cw = P.cellWords[sel.cell];
    if (!cw) return null;
    const wi = cw[sel.dir] !== undefined ? cw[sel.dir] : cw[sel.dir === 'a' ? 'd' : 'a'];
    return P.words[wi];
  }
  const curWordIndex = () => P.words.indexOf(curWord());

  function clueVisible(wi) {
    const p = S.puzzle;
    const w = P.words[wi];
    const curse = activeCurse();
    if (p.done || p.solved.includes(wi)) return true;
    if (curse === 'oneway') return w.d === 'a';
    if (curse === 'fog') {
      const firstA = P.words.findIndex((x) => x.d === 'a');
      const firstD = P.words.findIndex((x) => x.d === 'd');
      if (wi === firstA || wi === firstD) return true;
      return w.cells.some((c) => p.st[c] === 1 || p.st[c] === 2);
    }
    return true;
  }
  function clueHTML(wi) {
    const w = P.words[wi];
    if (!clueVisible(wi)) {
      return `<span class="fog">${activeCurse() === 'oneway' ? 'Down clues are hidden' : 'Hidden in the fog'}</span>`;
    }
    return `${esc(w.clue[LV[S.puzzle.lv]])}${w.en ? ` <span class="enum">${w.en}</span>` : ''}`;
  }
  function renderClueBar() {
    const w = curWord();
    if (!w) return;
    $('cb-num').textContent = `${w.num}${w.d === 'a' ? 'A' : 'D'}`;
    $('cb-text').innerHTML = clueHTML(P.words.indexOf(w));
  }

  function renderTools() {
    const p = S.puzzle;
    const btns = Object.entries(TOOLS).map(([k, t]) => {
      let n = S.tools[k] || 0;
      if (k === 'pencil') n += p.freePencil;
      const off = !n || p.done || (k === 'tonic' && S.ink >= S.maxInk);
      return `<button type="button" class="tool" data-act="use" data-t="${k}" ${off ? 'disabled' : ''} title="${esc(t.desc)}" aria-label="${t.name}, ${n} left: ${esc(t.desc)}"><span class="top">${t.ico} <b>${n}</b></span><span class="nm">${t.name}</span></button>`;
    });
    $('tools').innerHTML = btns.join('');
  }

  function renderKeyboard() {
    const rows = ['QWERTYUIOP', 'ASDFGHJKL', '⇄ZXCVBNM⌫'];
    $('kb').innerHTML = rows.map((row) => `<div class="row">${[...row].map((k) => {
      if (k === '⇄') return '<button type="button" class="key wide" data-key="dir" aria-label="Switch direction">⇄</button>';
      if (k === '⌫') return '<button type="button" class="key wide" data-key="back" aria-label="Delete">⌫</button>';
      return `<button type="button" class="key" data-key="${k}">${k}</button>`;
    }).join('')}</div>`).join('');
  }

  // Fit the grid between the header and the clue bar, tools and keyboard.
  function sizeGrid() {
    const g = $('grid');
    const n = P.n;
    const scr = $('s-puzzle');
    const gap = parseFloat(getComputedStyle(scr).rowGap) || 10;
    const main = document.querySelector('main');
    const mainPad = parseFloat(getComputedStyle(main).paddingTop) + parseFloat(getComputedStyle(main).paddingBottom);
    const others = ['.ptop', '.cluebar', '#tools', '#kb'].map((q) => scr.querySelector(q).offsetHeight);
    const rest = document.querySelector('.bar').offsetHeight + mainPad + others.reduce((a, b) => a + b, 0) + gap * others.length + 4;
    const byW = (g.parentElement.clientWidth - 4 - (n - 1)) / n;
    const byH = (window.innerHeight - rest - 4 - (n - 1)) / n;
    let cell = Math.max(18, Math.floor(Math.min(byW, byH, 68)));
    g.style.setProperty('--cell', `${cell}px`);
    // Then shrink until nothing spills below the screen (wrapped titles,
    // late-loading fonts).
    for (let k = 0; k < 4; k++) {
      const spill = document.documentElement.scrollHeight - window.innerHeight;
      if (spill <= 0 || cell <= 18) break;
      cell = Math.max(18, cell - Math.ceil(spill / n));
      g.style.setProperty('--cell', `${cell}px`);
    }
  }

  function selectWord(wi) {
    const w = P.words[wi];
    if (!w) return;
    sel.dir = w.d;
    const p = S.puzzle;
    sel.cell = w.cells.find((c) => !p.letters[c] && p.st[c] === 0) ?? w.cells.find((c) => p.st[c] === 0) ?? w.cells[0];
    paint();
  }

  function nextWord(step) {
    const p = S.puzzle;
    const cur = curWordIndex();
    const N = P.words.length;
    for (let k = 1; k <= N; k++) {
      const wi = (cur + step * k + N * N) % N;
      if (!p.solved.includes(wi)) return selectWord(wi);
    }
  }

  const editable = (c) => S.puzzle.st[c] === 0;

  // Type into the selected square. A locked square (already solved or
  // revealed) takes its own letter as "step past"; any other letter goes into
  // the next open square, so typing a whole word or just the gaps both work.
  function typeLetter(ch) {
    const p = S.puzzle;
    if (!p || p.done || S.ink <= 0) return;
    const w = curWord();
    const wi = P.words.indexOf(w);
    let i = w.cells.indexOf(sel.cell);
    if (!editable(sel.cell)) {
      if (P.letterAt[sel.cell] === ch) {
        const nxt = w.cells[i + 1];
        if (nxt !== undefined) sel.cell = nxt;
        paint();
        return;
      }
      const rest = w.cells.slice(i).concat(w.cells.slice(0, i)).find(editable);
      if (rest === undefined) return nextWord(1);
      sel.cell = rest;
      i = w.cells.indexOf(rest);
    }
    const target = sel.cell;
    p.letters[target] = ch;
    const judged = judge(target);
    if (p.done) return save();
    if (p.solved.includes(wi)) {
      nextWord(1);
    } else if (judged && w.cells.some((c) => editable(c) && !p.letters[c])) {
      // A wrong guess was cleared: go back to its first gap.
      sel.cell = w.cells.find((c) => editable(c) && !p.letters[c]);
      paint();
    } else {
      const nxt = w.cells[i + 1];
      sel.cell = nxt !== undefined ? nxt : (w.cells.find((c) => editable(c) && !p.letters[c]) ?? target);
      paint();
    }
    save();
  }

  function backspace() {
    const p = S.puzzle;
    if (!p || p.done) return;
    const w = curWord();
    if (editable(sel.cell) && p.letters[sel.cell]) {
      p.letters[sel.cell] = '';
    } else {
      const i = w.cells.indexOf(sel.cell);
      const prev = w.cells.slice(0, i).reverse().find(editable);
      if (prev !== undefined) { sel.cell = prev; p.letters[prev] = ''; }
    }
    paint();
    save();
  }

  // Check the words through cell c once they're full. Returns true if any
  // word was judged (right or wrong).
  function judge(c) {
    const p = S.puzzle;
    const cw = P.cellWords[c] || {};
    const full = [cw.a, cw.d].filter((wi) => wi !== undefined && !p.solved.includes(wi)
      && P.words[wi].cells.every((x) => p.letters[x]));
    if (!full.length) return false;
    const wrong = new Set();
    for (const wi of full) {
      const w = P.words[wi];
      const bad = w.cells.filter((x, i) => p.letters[x] !== w.ans[i]);
      if (bad.length) {
        bad.forEach((x) => wrong.add(x));
        p.tries[wi] = (p.tries[wi] || 0) + 1;
      }
    }
    if (wrong.size) {
      let cost = wrong.size;
      if (has('steady')) cost = Math.min(cost, 2);
      if (has('thrifty') && !p.thriftyUsed) { p.thriftyUsed = true; cost = 0; toast('Thrifty: that one was free'); }
      S.stats.mistakes += wrong.size;
      for (const x of wrong) p.letters[x] = '';
      flash([...wrong], 'bad');
      buzz(90);
      paint();
      if (cost) loseInk(cost);
    }
    settle();
    return true;
  }

  // Mark words whose letters are all correct as solved; finish the puzzle.
  function settle() {
    const p = S.puzzle;
    const newly = [];
    P.words.forEach((w, wi) => {
      if (p.solved.includes(wi)) return;
      if (w.cells.every((x, i) => p.letters[x] === w.ans[i])) {
        p.solved.push(wi);
        newly.push(wi);
        for (const x of w.cells) if (p.st[x] === 0) p.st[x] = 1;
        S.stats.words++;
        if (!p.tries[wi] && has('sharp') && !w.cells.every((x) => p.st[x] === 2)) gainCoins(1, false);
      }
    });
    if (newly.length) flash(newly.flatMap((wi) => P.words[wi].cells), 'pop');
    if (p.solved.length === P.words.length && !p.done) finishPuzzle();
  }

  function flash(cells, cls) {
    for (const c of cells) {
      const el = $('grid').querySelector(`.cell[data-c="${c}"]`);
      if (!el) continue;
      el.classList.remove(cls);
      void el.offsetWidth;
      el.classList.add(cls);
    }
  }

  function loseInk(n) {
    S.ink -= n;
    bump('hud-ink');
    hud();
    toast(`−${n} ink`, 1200);
    if (S.ink <= 0) {
      if (has('secondwind') && !S.wind) {
        S.wind = true;
        S.ink = 5;
        hud();
        toast('Second Wind! Back up to 5 ink.', 2500);
      } else {
        S.ink = 0;
        hud();
        save();
        setTimeout(() => endRun(false), 700);
      }
    }
  }
  function gainCoins(n, show = true) {
    S.coins += n;
    S.stats.coins += n;
    hud();
    bump('hud-coins');
    if (show) toast(`+${n} coins`, 1200);
  }

  function useTool(k) {
    const p = S.puzzle;
    if (k === 'tonic') {
      if (!S.tools.tonic || S.ink >= S.maxInk) return;
      S.tools.tonic--;
      S.ink = Math.min(S.maxInk, S.ink + 4);
      hud();
      bump('hud-ink');
      toast('+4 ink');
      if (S.screen === 'puzzle') paint(); else renderKit($('map-kit'), true);
      save();
      return;
    }
    if (!p || p.done) return;
    const spend = () => {
      if (k === 'pencil' && p.freePencil) { p.freePencil--; return true; }
      if (!S.tools[k]) return false;
      S.tools[k]--;
      return true;
    };
    let cells = [];
    if (k === 'pencil') cells = editable(sel.cell) ? [sel.cell] : [];
    else if (k === 'lamp') cells = curWord().cells.filter(editable);
    else if (k === 'lens') cells = P.words.map((w) => w.cells[0]).filter(editable);
    cells = [...new Set(cells)];
    if (!cells.length) { toast('Nothing to reveal there'); return; }
    if (!spend()) return;
    for (const c of cells) { p.letters[c] = P.letterAt[c]; p.st[c] = 2; }
    flash(cells, 'pop');
    settle();
    if (!p.done) {
      const w = curWord();
      if (p.solved.includes(P.words.indexOf(w))) nextWord(1); else selectWord(P.words.indexOf(w));
    }
    save();
  }

  function startTimer() {
    stopTimer();
    const p = S.puzzle;
    const timed = activeCurse() === 'timer';
    $('p-timer').hidden = !timed;
    const tick = () => {
      if (timed) {
        const left = timeLimit() - p.elapsed;
        const t = Math.abs(left);
        $('p-timer').textContent = `${left < 0 ? '+' : ''}${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
        $('p-timer').classList.toggle('over', left < 0);
      }
    };
    tick();
    timerId = setInterval(() => {
      if (document.hidden || !S || S.screen !== 'puzzle' || p.done) return;
      p.elapsed++;
      if (timed) {
        const over = p.elapsed - timeLimit();
        if (over > 0 && over % 30 === 0) loseInk(1);
      }
      tick();
      if (p.elapsed % 5 === 0) save();
    }, 1000);
  }
  function stopTimer() { clearInterval(timerId); timerId = 0; }

  function finishPuzzle() {
    const p = S.puzzle;
    p.done = true;
    stopTimer();
    $('grid').classList.add('done');
    paint();
    buzz([30, 40, 30]);
    const perfect = Object.keys(p.tries).length === 0;
    let coins = BASE_COINS[p.type];
    const lines = [`${NODES[p.type].lbl} solved: +${coins}`];
    if (perfect) { coins += 5; lines.push('No mistakes: +5'); }
    if (has('lucky')) { coins += 5; lines.push('Lucky Charm: +5'); }
    gainCoins(coins, false);
    S.stats.puzzles++;
    S.log.push(p.type === 'boss' ? '👑' : perfect ? '🟩' : '🟨');
    if (p.type === 'boss') {
      const heal = Math.min(5, S.maxInk - S.ink);
      if (heal > 0 && S.act < ACTS.length - 1) { S.ink += heal; lines.push(`A breather before the next act: +${heal} ink`); }
    }
    hud();
    save();
    setTimeout(() => {
      if (p.type === 'boss' && S.act === ACTS.length - 1) return endRun(true);
      openReward(lines);
    }, 900);
  }

  // ---------- Rewards, shop, rest, events ----------
  function perkOffers(r, k) {
    const free = Object.keys(PERKS).filter((x) => !S.perks.includes(x));
    return shuffle(r, free).slice(0, k);
  }
  function takePerk(id) {
    if (!PERKS[id] || S.perks.includes(id)) return;
    S.perks.push(id);
    if (id === 'inkwell') { S.maxInk += 4; S.ink = Math.min(S.maxInk, S.ink + 4); }
    toast(`${PERKS[id].ico} ${PERKS[id].name}`);
    hud();
  }

  function panel(html) {
    $('panel').innerHTML = html;
    S.screen = 'panel';
    save();
    stopTimer();
    hud();
    show('s-panel');
  }

  function choiceHTML({ act, data = '', ico, title, desc, price, disabled }) {
    return `<button type="button" class="choice" data-act="${act}" ${data} ${disabled ? 'disabled' : ''}>
      <span class="ico" aria-hidden="true">${ico}</span>
      <span class="txt"><b>${esc(title)}</b><span>${esc(desc)}</span></span>
      ${price !== undefined ? `<span class="price">🪙 ${price}</span>` : ''}</button>`;
  }

  function openReward(lines) {
    const r = rng(S.seed, 'reward', S.act, S.step);
    const type = S.puzzle.type;
    if (!S.panel || S.panel.kind !== 'reward') {
      const perks = perkOffers(r, type === 'puzzle' ? 1 : 2);
      const tool = pick(r, Object.keys(TOOLS));
      S.panel = { kind: 'reward', lines, perks, tool, coins: type === 'boss' ? 20 : 12 };
    }
    const pnl = S.panel;
    const opts = pnl.perks.map((id) => choiceHTML({ act: 'reward', data: `data-k="perk" data-v="${id}"`, ico: PERKS[id].ico, title: PERKS[id].name, desc: PERKS[id].desc }));
    if (type !== 'boss' || !pnl.perks.length) {
      const t = TOOLS[pnl.tool];
      opts.push(choiceHTML({ act: 'reward', data: `data-k="tool" data-v="${pnl.tool}"`, ico: t.ico, title: `${t.name} ×2`, desc: t.desc }));
    }
    opts.push(choiceHTML({ act: 'reward', data: 'data-k="coins"', ico: '🪙', title: `${pnl.coins} coins`, desc: 'Save up for the shop.' }));
    panel(`<p class="eyebrow">${S.puzzle.type === 'boss' ? 'Boss defeated' : 'Solved'}</p>
      <h2>Choose a reward</h2>
      <p>${pnl.lines.map(esc).join(' · ')}</p>
      <div class="choices">${opts.join('')}</div>`);
  }
  function claimReward(k, v) {
    if (k === 'perk') takePerk(v);
    else if (k === 'tool') { S.tools[v] = (S.tools[v] || 0) + 2; toast(`${TOOLS[v].ico} ${TOOLS[v].name} ×2`); }
    else gainCoins(S.panel.coins);
    S.puzzle = null;
    advance();
  }

  const priceOf = (base) => Math.ceil(base * (has('haggler') ? 0.7 : 1));

  function openShop() {
    if (!S.panel || S.panel.kind !== 'shop') {
      const r = rng(S.seed, 'shop', S.act, S.step);
      const tools = shuffle(r, Object.keys(TOOLS)).slice(0, 3);
      const perks = perkOffers(r, 2);
      S.panel = { kind: 'shop', items: [...tools.map((t) => ['tool', t]), ...perks.map((p) => ['perk', p])], sold: [] };
      S.log.push('🛒');
    }
    renderShop();
  }
  function renderShop() {
    const pnl = S.panel;
    const items = pnl.items.map(([kind, id], i) => {
      const sold = pnl.sold.includes(i);
      const def = kind === 'tool' ? TOOLS[id] : PERKS[id];
      const price = priceOf(kind === 'tool' ? def.price : PERK_PRICE);
      return choiceHTML({
        act: 'buy', data: `data-i="${i}"`, ico: def.ico,
        title: sold ? `${def.name} (sold)` : def.name, desc: def.desc, price,
        disabled: sold || S.coins < price || (kind === 'perk' && S.perks.includes(id)),
      });
    });
    panel(`<p class="eyebrow">Shop</p><h2>The ink merchant</h2>
      <p>You have 🪙 ${S.coins}. Tools are used up; perks last the whole run.</p>
      <div class="choices">${items.join('')}</div>
      <div class="actions" style="margin-top:14px"><button type="button" class="btn primary" data-act="leave">Leave the shop</button></div>`);
  }
  function buy(i) {
    const pnl = S.panel;
    const [kind, id] = pnl.items[i];
    if (pnl.sold.includes(i)) return;
    const price = priceOf(kind === 'tool' ? TOOLS[id].price : PERK_PRICE);
    if (S.coins < price) return;
    S.coins -= price;
    pnl.sold.push(i);
    if (kind === 'tool') { S.tools[id] = (S.tools[id] || 0) + 1; toast(`${TOOLS[id].ico} ${TOOLS[id].name}`); } else takePerk(id);
    hud();
    renderShop();
  }

  function openRest() {
    S.panel = { kind: 'rest' };
    S.log.push('⛺');
    const heal = has('scholar') ? S.maxInk - S.ink : Math.min(S.maxInk - S.ink, Math.ceil(S.maxInk / 2));
    panel(`<p class="eyebrow">Rest stop</p><h2>A quiet campfire</h2>
      <p>Catch your breath, or spend the time studying.</p>
      <div class="choices">
        ${choiceHTML({ act: 'rest', data: 'data-k="heal"', ico: '🛌', title: `Rest: refill ${heal} ink`, desc: has('scholar') ? 'Scholar: all the way to full.' : 'Up to half your maximum.', disabled: heal <= 0 })}
        ${choiceHTML({ act: 'rest', data: 'data-k="study"', ico: '📖', title: 'Study', desc: 'Gain a Lens and a Pencil.' })}
        ${choiceHTML({ act: 'rest', data: 'data-k="deepen"', ico: '🫙', title: 'Grind ink', desc: '+2 maximum ink (not refilled).' })}
      </div>`);
  }
  function rest(k) {
    if (k === 'heal') {
      const heal = has('scholar') ? S.maxInk - S.ink : Math.min(S.maxInk - S.ink, Math.ceil(S.maxInk / 2));
      S.ink += heal;
      toast(`+${heal} ink`);
    } else if (k === 'study') {
      S.tools.lens = (S.tools.lens || 0) + 1;
      S.tools.pencil = (S.tools.pencil || 0) + 1;
      toast('🔍 Lens and ✏️ Pencil');
    } else {
      S.maxInk += 2;
      toast('+2 maximum ink');
    }
    advance();
  }

  function scramble(r, w) {
    for (let k = 0; k < 20; k++) {
      const s = shuffle(r, [...w]).join('');
      if (s !== w) return s;
    }
    return [...w].reverse().join('');
  }

  function openEvent() {
    const td = topicData;
    const topic = td[S.topics[S.act]];
    if (!S.panel || S.panel.kind !== 'event') {
      const r = rng(S.seed, 'event', S.act, S.step);
      const kind = pick(r, ['anagram', 'riddle', 'bargain', 'spring']);
      const [a, easy, med] = pick(r, topic.words);
      const word = rot13(a);
      S.panel = { kind: 'event', type: kind, word, easy, med, letters: scramble(r, word), guesses: 0, perk: perkOffers(r, 1)[0] || null };
      S.log.push('❓');
    }
    renderEvent();
  }
  function renderEvent() {
    const e = S.panel;
    const topic = topicData[S.topics[S.act]];
    if (e.type === 'anagram' || e.type === 'riddle') {
      const isA = e.type === 'anagram';
      panel(`<p class="eyebrow">Encounter · ${esc(topic.title)}</p>
        <h2>${isA ? 'The scrambled sign' : 'The sphinx'}</h2>
        <p>${isA ? 'A signpost has its letters jumbled. Unscramble it for 15 coins.' : 'Answer the riddle for a tool and 8 coins.'} Each wrong guess costs 1 ink. ${3 - e.guesses} guesses left.</p>
        ${isA ? `<p class="big-letters">${e.letters}</p><p>Hint: ${esc(e.easy)}</p>` : `<p class="big-letters">${'_ '.repeat(e.word.length).trim()}</p><p>${esc(e.med)} (${e.word.length})</p>`}
        <form class="answer" data-form="guess"><input id="guess" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="${e.word.length}" aria-label="Your answer"><button class="btn primary">Guess</button></form>
        <div class="actions"><button type="button" class="btn" data-act="leave">Walk away</button></div>`);
    } else if (e.type === 'bargain') {
      const perk = e.perk && PERKS[e.perk];
      panel(`<p class="eyebrow">Encounter</p><h2>A stranger with a quill</h2>
        <p>"I'll teach you a trick," they say, "for a little of your ink."</p>
        <div class="choices">
          ${perk ? choiceHTML({ act: 'bargain', ico: perk.ico, title: `Pay 4 ink: ${perk.name}`, desc: perk.desc, disabled: S.ink <= 4 }) : ''}
          ${choiceHTML({ act: 'leave', ico: '👋', title: 'No thanks', desc: 'Keep your ink and move on.' })}
        </div>`);
    } else {
      panel(`<p class="eyebrow">Encounter</p><h2>An inkwell spring</h2>
        <p>Dark, glossy ink bubbles up between the rocks.</p>
        <div class="choices">
          ${choiceHTML({ act: 'spring', data: 'data-k="drink"', ico: '🫗', title: 'Drink: refill 4 ink', desc: 'For the road ahead.', disabled: S.ink >= S.maxInk })}
          ${choiceHTML({ act: 'spring', data: 'data-k="bottle"', ico: '🧪', title: 'Bottle it', desc: 'Gain two Ink Tonics for later.' })}
        </div>`);
    }
    const input = $('guess');
    if (input && matchMedia('(hover: hover)').matches) input.focus();
  }
  function guess(text) {
    const e = S.panel;
    const g = text.toUpperCase().replace(/[^A-Z]/g, '');
    if (!g) return;
    if (g === e.word) {
      if (e.type === 'anagram') gainCoins(15);
      else {
        const t = pick(rng(S.seed, 'riddle', S.act, S.step), Object.keys(TOOLS));
        S.tools[t] = (S.tools[t] || 0) + 1;
        gainCoins(8, false);
        toast(`Correct! ${TOOLS[t].ico} ${TOOLS[t].name} and 8 coins`);
      }
      return advance();
    }
    e.guesses++;
    buzz(90);
    loseInk(1);
    if (S.ink <= 0) return;
    if (e.guesses >= 3) {
      toast(`It was ${e.word}.`, 2500);
      return advance();
    }
    toast('Not quite.');
    renderEvent();
  }

  // ---------- End of run ----------
  function shareText(won) {
    const head = `Crossword Run${S.daily ? ` · daily ${S.date}` : ''}${S.hard ? ' · hard' : ''}`;
    const result = won ? '🏆 Cleared all 3 acts' : `💀 Ran dry in ${ACTS[S.act].name}`;
    return `${head}\n${result}\n${S.log.length ? S.log.join('') + '\n' : ''}🪙 ${S.stats.coins} · ${S.stats.words} words · ${S.stats.mistakes} wrong letters\nhttps://pere.games/crossword/run/`;
  }

  function endRun(won) {
    if (!S || S.over) return;
    stopTimer();
    S.over = true;
    S.won = won;
    const st = stats();
    const reached = won ? 4 : S.act + 1;
    st.bestAct = Math.max(st.bestAct || 0, reached);
    st.bestCoins = Math.max(st.bestCoins || 0, S.stats.coins);
    if (won) st.wins++;
    if (S.daily && !st.daily[S.date]) st.daily[S.date] = { won, act: S.act + 1, text: shareText(won) };
    store.set(STATS_KEY, st);
    store.del(SAVE_KEY);
    S.screen = 'over';
    const text = shareText(won);
    panel(`<p class="eyebrow">${won ? 'Victory' : 'Out of ink'}</p>
      <h2>${won ? 'You cleared the run!' : `Your quill ran dry in ${ACTS[S.act].name}.`}</h2>
      <p>${S.stats.puzzles} puzzles · ${S.stats.words} words · ${S.stats.mistakes} wrong letters · ${S.stats.coins} coins earned${won && st.wins === 1 ? ' · Hard runs unlocked' : ''}</p>
      <div class="share" id="share-text">${esc(text)}</div>
      <div class="actions">
        <button type="button" class="btn primary" data-act="new">New run</button>
        <button type="button" class="btn" data-act="share">Share</button>
        <button type="button" class="btn" data-act="title">Title screen</button>
      </div>`);
    store.del(SAVE_KEY);
  }

  async function share(text) {
    try {
      if (navigator.share && matchMedia('(pointer: coarse)').matches) { await navigator.share({ text }); return; }
      await navigator.clipboard.writeText(text);
      toast('Copied to clipboard');
    } catch (e) { /* cancelled */ }
  }

  // ---------- Clue sheet ----------
  function openClues() {
    const p = S.puzzle;
    const cur = curWordIndex();
    const list = (d) => P.words.map((w, wi) => [w, wi]).filter(([w]) => w.d === d).map(([w, wi]) =>
      `<li><button type="button" class="${wi === cur ? 'cur' : ''} ${p.solved.includes(wi) ? 'ok' : ''}" data-act="jump" data-w="${wi}"><b>${w.num}</b><span>${clueHTML(wi)}</span></button></li>`).join('');
    $('sheet-content').innerHTML = `<h4>Across</h4><ol>${list('a')}</ol><h4>Down</h4><ol>${list('d')}</ol>`;
    $('sheet').hidden = false;
  }
  const closeSheet = () => { $('sheet').hidden = true; };

  // ---------- Events ----------
  document.addEventListener('click', async (ev) => {
    const cell = ev.target.closest('.cell[data-c]');
    if (cell && inPuzzle()) {
      const c = +cell.dataset.c;
      if (c === sel.cell) sel.dir = sel.dir === 'a' ? 'd' : 'a';
      sel.cell = c;
      const cw = P.cellWords[c];
      if (cw && cw[sel.dir] === undefined) sel.dir = sel.dir === 'a' ? 'd' : 'a';
      paint();
      return;
    }
    const key = ev.target.closest('[data-key]');
    if (key && inPuzzle()) {
      const k = key.dataset.key;
      if (k === 'back') backspace();
      else if (k === 'dir') { const cw = P.cellWords[sel.cell]; if (cw && cw.a !== undefined && cw.d !== undefined) { sel.dir = sel.dir === 'a' ? 'd' : 'a'; paint(); } }
      else typeLetter(k);
      return;
    }
    const b = ev.target.closest('[data-act]');
    if (!b) {
      if (ev.target === $('sheet')) closeSheet();
      return;
    }
    const a = b.dataset.act;
    try {
      if (a === 'continue') resume();
      else if (a === 'new') await newRun();
      else if (a === 'new-hard') await newRun({ hard: true });
      else if (a === 'daily') await newRun({ daily: true });
      else if (a === 'daily-result') {
        const r = stats().daily[today()];
        if (r) { await share(r.text); }
      } else if (a === 'title') showTitle();
      else if (a === 'go') await go(+b.dataset.i);
      else if (a === 'abandon') {
        if (confirm('Abandon this run? It will count as a loss.')) endRun(false);
      } else if (a === 'tonic') useTool('tonic');
      else if (a === 'perk-info') toast(`${PERKS[b.dataset.p].name}: ${PERKS[b.dataset.p].desc}`, 3500);
      else if (a === 'prev') nextWord(-1);
      else if (a === 'next') nextWord(1);
      else if (a === 'clues') openClues();
      else if (a === 'close-sheet') closeSheet();
      else if (a === 'jump') { closeSheet(); selectWord(+b.dataset.w); }
      else if (a === 'use') useTool(b.dataset.t);
      else if (a === 'reward') claimReward(b.dataset.k, b.dataset.v);
      else if (a === 'buy') buy(+b.dataset.i);
      else if (a === 'leave') advance();
      else if (a === 'rest') rest(b.dataset.k);
      else if (a === 'bargain') {
        if (S.ink > 4) { S.ink -= 4; takePerk(S.panel.perk); advance(); }
      } else if (a === 'spring') {
        if (b.dataset.k === 'drink') { S.ink = Math.min(S.maxInk, S.ink + 4); toast('+4 ink'); } else { S.tools.tonic = (S.tools.tonic || 0) + 2; toast('🧪 Ink Tonic ×2'); }
        advance();
      } else if (a === 'share') await share(($('share-text') || {}).textContent || '');
    } catch (err) {
      console.error(err);
      toast('Something went wrong loading the puzzle. Check your connection and try again.', 4000);
    }
  });

  document.addEventListener('submit', (ev) => {
    const f = ev.target.closest('[data-form="guess"]');
    if (!f) return;
    ev.preventDefault();
    guess($('guess').value);
  });

  document.addEventListener('keydown', (ev) => {
    if (!$('sheet').hidden && ev.key === 'Escape') return closeSheet();
    if (!inPuzzle() || ev.target.closest('input') || ev.metaKey || ev.ctrlKey || ev.altKey) return;
    const k = ev.key;
    if (/^[a-z]$/i.test(k)) { typeLetter(k.toUpperCase()); ev.preventDefault(); }
    else if (k === 'Backspace' || k === 'Delete') { backspace(); ev.preventDefault(); }
    else if (k === 'Tab' || k === 'Enter') { nextWord(ev.shiftKey ? -1 : 1); ev.preventDefault(); }
    else if (k === ' ') { const cw = P.cellWords[sel.cell]; if (cw && cw.a !== undefined && cw.d !== undefined) { sel.dir = sel.dir === 'a' ? 'd' : 'a'; paint(); } ev.preventDefault(); }
    else if (k.startsWith('Arrow')) {
      const n = P.n;
      const dr = k === 'ArrowUp' ? -1 : k === 'ArrowDown' ? 1 : 0;
      const dc = k === 'ArrowLeft' ? -1 : k === 'ArrowRight' ? 1 : 0;
      const dir = dc ? 'a' : 'd';
      if (sel.dir !== dir && P.cellWords[sel.cell] && P.cellWords[sel.cell][dir] !== undefined) { sel.dir = dir; paint(); ev.preventDefault(); return; }
      let r = Math.floor(sel.cell / n) + dr;
      let c = (sel.cell % n) + dc;
      while (r >= 0 && r < n && c >= 0 && c < n) {
        if (!P.blocks[r * n + c]) { sel.cell = r * n + c; break; }
        r += dr; c += dc;
      }
      paint();
      ev.preventDefault();
    }
  });

  window.addEventListener('resize', () => { if (inPuzzle()) sizeGrid(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  window.addEventListener('pagehide', save);

  async function resume() {
    S = store.get(SAVE_KEY);
    if (!S) return showTitle();
    await topicsJSON();
    if (S.screen === 'puzzle' && S.puzzle) {
      const g = S.puzzle.pv === POOL_V ? await gridAt(S.puzzle.n, S.puzzle.idx).catch(() => null) : null;
      if (!g || (S.puzzle.b && g.b !== S.puzzle.b)) {
        // The pool was rebuilt since this puzzle started: start a fresh one.
        toast('This puzzle was updated, so here is a fresh grid.', 3000);
        return startPuzzle(S.puzzle.type);
      }
      buildP(g, S.puzzle.n);
      openPuzzle();
    } else if (S.panel && S.panel.kind === 'reward' && S.puzzle) {
      openReward(S.panel.lines);
    } else if (S.panel && S.panel.kind === 'shop') {
      renderShop();
    } else if (S.panel && S.panel.kind === 'rest') {
      S.log.pop();
      openRest();
    } else if (S.panel && S.panel.kind === 'event') {
      renderEvent();
    } else {
      showMap();
    }
  }

  // Start on the title screen; topics load in the background.
  topicsJSON().catch(() => {});
  showTitle();
})();
