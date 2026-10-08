// Filters the changelog by game. Works with ?game=<slug> so game pages can deep-link.
(function () {
  var bar = document.querySelector("[data-filters]");
  if (!bar) return;
  var chips = bar.querySelectorAll("[data-filter]");
  var items = document.querySelectorAll(".changelog-item");
  var empty = document.querySelector("[data-empty]");

  function apply(slug, push) {
    var shown = 0;
    items.forEach(function (item) {
      var match = !slug || item.dataset.game === slug;
      item.hidden = !match;
      if (match) shown++;
    });
    chips.forEach(function (chip) {
      chip.setAttribute("aria-pressed", String(chip.dataset.filter === slug));
    });
    if (empty) empty.hidden = shown > 0;
    if (push) {
      var url = new URL(location.href);
      if (slug) url.searchParams.set("game", slug);
      else url.searchParams.delete("game");
      history.replaceState(null, "", url);
    }
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () { apply(chip.dataset.filter, true); });
  });

  bar.hidden = false;
  apply(new URL(location.href).searchParams.get("game") || "", false);
})();
