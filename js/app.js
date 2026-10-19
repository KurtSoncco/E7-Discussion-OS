/**
 * E7 Discussion OS — GSI dashboard
 * Check-in CSV → Andean pods · Random Pod Picker · Theme practice bank (Disc 01–13)
 */
(function () {
  const STORAGE_KEY = "e7-checkin-csv-url";
  const SAMPLE_CSV_URL = "data/checkin_sample.csv";

  const DISC_THEMES = [
    { id: "disc01", label: "Disc 01 — Jupyter Notebook" },
    { id: "disc02", label: "Disc 02 — Python Basics" },
    { id: "disc03", label: "Disc 03 — Data Structures & Arrays" },
    { id: "disc04", label: "Disc 04 — Functions and Conditionals" },
    { id: "disc05", label: "Disc 05 — Iteration and Recursion" },
    { id: "disc06", label: "Disc 06 — Number Representation" },
    { id: "disc07", label: "Disc 07 — Exceptions, Files, Plotting" },
    { id: "disc08", label: "Disc 08 — MATLAB Introduction" },
    { id: "disc09", label: "Disc 09 — MATLAB" },
    { id: "disc10", label: "Disc 10 — Linear Algebra" },
    { id: "disc11", label: "Disc 11 — Series, Root Finding" },
    { id: "disc12", label: "Disc 12 — Differentiation, Integration" },
    { id: "disc13", label: "Disc 13 — ODE" },
  ];

  const USE_LABELS = {
    spot_the_bug: "Spot the Bug",
    sprint: "Sprint",
    exit_drill: "Exit drill",
    flipped_gate: "Flipped gate",
  };

  const els = {
    csvUrl: document.getElementById("csv-url"),
    saveUrl: document.getElementById("btn-save-url"),
    loadCsv: document.getElementById("btn-load-csv"),
    loadSample: document.getElementById("btn-load-sample"),
    status: document.getElementById("checkin-status"),
    count: document.getElementById("checkin-count"),
    podGrid: document.getElementById("pod-grid"),
    pickPod: document.getElementById("btn-pick-pod"),
    clearPick: document.getElementById("btn-clear-pick"),
    pickedPanel: document.getElementById("picked-panel"),
    pickedName: document.getElementById("picked-name"),
    pickedEnglish: document.getElementById("picked-english"),
    pickedMembers: document.getElementById("picked-members"),
    discFilter: document.getElementById("disc-filter"),
    useFilter: document.getElementById("use-filter"),
    examSelect: document.getElementById("exam-select"),
    examCount: document.getElementById("exam-count"),
    openExam: document.getElementById("btn-open-exam"),
    examMeta: document.getElementById("exam-meta"),
  };

  let roster = window.E7Pods.emptyPodRoster();
  let exams = [];
  let selectedPodId = null;

  function init() {
    const fromQuery = new URLSearchParams(window.location.search).get("csv");
    const saved = localStorage.getItem(STORAGE_KEY);
    els.csvUrl.value = fromQuery || saved || SAMPLE_CSV_URL;

    if (fromQuery) {
      localStorage.setItem(STORAGE_KEY, fromQuery);
    }

    renderPods();
    bindEvents();
    loadExams();
    loadCheckIn(els.csvUrl.value);
  }

  function bindEvents() {
    els.saveUrl.addEventListener("click", () => {
      const url = els.csvUrl.value.trim();
      localStorage.setItem(STORAGE_KEY, url);
      setStatus("Saved check-in URL to this browser.", "ok");
    });

    els.loadCsv.addEventListener("click", () => {
      loadCheckIn(els.csvUrl.value.trim());
    });

    els.loadSample.addEventListener("click", () => {
      els.csvUrl.value = SAMPLE_CSV_URL;
      loadCheckIn(SAMPLE_CSV_URL);
    });

    els.pickPod.addEventListener("click", pickRandomPod);
    els.clearPick.addEventListener("click", clearPick);

    els.discFilter.addEventListener("change", populateExamSelect);
    els.useFilter.addEventListener("change", populateExamSelect);
    els.examSelect.addEventListener("change", updateExamMeta);
    els.openExam.addEventListener("click", openSelectedExam);

    els.podGrid.addEventListener("click", (e) => {
      const card = e.target.closest("[data-pod-id]");
      if (!card) return;
      highlightPod(card.dataset.podId, { scroll: false });
    });
  }

  async function loadCheckIn(url) {
    if (!url) {
      setStatus("Set a Google Sheets CSV URL or use the sample.", "warn");
      return;
    }

    setStatus("Loading check-in…", "busy");
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const students = window.E7Pods.parseCheckInCsv(text);
      roster = window.E7Pods.mapStudentsToPods(students);
      els.count.textContent = String(students.length);
      renderPods();
      if (selectedPodId) highlightPod(selectedPodId, { scroll: false });
      setStatus(
        `Loaded ${students.length} student${students.length === 1 ? "" : "s"} from check-in.`,
        "ok"
      );
    } catch (err) {
      console.error(err);
      setStatus(
        `Could not load CSV (${err.message}). For Google Sheets, publish as CSV or use a CORS-friendly URL. Try the sample for offline demo.`,
        "err"
      );
    }
  }

  async function loadExams() {
    try {
      const res = await fetch("data/theme_practice.json", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      exams = await res.json();

      els.discFilter.innerHTML =
        '<option value="">All Disc 01–13</option>' +
        DISC_THEMES.map(
          (d) => `<option value="${escapeAttr(d.id)}">${escapeHtml(d.label)}</option>`
        ).join("");

      populateExamSelect();
    } catch (err) {
      console.error(err);
      els.examMeta.textContent = "Could not load theme_practice.json.";
      if (els.examCount) els.examCount.textContent = "";
    }
  }

  function filteredExams() {
    const disc = els.discFilter.value;
    const use = els.useFilter.value;
    return exams.filter((ex) => {
      if (disc && ex.discussion !== disc) return false;
      if (use && ex.prompt_use !== use) return false;
      return true;
    });
  }

  function populateExamSelect() {
    const list = filteredExams();
    const prev = els.examSelect.value;
    els.examSelect.innerHTML =
      '<option value="">Select a practice problem…</option>' +
      list
        .map((ex) => {
          const disc = (ex.discussion || "").replace("disc", "D");
          const use = USE_LABELS[ex.prompt_use] || ex.prompt_use || "";
          const label = `${disc} · ${ex.exam_title} — ${ex.topic}${use ? ` (${use})` : ""}`;
          return `<option value="${escapeAttr(ex.id)}">${escapeHtml(label)}</option>`;
        })
        .join("");

    if (list.some((ex) => ex.id === prev)) {
      els.examSelect.value = prev;
    }

    if (els.examCount) {
      const discLabel = els.discFilter.value
        ? DISC_THEMES.find((d) => d.id === els.discFilter.value)?.label || els.discFilter.value
        : "All Disc 01–13";
      els.examCount.textContent = `${list.length} problem${list.length === 1 ? "" : "s"} · ${discLabel}`;
    }
    updateExamMeta();
  }

  function renderPods() {
    els.podGrid.innerHTML = roster
      .map((pod) => {
        const filled = pod.members.length;
        const isSelected = pod.id === selectedPodId;
        const memberPreview = pod.members
          .slice(0, 4)
          .map((m) => `<li><span class="desk">D${m.desk}</span> ${escapeHtml(m.name)}</li>`)
          .join("");

        return `
          <article class="pod-card${isSelected ? " is-selected" : ""}" data-pod-id="${pod.id}" tabindex="0" role="button" aria-pressed="${isSelected}">
            <header class="pod-card__head">
              <h3 class="pod-card__name">${escapeHtml(pod.name)}</h3>
              <span class="pod-card__count">${filled}/${pod.desks}</span>
            </header>
            <p class="pod-card__english">${escapeHtml(pod.english)}</p>
            <ul class="pod-card__members">${memberPreview || '<li class="empty">Awaiting check-in</li>'}</ul>
          </article>
        `;
      })
      .join("");
  }

  function pickRandomPod() {
    const withMembers = roster.filter((p) => p.members.length > 0);
    const pool = withMembers.length ? withMembers : roster;
    if (!pool.length) return;

    // Brief shuffle animation across a few cards, then land
    const flashes = 8;
    let i = 0;
    els.pickPod.disabled = true;

    const tick = () => {
      const candidate = pool[Math.floor(Math.random() * pool.length)];
      setCardPulse(candidate.id);
      i++;
      if (i < flashes) {
        setTimeout(tick, 70 + i * 12);
      } else {
        const final = pool[Math.floor(Math.random() * pool.length)];
        highlightPod(final.id, { scroll: true });
        els.pickPod.disabled = false;
      }
    };
    tick();
  }

  function setCardPulse(podId) {
    for (const card of els.podGrid.querySelectorAll(".pod-card")) {
      card.classList.toggle("is-pulse", card.dataset.podId === podId);
    }
  }

  function highlightPod(podId, { scroll }) {
    selectedPodId = podId;
    const pod = roster.find((p) => p.id === podId);
    if (!pod) return;

    for (const card of els.podGrid.querySelectorAll(".pod-card")) {
      const on = card.dataset.podId === podId;
      card.classList.toggle("is-selected", on);
      card.classList.remove("is-pulse");
      card.setAttribute("aria-pressed", String(on));
      if (on && scroll) card.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    els.pickedPanel.hidden = false;
    els.pickedName.textContent = `Pod ${pod.name}`;
    els.pickedEnglish.textContent = pod.english;
    els.pickedMembers.innerHTML = pod.members.length
      ? pod.members
          .map(
            (m) =>
              `<li><span class="desk">Desk ${m.desk}</span><span class="member-name">${escapeHtml(m.name)}</span>${
                m.studentId ? `<span class="member-id">${escapeHtml(m.studentId)}</span>` : ""
              }</li>`
          )
          .join("")
      : "<li class=\"empty\">No checked-in members yet</li>";
  }

  function clearPick() {
    selectedPodId = null;
    els.pickedPanel.hidden = true;
    for (const card of els.podGrid.querySelectorAll(".pod-card")) {
      card.classList.remove("is-selected", "is-pulse");
      card.setAttribute("aria-pressed", "false");
    }
  }

  function updateExamMeta() {
    const id = els.examSelect.value;
    const ex = exams.find((e) => e.id === id);
    els.openExam.disabled = !ex;
    if (!ex) {
      els.examMeta.innerHTML =
        "Choose a Disc week (or All) then a problem to see trap notes and open the PDF deep link.";
      return;
    }
    const discMeta = DISC_THEMES.find((d) => d.id === ex.discussion);
    const useLabel = USE_LABELS[ex.prompt_use] || ex.prompt_use || "—";
    const pts = ex.points != null ? `${ex.points} pts` : "pts n/a";
    els.examMeta.innerHTML = `
      <div class="exam-meta__row"><strong>${escapeHtml(ex.id)}</strong> · ${escapeHtml(pts)} · page ${escapeHtml(
        String(ex.page_number)
      )}</div>
      <div class="exam-meta__row">${escapeHtml(discMeta ? discMeta.label : ex.discussion || "")} · <em>${escapeHtml(
        useLabel
      )}</em></div>
      <div class="exam-meta__tags">${(ex.concept_tags || [])
        .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
        .join("")}</div>
      <p class="exam-meta__trap"><span>Common trap:</span> ${escapeHtml(ex.common_trap || "—")}</p>
      <code class="exam-meta__url">${escapeHtml(ex.pdf_url)}</code>
    `;
  }

  function openSelectedExam() {
    const id = els.examSelect.value;
    const ex = exams.find((e) => e.id === id);
    if (!ex) return;
    // Relative deep link works on Pages and local static servers
    window.open(ex.pdf_url, "_blank", "noopener,noreferrer");
  }

  function setStatus(msg, kind) {
    els.status.textContent = msg;
    els.status.dataset.kind = kind || "";
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(str) {
    return escapeHtml(str).replace(/'/g, "&#39;");
  }

  init();
})();
