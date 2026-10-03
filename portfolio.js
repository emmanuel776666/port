/* ==========================================================================
   Emmanuel Chibuike \u2014 Portfolio
   Shared behaviour: theme, nav, reveal, filters, form, misc.
   ========================================================================== */
(function () {
  "use strict";

  var EMAIL = "emmanuelchibuike482@gmail.com";
  var WHATSAPP = "2348066728951";

  var root = document.documentElement;

  /* If IntersectionObserver is missing, tell the CSS to skip the hidden
     starting state for [data-reveal] entirely. */
  if (!("IntersectionObserver" in window)) {
    root.classList.add("no-observer");
  }

  /* ---------- Theme ---------- */
  var THEME_KEY = "mec-theme";

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#f7f8fc" : "#06080f");
  }

  try {
    var saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") {
      applyTheme(saved);
    }
  } catch (e) {
    /* storage blocked \u2014 keep default */
  }

  /* ---------- Header state ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Mobile nav ---------- */
  var burger = document.querySelector(".nav__burger");
  var menu = document.querySelector(".nav__menu");

  function closeNav() {
    if (!menu || !burger) return;
    menu.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  }

  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("nav-open", open);
    });

    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeNav();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) closeNav();
    });
  }

  /* ---------- Theme toggle ---------- */
  document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      applyTheme(next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (e) {
        /* ignore */
      }
    });
  });

  /* ---------- Reveal on scroll ----------
     Elements start hidden via CSS only when `.js` is present. This block adds
     `.is-visible`. The safety net below guarantees everything is shown even if
     the observer never fires (e.g. an element that is already scrolled past,
     or a zero-height viewport on load). */
  var revealEls = document.querySelectorAll("[data-reveal]");

  function showAllReveals() {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  if ("IntersectionObserver" in window && revealEls.length) {
    var revealObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );
    revealEls.forEach(function (el) {
      revealObs.observe(el);
    });

    /* Anything still hidden after first paint + a short delay is either
       above the fold already or was missed; reveal it rather than leave a gap. */
    window.addEventListener("load", function () {
      setTimeout(function () {
        revealEls.forEach(function (el) {
          if (!el.classList.contains("is-visible")) {
            var rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
              el.classList.add("is-visible");
            }
          }
        });
      }, 400);
    });

    /* Last-resort failsafe. Generous delay so the scroll reveal still reads as
       an animation on a normal visit, but content is never left invisible. */
    setTimeout(showAllReveals, 8000);
  } else {
    showAllReveals();
  }

  /* ---------- Project filters ---------- */
  var filterBar = document.querySelector("[data-filters]");
  if (filterBar) {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-category]"));
    var empty = document.querySelector("[data-filter-empty]");

    filterBar.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter");
      if (!btn) return;

      filterBar.querySelectorAll(".filter").forEach(function (b) {
        var active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      });

      var want = btn.getAttribute("data-filter");
      var shown = 0;

      cards.forEach(function (card) {
        var cats = (card.getAttribute("data-category") || "").split(" ");
        var match = want === "all" || cats.indexOf(want) !== -1;
        card.classList.toggle("is-hidden", !match);
        if (match) shown++;
      });

      if (empty) empty.hidden = shown !== 0;
    });
  }

  /* ---------- Copy email ---------- */
  document.querySelectorAll("[data-copy-email]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var label = btn.querySelector("[data-copy-label]") || btn;
      var original = label.textContent;

      var done = function (text) {
        label.textContent = text;
        setTimeout(function () {
          label.textContent = original;
        }, 2000);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(EMAIL).then(
          function () {
            done("Copied!");
          },
          function () {
            done(EMAIL);
          }
        );
      } else {
        done(EMAIL);
      }
    });
  });

  /* ---------- Contact form -> WhatsApp ---------- */
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      var data = new FormData(form);
      var name = (data.get("name") || "").toString().trim();
      var email = (data.get("email") || "").toString().trim();
      var service = (data.get("service") || "").toString().trim();
      var budget = (data.get("budget") || "").toString().trim();
      var message = (data.get("message") || "").toString().trim();

      var lines = [
        "Hi Emmanuel, I got this from your portfolio.",
        "",
        "Name: " + (name || "\u2014"),
        "Email: " + (email || "\u2014"),
      ];
      if (service) lines.push("Service: " + service);
      if (budget) lines.push("Budget: " + budget);
      if (message) lines.push("", message);

      var url = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(lines.join("\n"));

      var status = form.querySelector("[data-form-status]");
      if (status) {
        status.hidden = false;
        status.textContent = "Opening WhatsApp with your message \u2014 press send to finish.";
      }

      window.open(url, "_blank", "noopener");
    });
  }

  /* ---------- Prefill from ?service= ---------- */
  try {
    var params = new URLSearchParams(window.location.search);
    var preset = params.get("service");
    if (preset && form) {
      var select = form.querySelector('[name="service"]');
      if (select) {
        var match = Array.prototype.find.call(select.options, function (o) {
          return o.value.toLowerCase() === preset.toLowerCase();
        });
        if (match) select.value = match.value;
      }
    }
  } catch (e) {
    /* ignore */
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- Smooth in-page links that respect reduced motion ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start",
      });
      history.replaceState(null, "", id);
    });
  });
})();
