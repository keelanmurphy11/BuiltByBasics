(function () {
  const grid = document.getElementById('program-collections-grid');
  if (!grid || typeof PROGRAM_COLLECTIONS === 'undefined') return;

  const arrowSvg =
    '<svg class="program-collection-card__arrow" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>';

  const lockSvg =
    '<svg class="program-collection-card__lock" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/></svg>';

  const fragment = document.createDocumentFragment();

  PROGRAM_COLLECTIONS.forEach(function (collection) {
    const isAvailable = collection.status === 'available' && collection.href;
    const el = document.createElement(isAvailable ? 'a' : 'article');

    el.className =
      'program-collection-card reveal-item' +
      (isAvailable ? ' program-collection-card--available' : ' program-collection-card--locked');
    el.id = collection.id;

    if (isAvailable) {
      el.href = collection.href;
    }

    const badgeLabel = isAvailable ? 'Available' : 'Coming Soon';
    const badgeClass = isAvailable
      ? 'program-collection-card__badge program-collection-card__badge--available'
      : 'program-collection-card__badge';

    let metaHtml = '';
    if (collection.frequency || collection.sessions || collection.split) {
      metaHtml = '<div class="program-meta">';
      if (collection.frequency) {
        metaHtml += '<span class="program-meta__pill">' + collection.frequency + '</span>';
      }
      if (collection.sessions) {
        metaHtml +=
          '<span class="program-meta__pill">' +
          collection.sessions +
          ' session' +
          (collection.sessions === 1 ? '' : 's') +
          '</span>';
      }
      if (collection.split) {
        metaHtml += '<span class="program-meta__pill">' + collection.split + '</span>';
      }
      metaHtml += '</div>';
    }

    el.innerHTML =
      '<div class="program-collection-card__header">' +
      '<span class="' +
      badgeClass +
      '">' +
      badgeLabel +
      '</span>' +
      (isAvailable ? arrowSvg : lockSvg) +
      '</div>' +
      '<h2 class="program-collection-card__title">' +
      collection.title +
      '</h2>' +
      metaHtml +
      '<p class="program-collection-card__summary">' +
      collection.summary +
      '</p>';

    fragment.appendChild(el);
  });

  grid.appendChild(fragment);
})();
