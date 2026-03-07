/* ════════════════════════════════════════════════════════════
   script.js — Portfolio Interactions
   ════════════════════════════════════════════════════════════ */
'use strict';

/* ── Nav scroll ─────────────────────────────────────────────── */
(function () {
  const nav = document.getElementById('nav');
  const tick = () => nav.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', tick, { passive: true });
  tick();
})();

/* ── Hamburger ──────────────────────────────────────────────── */
(function () {
  const btn   = document.getElementById('hamburger');
  const links = document.getElementById('nav-links');
  if (!btn || !links) return;

  function setOpen(open) {
    links.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
    const [s1, s2, s3] = btn.querySelectorAll('span');
    s1.style.transform = open ? 'translateY(7.25px) rotate(45deg)' : '';
    s2.style.opacity   = open ? '0' : '';
    s3.style.transform = open ? 'translateY(-7.25px) rotate(-45deg)' : '';
  }

  btn.addEventListener('click', () => setOpen(links.classList.contains('open') ? false : true));
  links.querySelectorAll('.nav-link').forEach(a => a.addEventListener('click', () => setOpen(false)));
})();

/* ── Scroll reveal (data-anim + data-delay) ─────────────────── */
(function () {
  const reveals = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const delay = parseInt(el.dataset.delay ?? '0', 10);
      setTimeout(() => el.classList.add('is-visible'), delay);
      io.unobserve(el);
    });
  }, { threshold: 0.10, rootMargin: '0px 0px -50px 0px' });

  reveals.forEach(el => io.observe(el));
})();

/* ── Active nav link highlight ──────────────────────────────── */
(function () {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');
  if (!sections.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(l => {
        l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id);
      });
    });
  }, { rootMargin: '-38% 0px -38% 0px' });

  sections.forEach(s => io.observe(s));
})();

/* ── Hero canvas — animated node graph ──────────────────────── */
(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, nodes = [], raf;

  const N = 40;

  function resize() {
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initNodes();
  }

  function initNodes() {
    nodes = Array.from({ length: N }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      r:  1.2 + Math.random() * 2,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.22,
      ph: Math.random() * Math.PI * 2,
      hue: Math.random() > 0.5 ? 210 : 260,  // blue or purple
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Edges
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d  = Math.hypot(dx, dy);
        if (d > 150) continue;
        const a = (1 - d / 150) * 0.13;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(88,166,255,${a})`;
        ctx.lineWidth = 0.8;
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }

    // Nodes
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${n.hue}, 90%, 70%, 0.55)`;
      ctx.fill();
    });
  }

  function update() {
    nodes.forEach(n => {
      n.ph += 0.014;
      n.x  += n.vx;
      n.y  += n.vy + Math.sin(n.ph) * 0.12;
      if (n.x < -8)    n.x = W + 8;
      if (n.x > W + 8) n.x = -8;
      if (n.y < -8)    n.y = H + 8;
      if (n.y > H + 8) n.y = -8;
    });
  }

  function loop() { update(); draw(); raf = requestAnimationFrame(loop); }

  // Orb mouse parallax
  const orb = document.getElementById('orb-scene');
  document.addEventListener('mousemove', e => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const mx = (e.clientX - cx) / cx;
    const my = (e.clientY - cy) / cy;
    if (orb) orb.style.transform = `rotateY(${mx * 9}deg) rotateX(${-my * 7}deg)`;
  });

  // Resize
  const ro = new ResizeObserver(() => { cancelAnimationFrame(raf); resize(); loop(); });
  ro.observe(document.documentElement);
  resize();
  loop();
})();

/* ── Subtle parallax on blob-style hero bg ──────────────────── */
(function () {
  const canvas = document.getElementById('hero-canvas');
  window.addEventListener('scroll', () => {
    if (canvas) canvas.style.transform = `translateY(${window.scrollY * 0.08}px)`;
  }, { passive: true });
})();
