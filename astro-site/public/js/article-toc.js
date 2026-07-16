/**
 * Sticky TOC scroll spy for article pages.
 */
(function () {
  const links = document.querySelectorAll('[data-toc-link]');
  if (!links.length) return;

  const headings = Array.from(links)
    .map((link) => {
      const id = link.getAttribute('data-toc-link');
      const el = id ? document.getElementById(id) : null;
      return el ? { link, el } : null;
    })
    .filter(Boolean);

  if (!headings.length) return;

  function updateActive() {
    const scrollY = window.scrollY + 120;
    let active = headings[0];

    for (const item of headings) {
      if (item.el.offsetTop <= scrollY) {
        active = item;
      }
    }

    links.forEach((l) => l.classList.remove('article-toc__link--active'));
    active.link.classList.add('article-toc__link--active');
  }

  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();
})();
