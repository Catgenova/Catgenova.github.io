// Builds each required document in the shared house style (pdf.js) and
// names the file using one convention:
//
//   {school year}_{Last}-{First}_Gr{grade}_{##}-{Document}.pdf
//   2026-27_Rivera-Mila_Gr5_03-Q1-Quarterly-Report.pdf
//
// The two-digit number puts a year's files in filing order: letter of intent,
// IHIP, four quarterly reports, then the annual assessment.

import { Report, fmtDate, clean, readAttachments, appendAttachments } from "./pdf.js";
import { REG, REG_LONG, requiredHours, TEST_STANDARD, QUARTER_NOTES } from "./rules.js";
import { yearDisplay, fullName } from "./store.js";

export const DOCS = {
  loi:        { seq: "01", code: "Letter-of-Intent",   name: "Letter of Intent",                            short: "Letter of Intent" },
  ihip:       { seq: "02", code: "IHIP",               name: "Individualized Home Instruction Plan (IHIP)", short: "IHIP" },
  q1:         { seq: "03", code: "Q1-Quarterly-Report", name: "Quarterly Report — Quarter 1",               short: "Q1 Quarterly Report" },
  q2:         { seq: "04", code: "Q2-Quarterly-Report", name: "Quarterly Report — Quarter 2",               short: "Q2 Quarterly Report" },
  q3:         { seq: "05", code: "Q3-Quarterly-Report", name: "Quarterly Report — Quarter 3",               short: "Q3 Quarterly Report" },
  q4:         { seq: "06", code: "Q4-Quarterly-Report", name: "Quarterly Report — Quarter 4",               short: "Q4 Quarterly Report" },
  assessment: { seq: "07", code: "Annual-Assessment",  name: "Annual Assessment",                           short: "Annual Assessment" },
};

const ASSESS_NAME = { narrative: "Written Narrative", test: "Standardized Test Results" };

function slug(s) {
  return clean(s).normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/['’]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "Student";
}

export function docTitle(type, data = {}) {
  if (type === "assessment" && data.method) return `Annual Assessment — ${ASSESS_NAME[data.method]}`;
  return DOCS[type].name;
}

export function filename(ctx, type, data = {}) {
  const d = DOCS[type];
  let code = d.code;
  if (type === "assessment" && data.method) code += data.method === "test" ? "-Test" : "-Narrative";
  const g = ctx.grade ? `_Gr${ctx.grade}` : "";
  return `${ctx.year}_${slug(ctx.child.last)}-${slug(ctx.child.first)}${g}_${d.seq}-${code}.pdf`;
}

function addressLines(f) {
  const cityLine = [f.city, [f.state, f.zip].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  return [f.street, cityLine].filter(Boolean);
}

function ageOn(dob, iso) {
  if (!dob || !iso) return "";
  const [by, bm, bd] = dob.split("-").map(Number);
  const [y, m, d] = iso.split("-").map(Number);
  let age = y - by;
  if (m < bm || (m === bm && d < bd)) age--;
  return age >= 0 ? String(age) : "";
}

// Splits "Pat Doe & Sam Doe" into signers.
// Always at least one line, blank if no parent name is set.
function signers(parents) {
  const names = clean(parents).split(/\s*(?:&|\band\b|,|;|\/)\s*/i).map((s) => s.trim()).filter(Boolean);
  return names.length ? names : [""];
}

function lines(text) {
  return clean(text).split("\n").map((l) => l.replace(/^\s*[-*•]\s*/, "").trim()).filter(Boolean);
}
function bulleted(text) {
  const l = lines(text);
  return l.length > 1 ? l.map((x) => "• " + x).join("\n") : l.join("");
}

function start(ctx, type, data) {
  const name = fullName(ctx.child);
  const yd = yearDisplay(ctx.year);
  const title = docTitle(type, data);
  const short = type === "assessment" && data.method ? `Annual Assessment (${data.method === "test" ? "Test" : "Narrative"})` : DOCS[type].short;
  const gradeTxt = ctx.grade ? `Grade ${ctx.grade}` : "";
  return new Report({
    title,
    subtitle: [name, gradeTxt, `School Year ${yd}`].filter(Boolean).join("  ·  "),
    eyebrowRight: ctx.family.district ? `Submitted to ${ctx.family.district}` : "",
    runningHead: `${name} — ${short} — ${yd}`,
    footerLeft: `${[ctx.child.last, ctx.child.first].filter(Boolean).join(", ")}  ·  ${gradeTxt ? gradeTxt + "  ·  " : ""}${short}  ·  ${yd}`,
    meta: {
      title: `${title} — ${name}${gradeTxt ? ", " + gradeTxt : ""}, ${yd}`,
      author: ctx.family.parents,
    },
  });
}

function studentGrid(r, ctx, extra = [], { date } = {}) {
  const f = ctx.family;
  r.infoGrid([
    { label: "Student", value: fullName(ctx.child) },
    { label: "Date of birth", value: fmtDate(ctx.child.dob) + (date && ctx.child.dob ? `  (age ${ageOn(ctx.child.dob, date)})` : "") },
    { label: "Grade level", value: ctx.grade ? `Grade ${ctx.grade}` : "" },
    { label: "School year", value: yearDisplay(ctx.year) },
    { label: "Parent / guardian", value: f.parents },
    { label: "Address", value: addressLines(f).join(", ") },
    ...extra,
  ]);
}

// ---- Letter of intent ------------------------------------------------------

function buildLOI(ctx, d) {
  const f = ctx.family;
  const r = start(ctx, "loi", d);
  const yd = yearDisplay(ctx.year);
  const name = fullName(ctx.child);

  r.addressBlock([fmtDate(d.date)], { after: 10 });
  r.addressBlock([
    f.superintendent || "Superintendent of Schools",
    f.superintendent ? "Superintendent of Schools" : "",
    f.district,
    f.districtStreet,
    f.districtCity,
  ]);
  r.paragraph(`Re: Notice of intent to provide home instruction, ${yd} school year`, { style: "bold" });
  r.paragraph(`Dear ${f.superintendent || "Superintendent"}:`);

  const when = d.midYear && d.startDate
    ? `beginning ${fmtDate(d.startDate)}, for the remainder of the ${yd} school year`
    : `for the ${yd} school year`;
  r.paragraph(`In accordance with ${REG_LONG}, please accept this letter as written notice that I intend to provide home instruction for my child, ${name}, ${when}.`);

  studentGrid(r, ctx, [
    { label: "Phone", value: f.phone },
    { label: "Email", value: f.email },
  ], { date: d.date });

  if (d.enclosed) {
    r.paragraph("My Individualized Home Instruction Plan (IHIP) is enclosed.");
  } else {
    r.paragraph("Please send me a copy of Section 100.10 and the district's IHIP form. I will file the Individualized Home Instruction Plan by August 15 or within four weeks of receiving the form, whichever is later.");
  }
  if (d.notes) r.paragraph(d.notes);
  r.paragraph("Thank you,", { after: 2 });

  r.signatures(signers(f.parents).map((n) => ({ name: n, label: "Parent / Guardian", date: d.date })));
  return r;
}

// ---- IHIP ------------------------------------------------------------------

function buildIHIP(ctx, d) {
  const f = ctx.family;
  const r = start(ctx, "ihip", d);
  const hours = requiredHours(ctx.grade || 1);

  studentGrid(r, ctx, [
    { label: "Individuals providing instruction", value: d.instructors || f.instructors || f.parents, span: 2 },
    { label: "Letter of intent submitted", value: d.loiDate ? fmtDate(d.loiDate) : (d.loiSubmitted ? "Yes" : "") },
    { label: "Date of this plan", value: fmtDate(d.date) },
  ], { date: d.date });

  r.section("Quarterly report schedule");
  r.table({
    head: ["Quarter", "Instruction period", "Report due", "Notes"],
    rows: (d.quarters || []).map((q, i) => [
      `Quarter ${i + 1}`,
      q.from && q.to ? `${fmtDate(q.from, "short")} – ${fmtDate(q.to, "short")}` : "",
      fmtDate(q.due),
      QUARTER_NOTES[i + 1] || "",
    ]),
    widths: [70, 140, 110, 184],
  });

  r.section("Instructional time");
  r.paragraph(`Instruction will total at least ${hours} hours over the school year, on the substantial equivalent of 180 days, as required for grade ${ctx.grade || "level"} students (§100.10(f)). Attendance records are kept and are available to the district on request, and hours are reported each quarter.`);
  if (d.schedule) r.paragraph(d.schedule);

  r.section("Required courses", "Syllabi, curriculum materials, textbooks or plan of instruction");
  r.table({
    head: ["Subject", "Curriculum, materials and plan of instruction"],
    rows: (d.subjects || []).filter((s) => s.name).map((s) => [
      s.note ? { text: s.name, note: s.note } : s.name,
      bulleted(s.materials) || "—",
    ]),
    widths: [150, 354],
  });

  if ((d.other || []).length) {
    r.section("Other required instruction", "Education Law");
    r.table({
      head: ["Topic", "Where it is taught"],
      rows: d.other.map((o) => [{ text: o.name, note: o.law }, o.where || "—"]),
      widths: [210, 294],
    });
  }

  if (Number(ctx.grade) <= 8 && (d.once || []).length) {
    r.section("Taught at least once in grades 1–8");
    r.table({
      head: ["Course", "When it is or was taught"],
      rows: d.once.map((o) => [o.name, o.status || "—"]),
      widths: [250, 254],
    });
  }

  r.section("Annual assessment plan");
  r.paragraph(d.assessmentPlan || "To be confirmed with the third quarterly report.");

  if (d.notes) { r.section("Additional notes"); r.paragraph(d.notes); }

  r.signatures(signers(f.parents).map((n) => ({ name: n, label: "Parent / Guardian", date: d.date })));
  return r;
}

// ---- Quarterly report ------------------------------------------------------

function buildQuarterly(ctx, type, d) {
  const f = ctx.family;
  const q = Number(type.slice(1));
  const r = start(ctx, type, d);
  const required = requiredHours(ctx.grade || 1);
  const qh = Number(d.hours) || 0;
  const ytd = qh + (Number(d.hoursPrior) || 0);

  studentGrid(r, ctx, [
    { label: "Reporting period", value: d.from && d.to ? `${fmtDate(d.from)} – ${fmtDate(d.to)}` : "" },
    { label: "Report due", value: fmtDate(d.due) },
    { label: "Hours of instruction this quarter", value: d.hours ? `${qh.toLocaleString()} hours` : "" },
    { label: "Hours year to date", value: d.hours && (q === 1 || String(d.hoursPrior ?? "").trim() !== "") ? `${ytd.toLocaleString()} of ${required} required` : "" },
  ]);

  r.section("Subjects", "Material covered and evaluation");
  const subjects = (d.subjects || []).filter((s) => s.name);
  r.table({
    head: ["Subject", "Material covered this quarter", "Grade / evaluation"],
    rows: subjects.map((s) => [s.name, bulleted(s.covered) || "—", s.grade || "—"]),
    widths: [118, 296, 90],
  });

  const short = subjects.filter((s) => s.under80);
  r.section("Coverage of planned material");
  if (short.length) {
    r.paragraph("Less than 80 percent of the material planned in the IHIP for this quarter was covered in the following subjects:");
    r.table({
      head: ["Subject", "Explanation"],
      rows: short.map((s) => [s.name, s.explanation || "—"]),
      widths: [150, 354],
    });
  } else {
    r.check(true, "At least 80 percent of the material planned in the IHIP for this quarter was covered in every subject.");
    r.space(6);
  }

  if (q === 3) {
    r.section("Plan for the annual assessment");
    r.paragraph(d.assessmentPlan || "—");
  }
  if (q === 4) {
    r.section("Annual assessment");
    r.paragraph(d.assessmentNote || "The annual assessment is filed with this report.");
  }
  if (d.notes) { r.section("Comments"); r.paragraph(d.notes); }

  r.signatures(signers(f.parents).map((n) => ({ name: n, label: "Parent / Guardian", date: d.date })));
  return r;
}

// ---- Annual assessment -----------------------------------------------------

function buildNarrative(ctx, d) {
  const r = start(ctx, "assessment", d);
  studentGrid(r, ctx, [
    { label: "Evaluator", value: d.evaluator },
    { label: "Evaluator qualification", value: [d.evaluatorType, d.credential].filter(Boolean).join(" — ") },
    { label: "Date of evaluation", value: fmtDate(d.reviewDate) },
    { label: "Evidence reviewed", value: d.reviewMethod },
  ]);

  r.section("Summary of the year");
  r.paragraph(d.summary || "—");

  const subjects = (d.subjects || []).filter((s) => s.name);
  if (subjects.length) {
    r.section("Progress by subject");
    r.table({
      head: ["Subject", "Progress observed"],
      rows: subjects.map((s) => [s.name, s.progress || "—"]),
      widths: [140, 364],
    });
  }

  r.section("Certification");
  r.paragraph(`I have interviewed ${fullName(ctx.child)} and reviewed a portfolio of the student's work for the ${yearDisplay(ctx.year)} school year, and I certify that:`);
  r.check(d.adequate !== "no", "The student has made adequate academic progress.");
  r.check(d.adequate === "no", "The student has failed to make adequate academic progress.");
  r.space(4);
  r.paragraph(`Written narrative prepared under ${REG}(h)(2) by an evaluator chosen by the parent with the superintendent's consent, and filed as the annual assessment with the fourth quarterly report.`, { size: 9, color: [92, 100, 116] });
  if (d.notes) { r.section("Comments"); r.paragraph(d.notes); }

  r.signatures([
    { name: d.evaluator, label: d.evaluatorType || "Evaluator", date: d.reviewDate },
    // A parent who is also the evaluator signs once.
    ...signers(ctx.family.parents)
      .filter((n) => !n || n.toLowerCase() !== clean(d.evaluator).trim().toLowerCase())
      .map((n) => ({ name: n, label: "Parent / Guardian", date: d.date })),
  ]);
  return r;
}

function buildTest(ctx, d, attachments) {
  const r = start(ctx, "assessment", d);
  studentGrid(r, ctx, [
    { label: "Test", value: [d.testName, d.testLevel].filter(Boolean).join(", ") },
    { label: "Date(s) administered", value: d.testDate ? fmtDate(d.testDate) + (d.testDateEnd ? ` – ${fmtDate(d.testDateEnd)}` : "") : "" },
    { label: "Administered by", value: d.administrator },
    { label: "Administrator qualification", value: d.administratorType },
  ]);

  const scores = (d.scores || []).filter((s) => s.area);
  if (scores.length) {
    r.section("Scores");
    r.table({
      head: ["Area", "Score", "National percentile"],
      rows: scores.map((s) => [s.area, s.score || "—", s.percentile || "—"]),
      widths: [234, 140, 130],
    });
  }

  r.section("Result");
  const pct = Number(String(d.composite || "").replace(/[^\d.]/g, ""));
  r.infoGrid([
    { label: "Composite national percentile", value: d.composite ? `${d.composite}` : "" },
    { label: "Standard", value: "Above the 33rd percentile, or one year of growth" },
  ]);
  const meetsPct = pct > 33;
  r.check(meetsPct, "The composite score is above the 33rd percentile on national norms.");
  r.check(!meetsPct && !!d.growth, `The results show at least one academic year of growth compared with the prior test${d.growthNote ? ` (${d.growthNote})` : ""}.`);
  r.space(4);
  r.paragraph(`Under ${REG}(h)(1)(v), a score is adequate if the composite is ${TEST_STANDARD}. Individual subtest scores are not used to decide adequacy.`, { size: 9, color: [92, 100, 116] });

  if (attachments.length) {
    r.section("Attached score reports");
    r.bullets(attachments.map((a, i) => `Attachment ${String.fromCharCode(65 + i)}: ${a.name} (${a.pages} page${a.pages === 1 ? "" : "s"})`));
  }
  if (d.notes) { r.section("Comments"); r.paragraph(d.notes); }

  r.signatures(signers(ctx.family.parents).map((n) => ({ name: n, label: "Parent / Guardian", date: d.date })));
  return r;
}

// ---- entry point -----------------------------------------------------------

// Returns { bytes, filename }.
export async function build(ctx, type, data, files = []) {
  let r;
  let attachments = [];
  if (type === "loi") r = buildLOI(ctx, data);
  else if (type === "ihip") r = buildIHIP(ctx, data);
  else if (/^q[1-4]$/.test(type)) r = buildQuarterly(ctx, type, data);
  else if (type === "assessment") {
    if (data.method === "test") {
      attachments = files.length ? await readAttachments(files) : [];
      r = buildTest(ctx, data, attachments);
    } else {
      r = buildNarrative(ctx, data);
    }
  }
  const extra = attachments.reduce((n, a) => n + a.pages, 0);
  r.finish(extra);
  const bytes = attachments.length
    ? await appendAttachments(r, attachments, (a, i) => `Attachment ${String.fromCharCode(65 + i)}: ${clean(a.name)}`)
    : r.bytes();
  return { bytes, filename: filename(ctx, type, data) };
}
