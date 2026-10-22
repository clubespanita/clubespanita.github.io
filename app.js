const toggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
function setMenu(open) {
  toggle.classList.toggle('is-open', open);
  mobileNav.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
  mobileNav.inert = !open;
  document.body.classList.toggle('menu-open', open);
}
toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => { if (event.key === 'Escape') setMenu(false); });
document.addEventListener('click', event => { if (!event.target.closest('.site-header')) setMenu(false); });
window.matchMedia('(min-width: 901px)').addEventListener('change', e => { if (e.matches) setMenu(false); });
// Animate feature items only when their strip enters the viewport.
// If IntersectionObserver is unavailable, the content remains visible.
(() => {
  const strip = document.querySelector('.hero-features');
  if (!strip || !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.classList.add('js-motion');
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        strip.classList.add('is-visible');
        observer.unobserve(strip);
      }
    }
  }, { threshold: 0.15 });
  observer.observe(strip);
})();


// New level cards: reveal individually as they enter the viewport.
(() => {
  const elements = document.querySelectorAll('.levels-section [data-level-reveal]');
  if (!elements.length || !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.classList.add('js-motion');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      element.classList.add('is-visible');
      observer.unobserve(element);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -25px 0px' });
  elements.forEach((element, index) => {
    if (element.classList.contains('level-card')) element.style.animationDelay = `${(index - 1) * 0.12}s`;
    observer.observe(element);
  });
})();


// Schedule: staggered reveal, with visible fallback when motion is reduced or unsupported.
(() => {
  const items = document.querySelectorAll('.schedule-section [data-schedule-reveal]');
  if (!items.length || !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.classList.add('js-motion');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -25px 0px' });
  items.forEach((item, index) => {
    item.style.setProperty('--schedule-delay', `${Math.min(index, 5) * 95}ms`);
    observer.observe(item);
  });
})();


// Reviews carousel: 3 phones on desktop, 1 on mobile; accessible buttons and keyboard.
(() => {
  const carousel = document.querySelector('.reviews-carousel');
  if (!carousel) return;
  const slides = [...carousel.querySelectorAll('[data-review-item]')];
  const prev = carousel.querySelector('.reviews-prev');
  const next = carousel.querySelector('.reviews-next');
  const counter = carousel.querySelector('#reviews-current');
  const mobile = window.matchMedia('(max-width: 760px)');
  let index = 0;
  function render() {
    if (mobile.matches) {
      index = ((index % slides.length) + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        // Wrap the neighbors so all three phones are visible even on the first review.
        const distance = (i - index + slides.length) % slides.length;
        const position = distance === slides.length - 1 ? -1 : distance;
        slide.hidden = Math.abs(position) > 1;
        slide.classList.toggle('is-review-active', position === 0);
        slide.classList.toggle('is-review-prev', position === -1);
        slide.classList.toggle('is-review-next', position === 1);
        slide.setAttribute('aria-hidden', String(position !== 0));
        slide.inert = position !== 0;
      });
    } else {
      const count = 3;
      const maxStart = Math.max(0, slides.length - count);
      index = Math.max(0, Math.min(index, maxStart));
      slides.forEach((slide, i) => {
        slide.hidden = i < index || i >= index + count;
        slide.classList.remove('is-review-active', 'is-review-prev', 'is-review-next');
        slide.removeAttribute('aria-hidden');
        slide.inert = false;
      });
    }
    counter.textContent = String(index + 1).padStart(2, '0');
    prev.disabled = !mobile.matches && index === 0;
    next.disabled = !mobile.matches && index === Math.max(0, slides.length - 3);
  }
  prev.addEventListener('click', () => { index--; render(); });
  next.addEventListener('click', () => { index++; render(); });
  carousel.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' && !prev.disabled) { event.preventDefault(); prev.click(); }
    if (event.key === 'ArrowRight' && !next.disabled) { event.preventDefault(); next.click(); }
  });
  mobile.addEventListener('change', render);
  render();
  const reveal = document.querySelectorAll('.reviews-section [data-review-reveal]');
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.classList.add('js-motion');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), { threshold: .12 });
  reveal.forEach(element => observer.observe(element));
})();


// Final join section: reveal when visible, with accessible fallback.
(() => {
  const el = document.querySelector('.join-copy[data-join-reveal]');
  if (!el || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.classList.add('js-motion');
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { el.classList.add('is-visible'); observer.disconnect(); }
  }, { threshold: .12 });
  observer.observe(el);
})();


// FAQ: accessible native details; staggered entrance animation.
(() => {
  const items = document.querySelectorAll('.faq-section [data-faq-reveal]');
  if (!items.length || !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.classList.add('js-motion');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -15px 0px' });
  items.forEach((item, index) => {
    item.style.setProperty('--faq-delay', `${Math.min(index, 6) * 80}ms`);
    observer.observe(item);
  });
})();
