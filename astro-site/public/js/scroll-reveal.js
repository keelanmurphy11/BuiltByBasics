(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal-item').forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const STAGGER_MS = 125;

  function revealItem(el, delayMs) {
    if (el.dataset.revealed === 'true') return;
    el.dataset.revealed = 'true';
    el.style.transitionDelay = delayMs > 0 ? delayMs + 'ms' : '';
    el.classList.add('is-visible');
  }

  function revealStaggerGroup(container) {
    if (container.dataset.revealDone === 'true') return;
    container.dataset.revealDone = 'true';

    const items = container.querySelectorAll('.reveal-item:not([data-revealed="true"])');
    items.forEach((item, index) => {
      revealItem(item, index * STAGGER_MS);
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const target = entry.target;
        if (target.hasAttribute('data-reveal-stagger')) {
          revealStaggerGroup(target);
        } else if (target.classList.contains('reveal-item')) {
          revealItem(target, 0);
        }

        observer.unobserve(target);
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0 }
  );

  document.querySelectorAll('[data-reveal-stagger]').forEach((el) => observer.observe(el));

  document.querySelectorAll('.reveal-item').forEach((el) => {
    if (!el.closest('[data-reveal-stagger]')) {
      observer.observe(el);
    }
  });
})();
