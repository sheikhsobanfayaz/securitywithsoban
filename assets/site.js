/* ==============================================================================
   SECURITYWITHSOBAN - CORE UI, MOTION GRAPHICS & ZERO-SHIFT DECODE
   ============================================================================== */

function initThemeManager() {
  document.documentElement.setAttribute('data-theme', 'dark');
  try { localStorage.setItem('soban_theme', 'dark'); } catch (e) {}
}

function initHeaderScrollState() {
  const island = document.querySelector('.nav-island');
  if (!island) return;
  const update = () => {
    island.classList.toggle('scrolled', (window.scrollY || 0) > 24);
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
}

function initMobileMenu() {
  const btn = document.getElementById('hamburgerBtn');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = menu.classList.toggle('open');
    btn.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      menu.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

function initSpotlights() {
  const isTouch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  document.querySelectorAll('.card.spotlight, .bento-card').forEach(card => {
    if (card.dataset.spotlightBound === '1') return;
    card.dataset.spotlightBound = '1';

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', x + 'px');
      card.style.setProperty('--mouse-y', y + 'px');

      if (!isTouch && card.classList.contains('tilt-card')) {
        const px = (x / rect.width - 0.5) * 2;
        const py = (y / rect.height - 0.5) * 2;
        card.style.transform = `perspective(900px) rotateX(${(-py * 2.2).toFixed(2)}deg) rotateY(${(px * 2.2).toFixed(2)}deg) translateY(-4px)`;
      }
    });

    card.addEventListener('mouseleave', () => {
      if (card.classList.contains('tilt-card')) {
        card.style.transform = '';
      }
    });
  });
}

/* Zero-layout-shift cyber text decode: locks exact word widths & line breaks so mobile never jumps */
function initDecryptedText() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const els = document.querySelectorAll('[data-scramble]');
  if (!els.length) return;

  const glyphs = '01|/:+-_~';
  const fontsReady = document.fonts && document.fonts.ready
    ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 350))])
    : Promise.resolve();

  fontsReady.then(() => {
    els.forEach(el => {
      if (el.dataset.scrambleDone === '1') return;
      el.dataset.scrambleDone = '1';

      // Extract plain text per <br> line safely (never exposes HTML tag attributes)
      const rawLines = el.innerHTML.split(/<br\s*\/?>/i).map(chunk => {
        const tmp = document.createElement('div');
        tmp.innerHTML = chunk;
        return (tmp.textContent || '').replace(/\s+/g, ' ').trim();
      }).filter(Boolean);

      if (!rawLines.length) return;

      // Render word spans first to measure exact final pixel width per word
      el.innerHTML = '';
      const wordEntries = [];
      rawLines.forEach((line, lineIdx) => {
        if (lineIdx > 0) el.appendChild(document.createElement('br'));
        const words = line.split(' ');
        words.forEach((word, wIdx) => {
          if (wIdx > 0) el.appendChild(document.createTextNode(' '));
          const span = document.createElement('span');
          span.textContent = word;
          el.appendChild(span);
          wordEntries.push({ span, text: word });
        });
      });

      const finalHeight = el.getBoundingClientRect().height;
      el.style.minHeight = finalHeight + 'px';

      // Lock each word's exact pixel width so scrambling never alters line wrapping
      const widths = wordEntries.map(entry => entry.span.getBoundingClientRect().width);
      wordEntries.forEach((entry, idx) => {
        entry.span.style.display = 'inline-block';
        entry.span.style.width = widths[idx] + 'px';
        entry.span.style.whiteSpace = 'nowrap';
        entry.span.style.overflow = 'hidden';
        entry.span.style.verticalAlign = 'bottom';
      });

      const totalChars = wordEntries.reduce((acc, e) => acc + e.text.length, 0);
      let revealed = 0;

      const timer = setInterval(() => {
        let cursor = 0;
        wordEntries.forEach(entry => {
          const target = entry.text;
          let out = '';
          for (let i = 0; i < target.length; i++) {
            if (cursor + i < revealed) {
              out += target[i];
            } else {
              out += glyphs[Math.floor(Math.random() * glyphs.length)];
            }
          }
          entry.span.textContent = out;
          cursor += target.length;
        });

        revealed += 2;
        if (revealed > totalChars + 2) {
          clearInterval(timer);
          wordEntries.forEach(entry => {
            entry.span.textContent = entry.text;
            entry.span.style.display = '';
            entry.span.style.width = '';
            entry.span.style.whiteSpace = '';
            entry.span.style.overflow = '';
            entry.span.style.verticalAlign = '';
          });
          el.style.minHeight = '';
        }
      }, 26);
    });
  });
}

/* Scroll-triggered Reveal Motion Graphics */
function initScrollReveals() {
  const autoTargets = document.querySelectorAll(
    '.sec, .card, .bento-card, .metric-bento-card, .connect-item, .stat-box, .section-block, .soc-terminal-wrap, .tool-card'
  );
  autoTargets.forEach((el) => {
    if (!el.hasAttribute('data-reveal')) {
      el.setAttribute('data-reveal', '');
    }
  });

  document.querySelectorAll('.exp-grid, .methodology-grid, .cap-grid, .projects-grid, .mitre-grid, .bento-grid, .telemetry-grid, .stats-strip, .tools-grid').forEach(grid => {
    Array.from(grid.children).forEach((child, idx) => {
      if (child.hasAttribute('data-reveal')) {
        child.style.setProperty('--reveal-delay', Math.min(idx * 75, 420) + 'ms');
      }
    });
  });

  const nodes = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window)) {
    nodes.forEach(n => n.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  nodes.forEach(n => observer.observe(n));
}

/* Animated Stat Counters */
function initStatCounters() {
  const els = document.querySelectorAll('[data-count]');
  if (!els.length) return;
  const animate = (el) => {
    if (el.dataset.counted === '1') return;
    el.dataset.counted = '1';
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';
    const duration = 900;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (!('IntersectionObserver' in window)) {
    els.forEach(animate);
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animate(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  els.forEach(el => io.observe(el));
}

/* Dynamic Cyber Constellation Motion Background (Orange / Ember Tone) */
function initCyberMotionCanvas() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (document.getElementById('cyberMotionCanvas')) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'cyberMotionCanvas';
  canvas.className = 'cyber-motion-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(canvas, document.body.firstChild.nextSibling);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let w = 0, h = 0, dpr = 1;
  const isMobile = window.innerWidth < 768;
  const count = isMobile ? 20 : 36;
  const maxDist = isMobile ? 110 : 145;
  const mouse = { x: -9999, y: -9999 };
  const nodes = [];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  for (let i = 0; i < count; i++) {
    nodes.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.42,
      vy: (Math.random() - 0.5) * 0.42,
      r: 1.3 + Math.random() * 1.4
    });
  }

  if (!isMobile) {
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });
  }

  let rafId = null;
  function tick() {
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      n.x += n.vx;
      n.y += n.vy;

      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;

      const dxM = mouse.x - n.x;
      const dyM = mouse.y - n.y;
      const distM = Math.hypot(dxM, dyM);
      if (distM < 160 && distM > 1) {
        n.x -= (dxM / distM) * 0.35;
        n.y -= (dyM / distM) * 0.35;
      }

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(251, 146, 60, 0.52)';
      ctx.fill();

      for (let j = i + 1; j < nodes.length; j++) {
        const m = nodes[j];
        const dist = Math.hypot(n.x - m.x, n.y - m.y);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.22;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(m.x, m.y);
          ctx.strokeStyle = `rgba(249, 115, 22, ${alpha.toFixed(3)})`;
          ctx.lineWidth = 0.85;
          ctx.stroke();
        }
      }

      if (distM < 170) {
        const alpha = (1 - distM / 170) * 0.36;
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = `rgba(251, 146, 60, ${alpha.toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
    rafId = requestAnimationFrame(tick);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    } else if (!document.hidden && !rafId) {
      rafId = requestAnimationFrame(tick);
    }
  });

  rafId = requestAnimationFrame(tick);
}

function initReadingProgress() {
  const bar = document.querySelector('.scroll-progress-bar');
  if (!bar) return;
  const update = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = Math.min(100, Math.max(0, progress)) + '%';
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
}

function copyCodeText(btn) {
  const codeBlock = btn.closest('.code-block-wrap').querySelector('.code-block');
  if (!codeBlock) return;
  const text = codeBlock.innerText;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      const old = btn.innerText;
      btn.innerText = '✔ Copied!';
      setTimeout(() => { btn.innerText = old; }, 2000);
    });
  } else {
    fallbackCopy(text);
  }
}

function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

function copyEmail(email) {
  const target = email || 'sheikhsobanfayaz@gmail.com';
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(target).then(() => showToast('Copied: ' + target)).catch(() => fallbackCopy(target));
  } else {
    fallbackCopy(target);
  }
}

function fallbackCopy(text) {
  const el = document.createElement('textarea');
  el.value = text;
  document.body.appendChild(el);
  el.select();
  try {
    document.execCommand('copy');
    showToast('Copied: ' + text);
  } catch (e) {
    showToast('Value: ' + text);
  }
  document.body.removeChild(el);
}

function initVideoBackground() {
  const vid = document.querySelector('.cyber-video-bg');
  if (!vid) return;
  const promise = vid.play();
  if (promise !== undefined) {
    promise.catch(() => {
      const playOnTouch = () => {
        vid.play();
        document.removeEventListener('click', playOnTouch);
        document.removeEventListener('touchstart', playOnTouch);
      };
      document.addEventListener('click', playOnTouch);
      document.addEventListener('touchstart', playOnTouch);
    });
  }
}

function initBackToTop() {
  const btn = document.getElementById('backToTopBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initThemeManager();
  initHeaderScrollState();
  initMobileMenu();
  initDecryptedText();
  initSpotlights();
  initScrollReveals();
  initStatCounters();
  initCyberMotionCanvas();
  initReadingProgress();
  initVideoBackground();
  initBackToTop();
});
