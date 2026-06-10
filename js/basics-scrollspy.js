(function () {
  'use strict';

  var subnav = document.getElementById('basics-subnav');
  if (!subnav) return;

  var header = document.getElementById('site-header');
  var mainNav = header && header.querySelector('.site-header__nav');
  var sectionIds = ['strength', 'cardio', 'nutrition', 'fat-loss', 'start'];
  var links = {};
  var desktopQuery = window.matchMedia('(min-width: 1024px)');

  sectionIds.forEach(function (id) {
    var sectionLinks = document.querySelectorAll('[data-section="' + id + '"]');
    if (sectionLinks.length) {
      links[id] = Array.from(sectionLinks);
    }
  });

  var sections = sectionIds.map(function (id) {
    return document.getElementById(id);
  }).filter(Boolean);

  if (!sections.length) return;

  function isDesktopNav() {
    return desktopQuery.matches;
  }

  function setActive(id) {
    sectionIds.forEach(function (sid) {
      if (links[sid]) {
        links[sid].forEach(function (link) {
          link.classList.toggle('is-active', sid === id);
        });
      }
    });
  }

  function syncHeaderOffset() {
    if (!header) return;
    document.documentElement.style.setProperty('--basics-header-offset', header.offsetHeight + 'px');
  }

  function syncSubnavHeight() {
    if (isDesktopNav() || !header) {
      document.documentElement.style.setProperty('--basics-subnav-height', '0px');
      subnav.classList.remove('basics-subnav--overflow');
      syncHeaderOffset();
      return;
    }

    var mainNavHeight = mainNav ? mainNav.offsetHeight : header.offsetHeight;
    var subnavHeight = Math.round(mainNavHeight * 0.5);
    document.documentElement.style.setProperty('--basics-subnav-height', subnavHeight + 'px');
    syncHeaderOffset();
    requestAnimationFrame(function () {
      updateOverflow();
      syncHeaderOffset();
    });
  }

  function updateOverflow() {
    if (isDesktopNav()) {
      subnav.classList.remove('basics-subnav--overflow');
      return;
    }

    subnav.classList.toggle(
      'basics-subnav--overflow',
      subnav.scrollWidth > subnav.clientWidth + 1
    );
  }

  function onLayoutChange() {
    syncSubnavHeight();
  }

  setActive(sectionIds[0]);
  onLayoutChange();

  window.addEventListener('resize', onLayoutChange, { passive: true });

  if (typeof desktopQuery.addEventListener === 'function') {
    desktopQuery.addEventListener('change', onLayoutChange);
  } else if (typeof desktopQuery.addListener === 'function') {
    desktopQuery.addListener(onLayoutChange);
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      var intersecting = entries
        .filter(function (entry) { return entry.isIntersecting; })
        .sort(function (a, b) {
          return sectionIds.indexOf(a.target.id) - sectionIds.indexOf(b.target.id);
        });

      if (intersecting.length) {
        setActive(intersecting[0].target.id);
      }
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
  );

  sections.forEach(function (section) {
    observer.observe(section);
  });
})();
