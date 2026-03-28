/* ============================================
   BANGKOK ELITES — main.js (all 7 crazy animations)
   ============================================ */
(function () {
  'use strict';

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);


  /* ── SCROLL VELOCITY TRACKER (for marquee) ── */
  let scrollVelocity = 0;
  let _lastSY = 0;
  let _lastST = performance.now();
  window.addEventListener('scroll', () => {
    const now = performance.now();
    const dt  = now - _lastST || 16;
    scrollVelocity = ((window.scrollY - _lastSY) / dt) * 16;
    _lastSY = window.scrollY;
    _lastST = now;
  }, { passive: true });

  /* ── GSAP + SCROLLTRIGGER ── */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    /* ═══════════════════════════════════════════
       HERO ENTRANCE + TEXT GLITCH / SCRAMBLE [1,2]
    ═══════════════════════════════════════════ */
    const GLITCH_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@!%&';
    function scramble(el, finalText, duration) {
      const frames  = Math.round(duration * 60);
      const len     = finalText.length;
      let   f       = 0;
      const tick = () => {
        f++;
        const p = f / frames;
        el.textContent = finalText.split('').map((ch, i) => {
          if (p > i / len + 0.05) return ch;
          return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        }).join('');
        if (f < frames) requestAnimationFrame(tick);
        else el.textContent = finalText;
      };
      requestAnimationFrame(tick);
    }

    const heroTl = gsap.timeline({ delay: 2.6 });

    const eyebrow = document.querySelector('.hero-eyebrow');
    if (eyebrow) {
      gsap.set(eyebrow, { y: 28, opacity: 0 });
      heroTl.to(eyebrow, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, 0);
    }

    const headline = document.getElementById('heroHeadline');
    let   heroWords = [];
    if (headline) {
      heroWords = headline.textContent.trim().split(/\s+/);
      headline.innerHTML = heroWords
        .map(w => `<span class="hero-word"><span class="hero-word-inner">${w}</span></span>`)
        .join(' ');
      const inners = headline.querySelectorAll('.hero-word-inner');
      gsap.set(inners, { y: '110%' });
      heroTl.to(inners, { y: '0%', duration: 0.9, ease: 'power4.out', stagger: 0.1 }, 0.15);

      // EFFECT 1 — Scramble each word after it slides into view
      inners.forEach((inner, i) => {
        const word = heroWords[i];
        const fireAt = (2.6 + 0.15 + 0.9 + i * 0.1 + 0.2) * 1000;
        setTimeout(() => scramble(inner, word, 0.65), fireAt);
      });
    }

    const heroPara = document.querySelector('.hero p');
    if (heroPara) {
      gsap.set(heroPara, { y: 30, opacity: 0 });
      heroTl.to(heroPara, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, 0.7);
    }

    const heroBtns = document.querySelectorAll('.hero-actions .btn');
    if (heroBtns.length) {
      gsap.set(heroBtns, { y: 24, opacity: 0 });
      heroTl.to(heroBtns, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.14 }, 0.95);
    }

    /* ═══════════════════════════════════════════
       HERO BLOB PARALLAX (scrub)
    ═══════════════════════════════════════════ */
    gsap.to('.hero-blob-1', {
      y: -180, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.8 }
    });
    gsap.to('.hero-blob-2', {
      y: -100, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 2.4 }
    });
    gsap.to('.hero-content', {
      y: 80, opacity: 0, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: '60% top', scrub: 1.2 }
    });

    /* ═══════════════════════════════════════════
       EFFECT 3 — MOUSE-TILT PARALLAX ON HERO
    ═══════════════════════════════════════════ */
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
      let heroRaf;
      heroSection.addEventListener('mousemove', e => {
        const r  = heroSection.getBoundingClientRect();
        const mx = (e.clientX - r.left) / r.width  - 0.5; // -0.5 to 0.5
        const my = (e.clientY - r.top)  / r.height - 0.5;
        cancelAnimationFrame(heroRaf);
        heroRaf = requestAnimationFrame(() => {
          gsap.to('.hero-blob-1', { x: mx * -60, y: my * -40, duration: 1.8, ease: 'power2.out', overwrite: 'auto' });
          gsap.to('.hero-blob-2', { x: mx *  40, y: my *  30, duration: 2.2, ease: 'power2.out', overwrite: 'auto' });
          gsap.to('.hero-blob-3', { x: mx *  80, y: my *  60, duration: 1.4, ease: 'power2.out', overwrite: 'auto' });
          gsap.to('.hero-content',{ x: mx * -10, y: my * -8,  duration: 1.6, ease: 'power2.out', overwrite: 'auto' });
        });
      });
      heroSection.addEventListener('mouseleave', () => {
        gsap.to(['.hero-blob-1','.hero-blob-2','.hero-blob-3','.hero-content'], {
          x: 0, duration: 1.4, ease: 'power2.out', overwrite: 'auto'
        });
      });
    }

    /* ═══════════════════════════════════════════
       EFFECT 7 — DIAGONAL CLIP-PATH REVEALS
       (about h2 + training h2)
    ═══════════════════════════════════════════ */
    function diagonalReveal(el, timeline, position) {
      if (!el) return;
      gsap.set(el, { clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)' });
      timeline.to(el, {
        clipPath: 'polygon(0% 0%, 105% 0%, 100% 100%, -5% 100%)',
        duration: 1.0, ease: 'power3.inOut'
      }, position);
    }

    /* ─── ABOUT SECTION ─── */
    const aboutEl = document.getElementById('about');
    if (aboutEl) {
      const hdr   = document.getElementById('aboutHeader');
      const eb    = hdr && hdr.querySelector('.eyebrow');
      const h2    = hdr && hdr.querySelector('h2');
      const divEl = hdr && hdr.querySelector('.divider');
      const paras = hdr && hdr.querySelectorAll('p');

      const tl = gsap.timeline({ scrollTrigger: { trigger: aboutEl, start: 'top 72%' } });
      if (eb) { gsap.set(eb, { y: 20, opacity: 0 }); tl.to(eb, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, 0); }
      diagonalReveal(h2, tl, 0.1);
      if (divEl) {
        gsap.set(divEl, { scaleX: 0, transformOrigin: 'left center' });
        tl.to(divEl, { scaleX: 1, duration: 0.65, ease: 'power2.out' }, 0.55);
      }
      if (paras && paras.length) {
        gsap.set(paras, { y: 28, opacity: 0 });
        tl.to(paras, { y: 0, opacity: 1, duration: 0.75, ease: 'power3.out', stagger: 0.18 }, 0.65);
      }
    }

    /* ═══════════════════════════════════════════
       EFFECT 6 — CHARACTER SCATTER ON PILLARS
    ═══════════════════════════════════════════ */
    const pillars = document.querySelectorAll('.pillar');
    if (pillars.length) {
      // Split each h3 into .c-char spans
      pillars.forEach(pillar => {
        const h3 = pillar.querySelector('h3');
        if (!h3) return;
        const txt = h3.textContent;
        h3.innerHTML = txt.split('').map(ch =>
          ch === ' ' ? '&nbsp;' : `<span class="c-char">${ch}</span>`
        ).join('');
      });

      gsap.set(pillars, { y: 60, opacity: 0 });
      ScrollTrigger.create({
        trigger: '#pillars',
        start: 'top 70%',
        onEnter: () => {
          gsap.to(pillars, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.18 });

          // Scatter each pillar's chars in from random offsets
          pillars.forEach((pillar, pi) => {
            const chars = pillar.querySelectorAll('.c-char');
            chars.forEach(ch => {
              gsap.from(ch, {
                x:        (Math.random() - 0.5) * 320,
                y:        (Math.random() - 0.5) * 180,
                rotation: (Math.random() - 0.5) * 80,
                opacity:  0,
                duration: 0.75 + Math.random() * 0.35,
                ease:     'power3.out',
                delay:    pi * 0.18 + Math.random() * 0.35
              });
            });
          });
        }
      });

      // Number count-up
      pillars.forEach((pillar, i) => {
        const numEl = pillar.querySelector('.pillar-num');
        if (!numEl) return;
        ScrollTrigger.create({
          trigger: pillar, start: 'top 75%',
          onEnter: () => {
            const target = i + 1; let current = 0;
            const step = () => {
              current++;
              numEl.textContent = String(current).padStart(2, '0');
              if (current < target) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
          }
        });
      });
    }

    /* ═══════════════════════════════════════════
       TRAINING HEADER + CARDS (diagonal reveal)
    ═══════════════════════════════════════════ */
    const trainingEl = document.getElementById('training');
    if (trainingEl) {
      const hdr2 = document.getElementById('trainingHeader');
      const eb2  = hdr2 && hdr2.querySelector('.eyebrow');
      const h2b  = hdr2 && hdr2.querySelector('h2');
      const div2 = hdr2 && hdr2.querySelector('.divider');

      const tl2 = gsap.timeline({ scrollTrigger: { trigger: trainingEl, start: 'top 72%' } });
      if (eb2) { gsap.set(eb2, { y: 20, opacity: 0 }); tl2.to(eb2, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, 0); }
      diagonalReveal(h2b, tl2, 0.1);
      if (div2) {
        gsap.set(div2, { scaleX: 0, transformOrigin: 'left center' });
        tl2.to(div2, { scaleX: 1, duration: 0.65, ease: 'power2.out' }, 0.55);
      }

      const cards = trainingEl.querySelectorAll('.perk-card');
      if (cards.length) {
        gsap.set(cards, { y: 70, opacity: 0, rotation: 3 });
        ScrollTrigger.create({
          trigger: trainingEl, start: 'top 60%',
          onEnter: () => gsap.to(cards, {
            y: 0, opacity: 1, rotation: 0,
            duration: 1.0, ease: 'power3.out', stagger: 0.16
          })
        });
      }
    }

    /* ─── CTA SECTION ─── */
    const ctaContent = document.getElementById('ctaContent');
    if (ctaContent) {
      gsap.set(ctaContent, { y: 50, opacity: 0, scale: 0.96 });
      ScrollTrigger.create({
        trigger: '#join', start: 'top 68%',
        onEnter: () => gsap.to(ctaContent, { y: 0, opacity: 1, scale: 1, duration: 1.1, ease: 'power3.out' })
      });
    }

    /* ─── FOOTER REVEAL ─── */
    const footerMain = document.querySelector('.footer-main .container');
    if (footerMain) {
      gsap.set(footerMain, { y: 40, opacity: 0 });
      ScrollTrigger.create({
        trigger: '.footer', start: 'top 85%',
        onEnter: () => gsap.to(footerMain, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' })
      });
    }

    /* ═══════════════════════════════════════════
       EFFECT 2 — SCROLL-REACTIVE MARQUEE
    ═══════════════════════════════════════════ */
    const marqueeTrack = document.querySelector('.marquee-track');
    if (marqueeTrack) {
      let mX       = 0;
      const BASE   = 0.55;        // px per frame base speed
      const BOOST  = 0.5;         // scroll velocity multiplier

      gsap.ticker.add(() => {
        const vel = Math.max(-8, Math.min(8, scrollVelocity)); // clamp
        mX -= BASE + vel * BOOST;
        // Wrap: total track = 2× one set, so wrap at half scrollWidth
        const half = marqueeTrack.scrollWidth / 2;
        if (mX <= -half) mX += half;
        if (mX > 0)      mX -= half;
        gsap.set(marqueeTrack, { x: mX });
      });
    }

  } // end GSAP block


  /* ═══════════════════════════════════════════
     EFFECT 5 — PARTICLE BURST ON CTA CLICK
  ═══════════════════════════════════════════ */
  function burstParticles(btn) {
    if (typeof gsap === 'undefined') return;
    const r   = btn.getBoundingClientRect();
    const cx  = r.left + r.width  / 2;
    const cy  = r.top  + r.height / 2;
    const N   = 18;
    const COLORS = ['#f5c53a','#d4920a','#fff','#f5c53a','#ffe87a'];

    for (let i = 0; i < N; i++) {
      const p     = document.createElement('div');
      p.className = 'particle';
      document.body.appendChild(p);
      const angle = (i / N) * Math.PI * 2 + Math.random() * 0.4;
      const dist  = 55 + Math.random() * 100;
      const size  = 4 + Math.random() * 7;
      p.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
      p.style.width  = size + 'px';
      p.style.height = size + 'px';
      gsap.set(p, { x: cx, y: cy, opacity: 1, scale: 0 });
      gsap.to(p, {
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        scale:   1,
        opacity: 0,
        duration: 0.55 + Math.random() * 0.45,
        ease:    'power2.out',
        onComplete: () => p.remove()
      });
    }
  }

  document.querySelectorAll('.btn-primary, .btn-outline').forEach(btn => {
    btn.addEventListener('click', () => burstParticles(btn));
  });

  /* ── CUSTOM CURSOR ── */
  if (window.matchMedia('(pointer: fine)').matches && typeof gsap !== 'undefined') {
    const cursor    = document.getElementById('cursor');
    const cursorDot = document.getElementById('cursorDot');
    if (cursor && cursorDot) {
      document.addEventListener('mousemove', e => {
        gsap.to(cursor,    { x: e.clientX, y: e.clientY, duration: 0.45, ease: 'power3.out' });
        gsap.to(cursorDot, { x: e.clientX, y: e.clientY, duration: 0.1,  ease: 'none' });
        cursor.style.opacity    = '1';
        cursorDot.style.opacity = '1';
      });
      document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
        cursorDot.style.opacity = '0';
      });
      document.querySelectorAll('a, button, .perk-card, .pillar').forEach(el => {
        el.addEventListener('mouseenter', () => gsap.to(cursor, { scale: 2.2, duration: 0.3, ease: 'power2.out' }));
        el.addEventListener('mouseleave', () => gsap.to(cursor, { scale: 1,   duration: 0.3, ease: 'power2.out' }));
      });
    }
  }

  /* ── NAVBAR SCROLL STATE ── */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 40), { passive: true });
  }

  /* ── MOBILE NAV ── */
  const toggle  = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  if (toggle && navMenu) {
    const lockScroll   = () => { document.documentElement.style.overflow = 'hidden'; document.body.style.overflow = 'hidden'; document.body.style.touchAction = 'none'; };
    const unlockScroll = () => { document.documentElement.style.overflow = '';       document.body.style.overflow = '';       document.body.style.touchAction = ''; };
    toggle.addEventListener('click', () => {
      const open = navMenu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      open ? lockScroll() : unlockScroll();
    });
    document.addEventListener('click', e => {
      if (navbar && !navbar.contains(e.target) && navMenu.classList.contains('open')) {
        navMenu.classList.remove('open'); unlockScroll();
      }
    });
    navMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { navMenu.classList.remove('open'); unlockScroll(); }));
  }

  /* ── SMOOTH SCROLL LINKS ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 88, behavior: 'smooth' });
    });
  });

  /* ── MAGNETIC BUTTONS ── */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX - r.left - r.width/2) * 0.10}px, ${(e.clientY - r.top - r.height/2) * 0.10}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });

  /* ── CARD 3D TILT + GLOW ── */
  document.querySelectorAll('.perk-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width;
      const ny = (e.clientY - r.top)  / r.height;
      card.style.transform = `perspective(800px) rotateX(${-(ny-0.5)*5}deg) rotateY(${(nx-0.5)*5}deg) translateY(-6px)`;
      card.style.boxShadow = `${-(nx-0.5)*12}px ${-(ny-0.5)*12}px 32px rgba(15,25,35,0.18)`;
      card.style.setProperty('--glow-x', (nx * 100).toFixed(1) + '%');
      card.style.setProperty('--glow-y', (ny * 100).toFixed(1) + '%');
      card.style.setProperty('--glow-opacity', '1');
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
      card.style.setProperty('--glow-opacity', '0');
    });
  });

  /* ── BACK TO TOP ── */
  const btt = document.querySelector('.back-to-top');
  if (btt) {
    window.addEventListener('scroll', () => btt.classList.toggle('visible', window.scrollY > 400), { passive: true });
    btt.addEventListener('click', e => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── BALL INTRO — GSAP true parabolic arc ── */
  const ballIntro = document.getElementById('ballIntro');
  if (ballIntro && typeof gsap !== 'undefined') {
    const run = () => {
      const vw  = window.innerWidth;
      const vh  = window.innerHeight;
      const dur = 2.2;

      gsap.set(ballIntro, { x: -320, y: vh * 0.75, rotation: 0, scale: 0.7, opacity: 0, filter: 'blur(14px)' });

      const tl = gsap.timeline({ delay: 0.3, onComplete: () => ballIntro.classList.add('done') });
      tl.to(ballIntro, { x: vw + 320,         duration: dur,       ease: 'none'         }, 0);
      tl.to(ballIntro, { y: vh * 0.06,         duration: dur / 2,   ease: 'power2.out'   }, 0);
      tl.to(ballIntro, { y: vh * 0.62,         duration: dur / 2,   ease: 'power2.in'    }, dur / 2);
      tl.to(ballIntro, { rotation: 380,         duration: dur,       ease: 'none'         }, 0);
      tl.to(ballIntro, { scale: 1.1,            duration: dur / 2,   ease: 'power1.out'   }, 0);
      tl.to(ballIntro, { scale: 0.7,            duration: dur / 2,   ease: 'power1.in'    }, dur / 2);
      tl.to(ballIntro, { opacity: 1,            duration: 0.2,       ease: 'none'         }, 0);
      tl.to(ballIntro, { opacity: 0,            duration: 0.3,       ease: 'none'         }, dur - 0.3);
      tl.to(ballIntro, { filter: 'blur(0px)',   duration: 0.4,       ease: 'power2.out'   }, 0);
      tl.to(ballIntro, { filter: 'blur(14px)',  duration: 0.4,       ease: 'power2.in'    }, dur - 0.4);
    };
    if (document.readyState === 'complete') run();
    else window.addEventListener('load', run);
  }

})();
