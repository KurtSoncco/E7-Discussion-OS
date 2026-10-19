# Problem & solution screenshots

Phone-friendly WebP crops for the theme practice bank.

```text
media/
  problems/<id>.webp    # shown inline on load
  solutions/<id>.webp   # hidden until GSI clicks Reveal solution
```

- Source of truth remains the PDFs under `exams/`.
- v1 images are **full exam pages** (2× raster) at the mapped `#page=N` (or `solution_page` when fill-in answers live on the next page).
- Paths are referenced from `data/theme_practice.json` as `problem_image` / `solution_image`.

## Coverage

- All **Spot the Bug** entries + full **Disc 05** (kept)
- Full **Disc 09–13** (every `theme_practice` entry): problem + solution WebP pairs
- Earlier discs (01–08) beyond Spot-the-Bug / Disc 05 may still be PDF-only until a later pass
