+/* =====================================================
   WRAI — script.js
   Vanilla JavaScript only. No libraries, no dependencies.
===================================================== */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  document.addEventListener("DOMContentLoaded", function () {
    initPageFadeIn();
    initSmoothScroll();
    initScrollReveal();
    initNavbarScrollState();
    initMouseGlow();
    initFloatingParticles();
    initAuroraNebulaMotion();
    initHeroParallax();
    initCardInteractions();
    initStatCounters();
    initButtonRipple();
    initBackToTop();
    initCurrentYear();
    initNavToggle();
  });

  /* =====================================================
     Page fade-in (no blocking loader)
  ===================================================== */
  function initPageFadeIn() {
    document.body.style.opacity = "0";
    document.body.style.transition = prefersReducedMotion
      ? "none"
      : "opacity 0.6s ease";

    // Double rAF ensures the initial opacity is painted before transitioning
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.body.style.opacity = "1";
      });
    });
  }

  /* =====================================================
     Smooth scrolling for in-page anchor links
  ===================================================== */
  function initSmoothScroll() {
    var links = document.querySelectorAll('a[href^="#"]');

    links.forEach(function (link) {
      link.addEventListener("click", function (e) {
        var targetId = link.getAttribute("href");
        if (!targetId || targetId === "#") return;

        var target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();

        target.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });

        // Close mobile nav if open
        var navLinks = document.getElementById("navbar-links");
        var navToggle = document.getElementById("navToggle");
        if (navLinks && navLinks.classList.contains("is-open")) {
          navLinks.classList.remove("is-open");
          if (navToggle) navToggle.setAttribute("aria-expanded", "false");
        }
      });
    });
  }

  /* =====================================================
     Fade-in on scroll (IntersectionObserver)
     Upgraded: opacity + translate + slight blur + slight scale
  ===================================================== */
  function initScrollReveal() {
    var revealSelectors = [
      ".feature-card",
      ".script-card",
      ".why-item",
      ".timeline-item",
      ".section-header",
      ".section-header-left",
      ".hero-container",
    ];

    var elements = document.querySelectorAll(revealSelectors.join(","));
    if (!elements.length) return;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach(function (el) {
        el.setAttribute("data-reveal", "");
        el.classList.add("is-visible");
      });
      return;
    }

    elements.forEach(function (el, index) {
      el.setAttribute("data-reveal", "");
      el.style.transitionDelay = (index % 4) * 80 + "ms";
      el.style.transitionProperty = "opacity, transform, filter";
      el.style.filter = "blur(6px)";
      el.style.transform = "translateY(30px) scale(0.97)";
    });

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            el.classList.add("is-visible");
            el.style.filter = "blur(0)";
            el.style.transform = "translateY(0) scale(1)";
            obs.unobserve(el);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -60px 0px",
      }
    );

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* =====================================================
     Navbar scroll state
     - More opaque background while scrolling
     - Subtle blur transition
     - Shadow on scroll
  ===================================================== */
  function initNavbarScrollState() {
    var navbar = document.getElementById("navbar") || document.querySelector(".navbar");
    var navInner = navbar ? navbar.querySelector(".navbar-inner") : null;
    if (!navInner) return;

    navInner.style.transition =
      "background 0.35s ease, box-shadow 0.35s ease, backdrop-filter 0.35s ease";

    var ticking = false;

    function updateNavbar() {
      var scrolled = window.scrollY > 24;

      if (scrolled) {
        navInner.style.background = "rgba(10, 13, 22, 0.78)";
        navInner.style.backdropFilter = "blur(24px) saturate(160%)";
        navInner.style.webkitBackdropFilter = "blur(24px) saturate(160%)";
        navInner.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.45)";
      } else {
        navInner.style.background = "rgba(10, 13, 22, 0.55)";
        navInner.style.backdropFilter = "blur(20px) saturate(140%)";
        navInner.style.webkitBackdropFilter = "blur(20px) saturate(140%)";
        navInner.style.boxShadow = "";
      }

      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          requestAnimationFrame(updateNavbar);
          ticking = true;
        }
      },
      { passive: true }
    );

    updateNavbar();
  }

  /* =====================================================
     Mouse glow that follows cursor
  ===================================================== */
  var mouseX = window.innerWidth / 2;
  var mouseY = window.innerHeight / 2;
  var normalizedX = 0; // -1 to 1, relative to viewport center
  var normalizedY = 0;

  function initMouseGlow() {
    var glow = document.getElementById("mouseGlow");

    document.addEventListener(
      "mousemove",
      function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        normalizedX = (e.clientX / window.innerWidth) * 2 - 1;
        normalizedY = (e.clientY / window.innerHeight) * 2 - 1;

        if (glow && !prefersReducedMotion) {
          glow.classList.add("is-active");
        }
      },
      { passive: true }
    );

    document.addEventListener("mouseleave", function () {
      if (glow) glow.classList.remove("is-active");
    });

    if (!glow || prefersReducedMotion) return;

    var currentX = mouseX;
    var currentY = mouseY;
    var ticking = false;

    function loop() {
      currentX += (mouseX - currentX) * 0.15;
      currentY += (mouseY - currentY) * 0.15;

      glow.style.transform =
        "translate(" + currentX + "px, " + currentY + "px) translate(-50%, -50%)";

      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
  }

  /* =====================================================
     Floating particles — upgraded
     - 50–80 particles
     - Random size / speed / glow color
     - Slight horizontal drift
  ===================================================== */
  var particleEls = [];

  function initFloatingParticles() {
    var container = document.getElementById("heroParticles");
    if (!container) return;

    if (prefersReducedMotion) return;

    var particleCount = 50 + Math.floor(Math.random() * 30); // 50–80
    var colors = ["#4fd8ff", "#9b6bff", "#ff5fb0"];
    var fragment = document.createDocumentFragment();

    for (var i = 0; i < particleCount; i++) {
      var particle = document.createElement("span");
      var size = Math.random() * 3 + 1;
      var left = Math.random() * 100;
      var duration = Math.random() * 16 + 10; // random speed
      var delay = Math.random() * duration;
      var opacity = Math.random() * 0.5 + 0.2;
      var color = colors[Math.floor(Math.random() * colors.length)];
      var drift = (Math.random() * 40 - 20).toFixed(1); // -20px to 20px drift

      particle.style.position = "absolute";
      particle.style.bottom = "-10px";
      particle.style.left = left + "%";
      particle.style.width = size + "px";
      particle.style.height = size + "px";
      particle.style.borderRadius = "50%";
      particle.style.background = color;
      particle.style.opacity = String(opacity);
      particle.style.filter = "blur(0.5px)";
      particle.style.setProperty("--drift", drift + "px");
      particle.style.willChange = "transform";
      particle.style.animation =
        "wraiFloatUp " + duration + "s linear " + -delay + "s infinite";

      fragment.appendChild(particle);
      particleEls.push(particle);
    }

    container.appendChild(fragment);
    injectParticleKeyframes();
  }

  function injectParticleKeyframes() {
    if (document.getElementById("wrai-particle-keyframes")) return;

    var style = document.createElement("style");
    style.id = "wrai-particle-keyframes";
    style.textContent =
      "@keyframes wraiFloatUp {" +
      "0% { transform: translateY(0) translateX(0); opacity: 0; }" +
      "10% { opacity: 1; }" +
      "90% { opacity: 1; }" +
      "100% { transform: translateY(-120vh) translateX(var(--drift, 0px)); opacity: 0; }" +
      "}";
    document.head.appendChild(style);
  }

  /* =====================================================
     Aurora + nebula continuous motion
     Very subtle, layered speeds, driven by a single rAF loop
  ===================================================== */
  function initAuroraNebulaMotion() {
    if (prefersReducedMotion) return;

    var aurora = document.getElementById("bgAurora");
    var nebula = document.getElementById("bgNebula");
    if (!aurora && !nebula) return;

    var start = performance.now();

    function loop(now) {
      var t = (now - start) / 1000;

      if (aurora) {
        var ax = Math.sin(t * 0.06) * 30;
        var ay = Math.cos(t * 0.05) * 20;
        aurora.style.transform =
          "translate(" + ax.toFixed(2) + "px, " + ay.toFixed(2) + "px)";
      }

      if (nebula) {
        var nx = Math.cos(t * 0.04) * 40;
        var ny = Math.sin(t * 0.045) * 30;
        var scale = 1 + Math.sin(t * 0.03) * 0.05;
        nebula.style.transform =
          "translate(" + nx.toFixed(2) + "px, " + ny.toFixed(2) + "px) scale(" +
          scale.toFixed(3) +
          ")";
      }

      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
  }

  /* =====================================================
     Hero parallax
     Mouse movement subtly shifts hero glow, nebula, particles
     Movement capped under 15px
  ===================================================== */
  function initHeroParallax() {
    if (prefersReducedMotion) return;

    var heroGlow = document.getElementById("heroGlow");
    var heroParticles = document.getElementById("heroParticles");
    var bgNebula = document.getElementById("bgNebula");
    var hero = document.querySelector(".hero");
    if (!hero) return;

    var maxOffset = 14; // stays under 15px
    var currentGlowX = 0;
    var currentGlowY = 0;
    var currentParticlesX = 0;
    var currentParticlesY = 0;

    function loop() {
      var targetGlowX = normalizedX * maxOffset;
      var targetGlowY = normalizedY * maxOffset;
      var targetParticlesX = normalizedX * (maxOffset * 0.6);
      var targetParticlesY = normalizedY * (maxOffset * 0.6);

      currentGlowX += (targetGlowX - currentGlowX) * 0.06;
      currentGlowY += (targetGlowY - currentGlowY) * 0.06;
      currentParticlesX += (targetParticlesX - currentParticlesX) * 0.05;
      currentParticlesY += (targetParticlesY - currentParticlesY) * 0.05;

      if (heroGlow) {
        heroGlow.style.transform =
          "translate(calc(-50% + " +
          currentGlowX.toFixed(2) +
          "px), " +
          currentGlowY.toFixed(2) +
          "px)";
      }

      if (heroParticles) {
        heroParticles.style.transform =
          "translate(" +
          currentParticlesX.toFixed(2) +
          "px, " +
          currentParticlesY.toFixed(2) +
          "px)";
      }

      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
  }

  /* =====================================================
     Card interactions
     - Slight 3D tilt
     - Mouse-follow glow
     - Shine effect
     - Smooth reset on mouse leave
  ===================================================== */
  function initCardInteractions() {
    if (prefersReducedMotion) return;

    var cards = document.querySelectorAll(".feature-card, .script-card");
    if (!cards.length) return;

    cards.forEach(function (card) {
      card.style.transformStyle = "preserve-3d";
      card.style.willChange = "transform";

      var shine = card.querySelector(".card-shine");
      var rect = null;
      var raf = null;

      function onMove(e) {
        rect = rect || card.getBoundingClientRect();

        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var px = x / rect.width; // 0 to 1
        var py = y / rect.height;

        var tiltX = (py - 0.5) * -6; // max ~6deg
        var tiltY = (px - 0.5) * 6;

        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          card.style.transform =
            "perspective(800px) rotateX(" +
            tiltX.toFixed(2) +
            "deg) rotateY(" +
            tiltY.toFixed(2) +
            "deg) translateY(-4px)";

          if (shine) {
            shine.style.opacity = "1";
            shine.style.background =
              "radial-gradient(circle at " +
              (px * 100).toFixed(1) +
              "% " +
              (py * 100).toFixed(1) +
              "%, rgba(255,255,255,0.12), transparent 60%)";
          }
        });
      }

      function onEnter() {
        rect = card.getBoundingClientRect();
        card.style.transition = "transform 0.1s ease-out";
        card.addEventListener("mousemove", onMove);
      }

      function onLeave() {
        card.removeEventListener("mousemove", onMove);
        card.style.transition =
          "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.35s ease, box-shadow 0.35s ease";
        card.style.transform = "perspective(800px) rotateX(0) rotateY(0) translateY(0)";

        if (shine) {
          shine.style.opacity = "";
          shine.style.background = "";
        }

        rect = null;
      }

      card.addEventListener("mouseenter", onEnter, { passive: true });
      card.addEventListener("mouseleave", onLeave, { passive: true });
    });
  }

  /* =====================================================
     Statistics counters
     Animate from 0 when visible, run only once
  ===================================================== */
  function initStatCounters() {
    var counters = document.querySelectorAll("[data-counter]");
    if (!counters.length) return;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      return; // leave static values already in the markup
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          var el = entry.target;
          animateCounter(el);
          obs.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(function (el) {
      observer.observe(el);
    });
  }

  function animateCounter(el) {
    var target = parseFloat(el.getAttribute("data-counter"));
    if (isNaN(target)) return;

    var originalText = el.textContent;
    var suffix = originalText.replace(/[\d.]/g, ""); // preserves "+", "%", etc.
    var duration = 1400;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      var current = Math.round(target * eased);

      el.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    }

    requestAnimationFrame(step);
  }

  /* =====================================================
     Button ripple effect (optional, respects reduced motion)
  ===================================================== */
  function initButtonRipple() {
    if (prefersReducedMotion) return;

    var buttons = document.querySelectorAll(".btn");

    buttons.forEach(function (btn) {
      btn.style.position = btn.style.position || "relative";
      btn.style.overflow = "hidden";

      btn.addEventListener("click", function (e) {
        var rect = btn.getBoundingClientRect();
        var ripple = document.createElement("span");
        var size = Math.max(rect.width, rect.height);

        ripple.className = "ripple";
        ripple.style.width = ripple.style.height = size + "px";
        ripple.style.left = e.clientX - rect.left - size / 2 + "px";
        ripple.style.top = e.clientY - rect.top - size / 2 + "px";

        btn.appendChild(ripple);

        window.setTimeout(function () {
          ripple.remove();
        }, 650);
      });
    });
  }

  /* =====================================================
     Back-to-top button
  ===================================================== */
  function initBackToTop() {
    var button = document.createElement("button");
    button.className = "back-to-top";
    button.type = "button";
    button.setAttribute("aria-label", "Back to top");
    button.innerHTML =
      '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">' +
      '<path fill="currentColor" d="M12 19V6M5 13l7-7 7 7"/></svg>';

    document.body.appendChild(button);

    var visibleThreshold = window.innerHeight * 0.6;

    window.addEventListener(
      "scroll",
      throttle(function () {
        if (window.scrollY > visibleThreshold) {
          button.classList.add("is-visible");
        } else {
          button.classList.remove("is-visible");
        }
      }, 150),
      { passive: true }
    );

    button.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });
  }

  /* =====================================================
     Current year in footer
  ===================================================== */
  function initCurrentYear() {
    var yearEl = document.getElementById("currentYear");
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  /* =====================================================
     Mobile nav toggle
  ===================================================== */
  function initNavToggle() {
    var toggle = document.getElementById("navToggle");
    var links = document.getElementById("navbar-links");
    if (!toggle || !links) return;

    toggle.addEventListener("click", function () {
      var isOpen = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  /* =====================================================
     Utility: throttle
  ===================================================== */
  function throttle(fn, wait) {
    var lastCall = 0;
    var timeout = null;

    return function () {
      var now = Date.now();
      var args = arguments;
      var context = this;

      if (now - lastCall >= wait) {
        lastCall = now;
        fn.apply(context, args);
      } else {
        clearTimeout(timeout);
        timeout = setTimeout(function () {
          lastCall = Date.now();
          fn.apply(context, args);
        }, wait - (now - lastCall));
      }
    };
  }
})();
