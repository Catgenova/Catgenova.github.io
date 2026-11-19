// The house style every homeschooling PDF shares: US Letter, a masthead with
// the document title, a bordered information grid, numbered section heads,
// navy-headed tables, signature lines, and a running header and footer with
// "Page X of Y" on every page (attachments included).
//
// Built on jsPDF + AutoTable (lib/). pdf-lib is used only to append
// uploaded score reports.

import { REG } from "./rules.js";

const PAGE = { w: 612, h: 792, ml: 54, mr: 54, mt: 50, mb: 66 };
const CW = PAGE.w - PAGE.ml - PAGE.mr;
const CONT_TOP = 80;
const C = {
  ink: [24, 30, 42],
  muted: [92, 100, 116],
  line: [200, 206, 216],
  navy: [28, 54, 92],
  fill: [244, 246, 249],
  stripe: [248, 249, 251],
};

// Standard PDF fonts only cover Windows-1252. Map everything else to the
// nearest thing they can draw, so a pasted emoji can't corrupt a page.
const CP1252_EXTRA = "€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ";
export function clean(value) {
  const s = String(value ?? "").normalize("NFC").replace(/\r\n?/g, "\n").replace(/\t/g, "  ");
  let out = "";
  for (const ch of s) {
    const code = ch.codePointAt(0);
    if (code < 256 || CP1252_EXTRA.includes(ch)) { out += ch; continue; }
    if (ch === "−" || ch === "‐" || ch === "‑") { out += "-"; continue; }
    if (ch === "✓" || ch === "✔") { out += "x"; continue; }
    const stripped = ch.normalize("NFKD").replace(/[̀-ͯ]/g, "");
    out += [...stripped].every((c) => c.codePointAt(0) < 256) ? stripped : "";
  }
  return out;
}

export function fmtDate(iso, style = "long") {
  if (!iso) return "";
  const [y, m, d] = String(iso).slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return String(iso);
  const dt = new Date(y, m - 1, d);
  return style === "short"
    ? dt.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" })
    : dt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function autoTable(doc, opts) {
  const plugin = window.jspdf_autotable;
  if (plugin && typeof plugin.autoTable === "function") return plugin.autoTable(doc, opts);
  if (plugin && typeof plugin.default === "function") return plugin.default(doc, opts);
  return doc.autoTable(opts);
}

export class Report {
  // title: "Quarterly Report — Quarter 3"
  // subtitle: "Mila Rivera · Grade 5 · School Year 2026–27"
  // runningHead: shown top-left of pages 2+, footerLeft: bottom-left of every page
  constructor({ title, subtitle, eyebrowRight = "", runningHead, footerLeft, meta = {} }) {
    if (!window.jspdf) throw new Error("The PDF library didn't load. Check your connection and reload the page.");
    this.doc = new window.jspdf.jsPDF({ unit: "pt", format: "letter", compress: true });
    this.runningHead = clean(runningHead || title);
    this.footerLeft = clean(footerLeft || title);
    this.doc.setProperties({
      title: clean(meta.title || title),
      subject: clean(meta.subject || `New York State home instruction (${REG})`),
      author: clean(meta.author || ""),
      keywords: clean(meta.keywords || "homeschool, home instruction, New York, 100.10"),
      creator: "pere.games/homeschooling",
    });
    this.doc.setLineHeightFactor(1.32);
    this.y = PAGE.mt;
    this.masthead(clean(title), clean(subtitle), clean(eyebrowRight));
  }

  // ---- primitives ----------------------------------------------------------

  font(style = "normal", size = 10, color = C.ink) {
    this.doc.setFont("helvetica", style);
    this.doc.setFontSize(size);
    this.doc.setTextColor(...color);
  }

  lineH(size) { return size * 1.32; }

  room() { return PAGE.h - PAGE.mb - this.y; }

  ensure(h) {
    if (this.y + h > PAGE.h - PAGE.mb) {
      this.doc.addPage("letter", "portrait");
      this.y = CONT_TOP;
      return true;
    }
    return false;
  }

  space(h) { this.y += h; }

  rule(color = C.line, width = 0.6, y = this.y) {
    this.doc.setDrawColor(...color);
    this.doc.setLineWidth(width);
    this.doc.line(PAGE.ml, y, PAGE.w - PAGE.mr, y);
  }

  masthead(title, subtitle, right) {
    const d = this.doc;
    this.font("bold", 7.5, C.navy);
    d.text("NEW YORK STATE HOME INSTRUCTION  ·  " + REG.toUpperCase(), PAGE.ml, this.y, { charSpace: 0.5 });
    if (right) {
      this.font("normal", 8, C.muted);
      const lines = d.splitTextToSize(right, CW * 0.45);
      d.text(lines, PAGE.w - PAGE.mr, this.y, { align: "right" });
    }
    this.y += 26;
    this.font("bold", 19, C.ink);
    const t = d.splitTextToSize(title, CW);
    d.text(t, PAGE.ml, this.y);
    this.y += (t.length - 1) * this.lineH(19) + 17;
    if (subtitle) {
      this.font("normal", 10.5, C.muted);
      d.text(subtitle, PAGE.ml, this.y);
      this.y += 12;
    }
    this.rule(C.navy, 1.6);
    this.y += 20;
  }

  // ---- blocks --------------------------------------------------------------

  // fields: [{ label, value, span }] laid out in a bordered grid. span: 1 or 2.
  infoGrid(fields, cols = 2) {
    const d = this.doc;
    const colW = CW / cols;
    const rows = [];
    let row = [];
    let used = 0;
    for (const f of fields) {
      const span = Math.min(f.span || 1, cols);
      if (used + span > cols) { rows.push(row); row = []; used = 0; }
      row.push({ ...f, span });
      used += span;
    }
    if (row.length) rows.push(row);

    for (const r of rows) {
      // stretch the last cell so the row fills the width
      const total = r.reduce((n, c) => n + c.span, 0);
      if (total < cols) r[r.length - 1].span += cols - total;
      this.font("normal", 10);
      const cells = r.map((c) => {
        const w = colW * c.span;
        const lines = d.splitTextToSize(clean(c.value) || "—", w - 14);
        return { ...c, w, lines };
      });
      const h = Math.max(...cells.map((c) => 22 + c.lines.length * this.lineH(10))) + 2;
      this.ensure(h);
      let x = PAGE.ml;
      for (const c of cells) {
        d.setDrawColor(...C.line);
        d.setLineWidth(0.6);
        d.setFillColor(...C.fill);
        d.rect(x, this.y, c.w, h, "FD");
        this.font("bold", 6.8, C.muted);
        d.text(clean(c.label).toUpperCase(), x + 7, this.y + 11, { charSpace: 0.4 });
        this.font(c.value ? "normal" : "normal", 10, c.value ? C.ink : C.muted);
        d.text(c.lines, x + 7, this.y + 24.5);
        x += c.w;
      }
      this.y += h;
    }
    this.y += 18;
  }

  section(title, note = "") {
    // Keep a heading with at least a few lines of what follows it.
    this.ensure(96);
    this.y += 4;
    this.font("bold", 9.5, C.navy);
    this.doc.text(clean(title).toUpperCase(), PAGE.ml, this.y, { charSpace: 0.5 });
    if (note) {
      this.font("normal", 8, C.muted);
      this.doc.text(clean(note), PAGE.w - PAGE.mr, this.y, { align: "right" });
    }
    this.y += 6;
    this.rule(C.line, 0.6);
    this.y += 15;
  }

  paragraph(text, { size = 10, style = "normal", color = C.ink, after = 8, indent = 0 } = {}) {
    const d = this.doc;
    const paras = clean(text).split(/\n{2,}/);
    for (const p of paras) {
      this.font(style, size, color);
      const lines = d.splitTextToSize(p, CW - indent);
      for (const line of lines) {
        this.ensure(this.lineH(size));
        d.text(line, PAGE.ml + indent, this.y);
        this.y += this.lineH(size);
      }
      this.y += after;
    }
  }

  bullets(items, { size = 10 } = {}) {
    const d = this.doc;
    for (const item of items) {
      this.font("normal", size);
      const lines = d.splitTextToSize(clean(item), CW - 16);
      lines.forEach((line, i) => {
        this.ensure(this.lineH(size));
        if (i === 0) d.text("•", PAGE.ml + 4, this.y);
        d.text(line, PAGE.ml + 16, this.y);
        this.y += this.lineH(size);
      });
      this.y += 2;
    }
    this.y += 6;
  }

  // A checkbox line, drawn with lines so it prints the same everywhere.
  check(checked, text, { size = 10 } = {}) {
    const d = this.doc;
    this.font("normal", size);
    const lines = d.splitTextToSize(clean(text), CW - 20);
    this.ensure(lines.length * this.lineH(size) + 4);
    const bx = PAGE.ml, by = this.y - 8.5;
    d.setDrawColor(...C.ink);
    d.setLineWidth(0.8);
    d.rect(bx, by, 10, 10);
    if (checked) {
      d.setLineWidth(1.4);
      d.line(bx + 2, by + 5.2, bx + 4.2, by + 7.8);
      d.line(bx + 4.2, by + 7.8, bx + 8.4, by + 2.2);
    }
    d.text(lines, PAGE.ml + 18, this.y);
    this.y += lines.length * this.lineH(size) + 6;
  }

  // rows: arrays of cells. A cell is a string, or { text, note } where note is
  // printed small and grey under the text.
  table({ head, rows, widths, boldFirst = true, fontSize = 9.5 }) {
    const d = this.doc;
    const notes = new Map();
    const body = rows.map((r, ri) => r.map((cell, ci) => {
      if (cell && typeof cell === "object") {
        const text = clean(cell.text);
        if (cell.note) notes.set(`${ri}:${ci}`, { text, note: clean(cell.note) });
        // Reserve room for the note by adding blank lines sized to it.
        if (cell.note) {
          d.setFont("helvetica", "normal"); d.setFontSize(7.5);
          const w = (widths && widths[ci]) ? widths[ci] - 14 : 120;
          const n = d.splitTextToSize(clean(cell.note), w).length;
          return text + "\n" + Array(Math.ceil(n * 0.82)).fill(" ").join("\n");
        }
        return text;
      }
      return clean(cell);
    }));
    const columnStyles = {};
    (widths || []).forEach((w, i) => { columnStyles[i] = { cellWidth: w }; });
    if (boldFirst) columnStyles[0] = { ...(columnStyles[0] || {}), fontStyle: "bold" };

    this.ensure(60);
    autoTable(d, {
      startY: this.y,
      head: head ? [head.map(clean)] : undefined,
      body,
      theme: "grid",
      margin: { left: PAGE.ml, right: PAGE.mr, top: CONT_TOP, bottom: PAGE.mb },
      styles: {
        font: "helvetica", fontSize, textColor: C.ink, lineColor: C.line, lineWidth: 0.5,
        cellPadding: { top: 5.5, right: 7, bottom: 5.5, left: 7 }, valign: "top", overflow: "linebreak",
      },
      headStyles: { fillColor: C.navy, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8.5, valign: "middle" },
      alternateRowStyles: { fillColor: C.stripe },
      columnStyles,
      rowPageBreak: "avoid",
      willDrawCell: (h) => {
        if (h.section !== "body") return;
        const n = notes.get(`${h.row.index}:${h.column.index}`);
        if (n) {
          d.setFont("helvetica", h.cell.styles.fontStyle || "normal");
          d.setFontSize(h.cell.styles.fontSize);
          h.cell.text = d.splitTextToSize(n.text, h.cell.width - 14);
        }
      },
      didDrawCell: (h) => {
        if (h.section !== "body") return;
        const n = notes.get(`${h.row.index}:${h.column.index}`);
        if (!n) return;
        const lh = h.cell.styles.fontSize * 1.15;
        const top = h.cell.y + 5.5 + h.cell.text.length * lh + 3;
        d.setFont("helvetica", "normal");
        d.setFontSize(7.5);
        d.setTextColor(...C.muted);
        d.text(d.splitTextToSize(n.note, h.cell.width - 14), h.cell.x + 7, top + 6);
        d.setTextColor(...C.ink);
      },
    });
    this.y = (d.lastAutoTable ? d.lastAutoTable.finalY : this.y) + 16;
  }

  // sigs: [{ label: "Parent / Guardian", name: "Pat Doe", date: "2026-06-30" }]
  signatures(sigs) {
    const d = this.doc;
    this.ensure(sigs.length * 48 + 10);
    for (const s of sigs) {
      this.ensure(58);
      this.y += 26;
      const sigW = 300;
      d.setDrawColor(...C.ink);
      d.setLineWidth(0.7);
      d.line(PAGE.ml, this.y, PAGE.ml + sigW, this.y);
      d.line(PAGE.ml + sigW + 30, this.y, PAGE.w - PAGE.mr, this.y);
      if (s.date) {
        this.font("normal", 10);
        d.text(fmtDate(s.date), PAGE.ml + sigW + 30, this.y - 5);
      }
      this.font("normal", 8, C.muted);
      const who = [clean(s.name), clean(s.label)].filter(Boolean).join(", ");
      d.text(`Signature${who ? " — " + who : ""}`, PAGE.ml, this.y + 11);
      d.text("Date", PAGE.ml + sigW + 30, this.y + 11);
      this.y += 22;
    }
    this.y += 6;
  }

  // Letter-style address block: lines at the left, no grid.
  addressBlock(lines, { after = 14 } = {}) {
    this.font("normal", 10.5);
    for (const l of lines.filter(Boolean)) {
      this.ensure(this.lineH(10.5));
      this.doc.text(clean(l), PAGE.ml, this.y);
      this.y += this.lineH(10.5);
    }
    this.y += after;
  }

  // ---- finishing -----------------------------------------------------------

  // Draws the running header (pages 2+) and footer on every page.
  // extraPages: attachment pages that pdf-lib will add after these.
  finish(extraPages = 0) {
    const d = this.doc;
    const n = d.getNumberOfPages();
    this.total = n + extraPages;
    for (let i = 1; i <= n; i++) {
      d.setPage(i);
      if (i > 1) {
        this.font("normal", 8, C.muted);
        d.text(this.runningHead, PAGE.ml, 50);
        d.text(REG, PAGE.w - PAGE.mr, 50, { align: "right" });
        this.rule(C.line, 0.5, 57);
      }
      footer(d, this.footerLeft, i, this.total);
    }
    return this;
  }

  bytes() { return this.doc.output("arraybuffer"); }
}

function footer(d, left, i, total) {
  d.setDrawColor(...C.line);
  d.setLineWidth(0.5);
  d.line(PAGE.ml, PAGE.h - 44, PAGE.w - PAGE.mr, PAGE.h - 44);
  d.setFont("helvetica", "normal");
  d.setFontSize(8);
  d.setTextColor(...C.muted);
  d.text(left, PAGE.ml, PAGE.h - 31);
  d.text(`Page ${i} of ${total}`, PAGE.w - PAGE.mr, PAGE.h - 31, { align: "right" });
}

// ---- attachments (uploaded score reports) -----------------------------------

// Reads uploaded files and counts their pages, so the footers can say
// "Page X of Y" before the PDF is assembled.
export async function readAttachments(files) {
  const PDFLib = window.PDFLib;
  if (!PDFLib) throw new Error("The PDF library didn't load. Check your connection and reload the page.");
  const out = [];
  for (const f of files) {
    const buf = await f.arrayBuffer();
    if (f.type === "application/pdf" || /\.pdf$/i.test(f.name)) {
      let src;
      try { src = await PDFLib.PDFDocument.load(buf, { ignoreEncryption: true }); }
      catch { throw new Error(`Couldn't read “${f.name}”. Try printing it to a new PDF first.`); }
      out.push({ kind: "pdf", name: f.name, src, pages: src.getPageCount() });
    } else if (/^image\//.test(f.type)) {
      out.push({ kind: "image", name: f.name, png: await toPng(f, buf), pages: 1 });
    } else {
      throw new Error(`“${f.name}” isn't a PDF or an image.`);
    }
  }
  return out;
}

async function toPng(file, buf) {
  if (file.type === "image/png" || file.type === "image/jpeg") return { type: file.type, bytes: buf };
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error(`Couldn't open “${file.name}”. Save it as a PDF, JPG or PNG.`)); i.src = url; });
    const c = document.createElement("canvas");
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    c.getContext("2d").drawImage(img, 0, 0);
    const blob = await new Promise((res) => c.toBlob(res, "image/png"));
    return { type: "image/png", bytes: await blob.arrayBuffer() };
  } finally { URL.revokeObjectURL(url); }
}

// Appends attachments to the report, each page scaled onto a Letter page
// between the shared header and footer.
export async function appendAttachments(report, attachments, labelFor) {
  const PDFLib = window.PDFLib;
  const base = await PDFLib.PDFDocument.load(report.bytes());
  const font = await base.embedFont(PDFLib.StandardFonts.Helvetica);
  const grey = PDFLib.rgb(C.muted[0] / 255, C.muted[1] / 255, C.muted[2] / 255);
  const lineC = PDFLib.rgb(C.line[0] / 255, C.line[1] / 255, C.line[2] / 255);
  let pageNo = base.getPageCount();
  const box = { x: PAGE.ml - 18, y: 56, w: CW + 36, h: PAGE.h - 56 - 70 };

  const decorate = (page, head) => {
    pageNo += 1;
    const h = PAGE.h;
    page.drawText(clean(head), { x: PAGE.ml, y: h - 50, size: 8, font, color: grey });
    const regW = font.widthOfTextAtSize(REG, 8);
    page.drawText(REG, { x: PAGE.w - PAGE.mr - regW, y: h - 50, size: 8, font, color: grey });
    page.drawLine({ start: { x: PAGE.ml, y: h - 57 }, end: { x: PAGE.w - PAGE.mr, y: h - 57 }, thickness: 0.5, color: lineC });
    page.drawLine({ start: { x: PAGE.ml, y: 44 }, end: { x: PAGE.w - PAGE.mr, y: 44 }, thickness: 0.5, color: lineC });
    page.drawText(report.footerLeft, { x: PAGE.ml, y: 31, size: 8, font, color: grey });
    const p = `Page ${pageNo} of ${report.total}`;
    page.drawText(p, { x: PAGE.w - PAGE.mr - font.widthOfTextAtSize(p, 8), y: 31, size: 8, font, color: grey });
  };

  const fit = (w, h) => {
    const s = Math.min(box.w / w, box.h / h, 1.6);
    const dw = w * s, dh = h * s;
    return { x: box.x + (box.w - dw) / 2, y: box.y + (box.h - dh), width: dw, height: dh };
  };

  for (const [ai, a] of attachments.entries()) {
    const label = labelFor(a, ai);
    if (a.kind === "pdf") {
      const embedded = await base.embedPdf(a.src, a.src.getPageIndices());
      embedded.forEach((ep, i) => {
        const page = base.addPage([PAGE.w, PAGE.h]);
        page.drawPage(ep, fit(ep.width, ep.height));
        decorate(page, `${label} — page ${i + 1} of ${embedded.length}`);
      });
    } else {
      const img = a.png.type === "image/jpeg" ? await base.embedJpg(a.png.bytes) : await base.embedPng(a.png.bytes);
      const page = base.addPage([PAGE.w, PAGE.h]);
      page.drawImage(img, fit(img.width, img.height));
      decorate(page, label);
    }
  }
  return base.save();
}

// ---- output -----------------------------------------------------------------

export function saveFile(bytes, filename) {
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export function openPreview(bytes) {
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 5 * 60000);
  return !!w;
}
