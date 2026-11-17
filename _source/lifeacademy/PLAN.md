# Life Academy: "Lens" plan

A single-page experience at **pere.games/lifeacademy/** for the Life Academy
homeschool co-op. The page is a mock social media app called **Lens**. The
class logs in as **Theo**, a student whose slip in the gagaball pit at field day
is the talk of Life Academy, and scrolls his feed. Every time Theo looks,
pauses, reacts, replies or tries to look away, a hidden meter shows the app
turning that into a signal for its algorithm, and the meter fills faster at
each stage. The teacher moves the class from stage to stage with a
**keybind**. After stage 7 comes **Lens Replay**: a breakdown of exactly how
long the class looked at which posts and ads, and how that re-sorted the
feed and the ads at every stage. The replay is where each stage is revealed
as a real way social media changes what you see and how you see it.

> This file lives in `_source/`, which Jekyll doesn't publish, so students
> can't find it on the site. Keep it out of `lifeacademy/`.

### The setting: one laptop, one projector, one room

- **Students are 13.** Everything is pitched at that age.
- **Only the teacher touches the laptop**, which is projected for the whole
  class. Students have no screens. The class decides together, out loud,
  what Theo does, and tells the teacher what to click, scroll and type. The
  teacher is the class's hands.
- **The class is Theo.** The app is logged in as him, and every choice the
  class makes is Theo's choice. Theo is 13, the same age as the class.
- **No codes, no answers.** Nothing has to be solved to move on, and nobody
  has to read code. The teacher presses one keybind whenever the
  room is ready for the next stage.

---

## 1. The big idea

### The hidden structure: Theo's feedback loop

Each stage, Theo does the next thing a real person would do, and each time
the algorithm needs less from him to be sure he wants more:

| # | Theo... | Hidden meter shows | Bar fills in | What it really is (revealed in the replay) |
|---|---|---|---|---|
| 1 | **scrolls**, then reads a teacher's joke post he gets tagged in | ⏱ time on screen | 90 seconds | **Passive tracking**: watching is a vote |
| 2 | **scrolls**, and pauses on reposts | ⏸ pause time | about 12 seconds | **Exaggeration**: the story gets cropped, filtered and louder each time it's shared |
| 3 | **reacts** to show he doesn't like it | reaction weight | one click | **The algorithm**: every reaction is fuel, angry ones most |
| 4 | **replies** to set the record straight | ⌨ keystrokes, saved drafts | every keystroke | **Context collapse**: his words, cut down to the loudest part |
| 5 | **checks** who actually believes it | 👁 glance time | 2 seconds | **Fake popularity**: likes, bots, badges |
| 6 | **searches** for something else | bars already full | already full | **Filter bubble**: a small story feels like the whole world |
| 7 | **tries to log off** | bars filling by themselves | no input needed | **Attention engineering**: endless feeds, notifications, dark patterns |
| ⏪ | *(Lens Replay)* | everything Lens recorded | | **What it all adds up to**: Lens can't tell interested from upset |

Two things rise together through the table:

- **Theo's actions** go from passive (looking) to active (reacting,
  replying) to trying to escape (searching, logging off). Each one is a
  sensible response to the stage before, and each one makes things worse.
- **The meter speeds up**, from 90 seconds down to no input at all. That
  acceleration *is* the feedback loop, and the class sees it happen.

The class doesn't hear the names in the last column until the replay. During
play, they just feel each one.

### The world: the gagaball pit incident

All content comes from one event, so every stage reframes **the same
facts**. The event is a gagaball mishap at **Life Academy's own field
day**: the students' own co-op, and something they'll have opinions about.

The people in the story are invented. Keep it that way even though the
co-op is real: use names that don't belong to any current student, parent
or teacher. Theo is a good sport in the true version, and the posts about
him stay teasing rather than cruel. The lesson is about the machine, not
about how mean people can be.

**What actually happened.** The class is told this at login, so they know
the truth from the start. Watching the feed bend it is the point.

- It drizzled until 11 a.m., so the gagaball pit was muddy.
- 46 kids played gagaball over the day.
- In the 1:30 championship game, **Theo** (13) dove for the ball, slipped in
  the mud, and slid into the pit wall. One wall panel popped loose and fell
  over.
- Everyone froze, then laughed, Theo hardest. He had a scraped elbow and got
  a band-aid.
- **Mr. French** brought his drill and screwed the panel back on in ten minutes.
- It was an accident. The game was tied, and nobody was to blame.
- The championship was replayed, and **June**, age 8, won it.

By stage 7 the feed has turned it into *"GAGABALL PIT COLLAPSES — KID HURT IN
LIFE ACADEMY CHAOS 😱🔥 48.2K"*.

### The cast (Lens accounts)

| Account | Who | Role in the feed |
|---|---|---|
| **@theo** | Theo, 13 | The class. Logged in. |
| **@mrfrench** | Mr. French, a Life Academy teacher | Posts the original joke post: affectionate, with all the context |
| **@maya.k** | A classmate | First repost: a little tighter, still friendly. Later, the one kind comment. |
| **@jaxon_** | A classmate | Second repost: the laugh cropped out, the caption louder |
| **@lifeacademy.gossip** | A gossip account made today | The worst repost, the quote-post, and the bought likes |
| **@ella.r**, **@noah_b**, **@kai.plays** | Classmates | Commenters in the stage 4 thread |
| **@june.plays.gaga** | June, 8 | Rematch winner; her post is the one that gets buried |
| **@sam** | A classmate | Barely heard about it. Their feed is mostly video games. |

### The art: one photo, many crops

Mr. French's photo is one wide inline-SVG illustration with all the context
in it:

- Theo sprawled in the mud by the fallen panel, **laughing, with a thumbs
  up**.
- The ball in mid-air, and kids around the pit laughing.
- Mr. French walking over with a drill.
- In the background, a chalkboard sign: *"CAUTION: MUD — pit opens at 11"*,
  and the bracket board: *"CHAMPIONSHIP REMATCH — 2:15"*.

Every repost is a crop of that same SVG (a different `viewBox`) with heavier
filters and a louder caption. Each crop cuts out a little more of the
context, and the laughing goes first. The replay draws every repost's crop
on the original photo.

### The fictional app: **Lens**

A made-up app with an eye-in-a-rounded-square logo. It should feel familiar
without copying any real platform's branding or layout.

### The signal meter (the core mechanic)

Every post (and every ad) has a **hidden meter**, an overlay that appears
when the mouse is over it, or, from stage 2, when the feed pauses on it:

```
⏱ on screen 00:47          sending to algorithm ▓▓▓▓▓▓▓░░░░░ 52%
```

When the bar fills, it flashes a confirmation:

```
✓ PUSHED TO ALGORITHM — @theo is interested in #LifeAcademyFieldDay → show more
```

and the feed re-sorts. The meter is the thread through the whole thing:

- **It's hidden.** The class finds it in stage 1. After that they know it's
  there, and they can't stop checking it.
- **It gets faster.** The threshold shrinks every time a signal is
  confirmed, so the class watches the algorithm get surer of itself.
- **It changes shape** with each stage: a timer, a pause counter, a reaction
  weight, a keystroke counter, a glance timer, a pre-filled bar, and finally
  bars that fill with nobody touching anything.
- **It records everything** for the replay (section 4).

### Comments on every post

Tapping or clicking a post's comment count opens its comments right inside
the post (tap again to close). Every post has three to five comments
written for it (`LENS.postComments`), shown one by one as the post's
comment count grows, so a brand-new post's comments fill in live, with a
*"+ N more comments"* line for the rest. Mr. French's post also collects
the stage 1 tags as comments. Opening a post's comments is itself a signal
(*"OPENED COMMENTS"*). The gossip post opens inline in stages 2–3; from
stage 4 on it opens the full thread view where Theo can reply.

Under every open comments section there's a **"Reply as Theo…" box**, so
the class can answer any post if they want to. Theo's comment appears at
the bottom, highlighted, and the count goes up. As in stage 4, Lens counts
every keystroke (a *TYPING* signal after 15 keys on a post) and pushes the
posted comment to the algorithm (*COMMENT*). The replay's "what Lens
learned" list includes these. On phones the bottom ad banner hides while
the keyboard is open.

### Comment reactions, more comments, and live timing

- **Every comment can be reacted to**: a small *👍 Like* button opens the
  same six reactions. Theo's choice shows on the button (tap again to take
  it back), each comment shows its own count and top icons, and Lens counts
  it as a signal toward that post (*REACT TO COMMENT*, half the weight of a
  post reaction).
- **"View N more comments"** loads five more at a time, written from pools
  that fit the post (kind ones for Mr. French's, gagaball chatter for the
  story posts, everyday ones for the rest).
- **Timing**: Mr. French posts live in stage 1, so the reposts of his photo
  (Maya's, Jaxon's, the gossip account's) and every later story post are
  stamped *Just now* / *Xm*, a little after his; only the field-day posts
  from yesterday and the unrelated evening posts say *Yesterday*.

### Seen posts grey out

A post counts as viewed once it has been on screen for 3 seconds. When the
class scrolls past a viewed post, it fades to grey with a small *"Seen ✓"*
after its timestamp, and stays that way for the rest of the session (it
comes back to full color on hover or tap, or when its meter or a
confirmation is showing). New posts stay bright until they've been viewed,
so the eye goes to whatever Lens just added. Ads never grey out.

### Sidebar ads (live, one per post)

Every post has its own invented ad (`LENS.postAds` in `data.js`): the roomba
post has *SweepBot*, the kickflip post *GripTape Skate*, Mr. French's post
*FieldDay Co.*, the gossip post *Lens Alerts+*, and so on, 38 in all. The
sidebar shows the ads for the posts the class has spent the most time on
(3 slots, 2 from stage 5 when the trending box appears), re-ranked every
second. Each one says why: *"Because you looked at Kickflip, day 3 for
15s"*. A new ad slides in with a highlight when it takes a slot. Every
change is recorded for the replay.

### Reactions and comments, live

A post that lands during the session (Mr. French's, the stage 3 posts, the
quote-post, the bubble posts, the endless-feed posts) starts with **zero**
reactions and comments and shows *"Just now"*. Counts then arrive fast and
slow down on a curve: `target × (1 − e^(−age/τ))`, with τ ≈ 22 s for
reactions and ≈ 34 s for comments. Older posts already have most of theirs
and only tick up a little. Whenever a visible post's likes go up, emoji
from its reaction mix (❤️ 😂 😢 😡) float up off the like count, and Theo's
own reactions burst ten of the chosen emoji.

### The ads

From stage 2 on, every fourth item in the feed is an **ad**, clearly
labeled *Sponsored*. Ads are ranked by the same interest profile as posts,
so as Theo's attention moves, the ads move with it. All brands are invented.

| Ad | Topic | Typically shows up |
|---|---|---|
| 🎮 *Pixel Quest — Season 4 is live* | games | Stage 2, before Lens knows much |
| 👟 *Fleet Sneakers — 30% off* | sports | Stage 2 |
| 📐 *MathBuddy — homework help in seconds* | school | Stage 2 |
| 🏐 *ProGaga Ball — official size* | gagaball | Rises in stage 2–3 |
| 🛡️ *FlexGuard elbow & knee pads* | gagaball, injury | After the "KID HURT" reposts |
| 🪵 *Backyard Gaga Pit Kit* | gagaball | Stage 3 onward |
| 👀 *Lens Premium: see who's talking about you* | drama, self | After Theo replies (stage 4) |
| 🚀 *Post Boost: 10,000 likes for $19.99* | drama | Stage 5, the same service the gossip account used |
| 🧘 *Unwind — feel calm in 5 minutes* | stress | Stage 7, while the app does everything it can to stress him |

```js
adScore = ad.bid * (0.2 + interest[ad.topic]);
```

The class doesn't have to notice the ads during play. The replay shows how
they shifted, how many seconds Theo spent on them, and what that attention
was "worth" to Lens.

---

## 2. How the page works

### Designing for one projected screen

The page is a **presentation**, not an app students hold. Everything has to
read from the back of the room on a washed-out classroom projector.

- **Size.** Designed for a 16:9 screen at 1280×720 and 1920×1080. Body text
  at least 28px, headlines much bigger. The feed column is wide, not
  phone-narrow. No phone layout is needed.
- **A big cursor.** The class has to follow the teacher's mouse, because
  hovering reveals the meters, so the page uses an extra-large,
  high-contrast cursor.
- **Contrast and color.** Projectors wash out pale colors and dark greys.
  Every color pair that has to be read gets strong contrast, and color
  differences that matter (the stage 6 theme, the replay's charts) are
  exaggerated so they survive the projector. The only low-contrast elements
  are the ones that are low-contrast *on purpose* (stage 7), and those are
  tuned on the real projector.
- **One thing at a time.** Theo's goal cards and replay chapters appear big
  and centered, one at a time.
- **Sound** goes through the room's speakers if there are any: a soft tick
  when a meter confirms, and notifications in stage 7. Mute with one key.
- **Works offline.** The page is one file. Save a copy to the laptop before
  class (File → Save Page As) in case the Wi-Fi fails, and run it full
  screen (F11).

### The advance keybind

The teacher moves the class on with one **keybind: `Shift` + `→`**. Nothing
appears on screen, so the class never sees a "next" button. Press it and
the next stage rolls in:

| Press | Opens |
|---|---|
| 1st | Stage 2: more posts (and the first ads) |
| 2nd | Stage 3: reactions |
| 3rd | Stage 4: the comment thread |
| 4th | Stage 5: the numbers |
| 5th | Stage 6: the bubble |
| 6th | Stage 7: the notifications |
| 7th | Lens Replay (stage 7 also opens it on its own when the class logs off) |

- **Use it at will.** There's no puzzle gate. The teacher advances whenever
  the room has had its moment, the discussion has landed, or time is short.
- **Keeps the story coherent.** If the teacher advances before that stage's
  meter has confirmed, the confirmation fires as the first beat of the
  transition, so the class still sees *"✓ PUSHED TO ALGORITHM"* before the
  feed changes. The replay notes it ("advanced before Lens was sure").
- **Hard to press by accident.** It needs `Shift`, so arrow keys used to
  scroll the feed never trigger it, and it does nothing while the stage 4
  reply box is being typed in.
- **Backwards too.** `Shift` + `←` steps back a stage for rehearsal or a
  do-over.

### Phones and tablets

The page also works on phones and tablets (anything under 860px wide gets
the mobile layout):

- **One column.** The feed fills the screen; the sidebar becomes a live ad
  banner pinned to the bottom, still showing the top-ranked ad and its
  *"Because you looked at…"* line.
- **Tap instead of hover.** Tapping a post reveals its hidden meter, which
  sits as a slim strip across the top of the post. A tapped post stops
  counting once it scrolls away.
- **A ⏭ presenter button** appears in the top bar on touch screens (never
  on a laptop with a mouse): Next stage, Back a stage,
  Skip animation, Sound on/off, Start over.
- **Replay:** ‹ ▶ › buttons at the bottom (on every screen size), and swipe
  left or right on touch screens. Charts switch to a narrower layout.

### Presenter keys

The teacher is the only operator, so everything is a keyboard shortcut with
nothing on screen:

| Key | Does |
|---|---|
| `Shift` + `→` | **Advance** to the next stage (in the replay: the last screens and the switch-off) |
| `Shift` + `←` | Step back a stage (rehearsal or a do-over) |
| `N` | Skip the current transition animation |
| `B` | Blank the screen (to pause or talk) |
| `M` | Mute or unmute sound |
| `→` / `←` | In the replay: next or previous chapter |
| `Space` | In the replay: play or pause the feed replay |
| `C` | Optional: open the "Under the Hood" code panel (see below) |
| `Shift` + `R` | Start over, clearing everything Lens recorded (behind a confirmation) |

To rehearse, use the same keys with the projector disconnected, then
`Shift` + `R` before class so the replay only contains the class's session.

### Each stage's shape

Every stage runs the same three beats:

1. **Theo's goal.** A short card in Theo's voice says what he wants to do
   next (*"I just want to read it."* / *"That's not what happened. I'm
   saying something."*).
2. **Play.** The class tells the teacher how to scroll, pause, react or
   type. The hidden meters fill as they go, confirm, and re-sort the feed
   and the ads.
3. **Advance.** When the room is ready, the teacher presses `Shift` + `→`.

In class, the rhythm inside a stage is **look → predict → instruct →
watch**: the class reads the screen, someone predicts what Lens will do,
the class tells the teacher what Theo does, and everyone watches the meter.

### Layers

Each stage is a **layer** added on top of the earlier ones. In code, every
layer is one object, which keeps the stages independent and lets the
keybind step forward and back cleanly:

```js
const layers = [
  { id: 'watcher',  cssClass: 'L1', enable() {...}, disable() {...} },
  { id: 'reposts',  cssClass: 'L2', ... },
  // ... through 'hooks' (L7)
];
```

CSS for a layer is scoped to its body class (`body.L3 .post .reactions`),
and any JS behavior (meters, sorting, timers) starts in `enable()` and is
cleaned up in `disable()`. The end of the replay switches every layer off.

### Optional: "Under the Hood"

Nothing in the experience depends on reading code. For a class that wants
to see how it's built, `C` opens a split-screen panel with the few lines
behind the current stage (the hidden meter's CSS, the sorting function, the
keystroke counter, and so on), in big type. Each replay chapter also shows
the one short rule that caused what the class just saw, so the code is
there for anyone curious without being a gate.

### Privacy (part of the lesson)

The page sends **nothing** anywhere. No analytics, no server, no fonts loaded
from elsewhere. The tracking is real, but it stays in the browser, and the
replay says so: *"Everything Lens recorded about 'Theo' stayed on this
laptop. Real apps send it to their servers."* No student data is collected;
the only account is Theo's. Progress and the recording are kept in the
laptop's `localStorage`, so a refresh or a second session picks up where
the class left off.

---

## 3. The stages

Each stage covers: **Theo's goal**, **what it looks like** (including the
ads from stage 2), **the meter**, **in the room**, **what the replay will
show**, and **the key** that moves on to the next stage.

---

### Login

**Looks like:** the Lens login screen, with the username already filled in:
**@theo**. The teacher clicks *Log in*. Before the feed loads, a briefing
card:

> *You are **Theo**. You're 13. Yesterday at Life Academy field day you
> slipped in the mud during the gagaball championship and knocked a wall panel
> over. Everyone laughed, and so did you. Mr. French fixed the wall, there
> was a rematch, and June won. It was a good day.*
>
> *This morning, you open Lens.*

**In the room:** read the briefing aloud. Explain the one rule: *"You're
Theo. I'm your hands. I'll only do what you tell me."* Introduce it as a web
design lab where they play a character. Don't mention algorithms yet.

---

### Stage 1 — The joke post (passive tracking)

**Theo's goal:** *"Just scrolling before school. What's everyone up to?"*

**Looks like:** a calm, clean Lens feed with very little in it: a "Welcome
back, Theo" card and **Mr. French's post** at the top:

> **@mrfrench** · Life Academy
> *Theo's championship-winning dive 🏆 (he didn't win… the wall did 😂).
> Wall fixed in 10 minutes thanks to Mr. French, rematch at 2:15. Best
> field day yet! #LifeAcademyFieldDay*
> *[the full, wide photo]* ❤️ 23

It's a joke, it's kind, and it has all the context. It's the truest thing
the class will see all game. No ads yet.

Around it is an ordinary, goofy morning feed: **one post above Mr. French's
and nine below**, from random kids at other schools and a few classmates.

| Where | Who | Post |
|---|---|---|
| above | Toby (random) | my mom said no pets so I named the roomba Steve 🤖 he's thriving |
| below | Kai | day 3 of trying to land a kickflip. the driveway is winning 🛹 |
| below | Lulu (random) | drew my dog as a medieval knight. he has no idea he's been knighted ⚔️ |
| below | Quinn (random) | who decided 7am was a real time |
| below | Lily | made pancakes shaped like everyone in my family. dad is a circle 🥞 |
| below | Marcus (random) | accidentally walked into my sister's zumba class and was too scared to leave… |
| below | Dev | science fact: you can't sneeze with your eyes open. I have tested this 14 times today… |
| below | Ivy (random) | my cat just pushed my water glass off the table while looking me directly in the eyes… |
| below | Benji (random) | grandma signs every text. even "ok". "Ok. Love, Grandma" 💌 |
| below | Nora | practiced violin for 2 hours. the neighbor's dog howled for 2 hours… |

**Mr. French's post isn't there at first.** It arrives **60 seconds** into
the stage, slotting in under Toby's post with a *"↑ New post from Mr.
French"* pill. Then the notifications start, one about every 9 seconds, each
ringing the bell, raising the red badge and bumping the post's comment count:

1. *Mr. French tagged you in a post*
2. *@maya.k mentioned you: "@theo the wall never stood a chance 😂"*
3. *@kai.plays mentioned you: "@theo LEGEND 🏆"*
4. *@jaxon_ mentioned you: "@theo rematch when?? 😂"*
5. *@ella.r mentioned you: "@theo are you ok lol"*
6. *@noah_b mentioned you: "@theo watch it in slow mo 💀"*

Tapping a notification (or a row in the bell's list) scrolls straight to
Mr. French's post. The tags are friendly; the point is that they keep
pulling Theo back to the same post. The replay counts them.

Every post carries its own hidden on-screen timer, so whatever the class
lingers on is counted. Stage 1 always ends with Mr. French's post being
pushed. When stage 2 starts, its new posts load right under Mr. French's,
and these goofy posts get pushed further down the feed.

**The meter:** invisible until the mouse goes over the post. Then a
translucent overlay appears with a **timer counting how long the post has
been on screen** (since the feed loaded, not since the hover) and a
progress bar labeled *sending to algorithm*. It fills slowly, over **90
seconds**, then confirms:

```
✓ PUSHED TO ALGORITHM — signal: DWELL 01:30
  @theo is interested in #LifeAcademyFieldDay → show more
```

**In the room:** ask *"How would you feel seeing this post if you were
Theo?"* (Most will say it's fine, even funny.) Then: *"Is anything on this
page doing more than showing you a post?"* Let the class send the mouse
around until someone has it hover over the post. When the meter appears,
the room usually goes quiet. Let the bar fill while they watch.

**The replay will show:** where it started. Ninety seconds on one kind post
was enough for Lens's first conclusion.

**Advance →** a spinner under the confirmation: *"Finding more posts for
you…"* New posts start loading below Mr. French's, one after another.

---

### Stage 2 — The reposts (exaggeration as it spreads)

**Theo's goal:** *"OK, enough of that. Let's see what else is on here."*

**Looks like:** a busier feed, with **mostly unrelated posts**: a cat
falling off a couch, someone's science-fair volcano, a band concert, a meme
about math homework. The first **ads** appear (Pixel Quest, Fleet Sneakers,
MathBuddy). Scattered between them are classmates **reposting Mr. French's
photo**, each one more exaggerated than the last:

| Repost | Crop | Filter | Caption |
|---|---|---|---|
| **@maya.k** | a bit tighter; Theo still laughing | brighter | *"theo vs the gagaball wall 😂"* |
| **@jaxon_** | the laughing and thumbs up cut off | high contrast | *"THEO DESTROYED THE PIT 💀"* |

Stage 2 is only classmates resharing Mr. French's photo, minutes after he
posted it, each version a little louder. The gossip account isn't here yet:
its post is the jump from teasing to *blown out of proportion*, and it lands
live at the top of the feed as stage 3 opens.

**The meter:** now it also shows when the feed **pauses** on a post (no
scrolling for a second with the post in the middle of the screen). It shows
the same timer and a **much faster bar, about 12 seconds**. It fills
fastest on the gossip post, because that's where people (and Theo) stop
longest. Each confirmation **re-sorts the feed below**: the reposts drift
up, the cat and the volcano drift down, and the gagaball ads (ProGaga Ball,
FlexGuard pads) start replacing the generic ones.

```
✓ PUSHED TO ALGORITHM — signal: PAUSE ×3 (longest: @lifeacademy.gossip, 14s)
  @theo engages most with: dramatic posts about @theo → show more like this
```

**In the room:** let the class decide where to stop scrolling, then ask
*"Why did we stop on that one?"* (They'll always stop on the post about
Theo. So would he.) Ask *"What's different about this photo from Mr.
French's?"* and let them spot that the laughing is gone.

**The replay will show:** how long the class paused on each post and ad;
how the reposts climbed and the unrelated posts sank; how the ads switched
from games and sneakers to gagaball gear; and every repost's crop drawn on Mr.
French's original photo.

**Advance →** reaction buttons slide in under every post, and a tooltip
points at them: *"React to show how you feel! 💬"*

---

### Stage 3 — The reactions (the algorithm)

**Theo's goal:** *"That gossip post isn't true. I want Lens to know I don't
like it."*

**The escalation lands.** As stage 3 opens, a brand-new post appears at the
very top of the feed, *Just now*, with zero reactions: **@lifeacademy.gossip**
reposting Jaxon's crop down to just the fallen panel and Theo's muddy
sneakers, red-tinted and grainy, with a BREAKING banner: *"GAGABALL PIT
COLLAPSES — KID HURT IN LIFE ACADEMY CHAOS 😱 are they banning gagaball??"*
A notification follows (*"LA Gossip posted about you 👀"*), then a tip points
at its reaction buttons. Its reactions and comments pour in on the curve.

**Looks like:** the same feed. Every post has had a reaction bar since
stage 1: 👍 Like, ❤️ Love, 😂 Haha, 😢 Cry, 👎 Dislike, 😡 Angry, and the
count shows each post's top three reaction icons. Theo can react to anything
from the first minute (tap the same reaction again to take it back), and
every reaction is a signal. What changes in stage 3: the hidden weights
become visible on hover, and a reaction now visibly jumps that post to the
top of the feed. The ⋯ menu on each post also has a *"Not interested"*
option, small and grey.

**The meter:** hovering over a reaction button shows its hidden weight
(👍 +1, ❤️ +2, 😂 +2, 😢 +3, 👎 +4, 😡 +5). Clicking **any** reaction fills the bar
**in one click**:

```
✓ PUSHED TO ALGORITHM — signal: REACT 😡 (+5)
  @theo is very interested in @lifeacademy.gossip → moving to top
```

and the feed **re-sorts** with a smooth animation: the gossip post jumps to
the top, three more like it appear under it, Mr. French's post slides down,
and **June's "Huge upset: June (8) wins the championship 🏆" post sinks to
the bottom** (nobody's angry about it, so it scores nothing).

**In the room:** before clicking, take a vote: *"Which reaction should Theo
use to show he doesn't like this?"* Ask the room to predict what will
happen. Whatever they choose, it boosts the post, and 😡 boosts it most.
Then ask: *"Is there any button that means 'less of this'?"* If someone
finds *Not interested* in the ⋯ menu, try it: its bar barely moves (−1
against 😡's +5).

**The replay will show:** the moment of the click, and the feed order before
and after: the gossip post rising to #1, June's post falling to the bottom,
and the ads following the gossip post up.

**Advance →** the comment count on the gossip post starts climbing
(💬 12 → 38), and a speech bubble pops up from it with Theo's avatar:
*"People are commenting on this. Say something, Theo 💬"*

---

### Stage 4 — The thread (context collapse)

**Theo's goal:** *"That's not what happened. I'm going to set the record
straight."*

**Looks like:** the gossip post at the top, with *"💬 38 comments · View
all"* under it. The class tells the teacher to open it, and the post
**expands into a full thread view**: the post bigger at the top, the
comments below it. Opening the thread is itself a signal (*"📖 opened
thread"* on the meter). The *Lens Premium: see who's talking about you* ad
sits in the sidebar.

**The comments already there** (teasing, never cruel), sorted by *Most
relevant*, which puts the loudest on top:

1. **@maya.k:** *"ok this is actually so funny 😂 theo you good?"*
2. **@jaxon_:** *"the wall had a family 😭"*
3. **@ella.r:** *"wait is gagaball actually banned??"*
4. **@noah_b:** *"I heard he did it on purpose bc they were losing"*
5. **@lifeacademy.gossip** (author): *"sources say the pit is CLOSED FOREVER
   🚨"*
6. **@kai.plays:** *"theo fr owes everyone a new pit lol"*

**The meter:** in the reply box it fills **with every keystroke**:

```
⌨ 41 keystrokes · draft saved · sending to algorithm ▓▓▓▓▓▓▓▓░░
```

Deleting doesn't make the count go down, and every version of the draft is
saved, including the words the class typed and took back.

**Play: Theo's reply is free text.** The class decides what Theo says and
the teacher types it, word for word. The teacher is the only filter: if a
suggestion is unkind or not OK for the room, the teacher just doesn't type
it. There are no ready-made replies; whatever the class writes is Theo's.

**Then the comments keep coming.** Over about 30 seconds after Theo posts,
new comments arrive **below his**, one every few seconds, each with its own
meter confirming as it lands. They're written to work with any reply, and
the ones that quote Theo only ever use the loudest chunk of four words or
so, so the class's words are never repeated at length:

1. **@noah_b:** *"'…{loudest chunk}…' 💀 ok theo"*
2. **@ella.r:** *"so is gagaball banned or not"* (nobody reads the replies)
3. **@jaxon_:** *"theo really typed all that 😭"*
4. **@lifeacademy.gossip:** *"we posted Theo's response ⬆️ 👀"*, and at the
   same moment a **quote-post** appears at the top of the feed:
   *Theo responds 👀: "…{loudest chunk}…"* 🙄
5. **@kai.plays:** *"ratio"*
6. **@maya.k:** *"guys leave him alone lol"*, the only kind one. It
   arrives last and **sorts to the bottom**, because a calm comment scores
   lowest under *Most relevant*.

As they come in, the comment count jumps (38 → 61), Theo's own comment
collects reactions (😂 ×40, 😡 ×12), and the meter on his comment reads
*"💬 your comment · 6 replies · ✓✓✓ pushed to algorithm"*. His reply has
made the gossip post *more* popular.

**In the room:** this is the stage where the class feels most like Theo.
Read the six existing comments aloud first, then let the class argue about
what he should say and agree on it before you type. Type exactly what they
settle on. As the new comments land, let the room react to each one. After
the quote-post appears, ask *"Is that what Theo said?"* Then: *"Why is
Maya's comment at the bottom?"*

**The replay will show:** Theo's whole reply next to the four words that got
quoted; the drafts Lens saved, including deleted words; how many seconds
the class spent in the thread; and how the thread pushed the gossip post
and the Lens Premium ad up everyone's feed.

**Advance →** numbers appear under every post and start ticking up, slowly and
then like a slot machine: ❤️ 12 → 340 → 4,100 → **48.2K**. Checkmarks pop
in. A banner slides down: *🔥 Trending at Life Academy: #GagaGate*.

---

### Stage 5 — The numbers (fake popularity)

**Theo's goal:** *"48,000 people?? There aren't that many people at Life
Academy. Who actually liked this?"*

**Looks like:** numbers everywhere. Big like counts, a blue checkmark on
@lifeacademy.gossip, stacked avatar faces with *"Liked by maya.k and 48,211
others"*, *"#1 at Life Academy"*, *"🔥 Trending"*. The **Post Boost: 10,000
likes for $19.99** ad appears right under the gossip post.

**The meter:** it now appears on the **like count**. Just opening the
*"Liked by"* list fills the bar in **about 2 seconds**:

```
✓ PUSHED TO ALGORITHM — signal: GLANCE (checked likes, 2.1s)
  @theo cares how many people saw this → show him the numbers
```

The *Liked by* list itself is the reveal, right in the app: page after page
of accounts named `bot_8812`, `bot_8813`, `bot_8814`…, with a real name
(maya.k, jaxon_, ella.r) only now and then. The gossip account's profile
says *"Joined today"*.

**In the room:** first, a show of hands: *"Who'd believe a post with 48,000
likes?"* Then scroll the *Liked by* list slowly while the class calls out
every real name they spot. (There are 12.) Point at the Post Boost ad:
*"Where do you think those 48,000 likes came from?"*

**The replay will show:** 48,212 likes shown, 48,200 bought, 12 real, against
the 46 kids who actually played gagaball that day; and how the like count
itself pulled the gossip post even higher.

**Advance →** a cheerful toast: *"We've updated your feed to match your
interests ✨"*. The theme color shifts to #GagaGate orange, and the
unrelated posts (the cat, the volcano, the band) **fade out one by one**.

---

### Stage 6 — The bubble (filter bubble)

**Theo's goal:** *"I'm done with this. I'm going to look up something
else."*

**Looks like:** a feed that is **100% about Theo**. The whole app is themed
in #GagaGate orange, the greeting says *"Your Life Academy today"*, and
every post is the incident: reposts of reposts, polls (*"Should gagaball be
banned?"*), *"Theo did it ON PURPOSE? 👀"*. Every ad slot is gagaball gear or
Lens Premium. When the class searches for something else (*"soccer"*,
*"Minecraft"*, anything), the results are still about the gagaball pit.

**The meter:** every bar is **already full** when a post appears:
*"✓ pre-confirmed"*. Lens doesn't need Theo to look any more. It already
knows.

**In the room:** let the class search for anything they like and watch
every search come back as #GagaGate. Then ask: *"If you were Theo, and your
feed looked like this, what would you think everyone thought of you?"*

**The replay will show:** Theo's feed and ads at the start of the game next
to his feed now (one topic, every slot), and the three other feeds side by
side.

**Advance →** a soft *ding*. A red badge 🔴 **1** appears on the bell. Then
**3**. Then **9**. A banner: *"People are talking about you right now."*

---

### Stage 7 — The notifications (attention engineering)

**Theo's goal:** *"I'm logging off."*

**Looks like:** everything at once. Notifications slide in every few
seconds (*"You were mentioned 14 times"*, *"@jaxon_ tagged you in a
post"*, *"New poll about you!"*). Badges keep rising. A "video" of the crash
autoplays **on a loop** (an animated SVG of the panel falling, over and
over, while the rematch is never shown). A streak counter ticks up. *"31
people are viewing posts about you"*. The feed **never ends**: it
reshuffles and recycles posts with new captions forever. Between them, an
ad for **Unwind — feel calm in 5 minutes**.

**The meter:** now **every** bar on every post fills and confirms **by
itself**, over and over, including on posts nobody is looking at:
*"✓ ✓ ✓ PUSHED TO ALGORITHM"*. Lens doesn't need Theo to do anything at
all.

**Finding the way out.** Every way out fights back with a real **dark
pattern**, aimed right at someone who's being talked about:

- **Confirmshaming:** *"Log off? People are talking about you RIGHT NOW
  😬"*. A huge bright **Stay and see ❤️** button, and a tiny grey *"log off
  and miss it"* link.
- **Roach motel:** the notification switch in settings offers *"Pause for 1
  hour"* (which turns itself back on after 20 seconds). The real *Turn off*
  is two menus deep.
- **Loss aversion:** *"You'll lose your 🔥 4-day streak forever!"* (It's been
  about four minutes.)
- **Moving target:** the *Log off* link is low-contrast, and each newly
  loaded post pushes it down the page. On a projector it's *just* findable:
  a student may need to walk up to the screen and point, which is fine and
  fun. Tune it on the real projector before class.

When the class makes it through, the page goes **quiet**: *"You're all
caught up."* Then *"You've been logged out"*, and after a beat:

> *"Before you go… here's your **Lens Replay** ✨"*

If the room gets stuck or time runs short, the teacher can press `Shift` +
`→` instead.

**In the room:** the loudest stage, with sound on through the speakers. Hold
firmly to the rule that you only click what the class tells you. Every
dialog becomes a quick class decision: *"Stay or log off?"* Watch how
*"people are talking about you right now"* pulls at a room of 13-year-olds
even when they know it's a trick.

**The replay will show:** how long it took to get out, how many times Lens
pulled them back, which trick held them longest, and how many seconds they
spent on the *Unwind* ad while the app was stressing them out.

---

## 4. Lens Replay (the finale)

After stage 7, Lens presents a cheerful recap of the session, styled like
the year-in-review features real apps make (*"Your Lens Replay ✨"*). It
looks like a reward. It's actually everything the app recorded about the
class, and what it did with it. The teacher steps through it one chapter at
a time with `→`.

### What Lens records (for the replay)

The replay is **built from the class's real session**, never scripted, so
it always matches what happened in the room. Every quarter-second, Lens
notes which posts and ads are on screen, which one is in the middle, whether
the mouse is over it, and whether the feed is scrolling or paused. It also
records every event:

- **Attention:** seconds on screen, seconds paused on, and seconds hovered,
  for every post and every ad, per stage.
- **Actions:** reactions, thread opens, keystrokes and drafts, the posted
  reply, *Liked by* opens, searches, attempts to log off, dialogs and which
  button was chosen.
- **Results:** the feed order and the ad order at the start of each stage,
  after every re-sort, and when the key is turned; and the interest profile
  (`gagaGate: 0.12 → 0.61 → 0.98`) after every confirmation.

The ranking is real too. Posts and ads are sorted from the recorded
attention and reactions, so if the class stares at the cat for a full
minute, the cat really does rise, and the replay shows it. The content is
weighted so the gagaball story wins under any normal play, but the replay never
claims anything the session didn't do.

### Chapter layout (stages 2–7)

Each stage after stage 1 gets one full-screen chapter, laid out the same
way so the class learns to read it:

```
┌──────────────────────────────────────────────────────────────────────┐
│ STAGE 3 · "I want Lens to know I don't like it."           ▶ replay │
├──────────────────────────────┬───────────────────────────────────────┤
│ WHERE YOU LOOKED             │ WHAT LENS DID WITH IT                 │
│ gossip post    ████████ 41s  │  before          after                │
│ jaxon_ repost  █████ 22s     │  #1 Mr. French ─┐ ┌─ #1 gossip post ▲  │
│ Pit Kit ad     ███ 9s   AD   │  #2 June     ─┼─┘  #2 Pit Kit ad  ▲  │
│ cat video      █ 3s          │  #3 Pixel ad ─┘ …  #14 June       ▼  │
│ June's post    ▏ 0.4s        │                                       │
├──────────────────────────────┴───────────────────────────────────────┤
│ LENS CONCLUDED: 😡 = "more of this, please"  ·  gagaGate 0.61 → 0.83 │
│ WHAT THIS REALLY IS: THE ALGORITHM — every reaction is fuel.          │
│ WHAT WAS TRUE: There was a rematch, and June won it.                  │
└──────────────────────────────────────────────────────────────────────┘
```

- **Where you looked:** a horizontal bar chart of seconds per post and per
  ad during that stage, longest first, top eight. Ads get an *AD* tag and
  their own color.
- **What Lens did with it:** the feed order before and after the stage, side
  by side, with lines connecting each item. Risers are highlighted, fallers
  greyed, with the key items labeled big (the gossip post, June's post, Mr.
  French's post, the top ad).
- **▶ replay:** `Space` plays the stage back as a fast-forward of the feed
  at 10× speed, with a rectangle showing where the screen was and each
  meter filling as it did in class.
- **Lens concluded:** the signals confirmed in that stage and how the
  interest profile changed.
- **What this really is:** the reveal. The manipulation's name and one line
  about it (below). This is the first time the class hears the names.
- **What was true:** one fact from what actually happened, which the feed
  buried.
- **The rule behind it** (small, optional): the one short line of code that
  caused the change, e.g. `weight.angry = 5`.

### The chapters

| Chapter | Highlights pulled from the session | What this really is | What was true |
|---|---|---|---|
| **Where it started** (stage 1) | Seconds on Mr. French's post; the first confirmation | **Passive tracking.** *Watching is a vote. You don't have to click anything.* | Mr. French's post was kind, and had the whole story. |
| **Stage 2** | Pause times per repost; reposts rising, unrelated posts and generic ads sinking; every repost's crop drawn on the original photo | **Exaggeration.** *Each share crops tighter, filters harder and shouts louder. The version that spreads furthest has the least of what happened.* | Theo was laughing. It was a scraped elbow. |
| **Stage 3** | The reaction chosen; the gossip post to #1; June's post to the bottom; gagaball ads following | **The algorithm.** *Every reaction is a vote for more, and anger counts most. It can't tell "I love this" from "I hate this."* | There was a rematch, and June won it. |
| **Stage 4** | Theo's full reply vs. the quoted chunk; saved drafts including deleted words; the six comments that followed; Maya's comment sorted last; Lens Premium rising | **Context collapse.** *Your words can be cut to the loudest few and passed on. Defending yourself counts as engagement.* | It was an accident. Nobody was to blame. |
| **Stage 5** | 48,212 shown, 48,200 bought, 12 real, vs. 46 kids who played; the Post Boost ad | **Fake popularity.** *Numbers feel like votes. The crowd can be bought, and the voters can be bots.* | 46 kids played gaga. 12 real people liked that post. |
| **Stage 6** | Theo's feed and ads at login vs. now; the three other feeds | **The filter bubble.** *Your feed is a mirror of what you've looked at. A small story can feel like the whole world.* | Most people at Life Academy weren't talking about it. |
| **Stage 7** | Time to get out; times pulled back; which trick held longest; seconds on the *Unwind* ad | **Attention engineering.** *Endless feeds, notifications and streaks are built to make leaving hard, hardest of all for someone worried about what people are saying.* | It was a good day. |

### The last screens

1. **Totals.** *"Time on Lens: 41 min 12 s. Posts about Theo: 38 min. Ads:
   2 min 47 s. Lens earned about $0.41 from your attention."* (A made-up
   but plausible ad rate, applied to the real ad seconds.)
2. **What Lens learned about Theo**, as one list from the whole session:

   ```
   @theo · what Lens learned
   ✓ dwell    90s on @mrfrench's post
   ✓ pause    ×9 on reposts (longest: 14s on "GAGABALL PIT COLLAPSES")
   ✓ react    😡 on @lifeacademy.gossip
   ✓ typing   63 keystrokes, 4 drafts saved (incl. 1 deleted)
   ✓ comment  1 reply → quoted, 6 replies
   ✓ glance   checked who liked it ×4
   ✓ search   "soccer" → shown #GagaGate
   ✓ stay     tried to leave ×5, stayed 4m 12s
   interests: #GagaGate 98% · sells well to: gagaball gear, Lens Premium, Post Boost
   ```

3. One line, alone on the screen: ***"Lens can't tell the difference between
   interested and upset."***
4. **Switch it all off.** The teacher presses `Shift` + `→` one last time. Every layer comes
   off at once: the notifications stop, the orange drains away, the
   numbers, comments, reactions, reposts and ads vanish, and the meters go
   dark. What's left is **one post: Mr. French's**, with its full photo and
   23 likes. *"This is what actually happened."*
5. **Close.** *"Everything Lens recorded about 'Theo' stayed on this laptop.
   Real apps send it to their servers."* Then the discussion questions
   (section 6), one per screen.

---

## 5. Transitions and order

### Rules every transition follows

1. **The teacher decides when.** Every stage change happens when the
   teacher presses `Shift` + `→`, never on a timer, so the room can take as long as it needs.
2. **The algorithm still goes first.** The first beat of every transition
   is a meter confirming (*"✓ PUSHED TO ALGORITHM"*), then the feed changes.
   The class sees the cause before the effect every time.
3. **Additive.** A stage adds to what's there and takes nothing away. The
   feed keeps getting busier, louder and more about Theo, until the very
   end of the replay.
4. **The next stage grows out of the last one.** The confirmation becomes
   "finding more posts", the reposts get reaction buttons, the reaction
   draws comments, the reply gets quoted and counted, the counts trigger
   "updating your feed", and the bubble triggers notifications. No hard
   cuts.
5. **Calm to loud.** Motion and sound start near zero in stage 1 and peak in
   stage 7, so the quiet after logging off hits harder.
6. **About 3–5 seconds**, skippable with `N`. `prefers-reduced-motion` gets
   cross-fades instead.

### What carries forward

| Stage | Feed looks like | Ads | The meter |
|---|---|---|---|
| 1 | Calm; one kind post | none | hidden; 90s on hover |
| 2 | Busy; unrelated posts + louder reposts | generic, turning gagaball | pauses; ~12s |
| 3 | + reaction bars; re-sorting | gagaball gear | one click |
| 4 | + comment thread, quote-post | + Lens Premium | every keystroke |
| 5 | + counters, checkmarks, trending | + Post Boost | 2s glance |
| 6 | All #GagaGate; orange theme; search hijacked | every slot targeted | pre-filled |
| 7 | Notifications, looping video, endless feed | + Unwind | fills itself |
| ⏪ | Paused; charts and replays | counted and priced | switched off at the end |

### Why this order and not another

- **Each stage is the next thing a real person would do.** Read the post;
  scroll on; stop on the posts about you; react to the worst one; reply to
  defend yourself; check who believes it; look for something else; log off.
  None of it is foolish, and every step makes things worse. That's the
  lesson, and it only works in this order.
- **Passive comes before active.** Starting with just looking shows the most
  surprising thing first: you don't have to click anything to be tracked.
  It also teaches the meter, which everything else depends on.
- **Exaggeration (2) comes before the algorithm (3)** because the louder
  versions have to exist before the algorithm can reward them.
- **Replying (4) comes after reacting (3)** because it's the bigger step:
  from a button to Theo's own words, and from one click to every keystroke.
- **The numbers (5) come after the quote-post** because the quote-post is
  what goes "viral", and the counts make that feel real.
- **The bubble (6) needs everything before it.** By then Lens really has
  learned what Theo looks at, so his feed narrowing to one story is earned.
- **Attention is last** because it's what every other stage is for, and it's
  the only one where succeeding means *leaving*. Then comes the loudest stage, which sets
  up the quiet of the replay.
- **The names come last, in the replay.** Holding back what each stage
  "really is" until the class has felt all seven, and then showing it with
  their own data, is what makes the ending land.

---

## 6. Running it with the co-op

The whole class (13-year-olds) plays Theo together on one projected laptop.
The teacher is the only one who touches it; students do the thinking and
give the instructions.

### Before class

- **Room check:** connect the laptop to the projector in the actual room a
  day ahead if you can. Check that the back row can read the meters and the
  replay charts, that the big cursor is easy to follow, that the stage 6
  theme shift is obvious, and that the stage 7 *Log off* link is hard but
  possible to find. Check the speakers.
- **Save an offline copy** of the page to the laptop, in case the Wi-Fi
  fails.
- **Rehearse** with the projector disconnected, using `Shift` + `→` to move
  through the stages. Then **`Shift` + `R`** to clear the rehearsal, so the
  replay only shows the class's session. Print the presenter key cheat
  sheet (section 8).
- On the day: full screen (`F11`), the laptop's own notifications turned off
  (real ones would be confusing in stage 7!), and the page left at the
  login screen before students arrive.

### Roles

- **Teacher (the only one at the laptop):** the class's hands. Clicks,
  scrolls and types only what the class tells them to; filters what gets
  typed as Theo's reply; advances the stages; keeps the look → predict → instruct
  → watch rhythm going; reads the replay chapters with the class.
- **Spotters:** "first to spot it" moments: the hidden meter (stage 1),
  what's missing from the reposts (stage 2), real names in the *Liked by*
  list (stage 5), the *Log off* link (stage 7).
- **Everyone:** predicts, argues, votes (the reaction in stage 3, *Stay or
  log off?* in stage 7) and writes Theo's reply together (stage 4).
- **Replay readers:** a different student reads each chapter's "What this
  really is" line aloud.

### Pacing (about 65 minutes, plus 20 for discussion)

| Stage | Minutes | Note |
|---|---|---|
| Login | 3 | Briefing; "you're Theo, I'm your hands" |
| 1 Joke post | 6 | Let the 90-second bar fill while they watch |
| 2 Reposts | 7 | |
| 3 Reactions | 6 | Vote before clicking |
| 4 Thread | 10 | Read the thread, write Theo's reply, watch the comments come in |
| 5 Numbers | 5 | Spot the real names |
| 6 Bubble | 6 | Search for anything; every result is #GagaGate |
| 7 Notifications | 7 | Loud; the room decides every click |
| Replay | 12 | About 90 seconds a chapter, then the last screens |

Because the teacher advances by hand, any stage can be shortened or stretched
on the day. If time is short, move faster through stages 2 and 5; don't
shorten stage 4, stage 6 or the replay. If the session has to stop partway,
the laptop remembers where the class left off, recording included.

### Tips

- **Don't spoil the theme.** Introduce it as a "web design lab" where the
  class plays a character. Let the replay name things.
- **Keep Theo safe.** Make sure no student shares Theo's name or has had a
  similar incident recently. If anyone in the room seems to take the story
  personally, lean on the true version: Theo laughed, and it was a good day.
- **Gagaball is personal.** Some students will have strong feelings about gagaball
  calls and "who's really out." Let that energy into the stage 4 reply and
  the stage 6 discussion; it's exactly what the algorithm feeds on.
- **For the curious.** If students want to see how it works, `C` opens the
  code behind the current stage, and the replay shows one line per chapter.
  None of it is needed to follow along.

### Discussion questions (shown one per screen at the end, and printable)

Use think-pair-share: a minute for students to think, a minute to talk with
the person next to them, then a few share with the room.

1. How did it feel to be Theo? When did it stop being funny?
2. Theo never did anything wrong on Lens. Which of his choices made things
   worse? What could he have done instead?
3. Which number in the replay surprised you most?
4. Is cropping or filtering a photo *lying*? Where's the line?
5. Was Mr. French's post OK? What about @maya.k's? Where did it go wrong?
6. The ads changed as Theo's feed changed. Who was Lens really working for?
7. If you designed Lens's algorithm, what would you reward?
8. Stage 7 made leaving hard. What tricks do apps you use rely on? What
   helps you stop?

### Follow-on activity

"**Design a better Lens.**" On paper, in small groups, students design one
feature that would have helped Theo: a *"this is about you — want a
break?"* prompt, a *"show me the original post"* button, a replay that
Lens shows you *during* the day instead of after. They sketch it and present
it to the class.

---

## 7. Build plan

### Files (as built)

```
lifeacademy/
  index.html          ← the page shell: Lens top bar, feed, login, overlays
  lens.css            ← all styles; everything scales with screen width (rem = 1.42vw)
  data.js             ← people, posts, ads, comments, other feeds, goals, replay text
  art.js              ← Mr. French's photo (one SVG, cropped for every repost), picture cards, avatars
  lens.js             ← engine: state, recorder, ranker, meters, stages, presenter keys
  replay.js           ← Lens Replay chapters and charts
  img/*.webp          ← 14 student avatars (Pexels stock photos)
  icon.svg            ← Lens favicon
_source/lifeacademy/
  PLAN.md             ← this file (not published)
  photo-credits.md    ← where each avatar came from (not published)
  stamp.py            ← cache-busting: run before committing changes to lifeacademy/
```

**Before every commit that changes `lifeacademy/`, run `python3
_source/lifeacademy/stamp.py`.** It stamps each CSS/JS link in `index.html`
with a hash of the file (`lens.js?v=b2413fa6`), so phones and browsers load
the new version instead of a cached old one.

It's a standalone page with no Jekyll layout (like `fretspeak/`), so the
site header and footer don't break the illusion, and it's marked
`noindex`. To keep an offline copy, save it with the browser's "Save Page
As → Webpage, Complete", which keeps the images and scripts. It isn't
linked from the home page.

### Inside the code

1. **Markup:** the Lens shell (top bar, feed column, sidebar, notification
   bell, search), the post and ad templates, the replay
   screens, and the photo `<svg>` in a `<template>`, cloned for each crop.
   Mr. French's post is real semantic HTML underneath everything, so the end
   of the replay can strip down to it.
2. **CSS:** base Lens styles, then one block per layer scoped to
   `body.L1`…`body.L7`, then the replay. Colors as custom properties so
   stage 6 can re-theme everything with one variable. The big cursor.
3. **JS:**
   - `data`: posts (author, time, topic, tags, crop, filter, caption,
     reactions, likedBy, comments), ads (topic, bid, creative), the other
     feeds for stage 6, Theo's goal cards, the replay's "what this really
     is" and "what was true" lines.
   - `recorder`: samples every 250 ms (on screen, centered, hovered,
     scrolling or paused) and logs every event, per stage, into one session
     record saved to `localStorage`.
   - `ranker`: the interest profile, post scores, ad scores, and re-sorting
     (with FLIP animation), with a snapshot of feed and ad order saved to the
     recorder at every re-sort.
   - `meter`: the signal meter overlays, the shrinking threshold,
     confirmations and the signal log.
   - `layers[]`: `enable`/`disable` for each stage.
   - `keys`: the presenter keybinds (advance, back, skip, blank, mute,
     replay), ignored while the reply box has focus, and the
     "confirm first" beat at the start of each transition.
   - `thread`: the stage 4 thread view, reply box, keystroke log, drafts,
     the loudest-chunk quote, and the timed comments that arrive after
     Theo's.
   - `hooks`: stage 7's notifications, looping video, endless feed and the
     dark-pattern dialogs.
   - `replay`: the chapters built from the session record: attention bar
     chart, before/after order chart, 10× feed playback, totals, the
     "what Lens learned" list, and the switch-everything-off ending.
   - `panel` (optional): the Under the Hood split screen.

### Milestones

1. **Skeleton:** Lens shell, stage engine, layers, presenter keys,
   save/load. Projected-size type and the big cursor from day one.
2. **Recorder and ranker:** the session record and real re-sorting. Build
   these early, because the meters and the replay both depend on them.
3. **The meter:** overlays, the shrinking threshold, confirmations.
4. **Art:** Mr. French's photo SVG, the crop for every repost, and the ads.
5. **Stages 1–3.**
6. **Stages 4–7.**
7. **Lens Replay:** chapters, charts, playback, totals, and the ending.
8. **Polish:** transitions, reduced motion, keyboard pass, legibility at
   1280×720, and a read-through of every post and comment for tone
   (teasing, never cruel).
9. **Testing:** automated Playwright run-throughs at 1280×720 and
   1920×1080 with scripted "classes" that behave differently (one that
   lingers on the cat, one that rushes every key), to check the replay
   always tells the truth about the session. Then a **rehearsal on the
   real projector**, ideally with two or three people at the back of the
   room calling out instructions the way the class will. Adjust text sizes,
   colors, meter speeds and the stage 7 *Log off* link from what they can
   and can't see.

### Accessibility

For a projected class, accessibility mostly means **legibility for the whole
room**: big type, strong contrast, a big cursor, and nothing important shown
only by color (the replay's charts also use labels and arrows). Seat any
students with low vision near the screen, and read the replay's key lines
aloud. Everything works by keyboard. The places that *deliberately* break
good design (the stage 7 dark patterns) are named as bad design in the
replay. With `prefers-reduced-motion`, motion is replaced by cross-fades,
but the stage 7 notifications still arrive (as quiet badges).

---

## 8. Cheat sheet (print for the session)

| When | What to do |
|---|---|
| Before students arrive | `Shift` + `R` (clears rehearsal), `F11`, laptop notifications off, page on the login screen |
| Login | Read the briefing. "You're Theo. I'm your hands." |
| Stage 1 | Ask how Theo feels. Let them find the meter. Let it fill. **Advance.** |
| Stage 2 | "Why did we stop on that one?" "What's missing from this photo?" **Advance.** |
| Stage 3 | Vote on the reaction first. Look for *Not interested*. **Advance.** |
| Stage 4 | Open the thread, read it aloud, agree on Theo's reply, type it exactly. "Is that what Theo said?" **Advance.** |
| Stage 5 | Show of hands on 48K. Count real names in *Liked by*. **Advance.** |
| Stage 6 | Search for something else. "What's Life Academy talking about?" **Advance.** |
| Stage 7 | The class decides every click. Find *Log off* (or turn ⏪). |
| Replay | `→` through chapters, `Space` to play each. A student reads "What this really is." `Shift` + `→` at the end switches everything off. |
| After | Discussion questions, one per screen. |

Keys: `Shift` + `→` advance · `N` skip animation · `B` blank · `M` mute · `→`/`←` replay chapters · `Space` play replay · `C` code (optional)
· `Shift` + `←` step back · `Shift` + `R` start over.

## 9. Open questions

- **The "earned from your attention" number** in the replay: keep it (it's
  made up, but makes the ads concrete), or leave money out?
- **The room:** projector resolution, and whether there are speakers.
- **The app's name:** "Lens" or something else.
- **Sound:** on by default (the plan's default, muted with `M`), or off?
