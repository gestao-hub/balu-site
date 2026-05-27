# LP de Conversão — Balu Agência (design)

**Data:** 2026-05-27
**Autor:** Eduardo + Claude
**Status:** aprovado para implementação (aguardando revisão final do spec)

## Objetivo

Landing page de conversão **mobile-first** para o **Balu Agência**, voltada a **tráfego pago (Meta Ads)** com público problem-aware (dono de agência no "Frankenstack"). CTA primário único: **WhatsApp direto com o Michel** (venda consultiva). CTA secundário ("porta lateral"): tripwire **"Eugência em 7 Dias" (R$47)**.

Distinta da home institucional ([index.html](../../../index.html)), que continua intacta.

## Decisões fechadas (brainstorming)

| Tema | Decisão |
|------|---------|
| Direção visual | **Híbrido**: base clara (converte melhor em tráfego frio) + azul Balu como marca + laranja **só** no CTA WhatsApp. Tipografia do site (Instrument Serif + DM Sans + JetBrains Mono). |
| Arquitetura | **Abordagem A — página standalone com CSS/JS próprios.** Não toca em nada existente. |
| URL | Arquivo `agencia.html` → URL `/agencia` (via `cleanUrls` da Vercel). Canônica: `https://lp.baluhub.com.br/agencia`. Subdomínio `lp.baluhub.com.br` é config de Vercel + DNS (CNAME), **fora do código** — documentado no fim. |
| WhatsApp | Número do Michel: **+55 43 99108-6610** → `wa.me/5543991086610` (diferente do número do site institucional). |
| Tripwire R$47 | Bloco construído com **link placeholder** (`href="#"` + `<!-- TODO: checkout -->`). |
| Tracking | **Scaffold com placeholder**: Meta Pixel + GA4 + eventos, IDs como `TODO_PIXEL_ID`/`TODO_GA4_ID`. |
| Depoimentos | Reaproveitar os 3 já existentes no site (Marina B., Rafael C., Júlia T.) + KPIs (7+ / 15min / 68% / +3 p.p.). |
| Logos de clientes | Usar os logos **reais** em `assets/portfolio/` (Vivacqua, Sea Hop, Esa Energia, Upperground, Bangalô, Tiago Mônaco, Piper Hub), não a lista textual do briefing. |
| Vídeo | `balu-promo-narrado.mp4` (raiz) como peça central da seção de demonstração — **clique-pra-tocar, sem autoplay com som**, com poster. Screenshots anotados como reforço. |

## Arquivos

**Novos (isolados — não alteram páginas existentes):**
- `agencia.html` — markup semântico da LP
- `assets/agencia.css` — tema claro próprio (tokens abaixo)
- `assets/agencia.js` — WhatsApp+UTM, sticky CTA, reveal, tracking
- Atualizar `sitemap.xml` (adicionar `/agencia`) — opcional, confirmar

**Reaproveitados:**
- Fontes: Inter/DM Sans/JetBrains Mono via Google/Bunny (mesmos `<link>` do index) + Instrument Serif
- Screenshots: `assets/screenshots/agencia-*.png`
- Logos: `assets/portfolio/*.png`
- Vídeo: `balu-promo-narrado.mp4`
- `favicon.svg`, `og-image.png` (fallback), `assets/logo-*.svg`

## Design tokens (`:root` em agencia.css)

```css
--bg-base:#FFFFFF; --bg-dark:#0A1628; --bg-surface:#F5F7FB; --border:#E2E8F0;
--primary:#1F88C2; --primary-deep:#14507E; --primary-light:#2FA3D9; --primary-bg:rgba(31,136,194,.10);
--cta:#FF6B35; --cta-hover:#E85A28;
--danger:#E05252; --success:#22C87A;
--text-primary:#0A1628; --text-secondary:#5A6B82; --text-muted:#94A3B8;
--text-on-dark:#F0F4FA; --text-secondary-on-dark:#94A3B8;
--radius-sm:8px; --radius-md:12px; --radius-lg:16px; --radius-xl:24px;
```

**Tipografia:** Instrument Serif (italic display H1/H2 destaque) · DM Sans (corpo/UI) · JetBrains Mono (eyebrows/labels). H1 30–36px mobile / 48–56px desktop, peso 800, line-height 1.15. Body 16–18px, line-height 1.6. Eyebrow 12–13px uppercase, letter-spacing .1em, cor primary.

**Botões:** CTA primário laranja (`--cta`, texto branco, peso 700, padding 16/28, radius 12, ícone WhatsApp à esquerda, 100% largura no mobile). CTA secundário: borda `--primary` sobre `--primary-bg`. Tap targets ≥ 48×48px.

## Anatomia da página (ordem)

0. **Barra de urgência** (sticky top, ~40px, `--primary-deep`): "⚡ Onboarding guiado gratuito para as próximas agências · Fale com o Michel →"
1. **Hero** — eyebrow "PARA DONOS DE AGÊNCIA DE 4 A 25 PESSOAS"; H1 (**único da página**): "Saia do Frankenstack. Opere sua agência inteira numa só plataforma."; subtítulo com **Loop Fechado** destacado; CTA WhatsApp "Quero conversar com o Michel"; microcopy "Conversa de 15 min · Sem compromisso · Resposta em até 1h no horário comercial"; link discreto "Ver planos e como funciona ↓"; mockup `agencia-dashboard.png`.
   - **Strip de 3 stats:** 10+ ferramentas substituídas · 8 regras de otimização 24/7 · 1 plataforma.
2. **Logo bar** — "Agências que já operam em Loop Fechado:" + marquee horizontal de logos reais (`portfolio/`).
3. **Problema/Agitação (PAS)** — H2 "Você não tem uma agência. Você tem 12 abas abertas."; storyselling (sexta 18h…); bloco visual "Frankenstack" (grid de ícones/nomes de tools soltas com X vermelho, em faixa escura `--bg-dark`); palavra-âncora "Isso tem nome: **Frankenstack**." (`--danger`); 3 cards de dor (planilhas, ferramentas que não conversam, "virou gerente da própria agência").
4. **Solução — Método BALU** — eyebrow "O MÉTODO BALU"; H2 "Quatro camadas. Um Loop Fechado."; 4 cards em sequência (Captação → Conversão → Entrega [Squad de IA] → Insight [Estrategista IA]) com indicador visual de loop fechado Insight→Captação.
5. **Demonstração** — eyebrow "VEJA FUNCIONANDO"; H2 "Não é promessa. É a plataforma rodando."; **vídeo `balu-promo-narrado.mp4`** (poster, controls, sem autoplay) + 2–3 screenshots anotados (`agencia-campanhas`, `agencia-agentes`, `agencia-financeiro`/`agencia-calendario`), cada um com legenda de outcome.
6. **Benefícios (outcomes)** — eyebrow "TUDO NUM SÓ LUGAR"; H2 "7 ferramentas. 1 Balu."; grid de 8 cards (Meta+Google nativos, Optimizer autônomo, Squad de IA, Cobrança automática, SEO auto-fix, Monitor de concorrentes, Portal do cliente, Estrategista IA) — cada um com "(substitui: …)".
7. **Depoimentos** — eyebrow "QUEM JÁ ESTÁ DENTRO"; H2 "Resultado real de quem saiu do caos."; card destaque "60 dias"; 3 depoimentos reais; grid de 4 KPIs.
8. **Comparativo** — eyebrow "A DIFERENÇA"; H2 "Quem ainda joga o antigo. Quem usa a Balu."; tabela 2 colunas (❌ Frankenstack vs ✅ Balu), 6 linhas do briefing.
9. **Oferta dupla** — eyebrow "COMECE AGORA"; H2 "Dois jeitos de começar." Bloco principal (destaque) "Converse com o Michel" + CTA WhatsApp grande + microcopy ("Sem compromisso · Resposta em até 1h · Migração assistida inclusa"). Bloco secundário (menor) "Ainda não está pronto para conversar?" → **Eugência em 7 Dias (R$47)** + CTA secundário (placeholder checkout) + menção a order bumps (17 templates de proposta IA · Comunidade VIP) e upsell (challenge ao vivo R$197). **Tripwire sempre depois do CTA WhatsApp.**
10. **FAQ** — eyebrow "DÚVIDAS"; H2 "Perguntas que todo dono de agência faz."; accordion nativo `<details>/<summary>`, 8 itens do briefing.
11. **CTA final** — H2 "Próxima semana. Sem caos."; subtítulo; CTA WhatsApp repetido + link tripwire.
- **Rodapé** — logo Balu, links (Privacidade, Termos, baluhub.com.br), © 2026 Balu · Florianópolis, SC.
- **Sticky CTA mobile** — barra fixa rodapé com botão WhatsApp; aparece após rolar além do hero; oculto no desktop.

## Comportamento (agencia.js, `defer`)

1. **WhatsApp + UTM:** base `https://wa.me/5543991086610?text=<encoded>`. Texto base: "Olá Michel, vim da página do Balu Agência e quero entender como sair do Frankenstack." Lê `window.location.search`; se houver params, anexa ` [<querystring>]` ao texto. Aplica a href em todos os `[data-wa]`.
2. **Sticky CTA mobile:** mostra `.sticky-cta` quando `scrollY > altura do hero`; só no breakpoint mobile (≤768px).
3. **Reveal on scroll:** `IntersectionObserver` (threshold .1) adiciona `.visible` a `.reveal`, com fallback para `prefers-reduced-motion`.
4. **FAQ:** nativo (sem JS); chevron via CSS `details[open]`.
5. **Tracking:** Meta Pixel + GA4 no `<head>` com IDs placeholder. No clique: `fbq('trackCustom','WhatsAppClickAgencia')` + `gtag('event','whatsapp_click_agencia')`; idem `tripwire_click_agencia`. Tudo com guarda `typeof fbq !== 'undefined'`.

## Performance & acessibilidade (metas)

- LCP < 2,5s · INP < 200ms · CLS < 0,1.
- Imagens com `width`/`height` explícitos + `loading="lazy"` abaixo da dobra; vídeo com `preload="none"` + poster.
- Fonts `display=swap`; scripts `defer`.
- 1 único `<h1>`; hierarquia H2/H3 sem pular nível; landmarks `<main>`/`<nav>`/`<footer>`; contraste WCAG AA; tap targets ≥48px; body ≥16px.

## SEO / meta

- `<title>`: "Balu Agência — Saia do Frankenstack e opere sua agência em uma só plataforma"
- `<meta name="description">`: conforme briefing.
- Canonical: `https://lp.baluhub.com.br/agencia`.
- Open Graph + Twitter Card (imagem: `og-image.png` por enquanto; TODO exclusiva).
- Schema.org: `Organization` + `Product` + `FAQPage`.
- `robots`: `index, follow` (conforme briefing). *Nota: avaliar `noindex` futuramente p/ evitar canibalização com a home — fora de escopo da v1.*

## O que esta LP NÃO tem

Navbar de navegação · mais de um CTA primário · carrossel automático/tabs que escondem conteúdo · vídeo autoplay com som · chat widget flutuante (agent-balu fica de fora) · formulário longo · copy corporativo formal.

## Placeholders / TODO (para plugar depois)

1. `TODO_PIXEL_ID` / `TODO_GA4_ID` no tracking.
2. Link de checkout do tripwire R$47 (`href="#"`).
3. OG-image exclusiva da LP.
4. (Deploy) Subdomínio `lp.baluhub.com.br`: Vercel → Settings → Domains → add `lp.baluhub.com.br`; criar CNAME no DNS apontando p/ Vercel. Path `/agencia` passa a servir automaticamente.

## Fora de escopo (v1)

- Subdomínio/DNS (config de painel, documentado acima).
- OG-image exclusiva, checkout real, IDs de tracking reais.
- Testes A/B do H1 (variação B fica anotada como comentário no HTML).
- Vídeos de depoimento (só os textuais existentes).
