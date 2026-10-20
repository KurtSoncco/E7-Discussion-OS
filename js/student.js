/**
 * Student phone view — problem image only (never solutions).
 */
(function () {
  const id = new URLSearchParams(window.location.search).get("id") || "";
  const els = {
    title: document.getElementById("student-title"),
    sub: document.getElementById("student-sub"),
    problem: document.getElementById("problem-image"),
    error: document.getElementById("stage-error"),
  };

  async function init() {
    if (!id) {
      showError("Missing problem id.");
      return;
    }
    let exams;
    try {
      const res = await fetch("data/theme_practice.json", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      exams = await res.json();
    } catch (err) {
      showError(`Could not load problems (${err.message}).`);
      return;
    }
    const ex = exams.find((e) => e.id === id);
    if (!ex || !ex.problem_image) {
      showError("Problem not found or has no screenshot yet.");
      return;
    }
    const disc = String(ex.discussion || "").replace(/^disc/i, "");
    els.title.textContent = ex.topic || ex.id;
    els.sub.textContent = `${disc ? `Disc ${disc}` : ""} · ${ex.exam_title || ""}`.trim();
    els.problem.src = ex.problem_image;
    els.problem.alt = ex.topic || "Problem";
    // Intentionally no solution_image / reveal controls.
  }

  function showError(msg) {
    els.error.hidden = false;
    els.error.textContent = msg;
  }

  init();
})();
