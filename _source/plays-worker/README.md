# Play counter (Cloudflare Worker)

`worker.js` counts clicks on the hub's Play buttons and serves the totals the
home page shows. It is not part of the Jekyll site (folders starting with `_`
are not published); it runs on Cloudflare.

## Deploy (dashboard, about five minutes)

1. Cloudflare dashboard > **Storage & Databases > KV** > **Create a namespace**
   named `pere-plays`.
2. **Compute (Workers) > Create > Create Worker**, name it `pere-plays`, click
   **Deploy**, then **Edit code**. Replace everything with the contents of
   `worker.js` and **Deploy** again.
3. The worker's **Settings**:
   - **Bindings > Add > KV namespace**: variable name `PLAYS`, namespace
     `pere-plays`.
   - **Variables and Secrets > Add** (type Text): `GAMES` =
     `wildermon,fantasyfrontiers,fusionforce,cyberrider,prehistorextraction`
     (every game slug that has a Play button; add new games here).
   - **Domains & Routes > Add > Custom domain**: `api.pere.games`. Cloudflare
     creates the DNS record itself.
4. Check `https://api.pere.games/counts` returns the games with `0`.
5. In the hub's `_config.yml`, set `plays_api: "https://api.pere.games"` and
   push. The counts appear on the site.

## Seeding or correcting a count

KV > `pere-plays` > add or edit the key `plays:<slug>` with the number as its
value (for example `plays:wildermon` = `250`). The site shows it within a minute.

## Notes

- One visitor counts once per game every 10 minutes. The visitor is recognised
  by a SHA-256 of IP address, game and day, kept for those 10 minutes only; the
  IP itself is never stored. No cookies.
- Plays only count from `pere.games` (and `catgenova.github.io`); change
  `ALLOWED_ORIGINS` to widen that.
- `/counts` is cached for 60 seconds, so a new play shows up within a minute.
- KV is eventually consistent: two plays in the same instant can count as one.
- The free Workers plan allows 100,000 requests and 1,000 KV writes a day; each
  counted play is two writes, so about 500 counted plays a day before KV writes
  run out (plays beyond that fail quietly until the next day). The paid plan
  ($5/month) lifts this to millions.
