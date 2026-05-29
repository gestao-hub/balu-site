# Home institucional Balu (guarda-chuva da marca) — design

**Data:** 2026-05-29
**Autor:** Eduardo + Claude
**Status:** aprovado para implementação (aguardando revisão final do spec)

## Objetivo

Substituir a home atual `baluhub.com.br/` — que hoje é a página institucional do **produto Balu Agência** — por uma home **institucional da marca Balu** (guarda-chuva), apresentando a empresa e os 3 produtos (Agência, CRM, Criação) com link pra cada um.

**Motivação:** quando alguém cola `baluhub.com.br/` no WhatsApp ou cai pela busca orgânica, o cartão de preview hoje fala do produto Agência ("Pare de gerenciar planilha…"). O visitante que veio pela marca espera um institucional da marca, não um pitch direto de produto.

## Decisões fechadas (brainstorming)

| Tema | Decisão |
|------|---------|
| Conteúdo institucional do produto Agência | **Descartar.** O conteúdo atual do `index.html` (1385 linhas, institucional Agência) sai de cena. Quem quer detalhes do produto Agência vai pra LP em `lp.baluhub.com.br/agencia` (ou as seções pertinentes na nova home). |
| Escopo da nova home | **Completa** (9 seções: hero, 3 produtos, manifesto, logos, depoimentos, planos, FAQ, CTA+contato, rodapé). Aproveita conteúdo já existente em vez de jogar fora. |
| Design system | **Dark editorial** (já usado em `/crm`, `/criacao` e no `index.html` atual). Reaproveita `assets/styles.css` integralmente — consistência com as outras páginas institucionais. As LPs (`lp.baluhub.com.br/*`) seguem em Híbrido claro — "diferentes de propósito" porque têm trabalho diferente (conversão de tráfego pago). |
| Hero copy | *"Sua operação inteira numa só plataforma."* (brand-level, fala dos 3 produtos sem ser tão específica como a tagline antiga). |
| Risco | **Nenhuma URL externa quebra.** As páginas `/crm`, `/criacao`, `/agencia`, `/lp-crm` e todo o subdomínio `lp.baluhub.com.br` ficam intactos. Anúncios pagos do Meta Ads continuam funcionando. |

## Arquivos

**Modificado:**
- `index.html` — reescrita completa. Versão atual preservada no git para rollback.

**Modificados (ajustes pequenos):**
- `crm.html`, `criacao.html` — conferir links "voltar pra home" / nav que apontam pra `/`; semanticamente já está correto (a `/` continua existindo), mas confirmar que o tom da nav faz sentido com a nova home guarda-chuva.
- `llms.txt` — atualizar a descrição inicial ("> Plataforma única…") pra refletir a nova home institucional (que é brand-level, não produto-level).

**Inalterados:**
- `agencia.html`, `lp-crm.html`, `crm.html`, `criacao.html` (institucionais dos outros produtos), `lp-site/*`, `sitemap.xml`, `vercel.json`, `robots.txt`, `assets/styles.css`, `assets/main.js`, `og-image.png` (continua sendo a OG da home — talvez atualizar texto/imagem depois pra brand-level).

## Design system

**Reutilizado 100% de `assets/styles.css` (compartilhado com /crm, /criacao):**
- Paleta dark: fundo escuro azul-marinho (#0A1628 região), azul Balu `#4576FF`, gradiente `#244561 → #1285C5`
- Tipografia: **Instrument Serif** italic (displays), **DM Sans** (corpo/UI), **JetBrains Mono** (eyebrows/meta)
- Componentes existentes: `.btn`/`.btn-accent`/`.btn-ghost`, `.testimonial`, `.kpi`, `.plan-card`, `.faq` accordion, `.logos-marquee`, scroll reveal (GSAP + ScrollTrigger), `glass-pill`, `magnetic`
- Imagens: `assets/logo-white.svg`, `assets/logo-gradient.svg`, screenshots existentes em `assets/screenshots/agencia-*.png` e `crm-*.png`

## Anatomia da página (ordem)

1. **Hero institucional**
   - Eyebrow: "BALU"
   - H1: *"Sua operação inteira numa só plataforma."* (Instrument Serif italic, com 1 palavra-chave em `display-glow`)
   - Subtítulo: *"Atendimento, vendas e operação em **Loop Fechado** com IA — pra agências de marketing, e-commerces e prestadores de serviço."*
   - CTAs duplos: **"Ver os produtos"** (scroll pra seção 2) + **"Falar com a gente"** (WhatsApp `wa.me/5512991548086`)
   - Visual: mesh gradient (já existe em styles.css) + grain overlay; opcionalmente um composite com cantos dos 3 produtos

2. **3 produtos em destaque**
   - Eyebrow: "3 PRODUTOS, 1 MARCA"
   - H2: *"Escolha por onde começar."*
   - Grid de 3 cards (1 col mobile, 3 cols desktop), cada um com:
     - **Balu Agência** — *"Plataforma operacional completa pra agência. CRM + projetos + financeiro + Squad de IA num loop fechado."* — CTA "Conheça" → `lp.baluhub.com.br/agencia`
     - **Balu CRM** — *"CRM omnichannel com IA. Inbox unificado (WhatsApp + Instagram + e-mail) + agentes IA + pipeline visual."* — CTA "Conheça" → `lp.baluhub.com.br/crm`
     - **Balu Criação** — *"Sites e landing pages white-label pra agências revenderem. Entregas em dias, não meses. SEO + GEO incluso."* — CTA "Conheça" → `/criacao`
   - Cada card tem ícone/screenshot e cor de destaque sutil

3. **Manifesto / quem é a Balu**
   - Eyebrow: "QUEM A GENTE É"
   - H2: *"Nasceu da prática de gerir agência."*
   - Texto (adaptado do `llms.txt`): *"A Balu nasceu em 2025 da experiência real de gerir agência. Sediada em Florianópolis (Sapiens Parque). O nome é homenagem ao Balu, mascote do Mowgli — bigger, friendlier, calmer. Em vez de focar num pedaço da operação (só CRM ou só publicação), costuramos o **loop fechado** captação → conversão → entrega → insight, onde cada etapa alimenta a próxima e devolve dado pra primeira."*
   - Citação curta do founder (Eduardo Bovo) com avatar/foto

4. **Logos de clientes** (prova social)
   - Eyebrow: "QUEM ESTÁ COM A GENTE"
   - H2: *"Agências e operações que rodam no loop fechado."*
   - Marquee horizontal dos wordmarks: Vivacqua, Sea Hop, Esa Energia, Upperground, Bangalô, Tiago Mônaco, Piper Hub (mesmos das LPs)

5. **Depoimentos + KPIs**
   - Eyebrow: "RESULTADO REAL"
   - H2: *"O que mudou pra quem mudou."*
   - Os 3 depoimentos existentes:
     - Marina B.: *"A Balu fez o que três SaaS combinados nunca conseguiram: me devolveu tempo. Saí do operacional em 60 dias."* — Sócia, agência com 18 contas
     - Rafael C.: *"Migrei 11 clientes do meu CRM antigo num final de semana. Na segunda, o pipeline já estava se atualizando sozinho."* — Diretor comercial, Performance B2B
     - Júlia T.: *"O optimizer de mídia salvou um lançamento meu. Pausou 4 criativos no domingo e me explicou por quê na segunda."* — Head de Mídia, agência paulistana
   - 4 KPIs agregados: **7+ ferramentas substituídas** · **15 min onboarding** · **68% menos retrabalho** · **+3 p.p. de margem**

6. **Resumo de planos**
   - Eyebrow: "PREÇO HONESTO"
   - H2: *"Plano que cresce com você."*
   - 3 cards de plano (como hoje):
     - **Solo** — R$297/mês — *"Freelancer ou consultor solo, até 5 clientes."*
     - **Estúdio** — R$697/mês (featured/destaque) — *"Agência boutique, até 25 clientes e 8 usuários."*
     - **Holding** — sob consulta — *"Grupos com múltiplas agências, custom limits, white-label."*
   - Microcopy: *"Sem cartão · 14 dias grátis · Onboarding em 15 min · Cancele quando quiser."*

7. **FAQ brand-level** (5-6 perguntas)
   - *"O que é a Balu?"* → resposta do manifesto
   - *"Posso usar só um dos produtos?"* → sim, cada um é vendido standalone, mas o loop fechado é o diferencial
   - *"Quanto custa?"* → resumo (Solo R$297, Estúdio R$697, Holding sob consulta)
   - *"Atende fora do Brasil?"* → atualmente só Brasil, roadmap LATAM
   - *"Migra dos meus sistemas atuais?"* → migra, import por CSV ou direto do WhatsApp
   - *"Tem fidelidade?"* → conversa transparente na demo

8. **CTA final + contato**
   - H2: *"Pronto pra começar?"*
   - Subtítulo: *"Conversa de 15 min. A gente entende sua operação e indica o produto certo."*
   - CTA WhatsApp principal (laranja ou azul accent) + `mailto:contato@balu.com.br` secundário
   - Endereço: *Sapiens Parque, Av. Luiz Boiteux Piazza 1302, Canasvieiras, Florianópolis, SC*
   - Form de lead opcional (manter o que existe no index atual se fizer sentido)

9. **Rodapé**
   - Logo Balu (logo-white.svg)
   - 3 colunas: **Produtos** (Agência, CRM, Criação, comparativos) · **Empresa** (sobre, blog) · **Legal** (Privacidade, Termos)
   - Redes sociais (se houver)
   - © 2026 Balu · Florianópolis, SC

## SEO / meta

- `<title>`: *"Balu — Plataforma com IA para agências, e-commerce e serviços"*
- `<meta description>`: *"Atendimento, vendas e operação em Loop Fechado com IA. 3 produtos: Balu Agência, Balu CRM, Balu Criação. Conversa de 15 min sem cartão."*
- Canonical: `https://baluhub.com.br/`
- OG image: por enquanto `og-image.png` (que já existe e tem "Pare de gerenciar planilha…"). **TODO pós-implementação:** criar OG image brand-level (logo Balu + "Plataforma com IA pra agências e e-commerces") pra que o preview no WhatsApp passe a refletir a marca em vez do produto Agência.
- Schema.org `@graph`: `Organization` (Balu, founder Eduardo Bovo, Florianópolis), `ItemList` ou `Product[]` (3 produtos), `FAQPage` (5-6 Qs)

## Performance / a11y

Reutiliza padrões do styles.css existente (já em prod e validado):
- LCP < 2.5s, INP < 200ms, CLS < 0.1
- Imagens com `width`/`height`, lazy abaixo da dobra
- Fonts `display=swap`, scripts `defer`
- Single `<h1>`, hierarquia H2/H3 correta, ARIA landmarks
- Tap targets ≥ 48px, body ≥ 16px, contraste WCAG AA

## Mudanças colaterais

1. **`llms.txt`** — atualizar a descrição inicial ("> Plataforma única…") pra refletir nivel-marca: *"> Balu é uma plataforma com IA pra agências, e-commerces e prestadores de serviço. 3 produtos integrados — Agência, CRM, Criação — em loop fechado."* O resto do llms.txt já fala da empresa e produtos no nível certo.

2. **`crm.html` e `criacao.html`** — conferir nav/footer. Se tiver link "Balu Agência" apontando pra `/`, atualizar pra apontar pra `lp.baluhub.com.br/agencia` (já que `/` agora é institucional Balu, não produto Agência). Mudança pequena de label, link nada quebra.

3. **OG image** (`og-image.png`) — manter atual pra ir ao ar. **TODO:** criar OG brand-level (logo + texto institucional) e substituir. Não bloqueia.

## Placeholders / TODOs

1. OG image brand-level (pós-implementação)
2. Foto/avatar do founder (Eduardo Bovo) se quiser usar na seção manifesto — opcional
3. Ícones específicos pros 3 cards de produto (atualmente vou usar mockups/screenshots existentes em `assets/screenshots/`)

## Fora de escopo (v1)

- Redesign dos institucionais `/crm` e `/criacao` (continuam dark editorial como hoje)
- Páginas novas (blog brand-level, etc.)
- Internacionalização (segue só PT-BR)
- Form de lead com integração nova (mantém o que existe, se existir)
