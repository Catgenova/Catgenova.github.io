/* Lens: all the content. People, posts, ads, comments, and the other feeds for stage 6.
   Everyone here is made up. Faces are stock photos from Pexels (see _source/lifeacademy/photo-credits.md). */
'use strict';
window.LENS = window.LENS || {};

LENS.people = {
  theo:    { name: 'Theo',          handle: 'theo',               img: 'theo' },
  french:  { name: 'Mr. French',    handle: 'mrfrench',           initials: 'MF', color: '#2a78d6', note: 'Life Academy' },
  alvarez: { name: 'Mr. Alvarez',   handle: 'alvarez.fixes',      initials: 'MA', color: '#3b7d4f' },
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
  { id: 'french', who: 'french', time: 'Yesterday · 4:10 PM', min: 490, stage: 1, cat: 'teacher', short: "Mr. French's post",
    topics: { gaga: 1, school: 0.5 },
    text: "Theo's championship-winning dive 🏆 (he didn't win… the wall did 😂). Wall fixed in 10 minutes thanks to Mr. Alvarez, rematch at 2:15. Best field day yet! #LifeAcademyFieldDay",
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
    topics: { gaga: 1, theo: 0.6 }, text: 'theo vs the gaga wall 😂', repost: 'french',
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
  { id: 'tE', who: 'kai', time: 'Yesterday · 11:02 AM', min: 182, stage: 2, cat: 'story', short: 'Gaga is open (11:02)', truth: 1,
    topics: { gaga: 0.6, sports: 0.3 }, text: "Everyone's in the pit, gaga is open!", r: { like: 15 }, shares: 0, comments: 1, big: 44 },
  { id: 'tM', who: 'noah', time: 'Yesterday · 1:31 PM', min: 331, stage: 2, cat: 'story', short: 'MUD DIVE (1:31)', truth: 1,
    topics: { gaga: 1, drama: 0.3 }, text: 'MUD DIVE 💥 the wall came DOWN', r: { like: 18, laugh: 50 }, shares: 5, comments: 7, big: 980 },
  { id: 'gossip', who: 'gossip', time: 'Yesterday · 8:55 PM', min: 775, stage: 2, cat: 'story', short: 'Gossip: PIT COLLAPSES', loud: 2,
    topics: { gaga: 1, theo: 1, drama: 1 }, repost: 'jaxon', verified: 'stage5', breaking: 1,
    text: 'GAGA PIT COLLAPSES — KID HURT IN LIFE ACADEMY CHAOS 😱 are they banning gaga??',
    img: { photo: 'gossip' }, r: { like: 60, laugh: 210, sad: 30, angry: 140 }, shares: 95, comments: 12, big: 48212 },
  { id: 'soccer', who: 'ben', time: 'Yesterday · 5:05 PM', min: 545, stage: 2, cat: 'other', short: 'First goal of the season',
    topics: { sports: 1 }, text: 'first goal of the season ⚽ (it went off my face but it counts)',
    img: { card: 'soccer' }, r: { like: 29, laugh: 15 }, shares: 1, comments: 6, big: 160 },
  { id: 'tA', who: 'sam', time: 'Yesterday · 1:33 PM', min: 333, stage: 2, cat: 'story', short: "Theo's laughing (1:33)", truth: 1,
    topics: { gaga: 0.6 }, text: "All good, Theo's laughing. Just a scrape 🩹", r: { like: 9 }, shares: 0, comments: 1, big: 22 },
  { id: 'dragon', who: 'rosie', time: 'Yesterday · 8:30 PM', min: 750, stage: 2, cat: 'other', short: 'Dragon drawing',
    topics: { art: 1 }, text: 'finished my dragon 🐉 took 2 weeks',
    img: { card: 'dragon' }, r: { like: 47 }, shares: 3, comments: 11, big: 233 },
  { id: 'tT', who: 'alvarez', time: 'Yesterday · 1:42 PM', min: 342, stage: 2, cat: 'story', short: 'Wall back up (1:42)', truth: 1,
    topics: { gaga: 0.6 }, text: "The wall's back up! 🔧 Rematch whenever you're ready.", r: { like: 21 }, shares: 0, comments: 2, big: 37 },
  { id: 'tC', who: 'maya', time: 'Yesterday · 2:15 PM', min: 375, stage: 2, cat: 'story', short: 'Rematch starting (2:15)', truth: 1,
    topics: { gaga: 0.5 }, text: 'Championship replay starting now!', r: { like: 8 }, shares: 0, comments: 0, big: 19 },
  { id: 'tH', who: 'june', time: 'Yesterday · 2:40 PM', min: 400, stage: 2, cat: 'story', short: 'June wins the rematch', truth: 1,
    topics: { gaga: 0.5, school: 0.3 }, text: 'Huge upset: I WON the championship 🏆🏆 (I am 8)',
    img: { card: 'trophy' }, r: { like: 25 }, shares: 0, comments: 4, big: 25 },

  // Stage 3: "more like this" after Theo reacts.
  { id: 'kaiBan', who: 'kai', time: 'Today · 7:12 AM', min: 1392, stage: 3, cat: 'story', short: 'gaga BANNED??',
    topics: { gaga: 1, drama: 1, theo: 0.4 }, text: 'gaga BANNED at Life Academy?? 😭 thanks theo', r: { like: 30, laugh: 41, angry: 60 }, shares: 33, comments: 21, big: 9120 },
  { id: 'gossip2', who: 'gossip', time: 'Today · 7:30 AM', min: 1410, stage: 3, cat: 'story', short: 'Gossip: the moment it fell', loud: 2,
    topics: { gaga: 1, drama: 1, theo: 1 }, text: 'EXCLUSIVE: the exact moment the wall fell 👀 #GagaGate',
    img: { photo: 'gossip2' }, r: { like: 44, laugh: 120, angry: 90 }, shares: 61, comments: 30, big: 21480 },
  { id: 'noahPay', who: 'noah', time: 'Today · 7:41 AM', min: 1421, stage: 3, cat: 'story', short: 'Theo should pay',
    topics: { gaga: 1, drama: 1, theo: 1 }, text: 'theo needs to pay for that wall fr 💸', r: { like: 22, laugh: 35, angry: 28 }, shares: 12, comments: 18, big: 6044 },

  // Stage 6: the bubble.
  { id: 'poll', who: 'gossip', time: 'Today · 8:02 AM', min: 1442, stage: 6, cat: 'story', short: 'Poll: ban gaga?', loud: 1,
    topics: { gaga: 1, drama: 1, theo: 0.5 }, text: 'POLL: Should gaga be banned at Life Academy? 🗳️', poll: [['Yes, it’s dangerous', 61], ['No', 39]],
    r: { like: 80, angry: 70 }, shares: 40, comments: 55, big: 12030 },
  { id: 'purpose', who: 'gossip', time: 'Today · 8:10 AM', min: 1450, stage: 6, cat: 'story', short: 'Did Theo do it ON PURPOSE?', loud: 2,
    topics: { gaga: 1, drama: 1, theo: 1 }, text: 'Theo did it ON PURPOSE? His team was losing 👀 (sources say)', r: { like: 50, laugh: 60, angry: 110 }, shares: 70, comments: 64, big: 17660 },
  { id: 'jaxon2', who: 'jaxon', time: 'Today · 8:14 AM', min: 1454, stage: 6, cat: 'story', short: "Jaxon: still funny",
    topics: { gaga: 1, theo: 1 }, text: 'this is still the funniest thing ever 💀 #GagaGate', img: { photo: 'gossip' }, r: { like: 30, laugh: 99 }, shares: 20, comments: 9, big: 7310 },
  { id: 'ella2', who: 'ella', time: 'Today · 8:20 AM', min: 1460, stage: 6, cat: 'story', short: "Ella: can't stop thinking",
    topics: { gaga: 1, theo: 0.5 }, text: "can't stop thinking about the gaga wall 😭", r: { like: 40, laugh: 20 }, shares: 2, comments: 6, big: 2210 },
  { id: 'kai2', who: 'kai', time: 'Today · 8:25 AM', min: 1465, stage: 6, cat: 'story', short: 'Kai: where are you Theo',
    topics: { gaga: 1, theo: 1, drama: 0.5 }, text: '#GagaGate day 2. Theo where are you 👀', r: { like: 25, laugh: 31 }, shares: 8, comments: 22, big: 4405 },
];

/* Captions used to recycle posts forever in stage 7's endless feed. */
LENS.recycled = [
  ['gossip', 'STILL TRENDING: #GagaGate 🔥 the pit, the wall, the KID'],
  ['kai', 'theo has been quiet today 👀'],
  ['jaxon', 'replaying the wall falling for the 40th time 💀'],
  ['gossip', 'NEW ANGLE: was the wall even fixed?? 🧐'],
  ['noah', 'gaga will never be the same'],
  ['ella', 'who else saw the video 😭'],
  ['gossip', 'Parents are TALKING. Here’s what we know 🧵'],
  ['kai', 'theo log on we need answers'],
];

LENS.ads = [
  { id: 'pixel',   brand: 'Pixel Quest',   art: '🎮', bg: ['#3a2a8c', '#7a4be0'], head: 'Season 4 is live',                    cta: 'Play free', topics: { games: 1 }, bid: 1.0, stage: 2, short: 'Ad: Pixel Quest' },
  { id: 'fleet',   brand: 'Fleet Sneakers', art: '👟', bg: ['#e05a24', '#f2a03d'], head: '30% off everything this week',        cta: 'Shop now',  topics: { sports: 1 }, bid: 0.9, stage: 2, short: 'Ad: Fleet Sneakers' },
  { id: 'mathbud', brand: 'MathBuddy',     art: '📐', bg: ['#1e7e6e', '#3dbb9c'], head: 'Homework help in seconds',            cta: 'Try it',    topics: { school: 1 }, bid: 0.8, stage: 2, short: 'Ad: MathBuddy' },
  { id: 'progaga', brand: 'ProGaga',       art: '🏐', bg: ['#b8441b', '#e8873d'], head: 'Official-size gaga balls',            cta: 'Shop now',  topics: { gaga: 1, sports: 0.3 }, bid: 1.0, stage: 2, short: 'Ad: ProGaga ball' },
  { id: 'flex',    brand: 'FlexGuard',     art: '🛡️', bg: ['#25476e', '#3f7fc0'], head: 'Elbow & knee pads. Fall like a pro.', cta: 'Get yours', topics: { gaga: 0.6, theo: 0.6 }, bid: 0.9, stage: 2, short: 'Ad: FlexGuard pads' },
  { id: 'pitkit',  brand: 'Backyard Gaga', art: '🪵', bg: ['#6b4a2a', '#a8763f'], head: 'Build your own gaga pit. Walls that stay up.', cta: 'See kits', topics: { gaga: 1, drama: 0.2 }, bid: 1.1, stage: 3, short: 'Ad: Gaga Pit Kit' },
  { id: 'premium', brand: 'Lens Premium',  art: '👀', bg: ['#111', '#444'],       head: "See who's talking about you",         cta: 'Try free',  topics: { theo: 1, drama: 0.8 }, bid: 1.4, stage: 4, short: 'Ad: Lens Premium' },
  { id: 'boost',   brand: 'Post Boost',    art: '🚀', bg: ['#b0127a', '#e8509b'], head: '10,000 likes for $19.99',             cta: 'Boost',     topics: { drama: 1, theo: 0.3 }, bid: 1.3, stage: 5, short: 'Ad: Post Boost' },
  { id: 'unwind',  brand: 'Unwind',        art: '🧘', bg: ['#2f6f6a', '#76b8a8'], head: 'Feel calm in 5 minutes',              cta: 'Breathe',   topics: { stress: 1 }, bid: 1.2, stage: 7, short: 'Ad: Unwind (calm app)' },
];

/* Stage 4 thread on the gossip post. Teasing, never cruel. */
LENS.commentsBefore = [
  ['maya', 'ok this is actually so funny 😂 theo you good?'],
  ['jaxon', 'the wall had a family 😭'],
  ['ella', 'wait is gaga actually banned??'],
  ['noah', 'I heard he did it on purpose bc they were losing'],
  ['gossip', 'sources say the pit is CLOSED FOREVER 🚨'],
  ['kai', 'theo fr owes everyone a new pit lol'],
];
/* {chunk} is the loudest few words of Theo's reply. These arrive after his, in this order. */
LENS.commentsAfter = [
  ['noah', '"…{chunk}…" 💀 ok theo'],
  ['ella', 'so is gaga banned or not'],
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
    ['june', 'I WON 🏆🏆 the gaga championship!!', 'trophy'],
    ['nora', 'congrats June!!! 🎉 youngest champion ever'],
    ['rosie', "June's cake was the best part of field day 🎂", 'cake'],
    ['maya', 'lol the gaga wall'],
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
  1: "Mr. French posted about yesterday. I just want to read it.",
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
  5: { name: 'Fake popularity', line: 'Numbers feel like votes, so we believe the crowd. But the crowd can be bought, the voters can be bots, and a checkmark is one line of data.', truth: '46 kids played gaga that day. 12 real people liked that post.' },
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
