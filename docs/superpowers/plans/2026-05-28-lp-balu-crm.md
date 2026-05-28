# LP Balu CRM — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir landing page de conversão mobile-first em `lp-crm.html` (servida como `lp.baluhub.com.br/crm` via Vercel host-rewrite) para o Balu CRM, WhatsApp-first pro Michel com tripwire R$47, reaproveitando o design system da LP do Agência.

**Architecture:** Página standalone que **linka `agencia.css?v=5`** (tokens, fontes, hero, marquee, efeitos, ritmo) **+ `crm.css?v=1`** (Before/After + Ponte + Casos de uso + 4 overrides de background). JS `crm.js` é cópia adaptada do `agencia.js` com texto CRM e eventos `*_crm`. Vercel `rewrites` host-scoped serve `/lp-crm.html` quando o host é `lp.baluhub.com.br`.

**Tech Stack:** HTML5 semântico, CSS puro (custom properties), JS vanilla (`defer`), deploy estático Vercel (`cleanUrls`). Sem build step.

**Spec:** [docs/superpowers/specs/2026-05-28-lp-balu-crm-design.md](../specs/2026-05-28-lp-balu-crm-design.md)

---

## Método de verificação (mesmo padrão que funcionou na LP da Agência)

1. Servidor local: `python3 -m http.server 8080` em `/root/balu-site-1` (subir uma vez no Task 1, se ainda não estiver no ar).
2. Playwright MCP (`mcp__playwright__*`) — `browser_navigate` para `http://localhost:8080/lp-crm.html` (em local não temos host-rewrite, o arquivo direto serve), `browser_console_messages` (esperado: **zero erros JS**), `browser_take_screenshot` (mobile 390 + desktop 1280 via `browser_resize`).
3. Commit por task com `feat(lp-crm): <descrição>` + trailer `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`.

> Local serve `/lp-crm.html` diretamente (sem cleanUrls). Em prod, `lp.baluhub.com.br/crm` será rewrite pra `/lp-crm.html`. Canonical é `https://lp.baluhub.com.br/crm`.

---

## File Structure

| Arquivo | Responsabilidade |
|---------|------------------|
| `lp-crm.html` (criar) | Markup semântico da LP — head com SEO/schema, linka agencia.css + crm.css, conteúdo das 12 seções |
| `assets/crm.css` (criar) | APENAS o que é específico do CRM: estilos da `.before-after`, `.ponte`, `.casos-uso`, 4 overrides de background |
| `assets/crm.js` (criar) | WhatsApp+UTM (texto CRM), tracking `*_crm`, reveal/stagger, sticky, count-up, scroll progress (cópia adaptada do agencia.js) |
| `vercel.json` (modificar) | Adicionar `rewrites` host-scoped |
| `sitemap.xml` (modificar) | Adicionar entrada `lp.baluhub.com.br/crm` |

**Constantes (usar exatamente assim):**
- WhatsApp: `https://wa.me/5543991086610`
- Texto base WhatsApp: `Olá Michel, vim da página do Balu CRM e quero parar de perder lead no WhatsApp.`
- Atributo dos CTAs WhatsApp: `data-wa`
- Atributo dos CTAs tripwire: `data-tripwire`
- Eventos de tracking: `whatsapp_click_crm`, `tripwire_click_crm`
- Classe de reveal: `reveal` (ativa com `visible`)

---

## Task 1: Scaffold — HTML base, crm.css vazio, crm.js, Vercel rewrite

**Files:**
- Create: `lp-crm.html`
- Create: `assets/crm.css`
- Create: `assets/crm.js`
- Modify: `vercel.json`

- [ ] **Step 1: Criar `assets/crm.css` com cabeçalho (vazio funcional)**

```css
/* ===== Balu CRM LP — específico do CRM =====
   Tokens, fontes, base, hero, marquee, efeitos e ritmo geral vêm de
   assets/agencia.css. Aqui ficam APENAS Before/After, Ponte, Casos de uso
   e overrides de background pro ritmo correto na ordem do CRM. */
```

- [ ] **Step 2: Criar `assets/crm.js` (cópia do agencia.js com texto CRM e eventos `*_crm`)**

```js
/* Balu CRM LP — comportamentos */
(function () {
  'use strict';

  // 1. WhatsApp + UTM
  var WA_BASE = 'https://wa.me/5543991086610';
  var WA_TEXT = 'Olá Michel, vim da página do Balu CRM e quero parar de perder lead no WhatsApp.';
  function buildWaUrl() {
    var qs = window.location.search.replace(/^\?/, '');
    var text = WA_TEXT + (qs ? ' [' + qs + ']' : '');
    return WA_BASE + '?text=' + encodeURIComponent(text);
  }
  function wireWhatsApp() {
    var url = buildWaUrl();
    document.querySelectorAll('[data-wa]').forEach(function (a) {
      a.setAttribute('href', url);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
      a.addEventListener('click', function () { track('whatsapp_click_crm'); });
    });
    document.querySelectorAll('[data-tripwire]').forEach(function (a) {
      a.addEventListener('click', function () { track('tripwire_click_crm'); });
    });
  }

  // 2. Tracking (guarda contra ausência de fbq/gtag)
  function track(event) {
    try { if (typeof window.fbq === 'function') window.fbq('trackCustom', event); } catch (e) {}
    try { if (typeof window.gtag === 'function') window.gtag('event', event); } catch (e) {}
  }

  function prefersReduced() {
    return window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  }

  // 3. Reveal on scroll com stagger temporário (limpa transitionDelay depois)
  function wireReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || prefersReduced()) {
      els.forEach(function (el) { el.classList.add('visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var sibs = el.parentElement ? [].slice.call(el.parentElement.children).filter(function (c) { return c.classList.contains('reveal'); }) : [];
        var idx = sibs.indexOf(el);
        var delay = idx > 0 ? Math.min(idx, 6) * 70 : 0;
        if (delay) {
          el.style.transitionDelay = delay + 'ms';
          setTimeout(function () { el.style.transitionDelay = ''; }, delay + 600);
        }
        el.classList.add('visible');
        io.unobserve(el);
      });
    }, { threshold: 0.1 });
    els.forEach(function (el) { io.observe(el); });
  }

  // 4. Sticky CTA mobile (mostra após hero)
  function wireStickyCta() {
    var bar = document.querySelector('.sticky-cta');
    var hero = document.querySelector('.hero');
    if (!bar || !hero) return;
    function onScroll() {
      var past = window.scrollY > hero.offsetHeight - 80;
      bar.classList.toggle('show', past);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // 5. Count-up nos números
  function wireCountUp() {
    var els = document.querySelectorAll('[data-count]');
    if (!els.length) return;
    if (!('IntersectionObserver' in window) || prefersReduced()) return;
    function run(el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      var dur = 1100, start = null;
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      el.textContent = '0';
      requestAnimationFrame(step);
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.5 });
    els.forEach(function (el) { io.observe(el); });
  }

  // 6. Barra de progresso de scroll
  function wireScrollProgress() {
    var bar = document.querySelector('.scroll-progress > span');
    if (!bar) return;
    function onScroll() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
      bar.style.width = pct + '%';
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  document.addEventListener('DOMContentLoaded', function () {
    wireWhatsApp(); wireReveal(); wireStickyCta(); wireCountUp(); wireScrollProgress();
  });
})();
```

- [ ] **Step 3: Criar `lp-crm.html` com head completo (SEO + schema) e `<main>` vazio**

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Balu CRM — Pare de perder lead no WhatsApp. CRM com IA omnichannel</title>
  <meta name="description" content="Inbox unificado (WhatsApp, Instagram, Messenger, e-mail), agentes de IA que atendem e qualificam, pipeline visual e propostas com assinatura. Fale com um especialista." />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://lp.baluhub.com.br/crm" />
  <meta name="theme-color" content="#1F88C2" />
  <link rel="icon" type="image/svg+xml" href="favicon.svg" />
  <link rel="manifest" href="/manifest.json" />

  <!-- Fonts (mesmos da Agência) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" href="assets/fonts/cal-sans-latin-400.woff2" as="font" type="font/woff2" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/agencia.css?v=5" />
  <link rel="stylesheet" href="assets/crm.css?v=1" />
  <noscript><style>.reveal{opacity:1!important;transform:none!important}</style></noscript>

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="pt_BR" />
  <meta property="og:site_name" content="Balu" />
  <meta property="og:title" content="Balu CRM — Pare de perder lead no WhatsApp" />
  <meta property="og:description" content="Inbox unificado + Agentes de IA + Pipeline visual + Propostas com assinatura. CRM omnichannel com IA." />
  <meta property="og:url" content="https://lp.baluhub.com.br/crm" />
  <meta property="og:image" content="https://baluhub.com.br/og-image-crm.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Balu CRM — Pare de perder lead no WhatsApp" />
  <meta name="twitter:image" content="https://baluhub.com.br/og-image-crm.png" />

  <!-- TODO_PIXEL_ID: Meta Pixel (Task 14) -->
  <!-- TODO_GA4_ID: Google Analytics 4 (Task 14) -->

  <!-- JSON-LD -->
  <script type="application/ld+json">
  {
    "@context":"https://schema.org",
    "@graph":[
      {"@type":"Organization","@id":"https://baluhub.com.br/#organization","name":"Balu","url":"https://baluhub.com.br/","logo":"https://baluhub.com.br/assets/logo-white.svg"},
      {"@type":"Product","name":"Balu CRM","brand":{"@type":"Brand","name":"Balu"},"description":"CRM omnichannel com IA: inbox unificado (WhatsApp, Instagram, Messenger, e-mail, marketplaces), agentes de IA com RAG, Sales Assist, pipeline visual, propostas com assinatura.","category":"SoftwareApplication"},
      {"@type":"FAQPage","mainEntity":[]}
    ]
  }
  </script>
</head>
<body>
  <div class="scroll-progress" aria-hidden="true"><span></span></div>
  <main id="main">
    <!-- seções entram nas próximas tasks -->
  </main>
  <script src="assets/crm.js?v=1" defer></script>
</body>
</html>
```

- [ ] **Step 4: Modificar `vercel.json` — adicionar `rewrites` host-scoped**

Ler o `vercel.json` atual; adicionar o array `rewrites` no topo do JSON (antes de `cleanUrls` ou junto com os outros campos top-level). Resultado final dos campos top-level: `cleanUrls`, `trailingSlash`, `rewrites`, `headers`. Conteúdo exato a adicionar:

```jsonc
  "rewrites": [
    {
      "source": "/crm",
      "has": [{ "type": "host", "value": "lp.baluhub.com.br" }],
      "destination": "/lp-crm.html"
    }
  ],
```

> Em local não há host rewrite — você acessa `http://localhost:8080/lp-crm.html` direto.

- [ ] **Step 5: Verificar**

Se servidor não estiver no ar: `cd /root/balu-site-1 && python3 -m http.server 8080 &` (background).
`curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/lp-crm.html` → esperado `200`.
Playwright: `browser_navigate` para `http://localhost:8080/lp-crm.html`; `browser_console_messages` → **zero erros**; `browser_take_screenshot` (página em branco válida, título correto).

- [ ] **Step 6: Commit**

```bash
git add lp-crm.html assets/crm.css assets/crm.js vercel.json
git commit -m "feat(lp-crm): scaffold (head/SEO/schema, crm.css/js, Vercel host-rewrite)"
```

---

## Task 2: Barra de urgência + Hero + strip de stats

**Files:**
- Modify: `lp-crm.html` (dentro do `<main>`)

- [ ] **Step 1: Inserir markup no topo do `<main>` (substituindo o placeholder comment)**

```html
<!-- 0. Barra de urgência -->
<header class="site-banner">
  <div class="urgency-bar"><span aria-hidden="true">⚡</span> Configuração assistida do seu WhatsApp inclusa · <a href="#oferta">Fale com o Michel →</a></div>
</header>
```

Atenção: o `<header>` fica FORA do `<main>` (igual à LP da Agência). Reposicionar: mover esse `<header>` pra antes do `<main>` (entre `<body>` e `<main>`). O `.scroll-progress` permanece como primeiro filho de `<body>`.

Estrutura final do início do body:

```html
<body>
  <div class="scroll-progress" aria-hidden="true"><span></span></div>
  <!-- 0. Barra de urgência -->
  <header class="site-banner">
    <div class="urgency-bar"><span aria-hidden="true">⚡</span> Configuração assistida do seu WhatsApp inclusa · <a href="#oferta">Fale com o Michel →</a></div>
  </header>
  <main id="main">
    <!-- 1. Hero -->
    <section class="hero">
      ...
    </section>
  </main>
```

- [ ] **Step 2: Inserir hero dentro do `<main>` (como primeira seção)**

```html
<!-- 1. Hero -->
<section class="hero">
  <div class="wrap hero-grid">
    <div class="hero-copy reveal">
      <span class="eyebrow">CRM OMNICHANNEL COM IA</span>
      <h1>Pare de perder lead <span class="display-accent">no WhatsApp.</span></h1>
      <!-- Variação B p/ A/B test futuro: "Seu lead chamou no WhatsApp. Quem respondeu?" -->
      <p class="hero-sub">Um inbox só pra WhatsApp, Instagram, Messenger, e-mail e marketplaces. <strong>Agentes de IA</strong> que atendem, qualificam e marcam reunião enquanto seu time dorme. Pipeline que se atualiza sozinho.</p>
      <a class="btn btn-cta" data-wa href="#">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.449L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.115z"/></svg>
        Quero conversar com o Michel
      </a>
      <p class="hero-microcopy">Conversa de 15 min · Sem compromisso · Resposta em até 1h</p>
      <a href="#ponte" class="hero-secondary-link">Ver como funciona ↓</a>
    </div>
    <div class="hero-visual reveal">
      <div class="hero-mockup">
        <div class="browser-frame">
          <div class="browser-bar" aria-hidden="true"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="browser-url">app.baluhub.com.br/inbox</span></div>
          <img src="assets/screenshots/crm-conversations.png" alt="Inbox unificado do Balu CRM" width="1280" height="720" fetchpriority="high" />
        </div>
      </div>
    </div>
  </div>
  <div class="wrap stats-strip reveal">
    <div class="stat"><span class="stat-num"><span data-count="6">6</span> canais</span><span class="stat-lbl">num inbox só</span></div>
    <div class="stat"><span class="stat-num">IA 24/7</span><span class="stat-lbl">atende quando seu time não pode</span></div>
    <div class="stat"><span class="stat-num"><span data-count="5">5</span> min</span><span class="stat-lbl">tempo de resposta = 21x mais chance de fechar</span></div>
  </div>
</section>
```

- [ ] **Step 3: Verificar** — reload `http://localhost:8080/lp-crm.html`. Conferir: 1 `<h1>` (`browser_evaluate` `document.querySelectorAll('h1').length === 1`), CTA laranja, `data-wa` href contém `wa.me/5543991086610` (`browser_evaluate` `document.querySelector('[data-wa]').href`), imagem `crm-conversations.png` carrega sem 404, zero erros de console. Screenshot mobile 390 + desktop 1280.

- [ ] **Step 4: Commit**

```bash
git add lp-crm.html
git commit -m "feat(lp-crm): barra de urgência, hero e strip de stats"
```

---

## Task 3: Logo bar (reuso de wordmarks)

**Files:**
- Modify: `lp-crm.html` (após hero)

- [ ] **Step 1: Inserir markup AFTER hero `</section>`, ainda dentro de `<main>`**

```html
<!-- 2. Logo bar -->
<section class="logobar">
  <div class="wrap">
    <p class="logobar-label reveal">Empresas que pararam de perder lead:</p>
    <div class="marquee reveal">
      <div class="marquee-track">
        <span class="client-name">Vivacqua</span>
        <span class="client-name">Sea Hop</span>
        <span class="client-name">Esa Energia</span>
        <span class="client-name">Upperground</span>
        <span class="client-name">Bangalô</span>
        <span class="client-name">Tiago Mônaco</span>
        <span class="client-name">Piper Hub</span>
        <!-- set duplicado p/ loop contínuo (decorativo) -->
        <span class="client-name" aria-hidden="true">Vivacqua</span>
        <span class="client-name" aria-hidden="true">Sea Hop</span>
        <span class="client-name" aria-hidden="true">Esa Energia</span>
        <span class="client-name" aria-hidden="true">Upperground</span>
        <span class="client-name" aria-hidden="true">Bangalô</span>
        <span class="client-name" aria-hidden="true">Tiago Mônaco</span>
        <span class="client-name" aria-hidden="true">Piper Hub</span>
      </div>
    </div>
  </div>
</section>
```

> CSS dos wordmarks + marquee animation já estão em `agencia.css`. Nada novo aqui.

- [ ] **Step 2: Verificar** — reload, screenshot, console zero erros.

- [ ] **Step 3: Commit**

```bash
git add lp-crm.html
git commit -m "feat(lp-crm): logo bar (wordmarks compartilhados)"
```

---

## Task 4: Before / After (⭐ coração da página)

**Files:**
- Modify: `lp-crm.html` (após logobar)
- Modify: `assets/crm.css` (append)

- [ ] **Step 1: Inserir markup AFTER logobar `</section>`, ainda dentro de `<main>`**

```html
<!-- 3. Before / After ⭐ -->
<section class="before-after">
  <div class="wrap">
    <span class="eyebrow reveal">ANTES E DEPOIS</span>
    <h2 class="reveal">Como é hoje. <span class="display-accent">Como fica com a Balu.</span></h2>
    <div class="ba-grid">
      <div class="ba-col ba-antes">
        <div class="ba-col-head" aria-label="Antes">Antes</div>
        <ul>
          <li class="ba-item reveal"><span class="ba-mark cross" aria-hidden="true">×</span><span class="ba-text">WhatsApp com 800 não-lidos. Ninguém sabe quem respondeu o quê.</span></li>
          <li class="ba-item reveal"><span class="ba-mark cross" aria-hidden="true">×</span><span class="ba-text">Lead esfria porque a resposta veio 6 horas depois.</span></li>
          <li class="ba-item reveal"><span class="ba-mark cross" aria-hidden="true">×</span><span class="ba-text">Pipeline numa planilha que ninguém atualiza.</span></li>
          <li class="ba-item reveal"><span class="ba-mark cross" aria-hidden="true">×</span><span class="ba-text">Fora do horário, o lead fala sozinho.</span></li>
          <li class="ba-item reveal"><span class="ba-mark cross" aria-hidden="true">×</span><span class="ba-text">Proposta feita na mão, no Word, sem assinatura.</span></li>
          <li class="ba-item reveal"><span class="ba-mark cross" aria-hidden="true">×</span><span class="ba-text">"Em que pé está o cliente X?" — ninguém sabe.</span></li>
        </ul>
      </div>
      <div class="ba-col ba-depois">
        <div class="ba-col-head" aria-label="Depois">Depois</div>
        <ul>
          <li class="ba-item reveal"><span class="ba-mark check-pop" aria-hidden="true">✓</span><span class="ba-text">Inbox unificado: WhatsApp + Instagram + Messenger + e-mail numa tela.</span></li>
          <li class="ba-item reveal"><span class="ba-mark check-pop" aria-hidden="true">✓</span><span class="ba-text">IA responde na hora, qualifica e marca reunião.</span></li>
          <li class="ba-item reveal"><span class="ba-mark check-pop" aria-hidden="true">✓</span><span class="ba-text">Pipeline Kanban que se move sozinho com <strong>Sales Assist</strong>.</span></li>
          <li class="ba-item reveal"><span class="ba-mark check-pop" aria-hidden="true">✓</span><span class="ba-text">Agente de IA atende 24/7 com a base de conhecimento da sua empresa (RAG).</span></li>
          <li class="ba-item reveal"><span class="ba-mark check-pop" aria-hidden="true">✓</span><span class="ba-text">Proposta gerada por IA, com assinatura, em minutos.</span></li>
          <li class="ba-item reveal"><span class="ba-mark check-pop" aria-hidden="true">✓</span><span class="ba-text">Lead scoring Hot/Warm/Cold automático — você sabe onde focar.</span></li>
        </ul>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: APPEND CSS em `assets/crm.css`**

```css
/* ===== Before / After ===== */
.before-after h2{margin:10px 0 28px}
.ba-grid{display:grid;grid-template-columns:1fr;gap:20px}
.ba-col{background:var(--bg-base);border:1px solid var(--border);border-radius:var(--radius-lg);padding:20px 18px}
.ba-col-head{font-family:var(--font-display);font-weight:600;font-size:18px;margin-bottom:14px;letter-spacing:-.01em}
.ba-antes{border-left:3px solid var(--danger)}
.ba-depois{border-left:3px solid var(--success)}
.ba-antes .ba-col-head{color:var(--danger)}
.ba-depois .ba-col-head{color:var(--success)}
.ba-col ul{list-style:none;margin:0;padding:0}
.ba-item{display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-top:1px solid var(--border)}
.ba-item:first-child{border-top:0}
.ba-mark{flex:none;width:24px;height:24px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;line-height:1;margin-top:2px}
.ba-mark.cross{background:rgba(224,82,82,.12);color:var(--danger)}
.ba-mark.check-pop{background:rgba(34,200,122,.14);color:var(--success);transform:scale(0);transition:transform .35s cubic-bezier(.34,1.56,.64,1) .15s}
.ba-item.visible .ba-mark.check-pop{transform:scale(1)}
.ba-text{font-size:15px;color:var(--text-secondary);line-height:1.55}
.ba-text strong{color:var(--primary)}
@media (min-width:768px){.ba-grid{grid-template-columns:1fr 1fr;gap:24px}}
@media (prefers-reduced-motion:reduce){
  .ba-mark.check-pop{transform:scale(1);transition:none}
}
```

- [ ] **Step 3: Verificar** — reload. Confirmar: 1 `<h1>` ainda; itens ANTES com borda vermelha + `×`, DEPOIS com borda verde + `✓`. Os ✓ devem fazer scale-in suave ao revelar. Console zero erros. Screenshot mobile (stack) + desktop (2 cols).

- [ ] **Step 4: Commit**

```bash
git add lp-crm.html assets/crm.css
git commit -m "feat(lp-crm): seção Before/After com pop-in animado nos ✓ (DEPOIS)"
```

---

## Task 5: A Ponte (3 passos)

**Files:**
- Modify: `lp-crm.html` (após before-after)
- Modify: `assets/crm.css` (append)

- [ ] **Step 1: Inserir markup AFTER before-after `</section>`, ainda dentro de `<main>`**

```html
<!-- 4. A Ponte -->
<section id="ponte" class="ponte">
  <div class="wrap">
    <span class="eyebrow reveal">COMO FUNCIONA</span>
    <h2 class="reveal">Da bagunça ao Loop Fechado <span class="display-accent">em 3 passos.</span></h2>
    <div class="ponte-grid">
      <div class="ponte-card reveal"><span class="ponte-step">1</span><h3>Conecta os canais</h3><p>WhatsApp Cloud, UazAPI, Instagram, Messenger, e-mail e marketplaces num login só.</p></div>
      <div class="ponte-card reveal"><span class="ponte-step">2</span><h3>A IA atende e qualifica</h3><p>Agentes configuráveis (Claude/GPT/Gemini) com <strong>RAG</strong> da sua empresa. Respondem, qualificam e fazem handoff pro humano quando precisa.</p></div>
      <div class="ponte-card reveal"><span class="ponte-step">3</span><h3>O pipeline fecha</h3><p><strong>Sales Assist</strong> pontua o lead, sugere a próxima ação e gera a proposta. Você só conduz o fechamento.</p></div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: APPEND CSS em `assets/crm.css`**

```css
/* ===== A Ponte (3 passos) ===== */
.ponte h2{margin:10px 0 28px}
.ponte-grid{display:grid;grid-template-columns:1fr;gap:16px}
.ponte-card{background:var(--bg-base);border:1px solid var(--border);border-radius:var(--radius-md);padding:24px;box-shadow:var(--shadow-sm);position:relative}
.ponte-step{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;background:var(--primary-bg);color:var(--primary);font-weight:800;font-family:var(--font-mono);margin-bottom:12px}
.ponte-card h3{margin-bottom:8px}
.ponte-card p{font-size:15px;color:var(--text-secondary)}
.ponte-card strong{color:var(--primary)}
@media (min-width:768px){.ponte-grid{grid-template-columns:repeat(3,1fr)}}
```

- [ ] **Step 3: Verificar** — reload, screenshot mobile+desktop, console zero erros. Confirmar âncora `#ponte` funciona (clicar no "Ver como funciona ↓" do hero deve rolar até aqui).

- [ ] **Step 4: Commit**

```bash
git add lp-crm.html assets/crm.css
git commit -m "feat(lp-crm): seção A Ponte (3 passos)"
```

---

## Task 6: Demonstração (3 screenshots)

**Files:**
- Modify: `lp-crm.html` (após ponte)

- [ ] **Step 1: Inserir markup AFTER ponte `</section>`, ainda dentro de `<main>`**

```html
<!-- 5. Demonstração -->
<section class="demo">
  <div class="wrap">
    <span class="eyebrow reveal">VEJA FUNCIONANDO</span>
    <h2 class="reveal">O CRM <span class="display-accent">rodando de verdade.</span></h2>
    <div class="demo-shots">
      <figure class="reveal"><img src="assets/screenshots/crm-agents.png" alt="Agente de IA respondendo um lead" loading="lazy" width="1280" height="720"><figcaption>Squad de IA respondendo + handoff pro humano.</figcaption></figure>
      <figure class="reveal"><img src="assets/screenshots/crm-pipeline.png" alt="Pipeline Kanban com lead scoring" loading="lazy" width="1280" height="720"><figcaption>Kanban com forecast e scoring Hot/Warm/Cold.</figcaption></figure>
      <figure class="reveal"><img src="assets/screenshots/crm-proposals.png" alt="Proposta gerada por IA com assinatura" loading="lazy" width="1280" height="720"><figcaption>Proposta com IA + assinatura, em minutos.</figcaption></figure>
    </div>
  </div>
</section>
```

> Sem `.demo-video` — não temos vídeo do CRM ainda. CSS `.demo` + `.demo-shots` vem do `agencia.css`.

- [ ] **Step 2: Verificar** — reload. Confirmar 3 screenshots carregam (200), zero console errors. Screenshot mobile (1 col) + desktop (3 cols).

- [ ] **Step 3: Commit**

```bash
git add lp-crm.html
git commit -m "feat(lp-crm): seção Demonstração (3 screenshots do CRM)"
```

---

## Task 7: Funcionalidades (reuso de .beneficios + .benef-grid)

**Files:**
- Modify: `lp-crm.html` (após demo)

- [ ] **Step 1: Inserir markup AFTER demo `</section>`, ainda dentro de `<main>`**

```html
<!-- 6. Funcionalidades -->
<section class="beneficios">
  <div class="wrap">
    <span class="eyebrow reveal">TUDO QUE VOCÊ PRECISA</span>
    <h2 class="reveal">Atendimento, vendas e IA <span class="display-accent">no mesmo lugar.</span></h2>
    <div class="benef-grid">
      <div class="benef-card reveal"><h3>Inbox unificado</h3><p>Todos os canais numa tela. Nunca mais um lead perdido entre apps.</p><span class="benef-sub">substitui: 6 apps abertos</span></div>
      <div class="benef-card reveal"><h3>Agentes de IA com RAG</h3><p>Atendem com o conhecimento da sua empresa, no seu tom.</p><span class="benef-sub">substitui: chatbot burro</span></div>
      <div class="benef-card reveal"><h3>Sales Assist</h3><p>Lead scoring Hot/Warm/Cold + sugestão da próxima ação.</p><span class="benef-sub">substitui: feeling</span></div>
      <div class="benef-card reveal"><h3>Pipeline visual</h3><p>Kanban com forecast de receita e automações por etapa.</p><span class="benef-sub">substitui: planilha</span></div>
      <div class="benef-card reveal"><h3>Propostas com IA + assinatura</h3><p>Gera, envia e fecha — sem PandaDoc nem DocuSign.</p><span class="benef-sub">substitui: 2 ferramentas</span></div>
      <div class="benef-card reveal"><h3>Campanhas WhatsApp</h3><p>Broadcast segmentado com template aprovado pela Meta.</p><span class="benef-sub">substitui: disparador isolado</span></div>
      <div class="benef-card reveal"><h3>Automações</h3><p>Construtor visual: gatilho → ação, sem precisar de código.</p><span class="benef-sub">substitui: Zapier</span></div>
      <div class="benef-card reveal"><h3>Marketplaces</h3><p>IA respondendo no Mercado Livre, Shopee e TikTok Shop.</p><span class="benef-sub">substitui: atendimento avulso</span></div>
    </div>
  </div>
</section>
```

> CSS `.beneficios` + `.benef-grid` + `.benef-card` + bg surface já em `agencia.css`.

- [ ] **Step 2: Verificar** — reload, confirmar 8 cards, mobile 1 col / 640 px 2 cols / 960 px 4 cols. Console zero erros.

- [ ] **Step 3: Commit**

```bash
git add lp-crm.html
git commit -m "feat(lp-crm): grid de funcionalidades (8 outcomes)"
```

---

## Task 8: Casos de uso por persona

**Files:**
- Modify: `lp-crm.html` (após funcionalidades)
- Modify: `assets/crm.css` (append)

- [ ] **Step 1: Inserir markup AFTER funcionalidades `</section>`, ainda dentro de `<main>`**

```html
<!-- 7. Casos de uso -->
<section class="casos-uso">
  <div class="wrap">
    <span class="eyebrow reveal">FEITO PRA VOCÊ</span>
    <h2 class="reveal">Funciona pro seu <span class="display-accent">tipo de operação.</span></h2>
    <div class="casos-grid">
      <div class="caso-card reveal">
        <div class="caso-tag">Agência</div>
        <h3>Atende clientes e leads num lugar</h3>
        <p>Revende como white-label (multi-tenant). Cada cliente, sua própria conta — operada por você.</p>
      </div>
      <div class="caso-card reveal">
        <div class="caso-tag">E-commerce</div>
        <h3>Marketplace + WhatsApp + Instagram com IA</h3>
        <p>Responde no Mercado Livre, Shopee, TikTok Shop e DM com a mesma IA. Recupera carrinho automaticamente.</p>
      </div>
      <div class="caso-card reveal">
        <div class="caso-tag">Serviços / Vendas consultivas</div>
        <h3>Pipeline + proposta + follow-up automático</h3>
        <p>Lead entra, IA qualifica, Sales Assist pontua, proposta vai com assinatura. Você só conduz o fechamento.</p>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: APPEND CSS em `assets/crm.css`**

```css
/* ===== Casos de uso por persona ===== */
.casos-uso h2{margin:10px 0 28px}
.casos-grid{display:grid;grid-template-columns:1fr;gap:16px}
.caso-card{background:var(--bg-base);border:1px solid var(--border);border-radius:var(--radius-md);padding:24px;box-shadow:var(--shadow-sm)}
.caso-tag{display:inline-block;font-family:var(--font-mono);font-size:11px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:var(--primary);background:var(--primary-bg);padding:5px 10px;border-radius:6px;margin-bottom:14px}
.caso-card h3{margin-bottom:8px;font-size:18px}
.caso-card p{font-size:15px;color:var(--text-secondary);line-height:1.55}
@media (min-width:768px){.casos-grid{grid-template-columns:repeat(3,1fr)}}
```

- [ ] **Step 3: Verificar** — reload, screenshot mobile+desktop, console zero erros.

- [ ] **Step 4: Commit**

```bash
git add lp-crm.html assets/crm.css
git commit -m "feat(lp-crm): casos de uso por persona (3 cards)"
```

---

## Task 9: Depoimentos + KPIs (reuso .depoimentos)

**Files:**
- Modify: `lp-crm.html` (após casos-uso)

- [ ] **Step 1: Inserir markup AFTER casos-uso `</section>`, ainda dentro de `<main>`**

```html
<!-- 8. Depoimentos -->
<section class="depoimentos">
  <div class="wrap">
    <span class="eyebrow reveal">QUEM JÁ USA</span>
    <h2 class="reveal">Lead que entra, <span class="display-accent">lead que não escapa.</span></h2>
    <div class="depo-highlight reveal">
      <div class="depo-bignum"><span data-count="11">11</span> clientes</div>
      <blockquote>Migrei 11 clientes do meu CRM antigo num final de semana. Na segunda, o pipeline já estava se atualizando sozinho.</blockquote>
      <div class="depo-meta"><span class="avatar" aria-hidden="true">RC</span><div><strong>Rafael C.</strong><span>Diretor comercial · Performance B2B</span></div></div>
    </div>
    <div class="depo-grid">
      <div class="depo-card reveal"><blockquote>A Balu fez o que três SaaS combinados nunca conseguiram: me devolveu tempo. Saí do operacional em 60 dias.</blockquote><div class="depo-meta"><span class="avatar" aria-hidden="true">MB</span><div><strong>Marina B.</strong><span>Sócia · agência com 18 contas</span></div></div></div>
      <div class="depo-card reveal"><blockquote>O optimizer de mídia salvou um lançamento meu. Pausou 4 criativos no domingo e me explicou por quê na segunda.</blockquote><div class="depo-meta"><span class="avatar" aria-hidden="true">JT</span><div><strong>Júlia T.</strong><span>Head de Mídia · agência paulistana</span></div></div></div>
    </div>
    <div class="kpi-grid reveal">
      <div class="kpi"><span class="kpi-val"><span data-count="11">11</span> clientes</span><span class="kpi-lbl">migrados num fim de semana</span></div>
      <div class="kpi"><span class="kpi-val"><span data-count="70">70</span>%</span><span class="kpi-lbl">leads qualificados pela IA</span></div>
      <div class="kpi"><span class="kpi-val">24/7</span><span class="kpi-lbl">atendimento sem humano</span></div>
      <div class="kpi"><span class="kpi-val">1 inbox</span><span class="kpi-lbl">pra todos os canais</span></div>
    </div>
  </div>
</section>
```

> CSS `.depoimentos`, `.depo-highlight`, `.depo-card`, `.kpi-grid`, `.kpi` já em `agencia.css`. Bg override (white→surface) virá no Task 13.

- [ ] **Step 2: Verificar** — reload. Confirmar count-up funcional no destaque "11 clientes" e nos KPIs. Console zero erros.

- [ ] **Step 3: Commit**

```bash
git add lp-crm.html
git commit -m "feat(lp-crm): depoimentos (Rafael C. destaque) + KPIs"
```

---

## Task 10: Comparativo (reuso .comparativo)

**Files:**
- Modify: `lp-crm.html` (após depoimentos)

- [ ] **Step 1: Inserir markup AFTER depoimentos `</section>`, ainda dentro de `<main>`**

```html
<!-- 9. Comparativo -->
<section class="comparativo">
  <div class="wrap">
    <span class="eyebrow reveal">A DIFERENÇA</span>
    <h2 class="reveal">Por que não <span class="display-accent">um CRM qualquer?</span></h2>
    <div class="compare-table reveal">
      <div class="compare-col compare-bad">
        <div class="compare-head">❌ CRM genérico</div>
        <ul>
          <li>WhatsApp via integração paga ou nenhuma</li>
          <li>Só pipeline, sem atendimento</li>
          <li>IA fraca ou inexistente</li>
          <li>Proposta em ferramenta separada</li>
          <li>Sem marketplace</li>
        </ul>
      </div>
      <div class="compare-col compare-good">
        <div class="compare-head">✅ Balu CRM</div>
        <ul>
          <li>WhatsApp Cloud + UazAPI nativos</li>
          <li>Inbox + pipeline + IA num lugar</li>
          <li>Agentes com RAG (Claude/GPT/Gemini)</li>
          <li>Proposta com IA + assinatura nativa</li>
          <li>Mercado Livre, Shopee, TikTok Shop com IA</li>
        </ul>
      </div>
    </div>
  </div>
</section>
```

> CSS `.comparativo`, `.compare-*` já em `agencia.css`. Bg override (surface→white) virá no Task 13.

- [ ] **Step 2: Verificar** — reload, console zero erros, screenshot mobile (1 col) + desktop (2 cols).

- [ ] **Step 3: Commit**

```bash
git add lp-crm.html
git commit -m "feat(lp-crm): comparativo CRM genérico vs Balu CRM"
```

---

## Task 11: Oferta dupla (reuso .oferta)

**Files:**
- Modify: `lp-crm.html` (após comparativo)

- [ ] **Step 1: Inserir markup AFTER comparativo `</section>`, ainda dentro de `<main>`**

```html
<!-- 10. Oferta dupla -->
<section id="oferta" class="oferta">
  <div class="wrap">
    <span class="eyebrow reveal">COMECE AGORA</span>
    <h2 class="reveal">Dois jeitos <span class="display-accent">de começar.</span></h2>
    <div class="oferta-grid">
      <div class="oferta-main reveal">
        <h3>Converse com o Michel</h3>
        <p>15 minutos. Ele conecta seu WhatsApp, mostra a IA atendendo e monta o plano pra você parar de perder lead.</p>
        <a class="btn btn-cta" data-wa href="#">Quero conversar com o Michel</a>
        <p class="oferta-microcopy">Sem compromisso · Configuração assistida inclusa</p>
      </div>
      <div class="oferta-side reveal">
        <h3>Ainda não está pronto?</h3>
        <p>Comece pela <strong>Eugência em 7 Dias</strong> — monte seu atendimento com IA passo a passo, dentro da plataforma. Por R$47.</p>
        <!-- TODO: trocar href="#" pela URL real do checkout (Kiwify/Cartpanda) -->
        <a class="btn btn-secondary" data-tripwire href="#">Quero a Eugência em 7 Dias (R$47)</a>
        <p class="oferta-bumps">+ Pack de 17 templates de proposta IA · + Comunidade VIP</p>
        <p class="oferta-bumps">Quem entra ganha acesso ao challenge ao vivo de 5 dias (R$197).</p>
      </div>
    </div>
  </div>
</section>
```

> CSS `.oferta`, `.oferta-main`, `.oferta-side` já em `agencia.css`. Bg `oferta` (white+glow) será overrided pra surface+glow no Task 13.

- [ ] **Step 2: Verificar** — reload. Confirmar `[data-tripwire]` href fica `#` (placeholder). `[data-wa]` no oferta-main resolve pra wa.me/5543991086610. Console zero erros.

- [ ] **Step 3: Commit**

```bash
git add lp-crm.html
git commit -m "feat(lp-crm): oferta dupla (WhatsApp + tripwire R\$47 placeholder)"
```

---

## Task 12: FAQ + FAQPage schema

**Files:**
- Modify: `lp-crm.html` (após oferta + atualizar FAQPage no JSON-LD do head)

- [ ] **Step 1: Inserir markup do FAQ AFTER oferta `</section>`, ainda dentro de `<main>`**

```html
<!-- 11. FAQ -->
<section class="faq">
  <div class="wrap">
    <span class="eyebrow reveal">DÚVIDAS</span>
    <h2 class="reveal">Perguntas que <span class="display-accent">todo mundo faz.</span></h2>
    <div class="faq-list">
      <details class="reveal"><summary>Funciona com meu número de WhatsApp atual?<span class="faq-chevron" aria-hidden="true">⌄</span></summary><p>Sim. Conecta via WhatsApp Cloud (oficial da Meta) ou UazAPI. A gente configura junto na conversa.</p></details>
      <details class="reveal"><summary>A IA responde sozinha mesmo?<span class="faq-chevron" aria-hidden="true">⌄</span></summary><p>Sim, com a base de conhecimento da sua empresa (RAG). E faz handoff pro humano quando precisa — você define as regras.</p></details>
      <details class="reveal"><summary>Posso usar mais de um canal?<span class="faq-chevron" aria-hidden="true">⌄</span></summary><p>Sim: WhatsApp, Instagram, Messenger, e-mail, web chat e marketplaces (Mercado Livre, Shopee, TikTok Shop), tudo num inbox.</p></details>
      <details class="reveal"><summary>Migra os meus contatos e histórico?<span class="faq-chevron" aria-hidden="true">⌄</span></summary><p>Migra. Import por CSV ou direto do WhatsApp. A gente acompanha a migração.</p></details>
      <details class="reveal"><summary>Qual modelo de IA usa?<span class="faq-chevron" aria-hidden="true">⌄</span></summary><p>Claude, GPT ou Gemini, configurável por agente. Você escolhe o que faz mais sentido por caso de uso.</p></details>
      <details class="reveal"><summary>Quanto custa?<span class="faq-chevron" aria-hidden="true">⌄</span></summary><p>Depende do tamanho da operação. Por isso a conversa de 15 min — pra montar o plano certo, sem você pagar pelo que não usa.</p></details>
      <details class="reveal"><summary>Serve pra agência revender?<span class="faq-chevron" aria-hidden="true">⌄</span></summary><p>Sim, é multi-tenant. Dá pra operar várias contas de clientes como white-label.</p></details>
      <details class="reveal"><summary>Tem fidelidade?<span class="faq-chevron" aria-hidden="true">⌄</span></summary><p>A gente fala disso de forma transparente na conversa.</p></details>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Atualizar o `FAQPage` no JSON-LD do `<head>`** — substituir `"mainEntity":[]` por:

```json
"mainEntity":[
  {"@type":"Question","name":"Funciona com meu número de WhatsApp atual?","acceptedAnswer":{"@type":"Answer","text":"Sim. Conecta via WhatsApp Cloud (oficial da Meta) ou UazAPI. A gente configura junto na conversa."}},
  {"@type":"Question","name":"A IA responde sozinha mesmo?","acceptedAnswer":{"@type":"Answer","text":"Sim, com a base de conhecimento da sua empresa (RAG). E faz handoff pro humano quando precisa — você define as regras."}},
  {"@type":"Question","name":"Posso usar mais de um canal?","acceptedAnswer":{"@type":"Answer","text":"Sim: WhatsApp, Instagram, Messenger, e-mail, web chat e marketplaces (Mercado Livre, Shopee, TikTok Shop), tudo num inbox."}},
  {"@type":"Question","name":"Migra os meus contatos e histórico?","acceptedAnswer":{"@type":"Answer","text":"Migra. Import por CSV ou direto do WhatsApp. A gente acompanha a migração."}},
  {"@type":"Question","name":"Qual modelo de IA usa?","acceptedAnswer":{"@type":"Answer","text":"Claude, GPT ou Gemini, configurável por agente. Você escolhe o que faz mais sentido por caso de uso."}},
  {"@type":"Question","name":"Quanto custa?","acceptedAnswer":{"@type":"Answer","text":"Depende do tamanho da operação. Por isso a conversa de 15 min — pra montar o plano certo."}},
  {"@type":"Question","name":"Serve pra agência revender?","acceptedAnswer":{"@type":"Answer","text":"Sim, é multi-tenant. Dá pra operar várias contas de clientes como white-label."}},
  {"@type":"Question","name":"Tem fidelidade?","acceptedAnswer":{"@type":"Answer","text":"A gente fala disso de forma transparente na conversa."}}
]
```

> CSS `.faq summary`, `.faq-chevron`, `.faq details[open] p` (animação suave) já em `agencia.css`. Bg override (surface→white) virá no Task 13.

- [ ] **Step 3: Verificar** — reload. Validar JSON-LD: `browser_evaluate` rodando `[...document.querySelectorAll('script[type="application/ld+json"]')].map(s=>{try{JSON.parse(s.textContent);return 'ok'}catch(e){return 'ERR:'+e.message}})` → todos 'ok'. Clicar num `<details>` deve abrir/fechar (animação suave herdada).

- [ ] **Step 4: Commit**

```bash
git add lp-crm.html
git commit -m "feat(lp-crm): FAQ accordion (8 perguntas) + FAQPage schema"
```

---

## Task 13: CTA final + rodapé + sticky CTA + overrides de ritmo

**Files:**
- Modify: `lp-crm.html` (CTA final dentro de `<main>`; footer e sticky FORA)
- Modify: `assets/crm.css` (append — 4 overrides de bg)

- [ ] **Step 1: Inserir markup** — CTA final como ÚLTIMO filho de `<main>`, depois fechar `</main>`, depois footer + sticky:

```html
<!-- 12. CTA final -->
<section class="cta-final">
  <div class="wrap">
    <h2 class="reveal">Seu próximo lead <span class="display-accent">não vai escapar.</span></h2>
    <p class="reveal muted cta-final-sub">15 minutos com o Michel pra conectar seu WhatsApp e ver a IA atendendo.</p>
    <a class="btn btn-cta reveal" data-wa href="#">Quero conversar com o Michel</a>
    <p class="reveal"><a class="cta-final-tripwire" data-tripwire href="#">Ou começar pela Eugência em 7 Dias (R$47)</a></p>
  </div>
</section>
</main>

<footer class="site-footer">
  <div class="wrap footer-inner">
    <img src="assets/logo-gradient.svg" alt="Balu" height="28" width="90">
    <nav class="footer-links">
      <a href="/politica-de-privacidade">Privacidade</a>
      <a href="/termos-de-uso">Termos</a>
      <a href="https://baluhub.com.br">baluhub.com.br</a>
    </nav>
    <p class="footer-copy">© 2026 Balu · Florianópolis, SC</p>
  </div>
</footer>

<!-- Sticky CTA mobile -->
<div class="sticky-cta">
  <a class="btn btn-cta" data-wa href="#">Falar com o Michel no WhatsApp</a>
</div>
```

> CSS `.cta-final`, `.site-footer`, `.sticky-cta` já em `agencia.css`.

- [ ] **Step 2: APPEND overrides de background em `assets/crm.css`** — pra alinhar o ritmo com a ordem do CRM:

```css
/* ===== Overrides de fundo (ritmo alternado pra ordem do CRM) ===== */
.depoimentos{background:var(--bg-surface)}
.comparativo{background:var(--bg-base)}
.oferta{background:radial-gradient(70% 60% at 0% 100%,rgba(31,136,194,.05),transparent 55%),var(--bg-surface)}
.faq{background:var(--bg-base)}
.ponte{background:radial-gradient(90% 70% at 100% 0%,rgba(31,136,194,.07),transparent 55%),var(--bg-surface)}
```

- [ ] **Step 3: Verificar** — reload. Confirmar: exatamente 1 `<h1>`, exatamente 1 `</main>`, `<footer>` e `.sticky-cta` FORA de `<main>`. Sticky no mobile (resize 390 + scroll 1500 px) deve aparecer; em desktop deve ficar escondido. Console zero erros.

- [ ] **Step 4: Commit**

```bash
git add lp-crm.html assets/crm.css
git commit -m "feat(lp-crm): CTA final, rodapé, sticky CTA + overrides de ritmo"
```

---

## Task 14: Tracking scaffold (Meta Pixel + GA4 placeholder)

**Files:**
- Modify: `lp-crm.html` (`<head>`, substituir os dois comentários TODO)

- [ ] **Step 1: Substituir os comentários `<!-- TODO_PIXEL_ID -->` e `<!-- TODO_GA4_ID -->` no `<head>` por:**

```html
<!-- Meta Pixel — TODO: trocar TODO_PIXEL_ID pelo ID real -->
<script>
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','TODO_PIXEL_ID');fbq('track','PageView');
</script>
<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=TODO_PIXEL_ID&ev=PageView&noscript=1" alt=""/></noscript>

<!-- GA4 — TODO: trocar TODO_GA4_ID pelo ID real (G-XXXX) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=TODO_GA4_ID"></script>
<script>
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
gtag('js',new Date());gtag('config','TODO_GA4_ID');
</script>
```

- [ ] **Step 2: Verificar** — reload. `browser_console_messages` → zero erros JS (warnings de rede com IDs inválidos são aceitáveis). `browser_evaluate`: `typeof window.fbq` → `"function"`; `typeof window.gtag` → `"function"`. Clicar num `[data-wa]` não deve lançar exceção.

- [ ] **Step 3: Commit**

```bash
git add lp-crm.html
git commit -m "feat(lp-crm): scaffold de tracking (Meta Pixel + GA4 placeholder)"
```

---

## Task 15: Sitemap + QA final

**Files:**
- Modify: `sitemap.xml`

- [ ] **Step 1: Adicionar entrada `lp.baluhub.com.br/crm` no `sitemap.xml`** — copiar o formato existente e adicionar após `https://baluhub.com.br/crm`:

```xml
  <url>
    <loc>https://lp.baluhub.com.br/crm</loc>
    <lastmod>2026-05-28</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
```

- [ ] **Step 2: QA final completo via Playwright**

- Mobile 390 px e desktop 1280 px: screenshot fullPage (`browser_take_screenshot fullPage`).
- `browser_console_messages`: zero erros JS.
- `browser_network_requests`: nenhum 404 em asset first-party (CSS, JS, screenshots, logos, fontes, og-image-crm.png).
- `browser_evaluate`: `document.querySelectorAll('h1').length === 1`.
- Conferir href dos `[data-wa]` = `https://wa.me/5543991086610?text=...` (4 botões: hero, oferta, cta-final, sticky).
- Conferir href dos `[data-tripwire]` = `#` (2 botões: oferta-side e cta-final tripwire).
- Testar UTM: `browser_navigate` para `http://localhost:8080/lp-crm.html?utm_source=meta&utm_campaign=crm-teste` e confirmar que `[data-wa].href` contém `[utm_source=meta&utm_campaign=crm-teste]`.
- Validar os 3 blocos JSON-LD: `[...document.querySelectorAll('script[type="application/ld+json"]')].map(s=>{try{JSON.parse(s.textContent);return 'ok'}catch(e){return 'ERR:'+e.message}})` → todos 'ok'. FAQPage com 8 entries.
- Mobile (390 px): conferir `document.documentElement.scrollWidth - document.documentElement.clientWidth === 0` (zero overflow horizontal).
- Reduced-motion: `await page.emulateMedia({ reducedMotion: 'reduce' })` + reload + confirmar marquee animação `none`, `.check-pop` com `transform:scale(1)` e `transition:none`, e count-up mantém valor final no HTML.

- [ ] **Step 3: Commit**

```bash
git add sitemap.xml
git commit -m "feat(lp-crm): adicionar /crm ao sitemap + QA final"
```

---

## Pós-implementação (manual, fora do código — para o Eduardo)

1. **Tracking:** trocar `TODO_PIXEL_ID` e `TODO_GA4_ID` em `lp-crm.html` (mesmos do Agência — quando trocar lá, trocar aqui também).
2. **Checkout tripwire:** trocar os `href="#"` dos `[data-tripwire]` pela URL do Kiwify/Cartpanda.
3. **Depoimentos CRM-específicos:** trocar Marina B. e Júlia T. por 1–2 testimonials reais de quem usa o CRM (manter Rafael C. como destaque).
4. **KPIs reais:** ajustar os 4 KPIs ilustrativos (11 clientes / 70% / 24/7 / 1 inbox) com métricas reais dos pilotos.
5. **Subdomínio `lp.baluhub.com.br`:** Vercel → Settings → Domains → adicionar `lp.baluhub.com.br`; criar registro CNAME no DNS apontando pra Vercel. Após isso, o rewrite no `vercel.json` passa a servir `lp.baluhub.com.br/crm` → `/lp-crm.html`.
6. **Opcional:** gravar vídeo de demonstração do CRM (30–60s), colocar na raiz como `balu-promo-crm.mp4` e adicionar `<video>` na seção Demonstração (atualmente só screenshots).

---

## Self-Review (preenchido)

**Cobertura do spec:** todas as 12 seções (0–12 + rodapé + sticky) mapeadas (Tasks 2–13). Arquitetura (Task 1) com Vercel rewrite. Before/After com pop-in ✓ (Task 4). Ponte (Task 5). Casos de uso (Task 8). Reutilização correta de `.beneficios`, `.depoimentos`, `.comparativo`, `.oferta`, `.faq`, `.cta-final` (Tasks 7, 9–13). Overrides de bg pro ritmo (Task 13). Tracking (Task 14). Sitemap (Task 15). ✔ sem lacunas.

**Placeholders proibidos:** os únicos "TODO" são os 4 placeholders **intencionais e documentados** do spec (checkout, IDs de tracking, depoimentos CRM, KPIs reais, subdomínio). Cada step tem código concreto. ✔

**Consistência de tipos/nomes:** `data-wa`, `data-tripwire`, classes `reveal`/`visible`, `.sticky-cta`/`.show`, `.hero`, `.ba-item.visible .ba-mark.check-pop` consistentes entre HTML (tasks de seção) e CSS/JS. WhatsApp `5543991086610` consistente. Eventos `whatsapp_click_crm` / `tripwire_click_crm` consistentes. Caminhos de screenshots (`assets/screenshots/crm-*.png`) confirmados como existentes. ✔
