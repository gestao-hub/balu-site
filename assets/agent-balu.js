/* =========================================================
   BALU AGENT — Widget de IA Embedado
   Frontend vanilla (sem React). Adaptado do FloatingAiAssistant.
   Flow: scroll 30% → trigger visível → click → gate form → chat
   Segurança: nenhum innerHTML com conteúdo de mensagem (XSS-safe)
   ========================================================= */
(() => {
  "use strict";

  const CFG = {
    // Endpoint do public-chat do Balu CRM (Supabase envsirumquqpmkcayncr)
    BACKEND_URL: "https://envsirumquqpmkcayncr.supabase.co/functions/v1/public-chat",
    SUPABASE_ANON: "sb_publishable_g6WyB24Jy7DsL1bELPEGtQ__R_oBN7E",
    // Widget "Balu LP Widget" criado em chat_widgets — vinculado ao agente "Balu LP"
    WIDGET_ID: "fc065444-c2d2-40ed-85c6-9ee63b8a15ff",
    SCROLL_TRIGGER_PCT: 0.30,
    SESSION_TTL_MS: 7 * 24 * 60 * 60 * 1000,
    MAX_INPUT_LEN: 1500,
    MIN_INTERVAL_MS: 1500,
    STORAGE_KEY_LEAD: "balu_widget_lead_v2",
    STORAGE_KEY_MSGS: "balu_widget_msgs_v2",
    GREETING: "Oi! Sou o Balu 🤝 Posso te explicar como a plataforma funciona, te ajudar a escolher o plano certo e marcar uma call com o Michel quando você quiser. Por onde começamos?",
  };

  // Parser de SSE stream do public-chat (formato: "data: {...}\n\ndata: [DONE]\n\n")
  async function parseSSEStream(resp) {
    if (!resp.body) {
      const t = await resp.text();
      return t || "";
    }
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let full = "";
    let buf = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() || "";
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const payload = line.slice(6).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const json = JSON.parse(payload);
          const piece = json?.choices?.[0]?.delta?.content;
          if (piece) full += piece;
        } catch (_) { /* ignore parse errors */ }
      }
    }
    return full;
  }

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
      .replace(/ /g, "")
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
  const headerInfo = el("div", { class: "balu-panel-head-info" }, [
    el("div", { class: "name", text: "Balu · Agente da Balu" }),
    el("div", { class: "status", text: "Online · responde em segundos" }),
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

  // ---------- Open/close ----------
  function open() {
    state.isOpen = true;
    root.classList.add("open");
    renderBody();
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
      el("p", { text: "Em 30 segundos a gente já tá no chat. Seus dados ficam comigo e com o Michel — nada de spam." }),
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
    // pra Michel ver os dados de cara na aba Conversas. public-chat detecta first-turn e
    // retorna o welcome (que ignoramos — já mostramos local).
    const initMsg = `[LEAD CAPTURADO via LP] Nome: ${lead.name} · WhatsApp: ${lead.whatsapp} · Email: ${lead.email} · Origem: ${lead.sourceUrl}`;
    try {
      const initResp = await callPublicChat({
        message: initMsg,
        visitorId: lead.visitorId,
        sessionId: null,
      });
      lead.sessionId = initResp.headers.get("X-Session-Id") || null;
      // Drena stream pra completar a request (não usamos a resposta)
      await parseSSEStream(initResp);
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
        ? `Oi, ${firstName}! Tô com instabilidade rápida aqui — já guardei seus dados, mas se eu travar, o Michel te chama no WhatsApp em até 1h 🤝`
        : CFG.GREETING.replace("Oi!", `Oi, ${firstName}!`),
      ts: Date.now(),
    }];
    storageSet(CFG.STORAGE_KEY_MSGS, state.messages);
    renderChat();
  }

  // ---------- Chat ----------
  function renderChat() {
    bodyEl.textContent = "";
    const messagesList = el("div", { class: "balu-messages" });
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

      if (looksInjectionAttempt(text)) {
        appendMsg("user", text);
        appendMsg("agent", "Vou continuar focado na Balu, beleza? 🙂 Como posso te ajudar com a plataforma?");
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

      try {
        const resp = await callPublicChat({
          message: text,
          visitorId: state.lead.visitorId,
          sessionId: state.lead.sessionId,
        });
        if (!resp.ok) {
          const errBody = await resp.text().catch(() => "");
          throw new Error(`HTTP ${resp.status}: ${errBody.slice(0, 120)}`);
        }
        // Atualiza session_id se o backend devolveu novo (primeira chamada se init falhou)
        const newSid = resp.headers.get("X-Session-Id");
        if (newSid && newSid !== state.lead.sessionId) {
          state.lead.sessionId = newSid;
          storageSet(CFG.STORAGE_KEY_LEAD, state.lead);
        }
        const reply = await parseSSEStream(resp);
        appendMsg("agent", reply || "Hmm, deixa eu pensar… pode reformular?");
      } catch (err) {
        console.warn("[balu-agent] send falhou:", err);
        appendMsg("agent",
          "Tô com instabilidade rápida aqui 😬 Pode tentar de novo? Se continuar travado, o Michel te chama no WhatsApp em 1h pelos dados que você deixou."
        );
      } finally {
        hideTyping();
        state.isSending = false;
        sendBtn.disabled = false;
        root.classList.remove("speaking");
      }
    }
  }

  // ---------- Mensagens (XSS-safe: sem innerHTML em conteúdo) ----------
  function messageEl(m) {
    const div = el("div", { class: "balu-msg " + m.role });
    // Conteúdo SEMPRE como text nodes (nunca innerHTML com m.content)
    div.textContent = String(m.content || "");
    return div;
  }
  function appendMsg(role, content) {
    const msg = { role, content, ts: Date.now() };
    state.messages.push(msg);
    storageSet(CFG.STORAGE_KEY_MSGS, state.messages.slice(-50));
    const list = bodyEl.querySelector(".balu-messages");
    if (list) {
      list.appendChild(messageEl(msg));
      scrollToBottom();
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
      el("span"), el("span"), el("span"),
    ]);
    list.appendChild(t);
    scrollToBottom();
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
