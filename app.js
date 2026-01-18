(function () {
  const LANG_KEY = "portfolio_lang";
  const LANG_EN = "en";
  const LANG_VI = "vi";

  function getInitialLang() {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === LANG_EN || saved === LANG_VI) {
      return saved;
    }
    return LANG_EN;
  }

  function setToggleText(lang) {
    const label = lang.toUpperCase();
    const desktop = document.getElementById("lang-toggle");
    const mobile = document.getElementById("lang-toggle-mobile");

    if (desktop) {
      desktop.textContent = label;
    }
    if (mobile) {
      mobile.textContent = label;
    }
  }

  function applyLanguage(lang) {
    document.documentElement.setAttribute("lang", lang);

    const htmlNodes = document.querySelectorAll("[data-en-html]");
    htmlNodes.forEach((el) => {
      const enHtml = el.getAttribute("data-en-html");
      const viHtml = el.getAttribute("data-vi-html");

      if (lang === LANG_VI && viHtml) {
        el.innerHTML = viHtml;
        return;
      }
      if (enHtml) {
        el.innerHTML = enHtml;
      }
    });

    const textNodes = document.querySelectorAll("[data-en]:not([data-en-html])");
    textNodes.forEach((el) => {
      const enText = el.getAttribute("data-en");
      const viText = el.getAttribute("data-vi");

      if (lang === LANG_VI && viText) {
        el.textContent = viText;
        return;
      }
      if (enText) {
        el.textContent = enText;
      }
    });

    const copyButtons = document.querySelectorAll(".copy-btn");
    copyButtons.forEach((button) => {
      const enLabel = button.getAttribute("data-en-label");
      const viLabel = button.getAttribute("data-vi-label");

      if (lang === LANG_VI && viLabel) {
        button.setAttribute("aria-label", viLabel);
        return;
      }
      if (enLabel) {
        button.setAttribute("aria-label", enLabel);
      }
    });

    setToggleText(lang);
    localStorage.setItem(LANG_KEY, lang);
  }

  function bindLanguageButtons() {
    const desktop = document.getElementById("lang-toggle");
    const mobile = document.getElementById("lang-toggle-mobile");

    const handler = function () {
      const current = localStorage.getItem(LANG_KEY) || LANG_EN;
      const next = current === LANG_VI ? LANG_EN : LANG_VI;
      applyLanguage(next);
    };

    if (desktop) {
      desktop.addEventListener("click", handler);
    }
    if (mobile) {
      mobile.addEventListener("click", handler);
    }
  }

  function bindSmoothScroll() {
    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach((a) => {
      a.addEventListener("click", function (e) {
        const href = a.getAttribute("href");
        if (!href || href === "#") {
          return;
        }

        const target = document.querySelector(href);
        if (!target) {
          return;
        }

        e.preventDefault();
        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      });
    });
  }

  function initScrollReveal() {
    const items = Array.from(document.querySelectorAll("[data-reveal]"));
    items.forEach((el, i) => {
      el.classList.add("reveal");
      el.style.setProperty("--reveal-delay", `${Math.min(i, 8) * 60}ms`);
    });

    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => {
        el.classList.add("is-visible");
      });
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      {
        root: null,
        threshold: 0.12,
        rootMargin: "0px 0px -10% 0px"
      }
    );

    items.forEach((el) => {
      io.observe(el);
    });
  }

  function bindCopyButtons() {
    const buttons = document.querySelectorAll(".copy-btn");
    buttons.forEach((button) => {
      button.addEventListener("click", async () => {
        const targetId = button.getAttribute("data-copy-target");
        const target = targetId ? document.getElementById(targetId) : null;

        if (!target) {
          return;
        }

        try {
          await navigator.clipboard.writeText(target.textContent.trim());

          const lang = localStorage.getItem(LANG_KEY) || LANG_EN;
          const copiedText = lang === LANG_VI ? "Đã sao chép" : "Copied";
          const originalContent = button.innerHTML;
          const originalAriaLabel = button.getAttribute("aria-label") || "";

          button.innerHTML = `<span class="text-sm font-medium">${copiedText}</span>`;
          button.disabled = true;

          setTimeout(() => {
            button.innerHTML = originalContent;
            button.disabled = false;
            button.setAttribute("aria-label", originalAriaLabel);
          }, 2000);
        }
        catch {
          // silently fail
        }
      });
    });
  }

  function syncNavbarHeight() {
    const nav = document.getElementById("site-nav");
    if (!nav) {
      return;
    }

    const setNavHeight = function () {
      const height = Math.ceil(nav.getBoundingClientRect().height);
      const extraOffset = 100;

      document.documentElement.style.setProperty(
        "--nav-h",
        `${height + extraOffset}px`
      );
    };


    const scheduleSet = function () {
      requestAnimationFrame(() => {
        setNavHeight();
      });
    };

    scheduleSet();

    window.addEventListener("resize", scheduleSet);

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", scheduleSet);
      window.visualViewport.addEventListener("scroll", scheduleSet);
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        scheduleSet();
      });
    }

    setTimeout(() => {
      scheduleSet();
    }, 150);
  }

  // Run early to avoid initial mobile overlap (before DOMContentLoaded).
  syncNavbarHeight();

  document.addEventListener("DOMContentLoaded", function () {
    const initial = getInitialLang();
    applyLanguage(initial);

    bindLanguageButtons();
    bindSmoothScroll();
    initScrollReveal();
    bindCopyButtons();
    syncNavbarHeight();
  });
})();
