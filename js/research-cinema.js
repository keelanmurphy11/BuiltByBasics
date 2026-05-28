(function () {
  'use strict';

  const section = document.getElementById('why');
  const grid = document.getElementById('research-grid');
  const modal = document.getElementById('research-mobile-modal');
  if (!grid || !section || !modal) return;

  const cards = Array.from(grid.querySelectorAll('[data-research-card]'));
  if (!cards.length) return;

  const modalContent = modal.querySelector('.research-mobile-content');
  const modalCloseBtn = modal.querySelector('.research-mobile-close');
  const modalBackdrop = modal.querySelector('.research-mobile-backdrop');
  const mobileQuery = window.matchMedia('(max-width: 768px)');
  const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

  let currentDesktopActive = null;
  let mobileOpen = false;

  function isMobileView() {
    return mobileQuery.matches;
  }

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
    if (!detail) return;
    detail.classList.remove('is-expanded');
    detail.style.opacity = '0';
    detail.style.maxHeight = '0px';
    detail.setAttribute('aria-hidden', 'true');
  }

  function expandDetail(detail) {
    if (!detail) return;
    const height = measureDetail(detail);
    detail.classList.add('is-expanded');
    detail.setAttribute('aria-hidden', 'false');
    detail.style.opacity = '1';
    detail.offsetHeight;
    detail.style.maxHeight = height + 'px';
  }

  function setDetailState(card, expanded) {
    if (isMobileView()) return;
    const detail = card.querySelector('.research-card-detail');
    if (!detail) return;
    if (expanded) expandDetail(detail);
    else collapseDetail(detail);
  }

  function markSectionActive(active) {
    grid.classList.toggle('has-active', active);
    section.classList.toggle('has-card-active', active && !isMobileView());
  }

  function clearDesktop() {
    currentDesktopActive = null;
    markSectionActive(false);
    cards.forEach((card) => {
      card.classList.remove('is-active', 'is-open', 'is-modal-selected');
      setDetailState(card, false);
      setAria(card, false);
    });
  }

  function closeMobileModal() {
    if (!mobileOpen) return;
    mobileOpen = false;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('research-modal-open');
    markSectionActive(false);
    cards.forEach((card) => {
      card.classList.remove('is-modal-selected');
      setAria(card, false);
    });
    modalContent.innerHTML = '';
  }

  function clearAll() {
    closeMobileModal();
    clearDesktop();
  }

  function activateDesktop(card) {
    markSectionActive(true);
    cards.forEach((c) => {
      const isTarget = c === card;
      c.classList.toggle('is-active', isTarget);
      c.classList.remove('is-open', 'is-modal-selected');
      setDetailState(c, isTarget);
      setAria(c, isTarget);
    });
  }

  function setDesktopActive(card) {
    if (currentDesktopActive === card) return;
    currentDesktopActive = card;
    activateDesktop(card);
  }

  function toggleDesktop(card) {
    if (card.classList.contains('is-active')) {
      clearDesktop();
      return;
    }
    currentDesktopActive = card;
    activateDesktop(card);
  }

  function openMobileModal(card) {
    const category = card.querySelector('.card-category');
    const stat = card.querySelector('.card-stat');
    const headline = card.querySelector('.card-headline');
    const detail = card.querySelector('.research-card-detail p');
    const link = card.querySelector('.research-card-detail a');

    modalContent.innerHTML = [
      category ? `<p class="card-category font-display font-medium uppercase tracking-[0.28em] text-cobalt-light">${category.textContent}</p>` : '',
      stat ? `<p class="card-stat font-display font-black leading-none text-white">${stat.textContent}</p>` : '',
      headline ? `<p class="card-headline text-zinc-300 leading-snug">${headline.textContent}</p>` : '',
      detail ? `<p class="research-mobile-detail">${detail.textContent}</p>` : '',
      link
        ? `<a href="${link.href}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center text-xs uppercase tracking-[0.18em] text-zinc-300 hover:text-cobalt-light hover:underline pointer-events-auto">${link.textContent}</a>`
        : '',
    ].join('');

    mobileOpen = true;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('research-modal-open');
    markSectionActive(true);

    cards.forEach((c) => {
      const selected = c === card;
      c.classList.toggle('is-modal-selected', selected);
      setAria(c, selected);
    });

    modalCloseBtn.focus();
  }

  function onCardActivate(card) {
    if (isMobileView()) {
      if (mobileOpen && card.classList.contains('is-modal-selected')) {
        closeMobileModal();
      } else {
        closeMobileModal();
        openMobileModal(card);
      }
      return;
    }
    toggleDesktop(card);
  }

  function isStudyLink(target) {
    return !!(target && target.closest && target.closest('a[href]'));
  }

  cards.forEach((card) => {
    card.addEventListener('click', (e) => {
      if (isStudyLink(e.target)) return;
      e.preventDefault();
      onCardActivate(card);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        clearAll();
        card.blur();
        return;
      }
      if (e.key === 'Enter' || e.key === ' ') {
        if (isStudyLink(e.target)) return;
        e.preventDefault();
        onCardActivate(card);
      }
    });
  });

  function onDesktopHover() {
    cards.forEach((card) => {
      card.addEventListener('focusin', () => {
        if (isMobileView() || !finePointerQuery.matches) return;
        setDesktopActive(card);
      });

      card.addEventListener('focusout', (e) => {
        if (isMobileView() || !finePointerQuery.matches) return;
        if (card.contains(e.relatedTarget)) return;
        if (card.matches(':hover')) return;
        if (!grid.querySelector('[data-research-card]:hover')) clearDesktop();
      });
    });

    grid.addEventListener('mousemove', (e) => {
      if (isMobileView() || !finePointerQuery.matches) return;
      const card = e.target.closest('[data-research-card]');
      if (card) setDesktopActive(card);
      else clearDesktop();
    });

    grid.addEventListener('mouseleave', () => {
      if (isMobileView() || !finePointerQuery.matches) return;
      clearDesktop();
    });
  }

  modalCloseBtn.addEventListener('click', closeMobileModal);
  modalBackdrop.addEventListener('click', closeMobileModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileOpen) closeMobileModal();
  });

  window.addEventListener('resize', () => {
    if (!isMobileView() && mobileOpen) closeMobileModal();
    if (isMobileView()) clearDesktop();

    const active = grid.querySelector('.research-card.is-active');
    if (!active || isMobileView()) return;
    const detail = active.querySelector('.research-card-detail.is-expanded');
    if (detail) {
      const height = measureDetail(detail);
      detail.style.maxHeight = height + 'px';
    }
  });

  mobileQuery.addEventListener('change', () => clearAll());
  finePointerQuery.addEventListener('change', () => clearAll());

  onDesktopHover();
})();
