/* =====================================================
   Balu Site — interactions v2
   Magnetic buttons + GSAP scroll + perspective depth blur
   ===================================================== */
(() => {
  const isFinePointer = window.matchMedia("(pointer: fine)").matches;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- 0) Counter animations Apple-style (KPI values animam de 0 ao valor real on intersection) ----
  // Parses "R$ 187k", "+12%", "-18 dias", "32%", "4,2 min" etc preservando prefixos/sufixos
  function parseNumeric(text) {
    // Capture: optional sign, integer/decimal number with k/M/, suffix
    const m = text.match(/^([^\d\-+]*)([-+]?)(\d+(?:[.,]\d+)?)([kMB]?)(.*)$/);
    if (!m) return null;
    const [, prefix, sign, num, suffix, rest] = m;
    const value = parseFloat(num.replace(",", ".")) * (sign === "-" ? -1 : 1);
    return { prefix, sign, value, suffix, rest, originalText: text };
  }
  function formatNumber(value, parsed) {
    const abs = Math.abs(value);
    let str;
    if (Number.isInteger(parsed.value)) str = Math.round(abs).toString();
    else str = abs.toFixed(1).replace(".", ",");
    const sign = value < 0 ? "-" : (parsed.sign === "+" ? "+" : "");
    return parsed.prefix + sign + str + parsed.suffix + parsed.rest;
  }
  function animateCounter(el) {
    if (el.dataset.counterDone) return;
    // Only animate the leading number text node, preserve <span> children (deltas)
    const valueNode = [...el.childNodes].find(n => n.nodeType === 3 && n.textContent.trim().length > 0);
    if (!valueNode) return;
    const text = valueNode.textContent.trim();
    const parsed = parseNumeric(text);
    if (!parsed || isNaN(parsed.value)) return;
    el.dataset.counterDone = "1";
    const target = parsed.value;
    const duration = 1400;
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3); // easeOutCubic
    function tick(now) {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const v = target * ease(t);
      valueNode.textContent = formatNumber(v, parsed) + " ";
      if (t < 1) requestAnimationFrame(tick);
      else valueNode.textContent = parsed.originalText + " ";
    }
    valueNode.textContent = formatNumber(0, parsed) + " ";
    requestAnimationFrame(tick);
  }
  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    const counterIO = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { animateCounter(e.target); counterIO.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    document.querySelectorAll(".kpi .val, .plan-price, .ph-pct").forEach(el => counterIO.observe(el));
  }

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

  // ---- 2.1) Login dropdown ----
  document.querySelectorAll("[data-login-dropdown]").forEach((dd) => {
    const trigger = dd.querySelector("[data-login-trigger]");
    const menu = dd.querySelector("[data-login-menu]");
    if (!trigger || !menu) return;

    // Posiciona o menu via JS (position:fixed) pra não ser clipado pelo overflow:hidden do header
    const positionMenu = () => {
      const tRect = trigger.getBoundingClientRect();
      const mRect = menu.getBoundingClientRect();
      const margin = 12;
      const minMenuW = 240;
      const mWidth = mRect.width || minMenuW;
      let left = tRect.right - mWidth;
      // Margens laterais da viewport
      const pad = 8;
      if (left < pad) left = pad;
      if (left + mWidth > window.innerWidth - pad) left = window.innerWidth - mWidth - pad;
      const top = tRect.bottom + margin;
      menu.style.top = `${Math.round(top)}px`;
      menu.style.left = `${Math.round(left)}px`;
    };

    const closeMenu = () => {
      dd.classList.remove("open");
      menu.removeAttribute("data-open");
      trigger.setAttribute("aria-expanded", "false");
      window.removeEventListener("resize", positionMenu);
      window.removeEventListener("scroll", positionMenu, true);
    };
    const openMenu = () => {
      dd.classList.add("open");
      menu.setAttribute("data-open", "true");
      trigger.setAttribute("aria-expanded", "true");
      positionMenu();
      // Reposiciona após o reflow do menu (caso width mude)
      requestAnimationFrame(positionMenu);
      window.addEventListener("resize", positionMenu);
      window.addEventListener("scroll", positionMenu, true);
    };
    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      dd.classList.contains("open") ? closeMenu() : openMenu();
    });
    menu.addEventListener("click", (e) => e.stopPropagation());
    document.addEventListener("click", (e) => {
      if (!dd.contains(e.target) && !menu.contains(e.target)) closeMenu();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && dd.classList.contains("open")) {
        closeMenu();
        trigger.focus();
      }
    });
    menu.querySelectorAll(".login-option").forEach((opt) => {
      opt.addEventListener("click", () => closeMenu());
    });
  });

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

  // ---- 7) Perspective marquee depth blur — per-frame Apple-style parallax ----
  // RAF loop contínuo recalcula blur/opacity das spans baseado na X position real durante a animação
  if (!prefersReducedMotion) {
    const tracks = [...document.querySelectorAll(".perspective-marquee-track")];
    if (tracks.length) {
      const trackData = tracks.map((track) => ({
        track,
        stage: track.closest(".perspective-marquee"),
        spans: [...track.querySelectorAll("span")],
      })).filter(d => d.stage);

      function marqueeTick() {
        trackData.forEach(({ stage, spans }) => {
          const stageRect = stage.getBoundingClientRect();
          if (stageRect.bottom < 0 || stageRect.top > window.innerHeight) return; // skip off-screen
          const centerX = stageRect.width / 2;
          const halfW = stageRect.width / 2;
          spans.forEach((span) => {
            const r = span.getBoundingClientRect();
            const spanCenter = r.left + r.width / 2 - stageRect.left;
            const dist = Math.min(1, Math.abs(spanCenter - centerX) / halfW);
            const blur = (dist * dist * 5).toFixed(1); // quadratic falloff
            const opacity = (1 - dist * 0.4).toFixed(2);
            span.style.filter = `blur(${blur}px)`;
            span.style.opacity = opacity;
          });
        });
        requestAnimationFrame(marqueeTick);
      }
      requestAnimationFrame(marqueeTick);
    }
  }

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

  // ===== INTERACTIVE MOCKUPS (drag pipeline, whatsapp typing, project tracker) =====

  // ---- M1) Pipeline drag-and-drop (CRM) ----
  document.querySelectorAll(".pipeline-animated").forEach((pipeline) => {
    const cols = pipeline.querySelectorAll(".pipeline-col");
    const deals = pipeline.querySelectorAll(".deal");
    if (!cols.length || !deals.length) return;

    function recalc() {
      cols.forEach((col) => {
        const colDeals = col.querySelectorAll(".deal");
        const h4 = col.querySelector("h4");
        if (!h4) return;
        let countSpan = h4.querySelector("span");
        if (countSpan) countSpan.textContent = String(colDeals.length);
      });
    }

    deals.forEach((deal) => {
      deal.setAttribute("draggable", "true");
      deal.style.cursor = "grab";
      deal.addEventListener("dragstart", (e) => {
        deal.classList.add("dragging");
        try { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", "deal"); } catch (_) {}
        setTimeout(() => deal.style.opacity = "0.35", 0);
      });
      deal.addEventListener("dragend", () => {
        deal.classList.remove("dragging");
        deal.style.opacity = "";
        cols.forEach(c => c.classList.remove("dragover"));
      });
    });

    cols.forEach((col) => {
      col.addEventListener("dragover", (e) => {
        e.preventDefault();
        try { e.dataTransfer.dropEffect = "move"; } catch (_) {}
        col.classList.add("dragover");
      });
      col.addEventListener("dragleave", (e) => {
        if (!col.contains(e.relatedTarget)) col.classList.remove("dragover");
      });
      col.addEventListener("drop", (e) => {
        e.preventDefault();
        col.classList.remove("dragover");
        const dragging = pipeline.querySelector(".deal.dragging");
        if (!dragging) return;
        col.appendChild(dragging);
        recalc();
        dragging.animate(
          [
            { transform: "scale(1)" },
            { transform: "scale(1.05)" },
            { transform: "scale(1)" },
          ],
          { duration: 500, easing: "cubic-bezier(.16,1,.3,1)" }
        );
      });
    });
    recalc();
  });

  // ---- M2) WhatsApp typing real (CRM) ----
  const WA_SCENARIOS = [
    { match: /pre[çc]o|quanto|valor|custa|plano/i, reply: "Os planos vão de R$ 297 (Solo) a R$ 697 (Estúdio). Ticket médio fecha em ~R$ 500/mês. Bora ver qual encaixa pro tamanho da sua agência?" },
    { match: /demo|agendar|call|conversar|reuni[ãa]o/i, reply: "Bora marcar uma call de 30 min com o Michel? Clica no botão \"Agendar demo\" lá em cima 📅" },
    { match: /integra[çc][ãa]o|whatsapp|meta|google|stripe|asaas/i, reply: "Integramos nativo: WhatsApp Cloud, Meta Ads, Google Ads, Stripe, Asaas, Notion. Sem Zapier no meio." },
    { match: /trial|gr[áa]tis|free|teste/i, reply: "14 dias grátis, sem cartão. Pode testar a plataforma inteira — CRM, projetos, financeiro, squads de IA." },
    { match: /migra[çc][ãa]o|sair|trocar/i, reply: "Migração assistida em 2-5 dias úteis. Importamos do seu CRM, planilhas e ferramenta de projeto." },
    { match: /ia|inteligencia|agent|gpt|claude/i, reply: "Squads de IA por cliente: atendimento (SDR), copy, briefing, análise. Base de conhecimento isolada por workspace." },
    { match: /^ol[áa]|oi|bom dia|boa tarde/i, reply: "Oi! Tudo bem? Sou o Balu, agente da Balu CRM. Qual sua dúvida?" },
  ];
  const WA_DEFAULT = "Boa pergunta — me conta um pouco mais? Qual o tamanho da sua agência hoje?";

  document.querySelectorAll(".wa-mockup").forEach((mockup) => {
    const chatBody = mockup.querySelector(".wa-chat-body");
    const inputZone = mockup.querySelector(".wa-input");
    const inputField = mockup.querySelector(".wa-input-field");
    const sendBtn = mockup.querySelector(".wa-input-send");
    if (!chatBody || !inputZone) return;

    if (inputField && inputField.tagName !== "INPUT") {
      const realInput = document.createElement("input");
      realInput.type = "text";
      realInput.className = "wa-input-field";
      realInput.placeholder = "Digite sua resposta…";
      realInput.maxLength = 200;
      inputField.replaceWith(realInput);
    }
    const input = inputZone.querySelector("input.wa-input-field");
    if (!input) return;

    function mkMsg(cls, text) {
      const msg = document.createElement("div");
      msg.className = "wa-msg " + cls;
      msg.textContent = text;
      const time = document.createElement("span");
      time.className = "time";
      const now = new Date();
      time.textContent = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}${cls === "outgoing" ? " ✓✓" : ""}`;
      msg.appendChild(time);
      chatBody.appendChild(msg);
      chatBody.scrollTop = chatBody.scrollHeight;
      return msg;
    }
    function showTyping() {
      const t = document.createElement("div");
      t.className = "wa-msg incoming wa-typing-indicator";
      for (let i = 0; i < 3; i++) {
        const dot = document.createElement("span");
        dot.className = "wa-dot";
        t.appendChild(dot);
      }
      chatBody.appendChild(t);
      chatBody.scrollTop = chatBody.scrollHeight;
      return t;
    }
    function findReply(text) {
      for (const sc of WA_SCENARIOS) if (sc.match.test(text)) return sc.reply;
      return WA_DEFAULT;
    }

    let busy = false;
    function send() {
      if (busy) return;
      const text = input.value.trim();
      if (!text) return;
      busy = true;
      mkMsg("outgoing", text);
      input.value = "";
      const typing = showTyping();
      setTimeout(() => {
        typing.remove();
        mkMsg("incoming", findReply(text));
        busy = false;
        input.focus();
      }, 1200 + Math.random() * 600);
    }

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); send(); }
    });
    if (sendBtn) {
      sendBtn.style.cursor = "pointer";
      sendBtn.addEventListener("click", send);
    }
  });

  // ---- M3) Project tracker checkboxes vivos (Criação) ----
  document.querySelectorAll(".project-tracker").forEach((tracker) => {
    const tasks = tracker.querySelectorAll(".project-task");
    const progressBar = tracker.querySelector(".project-progress-bar");
    const phPct = tracker.querySelector(".ph-pct");
    const phName = tracker.querySelector(".ph-name");
    if (!tasks.length || !progressBar) return;

    function recalc() {
      const done = tracker.querySelectorAll(".project-task.done").length;
      const total = tasks.length;
      const pct = Math.round((done / total) * 100);
      progressBar.style.width = pct + "%";
      if (phPct) phPct.textContent = `${done} de ${total} tarefas`;
      if (phName) phName.textContent = `Construção · ${pct}% concluído`;
      if (pct === 100) {
        const current = tracker.querySelector(".project-phase.current");
        const next = current?.nextElementSibling;
        if (current && next && next.classList.contains("project-phase")) {
          current.classList.remove("current");
          current.classList.add("done");
          const cur_num = current.querySelector(".num");
          if (cur_num) cur_num.textContent = "✓";
          next.classList.add("current");
        }
      }
    }

    tasks.forEach((task) => {
      task.style.cursor = "pointer";
      task.addEventListener("click", (e) => {
        if (e.target.classList.contains("owner")) return;
        task.classList.toggle("done");
        task.classList.remove("in-progress");
        recalc();
      });
    });
    recalc();
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
