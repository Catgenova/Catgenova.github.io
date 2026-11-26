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

A criss-cross crossword player. The page is static: `crossword/index.html`,
`crossword.css` and `crossword.js`, with the puzzle itself in
`crossword/puzzles/<slug>.js`. Progress and time are kept in `localStorage`.

Puzzle files are generated, not hand-edited. The word list and clues live in
`_source/crossword/<name>.py` (`WORDS`, `TITLE`, `SLUG`). To change a clue or
an answer, edit that file and rebuild:

```sh
python3 _source/crossword/build.py thanksgiving
```

The builder tries 400 random layouts from a fixed seed and keeps the most compact one
that places every word. Changing an answer changes the grid, so expect a new
layout; changing only clue text keeps it. Answers are stored as ROT13 so the
solution isn't readable at a glance in the page source.

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
