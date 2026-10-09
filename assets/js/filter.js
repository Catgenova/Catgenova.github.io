// Chip filter shared by the games and changelog pages. Configured from the
// script tag: data-items (selector), data-attr (data-* attribute holding the
// item's space-separated slugs) and data-param (query string key, so links can
// deep-link to a filtered view).
(function () {
  var script = document.currentScript;
  var bar = document.querySelector("[data-filters]");
  if (!bar || !script) return;
  var attr = script.dataset.attr;
  var param = script.dataset.param;
  var chips = bar.querySelectorAll("[data-filter]");
  var items = document.querySelectorAll(script.dataset.items);
  var empty = document.querySelector("[data-empty]");

  function apply(slug, push) {
    var known = Array.prototype.some.call(chips, function (c) { return c.dataset.filter === slug; });
    if (!known) slug = "";
    var shown = 0;
    items.forEach(function (item) {
      var match = !slug || (item.dataset[attr] || "").split(/\s+/).indexOf(slug) !== -1;
      item.hidden = !match;
      if (match) shown++;
    });
    chips.forEach(function (chip) {
      chip.setAttribute("aria-pressed", String(chip.dataset.filter === slug));
    });
    if (empty) empty.hidden = shown > 0;
    if (push) {
      var url = new URL(location.href);
      if (slug) url.searchParams.set(param, slug);
      else url.searchParams.delete(param);
      history.replaceState(null, "", url);
    }
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () { apply(chip.dataset.filter, true); });
  });

  bar.hidden = false;
  apply(new URL(location.href).searchParams.get(param) || "", false);
})();
