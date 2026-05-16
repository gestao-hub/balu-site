/* =====================================================
   Balu Site — interactions v2
   Magnetic buttons + GSAP scroll + perspective depth blur
   ===================================================== */
(() => {
  const isFinePointer = window.matchMedia("(pointer: fine)").matches;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- 1) IntersectionObserver scroll reveal ----
  const reveals = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, idx) => {
          if (e.isIntersecting) {
            e.target.style.setProperty("--reveal-delay", `${(idx % 6) * 90}ms`);
            e.target.classList.add("in-view");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in-view"));
  }

  // ---- 2) Mobile nav toggle ----
  const toggle = document.querySelector(".menu-toggle");
  const header = document.querySelector(".site-header");
  if (toggle && header) {
    toggle.addEventListener("click", () => {
      header.classList.toggle("nav-mobile-open");
      toggle.setAttribute(
        "aria-expanded",
        header.classList.contains("nav-mobile-open") ? "true" : "false"
      );
    });
    header.querySelectorAll(".nav-links a").forEach((a) => {
      a.addEventListener("click", () => header.classList.remove("nav-mobile-open"));
    });
  }

  // ---- 3) Magnetic buttons (desktop only) ----
  if (isFinePointer && !prefersReducedMotion) {
    const easeReturn = "cubic-bezier(0.175, 0.885, 0.32, 2.2)";
    const easeMove = "cubic-bezier(0.16, 1, 0.3, 1)";
    document.querySelectorAll(".magnetic").forEach((el) => {
      let rafId = null;
      const strength = parseFloat(el.dataset.magnetic || "0.35");

      el.addEventListener("mousemove", (e) => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          const r = el.getBoundingClientRect();
          const x = e.clientX - r.left - r.width / 2;
          const y = e.clientY - r.top - r.height / 2;
          el.style.transition = `transform 0.45s ${easeMove}`;
          el.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0) scale(1.05)`;
        });
      });

      el.addEventListener("mouseleave", () => {
        if (rafId) cancelAnimationFrame(rafId);
        el.style.transition = `transform 1s ${easeReturn}`;
        el.style.transform = "translate3d(0,0,0) scale(1)";
      });
    });
  }

  // ---- 4) Mockup tilt parallax (refined easing) ----
  const tiltEls = document.querySelectorAll(".mockup.tilt");
  if (isFinePointer && !prefersReducedMotion) {
    tiltEls.forEach((el) => {
      const wrap = el.parentElement;
      const baseRotY = -6;
      const baseRotX = 3;
      let rafId = null;
      wrap.addEventListener("mousemove", (e) => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          const r = wrap.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          el.style.transition = "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)";
          el.style.transform = `perspective(1400px) rotateY(${baseRotY + x * 6}deg) rotateX(${baseRotX - y * 6}deg)`;
        });
      });
      wrap.addEventListener("mouseleave", () => {
        if (rafId) cancelAnimationFrame(rafId);
        el.style.transition = "transform 1.2s cubic-bezier(0.175, 0.885, 0.32, 2.2)";
        el.style.transform = `perspective(1400px) rotateY(${baseRotY}deg) rotateX(${baseRotX}deg)`;
      });
    });
  }

  // ---- 5) Pipeline highlight rotativo (CRM) ----
  const pipeline = document.querySelector(".pipeline-animated");
  if (pipeline && !prefersReducedMotion) {
    const deals = pipeline.querySelectorAll(".deal");
    let i = 0;
    setInterval(() => {
      const target = deals[i % deals.length];
      if (target) {
        target.animate(
          [
            { transform: "translateY(0)", boxShadow: "0 0 0 1px transparent" },
            { transform: "translateY(-2px)", boxShadow: "0 8px 24px rgba(69,118,255,0.40), 0 0 0 1px rgba(69,118,255,0.50)" },
            { transform: "translateY(0)", boxShadow: "0 0 0 1px transparent" },
          ],
          { duration: 1400, easing: "cubic-bezier(.16,1,.3,1)" }
        );
      }
      i++;
    }, 2200);
  }

  // ---- 6) Smooth scroll for nav anchors ----
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id && id.length > 1) {
        const tgt = document.querySelector(id);
        if (tgt) {
          e.preventDefault();
          tgt.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  });

  // ---- 7) Perspective marquee depth blur ----
  // Applies a static graduated blur to spans based on their X position in the track.
  // Re-runs on resize for responsive correctness.
  function applyMarqueeDepth() {
    const tracks = document.querySelectorAll(".perspective-marquee-track");
    tracks.forEach((track) => {
      const stage = track.closest(".perspective-marquee");
      if (!stage) return;
      const stageRect = stage.getBoundingClientRect();
      const centerX = stageRect.width / 2;
      track.querySelectorAll("span").forEach((span) => {
        const r = span.getBoundingClientRect();
        const spanCenter = r.left + r.width / 2 - stageRect.left;
        const dist = Math.min(1, Math.abs(spanCenter - centerX) / (stageRect.width / 2));
        // edge blur 6px, mid 2px, center 0 — gentle gradient
        const blur = Math.round(dist * 5);
        const opacity = 1 - dist * 0.35;
        span.style.filter = `blur(${blur}px)`;
        span.style.opacity = String(opacity);
      });
    });
  }
  // Note: track animates continuously, so static initial blur is fine for the
  // 3D depth feel — full per-frame recalc would be expensive.
  setTimeout(applyMarqueeDepth, 250);
  window.addEventListener("resize", () => {
    requestAnimationFrame(applyMarqueeDepth);
  });

  // ---- 8) Back to top (cinematic footer) ----
  document.querySelectorAll(".back-to-top").forEach((btn) => {
    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  // ---- 9a) Wizard step click navigation (interactive demo) ----
  document.querySelectorAll(".wizard-mockup").forEach((wiz) => {
    const stepHeaders = wiz.querySelectorAll(".wizard-step");
    const panels = wiz.querySelectorAll(".wizard-panel");
    stepHeaders.forEach((header, idx) => {
      header.style.cursor = "pointer";
      header.addEventListener("click", () => {
        stepHeaders.forEach((h, i) => {
          h.classList.remove("current");
          if (i < idx) h.classList.add("done");
          else h.classList.remove("done");
        });
        header.classList.add("current");
        header.classList.remove("done");
        panels.forEach((p, i) => {
          p.style.display = i === idx ? "block" : "none";
          if (i === idx) {
            p.animate(
              [{ opacity: 0, transform: "translateY(8px)", filter: "blur(6px)" },
               { opacity: 1, transform: "translateY(0)", filter: "blur(0)" }],
              { duration: 500, easing: "cubic-bezier(.16,1,.3,1)" }
            );
          }
        });
      });
    });
  });

  // ---- 9b) Optimizer toggle interactive ----
  document.querySelectorAll(".optimizer-toggle").forEach((t) => {
    t.style.cursor = "pointer";
    t.addEventListener("click", () => t.classList.toggle("off"));
  });

  // ---- 9c) Wizard option selection ----
  document.querySelectorAll(".wizard-options").forEach((grp) => {
    grp.querySelectorAll(".wizard-option").forEach((opt) => {
      opt.style.cursor = "pointer";
      opt.addEventListener("click", () => {
        grp.querySelectorAll(".wizard-option").forEach((o) => o.classList.remove("selected"));
        opt.classList.add("selected");
      });
    });
  });

  // ---- 9d) Project showcase — cursor-follow image preview with smooth lerp ----
  document.querySelectorAll("[data-showcase]").forEach((root) => {
    const preview = root.querySelector(".showcase-preview");
    const images = root.querySelectorAll(".preview-img");
    const items = root.querySelectorAll(".showcase-item");
    if (!preview || !items.length) return;

    if (!isFinePointer || prefersReducedMotion) {
      // Hide preview on touch / reduced motion; keep items as plain links
      preview.style.display = "none";
      return;
    }

    let mouseX = 0, mouseY = 0;
    let smoothX = 0, smoothY = 0;
    let visible = false;
    let rafId = null;
    let initialized = false;

    const OFFSET_X = 32;
    const OFFSET_Y = -200;

    function tick() {
      const f = 0.16;
      smoothX += (mouseX - smoothX) * f;
      smoothY += (mouseY - smoothY) * f;
      preview.style.transform =
        `translate3d(${smoothX + OFFSET_X}px, ${smoothY + OFFSET_Y}px, 0) scale(${visible ? 1 : 0.85})`;
      rafId = requestAnimationFrame(tick);
    }

    function onMove(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!initialized) {
        smoothX = mouseX;
        smoothY = mouseY;
        initialized = true;
      }
    }

    root.addEventListener("mousemove", onMove);
    rafId = requestAnimationFrame(tick);

    items.forEach((item, idx) => {
      item.addEventListener("mouseenter", () => {
        visible = true;
        preview.classList.add("visible");
        images.forEach((im, i) => im.classList.toggle("active", i === idx));
        items.forEach((it) => it.classList.remove("is-hover"));
        item.classList.add("is-hover");
      });
      item.addEventListener("mouseleave", () => {
        visible = false;
        preview.classList.remove("visible");
        item.classList.remove("is-hover");
      });
    });
  });

  // ---- 9e) LocationMap (footer) — tilt + click expande pra mostrar Google Maps embed ----
  document.querySelectorAll("[data-location-map]").forEach((root) => {
    const card = root.querySelector(".location-map-card");
    if (!card) return;

    // Click toggle: expande o card e revela o iframe real do Google Maps
    root.addEventListener("click", (e) => {
      // Ignora clicks dentro do iframe (pra não fechar enquanto interage com o mapa)
      if (e.target.closest(".location-iframe")) return;
      // Close button explícito fecha
      if (e.target.closest(".location-close")) {
        root.classList.remove("expanded");
        e.stopPropagation();
        return;
      }
      root.classList.toggle("expanded");
      // Lazy-load do iframe só quando expande pela 1ª vez
      const iframe = card.querySelector(".location-iframe");
      if (iframe && root.classList.contains("expanded") && !iframe.src && iframe.dataset.src) {
        iframe.src = iframe.dataset.src;
      }
    });

    // ESC pra fechar
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") root.classList.remove("expanded");
    });

    // 3D tilt on mouse move (desktop only)
    if (!isFinePointer || prefersReducedMotion) return;
    let rafId = null;
    root.addEventListener("mousemove", (e) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const r = root.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = (e.clientX - cx) / (r.width / 2);
        const dy = (e.clientY - cy) / (r.height / 2);
        const rotY = dx * 8;
        const rotX = -dy * 8;
        card.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      });
    });
    root.addEventListener("mouseleave", () => {
      if (rafId) cancelAnimationFrame(rafId);
      card.style.transform = "rotateX(0deg) rotateY(0deg)";
    });
  });

  // ---- 10) GSAP integrations (cinematic footer parallax + hero mockup entry + inset scroll reveal) ----
  function initGSAP() {
    if (typeof window.gsap === "undefined" || typeof window.ScrollTrigger === "undefined") return;
    if (prefersReducedMotion) return;
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);

    // 9a) Hero mockup scroll-in (blur + scale + opacity)
    document.querySelectorAll(".hero-mockup .mockup").forEach((mk) => {
      gsap.fromTo(
        mk,
        { filter: "blur(14px)", opacity: 0, y: 40, scale: 0.94 },
        {
          filter: "blur(0px)",
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.4,
          ease: "power3.out",
          scrollTrigger: {
            trigger: mk,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    // 9b) Cinematic footer giant text parallax
    document.querySelectorAll(".cinematic-footer .giant-text").forEach((el) => {
      const curtain = el.closest(".curtain-footer");
      if (!curtain) return;
      gsap.fromTo(
        el,
        { y: "12vh", scale: 0.85, opacity: 0 },
        {
          y: "0vh",
          scale: 1,
          opacity: 1,
          ease: "power1.out",
          scrollTrigger: {
            trigger: curtain,
            start: "top 80%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );
    });

    // 9c) Cinematic footer center content stagger
    document.querySelectorAll(".cinematic-footer .footer-center").forEach((el) => {
      const curtain = el.closest(".curtain-footer");
      if (!curtain) return;
      const targets = el.querySelectorAll("h2, .footer-pills, .footer-secondary-links");
      gsap.fromTo(
        targets,
        { y: 50, opacity: 0, filter: "blur(8px)" },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: curtain,
            start: "top 40%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );
    });

    // 10d) Header glass shrink/blur on scroll
    const headerEl = document.querySelector(".site-header");
    if (headerEl) {
      ScrollTrigger.create({
        start: "top -20",
        onUpdate: (self) => {
          if (self.scroll() > 20) headerEl.classList.add("scrolled");
          else headerEl.classList.remove("scrolled");
        },
      });
    }

    // 10e) Inset scroll reveal (5th component — animated-video-on-scroll adapted)
    // The frame starts inset/rounded and expands as user scrolls into view.
    document.querySelectorAll(".scroll-reveal-section").forEach((sec) => {
      const frame = sec.querySelector(".scroll-reveal-frame");
      const text = sec.querySelector(".scroll-reveal-text");
      if (!frame) return;

      gsap.fromTo(
        frame,
        { scale: 0.78, borderRadius: "48px", filter: "blur(8px)" },
        {
          scale: 1,
          borderRadius: "16px",
          filter: "blur(0px)",
          ease: "none",
          scrollTrigger: {
            trigger: sec,
            start: "top 80%",
            end: "center center",
            scrub: 1,
          },
        }
      );

      if (text) {
        gsap.fromTo(
          text,
          { y: 0, opacity: 1 },
          {
            y: -80,
            opacity: 0,
            ease: "none",
            scrollTrigger: {
              trigger: sec,
              start: "top 70%",
              end: "center 40%",
              scrub: 1,
            },
          }
        );
      }
    });
  }

  if (document.readyState === "complete") {
    initGSAP();
  } else {
    window.addEventListener("load", initGSAP);
  }
})();
