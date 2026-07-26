/* =========================================================================
   360Folio — Direction A "Aperture" — main.js
   Vanilla. No modules, no build step. GSAP + ScrollTrigger are optional:
   every feature below degrades to a working, visible, keyboard-usable page
   if the CDN fails or the visitor prefers reduced motion.
   ========================================================================= */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var hasGSAP = typeof window.gsap !== 'undefined';
  var hasST = hasGSAP && typeof window.ScrollTrigger !== 'undefined';
  var animate = hasGSAP && !reduceMotion;

  /* ---------------------------------------------------------------------
     1. Current page highlighting.
     Header markup is byte-identical on every page (it becomes header.php),
     so the active link is resolved at runtime rather than authored in.
     --------------------------------------------------------------------- */
  function markCurrent() {
    var here = window.location.pathname.split('/').pop() || 'index.html';
    var links = doc.querySelectorAll('.f360-nav__link');
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute('href');
      if (!href || href.charAt(0) === '#') continue;
      if (href === here) {
        links[i].classList.add('f360-nav__link--current');
        links[i].setAttribute('aria-current', 'page');
      }
    }
  }

  /* ---------------------------------------------------------------------
     2. Mobile navigation + submenu disclosures.
     Disclosure buttons are injected, not authored, so the source nav stays
     a plain <ul><li><a> tree that wp_nav_menu() can output verbatim.
     --------------------------------------------------------------------- */
  function initNav() {
    var toggle = doc.querySelector('[data-f360-navtoggle]');
    var nav = doc.getElementById('f360-nav');
    if (!nav) return;

    if (toggle) {
      toggle.addEventListener('click', function () {
        var open = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!open));
        nav.classList.toggle('f360-nav--open', !open);
        doc.body.style.overflow = !open ? 'hidden' : '';
      });
    }

    function closeNav() {
      if (!toggle) return;
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('f360-nav--open');
      doc.body.style.overflow = '';
    }

    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeNav();
        var open = doc.querySelectorAll('.f360-nav__item--open');
        for (var i = 0; i < open.length; i++) {
          open[i].classList.remove('f360-nav__item--open');
          var b = open[i].querySelector('.f360-nav__disc');
          if (b) b.setAttribute('aria-expanded', 'false');
        }
      }
    });

    // Inject a disclosure control for each nested <ul>.
    var subs = nav.querySelectorAll('.f360-nav__item > ul');
    for (var i = 0; i < subs.length; i++) {
      (function (sub) {
        var item = sub.parentNode;
        var label = item.querySelector('.f360-nav__link');
        var btn = doc.createElement('button');
        btn.type = 'button';
        btn.className = 'f360-nav__disc f360-sr';
        btn.setAttribute('aria-expanded', 'false');
        btn.textContent = 'Toggle ' + (label ? label.textContent : '') + ' submenu';
        btn.addEventListener('click', function () {
          var open = item.classList.toggle('f360-nav__item--open');
          btn.setAttribute('aria-expanded', String(open));
        });
        item.insertBefore(btn, sub);

        // On touch/narrow layouts the parent link acts as the disclosure.
        if (label) {
          label.addEventListener('click', function (e) {
            if (window.matchMedia('(max-width: 1080px)').matches) {
              e.preventDefault();
              btn.click();
            }
          });
        }
      })(subs[i]);
    }
  }

  /* ---------------------------------------------------------------------
     3. Header behaviour — a dolly, not a jump. Hides on descent so the
        full-bleed animation slot is never framed by chrome.
     --------------------------------------------------------------------- */
  function initHeader() {
    var header = doc.getElementById('f360-header');
    if (!header) return;
    var last = window.pageYOffset;
    var ticking = false;

    function update() {
      var y = window.pageYOffset;
      header.classList.toggle('f360-header--stuck', y > 24);
      if (!reduceMotion) {
        var navOpen = header.querySelector('.f360-nav--open');
        var down = y > last && y > 320 && !navOpen;
        header.classList.toggle('f360-header--hidden', down);
      }
      last = y;
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  /* ---------------------------------------------------------------------
     4. Scroll reveals — rack focus.
        Blur + micro-scale + short rise reads as a lens pulling focus,
        not as a UI element sliding in. Nothing bounces.
     --------------------------------------------------------------------- */
  function initReveals() {
    if (!animate || !hasST) return;
    window.gsap.registerPlugin(window.ScrollTrigger);
    root.classList.add('f360-js');

    var items = doc.querySelectorAll('[data-f360-reveal]');
    for (var i = 0; i < items.length; i++) {
      (function (el) {
        var kids = el.hasAttribute('data-f360-stagger')
          ? el.children
          : [el];
        window.gsap.set(el, { opacity: 1 });
        window.gsap.fromTo(kids,
          { opacity: 0, y: 26, scale: 0.994, filter: 'blur(7px)' },
          {
            opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
            duration: 1.05,
            ease: 'power3.out',
            stagger: el.hasAttribute('data-f360-stagger') ? 0.08 : 0,
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              once: true
            }
          });
      })(items[i]);
    }
  }

  /* ---------------------------------------------------------------------
     5. Hero parallax — a slow push-in on the light, nothing else moves.
     --------------------------------------------------------------------- */
  function initParallax() {
    if (!animate || !hasST) return;
    var glows = doc.querySelectorAll('[data-f360-parallax]');
    for (var i = 0; i < glows.length; i++) {
      window.gsap.to(glows[i], {
        yPercent: 16,
        scale: 1.12,
        ease: 'none',
        scrollTrigger: {
          trigger: glows[i].parentNode,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6
        }
      });
    }
  }

  /* ---------------------------------------------------------------------
     6. Counters. Falls back to the authored final value in the HTML.
     --------------------------------------------------------------------- */
  function initCounters() {
    var els = doc.querySelectorAll('[data-f360-count]');
    if (!els.length) return;
    if (!animate || !hasST) return;

    for (var i = 0; i < els.length; i++) {
      (function (el) {
        var target = parseFloat(el.getAttribute('data-f360-count'));
        var decimals = (el.getAttribute('data-f360-decimals') | 0);
        var obj = { v: 0 };
        window.gsap.to(obj, {
          v: target,
          duration: 1.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          onUpdate: function () {
            el.textContent = obj.v.toFixed(decimals);
          },
          onComplete: function () {
            el.textContent = target.toFixed(decimals);
          }
        });
      })(els[i]);
    }
  }

  /* ---------------------------------------------------------------------
     7. Accordion group controls (Open all / Close all).
        The panels themselves are native <details> — no JS required to use.
     --------------------------------------------------------------------- */
  function initAccordions() {
    var groups = doc.querySelectorAll('[data-f360-acc]');
    for (var i = 0; i < groups.length; i++) {
      (function (group) {
        var items = group.querySelectorAll('details');
        var tools = doc.querySelectorAll('[data-f360-acc-tool][data-target="' + group.id + '"]');
        for (var t = 0; t < tools.length; t++) {
          (function (tool) {
            tool.addEventListener('click', function () {
              var open = tool.getAttribute('data-f360-acc-tool') === 'open';
              for (var k = 0; k < items.length; k++) items[k].open = open;
              if (hasST) window.ScrollTrigger.refresh();
            });
          })(tools[t]);
        }
        if (hasST) {
          for (var j = 0; j < items.length; j++) {
            items[j].addEventListener('toggle', function () {
              window.ScrollTrigger.refresh();
            });
          }
        }
      })(groups[i]);
    }
  }

  /* ---------------------------------------------------------------------
     8. Form UX.
        Validation is driven entirely by [required] / type, never by input
        order or DOM position — the markup is replaced by Contact Form 7 /
        WPForms later and must not break when the field order changes.
     --------------------------------------------------------------------- */
  function initForms() {
    var forms = doc.querySelectorAll('[data-f360-form]');
    for (var i = 0; i < forms.length; i++) {
      (function (form) {
        var status = form.querySelector('[data-f360-status]');

        function fieldOf(input) {
          return input.closest ? input.closest('.f360-field') : null;
        }

        function validate(input) {
          var wrap = fieldOf(input);
          if (!wrap) return true;
          var ok = input.checkValidity && input.checkValidity();
          if (input.hasAttribute('required') && !String(input.value).trim()) ok = false;
          wrap.classList.toggle('f360-field--invalid', !ok);
          input.setAttribute('aria-invalid', ok ? 'false' : 'true');
          return ok;
        }

        var controls = form.querySelectorAll('input, select, textarea');
        for (var c = 0; c < controls.length; c++) {
          (function (input) {
            input.addEventListener('blur', function () {
              if (String(input.value).trim() || input.hasAttribute('required')) validate(input);
            });
            input.addEventListener('input', function () {
              var wrap = fieldOf(input);
              if (wrap && wrap.classList.contains('f360-field--invalid')) validate(input);
            });
          })(controls[c]);
        }

        form.setAttribute('novalidate', 'novalidate');
        form.addEventListener('submit', function (e) {
          var first = null;
          var all = form.querySelectorAll('input, select, textarea');
          for (var k = 0; k < all.length; k++) {
            if (!validate(all[k]) && !first) first = all[k];
          }
          if (first) {
            e.preventDefault();
            first.focus();
            if (status) {
              status.setAttribute('data-state', 'error');
              status.textContent = 'Some details are missing. Check the highlighted fields.';
            }
            return;
          }
          // No back end in the static template — WordPress takes over here.
          e.preventDefault();
          if (status) {
            status.setAttribute('data-state', 'ok');
            status.textContent = 'Thank you. Your enquiry is queued — we reply the same working day with a fixed quote.';
          }
          form.reset();
        });
      })(forms[i]);
    }
  }

  /* ---------------------------------------------------------------------
     9. Footer year.
     --------------------------------------------------------------------- */
  function initYear() {
    var y = doc.querySelectorAll('[data-f360-year]');
    for (var i = 0; i < y.length; i++) y[i].textContent = String(new Date().getFullYear());
  }

  /* ------------------------------------------------------------------- */
  /* ---------------------------------------------------------------------
     10. Edition switch — night (default) / day.
     The palette lives entirely in semantic custom properties, so flipping
     one attribute on <html> re-renders every component with no per-component
     work. Stored per visitor; applied before paint by the inline bootstrap
     in <head> so the day edition never flashes dark.
     --------------------------------------------------------------------- */
  function currentEdition() {
    var set = root.getAttribute('data-f360-theme');
    if (set) return set;
    return window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function initEdition() {
    var btns = doc.querySelectorAll('[data-f360-edition]');
    if (!btns.length) return;

    function paint() {
      var now = currentEdition();
      for (var i = 0; i < btns.length; i++) {
        var label = btns[i].querySelector('[data-f360-edition-label]');
        if (label) label.textContent = now === 'light' ? 'Day' : 'Night';
        btns[i].setAttribute('aria-pressed', now === 'dark' ? 'true' : 'false');
        btns[i].setAttribute('aria-label',
          'Colour edition: ' + (now === 'light' ? 'day' : 'night') +
          '. Switch to ' + (now === 'light' ? 'night' : 'day') + '.');
      }
    }

    for (var j = 0; j < btns.length; j++) {
      btns[j].addEventListener('click', function () {
        var next = currentEdition() === 'light' ? 'dark' : 'light';
        root.setAttribute('data-f360-theme', next);
        try { window.localStorage.setItem('f360-theme', next); } catch (e) {}
        paint();
      });
    }
    paint();
  }

  function boot() {
    initEdition();
    markCurrent();
    initNav();
    initHeader();
    initAccordions();
    initForms();
    initYear();
    initReveals();
    initParallax();
    initCounters();
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
