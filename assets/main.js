/* Balu Site — interactions */
(() => {
  // ---- Scroll reveal ----
  const reveals = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, idx) => {
          if (e.isIntersecting) {
            // small stagger per intersection batch
            e.target.style.setProperty("--reveal-delay", `${(idx % 6) * 70}ms`);
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

  // ---- Mobile nav ----
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

  // ---- Subtle parallax tilt on hero mockup ----
  const tiltEls = document.querySelectorAll(".mockup.tilt");
  if (window.matchMedia("(pointer: fine)").matches) {
    tiltEls.forEach((el) => {
      const wrap = el.parentElement;
      const baseRotY = -6;
      const baseRotX = 3;
      wrap.addEventListener("mousemove", (e) => {
        const r = wrap.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(1400px) rotateY(${baseRotY + x * 6}deg) rotateX(${baseRotX - y * 6}deg)`;
      });
      wrap.addEventListener("mouseleave", () => {
        el.style.transform = `perspective(1400px) rotateY(${baseRotY}deg) rotateX(${baseRotX}deg)`;
      });
    });
  }

  // ---- Pipeline mock auto-shuffle hint ----
  const pipeline = document.querySelector(".pipeline-animated");
  if (pipeline) {
    const deals = pipeline.querySelectorAll(".deal");
    let i = 0;
    setInterval(() => {
      deals.forEach((d) => d.classList.remove("highlight"));
      const target = deals[i % deals.length];
      if (target) {
        target.classList.add("highlight");
        target.animate(
          [
            { transform: "translateX(0)", boxShadow: "0 0 0 1px transparent" },
            { transform: "translateX(4px)", boxShadow: "0 0 0 1px rgba(69,118,255,0.50)" },
            { transform: "translateX(0)", boxShadow: "0 0 0 1px transparent" }
          ],
          { duration: 1200, easing: "cubic-bezier(.2,.8,.2,1)" }
        );
      }
      i++;
    }, 2400);
  }

  // ---- Smooth scroll for nav anchors (extra easing) ----
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
})();
