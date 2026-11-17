# Life Academy: "Lens" puzzle plan

A single-page puzzle at **pere.games/lifeacademy/** for the Life Academy
homeschool co-op. The page is a mock social media app called **Lens**. The
class logs in as **Theo**, a student whose slip in the gaga pit at field day
is the talk of Life Academy, and scrolls his feed. Every time Theo looks,
pauses, reacts, replies or tries to look away, a hidden meter shows the app
turning that into a signal for its algorithm, and the meter fills faster
each time. The site changes stage by stage as the algorithm learns. The
class thinks it is solving seven web-design and coding puzzles. At the end,
the layers are peeled back one at a time, and each one is shown to be a
real way social media changes what you see and how you see it.

> This file lives in `_source/`, which Jekyll doesn't publish, so students
> can't find the answers on the site. Keep it out of `lifeacademy/`.

### The setting: one laptop, one projector, one room

- **Students are 13.** The puzzles, wording and hints are pitched at that
  age: real code, no baby steps, but nothing that needs prior coding.
- **Only the teacher touches the laptop**, which is projected for the whole
  class. Students have no screens. The class solves every puzzle
  **together, out loud**: they read the projected screen, argue, and tell
  the teacher exactly what to click, scroll and type. The teacher is the
  class's hands.
- **The class is Theo.** The app is logged in as him, and every choice the
  class makes is Theo's choice. Theo is 13, the same age as the class.

---

## 1. The big idea

### The hidden structure: Theo's feedback loop

Each stage, Theo does the next thing a real person would do, and each time
the algorithm needs less from him to be sure he wants more:

| # | Theo... | Hidden meter shows | Bar fills in | Code / design layer (what students think it is) | What it really is (the reveal) |
|---|---|---|---|---|---|
| 1 | **reads** a teacher's joke post | ⏱ time on screen | 90 seconds | **The Watcher**: hidden elements, `:hover`, timers | **Passive tracking**: watching is a vote |
| 2 | **scrolls**, and pauses on reposts | ⏸ pause time | about 20 seconds | **The Box & Style**: crop, `filter`, typography | **Exaggeration**: the story gets cropped, filtered and louder each time it's shared |
| 3 | **reacts** to show he doesn't like it | reaction weights | one click | **The Logic**: a JavaScript sort function | **The algorithm**: every reaction is fuel, angry ones most |
| 4 | **replies** to set the record straight | ⌨ keystrokes, saved drafts | every keystroke | **The Text**: strings, slicing, scoring | **Context collapse**: his words, cut down to the loudest part |
| 5 | **checks** who actually believes it | 👁 glance time | 2 seconds | **The Data**: JSON, variables, booleans | **Fake popularity**: likes, bots, badges |
| 6 | **searches** for something else | bars already full | already full | **The State**: a profile object, conditionals, CSS variables | **Filter bubble**: a small story feels like the whole world |
| 7 | **tries to log off** | bars filling by themselves | no input needed | **The Timers**: `setInterval`, infinite scroll | **Attention engineering**: endless feeds, notifications, dark patterns |
| ★ | *(peeled back)* | Lens's full file on Theo | | **The Layers**: a design-tool layer stack | **Context**: the thing every layer took away |

Three things rise together through the table:

- **Theo's actions** go from passive (looking) to active (reacting,
  replying) to trying to escape (searching, logging off). Each one is a
  sensible response to the stage before, and each one makes things worse.
  The finale says it plainly: *the algorithm can't tell the difference
  between interested and upset.*
- **The meter speeds up**, from 90 seconds down to no input at all. That
  acceleration *is* the feedback loop, and the class sees it happen.
- **The code** goes HTML/CSS → CSS → JS functions → JS strings → JS data →
  JS state → JS timing, which is roughly the order you'd learn the web in.

### The world: the gaga pit incident

All content comes from one event, so every layer reframes **the same
facts**. The event is a gaga ball mishap at **Life Academy's own field
day**: the students' own co-op, and something they'll have opinions about.

The people in the story are invented. Keep it that way even though the
co-op is real: use names that don't belong to any current student, parent
or teacher. Theo is a good sport in the true version, and the posts about
him stay teasing rather than cruel. The lesson is about the machine, not
about how mean people can be.

**What actually happened.** This is what the class is told at login, so
they know the truth from the start. Watching the feed bend it is the point.

- It drizzled until 11 a.m., so the gaga pit was muddy.
- 46 kids played gaga over the day.
- In the 1:30 championship game, **Theo** (13) dove for the ball, slipped in
  the mud, and slid into the pit wall. One wall panel popped loose and fell
  over.
- Everyone froze, then laughed, Theo hardest. He had a scraped elbow and got
  a band-aid.
- **Mr. Alvarez**, a parent, screwed the panel back on in ten minutes.
- It was an accident. The game was tied, and nobody was to blame.
- The championship was replayed, and **June**, age 8, won it.

By stage 7 the feed has turned it into *"GAGA PIT COLLAPSES — KID HURT IN
LIFE ACADEMY CHAOS 😱🔥 48.2K"*.

### The cast (Lens accounts)

| Account | Who | Role in the feed |
|---|---|---|
| **@theo** | Theo, 13 | The class. Logged in. |
| **@mrspark** | Mrs. Park, a Life Academy teacher | Posts the original joke post: affectionate, with all the context |
| **@maya.k** | A classmate | First repost: a little tighter, still friendly |
| **@jaxon_** | A classmate | Second repost: the laugh cropped out, the caption louder |
| **@lifeacademy.gossip** | A gossip account made today | The worst repost, the quote-posts, and the bought likes |
| **@june.plays.gaga** | June, 8 | Rematch winner; her post is the one that gets buried |
| **@alvarez.fixes** | Mr. Alvarez | "Wall's back up!" |
| **@sam** | A classmate | Barely heard about it. Their feed is mostly video games. |

### The art: one photo, many crops

Mrs. Park's photo is one wide inline-SVG illustration with all the context
in it:

- Theo sprawled in the mud by the fallen panel, **laughing, with a thumbs
  up**.
- The ball in mid-air, and kids around the pit laughing.
- Mr. Alvarez walking over with a drill.
- In the background, a chalkboard sign: *"CAUTION: MUD — pit opens at 11"*,
  and the bracket board: *"CHAMPIONSHIP REMATCH — 2:15"*.

Every repost is a crop of that same SVG (a different `viewBox`) with
heavier filters and a louder caption. Each crop cuts out a little more of the
context, and the laughing goes first. This keeps the page in a single file
and sets up the finale: zoom out to the full photo with every repost's crop
outlined on it.

### The fictional app: **Lens**

A made-up app with an eye-in-a-rounded-square logo. It should feel familiar
without copying any real platform's branding or layout.

### The signal meter (the core mechanic)

Every post has a **hidden meter**, an overlay that appears when the mouse
is over the post (or, from stage 2, when the feed pauses on it):

```
⏱ on screen 00:47          sending to algorithm ▓▓▓▓▓▓▓░░░░░ 52%
```

When the bar fills, it flashes a confirmation:

```
✓ PUSHED TO ALGORITHM — @theo is interested in #LifeAcademyFieldDay → show more
```

and the feed changes. The meter is the thread through the whole game:

- **It's hidden.** The class has to find it in stage 1. After that they
  know it's there, and they can't stop checking it.
- **It gets faster.** The threshold shrinks every time a signal is
  confirmed (the formula is in the code panel in stage 2). The class sees
  the algorithm get more confident.
- **It changes shape** with each stage's signal: a timer, a pause counter,
  reaction weights, a keystroke counter, a glance timer, a pre-filled bar,
  and finally bars that fill with nobody touching anything.
- **It feeds one file.** Every confirmation is written to a signal log about
  Theo, which stays hidden until the finale.

---

## 2. How the page works (applies to every stage)

### Designing for one projected screen

The page is a **presentation**, not an app students hold. Everything has to
read from the back of the room on a washed-out classroom projector.

- **Size.** Designed for a 16:9 screen at 1280×720 and 1920×1080. Body text
  at least 28px, code at least 24px, headlines much bigger. The feed column
  is wide, not phone-narrow. No phone layout is needed.
- **A big cursor.** The class has to follow the teacher's mouse, because
  hovering reveals the meters, so the page uses an extra-large, high-contrast
  cursor.
- **Contrast and color.** Projectors wash out pale colors and dark greys.
  Every color pair that has to be read gets strong contrast, and color
  differences that matter are exaggerated so they survive the projector.
  The only low-contrast elements are the ones that are low-contrast *on
  purpose* (stage 7), and those are tuned on the real projector.
- **Split screen, not a drawer.** The code panel opens as half the screen
  (feed on the left, code on the right) so the class can see the code and
  its effect at the same time.
- **One thing at a time.** Hints, locks and discussion questions appear big
  and centered, one at a time.
- **Nothing private on screen.** The audience sees everything the laptop
  shows, so answers and teacher controls are never displayed.
- **Sound** goes through the room's speakers if there are any: a soft tick
  when a meter confirms, and notifications in stage 7. Mute with one key.
- **Works offline.** The page is one file. Save a copy to the laptop before
  class (File → Save Page As) in case the Wi-Fi fails, and run it full
  screen (F11).

### Presenter controls

The teacher is the only operator, so the controls are **keyboard shortcuts
with nothing on screen**, like presentation software:

| Key | Does |
|---|---|
| `C` | Open or close the code panel |
| `H` | Show the next hint |
| `L` | Open the stage's lock (answer box), once the meter has confirmed |
| `N` | Skip the current transition animation |
| `B` | Blank the screen (to pause or talk) |
| `M` | Mute or unmute sound |
| `G` | Stage 6: show the next group's feed |
| `Shift` + `→` / `←` | Jump to the next or previous stage (rehearsal, or if the class gets stuck) |
| `Shift` + `R` | Start over (behind a confirmation, so it can't happen by accident) |

The answers are only in the printed answer key (section 8), never on
screen. To rehearse, use the same keys with the projector disconnected.

### Each stage's shape

Every stage runs the same four beats. This is what turns a scrolling
role-play into a puzzle:

1. **Theo's goal.** A short card in Theo's voice says what he wants to do
   next (*"I just want to read it."* / *"That's not what happened. I'm
   saying something."*).
2. **Play.** The class tells the teacher how to scroll, pause, react or
   type. The hidden meters fill as they go.
3. **Confirm.** A meter fills, the algorithm confirms, and the feed starts
   to change.
4. **Lock.** The page asks a question whose answer is in the meter or the
   code behind it. Solving it earns a letter and a "note from Theo" (what
   really happened), and the next stage rolls in.

### Layers, not pages

Each stage is a **layer** added on top of the earlier ones and never removed
until the ending. In code, every layer is one object:

```js
const layers = [
  { id: 'watcher',  cssClass: 'L1', enable() {...}, disable() {...}, panel: renderWatcherPanel },
  { id: 'reposts',  cssClass: 'L2', ... },
  // ... through 'hooks' (L7)
];
```

- CSS for a layer is scoped to its body class, so by stage 5 the body reads
  `class="L1 L2 L3 L4 L5"`.
- Any JS behavior (meters, sorting, tracking, timers) starts in `enable()`
  and is cleaned up in `disable()`.
- The ending runs `disable()` on each layer in reverse order. **The reveal
  really does remove the code**, and the class watches it happen.

### "Under the Hood": the code panel

A split-screen panel (opened with `C`) gains one tab per stage. Each tab
shows code **a different way**, which is the "each step shows code and
design differently" half of the puzzle. It replaces real browser DevTools,
whose text is far too small to read on a projector.

| Stage | Tab | How the code is shown |
|---|---|---|
| 1 | Watcher | The post's HTML with the hidden meter element highlighted, the CSS that hides it, and the timer JS |
| 2 | Box & Style | The original photo with every repost's crop drawn on it, and each repost's filter and caption side by side |
| 3 | Logic | The `score()` function with the reaction weights, and a `sortBy` dropdown |
| 4 | Text | A live keystroke log, the saved drafts, and the function that turns a reply into a quote |
| 5 | Data | A collapsible JSON tree of each post's real data |
| 6 | State | The live `you = {...}` profile object and a `viewingAs` switch |
| 7 | Timers | A "task manager" of everything running on its own, each with a Stop button |
| ★ | Layers | A 3D, design-tool-style stack of all seven layers, and the signal log |

All shown code is **generated from the live values**, so it's always true.
Syntax highlighting is a small hand-written tokenizer (no libraries). Each
tab starts with a comment like `// layer 3 of 7`.

### The tray: letters and notes

A tray along the bottom collects two things per stage:

1. **A letter tile.** The seven letters are the final answer.
2. **A "note from Theo"**: one plain fact about what really happened
   (e.g. *"Mr. Alvarez fixed the wall in ten minutes."*). At the end, these
   notes turn out to be the truth each layer was hiding.

### Two motifs that repeat

- **The meter gets faster.** Every stage, the class notices the bar fill
  more quickly. They feel the algorithm getting surer of itself before
  anyone explains it.
- **Solving doesn't switch it off.** Knowing what the meter does doesn't
  stop it. The layer stays on, and the next one is added. The finale is the
  first time anything is taken away.

### Checking answers, saving progress, and hints

- Answers are case-insensitive and ignore spaces, punctuation and a leading
  "a" or "the". A few locks accept more than one wording (listed in the
  answer key). They're checked against SHA-256 hashes (`crypto.subtle`), so
  **View Source won't give them away**. The site is public, so a student
  could open it at home before class.
- Progress (stage, letters, notes, signal log, time spent) is saved in the
  laptop's `localStorage`, so a refresh, a crashed browser or a second
  session picks up where the class left off.
- **Three hints per stage**: a nudge, a pointer, and nearly the answer. They
  appear only when the teacher presses `H`. The class has **3 hint tokens
  for the whole game**, shown in the corner, and a hint is free after a
  stage has run 5 minutes.

### Privacy (part of the lesson)

The page sends **nothing** anywhere. No analytics, no server, no fonts loaded
from elsewhere. The tracking is real, but it stays in the browser, and the
ending says so: *"Everything Lens learned about 'Theo' stayed on this laptop.
Real apps send it to their servers."* No student data is collected; the
only account is Theo's.

---

## 3. The stages

Each stage covers: **Theo's goal**, **what it looks like**, **the meter**,
**the code concept**, **the lock** (puzzle and answer), **in the room**, its
**role in the reveal**, and the **transition** into the next stage.

In class, every stage follows the same rhythm: **look → predict → instruct
→ reveal.** Because only the teacher touches the laptop, students have to
say precisely what they want ("hover over Mrs. Park's post", "set `angry`
to 0"), which makes them read the screen and the code closely. Predicting
out loud first keeps the whole room involved.

---

### Login (before stage 1)

**Looks like:** the Lens login screen, with the username already filled in:
**@theo**. The teacher clicks *Log in*. Before the feed loads, a briefing
card:

> *You are **Theo**. You're 13. Yesterday at Life Academy field day you
> slipped in the mud during the gaga championship and knocked a wall panel
> over. Everyone laughed, and so did you. Mr. Alvarez fixed the wall, there
> was a rematch, and June won. It was a good day.*
>
> *This morning, you open Lens.*

Below the briefing, the only framing the class gets: *"Seven layers. Each
one is a trick web designers use. Find them all."*

**In the room:** read the briefing aloud. Explain the one rule: *"You're
Theo. I'm your hands. I'll only do what you tell me."*

---

### Stage 1 — The Watcher (passive tracking)

**Theo's goal:** *"Mrs. Park posted about yesterday. I just want to read
it."*

**Looks like:** a calm, clean Lens feed with very little in it: a "Welcome
back, Theo" card and **Mrs. Park's post** at the top:

> **@mrspark** · Life Academy
> *Theo's championship-winning dive 🏆 (he didn't win… the wall did 😂).
> Wall fixed in 10 minutes thanks to Mr. Alvarez, rematch at 2:15. Best
> field day yet! #LifeAcademyFieldDay*
> *[the full, wide photo]* ❤️ 23

It's a joke, it's kind, and it has all the context. It's the truest thing
the class will see all game.

**The meter:** invisible until the mouse goes over the post. Then a
translucent overlay appears with a **timer counting how long the post has
been on screen** (since the feed loaded, not since the hover) and a
progress bar labeled *sending to algorithm*. It fills slowly, over **90
seconds**. When it's full:

```
✓ PUSHED TO ALGORITHM — signal: DWELL 01:30
  @theo is interested in #LifeAcademyFieldDay → show more
```

**Code concept:** a page holds more than it shows. Hidden elements, the
`:hover` selector, and a timer. The **Watcher** tab:

```html
<article class="post">
  …
  <div class="meter">⏱ <span>00:47</span> <progress max="90" value="47"></progress></div>
</article>
```
```css
.meter            { opacity: 0; }
.post:hover .meter { opacity: 1; }
```
```js
const DWELL_THRESHOLD = 90; // seconds
setInterval(() => {
  for (const post of postsOnScreen()) {
    post.seen++;
    if (post.seen === DWELL_THRESHOLD) sendSignal("dwell", post);
  }
}, 1000);
```

**The lock:** the page opens with a prompt: *"Theo is only reading. Is
anything on this page doing more than that?"* The class has to get the
teacher to move the mouse over the post to find the meter. Once it
confirms: *"Theo never clicked anything. How many seconds of looking did it
take for Lens to decide he wanted more?"*

- **Answer:** `90`
- **Letter:** **T**
- **Note from Theo:** *"Mrs. Park's post was a joke, and a nice one. She
  put in that the wall got fixed."*

**In the room:** before anyone finds the meter, ask *"How would you feel
seeing this post if you were Theo?"* (Most will say it's fine, even funny.)
Then let the hunt for the hidden thing start. When the meter appears, the
room usually goes quiet. Let the bar fill while they watch.

**Role in the reveal:** **Passive tracking.** *"Watching is a vote. You
don't have to like, share or comment. Apps measure how long you look, and
looking counts as wanting more."*

**Transition → 2:** under the confirmation, a small spinner: *"Finding more
posts for you…"* New posts start loading below Mrs. Park's, one after
another.

---

### Stage 2 — The Box & Style (exaggeration as it spreads)

**Theo's goal:** *"OK, enough of that. Let's see what else is on here."*

**Looks like:** a busier feed, with **mostly unrelated posts**: a cat
falling off a couch, someone's science-fair volcano, a band concert, a meme
about math homework. Scattered between them are classmates **reposting Mrs.
Park's photo**, each one more exaggerated than the last:

| Repost | Crop | Filter | Caption |
|---|---|---|---|
| **@maya.k** | a bit tighter; Theo still laughing | brighter | *"theo vs the gaga wall 😂"* |
| **@jaxon_** | the laughing and thumbs up cut off | high contrast | *"THEO DESTROYED THE PIT 💀"* |
| **@lifeacademy.gossip** | just the fallen panel and Theo's muddy sneakers | red tint, grain | *"GAGA PIT COLLAPSES — KID HURT IN LIFE ACADEMY CHAOS 😱 are they banning gaga??"* (huge caps, BREAKING banner) |

**The meter:** now it also shows when the feed **pauses** on a post (no
scrolling for a second with the post in the middle of the screen). It shows
the same timer and a **much faster bar, about 20 seconds**. It fills
fastest on the gossip post, because that's where people (and Theo) stop
longest. On confirmation:

```
✓ PUSHED TO ALGORITHM — signal: PAUSE ×3 (longest: @lifeacademy.gossip, 14s)
  @theo engages most with: dramatic posts about @theo → show more like this
```

**Code concept:** cropping, filters and typography: the box model,
`overflow: hidden`, `viewBox`, CSS `filter`, and `text-transform`. The
**Box & Style** tab draws every repost's crop as a rectangle on Mrs. Park's
original, so the class can see each one shrink, with each repost's CSS next
to it:

```css
.repost.jaxon  img { object-position: 38% 70%; transform: scale(2.5); filter: contrast(1.4); }
.repost.gossip img { object-position: 30% 80%; transform: scale(4);   filter: sepia(.5) hue-rotate(-30deg); }
.repost.gossip .caption { text-transform: uppercase; font-size: 64px; color: #e00; }
```

It also shows why the bar is faster:

```js
const threshold = DWELL_THRESHOLD / (1 + confirmedSignals * 3.5);   // 90 → 20
```

**The lock:** *"Every repost cut something out of Mrs. Park's photo, and it
was always the same thing first. What was Theo doing that nobody else
showed?"*

- **Answer:** `LAUGHING` (also accepts `LAUGHED`, `SMILING`, `THUMBS UP`)
- **Letter:** **E**
- **Note from Theo:** *"I was laughing. I got a band-aid for a scraped
  elbow, that's it."*

**In the room:** let the class decide where to stop scrolling, then ask
*"Why did we stop on that one?"* (They'll always stop on the post about
Theo. So would he.) For the lock, have the teacher flick between the
original and each repost while the class says what's gone each time.

**Role in the reveal:** **Exaggeration.** *"Each time a story is shared, it
gets cropped tighter, filtered harder and captioned louder. The version that
spreads furthest is usually the one with the least of what happened."*

**Transition → 3:** reaction buttons slide in under every post, and a
tooltip points at them: *"React to show how you feel! 💬"*

---

### Stage 3 — The Logic (the algorithm)

**Theo's goal:** *"That gossip post isn't true. I want Lens to know I don't
like it."*

**Looks like:** the same feed, now with reaction bars on every post
(❤️ 😂 😢 😡 👎). The ⋯ menu on each post also has a *"Not interested"*
option, small and grey.

**The meter:** hovering over a reaction button shows its hidden **weight**.
Clicking **any** reaction fills the bar **in one click**:

```
✓ PUSHED TO ALGORITHM — signal: REACT 😡 (+5)
  @theo is very interested in @lifeacademy.gossip → moving to top
```

and the feed **re-sorts** with a smooth animation: the gossip post jumps to
the top, three more like it appear just under it, and Mrs. Park's post
slides down.

**Code concept:** functions, weights and sorting. The **Logic** tab:

```js
const weight = { like: 1, laugh: 2, sad: 3, dislike: 4, angry: 5, notInterested: -1 };

function score(post) {
  let s = 0;
  for (const r in post.reactions) s += post.reactions[r] * weight[r];
  return s + post.shares * 3 + post.comments * 2 - post.ageHours;
}

let sortBy = "engagement";   // "engagement" | "newest" | "oldest"
feed.sort((a, b) => score(b) - score(a));
```

**The lock:** *"Lens decides what goes first. Tell it to sort by what
happened first."* Sorted **oldest first**, the first letters of the first
seven posts tagged #LifeAcademyFieldDay spell **REMATCH**:

| Time | Post |
|---|---|
| 9:05 | **R**ain again?? Field day's still on 🌧️ |
| 11:02 | **E**veryone's in the pit, gaga is open! |
| 1:31 | **M**UD DIVE 💥 the wall came DOWN |
| 1:33 | **A**ll good, Theo's laughing. Just a scrape 🩹 |
| 1:42 | **T**he wall's back up! (@alvarez.fixes) 🔧 |
| 2:15 | **C**hampionship replay starting now |
| 2:40 | **H**uge upset: June (8) wins the championship 🏆 (@june.plays.gaga) |

In engagement order, June's post (zero 😡) sinks to the very bottom.

- **Answer:** `REMATCH`
- **Letter:** **X**
- **Note from Theo:** *"There was a rematch. June won. Nobody's posting
  about that."*

**In the room:** before clicking, take a vote on which reaction Theo should
use to show he doesn't like the post. Ask the room to predict what will
happen. Whatever they choose, it boosts the post, and 😡 boosts it most.
Have a student read `score()` aloud. A challenge for the room: *"Is there
ANY button that tells Lens 'less of this'?"* (Only *Not interested*, worth
−1 against 😡's +5, hidden in the ⋯ menu.)

**Role in the reveal:** **The algorithm.** *"Every reaction is a vote for
more, and anger counts most. A formula, not a person, decides what comes
first, and it can't tell the difference between 'I love this' and 'I hate
this'."*

**Transition → 4:** a reply box opens under the gossip post with Theo's
avatar beside it: *"Say something, Theo 💬"*

---

### Stage 4 — The Text (context collapse)

**Theo's goal:** *"That's not what happened. I'm going to set the record
straight."*

**Looks like:** the gossip post at the top with its comment thread open.
Replies are piling up (teasing, never cruel: *"the wall had a family 😭"*,
*"bro just admit it"*, *"wait is gaga actually banned??"*).

**The meter:** it's attached to the **reply box**, and it fills **with
every keystroke**:

```
⌨ 41 keystrokes · draft saved · sending to algorithm ▓▓▓▓▓▓▓▓░░
```

Deleting doesn't make the count go down, and every version of the draft is
saved, including the words the class typed and took back.

**Play:** the class dictates Theo's reply and the teacher types it. (The
teacher is the filter. If the class is stuck or getting silly, the page
offers three ready-made replies: *"It was the mud lol, the wall's fixed"*,
*"Stop, it wasn't a big deal"*, *"Whoever runs this account is lying."*)
When Theo posts it, within seconds **@lifeacademy.gossip quote-posts it**,
cut down to its most charged few words:

> **@lifeacademy.gossip:** *Theo responds 👀: "…the wall's fixed…"* 🙄
> *(or "…lying…", or "…it wasn't a big deal…": the most dramatic chunk of
> whatever the class wrote)*

and the reply count on the gossip post jumps.

**Code concept:** strings. Events on an input, splitting and slicing text,
and scoring it. The **Text** tab shows the keystroke log and saved drafts,
and:

```js
input.addEventListener("input", () => { keystrokes++; drafts.push(input.value); sendSignal("typing"); });

function commentScore(text) {
  return text.length * 0.5
       + count(text, "!") * 3
       + mentions(text)   * 4
       + strongWords(text) * 6;
}

function quotePost(text) {
  const words = text.split(" ");
  return '"…' + loudestChunk(words, 4).join(" ") + '…" 👀';
}
```

**The lock:** *"Theo wants to reply again and fix it. Use `commentScore()`.
What reply won't feed the algorithm?"* The class can test ideas: the
teacher types them into a test box that shows their score. Even *"ok"* and
*"please stop"* score above zero. Only an empty reply scores 0.

- **Answer:** `NOTHING` (also accepts `NONE`, `NO REPLY`, `DON'T REPLY`,
  `SILENCE`, `EMPTY`)
- **Letter:** **T**
- **Note from Theo:** *"It was an accident. The game was tied. Nobody was
  to blame."*

**In the room:** this is the stage where the class feels most like Theo.
Let them argue about what he should say. After the quote-post appears, ask
*"Is that what Theo said?"* Point out the saved drafts: *"Lens read the
reply you deleted."*

**Role in the reveal:** **Context collapse.** *"Once your words are online,
anyone can cut them down to the loudest few and pass them on. And arguing
back counts as engagement, so replying to defend yourself pushes the story
further."*

**Transition → 5:** numbers appear under every post and start ticking up,
slowly and then like a slot machine: ❤️ 12 → 340 → 4,100 → **48.2K**.
Checkmarks pop in. A banner slides down: *🔥 Trending at Life Academy:
#GagaGate*.

---

### Stage 5 — The Data (fake popularity)

**Theo's goal:** *"48,000 people?? There aren't that many people at Life
Academy. Who actually liked this?"*

**Looks like:** numbers everywhere. Big like counts, a blue checkmark on
@lifeacademy.gossip, stacked avatar faces with *"Liked by maya.k and 48,211
others"*, *"#1 at Life Academy"*, *"🔥 Trending"*.

**The meter:** it now appears on the **like count**. Just opening the
*"Liked by"* list fills the bar in **about 2 seconds**:

```
✓ PUSHED TO ALGORITHM — signal: GLANCE (checked likes, 2.1s)
  @theo cares how many people saw this → show him the numbers
```

**Code concept:** data and variables. A post is just an object, and the
screen draws whatever the data says. A **checkmark is just a `true`**. The
**Data** tab:

```json
{
  "id": 41,
  "author": "lifeacademy.gossip",
  "accountCreated": "today",
  "verified": true,
  "likesShown": 48212,
  "likedBy": ["bot_8812", "bot_8813", "maya.k", "bot_8814", "..."],
  "boost": { "purchasedLikes": 48200, "price": "$19.99" }
}
```

Flipping `verified` to `false` makes the checkmark vanish, and the panel
shows the one CSS class that drew it.

**The lock:** *"How many real people liked the gossip post?"* Two ways to
get there: subtract `purchasedLikes` from `likesShown`, or page through
`likedBy` and count the accounts that aren't `bot_` (the panel has a filter
box).

- **Answer:** `12`
- **Letter:** **C**
- **Note from Theo:** *"46 kids played gaga that day. 12 real people liked
  that post."*

**In the room:** first, a show of hands: *"Who'd believe a post with 48,000
likes?"* Then page through `likedBy` slowly while the class counts real
accounts aloud. Someone usually spots the `purchasedLikes` shortcut partway
through. Ask the room which value to change to make the checkmark go away.

**Role in the reveal:** **Fake popularity.** *"Numbers feel like votes, so
we believe the crowd. But the crowd can be bought, the voters can be bots,
and a badge is one line of data. For Theo, the number made it feel like the
whole world had seen it."*

**Transition → 6:** a cheerful toast: *"We've updated your feed to match
your interests ✨"*. The theme color shifts to #GagaGate orange, and the
unrelated posts (the cat, the volcano, the band) **fade out one by one**.

---

### Stage 6 — The State (the filter bubble)

**Theo's goal:** *"I'm done with this. I'm going to look up something
else."*

**Looks like:** a feed that is **100% about Theo**. The whole app is themed
in #GagaGate orange, the greeting says *"Your Life Academy today"*, and
every post is the incident: reposts of reposts, polls (*"Should gaga be
banned?"*), *"Theo did it ON PURPOSE? 👀"*. When the class searches for
something else (*"soccer"*, *"Minecraft"*, anything), the results are still
about the gaga pit.

**The meter:** every bar is **already full** when a post appears:
*"✓ pre-confirmed"*. Lens doesn't need Theo to look any more. It already
knows.

**Code concept:** state, conditionals, and theming with CSS custom
properties. The **State** tab:

```js
const you = { id: "theo", interests: { gagaGate: 0.98, minecraft: 0.01, soccer: 0.01 } };

let viewingAs = "theo";   // "june" | "mrspark" | "sam"
feed = posts.filter(p => profile(viewingAs).interests[p.topic] > 0.5);
root.style.setProperty("--accent", topicColor[topInterest(viewingAs)]);
```

**The lock (the room splits up):** *"It feels like the whole of Life Academy
is talking about Theo. Is it?"* The `viewingAs` switch shows other people's
feeds, but the room is split so each group sees **only one**:

1. The teacher splits the class into **Group 1, Group 2 and Group 3** (sides
   of the room work well).
2. The page calls one group at a time: *"Group 1, look at the screen.
   Everyone else, turn around."* It shows one feed for **20 seconds** with a
   big countdown, then blanks. The teacher presses `G` for the next group.
   - **Group 1 sees June's feed:** her trophy, her friends congratulating
     her, a cake. One small mention of the wall.
   - **Group 2 sees Mrs. Park's feed:** lesson plans, a field trip sign-up,
     her original post with its 23 likes.
   - **Group 3 sees Sam's feed:** video games and a dog. No gaga at all.
3. Each feed's pinned post holds one piece of the answer, labeled *1/3*,
   *2/3* or *3/3*: **TO**, **GE**, **THER**.
4. The page asks the room: ***"What's Life Academy talking about today?"***
   Each group answers from the feed it saw (June's win, school stuff,
   nothing much) before anyone mentions the fragments. Nobody says "Theo."
   Let that land.
5. The groups put their fragments together and tell the teacher the word.

- **Answer:** `TOGETHER`
- **Letter:** **O**
- **Note from Theo:** *"Most people at Life Academy weren't even talking
  about it. It only looked that way from my feed."*

**In the room:** the 20 seconds is short on purpose: groups remember a
feeling, not details, just like scrolling. Check that groups that are turned
around can't see the screen reflected in a window. Afterwards, ask: *"If you
were Theo, and your feed looked like this, what would you think everyone
thought of you?"*

**Role in the reveal:** **The filter bubble.** *"Your feed isn't the world.
It's a mirror of what you've looked at. Theo looked at the story about
himself (anyone would), so his feed became nothing but that story, and a
small, funny moment felt like the whole school was against him."*

**Transition → 7:** a soft *ding*. A red badge 🔴 **1** appears on the bell.
Then **3**. Then **9**. A banner: *"People are talking about you right now."*

---

### Stage 7 — The Timers (attention engineering)

**Theo's goal:** *"I'm logging off."*

**Looks like:** everything at once. Notifications slide in every few seconds
(*"You were mentioned 14 times"*, *"@jaxon_ tagged you in a post"*,
*"New poll about you!"*). Badges keep rising. A "video" of the crash
autoplays **on a loop** (an animated SVG of the panel falling, over and
over, while the rematch is never shown). A streak counter ticks up. *"31
people are viewing posts about you"*. The feed **never ends**: it reshuffles
and recycles posts with new captions forever.

**The meter:** now **every** bar on every post fills and confirms **by
itself**, over and over, including on posts nobody is looking at:
*"✓ ✓ ✓ PUSHED TO ALGORITHM"*. Lens doesn't need Theo to do anything at all.

**Code concept:** time and motion. Timers (`setInterval`, `setTimeout`),
`IntersectionObserver` for infinite scroll, CSS `@keyframes`, and how
interaction design (where buttons go, how big they are, what color) steers
behavior. The **Timers** tab lists everything running with nobody touching
anything:

```
● loadMoreWhenNearBottom()   IntersectionObserver   [Stop]
● sendNotification()         every 9s               [Stop]
● autoplayCrashVideo()       on scroll              [Stop]
● growStreak()               every 15s              [Stop]
● fakeViewerCount()          every 4s               [Stop]
```

**The lock (the goal flips):** *"Find the way out."* There's nothing to
type. The class has to get every hook switched off and reach the log-off,
and each Stop button fights back with a real **dark pattern**, aimed right
at someone who's being talked about:

- **Confirmshaming:** *"Log off? People are talking about you RIGHT NOW
  😬"*. A huge bright **Stay and see ❤️** button, and a tiny grey *"log off
  and miss it"* link.
- **Roach motel:** the notification switch offers *"Pause for 1 hour"*
  (which turns itself back on after 20 seconds). The real *Turn off* is two
  menus deep.
- **Loss aversion:** stopping the streak warns *"You'll lose your 🔥 4-day
  streak forever!"* (It's been about four minutes.)
- **Moving target:** the Stop button for infinite scroll is low-contrast,
  and each newly loaded post pushes it down the page. On a projector it's
  *just* findable: a student may need to walk up to the screen and point,
  which is fine and fun. Tune it on the real projector before class.

When all five are stopped, the page goes **quiet**. The feed runs out,
and below the last post is something the class hasn't seen all game:
*"You're all caught up."* Then the *Log off* button, plain and normal-sized.

- **Answer:** (the action: log off)
- **Letter:** **N**
- **Note from Theo:** *"It was a good field day. It still was."*
- It also shows, flatly: **"Time on Lens: 41 min 12 s."** (The real time
  the class spent as Theo.)

**In the room:** the loudest stage, with sound on through the speakers. Hold
firmly to the rule that you only click what the class tells you. Every
dialog becomes a quick class decision: *"Stay or log off?"* Watch how *"people
are talking about you right now"* pulls at a room of 13-year-olds even when
they know it's a trick. Name that in the discussion.

**Role in the reveal:** **Attention engineering.** *"Endless feeds,
notifications, streaks and random rewards are designed to make leaving
hard, and they work hardest on someone who's worried about what people are
saying. The hardest thing to find in an app is the way out."*

**Transition → finale:** after *Log off*, the screen goes still, and nothing
moves for the first time since stage 2. Then the tray rises into the middle
of the screen with its seven letters.

---

## 4. The finale: peeling back the layers

### The final lock: CONTEXT

The letters come in stage order: **T E X T C O N**. It reads almost like
"text con," which is a nice accident. The prompt:

> *"Seven letters. Something scrambled them, the way it scrambled
> everything else. Put them in order: it's what every layer took away."*

The class calls out the order and the teacher drags the tiles (or types) to
make **CONTEXT**. Putting things back in the right order is a callback to
stage 3.

### The reveal, beat by beat

1. **Theo's file.** First, Lens shows what it learned, the signal log that
   every meter has been writing to all game, built from what the class
   actually did:

   ```
   @theo · what Lens learned today
   ✓ dwell    90s on @mrspark's post
   ✓ pause    ×9 on reposts (longest: 14s on "GAGA PIT COLLAPSES")
   ✓ react    😡 on @lifeacademy.gossip
   ✓ typing   63 keystrokes, 4 drafts saved (incl. 1 deleted)
   ✓ comment  1 reply → quoted 3 times
   ✓ glance   checked who liked it ×4
   ✓ search   "soccer" → shown #GagaGate
   ✓ stay     tried to leave ×5, stayed 4m 12s
   conclusion: @theo LOVES #GagaGate (98%)
   ```

   Then one line, alone on screen: ***"Lens can't tell the difference
   between interested and upset."***
2. **Explode the stack.** The interface tilts into 3D (CSS `perspective` and
   `rotateX`) and **comes apart into seven translucent layers**, like the
   layers panel in a design app. Each is labeled with its code name:
   *Watcher, Box & Style, Logic, Text, Data, State, Timers.* At the bottom,
   still there under everything: Mrs. Park's original post.
3. **Flip the labels.** One at a time each label flips like a card, showing
   its real name, a one-line explanation, and the note from Theo it hid:

   | Code name | What it really was | What it hid |
   |---|---|---|
   | Watcher | **Passive tracking** | Mrs. Park's post was kind, and had the whole story |
   | Box & Style | **Exaggeration** | Theo was laughing |
   | Logic | **The algorithm** | There was a rematch, and June won |
   | Text | **Context collapse** | It was an accident; nobody was to blame |
   | Data | **Fake popularity** | 12 real likes; 46 kids actually played |
   | State | **The filter bubble** | Most people weren't talking about it |
   | Timers | **Attention engineering** | It was a good day |

4. **Peel them off.** The layers come off **one by one, from the top**
   (Timers first, Watcher last), each time with a real `disable()`. Before
   each one, the teacher asks the room *"What did this layer do to Theo's
   day?"* and a student answers before the card flips. The feed calms down:
   notifications stop, the theme goes back to normal, the numbers vanish,
   the quote-posts disappear, the reactions go, the reposts fade, the meters
   switch off. What's left is **one post: Mrs. Park's**, with its full photo
   and 23 likes.
5. **The photo.** Zoom out to Mrs. Park's full photo with every repost's crop
   outlined on it. *"Every repost was a real photo. Just less of it."*
6. **Under the app.** The last thing to go is Lens itself. The styling drops
   away and the post becomes plain HTML (Times New Roman, blue links), with
   the true story underneath as a simple list. *"Under every app, it's just
   text and pictures. Somebody decides how you see them."*
7. **Close.** *"Everything Lens learned about 'Theo' stayed on this laptop.
   Real apps send it to their servers."* Then the time spent and the
   discussion questions (section 6), one per screen. Optionally, the
   teacher opens the browser's real DevTools (`F12`) to show what the Under
   the Hood panel was imitating: *"This is the real thing, and every website
   has it."*

After peeling, the teacher can switch any **single** layer back on to show
one manipulation by itself on Mrs. Park's honest post. That's useful for
discussion ("Just the meter, nothing else. Is that bad?").

---

## 5. Transitions: rules and order

### Rules every transition follows

1. **Additive.** A transition adds a layer and never takes one away until the
   finale. The feed keeps getting busier, louder and more about Theo.
2. **The algorithm moves first.** Every transition starts the moment a
   meter confirms, not when the class says so. The site changes *because*
   of what Theo did, and the class should feel that cause and effect each
   time.
3. **The next layer grows out of the last one.** The confirmation becomes
   "finding more posts", the reposts get reaction buttons, the reaction
   opens a reply box, the reply gets quoted and counted, the counts trigger
   "updating your feed", and the bubble triggers notifications. No hard
   cuts.
4. **Calm to loud.** Motion and sound start near zero in stage 1 and peak in
   stage 7, so the stillness after logging off hits harder.
5. **About 3–5 seconds**, skippable with `N`. `prefers-reduced-motion` gets
   cross-fades instead. Transitions are a moment for the room to react, so
   don't rush them.

### What carries forward

| Stage | Feed looks like | The meter | Motion / sound |
|---|---|---|---|
| 1 | Calm; one kind post | hidden; 90s on hover | none until it confirms |
| 2 | Busy; unrelated posts + louder reposts | pauses; ~20s | posts loading in |
| 3 | + reaction bars; re-sorting | one click | FLIP re-sort |
| 4 | + comment threads, quote-posts | every keystroke | replies popping in |
| 5 | + counters, checkmarks, trending | 2s glance | counters rolling up |
| 6 | All #GagaGate; orange theme; search hijacked | pre-filled | posts fading out, theme shift |
| 7 | Notifications, looping video, endless feed | fills itself | everything; *ding* |
| ★ | Signal log → 3D layer stack → Mrs. Park's post → plain HTML | switched off | everything stops; one card flip at a time |

### Why this order and not another

- **Each stage is the next thing a real person would do.** Read the post;
  scroll on; stop on the posts about you; react to the worst one; reply to
  defend yourself; check who believes it; look for something else; log off.
  None of it is foolish, and every step makes things worse. That's the
  lesson, and it only works in this order.
- **Passive comes before active.** Starting with looking (stage 1) shows the
  most surprising thing first: you don't have to click anything to be
  tracked. It also teaches the meter, which the rest of the game depends on.
- **Exaggeration (2) comes before the algorithm (3)** because the louder
  versions have to exist before the algorithm can reward them, and image
  and caption come before ranking in the life of a post.
- **Replying (4) comes after reacting (3)** because it's the bigger
  escalation: Theo goes from a button to his own words, and the meter goes
  from one click to every keystroke.
- **The numbers (5) come after the quote-posts** because the quote-posts are
  what go "viral", and the counts make that feel real.
- **The bubble (6) needs everything before it.** By then Lens really has
  learned what Theo looks at, so his feed narrowing to one story is earned,
  not faked.
- **Attention is last** because it's what every other layer is for. It's
  also the only stage where winning means *leaving*, the most important
  habit for students to take home. After the group split in stage 6, the
  room comes back together for the loudest stage, which sets up the sudden
  quiet of the finale.

---

## 6. Running it with the co-op

The whole class (13-year-olds) plays Theo together on one projected laptop.
The teacher is the only one who touches it; students do the thinking and
give the instructions.

### Before class

- **Room check:** connect the laptop to the projector in the actual room a
  day ahead if you can. Check that the back row can read the meters and the
  code panel, that the big cursor is easy to follow, that the stage 6 theme
  shift is obvious, and that the hidden Stop button in stage 7 is hard but
  possible to find. Check the speakers.
- **Save an offline copy** of the page to the laptop, in case the Wi-Fi
  fails.
- **Rehearse** with the projector disconnected, using `Shift` + `→` to jump
  between stages. Print the answer key and the presenter keys (section 8).
- On the day: full screen (`F11`), the laptop's own notifications turned off
  (real ones would be confusing in stage 7!), and the page left at the
  login screen before students arrive.

### Roles

- **Teacher (the only one at the laptop):** the class's hands. Clicks,
  scrolls and types only what the class tells them to; filters what gets
  typed as Theo's reply; runs the presenter keys; decides when to give
  hints; keeps the look → predict → instruct → reveal rhythm going.
- **Code reader:** a student volunteer each stage who reads the code panel
  aloud. Use a new one each stage, so seven students get a turn.
- **Spotters and counters:** "first to spot it" moments in stages 1, 2 and
  7, the vote on Theo's reaction in stage 3, the reply-writing in stage 4,
  and counting aloud in stage 5.
- **Everyone:** predicts, argues and tells the teacher what Theo does next.
  Students have to give exact instructions ("hover over the gossip post",
  "change `angry` to 0"), so they learn to use the code's own words.
- **Stage 6 groups:** three groups. Decide ahead of time how to split the
  room (by where they sit is easiest).

### Pacing (about 65 minutes, plus 20 for discussion)

| Stage | Minutes | Note |
|---|---|---|
| Login | 3 | Briefing; "you're Theo, I'm your hands" |
| 1 Watcher | 6 | Let the 90-second bar fill while they watch |
| 2 Box & Style | 8 | |
| 3 Logic | 8 | Vote on the reaction before clicking |
| 4 Text | 9 | Writing Theo's reply takes time; let it |
| 5 Data | 6 | Counting aloud |
| 6 State | 10 | Group split; let the "nobody said Theo" moment land |
| 7 Timers | 7 | Loud; the room decides every click |
| Finale | 8 | Recall question before each layer comes off |

If time is short, give hints early in stages 2 and 5. Don't shorten stage 6
or the finale. If the session has to stop partway, the laptop remembers
where the class left off.

### Tips

- **Don't spoil the theme.** Introduce it as a "web design lab" where the
  class plays a character. Let the ending land.
- **Keep Theo safe.** Make sure no student shares Theo's name or has had a
  similar incident recently. If anyone in the room seems to take the story
  personally, lean on the true version: Theo laughed, and it was a good day.
- **Pitched for 13.** The puzzles assume no coding experience but treat
  students as able to read real code. Stretch challenges for the room: find
  the *Not interested* weight (stage 3); write a reply with the lowest
  possible score that still says something (stage 4); find the hidden
  message in the real DevTools (`F12`) at the end.
- **Gaga is personal.** Some students will have strong feelings about gaga
  calls and "who's really out." Let that energy into the stage 4 reply and
  the stage 6 argument; it's exactly what the algorithm feeds on.

### Discussion questions (shown one per screen at the end, and printable)

Use think-pair-share: a minute for students to think, a minute to talk with
the person next to them, then a few share with the room.

1. How did it feel to be Theo? When did it stop being funny?
2. Theo never did anything wrong on Lens. Which of his choices made things
   worse? What could he have done instead?
3. Is cropping or filtering a photo *lying*? Where's the line?
4. Was Mrs. Park's post OK? What about @maya.k's? Where did it go wrong?
5. If you designed the `score()` function, what would you reward?
6. Has something small ever turned into a much bigger story once people
   started posting about it? What got lost along the way?
7. Stage 7 made leaving hard. What tricks do apps you use rely on? What
   helps you stop?
8. Is a social app with *none* of these layers possible? Would people use it?

### Follow-on activity

"**Add a layer.**" On paper, in small groups, students design an eighth
layer: another way an app could learn from Theo and push the story further,
or an "honest layer" that *helps* someone like Theo (a "this is about you —
want a break?" prompt, a "show me the original post" button). They sketch
it and write a few lines of pretend code in the style of the Under the Hood
panel, then present it.

---

## 7. Build plan

### Files

```
lifeacademy/
  index.html          ← the whole puzzle: HTML, CSS, JS and the photo SVG inline
  icon.svg            ← Lens favicon
_source/lifeacademy/
  PLAN.md             ← this file (not published)
  answers.md          ← printable answer key and presenter keys (not published)
```

It's a standalone page with no Jekyll layout (like `fretspeak/`), so the
site header and footer don't break the illusion. Add
`<meta name="robots" content="noindex">` so search results don't show the
ending. It can be linked from the home page's Apps section later.

### Inside index.html

1. **Markup:** the Lens shell (top bar, feed column, notification bell,
   search), the post template, the tray, the Under the Hood panel, and the
   photo `<svg>` in a `<template>`, cloned for each crop. Mrs. Park's post
   and the true story are real semantic HTML underneath everything, so the
   finale can strip down to them.
2. **CSS:** base Lens styles, then one block per layer scoped to
   `body.L1`…`body.L7`, then the finale's 3D stack. Colors as custom
   properties so stage 6 can re-theme everything with one variable. The big
   cursor.
3. **JS:**
   - `data`: posts (author, time, topic, tag, crop, filter, caption,
     reactions, likedBy, bubble fragment), the cast's other feeds, notes,
     hints.
   - `meter`: the signal meter: on-screen timers, pause detection, the
     shrinking threshold, confirmations, and the signal log.
   - `layers[]`: `enable`/`disable`/`panel` for each layer.
   - `engine`: stage state machine, Theo's goal cards, locks with SHA-256
     answer checks (several accepted answers per lock), save/load in
     `localStorage`, hints and hint tokens, presenter keys.
   - `panel`: the Under the Hood split screen and its tabs, with the small
     syntax highlighter.
   - `reply`: the stage 4 reply box, keystroke log, drafts, `commentScore`,
     the quote-post generator, and the three fallback replies.
   - `groups`: the stage 6 sequence (call a group, 20-second countdown,
     blank, next group).
   - `finale`: signal log, CONTEXT tile puzzle, layer stack, peel-back,
     the crop overlay and the plain-HTML ending.

### Milestones

1. **Skeleton:** Lens shell, stage engine, layer system, tray, split-screen
   panel, save/load, presenter keys. Every stage as a placeholder with a
   "solve" button. Projected-size type and the big cursor from day one.
2. **The meter:** timers, pause detection, the shrinking threshold,
   confirmations and the signal log. It's the core of the game, so build
   and tune it early.
3. **Art:** Mrs. Park's photo SVG and the crop for every repost.
4. **Stages 1–3**, each with its goal card, meter, panel and lock.
5. **Stages 4–7**, the same.
6. **Finale:** signal log, CONTEXT lock, 3D layer stack, peel-back, plain-
   HTML ending.
7. **Polish:** transitions, reduced motion, keyboard pass, legibility at
   1280×720, hint text, and a read-through of every post for tone (teasing,
   never cruel).
8. **Testing:** an automated Playwright run-through of every stage at
   1280×720 and 1920×1080. Then a **rehearsal on the real projector**,
   ideally with two or three people at the back of the room calling out
   instructions the way the class will. Adjust text sizes, colors, meter
   speeds and the stage 7 hidden button from what they can and can't see.

### Accessibility

For a projected class, accessibility mostly means **legibility for the whole
room**: big type, strong contrast, a big cursor, and nothing important shown
only by color. Seat any students with low vision near the screen, and have
the code reader say everything that matters out loud. Everything works by
keyboard. The two places that *deliberately* break good design (the
low-contrast Stop button and the confirmshaming link in stage 7) are named
as bad design in the finale. With `prefers-reduced-motion`, motion is
replaced by cross-fades, but the stage 7 notifications still arrive (as
quiet badges).

---

## 8. Answer key (facilitator only)

| Stage | Lock | Answer (also accepted) | Letter | Note from Theo |
|---|---|---|---|---|
| 1 | Seconds of looking before Lens decided | 90 | T | Mrs. Park's post was kind and had the whole story |
| 2 | What every repost cut out first | LAUGHING (laughed, smiling, thumbs up) | E | Theo was laughing; just a scraped elbow |
| 3 | Sort oldest first; first letters | REMATCH | X | There was a rematch, and June won |
| 4 | The reply that scores 0 | NOTHING (none, no reply, don't reply, silence, empty) | T | It was an accident; nobody was to blame |
| 5 | Real likes on the gossip post | 12 | C | 46 kids played; 12 real likes |
| 6 | Three feeds' fragments | TOGETHER | O | Most people weren't talking about it |
| 7 | *(stop all five hooks and log off)* | | N | It was a good day |
| ★ | Unscramble TEXTCON | CONTEXT | | |

Print this table and the presenter keys from section 2 for the session.

## 9. Open questions

- **Mrs. Park:** keep an invented teacher for the first post, or make it you
  (with a made-up name or your own)? Posting the "joke" as the class's own
  teacher could make stage 1 land harder.
- **Names.** Check that Theo, June, Maya, Jaxon, Sam, Mrs. Park and Mr.
  Alvarez don't belong to anyone at Life Academy, and swap any that do.
- **Theo's reply (stage 4):** free text typed by you as the class dictates
  (the plan's default), or only the three ready-made replies?
- **Class size.** Affects the stage 6 groups (three groups works from about
  6 students up).
- **The room:** projector resolution, and whether there are speakers.
- **The app's name:** "Lens" or something else.
- **Sound:** on by default (the plan's default, muted with `M`), or off?
