/* =========================================================
   BALU AGENT — Widget de IA Embedado
   Frontend vanilla (sem React). Adaptado do FloatingAiAssistant.
   Flow: scroll 30% → trigger visível → click → gate form → chat
   Segurança: nenhum innerHTML com conteúdo de mensagem (XSS-safe)
   ========================================================= */
(() => {
  "use strict";

  const CFG = {
    BACKEND_URL: "https://envsirumquqpmkcayncr.supabase.co/functions/v1/public-chat-guarded",
    SUPABASE_ANON: "sb_publishable_g6WyB24Jy7DsL1bELPEGtQ__R_oBN7E",
    WIDGET_ID: "fc065444-c2d2-40ed-85c6-9ee63b8a15ff",
    WHATSAPP: "5512991548086",
    SCROLL_TRIGGER_PCT: 0.30,
    SESSION_TTL_MS: 7 * 24 * 60 * 60 * 1000,
    MAX_INPUT_LEN: 1500,
    MIN_INTERVAL_MS: 1500,
    STORAGE_KEY_LEAD: "balu_widget_lead_v2",
    STORAGE_KEY_MSGS: "balu_widget_msgs_v2",
    GREETING: "Oi! Sou o Balu 🤝 Posso te explicar como a plataforma funciona, te ajudar a escolher o plano certo e chamar um atendente quando você quiser. Por onde começamos?",
    // Quick replies sugeridos depois do greeting + após cada resposta sem chip ativo
    QUICK_REPLIES: [
      { text: "Quanto custa?", icon: "💸" },
      { text: "Quero ver demo", icon: "🎬" },
      { text: "Como funciona o WhatsApp com IA?", icon: "💬" },
      { text: "Falar com humano", icon: "👋", action: "handoff" },
    ],
    // Trigger contextual: se #planos fica visível >X ms sem widget aberto, abre proativo
    CONTEXTUAL_TRIGGER_SECTION: "#planos",
    CONTEXTUAL_TRIGGER_MS: 60_000,
    // Qualificação progressiva após N trocas user
    QUALIFY_AFTER_TURNS: 4,
    // Horário comercial (SP timezone, hora local 9-19h)
    OFFICE_HOURS: { start: 9, end: 19 },
  };

  // Intenções que disparam handoff direto pro WhatsApp
  const HANDOFF_PATTERNS = [
    /\b(quero\s+falar\s+com|me\s+passa\s+pra|chama\s+um|chama\s+o)\s+(humano|pessoa|atendente|gente|alguém|alguem|vendedor|consultor)\b/i,
    /\b(quero\s+humano|atendente\s+humano|fala(r)?\s+com\s+(humano|pessoa))\b/i,
    /\bnão\s+quero\s+(ia|robô|robo|bot)\b/i,
    /\bwhatsapp\b/i,
  ];
  // Intenções que disparam tag CRM (registro de interesse)
  const INTENT_TAGS = [
    { re: /\b(enterprise|holding|cust(om|omiza)|whitelabel|white\s*label)\b/i, tag: "interesse-enterprise" },
    { re: /\b(estúdio|estudio|plano\s*pro|697)\b/i, tag: "interesse-estudio" },
    { re: /\b(solo|freelance|consultor|297)\b/i, tag: "interesse-solo" },
    { re: /\b(integraç|integrac|api|webhook)\b/i, tag: "interesse-integracao" },
    { re: /\b(migra(r|ção|cao)|mlabs|rd\s*station|pipedrive|hubspot)\b/i, tag: "interesse-migracao" },
  ];

  async function callPublicChat({ message, visitorId, sessionId }) {
    const resp = await fetch(CFG.BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": CFG.SUPABASE_ANON,
        "Authorization": `Bearer ${CFG.SUPABASE_ANON}`,
      },
      body: JSON.stringify({
        widget_id: CFG.WIDGET_ID,
        message,
        visitor_id: visitorId,
        session_id: sessionId || undefined,
      }),
    });
    return resp;
  }

  async function readChatReply(resp) {
    const sessionId = resp.headers.get("X-Session-Id");
    let data = null;
    try { data = await resp.json(); } catch (_) { data = null; }
    return {
      ok: resp.ok && !!data,
      status: resp.status,
      sessionId,
      reply: data?.reply || "",
      blocked: !!data?.blocked,
      firstTurn: !!data?.first_turn,
      fallback: !!data?.fallback,
      raw: data,
    };
  }

  // ---------- Anti-prompt-injection (defesa client-side, EN + PT-BR) ----------
  const INJECTION_PATTERNS = [
    // EN
    /ignore\s+(previous|prior|above|all|the)\s+instructions/i,
    /disregard\s+(previous|prior|above|all|the)\s+instructions/i,
    /you\s+are\s+(now|actually|currently)\s+/i,
    /system\s*prompt/i,
    /developer\s*mode/i,
    /jailbreak/i,
    /reveal\s+(your|the)\s+(system|prompt|instructions|rules)/i,
    /act\s+as\s+(a|an|if)/i,
    /pretend\s+(you|to\s+be)/i,
    /forget\s+(everything|all|your)/i,
    /new\s+instructions/i,
    /\bDAN\b|\bdevmode\b|\boverride\b/i,
    /print\s+(your|the)\s+(system|prompt|instructions)/i,
    /repeat\s+(your|the)\s+(system|prompt|instructions)/i,
    /show\s+me\s+(your|the)\s+(system|prompt|instructions)/i,
    // PT-BR
    /ignor[ae]\s+(as|todas|as\s+suas|suas|essas|todas\s+as)\s+(instru[cç][ãa]o|instru[cç][õo]es|regras)/i,
    /esque[çc]a\s+(tudo|todas|suas|as)\s+(instru|regras|orient)/i,
    /voc[êe]\s+(é|agora|ser[áa])\s+(um|uma|outro|outra)\s+/i,
    /imprim[ae]\s+(seu|suas|o|as)\s+(prompt|regras|instru)/i,
    /mostr[ae]\s+(seu|suas|o|as)\s+(prompt|regras|instru[cç][ãa]o)/i,
    /revele?\s+(seu|suas|as)\s+(instru|regras|prompt|sistema)/i,
    /aja?\s+como\s+(um|uma)\s+/i,
    /finja?\s+(ser|que)\s+/i,
    /novas?\s+regras/i,
    /modo\s+(desenvolvedor|admin|debug)/i,
    /\[(sistema|system|admin|root)\s*:/i,
    // HTML/script
    /<\/?\s*(script|iframe|object|embed|style|link|meta)/i,
  ];
  function looksInjectionAttempt(text) {
    if (!text) return false;
    return INJECTION_PATTERNS.some((re) => re.test(text));
  }
  function sanitizeInput(text) {
    if (!text) return "";
    return text
      .replace(/<\/?\s*(script|iframe|object|embed|style|link)[^>]*>/gi, "")
      .replace(/ /g, " ")                  // normaliza nbsp pra espaço
      .replace(/[ \t]+/g, " ")                  // colapsa espaços múltiplos (não remove os normais!)
      .slice(0, CFG.MAX_INPUT_LEN)
      .trim();
  }

  // ---------- LocalStorage ----------
  function storageGet(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data.expiresAt && Date.now() > data.expiresAt) {
        localStorage.removeItem(key);
        return null;
      }
      return data.value;
    } catch (_) { return null; }
  }
  function storageSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify({
        value, expiresAt: Date.now() + CFG.SESSION_TTL_MS,
      }));
    } catch (_) {}
  }
  function storageDel(key) { try { localStorage.removeItem(key); } catch (_) {} }

  // ---------- State ----------
  const state = {
    lead: storageGet(CFG.STORAGE_KEY_LEAD),
    messages: storageGet(CFG.STORAGE_KEY_MSGS) || [],
    isOpen: false,
    isVisible: false,
    isSending: false,
    lastSendAt: 0,
  };

  // ---------- DOM builders (sem innerHTML com conteúdo dinâmico) ----------
  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") node.className = v;
      else if (k === "html") node.innerHTML = v; // só pra ícones SVG estáticos
      else if (k.startsWith("on")) node.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === "text") node.textContent = v;
      else node.setAttribute(k, v);
    }
    (Array.isArray(children) ? children : [children]).forEach(c => {
      if (c == null) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  // SVG ícones estáticos (constantes do código, OK usar html)
  // BALU_U: glyph "U" arredondado da wordmark + sorriso largo embaixo (igual logo original)
  // ViewBox 24×24 — sorriso ULTRAPASSA o U pelos lados (x=5 a x=19) e fica AFASTADO (y=18 vs U y=4-14.5)
  const ICON_BOT = '<path class="balu-u-body" d="M7.5 4 V10 a4.5 4.5 0 0 0 9 0 V4" /><path class="balu-u-smile" d="M5 18 q7 4 14 0" stroke-width="2" />';
  const ICON_X = '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>';
  const ICON_SEND = '<path d="M2 12l20-9-7 9 7 9-20-9z" fill="currentColor"/>';
  const ICON_ARROW = '<path d="M3 7h8m0 0L7 3m4 4l-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>';
  const ICON_X_SMALL = '<path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>';

  function svg(viewBox, paths, cls) {
    const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("viewBox", viewBox);
    // Default width/height = viewBox dimensions, pra evitar SVG estourar 300×150
    // (default do browser) quando dentro de containers flex sem CSS específico.
    // CSS continua sobrescrevendo livremente.
    const vb = viewBox.split(/\s+/);
    if (vb.length === 4) {
      s.setAttribute("width", vb[2]);
      s.setAttribute("height", vb[3]);
    }
    s.setAttribute("fill", "none");
    s.setAttribute("stroke", "currentColor");
    s.setAttribute("stroke-width", "2");
    s.setAttribute("stroke-linecap", "round");
    s.setAttribute("stroke-linejoin", "round");
    if (cls) s.setAttribute("class", cls);
    s.innerHTML = paths; // paths são constants do código, não dinâmicos
    return s;
  }

  // ---------- Inject root ----------
  const root = el("div", { class: "balu-widget-root hidden", "aria-live": "polite" });
  const hint = el("div", { class: "balu-widget-hint", text: "Quer falar com a Balu? 💬" });
  const triggerBtn = el("button", { class: "balu-widget-trigger", type: "button", "aria-label": "Abrir chat com Balu" }, [
    svg("0 0 24 24", ICON_BOT, "balu-trigger-avatar"),
    svg("0 0 24 24", ICON_X, "balu-trigger-close"),
  ]);
  const panel = el("div", { class: "balu-widget-panel", role: "dialog", "aria-label": "Chat com Balu" });
  const headerAvatar = el("div", { class: "balu-panel-avatar" }, [svg("0 0 24 24", ICON_BOT)]);
  const headerStatusText = el("div", { class: "status" });
  function refreshHeaderStatus() {
    headerStatusText.textContent = isOfficeHours()
      ? "Online · responde em segundos"
      : nextOfficeHour();
    headerStatusText.classList.toggle("off-hours", !isOfficeHours());
  }
  refreshHeaderStatus();
  setInterval(refreshHeaderStatus, 60_000);
  const headerInfo = el("div", { class: "balu-panel-head-info" }, [
    el("div", { class: "name", text: "Balu · Agente da Balu" }),
    headerStatusText,
  ]);
  const headerClose = el("button", { class: "balu-panel-close", type: "button", "aria-label": "Fechar chat" }, [
    svg("0 0 14 14", ICON_X_SMALL),
  ]);
  const header = el("div", { class: "balu-panel-header" }, [headerAvatar, headerInfo, headerClose]);
  const bodyEl = el("div", { class: "balu-panel-body" });
  panel.appendChild(header);
  panel.appendChild(bodyEl);
  root.appendChild(hint);
  root.appendChild(triggerBtn);
  root.appendChild(panel);
  document.body.appendChild(root);

  // ---------- Scroll trigger 30% ----------
  function checkScrollTrigger() {
    if (state.isVisible) return;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    if (docH <= 0) return;
    const pct = window.scrollY / docH;
    if (pct >= CFG.SCROLL_TRIGGER_PCT) {
      state.isVisible = true;
      root.classList.remove("hidden");
      requestAnimationFrame(() => root.classList.add("visible"));
    }
  }
  let scrollTick = null;
  window.addEventListener("scroll", () => {
    if (scrollTick) return;
    scrollTick = setTimeout(() => { scrollTick = null; checkScrollTrigger(); }, 80);
  }, { passive: true });
  checkScrollTrigger();

  // ---------- Trigger contextual (item 9) — se #planos fica visível >60s, abre proativo ----------
  function setupContextualTrigger() {
    const target = document.querySelector(CFG.CONTEXTUAL_TRIGGER_SECTION);
    if (!target || !("IntersectionObserver" in window)) return;
    let timer = null;
    let triggered = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !triggered && !state.isOpen) {
          timer = setTimeout(() => {
            triggered = true;
            if (!state.isOpen && state.isVisible) {
              // Trigger contextual: abre widget proativo
              const hint = root.querySelector(".balu-widget-hint");
              if (hint) hint.textContent = "Posso te ajudar a escolher o plano? 🎯";
              triggerBtn.click();
            }
          }, CFG.CONTEXTUAL_TRIGGER_MS);
        } else if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      });
    }, { threshold: 0.4 });
    observer.observe(target);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupContextualTrigger);
  } else {
    setupContextualTrigger();
  }

  // ---------- Pre-warm backend (item 14) — request silent quando gate abrir ----------
  let prewarmed = false;
  function prewarmBackend() {
    if (prewarmed) return;
    prewarmed = true;
    try {
      // OPTIONS sem dados pra esquentar edge function cold start
      fetch(CFG.BACKEND_URL, { method: "OPTIONS" }).catch(() => {});
    } catch (_) { /* ignore */ }
  }

  // ---------- Status horário comercial (item 17) ----------
  function isOfficeHours() {
    const h = new Date().getHours();
    return h >= CFG.OFFICE_HOURS.start && h < CFG.OFFICE_HOURS.end;
  }
  function nextOfficeHour() {
    const now = new Date();
    const h = now.getHours();
    if (h < CFG.OFFICE_HOURS.start) {
      return `Atendentes humanos voltam em ${CFG.OFFICE_HOURS.start - h}h`;
    }
    // After hours: tomorrow morning
    const hoursToTomorrow = 24 - h + CFG.OFFICE_HOURS.start;
    return `Atendentes humanos voltam às ${CFG.OFFICE_HOURS.start}h (em ~${hoursToTomorrow}h)`;
  }

  // ---------- Open/close ----------
  function open() {
    state.isOpen = true;
    root.classList.add("open");
    prewarmBackend(); // pre-warm edge function (item 14)
    renderBody();
    // Foco automático no input após render (item 5)
    setTimeout(focusInput, 100);
  }
  function close() {
    state.isOpen = false;
    root.classList.remove("open");
  }
  function toggle() { state.isOpen ? close() : open(); }
  triggerBtn.addEventListener("click", toggle);
  headerClose.addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && state.isOpen) close();
  });

  // ---------- Render body ----------
  function renderBody() {
    bodyEl.textContent = ""; // limpa
    if (!state.lead) renderGate();
    else renderChat();
  }

  // ---------- Gate ----------
  function renderGate() {
    const intro = el("div", { class: "balu-gate-intro" }, [
      el("h3", { text: "Antes de conversar, preciso te conhecer 👋" }),
      el("p", { text: "Em 30 segundos a gente já tá no chat. Seus dados ficam comigo e com o atendente — nada de spam." }),
    ]);
    function field(name, label, type, placeholder, errMsg, autocomplete) {
      const input = el("input", {
        id: `balu-${name}`, name, type, placeholder,
        autocomplete: autocomplete || "off", required: "required",
      });
      return el("div", { class: "balu-field", "data-field": name }, [
        el("label", { for: `balu-${name}`, text: label }),
        input,
        el("span", { class: "balu-field-error", text: errMsg }),
      ]);
    }
    const submitBtn = el("button", { type: "submit", class: "balu-gate-submit" }, [
      document.createTextNode("Bora conversar "),
      svg("0 0 14 14", ICON_ARROW),
    ]);
    const privacy = el("div", { class: "balu-gate-privacy" });
    privacy.textContent = "Ao continuar você concorda com nossa política de privacidade e que entraremos em contato.";

    const form = el("form", { class: "balu-gate", novalidate: "novalidate" }, [
      intro,
      field("name", "Nome", "text", "Seu nome", "Como prefere ser chamado?", "given-name"),
      field("whatsapp", "WhatsApp", "tel", "(11) 99999-0000", "Manda o número com DDD pra gente conseguir te chamar.", "tel"),
      field("email", "E-mail", "email", "voce@suaagencia.com", "Precisa ser um e-mail válido.", "email"),
      submitBtn,
      privacy,
    ]);
    form.addEventListener("submit", handleGateSubmit);
    bodyEl.appendChild(form);
  }
  function validateField(field) {
    const wrap = bodyEl.querySelector(`[data-field="${field}"]`);
    const input = wrap?.querySelector("input");
    if (!input) return false;
    const v = input.value.trim();
    let ok = false;
    if (field === "name") {
      // Nome: 2-80 chars, sem keywords de injection (proteção contra ataque via gate)
      ok = v.length >= 2 && v.length <= 80 && !looksInjectionAttempt(v) && /^[\p{L}\p{M}\s'.\-]+$/u.test(v);
    }
    if (field === "whatsapp") {
      // WhatsApp: só dígitos, espaços, parens, hífen, +. 10-20 chars
      ok = /^[\d\s()\-+]{10,20}$/.test(v) && v.replace(/\D/g, "").length >= 10;
    }
    if (field === "email") {
      // Email: formato válido + sem keywords de injection
      ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 120 && !looksInjectionAttempt(v);
    }
    wrap.classList.toggle("error", !ok);
    return ok;
  }
  async function handleGateSubmit(e) {
    e.preventDefault();
    const okN = validateField("name");
    const okW = validateField("whatsapp");
    const okE = validateField("email");
    if (!okN || !okW || !okE) return;
    const form = e.target;
    const submit = form.querySelector(".balu-gate-submit");
    submit.disabled = true;
    submit.textContent = "Conectando…";

    const lead = {
      name: sanitizeInput(form.name.value.trim()),
      whatsapp: form.whatsapp.value.trim().replace(/\s+/g, " "),
      email: form.email.value.trim().toLowerCase(),
      sourcePage: location.pathname,
      sourceUrl: location.href,
      sourceTitle: document.title,
      createdAt: new Date().toISOString(),
    };
    // visitorId estável por email (reusa sessão se voltar)
    lead.visitorId = `lp-${lead.email}`;

    // INIT silenciosa: cria sessão no Balu CRM + injeta dados do lead como user message
    // pro atendente ver os dados de cara na aba Conversas. public-chat-guarded detecta
    // first-turn, retorna o welcome (que ignoramos — já mostramos local) e devolve X-Session-Id.
    const initMsg = `[LEAD CAPTURADO via LP] Nome: ${lead.name} · WhatsApp: ${lead.whatsapp} · Email: ${lead.email} · Origem: ${lead.sourceUrl}`;
    try {
      const initResp = await callPublicChat({
        message: initMsg,
        visitorId: lead.visitorId,
        sessionId: null,
      });
      const initData = await readChatReply(initResp);
      lead.sessionId = initData.sessionId || null;
      if (!initData.ok) lead._initFailed = true;
    } catch (err) {
      console.warn("[balu-agent] init falhou — modo degradado:", err);
      lead._initFailed = true;
    }

    state.lead = lead;
    storageSet(CFG.STORAGE_KEY_LEAD, lead);
    const firstName = lead.name.split(" ")[0];
    state.messages = [{
      role: "agent",
      content: lead._initFailed
        ? `Oi, ${firstName}! Tô com instabilidade rápida aqui — já guardei seus dados, mas se eu travar, um atendente te chama no WhatsApp em até 1h 🤝`
        : CFG.GREETING.replace("Oi!", `Oi, ${firstName}!`),
      ts: Date.now(),
    }];
    storageSet(CFG.STORAGE_KEY_MSGS, state.messages);
    renderChat();
  }

  // ---------- Chat ----------
  function renderChat() {
    bodyEl.textContent = "";
    const messagesList = el("div", { class: "balu-messages", role: "log", "aria-live": "polite", "aria-atomic": "false", "aria-relevant": "additions" });
    // Continuar conversa anterior (item 8): se >5 msgs prévias, mostra aviso reset
    if (state.messages.length > 5 && !state.shownContinueBanner) {
      state.shownContinueBanner = true;
      const banner = el("div", { class: "balu-continue-banner" }, [
        el("span", { text: "👋 De volta? Continue a conversa ou " }),
        el("button", { class: "balu-continue-reset", type: "button", text: "comece do zero" }),
      ]);
      banner.querySelector(".balu-continue-reset").addEventListener("click", () => {
        state.messages = [{
          role: "agent",
          content: CFG.GREETING.replace("Oi!", `Oi, ${state.lead.name.split(" ")[0]}!`),
          ts: Date.now(),
        }];
        storageSet(CFG.STORAGE_KEY_MSGS, state.messages);
        renderChat();
      });
      messagesList.appendChild(banner);
    }
    const inputArea = el("div", { class: "balu-input-area" });
    const inputWrap = el("div", { class: "balu-input-wrap" });
    const input = el("textarea", {
      class: "balu-input", rows: "1",
      placeholder: "Pergunta o que quiser sobre a Balu…",
      maxlength: String(CFG.MAX_INPUT_LEN), "aria-label": "Mensagem",
    });
    const sendBtn = el("button", { class: "balu-send", type: "button", "aria-label": "Enviar mensagem" }, [
      svg("0 0 24 24", ICON_SEND),
    ]);
    inputWrap.appendChild(input);
    inputWrap.appendChild(sendBtn);
    const footer = el("div", { class: "balu-input-footer" }, [
      (() => {
        const span = el("span");
        span.textContent = "";
        const kbd1 = el("kbd", { text: "Enter" });
        const kbd2 = el("kbd", { text: "Shift+Enter" });
        span.appendChild(kbd1);
        span.appendChild(document.createTextNode(" envia · "));
        span.appendChild(kbd2);
        span.appendChild(document.createTextNode(" quebra linha"));
        return span;
      })(),
      el("span", { class: "balu-input-counter", text: `0/${CFG.MAX_INPUT_LEN}` }),
    ]);
    inputArea.appendChild(inputWrap);
    inputArea.appendChild(footer);
    bodyEl.appendChild(messagesList);
    bodyEl.appendChild(inputArea);

    // render mensagens existentes
    state.messages.forEach((m) => messagesList.appendChild(messageEl(m)));
    requestAnimationFrame(() => scrollToBottom());

    input.addEventListener("input", () => {
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 100) + "px";
      footer.querySelector(".balu-input-counter").textContent = `${input.value.length}/${CFG.MAX_INPUT_LEN}`;
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); doSend(); }
    });
    sendBtn.addEventListener("click", doSend);

    async function doSend() {
      if (state.isSending) return;
      const now = Date.now();
      if (now - state.lastSendAt < CFG.MIN_INTERVAL_MS) return;
      const text = sanitizeInput(input.value);
      if (!text) return;

      // Auto-handoff (item 3): se intent de "falar com humano" detectada, pula IA
      if (HANDOFF_PATTERNS.some(re => re.test(text))) {
        input.value = "";
        input.dispatchEvent(new Event("input"));
        return doHandoff(text);
      }

      if (looksInjectionAttempt(text)) {
        appendMsg("user", text);
        appendMsg("agent", "Vou continuar focado na Balu, beleza? 🙂 Como posso te ajudar com a plataforma?", { stream: true });
        input.value = "";
        input.dispatchEvent(new Event("input"));
        return;
      }

      input.value = "";
      input.dispatchEvent(new Event("input"));
      appendMsg("user", text);
      state.lastSendAt = now;
      state.isSending = true;
      sendBtn.disabled = true;
      showTyping();
      root.classList.add("speaking");
      // Remove quick replies enquanto envia
      const oldQR = bodyEl.querySelector(".balu-quick-replies");
      if (oldQR) oldQR.remove();

      // Intent tags (item 10): prefixa msg com [TAGS:...] pra backend logar no lead
      const tags = detectIntentTags(text);
      const enrichedText = tags.length ? `[INTENT:${tags.join(",")}] ${text}` : text;

      try {
        // Retry automático 1x em falha de rede (item 15)
        const fetchWithRetry = async () => {
          try {
            return await callPublicChat({ message: enrichedText, visitorId: state.lead.visitorId, sessionId: state.lead.sessionId });
          } catch (err) {
            await new Promise(r => setTimeout(r, 800));
            return await callPublicChat({ message: enrichedText, visitorId: state.lead.visitorId, sessionId: state.lead.sessionId });
          }
        };
        const resp = await fetchWithRetry();
        const data = await readChatReply(resp);
        if (!data.ok && resp.status === 429) {
          appendMsg("agent", "Calma aí, tô recebendo muitas mensagens 🙏 Dá 1 minutinho e me chama de novo.", { stream: true });
        } else if (!data.ok && resp.status === 403) {
          appendMsg("agent", "Esse canal não tá autorizado por aqui. Se quiser, manda no WhatsApp que um atendente responde rapidinho.", { stream: true });
        } else if (!data.ok) {
          throw new Error(`HTTP ${resp.status}`);
        } else {
          if (data.sessionId && data.sessionId !== state.lead.sessionId) {
            state.lead.sessionId = data.sessionId;
            storageSet(CFG.STORAGE_KEY_LEAD, state.lead);
          }
          appendMsg("agent", data.reply || "Hmm, deixa eu pensar… pode reformular?", { stream: true });
          // Title notification (item 16): se aba sem foco, mostra contador
          notifyTabIfBackground();
          // Qualificação progressiva (item 11): após N trocas
          maybeQualify();
        }
      } catch (err) {
        console.warn("[balu-agent] send falhou:", err);
        appendMsg("agent",
          "Tô com instabilidade rápida aqui 😬 Pode tentar de novo? Se continuar travado, um atendente te chama no WhatsApp em 1h pelos dados que você deixou.",
          { stream: true }
        );
      } finally {
        hideTyping();
        state.isSending = false;
        sendBtn.disabled = false;
        root.classList.remove("speaking");
      }
    }
  }

  // ---------- Title aba (item 16) — notifica quando aba está em background ----------
  let unreadCount = 0;
  const originalTitle = typeof document !== "undefined" ? document.title : "";
  function notifyTabIfBackground() {
    if (typeof document === "undefined") return;
    if (!document.hidden) return;
    unreadCount++;
    document.title = `(${unreadCount}) Balu respondeu · ${originalTitle}`;
  }
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && unreadCount > 0) {
        unreadCount = 0;
        document.title = originalTitle;
      }
    });
  }

  // ---------- Qualificação progressiva (item 11) ----------
  function maybeQualify() {
    if (state.qualified) return;
    const userMsgs = state.messages.filter(m => m.role === "user").length;
    if (userMsgs < CFG.QUALIFY_AFTER_TURNS) return;
    state.qualified = true; // só pergunta 1 vez por sessão
    setTimeout(() => {
      appendMsg("agent",
        "Antes de continuar, posso te perguntar duas coisas pra te ajudar melhor?\n\n" +
        "1. **Tamanho da agência?** (Solo, 5-10 clientes, 10-25, 25+)\n" +
        "2. **Maior dor hoje?** (CRM, mídia, criação, financeiro, gestão)\n\n" +
        "Pode responder em texto livre — só me dá um contexto.",
        { stream: true }
      );
    }, 1200);
  }

  // ---------- Mini markdown renderer XSS-safe (DOM methods, nunca innerHTML) ----------
  function isSafeUrl(url) {
    return /^(https?:\/\/|mailto:|tel:|\/)/.test(url);
  }
  function renderInlineMd(parent, text) {
    // Ordem importa: links primeiro (mais específico), depois bold, italic, code
    const re = /(\[[^\]]+\]\((?:https?:\/\/|mailto:|tel:|\/)[^)\s]+\)|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
    let lastIdx = 0;
    for (const match of text.matchAll(re)) {
      const idx = match.index;
      const token = match[0];
      if (idx > lastIdx) parent.appendChild(document.createTextNode(text.slice(lastIdx, idx)));
      if (token.startsWith("[")) {
        const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (linkMatch && isSafeUrl(linkMatch[2])) {
          const a = document.createElement("a");
          a.href = linkMatch[2];
          a.textContent = linkMatch[1];
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          parent.appendChild(a);
        } else {
          parent.appendChild(document.createTextNode(token));
        }
      } else if (token.startsWith("**") && token.endsWith("**")) {
        const s = document.createElement("strong");
        s.textContent = token.slice(2, -2);
        parent.appendChild(s);
      } else if (token.startsWith("`") && token.endsWith("`")) {
        const c = document.createElement("code");
        c.textContent = token.slice(1, -1);
        parent.appendChild(c);
      } else {
        const e = document.createElement("em");
        e.textContent = token.slice(1, -1);
        parent.appendChild(e);
      }
      lastIdx = idx + token.length;
    }
    if (lastIdx < text.length) parent.appendChild(document.createTextNode(text.slice(lastIdx)));
  }

  function renderMarkdown(container, raw) {
    container.textContent = "";
    const text = String(raw || "");
    if (!text) return;
    const lines = text.split(/\r?\n/);
    let i = 0;
    while (i < lines.length) {
      const trimmed = lines[i].trim();
      // Headings ###, ##, # (limit a h4 visualmente)
      const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
      if (headingMatch) {
        const level = Math.min(4, headingMatch[1].length);
        const h = document.createElement("h" + (level + 2 > 6 ? 6 : level + 2));
        h.className = "balu-md-h" + level;
        renderInlineMd(h, headingMatch[2]);
        container.appendChild(h);
        i++;
        continue;
      }
      if (/^[-*•]\s+/.test(trimmed)) {
        const ul = document.createElement("ul");
        while (i < lines.length && /^[-*•]\s+/.test(lines[i].trim())) {
          const li = document.createElement("li");
          renderInlineMd(li, lines[i].trim().replace(/^[-*•]\s+/, ""));
          ul.appendChild(li);
          i++;
        }
        container.appendChild(ul);
        continue;
      }
      if (/^\d+\.\s+/.test(trimmed)) {
        const ol = document.createElement("ol");
        while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
          const li = document.createElement("li");
          renderInlineMd(li, lines[i].trim().replace(/^\d+\.\s+/, ""));
          ol.appendChild(li);
          i++;
        }
        container.appendChild(ol);
        continue;
      }
      if (trimmed.startsWith(">")) {
        const bq = document.createElement("blockquote");
        renderInlineMd(bq, trimmed.replace(/^>\s?/, ""));
        container.appendChild(bq);
        i++;
        continue;
      }
      if (trimmed === "") { i++; continue; }
      const p = document.createElement("p");
      renderInlineMd(p, trimmed);
      container.appendChild(p);
      i++;
    }
  }

  // ---------- Mensagens (XSS-safe via DOM methods, nunca innerHTML com conteúdo) ----------
  function messageEl(m) {
    const wrap = el("div", { class: "balu-msg-wrap " + m.role });
    const div = el("div", { class: "balu-msg " + m.role });
    if (m.role === "agent") {
      renderMarkdown(div, m.content);
      // Botão copiar (item 7) — só agent
      const copyBtn = el("button", {
        class: "balu-msg-copy",
        type: "button",
        title: "Copiar resposta",
        "aria-label": "Copiar resposta",
      });
      copyBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="3" y="3" width="8" height="9" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M5 3V1.5h7.5V11" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
      copyBtn.addEventListener("click", () => {
        try { navigator.clipboard.writeText(String(m.content || "")); } catch(_) {}
        copyBtn.classList.add("copied");
        copyBtn.title = "Copiado!";
        setTimeout(() => { copyBtn.classList.remove("copied"); copyBtn.title = "Copiar resposta"; }, 1500);
      });
      wrap.appendChild(div);
      wrap.appendChild(copyBtn);
    } else {
      div.textContent = String(m.content || "");
      wrap.appendChild(div);
    }
    return wrap;
  }
  function appendMsg(role, content, opts = {}) {
    const msg = { role, content, ts: Date.now() };
    state.messages.push(msg);
    storageSet(CFG.STORAGE_KEY_MSGS, state.messages.slice(-50));
    const list = bodyEl.querySelector(".balu-messages");
    if (list) {
      const node = messageEl(msg);
      // Streaming simulado (item 1): revela palavra por palavra agent msgs
      if (role === "agent" && opts.stream && content) {
        const div = node.querySelector(".balu-msg");
        const fullText = String(content);
        div.textContent = "";
        list.appendChild(node);
        scrollToBottom();
        streamText(div, fullText).then(() => {
          // Re-render markdown final + adicionar quick replies + intent tag
          renderMarkdown(div, fullText);
          maybeAddQuickReplies(list);
          focusInput();
        });
      } else {
        list.appendChild(node);
        scrollToBottom();
        if (role === "agent") {
          maybeAddQuickReplies(list);
          focusInput();
        }
      }
    }
  }
  // Streaming simulado por chunks de palavras (não bloqueia segurança do output guard
  // que rodou no backend antes da resposta voltar)
  function streamText(node, text) {
    return new Promise((resolve) => {
      const words = text.split(/(\s+)/); // mantém espaços
      let i = 0;
      const step = () => {
        if (i >= words.length) return resolve();
        node.textContent += words[i++];
        scrollToBottom();
        const delay = Math.random() * 22 + 18; // 18-40ms — natural mas rápido
        setTimeout(step, delay);
      };
      step();
    });
  }
  function focusInput() {
    const inp = bodyEl.querySelector(".balu-input");
    if (inp && document.activeElement !== inp && state.isOpen) {
      try { inp.focus({ preventScroll: true }); } catch(_) {}
    }
  }
  function scrollToBottom() {
    const list = bodyEl.querySelector(".balu-messages");
    if (list) list.scrollTop = list.scrollHeight;
  }
  function showTyping() {
    const list = bodyEl.querySelector(".balu-messages");
    if (!list || list.querySelector(".balu-typing")) return;
    const t = el("div", { class: "balu-typing" }, [
      el("div", { class: "balu-typing-dots" }, [el("span"), el("span"), el("span")]),
      el("span", { class: "balu-typing-label", text: "Balu está digitando…" }),
    ]);
    list.appendChild(t);
    scrollToBottom();
  }

  // Quick replies (item 2) — sugestões clicáveis após resposta do agent
  function maybeAddQuickReplies(list) {
    const old = list.querySelector(".balu-quick-replies");
    if (old) old.remove();
    if (state.isSending) return;
    const wrap = el("div", { class: "balu-quick-replies", role: "group", "aria-label": "Sugestões" });
    CFG.QUICK_REPLIES.forEach((q) => {
      const b = el("button", { class: "balu-quick-reply", type: "button" });
      if (q.icon) {
        const ic = document.createElement("span");
        ic.className = "balu-quick-reply-icon";
        ic.textContent = q.icon;
        b.appendChild(ic);
      }
      b.appendChild(document.createTextNode(q.text));
      b.addEventListener("click", () => {
        if (q.action === "handoff") return doHandoff("Quero falar com humano");
        const inp = bodyEl.querySelector(".balu-input");
        if (inp) {
          inp.value = q.text;
          inp.dispatchEvent(new Event("input"));
          // dispara send automaticamente
          const sendBtn = bodyEl.querySelector(".balu-send");
          if (sendBtn) sendBtn.click();
        }
      });
      wrap.appendChild(b);
    });
    list.appendChild(wrap);
    scrollToBottom();
  }

  // Handoff direto pro WhatsApp (item 3)
  function doHandoff(userMsg) {
    appendMsg("user", userMsg);
    appendMsg("agent", "Beleza! Te encaminho pro WhatsApp agora. Um atendente humano vai continuar daqui 🤝");
    const ctx = `Lead vindo do chat IA da LP (${state.lead?.name || "anônimo"}). Última mensagem: "${userMsg}".`;
    const url = `https://wa.me/${CFG.WHATSAPP}?text=${encodeURIComponent(ctx)}`;
    setTimeout(() => { window.open(url, "_blank", "noopener"); }, 800);
  }
  // Detecta tags de intenção pra anexar à mensagem que vai pro backend
  function detectIntentTags(text) {
    const tags = [];
    INTENT_TAGS.forEach(t => { if (t.re.test(text)) tags.push(t.tag); });
    return tags;
  }
  function hideTyping() {
    const t = bodyEl.querySelector(".balu-typing");
    if (t) t.remove();
  }

  // ---------- Reset (debug pelo console) ----------
  window.baluReset = function() {
    storageDel(CFG.STORAGE_KEY_LEAD);
    storageDel(CFG.STORAGE_KEY_MSGS);
    state.lead = null;
    state.messages = [];
    if (state.isOpen) renderBody();
    console.log("[balu-agent] sessão resetada");
  };
})();
