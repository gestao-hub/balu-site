# LP Balu Agência — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir uma landing page de conversão mobile-first (`/agencia`) para o Balu Agência, WhatsApp-first pro Michel, com tripwire R$47 (placeholder), reaproveitando assets/depoimentos reais do site.

**Architecture:** Página standalone (Abordagem A) — `agencia.html` + `assets/agencia.css` (tema claro próprio) + `assets/agencia.js` (WhatsApp+UTM, sticky CTA, reveal, tracking). Não altera nenhuma página existente. Tema Híbrido: base clara + azul Balu como marca + laranja só no CTA. Tipografia do site (Instrument Serif + DM Sans + JetBrains Mono).

**Tech Stack:** HTML5 semântico, CSS puro (custom properties, Flexbox/Grid), JS vanilla (`defer`), deploy estático Vercel (`cleanUrls`). Sem build step.

**Spec:** [docs/superpowers/specs/2026-05-27-lp-balu-agencia-design.md](../specs/2026-05-27-lp-balu-agencia-design.md)

---

## Método de verificação (adaptação — projeto estático sem test runner)

Não há framework de testes neste repo. Cada task verifica visual + funcionalmente:

1. Servidor local rodando (subir uma vez, no Task 1): `python3 -m http.server 8080` em `/root/balu-site-1`.
2. Verificação via Playwright MCP: `browser_navigate` para `http://localhost:8080/agencia.html`, depois `browser_console_messages` (esperado: **zero erros**) e `browser_take_screenshot` (conferir render da seção, mobile 390px e desktop 1280px via `browser_resize`).
3. Commit ao final de cada task.

**Convenção de commit:** `feat(lp-agencia): <descrição>` + trailer `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`.

> Nota de URL: localmente a página é `/agencia.html`. Em produção (Vercel `cleanUrls`) vira `/agencia`. Links internos usam `/agencia`.

---

## File Structure

| Arquivo | Responsabilidade |
|---------|------------------|
| `agencia.html` (criar) | Markup semântico da LP: head/meta/SEO/schema + 12 seções + sticky CTA |
| `assets/agencia.css` (criar) | Tema claro próprio: tokens, reset, tipografia, componentes, responsivo |
| `assets/agencia.js` (criar) | WhatsApp+UTM, sticky CTA mobile, reveal on scroll, tracking events |
| `sitemap.xml` (modificar) | Adicionar entrada `/agencia` |

Constantes compartilhadas entre tasks (usar exatamente assim):
- WhatsApp: `https://wa.me/5543991086610`
- Texto base WhatsApp: `Olá Michel, vim da página do Balu Agência e quero entender como sair do Frankenstack.`
- Atributo de marcação dos CTAs WhatsApp: `data-wa` (a href é montada pelo JS)
- Atributo de marcação do CTA tripwire: `data-tripwire`
- Classe de reveal: `reveal` (ativa com `visible`)

---

## Task 1: Scaffold — HTML base, head/SEO/schema, tokens CSS, JS stub

**Files:**
- Create: `agencia.html`
- Create: `assets/agencia.css`
- Create: `assets/agencia.js`

- [ ] **Step 1: Criar `assets/agencia.css` com tokens, reset e tipografia**

```css
/* ===== Balu Agência LP — tema claro ===== */
:root{
  --bg-base:#FFFFFF; --bg-dark:#0A1628; --bg-surface:#F5F7FB; --border:#E2E8F0;
  --border-dark:rgba(255,255,255,.08);
  --primary:#1F88C2; --primary-deep:#14507E; --primary-light:#2FA3D9; --primary-bg:rgba(31,136,194,.10);
  --cta:#FF6B35; --cta-hover:#E85A28;
  --danger:#E05252; --success:#22C87A;
  --text-primary:#0A1628; --text-secondary:#5A6B82; --text-muted:#94A3B8;
  --text-on-dark:#F0F4FA; --text-secondary-on-dark:#94A3B8;
  --radius-sm:8px; --radius-md:12px; --radius-lg:16px; --radius-xl:24px;
  --font-display:'Instrument Serif',Georgia,serif;
  --font-ui:'DM Sans','Inter',system-ui,sans-serif;
  --font-mono:'JetBrains Mono',monospace;
  --shadow-sm:0 1px 3px rgba(10,22,40,.06),0 1px 2px rgba(10,22,40,.04);
  --shadow-md:0 8px 24px rgba(10,22,40,.08);
  --maxw:1120px;
}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:var(--font-ui);font-size:16px;line-height:1.6;color:var(--text-primary);background:var(--bg-base);-webkit-font-smoothing:antialiased}
img,video{max-width:100%;display:block}
a{color:inherit;text-decoration:none}
.wrap{max-width:var(--maxw);margin:0 auto;padding:0 20px}
section{padding:56px 0}
.eyebrow{font-family:var(--font-mono);font-size:12px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:var(--primary)}
h1,h2{font-family:var(--font-display);font-weight:400;line-height:1.12;letter-spacing:-.01em}
h1{font-size:clamp(30px,7vw,56px)}
h2{font-size:clamp(24px,5vw,40px)}
h3{font-family:var(--font-ui);font-weight:700;font-size:clamp(18px,2.4vw,20px)}
.display-accent{color:var(--primary);font-style:italic}
.muted{color:var(--text-secondary)}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
```

- [ ] **Step 2: Criar `assets/agencia.js` stub (módulo de inicialização)**

```js
/* Balu Agência LP — comportamentos */
(function () {
  'use strict';

  // 1. WhatsApp + UTM
  var WA_BASE = 'https://wa.me/5543991086610';
  var WA_TEXT = 'Olá Michel, vim da página do Balu Agência e quero entender como sair do Frankenstack.';
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
      a.addEventListener('click', function () { track('whatsapp_click_agencia'); });
    });
    document.querySelectorAll('[data-tripwire]').forEach(function (a) {
      a.addEventListener('click', function () { track('tripwire_click_agencia'); });
    });
  }

  // 2. Tracking (guarda contra ausência de fbq/gtag)
  function track(event) {
    try { if (typeof window.fbq === 'function') window.fbq('trackCustom', event); } catch (e) {}
    try { if (typeof window.gtag === 'function') window.gtag('event', event); } catch (e) {}
  }

  // 3. Reveal on scroll
  function wireReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
      els.forEach(function (el) { el.classList.add('visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
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

  document.addEventListener('DOMContentLoaded', function () {
    wireWhatsApp(); wireReveal(); wireStickyCta();
  });
})();
```

- [ ] **Step 3: Criar `agencia.html` com head completo (SEO + schema) e `<main>` vazio**

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Balu Agência — Saia do Frankenstack e opere sua agência em uma só plataforma</title>
  <meta name="description" content="Meta Ads, Google Ads, IA, cobrança e Loop Fechado numa só plataforma. A operação completa para agências de 4 a 25 pessoas. Fale com um especialista." />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://lp.baluhub.com.br/agencia" />
  <meta name="theme-color" content="#1F88C2" />
  <link rel="icon" type="image/svg+xml" href="favicon.svg" />
  <link rel="manifest" href="/manifest.json" />

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="preconnect" href="https://fonts.bunny.net">
  <link href="https://fonts.bunny.net/css?family=dm-sans:400,500,600,700,800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/agencia.css?v=1" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="pt_BR" />
  <meta property="og:site_name" content="Balu" />
  <meta property="og:title" content="Balu Agência — Saia do Frankenstack" />
  <meta property="og:description" content="Meta Ads, Google Ads, IA, cobrança e Loop Fechado numa só plataforma para agências de 4 a 25 pessoas." />
  <meta property="og:url" content="https://lp.baluhub.com.br/agencia" />
  <meta property="og:image" content="https://baluhub.com.br/og-image.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <!-- TODO: og-image exclusiva da LP -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Balu Agência — Saia do Frankenstack" />
  <meta name="twitter:image" content="https://baluhub.com.br/og-image.png" />

  <!-- TODO_PIXEL_ID: Meta Pixel -->
  <!-- TODO_GA4_ID: Google Analytics 4 -->

  <!-- JSON-LD -->
  <script type="application/ld+json">
  {
    "@context":"https://schema.org",
    "@graph":[
      {"@type":"Organization","@id":"https://baluhub.com.br/#organization","name":"Balu","url":"https://baluhub.com.br/","logo":"https://baluhub.com.br/assets/logo-white.svg"},
      {"@type":"Product","name":"Balu Agência","brand":{"@type":"Brand","name":"Balu"},"description":"Plataforma all-in-one de gestão e operação para agências de marketing: Meta Ads, Google Ads, IA, cobrança e Loop Fechado.","category":"SoftwareApplication"},
      {"@type":"FAQPage","mainEntity":[]}
    ]
  }
  </script>
</head>
<body>
  <main id="main">
    <!-- seções entram nas próximas tasks -->
  </main>
  <script src="assets/agencia.js?v=1" defer></script>
</body>
</html>
```

- [ ] **Step 4: Subir servidor local e verificar**

Run (background): `cd /root/balu-site-1 && python3 -m http.server 8080`
Playwright: `browser_navigate` → `http://localhost:8080/agencia.html`; `browser_console_messages` (esperado: **zero erros**); `browser_take_screenshot` (esperado: página em branco válida, fontes carregando).

- [ ] **Step 5: Commit**

```bash
git add agencia.html assets/agencia.css assets/agencia.js
git commit -m "feat(lp-agencia): scaffold (head/SEO/schema, tokens CSS, JS de comportamentos)"
```

---

## Task 2: Barra de urgência + Hero + strip de stats

**Files:**
- Modify: `agencia.html` (dentro de `<main>`, no topo)
- Modify: `assets/agencia.css` (append)

- [ ] **Step 1: Inserir markup da barra de urgência + hero no início do `<main>`**

```html
<!-- 0. Barra de urgência -->
<div class="urgency-bar">⚡ Onboarding guiado gratuito para as próximas agências · <a href="#oferta">Fale com o Michel →</a></div>

<!-- 1. Hero -->
<section class="hero">
  <div class="wrap hero-grid">
    <div class="hero-copy reveal">
      <span class="eyebrow">PARA DONOS DE AGÊNCIA DE 4 A 25 PESSOAS</span>
      <h1>Saia do Frankenstack. Opere sua agência inteira <span class="display-accent">numa só plataforma.</span></h1>
      <!-- Variação B p/ A/B test futuro: "Sua agência cresceu. Sua operação travou. A Balu resolve." -->
      <p class="hero-sub">Meta Ads, Google Ads, criativos com IA, cobrança automática e relatórios — tudo conectado em <strong>Loop Fechado</strong>. Pare de costurar 10 ferramentas que não conversam.</p>
      <a class="btn btn-cta" data-wa href="#">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.449L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.115z"/></svg>
        Quero conversar com o Michel
      </a>
      <p class="hero-microcopy">Conversa de 15 min · Sem compromisso · Resposta em até 1h no horário comercial</p>
      <a href="#metodo" class="hero-secondary-link">Ver planos e como funciona ↓</a>
    </div>
    <div class="hero-visual reveal">
      <img src="assets/screenshots/agencia-dashboard.png" alt="Dashboard do Balu Agência" width="1200" height="800" fetchpriority="high" />
    </div>
  </div>
  <div class="wrap stats-strip reveal">
    <div class="stat"><span class="stat-num">10+</span><span class="stat-lbl">ferramentas substituídas</span></div>
    <div class="stat"><span class="stat-num">8 regras</span><span class="stat-lbl">de otimização rodando 24/7</span></div>
    <div class="stat"><span class="stat-num">1 plataforma</span><span class="stat-lbl">toda a operação da agência</span></div>
  </div>
</section>
```

- [ ] **Step 2: Append CSS do hero/barra/stats + reveal + botões em `agencia.css`**

```css
/* reveal */
.reveal{opacity:0;transform:translateY(16px);transition:opacity .5s ease,transform .5s ease}
.reveal.visible{opacity:1;transform:none}
/* botões */
.btn{display:inline-flex;align-items:center;gap:10px;font-family:var(--font-ui);font-weight:700;border-radius:var(--radius-md);padding:16px 28px;font-size:16px;line-height:1;transition:background .2s,transform .1s;cursor:pointer;border:0}
.btn:active{transform:translateY(1px)}
.btn-cta{background:var(--cta);color:#fff;box-shadow:var(--shadow-md)}
.btn-cta:hover{background:var(--cta-hover)}
.btn-secondary{background:var(--primary-bg);color:var(--primary);border:1px solid var(--primary)}
/* barra urgência */
.urgency-bar{background:var(--primary-deep);color:var(--text-on-dark);font-size:13px;text-align:center;padding:10px 16px}
.urgency-bar a{color:#fff;font-weight:600;border-bottom:1px solid rgba(255,255,255,.5)}
/* hero */
.hero{padding-top:40px}
.hero-grid{display:grid;gap:32px;align-items:center}
.hero-copy>*+*{margin-top:18px}
.hero-sub{font-size:clamp(16px,2.2vw,18px);color:var(--text-secondary);max-width:46ch}
.hero-sub strong{color:var(--primary)}
.btn-cta{width:100%;justify-content:center}
.hero-microcopy{font-size:13px;color:var(--text-muted)}
.hero-secondary-link{display:inline-block;color:var(--primary);font-weight:600;font-size:14px}
.hero-visual img{border-radius:var(--radius-lg);box-shadow:var(--shadow-md);border:1px solid var(--border)}
.stats-strip{display:grid;grid-template-columns:1fr;gap:14px;margin-top:40px}
.stat{background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--radius-md);padding:18px 20px;text-align:center}
.stat-num{display:block;font-family:var(--font-display);font-size:30px;color:var(--primary)}
.stat-lbl{font-size:13px;color:var(--text-secondary)}
@media (min-width:768px){
  .hero-grid{grid-template-columns:1.05fr .95fr}
  .btn-cta{width:auto}
  .stats-strip{grid-template-columns:repeat(3,1fr)}
}
```

- [ ] **Step 3: Verificar (Playwright, mobile 390 + desktop 1280)**

`browser_resize` 390×844 e 1280×800; `browser_navigate` reload; `browser_console_messages` (zero erros); `browser_take_screenshot`. Conferir: H1 único renderiza, CTA laranja, botão WhatsApp com href `wa.me/5543991086610?text=...` (inspecionar via `browser_evaluate` `document.querySelector('[data-wa]').href`).

- [ ] **Step 4: Commit**

```bash
git add agencia.html assets/agencia.css
git commit -m "feat(lp-agencia): barra de urgência, hero e strip de stats"
```

---

## Task 3: Logo bar (prova social — marquee)

**Files:**
- Modify: `agencia.html` (após a seção hero)
- Modify: `assets/agencia.css` (append)

- [ ] **Step 1: Inserir markup**

```html
<!-- 2. Logo bar -->
<section class="logobar">
  <div class="wrap">
    <p class="logobar-label reveal">Agências que já operam em Loop Fechado:</p>
    <div class="marquee reveal" aria-hidden="false">
      <div class="marquee-track">
        <img src="assets/portfolio/vivacqua.png" alt="Vivacqua" loading="lazy" height="40">
        <img src="assets/portfolio/seahop.png" alt="Sea Hop" loading="lazy" height="40">
        <img src="assets/portfolio/esaenergia.png" alt="Esa Energia" loading="lazy" height="40">
        <img src="assets/portfolio/upperground.png" alt="Upperground" loading="lazy" height="40">
        <img src="assets/portfolio/bangalo.png" alt="Bangalô" loading="lazy" height="40">
        <img src="assets/portfolio/tiagomonaco.png" alt="Tiago Mônaco" loading="lazy" height="40">
        <img src="assets/portfolio/piperhub.png" alt="Piper Hub" loading="lazy" height="40">
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Append CSS**

```css
.logobar{padding:32px 0;background:var(--bg-surface);border-block:1px solid var(--border)}
.logobar-label{text-align:center;font-size:13px;color:var(--text-muted);margin-bottom:20px;font-family:var(--font-mono);text-transform:uppercase;letter-spacing:.1em}
.marquee{overflow:hidden}
.marquee-track{display:flex;gap:48px;align-items:center;justify-content:center;flex-wrap:wrap}
.marquee-track img{height:36px;width:auto;opacity:.6;filter:grayscale(1);transition:opacity .2s}
.marquee-track img:hover{opacity:1;filter:none}
```

> Nota: layout wrap centralizado (sem animação) por simplicidade e acessibilidade. Se quiser scroll infinito depois, é incremento.

- [ ] **Step 3: Verificar** — Playwright reload, screenshot, console zero erros. Conferir logos carregam (sem 404 em `browser_network_requests`).

- [ ] **Step 4: Commit**

```bash
git add agencia.html assets/agencia.css
git commit -m "feat(lp-agencia): logo bar de prova social"
```

---

## Task 4: Problema / Agitação (PAS)

**Files:**
- Modify: `agencia.html` (após logobar)
- Modify: `assets/agencia.css` (append)

- [ ] **Step 1: Inserir markup**

```html
<!-- 3. Problema / Agitação -->
<section class="problema">
  <div class="wrap">
    <span class="eyebrow reveal">RECONHECE A CENA?</span>
    <h2 class="reveal">Você não tem uma agência. <span class="display-accent">Você tem 12 abas abertas.</span></h2>
    <p class="problema-story reveal muted">Sexta-feira, 18h. Você ainda está conferindo os anúncios do cliente X no Meta Business, enquanto o cliente Y cobra o relatório que está numa planilha que alguém esqueceu de atualizar. O financeiro não sabe que o cliente Z parou de pagar. E a proposta nova? Está num rascunho no Notion.</p>

    <div class="frankenstack-box reveal">
      <div class="frankenstack-tools">
        <span>Trello</span><span>Notion</span><span>Planilha</span><span>RD</span><span>mLabs</span><span>WhatsApp</span><span>Asaas</span><span>Meta</span><span>Google Ads</span><span>Conta Azul</span>
      </div>
      <p class="frankenstack-name">Isso tem nome: <strong>Frankenstack</strong>.</p>
      <p class="frankenstack-sub">E ele já te custa pelo menos um cliente por mês — em retrabalho, em erro, em coisa que cai no esquecimento.</p>
    </div>

    <div class="dor-grid">
      <div class="dor-card reveal">
        <h3>Planilhas que ninguém atualiza</h3>
        <p>Cada gestor tem a sua. No fim do mês, o financeiro reconstrói tudo do zero.</p>
      </div>
      <div class="dor-card reveal">
        <h3>Ferramentas que não conversam</h3>
        <p>O CRM não sabe que o cliente parou de pagar. Você descobre na reunião.</p>
      </div>
      <div class="dor-card reveal">
        <h3>Você virou gerente da própria agência</h3>
        <p>Sair do operacional virou promessa de Ano Novo. Toda crise passa por você.</p>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Append CSS** (faixa escura no bloco Frankenstack)

```css
.problema h2{margin:10px 0 18px}
.problema-story{max-width:60ch;font-size:17px;margin-bottom:32px}
.frankenstack-box{background:var(--bg-dark);color:var(--text-on-dark);border-radius:var(--radius-lg);padding:32px 24px;text-align:center;margin-bottom:32px}
.frankenstack-tools{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-bottom:20px}
.frankenstack-tools span{font-family:var(--font-mono);font-size:13px;color:var(--text-secondary-on-dark);border:1px dashed rgba(224,82,82,.5);border-radius:6px;padding:6px 12px;position:relative}
.frankenstack-name{font-family:var(--font-display);font-size:clamp(22px,4vw,30px)}
.frankenstack-name strong{color:var(--danger);font-style:italic;font-weight:400}
.frankenstack-sub{color:var(--text-secondary-on-dark);max-width:54ch;margin:12px auto 0;font-size:15px}
.dor-grid{display:grid;grid-template-columns:1fr;gap:16px}
.dor-card{background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--radius-md);padding:22px}
.dor-card h3{color:var(--danger);margin-bottom:8px;font-size:17px}
.dor-card p{font-size:15px;color:var(--text-secondary)}
@media (min-width:768px){.dor-grid{grid-template-columns:repeat(3,1fr)}}
```

- [ ] **Step 3: Verificar** — Playwright reload, screenshot mobile+desktop, console zero erros.

- [ ] **Step 4: Commit**

```bash
git add agencia.html assets/agencia.css
git commit -m "feat(lp-agencia): seção problema/agitação (PAS) com bloco Frankenstack"
```

---

## Task 5: Solução — Método BALU (4 camadas / Loop Fechado)

**Files:**
- Modify: `agencia.html` (após problema)
- Modify: `assets/agencia.css` (append)

- [ ] **Step 1: Inserir markup**

```html
<!-- 4. Solução -->
<section id="metodo" class="metodo">
  <div class="wrap">
    <span class="eyebrow reveal">O MÉTODO BALU</span>
    <h2 class="reveal">Quatro camadas. <span class="display-accent">Um Loop Fechado.</span></h2>
    <p class="reveal muted metodo-sub">Cada etapa alimenta a próxima e devolve dado para a primeira. Sem retrabalho, sem "cadê?" no grupo.</p>
    <div class="metodo-grid">
      <div class="metodo-card reveal"><span class="metodo-step">1</span><h3>Captação</h3><p>Site, LP e formulários entram com lead direto no sistema. Follow-up dispara sozinho.</p></div>
      <div class="metodo-card reveal"><span class="metodo-step">2</span><h3>Conversão</h3><p>Pipeline com automação, proposta digital com assinatura e cobrança recorrente no mesmo lugar.</p></div>
      <div class="metodo-card reveal"><span class="metodo-step">3</span><h3>Entrega</h3><p>Campanhas, criativos com <strong>Squad de IA</strong>, calendário editorial e SLA — tudo amarrado ao cliente certo.</p></div>
      <div class="metodo-card reveal"><span class="metodo-step">4</span><h3>Insight</h3><p>O <strong>Estrategista IA</strong> observa tudo e devolve sugestões: upsell, risco de churn, gargalo, gap de margem.</p></div>
    </div>
    <p class="loop-indicator reveal">↺ O Insight realimenta a Captação — esse é o Loop Fechado.</p>
  </div>
</section>
```

- [ ] **Step 2: Append CSS**

```css
.metodo-sub{max-width:54ch;margin:10px 0 32px}
.metodo-grid{display:grid;grid-template-columns:1fr;gap:16px}
.metodo-card{background:#fff;border:1px solid var(--border);border-radius:var(--radius-md);padding:24px;box-shadow:var(--shadow-sm);position:relative}
.metodo-step{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;background:var(--primary-bg);color:var(--primary);font-weight:800;font-family:var(--font-mono);margin-bottom:12px}
.metodo-card h3{margin-bottom:8px}
.metodo-card p{font-size:15px;color:var(--text-secondary)}
.metodo-card strong{color:var(--primary)}
.loop-indicator{margin-top:24px;text-align:center;font-family:var(--font-mono);font-size:13px;color:var(--primary);letter-spacing:.04em}
@media (min-width:768px){.metodo-grid{grid-template-columns:repeat(4,1fr)}}
```

- [ ] **Step 3: Verificar** — Playwright reload, screenshot, console zero erros.

- [ ] **Step 4: Commit**

```bash
git add agencia.html assets/agencia.css
git commit -m "feat(lp-agencia): seção solução método BALU (loop fechado)"
```

---

## Task 6: Demonstração (vídeo narrado + screenshots anotados)

**Files:**
- Modify: `agencia.html` (após método)
- Modify: `assets/agencia.css` (append)

- [ ] **Step 1: Inserir markup** (vídeo sem autoplay, `preload="none"`, poster = screenshot do dashboard)

```html
<!-- 5. Demonstração -->
<section class="demo">
  <div class="wrap">
    <span class="eyebrow reveal">VEJA FUNCIONANDO</span>
    <h2 class="reveal">Não é promessa. <span class="display-accent">É a plataforma rodando.</span></h2>
    <div class="demo-video reveal">
      <video controls preload="none" poster="assets/screenshots/agencia-dashboard.png" width="1280" height="720">
        <source src="balu-promo-narrado.mp4" type="video/mp4" />
        Seu navegador não suporta vídeo.
      </video>
    </div>
    <div class="demo-shots">
      <figure class="reveal"><img src="assets/screenshots/agencia-campanhas.png" alt="Campanhas Meta e Google lado a lado" loading="lazy" width="1200" height="800"><figcaption>Meta e Google na mesma tela — crie e escale sem trocar de aba.</figcaption></figure>
      <figure class="reveal"><img src="assets/screenshots/agencia-agentes.png" alt="Squad de IA gerando criativo" loading="lazy" width="1200" height="800"><figcaption>Squad de IA gera copy + imagem sob demanda.</figcaption></figure>
      <figure class="reveal"><img src="assets/screenshots/agencia-financeiro.png" alt="Financeiro com cobrança automática" loading="lazy" width="1200" height="800"><figcaption>Cobrança e inadimplência sob controle, sem planilha.</figcaption></figure>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Append CSS**

```css
.demo h2{margin:10px 0 28px}
.demo-video video{width:100%;border-radius:var(--radius-lg);border:1px solid var(--border);box-shadow:var(--shadow-md);background:#000}
.demo-shots{display:grid;grid-template-columns:1fr;gap:20px;margin-top:32px}
.demo-shots figure img{border-radius:var(--radius-md);border:1px solid var(--border);box-shadow:var(--shadow-sm)}
.demo-shots figcaption{font-size:14px;color:var(--text-secondary);margin-top:10px}
@media (min-width:768px){.demo-shots{grid-template-columns:repeat(3,1fr)}}
```

- [ ] **Step 3: Verificar** — Playwright reload, screenshot. Conferir vídeo NÃO toca sozinho (`browser_evaluate` `document.querySelector('video').paused === true`). Console zero erros.

- [ ] **Step 4: Commit**

```bash
git add agencia.html assets/agencia.css
git commit -m "feat(lp-agencia): seção demonstração (vídeo narrado + screenshots)"
```

---

## Task 7: Benefícios (grid de 8 outcomes)

**Files:**
- Modify: `agencia.html` (após demo)
- Modify: `assets/agencia.css` (append)

- [ ] **Step 1: Inserir markup**

```html
<!-- 6. Benefícios -->
<section class="beneficios">
  <div class="wrap">
    <span class="eyebrow reveal">TUDO NUM SÓ LUGAR</span>
    <h2 class="reveal">7 ferramentas. <span class="display-accent">1 Balu.</span></h2>
    <div class="benef-grid">
      <div class="benef-card reveal"><h3>Meta + Google Ads nativos</h3><p>Crie, pause e escale campanhas sem sair da plataforma.</p><span class="benef-sub">substitui: abrir 2 gerenciadores</span></div>
      <div class="benef-card reveal"><h3>Optimizer autônomo</h3><p>8 regras protegendo orçamento e escalando vencedores de hora em hora.</p><span class="benef-sub">substitui: ajuste manual</span></div>
      <div class="benef-card reveal"><h3>Squad de IA</h3><p>Criativos completos (copy + imagem) gerados sob demanda.</p><span class="benef-sub">substitui: rodada de design</span></div>
      <div class="benef-card reveal"><h3>Cobrança automática</h3><p>Asaas + régua de WhatsApp que cobra e pausa inadimplente sozinha.</p><span class="benef-sub">substitui: planilha + cobrança manual</span></div>
      <div class="benef-card reveal"><h3>SEO com auto-fix</h3><p>Auditoria e correção direto no WordPress/Shopify/Webflow.</p><span class="benef-sub">substitui: consultor de SEO</span></div>
      <div class="benef-card reveal"><h3>Monitor de concorrentes</h3><p>Anúncios dos concorrentes via Meta Ad Library com análise de IA.</p><span class="benef-sub">substitui: espiar na mão</span></div>
      <div class="benef-card reveal"><h3>Portal do cliente</h3><p>Aprovações, calendário e resultados num login próprio do cliente.</p><span class="benef-sub">substitui: e-mail + reunião</span></div>
      <div class="benef-card reveal"><h3>Estrategista IA</h3><p>Análise da carteira inteira com recomendações priorizadas.</p><span class="benef-sub">substitui: você quebrando a cabeça</span></div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Append CSS**

```css
.beneficios h2{margin:10px 0 28px}
.benef-grid{display:grid;grid-template-columns:1fr;gap:16px}
.benef-card{background:#fff;border:1px solid var(--border);border-radius:var(--radius-md);padding:22px;box-shadow:var(--shadow-sm)}
.benef-card h3{font-size:16px;margin-bottom:6px;color:var(--primary)}
.benef-card p{font-size:14px;color:var(--text-secondary)}
.benef-sub{display:block;margin-top:10px;font-family:var(--font-mono);font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em}
@media (min-width:640px){.benef-grid{grid-template-columns:repeat(2,1fr)}}
@media (min-width:960px){.benef-grid{grid-template-columns:repeat(4,1fr)}}
```

- [ ] **Step 3: Verificar** — Playwright reload, screenshot mobile+desktop, console zero erros.

- [ ] **Step 4: Commit**

```bash
git add agencia.html assets/agencia.css
git commit -m "feat(lp-agencia): grid de benefícios (8 outcomes)"
```

---

## Task 8: Depoimentos + KPIs

**Files:**
- Modify: `agencia.html` (após benefícios)
- Modify: `assets/agencia.css` (append)

- [ ] **Step 1: Inserir markup** (depoimentos reais reaproveitados do index)

```html
<!-- 7. Depoimentos -->
<section class="depoimentos">
  <div class="wrap">
    <span class="eyebrow reveal">QUEM JÁ ESTÁ DENTRO</span>
    <h2 class="reveal">Resultado real de <span class="display-accent">quem saiu do caos.</span></h2>
    <div class="depo-highlight reveal">
      <div class="depo-bignum">60 dias</div>
      <blockquote>Saí do operacional em 60 dias. A Balu fez o que três SaaS combinados nunca conseguiram.</blockquote>
      <div class="depo-meta"><span class="avatar">MB</span><div><strong>Marina B.</strong><span>Sócia · agência com 18 contas</span></div></div>
    </div>
    <div class="depo-grid">
      <div class="depo-card reveal"><blockquote>Migrei 11 clientes do meu CRM antigo num final de semana. Na segunda, o pipeline já estava se atualizando sozinho.</blockquote><div class="depo-meta"><span class="avatar">RC</span><div><strong>Rafael C.</strong><span>Diretor comercial · Performance B2B</span></div></div></div>
      <div class="depo-card reveal"><blockquote>O optimizer de mídia salvou um lançamento meu. Pausou 4 criativos no domingo e me explicou por quê na segunda.</blockquote><div class="depo-meta"><span class="avatar">JT</span><div><strong>Júlia T.</strong><span>Head de Mídia · agência paulistana</span></div></div></div>
    </div>
    <div class="kpi-grid reveal">
      <div class="kpi"><span class="kpi-val">7+</span><span class="kpi-lbl">ferramentas substituídas</span></div>
      <div class="kpi"><span class="kpi-val">15 min</span><span class="kpi-lbl">onboarding médio</span></div>
      <div class="kpi"><span class="kpi-val">68%</span><span class="kpi-lbl">menos retrabalho</span></div>
      <div class="kpi"><span class="kpi-val">+3 p.p.</span><span class="kpi-lbl">de margem</span></div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Append CSS**

```css
.depoimentos h2{margin:10px 0 28px}
.depo-highlight{background:var(--bg-dark);color:var(--text-on-dark);border-radius:var(--radius-lg);padding:32px 28px;margin-bottom:20px}
.depo-bignum{font-family:var(--font-display);font-size:clamp(36px,8vw,56px);color:var(--primary-light);line-height:1}
.depo-highlight blockquote{font-size:18px;margin:16px 0 20px;max-width:52ch}
.depo-grid{display:grid;grid-template-columns:1fr;gap:16px}
.depo-card{background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--radius-md);padding:22px}
.depo-card blockquote{font-size:15px;margin-bottom:16px}
.depo-meta{display:flex;align-items:center;gap:12px}
.depo-meta .avatar{width:40px;height:40px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px}
.depo-meta strong{display:block;font-size:14px}
.depo-meta span span,.depo-meta div span{font-size:12px;color:var(--text-muted)}
.depo-highlight .depo-meta span span{color:var(--text-secondary-on-dark)}
.kpi-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-top:28px}
.kpi{text-align:center;background:#fff;border:1px solid var(--border);border-radius:var(--radius-md);padding:18px}
.kpi-val{display:block;font-family:var(--font-display);font-size:30px;color:var(--primary)}
.kpi-lbl{font-size:12px;color:var(--text-secondary)}
@media (min-width:768px){.depo-grid{grid-template-columns:repeat(2,1fr)}.kpi-grid{grid-template-columns:repeat(4,1fr)}}
```

- [ ] **Step 3: Verificar** — Playwright reload, screenshot, console zero erros.

- [ ] **Step 4: Commit**

```bash
git add agencia.html assets/agencia.css
git commit -m "feat(lp-agencia): depoimentos e KPIs"
```

---

## Task 9: Comparativo Frankenstack vs Balu

**Files:**
- Modify: `agencia.html` (após depoimentos)
- Modify: `assets/agencia.css` (append)

- [ ] **Step 1: Inserir markup** (tabela responsiva)

```html
<!-- 8. Comparativo -->
<section class="comparativo">
  <div class="wrap">
    <span class="eyebrow reveal">A DIFERENÇA</span>
    <h2 class="reveal">Quem ainda joga o antigo. <span class="display-accent">Quem usa a Balu.</span></h2>
    <div class="compare-table reveal">
      <div class="compare-col compare-bad">
        <div class="compare-head">❌ Frankenstack</div>
        <ul>
          <li>Ajusta campanha na mão toda semana</li>
          <li>CRM numa ferramenta, projeto em outra</li>
          <li>Paga por usuário em cada tool</li>
          <li>WhatsApp virou ferramenta de gestão</li>
          <li>ROI travado, margem comprimida</li>
          <li>Você no operacional</li>
        </ul>
      </div>
      <div class="compare-col compare-good">
        <div class="compare-head">✅ Com a Balu</div>
        <ul>
          <li>Optimizer rodando sozinho 24/7</li>
          <li>CRM, projetos e financeiro no mesmo lugar</li>
          <li>Paga pela operação, não por usuário</li>
          <li>WhatsApp integrado com cobrança e portal</li>
          <li>+3 p.p. de margem operacional média</li>
          <li>Dashboard Eugência: visão de dono</li>
        </ul>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Append CSS**

```css
.comparativo h2{margin:10px 0 28px}
.compare-table{display:grid;grid-template-columns:1fr;gap:16px}
.compare-col{border-radius:var(--radius-lg);padding:24px;border:1px solid var(--border)}
.compare-bad{background:var(--bg-surface)}
.compare-good{background:var(--primary-bg);border-color:var(--primary)}
.compare-head{font-weight:800;font-size:16px;margin-bottom:14px}
.compare-good .compare-head{color:var(--primary-deep)}
.compare-col ul{list-style:none}
.compare-col li{padding:10px 0;border-top:1px solid var(--border);font-size:14px;color:var(--text-secondary)}
.compare-good li{color:var(--text-primary)}
@media (min-width:768px){.compare-table{grid-template-columns:1fr 1fr}}
```

- [ ] **Step 3: Verificar** — Playwright reload, screenshot, console zero erros.

- [ ] **Step 4: Commit**

```bash
git add agencia.html assets/agencia.css
git commit -m "feat(lp-agencia): comparativo Frankenstack vs Balu"
```

---

## Task 10: Oferta dupla (WhatsApp + tripwire R$47)

**Files:**
- Modify: `agencia.html` (após comparativo)
- Modify: `assets/agencia.css` (append)

- [ ] **Step 1: Inserir markup** (tripwire SEMPRE depois do CTA WhatsApp; checkout placeholder)

```html
<!-- 9. Oferta dupla -->
<section id="oferta" class="oferta">
  <div class="wrap">
    <span class="eyebrow reveal">COMECE AGORA</span>
    <h2 class="reveal">Dois jeitos <span class="display-accent">de começar.</span></h2>
    <div class="oferta-grid">
      <div class="oferta-main reveal">
        <h3>Converse com o Michel</h3>
        <p>15 minutos. Ele entende sua operação, mostra a Balu rodando e monta um plano de migração sem você parar de faturar.</p>
        <a class="btn btn-cta" data-wa href="#">Quero conversar com o Michel</a>
        <p class="oferta-microcopy">Sem compromisso · Resposta em até 1h · Migração assistida inclusa</p>
      </div>
      <div class="oferta-side reveal">
        <h3>Ainda não está pronto para conversar?</h3>
        <p>Comece pela <strong>Eugência em 7 Dias</strong> — o método em ação, passo a passo, dentro da própria plataforma. Por R$47.</p>
        <!-- TODO: trocar href="#" pela URL real do checkout (Kiwify/Cartpanda) -->
        <a class="btn btn-secondary" data-tripwire href="#">Quero a Eugência em 7 Dias (R$47)</a>
        <p class="oferta-bumps">+ Pack de 17 templates de proposta IA · + Comunidade VIP</p>
        <p class="oferta-bumps">Quem entra ganha acesso ao challenge ao vivo de 5 dias (R$197).</p>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Append CSS** (bloco lateral visualmente menor)

```css
.oferta h2{margin:10px 0 28px}
.oferta-grid{display:grid;grid-template-columns:1fr;gap:20px}
.oferta-main{background:var(--bg-dark);color:var(--text-on-dark);border-radius:var(--radius-xl);padding:32px 28px}
.oferta-main h3{font-size:24px;margin-bottom:12px}
.oferta-main p{color:var(--text-secondary-on-dark);margin-bottom:20px;max-width:46ch}
.oferta-main .btn-cta{width:100%;justify-content:center}
.oferta-microcopy{font-size:13px;color:var(--text-muted);margin-top:12px}
.oferta-side{background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:26px}
.oferta-side h3{font-size:18px;margin-bottom:10px}
.oferta-side p{font-size:14px;color:var(--text-secondary);margin-bottom:16px}
.oferta-side strong{color:var(--primary)}
.oferta-side .btn{width:100%;justify-content:center;font-size:15px;padding:14px}
.oferta-bumps{font-size:12px;color:var(--text-muted);margin-top:10px}
@media (min-width:768px){.oferta-grid{grid-template-columns:1.4fr 1fr;align-items:start}}
```

- [ ] **Step 3: Verificar** — Playwright reload. Conferir: bloco WhatsApp em destaque ACIMA/maior que tripwire; href do `[data-tripwire]` é `#` (placeholder). Console zero erros.

- [ ] **Step 4: Commit**

```bash
git add agencia.html assets/agencia.css
git commit -m "feat(lp-agencia): oferta dupla (WhatsApp + tripwire R\$47 placeholder)"
```

---

## Task 11: FAQ (accordion nativo + JSON-LD FAQPage)

**Files:**
- Modify: `agencia.html` (após oferta + atualizar o `FAQPage` no JSON-LD do head)
- Modify: `assets/agencia.css` (append)

- [ ] **Step 1: Inserir markup do FAQ**

```html
<!-- 10. FAQ -->
<section class="faq">
  <div class="wrap">
    <span class="eyebrow reveal">DÚVIDAS</span>
    <h2 class="reveal">Perguntas que <span class="display-accent">todo dono de agência faz.</span></h2>
    <div class="faq-list">
      <details class="reveal"><summary>A Balu substitui mesmo todas as minhas ferramentas?<span class="faq-chevron">⌄</span></summary><p>A maioria: Meta/Google Ads, criativos, cobrança, projetos, relatórios, portal do cliente. Para ferramentas muito específicas, seguimos integrados via webhook.</p></details>
      <details class="reveal"><summary>Quanto tempo leva para migrar?<span class="faq-chevron">⌄</span></summary><p>Onboarding guiado em torno de 15 min. Migração completa com clientes, campanhas e financeiro: alguns dias úteis, e a gente faz junto.</p></details>
      <details class="reveal"><summary>A IA toma decisões sozinha?<span class="faq-chevron">⌄</span></summary><p>Só nas regras que você ativa. Tudo passa por checkpoint de aprovação humana (human-in-the-loop). Você aprova com 1 clique.</p></details>
      <details class="reveal"><summary>Funciona pra qualquer nicho de agência?<span class="faq-chevron">⌄</span></summary><p>Sim. Performance, social, branding, mídia local. Os módulos se adaptam ao tipo de operação.</p></details>
      <details class="reveal"><summary>Preciso saber programar ou configurar coisa técnica?<span class="faq-chevron">⌄</span></summary><p>Não. O onboarding é guiado e o Michel acompanha.</p></details>
      <details class="reveal"><summary>Quanto custa?<span class="faq-chevron">⌄</span></summary><p>Depende do tamanho da sua operação. Por isso a conversa de 15 min — pra montar o plano certo, sem você pagar pelo que não usa.</p></details>
      <details class="reveal"><summary>Tem fidelidade?<span class="faq-chevron">⌄</span></summary><p>A gente fala disso na conversa, de forma transparente.</p></details>
      <details class="reveal"><summary>E se eu já uso o GoHighLevel / RD / Operand?<span class="faq-chevron">⌄</span></summary><p>A gente migra. E mostra na conversa o que a Balu faz que eles não fazem (Optimizer autônomo, Squad de IA, cobrança brasileira nativa).</p></details>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Atualizar o `FAQPage` no JSON-LD do `<head>`** (substituir `"mainEntity":[]` pelas 8 perguntas)

```json
"mainEntity":[
  {"@type":"Question","name":"A Balu substitui mesmo todas as minhas ferramentas?","acceptedAnswer":{"@type":"Answer","text":"A maioria: Meta/Google Ads, criativos, cobrança, projetos, relatórios, portal do cliente. Para ferramentas muito específicas, seguimos integrados via webhook."}},
  {"@type":"Question","name":"Quanto tempo leva para migrar?","acceptedAnswer":{"@type":"Answer","text":"Onboarding guiado em torno de 15 min. Migração completa com clientes, campanhas e financeiro: alguns dias úteis, e a gente faz junto."}},
  {"@type":"Question","name":"A IA toma decisões sozinha?","acceptedAnswer":{"@type":"Answer","text":"Só nas regras que você ativa. Tudo passa por checkpoint de aprovação humana. Você aprova com 1 clique."}},
  {"@type":"Question","name":"Funciona pra qualquer nicho de agência?","acceptedAnswer":{"@type":"Answer","text":"Sim. Performance, social, branding, mídia local. Os módulos se adaptam ao tipo de operação."}},
  {"@type":"Question","name":"Preciso saber programar?","acceptedAnswer":{"@type":"Answer","text":"Não. O onboarding é guiado e o Michel acompanha."}},
  {"@type":"Question","name":"Quanto custa?","acceptedAnswer":{"@type":"Answer","text":"Depende do tamanho da sua operação. Por isso a conversa de 15 min — pra montar o plano certo."}},
  {"@type":"Question","name":"Tem fidelidade?","acceptedAnswer":{"@type":"Answer","text":"A gente fala disso na conversa, de forma transparente."}},
  {"@type":"Question","name":"E se eu já uso o GoHighLevel / RD / Operand?","acceptedAnswer":{"@type":"Answer","text":"A gente migra. E mostra na conversa o que a Balu faz que eles não fazem."}}
]
```

- [ ] **Step 3: Append CSS**

```css
.faq h2{margin:10px 0 28px}
.faq-list{max-width:760px;margin:0 auto}
.faq details{border-bottom:1px solid var(--border)}
.faq summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:16px;padding:18px 0;font-weight:600;font-size:16px}
.faq summary::-webkit-details-marker{display:none}
.faq .faq-chevron{transition:transform .2s;color:var(--primary);font-size:20px}
.faq details[open] .faq-chevron{transform:rotate(180deg)}
.faq details p{padding:0 0 18px;color:var(--text-secondary);font-size:15px;max-width:64ch}
```

- [ ] **Step 4: Verificar** — Playwright reload, abrir/fechar um `<details>` via `browser_click`, screenshot, console zero erros. Validar JSON-LD com `browser_evaluate` (`JSON.parse` de cada `<script type="application/ld+json">` sem throw).

- [ ] **Step 5: Commit**

```bash
git add agencia.html assets/agencia.css
git commit -m "feat(lp-agencia): FAQ accordion + FAQPage schema"
```

---

## Task 12: CTA final + rodapé + sticky CTA mobile

**Files:**
- Modify: `agencia.html` (após FAQ; sticky-cta como último filho do `<body>` antes do `<script>`)
- Modify: `assets/agencia.css` (append)

- [ ] **Step 1: Inserir markup CTA final + rodapé (dentro de `<main>`/após) e sticky CTA (fora do `<main>`)**

```html
<!-- 11. CTA final -->
<section class="cta-final">
  <div class="wrap">
    <h2 class="reveal">Próxima semana. <span class="display-accent">Sem caos.</span></h2>
    <p class="reveal muted cta-final-sub">Agende 15 minutos com o Michel. Ele mostra como migrar sua operação sem parar de faturar.</p>
    <a class="btn btn-cta reveal" data-wa href="#">Quero conversar com o Michel</a>
    <p class="reveal"><a class="cta-final-tripwire" data-tripwire href="#">Ou começar pela Eugência em 7 Dias (R$47)</a></p>
  </div>
</section>
</main>

<footer class="site-footer">
  <div class="wrap footer-inner">
    <img src="assets/logo-gradient.svg" alt="Balu" height="28">
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

> Atenção: o `</main>` já existia no Task 1 vazio. Ao inserir, garantir que o CTA final fica DENTRO de `<main>` e `<footer>` + `.sticky-cta` ficam FORA. Ajustar o fechamento conforme o markup acima.

- [ ] **Step 2: Append CSS**

```css
.cta-final{text-align:center;background:var(--bg-surface)}
.cta-final-sub{max-width:50ch;margin:14px auto 24px}
.cta-final .btn-cta{margin:0 auto}
.cta-final-tripwire{display:inline-block;margin-top:16px;color:var(--primary);font-weight:600;font-size:14px;border-bottom:1px solid var(--primary)}
.site-footer{background:var(--bg-dark);color:var(--text-secondary-on-dark);padding:32px 0}
.footer-inner{display:flex;flex-direction:column;gap:14px;align-items:center;text-align:center}
.footer-links{display:flex;gap:18px;flex-wrap:wrap;justify-content:center}
.footer-links a{font-size:14px;color:var(--text-on-dark)}
.footer-copy{font-size:13px}
/* sticky CTA */
.sticky-cta{position:fixed;bottom:0;left:0;right:0;z-index:99;padding:12px 16px;background:#fff;border-top:1px solid var(--border);display:none;box-shadow:0 -4px 16px rgba(10,22,40,.08)}
.sticky-cta .btn-cta{width:100%;justify-content:center;padding:14px}
.sticky-cta.show{display:block}
@media (min-width:769px){.sticky-cta{display:none!important}}
body{padding-bottom:0}
@media (max-width:768px){body{padding-bottom:84px}}
```

- [ ] **Step 3: Verificar** — Playwright: mobile 390px, scroll além do hero via `browser_evaluate('window.scrollTo(0,1200)')`, screenshot (sticky-cta visível). Desktop 1280px: sticky-cta oculto. Console zero erros.

- [ ] **Step 4: Commit**

```bash
git add agencia.html assets/agencia.css
git commit -m "feat(lp-agencia): CTA final, rodapé e sticky CTA mobile"
```

---

## Task 13: Tracking scaffold (Meta Pixel + GA4 placeholder)

**Files:**
- Modify: `agencia.html` (`<head>`, substituir os comentários TODO_PIXEL_ID/TODO_GA4_ID)

- [ ] **Step 1: Inserir scaffold de Pixel + GA4 com IDs placeholder no `<head>`** (antes do JSON-LD)

```html
<!-- Meta Pixel — TODO: trocar TODO_PIXEL_ID pelo ID real -->
<script>
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
if ('TODO_PIXEL_ID' !== 'TODO_PIXEL_ID'.toUpperCase() || false) {} // placeholder guard
fbq('init','TODO_PIXEL_ID');fbq('track','PageView');
</script>
<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=TODO_PIXEL_ID&ev=PageView&noscript=1"/></noscript>

<!-- GA4 — TODO: trocar TODO_GA4_ID pelo ID real (G-XXXX) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=TODO_GA4_ID"></script>
<script>
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
gtag('js',new Date());gtag('config','TODO_GA4_ID');
</script>
```

> Nota: enquanto os IDs forem `TODO_*`, o Pixel/GA4 não vão registrar de verdade (IDs inválidos) — sem erro de JS. O `agencia.js` já tem guarda `typeof fbq/gtag === 'function'` e os scripts acima definem `fbq`/`gtag`, então os eventos `whatsapp_click_agencia`/`tripwire_click_agencia` disparam (e passam a valer quando trocar o ID).

- [ ] **Step 2: Verificar** — Playwright reload; `browser_console_messages` (zero erros de JS — pode haver warning de rede do ID inválido, aceitável); `browser_evaluate('typeof window.fbq')` → `"function"`, `typeof window.gtag` → `"function"`. Clicar num `[data-wa]` e confirmar que não quebra.

- [ ] **Step 3: Commit**

```bash
git add agencia.html
git commit -m "feat(lp-agencia): scaffold de tracking (Meta Pixel + GA4 placeholder)"
```

---

## Task 14: Sitemap + QA final

**Files:**
- Modify: `sitemap.xml`

- [ ] **Step 1: Adicionar entrada `/agencia` no `sitemap.xml`** (copiar o formato de `<url>` existente; usar `https://baluhub.com.br/agencia`, `lastmod` 2026-05-27, `priority` 0.9)

```xml
  <url>
    <loc>https://baluhub.com.br/agencia</loc>
    <lastmod>2026-05-27</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
```

- [ ] **Step 2: QA final completo via Playwright**

- Mobile 390px e desktop 1280px: screenshot da página inteira (`browser_take_screenshot` fullPage).
- `browser_console_messages`: zero erros.
- `browser_network_requests`: nenhum 404 (todos screenshots/logos/vídeo/CSS/JS/fontes carregam).
- `browser_evaluate`: confirmar exatamente **1** `<h1>` (`document.querySelectorAll('h1').length === 1`).
- Confirmar href dos `[data-wa]` = `https://wa.me/5543991086610?text=...`.
- Testar UTM: `browser_navigate` para `http://localhost:8080/agencia.html?utm_source=meta&utm_campaign=teste` e confirmar que o texto do WhatsApp inclui `[utm_source=meta&utm_campaign=teste]`.
- Validar os 3 blocos JSON-LD com `JSON.parse` sem erro.

- [ ] **Step 3: Commit**

```bash
git add sitemap.xml
git commit -m "feat(lp-agencia): adicionar /agencia ao sitemap + QA final"
```

---

## Pós-implementação (manual, fora do código — para o Eduardo)

1. **Tracking:** trocar `TODO_PIXEL_ID` e `TODO_GA4_ID` em `agencia.html` pelos IDs reais.
2. **Checkout tripwire:** trocar os `href="#"` dos `[data-tripwire]` pela URL do Kiwify/Cartpanda.
3. **OG-image:** opcional, gerar imagem exclusiva da LP e atualizar as meta `og:image`/`twitter:image`.
4. **Subdomínio `lp.baluhub.com.br`:** Vercel → Settings → Domains → adicionar `lp.baluhub.com.br`; criar registro CNAME no DNS apontando para a Vercel. A URL `lp.baluhub.com.br/agencia` passa a servir o arquivo automaticamente.

---

## Self-Review (preenchido)

**Cobertura do spec:** todas as 12 seções (0–11 + rodapé + sticky) mapeadas (Tasks 2–12). Tokens/tipografia (Task 1). Comportamentos JS — WhatsApp+UTM, sticky, reveal, tracking (Tasks 1 e 13). SEO/schema/canonical (Tasks 1 e 11). Performance/lazy/poster (Tasks 2,3,6). Placeholders (tripwire Task 10, tracking Task 13, og-image Task 1). Sitemap (Task 14). ✔ sem lacunas.

**Placeholders proibidos:** os únicos "TODO" são os 4 placeholders **intencionais e documentados** do spec (checkout, IDs de tracking, og-image, DNS) — não são lacunas do plano. Cada step tem código concreto. ✔

**Consistência de tipos/nomes:** `data-wa`, `data-tripwire`, classe `reveal`/`visible`, `.sticky-cta`/`.show`, `.hero` usados de forma idêntica entre HTML (tasks de seção) e JS (Task 1). WhatsApp `5543991086610` consistente em todas as ocorrências. ✔
