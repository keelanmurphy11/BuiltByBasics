(function () {
  'use strict';

  const grid = document.getElementById('research-grid');
  const modal = document.getElementById('research-mobile-modal');
  if (!grid || !modal) return;

  const cards = Array.from(grid.querySelectorAll('[data-research-card]'));
  if (!cards.length) return;

  const modalContent = modal.querySelector('.research-mobile-content');
  const modalCloseBtn = modal.querySelector('.research-mobile-close');
  const modalBackdrop = modal.querySelector('.research-mobile-backdrop');
  const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

  let mobileOpen = false;
  let currentModalCard = null;

  function usesModalInteraction() {
    return !finePointerQuery.matches;
  }

  function setAria(card, expanded) {
    card.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  }

  function closeMobileModal() {
    if (!mobileOpen) return;
    mobileOpen = false;
    currentModalCard = null;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('research-modal-open');
    cards.forEach((card) => setAria(card, false));
    modalContent.innerHTML = '';
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
    currentModalCard = card;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('research-modal-open');
    setAria(card, true);

    modalCloseBtn.focus();
  }

  function onCardActivate(card) {
    if (!usesModalInteraction()) return;

    if (mobileOpen && currentModalCard === card) {
      closeMobileModal();
    } else {
      closeMobileModal();
      openMobileModal(card);
    }
  }

  function isStudyLink(target) {
    return !!(target && target.closest && target.closest('a[href]'));
  }

  cards.forEach((card) => {
    card.addEventListener('click', (e) => {
      if (isStudyLink(e.target)) return;
      if (!usesModalInteraction()) return;
      e.preventDefault();
      onCardActivate(card);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (mobileOpen) {
          e.preventDefault();
          closeMobileModal();
          card.blur();
        } else if (!usesModalInteraction() && document.activeElement === card) {
          e.preventDefault();
          card.blur();
        }
        return;
      }
      if (e.key === 'Enter' || e.key === ' ') {
        if (isStudyLink(e.target)) return;
        if (!usesModalInteraction()) return;
        e.preventDefault();
        onCardActivate(card);
      }
    });

    card.addEventListener('mouseleave', () => {
      if (usesModalInteraction()) return;
      card.blur();
    });
  });

  modalCloseBtn.addEventListener('click', closeMobileModal);
  modalBackdrop.addEventListener('click', closeMobileModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileOpen) closeMobileModal();
  });

  window.addEventListener('resize', () => {
    if (!usesModalInteraction() && mobileOpen) closeMobileModal();
  });

  finePointerQuery.addEventListener('change', closeMobileModal);
})();
