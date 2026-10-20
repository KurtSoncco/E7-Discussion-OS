# E7 Discussion OS

GSI dashboard + **projector Stage** for **E7 (Introduction to Computer Programming for Engineers in Python)** discussion: local CSV check-in, 12 Andean fauna pods, Disc-week practice screenshots, fair pod rotation, and solution reveal **only on Stage**.

**Live site:** https://kurtsoncco.github.io/E7-Discussion-OS/

## Classroom how-to (50 minutes)

1. Open the **dashboard** on the projector laptop.
2. **Choose CSV file** (or drag-drop) your check-in export → pods fill.
3. Filter **Discussion week** → pick a problem → **Open Stage** (new tab).
4. Students scan the Stage **QR** for the same problem on phones (problem only).
5. **Call random pod** (fair rotation) → 20s consult timer on Stage → discuss.
6. On Stage, **Reveal solution** or press **`R`**. Phones never see the sol.
7. Optional: **Add to queue** several problems → Stage **Prev/Next**.

## What’s in this repo

| Path | Role |
| --- | --- |
| `index.html` + `js/app.js` | GSI dashboard (local CSV, pods, Disc picker) |
| `stage.html` + `js/stage.js` | Projector Stage (problem, reveal, QR, called-pod banner) |
| `student.html` + `js/student.js` | Phone view — **problem only** |
| `js/pod_data.js` | 12 Andean pods + CSV → seat mapping |
| `data/theme_practice.json` | Disc 01–13 theme bank + image paths |
| `media/problems/` · `media/solutions/` | WebP screenshots |
| `exams/midterm1/` · `midterm2/` · `final/` | Source PDFs |
| `.github/workflows/deploy.yml` | Deploy `main` to GitHub Pages |

## Check-in CSV

**Primary (classroom):** Choose / drop your session attendance `.csv` on the dashboard.

**Secondary:** URL load, or **Use sample** (`data/session_attendance_present_sample.csv` — Present-only demo). Legacy simple roster: `data/checkin_sample.csv`.

### Session attendance export (current)

Headers like: `last_name,first_name,student_email,gps_distance,checked_in_at,status`

- Name = `first_name` + `last_name`
- Email = `student_email`
- **Only `status=Present`** rows are seated (Absent ignored)
- No student id / pod columns → hash-assign into the 12 Andean pods

### Simple roster (still supported)

- **Name**, **Student ID**, **Email**, optional **Pod**

Each pod has **4 desks**.

## Disc practice & Stage

- Filter by **Discussion week** only (no prompt-use labels in the UI).
- **Open Stage** is the primary CTA; **Source PDF** is secondary.
- Solutions appear only on Stage after **Reveal** / `R`. Student pages never load solution images.
- Fair rotation: picker prefers pods not yet called this session; checklist shows who has been called. **Reset called** clears the session list.

## Local preview

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Pods

Cóndor · Vicuña · Alpaca · Puma · Zorro Culpeo · Ukuku · Vizcacha · Chinchilla · Guanaco · Taruca · Tunqui · Parina
