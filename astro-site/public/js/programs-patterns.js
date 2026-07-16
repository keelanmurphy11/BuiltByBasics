(function () {
  const section = document.getElementById('movement-patterns-section');
  if (!section || typeof MOVEMENT_PATTERNS === 'undefined') return;

  const list = section.querySelector('.pattern-library__list');
  if (!list) return;

  const patternIds = Object.keys(MOVEMENT_PATTERNS);
  const fragment = document.createDocumentFragment();

  patternIds.forEach(function (patternId, index) {
    const pattern = MOVEMENT_PATTERNS[patternId];
    const panelId = 'pattern-panel-' + patternId;
    const isFirst = index === 0;

    const item = document.createElement('div');
    item.className = 'pattern-card reveal-item';

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'pattern-card__toggle';
    toggle.setAttribute('aria-expanded', isFirst ? 'true' : 'false');
    toggle.setAttribute('aria-controls', panelId);
    toggle.id = 'pattern-toggle-' + patternId;

    const label = document.createElement('span');
    label.className = 'pattern-card__label';
    label.textContent = pattern.label;

    const chevron = document.createElement('span');
    chevron.className = 'pattern-card__chevron';
    chevron.setAttribute('aria-hidden', 'true');
    chevron.innerHTML =
      '<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>';

    toggle.appendChild(label);
    toggle.appendChild(chevron);

    const panel = document.createElement('div');
    panel.className = 'pattern-card__panel';
    panel.id = panelId;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', toggle.id);
    if (!isFirst) {
      panel.hidden = true;
    }

    const examples = document.createElement('p');
    examples.className = 'pattern-card__examples';
    examples.textContent = pattern.examples.join(' · ');

    panel.appendChild(examples);
    item.appendChild(toggle);
    item.appendChild(panel);
    fragment.appendChild(item);

    if (isFirst) {
      item.classList.add('pattern-card--open');
    }

    toggle.addEventListener('click', function () {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';

      list.querySelectorAll('.pattern-card').forEach(function (card) {
        const btn = card.querySelector('.pattern-card__toggle');
        const pnl = card.querySelector('.pattern-card__panel');
        card.classList.remove('pattern-card--open');
        btn.setAttribute('aria-expanded', 'false');
        pnl.hidden = true;
      });

      if (!isOpen) {
        item.classList.add('pattern-card--open');
        toggle.setAttribute('aria-expanded', 'true');
        panel.hidden = false;
      }
    });
  });

  list.appendChild(fragment);
})();
