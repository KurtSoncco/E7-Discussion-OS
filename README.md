# E7 Discussion OS

GSI dashboard and exam archive for **E7 (Introduction to Computer Programming for Engineers in Python)** discussion sections: 12 Andean fauna pods, check-in CSV mapping, Random Pod Picker, and exam PDF deep links.

**Live site (after Pages is enabled):** https://kurtsoncco.github.io/E7-Discussion-OS/

## What’s in this repo

| Path | Role |
| --- | --- |
| `index.html` + `css/` + `js/` | GSI dashboard (pod grid, picker, exam launcher) |
| `js/pod_data.js` | 12 Andean pods + CSV → seat mapping |
| `data/exam_manifest.json` | Topic → PDF `#page=N` index |
| `data/checkin_sample.csv` | Offline demo check-in roster |
| `exams/midterm1/` … `midterm3/` + `final/` | Practice MT1/MT2 + finals (see `exams/README.md`; MT3 empty for now) |
| `.github/workflows/deploy.yml` | Deploy `main` to GitHub Pages |

## Enable GitHub Pages

1. Open the repo **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Push to `main` (or run the **Deploy GitHub Pages** workflow manually).
4. Wait for the workflow to finish; the site URL will be:
   `https://kurtsoncco.github.io/E7-Discussion-OS/`

If Pages was never enabled, the first workflow run may need you to confirm the **github-pages** environment once under **Settings → Environments**.

## Set the check-in CSV URL

The dashboard loads a CSV of checked-in students (typical Google Forms → Sheets export).

1. In Google Sheets: **File → Share → Publish to web** (or use an `export?format=csv` link for a sheet you control).
2. Paste the CSV URL into **Check-in source** on the dashboard and click **Load CSV**.
3. Click **Save URL** to keep it in this browser’s `localStorage`, **or** open the site with:

   ```text
   https://kurtsoncco.github.io/E7-Discussion-OS/?csv=https://…your…csv…
   ```

4. For offline / local demo, click **Use sample** (`data/checkin_sample.csv`).

### CSV columns

Flexible headers are accepted. Useful ones:

- **Name** (or Full Name)
- **Student ID** (or SID / ID)
- **Email**
- **Pod** (optional — must match an Andean pod name; otherwise students are hashed into free desks)

Each pod has **4 desks**. Overflow still appears on the least-filled pod so nobody disappears from the board.

## Exam PDFs

Practice exams live under `exams/midterm1/`, `exams/midterm2/`, and `exams/final/` (sibling `*_sol.pdf` for solutions). `exams/midterm3/` is reserved until an MT3 export exists. See `exams/README.md`.

1. Keep filenames stable once linked in `data/exam_manifest.json`.
2. When you pick a problem for section, extend the manifest with a verified `#page=N` and trap notes:

   ```json
   {
     "id": "FA24-MT1-Q2",
     "exam_title": "Fall 2024 Midterm 1",
     "topic": "…",
     "pdf_file": "exams/midterm1/MT1_Fall2024.pdf",
     "page_number": 3,
     "pdf_url": "exams/midterm1/MT1_Fall2024.pdf#page=3",
     "concept_tags": ["Jupyter", "State"],
     "common_trap": "…",
     "points": 8
   }
   ```

3. On the dashboard, use **Exam problem selector → Open Past Exam** to launch the deep link in a new tab.

## Local preview

Serve the repo root over HTTP (required for `fetch` of CSV/manifest):

```bash
# Python
python3 -m http.server 8080

# or Node
npx --yes serve -l 8080
```

Open http://localhost:8080 and click **Use sample**.

## 50-minute runbook (concepts)

| Time | Segment |
| --- | --- |
| 00:00–00:05 | QR check-in + flipped finger-poll gate |
| 00:05–00:18 | Spot the Bug / exam autopsy (dashboard PDF deep link) |
| 00:18–00:42 | Driver/Navigator sprints + setup checkpoint |
| 00:42–00:47 | Timed solo exit drill |
| 00:47–00:50 | Master solution debrief (protect this buffer) |

**Engagement:** always call a named pod (e.g. “Pod Ukuku”), never cold-call an individual; offer a 20-second pod consultation buffer if a group hesitates.

For the full context-engineering spec, master system prompt, and specialized generators (Spot the Bug, flipped gate), see the Project docs that accompany this course OS (or paste the master prompt into your agent chat when drafting weekly materials).

## Pods

Cóndor · Vicuña · Alpaca · Puma · Zorro Culpeo · Ukuku · Vizcacha · Chinchilla · Guanaco · Taruca · Tunqui · Parina
