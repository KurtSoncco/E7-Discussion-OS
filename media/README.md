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

## Coverage (this pass)

All **Spot the Bug** entries + full **Disc 05** (union = 14 problem/sol pairs). Remaining theme entries still open via source PDF until screenshots are added.
