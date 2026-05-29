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
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        // stagger entre irmãos .reveal do mesmo container (limpa depois p/ não atrasar o hover)
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

  function prefersReduced() {
    return window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  }

  // 5. Count-up nos números (anima 0 → valor ao entrar na viewport)
  function wireCountUp() {
    var els = document.querySelectorAll('[data-count]');
    if (!els.length) return;
    if (!('IntersectionObserver' in window) || prefersReduced()) return; // mantém o valor final do HTML
    function run(el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      var dur = 1100, start = null;
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
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
