/* ==========================================================================
   360Folio — Direction B "PLATE"
   assets/js/main.js — nav, running head, accordions, form UX, GSAP setup.
   Vanilla. No build step. GSAP/ScrollTrigger optional: everything degrades.
   Every animation is gated on prefers-reduced-motion.
   ========================================================================== */

(function () {
  'use strict';

  var reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var REDUCED = reduceQuery.matches;
  var hasGSAP = typeof window.gsap !== 'undefined';
  var hasST = hasGSAP && typeof window.ScrollTrigger !== 'undefined';

  if (hasST) { window.gsap.registerPlugin(window.ScrollTrigger); }

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ------------------------------------------------------------------ *
   * 1. Current page marker. Header markup is byte-identical across
   *    pages, so the active state is applied at runtime, never authored.
   * ------------------------------------------------------------------ */
  function markCurrent() {
    var here = window.location.pathname.split('/').pop() || 'index.html';
    $$('.f360-nav__list a').forEach(function (a) {
      var href = (a.getAttribute('href') || '').split('/').pop();
      if (href && href === here) {
        a.setAttribute('aria-current', 'page');
        var parentItem = a.closest('.f360-nav__item--has-sub');
        if (parentItem) {
          var top = parentItem.querySelector(':scope > a');
          if (top) { top.setAttribute('aria-current', 'true'); }
        }
      }
    });
  }

  /* ------------------------------------------------------------------ *
   * 2. Navigation — mobile drawer + dropdowns that work on touch.
   * ------------------------------------------------------------------ */
  function initNav() {
    var nav = $('[data-nav]');
    var toggle = $('[data-nav-toggle]');
    if (!nav || !toggle) { return; }

    function setOpen(open) {
      nav.setAttribute('data-open', open ? 'true' : 'false');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      var label = toggle.querySelector('[data-nav-toggle-label]');
      if (label) { label.textContent = open ? 'Close' : 'Menu'; }
    }
    setOpen(false);

    toggle.addEventListener('click', function () {
      setOpen(nav.getAttribute('data-open') !== 'true');
    });

    // Sub-menu parents: on narrow/touch layouts the top-level link toggles
    // its child list instead of navigating away from the section hub.
    $$('.f360-nav__item--has-sub').forEach(function (item) {
      var link = item.querySelector(':scope > a');
      if (!link) { return; }
      link.addEventListener('click', function (e) {
        if (window.matchMedia('(max-width: 1080px)').matches) {
          e.preventDefault();
          var open = item.getAttribute('data-open') === 'true';
          $$('.f360-nav__item--has-sub').forEach(function (o) { o.setAttribute('data-open', 'false'); });
          item.setAttribute('data-open', open ? 'false' : 'true');
        }
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        setOpen(false);
        $$('.f360-nav__item--has-sub').forEach(function (o) { o.setAttribute('data-open', 'false'); });
      }
    });

    window.addEventListener('resize', function () {
      if (!window.matchMedia('(max-width: 1080px)').matches) { setOpen(false); }
    });
  }

  /* ------------------------------------------------------------------ *
   * 3. Running head + scroll-progress rule.
   *    The publication tells you which spread you are on.
   * ------------------------------------------------------------------ */
  function initRunningHead() {
    var bar = $('[data-progress]');
    var head = $('[data-runhead]');
    var numEl = head ? head.querySelector('[data-runhead-num]') : null;
    var labelEl = head ? head.querySelector('[data-runhead-label]') : null;
    var sections = $$('[data-section-label]');

    function onScroll() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (bar) { bar.style.transform = 'scaleX(' + p + ')'; }
      if (head) { head.setAttribute('data-visible', window.scrollY > 260 ? 'true' : 'false'); }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();

    if (!sections.length || !('IntersectionObserver' in window) || !numEl || !labelEl) { return; }

    var current = null;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && entry.target !== current) {
          current = entry.target;
          numEl.textContent = entry.target.getAttribute('data-section-num') || '';
          labelEl.textContent = entry.target.getAttribute('data-section-label') || '';
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

    sections.forEach(function (s) { io.observe(s); });
  }

  /* ------------------------------------------------------------------ *
   * 4. Accordions. Authored open so the page is complete without JS;
   *    collapsed here on init.
   * ------------------------------------------------------------------ */
  function initAccordions() {
    var accs = $$('[data-acc]');
    if (!accs.length) { return; }

    accs.forEach(function (acc, i) {
      var btn = acc.querySelector('[data-acc-btn]');
      var panel = acc.querySelector('[data-acc-panel]');
      if (!btn || !panel) { return; }
      var open = i === 0;
      panel.style.height = open ? 'auto' : '0px';
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      panel.setAttribute('aria-hidden', open ? 'false' : 'true');

      btn.addEventListener('click', function () {
        setAcc(acc, btn.getAttribute('aria-expanded') !== 'true');
      });
    });

    $$('[data-acc-all]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var want = btn.getAttribute('data-acc-all') === 'open';
        $$('[data-acc]').forEach(function (a) { setAcc(a, want); });
      });
    });
  }

  function setAcc(acc, open) {
    var btn = acc.querySelector('[data-acc-btn]');
    var panel = acc.querySelector('[data-acc-panel]');
    var inner = panel.firstElementChild;
    if (!btn || !panel || !inner) { return; }

    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.setAttribute('aria-hidden', open ? 'false' : 'true');

    if (REDUCED) {
      panel.style.height = open ? 'auto' : '0px';
      return;
    }
    var target = inner.getBoundingClientRect().height;
    if (open) {
      panel.style.height = '0px';
      /* force reflow so the transition has a start value */
      void panel.offsetHeight;
      panel.style.height = target + 'px';
      var done = function () { panel.style.height = 'auto'; panel.removeEventListener('transitionend', done); };
      panel.addEventListener('transitionend', done);
    } else {
      panel.style.height = panel.getBoundingClientRect().height + 'px';
      void panel.offsetHeight;
      panel.style.height = '0px';
    }
  }

  /* ------------------------------------------------------------------ *
   * 5. Forms. Class-based only — no assumptions about field order, so
   *    a Contact Form 7 swap cannot break this.
   * ------------------------------------------------------------------ */
  function initForms() {
    $$('[data-f360-form]').forEach(function (form) {
      var status = form.querySelector('[data-form-status]');

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var firstBad = null;

        $$('.f360-field', form).forEach(function (field) {
          var input = field.querySelector('input, select, textarea');
          if (!input) { return; }
          var bad = input.hasAttribute('required') && !String(input.value).trim();
          if (!bad && input.type === 'email' && input.value) {
            bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
          }
          field.setAttribute('data-invalid', bad ? 'true' : 'false');
          input.setAttribute('aria-invalid', bad ? 'true' : 'false');
          if (bad && !firstBad) { firstBad = input; }
        });

        if (firstBad) {
          if (status) {
            status.textContent = 'Some fields still need attention.';
            status.setAttribute('data-state', 'error');
          }
          firstBad.focus();
          return;
        }

        if (status) {
          status.textContent = 'Thank you — your enquiry is queued. We reply the same working day with a fixed quote.';
          status.setAttribute('data-state', 'ok');
        }
      });

      $$('.f360-field input, .f360-field select, .f360-field textarea', form).forEach(function (input) {
        input.addEventListener('input', function () {
          var field = input.closest('.f360-field');
          if (field && field.getAttribute('data-invalid') === 'true' && String(input.value).trim()) {
            field.setAttribute('data-invalid', 'false');
            input.setAttribute('aria-invalid', 'false');
          }
        });
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * 6. Office clocks. Three offices, three time zones — useful, and it
   *    makes the page quietly alive.
   * ------------------------------------------------------------------ */
  function initClocks() {
    var clocks = $$('[data-tz]');
    if (!clocks.length || typeof Intl === 'undefined' || !Intl.DateTimeFormat) { return; }

    function tick() {
      var now = new Date();
      clocks.forEach(function (el) {
        try {
          var fmt = new Intl.DateTimeFormat('en-GB', {
            timeZone: el.getAttribute('data-tz'),
            hour: '2-digit', minute: '2-digit', hour12: false
          });
          el.textContent = fmt.format(now) + ' local';
        } catch (err) { /* unknown zone — leave the authored fallback */ }
      });
    }
    tick();
    window.setInterval(tick, 30000);
  }

  /* ------------------------------------------------------------------ *
   * 7. Grid proof overlay + theme override, from the footer colophon.
   * ------------------------------------------------------------------ */
  function initToolbar() {
    var root = document.documentElement;

    var gridBtn = $('[data-grid-toggle]');
    if (gridBtn) {
      var saved = null;
      try { saved = window.localStorage.getItem('f360-grid'); } catch (e) {}
      if (saved === 'on') { root.setAttribute('data-f360-grid', 'on'); gridBtn.setAttribute('aria-pressed', 'true'); }
      gridBtn.addEventListener('click', function () {
        var on = root.getAttribute('data-f360-grid') !== 'on';
        root.setAttribute('data-f360-grid', on ? 'on' : 'off');
        gridBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
        try { window.localStorage.setItem('f360-grid', on ? 'on' : 'off'); } catch (e) {}
      });
    }

    var themeBtns = $$('[data-theme-toggle]');
    if (themeBtns.length) {
      var savedTheme = null;
      try { savedTheme = window.localStorage.getItem('f360-theme'); } catch (e) {}
      if (savedTheme) { root.setAttribute('data-f360-theme', savedTheme); }
      var isDark = function () {
        var t = root.getAttribute('data-f360-theme');
        return t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches);
      };
      /* Every control on the page, not just the first — the masthead and the
         colophon both carry one and they must never disagree. */
      var sync = function () {
        var dark = isDark();
        themeBtns.forEach(function (b) {
          b.setAttribute('aria-pressed', dark ? 'true' : 'false');
          var lbl = b.querySelector('[data-theme-label]');
          if (lbl) { lbl.textContent = dark ? 'Night edition' : 'Day edition'; }
        });
      };
      sync();
      themeBtns.forEach(function (b) {
        b.addEventListener('click', function () {
          var next = isDark() ? 'light' : 'dark';
          root.setAttribute('data-f360-theme', next);
          try { window.localStorage.setItem('f360-theme', next); } catch (e) {}
          sync();
        });
      });
    }
  }

  /* ------------------------------------------------------------------ *
   * 8. Footer year — identical markup on every page, filled at runtime.
   * ------------------------------------------------------------------ */
  function initYear() {
    $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
  }

  /* ------------------------------------------------------------------ *
   * 9. Motion. Everything below is skipped entirely when the visitor
   *    asks for reduced motion; the page is already in its final state.
   * ------------------------------------------------------------------ */
  function initMotion() {
    if (REDUCED || !hasGSAP) { return; }
    var gsap = window.gsap;

    /* 9a. Reveal — a rule draws, then the block settles. */
    $$('[data-reveal]').forEach(function (el) {
      var kids = el.hasAttribute('data-reveal-group')
        ? Array.prototype.slice.call(el.children)
        : [el];
      gsap.set(kids, { opacity: 0, y: 18 });
      var play = function () {
        gsap.to(kids, { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out', stagger: 0.07, overwrite: true });
      };
      if (hasST) {
        window.ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: play });
      } else { play(); }
    });

    /* 9b. Hairlines draw in from the left. */
    $$('[data-draw]').forEach(function (el) {
      gsap.set(el, { scaleX: 0 });
      var play = function () { gsap.to(el, { scaleX: 1, duration: 1.1, ease: 'power2.inOut' }); };
      if (hasST) {
        window.ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: play });
      } else { play(); }
    });

    /* 9c. Counters. */
    $$('[data-count]').forEach(function (el) {
      var to = parseFloat(el.getAttribute('data-count'));
      var dp = parseInt(el.getAttribute('data-count-dp') || '0', 10);
      var obj = { v: 0 };
      var play = function () {
        gsap.to(obj, {
          v: to, duration: 1.6, ease: 'power2.out',
          onUpdate: function () { el.textContent = obj.v.toFixed(dp); }
        });
      };
      el.textContent = (0).toFixed(dp);
      if (hasST) {
        window.ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: play });
      } else { play(); }
    });

    if (!hasST) { return; }

    /* 9d. Client rail — a slow continuous crawl, paused on hover. */
    $$('[data-rail]').forEach(function (rail) {
      var track = rail.querySelector('.f360-rail__track');
      if (!track) { return; }
      var half = track.scrollWidth / 2;
      if (!half) { return; }
      var tween = gsap.to(track, {
        x: -half, duration: half / 34, ease: 'none', repeat: -1,
        modifiers: { x: function (x) { return (parseFloat(x) % half) + 'px'; } }
      });
      rail.addEventListener('mouseenter', function () { tween.timeScale(0.15); });
      rail.addEventListener('mouseleave', function () { tween.timeScale(1); });
    });

    /* 9e. Horizon strip — scroll scrubs the graticule sideways. This is
       the page's "look around" gesture, done in line art rather than pixels. */
    $$('[data-horizon]').forEach(function (strip) {
      var belt = strip.querySelector('.f360-horizon__belt');
      if (!belt) { return; }
      gsap.fromTo(belt, { xPercent: 0 }, {
        xPercent: -50, ease: 'none',
        scrollTrigger: { trigger: strip, start: 'top bottom', end: 'bottom top', scrub: 0.6 }
      });
    });

    /* 9f. Plates drift a few pixels against the scroll — depth, not parallax theatre. */
    $$('[data-parallax]').forEach(function (el) {
      var amount = parseFloat(el.getAttribute('data-parallax')) || 24;
      gsap.fromTo(el, { y: amount }, {
        y: -amount, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.8 }
      });
    });

    /* 9g. Opener lines rise on load. */
    var opener = $('[data-opener]');
    if (opener) {
      var lines = $$('[data-opener-line]', opener);
      if (lines.length) {
        gsap.set(lines, { yPercent: 108, opacity: 0 });
        gsap.to(lines, {
          yPercent: 0, opacity: 1, duration: 1.05, ease: 'power3.out', stagger: 0.085, delay: 0.1
        });
      }
    }
  }

  /* Reduced-motion can be switched on mid-session. */
  if (reduceQuery.addEventListener) {
    reduceQuery.addEventListener('change', function (e) {
      if (e.matches && hasGSAP) {
        window.gsap.globalTimeline.clear();
        if (hasST) { window.ScrollTrigger.getAll().forEach(function (t) { t.kill(); }); }
        $$('[data-reveal], [data-opener-line]').forEach(function (el) {
          el.style.opacity = '1'; el.style.transform = 'none';
        });
        REDUCED = true;
      }
    });
  }

  function boot() {
    markCurrent();
    initNav();
    initRunningHead();
    initAccordions();
    initForms();
    initClocks();
    initToolbar();
    initYear();
    initMotion();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
