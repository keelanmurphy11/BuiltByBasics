(function () {

  'use strict';



  var root = document.querySelector('[data-about-me]');

  if (!root) return;



  var toggles = root.querySelectorAll('[data-about-toggle]');

  if (!toggles.length) return;



  var collapseObserver = null;

  var collapseTimer = null;



  function setExpanded(expanded) {

    root.classList.toggle('is-expanded', expanded);



    toggles.forEach(function (toggle) {

      toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');

      var label = toggle.querySelector('[data-about-toggle-label]');

      if (label) {

        label.textContent = expanded ? 'Read less' : 'Read more';

      }

    });

  }



  function getSectionScrollTarget() {

    var section = document.getElementById('about-me');

    if (!section) return null;



    var offset = parseFloat(getComputedStyle(section).scrollMarginTop) || 0;

    return Math.max(0, section.getBoundingClientRect().top + window.scrollY - offset);

  }



  function stopCollapseScroll() {

    if (collapseObserver) {

      collapseObserver.disconnect();

      collapseObserver = null;

    }

    if (collapseTimer) {

      clearTimeout(collapseTimer);

      collapseTimer = null;

    }

  }



  function scrollWithCollapse(startScrollY, startBlockHeight) {

    stopCollapseScroll();



    var section = document.getElementById('about-me');

    if (!section) return;



    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var targetY = getSectionScrollTarget();

    if (targetY === null) return;



    if (reduceMotion) {

      window.scrollTo(0, targetY);

      return;

    }



    var distance = targetY - startScrollY;

    if (Math.abs(distance) < 2 || startBlockHeight <= 0) return;



    var done = false;



    function syncScrollToCollapse() {

      var currentHeight = root.getBoundingClientRect().height;

      var progress = 1 - currentHeight / startBlockHeight;

      progress = Math.max(0, Math.min(1, progress));

      window.scrollTo(0, startScrollY + distance * progress);

    }



    function finish() {

      if (done) return;

      done = true;

      stopCollapseScroll();

      window.scrollTo(0, targetY);

    }



    if (typeof ResizeObserver !== 'undefined') {

      collapseObserver = new ResizeObserver(syncScrollToCollapse);

      collapseObserver.observe(root);

    } else {

      var start = performance.now();

      (function tick(now) {

        if (done) return;

        syncScrollToCollapse();

        if (now - start < 500) {

          requestAnimationFrame(tick);

        } else {

          finish();

        }

      })(start);

    }



    var storyPanel = root.querySelector('.about-me__panel');

    if (storyPanel) {

      storyPanel.addEventListener('transitionend', function onEnd(e) {

        if (e.propertyName !== 'grid-template-rows') return;

        storyPanel.removeEventListener('transitionend', onEnd);

        finish();

      });

    }



    collapseTimer = setTimeout(finish, 550);

  }



  toggles.forEach(function (toggle) {

    toggle.addEventListener('click', function () {

      var willExpand = !root.classList.contains('is-expanded');

      var startScrollY = window.scrollY;

      var startBlockHeight = root.getBoundingClientRect().height;



      setExpanded(willExpand);



      if (!willExpand) {

        requestAnimationFrame(function () {

          scrollWithCollapse(startScrollY, startBlockHeight);

        });

      } else {

        stopCollapseScroll();

      }

    });

  });

})();


