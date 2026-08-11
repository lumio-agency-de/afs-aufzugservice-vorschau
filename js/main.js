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

  /* Anker-Links: natives, weiches Springen — das Scrollrad bleibt unangetastet */
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var t = document.querySelector(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  /* ── Nav-Zustand ── */
  var nav = document.querySelector('[data-nav]');
  function onScrollNav(){
    if (window.scrollY > 40) nav.classList.add('is-scrolled');
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

  /* ── Etagen-Anzeige ── */
  var floorChars = { hero: 'E', wartung: '1', reparatur: '2', umbau: '3', ueberuns: '4', kontakt: '5' };
  var display = document.querySelector('[data-floor]');
  var arrow = document.querySelector('[data-arrow]');
  var stops = document.querySelectorAll('.lift-panel__stops li');
  var lastY = window.scrollY;

  function setFloor(key){
    if (!display || display.textContent === floorChars[key]) return;
    display.textContent = floorChars[key];
    stops.forEach(function(li){ li.classList.toggle('is-on', li.dataset.stop === key); });
  }

  var floorIO = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if (en.isIntersecting) setFloor(en.target.dataset.floorStop);
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  document.querySelectorAll('[data-floor-stop]').forEach(function(s){ floorIO.observe(s); });

  window.addEventListener('scroll', function(){
    if (!arrow) return;
    var y = window.scrollY;
    arrow.classList.toggle('is-down', y > lastY);
    lastY = y;
  }, { passive: true });
})();
