// Page controllers for pere.games/homeschooling. Each page sets
// data-hs-page on its root; this file wires that page up.

import * as S from "./store.js";
import * as R from "./rules.js";
import { build, filename, docTitle } from "./docs.js";
import { saveFile, openPreview, fmtDate, todayISO } from "./pdf.js";
import { EXAMPLE_FAMILY, examples } from "./examples.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const params = new URLSearchParams(location.search);
const ROOT = "/homeschooling/";
const clone = (o) => JSON.parse(JSON.stringify(o));

function getPath(o, k) { return k.split(".").reduce((a, p) => (a == null ? a : a[p]), o); }
function setPath(o, k, v) {
  const parts = k.split(".");
  const last = parts.pop();
  const t = parts.reduce((a, p) => (a[p] ??= {}), o);
  t[last] = v;
}
function fieldValue(el) { return el.type === "checkbox" ? el.checked : el.value; }
function setField(el, v) {
  if (el.type === "checkbox") el.checked = !!v;
  else if (el.type === "radio") el.checked = el.value === String(v ?? "");
  else el.value = v ?? "";
}
// Textareas grow with their content.
function autosize(el) {
  if (!el || el.tagName !== "TEXTAREA" || !el.offsetParent) return;
  el.style.height = "auto";
  el.style.height = el.scrollHeight + 2 + "px";
}
function autosizeAll(root) { $$("textarea", root).forEach(autosize); }

function shortDate(iso) { return iso ? fmtDate(iso).replace(/, \d{4}$/, "") : ""; }

function storageWarning(host) {
  if (S.canStore()) return;
  host.insertAdjacentHTML("afterbegin", `<div class="hs-callout hs-callout-warn">This browser is blocking storage (private mode or site data turned off), so nothing you type here will be kept after you leave the page. You can still make PDFs.</div>`);
}

// ---- documents per student & year ------------------------------------------

function quarterDues(childId, year) {
  const ihip = S.getDoc(childId, year, "ihip");
  return [1, 2, 3, 4].map((q) => ihip?.data?.quarters?.[q - 1]?.due || S.quarterDue(year, q));
}

function dueFor(childId, year, type) {
  const start = S.yearStart(year);
  if (type === "loi") return `${start}-07-01`;
  if (type === "ihip") return `${start}-08-15`;
  const dues = quarterDues(childId, year);
  if (type === "assessment") return dues[3];
  return dues[Number(type.slice(1)) - 1];
}

function statusOf(childId, year, type) {
  const rec = S.getDoc(childId, year, type);
  const due = dueFor(childId, year, type);
  if (rec?.submitted) return { cls: "done", text: "Submitted", date: rec.submitted, due };
  const late = due && due < todayISO();
  if (rec?.exported) return { cls: late ? "late" : "ready", text: late ? "PDF made, not marked submitted" : "PDF made", due };
  if (rec?.updated) return { cls: late ? "late" : "draft", text: late ? "Draft, overdue" : "Draft", due };
  return { cls: late ? "late" : "todo", text: late ? "Overdue" : "Not started", due };
}

const PAGE_FOR = { loi: "letter-of-intent/", ihip: "ihip/", q1: "quarterly-report/", q2: "quarterly-report/", q3: "quarterly-report/", q4: "quarterly-report/", assessment: "annual-assessment/" };
function linkFor(childId, year, type) {
  const q = /^q\d$/.test(type) ? `&q=${type.slice(1)}` : "";
  return `${ROOT}${PAGE_FOR[type]}?child=${encodeURIComponent(childId)}&year=${year}${q}`;
}

// ---- hub -------------------------------------------------------------------

function hub() {
  const host = $("#hs-checklist");
  if (!host) return;
  const st = S.load();
  storageWarning(host.parentElement);
  let year = params.get("year") || st.settings.year;

  const draw = () => {
    const kids = S.children().filter((c) => c.first || c.last);
    if (!kids.length) {
      host.innerHTML = `
        <div class="hs-empty">
          <p><strong>Add your family to track deadlines.</strong> Enter parent, district and student details once, and every form fills them in.</p>
          <div class="game-actions">
            <a class="btn btn-primary" href="${ROOT}setup/">Set up your family</a>
            <button class="btn" type="button" data-act="example-family">Try it with an example family</button>
          </div>
        </div>`;
      return;
    }
    const cols = [
      ["loi", "Letter of intent"], ["ihip", "IHIP"], ["q1", "Q1"], ["q2", "Q2"], ["q3", "Q3"], ["q4", "Q4"], ["assessment", "Annual assessment"],
    ];
    const years = Array.from(new Set([...S.yearOptions(), year])).sort().reverse();
    host.innerHTML = `
      <div class="hs-toolbar">
        <label class="hs-inline">School year
          <select id="hs-year">${years.map((y) => `<option value="${y}"${y === year ? " selected" : ""}>${S.yearDisplay(y)}</option>`).join("")}</select>
        </label>
        <a href="${ROOT}setup/">Edit family &amp; students</a>
      </div>
      <div class="hs-table-wrap">
        <table class="hs-status">
          <thead><tr><th scope="col">Student</th>${cols.map(([, l]) => `<th scope="col">${l}</th>`).join("")}</tr></thead>
          <tbody>
          ${kids.map((c) => {
            const g = S.gradeFor(c, year);
            return `<tr>
              <th scope="row">${esc(S.fullName(c))}<span class="muted">${g ? `Grade ${g}` : "Grade not set"}</span></th>
              ${cols.map(([t, label]) => {
                const s = statusOf(c.id, year, t);
                const sub = s.cls === "done" ? `on ${shortDate(s.date)}` : `due ${shortDate(s.due)}`;
                return `<td data-label="${label}"><a class="hs-pill hs-${s.cls}" href="${linkFor(c.id, year, t)}"><span>${s.text}</span><small>${sub}</small></a></td>`;
              }).join("")}
            </tr>`;
          }).join("")}
          </tbody>
        </table>
      </div>`;
    $("#hs-year", host).addEventListener("change", (e) => { year = e.target.value; draw(); });
  };

  host.addEventListener("click", (e) => {
    if (e.target.closest('[data-act="example-family"]')) { loadExampleFamily(); draw(); }
  });
  draw();
}

function loadExampleFamily() {
  const st = S.load();
  Object.assign(st.family, clone(EXAMPLE_FAMILY.family));
  for (const c of EXAMPLE_FAMILY.children) {
    if (!st.children.some((k) => k.first === c.first && k.last === c.last)) {
      st.children.push({ ...clone(c), id: "c" + Math.random().toString(36).slice(2, 9), gradeYear: st.settings.year });
    }
  }
  S.save();
}

// ---- setup -----------------------------------------------------------------

function setup() {
  const st = S.load();
  const form = $("#hs-setup");
  storageWarning(form);

  const flash = (msg) => {
    const el = $("#hs-setup-saved");
    el.textContent = msg;
    el.classList.add("is-on");
    clearTimeout(flash.t);
    flash.t = setTimeout(() => el.classList.remove("is-on"), 1600);
  };

  const fillFamily = () => $$("[data-k]", form).forEach((el) => setField(el, getPath(st, el.dataset.k)));

  const drawKids = () => {
    const host = $("#hs-children");
    const year = st.settings.year;
    if (!st.children.length) {
      host.innerHTML = `<p class="muted">No students yet.</p>`;
      return;
    }
    host.innerHTML = st.children.map((c) => `
      <fieldset class="hs-child" data-id="${c.id}">
        <legend class="visually-hidden">Student</legend>
        <div class="hs-grid hs-grid-4">
          <label class="field"><span>First name</span><input data-c="first" value="${esc(c.first)}" autocomplete="off"></label>
          <label class="field"><span>Last name</span><input data-c="last" value="${esc(c.last)}" autocomplete="off"></label>
          <label class="field"><span>Date of birth</span><input type="date" data-c="dob" value="${esc(c.dob)}"></label>
          <label class="field"><span>Grade in ${S.yearDisplay(year)}</span>
            <select data-c="grade"><option value="">Choose…</option>${R.GRADES.map((g) => `<option${S.gradeFor(c, year) === g ? " selected" : ""}>${g}</option>`).join("")}</select>
          </label>
        </div>
        <button class="btn btn-quiet" type="button" data-act="remove-child">Remove ${esc(c.first || "student")}</button>
      </fieldset>`).join("");
  };

  const drawSettings = () => {
    const years = Array.from(new Set([...S.yearOptions(), st.settings.year])).sort().reverse();
    $("#hs-set-year").innerHTML = years.map((y) => `<option value="${y}"${y === st.settings.year ? " selected" : ""}>${S.yearDisplay(y)}</option>`).join("");
    $$("[data-qdue]").forEach((el) => { el.value = S.quarterDue(st.settings.year, Number(el.dataset.qdue)); });
  };

  form.addEventListener("input", (e) => {
    const el = e.target;
    if (el.dataset.k) { setPath(st, el.dataset.k, fieldValue(el)); S.save(); flash("Saved"); }
    else if (el.dataset.c) {
      const c = st.children.find((k) => k.id === el.closest("[data-id]").dataset.id);
      if (el.dataset.c === "grade") { c.grade = el.value; c.gradeYear = st.settings.year; }
      else c[el.dataset.c] = el.value;
      S.save(); flash("Saved");
    } else if (el.dataset.qdue && el.value) {
      st.settings.quarterDues[Number(el.dataset.qdue) - 1] = el.value.slice(5);
      S.save(); flash("Saved");
    }
  });
  $("#hs-set-year").addEventListener("change", (e) => { st.settings.year = e.target.value; S.save(); drawKids(); drawSettings(); flash("Saved"); });

  form.addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]");
    if (!b) return;
    const act = b.dataset.act;
    if (act === "add-child") { S.addChild(); drawKids(); $$("#hs-children [data-c=first]").pop()?.focus(); }
    if (act === "remove-child") {
      const id = b.closest("[data-id]").dataset.id;
      const c = S.child(id);
      if (confirm(`Remove ${S.fullName(c) || "this student"} and every form saved for them?`)) { S.removeChild(id); drawKids(); }
    }
    if (act === "example-family") { loadExampleFamily(); fillFamily(); drawKids(); flash("Example family added"); }
    if (act === "export") {
      const blob = new Blob([S.exportJSON()], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `homeschool-backup-${todayISO()}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 30000);
    }
    if (act === "import") $("#hs-import").click();
    if (act === "wipe" && confirm("Delete all family details, students and saved forms from this browser? Download a backup first if you might need them.")) {
      S.clearAll(); location.reload();
    }
  });
  $("#hs-import").addEventListener("change", async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      S.replaceAll(JSON.parse(await f.text()));
      location.reload();
    } catch (err) { alert(err.message || "That file couldn't be read."); }
  });

  fillFamily(); drawKids(); drawSettings();
}

// ---- shared form page --------------------------------------------------------

function docPage(cfg) {
  const st = S.load();
  const form = $("#hs-form");
  const ctxEl = $("#hs-context");
  const barEl = $("#hs-bar");
  const finishEl = $("#hs-finish");
  storageWarning(ctxEl);

  const kids = S.children().filter((c) => c.first || c.last);
  if (!kids.length) {
    ctxEl.innerHTML = `
      <div class="hs-empty">
        <p><strong>First, add your family.</strong> Student, parent and district details are entered once on the family page and filled into every form.</p>
        <a class="btn btn-primary" href="${ROOT}setup/">Set up your family</a>
      </div>`;
    form.hidden = true;
    return;
  }

  const sel = {
    child: params.get("child") || st.settings.lastChild,
    year: params.get("year") || st.settings.year,
    q: Math.min(4, Math.max(1, Number(params.get("q")) || cfg.defaultQ?.(st) || 1)),
  };
  if (!kids.some((k) => k.id === sel.child)) sel.child = kids[0].id;

  let data = null;
  const api = {
    sel,
    files: [],
    ctx() {
      const c = S.child(sel.child);
      return { child: c, year: sel.year, grade: S.gradeFor(c, sel.year), family: st.family, q: sel.q };
    },
    type() { return cfg.type(sel); },
    get data() { return data; },
    set data(v) { data = v; },
    persist() { S.putDoc(sel.child, sel.year, api.type(), data); drawBar(); drawFinish(true); },
    redraw() { fillStatic(); cfg.render(api.ctx(), data, api); applyShows(); drawBar(); drawFinish(); autosizeAll(form); },
    refresh() { drawFinish(true); },
  };

  function drawContext() {
    const years = Array.from(new Set([...S.yearOptions(), sel.year])).sort().reverse();
    const c = S.child(sel.child);
    const g = S.gradeFor(c, sel.year);
    const f = st.family;
    const facts = [
      g ? `Grade ${g}` : `<a class="hs-warn-link" href="${ROOT}setup/">Set ${esc(c.first || "the student")}'s grade</a>`,
      c.dob ? `Born ${esc(fmtDate(c.dob))}` : `<a class="hs-warn-link" href="${ROOT}setup/">Add date of birth</a>`,
      f.district ? esc(f.district) : `<a class="hs-warn-link" href="${ROOT}setup/">Add school district</a>`,
    ];
    ctxEl.innerHTML = `
      <div class="hs-context">
        <div class="hs-context-pickers">
          <label class="field"><span>Student</span>
            <select id="hs-child">${kids.map((k) => `<option value="${k.id}"${k.id === sel.child ? " selected" : ""}>${esc(S.fullName(k))}</option>`).join("")}</select>
          </label>
          <label class="field"><span>School year</span>
            <select id="hs-yr">${years.map((y) => `<option value="${y}"${y === sel.year ? " selected" : ""}>${S.yearDisplay(y)}</option>`).join("")}</select>
          </label>
          ${cfg.quarterly ? `
          <div class="field"><span id="hs-q-label">Quarter</span>
            <div class="hs-seg" role="radiogroup" aria-labelledby="hs-q-label">
              ${[1, 2, 3, 4].map((q) => `<button type="button" role="radio" aria-checked="${q === sel.q}" data-q="${q}">Q${q}</button>`).join("")}
            </div>
          </div>` : ""}
        </div>
        <p class="hs-context-facts">${facts.join('<span aria-hidden="true"> · </span>')} <a href="${ROOT}setup/">Edit family details</a></p>
      </div>`;
    $("#hs-child").addEventListener("change", (e) => { sel.child = e.target.value; changed(); });
    $("#hs-yr").addEventListener("change", (e) => { sel.year = e.target.value; changed(); });
    $$("[data-q]", ctxEl).forEach((b) => b.addEventListener("click", () => { sel.q = Number(b.dataset.q); changed(); }));
  }

  function changed() {
    st.settings.lastChild = sel.child;
    S.save();
    const u = new URL(location.href);
    u.searchParams.set("child", sel.child);
    u.searchParams.set("year", sel.year);
    if (cfg.quarterly) u.searchParams.set("q", sel.q); else u.searchParams.delete("q");
    history.replaceState(null, "", u);
    api.files = [];
    drawContext();
    loadDoc();
  }

  function loadDoc() {
    const ctx = api.ctx();
    const rec = S.getDoc(sel.child, sel.year, api.type());
    const def = cfg.defaults(ctx);
    data = rec?.data && Object.keys(rec.data).length ? { ...def, ...clone(rec.data) } : def;
    form.hidden = false;
    api.redraw();
  }

  function fillStatic() {
    $$("[data-k]", form).forEach((el) => setField(el, getPath(data, el.dataset.k)));
  }

  function applyShows() {
    $$("[data-show]", form).forEach((el) => {
      const expr = el.dataset.show;
      let on;
      if (expr.startsWith("q=")) on = expr.slice(2).split(",").map(Number).includes(sel.q);
      else if (expr.includes("=")) { const [k, v] = expr.split("="); on = String(getPath(data, k) ?? "") === v; }
      else if (expr.startsWith("!")) on = !getPath(data, expr.slice(1));
      else on = !!getPath(data, expr);
      el.hidden = !on;
    });
  }

  function onEdit(e) {
    const el = e.target;
    if (el.type === "radio" && !el.checked) return;
    if (el.dataset.k) setPath(data, el.dataset.k, fieldValue(el));
    else if (el.dataset.list) {
      const row = data[el.dataset.list][Number(el.dataset.i)];
      if (row) row[el.dataset.f] = fieldValue(el);
    } else return;
    cfg.onEdit?.(el, data, api);
    applyShows();
    autosize(el);
    if (el.type === "checkbox" || el.type === "radio" || el.tagName === "SELECT") autosizeAll(form);
    api.persist();
  }
  form.addEventListener("input", onEdit);
  form.addEventListener("change", (e) => { if (e.target.type === "checkbox" || e.target.type === "radio" || e.target.tagName === "SELECT") onEdit(e); });

  form.addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]");
    if (!b || !form.contains(b)) return;
    const act = b.dataset.act;
    if (act === "remove-row") {
      data[b.dataset.list].splice(Number(b.dataset.i), 1);
      api.persist(); api.redraw();
    } else if (cfg.actions?.[act]) {
      cfg.actions[act](b, data, api);
    }
  });

  // Sticky bar: file name, preview, download.
  function drawBar() {
    const ctx = api.ctx();
    barEl.innerHTML = `
      <div class="hs-bar-inner">
        <div class="hs-bar-file"><span>PDF file name</span><code>${esc(filename(ctx, api.type(), data))}</code></div>
        <div class="hs-bar-buttons">
          <button class="btn" type="button" data-bar="preview">Preview</button>
          <button class="btn btn-primary" type="button" data-bar="download">Download PDF</button>
        </div>
        <p class="hs-bar-msg" role="status" aria-live="polite"></p>
      </div>`;
  }

  async function make(kind) {
    const msg = $(".hs-bar-msg", barEl);
    msg.textContent = "Building PDF…";
    msg.className = "hs-bar-msg";
    try {
      const { bytes, filename: name } = await build(api.ctx(), api.type(), data, api.files);
      if (kind === "preview") {
        if (!openPreview(bytes)) { msg.textContent = "Your browser blocked the preview window. Use Download instead."; return; }
        msg.textContent = "";
      } else {
        saveFile(bytes, name);
        S.markDoc(sel.child, sel.year, api.type(), { exported: new Date().toISOString() });
        msg.textContent = `Downloaded ${name}`;
        drawFinish();
      }
    } catch (err) {
      console.error(err);
      msg.className = "hs-bar-msg is-error";
      msg.textContent = err.message || "Something went wrong building the PDF.";
    }
  }
  barEl.addEventListener("click", (e) => {
    const b = e.target.closest("[data-bar]");
    if (b) make(b.dataset.bar);
  });

  // Finish card: what's missing, submitted date, example and reset.
  function drawFinish(light) {
    const ctx = api.ctx();
    const rec = S.getDoc(sel.child, sel.year, api.type()) || {};
    const missing = cfg.missing(ctx, data, st.family);
    const missingHtml = missing.length
      ? `<div class="hs-callout hs-callout-warn"><strong>Not filled in yet</strong><ul>${missing.map((m) => `<li>${m}</li>`).join("")}</ul></div>`
      : `<div class="hs-callout hs-callout-ok">Everything this form needs is filled in.</div>`;
    if (light) { const m = $(".hs-missing", finishEl); if (m) { m.innerHTML = missingHtml; return; } }
    const due = dueFor(sel.child, sel.year, api.type());
    finishEl.innerHTML = `
      <section class="hs-card">
        <h2>${esc(docTitle(api.type(), data))}: finish up</h2>
        <div class="hs-missing">${missingHtml}</div>
        <p class="hs-small">PDF file name: <code class="hs-fname">${esc(filename(ctx, api.type(), data))}</code></p>
        <p class="muted">Due ${esc(fmtDate(due))}. Download the PDF, sign it, and send it to your district the way they ask (email, mail or portal).</p>
        <div class="hs-submitted">
          <label class="hs-check"><input type="checkbox" id="hs-sub" ${rec.submitted ? "checked" : ""}> Sent to the district</label>
          <label class="hs-inline" ${rec.submitted ? "" : "hidden"} id="hs-sub-date-wrap">on <input type="date" id="hs-sub-date" value="${esc(rec.submitted || todayISO())}"></label>
        </div>
        ${rec.exported ? `<p class="muted hs-small">Last PDF made ${esc(new Date(rec.exported).toLocaleString())}.</p>` : ""}
        <div class="hs-finish-actions">
          <button class="btn btn-quiet" type="button" id="hs-example">Fill with example text</button>
          <button class="btn btn-quiet" type="button" id="hs-reset">Clear this form</button>
        </div>
      </section>`;
    const sub = $("#hs-sub"), subDate = $("#hs-sub-date");
    const saveSub = () => {
      $("#hs-sub-date-wrap").hidden = !sub.checked;
      S.markDoc(sel.child, sel.year, api.type(), { submitted: sub.checked ? (subDate.value || todayISO()) : null });
    };
    sub.addEventListener("change", saveSub);
    subDate.addEventListener("change", saveSub);
    $("#hs-example").addEventListener("click", () => {
      const filled = Object.values(data).some((v) => typeof v === "string" && v.trim().length > 20);
      if (filled && !confirm("Replace what you've typed with example text?")) return;
      data = { ...data, ...clone(examples[cfg.exampleKey ? cfg.exampleKey(sel, data) : api.type().replace(/^q\d$/, "quarterly")](api.ctx(), data)) };
      api.persist(); api.redraw();
    });
    $("#hs-reset").addEventListener("click", () => {
      if (!confirm("Clear everything on this form? Your family details stay.")) return;
      S.deleteDoc(sel.child, sel.year, api.type());
      api.files = [];
      loadDoc();
    });
  }

  drawContext();
  loadDoc();
}

// Renders a repeating list into a container. tpl(item, i) returns the inner HTML.
function list(host, items, tpl) {
  host.innerHTML = items.map((it, i) => `<div class="hs-row" data-row="${i}">${tpl(it, i)}</div>`).join("");
}
const L = (listName, i, f) => `data-list="${listName}" data-i="${i}" data-f="${f}"`;
const removeBtn = (listName, i, label) => `<button class="hs-x" type="button" data-act="remove-row" data-list="${listName}" data-i="${i}" aria-label="Remove ${esc(label)}">Remove</button>`;

function subjectsFromIHIP(ctx) {
  const ihip = S.getDoc(ctx.child.id, ctx.year, "ihip");
  const list = ihip?.data?.subjects?.filter((s) => s.name);
  if (list?.length) return list.map((s) => s.name);
  return R.SUBJECTS[R.band(ctx.grade || 1)].map((s) => s.name);
}

function assessmentPlanText(ctx, prev) {
  const rule = R.assessmentRule(ctx.grade || 1, prev?.method, prev?.grade);
  if (rule.narrative && Number(ctx.grade) <= 3) return "A written narrative, prepared by an evaluator chosen with the superintendent's consent after interviewing the student and reviewing a portfolio of work, will be filed with the fourth quarterly report.";
  if (rule.narrative && prev?.method === "test") return "A written narrative, prepared by an evaluator chosen with the superintendent's consent after interviewing the student and reviewing a portfolio of work, will be filed with the fourth quarterly report. (A standardized test was used last year.)";
  return "A commercially published norm-referenced achievement test listed in §100.10(h)(1) will be administered in the spring by a qualified person with the superintendent's consent, and the results filed with the fourth quarterly report.";
}

function previousAssessment(ctx) {
  const prevYear = S.yearLabel(S.yearStart(ctx.year) - 1);
  const rec = S.getDoc(ctx.child.id, prevYear, "assessment");
  if (!rec?.data?.method) return null;
  return { method: rec.data.method, grade: S.gradeFor(ctx.child, prevYear) };
}

// ---- letter of intent --------------------------------------------------------

function loiPage() {
  docPage({
    type: () => "loi",
    defaults: () => ({ date: todayISO(), midYear: false, startDate: "", enclosed: false, notes: "" }),
    render(ctx) {
      const f = ctx.family;
      $("#hs-recipient").innerHTML = f.district
        ? `${esc(f.superintendent || "Superintendent of Schools")}<br>${esc(f.district)}${f.districtStreet ? "<br>" + esc(f.districtStreet) : ""}${f.districtCity ? "<br>" + esc(f.districtCity) : ""}`
        : `<a href="${ROOT}setup/">Add your school district and superintendent</a>`;
    },
    missing(ctx, d, f) {
      const m = [];
      if (!f.parents) m.push(`Parent or guardian name (<a href="${ROOT}setup/">family setup</a>)`);
      if (!f.street) m.push(`Home address (<a href="${ROOT}setup/">family setup</a>)`);
      if (!f.district) m.push(`School district (<a href="${ROOT}setup/">family setup</a>)`);
      if (!ctx.child.dob) m.push("Student's date of birth");
      if (!ctx.grade) m.push("Student's grade");
      if (!d.date) m.push("Date of the letter");
      if (d.midYear && !d.startDate) m.push("Date home instruction begins");
      return m;
    },
  });
}

// ---- IHIP ---------------------------------------------------------------------

function ihipDefaults(ctx) {
  const b = R.band(ctx.grade || 1);
  const loi = S.getDoc(ctx.child.id, ctx.year, "loi");
  const dues = [1, 2, 3, 4].map((q) => S.quarterDue(ctx.year, q));
  return {
    date: todayISO(),
    loiDate: loi?.submitted || loi?.data?.date || "",
    instructors: ctx.family.instructors || ctx.family.parents || "",
    quarters: dues.map((due) => ({ from: "", to: "", due })),
    schedule: "",
    band: b,
    subjects: R.SUBJECTS[b].map((s) => ({ name: s.name, note: s.note || "", required: true, materials: "" })),
    other: R.OTHER_REQUIRED.map((o) => ({ ...o })),
    once: R.ONCE_1_8.map((name) => ({ name, status: "" })),
    assessmentPlan: assessmentPlanText(ctx, previousAssessment(ctx)),
    notes: "",
  };
}

function ihipPage() {
  docPage({
    type: () => "ihip",
    defaults: ihipDefaults,
    render(ctx, d) {
      const b = R.band(ctx.grade || 1);
      const bandNote = $("#hs-band-note");
      bandNote.innerHTML = d.band && d.band !== b
        ? `<div class="hs-callout hs-callout-warn">These subjects are for grades ${d.band.replace("-", "–")}, but ${esc(ctx.child.first)} is in grade ${ctx.grade}. <button class="btn btn-quiet" type="button" data-act="reset-subjects">Switch to the grade ${b.replace("-", "–")} subjects</button></div>`
        : `<p class="muted">Required for grades ${b.replace("-", "–")}: at least ${R.requiredHours(ctx.grade || 1)} hours of instruction a year. List the books, programs, courses and activities for each subject, one per line.</p>`;
      list($("#hs-quarters"), d.quarters, (q, i) => `
        <span class="hs-row-label">Quarter ${i + 1}${R.QUARTER_NOTES[i + 1] ? `<small>${R.QUARTER_NOTES[i + 1]}</small>` : ""}</span>
        <label class="field"><span>Period starts</span><input type="date" ${L("quarters", i, "from")} value="${esc(q.from)}"></label>
        <label class="field"><span>Period ends</span><input type="date" ${L("quarters", i, "to")} value="${esc(q.to)}"></label>
        <label class="field"><span>Report due</span><input type="date" ${L("quarters", i, "due")} value="${esc(q.due)}"></label>`);
      list($("#hs-subjects"), d.subjects, (s, i) => `
        <div class="hs-subject-head">
          ${s.required
            ? `<h3>${esc(s.name)}${s.note ? `<small>${esc(s.note)}</small>` : ""}</h3>`
            : `<label class="field hs-grow"><span>Subject</span><input ${L("subjects", i, "name")} value="${esc(s.name)}" placeholder="e.g. Spanish, ESL, Bilingual Education"></label>${removeBtn("subjects", i, s.name || "subject")}`}
        </div>
        <label class="field"><span class="visually-hidden">${esc(s.name)} materials</span>
          <textarea rows="3" ${L("subjects", i, "materials")} placeholder="Curriculum, textbooks, programs or plan of instruction, one per line">${esc(s.materials)}</textarea>
        </label>`);
      list($("#hs-other"), d.other, (o, i) => `
        <span class="hs-row-label">${esc(o.name)}<small>${esc(o.law)}</small></span>
        <label class="field hs-grow"><span>Where it's taught</span><input ${L("other", i, "where")} value="${esc(o.where)}"></label>`);
      $("#hs-once-wrap").hidden = Number(ctx.grade) > 8;
      list($("#hs-once"), d.once, (o, i) => `
        <span class="hs-row-label">${esc(o.name)}</span>
        <label class="field hs-grow"><span>When</span><input ${L("once", i, "status")} value="${esc(o.status)}" placeholder="e.g. This year, in U.S. History / Covered in grade 4"></label>`);
    },
    actions: {
      "add-subject"(b, d, api) {
        d.subjects.push({ name: "", note: "", required: false, materials: "" });
        api.persist(); api.redraw();
        $$('#hs-subjects [data-f="name"]').pop()?.focus();
      },
      "reset-subjects"(b, d, api) {
        const ctx = api.ctx();
        const fresh = ihipDefaults(ctx);
        const old = new Map(d.subjects.map((s) => [s.name, s.materials]));
        d.band = fresh.band;
        d.subjects = [
          ...fresh.subjects.map((s) => ({ ...s, materials: old.get(s.name) || "" })),
          ...d.subjects.filter((s) => !s.required),
        ];
        api.persist(); api.redraw();
      },
      "suggest-plan"(b, d, api) {
        d.assessmentPlan = assessmentPlanText(api.ctx(), previousAssessment(api.ctx()));
        api.persist(); api.redraw();
      },
    },
    missing(ctx, d, f) {
      const m = [];
      if (!f.parents) m.push(`Parent or guardian name (<a href="${ROOT}setup/">family setup</a>)`);
      if (!f.street) m.push(`Home address (<a href="${ROOT}setup/">family setup</a>)`);
      if (!ctx.child.dob) m.push("Student's date of birth");
      if (!ctx.grade) m.push("Student's grade");
      if (!d.instructors) m.push("Who is providing instruction");
      d.quarters.forEach((q, i) => { if (!q.due) m.push(`Quarter ${i + 1} report due date`); });
      const empty = d.subjects.filter((s) => s.name && !String(s.materials).trim()).map((s) => esc(s.name));
      if (empty.length) m.push(`Materials for: ${empty.join(", ")}`);
      return m;
    },
  });
}

// ---- quarterly report -----------------------------------------------------------

function priorHours(ctx, q) {
  let sum = 0, found = 0;
  for (let i = 1; i < q; i++) {
    const rec = S.getDoc(ctx.child.id, ctx.year, `q${i}`);
    const h = Number(rec?.data?.hours);
    if (h) { sum += h; found++; }
  }
  return { sum, found };
}

function quarterlyPage() {
  docPage({
    quarterly: true,
    defaultQ() {
      // Open on the next quarter that's due.
      const today = todayISO();
      const dues = [1, 2, 3, 4].map((q) => S.quarterDue(S.load().settings.year, q));
      const i = dues.findIndex((d) => d >= today);
      return i === -1 ? 4 : i + 1;
    },
    type: (sel) => `q${sel.q}`,
    defaults(ctx) {
      const ihip = S.getDoc(ctx.child.id, ctx.year, "ihip")?.data;
      const qi = ctx.q - 1;
      const period = ihip?.quarters?.[qi] || {};
      return {
        date: todayISO(),
        from: period.from || "",
        to: period.to || "",
        due: period.due || S.quarterDue(ctx.year, ctx.q),
        hours: "",
        hoursPrior: ctx.q > 1 ? String(priorHours(ctx, ctx.q).sum || "") : "0",
        subjects: subjectsFromIHIP(ctx).map((name) => ({ name, covered: "", grade: "", under80: false, explanation: "" })),
        assessmentPlan: ctx.q === 3 ? (ihip?.assessmentPlan || assessmentPlanText(ctx, previousAssessment(ctx))) : "",
        assessmentNote: ctx.q === 4 ? "The annual assessment is filed with this report." : "",
        notes: "",
      };
    },
    render(ctx, d) {
      const req = R.requiredHours(ctx.grade || 1);
      const p = priorHours(ctx, ctx.q);
      const ytd = (Number(d.hours) || 0) + (Number(d.hoursPrior) || 0);
      $("#hs-hours-note").innerHTML = `Year to date: <strong>${ytd.toLocaleString()}</strong> of ${req} hours required for grade ${ctx.grade || "?"}.` +
        (ctx.q > 1 ? ` ${p.found ? `Your saved Q1–Q${ctx.q - 1} reports add up to ${p.sum.toLocaleString()} hours.` : "No earlier quarterly reports are saved here, so enter the hours already reported."}` : "");
      $("#hs-prior-wrap").hidden = ctx.q === 1;
      list($("#hs-subjects"), d.subjects, (s, i) => `
        <div class="hs-subject-head">
          <label class="field hs-grow"><span>Subject</span><input ${L("subjects", i, "name")} value="${esc(s.name)}"></label>
          <label class="field hs-grade"><span>Grade / evaluation</span><input ${L("subjects", i, "grade")} value="${esc(s.grade)}" list="hs-grade-list" placeholder="e.g. 94%, A, Pass"></label>
          ${removeBtn("subjects", i, s.name || "subject")}
        </div>
        <label class="field"><span>Material covered this quarter</span>
          <textarea rows="3" ${L("subjects", i, "covered")} placeholder="Units, chapters, lessons, books, projects, one per line">${esc(s.covered)}</textarea>
        </label>
        <label class="hs-check"><input type="checkbox" ${L("subjects", i, "under80")} ${s.under80 ? "checked" : ""}> Less than 80% of the material planned for this quarter was covered</label>
        <label class="field" ${s.under80 ? "" : "hidden"} data-under80="${i}"><span>Explanation</span>
          <textarea rows="2" ${L("subjects", i, "explanation")} placeholder="Why, and how it will be made up">${esc(s.explanation)}</textarea>
        </label>`);
    },
    onEdit(el, d, api) {
      if (el.dataset.f === "under80") {
        const box = $(`[data-under80="${el.dataset.i}"]`);
        if (box) box.hidden = !el.checked;
      }
      if (el.dataset.k === "hours" || el.dataset.k === "hoursPrior") {
        const ytd = (Number(d.hours) || 0) + (Number(d.hoursPrior) || 0);
        const strong = $("#hs-hours-note strong");
        if (strong) strong.textContent = ytd.toLocaleString();
      }
    },
    actions: {
      "add-subject"(b, d, api) {
        d.subjects.push({ name: "", covered: "", grade: "", under80: false, explanation: "" });
        api.persist(); api.redraw();
        $$('#hs-subjects [data-f="name"]').pop()?.focus();
      },
      "subjects-from-ihip"(b, d, api) {
        const names = subjectsFromIHIP(api.ctx());
        const old = new Map(d.subjects.map((s) => [s.name, s]));
        d.subjects = names.map((name) => old.get(name) || { name, covered: "", grade: "", under80: false, explanation: "" });
        api.persist(); api.redraw();
      },
      "prior-from-saved"(b, d, api) {
        d.hoursPrior = String(priorHours(api.ctx(), api.sel.q).sum || 0);
        api.persist(); api.redraw();
      },
    },
    missing(ctx, d, f) {
      const m = [];
      if (!f.parents) m.push(`Parent or guardian name (<a href="${ROOT}setup/">family setup</a>)`);
      if (!ctx.grade) m.push("Student's grade");
      if (!d.hours) m.push("Hours of instruction this quarter");
      if (!d.from || !d.to) m.push("Reporting period dates");
      const s = d.subjects.filter((x) => x.name);
      const noCover = s.filter((x) => !String(x.covered).trim()).map((x) => esc(x.name));
      const noGrade = s.filter((x) => !String(x.grade).trim()).map((x) => esc(x.name));
      const noWhy = s.filter((x) => x.under80 && !String(x.explanation).trim()).map((x) => esc(x.name));
      if (noCover.length) m.push(`Material covered for: ${noCover.join(", ")}`);
      if (noGrade.length) m.push(`Grade or evaluation for: ${noGrade.join(", ")}`);
      if (noWhy.length) m.push(`Explanation for less than 80% in: ${noWhy.join(", ")}`);
      return m;
    },
  });
}

// ---- annual assessment ------------------------------------------------------------

function assessmentPage() {
  docPage({
    type: () => "assessment",
    exampleKey: (sel, d) => (d.method === "test" ? "test" : "narrative"),
    defaults(ctx) {
      const prev = previousAssessment(ctx);
      const rule = R.assessmentRule(ctx.grade || 1, prev?.method, prev?.grade);
      return {
        method: rule.narrative && Number(ctx.grade) <= 3 ? "narrative" : (rule.narrative && prev?.method === "test" ? "narrative" : "test"),
        lastMethod: prev?.method || "",
        lastGrade: prev?.grade || "",
        date: todayISO(),
        evaluator: "", evaluatorType: R.EVALUATOR_TYPES[0], credential: "", reviewDate: "", reviewMethod: "Interview with the student and review of a portfolio of the student's work",
        summary: "",
        subjects: subjectsFromIHIP(ctx).map((name) => ({ name, progress: "" })),
        adequate: "yes",
        testName: "", testLevel: "", testDate: "", testDateEnd: "", administrator: "", administratorType: R.ADMINISTRATOR_TYPES[2],
        scores: [
          { area: "Reading", score: "", percentile: "" },
          { area: "Language", score: "", percentile: "" },
          { area: "Mathematics", score: "", percentile: "" },
        ],
        composite: "", growth: false, growthNote: "",
        notes: "",
      };
    },
    render(ctx, d, api) {
      const prevGrade = d.lastGrade || String(Number(ctx.grade) - 1);
      const rule = R.assessmentRule(ctx.grade || 1, d.lastMethod, prevGrade);
      $("#hs-rule").innerHTML = `<div class="hs-callout ${!rule.narrative && d.method === "narrative" ? "hs-callout-warn" : ""}">${esc(rule.text)}${!rule.narrative && d.method === "narrative" ? " <strong>A narrative isn't accepted this year.</strong>" : ""}</div>`;
      $("#hs-last-wrap").hidden = !(Number(ctx.grade) >= 4 && Number(ctx.grade) <= 8);
      list($("#hs-n-subjects"), d.subjects, (s, i) => `
        <div class="hs-subject-head">
          <label class="field hs-grow"><span>Subject</span><input ${L("subjects", i, "name")} value="${esc(s.name)}"></label>
          ${removeBtn("subjects", i, s.name || "subject")}
        </div>
        <label class="field"><span class="visually-hidden">Progress in ${esc(s.name)}</span>
          <textarea rows="2" ${L("subjects", i, "progress")} placeholder="What the student learned and can now do">${esc(s.progress)}</textarea>
        </label>`);
      list($("#hs-scores"), d.scores, (s, i) => `
        <label class="field hs-grow"><span>Area or subtest</span><input ${L("scores", i, "area")} value="${esc(s.area)}"></label>
        <label class="field"><span>Score</span><input ${L("scores", i, "score")} value="${esc(s.score)}" placeholder="e.g. GE 6.4, SS 215"></label>
        <label class="field"><span>National percentile</span><input ${L("scores", i, "percentile")} value="${esc(s.percentile)}" inputmode="numeric"></label>
        ${removeBtn("scores", i, s.area || "score")}`);
      drawFiles(api);
    },
    onEdit(el, d, api) {
      if (el.dataset.k === "method" || el.dataset.k === "lastMethod") api.redraw();
    },
    actions: {
      "add-score"(b, d, api) { d.scores.push({ area: "", score: "", percentile: "" }); api.persist(); api.redraw(); },
      "add-subject"(b, d, api) { d.subjects.push({ name: "", progress: "" }); api.persist(); api.redraw(); },
      "subjects-from-ihip"(b, d, api) {
        const old = new Map(d.subjects.map((s) => [s.name, s]));
        d.subjects = subjectsFromIHIP(api.ctx()).map((name) => old.get(name) || { name, progress: "" });
        api.persist(); api.redraw();
      },
      "remove-file"(b, d, api) { api.files.splice(Number(b.dataset.i), 1); drawFiles(api); api.refresh(); },
    },
    missing(ctx, d, f) {
      const m = [];
      if (!f.parents) m.push(`Parent or guardian name (<a href="${ROOT}setup/">family setup</a>)`);
      if (!ctx.grade) m.push("Student's grade");
      if (d.method === "narrative") {
        const rule = R.assessmentRule(ctx.grade || 1, d.lastMethod, d.lastGrade || String(Number(ctx.grade) - 1));
        if (!rule.narrative) m.push("A standardized test is required this year, not a narrative");
        if (!d.evaluator) m.push("Evaluator's name");
        if (!d.reviewDate) m.push("Date of evaluation");
        if (!String(d.summary).trim()) m.push("Summary of the year");
      } else {
        if (!d.testName) m.push("Name of the test");
        if (!d.testDate) m.push("Date administered");
        if (!d.administrator) m.push("Who administered the test");
        if (!d.composite) m.push("Composite percentile");
        if (!api_files_count()) m.push("Score report upload (optional, but most districts want it)");
      }
      return m;
    },
  });

  // The file input lives outside the saved data: uploads stay in memory only.
  const input = $("#hs-files");
  input?.addEventListener("change", () => {
    const api = currentApi;
    api.files.push(...input.files);
    input.value = "";
    drawFiles(api);
    api.refresh();
  });
}

let currentApi = null;
function api_files_count() { return currentApi ? currentApi.files.length : 0; }
function drawFiles(api) {
  currentApi = api;
  const host = $("#hs-file-list");
  if (!host) return;
  host.innerHTML = api.files.length
    ? `<ul class="hs-files">${api.files.map((f, i) => `<li><span>${esc(f.name)}</span><small>${Math.max(1, Math.round(f.size / 1024))} KB</small><button class="hs-x" type="button" data-act="remove-file" data-i="${i}">Remove</button></li>`).join("")}</ul>`
    : `<p class="muted hs-small">No files added yet.</p>`;
}

// ---- boot ----------------------------------------------------------------------------

const PAGES = { hub, setup, loi: loiPage, ihip: ihipPage, quarterly: quarterlyPage, assessment: assessmentPage };
const which = document.querySelector("[data-hs-page]")?.dataset.hsPage;
if (PAGES[which]) PAGES[which]();
