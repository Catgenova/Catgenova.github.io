/* Lens Replay: everything the session recorded, one chapter at a time.
   Built only from what actually happened in the room. Nothing here is scripted. */
'use strict';
(function () {
  const L = window.LENS;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const secs = (ms) => Math.round(ms / 1000);
  const minsec = (ms) => { const s = Math.round(ms / 1000); return s >= 60 ? `${Math.floor(s / 60)} min ${s % 60} s` : `${s} s`; };
  const CAT_LABEL = { teacher: "Mr. French's post", story: 'Posts about Theo & field day', other: 'Other posts', ad: 'Ads' };
  const CAT_VAR = { teacher: 'var(--series-teacher)', story: 'var(--series-story)', other: 'var(--series-other)', ad: 'var(--series-ad)' };
  const EMO = { like: '❤️', laugh: '😂', sad: '😢', dislike: '👎', angry: '😡', notInterested: '🚫' };

  let S, chapters = [], idx = 0, playing = null;
  const root = () => $('#replay');

  function catOf(id) { if (id.startsWith('ad:')) return 'ad'; const p = L.getItem(id); return p ? p.cat || 'other' : 'other'; }
  function shortOf(id) { const p = L.getItem(id); return p ? p.short || p.id : id; }
  function trunc(s, n) { return s.length > n ? s.slice(0, n - 1) + '…' : s; }

  function build() {
    S = L.getState();
    chapters = [{ k: 'intro' }, { k: 'start' }, { k: 'reveal', s: 1 }];
    for (let s = 2; s <= 7; s++) {
      if (!S.rec[s]) continue;
      chapters.push({ k: 'stage', s });
      chapters.push({ k: { 2: 'crops', 4: 'words', 5: 'numbers', 6: 'feeds', 7: 'exit' }[s], s });
      chapters.push({ k: 'reveal', s });
    }
    chapters = chapters.filter(c => c.k);
    chapters.push({ k: 'totals' }, { k: 'learned' }, { k: 'line' }, { k: 'off' }, { k: 'close' });
    L.questions.forEach((q, i) => chapters.push({ k: 'q', i }));
  }

  /* ---------- charts ---------- */
  function legend(cats) {
    return `<div class="rp-legend">${cats.map(c => `<span><i style="background:${CAT_VAR[c]}"></i>${CAT_LABEL[c]}</span>`).join('')}</div>`;
  }
  function barsSVG(rows) {
    // rows: [{id, label, v (seconds), cat}]
    if (!rows.length) return '<p class="rp-empty">Nothing on screen long enough to count.</p>';
    const max = Math.max(...rows.map(r => r.v), 1);
    const rowH = 46, W = 640, x0 = 250, x1 = 560;
    const body = rows.map((r, i) => {
      const y = 10 + i * rowH, w = Math.max(3, (x1 - x0) * r.v / max), color = CAT_VAR[r.cat];
      const rad = Math.min(4, w / 2);
      const path = `M${x0} ${y + 8} h${w - rad} a${rad} ${rad} 0 0 1 ${rad} ${rad} v${30 - 2 * rad} a${rad} ${rad} 0 0 1 -${rad} ${rad} h-${w - rad} z`;
      const tag = r.cat === 'ad' ? `<rect x="${x0 - 50}" y="${y + 13}" width="40" height="20" rx="4" fill="var(--series-ad)"/><text x="${x0 - 30}" y="${y + 28}" text-anchor="middle" class="rp-tag">AD</text>` : '';
      return `<g><text x="${r.cat === 'ad' ? x0 - 58 : x0 - 12}" y="${y + 30}" text-anchor="end" class="rp-lab">${esc(trunc(r.label, 22))}</text>${tag}
        <path d="${path}" fill="${color}"><title>${esc(r.label)}: ${r.v}s</title></path>
        <text x="${x0 + w + 10}" y="${y + 30}" class="rp-val">${r.v}s</text></g>`;
    }).join('');
    return `<svg class="rp-svg" viewBox="0 0 ${W} ${rows.length * rowH + 20}" role="img" aria-label="Seconds looked at each post">${body}</svg>`;
  }
  function slopeSVG(before, after, focusIds) {
    // The posts that matter, at their real place in the whole feed, at the start and end of the stage.
    const pick = [];
    const add = (id) => { if (id && !pick.includes(id) && (before.includes(id) || after.includes(id))) pick.push(id); };
    (focusIds || []).forEach(add);
    ['gossip', 'tH', 'french', 'quote', 'purpose', 'video'].forEach(add);
    add(after.find(id => id.startsWith('ad:'))); add(before.find(id => id.startsWith('ad:')));
    const ids = pick.slice(0, 8);
    if (!ids.length) return '<p class="rp-empty">No change recorded.</p>';
    const rank = (seq, id) => { const i = seq.indexOf(id); return i < 0 ? null : i + 1; };
    const L1 = ids.filter(id => rank(before, id)).sort((a, b) => rank(before, a) - rank(before, b));
    const R1 = ids.filter(id => rank(after, id)).sort((a, b) => rank(after, a) - rank(after, b));
    const rowH = 44, top = 46, W = 640, xl = 240, xr = 400, H = top + Math.max(L1.length, R1.length) * rowH + 8;
    const yL = (id) => top + L1.indexOf(id) * rowH + 14, yR = (id) => top + R1.indexOf(id) * rowH + 14;
    let lines = '', labels = '';
    ids.forEach(id => {
      const color = CAT_VAR[catOf(id)], rb = rank(before, id), ra = rank(after, id);
      const up = rb && ra ? rb - ra : 0;
      if (rb && ra) lines += `<line x1="${xl}" y1="${yL(id)}" x2="${xr}" y2="${yR(id)}" stroke="${color}" stroke-width="${Math.abs(up) >= 2 ? 4 : 2}"/>`;
      if (rb) labels += `<circle cx="${xl}" cy="${yL(id)}" r="6" fill="${color}" stroke="var(--chart-surface)" stroke-width="2"/><text x="${xl - 14}" y="${yL(id) + 6}" text-anchor="end" class="rp-lab sm">#${rb} ${esc(trunc(shortOf(id), 19))}</text>`;
      if (ra) {
        const arrow = !rb ? ' new' : up >= 2 ? ` ▲${up}` : up <= -2 ? ` ▼${-up}` : '';
        labels += `<circle cx="${xr}" cy="${yR(id)}" r="6" fill="${color}" stroke="var(--chart-surface)" stroke-width="2"/><text x="${xr + 14}" y="${yR(id) + 6}" class="rp-lab sm${up >= 2 || !rb ? ' up' : ''}">#${ra} ${esc(trunc(shortOf(id), 17))}${arrow}</text>`;
      }
    });
    return `<svg class="rp-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Where key posts sat in the feed, before and after this stage">
      <text x="${xl}" y="22" text-anchor="middle" class="rp-colhead">place in feed · start</text><text x="${xr}" y="22" text-anchor="middle" class="rp-colhead">end</text>
      ${lines}${labels}</svg>`;
  }
  function playbackHTML(r, t) {
    // the feed as it was at time t, with the screen's window drawn on it
    let ord = r.orders[0] ? r.orders[0].seq : [];
    for (const o of r.orders) { if (o.t <= t) ord = o.seq; else break; }
    let sample = null;
    for (const s of r.tl) { if (s.t <= t) sample = s; else break; }
    const vis = new Set(sample ? sample.v : []), ctr = sample ? sample.c : null;
    const chips = ord.slice(0, 14).map(id => `<div class="pb-chip ${vis.has(id) ? 'vis' : ''} ${ctr === id ? 'ctr' : ''}" style="--c:${CAT_VAR[catOf(id)]}">${catOf(id) === 'ad' ? '<b>AD</b> ' : ''}${esc(trunc(shortOf(id), 30))}${ctr === id ? ' 👀' : ''}</div>`).join('');
    return `<div class="pb"><div class="pb-clock">▶ ${minsec(t)} <small>of ${minsec(r.active)} · 10× speed</small></div>${chips}</div>`;
  }

  /* ---------- chapters ---------- */
  function stageRows(s) {
    const r = S.rec[s];
    return Object.entries(r.att).map(([id, a]) => ({ id, label: shortOf(id), v: secs(a.focus + a.hover * 0.5), cat: catOf(id) }))
      .filter(x => x.v > 0).sort((a, b) => b.v - a.v).slice(0, 8);
  }
  function signalsIn(s) { const r = S.rec[s]; return S.signals.slice(r.sig0, r.sig1 == null ? undefined : r.sig1); }
  function concluded(s) {
    const sig = signalsIn(s), r = S.rec[s];
    const counts = {};
    sig.forEach(x => { counts[x.type] = (counts[x.type] || 0) + 1; });
    const parts = Object.entries(counts).map(([t, n]) => `${n}× ${t}`).join(' · ') || 'no new signals';
    const a = Math.round(L.storyShare(r.i0) * 100), b = Math.round(L.storyShare(r.i1 || S.interest) * 100);
    return `<b>Lens concluded:</b> ${esc(parts)} · Lens’s guess that Theo wants #GagaGate: <b>${a}% → ${b}%</b>${r.early ? ' <span class="rp-early">(advanced before Lens was sure; it confirmed anyway)</span>' : ''}`;
  }

  function render() {
    stopPlay();
    const c = chapters[idx], el = root();
    S.replay = idx; L.save();
    let html = '';
    const g = (s) => L.goals[s];
    const rv = (s) => L.reveal[s];
    switch (c.k) {
      case 'intro': {
        const total = [1, 2, 3, 4, 5, 6, 7].reduce((a, s) => a + (S.rec[s] ? S.rec[s].active : 0), 0);
        html = `<div class="rp-hero"><div class="rp-logo">Your Lens Replay ✨</div><p>${minsec(total)} as Theo.<br>Here’s everything Lens noticed, and what it did with it.</p><small>Press → to go through it.</small></div>`;
        break;
      }
      case 'start': {
        const dwell = S.signals.find(x => x.type === 'dwell' && x.id === 'french');
        const sec = dwell ? secs(dwell.t - ((S.s1 && S.s1.shownAt) || 0)) : secs((S.it.french || {}).screen || 0);
        const tags = S.s1 ? S.s1.sent : 0, taps = S.s1 ? S.s1.clicks : 0;
        html = `<div class="rp-chapter"><div class="rp-head"><span class="rp-st">Stage 1</span><span class="rp-goal">“${esc(g(1))}”</span></div>
          <div class="rp-tiles"><div class="rp-tile"><b>${sec}s</b><span>looking at Mr. French’s post before Lens decided Theo wanted more</span></div>
          <div class="rp-tile"><b>0</b><span>clicks needed</span></div><div class="rp-tile"><b>${tags}</b><span>notifications pulling Theo to it${taps ? `, ${taps} tapped` : ''}</span></div></div>
          ${S.rec[1] && S.rec[1].early ? '<p class="rp-big">The class moved on before the 90 seconds were up. Lens decided anyway.</p>' : '<p class="rp-big">Nobody clicked anything. Looking was enough.</p>'}</div>`;
        break;
      }
      case 'stage': {
        const s = c.s, r = S.rec[s];
        const before = r.orders.length ? r.orders[0].seq : [], after = r.orders.length ? r.orders[r.orders.length - 1].seq : [];
        const rows = stageRows(s);
        const cats = Array.from(new Set(rows.map(x => x.cat).concat(before.slice(0, 10).map(catOf), after.slice(0, 10).map(catOf))));
        html = `<div class="rp-chapter"><div class="rp-head"><span class="rp-st">Stage ${s}</span><span class="rp-goal">“${esc(g(s))}”</span><span class="rp-time">${minsec(r.active)}</span></div>
          ${legend(['teacher', 'story', 'other', 'ad'].filter(x => cats.includes(x)))}
          <div class="rp-grid"><section><h3>Where you looked <small>seconds</small></h3>${barsSVG(rows)}</section>
          <section class="rp-right"><h3>What Lens did with it <small>Space ▶ watch it again</small></h3><div class="rp-slope">${slopeSVG(before, after, rows.slice(0, 3).map(x => x.id))}</div></section></div>
          <div class="rp-concl">${concluded(s)}</div></div>`;
        break;
      }
      case 'crops': {
        const r = S.rec[2];
        const pause = (id) => r && r.att[id] ? secs(r.att[id].focus) : 0;
        const box = (crop, label, color) => { const [x, y, w, hh] = L.crops[crop].split(' ').map(Number); return `<rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="none" stroke="${color}" stroke-width="10"/><rect x="${x}" y="${y - 52}" width="${label.length * 19 + 24}" height="48" fill="${color}"/><text x="${x + 12}" y="${y - 18}" font-size="32" font-weight="800" fill="#fff" font-family="system-ui, sans-serif">${esc(label)}</text>`; };
        html = `<div class="rp-chapter"><div class="rp-head"><span class="rp-st">Stage 2</span><span class="rp-goal">Every repost was a real photo. Just less of it.</span></div>
          <div class="rp-crops"><div class="rp-photo">${L.sceneSVG('full').replace('</svg>', box('maya', "Maya's repost", '#1a6fd6') + box('jaxon', "Jaxon's", '#c2410c') + box('gossip', 'Gossip', '#b91c1c') + '</svg>')}</div>
          <div class="rp-croplist"><p><b>Mr. French:</b> the whole photo. Theo laughing, thumbs up, the wall being fixed, the rematch board.</p>
          <p><b>Maya:</b> a bit tighter. Theo still laughing. <small>You looked ${pause('maya')}s.</small></p>
          <p><b>Jaxon:</b> the laugh and the thumbs up cut off. Louder caption. <small>You looked ${pause('jaxon')}s.</small></p>
          <p><b>Gossip:</b> just the fallen panel and Theo’s sneakers. Red filter. “KID HURT.” <small>You looked ${pause('gossip')}s.</small></p></div></div></div>`;
        break;
      }
      case 'words': {
        const rp = S.reply, r = S.rec[4] || { att: {} };
        const deleted = rp.drafts.filter(d => d !== rp.text);
        html = `<div class="rp-chapter"><div class="rp-head"><span class="rp-st">Stage 4</span><span class="rp-goal">What Theo said, and what got passed on</span></div>
          ${rp.posted ? `<div class="rp-words"><div><h3>Theo wrote</h3><blockquote>${esc(rp.text)}</blockquote></div><div><h3>Lens quoted</h3><blockquote class="loud">“…${esc(rp.chunk)}…” 👀</blockquote></div></div>` : '<p class="rp-big">Theo didn’t post a reply. Lens still counted every keystroke he started.</p>'}
          <div class="rp-tiles"><div class="rp-tile"><b>${rp.keys}</b><span>keystrokes counted</span></div><div class="rp-tile"><b>${rp.drafts.length}</b><span>drafts saved${deleted.length ? `, ${deleted.length} of them deleted by Theo` : ''}</span></div>
          <div class="rp-tile"><b>${secs((r.att.gossip || { focus: 0 }).focus)}s</b><span>in the thread</span></div><div class="rp-tile"><b>${rp.posted ? rp.after : 0}</b><span>replies after Theo’s. The kind one sorted last.</span></div></div>
          ${deleted.length ? `<div class="rp-drafts"><h3>Words Theo deleted, which Lens kept</h3>${deleted.slice(-3).map(d => `<blockquote class="del">${esc(d)}</blockquote>`).join('')}</div>` : ''}</div>`;
        break;
      }
      case 'numbers':
        html = `<div class="rp-chapter"><div class="rp-head"><span class="rp-st">Stage 5</span><span class="rp-goal">Who actually liked it</span></div>
          <div class="rp-tiles four"><div class="rp-tile"><b>48,212</b><span>likes shown</span></div><div class="rp-tile"><b>48,200</b><span>bought for $19.99</span></div>
          <div class="rp-tile hot"><b>12</b><span>real people</span></div><div class="rp-tile"><b>46</b><span>kids who actually played gaga that day</span></div></div>
          <p class="rp-big">Theo checked who liked it <b>${S.likesOpened}×</b>. Each check told Lens he cared about the numbers.</p></div>`;
        break;
      case 'feeds': {
        const start = S.rec[2] && S.rec[2].orders[0] ? S.rec[2].orders[0].seq : [];
        const end = S.rec[6] && S.rec[6].orders.length ? S.rec[6].orders[S.rec[6].orders.length - 1].seq : [];
        const col = (seq) => seq.slice(0, 9).map(id => `<div class="pb-chip vis" style="--c:${CAT_VAR[catOf(id)]}">${catOf(id) === 'ad' ? '<b>AD</b> ' : ''}${esc(trunc(shortOf(id), 30))}</div>`).join('');
        html = `<div class="rp-chapter"><div class="rp-head"><span class="rp-st">Stage 6</span><span class="rp-goal">Theo’s feed, before and after</span></div>
          ${legend(['teacher', 'story', 'other', 'ad'])}
          <div class="rp-grid"><section><h3>When Theo started scrolling</h3><div class="pb">${col(start)}</div></section><section><h3>By stage 6</h3><div class="pb">${col(end)}</div></section></div>
          <p class="rp-big">${S.searches.length ? `Theo searched for <b>${S.searches.map(q => '“' + esc(q) + '”').join(', ')}</b> and got #GagaGate.` : 'Lens hid everything that wasn’t #GagaGate.'} Meanwhile June’s, Mr. French’s and Sam’s feeds were barely about it.</p></div>`;
        break;
      }
      case 'exit': {
        const r = S.rec[7], s7 = S.s7;
        const unwind = r && r.att['ad:unwind'] ? secs(r.att['ad:unwind'].screen) : 0;
        const stays = s7.dialogs.filter(d => d.choice === 'stay').length;
        html = `<div class="rp-chapter"><div class="rp-head"><span class="rp-st">Stage 7</span><span class="rp-goal">“${esc(g(7))}”</span></div>
          <div class="rp-tiles four"><div class="rp-tile"><b>${minsec(r ? r.active : 0)}</b><span>to get out</span></div><div class="rp-tile"><b>${s7.pulls}</b><span>times Lens pulled Theo back</span></div>
          <div class="rp-tile"><b>${s7.notifCount}</b><span>notifications</span></div><div class="rp-tile"><b>${s7.autoCount}</b><span>signals pushed with nobody touching anything</span></div></div>
          <p class="rp-big">${stays ? `The big bright button won <b>${stays}×</b>.` : 'The class never clicked the big bright button. Nice.'} ${unwind ? `An ad for a calm-down app was on screen for <b>${unwind}s</b>` : 'Lens started lining up ads for a calm-down app'} while the app worked to stress him out.</p></div>`;
        break;
      }
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
        let longest = null;
        Object.entries(S.it).forEach(([id, x]) => { if (x.pause && (!longest || x.pause > longest[1])) longest = [id, x.pause]; });
        const dwell = sig.find(x => x.type === 'dwell' && x.id === 'french');
        const ads = L.ads.map(a => [a, a.bid * (0.2 + Object.entries(a.topics).reduce((m, [t, w]) => m + (S.interest[t] || 0) * w, 0))]).sort((a, b) => b[1] - a[1]).slice(0, 3).map(x => x[0].brand);
        const deleted = S.reply.drafts.filter(d => d !== S.reply.text).length;
        const rows = [
          ['dwell', dwell ? `${secs(dwell.t)}s on Mr. French’s post` : 'Mr. French’s post'],
          ['pause', `×${count('pause')} on posts${longest ? ` (longest: ${secs(longest[1])}s on “${shortOf(longest[0])}”)` : ''}`],
          ['react', reacts.length ? reacts.join(', ') : 'none'],
          ['typing', `${S.reply.keys} keystrokes, ${S.reply.drafts.length} drafts saved${deleted ? ` (incl. ${deleted} deleted)` : ''}`],
          ['comment', S.reply.posted ? `1 reply → quoted, ${S.reply.after} replies` : 'none'],
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
          <div class="ptext">${esc(L.posts[0].text)}</div><div class="pimg">${L.sceneSVG('full')}</div><div class="pf"><div class="counts"><span class="likes">❤️ <b>23</b></span></div></div></article>
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
    el.innerHTML = `<div class="rp-wrap">${html}</div><div class="rp-nav">${idx + 1} / ${chapters.length} · ← →</div>`;
  }

  function revealBlock(s) {
    const r = L.reveal[s];
    return `<div class="rp-reveal"><div><small>What this really is</small><b>${esc(r.name)}</b><p>${esc(r.line)}</p></div><div class="rp-truth"><small>What was true</small><p>${esc(r.truth)}</p></div></div>`;
  }

  function stopPlay() { if (playing) { clearInterval(playing); playing = null; } }
  function play() {
    const c = chapters[idx];
    if (!c || c.k !== 'stage') return;
    const slot = root().querySelector('.rp-slope');
    if (playing) { stopPlay(); render(); return; }
    const r = S.rec[c.s];
    let t = 0;
    const step = 100, speed = 10;
    playing = setInterval(() => {
      t += step * speed;
      slot.innerHTML = playbackHTML(r, Math.min(t, r.active));
      if (t >= r.active) { stopPlay(); setTimeout(() => { if (chapters[idx] === c) render(); }, 2500); }
    }, step);
  }

  L.Replay = {
    open(at) {
      build();
      idx = Math.min(at || 0, chapters.length - 1);
      L.setStage(8);
      $('#loggedout').hidden = true;
      root().hidden = false;
      render();
    },
    next() { if (idx < chapters.length - 1) { idx++; render(); } },
    prev() { if (idx > 0) { idx--; render(); } },
    play,
    jumpToEnd() { const i = chapters.findIndex(c => c.k === 'off'); if (i >= 0) { idx = i; render(); } },
    close() { stopPlay(); root().hidden = true; },
  };
})();
