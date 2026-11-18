// What New York's home instruction regulation (8 NYCRR §100.10) asks for.
// Everything the forms and PDFs say about the rules comes from this file, so
// when the regulation or NYSED guidance changes, change it here.

export const REG = "8 NYCRR §100.10";
export const REG_LONG = "Section 100.10 of the Regulations of the Commissioner of Education (8 NYCRR §100.10)";

export const GRADES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

export function band(grade) {
  const g = Number(grade);
  if (g <= 6) return "1-6";
  if (g <= 8) return "7-8";
  return "9-12";
}

// Minimum yearly hours, on the substantial equivalent of 180 days.
export function requiredHours(grade) {
  return Number(grade) <= 6 ? 900 : 990;
}

// Required subjects by grade band. `note` is the unit requirement, shown in
// the form and printed under the subject name in the IHIP.
export const SUBJECTS = {
  "1-6": [
    { name: "Arithmetic" },
    { name: "Reading" },
    { name: "Spelling" },
    { name: "Writing" },
    { name: "English Language" },
    { name: "Geography" },
    { name: "United States History" },
    { name: "Science" },
    { name: "Health Education" },
    { name: "Music" },
    { name: "Visual Arts" },
    { name: "Physical Education" },
  ],
  "7-8": [
    { name: "English", note: "2 units over grades 7–8" },
    { name: "History and Geography", note: "2 units over grades 7–8" },
    { name: "Science", note: "2 units over grades 7–8" },
    { name: "Mathematics", note: "2 units over grades 7–8" },
    { name: "Physical Education", note: "On a regular basis" },
    { name: "Health Education", note: "On a regular basis" },
    { name: "Art", note: "½ unit over grades 7–8" },
    { name: "Music", note: "½ unit over grades 7–8" },
    { name: "Practical Arts", note: "On a regular basis" },
    { name: "Library Skills", note: "On a regular basis" },
  ],
  "9-12": [
    { name: "English", note: "4 units over grades 9–12" },
    { name: "Social Studies", note: "4 units, including American History (1), Participation in Government (½) and Economics (½)" },
    { name: "Mathematics", note: "2 units over grades 9–12" },
    { name: "Science", note: "2 units over grades 9–12" },
    { name: "Art and/or Music", note: "1 unit over grades 9–12" },
    { name: "Health Education", note: "½ unit over grades 9–12" },
    { name: "Physical Education", note: "2 units over grades 9–12" },
    { name: "Electives", note: "3 units over grades 9–12" },
  ],
};

// Instruction required by the Education Law at every grade. Families usually
// cover these inside other subjects, so the IHIP asks where.
export const OTHER_REQUIRED = [
  { name: "Patriotism and citizenship", law: "Education Law §801", where: "Covered within Social Studies / U.S. History." },
  { name: "Alcohol, drug and tobacco misuse", law: "Education Law §804", where: "Covered within Health Education." },
  { name: "Highway safety and traffic regulation, including bicycle safety", law: "Education Law §806", where: "Covered within Health Education and Physical Education." },
  { name: "Fire and arson prevention and safety", law: "Education Law §808", where: "Covered within Health Education." },
];

// Must be taught at least once somewhere in grades 1–8.
export const ONCE_1_8 = [
  "United States History",
  "New York State History",
  "Constitutions of the United States and New York State",
];

export const QUARTER_NOTES = {
  3: "Include plans for the annual assessment.",
  4: "File the annual assessment with this report.",
};

// Which annual assessments are allowed this year.
// lastMethod/lastGrade describe last year's assessment, if known.
export function assessmentRule(grade, lastMethod, lastGrade) {
  const g = Number(grade);
  if (g <= 3) {
    return { narrative: true, test: true, text: "Grades 1–3: you may file either a written narrative or standardized test results." };
  }
  if (g >= 9) {
    return { narrative: false, test: true, text: "Grades 9–12: a standardized test is required every year. A narrative is not accepted." };
  }
  const base = "Grades 4–8: a written narrative may be used only in alternate years, so at least every other year must be a standardized test.";
  if (lastMethod === "narrative" && Number(lastGrade) >= 4) {
    return { narrative: false, test: true, text: base + " Last year was a narrative, so this year must be a standardized test." };
  }
  if (lastMethod === "test") {
    return { narrative: true, test: true, text: base + " Last year was a test, so a narrative is allowed this year." };
  }
  return { narrative: true, test: true, text: base + " Check which method you used last year before choosing a narrative." };
}

export const EVALUATOR_TYPES = [
  "NYS certified teacher",
  "Home instruction peer review panel",
  "Other person approved by the superintendent",
];

export const TESTS = [
  "Iowa Assessments",
  "Iowa Tests of Basic Skills (ITBS)",
  "Stanford Achievement Test, 10th ed. (SAT10)",
  "TerraNova, 3rd ed.",
  "California Achievement Test (CAT)",
  "Metropolitan Achievement Test (MAT)",
  "Comprehensive Test of Basic Skills (CTBS)",
  "PASS Test (Personalized Achievement Summary System)",
  "NYS Grades 3–8 ELA and Mathematics Tests",
];

// A test result is adequate if the composite is above the 33rd percentile on
// national norms, or shows a year of growth over a test from the prior year.
export const TEST_STANDARD = "above the 33rd percentile on national norms, or one academic year of growth compared with a test taken during or after the prior school year";

// Default quarterly due dates (month-day). Families set their own on the IHIP.
export const DEFAULT_QUARTER_DUES = ["11-30", "01-30", "04-30", "06-30"];
