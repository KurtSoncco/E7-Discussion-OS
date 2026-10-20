/**
 * Student phone view — problem image only (never solutions).
 */
(function () {
  const id = new URLSearchParams(window.location.search).get("id") || "";

  const els = {
    empty: document.getElementById("empty-state"),
    header: document.getElementById("student-header"),
    main: document.getElementById("student-main"),
    disc: document.getElementById("student-disc"),
    title: document.getElementById("student-title"),
    sub: document.getElementById("student-sub"),
    problem: document.getElementById("problem-image"),
    error: document.getElementById("student-error"),
  };

  async function init() {
    if (!id) {
      els.empty.hidden = false;
      document.title = "E7 · Scan the board QR";
      return;
    }

    let exams;
    try {
      const res = await fetch("data/theme_practice.json", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      exams = await res.json();
    } catch (err) {
      showError(`Could not load problems (${err.message}). Check your connection and try again.`);
      return;
    }

    const ex = exams.find((e) => e.id === id);
    if (!ex || !ex.problem_image) {
      showError("Problem not found or has no screenshot yet. Ask your GSI to open Stage again.");
      return;
    }

    const discNum = String(ex.discussion || "").replace(/^disc/i, "");
    const discLabel = discNum ? `Disc ${discNum}` : "";
    const theme = ex.theme || "";

    els.disc.textContent = [discLabel, theme].filter(Boolean).join(" · ");
    els.title.textContent = ex.topic || ex.id;
    els.sub.textContent = ex.exam_title || "";
    document.title = `${discLabel ? discLabel + " · " : ""}${ex.topic || "E7 problem"}`;

    els.problem.alt = ex.topic || "Practice problem";
    els.problem.onload = () => {
      els.problem.classList.add("is-loaded");
    };
    els.problem.src = ex.problem_image;

    els.header.hidden = false;
    els.main.hidden = false;
    // Intentionally no solution_image / reveal controls.
  }

  function showError(msg) {
    els.empty.hidden = true;
    els.header.hidden = true;
    els.main.hidden = true;
    els.error.hidden = false;
    els.error.textContent = msg;
  }

  init();
})();
