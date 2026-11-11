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
