/* ============================================================
   ROYAL HAYAT PERFUMES — behaviour
   ============================================================ */
(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------- header scroll state ---------- */
  const header = document.getElementById("siteHeader");
  let scrolled = false;
  const onScroll = () => {
    const shouldBe = window.scrollY > 24;
    if (shouldBe !== scrolled) {
      scrolled = shouldBe;
      header.classList.toggle("is-scrolled", scrolled);
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- full-screen navigation ---------- */
  const navToggle = document.getElementById("navToggle");
  const nav = document.getElementById("siteNav");

  const setNav = (open) => {
    document.body.classList.toggle("nav-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  navToggle.addEventListener("click", () =>
    setNav(!document.body.classList.contains("nav-open"))
  );
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) setNav(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setNav(false);
  });

  /* ---------- reveal on scroll (once, staggered) ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = (el.dataset.revealOrder || 0) * 90;
          el.style.transitionDelay = delay + "ms";
          el.classList.add("is-in");
          io.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    const groups = new Map();
    reveals.forEach((el) => {
      const parent = el.parentElement;
      const n = groups.get(parent) || 0;
      el.dataset.revealOrder = n;
      groups.set(parent, n + 1);
      io.observe(el);
    });
  }

  /* ---------- gentle parallax on figures ---------- */
  const parallaxEls = Array.from(document.querySelectorAll("[data-parallax]"));
  if (!prefersReducedMotion && parallaxEls.length) {
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      parallaxEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        const progress = (rect.top + rect.height / 2 - vh / 2) / (vh / 2);
        el.style.transform = "translateY(" + (progress * -14).toFixed(1) + "px)";
      });
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    update();
  }

  /* ---------- Calicut clock + open/closed ---------- */
  /* Hours (IST): Mon–Sat 10:00–20:00 · Sunday closed */
  const clockEls = document.querySelectorAll("[data-clock]");
  const openStatusEl = document.querySelector("[data-open-status]");
  const OPEN_AT = 10 * 60;
  const CLOSE_AT = 20 * 60;

  const istTime = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const istDay = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
  });

  const tickClock = () => {
    const now = new Date();
    const time = istTime.format(now);
    clockEls.forEach((el) => (el.textContent = time));

    if (!openStatusEl) return;
    const [h, m] = time.split(":").map(Number);
    const minutes = h * 60 + m;
    const isSunday = istDay.format(now) === "Sun";
    const isOpen = !isSunday && minutes >= OPEN_AT && minutes < CLOSE_AT;
    openStatusEl.textContent = isOpen
      ? "Open now · until 8:00 PM"
      : isSunday
        ? "Closed today · opens Mon 10:00 AM"
        : "Closed now · opens 10:00 AM";
  };
  tickClock();
  setInterval(tickClock, 30 * 1000);

  /* ---------- testimonial slider ---------- */
  const slider = document.getElementById("reviewSlider");
  if (slider) {
    const slides = Array.from(slider.querySelectorAll(".review"));
    const dotsWrap = slider.querySelector(".reviews__dots");
    let index = 0;
    let timer = null;

    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "Review " + (i + 1));
      dot.addEventListener("click", () => {
        goTo(i);
        restartAuto();
      });
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    const goTo = (i) => {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, n) => s.classList.toggle("is-active", n === index));
      dots.forEach((d, n) => {
        d.classList.toggle("is-active", n === index);
        d.setAttribute("aria-selected", String(n === index));
      });
    };

    const restartAuto = () => {
      if (prefersReducedMotion) return;
      clearInterval(timer);
      timer = setInterval(() => goTo(index + 1), 6500);
    };

    slider
      .querySelector("[data-review-prev]")
      .addEventListener("click", () => {
        goTo(index - 1);
        restartAuto();
      });
    slider
      .querySelector("[data-review-next]")
      .addEventListener("click", () => {
        goTo(index + 1);
        restartAuto();
      });

    goTo(0);
    restartAuto();
  }

  /* ---------- footer year ---------- */
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
