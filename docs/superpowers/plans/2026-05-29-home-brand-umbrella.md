# Home Brand-Umbrella Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reescrever `index.html` substituindo o institucional do produto Balu Agência por uma home institucional da marca Balu (guarda-chuva), com 9 seções apresentando empresa + 3 produtos.

**Architecture:** Reescrita in-place do `index.html` (versão atual preservada no git para rollback). Reusa **100%** o design system existente em `assets/styles.css` (dark editorial: Cal Sans display + DM Sans body + JetBrains Mono mono, paleta azul Balu `#4576FF`, mesh gradients, GSAP/ScrollTrigger animations). Nenhuma nova LP, nenhum novo CSS — só uma página nova usando classes já existentes (`.hero`, `.kpis`, `.testimonial`, `.plan-card`, `.faq-item`, `.glass-pill`, `.magnetic`, `data-reveal`, etc.).

**Tech Stack:** HTML5 + CSS puro (reusa `styles.css`) + JS vanilla (reusa `main.js`) + GSAP CDN (já carregado pelo head atual). Sem build step. Deploy estático Vercel.

**Spec:** [docs/superpowers/specs/2026-05-29-home-brand-umbrella-design.md](../specs/2026-05-29-home-brand-umbrella-design.md)

---

## Método de verificação (projeto estático sem test runner)

1. Servidor local: `cd /root/balu-site-1 && python3 -m http.server 8080` (subir no Task 1).
2. Playwright MCP (`mcp__playwright__*`) — após cada task, `browser_navigate` para `http://localhost:8080/index.html`, `browser_console_messages` (esperado: **zero erros JS**), `browser_take_screenshot` (mobile 390 + desktop 1280 via `browser_resize`).
3. **Crítico:** Garantir 1 único `<h1>` e que as URLs externas (`/crm`, `/criacao`, `/agencia`, `/lp-crm`, `lp.baluhub.com.br/*`) continuem funcionando — não deve haver regressão em outras páginas.
4. Commit por task com mensagem `feat(home): <descrição>` + trailer Co-Authored-By.

---

## File Structure

| Arquivo | Responsabilidade |
|---------|------------------|
| `index.html` (modificar — reescrita completa) | Home institucional da marca Balu: hero + 3 produtos + manifesto + logos + depoimentos + planos + FAQ + CTA + footer |
| `llms.txt` (modificar — linha inicial) | Atualizar descrição "> ..." pra brand-level |
| `crm.html`, `criacao.html` (modificar — conferir nav) | Se houver link "Balu Agência" apontando pra `/`, ajustar pra `lp.baluhub.com.br/agencia` (já que `/` agora é brand-level, não produto Agência) |
| `sitemap.xml` (talvez modificar) | Atualizar `lastmod` da entry `/` pra 2026-05-29 |

**Reaproveitados sem modificação:**
- `assets/styles.css` (design system completo)
- `assets/main.js` (interações + GSAP wiring)
- `assets/cookie-banner.js`, `assets/agent-balu.css`, `assets/agent-balu.js` (se índex os usa)
- `assets/logo-white.svg`, `assets/logo-gradient.svg`, `favicon.svg`
- `assets/fonts/cal-sans-latin-400.woff2`
- Todas as outras páginas (`crm.html`, `criacao.html`, `agencia.html`, `lp-crm.html`, `lp-site/*`, etc.)

**Constantes (usar exatamente assim):**
- WhatsApp institucional (Balu, número da empresa): `https://wa.me/5512991548086` (mesmo que o `crm.html`/`criacao.html` usam — NÃO confundir com `5543991086610` que é o Michel/LPs)
- E-mail: `contato@balu.com.br`
- Endereço: Sapiens Parque, Av. Luiz Boiteux Piazza 1302, Canasvieiras, Florianópolis, SC

---

## Task 1: Backup mental + scaffold do novo index.html

**Files:**
- Modify: `index.html` (reescrita completa)

> **Importante:** o `index.html` atual (1385 linhas) será descartado e substituído. Ele continua preservado no git — qualquer momento dá pra fazer `git show HEAD:index.html > recover.html` pra recuperar. Não preserve o conteúdo antigo no commit; este task substitui o arquivo inteiro pelo skeleton novo.

- [ ] **Step 1: Confirmar que servidor local está rodando**

Run: `cd /root/balu-site-1 && curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/index.html`
Se não estiver 200, subir: `(python3 -m http.server 8080 >/tmp/lp-http.log 2>&1 &)`

- [ ] **Step 2: Ler `crm.html` rapidamente como referência de markup (não copiar inteiro, só pra ver classes/estrutura)**

Run: `head -120 /root/balu-site-1/crm.html` — observe head (fontes/CSS/JS), e estrutura semântica (`<header>`, `<main>`, `<footer>`).

- [ ] **Step 3: Sobrescrever `index.html` com o scaffold novo**

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Balu — Plataforma com IA para agências, e-commerce e serviços</title>
  <meta name="description" content="Atendimento, vendas e operação em Loop Fechado com IA. 3 produtos: Balu Agência, Balu CRM, Balu Criação. Conversa de 15 min sem cartão." />
  <meta name="keywords" content="Balu, plataforma para agências, CRM com IA, gestão de agência, software para agência marketing, Loop Fechado, Balu Agência, Balu CRM, Balu Criação" />
  <meta name="author" content="Balu" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#4576FF" />
  <link rel="canonical" href="https://baluhub.com.br/" />

  <link rel="icon" type="image/svg+xml" href="favicon.svg" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="preconnect" href="https://fonts.bunny.net">
  <link href="https://fonts.bunny.net/css?family=dm-sans:400,500,600&display=swap" rel="stylesheet">
  <link rel="preload" href="assets/fonts/cal-sans-latin-400.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="stylesheet" href="assets/styles.css?v=ee210d4" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" async></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" async></script>

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="pt_BR" />
  <meta property="og:site_name" content="Balu" />
  <meta property="og:title" content="Balu — Plataforma com IA para agências, e-commerce e serviços" />
  <meta property="og:description" content="3 produtos integrados em Loop Fechado: Agência, CRM, Criação. Conversa de 15 min sem cartão." />
  <meta property="og:url" content="https://baluhub.com.br/" />
  <meta property="og:image" content="https://baluhub.com.br/og-image.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Balu — plataforma única com IA pra agências, e-commerce e serviços" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Balu — Plataforma com IA para agências, e-commerce e serviços" />
  <meta name="twitter:description" content="3 produtos integrados em Loop Fechado: Agência, CRM, Criação." />
  <meta name="twitter:image" content="https://baluhub.com.br/og-image.png" />

  <!-- JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://baluhub.com.br/#organization",
        "name": "Balu",
        "url": "https://baluhub.com.br/",
        "logo": "https://baluhub.com.br/assets/logo-white.svg",
        "description": "Plataforma com IA para agências de marketing, e-commerces e prestadores de serviço. 3 produtos integrados em Loop Fechado: Balu Agência, Balu CRM, Balu Criação.",
        "foundingDate": "2025",
        "founder": { "@type": "Person", "name": "Eduardo Bovo" },
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Av. Luiz Boiteux Piazza 1302",
          "addressLocality": "Florianópolis",
          "addressRegion": "SC",
          "addressCountry": "BR"
        },
        "email": "contato@balu.com.br"
      },
      {
        "@type": "WebSite",
        "@id": "https://baluhub.com.br/#website",
        "url": "https://baluhub.com.br/",
        "name": "Balu",
        "publisher": { "@id": "https://baluhub.com.br/#organization" },
        "inLanguage": "pt-BR"
      },
      {
        "@type": "ItemList",
        "name": "Produtos Balu",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Balu Agência", "url": "https://lp.baluhub.com.br/agencia" },
          { "@type": "ListItem", "position": 2, "name": "Balu CRM", "url": "https://lp.baluhub.com.br/crm" },
          { "@type": "ListItem", "position": 3, "name": "Balu Criação", "url": "https://baluhub.com.br/criacao" }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": []
      }
    ]
  }
  </script>
</head>
<body>
  <header class="site-header">
    <div class="container">
      <a href="/" class="brand" aria-label="Balu home">
        <img src="assets/logo-white.svg" alt="Balu" height="28" />
      </a>
    </div>
  </header>

  <main id="main">
    <!-- 1. Hero institucional (próxima task) -->
    <!-- 2. 3 produtos -->
    <!-- 3. Manifesto -->
    <!-- 4. Logos -->
    <!-- 5. Depoimentos -->
    <!-- 6. Planos -->
    <!-- 7. FAQ -->
    <!-- 8. CTA final -->
  </main>

  <!-- 9. Footer (próxima task) -->

  <script src="assets/main.js?v=ee210d4" defer></script>
</body>
</html>
```

- [ ] **Step 4: Verificar**

Run: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/index.html` → 200.
Playwright (se disponível): `browser_navigate` → `http://localhost:8080/index.html`; `browser_console_messages` → **zero erros**; `browser_take_screenshot` (esperado: header com logo + main vazio, fonts carregando).

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat(home): scaffold da nova home brand-umbrella (substitui institucional Agência)

Versão anterior preservada no git para rollback (git show HEAD~1:index.html).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Hero institucional

**Files:**
- Modify: `index.html` (substituir o comentário `<!-- 1. Hero institucional -->`)

- [ ] **Step 1: Inserir markup do hero dentro de `<main>` no lugar do comentário**

```html
<!-- 1. Hero institucional -->
<section class="hero">
  <div class="container hero-grid">
    <div class="hero-copy" data-reveal>
      <span class="eyebrow"><span class="dot"></span> Balu — desde 2025</span>
      <h1>Sua operação inteira <span class="display-glow">numa só plataforma.</span></h1>
      <p class="lede">Atendimento, vendas e operação em <strong>Loop Fechado</strong> com IA — pra agências de marketing, e-commerces e prestadores de serviço.</p>
      <div class="hero-actions">
        <a href="#produtos" class="btn btn-accent magnetic">
          Ver os produtos
          <svg class="arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M7 3v8m0 0L3 7m4 4l4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
        <a href="https://wa.me/5512991548086?text=Ol%C3%A1%2C%20quero%20conhecer%20a%20Balu" target="_blank" rel="noopener" class="btn btn-ghost magnetic">
          Falar com a gente
        </a>
      </div>
    </div>
    <div class="hero-mockup" data-reveal style="--reveal-delay:120ms">
      <!-- visual: usar mesh gradient + grain overlay (já existe em styles.css via .aurora ou similar).
           Se houver dúvida sobre o melhor visual, use a tag <div class="aurora"> que já existe no índex antigo (linha ~248 do index.html original). -->
      <div class="aurora" aria-hidden="true">
        <div class="blob blob-blue"></div>
        <div class="blob blob-cyan"></div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Verificar**

Playwright: reload `http://localhost:8080/index.html`.
- `browser_evaluate` → `document.querySelectorAll('h1').length === 1` (deve ser 1)
- Zero erros de console
- Screenshot mobile 390 + desktop 1280
- Visualmente: hero com texto à esquerda, área visual à direita (desktop) ou empilhado (mobile)

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(home): hero institucional Balu"
```

---

## Task 3: 3 produtos em destaque

**Files:**
- Modify: `index.html` (substituir o comentário `<!-- 2. 3 produtos -->`)

- [ ] **Step 1: Inserir markup dos 3 produtos**

```html
<!-- 2. 3 produtos em destaque -->
<section id="produtos" class="section-band theme-light">
  <div class="container">
    <div class="sec-head" data-reveal>
      <span class="eyebrow"><span class="dot"></span> 3 produtos, 1 marca</span>
      <h2>Escolha por onde <span class="display-glow">começar.</span></h2>
      <p class="lede">Cada produto resolve uma dor específica. Juntos, formam o loop fechado completo.</p>
    </div>

    <div class="produtos-grid">
      <article class="produto-card" data-reveal>
        <div class="produto-icon" aria-hidden="true">
          <img src="assets/screenshots/agencia-dashboard.png" alt="" loading="lazy" />
        </div>
        <h3>Balu Agência</h3>
        <p>Plataforma operacional completa pra agência. CRM + projetos + financeiro + Squad de IA num loop fechado.</p>
        <a href="https://lp.baluhub.com.br/agencia" class="btn btn-ghost magnetic">
          Conheça <svg class="arrow" width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 7h8m0 0L7 3m4 4l-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
      </article>

      <article class="produto-card featured" data-reveal style="--reveal-delay:80ms">
        <div class="produto-icon" aria-hidden="true">
          <img src="assets/screenshots/crm-conversations.png" alt="" loading="lazy" />
        </div>
        <h3>Balu CRM</h3>
        <p>CRM omnichannel com IA. Inbox unificado (WhatsApp + Instagram + e-mail + marketplaces) + agentes IA + pipeline visual.</p>
        <a href="https://lp.baluhub.com.br/crm" class="btn btn-ghost magnetic">
          Conheça <svg class="arrow" width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 7h8m0 0L7 3m4 4l-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
      </article>

      <article class="produto-card" data-reveal style="--reveal-delay:160ms">
        <div class="produto-icon" aria-hidden="true">
          <img src="og-image-criacao.png" alt="" loading="lazy" />
        </div>
        <h3>Balu Criação</h3>
        <p>Sites e landing pages white-label pra agências revenderem. Entregas em dias, não meses. SEO + GEO incluso.</p>
        <a href="/criacao" class="btn btn-ghost magnetic">
          Conheça <svg class="arrow" width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 7h8m0 0L7 3m4 4l-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
      </article>
    </div>
  </div>
</section>

<style>
  /* fallback inline (caso .produtos-grid não exista no styles.css):
     se o styles.css já tiver .grid-3 ou similar, prefira usar a classe existente */
  .produtos-grid{display:grid;grid-template-columns:1fr;gap:20px;margin-top:40px}
  .produto-card{padding:24px;border:1px solid rgba(255,255,255,.08);border-radius:16px;background:rgba(255,255,255,.02)}
  .produto-card.featured{border-color:rgba(69,118,255,.3);background:rgba(69,118,255,.04)}
  .produto-icon{width:100%;aspect-ratio:16/10;overflow:hidden;border-radius:10px;margin-bottom:18px;background:rgba(0,0,0,.2)}
  .produto-icon img{width:100%;height:100%;object-fit:cover;display:block}
  .produto-card h3{font-family:var(--font-display);font-size:22px;margin-bottom:8px}
  .produto-card p{font-size:15px;color:var(--text-2);line-height:1.55;margin-bottom:18px}
  @media (min-width:768px){.produtos-grid{grid-template-columns:repeat(3,1fr)}}
</style>
```

- [ ] **Step 2: Verificar**

Playwright: reload.
- 3 elementos `.produto-card` presentes
- 3 imagens carregam sem 404 (`browser_network_requests`)
- Links resolvem corretamente (Agência → lp.baluhub.com.br/agencia, CRM → lp.baluhub.com.br/crm, Criação → /criacao)
- Zero erros console
- Screenshot mobile (1 col) + desktop (3 cols)

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(home): 3 produtos em destaque (Agência, CRM, Criação)"
```

---

## Task 4: Manifesto / quem é a Balu

**Files:**
- Modify: `index.html` (substituir o comentário `<!-- 3. Manifesto -->`)

- [ ] **Step 1: Inserir markup do manifesto**

```html
<!-- 3. Manifesto / quem é a Balu -->
<section class="section-band theme-dark-alt">
  <div class="container container-narrow">
    <div class="sec-head" data-reveal>
      <span class="eyebrow"><span class="dot"></span> Quem a gente é</span>
      <h2>Nasceu da prática de <span class="display-glow">gerir agência.</span></h2>
    </div>
    <div class="manifesto" data-reveal style="--reveal-delay:80ms">
      <p>A Balu nasceu em 2025 da experiência real de gerir agência. Sediada em <strong>Florianópolis</strong> (Sapiens Parque). O nome é homenagem ao Balu, mascote do Mowgli — <em>bigger, friendlier, calmer</em>.</p>
      <p>Em vez de focar num pedaço da operação (só CRM ou só publicação), costuramos o <strong>loop fechado</strong> captação → conversão → entrega → insight, onde cada etapa alimenta a próxima e devolve dado pra primeira.</p>
      <blockquote class="founder-quote">
        <p>"Construímos a Balu porque já vivemos a dor do Frankenstack. A solução não era mais uma ferramenta — era costurar tudo em um loop fechado."</p>
        <footer class="founder-cite">
          <span class="founder-avatar" aria-hidden="true">EB</span>
          <span><strong>Eduardo Bovo</strong><br><span class="founder-role">Founder · Balu</span></span>
        </footer>
      </blockquote>
    </div>
  </div>
</section>

<style>
  .manifesto p{font-size:17px;line-height:1.65;color:var(--text-2);margin-bottom:18px}
  .manifesto p strong{color:var(--text)}
  .founder-quote{margin-top:36px;padding:24px;border-left:3px solid var(--accent);background:rgba(255,255,255,.02);border-radius:8px}
  .founder-quote p{font-family:var(--font-display);font-size:20px;line-height:1.45;color:var(--text);margin-bottom:16px;font-style:italic}
  .founder-cite{display:flex;align-items:center;gap:14px;font-size:14px;color:var(--text-3)}
  .founder-avatar{width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#4576FF,#1285C5);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:15px;flex-shrink:0}
  .founder-role{color:var(--text-3);font-size:13px}
</style>
```

- [ ] **Step 2: Verificar**

Reload. Zero console errors. Screenshot. Verificar tipografia (Cal Sans no h2/blockquote, DM Sans no corpo).

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(home): manifesto da marca + citação do founder"
```

---

## Task 5: Logos de clientes (marquee)

**Files:**
- Modify: `index.html` (substituir o comentário `<!-- 4. Logos -->`)

- [ ] **Step 1: Inserir markup**

> A classe `.logos-marquee` já existe no `styles.css` (usada em outras páginas institucionais). Reusar o pattern.

```html
<!-- 4. Logos de clientes -->
<section class="section-band">
  <div class="container">
    <div class="sec-head" data-reveal>
      <span class="eyebrow"><span class="dot"></span> Quem está com a gente</span>
      <h2>Agências e operações que rodam no <span class="display-glow">loop fechado.</span></h2>
    </div>
  </div>
  <div class="logos-marquee" aria-hidden="false">
    <div class="logos-marquee-track">
      <span class="client-name-large">Vivacqua</span>
      <span class="client-name-large">Sea Hop</span>
      <span class="client-name-large">Esa Energia</span>
      <span class="client-name-large">Upperground</span>
      <span class="client-name-large">Bangalô</span>
      <span class="client-name-large">Tiago Mônaco</span>
      <span class="client-name-large">Piper Hub</span>
      <!-- duplicado pra loop infinito -->
      <span class="client-name-large" aria-hidden="true">Vivacqua</span>
      <span class="client-name-large" aria-hidden="true">Sea Hop</span>
      <span class="client-name-large" aria-hidden="true">Esa Energia</span>
      <span class="client-name-large" aria-hidden="true">Upperground</span>
      <span class="client-name-large" aria-hidden="true">Bangalô</span>
      <span class="client-name-large" aria-hidden="true">Tiago Mônaco</span>
      <span class="client-name-large" aria-hidden="true">Piper Hub</span>
    </div>
  </div>
</section>

<style>
  .client-name-large{font-family:var(--font-display);font-size:32px;font-weight:400;color:var(--text-2);white-space:nowrap;padding:0 32px;letter-spacing:-.02em;opacity:.7;transition:opacity .2s}
  .client-name-large:hover{opacity:1;color:var(--text)}
</style>
```

- [ ] **Step 2: Verificar**

Reload. Marquee animando (se `.logos-marquee` no styles.css tem `animation: marquee-scroll Xs linear infinite` ou similar). Screenshot. Zero console errors.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(home): logos de clientes (wordmarks no marquee)"
```

---

## Task 6: Depoimentos + KPIs

**Files:**
- Modify: `index.html` (substituir o comentário `<!-- 5. Depoimentos -->`)

> Usa o pattern de `.testimonial` + `.kpis` que já existe no `styles.css` (presente no `index.html` antigo nas linhas ~1060-1100).

- [ ] **Step 1: Inserir markup**

```html
<!-- 5. Depoimentos + KPIs -->
<section class="section-band">
  <div class="container">
    <div class="sec-head" data-reveal>
      <span class="eyebrow"><span class="dot"></span> Resultado real</span>
      <h2>O que mudou pra <span class="display-glow">quem mudou.</span></h2>
    </div>

    <div class="testimonial-grid">
      <div class="testimonial" data-reveal>
        <blockquote>A Balu fez o que três SaaS combinados nunca conseguiram: me devolveu tempo. Saí do operacional em 60 dias.</blockquote>
        <div class="testimonial-meta">
          <div class="avatar">MB</div>
          <div><strong>Marina B.</strong><span>Sócia · agência com 18 contas</span></div>
        </div>
      </div>
      <div class="testimonial" data-reveal style="--reveal-delay:80ms">
        <blockquote>Migrei 11 clientes do meu CRM antigo num final de semana. Na segunda, o pipeline já estava se atualizando sozinho.</blockquote>
        <div class="testimonial-meta">
          <div class="avatar">RC</div>
          <div><strong>Rafael C.</strong><span>Diretor comercial · Performance B2B</span></div>
        </div>
      </div>
      <div class="testimonial" data-reveal style="--reveal-delay:160ms">
        <blockquote>O optimizer de mídia salvou um lançamento meu. Pausou 4 criativos no domingo e me explicou por quê na segunda.</blockquote>
        <div class="testimonial-meta">
          <div class="avatar">JT</div>
          <div><strong>Júlia T.</strong><span>Head de Mídia · agência paulistana</span></div>
        </div>
      </div>
    </div>

    <div class="kpis" data-reveal style="margin-top:40px">
      <div class="kpi"><div class="lbl">Ferramentas substituídas</div><div class="val">7+</div></div>
      <div class="kpi"><div class="lbl">Onboarding médio</div><div class="val">15 <small>min</small></div></div>
      <div class="kpi"><div class="lbl">Redução de retrabalho</div><div class="val">68%</div></div>
      <div class="kpi"><div class="lbl">Aumento de margem</div><div class="val">+3<small>p.p.</small></div></div>
    </div>
  </div>
</section>

<style>
  /* fallback caso .testimonial-grid não exista no styles.css — verificar primeiro */
  .testimonial-grid{display:grid;grid-template-columns:1fr;gap:20px;margin-top:32px}
  @media (min-width:768px){.testimonial-grid{grid-template-columns:repeat(3,1fr)}}
</style>
```

- [ ] **Step 2: Verificar**

Reload. 3 `.testimonial` + 4 `.kpi` elementos. Zero console errors. Screenshot mobile + desktop.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(home): depoimentos (3) + KPIs (4)"
```

---

## Task 7: Resumo de planos

**Files:**
- Modify: `index.html` (substituir o comentário `<!-- 6. Planos -->`)

> Usa o pattern de `.plan-card` que já existe no `styles.css` e no index antigo (linhas ~1096-1163).

- [ ] **Step 1: Inserir markup**

```html
<!-- 6. Resumo de planos -->
<section id="planos" class="section-band theme-light">
  <div class="container">
    <div class="sec-head" data-reveal>
      <span class="eyebrow"><span class="dot"></span> Preço honesto</span>
      <h2>Plano que <span class="display-glow">cresce com você.</span></h2>
      <p class="lede">Sem cartão · 14 dias grátis · Onboarding em 15 min · Cancele quando quiser.</p>
    </div>

    <div class="plans-grid">
      <article class="plan-card" data-reveal>
        <div class="plan-name">Solo</div>
        <div class="plan-price">R$ 297 <small>/mês</small></div>
        <p class="plan-desc">Freelancer ou consultor solo, até 5 clientes.</p>
        <ul class="plan-features">
          <li>1 usuário</li>
          <li>5 clientes ativos</li>
          <li>Suporte por e-mail</li>
        </ul>
        <a href="https://wa.me/5512991548086?text=Quero%20conhecer%20o%20plano%20Solo" target="_blank" rel="noopener" class="btn btn-ghost magnetic">Falar com a gente</a>
      </article>

      <article class="plan-card featured" data-reveal style="--reveal-delay:80ms">
        <span class="badge">Mais escolhido</span>
        <div class="plan-name">Estúdio</div>
        <div class="plan-price">R$ 697 <small>/mês</small></div>
        <p class="plan-desc">Agência boutique, até 25 clientes e 8 usuários.</p>
        <ul class="plan-features">
          <li>8 usuários</li>
          <li>25 clientes ativos</li>
          <li>Suporte prioritário</li>
          <li>Squad de IA inclusa</li>
        </ul>
        <a href="https://wa.me/5512991548086?text=Quero%20conhecer%20o%20plano%20Est%C3%BAdio" target="_blank" rel="noopener" class="btn btn-accent magnetic">Falar com a gente</a>
      </article>

      <article class="plan-card" data-reveal style="--reveal-delay:160ms">
        <div class="plan-name">Holding</div>
        <div class="plan-price">Sob consulta</div>
        <p class="plan-desc">Grupos com múltiplas agências, custom limits, white-label.</p>
        <ul class="plan-features">
          <li>Usuários ilimitados</li>
          <li>Clientes ilimitados</li>
          <li>Multi-tenant</li>
          <li>SLA dedicado</li>
        </ul>
        <a href="https://wa.me/5512991548086?text=Quero%20conhecer%20o%20plano%20Holding" target="_blank" rel="noopener" class="btn btn-ghost magnetic">Falar com a gente</a>
      </article>
    </div>
  </div>
</section>

<style>
  .plans-grid{display:grid;grid-template-columns:1fr;gap:20px;margin-top:40px}
  .plan-card.featured{border-color:var(--accent);background:rgba(69,118,255,.04);position:relative}
  .plan-card .badge{position:absolute;top:-12px;right:20px;background:var(--accent);color:#fff;font-size:11px;padding:4px 12px;border-radius:999px;font-family:var(--font-mono);text-transform:uppercase;letter-spacing:.08em}
  .plan-features{list-style:none;padding:0;margin:18px 0 24px}
  .plan-features li{padding:6px 0;font-size:14px;color:var(--text-2);border-top:1px solid rgba(255,255,255,.06)}
  .plan-features li:first-child{border-top:0}
  .plan-desc{font-size:14px;color:var(--text-3);margin-bottom:6px}
  @media (min-width:768px){.plans-grid{grid-template-columns:repeat(3,1fr)}}
</style>
```

- [ ] **Step 2: Verificar**

Reload. 3 `.plan-card` presentes. Estúdio com badge "Mais escolhido". Links WhatsApp resolvem. Zero errors. Screenshot.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(home): 3 planos (Solo R\$297, Estúdio R\$697 featured, Holding sob consulta)"
```

---

## Task 8: FAQ

**Files:**
- Modify: `index.html` (substituir o comentário `<!-- 7. FAQ -->` + atualizar JSON-LD FAQPage no head)

> Usa o pattern `.faq-item` / `<details>` que já existe.

- [ ] **Step 1: Inserir markup do FAQ**

```html
<!-- 7. FAQ brand-level -->
<section id="faq" class="section-band theme-light">
  <div class="container container-narrow">
    <div class="sec-head" data-reveal>
      <span class="eyebrow"><span class="dot"></span> Dúvidas</span>
      <h2>Perguntas que <span class="display-glow">todo mundo faz.</span></h2>
    </div>

    <div class="faq-list">
      <details class="faq-item" data-reveal>
        <summary>O que é a Balu?<span class="chev">⌄</span></summary>
        <p>Plataforma única com IA pra agências, e-commerces e prestadores de serviço. 3 produtos integrados em loop fechado: Balu Agência (operação completa), Balu CRM (atendimento omnichannel) e Balu Criação (sites white-label).</p>
      </details>
      <details class="faq-item" data-reveal>
        <summary>Posso usar só um dos produtos?<span class="chev">⌄</span></summary>
        <p>Sim — cada produto é vendido standalone. Mas o valor maior está no loop fechado completo, onde os 3 trocam dados entre si.</p>
      </details>
      <details class="faq-item" data-reveal>
        <summary>Quanto custa?<span class="chev">⌄</span></summary>
        <p>Solo R$ 297/mês, Estúdio R$ 697/mês (featured), Holding sob consulta. 14 dias grátis sem cartão.</p>
      </details>
      <details class="faq-item" data-reveal>
        <summary>Atende fora do Brasil?<span class="chev">⌄</span></summary>
        <p>Atualmente somente Brasil. Roadmap inclui expansão LATAM.</p>
      </details>
      <details class="faq-item" data-reveal>
        <summary>Migra dos meus sistemas atuais?<span class="chev">⌄</span></summary>
        <p>Migra. Import por CSV ou direto do WhatsApp. A gente acompanha a migração — onboarding guiado em torno de 15 min.</p>
      </details>
      <details class="faq-item" data-reveal>
        <summary>Tem fidelidade?<span class="chev">⌄</span></summary>
        <p>A gente fala disso de forma transparente na conversa de demo.</p>
      </details>
    </div>
  </div>
</section>

<style>
  .faq-list{margin-top:32px}
  .faq-item{border-bottom:1px solid rgba(255,255,255,.08)}
  .faq-item summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;padding:18px 0;font-weight:600;font-size:16px}
  .faq-item summary::-webkit-details-marker{display:none}
  .faq-item .chev{transition:transform .2s;color:var(--accent);font-size:18px}
  .faq-item[open] .chev{transform:rotate(180deg)}
  .faq-item p{padding:0 0 18px;color:var(--text-2);font-size:15px;line-height:1.55}
</style>
```

- [ ] **Step 2: Atualizar o JSON-LD `FAQPage` no `<head>` — substituir `"mainEntity":[]` por:**

```json
"mainEntity": [
  { "@type": "Question", "name": "O que é a Balu?", "acceptedAnswer": { "@type": "Answer", "text": "Plataforma única com IA pra agências, e-commerces e prestadores de serviço. 3 produtos integrados em loop fechado: Balu Agência, Balu CRM e Balu Criação." } },
  { "@type": "Question", "name": "Posso usar só um dos produtos?", "acceptedAnswer": { "@type": "Answer", "text": "Sim, cada produto é vendido standalone. Mas o valor maior está no loop fechado completo." } },
  { "@type": "Question", "name": "Quanto custa?", "acceptedAnswer": { "@type": "Answer", "text": "Solo R$ 297/mês, Estúdio R$ 697/mês, Holding sob consulta. 14 dias grátis sem cartão." } },
  { "@type": "Question", "name": "Atende fora do Brasil?", "acceptedAnswer": { "@type": "Answer", "text": "Atualmente somente Brasil. Roadmap inclui expansão LATAM." } },
  { "@type": "Question", "name": "Migra dos meus sistemas atuais?", "acceptedAnswer": { "@type": "Answer", "text": "Sim. Import por CSV ou direto do WhatsApp. A gente acompanha a migração — onboarding em torno de 15 min." } },
  { "@type": "Question", "name": "Tem fidelidade?", "acceptedAnswer": { "@type": "Answer", "text": "A gente fala disso de forma transparente na conversa de demo." } }
]
```

- [ ] **Step 3: Verificar**

Reload. 6 `<details>` presentes. Validar JSON-LD: `[...document.querySelectorAll('script[type="application/ld+json"]')].map(s=>{try{JSON.parse(s.textContent);return 'ok'}catch(e){return 'ERR:'+e.message}})` → todos 'ok'. Clicar pra abrir/fechar um `<details>` deve funcionar nativamente.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat(home): FAQ brand-level (6 perguntas) + FAQPage schema"
```

---

## Task 9: CTA final + contato

**Files:**
- Modify: `index.html` (substituir o comentário `<!-- 8. CTA final -->`)

- [ ] **Step 1: Inserir markup**

```html
<!-- 8. CTA final + contato -->
<section class="cta-final section-band">
  <div class="container container-narrow" style="text-align:center">
    <h2 data-reveal>Pronto pra <span class="display-glow">começar?</span></h2>
    <p class="lede" data-reveal style="--reveal-delay:80ms;margin:18px auto 32px;max-width:48ch">Conversa de 15 min. A gente entende sua operação e indica o produto certo.</p>
    <div class="cta-actions" data-reveal style="--reveal-delay:160ms">
      <a href="https://wa.me/5512991548086?text=Ol%C3%A1%2C%20quero%20conhecer%20a%20Balu" target="_blank" rel="noopener" class="btn btn-accent magnetic">
        Falar com a gente no WhatsApp
        <svg class="arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 7h8m0 0L7 3m4 4l-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </a>
      <a href="mailto:contato@balu.com.br" class="btn btn-ghost magnetic">E-mail · contato@balu.com.br</a>
    </div>
    <p class="address" data-reveal style="--reveal-delay:240ms">
      <small>Sapiens Parque · Av. Luiz Boiteux Piazza 1302 · Canasvieiras · Florianópolis, SC</small>
    </p>
  </div>
</section>

<style>
  .cta-final{text-align:center}
  .cta-actions{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-bottom:32px}
  .address{font-size:13px;color:var(--text-3)}
</style>
```

- [ ] **Step 2: Verificar**

Reload. 2 CTAs (WhatsApp + email) visíveis e clicáveis. Zero console errors. Screenshot.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(home): CTA final (WhatsApp + email) + endereço"
```

---

## Task 10: Rodapé

**Files:**
- Modify: `index.html` (substituir o comentário `<!-- 9. Footer -->`)

- [ ] **Step 1: Inserir markup do footer (FORA de `<main>`)**

```html
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-col footer-brand">
        <a href="/" class="brand" aria-label="Balu home">
          <img src="assets/logo-white.svg" alt="Balu" height="32" />
        </a>
        <p class="footer-tagline">Plataforma única com IA pra agências, e-commerces e prestadores de serviço.</p>
      </div>
      <div class="footer-col">
        <h4>Produtos</h4>
        <ul>
          <li><a href="https://lp.baluhub.com.br/agencia">Balu Agência</a></li>
          <li><a href="https://lp.baluhub.com.br/crm">Balu CRM</a></li>
          <li><a href="/criacao">Balu Criação</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Comparativos</h4>
        <ul>
          <li><a href="/balu-vs-mlabs">Balu vs mLabs</a></li>
          <li><a href="/balu-vs-rdstation">Balu vs RD Station</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Empresa</h4>
        <ul>
          <li><a href="/blog">Blog</a></li>
          <li><a href="https://wa.me/5512991548086" target="_blank" rel="noopener">WhatsApp</a></li>
          <li><a href="mailto:contato@balu.com.br">contato@balu.com.br</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Legal</h4>
        <ul>
          <li><a href="/politica-de-privacidade">Privacidade</a></li>
          <li><a href="/termos-de-uso">Termos</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2026 Balu · Florianópolis, SC · Sapiens Parque</p>
    </div>
  </div>
</footer>

<style>
  .site-footer{background:rgba(0,0,0,.2);border-top:1px solid rgba(255,255,255,.06);padding:48px 0 24px;margin-top:48px}
  .footer-grid{display:grid;grid-template-columns:1fr;gap:32px;margin-bottom:32px}
  .footer-brand .brand{display:inline-block;margin-bottom:14px}
  .footer-tagline{font-size:14px;color:var(--text-3);line-height:1.55}
  .footer-col h4{font-family:var(--font-mono);font-size:12px;text-transform:uppercase;letter-spacing:.1em;color:var(--text-3);margin-bottom:14px}
  .footer-col ul{list-style:none;padding:0;margin:0}
  .footer-col li{margin-bottom:8px}
  .footer-col a{color:var(--text-2);font-size:14px;text-decoration:none;transition:color .2s}
  .footer-col a:hover{color:var(--text)}
  .footer-bottom{padding-top:24px;border-top:1px solid rgba(255,255,255,.06);font-size:13px;color:var(--text-3);text-align:center}
  @media (min-width:768px){.footer-grid{grid-template-columns:2fr 1fr 1fr 1fr 1fr}}
</style>
```

- [ ] **Step 2: Verificar**

Reload. Footer visível com 5 colunas no desktop, empilhado no mobile. Todos os links resolvem. Zero console errors. Screenshot full-page.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(home): rodapé completo (produtos, comparativos, empresa, legal)"
```

---

## Task 11: Mudanças colaterais (llms.txt + ajustes nav em crm.html/criacao.html)

**Files:**
- Modify: `llms.txt` (atualizar descrição inicial)
- Modify: `crm.html`, `criacao.html` (conferir/ajustar links pra `/`)
- Modify: `sitemap.xml` (atualizar `lastmod` da entry `/`)

- [ ] **Step 1: Atualizar `llms.txt` — linha inicial**

Localizar a linha 3 atual:
```
> Plataforma única com IA para gestão de agências de marketing. Une CRM, projetos, financeiro, criação e Squad de IA num só loop fechado. Substitui de 5 a 7 ferramentas (mLabs, RD Station, ClickUp, Asana, Trello, planilhas).
```

Trocar por:
```
> Balu é uma plataforma com IA pra agências, e-commerces e prestadores de serviço. 3 produtos integrados em loop fechado: Agência (CRM + projetos + financeiro + IA), CRM (atendimento omnichannel com WhatsApp + agentes IA + pipeline) e Criação (sites e LPs white-label com SEO + GEO).
```

- [ ] **Step 2: Conferir nav em `crm.html` e `criacao.html`**

Run: `grep -nE 'href="/"|>Balu Agência<|href="/agencia"' /root/balu-site-1/crm.html /root/balu-site-1/criacao.html`

Esperado: links pra `/` que digam algo como "Balu Agência" ou "Home" — esses precisam de atenção, porque `/` agora é institucional Balu, não produto Agência.

Decisão prática:
- Se a label disser **"Home"** ou **"Balu"** → manter, está OK (agora aponta pro institucional Balu correto)
- Se disser **"Balu Agência"** especificamente → trocar o `href` pra `https://lp.baluhub.com.br/agencia` (a LP do produto Agência) E manter a label "Balu Agência"
- Outro caso → reportar e perguntar

- [ ] **Step 3: Atualizar `sitemap.xml` — `lastmod` da entry `/`**

Localizar:
```xml
<url>
  <loc>https://baluhub.com.br/</loc>
  <lastmod>2026-05-17</lastmod>
```

Trocar `2026-05-17` por `2026-05-29`.

- [ ] **Step 4: Verificar**

Run: `python3 -c "import json; json.load(open('vercel.json'))"` (sanity check — não deveria mexer mas garantir). 
Curl `/llms.txt` local — confirmar primeira linha atualizada.

- [ ] **Step 5: Commit**

```bash
git add llms.txt crm.html criacao.html sitemap.xml
git commit -m "chore(site): ajustes colaterais pós-home brand-umbrella (llms.txt, nav cross-link, sitemap lastmod)"
```

---

## Task 12: QA final completo

**Files:**
- Nenhum (só verificação e commit final se houver fix)

- [ ] **Step 1: QA completo via Playwright em `http://localhost:8080/index.html`**

Executar e RECORDAR resultados:

1. **Console:** `browser_console_messages` — zero JS errors (warnings de fonts/preload aceitáveis).
2. **Network:** `browser_network_requests` — confirmar nenhum 404 em asset first-party (`assets/styles.css`, `assets/main.js`, `assets/logo-white.svg`, `assets/screenshots/agencia-dashboard.png`, `assets/screenshots/crm-conversations.png`, `og-image-criacao.png`, `assets/fonts/cal-sans-latin-400.woff2`).
3. **Single h1:** `document.querySelectorAll('h1').length === 1`.
4. **Section counts:** 9 seções no `<main>` (hero, produtos, manifesto, logos, depoimentos, planos, faq, cta-final) + footer fora do main. Confirmar pela presença de `id="produtos"`, `id="planos"`, `id="faq"`.
5. **JSON-LD:** os 4 nodos do `@graph` parsam corretamente — `[...document.querySelectorAll('script[type="application/ld+json"]')].map(s=>{try{const j=JSON.parse(s.textContent);return j['@graph']?.length||0}catch(e){return 'ERR'}})` → deve retornar `[4]` (Organization, WebSite, ItemList, FAQPage com 6 entries).
6. **Links externos resolvem:** os 3 cards de produto e o footer apontam pras URLs corretas (`lp.baluhub.com.br/agencia`, `lp.baluhub.com.br/crm`, `/criacao`).
7. **Mobile 390 + desktop 1280:** fullPage screenshots, conferir layout.
8. **Mobile overflow:** `document.documentElement.scrollWidth - clientWidth === 0`.
9. **Outras páginas intactas:** `curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/crm.html` → 200; mesmo pra `criacao.html`, `agencia.html`, `lp-crm.html`, `politica-de-privacidade.html`.

- [ ] **Step 2: Se QA passar, sem commit necessário (todos os anteriores cobriram). Se algo falhar, fix + commit.**

```bash
# se houver fix:
git add <arquivo>
git commit -m "fix(home): <descrição do fix>"
```

---

## Pós-implementação (manual, fora do código — para o Eduardo)

1. **OG image brand-level:** criar imagem 1200×630 com logo Balu + texto "Plataforma com IA pra agências, e-commerce e serviços" → substituir `og-image.png`. Até lá, o preview no WhatsApp continua mostrando a OG atual ("Pare de gerenciar planilha…").
2. **Foto do founder Eduardo:** se quiser substituir o avatar "EB" por foto real, basta trocar o `<span class="founder-avatar">EB</span>` por `<img src="assets/founder-eduardo.jpg" class="founder-avatar" alt="Eduardo Bovo">`.
3. **Logos visuais dos clientes:** atualmente os nomes são wordmarks de texto. Se conseguir logos vetoriais SVG dos clientes, substituir os `<span class="client-name-large">` por `<img>` no marquee.
4. **Deploy:** após validar local, fazer `git push origin master` — Vercel deploya automaticamente em `baluhub.com.br/`.

---

## Self-Review (preenchido)

**Cobertura do spec:**
- Hero institucional (Task 2) ✓
- 3 produtos em destaque (Task 3) ✓
- Manifesto/quem é a Balu (Task 4) ✓
- Logos clientes (Task 5) ✓
- Depoimentos + KPIs (Task 6) ✓
- Resumo de planos (Task 7) ✓
- FAQ brand-level + schema (Task 8) ✓
- CTA final + contato (Task 9) ✓
- Rodapé (Task 10) ✓
- llms.txt + ajustes nav + sitemap (Task 11) ✓
- QA final (Task 12) ✓

Sem lacunas em relação ao spec. ✔

**Placeholders proibidos:** Os "TODO" são apenas os 3 placeholders pós-implementação documentados (OG image brand, foto founder, logos visuais dos clientes). Não há "implement later" ou "add error handling" sem código. Cada step tem markup concreto. ✔

**Consistência de tipos/nomes:**
- `.produto-card` / `.produtos-grid` (Task 3) — classes novas, consistentes
- `.testimonial` / `.testimonial-grid` / `.kpis` / `.kpi` — reusa do styles.css
- `.plan-card` / `.plans-grid` — reusa do styles.css
- `.faq-item` / `<details>` — reusa do styles.css
- WhatsApp `wa.me/5512991548086` (institucional Balu) consistente em todos os links — distinto de `wa.me/5543991086610` (Michel, usado só nas LPs de conversão).
- `data-reveal` consistente em todas as sections (GSAP scroll trigger já wireado em main.js).
✔
