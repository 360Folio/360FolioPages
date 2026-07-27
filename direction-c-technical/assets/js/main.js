/* ============================================================================
   360FOLIO — DIRECTION C · "DATASHEET"
   One vanilla script. No modules, no build step. Safe to wp_enqueue as-is.

   Everything here is defensive:
   - every feature is opt-in via a data-attribute, so an empty page is fine
   - nothing assumes DOM order (Contact Form 7 / WPForms will re-order fields)
   - GSAP is optional; if the CDN is blocked the page still renders correctly
   - prefers-reduced-motion disables every animation this file starts
   ========================================================================== */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  root.classList.add('f360-js');

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }

  /* ------------------------------------------------------------------ 01
     COLOUR SCHEME
     Dark is the committed default; light is offered because a spec sheet
     gets read in daylight. Stored per-visitor, applied before paint by the
     inline bootstrap in <head>.
  ------------------------------------------------------------------------ */
  function currentScheme() {
    var set = root.getAttribute('data-f360-scheme');
    if (set) return set;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function paintSchemeButtons() {
    var now = currentScheme();
    $$('[data-f360-theme]').forEach(function (btn) {
      var label = $('[data-f360-theme-label]', btn);
      if (label) label.textContent = now === 'light' ? 'Light' : 'Dark';
      btn.setAttribute('aria-label', 'Colour scheme: ' + now + '. Switch to ' + (now === 'light' ? 'dark' : 'light') + '.');
    });
  }

  $$('[data-f360-theme]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = currentScheme() === 'light' ? 'dark' : 'light';
      root.setAttribute('data-f360-scheme', next);
      try { window.localStorage.setItem('f360-scheme', next); } catch (e) {}
      paintSchemeButtons();
    });
  });
  paintSchemeButtons();

  /* ------------------------------------------------------------------ 02
     CURRENT PAGE MARKER
     The header markup is byte-identical across pages (it becomes header.php),
     so aria-current cannot be hard-coded. WordPress will do this server-side;
     until then we do it here from the URL.
  ------------------------------------------------------------------------ */
  (function markCurrent() {
    var here = window.location.pathname.split('/').pop() || 'index.html';
    $$('.f360-nav a, .f360-mnav a').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (!href || href.charAt(0) === '#') return;
      if (href.split('/').pop() === here) a.setAttribute('aria-current', 'page');
    });
  }());

  /* ------------------------------------------------------------------ 03
     MOBILE NAV
  ------------------------------------------------------------------------ */
  (function mobileNav() {
    var btn = $('[data-f360-burger]');
    var panel = $('[data-f360-mnav]');
    if (!btn || !panel) return;

    function setOpen(open) {
      panel.setAttribute('data-open', open ? 'true' : 'false');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    setOpen(false);

    btn.addEventListener('click', function () {
      setOpen(panel.getAttribute('data-open') !== 'true');
    });
    panel.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') setOpen(false);
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1080) setOpen(false);
    });
  }());

  /* ------------------------------------------------------------------ 04
     FEATURE MATRIX — filter + expand/collapse all
     Counts are read from the DOM, never hard-coded, so they cannot drift
     when an editor adds or removes a feature row in WordPress.
  ------------------------------------------------------------------------ */
  $$('[data-f360-matrix]').forEach(function (matrix) {
    var rows = $$('[data-tier]', matrix);
    var groups = $$('[data-f360-group]', matrix);
    var scope = matrix.getAttribute('data-f360-matrix');
    var controls = $('[data-f360-matrix-controls="' + scope + '"]');
    if (!controls) return;

    /* Tiers are whatever the markup declares — standard/optional on the
       feature matrix, service types on the work archive. A row may carry
       several, space-separated. */
    var noun = matrix.getAttribute('data-f360-matrix-noun') || 'features';
    var counts = { all: rows.length };
    rows.forEach(function (r) {
      (r.getAttribute('data-tier') || '').split(/\s+/).forEach(function (t) {
        if (t) counts[t] = (counts[t] || 0) + 1;
      });
    });

    $$('[data-f360-count]', controls).forEach(function (el) {
      var key = el.getAttribute('data-f360-count');
      if (counts[key] !== undefined) el.textContent = String(counts[key]);
    });

    var live = $('[data-f360-matrix-status]', controls);

    function apply(filter) {
      rows.forEach(function (r) {
        var tiers = ' ' + (r.getAttribute('data-tier') || '') + ' ';
        r.hidden = !(filter === 'all' || tiers.indexOf(' ' + filter + ' ') > -1);
      });
      groups.forEach(function (g) {
        var visible = $$('[data-tier]', g).filter(function (r) { return !r.hidden; });
        g.hidden = visible.length === 0;
        var n = $('[data-f360-groupcount]', g);
        if (n) n.textContent = visible.length + ' item' + (visible.length === 1 ? '' : 's');
      });
      $$('[data-f360-filter]', controls).forEach(function (b) {
        b.setAttribute('aria-pressed', b.getAttribute('data-f360-filter') === filter ? 'true' : 'false');
      });
      if (live) {
        /* Read the label off the button rather than printing the raw slug, so
           the status says "5 CGI Tour projects" and not "5 cgi projects". */
        var btn = $('[data-f360-filter="' + filter + '"]', controls);
        var label = btn ? btn.childNodes[0].textContent.trim() : filter;
        live.textContent = 'Showing ' + (filter === 'all' ? counts.all + ' ' + noun :
          (counts[filter] || 0) + ' ' + label + ' ' + noun);
      }
    }

    $$('[data-f360-filter]', controls).forEach(function (b) {
      b.addEventListener('click', function () { apply(b.getAttribute('data-f360-filter')); });
    });

    $$('[data-f360-expand]', controls).forEach(function (b) {
      b.addEventListener('click', function () {
        var open = b.getAttribute('data-f360-expand') === 'open';
        rows.forEach(function (r) { if (!r.hidden) r.open = open; });
      });
    });

    apply('all');
  });

  /* ------------------------------------------------------------------ 05
     IN-PAGE ANCHOR RAIL — scroll spy
  ------------------------------------------------------------------------ */
  (function anchorRail() {
    var rail = $('[data-f360-anchors]');
    if (!rail || !('IntersectionObserver' in window)) return;

    var links = $$('a[href^="#"]', rail);
    var map = {};
    var targets = [];

    links.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      var el = doc.getElementById(id);
      if (el) { map[id] = a; targets.push(el); }
    });
    if (!targets.length) return;

    var seen = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { seen[e.target.id] = e.isIntersecting ? e.intersectionRatio : 0; });
      var bestId = null, best = 0;
      Object.keys(seen).forEach(function (id) {
        if (seen[id] > best) { best = seen[id]; bestId = id; }
      });
      links.forEach(function (a) { a.removeAttribute('data-active'); });
      if (bestId && map[bestId]) map[bestId].setAttribute('data-active', 'true');
    }, { rootMargin: '-25% 0px -55% 0px', threshold: [0, 0.15, 0.4, 0.8] });

    targets.forEach(function (t) { io.observe(t); });
  }());

  /* ------------------------------------------------------------------ 06
     MARQUEE — duplicate the track once so the CSS loop is seamless.
     Skipped entirely under reduced motion.
  ------------------------------------------------------------------------ */
  (function marquee() {
    var track = $('[data-f360-marquee]');
    if (!track) return;
    if (REDUCED) {
      track.style.animation = 'none';
      track.style.width = 'auto';
      track.style.flexWrap = 'wrap';
      return;
    }
    var originals = Array.prototype.slice.call(track.children);
    originals.forEach(function (node) {
      var copy = node.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      track.appendChild(copy);
    });
  }());

  /* ------------------------------------------------------------------ 07
     FORM UX
     Styled and wired by class only — never by input index — because these
     fields get replaced wholesale by Contact Form 7 / WPForms.
  ------------------------------------------------------------------------ */
  $$('[data-f360-form]').forEach(function (form) {
    /* live character budget on the message field */
    var msg = form.querySelector('textarea[name="Message"]');
    var counter = $('[data-f360-counter]', form);
    if (msg && counter) {
      var paint = function () {
        counter.textContent = msg.value.length + ' chars';
      };
      msg.addEventListener('input', paint);
      paint();
    }

    /* inline validation using the source site's own message strings */
    function fieldOf(input) { return input.closest('.f360-field'); }

    function validate(input) {
      var wrap = fieldOf(input);
      if (!wrap) return true;
      var ok = input.checkValidity();
      wrap.setAttribute('data-invalid', ok ? 'false' : 'true');
      return ok;
    }

    $$('input, select, textarea', form).forEach(function (input) {
      input.addEventListener('blur', function () { validate(input); });
      input.addEventListener('input', function () {
        var wrap = fieldOf(input);
        if (wrap && wrap.getAttribute('data-invalid') === 'true') validate(input);
      });
    });

    form.addEventListener('submit', function (e) {
      var bad = null;
      $$('input, select, textarea', form).forEach(function (input) {
        if (!validate(input) && !bad) bad = input;
      });
      if (bad) {
        e.preventDefault();
        bad.focus();
        return;
      }
      /* No back end in the static template. WordPress supplies the handler. */
      e.preventDefault();
      var note = $('[data-f360-formnote]', form);
      if (note) {
        note.textContent = 'Static template — no mail handler attached yet. In WordPress this posts to the form plugin.';
        note.setAttribute('data-state', 'sent');
      }
    });
  });

  /* ------------------------------------------------------------------ 08
     MOTION — GSAP scroll reveals and counters.
     Guarded three ways: reduced-motion, GSAP present, ScrollTrigger present.
     If any guard fails, .f360-reveal elements are simply shown.
  ------------------------------------------------------------------------ */
  function showAllReveals() {
    $$('.f360-reveal').forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-f360-count-to'));
    var dp = parseInt(el.getAttribute('data-f360-count-dp') || '0', 10);
    if (isNaN(target)) return;
    var obj = { v: 0 };
    window.gsap.to(obj, {
      v: target,
      duration: 1.1,
      ease: 'power2.out',
      onUpdate: function () { el.textContent = obj.v.toFixed(dp); },
      onComplete: function () { el.textContent = target.toFixed(dp); }
    });
  }

  if (REDUCED || typeof window.gsap === 'undefined') {
    showAllReveals();
    $$('[data-f360-count-to]').forEach(function (el) {
      var dp = parseInt(el.getAttribute('data-f360-count-dp') || '0', 10);
      el.textContent = parseFloat(el.getAttribute('data-f360-count-to')).toFixed(dp);
    });
  } else {
    var gsap = window.gsap;
    var ST = window.ScrollTrigger;
    if (ST) gsap.registerPlugin(ST);

    if (!ST) {
      showAllReveals();
    } else {
      $$('[data-f360-reveal-group]').forEach(function (group) {
        var items = $$('.f360-reveal', group);
        if (!items.length) return;
        gsap.to(items, {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: 'power2.out',
          stagger: 0.055,
          scrollTrigger: { trigger: group, start: 'top 85%', once: true }
        });
      });

      /* any stray reveal not inside a group */
      $$('.f360-reveal').forEach(function (el) {
        if (el.closest('[data-f360-reveal-group]')) return;
        gsap.to(el, {
          opacity: 1, y: 0, duration: 0.55, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        });
      });

      $$('[data-f360-count-to]').forEach(function (el) {
        ST.create({
          trigger: el,
          start: 'top 90%',
          once: true,
          onEnter: function () { countUp(el); }
        });
      });
    }
  }

  /* ------------------------------------------------------------------ 09
     ANIMATION SLOT HOOK
     The scene is not built yet. This exposes the one function a future
     Three.js module needs, and does nothing else. No scene code lives here.
  ------------------------------------------------------------------------ */
  window.f360 = window.f360 || {};
  window.f360.animSlots = function () {
    return $$('[data-anim-slot]').map(function (section) {
      return {
        name: section.getAttribute('data-anim-slot'),
        section: section,
        canvas: $('[data-anim-canvas]', section),
        placeholder: $('[data-anim-placeholder]', section),
        /* call once a scene has mounted: swaps placeholder for canvas
           without touching layout — the stage height is fixed in CSS. */
        activate: function () {
          var c = $('[data-anim-canvas]', section);
          var p = $('[data-anim-placeholder]', section);
          if (c) c.hidden = false;
          if (p) p.hidden = true;
        }
      };
    });
  };
}());
