// Play counter for pere.games (a Cloudflare Worker with one KV namespace).
//
//   GET  /counts         -> { "wildermon": 12, "fusionforce": 3, ... }
//   POST /play/<slug>    -> counts one play of that game, returns { slug, plays }
//
// Bindings (Workers > this worker > Settings):
//   PLAYS         KV namespace holding the counts ("plays:<slug>") and the
//                 short-lived repeat-play markers ("seen:<hash>:<slug>")
//   GAMES         variable: the slugs that may be counted, comma-separated,
//                 e.g. "wildermon,fantasyfrontiers,fusionforce,cyberrider,prehistorextraction"
//   ALLOWED_ORIGINS (optional) variable, comma-separated; default below
//
// One visitor counts once per game per REPEAT_WINDOW seconds. The visitor is
// recognised by a SHA-256 of their IP address, the game and the current day,
// kept only for that window (KV expires it); the IP itself is never stored.
// KV is eventually consistent, so two plays landing in the same instant can
// count as one. For a hub's play counter that is fine; exact counts would
// need a Durable Object.

const REPEAT_WINDOW = 600; // seconds
const DEFAULT_ORIGINS = "https://pere.games,https://www.pere.games,https://catgenova.github.io";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origins = (env.ALLOWED_ORIGINS || DEFAULT_ORIGINS).split(",").map((s) => s.trim());
    const origin = request.headers.get("Origin") || "";
    const cors = {
      "Access-Control-Allow-Origin": origins.includes(origin) ? origin : origins[0],
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin",
    };
    const games = (env.GAMES || "").split(",").map((s) => s.trim()).filter(Boolean);
    const json = (body, status = 200, extra = {}) =>
      new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...cors, ...extra } });

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    if (request.method === "GET" && url.pathname === "/counts") {
      const entries = await Promise.all(games.map(async (g) => [g, Number(await env.PLAYS.get("plays:" + g)) || 0]));
      return json(Object.fromEntries(entries), 200, { "Cache-Control": "public, max-age=60" });
    }

    const m = url.pathname.match(/^\/play\/([a-z0-9-]{1,60})$/);
    if (request.method === "POST" && m) {
      const slug = m[1];
      if (!games.includes(slug)) return json({ error: "unknown game" }, 404);
      // Only count plays started from the site itself.
      if (origin && !origins.includes(origin)) return json({ error: "origin not allowed" }, 403);

      const key = "plays:" + slug;
      const ip = request.headers.get("CF-Connecting-IP") || "";
      const day = new Date().toISOString().slice(0, 10);
      const seenKey = "seen:" + (await sha256(ip + "|" + slug + "|" + day)) + ":" + slug;
      if (ip && (await env.PLAYS.get(seenKey))) {
        return json({ slug, plays: Number(await env.PLAYS.get(key)) || 0, counted: false });
      }
      const plays = (Number(await env.PLAYS.get(key)) || 0) + 1;
      await env.PLAYS.put(key, String(plays));
      if (ip) await env.PLAYS.put(seenKey, "1", { expirationTtl: REPEAT_WINDOW });
      return json({ slug, plays, counted: true });
    }

    return json({ error: "not found" }, 404);
  },
};

async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
