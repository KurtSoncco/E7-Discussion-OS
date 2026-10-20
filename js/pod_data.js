/**
 * Andean pod definitions and student → pod mapping for E7 Discussion OS.
 * 12 pods × 4 desks = 48 seats (~45–50 students).
 */
const PODS = [
  { id: "condor", name: "Cóndor", english: "Andean Condor", desks: 4 },
  { id: "vicuna", name: "Vicuña", english: "Vicuña", desks: 4 },
  { id: "alpaca", name: "Alpaca", english: "Alpaca", desks: 4 },
  { id: "puma", name: "Puma", english: "Puma", desks: 4 },
  { id: "zorro-culpeo", name: "Zorro Culpeo", english: "Andean Fox", desks: 4 },
  { id: "ukuku", name: "Ukuku", english: "Spectacled Bear", desks: 4 },
  { id: "vizcacha", name: "Vizcacha", english: "Vizcacha", desks: 4 },
  { id: "chinchilla", name: "Chinchilla", english: "Chinchilla", desks: 4 },
  { id: "guanaco", name: "Guanaco", english: "Guanaco", desks: 4 },
  { id: "taruca", name: "Taruca", english: "Andean Deer", desks: 4 },
  { id: "tunqui", name: "Tunqui", english: "Cock-of-the-rock", desks: 4 },
  { id: "parina", name: "Parina", english: "Andean Flamingo", desks: 4 },
];

const POD_NAME_LOOKUP = (() => {
  const map = new Map();
  for (const pod of PODS) {
    map.set(normalizeKey(pod.id), pod.id);
    map.set(normalizeKey(pod.name), pod.id);
    map.set(normalizeKey(pod.english), pod.id);
    map.set(normalizeKey(`pod ${pod.name}`), pod.id);
  }
  // Accent-stripped aliases
  map.set("condor", "condor");
  map.set("vicuna", "vicuna");
  map.set("zorro", "zorro-culpeo");
  map.set("zorro culpeo", "zorro-culpeo");
  map.set("andean fox", "zorro-culpeo");
  map.set("spectacled bear", "ukuku");
  map.set("andean deer", "taruca");
  map.set("cock of the rock", "tunqui");
  map.set("cock-of-the-rock", "tunqui");
  map.set("andean flamingo", "parina");
  map.set("andean condor", "condor");
  return map;
})();

function normalizeKey(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Parse a check-in / session attendance CSV into student records.
 *
 * Supports:
 * - Simple roster: name, student id, email, optional pod
 * - Session attendance export: last_name, first_name, student_email, status, …
 *   → name = first_name + " " + last_name; only rows with status Present (case-insensitive)
 */
function parseCheckInCsv(text) {
  const rows = parseCsv(text);
  if (!rows.length) return [];

  const headers = rows[0].map((h) => normalizeKey(h));
  const nameIdx = findHeader(headers, ["name", "full name", "student name", "display name"]);
  const firstIdx = findHeader(headers, ["first name", "firstname", "given name"]);
  const lastIdx = findHeader(headers, ["last name", "lastname", "surname", "family name"]);
  const idIdx = findHeader(headers, ["student id", "sid", "id", "student number", "calnet id"]);
  const emailIdx = findHeader(headers, [
    "student email",
    "email",
    "email address",
    "e mail",
  ]);
  const podIdx = findHeader(headers, ["pod", "pod name", "assigned pod", "group", "team"]);
  const statusIdx = findHeader(headers, ["status", "attendance", "attendance status", "check in status"]);

  const students = [];
  for (let r = 1; r < rows.length; r++) {
    const cols = rows[r];
    if (!cols.some((c) => String(c).trim())) continue;

    if (statusIdx >= 0) {
      const status = String(cols[statusIdx] || "").trim().toLowerCase();
      if (status !== "present") continue;
    }

    const first = firstIdx >= 0 ? String(cols[firstIdx] || "").trim() : "";
    const last = lastIdx >= 0 ? String(cols[lastIdx] || "").trim() : "";
    const joined = [first, last].filter(Boolean).join(" ");
    const nameFromCol = nameIdx >= 0 ? String(cols[nameIdx] || "").trim() : "";
    const name = nameFromCol || joined;

    const studentId = idIdx >= 0 ? String(cols[idIdx] || "").trim() : "";
    const email = emailIdx >= 0 ? String(cols[emailIdx] || "").trim() : "";
    const podRaw = podIdx >= 0 ? String(cols[podIdx] || "").trim() : "";

    if (!name && !studentId && !email) continue;

    students.push({
      name: name || email || studentId || `Student ${r}`,
      studentId,
      email,
      podHint: podRaw,
      row: r,
    });
  }
  return students;
}

function findHeader(headers, candidates) {
  for (const c of candidates) {
    const idx = headers.indexOf(c);
    if (idx >= 0) return idx;
  }
  return -1;
}

/** Minimal RFC4180-ish CSV parser (quoted fields, commas, newlines). */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (ch === "\r") {
      // skip CR; LF will finalize
    } else {
      field += ch;
    }
  }

  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/**
 * Map checked-in students into the 12 Andean pods.
 * Rules:
 * 1. If CSV has a Pod column that matches a known pod → use it (cap 4 desks).
 * 2. Else assign by stable hash of studentId|email|name across pods with free desks.
 * 3. Overflow students go to the least-filled pod (still shown; desk may exceed 4).
 */
function mapStudentsToPods(students) {
  const seats = Object.fromEntries(
    PODS.map((p) => [p.id, { pod: p, members: [] }])
  );

  const unassigned = [];

  for (const student of students) {
    const hinted = resolvePodId(student.podHint);
    if (hinted && seats[hinted].members.length < seats[hinted].pod.desks) {
      seats[hinted].members.push(student);
    } else {
      unassigned.push(student);
    }
  }

  for (const student of unassigned) {
    const key = student.studentId || student.email || student.name;
    const start = hashString(key) % PODS.length;
    let placed = false;

    for (let offset = 0; offset < PODS.length; offset++) {
      const pod = PODS[(start + offset) % PODS.length];
      if (seats[pod.id].members.length < pod.desks) {
        seats[pod.id].members.push(student);
        placed = true;
        break;
      }
    }

    if (!placed) {
      // All pods full — still seat somewhere for visibility
      let lightest = PODS[0].id;
      for (const pod of PODS) {
        if (seats[pod.id].members.length < seats[lightest].members.length) {
          lightest = pod.id;
        }
      }
      seats[lightest].members.push(student);
    }
  }

  return PODS.map((pod) => ({
    ...pod,
    members: seats[pod.id].members.map((m, deskIndex) => ({
      ...m,
      desk: deskIndex + 1,
    })),
  }));
}

function resolvePodId(hint) {
  if (!hint) return null;
  return POD_NAME_LOOKUP.get(normalizeKey(hint)) || null;
}

function emptyPodRoster() {
  return PODS.map((pod) => ({ ...pod, members: [] }));
}

// Expose for app.js (non-module script tags)
window.E7Pods = {
  PODS,
  parseCheckInCsv,
  mapStudentsToPods,
  emptyPodRoster,
  resolvePodId,
};
