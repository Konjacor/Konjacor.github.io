/* Chuanru Wei — homepage logic */
(function () {
  "use strict";

  const $ = (sel, root) => (root || document).querySelector(sel);

  /* ---- splash (TAKE YOUR TIME) ---------------------------------------- */
  const splash = $("#splash");
  function dismissSplash() {
    if (splash && !splash.classList.contains("hidden")) {
      splash.classList.add("hidden");
    }
  }
  window.addEventListener("load", () => setTimeout(dismissSplash, 1500));
  if (splash) splash.addEventListener("click", dismissSplash);
  // hard fallback so the page is never stuck behind the splash
  setTimeout(dismissSplash, 3500);

  /* ---- theme toggle ---------------------------------------------------- */
  const root = document.documentElement;
  const themeToggle = $("#theme-toggle");
  let saved = null;
  try { saved = localStorage.getItem("cw-theme"); } catch (e) { /* ignore */ }
  if (saved) root.setAttribute("data-theme", saved);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("cw-theme", next); } catch (e) { /* ignore */ }
    });
  }

  /* ---- helpers --------------------------------------------------------- */
  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function highlightMe(text) {
    // wrap "Chuanru Wei" occurrences in a red <span> (own-name emphasis)
    return String(text).replace(/Chuanru\s+Wei/g, '<span class="me">Chuanru Wei</span>');
  }
  function bibLink(text) {
    return '<button class="pub-btn" type="button" data-bibtex="' + encodeURIComponent(text) + '">BibTeX</button>';
  }

  /* ---- render publications -------------------------------------------- */
  function renderPubs() {
    const host = $("#pub-list");
    if (!host) return;
    fetch("data/papers.json")
      .then((r) => r.json())
      .then((papers) => {
        host.innerHTML = papers.map((p) => {
          const actions = [];
          if (p.links && p.links.pdf)    actions.push('<a class="pub-btn" href="' + p.links.pdf + '" target="_blank" rel="noopener">PDF</a>');
          if (p.links && p.links.code)   actions.push('<a class="pub-btn" href="' + p.links.code + '" target="_blank" rel="noopener">Code</a>');
          if (p.links && p.links.doi)    actions.push('<a class="pub-btn" href="' + p.links.doi + '" target="_blank" rel="noopener">DOI</a>');
          actions.push(bibLink(p.bibtex || ""));

          const role = p.role ? '<span class="pub-role">' + p.role + '</span>' : "";
          const note = p.note ? '<p class="pub-note">' + p.note + "</p>" : "";

          return (
            '<article class="pub-item chamfer reveal">' +
              '<div class="pub-topline">' +
                '<span class="pub-venue">' + (p.venue || "") + "</span>" +
                '<span class="pub-year">' + (p.year || "") + "</span>" +
                role +
              "</div>" +
              '<h3 class="pub-title">' + (p.title || "") + "</h3>" +
              '<p class="pub-authors">' + highlightMe(p.authors || "") + "</p>" +
              note +
              '<div class="pub-actions">' + actions.join("") + "</div>" +
            "</article>"
          );
        }).join("");
        bindBibtex(host);
        initReveal();
      })
      .catch(() => { host.innerHTML = '<p class="pub-note">Failed to load publications.</p>'; });
  }

  /* ---- render news ----------------------------------------------------- */
  function renderNews() {
    const host = $("#news-list");
    if (!host) return;
    fetch("data/news.json")
      .then((r) => r.json())
      .then((news) => {
        host.innerHTML = news.map((n) =>
          '<li class="news-item">' +
            '<span class="news-date">' + n.date + "</span>" +
            '<span class="news-text">' + n.text + "</span>" +
          "</li>"
        ).join("");
      })
      .catch(() => { host.innerHTML = ""; });
  }

  /* ---- render projects ------------------------------------------------- */
  function renderProjects() {
    const host = $("#project-grid");
    if (!host) return;
    fetch("data/projects.json")
      .then((r) => r.json())
      .then((projects) => {
        host.innerHTML = projects.map((p) => {
          const links = (p.links || []).map((l) =>
            '<a href="' + l.url + '" target="_blank" rel="noopener">' + l.label + "</a>"
          ).join("");
          return (
            '<article class="project-card chamfer reveal">' +
              (p.tag ? '<span class="project-tag">' + p.tag + "</span>" : "") +
              "<h3>" + p.name + "</h3>" +
              "<p>" + p.desc + "</p>" +
              '<div class="project-links">' + links + "</div>" +
            "</article>"
          );
        }).join("");
        initReveal();
      })
      .catch(() => { host.innerHTML = ""; });
  }

  /* ---- BibTeX copy ----------------------------------------------------- */
  function bindBibtex(scope) {
    (scope || document).querySelectorAll("[data-bibtex]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const bib = decodeURIComponent(btn.getAttribute("data-bibtex"));
        const done = () => {
          const old = btn.textContent;
          btn.textContent = "Copied!";
          setTimeout(() => { btn.textContent = old; }, 1500);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(bib).then(done).catch(() => fallbackCopy(bib, done));
        } else {
          fallbackCopy(bib, done);
        }
      });
    });
  }
  function fallbackCopy(text, done) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); done(); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
  }

  /* ---- scroll reveal --------------------------------------------------- */
  let observer = null;
  function initReveal() {
    const targets = document.querySelectorAll(".reveal:not(.in)");
    if (!("IntersectionObserver" in window)) {
      targets.forEach((t) => t.classList.add("in"));
      return;
    }
    if (!observer) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add("in"); observer.unobserve(e.target); }
        });
      }, { threshold: 0.12 });
    }
    targets.forEach((t) => observer.observe(t));
  }

  /* ---- init ------------------------------------------------------------ */
  renderNews();
  renderPubs();
  renderProjects();
  initReveal();
})();
