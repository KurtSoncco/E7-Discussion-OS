# Exam PDF archive

Past midterms are separated by exam:

```text
exams/
  midterm1/   # Midterm 1 PDFs
  midterm2/   # Midterm 2 PDFs
  midterm3/   # Midterm 3 PDFs
```

The GSI dashboard opens them via deep links from [`../data/exam_manifest.json`](../data/exam_manifest.json) using the fragment form `exams/midtermN/[FILE].pdf#page=N`.

## Expected filenames (from the current manifest)

| File | Used by |
| --- | --- |
| `midterm1/MT1_Fall2024.pdf` | FA24-MT1-Q2 (page 3) |
| `midterm1/MT1_Spring2025.pdf` | SP25-MT1-Q4 (page 5) |
| `midterm2/MT2_Fall2024.pdf` | FA24-MT2-Q1 (page 2) |
| `midterm3/MT3_Fall2024.pdf` | FA24-MT3-Q1 (page 1, stub) |

## Rules

- **Do not commit placeholder or invented PDF binaries.** Add real course midterms only.
- Keep filenames stable once linked in `exam_manifest.json`.
- After adding a PDF, verify the dashboard **Open Past Exam** link lands on the correct page in the browser PDF viewer.
- Archive is public read (students may open past midterms from the Pages site).
