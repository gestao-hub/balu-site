/* =========================================================
   BALU — Cookie Consent Banner (LGPD)
   Pattern: aceitar / só essenciais.
   Persistência: localStorage 'balu_cookie_consent_v1'.
   ========================================================= */
(() => {
  "use strict";
  const KEY = "balu_cookie_consent_v1";
  const TTL_MS = 180 * 24 * 60 * 60 * 1000; // 180 dias

  function getConsent() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data.expiresAt && Date.now() > data.expiresAt) return null;
      return data;
    } catch { return null; }
  }
  function setConsent(value) {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        value,
        timestamp: new Date().toISOString(),
        expiresAt: Date.now() + TTL_MS,
      }));
    } catch {}
    window.__baluConsent = value;
    document.dispatchEvent(new CustomEvent("balu:consent", { detail: { value } }));
  }

  const existing = getConsent();
  if (existing) {
    window.__baluConsent = existing.value;
    return;
  }

  function el(tag, attrs = {}, children = []) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else if (k.startsWith("on")) n.addEventListener(k.slice(2).toLowerCase(), v);
      else n.setAttribute(k, v);
    }
    (Array.isArray(children) ? children : [children]).forEach(c => {
      if (c == null) return;
      n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return n;
  }

  function build() {
    const banner = el("div", { class: "balu-cookie-banner", role: "dialog", "aria-label": "Consentimento de cookies" });
    const text = el("p", { class: "balu-cookie-text" }, [
      "Usamos cookies essenciais pra fazer a Balu funcionar e analíticos agregados pra entender o que dá certo. Você pode recusar e ainda navegar normalmente. ",
      el("a", { href: "/politica-de-privacidade.html", text: "Saiba mais" }),
      ".",
    ]);
    const actions = el("div", { class: "balu-cookie-actions" }, [
      el("button", {
        class: "balu-cookie-btn balu-cookie-btn-ghost",
        type: "button",
        text: "Só essenciais",
        onclick: () => { setConsent("essential"); close(); },
      }),
      el("button", {
        class: "balu-cookie-btn balu-cookie-btn-accent",
        type: "button",
        text: "Aceitar tudo",
        onclick: () => { setConsent("all"); close(); },
      }),
    ]);
    banner.appendChild(text);
    banner.appendChild(actions);
    return banner;
  }

  const banner = build();
  function close() {
    banner.classList.add("balu-cookie-closing");
    setTimeout(() => banner.remove(), 400);
  }
  if (document.body) document.body.appendChild(banner);
  else document.addEventListener("DOMContentLoaded", () => document.body.appendChild(banner));
})();
