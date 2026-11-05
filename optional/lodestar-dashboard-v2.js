/* OPTIONAL, NOT USED BY THE WIDGETS. TVR widgets cannot run scripts. Only use this if you later get a <script defer> in the platform head.
   lodestar-dashboard.js
   Load once in the platform <head>:  <script defer src="https://YOUR-HOST/lodestar-dashboard.js"></script>
   Progressive enhancement only. The page is complete without it.
   0. Re-applies the ARIA/role/tabindex attributes the widget editor strips from the pasted HTML.
   1. Credit count-up (CSS cannot read the %CREDIT_BALANCE% text).
   2. Gift-card carousel arrows + aria-disabled state (native scroll-snap does the scrolling). */
(function () {
  'use strict';
  /* TRACER: proves the file loaded and ran. Check the console for "[Lodestar]" lines, or run
     document.documentElement.getAttribute('data-lodestar-js') -> "loaded" (then "ready" once the widgets are found). */
  var VERSION = '1.0.0';
  var root = document.documentElement;
  root.setAttribute('data-lodestar-js', 'loaded');
  root.setAttribute('data-lodestar-version', VERSION);
  if (window.console && console.info) { console.info('[Lodestar] script loaded v' + VERSION); }
  function trace(msg) { if (window.console && console.info) { console.info('[Lodestar] ' + msg); } }
  var SCOPE = '.dashboards-1382-page';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var doneCount = false, doneGc = false, readyLogged = false, mo = null;

  /* 0 · accessibility attributes (the HTML widget editor removes aria-*, role and tabindex) */
  var A11Y = [
    ['.hero2', 'role', 'region'], ['.hero2', 'aria-labelledby', 'ld-h1'],
    ['.profile2', 'role', 'region'], ['.profile2', 'aria-label', 'Member profile'],
    ['.avatar', 'aria-hidden', 'true'],
    ['.h2-journey', 'aria-label', 'Program features'],
    ['.p2-links', 'role', 'group'], ['.p2-links', 'aria-label', 'Quick links'],
    ['.nom-widget', 'role', 'region'], ['.nom-widget', 'aria-labelledby', 'nom-title'],
    ['.value-info', 'aria-label', 'Lodestar core values'],
    ['.gc-widget', 'role', 'region'], ['.gc-widget', 'aria-labelledby', 'gc-title'],
    ['.gc-viewport', 'role', 'region'], ['.gc-viewport', 'aria-roledescription', 'carousel'],
    ['.gc-viewport', 'aria-label', 'Gift card brands. Swipe or use the arrow keys to browse.'], ['.gc-viewport', 'tabindex', '0']
  ];
  function restoreA11y(page) {
    for (var i = 0; i < A11Y.length; i++) {
      var el = page.querySelector(A11Y[i][0]);
      if (el && !el.hasAttribute(A11Y[i][1])) { el.setAttribute(A11Y[i][1], A11Y[i][2]); }
    }
  }

  /* 1 · credit count-up: 1.1s, ease-out cubic, runs once when scrolled into view, then restores the exact text */
  function countUp(el) {
    var txt = el.textContent, m = /^\s*(\d[\d,]*)\s*$/.exec(txt);
    if (!m || reduce || !('IntersectionObserver' in window)) { return; }
    var target = parseInt(m[1].replace(/,/g, ''), 10), commas = m[1].indexOf(',') > -1, start = null;
    if (!target) { return; }
    function fmt(n) { return commas ? n.toLocaleString('en-US') : String(n); }
    function step(t) {
      if (start === null) { start = t; }
      var p = Math.min((t - start) / 1100, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = p < 1 ? fmt(Math.round(target * e)) : txt;   /* final frame restores the original text */
      if (p < 1) { window.requestAnimationFrame(step); }
    }
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { io.disconnect(); window.requestAnimationFrame(step); }
    }, { threshold: 0.4 });
    io.observe(el);
  }

  /* 2 · gift-card arrows */
  var ARROW = '<svg viewBox="-1 -1 17 13" width="16" height="12" aria-hidden="true" focusable="false"><path d="%D" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>';
  function makeBtn(dir) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'gc-arrow gc-arrow--' + dir;
    b.setAttribute('data-gc-dir', dir);
    b.setAttribute('aria-label', dir < 0 ? 'Previous gift cards' : 'Next gift cards');
    b.innerHTML = ARROW.replace('%D', dir < 0 ? 'M6 .35L1 5.35M1 5.35L6 10.35M1 5.35H15' : 'M9 .35L14 5.35M14 5.35L9 10.35M14 5.35H0');
    return b;
  }
  function sync(w) {
    var v = w.querySelector('.gc-viewport'), btns = w.querySelectorAll('.gc-arrow');
    if (!v || btns.length < 2) { return; }
    btns[0].setAttribute('aria-disabled', v.scrollLeft <= 2 ? 'true' : 'false');
    btns[1].setAttribute('aria-disabled', v.scrollLeft + v.clientWidth >= v.scrollWidth - 2 ? 'true' : 'false');
  }
  function initGc(w) {
    var v = w.querySelector('.gc-viewport'), box = w.querySelector('.gc-arrows');
    if (!v || !box || w.classList.contains('is-enhanced')) { return; }
    box.textContent = '';  /* drop the &nbsp; placeholder */
    box.appendChild(makeBtn(-1)); box.appendChild(makeBtn(1));
    w.classList.add('is-enhanced');
    v.addEventListener('scroll', function () { sync(w); }, { passive: true });
    window.addEventListener('resize', function () { sync(w); });
    sync(w);
  }
  /* one delegated click handler for every arrow on the page */
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest(SCOPE + ' .gc-arrow') : null;
    if (!b || b.getAttribute('aria-disabled') === 'true') { return; }
    var w = b.closest('.gc-widget'), v = w && w.querySelector('.gc-viewport'), c = v && v.querySelector('.gc');
    if (!v || !c) { return; }
    v.scrollBy({ left: Number(b.getAttribute('data-gc-dir')) * (c.offsetWidth + 16), behavior: reduce ? 'auto' : 'smooth' });
  });

  /* The platform (Vue) renders widgets after load, so retry on DOM changes until both targets are found */
  function init() {
    var page = document.querySelector(SCOPE);
    if (!page) { return; }
    restoreA11y(page);
    if (!page.hasAttribute('data-lodestar-seen')) { page.setAttribute('data-lodestar-seen', '1'); trace('page scope found (.dashboards-1382-page)'); }
    var n = page.querySelector('.credits-widget .cw-num'), g = page.querySelector('.gc-widget');
    if (n && !doneCount) { doneCount = true; countUp(n); trace('credit count-up ' + (reduce ? 'skipped (reduced motion)' : 'armed')); }
    if (g && !doneGc) { doneGc = true; initGc(g); trace('gift-card arrows added'); }
    if (doneCount && doneGc && !readyLogged) { readyLogged = true; root.setAttribute('data-lodestar-js', 'ready'); trace('ready'); }
    if (doneCount && doneGc && mo) { mo.disconnect(); mo = null; }
  }
  init();
  if ((!doneCount || !doneGc) && 'MutationObserver' in window) {
    mo = new MutationObserver(function () { window.requestAnimationFrame(init); });
    mo.observe(document.documentElement, { childList: true, subtree: true });
    window.setTimeout(function () { if (mo) { mo.disconnect(); mo = null; trace('gave up waiting for widgets (count-up ' + doneCount + ', gift cards ' + doneGc + ')'); } }, 15000);  /* stop watching; quiet on other pages */
  }
}());
