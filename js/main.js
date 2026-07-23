/* afs Nachlinger GmbH — Interaktion
   Lenis + GSAP (ruhiges Motion-Level), Etagen-Anzeige, Bild-Slots */
(function(){
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Bild-Slots: Bild laden, sobald die Datei existiert ── */
  document.querySelectorAll('.img-slot[data-img]').forEach(function(slot){
    var probe = new Image();
    probe.onload = function(){
      var img = document.createElement('img');
      img.src = slot.dataset.img;
      img.alt = slot.dataset.alt || '';
      slot.appendChild(img);
      slot.classList.add('is-loaded');
      if (window.ScrollTrigger) ScrollTrigger.refresh();
      /* Ken-Burns erst, wenn das Hero-Bild wirklich da ist */
      if (slot.classList.contains('hero__media') && !reduced && window.gsap && window.ScrollTrigger){
        gsap.to(img, {
          scale: 1.0, ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
        });
      }
    };
    probe.src = slot.dataset.img;
  });

  /* ── Smooth Scroll (Lenis) ── */
  var lenis = null;
  if (!reduced && window.Lenis){
    lenis = new Lenis({ duration: 1.1, easing: function(t){ return Math.min(1, 1.001 - Math.pow(2, -10 * t)); } });
    window.lenis = lenis;
    if (window.gsap && window.ScrollTrigger){
      gsap.registerPlugin(ScrollTrigger);
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function(t){ lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(t){ lenis.raf(t); requestAnimationFrame(raf); }
      requestAnimationFrame(raf);
    }
  } else if (window.gsap && window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);
  }

  /* Anker-Links smooth */
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var t = document.querySelector(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(t); else t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
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

  /* Hero-Titel: Zeilen nacheinander */
  document.querySelectorAll('.hero__title .line').forEach(function(line, i){
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
