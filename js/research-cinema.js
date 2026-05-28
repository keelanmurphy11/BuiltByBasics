(function () {
  'use strict';

  const section = document.getElementById('why');
  const grid = document.getElementById('research-grid');
  if (!grid || !section) return;

  const cards = Array.from(grid.querySelectorAll('[data-research-card]'));
  if (!cards.length) return;

  const coarsePointerQuery = window.matchMedia('(hover: none), (pointer: coarse)');
  let isCoarse = coarsePointerQuery.matches;
  let currentDesktopActive = null;

  function setAria(card, expanded) {
    card.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  }

  function measureDetail(detail) {
    detail.style.maxHeight = 'none';
    const height = detail.scrollHeight;
    detail.style.maxHeight = '0px';
    return height;
  }

  function collapseDetail(detail) {
    detail.classList.remove('is-expanded');
    detail.style.opacity = '0';
    detail.style.maxHeight = '0px';
    detail.setAttribute('aria-hidden', 'true');
  }

  function expandDetail(detail) {
    const height = measureDetail(detail);
    detail.classList.add('is-expanded');
    detail.setAttribute('aria-hidden', 'false');
    detail.style.opacity = '1';
    detail.offsetHeight;
    detail.style.maxHeight = height + 'px';
  }

  function setDetailState(card, expanded) {
    const detail = card.querySelector('.research-card-detail');
    if (!detail) return;
    if (expanded) expandDetail(detail);
    else collapseDetail(detail);
  }

  function markSectionActive(active) {
    grid.classList.toggle('has-active', active);
    section.classList.toggle('has-card-active', active);
  }

  function clearAll() {
    currentDesktopActive = null;
    markSectionActive(false);
    cards.forEach((card) => {
      card.classList.remove('is-active', 'is-open');
      setDetailState(card, false);
      setAria(card, false);
    });
  }

  function activateCard(card) {
    markSectionActive(true);
    cards.forEach((c) => {
      const isTarget = c === card;
      c.classList.toggle('is-active', isTarget);
      c.classList.remove('is-open');
      setDetailState(c, isTarget);
      setAria(c, isTarget);
    });
  }

  function openCard(card) {
    markSectionActive(true);
    cards.forEach((c) => {
      const isTarget = c === card;
      c.classList.toggle('is-open', isTarget);
      c.classList.remove('is-active');
      setDetailState(c, isTarget);
      setAria(c, isTarget);
    });
  }

  function setActive(card) {
    if (currentDesktopActive === card) return;
    currentDesktopActive = card;
    activateCard(card);
  }

  function onDesktopHover() {
    cards.forEach((card) => {
      card.addEventListener('focusin', () => {
        if (isCoarse) return;
        setActive(card);
      });

      card.addEventListener('focusout', (e) => {
        if (isCoarse) return;
        if (card.contains(e.relatedTarget)) return;
        if (card.matches(':hover')) return;
        if (!grid.querySelector('[data-research-card]:hover')) clearAll();
      });
    });

    grid.addEventListener('mousemove', (e) => {
      if (isCoarse) return;
      const card = e.target.closest('[data-research-card]');
      if (card) setActive(card);
      else clearAll();
    });

    grid.addEventListener('mouseleave', () => {
      if (isCoarse) return;
      clearAll();
    });
  }

  function onMobileToggle() {
    function isStudyLink(target) {
      return !!(target && target.closest && target.closest('a'));
    }

    cards.forEach((card) => {
      card.addEventListener('click', (e) => {
        if (!isCoarse) return;
        if (isStudyLink(e.target)) return;

        e.preventDefault();
        if (card.classList.contains('is-open')) clearAll();
        else openCard(card);
      });

      card.addEventListener('keydown', (e) => {
        if (!isCoarse) return;

        if (e.key === 'Escape') {
          e.preventDefault();
          clearAll();
          card.blur();
          return;
        }

        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (card.classList.contains('is-open')) clearAll();
          else openCard(card);
        }
      });
    });

    document.addEventListener('click', (e) => {
      if (!isCoarse) return;
      if (e.target && e.target.closest && e.target.closest('[data-research-card]')) return;
      clearAll();
    });
  }

  window.addEventListener('resize', () => {
    const active =
      grid.querySelector('.research-card.is-active') ||
      grid.querySelector('.research-card.is-open');
    if (!active) return;
    const detail = active.querySelector('.research-card-detail.is-expanded');
    if (detail) {
      const height = measureDetail(detail);
      detail.style.maxHeight = height + 'px';
    }
  });

  onDesktopHover();
  onMobileToggle();

  coarsePointerQuery.addEventListener('change', (e) => {
    isCoarse = e.matches;
    clearAll();
  });
})();
