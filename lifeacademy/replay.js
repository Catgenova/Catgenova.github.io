/* Lens Replay: the whole session played back at 7×, from what Lens recorded, with what it was doing laid on top.
   Built only from what actually happened in the room. Nothing here is scripted. */
'use strict';
(function () {
  const L = window.LENS;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const secs = (ms) => Math.round(ms / 1000);
  const minsec = (ms) => { const s = Math.round(ms / 1000); return s >= 60 ? `${Math.floor(s / 60)} min ${s % 60} s` : `${s} s`; };
  const clock = (ms) => { const s = Math.floor(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  const CAT_VAR = { teacher: 'var(--series-teacher)', story: 'var(--series-story)', other: 'var(--series-other)', ad: 'var(--series-ad)' };
  const EMO = { like: '👍', love: '❤️', laugh: '😂', sad: '😢', dislike: '👎', angry: '😡', notInterested: '🚫' };

  let S, chapters = [], idx = 0;
  const root = () => $('#replay');

  function catOf(id) { if (id.startsWith('ad:')) return 'ad'; const p = L.getItem(id); return p ? p.cat || 'other' : 'other'; }
  function shortOf(id) { const p = L.getItem(id); return p ? p.short || p.id : id; }
  function trunc(s, n) { s = String(s || ''); return s.length > n ? s.slice(0, n - 1) + '…' : s; }

  function build() {
    S = L.getState();
    chapters = [{ k: 'intro' }, { k: 'video' }, { k: 'without' }, { k: 'totals' }, { k: 'learned' }, { k: 'line' }, { k: 'off' }, { k: 'close' }];
    L.questions.forEach((q, i) => chapters.push({ k: 'q', i }));
  }

  /* ================= The video =================
     The whole session again at 7×, rebuilt from what Lens recorded twice a second. On the left: Theo's screen, with every
     number Lens was computing laid over it, and underneath it the rest of the feed, zoomed out, reordering live, every
     post's score beside it. On the right: everything Lens was calculating about Theo at that moment. */
  const SPEED = 7, ROW_H = 19, ROWS = 46, CARD_MAX = 4;
  // The big moments play at normal speed: a little before each one, and a few seconds after.
  const SLOW_BEFORE = 1500, SLOW_AFTER = 4000;
  const isBig = (x) => ['react', 'creact', 'comment', 'search', 'thread', 'glance', 'open'].includes(x.type) || (x.type === 'dwell' && x.id === 'french');
  const SIGNAL_LABEL = { dwell: 'looked long enough', pause: 'stopped scrolling', react: 'reacted', creact: 'reacted to a comment', open: 'opened the comments', typing: 'typing', comment: 'posted a comment', thread: 'opened the thread', glance: 'checked who liked it', search: 'searched' };
  const STORY_T = { gaga: 1, theo: 1, drama: 1, stress: 1 };
  let V = null;

  function vTimeline() {
    const segs = [], tl = [], orders = [], sig = [], ev = [];
    let off = 0;
    for (let s = 1; s <= 7; s++) {
      const r = S.rec[s]; if (!r || !r.active) continue;
      segs.push({ s, off, dur: r.active });
      (r.tl || []).forEach(x => tl.push({ ...x, t: off + x.t, s }));
      (r.orders || []).forEach(o => orders.push({ t: off + o.t, seq: o.seq, sc: o.sc || [] }));
      (r.ev || []).forEach(e => ev.push({ t: off + e.t, text: e.text, icon: e.icon }));
      S.signals.slice(r.sig0 || 0, r.sig1 == null ? undefined : r.sig1).forEach(x => sig.push({ ...x, t: off + x.t }));
      off += r.active;
    }
    const by = (a, b) => a.t - b.t;
    tl.sort(by); orders.sort(by); sig.sort(by); ev.sort(by);
    const slow = [];
    sig.filter(isBig).concat(ev.filter(e => /posted about you|quoted you/i.test(e.text))).forEach(x => {
      const a = Math.max(0, x.t - SLOW_BEFORE), b = x.t + SLOW_AFTER, last = slow[slow.length - 1];
      if (last && a <= last[1]) last[1] = Math.max(last[1], b); else slow.push([a, b]);
    });
    return { segs, total: off, tl, orders, sig, ev, slow };
  }
  function vSpeed(T) { return V.slow.some(([a, b]) => T >= a && T < b) ? 1 : SPEED; }
  // At the start of each stage the video stops on that stage's reveal, big, until the teacher presses Space.
  function vCardShow(n) {
    const c = root().querySelector('.vp-reveal'), rv = L.reveal[n]; if (!c || !rv) return;
    c.innerHTML = `<div><span class="rp-st">Stage ${n}</span><small>What this really is</small><b>${esc(rv.name)}</b><p>${esc(rv.line)}</p><em>Space ▶ to play</em></div>`;
    c.hidden = false; V.playing = false; V.card = n;
  }
  function vCardHide() { const c = root().querySelector('.vp-reveal'); if (c) c.hidden = true; V.card = 0; }

  function videoHTML() {
    return `<div class="vp">
      <div class="vp-left">
        <div class="vp-screen">
          <div class="vp-chrome"><b>Lens</b><span class="vp-search">Search</span><span class="vp-streak" hidden>🔥 4-day streak</span><span class="vp-bell">🔔<i></i></span><span class="vp-me">${L.avatar('theo', 'sm')} Theo</span></div>
          <div class="vp-body"><div class="vp-feed"><div class="vp-banners"></div><div class="vp-above"></div><div class="vp-cards"></div></div><div class="vp-sideads"></div></div>
          <div class="vp-typing" hidden></div><div class="vp-modal" hidden></div><div class="vp-toasts"></div><div class="vp-scroll"></div>
        </div>
        <div class="vp-below"><div class="vp-belowlabel"><span>↓ the rest of Theo’s feed, in the order Lens put it</span><span>score</span></div><div class="vp-rows"></div></div>
      </div>
      <div class="vp-side">
        <div class="vp-a">
          <div class="vp-stage"></div>
          <div class="vp-cap"></div>
          <div class="vp-gauges"></div>
          <div class="vp-box"><h4>What Lens thinks Theo is interested in</h4><div class="vp-int"></div></div>
        </div>
        <div class="vp-b">
          <div class="vp-box"><h4>Ranking the posts on screen <small>3×interest match + 0.9×log(engagement) + Theo’s reaction</small></h4><div class="vp-rank"></div></div>
          <div class="vp-box"><h4>Ad auction <small>bid × (0.2 + interest match)</small></h4><div class="vp-ads"></div></div>
          <div class="vp-log"></div>
        </div>
      </div>
      <div class="vp-reveal" hidden></div>
      <div class="vp-ctl"><button type="button" class="vp-btn" data-vp="play" aria-label="Play or pause">❚❚</button><div class="vp-track"></div><span class="vp-clock"></span></div>
    </div>`;
  }

  function videoMount() {
    V = { ...vTimeline(), T: 0, playing: true, last: performance.now(), raf: 0, iTl: -1, iOrd: -1, iSig: 0, iEv: 0, pushed: {}, flashes: [], toasts: [], log: [], rows: new Map(), cards: new Map(), side: new Map(), stage: 0, lastDraw: 0 };
    const el = root(), track = el.querySelector('.vp-track');
    track.innerHTML = V.segs.map(g => `<div class="vp-seg" style="flex:${Math.max(g.dur, 1)}"><span>${g.s}</span></div>`).join('') + '<div class="vp-head"></div>';
    track.addEventListener('click', e => {
      const b = track.getBoundingClientRect();
      vSeek(V.total * Math.min(1, Math.max(0, (e.clientX - b.left) / b.width)), false);
      if (!V.raf) V.raf = requestAnimationFrame(vFrame);
    });
    el.querySelector('[data-vp="play"]').addEventListener('click', vToggle);
    el.querySelector('.vp-reveal').addEventListener('click', vToggle);
    if (!V.total) { el.querySelector('.vp-cards').innerHTML = '<p class="vp-empty">Nothing was recorded.</p>'; V.playing = false; return; }
    vSeek(0);
    V.last = performance.now();
    V.raf = requestAnimationFrame(vFrame);
  }
  function vStop() { if (V && V.raf) cancelAnimationFrame(V.raf); if (V) V.raf = 0; }
  function vButton() { const b = root().querySelector('[data-vp="play"]'); if (b) b.textContent = V.playing ? '❚❚' : V.T >= V.total ? '↺' : '▶'; }
  function vToggle() {
    if (!V || !V.total) return;
    if (V.T >= V.total) vSeek(0, false);
    V.playing = !V.playing; V.last = performance.now();
    if (V.playing) vCardHide();
    vButton();
    if (!V.raf) V.raf = requestAnimationFrame(vFrame);
  }
  function vSeek(T, card) {
    // replay everything up to T silently, then carry on from there
    V.T = Math.max(0, Math.min(T, V.total));
    const seg = card !== false && V.segs.find(g => g.off === V.T);
    if (seg) vCardShow(seg.s); else vCardHide();
    V.iTl = -1; V.iOrd = -1; V.iSig = 0; V.iEv = 0; V.pushed = {}; V.flashes = []; V.toasts = []; V.log = []; V.x = null;
    vAdvance(true);
    vDraw(true);
    vButton();
  }
  function vStageAt(T) { let g = V.segs[0]; for (const x of V.segs) if (x.off <= T) g = x; return g; }
  function vAdvance(silent) {
    const now = performance.now();
    while (V.iTl + 1 < V.tl.length && V.tl[V.iTl + 1].t <= V.T) { const x = V.tl[++V.iTl]; if (x.x) V.x = x.x; }
    while (V.iOrd + 1 < V.orders.length && V.orders[V.iOrd + 1].t <= V.T) V.iOrd++;
    while (V.iSig < V.sig.length && V.sig[V.iSig].t <= V.T) {
      const x = V.sig[V.iSig++];
      if (x.id && V.pushed[x.id] == null) V.pushed[x.id] = x.t;
      V.log.unshift(x); if (V.log.length > 5) V.log.length = 5;
      if (!silent) V.flashes.push({ x, until: now + 2400 });
    }
    while (V.iEv < V.ev.length && V.ev[V.iEv].t <= V.T) {
      const e = V.ev[V.iEv++];
      if (!silent) { V.toasts.unshift({ e, until: now + 2600 }); if (V.toasts.length > 2) V.toasts.length = 2; }
    }
  }
  function vFrame(now) {
    if (!V || !root().querySelector('.vp')) { vStop(); return; }
    const dt = Math.min(250, now - V.last); V.last = now;
    if (V.playing) {
      const prev = V.T;
      let nt = Math.min(V.total, prev + dt * vSpeed(prev));
      const cross = V.segs.find(g => g.off > prev && g.off <= nt);
      if (cross) nt = cross.off;
      V.T = nt;
      vAdvance(false);
      if (cross) { vCardShow(cross.s); vButton(); }
      else if (V.T >= V.total) { V.playing = false; vButton(); }
    }
    if (now - V.lastDraw > 80) { V.lastDraw = now; vDraw(false); }
    if (!V.playing && !V.flashes.some(f => f.until > now) && !V.toasts.length) { V.raf = 0; vDraw(false); return; }
    V.raf = requestAnimationFrame(vFrame);
  }

  const set = (el, html) => { if (el && el._h !== html) { el._h = html; el.innerHTML = html; } };
  const fmt = (n) => n >= 10000 ? (n / 1000).toFixed(n >= 100000 ? 0 : 1) + 'K' : String(n);
  const nameOf = (id) => { if (id.startsWith('ad:')) return 'Sponsored'; const p = L.getItem(id) || {}; return (L.people[p.who] || {}).name || p.who || ''; };

  function thumbHTML(p) {
    if (!p.img) return '';
    if (p.img.photo) return `<div class="vp-thumb" style="filter:${L.cropFilters[p.img.photo] || ''}">${L.sceneSVG(p.img.photo)}</div>`;
    if (p.img.video) return `<div class="vp-thumb">${L.crashVideoSVG()}</div>`;
    return `<div class="vp-thumb">${L.cardHTML(p.img.card)}</div>`;
  }
  function cardEl(id) {
    const el = document.createElement('div'), p = L.getItem(id) || {};
    el.className = 'vp-card' + (id.startsWith('ad:') ? ' vp-ad' : '');
    el.style.setProperty('--c', CAT_VAR[catOf(id)]);
    if (id.startsWith('ad:')) {
      el.innerHTML = `<div class="vp-ov"></div><div class="vp-adin" style="background:linear-gradient(120deg,${(p.bg || ['#444', '#777']).join(',')})"><span>${p.art || ''}</span><div><small>Sponsored · ${esc(p.brand || '')}</small><b>${esc(p.head || '')}</b></div></div><div class="vp-nums"></div>`;
    } else {
      el.innerHTML = `<div class="vp-ov"></div><div class="vp-ph">${L.avatar(p.who, 'sm')}<b>${esc(nameOf(id))}</b><small class="vp-time"></small></div>
        <div class="vp-text">${esc(trunc(p.text, 150))}</div>${thumbHTML(p)}<div class="vp-nums"></div><div class="vp-fx"></div>`;
    }
    return el;
  }
  function overlayHTML(id, k, sample, now) {
    const flash = V.flashes.filter(f => f.x.id === id && f.until > now).pop();
    const m = sample.m && sample.m[k];
    const watched = id === sample.c || id === sample.h;
    let meter = '';
    if (m && (watched || flash || m[3] > 0)) {
      const [ico, lab, time, pct, ok] = m;
      meter = `<div class="vp-meter${ok ? ' ok' : ''}${watched ? ' on' : ''}"><span>${esc(ico)} ${esc(lab)}</span><b>${esc(time)} · ${pct}%</b><div class="vp-mbar"><i style="width:${pct}%"></i></div>
        ${flash ? `<div class="vp-pushed">✓ PUSHED TO THE ALGORITHM</div><div class="vp-msg">${esc(flash.x.msg || SIGNAL_LABEL[flash.x.type] || flash.x.type)}</div>` : ''}</div>`;
    }
    let fx = '';
    if (flash) {
      const x = flash.x;
      if (x.type === 'comment' && x.detail) fx = `<div class="vp-bubble">💬 Theo: “${esc(trunc(x.detail, 70))}”</div>`;
      else if (x.type === 'react' || x.type === 'creact') fx = `<div class="vp-burst">${(EMO[x.detail] || '👍').repeat(3)}</div>`;
      else if (x.type === 'glance') fx = '<div class="vp-bubble">👀 checked who liked it</div>';
      else if (x.type === 'open' || x.type === 'thread') fx = '<div class="vp-bubble">💬 opened the comments</div>';
    }
    return [meter, fx, watched];
  }

  function vDraw(force) {
    const now = performance.now(), el = root();
    if (!el.querySelector('.vp')) return;
    const seg = vStageAt(V.T), stageNo = seg ? seg.s : 1;
    const sample = V.iTl >= 0 ? V.tl[V.iTl] : { v: [], m: [], n: [] };
    const ord = V.iOrd >= 0 ? V.orders[V.iOrd] : (V.orders[0] || { seq: [], sc: [] });
    const seq = ord.seq, pos = new Map(seq.map((id, i) => [id, i]));
    const X = V.x || {};

    /* ---- Theo's screen ---- */
    const idxs = sample.v.map((id, k) => k).filter(k => L.getItem(sample.v[k]));
    idxs.sort((a, b) => (pos.has(sample.v[a]) ? pos.get(sample.v[a]) : 1e9) - (pos.has(sample.v[b]) ? pos.get(sample.v[b]) : 1e9));
    const show = idxs.slice(0, CARD_MAX), vis = show.map(k => sample.v[k]);
    const first = vis.length && pos.has(vis[0]) ? pos.get(vis[0]) : 0;
    el.querySelector('.vp-above').textContent = sample.th ? '💬 the comment thread is open' : first > 0 ? `↑ ${first} post${first === 1 ? '' : 's'} above` : '';
    const cardsEl = el.querySelector('.vp-cards');
    V.cards.forEach((c, id) => { if (!vis.includes(id)) { c.remove(); V.cards.delete(id); } });
    show.forEach((k, i) => {
      const id = sample.v[k];
      let c = V.cards.get(id);
      if (!c) { c = cardEl(id); V.cards.set(id, c); }
      if (cardsEl.children[i] !== c) cardsEl.insertBefore(c, cardsEl.children[i] || null);
      const [meter, fx, watched] = overlayHTML(id, k, sample, now);
      set(c.querySelector('.vp-ov'), meter);
      set(c.querySelector('.vp-fx'), fx);
      c.classList.toggle('watched', !!watched);
      const n = sample.n && sample.n[k], rank = pos.has(id) ? pos.get(id) + 1 : null, sc = rank ? ord.sc[rank - 1] : null;
      set(c.querySelector('.vp-nums'), (n ? `<span>👍 ${fmt(n[0])}</span><span>💬 ${fmt(n[1])}</span><span>↗ ${fmt(n[2])}</span>` : '') + (rank ? `<span class="vp-rk">#${rank}${sc != null ? ` · score ${sc}` : ''}</span>` : ''));
      if (n) set(c.querySelector('.vp-time'), esc(n[3]));
    });
    const bn = (X.bn || []).filter(b => !/^Theo:/.test(b));
    set(el.querySelector('.vp-banners'), bn.map(b => `<div class="vp-banner">${esc(trunc(b, 70))}</div>`).join(''));
    // sidebar ads, and why Lens picked them
    // (kept as elements and only their text updated, so the timers ticking don't restart the fade-in)
    const saEl = el.querySelector('.vp-sideads'), side = X.side || [], sideKeys = new Set(side.map(x => x[0]));
    V.side = V.side || new Map();
    V.side.forEach((n, k) => { if (!sideKeys.has(k)) { n.remove(); V.side.delete(k); } });
    side.forEach(([k, sc, best, s], i) => {
      let n = V.side.get(k);
      if (!n) {
        const a = L.postAds[k] || {};
        n = document.createElement('div'); n.className = 'vp-sa fresh'; setTimeout(() => n.classList.remove('fresh'), 500);
        n.innerHTML = `<div class="vp-saart" style="background:linear-gradient(120deg,${(a.bg || ['#555', '#888']).join(',')})">${a.art || ''} <b>${esc(a.brand || '')}</b></div><small></small>`;
        V.side.set(k, n);
      }
      if (saEl.children[i] !== n) saEl.insertBefore(n, saEl.children[i] || null);
      set(n.querySelector('small'), s > 0 ? `Because you looked at <b>${esc(shortOf(best))}</b> for <b>${s}s</b>` : 'Suggested for you');
    });
    saEl.classList.toggle('empty', !side.length);
    // top bar: search, bell, streak, typing, dialogs
    const search = V.flashes.filter(f => f.x.type === 'search' && f.until > now).pop();
    const sb = el.querySelector('.vp-search');
    const sbText = search ? `🔍 “${search.x.detail}” → #GagaGate` : 'Search';
    if (sb.textContent !== sbText) sb.textContent = sbText;
    sb.classList.toggle('on', !!search);
    el.querySelector('.vp-bell i').textContent = X.bell ? X.bell : '';
    el.querySelector('.vp-streak').hidden = !(X.s7 && X.s7[6]);
    const ty = el.querySelector('.vp-typing'); ty.hidden = !sample.ty; if (sample.ty) set(ty, `⌨ Theo is typing: “${esc(sample.ty)}”<small>every keystroke is saved, even the ones deleted</small>`);
    const md = el.querySelector('.vp-modal'); md.hidden = !sample.md; if (sample.md) set(md, `<div>${esc(sample.md)}</div>`);
    V.flashes = V.flashes.filter(f => f.until > now);
    V.toasts = V.toasts.filter(t => t.until > now);
    const tw = el.querySelector('.vp-toasts');
    [...tw.children].forEach(n => { if (!V.toasts.some(t => t.el === n)) n.remove(); });
    V.toasts.forEach((t, i) => {
      if (!t.el) { t.el = document.createElement('div'); t.el.className = 'vp-toast'; t.el.textContent = `${t.e.icon} ${trunc(t.e.text, 90)}`; }
      if (tw.children[i] !== t.el) tw.insertBefore(t.el, tw.children[i] || null);
    });
    set(el.querySelector('.vp-scroll'), `scrolled ${fmt(sample.y || 0)}px${sample.c ? ` · centred: ${esc(trunc(shortOf(sample.c), 22))}` : ' · scrolling'}${sample.h ? ` · pointer on: ${esc(trunc(shortOf(sample.h), 22))}` : ''}`);

    /* ---- the rest of the feed, zoomed out, reordering underneath ---- */
    const last = vis.length ? Math.max(...vis.map(id => pos.has(id) ? pos.get(id) : -1)) : -1;
    const below = seq.slice(last + 1, last + 1 + ROWS), keep = new Set(below), rowsEl = el.querySelector('.vp-rows');
    V.rows.forEach((r, id) => { if (!keep.has(id)) { V.rows.delete(id); r.classList.add('out'); setTimeout(() => r.remove(), 600); } });
    below.forEach((id, i) => {
      let r = V.rows.get(id);
      if (!r) {
        const p = L.getItem(id) || {}, ad = id.startsWith('ad:');
        r = document.createElement('div');
        r.className = 'vp-row in vp-' + catOf(id);
        r.style.setProperty('--c', CAT_VAR[catOf(id)]);
        r.innerHTML = `<i></i><em></em><b>${esc(nameOf(id))}</b><span>${esc(trunc(ad ? (p.brand + ': ' + p.head) : p.text, 80))}</span><u></u>`;
        r.style.transform = `translateY(${(i + 4) * ROW_H}px)`;
        rowsEl.append(r); V.rows.set(id, r);
        requestAnimationFrame(() => r.classList.remove('in'));
      }
      const at = last + 1 + i;
      set(r.querySelector('em'), '#' + (at + 1));
      set(r.querySelector('u'), ord.sc[at] != null ? String(ord.sc[at]) : '');
      const y = `translateY(${i * ROW_H}px)`;
      if (r._y !== y) { r._y = y; requestAnimationFrame(() => { r.style.transform = y; }); }
    });

    /* ---- Lens's side ---- */
    if (V.stage !== stageNo || force) {
      V.stage = stageNo;
      const rv = L.reveal[stageNo];
      el.querySelector('.vp-stage').innerHTML = `<span class="rp-st">Stage ${stageNo}</span>`;
      const cap = el.querySelector('.vp-cap');
      cap.innerHTML = `<small>What this really is</small><b>${esc(rv.name)}</b><p>${esc(rv.line)}</p>`;
      cap.classList.remove('pop'); void cap.offsetWidth; cap.classList.add('pop');
    }
    const counts = { other: 0, story: 0, teacher: 0, ad: 0 };
    seq.forEach(id => { const k = catOf(id); counts[k] = (counts[k] || 0) + 1; });
    const s7 = X.s7;
    set(el.querySelector('.vp-gauges'), [
      [counts.other, 'everyday posts in the feed', 'grey'],
      [counts.story + counts.teacher, 'posts about Theo & gagaball', 'hot'],
      [(X.share != null ? X.share : 0) + '%', 'Lens’s guess Theo wants #GagaGate', 'hot'],
      [stageNo === 1 ? '90s' : stageNo >= 6 ? '0s' : (X.thr != null ? X.thr + 's' : '–'), stageNo === 1 ? 'on screen to count as interest' : 'pause needed to count as interest', ''],
      [X.cf || 0, 'signals counted', ''],
      [X.keys || 0, 'keystrokes recorded', ''],
      ...(s7 ? [[s7[0], 'notifications sent', 'hot'], [s7[4], 'auto-pushes, nobody touching', 'hot'], [s7[1], 'video replays (autoplay)', ''], [s7[3], 'posts loaded by the endless feed', ''], [s7[5], 'tries to log off', '']] : []),
    ].map(([b, s, c]) => `<div class="vp-g ${c}"><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join(''));
    const ints = Object.entries(X.i || {}).sort((a, b) => b[1] - a[1]).slice(0, 10), maxI = Math.max(1, ...ints.map(x => x[1]));
    set(el.querySelector('.vp-int'), ints.map(([t, v]) => `<div class="vp-ib${STORY_T[t] ? ' hot' : ''}"><span>#${esc(t)}</span><div><i style="width:${Math.round(v / maxI * 100)}%"></i></div><b>${v.toFixed(2)}</b></div>`).join(''));
    set(el.querySelector('.vp-rank'), (X.rk || []).length ? `<table><tr><th></th><th>interest</th><th>engage</th><th>react</th><th>score</th></tr>${X.rk.map(([id, m, e, r, s]) => `<tr class="vp-${catOf(id)}"><td>${esc(trunc(shortOf(id), 20))}</td><td>${m.toFixed(2)}</td><td>${e.toFixed(2)}</td><td>${r ? (r > 0 ? '+' : '') + r.toFixed(1) : '·'}</td><td><b>${s.toFixed(2)}</b></td></tr>`).join('')}</table>` : '<p class="vp-none">nothing on screen</p>');
    set(el.querySelector('.vp-ads'), (X.ads || []).map(([a, s], i) => { const ad = L.ads.find(z => z.id === a) || {}; return `<div class="vp-ar${i === 0 ? ' win' : ''}"><span>${ad.art || ''} ${esc(ad.brand || a)}</span><em>$${(ad.bid || 0).toFixed(2)} bid</em><b>${s.toFixed(2)}</b></div>`; }).join('') || '<p class="vp-none">no ads yet</p>');
    set(el.querySelector('.vp-log'), '<small>Signals pushed to the algorithm</small>' + (V.log.length ? V.log.map(x => `<div class="vp-logrow"><span class="ok">✓</span> <b>${esc(SIGNAL_LABEL[x.type] || x.type)}${x.type === 'react' || x.type === 'creact' ? ' ' + (EMO[x.detail] || '') : ''}</b> <em>${esc(trunc(x.type === 'search' ? '“' + x.detail + '”' : shortOf(x.id || ''), 24))}</em>${x.amt != null ? ` <span class="vp-amt">+${x.amt} ${esc((x.topics || []).map(t => '#' + t).join(' '))}</span>` : ''}<div class="vp-lmsg">${esc(x.msg || '')}</div></div>`).join('') : '<div class="vp-logrow none">nothing yet: Lens is just watching</div>'));

    el.querySelector('.vp-head').style.left = (V.total ? V.T / V.total * 100 : 0) + '%';
    const sp = vSpeed(V.T), ck = `${clock(V.T)} / ${clock(V.total)} · ${sp === 1 ? '1× slow motion' : sp + '×'}`;
    const ckEl = el.querySelector('.vp-clock'); if (ckEl.textContent !== ck) ckEl.textContent = ck;
    ckEl.classList.toggle('slow', sp === 1);
  }
  function vNextStage() { const g = V.segs.find(x => x.off > V.T + 500); if (g) { vSeek(g.off); if (!V.raf) V.raf = requestAnimationFrame(vFrame); return true; } return false; }
  function vPrevStage() {
    const cur = vStageAt(V.T); if (!cur) return false;
    const i = V.segs.indexOf(cur);
    if (V.T - cur.off > 8000) vSeek(cur.off);          // back to the start of this stage
    else if (i > 0) vSeek(V.segs[i - 1].off);           // or the one before
    else return false;
    if (!V.raf) V.raf = requestAnimationFrame(vFrame);
    return true;
  }

  /* ================= The feed Theo would have had =================
     The same posts and the same formula, ranked as if Theo had scrolled past everything without stopping. */
  function withoutHTML() {
    let last = null;
    for (let s = 7; s >= 1 && !last; s--) { const r = S.rec[s]; if (r && r.orders && r.orders.length) last = r.orders[r.orders.length - 1]; }
    const got = last ? last.seq.map((id, i) => [id, last.sc ? last.sc[i] : null]) : [];
    const would = L.neutralFeed(), N = 12;
    const tally = (rows) => { const c = { other: 0, story: 0, teacher: 0, ad: 0 }; rows.slice(0, N).forEach(([id]) => { c[catOf(id)]++; }); return c; };
    const a = tally(got), b = tally(would);
    const firstPost = (rows) => { const r = rows.find(([id]) => !id.startsWith('ad:')); return r ? (L.getItem(r[0]) || {}).text || '' : '–'; };
    const firstAd = (rows) => { const r = rows.find(([id]) => id.startsWith('ad:')); const ad = r && L.getItem(r[0]); return ad ? `${ad.art} ${ad.brand}` : '–'; };
    const row = ([id, sc], i, d) => { const p = L.getItem(id) || {}, ad = id.startsWith('ad:'); return `<div class="wo-row vp-${catOf(id)}" style="--c:${CAT_VAR[catOf(id)]};animation-delay:${(d + i * 0.07).toFixed(2)}s"><i></i><em>#${i + 1}</em><b>${esc(nameOf(id))}</b><span>${esc(trunc(ad ? (p.brand + ': ' + p.head) : p.text, 70))}</span><u>${sc != null ? sc : ''}</u></div>`; };
    const fact = (label, x, y) => `<div class="wo-fact"><span>${label}</span><b class="l">${x}</b><b class="r">${y}</b></div>`;
    return `<div class="rp-chapter wo"><div class="rp-head"><span class="rp-st">The other feed</span><span class="rp-goal">Same posts. Same formula. The only difference is what Theo did.</span></div>
      <div class="wo-facts"><div class="wo-fact head"><span></span><b class="l">What Lens showed Theo</b><b class="r">If he’d scrolled past everything</b></div>
        ${fact('Everyday posts in the first 12', a.other, b.other)}
        ${fact('Posts about Theo &amp; gagaball in the first 12', a.story + a.teacher, b.story + b.teacher)}
        ${fact('The #1 post', esc(trunc(firstPost(got), 30)), esc(trunc(firstPost(would), 30)))}
        ${fact('The top ad', esc(firstAd(got)), esc(firstAd(would)))}</div>
      <div class="wo-cols"><section><h3>What Lens showed Theo <small>after everything he looked at, reacted to and typed</small></h3>${got.slice(0, N).map((r, i) => row(r, i, 0.3)).join('')}</section>
        <section><h3>If Theo had scrolled past everything <small>no pauses, no reactions, no comments, no searches</small></h3>${would.slice(0, N).map((r, i) => row(r, i, 1.6)).join('')}</section></div></div>`;
  }

  /* ================= Chapters ================= */
  function render() {
    vStop();
    const c = chapters[idx], el = root();
    S.replay = idx; L.save();
    let html = '';
    switch (c.k) {
      case 'intro': {
        const total = [1, 2, 3, 4, 5, 6, 7].reduce((a, s) => a + (S.rec[s] ? S.rec[s].active : 0), 0);
        html = `<div class="rp-hero"><div class="rp-logo">Your Lens Replay ✨</div><p>${minsec(total)} as Theo.<br>Here it is again at ${SPEED}× speed (slowing down for the big moments), with everything Lens was doing behind the screen.</p><small>Press → to play.</small></div>`;
        break;
      }
      case 'video':
        html = videoHTML();
        break;
      case 'without':
        html = withoutHTML();
        break;
      case 'totals': {
        let total = 0, story = 0, ads = 0, adScreen = 0;
        for (let s = 1; s <= 7; s++) {
          const r = S.rec[s]; if (!r) continue;
          total += r.active;
          for (const [id, a] of Object.entries(r.att)) { const c2 = catOf(id); if (c2 === 'story') story += a.focus; if (c2 === 'ad') { ads += a.focus; adScreen += a.screen; } }
        }
        const earned = (ads / 1000) * 0.004 + (adScreen / 1000) * 0.0015;
        html = `<div class="rp-chapter"><div class="rp-head"><span class="rp-st">Totals</span><span class="rp-goal">Theo’s time on Lens</span></div>
          <div class="rp-tiles four"><div class="rp-tile"><b>${minsec(total)}</b><span>on Lens</span></div><div class="rp-tile"><b>${minsec(story)}</b><span>looking at posts about Theo</span></div>
          <div class="rp-tile"><b>${minsec(adScreen)}</b><span>with ads on screen</span></div><div class="rp-tile hot"><b>$${earned.toFixed(2)}</b><span>Lens earned from Theo’s attention (about)</span></div></div></div>`;
        break;
      }
      case 'learned': {
        const sig = S.signals, count = (t) => sig.filter(x => x.type === t).length;
        const reacts = sig.filter(x => x.type === 'react').map(x => `${EMO[x.detail] || ''} on ${shortOf(x.id)}`);
        const creacts = sig.filter(x => x.type === 'creact').length;
        if (creacts) reacts.push(`${creacts} on comments`);
        let longest = null;
        Object.entries(S.it).forEach(([id, x]) => { if (x.pause && (!longest || x.pause > longest[1])) longest = [id, x.pause]; });
        const dwell = sig.find(x => x.type === 'dwell' && x.id === 'french');
        const ads = L.ads.map(a => [a, a.bid * (0.2 + Object.entries(a.topics).reduce((m, [t, w]) => m + (S.interest[t] || 0) * w, 0))]).sort((a, b) => b[1] - a[1]).slice(0, 3).map(x => x[0].brand);
        const deleted = S.reply.drafts.filter(d => d !== S.reply.text).length;
        const rows = [
          ['dwell', dwell ? `${secs(dwell.t)}s on Mr. French’s post` : 'Mr. French’s post'],
          ['pause', `×${count('pause')} on posts${longest ? ` (longest: ${secs(longest[1])}s on “${shortOf(longest[0])}”)` : ''}`],
          ['react', reacts.length ? reacts.join(', ') : 'none'],
          ['typing', `${S.reply.keys + (S.inlineKeys || 0)} keystrokes, ${S.reply.drafts.length} drafts saved${deleted ? ` (incl. ${deleted} deleted)` : ''}`],
          ['comment', [S.reply.posted ? `1 reply → quoted, ${S.reply.after} replies` : '', ...Object.entries(S.mine || {}).map(([pid, list]) => `${list.length} on “${shortOf(pid)}”`)].filter(Boolean).join(', ') || 'none'],
          ['glance', `checked who liked it ×${S.likesOpened}`],
          ['search', S.searches.length ? S.searches.map(q => `“${q}” → shown #GagaGate`).join(', ') : 'none'],
          ['stay', `tried to leave ×${S.s7.attempts}, pulled back ×${S.s7.pulls}`],
        ];
        html = `<div class="rp-chapter"><div class="rp-head"><span class="rp-st">What Lens learned</span><span class="rp-goal">@theo</span></div>
          <pre class="rp-log">${rows.map(([k, v]) => `<span class="ok">✓</span> ${k.padEnd(8)} ${esc(v)}`).join('\n')}\n\n<b>interests: #GagaGate ${Math.round(L.storyShare() * 100)}%</b>\n<b>sells well to: ${esc(ads.join(', '))}</b></pre></div>`;
        break;
      }
      case 'reveal': {
        const r = L.reveal[c.s];
        html = `<div class="rp-chapter rp-revealbig"><div class="rp-head"><span class="rp-st">Stage ${c.s}</span><span class="rp-goal">What this really is</span></div>
          <div class="rp-name">${esc(r.name)}</div><p class="rp-line2">${esc(r.line)}</p>
          <div class="rp-truth big"><small>What was true</small><p>${esc(r.truth)}</p></div></div>`;
        break;
      }
      case 'line':
        html = `<div class="rp-line">Lens can’t tell the difference between <b>interested</b> and <b>upset</b>.</div>`;
        break;
      case 'off': {
        const layers = ['Notifications & the endless feed', 'The orange bubble', 'Fake numbers & checkmarks', 'Quote-posts & comments', 'Reactions & ranking', 'Louder reposts', 'Hidden meters'];
        html = `<div class="rp-off"><div class="rp-layers">${layers.map((l, i) => `<div class="rp-layer" style="animation-delay:${0.5 + i * 0.55}s">${esc(l)}</div>`).join('')}</div>
          <div class="rp-true" style="animation-delay:${0.8 + layers.length * 0.55}s"><article class="item post"><div class="ph">${L.avatar('french')}<div class="who"><span class="name">Mr. French</span><div class="meta">@mrfrench · Today · 7:52 AM</div></div></div>
          <div class="ptext">${esc(L.posts.find(p => p.id === 'french').text)}</div><div class="pimg">${L.sceneSVG('full')}</div><div class="pf"><div class="counts"><span class="likes">❤️ <b>23</b></span></div></div></article>
          <p class="rp-caption">This is what actually happened.</p></div></div>`;
        break;
      }
      case 'close':
        html = `<div class="rp-hero"><div class="rp-logo small">Everything Lens recorded about “Theo” stayed on this laptop.</div><p>Real apps send it to their servers.</p>
          <small>Everyone in this story is made up. Student photos are stock images from Pexels.</small></div>`;
        break;
      case 'q':
        html = `<div class="rp-q"><small>Talk about it · ${c.i + 1} of ${L.questions.length}</small><p>${esc(L.questions[c.i])}</p></div>`;
        break;
    }
    el.innerHTML = `<div class="rp-wrap${c.k === 'video' ? ' rp-video' : ''}">${html}</div><div class="rp-nav"><button type="button" data-rp="prev" aria-label="Previous">‹</button>
      <span>${idx + 1} / ${chapters.length}</span><button type="button" data-rp="next" aria-label="Next">›</button></div>`;
    if (c.k === 'video') videoMount(); else V = null;
  }

  const onVideo = () => chapters[idx] && chapters[idx].k === 'video' && V;
  function next() { if (onVideo() && vNextStage()) return; if (idx < chapters.length - 1) { idx++; render(); } }
  function prev() { if (onVideo() && vPrevStage()) return; if (idx > 0) { idx--; render(); } }
  function play() { if (onVideo()) vToggle(); else if (chapters[idx] && chapters[idx].k === 'intro') next(); }

  // Buttons and swipes, for screens without a keyboard.
  root().addEventListener('click', e => { const b = e.target.closest('[data-rp]'); if (b) ({ prev, next })[b.dataset.rp](); });
  let sx = null, sy = null;
  root().addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  root().addEventListener('touchend', e => {
    if (sx == null) return;
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5 && !e.target.closest('.vp-track')) (dx < 0 ? next : prev)();
    sx = null;
  }, { passive: true });

  L.Replay = {
    open(at) {
      build();
      idx = Math.min(at || 0, chapters.length - 1);
      L.setStage(8);
      $('#loggedout').hidden = true;
      root().hidden = false;
      render();
    },
    next, prev, play,
    jumpToEnd() { const i = chapters.findIndex(c => c.k === 'off'); if (i >= 0) { idx = i; render(); } },
    close() { vStop(); root().hidden = true; },
  };
})();
