(function () {
  'use strict';

  var subnav = document.getElementById('basics-subnav');
  if (!subnav) return;

  var subnavWrap = subnav.closest('.basics-subnav-wrap');
  var scrollbar = subnavWrap && subnavWrap.querySelector('.basics-subnav-scrollbar');
  var scrollbarTrack = scrollbar && scrollbar.querySelector('.basics-subnav-scrollbar__track');
  var scrollbarThumb = scrollbar && scrollbar.querySelector('.basics-subnav-scrollbar__thumb');

  var header = document.getElementById('site-header');
  var mainNav = header && header.querySelector('.site-header__nav');
  var sectionIds = ['strength', 'cardio', 'nutrition', 'fat-loss', 'start', 'blueprint'];
  var links = {};
  var desktopQuery = window.matchMedia('(min-width: 1024px)');

  var SCROLLBAR_HEIGHT = 8;
  var MIN_THUMB_PX = 16;

  var dragState = null;
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var scrollFadeTimer = null;

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

  function getSubnavLink(id) {
    if (!links[id]) return null;
    return links[id].find(function (link) {
      return link.closest('#basics-subnav') === subnav;
    }) || links[id][0];
  }

  function scrollActiveLinkIntoView(id) {
    if (isDesktopNav()) return;
    if (subnav.scrollWidth <= subnav.clientWidth + 1) return;

    var link = getSubnavLink(id);
    if (!link) return;

    link.scrollIntoView({
      inline: 'nearest',
      block: 'nearest',
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
  }

  function setActive(id) {
    sectionIds.forEach(function (sid) {
      if (links[sid]) {
        links[sid].forEach(function (link) {
          link.classList.toggle('is-active', sid === id);
        });
      }
    });
    scrollActiveLinkIntoView(id);
  }

  function syncHeaderOffset() {
    if (!header) return;
    document.documentElement.style.setProperty('--basics-header-offset', header.offsetHeight + 'px');
  }

  function getMaxScroll() {
    return Math.max(0, subnav.scrollWidth - subnav.clientWidth);
  }

  function updateScrollbar() {
    if (!scrollbar || !scrollbarThumb || !scrollbarTrack) return;

    var maxScroll = getMaxScroll();
    if (maxScroll <= 0) {
      scrollbar.style.setProperty('--subnav-thumb-size', '0px');
      scrollbar.style.setProperty('--subnav-thumb-offset', '0px');
      return;
    }

    var trackWidth = scrollbarTrack.clientWidth;
    var ratio = subnav.clientWidth / subnav.scrollWidth;
    var thumbWidth = Math.max(trackWidth * ratio, MIN_THUMB_PX);
    var thumbOffset = (subnav.scrollLeft / maxScroll) * (trackWidth - thumbWidth);

    scrollbar.style.setProperty('--subnav-thumb-size', thumbWidth + 'px');
    scrollbar.style.setProperty('--subnav-thumb-offset', thumbOffset + 'px');
  }

  function updateOverflow() {
    if (isDesktopNav()) {
      if (subnavWrap) {
        subnavWrap.classList.remove('basics-subnav-wrap--overflow');
      }
      subnav.classList.remove('basics-subnav--overflow');
      updateScrollbar();
      return;
    }

    var hasOverflow = subnav.scrollWidth > subnav.clientWidth + 1;

    if (subnavWrap) {
      subnavWrap.classList.toggle('basics-subnav-wrap--overflow', hasOverflow);
    }
    subnav.classList.toggle('basics-subnav--overflow', hasOverflow);

    if (header && mainNav) {
      var mainNavHeight = mainNav.offsetHeight;
      var subnavHeight = Math.round(mainNavHeight * 0.5);
      if (hasOverflow) {
        subnavHeight += SCROLLBAR_HEIGHT;
      }
      document.documentElement.style.setProperty('--basics-subnav-height', subnavHeight + 'px');
      syncHeaderOffset();
    }

    updateScrollbar();
  }

  function syncSubnavHeight() {
    if (isDesktopNav() || !header) {
      document.documentElement.style.setProperty('--basics-subnav-height', '0px');
      if (subnavWrap) {
        subnavWrap.classList.remove('basics-subnav-wrap--overflow');
      }
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

  function onSubnavWheel(event) {
    if (subnav.scrollWidth <= subnav.clientWidth + 1) return;
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

    event.preventDefault();
    subnav.scrollLeft += event.deltaY;
  }

  function onSubnavScroll() {
    updateScrollbar();

    if (!subnavWrap || !subnavWrap.classList.contains('basics-subnav-wrap--overflow')) return;

    subnavWrap.classList.add('is-scrolling');
    window.clearTimeout(scrollFadeTimer);
    scrollFadeTimer = window.setTimeout(function () {
      subnavWrap.classList.remove('is-scrolling');
    }, 1200);
  }

  function onThumbPointerDown(event) {
    if (getMaxScroll() <= 0) return;

    event.preventDefault();
    event.stopPropagation();

    dragState = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: subnav.scrollLeft,
      trackWidth: scrollbarTrack.clientWidth,
      thumbWidth: parseFloat(getComputedStyle(scrollbarThumb).width) || MIN_THUMB_PX
    };

    scrollbarThumb.classList.add('is-dragging');
    if (subnavWrap) {
      subnavWrap.classList.add('is-scrolling');
    }
    scrollbarThumb.setPointerCapture(event.pointerId);
  }

  function onThumbPointerMove(event) {
    if (!dragState || event.pointerId !== dragState.pointerId) return;

    var maxScroll = getMaxScroll();
    if (maxScroll <= 0) return;

    var trackTravel = dragState.trackWidth - dragState.thumbWidth;
    if (trackTravel <= 0) return;

    var deltaX = event.clientX - dragState.startX;
    var scrollDelta = (deltaX / trackTravel) * maxScroll;
    subnav.scrollLeft = dragState.startScrollLeft + scrollDelta;
  }

  function onThumbPointerUp(event) {
    if (!dragState || event.pointerId !== dragState.pointerId) return;

    dragState = null;
    scrollbarThumb.classList.remove('is-dragging');

    if (subnavWrap) {
      window.clearTimeout(scrollFadeTimer);
      scrollFadeTimer = window.setTimeout(function () {
        subnavWrap.classList.remove('is-scrolling');
      }, 1200);
    }

    if (scrollbarThumb.hasPointerCapture(event.pointerId)) {
      scrollbarThumb.releasePointerCapture(event.pointerId);
    }
  }

  function onTrackPointerDown(event) {
    if (event.target === scrollbarThumb) return;
    if (getMaxScroll() <= 0) return;

    event.preventDefault();

    var trackRect = scrollbarTrack.getBoundingClientRect();
    var trackWidth = trackRect.width;
    var thumbWidth = parseFloat(getComputedStyle(scrollbarThumb).width) || MIN_THUMB_PX;
    var clickX = event.clientX - trackRect.left;
    var thumbCenter = Math.max(thumbWidth / 2, Math.min(clickX, trackWidth - thumbWidth / 2));
    var maxScroll = getMaxScroll();
    var trackTravel = trackWidth - thumbWidth;

    if (trackTravel <= 0) return;

    subnav.scrollLeft = ((thumbCenter - thumbWidth / 2) / trackTravel) * maxScroll;
  }

  function onLayoutChange() {
    syncSubnavHeight();
  }

  setActive(sectionIds[0]);
  onLayoutChange();

  subnav.addEventListener('wheel', onSubnavWheel, { passive: false });
  subnav.addEventListener('scroll', onSubnavScroll, { passive: true });

  if (scrollbarThumb) {
    scrollbarThumb.addEventListener('pointerdown', onThumbPointerDown);
    scrollbarThumb.addEventListener('pointermove', onThumbPointerMove);
    scrollbarThumb.addEventListener('pointerup', onThumbPointerUp);
    scrollbarThumb.addEventListener('pointercancel', onThumbPointerUp);
  }

  if (scrollbarTrack) {
    scrollbarTrack.addEventListener('pointerdown', onTrackPointerDown);
  }

  window.addEventListener('resize', onLayoutChange, { passive: true });

  if (typeof ResizeObserver !== 'undefined') {
    var resizeObserver = new ResizeObserver(function () {
      updateOverflow();
    });
    resizeObserver.observe(subnav);
    if (scrollbarTrack) {
      resizeObserver.observe(scrollbarTrack);
    }
  }

  if (typeof desktopQuery.addEventListener === 'function') {
    desktopQuery.addEventListener('change', onLayoutChange);
  } else if (typeof desktopQuery.addListener === 'function') {
    desktopQuery.addListener(onLayoutChange);
  }

  if (prefersReducedMotion) {
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
