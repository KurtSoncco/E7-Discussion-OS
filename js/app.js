/**
 * E7 Discussion OS — GSI dashboard
 * Local CSV → Andean pods (fair rotation) · Disc practice → Open Stage
 */
(function () {
  const STORAGE_KEY = "e7-checkin-csv-url";
  const CALLED_KEY = "e7-called-pods";
  const STAGE_CALL_KEY = "e7-stage-call";
  const QUEUE_KEY = "e7-stage-queue";
  const SAMPLE_CSV_URL = "data/checkin_sample.csv";
  const CONSULT_SEC = 20;

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

  const els = {
    csvUrl: document.getElementById("csv-url"),
    csvFile: document.getElementById("csv-file"),
    csvDrop: document.getElementById("csv-drop"),
    csvFileName: document.getElementById("csv-file-name"),
    saveUrl: document.getElementById("btn-save-url"),
    loadCsv: document.getElementById("btn-load-csv"),
    loadSample: document.getElementById("btn-load-sample"),
    status: document.getElementById("checkin-status"),
    count: document.getElementById("checkin-count"),
    podGrid: document.getElementById("pod-grid"),
    pickPod: document.getElementById("btn-pick-pod"),
    clearPick: document.getElementById("btn-clear-pick"),
    resetCalled: document.getElementById("btn-reset-called"),
    calledList: document.getElementById("called-list"),
    pickedPanel: document.getElementById("picked-panel"),
    pickedName: document.getElementById("picked-name"),
    pickedEnglish: document.getElementById("picked-english"),
    pickedMembers: document.getElementById("picked-members"),
    discFilter: document.getElementById("disc-filter"),
    examSelect: document.getElementById("exam-select"),
    examCount: document.getElementById("exam-count"),
    openExam: document.getElementById("btn-open-exam"),
    openStage: document.getElementById("btn-open-stage"),
    addQueue: document.getElementById("btn-add-queue"),
    clearQueue: document.getElementById("btn-clear-queue"),
    queuePanel: document.getElementById("queue-panel"),
    queueList: document.getElementById("queue-list"),
    examMeta: document.getElementById("exam-meta"),
    solControls: document.getElementById("sol-controls"),
  };

  let roster = window.E7Pods.emptyPodRoster();
  let exams = [];
  let selectedPodId = null;
  let calledIds = loadCalled();
  let queueIds = loadQueue();

  function init() {
    const fromQuery = new URLSearchParams(window.location.search).get("csv");
    const saved = localStorage.getItem(STORAGE_KEY);
    els.csvUrl.value = fromQuery || saved || "";

    if (fromQuery) {
      localStorage.setItem(STORAGE_KEY, fromQuery);
      loadCheckInUrl(fromQuery);
    }

    renderPods();
    renderCalledList();
    renderQueue();
    bindEvents();
    loadExams();
  }

  function bindEvents() {
    els.saveUrl.addEventListener("click", () => {
      const url = els.csvUrl.value.trim();
      localStorage.setItem(STORAGE_KEY, url);
      setStatus("Saved check-in URL to this browser.", "ok");
    });

    els.loadCsv.addEventListener("click", () => {
      loadCheckInUrl(els.csvUrl.value.trim());
    });

    els.loadSample.addEventListener("click", () => {
      els.csvUrl.value = SAMPLE_CSV_URL;
      loadCheckInUrl(SAMPLE_CSV_URL);
    });

    els.csvFile.addEventListener("change", () => {
      const file = els.csvFile.files && els.csvFile.files[0];
      if (file) readLocalCsv(file);
    });

    els.csvDrop.addEventListener("dragover", (e) => {
      e.preventDefault();
      els.csvDrop.classList.add("is-dragover");
    });
    els.csvDrop.addEventListener("dragleave", () => {
      els.csvDrop.classList.remove("is-dragover");
    });
    els.csvDrop.addEventListener("drop", (e) => {
      e.preventDefault();
      els.csvDrop.classList.remove("is-dragover");
      const file = e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) readLocalCsv(file);
    });
    els.csvDrop.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        els.csvFile.click();
      }
    });

    els.pickPod.addEventListener("click", pickRandomPod);
    els.clearPick.addEventListener("click", clearPick);
    els.resetCalled.addEventListener("click", () => {
      calledIds = [];
      saveCalled();
      renderCalledList();
      renderPods();
      setStatus("Cleared called-pod checklist for this session.", "ok");
    });

    els.discFilter.addEventListener("change", populateExamSelect);
    els.examSelect.addEventListener("change", updateExamMeta);
    els.openExam.addEventListener("click", openSelectedExam);
    els.openStage.addEventListener("click", openStage);
    els.addQueue.addEventListener("click", addSelectedToQueue);
    els.clearQueue.addEventListener("click", () => {
      queueIds = [];
      saveQueue();
      renderQueue();
    });

    els.podGrid.addEventListener("click", (e) => {
      const card = e.target.closest("[data-pod-id]");
      if (!card) return;
      callPod(card.dataset.podId, { scroll: false, fromPicker: false });
    });
  }

  function readLocalCsv(file) {
    setStatus(`Reading ${file.name}…`, "busy");
    const reader = new FileReader();
    reader.onload = () => {
      try {
        applyStudents(String(reader.result || ""), file.name);
      } catch (err) {
        console.error(err);
        setStatus(`Could not parse ${file.name} (${err.message}).`, "err");
      }
    };
    reader.onerror = () => setStatus(`Could not read ${file.name}.`, "err");
    reader.readAsText(file);
  }

  async function loadCheckInUrl(url) {
    if (!url) {
      setStatus("Choose a local CSV, or expand Secondary to load a URL / sample.", "warn");
      return;
    }
    setStatus("Loading check-in…", "busy");
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      applyStudents(text, url);
    } catch (err) {
      console.error(err);
      setStatus(
        `Could not load CSV (${err.message}). Prefer Choose CSV file for classroom.`,
        "err"
      );
    }
  }

  function applyStudents(text, sourceLabel) {
    const students = window.E7Pods.parseCheckInCsv(text);
    roster = window.E7Pods.mapStudentsToPods(students);
    els.count.textContent = String(students.length);
    if (els.csvFileName) {
      els.csvFileName.hidden = false;
      els.csvFileName.textContent = `Loaded: ${sourceLabel}`;
    }
    renderPods();
    renderCalledList();
    if (selectedPodId) {
      const still = roster.find((p) => p.id === selectedPodId);
      if (still) callPod(selectedPodId, { scroll: false, fromPicker: false, markCalled: false });
    }
    setStatus(
      `Loaded ${students.length} student${students.length === 1 ? "" : "s"} from ${sourceLabel}.`,
      "ok"
    );
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
    return exams.filter((ex) => !disc || ex.discussion === disc);
  }

  function discShort(discussion) {
    const n = String(discussion || "").replace(/^disc/i, "");
    return n ? `Disc ${n}` : "Disc";
  }

  function populateExamSelect() {
    const list = filteredExams();
    const prev = els.examSelect.value;
    els.examSelect.innerHTML =
      '<option value="">Select a practice problem…</option>' +
      list
        .map((ex) => {
          const imgMark = ex.problem_image ? "[img] " : "";
          const label = `${imgMark}${discShort(ex.discussion)} · ${ex.topic} · ${ex.exam_title}`;
          return `<option value="${escapeAttr(ex.id)}">${escapeHtml(label)}</option>`;
        })
        .join("");

    if (list.some((ex) => ex.id === prev)) els.examSelect.value = prev;

    if (els.examCount) {
      const discLabel = els.discFilter.value
        ? DISC_THEMES.find((d) => d.id === els.discFilter.value)?.label || els.discFilter.value
        : "All Disc 01–13";
      const withImg = list.filter((ex) => ex.problem_image).length;
      els.examCount.textContent = `${list.length} problem${list.length === 1 ? "" : "s"} · ${withImg} with images · ${discLabel}`;
    }
    updateExamMeta();
  }

  function loadCalled() {
    try {
      const raw = JSON.parse(localStorage.getItem(CALLED_KEY) || "[]");
      return Array.isArray(raw) ? raw.map(String) : [];
    } catch {
      return [];
    }
  }

  function saveCalled() {
    localStorage.setItem(CALLED_KEY, JSON.stringify(calledIds));
  }

  function loadQueue() {
    try {
      const raw = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
      return Array.isArray(raw) ? raw.map(String) : [];
    } catch {
      return [];
    }
  }

  function saveQueue() {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queueIds));
  }

  function renderCalledList() {
    const pods = window.E7Pods.PODS || [];
    els.calledList.innerHTML = pods
      .map((pod) => {
        const on = calledIds.includes(pod.id);
        return `<li class="called-chip${on ? " is-called" : ""}" data-pod-id="${escapeAttr(pod.id)}">${escapeHtml(
          pod.name
        )}</li>`;
      })
      .join("");
  }

  function renderPods() {
    els.podGrid.innerHTML = roster
      .map((pod) => {
        const filled = pod.members.length;
        const isSelected = pod.id === selectedPodId;
        const wasCalled = calledIds.includes(pod.id);
        const memberPreview = pod.members
          .slice(0, 4)
          .map((m) => `<li><span class="desk">D${m.desk}</span> ${escapeHtml(m.name)}</li>`)
          .join("");

        return `
          <article class="pod-card${isSelected ? " is-selected" : ""}${wasCalled ? " is-called" : ""}" data-pod-id="${pod.id}" tabindex="0" role="button" aria-pressed="${isSelected}">
            <header class="pod-card__head">
              <h3 class="pod-card__name">${escapeHtml(pod.name)}</h3>
              <span class="pod-card__count">${filled}/${pod.desks}${wasCalled ? " · called" : ""}</span>
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
    const base = withMembers.length ? withMembers : roster;
    if (!base.length) return;

    const uncalled = base.filter((p) => !calledIds.includes(p.id));
    const pool = uncalled.length ? uncalled : base;

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
        callPod(final.id, { scroll: true, fromPicker: true });
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

  function callPod(podId, { scroll, fromPicker, markCalled = true }) {
    selectedPodId = podId;
    const pod = roster.find((p) => p.id === podId);
    if (!pod) return;

    if (markCalled && !calledIds.includes(podId)) {
      calledIds.push(podId);
      saveCalled();
    }

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
      : '<li class="empty">No checked-in members yet</li>';

    renderCalledList();
    renderPods();

    const payload = {
      podId: pod.id,
      name: pod.name,
      english: pod.english,
      members: pod.members.map((m) => ({ name: m.name, desk: m.desk })),
      calledAt: Date.now(),
      consultEndsAt: Date.now() + CONSULT_SEC * 1000,
      fromPicker: !!fromPicker,
    };
    localStorage.setItem(STAGE_CALL_KEY, JSON.stringify(payload));
  }

  function clearPick() {
    selectedPodId = null;
    els.pickedPanel.hidden = true;
    for (const card of els.podGrid.querySelectorAll(".pod-card")) {
      card.classList.remove("is-selected", "is-pulse");
      card.setAttribute("aria-pressed", "false");
    }
    localStorage.removeItem(STAGE_CALL_KEY);
  }

  function updateExamMeta() {
    const id = els.examSelect.value;
    const ex = exams.find((e) => e.id === id);
    els.solControls.hidden = !ex;
    els.openExam.disabled = !(ex && ex.pdf_url);
    els.openStage.disabled = !(ex && ex.problem_image);
    els.addQueue.disabled = !ex;

    if (!ex) {
      els.examMeta.innerHTML =
        "Choose a Disc week and problem, then Open Stage for the projector.";
      return;
    }

    const discMeta = DISC_THEMES.find((d) => d.id === ex.discussion);
    const pts = ex.points != null ? `${ex.points} pts` : "pts n/a";
    const stageNote = ex.problem_image
      ? "Open Stage shows the problem full-bleed; reveal solutions only there (or press R)."
      : "No screenshot yet — Source PDF only for this entry.";
    els.examMeta.innerHTML = `
      <div class="exam-meta__row"><strong>${escapeHtml(ex.id)}</strong> · ${escapeHtml(pts)} · page ${escapeHtml(
        String(ex.page_number)
      )}</div>
      <div class="exam-meta__row">${escapeHtml(discMeta ? discMeta.label : discShort(ex.discussion))}</div>
      <div class="exam-meta__tags">${(ex.concept_tags || [])
        .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
        .join("")}</div>
      <p class="exam-meta__trap"><span>Common trap:</span> ${escapeHtml(ex.common_trap || "—")}</p>
      <p class="exam-meta__trap">${escapeHtml(stageNote)}</p>
    `;
  }

  function openStage() {
    const id = els.examSelect.value;
    const ex = exams.find((e) => e.id === id);
    if (!ex || !ex.problem_image) return;
    // Ensure current id is first in queue context for Next/Prev
    if (!queueIds.includes(id)) {
      // open without forcing into queue
    }
    const params = new URLSearchParams({ id });
    if (queueIds.length) params.set("queue", queueIds.join(","));
    window.open(`stage.html?${params.toString()}`, "e7-stage", "noopener");
  }

  function openSelectedExam() {
    const id = els.examSelect.value;
    const ex = exams.find((e) => e.id === id);
    if (!ex || !ex.pdf_url) return;
    window.open(ex.pdf_url, "_blank", "noopener,noreferrer");
  }

  function addSelectedToQueue() {
    const id = els.examSelect.value;
    if (!id || queueIds.includes(id)) {
      renderQueue();
      return;
    }
    queueIds.push(id);
    saveQueue();
    renderQueue();
  }

  function renderQueue() {
    if (!queueIds.length) {
      els.queuePanel.hidden = true;
      els.queueList.innerHTML = "";
      return;
    }
    els.queuePanel.hidden = false;
    els.queueList.innerHTML = queueIds
      .map((qid, i) => {
        const ex = exams.find((e) => e.id === qid);
        const label = ex
          ? `${discShort(ex.discussion)} · ${ex.topic}`
          : qid;
        return `<li><button type="button" class="queue-item" data-qid="${escapeAttr(qid)}">${i + 1}. ${escapeHtml(
          label
        )}</button></li>`;
      })
      .join("");

    els.queueList.querySelectorAll("[data-qid]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const qid = btn.getAttribute("data-qid");
        if ([...els.examSelect.options].some((o) => o.value === qid)) {
          els.examSelect.value = qid;
          updateExamMeta();
        }
        const params = new URLSearchParams({ id: qid, queue: queueIds.join(",") });
        window.open(`stage.html?${params.toString()}`, "e7-stage", "noopener");
      });
    });
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
