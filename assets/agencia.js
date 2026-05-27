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
