/* afs Nachlinger GmbH — Interaktion
   Natives Scrollen (kein Smooth-Scroll-Hijack), Etagen-Anzeige, Bild-Slots */
(function(){
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Bild-Slots: Hero sofort, alle anderen erst kurz vor dem Viewport ── */
  function loadSlot(slot){
    var probe = new Image();
    probe.onload = function(){
      var img = document.createElement('img');
      img.decoding = 'async';
      img.src = slot.dataset.img;
      img.alt = slot.dataset.alt || '';
      slot.appendChild(img);
      slot.classList.add('is-loaded');
    };
    probe.src = slot.dataset.img;
  }
  var slotIO = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if (en.isIntersecting){ slotIO.unobserve(en.target); loadSlot(en.target); }
    });
  }, { rootMargin: '900px 0px' });
  document.querySelectorAll('.img-slot[data-img]').forEach(function(slot){
    if (slot.classList.contains('hero__media')) loadSlot(slot);
    else slotIO.observe(slot);
  });

  /* Sprungmarken innerhalb derselben Seite weich anfahren.
     Links auf andere Seiten laufen normal — das Scrollrad bleibt unangetastet. */
  document.querySelectorAll('a[href*="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || !url.hash) return;
      var t = document.querySelector(url.hash);
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
      history.replaceState(null, '', url.hash);
    });
  });

  /* ── Nav-Zustand ── */
  var nav = document.querySelector('[data-nav]');
  /* Seiten ohne dunklen Kopfbereich (Impressum, Datenschutz) tragen data-solid:
     dort bleibt die Leiste dauerhaft dunkel, sonst steht helle Schrift auf Hell. */
  var navSolid = nav.hasAttribute('data-solid');
  function onScrollNav(){
    if (navSolid || window.scrollY > 40) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  }
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  /* ── Reveals ── */
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if (en.isIntersecting){ en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal, .reveal-img').forEach(function(el){ io.observe(el); });

  /* Hero: Wortmarke zuerst, dann die Titelzeilen nacheinander */
  document.querySelectorAll('.hero__inner .line').forEach(function(line, i){
    setTimeout(function(){ line.classList.add('is-in'); }, 250 + i * 140);
  });

  /* ── Mobil-Menü ──
     Auf dem Handy sind die Nav-Links ausgeblendet; die Unterseiten müssen
     trotzdem erreichbar bleiben. */
  var menuBtn = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-menu]');
  if (menuBtn && menu){
    var setMenu = function(open){
      menu.classList.toggle('is-open', open);
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    };
    menuBtn.addEventListener('click', function(){
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', function(e){
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false);
    });
  }

  /* ── Etagen-Anzeige ──
     Jede Seite ist eine Etage (body[data-floor]). Wo mehrere Etagen auf einer
     Seite liegen (Leistungen), zählt die Anzeige beim Scrollen zusätzlich mit. */
  var panel = document.querySelector('.lift-panel');
  if (!panel) return;

  var floorChars = { hero: 'E', wartung: '1', reparatur: '2', umbau: '3', ueberuns: '4', kontakt: '5' };
  var display = panel.querySelector('[data-floor]');
  var arrow = panel.querySelector('[data-arrow]');
  var stops = panel.querySelectorAll('.lift-panel__stops a');
  var lastY = window.scrollY;

  function setFloor(ch){
    if (!display || !ch) return;
    display.textContent = ch;
    stops.forEach(function(a){ a.classList.toggle('is-on', a.dataset.floor === ch); });
  }

  setFloor(document.body.dataset.floor || 'E');

  var sections = document.querySelectorAll('[data-floor-stop]');
  if (sections.length){
    var floorIO = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (en.isIntersecting) setFloor(floorChars[en.target.dataset.floorStop]);
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    sections.forEach(function(s){ floorIO.observe(s); });
  }

  window.addEventListener('scroll', function(){
    if (!arrow) return;
    var y = window.scrollY;
    arrow.classList.toggle('is-down', y > lastY);
    lastY = y;
  }, { passive: true });
})();
