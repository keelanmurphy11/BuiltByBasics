(function () {
  'use strict';

  var subnav = document.getElementById('basics-subnav');
  if (!subnav) return;

  var subnavWrap = subnav.closest('.basics-subnav-wrap');
  var placeholder = subnavWrap && subnavWrap.querySelector('.basics-subnav-placeholder');
  var header = document.getElementById('site-header');
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
    var height = header.offsetHeight;
    document.documentElement.style.setProperty('--basics-header-offset', height + 'px');
  }

  function syncSubnavHeight() {
    if (isDesktopNav() || !subnav) {
      document.documentElement.style.setProperty('--basics-subnav-height', '0px');
      if (placeholder) {
        placeholder.style.height = '0px';
      }
      return;
    }

    if (!subnav.classList.contains('basics-subnav--fixed')) {
      document.documentElement.style.setProperty('--basics-subnav-height', '0px');
      if (placeholder) {
        placeholder.style.height = '0px';
      }
      return;
    }

    var height = subnav.offsetHeight;
    document.documentElement.style.setProperty('--basics-subnav-height', height + 'px');
    if (placeholder) {
      placeholder.style.height = height + 'px';
    }
  }

  function updateFixedSubnav() {
    if (!subnavWrap || isDesktopNav()) {
      if (subnav) {
        subnav.classList.remove('basics-subnav--fixed');
      }
      if (placeholder) {
        placeholder.classList.remove('is-active');
      }
      syncSubnavHeight();
      return;
    }

    var headerOffset = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--basics-header-offset'),
      10
    ) || 72;

    var shouldFix = subnavWrap.getBoundingClientRect().top <= headerOffset;

    subnav.classList.toggle('basics-subnav--fixed', shouldFix);
    if (placeholder) {
      placeholder.classList.toggle('is-active', shouldFix);
    }
    syncSubnavHeight();
  }

  function onLayoutChange() {
    syncHeaderOffset();
    updateFixedSubnav();
  }

  setActive(sectionIds[0]);
  onLayoutChange();

  window.addEventListener('resize', onLayoutChange, { passive: true });
  window.addEventListener('scroll', updateFixedSubnav, { passive: true });

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
