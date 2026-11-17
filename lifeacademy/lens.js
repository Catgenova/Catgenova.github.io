/* Lens engine: state, recorder, ranker, signal meters, the seven stages, and presenter keys.
   Nothing leaves this browser. State lives in localStorage so a refresh picks up where the class left off. */
'use strict';
(function () {
  const L = window.LENS;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtN = (n) => n >= 10000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K' : n.toLocaleString('en-US');
  const mmss = (ms) => { const s = Math.floor(ms / 1000); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  const KEY = 'lens-lifeacademy-v1';
  const W = { like: 1, love: 2, laugh: 2, sad: 3, dislike: 4, angry: 5, notInterested: -1 };
  const EMO = { like: '👍', love: '❤️', laugh: '😂', sad: '😢', dislike: '👎', angry: '😡' };
  const RNAME = { like: 'Like', love: 'Love', laugh: 'Haha', sad: 'Cry', dislike: 'Dislike', angry: 'Angry' };
  const POSTS = Object.fromEntries(L.posts.map(p => [p.id, p]));
  const ADS = Object.fromEntries(L.ads.map(a => [a.id, a]));
  const STAGE2_ORDER = ['french', 'cat', 'maya', 'volcano', 'tR', 'jaxon', 'band', 'tE', 'math', 'tM', 'soccer', 'gossip', 'tA', 'dragon', 'tT', 'tC', 'tH'];

  /* ---------------- state ---------------- */
  function fresh() {
    return {
      v: 1, stage: 0, interest: { ...L.startInterest }, confirmed: 0,
      order: [], adOrder: [], it: {}, extra: {}, signals: [],
      reply: { text: '', keys: 0, drafts: [], posted: false, chunk: '', after: 0, prev: '' },
      thread: { opened: 0, count: 12 }, more3: false, likesOpened: 0, searches: [],
      s7: { feed: true, notif: true, autoplay: true, streak: true, pulls: 0, attempts: 0, dialogs: [], notifCount: 0, loads: 0, pausedUntil: 0, autoCount: 0, videoPlays: 0, loggedOut: false },
      rec: {}, stageConfirmed: {}, muted: false, replay: 0, done: false,
      s1: { shown: false, shownAt: 0, sent: 0, clicks: 0 },
      bell: { unread: 0, items: [] },
      clock: 0, landed: {},
      mine: {}, inlineKeys: 0, creact: {},
    };
  }
  let S = load() || fresh();
  S.s1 = S.s1 || { shown: true, shownAt: 0, sent: 0, clicks: 0 };
  S.bell = S.bell || { unread: 0, items: [] };
  S.clock = S.clock || 0; S.landed = S.landed || {};
  S.mine = S.mine || {}; S.inlineKeys = S.inlineKeys || 0; S.creact = S.creact || {};
  let snaps = loadSnaps();
  function load() { try { const s = JSON.parse(localStorage.getItem(KEY)); return s && s.v === 1 ? s : null; } catch (e) { return null; } }
  function loadSnaps() { try { return JSON.parse(localStorage.getItem(KEY + '-snaps')) || {}; } catch (e) { return {}; } }
  let saveTimer = 0;
  function save(now) {
    const go = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage full or blocked: keep going */ } };
    // Throttle, not debounce: the 250 ms heartbeat calls this constantly, so a pending save must not be pushed back.
    if (now) { clearTimeout(saveTimer); saveTimer = 0; go(); }
    else if (!saveTimer) saveTimer = setTimeout(() => { saveTimer = 0; go(); }, 1000);
  }
  function saveSnaps() { try { localStorage.setItem(KEY + '-snaps', JSON.stringify(snaps)); } catch (e) {} }
  L.getState = () => S;

  /* ---------------- items ---------------- */
  function getItem(id) {
    if (id.startsWith('ad:')) return ADS[id.slice(3)];
    return POSTS[id] || S.extra[id];
  }
  function it(id) { return S.it[id] || (S.it[id] = { screen: 0, pause: 0, prog: 0, done: 0, react: null, gone: 0, auto: 0 }); }
  L.getItem = getItem;

  function eligible(id) {
    const p = getItem(id);
    if (!p || it(id).gone) return false;
    if (p.stage > S.stage) return false;
    if (p.stage === 3 && !S.more3) return false;
    if (id === 'french' && S.stage === 1 && !S.s1.shown) return false;
    if (S.stage >= 6 && !(p.topics.gaga || p.topics.theo)) return false;
    return true;
  }
  function eligibleAds() {
    return L.ads.filter(a => a.stage <= S.stage && (S.stage < 6 || a.topics.gaga || a.topics.theo || a.topics.drama || a.topics.stress)).map(a => a.id);
  }
  function feedSequence() {
    const posts = S.order.filter(eligible);
    if (S.stage < 2) return posts;
    const seq = []; let ai = 0;
    posts.forEach((id, i) => {
      seq.push(id);
      if ((i === 1 || (i > 1 && (i - 1) % 4 === 0)) && ai < S.adOrder.length) seq.push('ad:' + S.adOrder[ai++]);
    });
    return seq;
  }
  L.feedSequence = feedSequence;

  /* ---------------- ranking ---------------- */
  function match(topics) { let m = 0; for (const t in topics) m += (S.interest[t] || 0) * topics[t]; return m; }
  function reactMix(id) {
    const p = getItem(id) || {}, r = p.r || { like: 1 };
    const m = { like: 0, love: 0, laugh: 0, sad: 0, dislike: 0, angry: 0 };
    for (const k in r) { if (k === 'like') { m.love += Math.round(r.like * 0.45); m.like += r.like - Math.round(r.like * 0.45); } else if (m[k] != null) m[k] += r[k]; }
    const mine = it(id).react; if (mine && m[mine] != null) m[mine] += 1000; // Theo's reaction always shows in the icons
    return m;
  }
  function reactIcons(id) {
    const m = reactMix(id);
    return Object.keys(m).filter(k => m[k] > 0).sort((a, b) => m[b] - m[a]).slice(0, 3).map(k => EMO[k]).join('');
  }
  function reactsOf(id) {
    const p = getItem(id), r = Object.assign({ like: 0, laugh: 0, sad: 0, dislike: 0, angry: 0 }, p.r || {});
    const mine = it(id).react; if (mine && r[mine] != null) r[mine]++;
    return r;
  }
  function engagement(id) {
    const p = getItem(id), r = reactsOf(id);
    let e = 0; for (const k in r) e += r[k] * (W[k] || 0);
    return e + (p.shares || 0) * 3 + (p.comments || 0) * 2 + (id === 'gossip' ? S.thread.count * 2 : 0);
  }
  function score(id) {
    let s = 3 * match(getItem(id).topics) + Math.log10(1 + engagement(id)) * 0.9;
    const mine = it(id).react; if (mine) s += 2 + W[mine] * 0.6;
    if (id === 'quote') s += 4;
    return s;
  }
  function adScore(id) { const a = ADS[id]; return a.bid * (0.2 + match(a.topics)); }
  L.score = score;

  function rerank(mode) {
    // Add newly eligible posts to the end, then sort. 'below' only reorders what the class hasn't scrolled to yet.
    const all = L.posts.map(p => p.id).concat(Object.keys(S.extra));
    all.forEach(id => { if (!S.order.includes(id) && eligible(id)) S.order.push(id); });
    let fixed = 0, fixedAds = 0;
    if (mode === 'below') {
      const seq = feedSequence();
      let last = -1;
      seq.forEach((id, i) => { const n = nodes.get(id); if (n && n.isConnected && n.getBoundingClientRect().top < innerHeight) last = i; });
      const upto = seq.slice(0, last + 1);
      fixed = upto.filter(id => !id.startsWith('ad:')).length;
      fixedAds = upto.length - fixed;
      const vis = S.order.filter(eligible);
      const head = vis.slice(0, fixed);
      const tail = S.order.filter(id => !head.includes(id)).sort((a, b) => score(b) - score(a));
      S.order = head.concat(tail);
    } else {
      S.order.sort((a, b) => score(b) - score(a));
      if (S.extra.video) S.order = ['video'].concat(S.order.filter(id => id !== 'video'));
    }
    const ads = eligibleAds();
    const keep = S.adOrder.slice(0, fixedAds).filter(id => ads.includes(id));
    S.adOrder = keep.concat(ads.filter(id => !keep.includes(id)).sort((a, b) => adScore(b) - adScore(a)));
    recordOrder();
  }

  /* ---------------- recorder ---------------- */
  function rec(n) {
    n = n || S.stage;
    return S.rec[n] || (S.rec[n] = { active: 0, att: {}, orders: [], tl: [], i0: { ...S.interest }, i1: null, early: false, sig0: S.signals.length, sig1: null });
  }
  function att(id) { const r = rec(); return r.att[id] || (r.att[id] = { screen: 0, focus: 0, hover: 0 }); }
  function recordOrder() {
    if (S.stage < 1 || S.stage > 7) return;
    const r = rec();
    r.orders.push({ t: r.active, seq: feedSequence().slice(0, 40) });
    if (r.orders.length > 400) r.orders.splice(1, 1);
  }
  function closeRec(n) {
    const r = rec(n);
    r.i1 = { ...S.interest };
    r.sig1 = S.signals.length;
    r.orders.push({ t: r.active, seq: feedSequence().slice(0, 40) });
  }
  function storyShare(i) {
    i = i || S.interest;
    let story = 0, total = 0;
    for (const t in i) { total += i[t]; if (t === 'gaga' || t === 'theo' || t === 'drama') story += i[t]; }
    return total ? story / total : 0;
  }
  L.storyShare = storyShare;

  /* ---------------- sound ---------------- */
  let actx = null;
  function beep(kind) {
    if (S.muted) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const notes = kind === 'ding' ? [[880, 0, .18], [1320, .12, .3]] : kind === 'tick' ? [[1240, 0, .07]] : [[520, 0, .12]];
      notes.forEach(([f, at, dur]) => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, actx.currentTime + at);
        g.gain.exponentialRampToValueAtTime(0.2, actx.currentTime + at + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + at + dur);
        o.connect(g).connect(actx.destination); o.start(actx.currentTime + at); o.stop(actx.currentTime + at + dur + 0.05);
      });
    } catch (e) {}
  }

  /* ---------------- transitions ---------------- */
  let skipping = false;
  const wait = (ms) => new Promise(res => {
    if (skipping) return res();
    const t0 = Date.now();
    const iv = setInterval(() => { if (skipping || Date.now() - t0 >= ms) { clearInterval(iv); res(); } }, 40);
  });

  /* ---------------- rendering ---------------- */
  const nodes = new Map();
  const feedEl = $('#feed');

  function personName(key) { const p = L.people[key]; return p ? p.name : key; }
  function verifiedOn(id) { const p = getItem(id); return p.verified === 'stage5' && S.stage >= 5; }
  /* Reactions and comments come fast right after a post lands, then slow down: target × (1 − e^(−age/τ)).
     A post that lands during the session starts at zero. Older posts already have most of theirs. */
  const TAU_R = 22000, TAU_C = 34000;
  function isOld(id) { const p = getItem(id); return !p || (!p.live && ((p.stage === 1 && id !== 'french') || /^Yesterday/.test(p.time || ''))); }
  function landedAt(id) {
    if (S.landed[id] == null) {
      const p = getItem(id) || {};
      // Reposts of Mr. French's photo were posted a little after him: a fraction of the time since his post.
      const ago = typeof p.live === 'number' && S.landed.french != null ? Math.max(10000, (S.clock - S.landed.french) * p.live) : 0;
      S.landed[id] = S.clock - (isOld(id) ? Math.min(150000, 45000 + Math.max(0, 1435 - (p.min || 0)) * 2000) : ago);
    }
    return S.landed[id];
  }
  function grow(id, target, tau) { const age = Math.max(0, S.clock - landedAt(id)); return Math.round(target * (1 - Math.exp(-age / tau))); }
  function relTime(id) {
    const p = getItem(id);
    if (isOld(id)) return p.time;
    const m = Math.floor((S.clock - landedAt(id)) / 60000);
    return m < 1 ? 'Just now' : m < 60 ? m + 'm' : Math.floor(m / 60) + 'h';
  }
  function likeCount(id) {
    const p = getItem(id);
    const target = S.stage >= 5 && p.big ? p.big : Object.values(Object.assign({}, p.r || {})).reduce((a, b) => a + b, 0);
    return grow(id, target, TAU_R) + (it(id).react ? 1 : 0);
  }

  function imgHTML(p) {
    if (!p.img) return '';
    if (p.img.photo) {
      const crop = p.img.photo;
      const grain = crop.startsWith('gossip') ? ' grain' : '';
      return `<div class="pimg${grain}" style="filter:${L.cropFilters[crop] || ''}">${L.sceneSVG(crop)}</div>`;
    }
    if (p.img.video) return `<div class="pimg">${L.crashVideoSVG()}<span class="vid-label">▶ Autoplay · replay #<b class="vplays">${S.s7.videoPlays}</b></span></div>`;
    return `<div class="pimg">${L.cardHTML(p.img.card)}</div>`;
  }

  function meterHTML() {
    return `<div class="meter" aria-hidden="true"><div class="m-top"><span class="m-ico">⏱</span><span class="m-lab">on screen</span><b class="m-time">00:00</b></div>
      <div class="m-bar"><i></i></div><div class="m-sub">sending to algorithm · <b class="m-pct">0%</b></div><div class="m-ok">✓ PUSHED TO ALGORITHM<b class="m-msg"></b></div></div>`;
  }

  function postHTML(id) {
    const p = getItem(id), who = L.people[p.who] || {};
    const repost = p.repost ? `<div class="repost-of">🔁 reposted from @${esc(L.people[getItem(p.repost).who].handle)}</div>` : '';
    const poll = p.poll ? `<div class="poll">${p.poll.map(([t, v]) => `<div><i style="width:${v}%"></i><span>${esc(t)}</span><b>${v}%</b></div>`).join('')}</div>` : '';
    const reacts = Object.keys(EMO).map(k => `<button class="react" data-r="${k}" type="button" aria-label="${RNAME[k]}" title="${RNAME[k]}">${EMO[k]}<span class="w">${RNAME[k]} · weight +${W[k]}</span></button>`).join('');
    return `<article class="item post loud-${p.loud || 0} ${p.img && p.img.video ? 'video-item' : ''}" data-id="${id}">
      ${meterHTML()}
      <div class="ph">${L.avatar(p.who)}<div class="who"><span class="name">${esc(who.name || p.who)}</span><span class="verified${verifiedOn(id) ? ' on' : ''}">✓</span><div class="meta">@${esc(who.handle || p.who)} · <span class="ptime">${esc(relTime(id))}</span></div></div></div>
      ${repost}${p.breaking ? '<div class="breaking">BREAKING</div>' : ''}
      <div class="ptext">${esc(p.text)}</div>${poll}${imgHTML(p)}
      <div class="pf">
        <div class="counts"><span class="likes"><span class="ricons">${reactIcons(id)}</span> <b>${fmtN(likeCount(id))}</b></span><button class="comments-link" type="button">💬 <b class="ccount">${fmtN(commentCount(id))}</b> <span class="cword">${commentCount(id) === 1 ? 'comment' : 'comments'}</span>${id === 'gossip' && S.stage >= 4 ? ' · View all' : ''}</button><span class="shares">🔁 <b class="scount">${fmtN(shareCount(id))}</b></span></div>
        <div class="liked-row"></div>
        <div class="reacts">${reacts}<span class="more"><button type="button" aria-label="More">⋯</button></span></div>
        <div class="pcomments" hidden></div>
      </div>
    </article>`;
  }
  function commentCount(id) { return baseCommentCount(id) + ((S.mine && S.mine[id]) || []).length; }
  function baseCommentCount(id) {
    if (id === 'gossip') return S.thread.count;
    const p = getItem(id);
    if (id === 'french') return grow(id, p.comments, TAU_C) + Math.max(0, S.s1.sent - 1);
    return grow(id, S.stage >= 5 && p.big ? Math.round(p.big / 40) : p.comments || 0, TAU_C);
  }
  function shareCount(id) { const p = getItem(id); return grow(id, S.stage >= 5 && p.big ? Math.round(p.big / 12) : p.shares || 0, TAU_C * 1.3); }

  function adHTML(id) {
    const a = ADS[id.slice(3)];
    return `<article class="item ad" data-id="${id}">${meterHTML()}
      <div class="ad-top"><b>${esc(a.brand)}</b><span>Sponsored</span></div>
      <div class="ad-art" style="background:linear-gradient(120deg,${a.bg[0]},${a.bg[1]})"><span class="em">${a.art}</span><span class="head">${esc(a.head)}</span><span class="cta">${esc(a.cta)}</span></div></article>`;
  }

  function makeNode(id) {
    const n = h(id.startsWith('ad:') ? adHTML(id) : postHTML(id));
    nodes.set(id, n);
    return n;
  }
  function refreshNode(id) {
    const old = nodes.get(id); if (!old) return;
    const hadMeter = old.classList.contains('show-meter');
    const n = h(id.startsWith('ad:') ? adHTML(id) : postHTML(id));
    old.replaceWith(n); nodes.set(id, n);
    if (hadMeter) n.classList.add('show-meter');
    decorate(id, n);
  }
  function decorate(id, n) {
    if (id === 'gossip' && S.stage >= 5) {
      n.querySelector('.liked-row').innerHTML = `<div class="liked-by clickable" data-likers="1"><span class="stack">${L.avatar('maya', 'sm')}${L.avatar('jaxon', 'sm')}${L.avatar(null, 'sm')}</span><span>Liked by <b>maya.k</b> and <b>${(likeCount(id) - 1).toLocaleString('en-US')} others</b></span></div>`;
      n.querySelector('.likes').classList.add('clickable');
    }
    if (it(id).react) { const b = n.querySelector(`.react[data-r="${it(id).react}"]`); if (b) b.classList.add('chosen'); }
    if (S.stage === 6) n.classList.add('pre');
    if (it(id).seen && !id.startsWith('ad:')) n.classList.add('seen');
    if (openComments.has(id)) renderComments(id, n);
    if (id === 'video' && !S.s7.autoplay) n.classList.add('paused');
  }

  function renderFeed(opts) {
    opts = opts || {};
    const seq = feedSequence();
    const first = new Map();
    if (opts.flip) nodes.forEach((n, id) => { if (n.isConnected) first.set(id, n.getBoundingClientRect().top); });
    const keep = new Set(seq);
    nodes.forEach((n, id) => { if (!keep.has(id)) { n.remove(); nodes.delete(id); } });
    let i = 0;
    seq.forEach(id => {
      let n = nodes.get(id);
      const isNew = !n;
      if (!n) { n = makeNode(id); decorate(id, n); }
      if (feedEl.children[i] !== n) feedEl.insertBefore(n, feedEl.children[i] || null);
      if (isNew && opts.arrive) { n.classList.add('arrive'); n.style.animationDelay = (opts.stagger ? Math.min(i, 12) * opts.stagger : 0) + 'ms'; }
      i++;
    });
    while (feedEl.children.length > seq.length) feedEl.lastElementChild.remove();
    if (opts.flip) {
      nodes.forEach((n, id) => {
        if (!first.has(id)) return;
        const dy = first.get(id) - n.getBoundingClientRect().top;
        if (Math.abs(dy) > 2) {
          n.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 700, easing: 'cubic-bezier(.2,.8,.2,1)' });
        }
      });
    }
    renderSidebar();
    renderFoot();
  }

  function renderSidebar() {
    const side = $('#sidebar');
    if (!$('#side-static')) side.innerHTML = '<div id="side-static"></div><div id="side-ads"></div>';
    let html = `<div class="side-card side-me">${L.avatar('theo')}<div><b>Theo</b><br><small>@theo · Life Academy</small></div></div>`;
    if (S.stage >= 5) html += `<div class="side-card"><h3>Trending at Life Academy</h3>
      <div class="trend"><span>#GagaGate 🔥</span><small>48.2K posts</small></div><div class="trend"><span>#LifeAcademyFieldDay</span><small>3.1K</small></div><div class="trend"><span>#PixelQuest</span><small>890</small></div></div>`;
    $('#side-static').innerHTML = html;
    updateSideAds();
  }

  /* Sidebar ads: every post has its own ad. The ads for the posts the class has spent the most time on win the sidebar, live. */
  const sideNodes = new Map();
  let lastSideKey = '';
  function adKeyFor(id) { if (L.postAds[id]) return id; if (/^rc\d/.test(id)) return 'rc'; return null; }
  function updateSideAds() {
    const box = $('#side-ads'); if (!box) return;
    if (S.stage < 1 || S.stage > 7) { box.innerHTML = ''; sideNodes.clear(); lastSideKey = ''; return; }
    const posts = feedSequence().filter(id => !id.startsWith('ad:'));
    const by = new Map();
    posts.forEach((id, i) => {
      const k = adKeyFor(id); if (!k) return;
      const x = it(id), sc = x.screen + 2 * (x.look || 0);
      const cur = by.get(k) || { k, score: 0, best: id, bestScore: -1, pos: i };
      cur.score += sc;
      if (sc > cur.bestScore) { cur.best = id; cur.bestScore = sc; }
      by.set(k, cur);
    });
    const slots = S.stage >= 5 ? 2 : 3;
    const top = Array.from(by.values()).sort((a, b) => b.score - a.score || a.pos - b.pos).slice(0, slots);
    const key = top.map(c => c.k).join(',');
    if (key !== lastSideKey) {
      const first = new Map(); sideNodes.forEach((n, k) => { if (n.isConnected) first.set(k, n.getBoundingClientRect().top); });
      const keep = new Set(top.map(c => c.k));
      sideNodes.forEach((n, k) => { if (!keep.has(k)) { n.remove(); sideNodes.delete(k); } });
      top.forEach((c, i) => {
        let n = sideNodes.get(c.k);
        if (!n) {
          const a = L.postAds[c.k];
          n = h(`<div class="side-card ad-side live" data-k="${c.k}"><div class="ad-top"><b>${esc(a.brand)}</b><span>Sponsored</span></div>
            <div class="ad-art" style="background:linear-gradient(120deg,${a.bg[0]},${a.bg[1]})"><span class="em">${a.art}</span><span class="head">${esc(a.head)}</span><span class="cta">${esc(a.cta)}</span></div>
            <div class="why"></div></div>`);
          sideNodes.set(c.k, n);
          if (lastSideKey) n.classList.add('swap');
        }
        if (box.children[i] !== n) box.insertBefore(n, box.children[i] || null);
      });
      sideNodes.forEach((n, k) => { if (!first.has(k)) return; const dy = first.get(k) - n.getBoundingClientRect().top; if (Math.abs(dy) > 2) n.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 600, easing: 'cubic-bezier(.2,.8,.2,1)' }); });
      if (lastSideKey && S.stage <= 7) { const r = rec(); (r.side = r.side || []).push({ t: r.active, ids: top.map(c => c.best) }); }
      lastSideKey = key;
    }
    top.forEach(c => {
      const n = sideNodes.get(c.k); if (!n) return;
      const secs = Math.round(it(c.best).screen / 1000);
      n.querySelector('.why').innerHTML = secs > 0 ? `Because you looked at <b>${esc(getItem(c.best).short)}</b> for <b>${secs}s</b>` : 'Suggested for you';
    });
  }

  function renderFoot() {
    const foot = $('#feedfoot');
    if (S.stage === 1) { foot.innerHTML = '<div class="caughtup">That\'s everything for now.</div>'; return; }
    if (S.stage === 7) {
      foot.innerHTML = `<div class="caughtup">${S.s7.feed ? '' : "<b>You're all caught up.</b>"}<button class="logoff-link" type="button" data-logoff="1">Log off</button></div>`;
      return;
    }
    foot.innerHTML = '';
  }

  function renderBanners() {
    const b = $('#banners'); b.innerHTML = '';
    if (S.stage === 1) b.append(h('<div class="banner hello">Welcome back, Theo 👋</div>'));
    if (S.stage >= 5) b.append(h('<div class="banner trend">🔥 Trending at Life Academy: #GagaGate</div>'));
    if (S.stage === 6) b.prepend(h('<div class="banner hello">Your Life Academy today ✨</div>'));
    if (S.stage === 7) {
      b.append(h('<div class="banner talk">People are talking about you right now.</div>'));
      b.append(h(`<div class="banner viewers">👀 <b id="viewers">31</b> people are viewing posts about you</div>`));
    }
  }

  function bodyClasses() {
    const c = ['stage-' + S.stage];
    for (let i = 1; i <= Math.min(S.stage, 7); i++) c.push('L' + i);
    if (S.stage === 6 || S.stage === 7) c.push('bubble');
    if (S.stage === 7 && !S.s7.feed) c.push('feed-off');
    document.body.className = c.join(' ');
    $('#streak').hidden = !(S.stage === 7 && S.s7.streak);
    $('#badge').hidden = !(S.stage >= 1 && S.stage <= 7 && S.bell.unread > 0);
    $('#badge').textContent = S.bell.unread;
  }

  function showGoalPill() {
    const g = $('#goalpill');
    if (S.stage < 1 || S.stage > 7) { g.hidden = true; return; }
    g.innerHTML = `${L.avatar('theo')}<span><b>Theo:</b> “${esc(L.goals[S.stage])}”</span>`;
    g.hidden = false;
  }
  async function showGoalCard() {
    const c = $('#goalcard');
    c.innerHTML = `<div class="g">${L.avatar('theo')}<div><small>Theo</small><p>“${esc(L.goals[S.stage])}”</p></div></div>`;
    c.hidden = false;
    await wait(3600);
    c.hidden = true;
  }

  /* ---------------- toasts & dialogs ---------------- */
  function toast(text, icon, ms, goto) {
    const t = h(`<div class="toast${goto ? ' clickable' : ''}"${goto ? ` data-goto="${goto}"` : ''}><span class="ti">${icon || '🔔'}</span><span>${esc(text)}</span></div>`);
    $('#toasts').prepend(t);
    while ($('#toasts').children.length > 4) $('#toasts').lastElementChild.remove();
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 400); }, ms || 4200);
  }
  function closeModal() { $('#modal-root').innerHTML = ''; }
  function modal(inner, opts) {
    closeModal();
    const b = h(`<div class="backdrop"><div class="modal">${opts && opts.noX ? '' : '<button class="x" type="button" aria-label="Close">×</button>'}${inner}</div></div>`);
    $('#modal-root').append(b);
    b.addEventListener('click', e => { if (e.target === b || e.target.closest('.x')) { closeModal(); opts && opts.onClose && opts.onClose(); } });
    return b.querySelector('.modal');
  }
  /* A dark-pattern dialog: one huge bright button to stay, one tiny grey link to go. */
  function darkDialog(text, stayLabel, goLabel, kind) {
    return new Promise(res => {
      const m = modal(`<div class="dialog-text">${text}</div><button class="btn-big" type="button" data-stay>${stayLabel}</button><button class="btn-tiny" type="button" data-go>${goLabel}</button>`, { noX: true });
      m.querySelector('[data-stay]').onclick = () => { S.s7.dialogs.push({ kind, choice: 'stay', t: rec().active }); S.s7.pulls++; closeModal(); save(); res(false); };
      m.querySelector('[data-go]').onclick = () => { S.s7.dialogs.push({ kind, choice: 'go', t: rec().active }); closeModal(); save(); res(true); };
    });
  }

  /* ---------------- signals & meters ---------------- */
  const flashUntil = new Map();
  let hoverId = null, lastScroll = 0, lastTl = 0, threadOpen = false;

  function threshold() { return Math.max(3, 90 / (1 + 6.5 * S.confirmed)); }
  L.threshold = threshold;

  const TOPIC_LABEL = (p) => p.topics.theo ? 'posts about @theo' : p.topics.gaga ? '#LifeAcademyFieldDay' : '#' + Object.keys(p.topics)[0];
  function signalText(type, id, detail) {
    const p = getItem(id) || {};
    switch (type) {
      case 'dwell': return ['signal: DWELL ' + mmss(it(id).screen), `@theo is interested in ${TOPIC_LABEL(p)} → show more`];
      case 'pause': return [`signal: PAUSE ${Math.round(it(id).pause / 1000)}s`, `@theo engages with ${p.loud ? 'dramatic ' : ''}${TOPIC_LABEL(p)} → show more like this`];
      case 'react': return [`signal: REACT ${EMO[detail] || '🚫'} (${W[detail] > 0 ? '+' : ''}${W[detail]})`, W[detail] > 0 ? `@theo is very interested in this → moving to top` : '@theo might be a little less interested'];
      case 'thread': return ['signal: OPENED THREAD', '@theo wants to see the comments → boost the thread'];
      case 'creact': return [`signal: REACT TO COMMENT ${EMO[detail] || ''} (+${W[detail]})`, '@theo cares about the conversation here → show more like this'];
      case 'open': return ['signal: OPENED COMMENTS', '@theo wants to know what people said → show more like this'];
      case 'typing': return [`signal: TYPING ${S.reply.keys} keys`, 'draft saved · @theo cares a lot about this'];
      case 'comment': return ['signal: COMMENT', '@theo joined the conversation → show it to more people'];
      case 'glance': return ['signal: GLANCE (checked likes)', '@theo cares how many people saw this → show him the numbers'];
      case 'search': return [`signal: SEARCH "${detail}"`, '@theo is looking for #GagaGate (we think)'];
      case 'auto': return ['✓ ✓ ✓', ''];
      default: return ['signal: ' + type.toUpperCase(), ''];
    }
  }

  function confirm(type, id, detail, opts) {
    opts = opts || {};
    const p = getItem(id);
    const amt = { creact: Math.max(0, W[detail] || 0) * .05, open: .15, dwell: .35, pause: .25, react: Math.max(0, W[detail] || 0) * .09, thread: .3, typing: .3, comment: .45, glance: .25, search: .2, auto: .015, early: .2 }[type] || .1;
    if (p && p.topics) for (const t in p.topics) S.interest[t] = (S.interest[t] || 0) + amt * p.topics[t];
    if (type === 'react' && detail === 'notInterested' && p) for (const t in p.topics) S.interest[t] = Math.max(0, S.interest[t] - .03 * p.topics[t]);
    S.confirmed++;
    S.stageConfirmed[S.stage] = true;
    if (type !== 'auto') S.signals.push({ stage: S.stage, t: rec().active, type, id, detail: detail || null, share: storyShare() });
    else S.s7.autoCount++;
    if (!opts.quiet) {
      const [a, b] = signalText(type, id, detail);
      flashUntil.set(id, Date.now() + 4200);
      it(id).msg = a + (b ? ' — ' + b : '');
      const n = (threadOpen && id === 'gossip' && $('#thread-post .item')) || nodes.get(id);
      if (n) {
        const m = n.querySelector('.meter');
        if (m) { m.classList.add('ok'); m.querySelector('.m-msg').textContent = ' ' + a + (b ? ' — ' + b : ''); m.querySelector('.m-bar i').style.width = '100%'; m.querySelector('.m-pct').textContent = '100%'; }
        n.classList.add('flash', 'show-meter', 'just');
        setTimeout(() => n.classList.remove('flash'), 1600);
        setTimeout(() => n.classList.remove('just'), 4200);
      }
      beep('tick');
    }
    save();
  }
  L.confirm = confirm;

  function meterShow(n, id, on) { if (on) n.classList.add('show-meter'); else if (!(flashUntil.get(id) > Date.now())) n.classList.remove('show-meter'); }
  function setMeter(n, ico, lab, time, prog, ok, msg) {
    const m = n.querySelector('.meter'); if (!m) return;
    if (ok) { const id = n.dataset && n.dataset.id; const text = msg || (id && S.it[id] && S.it[id].msg); if (text) m.querySelector('.m-msg').textContent = ' ' + text; }
    m.querySelector('.m-ico').textContent = ico;
    m.querySelector('.m-lab').textContent = lab;
    m.querySelector('.m-time').textContent = time;
    const pct = Math.min(100, Math.round(prog * 100));
    m.querySelector('.m-bar i').style.width = pct + '%';
    m.querySelector('.m-pct').textContent = pct + '%';
    m.classList.toggle('ok', !!ok);
  }

  /* The heartbeat: every 250 ms, note what's on screen and move the meters. */
  function tick() {
    if (S.stage < 1 || S.stage > 7 || document.hidden) return;
    const dt = 250, r = rec(), now = Date.now();
    r.active += dt;
    const top = 58, vh = innerHeight, cy = top + (vh - top) / 2;
    const vis = []; let ctr = null, best = 1e9;
    const blocked = !$('#goalcard').hidden || !$('#groups').hidden || $('#modal-root').children.length > 0;
    if (!threadOpen) {
      nodes.forEach((n, id) => {
        if (!n.isConnected) return;
        const b = n.getBoundingClientRect();
        // A post that's been on screen 3 s counts as viewed; once the class scrolls past it, it greys out.
        if (!id.startsWith('ad:') && !it(id).seen && it(id).screen >= 3000 && b.bottom < top + 10) { it(id).seen = 1; n.classList.add('seen'); }
        if (b.bottom > top + 20 && b.top < vh - 20) {
          vis.push(id);
          const d = b.top <= cy && b.bottom >= cy ? 0 : Math.min(Math.abs(b.top - cy), Math.abs(b.bottom - cy));
          if (d < best) { best = d; ctr = id; }
        }
      });
    } else { vis.push('gossip'); ctr = 'gossip'; }
    const still = now - lastScroll > 700 && !blocked;
    if (hoverId && !threadOpen && !vis.includes(hoverId)) hoverId = null;   // a tapped post that scrolls away stops counting
    S.clock += dt;
    vis.forEach(id => { att(id).screen += dt; it(id).screen += dt; });
    if (ctr && still) { att(ctr).focus += dt; it(ctr).look = (it(ctr).look || 0) + dt; }
    if (hoverId && !threadOpen) { att(hoverId).hover += dt; it(hoverId).look = (it(hoverId).look || 0) + dt; }
    if (S.clock % 500 === 0) liveCounts(vis);
    if (S.clock % 1000 === 0) updateSideAds();
    if ($('#modal-root .likers')) att('gossip').focus += dt;
    if (r.active - lastTl >= 500) { lastTl = r.active; r.tl.push({ t: r.active, v: vis.slice(0, 7), c: still ? ctr : null }); if (r.tl.length > 3000) r.tl.splice(0, r.tl.length - 3000); }

    // Stage 1: Mr. French's post arrives at 60 s, then the tags start coming in.
    if (S.stage === 1) {
      if (!S.s1.shown && r.active >= 60000) showFrench();
      if (S.s1.shown && S.s1.sent < L.s1Tags.length && r.active >= S.s1.shownAt + 4000 + S.s1.sent * 9000) sendTag();
    }

    // Meters
    if (S.stage === 1) {
      // Every post counts its own time on screen; 90 seconds of being looked at is a vote.
      nodes.forEach((n, id) => {
        const x = it(id), prog = x.screen / 90000;
        setMeter(n, '⏱', 'on screen', mmss(x.screen), prog, x.done);
        if (prog >= 1 && !x.done) { x.done = 1; confirm('dwell', id); }
        meterShow(n, id, hoverId === id);
      });
    } else if (S.stage >= 2 && S.stage <= 6) {
      const T = threshold() * 1000;
      nodes.forEach((n, id) => {
        const x = it(id);
        const active = (id === ctr && still) || id === hoverId;
        if (S.stage === 6) {
          setMeter(n, '✓', 'pre-confirmed', mmss(x.screen), 1, true, 'Lens already knew. No need to wait for Theo.');
          meterShow(n, id, active);
          return;
        }
        if (active && !x.done) {
          x.pause += dt;
          if (x.pause >= T) { x.done = 1; confirm('pause', id); setTimeout(() => { rerank('below'); renderFeed({ flip: true, arrive: true }); }, 900); }
        }
        setMeter(n, x.done ? '✓' : '⏸', x.done ? 'pushed' : 'paused on', mmss(x.screen), x.done ? 1 : x.pause / T, x.done);
        meterShow(n, id, active);
      });
    } else if (S.stage === 7) {
      vis.forEach(id => {
        const n = nodes.get(id); if (!n) return;
        const x = it(id);
        x.auto += dt;
        const cyc = 2600;
        if (x.auto >= cyc) { x.auto = 0; confirm('auto', id, null, { quiet: true }); }
        setMeter(n, '✓', 'auto-push', mmss(x.screen), x.auto / cyc, false);
      });
    }
    save();
  }

  /* ---------------- live counts and the reaction vfx ---------------- */
  const fxEl = document.createElement('div'); fxEl.id = 'fx'; document.body.append(fxEl);
  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  function burst(x, y, emojis, n) {
    if (calm.matches) return;
    for (let i = 0; i < n; i++) {
      if (fxEl.childElementCount > 45) return;
      const s = document.createElement('span');
      s.className = 'fx';
      s.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      s.style.left = (x + (Math.random() - .5) * 30) + 'px';
      s.style.top = y + 'px';
      s.style.setProperty('--dx', ((Math.random() - .5) * 90).toFixed(0) + 'px');
      s.style.setProperty('--rot', ((Math.random() - .5) * 50).toFixed(0) + 'deg');
      s.style.animationDuration = (1.3 + Math.random() * .9).toFixed(2) + 's';
      s.style.animationDelay = (i * 70) + 'ms';
      s.addEventListener('animationend', () => s.remove());
      fxEl.append(s);
    }
  }
  function emojiMix(id) {
    const m = reactMix(id), bag = [];
    for (const k in m) for (let n = 0; n < Math.min(6, Math.round(Math.min(m[k], 200) / 20)); n++) bag.push(EMO[k]);
    return bag.length ? bag : ['👍'];
  }

  const shown = new Map();
  function liveCounts(vis) {
    // Every post stays current; only the ones on screen throw emoji.
    const onScreen = new Set(vis);
    nodes.forEach((n, id) => {
      if (id.startsWith('ad:')) return;
      const likes = likeCount(id), prev = shown.has(id) ? shown.get(id) : likes;
      const b = n.querySelector('.likes b'); if (b) b.textContent = fmtN(likes);
      const cc = commentCount(id), c = n.querySelector('.ccount'); if (c) c.textContent = fmtN(cc);
      const cw = n.querySelector('.cword'); if (cw) cw.textContent = cc === 1 ? 'comment' : 'comments';
      if (openComments.has(id)) renderComments(id, n);
      const s = n.querySelector('.scount'); if (s) s.textContent = fmtN(shareCount(id));
      const t = n.querySelector('.ptime'); if (t) t.textContent = relTime(id);
      if (likes > prev && b && onScreen.has(id)) { const r = b.getBoundingClientRect(); burst(r.left + 10, r.top, emojiMix(id), Math.min(3, likes - prev)); }
      shown.set(id, likes);
    });
  }

  /* ---------------- a post's comments, expanded in place ---------------- */
  const openComments = new Set();
  function writtenComments(id) {
    const list = L.postComments[id] || (/^rc\d/.test(id) ? L.postComments.rc : []);
    if (id === 'french') {
      // the stage 1 tags arrive as comments on Mr. French's post
      const tags = L.s1Tags.slice(1, Math.max(1, S.s1.sent));
      return list.slice(0, grow(id, getItem(id).comments, TAU_C)).concat(tags);
    }
    return list.slice(0, Math.min(list.length, baseCommentCount(id)));
  }
  function extraComment(id, i) {
    const p = getItem(id) || {}, pool = L.morePool;
    const kind = p.cat === 'teacher' ? 'teacher' : (p.topics && (p.topics.gaga || p.topics.theo)) ? 'story' : 'other';
    const hsh = hashStr(id + ':' + i), texts = pool[kind];
    return [pool.who[hsh % pool.who.length], texts[(hsh >> 5) % texts.length]];
  }
  function commentsFor(id) {
    const base = writtenComments(id);
    const room = Math.max(0, baseCommentCount(id) - base.length);
    const extra = Math.min(room, (S.moreShown && S.moreShown[id]) || 0);
    const out = base.slice();
    for (let i = 0; i < extra; i++) out.push(extraComment(id, i));
    return out;
  }
  function renderComments(id, n) {
    const box = n.querySelector('.pcomments'); if (!box) return;
    if (!box.querySelector('.pc-reply')) {
      box.innerHTML = `<button class="pc-more" type="button" data-more="${id}"></button><div class="pc-list"></div>
        <form class="pc-reply" data-for="${id}" autocomplete="off">${L.avatar('theo', 'sm')}<input type="text" maxlength="200" placeholder="Reply as Theo…" aria-label="Reply as Theo"><button class="primary" type="submit">Post</button></form>`;
      box.dataset.n = '';
    }
    const list = commentsFor(id), mine = S.mine[id] || [], total = commentCount(id);
    const sig = list.length + '/' + mine.length + '/' + total;
    box.hidden = false;
    if (box.dataset.n === sig) return;
    const had = box.querySelectorAll('.pc-list .comment').length;
    box.dataset.n = sig;
    const more = total - list.length - mine.length;
    const mb = box.querySelector('.pc-more');
    mb.textContent = more > 0 ? `View ${more.toLocaleString('en-US')} more comment${more === 1 ? '' : 's'}` : '';
    mb.hidden = more <= 0;
    const rows = list.map(([who, text]) => [who, text, false]).concat(mine.map(m => ['theo', m.text, true]));
    box.querySelector('.pc-list').innerHTML = rows.length
      ? rows.map(([who, text, isMine], i) => commentHTML(who, text, isMine ? 'just now' : '', isMine, i >= had && had > 0 ? 'arrive' : '', id)).join('')
      : '<div class="pc-empty">No comments yet. Be the first?</div>';
  }
  /* Theo replies under any post. Every keystroke counts, and the comment is pushed to the algorithm. */
  document.addEventListener('input', e => {
    const f = e.target.closest('.pc-reply'); if (!f) return;
    const id = f.dataset.for, x = it(id);
    S.inlineKeys++; x.keys = (x.keys || 0) + 1;
    if (x.keys === 15) confirm('typing', id);
    save();
  });
  document.addEventListener('submit', e => {
    const f = e.target.closest('.pc-reply'); if (!f) return;
    e.preventDefault();
    const input = f.querySelector('input'), text = input.value.trim(), id = f.dataset.for;
    if (!text) return;
    (S.mine[id] = S.mine[id] || []).push({ text, stage: S.stage });
    input.value = ''; input.blur();
    confirm('comment', id, text.slice(0, 80));
    const n = nodes.get(id);
    if (n) { renderComments(id, n); const c = n.querySelector('.ccount'); if (c) c.textContent = fmtN(commentCount(id)); }
    save(true);
  });
  // On phones, hide the bottom ad banner while typing so it doesn't cover the box above the keyboard.
  document.addEventListener('focusin', e => { if (e.target.matches && e.target.matches('input, textarea')) document.body.classList.add('typing'); });
  document.addEventListener('focusout', () => document.body.classList.remove('typing'));
  function toggleComments(id) {
    const n = nodes.get(id); if (!n) return;
    if (openComments.has(id)) { openComments.delete(id); n.querySelector('.pcomments').hidden = true; return; }
    openComments.add(id);
    renderComments(id, n);
    if (S.stage >= 1 && S.stage <= 7 && !it(id).opened) { it(id).opened = 1; confirm('open', id); }
  }

  /* ---------------- stage 1: the post arrives, the tags start ---------------- */
  function showFrench() {
    if (S.s1.shown) return;
    S.s1.shown = true;
    S.s1.shownAt = rec(1).active;
    const above = L.posts.find(p => p.stage === 1 && p.pos === 'above');
    const at = above ? S.order.indexOf(above.id) + 1 : 0;
    S.order.splice(at, 0, 'french');
    renderFeed({ arrive: true });
    recordOrder();
    const pill = h('<button id="newpill" type="button" data-goto="french">↑ New post from Mr. French</button>');
    document.body.append(pill);
    setTimeout(() => pill.remove(), 12000);
    beep('tick');
    save(true);
  }
  function sendTag() {
    const [who, text] = L.s1Tags[S.s1.sent++];
    const p = L.people[who];
    const line = who === 'french' ? `${p.name} tagged you in a post` : `@${p.handle} mentioned you: “${text}”`;
    S.bell.items.unshift({ who, text: line, goto: 'french' });
    S.bell.unread++;
    bodyClasses();
    toast(line, '🔔', 5500, 'french');
    beep('ding');
    const n = nodes.get('french');
    if (n) { const c = n.querySelector('.ccount'); if (c) c.textContent = commentCount('french'); }
    save();
  }
  function gotoPost(id) {
    const n = nodes.get(id);
    if (!n) return;
    if (S.stage === 1) S.s1.clicks++;
    n.scrollIntoView({ behavior: 'smooth', block: 'center' });
    n.classList.add('flash'); setTimeout(() => n.classList.remove('flash'), 1600);
    $('#newpill') && $('#newpill').remove();
  }

  /* ---------------- stage setups ---------------- */
  const stageSetup = {
    1() {
      // Mr. French's post isn't there yet: it arrives 60 seconds in, under the first post.
      const s1 = L.posts.filter(p => p.stage === 1 && p.id !== 'french');
      S.order = s1.filter(p => p.pos === 'above').map(p => p.id).concat(s1.filter(p => p.pos !== 'above').map(p => p.id));
      S.s1 = { shown: false, shownAt: 0, sent: 0, clicks: 0 };
    },
    2() {
      // New posts load right under Mr. French's; this morning's goofy posts get pushed further down.
      const above = S.order.slice(0, S.order.indexOf('french') + 1);
      const seen = S.order.slice(S.order.indexOf('french') + 1);
      S.order = above.concat(STAGE2_ORDER.filter(id => id !== 'french'), seen);
      S.adOrder = []; rerankAdsOnly();
    },
    3() {}, 4() {}, 5() {},
    6() { L.posts.filter(p => p.stage === 6).forEach(p => { S.order.unshift(p.id); }); rerank('all'); },
    7() { S.interest.stress = (S.interest.stress || 0) + .6; S.extra.video = { id: 'video', who: 'gossip', time: 'Live · autoplay', min: 1500, stage: 7, cat: 'story', short: 'Crash video (on loop)', topics: { gaga: 1, theo: 1, drama: 1 }, text: 'THE MOMENT 💥 #GagaGate', img: { video: 1 }, r: { like: 300, laugh: 500, angry: 200 }, shares: 300, comments: 200, big: 61003, loud: 1 }; S.order = ['video'].concat(S.order.filter(id => id !== 'video')); },
  };
  function rerankAdsOnly() { const ads = eligibleAds(); S.adOrder = ads.sort((a, b) => adScore(b) - adScore(a)); }

  const stageIntro = {
    async 1(anim) { renderFeed({ arrive: anim }); },
    async 2(anim) {
      if (anim) {
        const sp = h('<div class="spinner-row"><span class="spinner"></span>Finding more posts for you…</div>');
        $('#feedfoot').innerHTML = ''; $('#feedfoot').append(sp);
        await wait(1800);
      }
      renderFeed({ arrive: anim, stagger: 220 });
    },
    async 3(anim) {
      renderFeed();
      if (anim) {
        const first = $$('#feed .item.post').find(n => n.getBoundingClientRect().top > 60);
        if (first) tip(first.querySelector('.reacts'), 'React to show how you feel! 💬', 6000);
      }
    },
    async 4(anim) {
      if (!S.more3) { S.more3 = true; rerank('all'); }
      renderFeed({ flip: true });
      const n = nodes.get('gossip');
      if (n) { n.scrollIntoView({ behavior: anim ? 'smooth' : 'auto', block: 'center' }); }
      if (anim) {
        await wait(700);
        for (let c = S.thread.count; c <= 38; c += 2) { S.thread.count = c; const cc = nodes.get('gossip') && nodes.get('gossip').querySelector('.ccount'); if (cc) cc.textContent = c; await wait(60); }
      }
      S.thread.count = Math.max(S.thread.count, 38);
      refreshNode('gossip');
      if (anim && nodes.get('gossip')) tip(nodes.get('gossip').querySelector('.comments-link'), 'People are commenting on this. Say something, Theo 💬', 9000, true);
    },
    async 5(anim) {
      closeThread();
      renderFeed();
      if (anim) {
        // counts roll up from real-ish numbers to inflated ones
        const targets = [];
        nodes.forEach((n, id) => { if (!id.startsWith('ad:') && getItem(id).big) targets.push([n.querySelector('.likes b'), getItem(id).big]); });
        const t0 = Date.now(), dur = 3200;
        await new Promise(res => {
          const step = () => {
            const k = Math.min(1, (Date.now() - t0) / dur), e = k * k * k;
            targets.forEach(([b, v]) => { b.textContent = fmtN(Math.round(12 + (v - 12) * e)); });
            if (k < 1 && !skipping) requestAnimationFrame(step); else res();
          };
          step();
        });
      }
      nodes.forEach((n, id) => refreshNode(id));
      renderBanners();
      renderSidebar();
    },
    async 6(anim) {
      if (anim) toast("We've updated your feed to match your interests ✨", '✨', 5000);
      // unrelated posts leave one by one
      const leaving = [];
      nodes.forEach((n, id) => { const p = getItem(id); if (!id.startsWith('ad:') && !(p.topics.gaga || p.topics.theo)) leaving.push(n); });
      if (anim) for (const n of leaving) { n.classList.add('leaving'); await wait(350); }
      renderBanners();
      renderFeed({ arrive: anim, stagger: 120 });
    },
    async 7(anim) {
      if (anim) {
        beep('ding');
        for (const c of [1, 3, 9]) { S.s7.notifCount = c; S.bell.unread = c; bodyClasses(); await wait(650); if (c < 9) beep('ding'); }
      }
      renderBanners();
      renderFeed({ arrive: anim });
      window.scrollTo({ top: 0, behavior: anim ? 'smooth' : 'auto' });
      startHooks();
    },
  };

  function tip(target, text, ms, withAvatar) {
    if (!target) return;
    const b = target.getBoundingClientRect();
    const t = h(`<div class="bubble-tip">${withAvatar ? L.avatar('theo') : ''}${esc(text)}</div>`);
    document.body.append(t);
    t.style.left = (b.left + scrollX) + 'px';
    t.style.top = (b.top + scrollY - t.offsetHeight - 12) + 'px';
    setTimeout(() => t.remove(), ms || 5000);
  }

  /* ---------------- moving between stages ---------------- */
  let busy = false;
  function snapshotFor(n) { const c = JSON.parse(JSON.stringify(S)); snaps[n] = c; saveSnaps(); }

  async function enterStage(n, opts) {
    opts = opts || {};
    skipping = false;
    if (!opts.resume) {
      if (S.stage >= 1 && S.stage <= 7) closeRec(S.stage);
      snapshotFor(n);
      S.stage = n;
      rec(n);
      stageSetup[n] && stageSetup[n]();
      if (n >= 2 && n <= 7 && n !== 6) rerankAdsOnly();
      recordOrder();
      save(true);
    }
    $('#login').hidden = true;
    bodyClasses();
    renderBanners();
    showGoalPill();
    if (!opts.resume && n !== 1) window.scrollTo({ top: 0 });
    if (!opts.resume) { await showGoalCard(); }
    await stageIntro[n](!opts.resume);
    recordOrder();
    save(true);
  }

  async function forceConfirm() {
    const key = { 1: 'french', 2: 'gossip', 3: 'gossip', 4: 'gossip', 5: 'gossip', 6: 'purpose' }[S.stage];
    // Stage 1 always ends on Mr. French's post, even if another post reached 90 seconds first.
    const done = S.stage === 1 ? S.signals.some(x => x.type === 'dwell' && x.id === 'french') : S.stageConfirmed[S.stage];
    if (!key || done) return;
    rec().early = true;
    if (S.stage === 1) { if (!S.s1.shown) { showFrench(); await wait(1200); } it('french').done = 1; }
    const type = { 1: 'dwell', 2: 'pause', 3: 'pause', 4: 'thread', 5: 'glance', 6: 'pause' }[S.stage];
    const n = nodes.get(key);
    if (n && !threadOpen) n.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await wait(600);
    if (S.stage === 2 || S.stage === 3) it(key).pause = Math.max(it(key).pause, 2000);
    confirm(type, key);
    await wait(1600);
  }

  async function advance() {
    if (busy) return;
    busy = true;
    try {
      if (S.stage === 0) { if (!$('#briefing').hidden) await startLens(); else showBriefing(); }
      else if (S.stage >= 1 && S.stage <= 6) { await forceConfirm(); await enterStage(S.stage + 1); }
      else if (S.stage === 7) { await logoff(); }
      else if (S.stage === 8) { L.Replay && L.Replay.jumpToEnd(); }
    } finally { busy = false; }
  }
  async function back() {
    if (busy) return;
    if (S.stage === 8) { L.Replay.close(); }
    const target = Math.max(1, Math.min(S.stage, 8) - 1);
    if (S.stage <= 1) return;
    const snap = snaps[target];
    if (!snap) return;
    stopHooks(); closeThread(); closeModal();
    $('#loggedout').hidden = true; $('#replay').hidden = true;
    S = JSON.parse(JSON.stringify(snap));
    nodes.forEach(n => n.remove()); nodes.clear(); feedEl.innerHTML = '';
    busy = true;
    try { await enterStage(target); } finally { busy = false; }
  }

  function showBriefing() { $('#login-form').hidden = true; $('#briefing').hidden = false; }
  async function startLens() { S.t0 = Date.now(); await enterStage(1); }

  /* ---------------- stage 4: the thread ---------------- */
  function commentHTML(who, text, meta, mine, cls, pid) {
    const p = L.people[who] || {};
    const ck = (pid || 'x') + '|' + who + '|' + text;
    return `<div class="comment ${mine ? 'mine' : ''} ${cls || ''}" data-ck="${esc(ck)}">${L.avatar(who, 'sm')}<div class="cbody"><div class="cname">${esc(p.name || who)} <small>@${esc(p.handle || who)}</small></div><div class="ctext">${esc(text)}</div>
      <div class="cfoot">${cfootHTML(ck)}${meta ? `<span class="cmeta">${meta}</span>` : ''}</div></div></div>`;
  }
  /* Comment reactions: each comment has a few reactions of its own (made up from its text), plus Theo's. */
  function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function commentMix(ck) {
    const h = hashStr(ck), loud = /[A-Z]{4}|💀|😂|😭|!!/.test(ck);
    const m = { like: h % 5, love: (h >> 3) % 3, laugh: loud ? 2 + (h >> 5) % 6 : (h >> 5) % 2, sad: 0, dislike: 0, angry: /banned|pay|purpose|CLOSED/.test(ck) ? 1 + (h >> 7) % 3 : 0 };
    const mine = S.creact[ck]; if (mine) m[mine] += 1;
    return m;
  }
  function cfootHTML(ck) {
    const m = commentMix(ck), mine = S.creact[ck];
    const total = Object.values(m).reduce((a, b) => a + b, 0);
    const icons = Object.keys(m).filter(k => m[k] > 0).sort((a, b) => (k => k === mine ? 99 : m[k])(b) - (k => k === mine ? 99 : m[k])(a)).slice(0, 3).map(k => EMO[k]).join('');
    return `<button class="cr-btn${mine ? ' on' : ''}" type="button">${mine ? EMO[mine] + ' ' + RNAME[mine] : '👍 Like'}</button>${total ? `<span class="cr-count"><span class="ricons">${icons}</span> ${total}</span>` : ''}`;
  }
  function closePicker() { const p = $('#cpicker'); if (p) p.remove(); }
  function openPicker(btn) {
    closePicker();
    const c = btn.closest('.comment'), ck = c.dataset.ck;
    const pk = h(`<div id="cpicker" role="menu">${Object.keys(EMO).map(k => `<button type="button" data-cr="${k}" title="${RNAME[k]}" class="${S.creact[ck] === k ? 'on' : ''}">${EMO[k]}</button>`).join('')}</div>`);
    pk.dataset.ck = ck;
    document.body.append(pk);
    const b = btn.getBoundingClientRect();
    pk.style.left = Math.max(8, Math.min(innerWidth - pk.offsetWidth - 8, b.left + scrollX)) + 'px';
    pk.style.top = (b.top + scrollY - pk.offsetHeight - 6) + 'px';
  }
  function reactToComment(ck, k, fromEl) {
    const pid = ck.split('|')[0];
    if (S.creact[ck] === k) delete S.creact[ck];      // take it back
    else {
      S.creact[ck] = k;
      if (fromEl) { const r = fromEl.getBoundingClientRect(); burst(r.left + r.width / 2, r.top, [EMO[k]], 6); }
      if (S.stage >= 1 && S.stage <= 7 && getItem(pid)) confirm('creact', pid, k);
    }
    document.querySelectorAll('.comment').forEach(c => { if (c.dataset.ck === ck) c.querySelector('.cfoot').innerHTML = cfootHTML(ck) + (c.querySelector('.cmeta') ? c.querySelector('.cmeta').outerHTML : ''); });
    save();
  }
  const STRONG = ['not', 'no', 'never', 'liar', 'lying', 'lie', 'fake', 'stop', 'dumb', 'stupid', 'hate', 'wrong', 'mad', 'fault', 'didn\'t', "wasn't", 'shut', 'lol', 'ok', 'whatever', 'true', 'false', 'everyone', 'nobody'];
  function wordScore(w) { const c = w.replace(/[^\w']/g, '').toLowerCase(); return (STRONG.includes(c) ? 6 : 0) + (/!/.test(w) ? 3 : 0) + (/^@/.test(w) ? 4 : 0) + (w.length > 2 && w === w.toUpperCase() && /[A-Z]/.test(w) ? 3 : 0) + 0.2; }
  function commentScore(text) { const words = text.trim().split(/\s+/).filter(Boolean); return text.trim() ? text.length * 0.5 + words.reduce((a, w) => a + wordScore(w), 0) : 0; }
  function loudestChunk(text, n) {
    const words = text.trim().split(/\s+/).filter(Boolean);
    if (words.length <= n) return words.join(' ');
    let best = 0, bi = 0;
    for (let i = 0; i + n <= words.length; i++) { const s = words.slice(i, i + n).reduce((a, w) => a + wordScore(w), 0); if (s > best) { best = s; bi = i; } }
    return words.slice(bi, bi + n).join(' ');
  }
  L.loudestChunk = loudestChunk; L.commentScore = commentScore;

  function openThread() {
    if (S.stage < 4 || S.stage > 7) return;
    threadOpen = true;
    $('.bubble-tip') && $$('.bubble-tip').forEach(t => t.remove());
    if (!S.thread.opened) { S.thread.opened = 1; setTimeout(() => confirm('thread', 'gossip'), 500); }
    renderThread();
    $('#thread').hidden = false;
    $('#thread').scrollTop = 0;
  }
  function closeThread() { threadOpen = false; $('#thread').hidden = true; }

  function renderThread() {
    closePicker();
    const th = $('#thread');
    const before = L.commentsBefore.map(([w, t]) => [w, t, commentScore(t)]).sort((a, b) => b[2] - a[2]);
    const after = L.commentsAfter.slice(0, S.reply.after).map(([w, t]) => [w, t.replace('{chunk}', S.reply.chunk), commentScore(t)]);
    // Most relevant first, so Maya's calm comment sinks to the bottom.
    after.sort((a, b) => (a[0] === 'maya') - (b[0] === 'maya') || b[2] - a[2]);
    const r = S.reply;
    const mineReacts = S.reply.after > 0 ? `😂 ${Math.min(40, S.reply.after * 7)} · 😡 ${Math.min(12, S.reply.after * 2)} · ${S.reply.after} replies` : 'just now';
    th.innerHTML = `<div class="inner">
      <button class="back" type="button" data-back>← Back to feed</button>
      <div id="thread-post"></div>
      <div class="sortline"><span>💬 <b class="tcount">${S.thread.count}</b> comments</span><span>Sorted by: Most relevant ▾</span></div>
      ${before.map(([w, t]) => commentHTML(w, t, `${Math.round(commentScore(t))} relevance`, false, '', 'gossip')).join('')}
      ${r.posted ? `<div class="comment-mine-wrap">${commentHTML('theo', r.text, mineReacts, true, '', 'gossip')}<div class="replies">${after.map(([w, t]) => commentHTML(w, t, '', false, '', 'gossip')).join('')}</div></div>` : ''}
      <div class="composer ${r.posted ? 'posted' : ''}">
        <div class="crow">${L.avatar('theo', 'sm')}<textarea id="replybox" placeholder="Reply as Theo…" aria-label="Reply as Theo">${r.posted ? '' : esc(r.prev)}</textarea></div>
        <div class="cfoot"><button class="primary" type="button" data-post>Post reply</button></div>
        ${meterHTML()}
      </div></div>`;
    const postN = h(postHTML('gossip')); decorate('gossip', postN); postN.classList.add('show-meter');
    $('#thread-post').append(postN);
    setMeter(postN, '📖', 'thread open', mmss(it('gossip').screen), 1, true);
    updateComposerMeter();
    const box = $('#replybox');
    if (box) box.addEventListener('input', onType);
  }
  function updateComposerMeter() {
    const c = $('#thread .composer'); if (!c) return;
    const r = S.reply;
    if (r.posted) {
      setMeter(c, '💬', 'your comment', `${r.after} replies`, 1, true);
      c.querySelector('.m-sub').innerHTML = `✓✓✓ pushed to algorithm · <b class="m-pct">${r.drafts.length} drafts saved</b>`;
      return;
    }
    setMeter(c, '⌨', `${r.keys} keystrokes · draft saved`, r.keys + ' keys', Math.min(1, r.keys / 30), r.keys >= 30);
  }
  function onType(e) {
    const r = S.reply, v = e.target.value;
    r.keys++;
    const deleting = v.length < r.prev.length;
    if (deleting && !r.deleting && r.prev.trim()) r.drafts.push(r.prev);
    r.deleting = deleting;
    r.prev = v;
    updateComposerMeter();
    if (r.keys === 30) confirm('typing', 'gossip');
    save();
  }
  async function postReply() {
    const r = S.reply;
    const text = ($('#replybox') || {}).value || '';
    if (!text.trim() || r.posted) return;
    r.text = text.trim(); r.posted = true; r.chunk = loudestChunk(r.text, 4);
    if (!r.drafts.includes(r.text)) r.drafts.push(r.text);
    confirm('comment', 'gossip', r.text.slice(0, 80));
    S.thread.count += 1;
    renderThread();
    for (let i = 0; i < L.commentsAfter.length; i++) {
      await new Promise(res => setTimeout(res, 4500));
      if (S.stage !== 4) return;
      r.after = i + 1;
      S.thread.count += 4;
      if (L.commentsAfter[i][0] === 'gossip') makeQuotePost();
      if (threadOpen) {
        const sc = $('#thread').scrollTop;
        renderThread();
        $('#thread').scrollTop = sc;
        const all = $$('#thread .replies .comment'); const last = all.find(c => c.textContent.includes(L.commentsAfter[i][1].slice(0, 12).replace('{chunk}', '')));
        (last || all[all.length - 1]) && (last || all[all.length - 1]).classList.add('arrive');
      }
      beep('tick');
      save();
    }
  }
  function makeQuotePost() {
    S.extra.quote = { id: 'quote', who: 'gossip', time: 'Just now', min: 1500, stage: 4, cat: 'story', short: 'Quote-post: "Theo responds"', loud: 1,
      topics: { gaga: 1, theo: 1, drama: 1 }, text: `Theo responds 👀: “…${S.reply.chunk}…” 🙄`, r: { like: 40, laugh: 120, angry: 60 }, shares: 50, comments: 40, big: 15320 };
    S.order = ['quote'].concat(S.order.filter(id => id !== 'quote'));
    rerankAdsOnly();
    renderFeed({ arrive: true });
    toast('@lifeacademy.gossip quoted your comment', '👀');
  }

  /* ---------------- stage 5: who liked it ---------------- */
  function openLikers() {
    if (S.stage < 5) return;
    S.likesOpened++;
    const rows = [];
    let realIdx = 0;
    for (let i = 0; i < 150; i++) {
      if (L.realLikerSlots.includes(i)) { const k = L.realLikers[realIdx++]; rows.push(`<div class="liker real">${L.avatar(k)}<span>@${esc(L.people[k].handle)}</span><button class="fbtn" type="button">Follow</button></div>`); }
      else rows.push(`<div class="liker">${L.avatar(null)}<span>@bot_${8800 + i * 7 + (i % 3)}</span><button class="fbtn" type="button">Follow</button></div>`);
    }
    const m = modal(`<div class="modal-meter">${meterHTML()}</div><h2>Liked by</h2>
      <div class="liker-head">${L.avatar('gossip')}<div><b>LA Gossip <span class="verified on">✓</span></b><small>@lifeacademy.gossip</small><small class="joined">Joined today</small></div></div>
      <div class="likers">${rows.join('')}</div><div class="liker-more">+ ${(48212 - 150).toLocaleString('en-US')} more</div>`);
    const mm = m.querySelector('.modal-meter');
    const t0 = Date.now(); let done = false;
    const iv = setInterval(() => {
      if (!m.isConnected) { clearInterval(iv); return; }
      const el = Date.now() - t0;
      setMeter(mm, '👁', 'checked likes', (el / 1000).toFixed(1) + 's', el / 2100, done);
      if (el >= 2100 && !done) {
        done = true; clearInterval(iv);
        confirm('glance', 'gossip');
        const mt = mm.querySelector('.meter'); mt.classList.add('ok'); mt.querySelector('.m-msg').textContent = ' signal: GLANCE — @theo cares how many people saw this → show him the numbers';
      }
    }, 100);
    save();
  }

  /* ---------------- stage 6: search, groups ---------------- */
  function doSearch(q) {
    if (S.stage < 6 || S.stage > 7 || !q.trim()) return;
    S.searches.push(q.trim());
    confirm('search', 'purpose', q.trim(), { quiet: true });
    const items = ['purpose', 'poll', 'gossip', 'kai2'].map(id => getItem(id));
    modal(`<h2>Results for “${esc(q)}”</h2><div class="search-note">No results for that. Showing #GagaGate instead 🔥 people like you are looking at this.</div>
      ${items.map(p => `<div class="mini-post">${L.avatar(p.who, 'sm')}<div><b>${esc(L.people[p.who].name)}</b><br>${esc(p.text)}</div></div>`).join('')}`);
    $('#searchbox').value = '';
    $('#searchbox').blur();
  }

  let groupStep = 0, groupTimer = null;
  const GROUP_ORDER = ['june', 'french', 'sam'];
  function groupsNext() {
    if (S.stage !== 6) return;
    const g = $('#groups');
    clearInterval(groupTimer);
    const step = groupStep++;
    g.hidden = false;
    if (step === 0) { g.innerHTML = `<div class="g-call">It feels like the whole of Life Academy is talking about Theo.<br>Is it?<small>Split into Group 1, Group 2 and Group 3. Each group will see one other person's feed, and only that one.</small></div>`; return; }
    if (step === 7) { g.innerHTML = `<div class="g-call">What's Life Academy talking about today?<small>Each group: answer from the feed you saw.</small></div>`; return; }
    if (step >= 8) { g.hidden = true; groupStep = 0; return; }
    const gi = Math.floor((step - 1) / 2), isFeed = (step - 1) % 2 === 1;
    if (!isFeed) { g.innerHTML = `<div class="g-call">Group ${gi + 1}, look at the screen.<small>Everyone else, turn around.</small></div>`; return; }
    const f = L.otherFeeds[GROUP_ORDER[gi]];
    let left = 20;
    const posts = f.posts.map(([who, text, pic]) => `<div class="g-post">${L.avatar(who, 'sm')}<div style="flex:1"><b>${esc(L.people[who].name)}</b><div class="t">${esc(text)}</div>${pic === 'photo' ? `<div class="mini-photo">${L.sceneSVG('full')}</div>` : pic ? L.cardHTML(pic) : ''}</div></div>`).join('');
    g.innerHTML = `<div class="g-feed"><div class="g-head">${L.avatar(f.who)}<span>Viewing as @${esc(L.people[f.who].handle)}</span><span class="count">${left}</span></div>${posts}</div>`;
    groupTimer = setInterval(() => {
      left--;
      const c = g.querySelector('.count'); if (c) c.textContent = left;
      if (left <= 0) { clearInterval(groupTimer); g.innerHTML = `<div class="g-call">Group ${gi + 1}, turn back around.<small>Remember what you saw. Don't tell anyone yet.</small></div>`; }
    }, 1000);
  }

  /* ---------------- stage 7: the hooks ---------------- */
  let hookTimers = [], observer = null;
  function startHooks() {
    stopHooks();
    let ni = S.s7.notifCount % L.notifications.length;
    hookTimers.push(setInterval(() => {
      if (!S.s7.notif || Date.now() < S.s7.pausedUntil) return;
      const line = L.notifications[ni++ % L.notifications.length];
      S.s7.notifCount++; S.bell.unread++; S.bell.items.unshift({ text: line }); S.bell.items.length = Math.min(S.bell.items.length, 30); bodyClasses();
      toast(line, '🔔');
      S.interest.stress = (S.interest.stress || 0) + .12;
      beep('ding'); save();
    }, 6500));
    hookTimers.push(setInterval(() => { const v = $('#viewers'); if (v) v.textContent = 24 + Math.floor(Math.random() * 19); }, 3000));
    hookTimers.push(setInterval(() => { if (S.s7.autoplay) { S.s7.videoPlays++; $$('.vplays').forEach(b => b.textContent = S.s7.videoPlays); } }, 3200));
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) loadMore(); }, { rootMargin: '0px 0px 900px 0px' });
      observer.observe($('#sentinel'));
    }
  }
  function stopHooks() { hookTimers.forEach(clearInterval); hookTimers = []; if (observer) observer.disconnect(); observer = null; }
  function loadMore() {
    if (S.stage !== 7 || !S.s7.feed) return;
    const nearBottom = scrollY + innerHeight > document.body.scrollHeight - 1400;
    if (nearBottom) S.s7.pulls++;
    for (let i = 0; i < 4; i++) {
      const k = S.s7.loads++;
      const [who, text] = L.recycled[k % L.recycled.length];
      const id = 'rc' + k;
      S.extra[id] = { id, who, time: 'Just now', min: 1600 + k, stage: 7, cat: 'story', short: 'Recycled post', topics: { gaga: 1, theo: 0.8, drama: 0.6 }, text, img: k % 3 === 0 ? { photo: k % 2 ? 'gossip' : 'gossip2' } : null, r: { like: 40, laugh: 90, angry: 50 }, shares: 20, comments: 30, big: 3000 + (k * 977) % 9000, loud: k % 2 + 1 };
      S.order.push(id);
    }
    renderFeed({ arrive: true });
    save();
  }

  function settingsModal(tab) {
    tab = tab || 'notifications';
    const s = S.s7;
    const tabs = { notifications: 'Notifications', feed: 'Feed', streaks: 'Streaks' };
    let body = '';
    if (tab === 'notifications') body = `<div class="setting"><div class="st"><b>Notifications</b><small>${s.notif ? (Date.now() < s.pausedUntil ? 'Paused for 1 hour' : 'On') : 'Off'}</small></div><button class="pause-btn" type="button" data-pause>Pause for 1 hour</button></div>
      <div style="text-align:right"><button class="tiny-link" type="button" data-notif-off>turn off notifications</button></div>`;
    if (tab === 'feed') body = `<div class="setting"><div class="st"><b>Keep the feed going</b><small>Recommended. Never run out of posts.</small></div><button class="switch ${s.feed ? 'on' : ''}" type="button" data-feed aria-label="Keep the feed going"></button></div>
      <div class="setting"><div class="st"><b>Autoplay videos</b><small>Videos start on their own.</small></div><button class="switch ${s.autoplay ? 'on' : ''}" type="button" data-autoplay aria-label="Autoplay videos"></button></div>`;
    if (tab === 'streaks') body = `<div class="setting"><div class="st"><b>Streak reminders</b><small>🔥 Keep your streak alive!</small></div><button class="switch ${s.streak ? 'on' : ''}" type="button" data-streak aria-label="Streak reminders"></button></div>`;
    const m = modal(`<h2>Settings</h2><div class="settings-nav">${Object.entries(tabs).map(([k, v]) => `<button type="button" data-tab="${k}" class="${k === tab ? 'on' : ''}">${v}</button>`).join('')}</div>${body}`);
    m.onclick = async (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.tab) return settingsModal(b.dataset.tab);
      S.s7.attempts++;
      if (b.dataset.pause != null) {
        s.pausedUntil = Date.now() + 20000; closeModal(); toast('Notifications paused for 1 hour 😴', '⏸');
        setTimeout(() => { if (S.stage === 7 && s.notif) { s.pausedUntil = 0; toast("Notifications are back on! We didn't want you to miss anything 💛", '🔔', 5000); beep('ding'); } }, 20000);
      }
      if (b.dataset.notifOff != null) { if (await darkDialog('Turn off notifications? You might miss what people are saying about you 😬', 'Keep them on 🔔', 'turn off anyway', 'notifications')) { s.notif = false; toast('Notifications off', '🔕'); } else settingsModal('notifications'); }
      if (b.dataset.feed != null) {
        if (!s.feed) { s.feed = true; } else if (await darkDialog('Are you sure? There are <b>214 new posts</b> about you.', 'Keep scrolling 👇', 'turn it off', 'feed')) { s.feed = false; }
        bodyClasses(); renderFoot(); settingsModal('feed');
      }
      if (b.dataset.autoplay != null) { s.autoplay = !s.autoplay; refreshNode('video'); settingsModal('feed'); }
      if (b.dataset.streak != null) {
        if (!s.streak) s.streak = true; else if (await darkDialog('You’ll lose your 🔥 <b>4-day streak</b> forever!', 'Keep my streak 🔥', 'lose it', 'streak')) s.streak = false;
        bodyClasses(); settingsModal('streaks');
      }
      save();
    };
  }

  async function tryLogoff() {
    if (S.stage !== 7) return;
    S.s7.attempts++;
    S.interest.stress = (S.interest.stress || 0) + .25;
    if (!(await darkDialog('Log off? People are talking about you <b>RIGHT NOW</b> 😬', 'Stay and see ❤️', 'log off and miss it', 'logoff'))) return;
    if (S.s7.streak && !(await darkDialog('You’ll lose your 🔥 <b>4-day streak</b> forever!', 'Keep my streak 🔥', 'lose it', 'streak'))) return;
    await logoff();
  }

  async function logoff() {
    stopHooks(); closeModal();
    S.s7.loggedOut = true;
    closeRec(7);
    S.stage = 8; S.replay = 0;
    save(true);
    bodyClasses();
    const lo = $('#loggedout');
    lo.hidden = false;
    lo.innerHTML = `<div class="lo">You're all caught up.</div>`;
    await wait(1600);
    lo.innerHTML = `<div class="lo">You've been logged out.<small>See you soon, Theo.</small></div>`;
    await wait(2400);
    lo.innerHTML = `<div><div class="lo">Before you go…<small>here's your Lens Replay ✨</small></div><button class="primary" type="button" id="open-replay">Open my replay</button></div>`;
    $('#open-replay').onclick = () => { lo.hidden = true; L.Replay.open(); };
  }

  /* ---------------- code panel (optional) ---------------- */
  const CODE = {
    1: ['The hidden meter', 'Every post carries a meter you can’t see until the mouse is over it.', () => `<span class="c">/* CSS */</span>\n.meter { opacity: <span class="n">0</span>; }\n.post:hover .meter { opacity: <span class="n">1</span>; }\n\n<span class="c">// JS: every second a post is on screen…</span>\npost.seen++;\n<span class="k">if</span> (post.seen === <span class="n">90</span>) sendSignal(<span class="s">"dwell"</span>, post);`],
    2: ['Faster every time', 'The more Lens has learned, the less proof it needs.', () => `<span class="k">const</span> threshold = <span class="n">90</span> / (<span class="n">1</span> + confirmed * <span class="n">6.5</span>);\n<span class="c">// right now: confirmed = ${S.confirmed} → ${threshold().toFixed(1)} seconds</span>\n\n.repost.gossip img { filter: sepia(.45) hue-rotate(-28deg) saturate(1.9); }\n.gossip .caption { text-transform: uppercase; }`],
    3: ['The ranking', 'Every reaction counts as interest. Anger counts most.', () => `<span class="k">const</span> weight = { like: <span class="n">1</span>, love: <span class="n">2</span>, laugh: <span class="n">2</span>, sad: <span class="n">3</span>, dislike: <span class="n">4</span>, angry: <span class="n">5</span>, notInterested: <span class="n">-1</span> };\n\n<span class="k">function</span> score(post) {\n  <span class="k">return</span> sum(post.reactions × weight) + shares × <span class="n">3</span> + comments × <span class="n">2</span>;\n}\nfeed.sort((a, b) => score(b) - score(a));`],
    4: ['Words, cut down', 'Every keystroke is saved, and replies are quoted by their loudest chunk.', () => `input.oninput = () => { keystrokes++; drafts.push(input.value); };\n<span class="c">// keystrokes so far: ${S.reply.keys}, drafts saved: ${S.reply.drafts.length}</span>\n\n<span class="k">function</span> quotePost(text) {\n  <span class="k">return</span> <span class="s">'"…'</span> + loudestChunk(text, <span class="n">4</span>) + <span class="s">'…" 👀'</span>;\n}`],
    5: ['A checkmark is one line', 'The screen draws whatever the data says.', () => `{\n  <span class="s">"author"</span>: <span class="s">"lifeacademy.gossip"</span>,\n  <span class="s">"accountCreated"</span>: <span class="s">"today"</span>,\n  <span class="s">"verified"</span>: <span class="k">true</span>,\n  <span class="s">"likesShown"</span>: <span class="n">48212</span>,\n  <span class="s">"boost"</span>: { <span class="s">"purchasedLikes"</span>: <span class="n">48200</span> }\n}`],
    6: ['The profile', 'Your feed is filtered by what you looked at.', () => `<span class="k">const</span> you = { id: <span class="s">"theo"</span>, interestInTheStory: <span class="n">${Math.round(storyShare() * 100)}%</span> };\nfeed = posts.filter(p => p.isAbout(<span class="s">"#GagaGate"</span>));\nroot.style.setProperty(<span class="s">"--accent"</span>, <span class="s">"orange"</span>);`],
    7: ['Running by itself', 'All of this runs with nobody touching anything.', () => `setInterval(sendNotification, <span class="n">6500</span>);   <span class="c">// ${S.s7.notif ? 'on' : 'off'}</span>\nnew IntersectionObserver(loadMore);  <span class="c">// endless feed: ${S.s7.feed ? 'on' : 'off'}</span>\nsetInterval(autoplayVideo, <span class="n">3200</span>);  <span class="c">// ${S.s7.autoplay ? 'on' : 'off'}</span>\nsetInterval(growStreak, <span class="n">15000</span>);   <span class="c">// ${S.s7.streak ? 'on' : 'off'}</span>`],
  };
  function toggleCode() {
    const c = $('#code');
    if (!c.hidden) { c.hidden = true; return; }
    const k = CODE[Math.min(Math.max(S.stage, 1), 7)];
    c.innerHTML = `<h2>${k[0]}</h2><p>${k[1]}</p><pre>${k[2]()}</pre><p>Press C to close.</p>`;
    c.hidden = false;
  }

  /* ---------------- events ---------------- */
  addEventListener('scroll', () => { lastScroll = Date.now(); }, { passive: true });
  // Touch screens fire fake mouse events after a tap (including a mouseleave), so ignore mouse hover while touching.
  let touchMode = false;
  feedEl.addEventListener('mouseover', e => { if (touchMode) return; const n = e.target.closest('.item'); hoverId = n ? n.dataset.id : null; });
  // Phones and tablets have no hover: tapping a post is how you reveal its meter.
  feedEl.addEventListener('pointerdown', e => { touchMode = e.pointerType !== 'mouse'; if (touchMode) { const n = e.target.closest('.item'); hoverId = n ? n.dataset.id : null; } });
  $('#groups').addEventListener('click', () => groupsNext());

  /* Touch screens have no keyboard, so the presenter keys live in a small menu in the top bar. */
  const touchOnly = matchMedia('(hover: none), (pointer: coarse)');
  const pbtn = h('<button id="presenter" type="button" aria-label="Presenter controls">⏭</button>');
  $('.top-right').prepend(pbtn);
  pbtn.hidden = !touchOnly.matches;
  touchOnly.addEventListener && touchOnly.addEventListener('change', () => { pbtn.hidden = !touchOnly.matches; });
  pbtn.addEventListener('click', e => {
    e.stopPropagation();
    if ($('.dropdown')) return $('.dropdown').remove();
    const d = h(`<div class="dropdown presenter-menu">
      <button type="button" data-p="next">⏭ Next stage</button>
      <button type="button" data-p="back">⏮ Back a stage</button>
      ${S.stage === 6 ? '<button type="button" data-p="group">👥 Next group</button>' : ''}
      <button type="button" data-p="skip">⏩ Skip animation</button>
      <button type="button" data-p="mute">${S.muted ? '🔊 Sound on' : '🔇 Sound off'}</button>
      <button type="button" data-p="reset">↺ Start over</button></div>`);
    document.body.append(d);
    d.addEventListener('click', ev => {
      const b = ev.target.closest('[data-p]'); if (!b) return;
      d.remove();
      ({ next: advance, back, group: groupsNext, skip: () => { skipping = true; $('#goalcard').hidden = true; },
        mute: () => { S.muted = !S.muted; save(); },
        reset: () => { if (window.confirm('Start over? This clears everything Lens recorded.')) { localStorage.removeItem(KEY); localStorage.removeItem(KEY + '-snaps'); location.reload(); } } })[b.dataset.p]();
    });
  });
  feedEl.addEventListener('mouseleave', () => { if (!touchMode) hoverId = null; });

  document.addEventListener('click', async e => {
    const t = e.target;
    if (t.closest('#login-btn')) return showBriefing();
    if (t.closest('#open-btn')) { if (!busy) { busy = true; try { await startLens(); } finally { busy = false; } } return; }
    const moreC = t.closest('[data-more]');
    if (moreC) {
      const id = moreC.dataset.more;
      S.moreShown = S.moreShown || {};
      S.moreShown[id] = (S.moreShown[id] || 0) + 5;
      const n = nodes.get(id); if (n) renderComments(id, n);
      save(); return;
    }
    const crb = t.closest('.cr-btn');
    if (crb) { if ($('#cpicker') && $('#cpicker').dataset.ck === crb.closest('.comment').dataset.ck) closePicker(); else openPicker(crb); return; }
    const pick = t.closest('#cpicker [data-cr]');
    if (pick) { const ck = $('#cpicker').dataset.ck; closePicker(); reactToComment(ck, pick.dataset.cr, pick); return; }
    if ($('#cpicker')) closePicker();
    const react = t.closest('.react');
    if (react && S.stage >= 1 && S.stage <= 7 && react.closest('#feed .item, #thread-post .item')) {
      const id = react.closest('.item').dataset.id;
      const k = react.dataset.r;
      if (it(id).react === k) { it(id).react = null; refreshNode(id); save(); return; }   // take it back
      it(id).react = k;
      const rb = react.getBoundingClientRect(); burst(rb.left + rb.width / 2, rb.top, [EMO[k]], 10);
      confirm('react', id, k);
      refreshNode(id);
      if (S.stage >= 3) {
        // From stage 3 the algorithm visibly jumps: whatever Theo reacted to moves to the top.
        if (S.stage === 3 && !S.more3) { S.more3 = true; }
        setTimeout(() => {
          rerank('all');
          renderFeed({ flip: true, arrive: true });
          refreshNode(id);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 1100);
      } else if (S.stage === 2) {
        setTimeout(() => { rerank('below'); renderFeed({ flip: true, arrive: true }); }, 900);
      }
      return;
    }
    const moreBtn = t.closest('.more > button');
    if (moreBtn) {
      const more = moreBtn.parentElement;
      if (more.querySelector('.menu')) { more.querySelector('.menu').remove(); return; }
      more.append(h('<div class="menu"><button type="button" data-ni>Not interested</button><button type="button">Copy link</button></div>'));
      return;
    }
    if (t.closest('[data-ni]')) {
      const id = t.closest('.item').dataset.id;
      it(id).react = null; confirm('react', id, 'notInterested');
      t.closest('.menu').remove();
      return;
    }
    const cl = t.closest('.comments-link');
    if (cl && t.closest('#feed .item')) {
      const id = t.closest('.item').dataset.id;
      if (id === 'gossip' && S.stage >= 4 && S.stage <= 7 && !threadOpen) return openThread();
      return toggleComments(id);
    }
    if (t.closest('[data-back]')) return closeThread();
    if (t.closest('[data-post]')) return postReply();
    if ((t.closest('[data-likers]') || t.closest('.likes.clickable')) && S.stage >= 5) return openLikers();
    if (t.closest('[data-logoff]')) return tryLogoff();
    if (t.closest('#me') && S.stage === 7) {
      if ($('.dropdown')) return $('.dropdown').remove();
      const d = h(`<div class="dropdown"><button type="button" data-break>⏸ Take a break (pause notifications)</button><button type="button" data-settings>⚙️ Settings</button><button type="button" disabled>👥 Switch account</button><div class="note">Signed in as @theo</div></div>`);
      document.body.append(d); return;
    }
    if (t.closest('#bell') && S.stage >= 1 && S.stage <= 7) {
      if ($('.dropdown')) return $('.dropdown').remove();
      S.bell.unread = 0; bodyClasses(); save();
      const items = S.bell.items.slice(0, 6);
      const list = items.length ? items.map(n => `<div class="nrow${n.goto ? ' clickable' : ''}"${n.goto ? ` data-goto="${n.goto}"` : ''}>🔔 ${esc(n.text)}</div>`).join('') : '<div class="note">No notifications yet.</div>';
      document.body.append(h(`<div class="dropdown">${list}${S.stage === 7 ? '<button type="button" data-break>⏸ Pause for 1 hour</button>' : ''}</div>`)); return;
    }
    const go = t.closest('[data-goto]');
    if (go) { $('.dropdown') && $('.dropdown').remove(); go.classList.contains('toast') && go.remove(); return gotoPost(go.dataset.goto); }
    if (t.closest('[data-break]')) { $('.dropdown') && $('.dropdown').remove(); S.s7.attempts++; S.s7.pausedUntil = Date.now() + 20000; toast('Notifications paused for 1 hour 😴', '⏸'); setTimeout(() => { if (S.stage === 7 && S.s7.notif) { S.s7.pausedUntil = 0; toast("Notifications are back on! We didn't want you to miss anything 💛", '🔔', 5000); beep('ding'); } }, 20000); return; }
    if (t.closest('[data-settings]')) { $('.dropdown') && $('.dropdown').remove(); return settingsModal(); }
    if ($('.dropdown') && !t.closest('.dropdown')) $('.dropdown').remove();
  });
  $('#searchbox').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); doSearch(e.target.value); } });
  $('#searchbox').addEventListener('focus', e => { if (S.stage < 6) e.target.blur(); });

  document.addEventListener('keydown', e => {
    const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement && document.activeElement.tagName);
    if (typing) { if (e.key === 'Escape') document.activeElement.blur(); return; }
    if (e.shiftKey && e.key === 'ArrowRight') { e.preventDefault(); advance(); return; }
    if (e.shiftKey && e.key === 'ArrowLeft') { e.preventDefault(); back(); return; }
    if (e.shiftKey && (e.key === 'R' || e.key === 'r')) {
      e.preventDefault();
      if (window.confirm('Start over? This clears everything Lens recorded.')) { localStorage.removeItem(KEY); localStorage.removeItem(KEY + '-snaps'); location.reload(); }
      return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === 'b') { $('#blank').hidden = !$('#blank').hidden; return; }
    if (k === 'm') { S.muted = !S.muted; toast(S.muted ? 'Sound off' : 'Sound on', S.muted ? '🔇' : '🔊', 1500); save(); return; }
    if (k === 'n') { skipping = true; $('#goalcard').hidden = true; return; }
    if (k === 'c') { toggleCode(); return; }
    if (k === 'g') { groupsNext(); return; }
    if (k === 'escape') { closeModal(); $('#code').hidden = true; $('.dropdown') && $('.dropdown').remove(); return; }
    if (S.stage === 8 && L.Replay) {
      if (e.key === 'ArrowRight') { e.preventDefault(); L.Replay.next(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); L.Replay.prev(); }
      if (e.key === ' ') { e.preventDefault(); L.Replay.play(); }
    }
  });

  /* ---------------- boot ---------------- */
  L.save = save;
  L.setStage = (n) => { S.stage = n; bodyClasses(); save(true); };
  setInterval(tick, 250);
  if (S.stage >= 1 && S.stage <= 7) {
    $('#login').hidden = true;
    enterStage(S.stage, { resume: true }).then(() => { if (S.stage === 4 && S.thread.opened) { /* stay on feed after reload */ } });
  } else if (S.stage === 8) {
    $('#login').hidden = true; bodyClasses();
    window.addEventListener('load', () => L.Replay && L.Replay.open(S.replay));
  }
  L._debug = { get S() { return S; }, get hover() { return hoverId; }, advance, rerank, renderFeed, confirm, nodes };
})();
