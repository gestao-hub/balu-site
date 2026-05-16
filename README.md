# Balu — Site institucional

Site institucional da **Balu** com 3 páginas focadas em conversão.

- [`index.html`](index.html) — **Balu Agência** — plataforma operacional pra agências
- [`crm.html`](crm.html) — **Balu CRM** — pipeline + IA + automações
- [`criacao.html`](criacao.html) — **Balu Criação** — sites, branding e LPs white-label

## Stack

HTML + CSS + JS puro, sem framework. Fontes do Google (Instrument Serif, DM Sans, JetBrains Mono).
Sem build step — basta servir os arquivos estáticos.

## Rodar localmente

```bash
python3 -m http.server 8080
# abrir http://localhost:8080
```

## Estrutura

```
balu-site/
├── index.html          Balu Agência (home)
├── crm.html            Balu CRM
├── criacao.html        Balu Criação
├── favicon.svg
├── assets/
│   ├── styles.css      Design system compartilhado
│   ├── main.js         Scroll reveal + interações
│   ├── logo-white.svg
│   └── logo-gradient.svg
└── README.md
```

## Design system

Dark premium editorial tech. Paleta azul Balu (`#4576FF` / `#244561 → #1285C5`),
gradientes mesh, grain overlay, scroll reveals via `IntersectionObserver`,
mockups inline de UI tipo Qontrol, marquee de clientes, tilt parallax no hero.

Tipografia: **Instrument Serif** (italic display) + **DM Sans** (UI/body) + **JetBrains Mono** (eyebrows/meta).

## Deploy

Pode ser servido por qualquer host estático: Vercel, Cloudflare Pages, Netlify, GitHub Pages.
Pra GitHub Pages: Settings → Pages → Branch `master` / root.
