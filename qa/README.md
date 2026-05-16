# QA prompts — Balu site (baluhub.com.br)

Cada arquivo é um prompt JSON **independente** pra rodar na extensão do Claude. Cabe sem estourar contexto.

## Ordem sugerida

| # | Arquivo | Foco | Cobertura |
|---|---|---|---|
| 1 | [01-smoke-global.json](01-smoke-global.json) | Smoke cross-page | 3 páginas × 10 checks básicos (fonts, console, 404, header) |
| 2 | [02-page-index.json](02-page-index.json) | Home (index) | hero, marquee 3D, método, pricing, footer, mapa Sapiens |
| 3 | [03-page-crm.json](03-page-crm.json) | CRM | hero pipeline, WhatsApp mock, automações, planos |
| 4 | [04-page-criacao.json](04-page-criacao.json) | Criação | hero tracker, portfólio (Sea Hop), processo, planos |
| 5 | [05-dropdown-login.json](05-dropdown-login.json) | Dropdown Entrar | 2 páginas × 3 viewports × 13 checks (portaled to body, posicionamento, scroll) |
| 6 | [06-widget-agent.json](06-widget-agent.json) | Widget IA | trigger, gate, chat, anti-injection, origin guard, persistência, XSS |
| 7 | [07-mobile-responsive.json](07-mobile-responsive.json) | Mobile | 3 páginas × 3 viewports (414/375/320) — overflow, tap targets, hamburguer |
| 8 | [08-performance-a11y.json](08-performance-a11y.json) | Lighthouse + a11y | scores, LCP/FCP/CLS/TBT, WCAG AA, focus visible, aria-labels |

## Como usar na extensão

Cole o JSON do arquivo + esse prompt em volta:

```
Execute o QA descrito neste JSON contra a(s) URL(s) em targets.
Use suas ferramentas de navegação, screenshot e DevTools.
Retorne no formato definido em output_format.
JSON:
<cola o conteúdo do .json aqui>
```

## Dicas
- Rode em ordem (1 → 8). Se o parte 1 (smoke) falhar, as outras provavelmente também falham.
- Cada parte é self-contained: o agente não precisa ter rodado as anteriores.
- Se uma parte demorar muito, abra um chat novo pra ela.

## Arquivos relacionados (não-QA)
- [login-validation-prompt.json](login-validation-prompt.json) — QA das telas de login das apps (CRM + Agência), NÃO do site. Separado.
- [_archive-site-validation-prompt-full.json](_archive-site-validation-prompt-full.json) — versão monolítica de tudo (573 linhas, estoura contexto). Arquivada.
