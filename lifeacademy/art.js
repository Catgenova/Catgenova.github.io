/* Lens: the art. Mr. French's field-day photo (one SVG, cropped for every repost),
   the looping "crash video", picture cards for other posts, and avatars. */
'use strict';
window.LENS = window.LENS || {};

/* Crops of the one photo. viewBox = x y w h in the 1600×900 scene. */
LENS.crops = {
  full:    '0 0 1600 900',
  maya:    '430 360 940 529',
  jaxon:   '880 600 400 225',
  gossip:  '950 668 300 169',
  gossip2: '900 585 400 225',
};
LENS.cropFilters = {
  full: '', maya: 'brightness(1.12) saturate(1.3)',
  jaxon: 'contrast(1.45) saturate(1.25)',
  gossip: 'sepia(.45) hue-rotate(-28deg) saturate(1.9) contrast(1.35)',
  gossip2: 'sepia(.35) hue-rotate(-24deg) saturate(1.7) contrast(1.3)',
};

(function () {
  function kid(x, y, o) {
    // o: skin, hair, shirt, s (scale), hairStyle
    const s = o.s || 1, r = 26 * s;
    const hair = o.long
      ? `<path d="M${x - r - 4} ${y + r * 0.9} Q${x - r - 6} ${y - r * 1.25} ${x} ${y - r - 6} Q${x + r + 6} ${y - r * 1.25} ${x + r + 4} ${y + r * 0.9} L${x + r - 2} ${y} Q${x} ${y - r * 0.55} ${x - r + 2} ${y} Z" fill="${o.hair}"/>`
      : `<path d="M${x - r} ${y - 2} Q${x - r} ${y - r - 8} ${x} ${y - r - 6} Q${x + r} ${y - r - 8} ${x + r} ${y - 2} Q${x} ${y - r * 0.5} ${x - r} ${y - 2} Z" fill="${o.hair}"/>`;
    return `<g>
      <rect x="${x - 30 * s}" y="${y + r - 2}" width="${60 * s}" height="${70 * s}" rx="${16 * s}" fill="${o.shirt}"/>
      <circle cx="${x}" cy="${y}" r="${r}" fill="${o.skin}"/>
      ${hair}
      <path d="M${x - 12 * s} ${y - 2} q5 -6 10 0 M${x + 2 * s} ${y - 2} q5 -6 10 0" stroke="#2b1d16" stroke-width="${3 * s}" fill="none" stroke-linecap="round"/>
      <path d="M${x - 11 * s} ${y + 8 * s} Q${x} ${y + 24 * s} ${x + 11 * s} ${y + 8 * s} Z" fill="#7a1f1f"/>
    </g>`;
  }

  function planks(x1, y1, x2, y2, h, n, cls) {
    let out = '';
    for (let i = 0; i < n; i++) {
      const ax = x1 + (x2 - x1) * i / n, ay = y1 + (y2 - y1) * i / n;
      const bx = x1 + (x2 - x1) * (i + 1) / n, by = y1 + (y2 - y1) * (i + 1) / n;
      const shade = i % 2 ? '#b07a45' : '#c08a52';
      out += `<polygon class="${cls || ''}" points="${ax},${ay} ${bx},${by} ${bx},${by - h} ${ax},${ay - h}" fill="${shade}" stroke="#6e4524" stroke-width="3"/>`;
    }
    return out;
  }

  const skins = ['#f1c7a3', '#c98e62', '#8d5a3b', '#e9b48d', '#5c3a26', '#f4d2b5'];
  const hairs = ['#3b2416', '#141010', '#a0602c', '#e0b25a', '#2a1a10', '#5a3a22'];
  const shirts = ['#e8574a', '#3b82c4', '#f2b134', '#7a5cc4', '#2fa37a', '#e86fa0'];

  LENS.sceneSVG = function (crop, extraClass) {
    const vb = LENS.crops[crop] || crop;
    let kidsBack = '';
    const backX = [540, 640, 740, 850, 960, 1060];
    backX.forEach((x, i) => {
      kidsBack += kid(x, 392 + (i % 2) * 8, { skin: skins[i], hair: hairs[i], shirt: shirts[i], s: 1, long: i % 3 === 1 });
    });
    const kidsSide = kid(390, 560, { skin: skins[3], hair: hairs[2], shirt: shirts[4], s: 1.2, long: true })
      + kid(1230, 548, { skin: skins[1], hair: hairs[1], shirt: shirts[2], s: 1.2 });

    return `<svg class="scene ${extraClass || ''}" viewBox="${vb}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Field day photo">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bcd6ec"/><stop offset="1" stop-color="#eef3f2"/></linearGradient>
    <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#86b860"/><stop offset="1" stop-color="#5f9441"/></linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#sky)"/>
  <g fill="#fff" opacity=".85"><ellipse cx="260" cy="90" rx="120" ry="34"/><ellipse cx="330" cy="70" rx="80" ry="30"/><ellipse cx="1180" cy="120" rx="140" ry="36"/><ellipse cx="1260" cy="98" rx="90" ry="30"/></g>
  <g fill="#5d8f4a"><circle cx="40" cy="330" r="70"/><circle cx="150" cy="315" r="80"/><circle cx="700" cy="330" r="60"/><circle cx="1500" cy="320" r="90"/><circle cx="1600" cy="335" r="70"/><circle cx="1130" cy="335" r="55"/></g>
  <g><rect x="380" y="262" width="250" height="100" fill="#e9dcc4" stroke="#8a7458" stroke-width="3"/><polygon points="370,264 505,214 640,264" fill="#a2463a"/>
     <rect x="420" y="276" width="170" height="26" fill="#2a78d6"/><text x="505" y="295" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="17" fill="#fff">LIFE ACADEMY</text>
     <rect x="482" y="318" width="46" height="44" fill="#6b4a32"/></g>
  <rect y="355" width="1600" height="545" fill="url(#grass)"/>
  <g fill="#7a5636" opacity=".85"><ellipse cx="800" cy="720" rx="330" ry="70"/><ellipse cx="560" cy="770" rx="140" ry="30"/><ellipse cx="1110" cy="800" rx="170" ry="34"/><ellipse cx="240" cy="560" rx="90" ry="18"/></g>
  <g fill="#8fb2c9" opacity=".7"><ellipse cx="250" cy="600" rx="70" ry="12"/><ellipse cx="1320" cy="790" rx="60" ry="10"/><ellipse cx="470" cy="830" rx="50" ry="8"/></g>

  <!-- chalkboard: the mud warning -->
  <g><rect x="120" y="430" width="10" height="90" fill="#6b4a32"/><rect x="300" y="430" width="10" height="90" fill="#6b4a32"/>
     <rect x="90" y="300" width="250" height="150" rx="6" fill="#2f4a3a" stroke="#8a6a44" stroke-width="10"/>
     <text x="215" y="355" text-anchor="middle" font-family="'Comic Sans MS','Chalkboard SE',cursive" font-size="30" fill="#f4f1e8" font-weight="700">CAUTION: MUD</text>
     <text x="215" y="400" text-anchor="middle" font-family="'Comic Sans MS','Chalkboard SE',cursive" font-size="26" fill="#f4f1e8">pit opens at 11</text></g>

  <!-- bracket board -->
  <g><rect x="1310" y="400" width="10" height="110" fill="#6b4a32"/><rect x="1520" y="400" width="10" height="110" fill="#6b4a32"/>
     <rect x="1280" y="240" width="280" height="175" rx="6" fill="#fbfbf7" stroke="#6b4a32" stroke-width="8"/>
     <path d="M1300 280h40v30h40 M1300 340h40v-30 M1300 370h40v20h40 M1300 410h40v-20 M1380 310v40h40 M1380 380v-30" stroke="#2a78d6" stroke-width="4" fill="none" transform="translate(0,-10)"/>
     <text x="1490" y="300" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#222">CHAMPIONSHIP</text>
     <text x="1490" y="332" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="800" fill="#d23b3b">REMATCH</text>
     <text x="1490" y="362" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#222">2:15</text></g>

  <!-- the pit: back wall, kids, side walls, floor -->
  <ellipse cx="800" cy="560" rx="360" ry="110" fill="#6e4d30"/>
  ${kidsBack}
  ${planks(470, 500, 1130, 500, 80, 8)}
  ${planks(420, 690, 470, 500, 82, 2)}
  ${planks(1130, 500, 1180, 690, 82, 2)}
  ${planks(420, 690, 990, 690, 92, 6, 'front')}
  <!-- the gap where the panel came off: you can see into the muddy pit, with splintered edges on both posts.
       The crash video still starts with the panel standing, then knocks it over. -->
  <g class="gap"><polygon points="990,690 1110,690 1110,598 990,598" fill="#5e4128"/><ellipse cx="1050" cy="660" rx="52" ry="16" fill="#4a321e"/>
    <polygon points="990,598 999,612 990,626 1000,640 990,654" fill="#c08a52" stroke="#6e4524" stroke-width="3" stroke-linejoin="round"/>
    <polygon points="1110,610 1101,624 1110,638 1100,652 1110,668" fill="#b07a45" stroke="#6e4524" stroke-width="3" stroke-linejoin="round"/>
    <rect x="984" y="590" width="12" height="104" rx="3" fill="#8a5a30"/><rect x="1104" y="590" width="12" height="104" rx="3" fill="#8a5a30"/></g>
  <g class="upright"${extraClass && extraClass.indexOf('crashvid') >= 0 ? '' : ' style="display:none"'}>${planks(990, 690, 1110, 690, 92, 1)}</g>
  ${planks(1110, 690, 1180, 690, 92, 1)}
  ${kidsSide}

  <!-- the fallen panel -->
  <g class="fallen"><polygon points="985,742 1150,742 1192,792 1015,792" fill="#c08a52" stroke="#6e4524" stroke-width="4"/>
    <line x1="1000" y1="760" x2="1168" y2="760" stroke="#8a5a30" stroke-width="3"/><line x1="1008" y1="776" x2="1180" y2="776" stroke="#8a5a30" stroke-width="3"/></g>

  <!-- Theo, laughing, thumbs up -->
  <g class="theo">
    <g fill="#5a3b22" opacity=".9"><ellipse cx="880" cy="768" rx="140" ry="20"/><circle cx="730" cy="760" r="10"/><circle cx="1010" cy="770" r="8"/><circle cx="700" cy="740" r="6"/></g>
    <rect x="790" y="712" width="190" height="48" rx="22" fill="#2fa3a0"/>
    <rect x="972" y="716" width="38" height="40" rx="10" fill="#33415e"/>
    <rect x="1005" y="722" width="40" height="16" rx="7" fill="#e3ab84"/><rect x="1005" y="740" width="40" height="15" rx="7" fill="#e3ab84"/>
    <ellipse cx="1060" cy="730" rx="20" ry="11" fill="#f4f4f4" stroke="#5a3b22" stroke-width="4"/><ellipse cx="1060" cy="750" rx="20" ry="11" fill="#f4f4f4" stroke="#5a3b22" stroke-width="4"/>
    <path d="M1045 734 q10 4 28 -2 M1045 754 q10 4 28 -2" stroke="#7a5636" stroke-width="5" fill="none"/>
    <path d="M815 718 L835 650" stroke="#2fa3a0" stroke-width="24" stroke-linecap="round"/>
    <g class="thumbsup">
      <!-- a small thumbs-up: a big fist with curled fingers, and only a short, stubby thumb tip leaning off its top corner -->
      <rect x="816" y="626" width="42" height="34" rx="11" fill="#e3ab84" stroke="#b5835f" stroke-width="2"/>
      <path d="M836 636 h17 M836 644 h17 M836 652 h15" stroke="#b5835f" stroke-width="3" stroke-linecap="round"/>
      <path d="M818 632 C 813 624, 814 615, 820 613 C 826 611, 830 617, 829 626 Z" fill="#e3ab84" stroke="#b5835f" stroke-width="2" stroke-linejoin="round"/>
    </g>
    <circle cx="768" cy="728" r="30" fill="#e3ab84"/>
    <path d="M740 716 Q748 688 778 694 Q800 700 798 718 Q780 705 760 712 Z" fill="#6b3e1f"/>
    <path d="M752 724 q5 -6 10 0 M770 722 q5 -6 10 0" stroke="#2b1d16" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M750 736 Q766 762 784 734 Z" fill="#7a1f1f"/><path d="M754 737 Q766 744 780 736" stroke="#fff" stroke-width="3" fill="none"/>
    <circle cx="745" cy="745" r="5" fill="#7a5636"/>
  </g>

  <!-- the ball -->
  <g class="ball"><circle cx="1080" cy="612" r="20" fill="#d9442b"/><path d="M1102 600 q20 -6 34 -2 M1104 616 q22 0 36 6" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/></g>

  <!-- Mr. French with a drill, on his way to fix the wall -->
  <g class="fixer">
    <rect x="1405" y="625" width="18" height="90" rx="8" fill="#3d3d4a" transform="rotate(8 1414 625)"/><rect x="1432" y="625" width="18" height="90" rx="8" fill="#3d3d4a" transform="rotate(-10 1441 625)"/>
    <rect x="1395" y="505" width="64" height="128" rx="18" fill="#5b7fa8"/>
    <circle cx="1427" cy="478" r="28" fill="#c98e62"/>
    <path d="M1397 470 Q1400 440 1428 442 Q1458 444 1458 470 Z" fill="#2a2a2a"/><rect x="1440" y="462" width="34" height="9" rx="4" fill="#2a2a2a"/>
    <path d="M1416 482 q4 4 9 0" stroke="#2b1d16" stroke-width="3" fill="none"/>
    <path d="M1400 530 L1365 590" stroke="#5b7fa8" stroke-width="18" stroke-linecap="round"/>
    <g transform="translate(1330 580)"><rect x="0" y="0" width="46" height="22" rx="5" fill="#f2b134"/><rect x="-26" y="7" width="28" height="8" fill="#999"/><rect x="26" y="18" width="16" height="30" rx="4" fill="#333"/></g>
  </g>
</svg>`;
  };

  /* Stage 7: the crash, on a loop. */
  LENS.crashVideoSVG = function () {
    return LENS.sceneSVG('640 520 700 394', 'crashvid');
  };

  /* Picture cards for posts that aren't the photo. Big, simple, readable on a projector. */
  const cards = {
    cat:     ['#f6d9b8', '#e9a978', '<span style="font-size:4.2em">🛋️</span><span class="fly" style="font-size:3.4em">🐈</span><span style="font-size:2em">💨</span>'],
    volcano: ['#2e2e48', '#7a4a6a', '<span style="font-size:4.4em">🌋</span><span style="font-size:2.2em">🧪✨</span>'],
    band:    ['#1d1d3a', '#5a2f73', '<span style="font-size:3.6em">🎻</span><span style="font-size:2.6em">🎶</span><span style="font-size:3em">🎻</span>'],
    math:    ['#ffffff', '#f2f2f2', '<div class="meme"><div><b>my answer</b><span>✅</span></div><div><b>how I got it</b><span>🫠</span></div></div>'],
    soccer:  ['#7cc06a', '#3f8a3a', '<span style="font-size:3.6em">🥅</span><span style="font-size:2.8em">⚽</span><span style="font-size:2.4em">😵‍💫</span>'],
    dragon:  ['#fffbe8', '#f3e9c2', '<span style="font-size:4.6em">🐉</span><span style="font-size:2em">✏️</span>'],
    trophy:  ['#ffe9a8', '#f5c542', '<span style="font-size:4.6em">🏆</span><span style="font-size:2.4em">🎉</span>'],
    cake:    ['#ffe0ec', '#f7a8c6', '<span style="font-size:4.6em">🎂</span>'],
    lesson:  ['#eef3fb', '#cfdcf2', '<span style="font-size:3.6em">📝</span><b style="font-size:1.4em;color:#234">Persuasive writing</b>'],
    game:    ['#14142a', '#3a2a8c', '<span style="font-size:3.8em">🎮</span><b style="font-size:1.8em;color:#9cf">PB 4:31</b>'],
    dog:     ['#cfe8f7', '#8cc3e6', '<span style="font-size:4.4em">🐕</span><span style="font-size:2em">💨</span>'],
    roomba:  ['#e8eef3', '#c5d3de', '<span style="font-size:4.2em">🤖</span><b style="font-size:1.6em;color:#234">“Steve”</b><span style="font-size:2.2em">🧹✨</span>'],
    skate:   ['#cfd6dc', '#8d99a3', '<span style="font-size:4em">🛹</span><span style="font-size:3em">💥</span><span style="font-size:2.4em">🤕</span>'],
    knight:  ['#f5ecd7', '#e2cc98', '<span style="font-size:4.2em">🐕</span><span style="font-size:3em">⚔️🛡️</span><span style="font-size:2.2em">👑</span>'],
    pancakes:['#fff1d6', '#f6c97a', '<span style="font-size:4.2em">🥞</span><span style="font-size:2.4em">👨‍👩‍👧‍👦</span><span style="font-size:2.6em">⭕</span>'],
  };
  LENS.cardHTML = function (key) {
    const c = cards[key];
    if (!c) return '';
    return `<div class="picture-card" style="background:linear-gradient(135deg,${c[0]},${c[1]})">${c[2]}</div>`;
  };

  LENS.botSVG = '<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" fill="#cfd3d8"/><circle cx="20" cy="15" r="7" fill="#9aa1a9"/><path d="M7 38 Q8 24 20 24 Q32 24 33 38 Z" fill="#9aa1a9"/></svg>';

  LENS.avatar = function (key, cls) {
    const p = LENS.people[key];
    cls = 'avatar ' + (cls || '');
    if (!p) return `<span class="${cls} bot">${LENS.botSVG}</span>`;
    if (p.img) return `<img class="${cls}" src="img/${p.img}.webp" alt="">`;
    if (p.icon) return `<span class="${cls} icon" style="background:${p.color}">${p.icon}</span>`;
    return `<span class="${cls} initials" style="background:${p.color}">${p.initials}</span>`;
  };
})();
