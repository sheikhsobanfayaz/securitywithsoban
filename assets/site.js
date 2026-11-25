/* ==============================================================================
   SECURITYWITHSOBAN - CORE UI, BLUE DARK/LIGHT MODE, PLAYBOOK & ZERO-SHIFT DECODE
   ============================================================================== */

(function applyInitialTheme() {
  try {
    const saved = localStorage.getItem('soban_theme');
    const theme = (saved === 'light' || saved === 'dark') ? saved : 'light';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();

function initThemeManager() {
  const buttons = document.querySelectorAll('[data-theme-toggle]');
  if (!buttons.length) return;

  const sunSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>';
  const moonSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';

  const syncButtons = (theme) => {
    const isLight = theme === 'light';
    buttons.forEach(btn => {
      const iconWrap = btn.querySelector('.theme-icon-wrap');
      const labelEl = btn.querySelector('.theme-toggle-label');
      const fullMode = btn.getAttribute('data-label-mode') === 'full';
      if (iconWrap) iconWrap.innerHTML = isLight ? moonSvg : sunSvg;
      if (labelEl) labelEl.textContent = isLight ? (fullMode ? 'Dark Mode' : 'Dark') : (fullMode ? 'Light Mode' : 'Light');
      btn.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
      btn.setAttribute('title', isLight ? 'Switch to dark mode' : 'Switch to light mode');
    });
  };

  const current = document.documentElement.getAttribute('data-theme') || 'light';
  syncButtons(current);

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const now = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', now);
      try { localStorage.setItem('soban_theme', now); } catch (e) {}
      syncButtons(now);
      showToast(now === 'light' ? 'Light mode enabled' : 'Dark mode enabled');
    });
  });
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
  document.querySelectorAll('.card.spotlight, .bento-card').forEach(card => {
    if (card.dataset.spotlightBound === '1') return;
    card.dataset.spotlightBound = '1';

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
      card.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
    });
  });
}

/* Zero-layout-shift text decode: locks each word's exact pixel width so mobile never jumps */
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

      const rawLines = el.innerHTML.split(/<br\s*\/?>/i).map(chunk => {
        const tmp = document.createElement('div');
        tmp.innerHTML = chunk;
        return (tmp.textContent || '').replace(/\s+/g, ' ').trim();
      }).filter(Boolean);

      if (!rawLines.length) return;

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

function initScrollReveals() {
  const autoTargets = document.querySelectorAll(
    '.sec, .card, .bento-card, .metric-bento-card, .connect-item, .section-block, .soc-terminal-wrap, .tool-card, .ledger-row, .spec-group, .connect-band'
  );
  autoTargets.forEach((el) => {
    if (!el.hasAttribute('data-reveal')) {
      el.setAttribute('data-reveal', '');
    }
  });

  document.querySelectorAll('.projects-grid, .mitre-grid, .bento-grid, .telemetry-grid, .tools-grid, .ledger-list, .spec-grid').forEach(grid => {
    Array.from(grid.children).forEach((child, idx) => {
      if (child.hasAttribute('data-reveal')) {
        child.style.setProperty('--reveal-delay', Math.min(idx * 65, 320) + 'ms');
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
  }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });

  nodes.forEach(n => observer.observe(n));
}

function initPlaybookTabs() {
  const buttons = document.querySelectorAll('.playbook-step-btn');
  if (!buttons.length) return;

  const titleEl = document.getElementById('playbookTitle');
  const stepEl = document.getElementById('playbookStepTag');
  const descEl = document.getElementById('playbookDesc');
  const exEl = document.getElementById('playbookExample');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (stepEl) stepEl.textContent = btn.getAttribute('data-step-tag') || '';
      if (titleEl) titleEl.textContent = btn.getAttribute('data-title') || '';
      if (descEl) descEl.textContent = btn.getAttribute('data-desc') || '';
      if (exEl) exEl.textContent = btn.getAttribute('data-example') || '';
    });
  });
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
  window.__toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
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
  initPlaybookTabs();
  initReadingProgress();
  initBackToTop();
});
