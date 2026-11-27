# Pere Games hub

Source for [pere.games](https://pere.games): the studio's home page, game
directory, public changelog and blog. It's a Jekyll site that GitHub Pages
builds automatically, so there is no build step to run.

## Adding content

| What | Where | Notes |
| --- | --- | --- |
| A game | `_games/<slug>.md` | Copy `wildermon.md`. The filename is the slug, used by changelog entries and for the page URL `/games/<slug>/`. |
| An app | `_apps/<slug>.md` | Copy `fretspeak.md`. Listed under Apps on the home page; `app_url` is where Open goes. The app's own files live in a folder such as `fretspeak/`. |
| A changelog entry | `_changelog/YYYY-MM-DD-<short-name>.md` | Needs `title`, `game: <slug>` and `date`. `version` is optional. The body is markdown. |
| A blog post | `_posts/YYYY-MM-DD-<title>.md` | Needs `title`. Put `<!--more-->` after the intro to set the excerpt. |
| Cover art | `assets/img/games/` | 16:9 works best. Set `cover:` in the game file. |
| Nav links | `_data/nav.yml` | |
| Socials, contact, ads | `_config.yml` | |

Game front matter:

```yaml
title: Wildermon
tagline: One-line pitch shown on cards.
status: Live          # Live, Beta, Early Access or In Development
tags: [MMO, Open World]   # each tag links to /games/?tag=<tag>
featured: true        # show on the home page
order: 1              # sort order on the games page
play_url: /wildermon/
cover: /assets/img/games/wildermon.png
source_url: https://github.com/Catgenova/wildermon
```

Feeds are generated at `/blog/feed.xml` and `/changelog/feed.xml`.

## Crossword (`/crossword/`)

| What | Where |
| --- | --- |
| Hub: today's puzzle, specials, archive | `crossword/index.html`, `crossword/hub.js` |
| Player | `crossword/play/index.html`, `crossword/crossword.js` |
| Styles (both pages) | `crossword/crossword.css` |
| Published puzzles (generated) | `crossword/puzzles/` (`index.json`, `daily/<date>.json`, `<special>.json`) |
| Builders, word list, clue bank | `_source/crossword/` (not published) |

Links: `/crossword/play/` opens the latest daily, `?d=2026-11-27` a given day,
`?p=thanksgiving` a special, and `&level=easy|medium|hard` a difficulty. A
daily isn't shown before its date in the visitor's time zone. Progress is
kept in `localStorage`, per puzzle and per difficulty.

**Daily puzzles** are 15×15 newspaper-style grids: symmetric, every letter in
both an Across and a Down answer, answers at least 3 letters, no repeats.
Each answer has three clues (easy, medium, hard); Hard also hides answer
lengths and turns off autocheck.

1. Add the date's theme to `_source/crossword/themes.py`: a title and 2–4
   theme answers. The first two must be the same length, a third (centre row)
   must be an odd length. Lengths that fit: 3–11, 13 or 14 (15s rarely fill);
   10/10/7 and 11/11/7 fill most reliably. Optionally name a topic as a third
   item (`"newyear"`): the filler then leans toward that topic's words.
2. Make the grid: `python3 daily.py fill 2026-12-01` (run in
   `_source/crossword/`). It tries random black-square patterns and fills them
   from `wordlist.txt`, preferring common words and words that already have
   clues. A themed grid can take several minutes. The result is saved as a
   draft in `daily/<date>.txt`, which is committed so a published grid never
   changes; delete the draft to get a new grid.
3. `python3 daily.py missing 2026-12-01` lists answers without clues. Add
   them to `clues.tsv` (`ANSWER<TAB>easy<TAB>medium<TAB>hard`). If a word is
   unfit to clue, add it to `banned.txt`, delete the draft and fill again.
4. `python3 daily.py publish 2026-12-01` writes the puzzle and updates
   `index.json`.

**Topics** (`topics.py`) are themed vocabularies, about 40 answers each, every
one already clued: holidays through the year (New Year, MLK Day, Lunar New
Year, Valentine's, St. Patrick's, Easter, Fourth of July, Halloween...) and
evergreen subjects (space, ocean, pirates, mysteries, music...). `python3
topics.py list` shows them, `python3 topics.py themes valentines` suggests
theme sets that fit a 15×15 grid, and `python3 topics.py missing` lists any
topic entry that still needs clues. A special can also use a topic as its
`vocab` in `themes.py`.

`wordlist.txt` comes from SCOWL (levels 10–50, see `SCOWL-COPYRIGHT.txt`);
the number after each word is its level, 10 being the most common.

**Specials** are bigger newspaper-style grids (21×21) listed in `EVENTS` in
`themes.py`, built with `python3 event.py fill thanksgiving`, then `missing`
and `publish` like the dailies. An event's `vocab` (a topic, or a module with
`WORDS` such as `thanksgiving.py`) gets a strong fill bonus so the whole grid
leans into the theme. Bump `rev` when a published special gets a new grid.

Answers are stored as ROT13 so a glance at the page source doesn't spoil a
puzzle.

## Homeschooling forms (`/homeschooling/`)

Tools for New York State home instruction paperwork (8 NYCRR §100.10). Everything
runs in the browser: family details and drafts are kept in `localStorage`, and
PDFs are made on the visitor's device with jsPDF. Nothing is sent to a server,
and these pages never load ad scripts (`no_ads: true`, set in `_config.yml`).

| What | Where |
| --- | --- |
| Official links list on the overview page | `_data/homeschool.yml` (`links`; bump `checked` when re-checked) |
| Section nav | `_data/homeschool.yml` (`nav`) |
| Rules: subjects by grade, hours, assessment rules | `homeschooling/assets/rules.js` |
| PDF house style (masthead, info grid, tables, signatures, footers) | `homeschooling/assets/pdf.js` |
| What goes in each document, and file naming | `homeschooling/assets/docs.js` |
| Form pages | `homeschooling/*/index.html` and `homeschooling/assets/app.js` |
| Example family and text | `homeschooling/assets/examples.js` |
| PDF libraries (jsPDF 4.2.1, AutoTable 5.0.9, pdf-lib 1.17.1, MIT) | `homeschooling/assets/lib/` |

PDF file names follow one pattern so a year's paperwork sorts in filing order:
`{school year}_{Last}-{First}_Gr{grade}_{##}-{document}.pdf`, e.g.
`2026-27_Rivera-Mila_Gr5_03-Q1-Quarterly-Report.pdf` (01 letter of intent,
02 IHIP, 03–06 quarterly reports, 07 annual assessment).

## Ads

Until `ads.adsense_client` is set in `_config.yml`, ad slots show a house
"advertise here" box that links to `/advertise/`. Once AdSense approves the
site, set the client id and slot ids. `/ads.txt` is generated from the same
setting.

## Going live on pere.games

Game repos are served at `<hub domain>/<repo name>/`, but only if this hub is
the **user site**. Before launch:

1. **Rename this repo to `Catgenova.github.io`** (Settings → General). Every
   other Pages repo then appears under the same domain, e.g. the `wildermon`
   repo at `pere.games/wildermon/`.
2. **DNS at Porkbun**: delete the default parking ALIAS/CNAME records, then add
   - `A` on `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `AAAA` on `@`: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
   - `CNAME` on `www`: `catgenova.github.io`
3. **Verify the domain**: GitHub profile Settings → Pages → Add a domain, then
   add the TXT record it gives you at Porkbun.
4. **Publish**: repo Settings → Pages → deploy from the `main` branch, root
   folder. Set the custom domain to `pere.games`, and once the certificate
   is ready, tick "Enforce HTTPS".

Don't give this repo a folder named after a game repo (e.g. `/wildermon/`),
because it would clash with that game's Pages site.

## Moving a game over

1. Rename the game repo to the path you want (`Wurm` → `wildermon`).
2. Fix any hard-coded base paths in the game (Vite `base`, manifest
   `start_url`, service worker scope).
3. Supabase → Authentication → URL Configuration: add
   `https://pere.games/**` to Redirect URLs, update the Site URL, and update
   any `redirectTo` values in the code.
4. Optionally create a new repo with the old name containing only an
   `index.html` that redirects to the new path, so old links keep working.
5. Update `play_url` in `_games/<slug>.md` and add a changelog entry.

## Running locally

```sh
bundle install
bundle exec jekyll serve
```

Then open http://localhost:4000.

## Logo

`_source/logo-frames/` holds the original 2700×1636 PNG frames of the logo
animation. Folders starting with `_` aren't published. The site uses files
generated from them in `assets/img/logo/`:

- `pere-logo-anim.webp`: home page animation (24 fps, plays once)
- `pere-logo.webp`: final frame, shown instead when the visitor prefers reduced motion
- `pere-logo-nav.png`: final frame for the header bar

To regenerate the animation:

```sh
ffmpeg -framerate 30 -start_number 1 -i _source/logo-frames/Pere-logo_%05d.png \
  -vf "crop=2464:1562:83:60,fps=24,scale=800:-1:flags=lanczos" \
  -c:v libwebp_anim -quality 50 -compression_level 4 -loop 1 assets/img/logo/pere-logo-anim.webp
```
