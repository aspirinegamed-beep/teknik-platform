(function () {
  "use strict";

  const LANGS = ["en", "ar", "fr", "es"];
  const LANG_KEY = "aiNovaLang";
  const THEME_KEY = "aiNovaTheme";

  function getLang() {
    const saved = localStorage.getItem(LANG_KEY);
    return LANGS.includes(saved) ? saved : "en";
  }

  function getTheme() {
    return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  }

  function applyTheme() {
    const dark = getTheme() === "dark";
    document.body.classList.toggle("dark", dark);

    const btn = document.querySelector("#themeBtn");
    if (btn) {
      btn.textContent = dark ? "☀" : "◐";
      btn.setAttribute(
        "aria-label",
        dark ? "Switch to light mode" : "Switch to dark mode"
      );
    }
  }

  function detectArticle() {
    const match = location.pathname.match(
      /\/articles\/([^/]+)(?:\/(ar|fr|es))?\/?$/
    );

    if (!match) return null;

    return {
      id: decodeURIComponent(match[1]),
      lang: match[2] || "en"
    };
  }

  function localizedArticleUrl(id, lang) {
    const base =
      location.origin +
      location.pathname.split("/articles/")[0] +
      "/articles/" +
      encodeURIComponent(id) +
      "/";

    return lang === "en" ? base : base + lang + "/";
  }

  function detectStaticPage() {
    const path = location.pathname.replace(/\/+$/, "");

    if (path.endsWith("/resources.html") || path.endsWith("/resources")) {
      return "resources";
    }

    if (path.endsWith("/disclosure.html") || path.endsWith("/disclosure")) {
      return "disclosure";
    }

    if (path.endsWith("/about.html") || path.endsWith("/about")) {
      return "about";
    }

    if (path.endsWith("/privacy.html") || path.endsWith("/privacy")) {
      return "privacy";
    }

    return null;
  }

  function redirectArticleIfNeeded() {
    const article = detectArticle();
    if (!article) return;

    const saved = getLang();

    if (saved !== article.lang) {
      location.replace(localizedArticleUrl(article.id, saved));
    }
  }

  function createControls() {
    if (!document.body) return;

    /*
     * IMPORTANT:
     * preferences.js is responsible for persistence only.
     * Existing page controls are handled here.
     * NEVER create another language selector or theme button.
     */

    const langSelect = document.querySelector("#langSelect");
    const themeBtn = document.querySelector("#themeBtn");

    if (langSelect) {
      langSelect.value = getLang();

      if (!langSelect.dataset.preferencesBound) {
        langSelect.dataset.preferencesBound = "1";

        langSelect.addEventListener("change", function () {
          const lang = this.value;

          if (!LANGS.includes(lang)) return;

          localStorage.setItem(LANG_KEY, lang);

          const article = detectArticle();

          if (article) {
            location.href = localizedArticleUrl(article.id, lang);
            return;
          }

          document.documentElement.lang = lang;
          document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

          if (typeof window.setLang === "function") {
            window.setLang(lang);
          }
        });
      }
    }

    if (themeBtn) {
      if (!themeBtn.dataset.preferencesBound) {
        themeBtn.dataset.preferencesBound = "1";

        themeBtn.addEventListener("click", function () {
          const dark = !document.body.classList.contains("dark");

          localStorage.setItem(THEME_KEY, dark ? "dark" : "light");

          applyTheme();
        });
      }
    }

    applyTheme();
  }

  function setDocumentLanguage() {
    const lang = getLang();

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }

  function protectInternalArticleLinks() {
    document.addEventListener("click", function (event) {
      const link = event.target.closest("a");

      if (!link) return;
      if (event.defaultPrevented) return;
      if (link.target === "_blank") return;

      const href = link.getAttribute("href");

      if (!href) return;
      if (href.startsWith("#")) return;
      if (/^(https?:|mailto:|tel:|javascript:)/i.test(href)) return;

      const lang = getLang();

      if (lang === "en") return;

      try {
        const url = new URL(href, location.href);

        if (!url.pathname.includes("/articles/")) return;

        const match = url.pathname.match(
          /\/articles\/([^/]+)(?:\/(ar|fr|es))?\/?$/
        );

        if (!match) return;

        event.preventDefault();

        const articleId = decodeURIComponent(match[1]);

        location.href = localizedArticleUrl(articleId, lang);
      } catch (_) {}
    });
  }

  function start() {
    setDocumentLanguage();

    redirectArticleIfNeeded();

    createControls();

    protectInternalArticleLinks();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
