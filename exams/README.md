# Exam PDF archive

Past practice exams (and solutions) from the course Resources export, organized by exam:

```text
exams/
  midterm1/   # Midterm 1 practice exams + _sol.pdf siblings
  midterm2/   # Midterm 2 practice exams + _sol.pdf siblings
  midterm3/   # reserved — no MT3 PDFs in the Resources export yet
  final/      # Final practice exams + solutions (+ Part I notes)
```

## Naming scheme

Flat folders with **sibling `_sol.pdf` files** (not a nested `solutions/` directory):

| Pattern | Example |
| --- | --- |
| Exam | `midterm1/MT1_Fall2024.pdf` |
| Solutions | `midterm1/MT1_Fall2024_sol.pdf` |

Term codes in filenames expand the original `FaYY` labels (`Fa24` → `Fall2024`).

The GSI dashboard opens them via [`../data/exam_manifest.json`](../data/exam_manifest.json). Deep links use `#page=1` until problem-level page numbers are verified.

## Inventory (from Resources export)

| Folder | Exams | Solutions | Other |
| --- | ---: | ---: | ---: |
| `midterm1/` | 4 (Fa23–Fa26) | 4 | — |
| `midterm2/` | 3 (Fa23–Fa25) | 3 | — |
| `midterm3/` | 0 | 0 | empty (placeholder README only) |
| `final/` | 2 (Fa23–Fa24) | 2 | 1 Part I notes (Fa23) |

## Rules

- Prefer extracted PDFs in these folders; do **not** keep the original zip once unpacked.
- Keep filenames stable once linked in `exam_manifest.json`.
- Topic / trap / `#page=N` fields should stay honest: only claim a page or concept when verified.
- After adding a PDF, verify **Open Past Exam** on the Pages site.
