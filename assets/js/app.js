// Copy BibTeX + play comparison videos only while they are on screen.

document.addEventListener('DOMContentLoaded', () => {
  const copyBtn = document.querySelector('.copy-bibtex');
  const code = document.getElementById('bibtex-code');
  if (copyBtn && code) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code.innerText);
        copyBtn.textContent = 'Copied ✓';
      } catch (e) {
        const range = document.createRange();
        range.selectNodeContents(code);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        copyBtn.textContent = 'Press Ctrl+C';
      }
      setTimeout(() => { copyBtn.textContent = 'Copy BibTeX'; }, 1800);
    });
  }

  // hero teaser: switch between rendered scenes
  const hero = document.getElementById('hero-video');
  const pills = Array.from(document.querySelectorAll('.scene-thumb'));
  if (hero && pills.length) {
    hero.addEventListener('loadeddata', () => hero.classList.remove('is-fading'));
    pills.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('is-active')) return;
        pills.forEach((b) => {
          const on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        hero.classList.add('is-fading');
        hero.src = btn.dataset.src;
        hero.poster = btn.dataset.poster;
        hero.play().catch(() => {});
      });
      // warm the cache on hover so switching feels instant
      btn.addEventListener('pointerenter', () => {
        if (btn.dataset.warmed) return;
        btn.dataset.warmed = '1';
        const pre = document.createElement('link');
        pre.rel = 'prefetch'; pre.as = 'video'; pre.href = btn.dataset.src;
        document.head.appendChild(pre);
      }, { once: false });
    });
  }

  // hero teaser filmstrip: horizontal scroll + arrows
  const strip = document.getElementById('scene-strip');
  const switchBox = document.querySelector('.scene-switch');
  if (strip && switchBox) {
    const sync = () => {
      const scrollable = strip.scrollWidth - strip.clientWidth > 4;
      switchBox.classList.toggle('can-scroll', scrollable);
      strip.classList.toggle('is-scroll', scrollable);
      const max = strip.scrollWidth - strip.clientWidth;
      switchBox.classList.toggle('at-start', strip.scrollLeft <= 4);
      switchBox.classList.toggle('at-end', strip.scrollLeft >= max - 4);
    };
    sync();
    strip.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    if ('ResizeObserver' in window) new ResizeObserver(sync).observe(strip);
    const step = () => Math.max(220, Math.round(strip.clientWidth * 0.45));
    const nl = switchBox.querySelector('.scene-nav.l');
    const nr = switchBox.querySelector('.scene-nav.r');
    if (nl) nl.addEventListener('click', () => strip.scrollBy({ left: -step(), behavior: 'smooth' }));
    if (nr) nr.addEventListener('click', () => strip.scrollBy({ left: step(), behavior: 'smooth' }));
    // keep the selected thumb in view
    pills.forEach((b) => b.addEventListener('click', () => {
      b.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }));
  }

  const videos = Array.from(document.querySelectorAll('video.lazy-loop'));
  if (!videos.length || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const v = entry.target;
      if (entry.isIntersecting) {
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, { threshold: 0.35 });
  videos.forEach((v) => io.observe(v));
});
