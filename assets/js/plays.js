// Play counts. Reads site.plays_api from the script tag; with no API set, does nothing.
//  - Fills every [data-plays="<slug>"] with that game's count ("1,204 plays").
//  - Counts a play when a [data-play="<slug>"] link (the Play buttons) is clicked.
(function () {
  var script = document.currentScript;
  var api = script && script.dataset.api;
  if (!api) return;
  api = api.replace(/\/$/, "");

  var fmt = function (n) {
    var s = n >= 10000 && window.Intl ? new Intl.NumberFormat("en", { notation: "compact" }).format(n) : n.toLocaleString("en");
    return s + (n === 1 ? " play" : " plays");
  };

  var slots = document.querySelectorAll("[data-plays]");
  if (slots.length) {
    fetch(api + "/counts").then(function (r) { return r.ok ? r.json() : null; }).then(function (counts) {
      if (!counts) return;
      slots.forEach(function (el) {
        var n = counts[el.dataset.plays];
        if (typeof n !== "number") return;
        el.textContent = fmt(n);
        el.hidden = false;
      });
    }).catch(function () {});
  }

  document.addEventListener("click", function (e) {
    var link = e.target.closest && e.target.closest("[data-play]");
    if (!link) return;
    var url = api + "/play/" + encodeURIComponent(link.dataset.play);
    // sendBeacon survives the page navigating away to the game.
    if (navigator.sendBeacon && navigator.sendBeacon(url)) return;
    try { fetch(url, { method: "POST", keepalive: true }); } catch (err) {}
  });
})();
