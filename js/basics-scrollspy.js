(function () {
  'use strict';

  var subnav = document.getElementById('basics-subnav');
  if (!subnav) return;

  var subnavWrap = subnav.closest('.basics-subnav-wrap');
  var placeholder = subnavWrap && subnavWrap.querySelector('.basics-subnav-placeholder');
  var sectionIds = ['strength', 'cardio', 'nutrition', 'fat-loss', 'start'];
  var links = {};

  sectionIds.forEach(function (id) {
    var link = subnav.querySelector('[data-section="' + id + '"]');
    if (link) links[id] = link;
  });

  var sections = sectionIds.map(function (id) {
    return document.getElementById(id);
  }).filter(Boolean);

  if (!sections.length) return;

  function setActive(id) {
    sectionIds.forEach(function (sid) {
      if (links[sid]) {
        links[sid].classList.toggle('is-active', sid === id);
      }
    });
  }

  function syncSubnavHeight() {
    var height = subnav.offsetHeight;
    document.documentElement.style.setProperty('--basics-subnav-height', height + 'px');
    if (placeholder) {
      placeholder.style.height = height + 'px';
    }
  }

  function updateFixedSubnav() {
    if (!subnavWrap) return;

    var headerOffset = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--basics-header-offset'),
      10
    ) || 72;

    var shouldFix = subnavWrap.getBoundingClientRect().top <= headerOffset;

    subnav.classList.toggle('basics-subnav--fixed', shouldFix);
    if (placeholder) {
      placeholder.classList.toggle('is-active', shouldFix);
    }
  }

  setActive(sectionIds[0]);
  syncSubnavHeight();
  updateFixedSubnav();

  window.addEventListener('resize', function () {
    syncSubnavHeight();
    updateFixedSubnav();
  }, { passive: true });

  window.addEventListener('scroll', updateFixedSubnav, { passive: true });

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
