// Everything a family types is kept in this browser's localStorage under one
// key. Nothing is sent anywhere. Backups are a JSON file the family saves.

import { DEFAULT_QUARTER_DUES } from "./rules.js";

const KEY = "pere.homeschooling.v1";

function blank() {
  return {
    version: 1,
    family: {
      parents: "", street: "", city: "", state: "NY", zip: "", phone: "", email: "",
      instructors: "",
      district: "", superintendent: "", districtStreet: "", districtCity: "", districtEmail: "",
    },
    children: [],
    settings: { year: currentSchoolYear(), quarterDues: DEFAULT_QUARTER_DUES.slice() },
    docs: {},
  };
}

let state = null;
let storageOk = true;

export function load() {
  if (state) return state;
  let raw = null;
  try { raw = localStorage.getItem(KEY); } catch { storageOk = false; }
  state = blank();
  if (raw) {
    try {
      const saved = JSON.parse(raw);
      state = { ...state, ...saved, family: { ...state.family, ...saved.family }, settings: { ...state.settings, ...saved.settings } };
    } catch { /* corrupt: start fresh, keep raw untouched until next save */ }
  }
  return state;
}

export function canStore() { load(); return storageOk; }

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); storageOk = true; }
  catch { storageOk = false; }
  return storageOk;
}

export function replaceAll(next) {
  if (!next || typeof next !== "object" || !Array.isArray(next.children)) throw new Error("That file isn't a homeschooling backup.");
  state = { ...blank(), ...next, family: { ...blank().family, ...next.family }, settings: { ...blank().settings, ...next.settings } };
  save();
}

export function clearAll() {
  state = blank();
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

export function exportJSON() { return JSON.stringify(load(), null, 2); }

// ---- school years ----------------------------------------------------------

// New York's school year runs July 1 to June 30.
export function currentSchoolYear(d = new Date()) {
  const y = d.getMonth() >= 6 ? d.getFullYear() : d.getFullYear() - 1;
  return yearLabel(y);
}
export function yearLabel(start) { return `${start}-${String((start + 1) % 100).padStart(2, "0")}`; }
export function yearStart(label) { return Number(String(label).slice(0, 4)); }
export function yearDisplay(label) { return String(label).replace("-", "–"); }
export function yearOptions() {
  const now = yearStart(currentSchoolYear());
  const out = [];
  for (let y = now + 1; y >= now - 3; y--) out.push(yearLabel(y));
  return out;
}

// Quarter due date as YYYY-MM-DD for a school year. Months before July fall
// in the second calendar year.
export function quarterDue(label, q) {
  const s = load().settings;
  const md = (s.quarterDues && s.quarterDues[q - 1]) || DEFAULT_QUARTER_DUES[q - 1];
  const month = Number(md.slice(0, 2));
  const y = yearStart(label) + (month >= 7 ? 0 : 1);
  return `${y}-${md}`;
}

// ---- children --------------------------------------------------------------

export function children() { return load().children; }
export function child(id) { return load().children.find((c) => c.id === id) || null; }

export function addChild() {
  const c = { id: "c" + Math.random().toString(36).slice(2, 9), first: "", last: "", dob: "", grade: "", gradeYear: load().settings.year };
  state.children.push(c);
  save();
  return c;
}

export function removeChild(id) {
  state.children = state.children.filter((c) => c.id !== id);
  for (const k of Object.keys(state.docs)) if (k.startsWith(id + "/")) delete state.docs[k];
  save();
}

// A child's grade is stored for one school year; other years are offset from it.
export function gradeFor(c, label) {
  if (!c || c.grade === "" || c.grade == null) return "";
  const g = Number(c.grade) + (yearStart(label) - yearStart(c.gradeYear || label));
  return g >= 1 && g <= 12 ? String(g) : "";
}

export function fullName(c) { return [c.first, c.last].filter(Boolean).join(" ").trim(); }

// ---- documents -------------------------------------------------------------

export const DOC_TYPES = ["loi", "ihip", "q1", "q2", "q3", "q4", "assessment"];

function docKey(childId, label, type) { return `${childId}/${label}/${type}`; }

export function getDoc(childId, label, type) {
  return load().docs[docKey(childId, label, type)] || null;
}

export function putDoc(childId, label, type, data) {
  const k = docKey(childId, label, type);
  const prev = state.docs[k] || {};
  state.docs[k] = { ...prev, data, updated: new Date().toISOString() };
  save();
  return state.docs[k];
}

export function markDoc(childId, label, type, fields) {
  const k = docKey(childId, label, type);
  state.docs[k] = { data: {}, ...(state.docs[k] || {}), ...fields };
  save();
  return state.docs[k];
}

export function deleteDoc(childId, label, type) {
  delete state.docs[docKey(childId, label, type)];
  save();
}
