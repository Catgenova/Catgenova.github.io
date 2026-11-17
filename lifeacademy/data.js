/* Lens: all the content. People, posts, ads, comments, and the other feeds for stage 6.
   Everyone here is made up. Faces are stock photos from Pexels (see _source/lifeacademy/photo-credits.md). */
'use strict';
window.LENS = window.LENS || {};

LENS.people = {
  theo:    { name: 'Theo',          handle: 'theo',               img: 'theo' },
  french:  { name: 'Mr. French',    handle: 'mrfrench',           initials: 'MF', color: '#2a78d6', note: 'Life Academy' },
  gossip:  { name: 'LA Gossip',     handle: 'lifeacademy.gossip', icon: '📣', color: '#d23b3b' },
  maya:    { name: 'Maya K.',       handle: 'maya.k',             img: 'maya' },
  jaxon:   { name: 'Jaxon',         handle: 'jaxon_',             img: 'jaxon' },
  ella:    { name: 'Ella R.',       handle: 'ella.r',             img: 'ella' },
  noah:    { name: 'Noah B.',       handle: 'noah_b',             img: 'noah' },
  kai:     { name: 'Kai',           handle: 'kai.plays',          img: 'kai' },
  june:    { name: 'June',          handle: 'june.plays.gaga',    img: 'june' },
  sam:     { name: 'Sam',           handle: 'sam',                img: 'sam' },
  lily:    { name: 'Lily',          handle: 'lily.b',             img: 'lily' },
  rosie:   { name: 'Rosie',         handle: 'rosie.makes',        img: 'rosie' },
  dev:     { name: 'Dev',           handle: 'dev.builds',         img: 'dev' },
  zara:    { name: 'Zara',          handle: 'zara.z',             img: 'zara' },
  nora:    { name: 'Nora',          handle: 'nora.plays',         img: 'nora' },
  ben:     { name: 'Ben',           handle: 'ben.kicks',          img: 'ben' },
  ava:     { name: 'Ava P.',        handle: 'ava.p',              initials: 'AP', color: '#8a5cc2' },
  // Random kids from other schools: they only show up in the everyday feed.
  toby:    { name: 'Toby',          handle: 'tobyyy',             img: 'toby' },
  lulu:    { name: 'Lulu',          handle: 'lulu.draws',         img: 'lulu' },
  quinn:   { name: 'Quinn',         handle: 'sleepy.quinn',       img: 'quinn' },
  marcus:  { name: 'Marcus',        handle: 'marcus.moves',       img: 'marcus' },
  ivy:     { name: 'Ivy',           handle: 'ivy.r',              img: 'ivy' },
  benji:   { name: 'Benji',         handle: 'benji.b',            img: 'benji' },
};

/* Topics drive the ranking. Interest starts spread out; signals move it. */
LENS.startInterest = { gaga: 0.15, theo: 0, drama: 0, school: 0.3, pets: 0.25, science: 0.2, music: 0.2, sports: 0.25, art: 0.2, games: 0.3, memes: 0.25, stress: 0 };

/* cat: 'teacher' | 'story' | 'other' (ads are 'ad'). Used for colors in the replay. */
/* img: { photo: 'full'|'maya'|'jaxon'|'gossip' } or { card: key } */
LENS.posts = [
  // Stage 1: an ordinary, goofy morning feed. pos 'above' sits over Mr. French's post; the rest go below it.
  { id: 's1toby', who: 'toby', time: 'Today · 7:48 AM', min: 1428, stage: 1, pos: 'above', cat: 'other', short: 'Roomba named Steve',
    topics: { pets: 0.5, memes: 1 }, text: "my mom said no pets so I named the roomba Steve 🤖 he's thriving",
    img: { card: 'roomba' }, r: { like: 64, laugh: 81 }, shares: 12, comments: 19, big: 2140 },
  { id: 'french', who: 'french', time: 'Today · 7:52 AM', min: 1432, stage: 1, cat: 'teacher', short: "Mr. French's post",
    topics: { gaga: 1, school: 0.5 },
    text: "Theo's championship-winning dive 🏆 (he didn't win… the wall did 😂). Wall fixed in 10 minutes (I brought my drill 🔧), rematch at 2:15. Best field day yet! #LifeAcademyFieldDay\n\n(No photos allowed in the pit, so I drew the picture below to show what happened ✏️)",
    img: { photo: 'full' }, r: { like: 19, laugh: 4 }, shares: 0, comments: 3, big: 23 },

  { id: 's1kai', who: 'kai', time: 'Today · 7:31 AM', min: 1411, stage: 1, cat: 'other', short: 'Kickflip, day 3',
    topics: { sports: 1 }, text: 'day 3 of trying to land a kickflip. the driveway is winning 🛹',
    img: { card: 'skate' }, r: { like: 22, laugh: 30 }, shares: 1, comments: 7, big: 410 },
  { id: 's1lulu', who: 'lulu', time: 'Today · 7:20 AM', min: 1400, stage: 1, cat: 'other', short: 'Dog as a knight',
    topics: { art: 1, pets: 0.5 }, text: "drew my dog as a medieval knight. he has no idea he's been knighted ⚔️",
    img: { card: 'knight' }, r: { like: 58, laugh: 21 }, shares: 6, comments: 12, big: 1320 },
  { id: 's1quinn', who: 'quinn', time: 'Today · 7:02 AM', min: 1382, stage: 1, cat: 'other', short: 'Who decided 7am',
    topics: { school: 0.5, memes: 1 }, text: 'who decided 7am was a real time', r: { like: 90, laugh: 44 }, shares: 15, comments: 23, big: 3060 },
  { id: 's1lily', who: 'lily', time: 'Today · 6:55 AM', min: 1375, stage: 1, cat: 'other', short: 'Family pancakes',
    topics: { memes: 0.6 }, text: 'made pancakes shaped like everyone in my family. dad is a circle 🥞',
    img: { card: 'pancakes' }, r: { like: 40, laugh: 52 }, shares: 3, comments: 9, big: 870 },
  { id: 's1marcus', who: 'marcus', time: 'Today · 6:40 AM', min: 1360, stage: 1, cat: 'other', short: "Sister's zumba class",
    topics: { sports: 0.4, memes: 1 }, text: "accidentally walked into my sister's zumba class and was too scared to leave. 45 minutes. I have never been so tired 💀",
    r: { like: 33, laugh: 77 }, shares: 9, comments: 14, big: 1904 },
  { id: 's1dev', who: 'dev', time: 'Today · 6:31 AM', min: 1351, stage: 1, cat: 'other', short: 'Sneeze experiment',
    topics: { science: 1, memes: 0.4 }, text: "science fact: you can't sneeze with your eyes open. I have tested this 14 times today. my mom is concerned",
    r: { like: 27, laugh: 38 }, shares: 2, comments: 11, big: 655 },
  { id: 's1ivy', who: 'ivy', time: 'Today · 6:20 AM', min: 1340, stage: 1, cat: 'other', short: 'Cat vs. water glass',
    topics: { pets: 1 }, text: 'my cat just pushed my water glass off the table while looking me directly in the eyes. no remorse 🐈',
    r: { like: 71, laugh: 49 }, shares: 8, comments: 16, big: 2470 },
  { id: 's1benji', who: 'benji', time: 'Yesterday · 9:44 PM', min: 824, stage: 1, cat: 'other', short: 'Grandma signs her texts',
    topics: { memes: 1 }, text: 'grandma signs every text. even "ok". "Ok. Love, Grandma" 💌', r: { like: 88, laugh: 35 }, shares: 11, comments: 20, big: 2990 },
  { id: 's1nora', who: 'nora', time: 'Yesterday · 9:10 PM', min: 790, stage: 1, cat: 'other', short: 'Violin + howling dog',
    topics: { music: 1, pets: 0.3 }, text: "practiced violin for 2 hours. the neighbor's dog howled for 2 hours. we're basically a band now 🎻🐕",
    r: { like: 45, laugh: 39 }, shares: 4, comments: 10, big: 1010 },

  // Stage 2: unrelated posts, the true timeline, and the reposts that get louder.
  { id: 'cat', who: 'lily', time: 'Yesterday · 6:02 PM', min: 602, stage: 2, cat: 'other', short: 'Cat falls off couch',
    topics: { pets: 1 }, text: 'he has done this every day for 3 years and has never once stuck the landing',
    img: { card: 'cat' }, r: { like: 31, laugh: 22 }, shares: 4, comments: 6, big: 212 },
  { id: 'maya', who: 'maya', time: 'Yesterday · 5:20 PM', min: 560, stage: 2, cat: 'story', short: "Maya's repost",
    topics: { gaga: 1, theo: 0.6 }, text: 'theo vs the gagaball wall 😂', repost: 'french',
    img: { photo: 'maya' }, r: { like: 44, laugh: 30 }, shares: 9, comments: 8, big: 1288 },
  { id: 'volcano', who: 'dev', time: 'Yesterday · 7:15 PM', min: 675, stage: 2, cat: 'other', short: 'Science fair volcano',
    topics: { science: 1 }, text: 'Science fair project is DONE. 3 tries. 1 kitchen ceiling. 🌋',
    img: { card: 'volcano' }, r: { like: 26, laugh: 12 }, shares: 2, comments: 5, big: 96 },
  { id: 'jaxon', who: 'jaxon', time: 'Yesterday · 6:41 PM', min: 641, stage: 2, cat: 'story', short: "Jaxon's repost",
    topics: { gaga: 1, theo: 1, drama: 0.5 }, text: 'THEO DESTROYED THE PIT 💀', repost: 'maya', loud: 1,
    img: { photo: 'jaxon' }, r: { like: 40, laugh: 88, angry: 6 }, shares: 22, comments: 14, big: 3904 },
  { id: 'band', who: 'nora', time: 'Yesterday · 7:40 PM', min: 700, stage: 2, cat: 'other', short: 'Orchestra concert',
    topics: { music: 1 }, text: 'First concert with the youth orchestra tonight 🎻 so nervous',
    img: { card: 'band' }, r: { like: 38 }, shares: 1, comments: 9, big: 141 },
  { id: 'tR', who: 'ella', time: 'Yesterday · 9:05 AM', min: 65, stage: 2, cat: 'story', short: 'Rain again?? (9:05)', truth: 1,
    topics: { gaga: 0.4, school: 0.6 }, text: "Rain again?? Field day's still on 🌧️", r: { like: 12 }, shares: 0, comments: 2, big: 31 },
  { id: 'math', who: 'zara', time: 'Yesterday · 8:12 PM', min: 732, stage: 2, cat: 'other', short: 'Math meme',
    topics: { school: 0.5, memes: 1 }, text: 'me explaining my answer ✅ vs. me explaining how I got it 🫠',
    img: { card: 'math' }, r: { like: 20, laugh: 34 }, shares: 6, comments: 4, big: 377 },
  { id: 'tE', who: 'kai', time: 'Yesterday · 11:02 AM', min: 182, stage: 2, cat: 'story', short: 'Gagaball is open (11:02)', truth: 1,
    topics: { gaga: 0.6, sports: 0.3 }, text: "Everyone's in the pit, gagaball is open!", r: { like: 15 }, shares: 0, comments: 1, big: 44 },
  { id: 'tM', who: 'noah', time: 'Yesterday · 1:31 PM', min: 331, stage: 2, cat: 'story', short: 'MUD DIVE (1:31)', truth: 1,
    topics: { gaga: 1, drama: 0.3 }, text: 'MUD DIVE 💥 the wall came DOWN', r: { like: 18, laugh: 50 }, shares: 5, comments: 7, big: 980 },
  { id: 'gossip', who: 'gossip', time: 'Yesterday · 8:55 PM', min: 775, stage: 2, cat: 'story', short: 'Gossip: PIT COLLAPSES', loud: 2,
    topics: { gaga: 1, theo: 1, drama: 1 }, repost: 'jaxon', verified: 'stage5', breaking: 1,
    text: 'GAGABALL PIT COLLAPSES — KID HURT IN LIFE ACADEMY CHAOS 😱 are they banning gagaball??',
    img: { photo: 'gossip' }, r: { like: 60, laugh: 210, sad: 30, angry: 140 }, shares: 95, comments: 12, big: 48212 },
  { id: 'soccer', who: 'ben', time: 'Yesterday · 5:05 PM', min: 545, stage: 2, cat: 'other', short: 'First goal of the season',
    topics: { sports: 1 }, text: 'first goal of the season ⚽ (it went off my face but it counts)',
    img: { card: 'soccer' }, r: { like: 29, laugh: 15 }, shares: 1, comments: 6, big: 160 },
  { id: 'tA', who: 'sam', time: 'Yesterday · 1:33 PM', min: 333, stage: 2, cat: 'story', short: "Theo's laughing (1:33)", truth: 1,
    topics: { gaga: 0.6 }, text: "All good, Theo's laughing. Just a scrape 🩹", r: { like: 9 }, shares: 0, comments: 1, big: 22 },
  { id: 'dragon', who: 'rosie', time: 'Yesterday · 8:30 PM', min: 750, stage: 2, cat: 'other', short: 'Dragon drawing',
    topics: { art: 1 }, text: 'finished my dragon 🐉 took 2 weeks',
    img: { card: 'dragon' }, r: { like: 47 }, shares: 3, comments: 11, big: 233 },
  { id: 'tT', who: 'french', time: 'Yesterday · 1:42 PM', min: 342, stage: 2, cat: 'story', short: 'Wall back up (1:42)', truth: 1,
    topics: { gaga: 0.6 }, text: "The wall's back up! 🔧 Rematch whenever you're ready.", r: { like: 21 }, shares: 0, comments: 2, big: 37 },
  { id: 'tC', who: 'maya', time: 'Yesterday · 2:15 PM', min: 375, stage: 2, cat: 'story', short: 'Rematch starting (2:15)', truth: 1,
    topics: { gaga: 0.5 }, text: 'Championship replay starting now!', r: { like: 8 }, shares: 0, comments: 0, big: 19 },
  { id: 'tH', who: 'june', time: 'Yesterday · 2:40 PM', min: 400, stage: 2, cat: 'story', short: 'June wins the rematch', truth: 1,
    topics: { gaga: 0.5, school: 0.3 }, text: 'Huge upset: I WON the championship 🏆🏆 (I am 8)',
    img: { card: 'trophy' }, r: { like: 25 }, shares: 0, comments: 4, big: 25 },

  // Stage 3: "more like this" after Theo reacts.
  { id: 'kaiBan', who: 'kai', time: 'Today · 7:12 AM', min: 1392, stage: 3, cat: 'story', short: 'gagaball BANNED??',
    topics: { gaga: 1, drama: 1, theo: 0.4 }, text: 'gagaball BANNED at Life Academy?? 😭 thanks theo', r: { like: 30, laugh: 41, angry: 60 }, shares: 33, comments: 21, big: 9120 },
  { id: 'gossip2', who: 'gossip', time: 'Today · 7:30 AM', min: 1410, stage: 3, cat: 'story', short: 'Gossip: the moment it fell', loud: 2,
    topics: { gaga: 1, drama: 1, theo: 1 }, text: 'EXCLUSIVE: the exact moment the wall fell 👀 #GagaGate',
    img: { photo: 'gossip2' }, r: { like: 44, laugh: 120, angry: 90 }, shares: 61, comments: 30, big: 21480 },
  { id: 'noahPay', who: 'noah', time: 'Today · 7:41 AM', min: 1421, stage: 3, cat: 'story', short: 'Theo should pay',
    topics: { gaga: 1, drama: 1, theo: 1 }, text: 'theo needs to pay for that wall fr 💸', r: { like: 22, laugh: 35, angry: 28 }, shares: 12, comments: 18, big: 6044 },

  // Stage 6: the bubble.
  { id: 'poll', who: 'gossip', time: 'Today · 8:02 AM', min: 1442, stage: 6, cat: 'story', short: 'Poll: ban gagaball?', loud: 1,
    topics: { gaga: 1, drama: 1, theo: 0.5 }, text: 'POLL: Should gagaball be banned at Life Academy? 🗳️', poll: [['Yes, it’s dangerous', 61], ['No', 39]],
    r: { like: 80, angry: 70 }, shares: 40, comments: 55, big: 12030 },
  { id: 'purpose', who: 'gossip', time: 'Today · 8:10 AM', min: 1450, stage: 6, cat: 'story', short: 'Did Theo do it ON PURPOSE?', loud: 2,
    topics: { gaga: 1, drama: 1, theo: 1 }, text: 'Theo did it ON PURPOSE? His team was losing 👀 (sources say)', r: { like: 50, laugh: 60, angry: 110 }, shares: 70, comments: 64, big: 17660 },
  { id: 'jaxon2', who: 'jaxon', time: 'Today · 8:14 AM', min: 1454, stage: 6, cat: 'story', short: "Jaxon: still funny",
    topics: { gaga: 1, theo: 1 }, text: 'this is still the funniest thing ever 💀 #GagaGate', img: { photo: 'gossip' }, r: { like: 30, laugh: 99 }, shares: 20, comments: 9, big: 7310 },
  { id: 'ella2', who: 'ella', time: 'Today · 8:20 AM', min: 1460, stage: 6, cat: 'story', short: "Ella: can't stop thinking",
    topics: { gaga: 1, theo: 0.5 }, text: "can't stop thinking about the gagaball wall 😭", r: { like: 40, laugh: 20 }, shares: 2, comments: 6, big: 2210 },
  { id: 'kai2', who: 'kai', time: 'Today · 8:25 AM', min: 1465, stage: 6, cat: 'story', short: 'Kai: where are you Theo',
    topics: { gaga: 1, theo: 1, drama: 0.5 }, text: '#GagaGate day 2. Theo where are you 👀', r: { like: 25, laugh: 31 }, shares: 8, comments: 22, big: 4405 },
];

/* Stage 1: once Mr. French's post appears, Theo gets tagged in it, one notification at a time. */
LENS.s1Tags = [
  ['french', 'tagged you in a post'],
  ['maya', '@theo the wall never stood a chance 😂'],
  ['kai', '@theo LEGEND 🏆'],
  ['jaxon', '@theo rematch when?? 😂'],
  ['ella', '@theo are you ok lol'],
  ['noah', '@theo watch it in slow mo 💀'],
];

/* Captions used to recycle posts forever in stage 7's endless feed. */
LENS.recycled = [
  ['gossip', 'STILL TRENDING: #GagaGate 🔥 the pit, the wall, the KID'],
  ['kai', 'theo has been quiet today 👀'],
  ['jaxon', 'replaying the wall falling for the 40th time 💀'],
  ['gossip', 'NEW ANGLE: was the wall even fixed?? 🧐'],
  ['noah', 'gagaball will never be the same'],
  ['ella', 'who else saw the video 😭'],
  ['gossip', 'Parents are TALKING. Here’s what we know 🧵'],
  ['kai', 'theo log on we need answers'],
];

LENS.ads = [
  { id: 'pixel',   brand: 'Pixel Quest',   art: '🎮', bg: ['#3a2a8c', '#7a4be0'], head: 'Season 4 is live',                    cta: 'Play free', topics: { games: 1 }, bid: 1.0, stage: 2, short: 'Ad: Pixel Quest' },
  { id: 'fleet',   brand: 'Fleet Sneakers', art: '👟', bg: ['#e05a24', '#f2a03d'], head: '30% off everything this week',        cta: 'Shop now',  topics: { sports: 1 }, bid: 0.9, stage: 2, short: 'Ad: Fleet Sneakers' },
  { id: 'mathbud', brand: 'MathBuddy',     art: '📐', bg: ['#1e7e6e', '#3dbb9c'], head: 'Homework help in seconds',            cta: 'Try it',    topics: { school: 1 }, bid: 0.8, stage: 2, short: 'Ad: MathBuddy' },
  { id: 'progaga', brand: 'ProGaga',       art: '🏐', bg: ['#b8441b', '#e8873d'], head: 'Official-size gagaballs',            cta: 'Shop now',  topics: { gaga: 1, sports: 0.3 }, bid: 1.0, stage: 2, short: 'Ad: ProGaga ball' },
  { id: 'flex',    brand: 'FlexGuard',     art: '🛡️', bg: ['#25476e', '#3f7fc0'], head: 'Elbow & knee pads. Fall like a pro.', cta: 'Get yours', topics: { gaga: 0.6, theo: 0.6 }, bid: 0.9, stage: 2, short: 'Ad: FlexGuard pads' },
  { id: 'pitkit',  brand: 'Backyard Gaga', art: '🪵', bg: ['#6b4a2a', '#a8763f'], head: 'Build your own gagaball pit. Walls that stay up.', cta: 'See kits', topics: { gaga: 1, drama: 0.2 }, bid: 1.1, stage: 3, short: 'Ad: Gagaball Pit Kit' },
  { id: 'premium', brand: 'Lens Premium',  art: '👀', bg: ['#111', '#444'],       head: "See who's talking about you",         cta: 'Try free',  topics: { theo: 1, drama: 0.8 }, bid: 1.4, stage: 4, short: 'Ad: Lens Premium' },
  { id: 'boost',   brand: 'Post Boost',    art: '🚀', bg: ['#b0127a', '#e8509b'], head: '10,000 likes for $19.99',             cta: 'Boost',     topics: { drama: 1, theo: 0.3 }, bid: 1.3, stage: 5, short: 'Ad: Post Boost' },
  { id: 'unwind',  brand: 'Unwind',        art: '🧘', bg: ['#2f6f6a', '#76b8a8'], head: 'Feel calm in 5 minutes',              cta: 'Breathe',   topics: { stress: 1 }, bid: 1.2, stage: 7, short: 'Ad: Unwind (calm app)' },
];

/* Stage 4 thread on the gossip post. Teasing, never cruel. */
LENS.commentsBefore = [
  ['maya', 'ok this is actually so funny 😂 theo you good?'],
  ['jaxon', 'the wall had a family 😭'],
  ['ella', 'wait is gagaball actually banned??'],
  ['noah', 'I heard he did it on purpose bc they were losing'],
  ['gossip', 'sources say the pit is CLOSED FOREVER 🚨'],
  ['kai', 'theo fr owes everyone a new pit lol'],
];
/* {chunk} is the loudest few words of Theo's reply. These arrive after his, in this order. */
LENS.commentsAfter = [
  ['noah', '"…{chunk}…" 💀 ok theo'],
  ['ella', 'so is gagaball banned or not'],
  ['jaxon', 'theo really typed all that 😭'],
  ['gossip', "we posted Theo's response ⬆️ 👀"],
  ['kai', 'ratio'],
  ['maya', 'guys leave him alone lol'],
];

/* Stage 5: the 12 real people in "Liked by". Everyone else is a bot. */
LENS.realLikers = ['maya', 'jaxon', 'ella', 'noah', 'kai', 'lily', 'dev', 'zara', 'nora', 'ben', 'rosie', 'ava'];
LENS.realLikerSlots = [3, 11, 19, 27, 38, 52, 64, 77, 91, 104, 120, 139];

/* Stage 6: what three other people's feeds look like. */
LENS.otherFeeds = {
  june: { label: "June's feed", who: 'june', posts: [
    ['june', 'I WON 🏆🏆 the gagaball championship!!', 'trophy'],
    ['nora', 'congrats June!!! 🎉 youngest champion ever'],
    ['rosie', "June's cake was the best part of field day 🎂", 'cake'],
    ['maya', 'lol the gagaball wall'],
  ] },
  french: { label: "Mr. French's feed", who: 'french', posts: [
    ['french', 'Lesson plan for Thursday: persuasive writing ✏️', 'lesson'],
    ['french', 'Field trip sign-up closes Friday 🚌'],
    ['french', "Theo's championship-winning dive 🏆 (he didn't win… the wall did 😂) … #LifeAcademyFieldDay", 'photo'],
    ['dev', 'Science fair project is DONE. 🌋', 'volcano'],
  ] },
  sam: { label: "Sam's feed", who: 'sam', posts: [
    ['sam', 'new speedrun personal best 🎮 4:31', 'game'],
    ['sam', 'my dog when I say the word "walk"', 'dog'],
    ['ben', 'first goal of the season ⚽', 'soccer'],
    ['dev', 'Pixel Quest season 4 is actually so good'],
  ] },
};

/* Stage 7: notifications that keep coming. */
LENS.notifications = [
  'You were mentioned 14 times',
  '@jaxon_ tagged you in a post',
  'New poll about you! 🗳️',
  '@lifeacademy.gossip posted about you',
  '31 people are viewing posts about you',
  '@kai.plays: "theo log on 👀"',
  'Your name is trending at Life Academy 🔥',
  '@noah_b replied to your comment',
];

/* Theo's goal at each stage, in his voice. */
LENS.goals = {
  1: "Just scrolling before school. What's everyone up to?",
  2: "OK, enough of that. Let's see what else is on here.",
  3: "That gossip post isn't true. I want Lens to know I don't like it.",
  4: "That's not what happened. I'm going to set the record straight.",
  5: "48,000 people?? There aren't that many people at Life Academy. Who actually liked this?",
  6: "I'm done with this. I'm going to look up something else.",
  7: "I'm logging off.",
};

/* Replay: what each stage really was, and what was true. */
LENS.reveal = {
  1: { name: 'Passive tracking', line: "Watching is a vote. You don't have to like, share or comment. Apps measure how long you look, and looking counts as wanting more.", truth: "Mr. French's post was kind, and it had the whole story." },
  2: { name: 'Exaggeration', line: 'Each time a story is shared, it gets cropped tighter, filtered harder and captioned louder. The version that spreads furthest has the least of what happened.', truth: 'Theo was laughing. It was a scraped elbow.' },
  3: { name: 'The algorithm', line: 'Every reaction is a vote for more, and anger counts most. A formula decides what comes first, and it can’t tell “I love this” from “I hate this.”', truth: 'There was a rematch, and June won it.' },
  4: { name: 'Context collapse', line: 'Your words can be cut down to the loudest few and passed on. And arguing back counts as engagement, so defending yourself pushes the story further.', truth: 'It was an accident. The game was tied, and nobody was to blame.' },
  5: { name: 'Fake popularity', line: 'Numbers feel like votes, so we believe the crowd. But the crowd can be bought, the voters can be bots, and a checkmark is one line of data.', truth: '46 kids played gagaball that day. 12 real people liked that post.' },
  6: { name: 'The filter bubble', line: "Your feed is a mirror of what you've looked at. Theo looked at the story about himself, so his feed became nothing but that story, and a small moment felt like the whole school.", truth: 'Most people at Life Academy weren’t talking about it.' },
  7: { name: 'Attention engineering', line: 'Endless feeds, notifications and streaks are built to make leaving hard, and they work hardest on someone who’s worried about what people are saying.', truth: 'It was a good day. It still was.' },
};

LENS.questions = [
  'How did it feel to be Theo? When did it stop being funny?',
  'Theo never did anything wrong on Lens. Which of his choices made things worse? What could he have done instead?',
  'Which number in the replay surprised you most?',
  'Is cropping or filtering a photo lying? Where’s the line?',
  "Was Mr. French's post OK? What about Maya's? Where did it go wrong?",
  'The ads changed as Theo’s feed changed. Who was Lens really working for?',
  'If you designed Lens’s algorithm, what would you reward?',
  'Stage 7 made leaving hard. What tricks do apps you use rely on? What helps you stop?',
];

/* Sidebar ads: one invented ad for every post. The sidebar shows whichever ads match
   the posts the class has looked at longest, and re-ranks them live. All brands are made up. */
LENS.postAds = {
  // stage 1
  s1toby:   { brand: 'SweepBot',          art: '🤖', head: 'Robot vacuums that answer to any name',        cta: 'Adopt one', bg: ['#4b6378', '#7f9bb3'] },
  french:   { brand: 'FieldDay Co.',      art: '🏆', head: 'Trophies & ribbons for every champion',        cta: 'Shop',      bg: ['#2a5fb0', '#4f8fe0'] },
  s1kai:    { brand: 'GripTape Skate',    art: '🛹', head: 'Boards that land the kickflip for you*',       cta: 'Shop',      bg: ['#2b2b2b', '#5e5e5e'] },
  s1lulu:   { brand: 'PawPortraits',      art: '🐕', head: 'Turn your pet into royalty',                   cta: 'Order',     bg: ['#8a5a2b', '#c99a5b'] },
  s1quinn:  { brand: 'SnoozeMax',         art: '⏰', head: 'The alarm clock that negotiates',              cta: 'Try it',    bg: ['#3a3f8f', '#6c72d9'] },
  s1lily:   { brand: 'FlapJack Molds',    art: '🥞', head: 'Pancake molds in 40 shapes (dad not included)', cta: 'Shop',     bg: ['#c0782a', '#f0b25a'] },
  s1marcus: { brand: 'DanceFit',          art: '💃', head: 'Zumba for people who walked in by accident',   cta: 'Join',      bg: ['#b0127a', '#e8509b'] },
  s1dev:    { brand: 'SciKit Labs',       art: '🧪', head: '100 experiments your mom will worry about',    cta: 'Get kit',   bg: ['#14705f', '#2fb193'] },
  s1ivy:    { brand: 'TipProof Cups',     art: '🥤', head: "Cups your cat can't knock over (probably)",     cta: 'Shop',      bg: ['#2f6f9f', '#5aa6d6'] },
  s1benji:  { brand: 'GrandText',         art: '📱', head: 'Teach Grandma emojis in 5 minutes',            cta: 'Download',  bg: ['#7a3fb0', '#a874e0'] },
  s1nora:   { brand: 'Bow & String',      art: '🎻', head: 'Violin lessons. Dog not included.',            cta: 'Book',      bg: ['#6b2737', '#a8475e'] },
  // stage 2
  cat:      { brand: 'CouchGuard',        art: '🛋️', head: 'Landing pads for cats who never stick it',     cta: 'Shop',      bg: ['#9a5b2f', '#d08a55'] },
  maya:     { brand: 'GagaGear',          art: '🏐', head: 'Gagaballs that bounce back',                  cta: 'Shop',      bg: ['#b8441b', '#e8873d'] },
  volcano:  { brand: 'EruptKit',          art: '🌋', head: 'Volcano kits. Ceiling-safe edition.',          cta: 'Get one',   bg: ['#7a2e2e', '#c25a3a'] },
  jaxon:    { brand: 'WallFix Pro',       art: '🔨', head: 'Fix anything in 10 minutes',                   cta: 'Shop',      bg: ['#4a4a4a', '#8a6a3a'] },
  band:     { brand: 'StageReady',        art: '🎶', head: 'Beat stage nerves in one breath',              cta: 'Try free',  bg: ['#2a2a5a', '#5a4a9a'] },
  tR:       { brand: 'Puddle Boots',      art: '🥾', head: 'Mud? What mud?',                               cta: 'Shop',      bg: ['#2f5f4f', '#5a9a7a'] },
  math:     { brand: 'ShowYourWork',      art: '✏️', head: 'Explain how you got it. Finally.',             cta: 'Try it',    bg: ['#1e6e7e', '#3dafc0'] },
  tE:       { brand: 'PitPass',           art: '🎟️', head: 'Never miss an open gagaball pit',                  cta: 'Get pass',  bg: ['#a34a1a', '#e07a3a'] },
  tM:       { brand: 'MudOff',            art: '🧼', head: 'Gets mud out of anything',                     cta: 'Shop',      bg: ['#5a4a3a', '#9a7a5a'] },
  soccer:   { brand: 'HeaderGuard',       art: '⚽', head: 'Soft headbands for goals scored with your face', cta: 'Shop',    bg: ['#2f7a3a', '#5ab866'] },
  gossip:   { brand: 'Lens Alerts+',      art: '🚨', head: "Know the second you're mentioned",             cta: 'Turn on',   bg: ['#a31d1d', '#e04848'] },
  tA:       { brand: 'BandAid Buddies',   art: '🩹', head: 'Bandages with jokes printed on them',          cta: 'Shop',      bg: ['#c26a5a', '#f0a090'] },
  dragon:   { brand: 'InkWorks',          art: '🐉', head: 'Pro markers for dragon artists',               cta: 'Shop',      bg: ['#2f6a3a', '#4fa060'] },
  tT:       { brand: 'DrillMaster',       art: '🔧', head: 'Cordless drills, 30% off',                     cta: 'Shop',      bg: ['#3a4a5a', '#6a7a8a'] },
  tC:       { brand: 'ScoreKeeper',       art: '🏅', head: 'The scoreboard app for every rematch',         cta: 'Download',  bg: ['#8a6a1a', '#d0a83a'] },
  tH:       { brand: 'TrophyTown',        art: '🏆', head: 'Trophies for champions of every size',         cta: 'Shop',      bg: ['#b08a1a', '#f0c84a'] },
  // stage 3
  kaiBan:   { brand: 'Petition+',         art: '📝', head: 'Start a petition in 30 seconds',               cta: 'Start',     bg: ['#3a3a7a', '#6a6ab0'] },
  gossip2:  { brand: 'SlowMo Cam',        art: '🎥', head: 'Replay every fail in slow motion',             cta: 'Get app',   bg: ['#1a1a1a', '#4a4a4a'] },
  noahPay:  { brand: 'PayUp',             art: '💸', head: 'Split the bill for anything. Even a wall.',    cta: 'Try it',    bg: ['#1a7a4a', '#3ab07a'] },
  // stage 4 onward
  quote:    { brand: 'Reputation Rescue', art: '🧯', head: 'Fix what people say about you online',         cta: 'Get help',  bg: ['#7a1a3a', '#c0406a'] },
  poll:     { brand: 'PollPal',           art: '🗳️', head: 'Make polls that go viral',                     cta: 'Create',    bg: ['#5a2a8a', '#8a5ac0'] },
  purpose:  { brand: 'TruthCheck',        art: '🔍', head: 'Find out what really happened (premium)',      cta: 'Upgrade',   bg: ['#2a2a2a', '#5a5a6a'] },
  jaxon2:   { brand: 'MemeMaker',         art: '😂', head: 'Turn any fail into a meme',                    cta: 'Make one',  bg: ['#c08a1a', '#f0c040'] },
  ella2:    { brand: 'SleepWell',         art: '😴', head: "Can't stop thinking? Sleep sounds for teens",   cta: 'Listen',    bg: ['#1a2a5a', '#3a5a9a'] },
  kai2:     { brand: 'FindMy Friends',    art: '📍', head: 'See where everyone is, always',                cta: 'Turn on',   bg: ['#1a5a7a', '#3a8ab0'] },
  video:    { brand: 'LoopCam',           art: '🔁', head: 'Videos that play forever',                     cta: 'Get app',   bg: ['#3a1a5a', '#7a4ab0'] },
  rc:       { brand: 'Post Boost',        art: '🚀', head: 'Make your post trend. $19.99.',                cta: 'Boost',     bg: ['#b0127a', '#e8509b'] },
};

/* Comments you see when you open a post's comments. They appear in this order, one by one,
   as the post's comment count grows. Mr. French's post also collects the stage 1 tags. */
LENS.postComments = {
  s1toby:   [['benji', 'steve deserves a raise'], ['ivy', 'my cat would destroy steve 😭'], ['marcus', 'does steve have a birthday'], ['lulu', 'drawing steve as a knight next']],
  s1kai:    [['ben', 'the driveway is undefeated'], ['jaxon', 'day 4 is the one 🙏'], ['dev', 'try bending your knees? (I have never skated)'], ['maya', 'pls wear a helmet kai']],
  s1lulu:   [['rosie', 'SIR BARKSALOT 🛡️'], ['ivy', 'he looks so proud'], ['nora', 'do a cat one!!'], ['toby', 'steve wants one too']],
  s1quinn:  [['zara', 'not me at 7:01'], ['marcus', '7am is a myth'], ['benji', 'my grandma has been up since 5'], ['ella', 'facts']],
  s1lily:   [['quinn', 'dad is a circle 😭😭'], ['maya', 'I need the recipe'], ['dev', 'structurally impressive'], ['kai', "where's the dog pancake"]],
  s1marcus: [['ivy', '45 MINUTES 💀'], ['benji', 'respect for staying'], ['nora', 'the instructor saw you. she knows.'], ['zara', 'honestly I would have stayed too']],
  s1dev:    [['zara', 'dev pls'], ['lily', 'my mom would ground me'], ['quinn', 'now test if you can hum with your nose plugged'], ['noah', 'science 🫡']],
  s1ivy:    [['toby', 'no remorse is crazy'], ['lulu', 'she knew exactly what she was doing'], ['sam', 'cats are just like that'], ['rosie', 'give her a treat anyway']],
  s1benji:  [['marcus', '"Ok. Love, Grandma" 😭😭'], ['ivy', 'my grandpa types in all caps'], ['lily', 'grandma is iconic'], ['quinn', 'protect grandma at all costs']],
  s1nora:   [['lulu', 'the dog is the lead singer'], ['ella', 'duet era'], ['kai', 'record it!!'], ['ben', 'new band name: Bow Wow']],
  french:   [['french', 'Wall is good as new. Great game, everyone! 🔧'], ['rosie', 'the rematch was SO good'], ['june', 'I WON 🏆']],
  cat:      [['ivy', 'he will stick it one day'], ['toby', '0/10 landing, 10/10 confidence'], ['lulu', 'I need to draw this']],
  maya:     [['kai', 'THE DIVE 😂'], ['ella', 'he was laughing the whole time lol'], ['sam', 'is he ok?'], ['noah', 'legendary']],
  volcano:  [['zara', 'the ceiling 😭'], ['dev', 'worth it'], ['ben', 'did it work the 3rd time?']],
  jaxon:    [['noah', '💀💀💀'], ['maya', 'he was fine tho lol'], ['kai', 'the pit will never recover'], ['ella', 'destroyed is a strong word']],
  band:     [['lily', "you'll be great!!"], ['rosie', 'good luck nora 🎻'], ['ella', 'break a leg (not a string)']],
  tR:       [['kai', 'still going!!'], ['maya', 'bring boots everyone']],
  math:     [['dev', 'this is me every time'], ['quinn', 'the teacher always asks how'], ['ben', '"I just knew"']],
  tE:       [['jaxon', 'first game!!'], ['noah', 'get in here']],
  tM:       [['jaxon', 'THE WALL 😂'], ['ella', 'is everyone ok??'], ['sam', "he's laughing, he's fine"]],
  soccer:   [['kai', 'a goal is a goal'], ['sam', 'face goal counts double'], ['jaxon', 'legend']],
  gossip:   LENS.commentsBefore,
  tA:       [['maya', "glad he's ok!"], ['kai', 'band-aid champion 🩹']],
  dragon:   [['lulu', 'THE SCALES 😍'], ['nora', 'frame this'], ['rosie', 'thank you!! 🐉']],
  tT:       [['june', 'thank you Mr. French!!'], ['kai', 'rematch time!!']],
  tC:       [['june', "let's goooo"], ['kai', "who's in it?"]],
  tH:       [['french', 'Congratulations, June! 🏆'], ['rosie', 'youngest champion ever!!'], ['maya', 'GO JUNE']],
  kaiBan:   [['noah', 'wait is it actually banned'], ['maya', 'nobody said it was banned'], ['jaxon', 'no more gagaball?? 😭']],
  gossip2:  [['noah', 'replay it 😂'], ['ella', 'why are you posting this'], ['kai', 'slow mo pls']],
  noahPay:  [['jaxon', 'fr 💸'], ['maya', 'Mr. French already fixed it'], ['ella', 'it was an accident lol']],
  quote:    [['noah', '👀👀'], ['kai', 'he responded lol'], ['jaxon', "that's what he said??"]],
  poll:     [['noah', 'voted yes'], ['maya', 'this is so dumb, gagaball is fine'], ['kai', 'no way they ban it']],
  purpose:  [['jaxon', 'wait really?'], ['ella', "his team wasn't even losing"], ['noah', 'sources?? 👀']],
  jaxon2:   [['kai', 'still crying 😭'], ['noah', 'the wall had a family']],
  ella2:    [['maya', 'go to sleep ella'], ['lily', 'same tbh']],
  kai2:     [['noah', "he's hiding 👀"], ['jaxon', 'theo log on']],
  video:    [['jaxon', 'watched it 40 times'], ['noah', 'again again'], ['kai', '💀']],
  rc:       [['noah', '👀'], ['kai', 'still going'], ['jaxon', 'lmaooo'], ['ella', 'can we stop']],
};
