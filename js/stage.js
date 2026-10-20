/**
 * E7 Stage — projector problem view with GSI-only solution reveal.
 * Reads called-pod + consult timer from localStorage (dashboard on same laptop).
 */
(function () {
  const STAGE_CALL_KEY = "e7-stage-call";

  const params = new URLSearchParams(window.location.search);
  const startId = params.get("id") || "";
  const queue = (params.get("queue") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const els = {
    title: document.getElementById("stage-title"),
    sub: document.getElementById("stage-sub"),
    problem: document.getElementById("problem-image"),
    solution: document.getElementById("solution-image"),
    solutionWrap: document.getElementById("solution-wrap"),
    error: document.getElementById("stage-error"),
    reveal: document.getElementById("btn-reveal"),
    hide: document.getElementById("btn-hide"),
    prev: document.getElementById("btn-prev"),
    next: document.getElementById("btn-next"),
    linkStudent: document.getElementById("link-student"),
    linkPdf: document.getElementById("link-pdf"),
    qr: document.getElementById("qr-canvas"),
    callBanner: document.getElementById("stage-call"),
    callName: document.getElementById("call-name"),
    callEnglish: document.getElementById("call-english"),
    timer: document.getElementById("stage-timer"),
    timerValue: document.getElementById("timer-value"),
  };

  let exams = [];
  let currentId = startId;
  let revealed = false;
  let timerInterval = null;

  async function init() {
    try {
      const res = await fetch("data/theme_practice.json", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      exams = await res.json();
    } catch (err) {
      showError(`Could not load theme bank (${err.message}).`);
      return;
    }

    if (!currentId && queue.length) currentId = queue[0];
    if (!currentId) {
      showError("No problem id. Open Stage from the dashboard with a selected problem.");
      return;
    }

    renderProblem();
    bind();
    syncCallBanner();
    window.addEventListener("storage", (e) => {
      if (e.key === STAGE_CALL_KEY) syncCallBanner();
    });
    // Poll lightly in case same-tab storage events don't fire
    setInterval(syncCallBanner, 800);
  }

  function bind() {
    els.reveal.addEventListener("click", () => setRevealed(true));
    els.hide.addEventListener("click", () => setRevealed(false));
    els.prev.addEventListener("click", () => step(-1));
    els.next.addEventListener("click", () => step(1));
    window.addEventListener("keydown", (e) => {
      if (e.key === "r" || e.key === "R") {
        if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
        e.preventDefault();
        setRevealed(!revealed);
      } else if (e.key === "ArrowRight") {
        step(1);
      } else if (e.key === "ArrowLeft") {
        step(-1);
      }
    });
  }

  function findExam(id) {
    return exams.find((e) => e.id === id);
  }

  function discLabel(discussion) {
    const n = String(discussion || "").replace(/^disc/i, "");
    return n ? `Disc ${n}` : "";
  }

  function renderProblem() {
    const ex = findExam(currentId);
    revealed = false;
    if (!ex) {
      showError(`Unknown problem id: ${currentId}`);
      return;
    }
    if (!ex.problem_image) {
      showError(`No problem image for ${ex.id}. Use Source PDF from the dashboard.`);
      return;
    }

    els.error.hidden = true;
    els.title.textContent = ex.topic || ex.id;
    els.sub.textContent = `${discLabel(ex.discussion)} · ${ex.exam_title || ""}`.trim();
    els.problem.src = ex.problem_image;
    els.problem.alt = ex.topic || "Problem";

    if (ex.solution_image) {
      els.solution.src = ex.solution_image;
      els.reveal.disabled = false;
      els.reveal.textContent = "Reveal solution (R)";
    } else {
      els.solution.removeAttribute("src");
      els.reveal.disabled = true;
      els.reveal.textContent = "No solution image";
    }
    setRevealed(false);

    const studentUrl = new URL(`student.html?id=${encodeURIComponent(currentId)}`, window.location.href).href;
    els.linkStudent.href = studentUrl;
    if (ex.pdf_url) {
      els.linkPdf.hidden = false;
      els.linkPdf.href = ex.pdf_url;
    } else {
      els.linkPdf.hidden = true;
    }

    updateNav();
    drawQr(studentUrl);
  }

  function setRevealed(on) {
    const ex = findExam(currentId);
    revealed = !!(on && ex && ex.solution_image);
    els.solutionWrap.hidden = !revealed;
    els.hide.hidden = !revealed;
    els.reveal.hidden = revealed || !(ex && ex.solution_image);
  }

  function updateNav() {
    const idx = queue.indexOf(currentId);
    const hasQueue = queue.length > 1 && idx >= 0;
    els.prev.disabled = !hasQueue || idx <= 0;
    els.next.disabled = !hasQueue || idx >= queue.length - 1;
  }

  function step(dir) {
    const idx = queue.indexOf(currentId);
    if (idx < 0) return;
    const next = idx + dir;
    if (next < 0 || next >= queue.length) return;
    currentId = queue[next];
    const url = new URL(window.location.href);
    url.searchParams.set("id", currentId);
    if (queue.length) url.searchParams.set("queue", queue.join(","));
    history.replaceState(null, "", url.toString());
    renderProblem();
  }

  function drawQr(text) {
    if (!els.qr || typeof QRCode === "undefined") return;
    QRCode.toCanvas(
      els.qr,
      text,
      {
        width: 132,
        margin: 1,
        color: { dark: "#1a2421", light: "#ffffff" },
      },
      (err) => {
        if (err) console.error(err);
      }
    );
  }

  function syncCallBanner() {
    let data = null;
    try {
      data = JSON.parse(localStorage.getItem(STAGE_CALL_KEY) || "null");
    } catch {
      data = null;
    }
    if (!data || !data.name) {
      els.callBanner.hidden = true;
      stopTimer();
      return;
    }
    els.callBanner.hidden = false;
    els.callName.textContent = `Pod ${data.name}`;
    els.callEnglish.textContent = data.english || "";
    tickTimer(data.consultEndsAt);
  }

  function tickTimer(endsAt) {
    stopTimer();
    if (!endsAt) {
      els.timer.hidden = true;
      return;
    }
    const update = () => {
      const left = Math.ceil((endsAt - Date.now()) / 1000);
      if (left <= 0) {
        els.timer.hidden = true;
        els.timerValue.textContent = "0";
        stopTimer();
        return;
      }
      els.timer.hidden = false;
      els.timerValue.textContent = String(left);
    };
    update();
    timerInterval = setInterval(update, 250);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function showError(msg) {
    els.error.hidden = false;
    els.error.textContent = msg;
  }

  init();
})();
