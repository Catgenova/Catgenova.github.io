# Life Academy: "Lens" puzzle plan

A single-page puzzle at **pere.games/lifeacademy/** for the Life Academy
homeschool co-op. Students think they are solving seven web-design and coding
puzzles. Each one adds a layer to the page, so step by step it turns from a
plain document into a slick social media feed. At the end the layers are
peeled back one at a time, and each one is shown to be a real way social media
changes what you see and how you see it.

> This file lives in `_source/`, which Jekyll doesn't publish, so students
> can't find the answers on the site. Keep it out of `lifeacademy/`.

### The setting: one laptop, one projector, one room

- **Students are 13.** The puzzles, wording and hints are pitched at that
  age: real code, no baby steps, but nothing that needs prior coding.
- **Only the teacher touches the laptop**, which is projected for the whole
  class. Students have no screens. The class solves every puzzle
  **together, out loud**: they read the projected screen, argue, and tell
  the teacher exactly what to click and change. The teacher is the class's
  hands.

That shapes the whole design. Section 2 has the rules for designing for one
projected screen, every stage has an **In the room** note on how the class
takes part, and stage 6 splits the room into groups instead of relying on
personal screens.

---

## 1. The big idea

### The hidden structure: the life of a post

The seven steps follow one post from a real moment to your screen. That's why
they come in this order, and it's what students see when the ending lays them
side by side:

| # | A post is... | Code / design layer (what students think it is) | What it really is (the reveal) |
|---|---|---|---|
| 0 | *(the real moment)* | **Markup**: plain HTML structure | Reality, with no layers |
| 1 | **taken** | **The Box**: cropping, `overflow`, `object-position` | **Framing**: what's left out of the shot |
| 2 | **edited** | **The Style**: CSS `filter`, color and mood | **Filters and the highlight reel** |
| 3 | **captioned** | **The Type**: content vs. presentation, typography | **Sensational headlines, clickbait, outrage** |
| 4 | **ranked** | **The Logic**: a JavaScript sort function | **The algorithm** |
| 5 | **judged** | **The Data**: JSON, variables, booleans | **Fake popularity / social proof** (likes, bots, badges) |
| 6 | **targeted** | **The State**: tracking events, conditionals, CSS variables | **Filter bubbles and echo chambers** |
| 7 | **used to keep you** | **The Timers**: `setInterval`, infinite scroll, animation | **Attention engineering** (endless feeds, notifications, streaks, dark patterns) |
| ★ | *(peeled back)* | **The Layers**: a design-tool layer stack | **Context**: the thing every layer took away |

There are three sequences in the table, and they rise together:

- **Code:** HTML → CSS → CSS text → JS functions → JS data → JS state → JS
  timing. This is the order you'd learn the web in.
- **Manipulation:** what they *show* you (1–3), then what they *choose* for
  you (4–5), then what they *do to* you (6–7). It goes from the post, to the
  feed, to the person watching.
- **Difficulty and interaction:** whole-room puzzles first, then one that
  splits the room into groups who each see a different feed (6), then one
  where the goal flips from engaging with the page to *leaving* it (7).

### The world: the gaga pit incident

All content comes from one event, so every layer reframes **the same
facts**. The ending can then put "what the feed said" next to "what
happened." The event is a gaga ball mishap at **Life Academy's own field
day**: the students' own co-op, and something they'll have opinions about.

The people in the story are invented. Keep it that way even though the
co-op is real: use names that don't belong to any current student, and
keep the kid at the center of it a good sport in the true version, so no
real student ends up as the joke.

**Field day at Life Academy: what actually happened.** These are the
"field notes" students see first and last.

- It drizzled until 11 a.m., so the gaga pit was muddy.
- 46 kids played gaga over the day.
- In the 1:30 championship game, **Theo** (12) dove for the ball, slipped in
  the mud, and slid into the pit wall. One wall panel popped loose and fell
  over.
- Everyone froze, then laughed, Theo hardest. He had a scraped elbow and got
  a band-aid.
- **Mr. Alvarez** screwed the panel back on in ten minutes.
- It was an accident. The game was tied, and nobody was to blame.
- The championship was replayed, and **June**, age 8, won it.

That's a funny, ordinary field day. By stage 7 the feed has turned it into
*"GAGA PIT COLLAPSES — KID HURT IN CO-OP CHAOS 😱🔥 48.2K"*.

### The art: one panorama, many crops

All the pictures are one wide inline-SVG illustration of **the whole day in
one scene**, morning on the left to afternoon on the right:

- **Left:** grey drizzle, puddles, and a chalkboard sign by the gate:
  *"CAUTION: MUD — pit opens at 11"*.
- **Center:** the octagonal gaga pit with one panel fallen outward, Theo
  sprawled in the mud giving a thumbs up, the ball in mid-air, kids around
  the pit laughing, and Mr. Alvarez walking over carrying a drill.
- **Right:** sunshine, the bracket board (*"CHAMPIONSHIP REMATCH — 2:15"*),
  and June holding the trophy.

Every "photo" on the site is a crop of that one SVG (a different `viewBox`,
or one image positioned inside a clipped box). This keeps the page in a single
file, and it sets up the strongest image of the ending: zoom out to the full
panorama with every post's crop outlined. *Twelve posts, one day.*

### The fictional app: **Lens**

The feed students build up to is a made-up app called **Lens**. Its logo (an
eye in a rounded square) puts itself together one piece per stage. Don't
imitate any real platform's branding. Lens should feel familiar without being
a copy of any one app.

---

## 2. How the page works (applies to every stage)

### Designing for one projected screen

The page is a **presentation**, not an app students hold. Everything has to
read from the back of the room on a washed-out classroom projector.

- **Size.** Designed for a 16:9 screen at 1280×720 and 1920×1080. Body text
  at least 28px, code at least 24px, headlines much bigger. Nothing that
  matters is smaller than what a student in the back row can read. No phone
  layout is needed.
- **Contrast and color.** Projectors wash out pale colors and dark greys.
  Every color pair that has to be read gets strong contrast, and color
  differences that matter (filter stage, bubble themes) are exaggerated so
  they survive the projector. The only low-contrast elements are the ones
  that are low-contrast *on purpose* (stage 7), and those are tuned on the
  real projector (see testing).
- **Split screen, not a drawer.** The code panel opens as half the screen
  (page on the left, code on the right) so the class can see the code and
  its effect at the same time.
- **One thing at a time.** Hints, notes found and discussion questions
  appear big and centered, one at a time.
- **Nothing private on screen.** The audience sees everything the laptop
  shows, so answers and teacher controls are never displayed (see presenter
  controls below).
- **Sound** goes through the room's speakers if there are any. It's off
  until stage 7 and can be muted with one key.
- **Works offline.** The page is one file. Save a copy to the laptop before
  class (File → Save Page As) in case the room's Wi-Fi fails, and run it
  full screen (F11).

### Presenter controls

The teacher is the only operator, so the controls are **keyboard shortcuts
with nothing on screen**, like presentation software:

| Key | Does |
|---|---|
| `C` | Open or close the code panel |
| `H` | Show the next hint |
| `N` | Skip the current transition animation |
| `B` | Blank the screen (to pause or talk) |
| `M` | Mute or unmute sound |
| `G` | Stage 6: show the next group's feed |
| `Shift` + `→` / `←` | Jump to the next or previous stage (rehearsal, or if the class gets stuck) |
| `Shift` + `R` | Start over (behind a confirmation, so it can't happen by accident) |

The answers are only in the printed answer key (`answers.md`, section 8),
never on screen. To rehearse on the laptop before class, use the same keys
with the projector disconnected.

### Layers, not pages

Each stage is a **layer** that is added on top of the earlier ones and never
removed until the ending. In code, every layer is one object:

```js
const layers = [
  { id: 'frame',    cssClass: 'L1', enable() {...}, disable() {...}, panel: renderBoxPanel },
  { id: 'filter',   cssClass: 'L2', ... },
  // ... through 'hook' (L7)
];
```

- CSS for a layer is scoped to its body class (`body.L2 .photo { filter: ... }`),
  so by stage 5 the body reads `class="L1 L2 L3 L4 L5"`.
- Any JS behavior (sorting, tracking, timers) starts in `enable()` and is
  cleaned up in `disable()`.
- The ending runs `disable()` on each layer in reverse order. **The reveal
  really does remove the code**, and students watch it happen. The lesson is
  in the architecture.

### "Under the Hood": the code panel

A split-screen panel called **Under the Hood** (opened with `C`) gains one
tab per stage. Each tab shows code **a different way**. That covers "each
step shows code and design differently." It replaces real browser DevTools,
whose text is far too small to read on a projector: every tab uses big type
and shows only the few lines that matter for the puzzle.

| Stage | Tab | How the code is shown |
|---|---|---|
| 0 | Markup | The page's HTML with tags drawn in (`<h1>…</h1>`), comments and `alt` text visible |
| 1 | Box | A visual box-model and crop overlay you can drag, plus the CSS it writes |
| 2 | Style | A property list with sliders, like DevTools' Styles pane, that edits live CSS |
| 3 | Type | A split view: source text on the left, rendered text on the right, and checkboxes to toggle CSS rules |
| 4 | Logic | A readable JS function with editable numbers and a dropdown |
| 5 | Data | A collapsible JSON tree of each post's real data |
| 6 | State | The live `you = {...}` profile object and a streaming console log of tracked events |
| 7 | Timers | A "task manager" of everything running on its own, each with a Stop button |
| ★ | Layers | A 3D, design-tool-style stack of all seven layers |

All shown code is **generated from the live values**, so it's always true.
Syntax highlighting is a small hand-written tokenizer (no libraries). Each
tab starts with a comment like `// layer 3 of 7`. It's a quiet hint that the
layers add up to something.

### The tray: letters and notes

A tray along the bottom collects two things per stage:

1. **A letter tile.** The seven letters are the final answer.
2. **A "note found in the source":** one plain fact from the field notes
   (e.g. *"It drizzled until 11; the pit was muddy."*), shown after the
   solve as a bit of leftover debug text. Students won't think much of them
   at the time. At the end, these notes turn out to be the truth each layer
   was hiding, and together they rebuild the field notes.

### The motif that repeats: solving doesn't switch it off

After every solve, the true version shows for a moment (the full photo, the
unfiltered colors, the real order). **Then the site quietly puts the layer
back and adds the next one.** Knowing a trick doesn't undo it. Students feel
this five or six times before the ending names it, and the ending is the
first time anything is actually taken away.

### Checking answers, saving progress, and hints

- Answers are case-insensitive and ignore spaces and a leading "a" or
  "the". They're checked against SHA-256 hashes (`crypto.subtle`), so
  **View Source won't give them away**. The site is public, so a student
  could open it at home before class.
- Progress (stage, letters, notes, the class name, the time spent) is saved
  in the laptop's `localStorage`, so a refresh, a crashed browser or a
  second class session picks up where the class left off.
- **Three hints per stage**: a nudge, a pointer, and nearly the answer. They
  appear only when the teacher presses `H`, so the teacher reads the room
  and decides. To make hints a choice for the class, the page gives the
  class **3 hint tokens for the whole game**, shown in the corner. After a
  stage has run 5 minutes, a hint is free.

### Privacy (part of the lesson)

The page sends **nothing** anywhere. No analytics, no server, no fonts loaded
after stage 0. The tracking in stage 6 is real but stays in the browser, and
the ending says so: *"Everything this page learned about this room stayed
on this laptop. Real apps send it to their servers."* No student data is
collected at all: the only name the page asks for is a name for the class.

---

## 3. The stages

Each stage below covers: **what it looks like**, **the code concept**, **the
puzzle and its answer**, **in the room** (how the class takes part), **what
it adds to the reveal**, and **the transition into the next stage**.

Every stage follows the same rhythm in class: **look → predict → instruct →
reveal.** The class reads the screen, someone predicts what's going on, the
class tells the teacher exactly what to change, and the room sees if they
were right. Because only the teacher touches the laptop, students have to
say precisely what they want ("set `saturate` to 1"), which makes them read
the code closely and use its words. Predicting out loud first is what keeps
the whole room involved.

---

### Stage 0 — Markup (the starting point)

**Looks like:** 1995. No CSS at all: Times New Roman, blue underlined links,
a broken image icon. Title: *Life Academy Web Lab*. Below it are the
**field notes** of the field day, as a plain `<h1>`, `<p>` and `<ul>`. It is
honest and a little boring, and that's the point. Under the notes is a
short intro: *"Seven locks. Each one teaches a trick web designers use.
Solve them all."* The intro mentions a web lab and nothing else.

**Code concept:** HTML is the content and structure, and everything later is
a layer on top. The `alt` attribute, comments and semantic tags.

**Puzzle:** "This page is missing a picture. Ask the page what *should* be
there." The image is broken on purpose, and browsers show `alt` text in its
place: *"photo: the whole field day, from the muddy gate to the bracket
board. Key: LOOK."* Turning on the **Markup** tab shows the tags and the same
key in an HTML comment, `<!-- key: LOOK -->`, for students who miss the alt
text. Stage 0 is the tutorial: it teaches that a page holds more than it
shows.

- **Answer:** `LOOK`
- **Before starting:** the page asks *"What should we call you?"* and the
  class picks a name for itself (a team name, or just "Life Academy").
  Stages 6 and 7 use it.
- **No letter tile.** This is the prologue, and the seven letters come from
  the seven layers.

**In the room:** this stage teaches how the game works. Ask a student to
read the broken image's text aloud. Then ask *"Is there anything on this
page we can't see?"* before opening the Markup tab. The first time the code
panel opens, explain the split (page on the left, the code that makes it on
the right) and the one rule: *"I'm your hands. I'll only do what you tell
me."*

**Role in the reveal:** this is where the ending comes back to. The final
screen is this exact page.

**Transition → 1:** the first stylesheet "loads": a soft background fades
in, the font changes, and the field notes **slide down and out of view**
(they're still in the page, pushed far below), so all that's left is one
centered photo frame. The broken image becomes a picture. From here on, the
truth is technically still there; you just can't see it.

---

### Stage 1 — The Box (framing)

**Looks like:** a clean, minimal gallery. One square photo card with rounded
corners and a shadow. The crop is tight on the fallen wall panel, Theo's
muddy sneakers sticking out beside it, and the ball flying past. Caption:
*"Gaga pit DESTROYED 😱"*.

**Code concept:** the box model and cropping: `width`/`height`,
`overflow: hidden`, `object-position`, `transform: scale()`, plus composition
as a design choice. The **Box** tab shows the frame as a draggable rectangle
over a dimmed "ghost" of the full image, and live CSS:

```css
.photo     { width: 320px; height: 320px; overflow: hidden; }
.photo img { transform: scale(3.2); object-position: 52% 60%; }
```

**Puzzle:** "The caption says destroyed. Someone is already on their way to
the pit. What are they carrying?" There's nobody else in the crop. The class
has the teacher zoom out (lower `scale`, or drag the frame) and finds more of
the scene: kids laughing around the pit, Theo grinning with a thumbs up, and,
walking over from the edge of the picture, Mr. Alvarez with a **drill**.

- **Answer:** `DRILL`
- **Letter:** **T**
- **Note found:** *"Mr. Alvarez screwed the panel back on in ten minutes."*

**In the room:** before touching anything, ask *"What happened here?"* and
let a few students tell the story the crop tells. Then the class directs
you (*"zoom out more!", "go left!"*). Whoever spots what he's carrying first
calls it out. Afterwards, ask whether the story changed once they saw the
whole picture.

**Role in the reveal:** **Framing.** *"Every photo is a choice of what to
leave out. A post shows one square of a whole day, and what's outside the
square doesn't exist for whoever's looking."*

**Transition → 2:** after the solve, the frame **snaps back to the tight
crop by itself** (the first time the motif shows up). Then the colors start
to *warm up*. Over about 3 seconds saturation creeps up, a golden tint
spreads, and the background turns into a peachy gradient.

---

### Stage 2 — The Style (filters and the highlight reel)

**Looks like:** a "lifestyle" aesthetic, everything glowing: warm gradient
background, rounded font, soft vignette, glossy shadows. A second photo
appears: the field by the gate in the morning, which looks golden-hour
beautiful. Caption: *"Perfect field day ☀️✨ #blessed"*. That's the drizzly,
muddy morning, filtered.

**Code concept:** the CSS `filter` property, how color and light set mood,
and **identity values** (the number for each filter that changes nothing).
The **Style** tab:

```css
.photo img {
  filter: brightness(1.35) saturate(2.2) contrast(1.15)
          hue-rotate(-28deg) sepia(0.3) blur(1.5px);
}
```

Each value has a slider, and the CSS text updates as it moves.

**Puzzle:** "There's a sign by the gate, but it's too 'pretty' to read.
What's it warning about? Every filter has a number that does nothing. Find
them all." The class works out each neutral value: `brightness(1)`,
`saturate(1)`, `contrast(1)`, `hue-rotate(0deg)`, `sepia(0)`, `blur(0)`.
Only with **all six** neutral do the grey sky and puddles show, along with a
chalkboard sign: *"CAUTION: MUD — pit opens at 11"*. The blur and brightness
wash it out until then, and partial fixes only make it a little clearer,
which nudges the class on.

- **Answer:** `MUD`
- **Letter:** **E**
- **Note found:** *"It drizzled until 11 a.m., so the gaga pit was muddy."*

**In the room:** six filters, six volunteers. Each student "owns" one filter,
works out its neutral number (with help from the room), and calls it out to
you. The sign only appears when the last one is right, so everyone is
waiting on everyone. Before they start, take a quick show of hands: *"Would
you want to be at this field day?"* Ask again after the sign shows.

**Role in the reveal:** **Filters and the highlight reel.** *"Perfect isn't
real. That golden morning was a muddy one. People post their best moments,
edited, and we compare them with our whole ordinary day."*

**Transition → 3:** the filter **goes back on**. Then the caption under the
photo starts to *retype itself*, one letter at a time, getting louder as it
goes: *"Gaga pit destroyed"* → *"Chaos at Life Academy field day!"* →
*"GAGA PIT COLLAPSES"*. The font gets heavier and bigger with each rewrite
until it fills the card.

---

### Stage 3 — The Type (sensational headlines and outrage)

**Looks like:** a tabloid. A red **BREAKING** banner, a giant condensed bold
headline in ALL CAPS (*"GAGA PIT COLLAPSES — KID HURT IN CO-OP CHAOS"*),
yellow highlighter on key words, emoji, `!!!`, and a scrolling news ticker
along the top: *"PIT IN RUINS • PARENTS DEMAND ANSWERS • IS YOUR CO-OP
NEXT? •"*.

**Code concept:** **content vs. presentation.** What's in the HTML isn't
always what you see. Typography sets the tone (size, weight, color, case).
And word choice is code: headlines come from a template. The **Type** tab
has two views:

- **Split view:** the source text on the left, the rendered text on the
  right, and a list of active CSS rules with checkboxes, like DevTools:
  `☑ text-transform: uppercase`, `☑ font-weight: 900`, `☑ color: #e00`.
- **Word dial:** the headline template
  `` `${subject} ${verb} ${object}${punct}` `` with one slider from *Calm*
  to *Outrage* that swaps words from a table:
  *a player → kid → KID*, *slipped into → crashed into → DESTROYED*,
  *a wall panel → the pit wall → THE GAGA PIT*, *. → ! → !!! 😱*.
  Students see that the facts don't change, only the words.

**Puzzle:** "Things aren't always as loud as they look. Read what's actually
written." The headline and ticker are uppercased by CSS. In the **source**,
the text uses ordinary case except for a few odd capital letters. Unticking
`text-transform: uppercase` (or reading the left side of the split view)
shows them, and in order they spell **LAUGHED**:

> *kid **L**ands h**A**rd, pit wall in r**U**ins, **G**aga game **H**alted,
> par**E**nts in **D**isbelief*

- **Answer:** `LAUGHED`
- **Letter:** **X**
- **Note found:** *"Everyone laughed, Theo hardest. He had a scraped elbow
  and got a band-aid."*
- **Bonus:** turn the word dial all the way to Calm and the headline reads
  *"A player slipped into a wall panel."*

**In the room:** before anyone opens the code, a show of hands: *"Is this
headline really written in all capital letters?"* Then untick
`text-transform` and let the class read the odd capitals aloud together, one
letter at a time. Let the room tell you where to set the word dial: *"Make
it calmer. Now as angry as it'll go."* Ask which version they'd click on.

**Role in the reveal:** **Sensationalism and clickbait.** *"The same fact,
said louder, gets more clicks, and anger spreads fastest of all. The words
are a choice, and someone wrote the code that makes it."*

**Transition → 4:** CSS goes back to uppercase. The single big tabloid card
**shrinks and slides up**, and more cards come in under it one after another.
A header bar appears with the first full **Lens** logo. The headline is now
just one post in a feed: the feed is born.

---

### Stage 4 — The Logic (the algorithm)

**Looks like:** the first real social feed. A narrow center column, post
cards with avatars, usernames, timestamps and action icons, and a top bar.
Every card keeps all three earlier layers (cropped, filtered, loud
headline), so the layers are building on each other. Seven posts from field
day, with the crash post on top and June's win at the very bottom.

**Code concept:** layout and components (one card template filled from data,
with flexbox), plus **functions and sorting**. The **Logic** tab shows:

```js
function score(post) {
  return post.shares   * 3
       + post.comments * 2
       + post.angry    * 5   // 😡 reactions count the most
       - post.ageHours * 1;
}

let sortBy = "engagement";   // "engagement" | "newest" | "oldest"
feed.sort((a, b) => score(b) - score(a));
```

The class can have the teacher change each weight and the `sortBy`
dropdown. The feed re-sorts with a smooth FLIP animation, so everyone sees
the posts move.

**Puzzle:** "The algorithm decides what comes first. What *happened* first?"
Sorted **oldest first**, the first letters of the seven posts spell
**REMATCH**:

| Time | Post |
|---|---|
| 9:05 | **R**ain again?? Field day's still on 🌧️ |
| 11:02 | **E**veryone's in the pit, gaga is open! |
| 1:31 | **M**UD DIVE 💥 the wall came DOWN |
| 1:33 | **A**ll good, Theo's laughing. Just a scrape 🩹 |
| 1:42 | **T**he wall's back up! Thanks, Mr. Alvarez 🔧 |
| 2:15 | **C**hampionship replay starting now |
| 2:40 | **H**uge upset: June (8) wins the championship 🏆 |

Engagement order scrambles them, so June's post (zero 😡) sinks to the
bottom and the crash rises to the top.

- **Answer:** `REMATCH`
- **Letter:** **T**
- **Note found:** *"The championship was replayed after the wall was
  fixed."*

**In the room:** have a code reader read the `score()` function aloud, one
line at a time. Ask: *"Which post do you think should be first?"* Then
*"Which post will be first if we sort by time?"* Take guesses before you
change the dropdown, so the room sees whether they predicted the re-sort. A
good challenge for 13-year-olds: *"Tell me one number to change so June's
post comes to the top."* (Setting `angry` to 0 nearly does it.)

**Role in the reveal:** **The algorithm.** *"Nobody sees everything. A
formula, not a person and not the truth, decides what comes first, and it
rewards whatever makes people react, especially anger."*

**Transition → 5:** the feed **re-sorts by engagement** on its own (the
motif). Then little counters appear under every post and start ticking up,
slowly at first and then like a slot machine: ❤️ 12 → 340 → 4,100 →
**48.2K**. Verified checkmarks pop in. A 🔥 *Trending: #GagaGate* tag lands
on the crash post.

---

### Stage 5 — The Data (fake popularity and social proof)

**Looks like:** numbers everywhere. Big like counts, follower counts, blue
checkmarks, stacked avatar faces with *"Liked by jess_k and 48,211 others"*,
*"#1 at Life Academy"*, *"🔥 Trending"*. Numbers get the visual weight that
content used to have.

**Code concept:** data and variables. A post is just an object, and the
interface draws whatever the data says. A **checkmark is just a `true`**.
The **Data** tab shows a collapsible JSON tree for each post:

```json
{
  "id": 3,
  "author": "coopdrama_daily",
  "accountCreated": "today",
  "verified": true,
  "likesShown": 48212,
  "likedBy": ["bot_8812", "bot_8813", "june.plays.gaga", "bot_8814", "..."],
  "boost": { "purchasedLikes": 48200, "price": "$19.99" }
}
```

Flipping `verified` to `false` makes the checkmark disappear, and the panel
shows the one CSS class that drew it.

**Puzzle:** "48,212 people liked this. Really? How many *real* people liked
the trending post?" There are two ways to get there, both through the data:
subtract `purchasedLikes` from `likesShown`, or open `likedBy`, page through
it, and count the accounts that aren't `bot_` (the panel has a filter box
that makes this practical).

- **Answer:** `12`
- **Letter:** **C**
- **Note found:** *"46 kids played gaga that day."* (Only 12 real people
  liked the crash post: fewer than the kids who were actually there,
  playing.)

**In the room:** first, a show of hands: *"Who'd believe a post with 48,000
likes?"* Then page through `likedBy` slowly while the class counts real
accounts out loud together. Someone usually spots the `purchasedLikes`
shortcut partway through: let them tell you how to check the count with it.
Then ask the room which value to change to make the checkmark go away.

**Role in the reveal:** **Fake popularity.** *"Numbers feel like votes, so we
follow the crowd. But the crowd can be bought, the voters can be bots, and a
badge is one line of data."*

**Transition → 6:** a friendly modal slides up: *"Make Lens yours, {class
name}! Pick what you like:"* with chips (🛡️ Safety, 😤 Drama, 🔨 Blame,
🏆 Results). Before anyone can pick, the chips **select themselves**, and the
modal says: *"Actually, we already know. 😉"* The page has been quietly
logging which posts the mouse hovered over, and for how long, since stage 4.
The mouse went wherever the class sent it, so it's a log of the **whole
class's** attention, and it now shows that log.

---

### Stage 6 — The State (filter bubbles and echo chambers)

**Looks like:** a feed made for one person. *"Good afternoon, {class name}"*
at the top. The **whole theme color** changes to match the top interest
(alarm red, gossip purple, angry orange). The feed now **only** shows that
topic, each post more extreme than the last:

- **Safety bubble:** *"Gaga pits are DANGEROUS."* *"Kid HURT at Life Academy."*
  *"Should co-ops ban gaga?"* (It was a scraped elbow.)
- **Drama bubble:** *"Did Theo do it ON PURPOSE? His team was losing 👀"*
  (The game was tied.)
- **Blame bubble:** *"Who built this pit?? Parents asleep on the job."*
  (It was mud and an accident.)

The 🏆 Results topic, where June's win lives, never becomes anyone's bubble.

**Code concept:** **state**, **events**, **conditionals**, and theming with
**CSS custom properties**. The **State** tab has:

- the profile, updated live:
  `const you = { name: "Life Academy", seconds: { safety: 41.2, drama: 6.8, blame: 3.1, results: 0.4 } }`
- the rules that use it:
  ```js
  const top = topInterest(you);                 // "safety"
  feed = posts.filter(p => p.topic === top);
  root.style.setProperty('--accent', topicColor[top]);
  ```
- a **console log** that keeps scrolling as the mouse moves:
  `hover post#3 · 1.8s`, `scroll · paused on post#5`, `tap ❤️ post#3`.
  It's unsettling on purpose, and on a big screen in front of everyone it's
  even more so.

**Puzzle (the room splits up):** with one screen, the class can't each have
their own feed, so the room is split into **three groups**, and each group
is shown a feed that only it sees.

1. The page says the room isn't one person, and asks the teacher to split
   the class into **Group 1, Group 2 and Group 3** (sides of the room work
   well). Group 1 gets the bubble the tracker picked for the class; Groups 2
   and 3 get the other two.
2. The page calls one group at a time: *"Group 1, look at the screen.
   Everyone else, turn around."* (or *"close your eyes"*). It shows that
   group's feed, themed and filtered, for **20 seconds** with a big
   countdown, then blanks. The teacher presses `G` for the next group.
3. Each group's pinned post holds one piece of the answer, labeled *1/3*,
   *2/3* or *3/3*. Safety shows **TO**, Drama shows **GE**, Blame shows
   **THER**. *"You only saw your feed. You'll need the others."*
4. The page then asks the room: ***"What happened at field day?"*** Each
   group answers from its own feed (a dangerous pit, a kid who cheated,
   careless parents) before anyone mentions the fragments. Let them
   disagree for a minute. This is the most important moment of the lesson,
   and it only works because the groups really didn't see each other's
   feeds.
5. The groups put their fragments together and the class tells the teacher
   the word.

- **Answer:** `TOGETHER`
- **Letter:** **O**
- **Note found:** *"It was an accident. The game was tied, and nobody was
  to blame."*

**In the room:** the 20 seconds is short on purpose: groups remember a
feeling, not details, just like scrolling. Make sure groups that are turned
around can't see the screen reflected in a window. When the room argues
about what happened, ask each group *"How sure are you?"* before they
compare. They'll usually be very sure.

**Role in the reveal:** **Filter bubbles.** *"Your feed isn't the world.
It's a mirror. Two people can scroll the same app and live in different
realities. The way out is talking to someone whose feed doesn't look like
yours."* (The puzzle made the groups do exactly that: they sat in the same
room, looked at the same screen, and still came away with three different
stories.)

**Transition → 7:** a soft *ding*. A red badge 🔴 **1** appears on a bell
icon. Then **3**. A 🔥 *"Day 1 streak!"* flame appears in the header. The feed
starts loading more posts at the bottom by itself, with a shimmer
placeholder.

---

### Stage 7 — The Timers (attention engineering)

**Looks like:** everything at once. Notifications slide in every few seconds
(*"Jordan reacted to your post!"*; the class has no posts), red badges keep
rising, a "video" of the crash autoplays **on a loop** (an animated SVG of
the panel falling, over and over, while the rematch is never shown), the
streak counter ticks up, *"14 people are viewing this"*, and the feed
**never ends**: it reshuffles and recycles posts with new headlines forever.
A pull-to-refresh with a slot-machine spin gives a random reward.

**Code concept:** **time and motion.** Timers (`setInterval`,
`setTimeout`), `IntersectionObserver` for infinite scroll, CSS `@keyframes`
animation, and how interaction design (where buttons go, how big they are,
what color) steers behavior. The **Timers** tab is a task manager listing
everything running without anyone doing anything:

```
● loadMoreWhenNearBottom()   IntersectionObserver   [Stop]
● sendNotification()         every 9s               [Stop]
● autoplayVideo()            on scroll              [Stop]
● growStreak()               every 15s              [Stop]
● fakeViewerCount()          every 4s               [Stop]
```

**Puzzle (the goal flips):** "Every feed has a bottom. This one hid it.
**Find the end.**" There's nothing to type. The class has to get every hook
switched off, and each Stop button fights back with a real **dark pattern**:

- **Confirmshaming:** *"Leave? Everyone in {class name} will miss you 😢"*. A
  huge bright **Stay ❤️** button, and a tiny grey *"no, I don't care about my
  friends"* link.
- **Roach motel:** the notification switch offers *"Pause for 1 hour"*
  (which turns itself back on after 20 seconds). The real *Turn off* is two
  menus deep.
- **Loss aversion:** stopping the streak warns *"You'll lose your 🔥 4-day
  streak forever!"* (It's been about four minutes.)
- **Moving target:** the Stop button for infinite scroll is low-contrast,
  and a newly loaded post pushes it down the page every time. On a projector
  it's *just* findable: a student may need to walk up to the screen and
  point, which is fine and fun. Tune it on the real projector before class.

When all five are stopped, the page goes **quiet**. The infinite feed runs
out, and below the last post is something the class hasn't seen all game:
*"You're all caught up."* Under that sits the last letter.

- **Answer:** (the action: reach the bottom)
- **Letter:** **N**
- **Note found:** *"June, age 8, won the rematch. Theo played in it too."*
- It also shows, flatly: **"Time on Lens: 41 min 12 s."** (The real total
  time the class spent on the puzzle.)

**In the room:** this is the loudest stage, with sound on through the
speakers. Hold firmly to the rule that you only click what the class tells
you. Every dark-pattern dialog becomes a quick class decision: *"Stay or
leave?"* Watch how the big bright button pulls at a room of 13-year-olds
even when they know it's a trick. That's worth naming in the discussion.

**Role in the reveal:** **Attention engineering.** *"Endless feeds,
notifications, streaks and random rewards are made, on purpose, to make
leaving hard. The hardest thing to find in an app is the end."*

**Transition → finale:** after *You're all caught up* there's a pause of a
few seconds and nothing moves for the first time since stage 4. Then the
tray rises up into the middle of the screen with its seven letters.

---

## 4. The finale: peeling back the layers

### The final lock: CONTEXT

The letters come in stage order: **T E X T C O N**. It reads almost like
"text con," which is a nice accident. The prompt:

> *"Seven letters. Something scrambled them, the way it scrambled
> everything else. Put them in order: it's what every layer took away."*

The class calls out the order and the teacher drags the tiles (or types) to
make **CONTEXT**. The way they solve it (putting things back in the right
order) is a callback to stage 4.

### The reveal, beat by beat

1. **Freeze.** Every timer stops. Sound off. The screen dims.
2. **Explode the stack.** The interface tilts into 3D (CSS `perspective` and
   `rotateX`) and **comes apart into seven translucent layers**, like the
   layers panel in a design app. Each is labeled with its code name: *Box,
   Style, Type, Logic, Data, State, Timers.* The plain field notes from
   stage 0 sit at the bottom, still there under everything.
3. **Flip the labels.** One at a time each label flips like a card, and the
   back gives its real name, a one-line explanation, and the note found at
   that stage:

   | Code name | What it really was | What it hid |
   |---|---|---|
   | Box | **Framing** | The wall was fixed in ten minutes |
   | Style | **Filters and the highlight reel** | It was a muddy, drizzly morning |
   | Type | **Sensational headlines** | A scraped elbow, and everyone laughed |
   | Logic | **The algorithm** | The championship was replayed |
   | Data | **Fake popularity** | 12 real likes; 46 kids actually played |
   | State | **Filter bubbles** | It was an accident; nobody was to blame |
   | Timers | **Attention engineering** | June won the rematch, while the crash played on a loop |

4. **Peel them off.** The layers come off **one by one, from the top**
   (Timers first, Box last), each time with a real `disable()`. Before each
   one, the teacher asks the room *"What did this layer do to the story?"*
   and a student answers before the card flips: a quick recall check of the
   whole lesson. The feed calms down, loses its numbers, un-sorts, quiets
   down, cools back to normal color, and widens its crop... until the page
   is **exactly the stage 0 field notes**, with Times New Roman and blue
   links. Caption: *"This is what actually happened. It's less exciting.
   It's true."*
5. **The panorama.** The broken image from stage 0 finally loads: the
   **whole field day**, with outlines showing where every post in the game
   was cropped from. *"Twelve posts. One day. Every one was a real photo."*
6. **The name.** The Lens logo comes back by itself: *"Every app is a lens.
   Now you know what a lens is made of."*
7. **Close.** A short message (*"This page learned things about this room
   and sent none of them anywhere. Real apps send them to their servers."*),
   time spent, and the discussion questions (section 6), one per screen.
   Optionally, the teacher then opens the browser's real DevTools (`F12`)
   to show what the Under the Hood panel was imitating: *"This is the real
   thing, and every website has it."*

After peeling, the teacher can switch any **single** layer back on, to show
one manipulation by itself on the honest page. That's useful for discussion
("Just the algorithm, nothing else. Is that bad?").

---

## 5. Transitions: rules and order

### Rules every transition follows

1. **Additive.** A transition adds a layer and never takes one away until the
   finale. The page keeps getting more "app-like."
2. **The truth flashes, then the layer comes back.** Every solve shows the
   real version for 1–2 seconds before the layer goes back on (motif in §2).
3. **The next layer starts out of the last one.** Each transition grows out
   of what's on screen: the crop warms into a filter, the caption rewrites
   into a headline, the headline card multiplies into a feed, the feed gets
   numbers, the numbers lead to the personalization modal, the
   personalization triggers notifications. No hard cuts.
4. **Calm to loud.** Motion and sound start at zero (stage 0 has no
   animation at all) and peak at stage 7. That makes the stillness in the
   finale hit harder.
5. **About 3–5 seconds**, skippable with `N`, and `prefers-reduced-motion`
   gets cross-fades instead. Transitions are a moment for the room to react,
   so don't rush them.

### What carries forward

| Stage | Layers on screen | New in look and feel | Motion / sound |
|---|---|---|---|
| 0 | none | none | none |
| 1 | Box | First CSS: card, shadow, centered | fade |
| 2 | Box, Style | Warm gradient, glow, rounded font | slow color drift |
| 3 | + Type | Tabloid type, BREAKING banner, ticker | ticker scroll, retype effect |
| 4 | + Logic | Feed layout, avatars, header, Lens logo | FLIP re-sort |
| 5 | + Data | Counters, badges, avatar stacks | counters rolling up |
| 6 | + State | Personal theme color, greeting, filtered feed | live log, theme shift |
| 7 | + Timers | Notifications, badges, looping video, endless feed | everything; *ding* |
| ★ | all → none | 3D layer stack → plain HTML | everything stops; one card flip at a time |

### Why this order and not another

- **Framing goes first** because it's the most concrete (you can see the
  crop) and the easiest puzzle, so it builds confidence and teaches students
  to look past what they're shown.
- **Filters come before headlines** because both change *how* something
  looks before anything changes *what* is shown, and image comes before text
  in the life of a post.
- **The algorithm is in the middle (4)** because the feed has to exist
  first: framing, filters and headlines describe one post, and the algorithm
  is the first thing that works on many posts. It's also the hinge where the
  code moves from CSS to JavaScript.
- **Likes come after ranking** because the numbers feed the ranking: the
  class has just seen `score()`, so faked likes now mean more.
- **The bubble (6) needs data from earlier stages.** Tracking starts in
  stage 4, so by stage 6 the page really knows something. Putting the bubble
  earlier would mean faking it.
- **Attention is last** because it's what everything else is for: framing,
  filters, outrage, ranking, popularity and personalization all exist to
  keep you scrolling. It's also the only stage where winning means *leaving*,
  which is the most important habit for students to take home. And after
  the group split in stage 6, the room is together again for the loudest,
  most chaotic stage, which sets up the sudden quiet of the finale.

---

## 6. Running it with the co-op

The whole class (13-year-olds) solves the puzzle together on one projected
laptop. The teacher is the only one who touches it; students do the
thinking and give the instructions.

### Before class

- **Room check:** connect the laptop to the projector in the actual room a
  day ahead if you can. Check that the back row can read the code panel,
  that the bubble colors in stage 6 look different, and that the hidden
  Stop button in stage 7 is hard but possible to find. Check the speakers.
- **Save an offline copy** of the page to the laptop, in case the Wi-Fi
  fails.
- **Rehearse** with the projector disconnected, using `Shift` + `→` to jump
  between stages. Print the answer key and the presenter keys (section 8).
- On the day: full screen (`F11`), notifications on the laptop turned off
  (real ones would be confusing during stage 7!), and the page left at
  stage 0 before students arrive.

### Roles

- **Teacher (the only one at the laptop):** the class's hands. Clicks and
  types only what the class tells them to, runs the presenter keys, decides
  when to give hints, keeps the look → predict → instruct → reveal rhythm
  going, and calls on students.
- **Code reader:** a student volunteer each stage who reads the code panel
  out loud for the room. Use a new one each stage, so seven students get a
  turn.
- **Spotters and counters:** the "first to spot it" and count-aloud moments
  built into stages 1, 3, 5 and 7, plus the six filter volunteers in
  stage 2.
- **Everyone:** predicts, argues and tells the teacher what to do. Students
  have to give exact instructions ("change `angry` to 0"), so they learn to
  use the code's own words.
- **Stage 6 groups:** three groups. Decide ahead of time how to split the
  room (by where they sit is easiest).

### Pacing (about 65 minutes, plus 20 for discussion)

| Stage | Minutes | Note |
|---|---|---|
| 0 Markup | 4 | Explain how the game works and the "I'm your hands" rule |
| 1 Box | 6 | |
| 2 Style | 7 | Six filter volunteers |
| 3 Type | 7 | |
| 4 Logic | 8 | Prediction before re-sorting |
| 5 Data | 7 | Counting aloud |
| 6 State | 10 | Group split; let the argument run |
| 7 Timers | 8 | Loud; the room decides every click |
| Finale | 8 | Recall question before each layer comes off |

If time is short, give hints early in stages 2 and 5, which are the easiest
to speed up without losing the point. Don't shorten stage 6 or the finale.
If the session has to stop partway, the laptop remembers where the class
left off.

### Tips

- **Don't spoil the theme.** Introduce it as a "web design lab." Let the
  ending land.
- **Pitched for 13.** The puzzles assume no coding experience but treat
  students as able to read real code. Stretch challenges for the room: get
  June's post to the top by changing one number (stage 4); work out what
  `score()` rewards; find the hidden message in the real DevTools (`F12`)
  at the end.
- **Spread the turns.** Seven code-reader turns, six filter volunteers and
  the spotting moments give most of a co-op class a turn to speak.
- **Gaga is personal.** Some students will have strong feelings about gaga
  calls and "who's really out." Let that energy into stage 6's argument;
  it's exactly what the bubbles feed on.

### Discussion questions (shown one per screen at the end, and printable)

Use think-pair-share: a minute for students to think, a minute to talk with
the person next to them, then a few share with the room.

1. Which layer surprised you most? Which one have you noticed in a real app?
2. Is cropping or filtering a photo *lying*? Where's the line?
3. Write the most boring true headline for the gaga story, then the most
   clickable one. Which would you click?
4. If you designed the `score()` function, what would you reward?
5. Has something small ever turned into a much bigger story once people
   started talking (or posting) about it? What got lost along the way?
6. Who in your life sees a different feed than you? How could you find out
   what they're seeing?
7. Stage 7 made leaving hard. What tricks do apps you use rely on? What
   helps you stop?
8. Is a social app with *none* of these layers possible? Would people use it?

### Follow-on activity

"**Add a layer.**" On paper, in small groups, students design an eighth
layer that manipulates the field notes, or an "honest layer" that *helps*
people see context. They sketch what it would look like and write a few
lines of pretend code for it, in the style of the Under the Hood panel.
Then they present it to the class. A good one could be built into the page
for next time.

---

## 7. Build plan

### Files

```
lifeacademy/
  index.html          ← the whole puzzle: HTML, CSS, JS and the panorama SVG inline
  icon.svg            ← Lens-style favicon
_source/lifeacademy/
  PLAN.md             ← this file (not published)
  answers.md          ← printable answer key and presenter keys (not published)
```

It's a standalone page with no Jekyll layout (like `fretspeak/`), so the site
header and footer don't break the illusion. Add
`<meta name="robots" content="noindex">` so search results don't show the
ending. It can be linked from the home page's Apps section later.

### Inside index.html

1. **Markup:** the stage 0 field notes as real semantic HTML (always in the
   document), the stage shell (photo card, feed container, tray, Under the
   Hood panel), and the panorama `<svg>` in a `<template>`, cloned for each
   crop.
2. **CSS:** base styles (none at stage 0!), then one block per layer scoped
   to `body.L1`…`body.L7`, then the finale's 3D stack. Colors as custom
   properties so stage 6 can re-theme everything with one variable.
3. **JS:**
   - `data`: the posts (text, time, topic, crop box, counts, likedBy, bubble
     fragment), the field notes, the notes found per stage, and the hints.
   - `layers[]`: `enable`/`disable`/`panel` for each layer.
   - `engine`: stage state machine, answer checks (SHA-256), save/load in
     `localStorage`, hints and hint tokens, presenter keys.
   - `panel`: the Under the Hood split screen and its tabs, with the small
     syntax highlighter.
   - `tracker` (starts at stage 4): hover and scroll timing in memory only.
   - `groups`: the stage 6 sequence (call a group, 20-second countdown,
     blank, next group).
   - `finale`: the CONTEXT tile puzzle, the layer stack, peel-back, and the
     panorama.

### Milestones

1. **Skeleton:** stage engine, layer system, tray, split-screen panel,
   save/load, presenter keys. Every stage as a placeholder with a "solve"
   button. Projected-size type from day one.
2. **Art:** the field-day panorama SVG (muddy gate, gaga pit, fallen panel,
   Theo, Mr. Alvarez, bracket board, June) and the crop definitions for
   every post.
3. **Stages 0–3** (the CSS stages), each with its panel and puzzle.
4. **Stages 4–7** (the JS stages), each with its panel and puzzle.
5. **Finale:** CONTEXT lock, 3D layer stack, peel-back, panorama.
6. **Polish:** transitions, reduced motion, keyboard pass, legibility at
   1280×720, hint text.
7. **Testing:** an automated Playwright run-through of every stage at
   1280×720 and 1920×1080. Then a **rehearsal on the real projector**, ideally
   with two or three people watching from the back of the room calling out
   instructions the way the class will. Adjust text sizes, colors and the
   stage 7 hidden button from what they can and can't see.

### Accessibility

For a projected class, accessibility mostly means **legibility for the
whole room**: big type, strong contrast, and nothing important shown only
by color (the stage 6 bubbles also differ by icon and title). Seat any
students with low vision near the screen, and have the code reader say
everything that matters out loud. Everything works by keyboard. The two
places that *deliberately* break good design (the low-contrast Stop button
and the confirmshaming link in stage 7) are named as bad design in the
finale. With `prefers-reduced-motion`, motion is replaced by cross-fades,
but the stage 7 notifications still arrive (as quiet badges).

---

## 8. Answer key (facilitator only)

| Stage | Answer | Letter | Note found |
|---|---|---|---|
| 0 | LOOK | none | none |
| 1 | DRILL | T | Mr. Alvarez fixed the panel in ten minutes |
| 2 | MUD | E | It drizzled until 11; the pit was muddy |
| 3 | LAUGHED | X | A scraped elbow; everyone laughed, Theo hardest |
| 4 | REMATCH | T | The championship was replayed |
| 5 | 12 | C | 46 kids played gaga that day |
| 6 | TOGETHER | O | It was an accident; the game was tied; nobody to blame |
| 7 | *(stop all five hooks)* | N | June (8) won the rematch; Theo played in it |
| ★ | CONTEXT | none | The whole panorama |

Print this table and the presenter keys from section 2 for the session.

## 9. Open questions

- **Names.** The story is set at Life Academy, with invented people (Theo,
  June, Mr. Alvarez, Jordan). Check that none of them shares a name with a
  current student or parent, and swap any that do. If the story is based on
  something that really happened, keep the names changed anyway.
- **Class size.** Affects the stage 6 groups (three groups works from about
  6 students up).
- **The room:** projector resolution, and whether there are speakers for
  stage 7's sound.
- **One session or several?** Progress saving works either way.
- **The app's name:** "Lens" or something else.
- **Sound:** on by default in stage 7 (the plan's default, muted with `M`),
  or off?
