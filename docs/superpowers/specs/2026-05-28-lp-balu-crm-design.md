# LP de Conversão — Balu CRM (design)

**Data:** 2026-05-28
**Autor:** Eduardo + Claude
**Status:** aprovado para implementação (aguardando revisão final do spec)
**Spec irmão:** [2026-05-27-lp-balu-agencia-design.md](2026-05-27-lp-balu-agencia-design.md) — referência para decisões compartilhadas

## Objetivo

Landing page de conversão **mobile-first** para o **Balu CRM**, voltada a **tráfego pago (Meta Ads)** com público **solution-aware** (empresa/agência que perde lead no WhatsApp). Framework dominante de copy: **BAB (Before/After/Bridge)**. CTA primário único: **WhatsApp direto com o Michel**. CTA secundário ("porta lateral"): tripwire **"Eugência em 7 Dias" (R$47)**.

Distinta da home institucional do CRM ([crm.html](../../../crm.html)) em `baluhub.com.br/crm`, que continua intacta.

## Decisões fechadas (brainstorming)

| Tema | Decisão |
|------|---------|
| URL canônica | `https://lp.baluhub.com.br/crm` — atendida por **Vercel rewrite host-scoped**: quando `host=lp.baluhub.com.br` e `path=/crm`, serve `/lp-crm.html`. Apex `baluhub.com.br/crm` segue institucional, intacto. |
| Arquitetura CSS | **Linkar `agencia.css?v=5` + `crm.css?v=1`**. Compartilha tokens/fontes/botões/marquee/efeitos/ritmo via agencia.css; crm.css traz APENAS o que é específico do CRM (Before/After, ponte, casos-uso) + 4 overrides de background pro ritmo correto na ordem do CRM. |
| WhatsApp | Mesmo número do Michel: **+55 43 99108-6610** (`wa.me/5543991086610`). Texto base: `"Olá Michel, vim da página do Balu CRM e quero parar de perder lead no WhatsApp."` |
| Tracking | Mesmos placeholders `TODO_PIXEL_ID` / `TODO_GA4_ID` (Pixel + GA4 compartilham IDs entre as duas LPs — uma conta, duas páginas). Eventos exclusivos: `whatsapp_click_crm` e `tripwire_click_crm` (separar a medição das duas LPs). |
| Tripwire R$47 | Placeholder `href="#"` (mesmo modelo). |
| Depoimentos | **Rafael C.** como card destaque (perfeito: "Migrei 11 clientes do meu CRM antigo num final de semana") — reusado da Agência. Marina B. + Júlia T. como cards secundários (genéricos pra Balu, válidos por enquanto, TODO trocar quando houver depoimentos CRM-específicos). |
| Logos | Mesmos wordmarks da Agência (consistência: são os mesmos clientes da Balu). |
| Efeito CRM-específico | **Pop-in animado de ✓ em cada item DEPOIS** do Before/After + bordas laterais coloridas (vermelho/verde) — comunica "transformação confirmada" item a item. |

## Arquivos

**Novos (não alteram o institucional crm.html nem a LP da Agência):**
- `lp-crm.html` — markup semântico da LP
- `assets/crm.css` — só o que é específico do CRM (Before/After + ponte + casos-uso + bg overrides)
- `assets/crm.js` — comportamento da LP (WhatsApp+UTM com texto CRM, tracking events `*_crm`, reveal/stagger, sticky, count-up, scroll progress — todos copiados do agencia.js pra manter LPs independentes)
- `vercel.json` — adicionar entrada `rewrites` host-scoped

**Reaproveitados:**
- `assets/agencia.css?v=5` — tokens, fontes, base, botões, marquee, hero, efeitos, ritmo
- Fontes: Cal Sans (woff2 self-hosted) + Manrope + JetBrains Mono (mesmos links)
- Screenshots: `assets/screenshots/crm-*.png` (7 imagens: dashboard, conversations, agents, pipeline, proposals, automations, clients)
- Logos: `assets/portfolio/*.png` (mesmos wordmarks de texto — não usamos as imagens)
- `og-image-crm.png` (já existe), `favicon.svg`, `assets/logo-gradient.svg`

## Tokens / tipografia / botões

**Não declarados aqui** — herdados 100% do `agencia.css`. Resumo do que se aplica:
- Paleta: branco/dark/surface/border, azul Balu `#1F88C2` (+ deep/light/bg), CTA laranja `#C94E1E` (WCAG AA), danger `#E05252`, success `#22C87A`.
- Tipografia: **Cal Sans** semibold (h1/h2/h3), **Manrope** (corpo/UI), **JetBrains Mono** (eyebrows). H1 30–36px mobile / 48–56px desktop.
- Botões: `.btn-cta` (laranja AA, shine no hover) e `.btn-secondary` (outline azul) prontos.

## Anatomia da página (ordem)

0. **Barra de urgência** (header `.site-banner`): "⚡ Configuração assistida do seu WhatsApp inclusa · Fale com o Michel →"
1. **Hero** (`.hero`): eyebrow "CRM OMNICHANNEL COM IA"; H1 (**único**) "Pare de perder lead no WhatsApp."; subtítulo com **Agentes de IA** em negrito; CTA WhatsApp "Quero conversar com o Michel"; microcopy "Conversa de 15 min · Sem compromisso · Resposta em até 1h"; link discreto "Ver como funciona ↓"; mockup [crm-conversations.png](../../../assets/screenshots/crm-conversations.png) dentro da `.browser-frame` herdada.
   - **Stats:** 6 canais num inbox · IA 24/7 · 5 min = 21x mais chance de fechar.
2. **Logo bar** (`.logobar`): "Empresas que pararam de perder lead:" + marquee dos 7 wordmarks.
3. **Before / After ⭐** (`.before-after`): eyebrow "ANTES E DEPOIS"; H2 "Como é hoje. Como fica com a Balu."; 2 colunas (mobile: stack), cada uma com 6 itens. ANTES (`--danger`, ícone `×`): WhatsApp 800 não-lidos · Lead esfria 6h · Pipeline em planilha · Fora do horário, lead fala sozinho · Proposta no Word · "Em que pé está o cliente X?". DEPOIS (`--success`, ícone `✓` pop-in): Inbox unificado · IA responde na hora · Pipeline Kanban + Sales Assist · RAG 24/7 · Proposta+assinatura por IA · Lead scoring Hot/Warm/Cold.
4. **A Ponte** (`.ponte`): eyebrow "COMO FUNCIONA"; H2 "Da bagunça ao Loop Fechado em 3 passos."; 3 cards numerados:
   1. Conecta os canais (WhatsApp Cloud, UazAPI, Instagram, Messenger, e-mail, marketplaces)
   2. A IA atende e qualifica (RAG, Claude/GPT/Gemini, handoff)
   3. O pipeline fecha (Sales Assist + proposta)
5. **Demonstração** (`.demo`): eyebrow "VEJA FUNCIONANDO"; H2 "O CRM rodando de verdade."; grid de 3 screenshots anotados: agents (Squad de IA respondendo), pipeline (Kanban + scoring), proposals (proposta+assinatura). Sem vídeo (TODO opcional).
6. **Funcionalidades** (`.beneficios` — reusa estilo): eyebrow "TUDO QUE VOCÊ PRECISA"; H2 "Atendimento, vendas e IA no mesmo lugar."; grid de 8 cards: Inbox unificado, Agentes IA com RAG, Sales Assist, Pipeline visual, Propostas+assinatura, Campanhas WhatsApp, Automações, Marketplaces (ML/Shopee/TikTok Shop).
7. **Casos de uso** (`.casos-uso`): eyebrow "FEITO PRA VOCÊ"; H2 "Funciona pro seu tipo de operação."; 3 cards: Agência (white-label/multi-tenant), E-commerce (marketplaces+WhatsApp+IA, recupera carrinho), Serviços/Vendas consultivas (pipeline+proposta+follow-up).
8. **Depoimentos** (`.depoimentos`): eyebrow "QUEM JÁ USA"; H2 "Lead que entra, lead que não escapa."; card destaque "11 clientes" (Rafael C.); cards Marina B. + Júlia T.; 4 KPIs ilustrativos: 11 clientes / 70% qualificação IA / 24/7 atendimento / 1 inbox.
9. **Comparativo** (`.comparativo`): H2 "Por que não um CRM qualquer?"; tabela 2 colunas (❌ CRM genérico vs ✅ Balu CRM), 5 linhas: WhatsApp nativo · Inbox+pipeline+IA juntos · Agentes RAG · Proposta+assinatura nativa · Marketplaces com IA.
10. **Oferta dupla** (`.oferta`): "Dois jeitos de começar." Bloco principal (`.oferta-main`) "Converse com o Michel" + CTA + microcopy ("Sem compromisso · Configuração assistida inclusa"). Bloco secundário (`.oferta-side`) "Ainda não está pronto?" + **Eugência em 7 Dias R$47** + CTA placeholder + bumps/upsell.
11. **FAQ** (`.faq`): 8 perguntas do briefing (WhatsApp atual, IA sozinha, multi-canais, migra contatos, modelo IA, custo, white-label, fidelidade) + atualizar `FAQPage` schema.
12. **CTA final** (`.cta-final`): H2 "Seu próximo lead não vai escapar."; CTA WhatsApp + link tripwire.
- **Rodapé** (`.site-footer`): idêntico ao Agência.
- **Sticky CTA mobile** (`.sticky-cta`): "Falar com o Michel no WhatsApp" — barra fixa pós-hero.

## Ritmo de fundo (em `crm.css`)

Alterna branco/cinza sem dois iguais adjacentes:
- Novas seções: `.before-after`(white), `.ponte`(surface+glow), `.casos-uso`(white).
- Overrides em `crm.css` para alinhar com a ordem do CRM: `.depoimentos`(surface), `.comparativo`(white), `.oferta`(surface+glow), `.faq`(white).
- Herdados sem override: `.hero` (white+mesh), `.logobar` (surface), `.demo` (white), `.beneficios` (surface), `.cta-final` (gradiente).

## Efeitos

**Herdados** (via `agencia.css` + lógica em `crm.js`):
- Hero: browser frame + glow + float
- Count-up nos números (stats hero + KPIs)
- Marquee contínuo de wordmarks
- Micro: hover lift em cards, shine no CTA, pulse no sticky, FAQ suave, stagger reveal, scroll progress bar
- Todos com `prefers-reduced-motion` (já implementado)

**CRM-específico** (em `crm.css` + leve marcação no HTML):
- Cada item DEPOIS do Before/After tem um `<span class="check-pop">✓</span>` que faz scale 0→1 com leve overshoot quando a coluna entra na viewport (CSS animation com delay calculado pelo nth-child).
- Cada item ANTES tem um `<span class="cross-mark" aria-hidden="true">×</span>` discreto na borda esquerda.
- Borda esquerda colorida nos dois lados (3px solid danger/success).
- Reduced-motion: pop-in vira fade; cores/bordas mantidas.

## Comportamento JS (`crm.js`, defer)

1. **WhatsApp + UTM**: base `wa.me/5543991086610`, texto "Olá Michel, vim da página do Balu CRM e quero parar de perder lead no WhatsApp." + `[utms]`.
2. **Tracking**: eventos `whatsapp_click_crm` / `tripwire_click_crm` (guardas `typeof fbq/gtag`).
3. **Reveal + stagger**: copiado do agencia.js (IntersectionObserver, transitionDelay temporário por nth-child).
4. **Sticky CTA mobile**: copiado.
5. **Count-up**: copiado.
6. **Scroll progress**: copiado.

## Vercel rewrite (vercel.json)

Adicionar antes (ou junto com) o `headers`:

```jsonc
"rewrites": [
  {
    "source": "/crm",
    "has": [{ "type": "host", "value": "lp.baluhub.com.br" }],
    "destination": "/lp-crm.html"
  }
]
```

- Em `baluhub.com.br/crm`: institucional intacto (não casa a regra).
- Em `lp.baluhub.com.br/crm`: serve `lp-crm.html` (LP de conversão).
- Em `baluhub.com.br/lp-crm`: também serve a LP (URL de "backup"/teste no apex). Aceitável.

## Performance / acessibilidade

Mesmas metas: LCP<2,5s · INP<200ms · CLS<0,1 · WCAG AA · tap targets ≥48px · 1 único `<h1>` · landmarks · fontes display=swap · scripts defer · imgs com width/height + lazy abaixo da dobra.

## SEO / meta

- `<title>`: "Balu CRM — Pare de perder lead no WhatsApp. CRM com IA omnichannel"
- `<meta description>`: conforme briefing.
- Canonical: `https://lp.baluhub.com.br/crm`.
- OG: `og-image-crm.png` (já existe). Twitter Card idem.
- Schema.org: `Organization` + `Product` + `FAQPage` (8 questions).
- `robots`: `index, follow`.
- Adicionar entrada no `sitemap.xml`.

## O que esta LP NÃO tem

Navbar · mais de um CTA primário · carrossel/tabs · vídeo autoplay com som · chat flutuante · form longo · copy corporativo.

## Placeholders / TODOs

1. `TODO_PIXEL_ID` / `TODO_GA4_ID` (compartilhados com Agência)
2. Link de checkout do tripwire R$47
3. Depoimentos CRM-específicos (Marina/Júlia são genéricos por enquanto)
4. KPIs reais (11/70%/24/7/1 são ilustrativos)
5. Subdomínio `lp.baluhub.com.br` configurado na Vercel + CNAME no DNS (sem isso, a URL `lp.baluhub.com.br/crm` não resolve — mas o `/lp-crm` no apex já funciona como teste)
6. Vídeo de demonstração do CRM (opcional)

## Fora de escopo (v1)

- Subdomínio/DNS (config de painel).
- Vídeo demo do CRM, OG-image exclusiva (a existente serve).
- A/B test do H1 (variação B fica anotada como comentário).
- Refatorar `agencia.css` → `lp-shared.css` (deixar pra depois quando estabilizar).
