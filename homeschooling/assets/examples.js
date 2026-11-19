// Example content for "Try it with an example family" and "Fill with example
// text". The family is made up.

import * as R from "./rules.js";
import { yearStart } from "./store.js";

export const EXAMPLE_FAMILY = {
  family: {
    parents: "Jordan Rivera & Casey Rivera",
    street: "123 Example Road",
    city: "Anytown",
    state: "NY",
    zip: "13000",
    phone: "(315) 555-0142",
    email: "rivera.family@example.com",
    instructors: "Jordan Rivera & Casey Rivera",
    district: "Anytown Central School District",
    superintendent: "Dr. Alex Morgan",
    districtStreet: "1 School Street",
    districtCity: "Anytown, NY 13000",
    districtEmail: "homeinstruction@anytown.example",
  },
  children: [
    { first: "Mila", last: "Rivera", dob: "2015-09-12", grade: "5" },
    { first: "Theo", last: "Rivera", dob: "2012-11-03", grade: "8" },
  ],
};

const ISO = (y, md) => `${y}-${md}`;

// Materials by subject for the example IHIP, grades 1–6.
const MATERIALS_1_6 = {
  "Arithmetic": "Saxon Math 6/5 (Lessons 1–120 and Investigations 1–12)\nDaily fact-fluency speed drills",
  "Reading": "Abeka Reading 5: Of People (literature reader)\nC.S. Lewis, The Chronicles of Narnia\nAntoine de Saint-Exupéry, The Little Prince\nWeekly library visits and independent reading log",
  "Spelling": "Building Spelling Skills, Grade 5 (Christian Liberty Press)",
  "Writing": "Daily journal and writing prompts\nPen-pal letters, twice a month\nOne research report per quarter",
  "English Language": "BJU Press English 5: Writing & Grammar worktext",
  "Geography": "U.S. states and capitals study with map work\nWorld map and globe skills (latitude, longitude, continents, oceans)",
  "United States History": "Master Books: America's Story 1\nNew York State history field trips",
  "Science": "Apologia: Exploring Creation with Zoology 1\nMaster Books Science: Physical World; Machines & Motion; Heat & Energy; Inventions & Technology",
  "Health Education": "Smithsonian: Human Body\nSafety units: fire safety, bicycle and traffic safety, alcohol, tobacco and drug awareness",
  "Music": "Weekly piano lessons\nMusic theory workbook (note reading, rhythm, scales)",
  "Visual Arts": "Famous painters and their paintings\nCharcoal drawing\nSeasonal craft projects",
  "Physical Education": "Soccer league\nWiffle ball, gaga ball and relay races\nWeekly gym class; biking and walking",
};

const MATERIALS_7_8 = {
  "English": "BJU Press Writing & Grammar 7\nNovels: The Hobbit, Number the Stars, A Wrinkle in Time\nWeekly essays and a quarterly research paper",
  "History and Geography": "Master Books: America's Story 2\nNew York State history unit and Albany field trip\nU.S. and New York Constitutions study",
  "Science": "Apologia: Exploring Creation with General Science\nHands-on labs and a science fair project",
  "Mathematics": "Saxon Math 8/7 (Lessons 1–120)\nKhan Academy practice",
  "Physical Education": "Basketball league, swimming, weekly gym class",
  "Health Education": "Total Health: Choices for a Winning Lifestyle\nFirst aid and CPR basics",
  "Art": "Drawing and painting course; art history readings",
  "Music": "Guitar lessons, youth band",
  "Practical Arts": "Woodworking project; cooking and meal planning; basic budgeting",
  "Library Skills": "Library research instruction, Dewey Decimal System, citing sources",
};

export const examples = {
  loi() {
    return { notes: "" };
  },

  ihip(ctx) {
    const b = R.band(ctx.grade || 1);
    const mats = b === "1-6" ? MATERIALS_1_6 : MATERIALS_7_8;
    const y = yearStart(ctx.year);
    return {
      quarters: [
        { from: ISO(y, "09-02"), to: ISO(y, "11-14"), due: ISO(y, "11-30") },
        { from: ISO(y, "11-17"), to: ISO(y + 1, "01-23"), due: ISO(y + 1, "01-30") },
        { from: ISO(y + 1, "01-26"), to: ISO(y + 1, "04-17"), due: ISO(y + 1, "04-30") },
        { from: ISO(y + 1, "04-20"), to: ISO(y + 1, "06-19"), due: ISO(y + 1, "06-30") },
      ],
      schedule: "Monday to Friday, about 5½ hours a day, September through June, plus weekly lessons, sports and field trips.",
      subjects: R.SUBJECTS[b].map((s) => ({ name: s.name, note: s.note || "", required: true, materials: mats[s.name] || "" })),
      once: R.ONCE_1_8.map((name, i) => ({ name, status: ["This year, in United States History", "Grade 4", "Planned for grade 7"][i] })),
    };
  },

  quarterly(ctx, d) {
    const sample = {
      "Arithmetic": ["Lessons 31–60 and Investigations 4–6: fractions, decimals, area and perimeter", "94%"],
      "Mathematics": ["Lessons 31–60: percentages, ratios, geometry and area", "88%"],
      "Reading": ["Of People, units 2–3\nThe Lion, the Witch and the Wardrobe; Prince Caspian", "A"],
      "Spelling": ["Lessons 10–18 with weekly tests", "96%"],
      "Writing": ["Daily journal; two pen-pal letters; research report on bald eagles", "A"],
      "English Language": ["Chapters 3–5: verbs, adjectives, adverbs, sentence structure", "92%"],
      "English": ["Chapters 8–11: adjectives, adverbs, prepositions, compound sentences; essay on The Hobbit", "95%"],
      "Geography": ["Northeast and Southeast states and capitals; map scale and compass rose", "Pass"],
      "United States History": ["Chapters 8–12: early explorers, Jamestown, Plymouth Colony", "95%"],
      "History and Geography": ["Chapters 8–12: Mexico and Central America; 50 states and capitals", "96%"],
      "Science": ["Zoology lessons 4–7: flight, birds, insects; lab journal", "95%"],
      "Health Education": ["The heart and lungs; the five senses; bicycle safety", "Pass"],
      "Music": ["Weekly piano lessons; note reading and rhythm", "Pass"],
      "Visual Arts": ["Charcoal shading; study of Monet and Van Gogh", "Pass"],
      "Art": ["Clay sculpting; staining and painting a lamp", "Pass"],
      "Physical Education": ["Soccer season, wiffle ball, biking", "Pass"],
      "Practical Arts": ["Graphic design for a yearbook; building a lamp", "Pass"],
      "Library Skills": ["Library visits, research skills, Dewey Decimal System", "Pass"],
    };
    return {
      hours: "240",
      subjects: d.subjects.map((s) => ({ ...s, covered: sample[s.name]?.[0] || s.covered, grade: sample[s.name]?.[1] || s.grade })),
    };
  },

  narrative(ctx, d) {
    const y = yearStart(ctx.year) + 1;
    const first = ctx.child.first || "The student";
    return {
      method: "narrative",
      evaluator: "Morgan Ellis",
      evaluatorType: R.EVALUATOR_TYPES[0],
      credential: "NYS Professional Certificate, Childhood Education 1–6",
      reviewDate: `${y}-06-15`,
      reviewMethod: "Interview with the student and review of a portfolio of work samples, tests and reading log",
      summary: `${first} completed the ${ctx.year.replace("-", "–")} program described in the IHIP and met the required hours of instruction. Work samples show steady, independent progress in every subject. ${first} finished the planned math curriculum, reads above grade level, and writes organized multi-paragraph reports.`,
      subjects: d.subjects.map((s) => ({ ...s, progress: s.progress || `Completed the material planned in the IHIP for ${s.name}, with steady, grade-appropriate progress.` })),
      adequate: "yes",
    };
  },

  test(ctx) {
    const y = yearStart(ctx.year) + 1;
    return {
      method: "test",
      testName: R.TESTS[0],
      testLevel: `Form E, Level ${Number(ctx.grade || 5) + 6}`,
      testDate: `${y}-05-12`,
      testDateEnd: `${y}-05-14`,
      administrator: "Morgan Ellis",
      administratorType: R.ADMINISTRATOR_TYPES[2],
      scores: [
        { area: "Reading", score: "SS 231", percentile: "72" },
        { area: "Language", score: "SS 226", percentile: "65" },
        { area: "Mathematics", score: "SS 229", percentile: "70" },
        { area: "Science", score: "SS 224", percentile: "61" },
      ],
      composite: "68",
    };
  },
};
