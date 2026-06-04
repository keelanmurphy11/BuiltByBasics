/**
 * Positions the philosophy sidebar and split line relative to the end of
 * "Simplicity works." — sidebar starts at deadSpaceRatio (default 25%) into the gap.
 */
(function () {
  const DESKTOP_MQ = window.matchMedia('(min-width: 1024px)');
  const TIGHT_DEAD_SPACE_PX = 192; /* 12rem */

  const VARS = [
    '--philosophy-accent-end',
    '--philosophy-dead-space',
    '--philosophy-sidebar-start',
    '--philosophy-split-left',
  ];

  function clearVars(layout) {
    VARS.forEach((name) => layout.style.removeProperty(name));
    layout.style.removeProperty('padding-bottom');
    layout.classList.remove('philosophy-intro-layout--tight');
    layout.classList.remove('philosophy-intro-layout--ready');
  }

  function updateLayout() {
    const layout = document.querySelector('.philosophy-intro-layout');
    const accent = document.querySelector('.philosophy-headline--accent');
    const sidebar = document.querySelector('.philosophy-intro-sidebar');

    if (!layout || !accent || !sidebar) return;

    if (!DESKTOP_MQ.matches) {
      clearVars(layout);
      return;
    }

    const layoutRect = layout.getBoundingClientRect();
    const accentRect = accent.getBoundingClientRect();
    const layoutWidth = layoutRect.width;

    const accentEnd = accentRect.right - layoutRect.left;
    const deadSpace = Math.max(0, layoutWidth - accentEnd);

    const ratio = parseFloat(layout.dataset.deadSpaceRatio ?? '0.25');
    /* Gap between vertical rule and start of 50% text (px) */
    const splitGapPx = parseFloat(layout.dataset.splitGap ?? '20');

    if (deadSpace < TIGHT_DEAD_SPACE_PX) {
      clearVars(layout);
      layout.classList.add('philosophy-intro-layout--tight');
      layout.classList.add('philosophy-intro-layout--ready');
      return;
    }

    layout.classList.remove('philosophy-intro-layout--tight');

    const sidebarStart = accentEnd + deadSpace * ratio;
    const splitLeft = Math.max(accentEnd + 8, sidebarStart - splitGapPx);

    layout.style.setProperty('--philosophy-accent-end', `${accentEnd}px`);
    layout.style.setProperty('--philosophy-dead-space', `${deadSpace}px`);
    layout.style.setProperty('--philosophy-sidebar-start', `${sidebarStart}px`);
    layout.style.setProperty('--philosophy-split-left', `${splitLeft}px`);
    layout.classList.add('philosophy-intro-layout--ready');

    const sidebarRect = sidebar.getBoundingClientRect();
    const extra = sidebarRect.bottom - layoutRect.bottom;
    if (extra > 0) {
      layout.style.paddingBottom = `${Math.ceil(extra)}px`;
    } else {
      layout.style.removeProperty('padding-bottom');
    }
  }

  function init() {
    const layout = document.querySelector('.philosophy-intro-layout');
    if (!layout) return;

    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateLayout);
    };

    DESKTOP_MQ.addEventListener('change', schedule);

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(schedule);
      ro.observe(layout);
      const accent = document.querySelector('.philosophy-headline--accent');
      if (accent) ro.observe(accent);
      ro.observe(sidebar);
    }

    window.addEventListener('resize', schedule, { passive: true });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(schedule);
    }

    schedule();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
