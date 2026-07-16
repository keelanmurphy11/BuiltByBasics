/**
 * Client-side library search, filter, and sort.
 * Reads resource index from #library-index JSON script tag.
 */
import { searchLibraryResources } from '../lib/library-search';
import type { LibraryResource, SortKey } from '../lib/types';

type HubState = {
  q: string;
  topic: string;
  format: string;
  difficulty: string;
  sort: SortKey;
};

type InitState = Partial<Pick<HubState, 'topic' | 'format' | 'difficulty' | 'sort'>>;

const indexEl = document.getElementById('library-index');
const initEl = document.getElementById('library-init');
const topicLabelsEl = document.getElementById('library-topic-labels');
const searchInput = document.getElementById('library-search') as HTMLInputElement | null;
const feedEl = document.querySelector('[data-library-feed]');
const filtersEl = document.querySelector('[data-library-filters]');

if (!indexEl || !feedEl) {
  // Not on a library hub page.
} else {
  let resources: LibraryResource[] = [];
  let topicLabels: Record<string, string> = {};

  try {
    resources = JSON.parse(indexEl.textContent || '[]') as LibraryResource[];
  } catch {
    resources = [];
  }

  if (topicLabelsEl) {
    try {
      topicLabels = JSON.parse(topicLabelsEl.textContent || '{}') as Record<string, string>;
    } catch {
      topicLabels = {};
    }
  }

  const state: HubState = {
    q: '',
    topic: '',
    format: '',
    difficulty: '',
    sort: 'newest',
  };

  const formatLabels: Record<string, string> = {
    articles: 'Articles',
    programs: 'Programs',
  };

  const difficultyLabels: Record<string, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  };

  function readUrlParams() {
    const params = new URLSearchParams(window.location.search);

    let init: InitState = {};
    if (initEl) {
      try {
        init = JSON.parse(initEl.textContent || '{}') as InitState;
      } catch {
        init = {};
      }
    }

    state.q = params.get('q') || '';
    state.topic = params.get('topic') || init.topic || '';
    state.format = params.get('format') || init.format || '';
    state.difficulty = params.get('difficulty') || init.difficulty || '';
    state.sort = (params.get('sort') || init.sort || (state.q ? 'relevance' : 'newest')) as SortKey;

    if (searchInput && state.q) {
      searchInput.value = state.q;
    }

    syncFilterUI();
    syncCategoryChips();
  }

  function syncCategoryChips() {
    const chipsNav = document.querySelector('.lib-chips');
    if (!chipsNav) return;

    let activeSlug = 'all';
    if (state.format === 'programs') activeSlug = 'programs';
    else if (state.format === 'articles') activeSlug = 'articles';
    else if (state.topic) activeSlug = state.topic;

    chipsNav.querySelectorAll('[data-chip-slug]').forEach((chip) => {
      const slug = chip.getAttribute('data-chip-slug');
      const isActive = slug === activeSlug;
      chip.classList.toggle('lib-chip--active', isActive);
      if (isActive) chip.setAttribute('aria-current', 'page');
      else chip.removeAttribute('aria-current');
    });

    // Keep topic chips visible when a secondary filter is active
    const activeChip = chipsNav.querySelector(`[data-chip-slug="${activeSlug}"]`);
    const more = chipsNav.querySelector<HTMLElement>('[data-chips-more]');
    const toggle = chipsNav.querySelector<HTMLButtonElement>('[data-chips-toggle]');
    const label = chipsNav.querySelector<HTMLElement>('[data-chips-toggle-label]');
    if (activeChip && more?.contains(activeChip) && !chipsNav.classList.contains('lib-chips--expanded')) {
      chipsNav.classList.add('lib-chips--expanded');
      chipsNav.setAttribute('data-chips-expanded', 'true');
      more.hidden = false;
      toggle?.setAttribute('aria-expanded', 'true');
      if (label) label.textContent = 'Show fewer';
    }
  }

  function getActiveFilterCount() {
    let count = 0;
    if (state.topic) count++;
    if (state.format) count++;
    if (state.difficulty) count++;
    return count;
  }

  function syncFilterUI() {
    if (!filtersEl) return;

    const sortSelect = filtersEl.querySelector('[data-filter="sort"]') as HTMLSelectElement | null;
    if (sortSelect) sortSelect.value = state.sort;

    (['topic', 'format', 'difficulty'] as const).forEach((key) => {
      const select = filtersEl.querySelector(`[data-filter="${key}"]`) as HTMLSelectElement | null;
      if (select) select.value = state[key] || '';
    });

    updateFilterBadge();
    renderActivePills();
  }

  function updateFilterBadge() {
    const badge = filtersEl?.querySelector('[data-filter-badge]') as HTMLElement | null;
    if (!badge) return;

    const count = getActiveFilterCount();
    badge.textContent = String(count);
    badge.hidden = count === 0;
  }

  function renderActivePills() {
    const pillsEl = filtersEl?.querySelector('[data-active-pills]') as HTMLElement | null;
    if (!pillsEl) return;

    const pills: Array<{ key: keyof HubState; label: string }> = [];

    if (state.topic) {
      pills.push({
        key: 'topic',
        label: `Topic: ${topicLabels[state.topic] || state.topic}`,
      });
    }
    if (state.format) {
      pills.push({
        key: 'format',
        label: `Format: ${formatLabels[state.format] || state.format}`,
      });
    }
    if (state.difficulty) {
      pills.push({
        key: 'difficulty',
        label: `Level: ${difficultyLabels[state.difficulty] || state.difficulty}`,
      });
    }

    if (pills.length === 0) {
      pillsEl.hidden = true;
      pillsEl.innerHTML = '';
      return;
    }

    pillsEl.hidden = false;
    pillsEl.innerHTML = pills
      .map(
        (pill) => `
        <button type="button" class="lib-active-pill" data-clear-filter="${pill.key}">
          ${escapeHtml(pill.label)}
          <span aria-hidden="true">&times;</span>
        </button>
      `
      )
      .join('');
  }

  function positionFilterPanel() {
    const panel = filtersEl?.querySelector('[data-filter-panel]') as HTMLElement | null;
    const toggle = filtersEl?.querySelector('[data-filter-toggle]') as HTMLElement | null;
    if (!panel || panel.hidden || !toggle) return;

    if (window.matchMedia('(max-width: 639px)').matches) {
      panel.style.removeProperty('position');
      panel.style.removeProperty('top');
      panel.style.removeProperty('right');
      panel.style.removeProperty('left');
      panel.style.removeProperty('width');
      panel.style.removeProperty('max-height');
      return;
    }

    const rect = toggle.getBoundingClientRect();
    const panelWidth = Math.min(320, window.innerWidth - 40);
    const maxHeight = Math.min(384, window.innerHeight - 32);
    let top = rect.bottom + 8;

    panel.style.position = 'fixed';
    panel.style.width = `${panelWidth}px`;
    panel.style.maxHeight = `${maxHeight}px`;
    panel.style.right = `${Math.max(16, window.innerWidth - rect.right)}px`;
    panel.style.left = 'auto';

    const panelHeight = panel.getBoundingClientRect().height || maxHeight;
    if (top + panelHeight > window.innerHeight - 16) {
      top = Math.max(16, rect.top - panelHeight - 8);
    }

    panel.style.top = `${top}px`;
  }

  function resetFilterPanelPosition() {
    const panel = filtersEl?.querySelector('[data-filter-panel]') as HTMLElement | null;
    if (!panel) return;

    panel.style.removeProperty('position');
    panel.style.removeProperty('top');
    panel.style.removeProperty('right');
    panel.style.removeProperty('left');
    panel.style.removeProperty('width');
    panel.style.removeProperty('max-height');
  }

  function openFilterPanel() {
    const panel = filtersEl?.querySelector('[data-filter-panel]') as HTMLElement | null;
    const backdrop = filtersEl?.querySelector('[data-filter-backdrop]') as HTMLElement | null;
    const toggle = filtersEl?.querySelector('[data-filter-toggle]') as HTMLElement | null;
    if (!panel) return;

    panel.hidden = false;
    panel.classList.add('lib-filter-panel--open');
    if (backdrop) backdrop.hidden = false;
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('lib-filter-open');
    requestAnimationFrame(() => {
      positionFilterPanel();
      requestAnimationFrame(positionFilterPanel);
    });
  }

  function closeFilterPanel() {
    const panel = filtersEl?.querySelector('[data-filter-panel]') as HTMLElement | null;
    const backdrop = filtersEl?.querySelector('[data-filter-backdrop]') as HTMLElement | null;
    const toggle = filtersEl?.querySelector('[data-filter-toggle]') as HTMLElement | null;
    if (!panel) return;

    panel.hidden = true;
    panel.classList.remove('lib-filter-panel--open');
    if (backdrop) backdrop.hidden = true;
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('lib-filter-open');
    resetFilterPanelPosition();
  }

  function writeUrlParams() {
    const params = new URLSearchParams();
    if (state.q) params.set('q', state.q);
    if (state.topic) params.set('topic', state.topic);
    if (state.format) params.set('format', state.format);
    if (state.difficulty) params.set('difficulty', state.difficulty);

    const defaultSort = state.q ? 'relevance' : 'newest';
    if (state.sort && state.sort !== defaultSort) params.set('sort', state.sort);

    const qs = params.toString();
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState({}, '', url);
  }

  function matchesLevelFilter(resource: LibraryResource, level: string) {
    if (resource.type === 'program') {
      return resource.experienceLevel === level || resource.experienceLevel === 'all';
    }
    return resource.difficulty === level;
  }

  function filterResources(): LibraryResource[] {
    let result = [...resources];

    if (state.topic) {
      result = result.filter((r) => (r.topics || []).includes(state.topic));
    }

    if (state.format) {
      const typeMap: Record<string, string> = { articles: 'article', programs: 'program' };
      const type = typeMap[state.format] || state.format;
      result = result.filter((r) => r.type === type);
    }

    if (state.difficulty) {
      result = result.filter((r) => matchesLevelFilter(r, state.difficulty));
    }

    const query = state.q.trim();
    if (query) {
      const sort = state.sort === 'relevance' ? 'relevance' : state.sort;
      return searchLibraryResources(result, query, { sort });
    }

    return searchLibraryResources(result, '', { sort: state.sort });
  }

  function formatDate(dateStr?: string) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function formatDifficulty(d?: string) {
    if (!d) return '';
    return d.charAt(0).toUpperCase() + d.slice(1);
  }

  function formatExperienceLevel(level?: string) {
    if (!level) return '';
    if (level === 'all') return 'All experience levels';
    return formatDifficulty(level);
  }

  function getResourceLevelLabel(resource: LibraryResource) {
    if (resource.type === 'program') {
      return formatExperienceLevel(resource.experienceLevel);
    }
    return formatDifficulty(resource.difficulty);
  }

  function renderCard(r: LibraryResource) {
    const meta: string[] = [];
    if (r.readingTime) meta.push(`${r.readingTime} min read`);
    if (r.duration) meta.push(r.duration);
    if (getResourceLevelLabel(r)) meta.push(getResourceLevelLabel(r));
    if (r.type === 'article' && (r.updatedAt || r.publishedAt)) {
      meta.push(`Updated ${formatDate(r.updatedAt || r.publishedAt)}`);
    }

    const evidence = r.evidenceLevel
      ? `<span class="resource-card__evidence">${r.evidenceLevel}</span>`
      : '';

    return `
      <a href="${r.href}" class="resource-card" data-resource-card data-resource-id="${r.id}">
        <div class="resource-card__header">
          <span class="resource-card__badge">${r.resourceType}</span>
          ${evidence}
        </div>
        <h3 class="resource-card__title">${escapeHtml(r.title)}</h3>
        ${r.summary ? `<p class="resource-card__summary">${escapeHtml(r.summary)}</p>` : ''}
        <div class="resource-card__meta">
          ${meta.map((m) => `<span class="resource-card__meta-item">${m}</span>`).join('')}
        </div>
        <span class="resource-card__action">
          ${r.actionLabel}
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </span>
      </a>
    `;
  }

  function escapeHtml(str: string) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function render() {
    const filtered = filterResources();
    const countEl = filtersEl?.querySelector('[data-feed-count]');

    if (countEl) {
      countEl.textContent = `${filtered.length} resource${filtered.length === 1 ? '' : 's'}`;
    }

    if (filtered.length === 0) {
      feedEl.innerHTML =
        '<p class="lib-feed__empty">No resources match your filters. Try adjusting your search.</p>';
      writeUrlParams();
      syncCategoryChips();
      return;
    }

    feedEl.innerHTML = filtered.map(renderCard).join('');
    writeUrlParams();
    syncCategoryChips();
  }

  function debounce<T extends (...args: never[]) => void>(fn: T, ms: number) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    return (...args: Parameters<T>) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  }

  const debouncedRender = debounce(render, 150);

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      state.q = target.value;

      if (state.q.trim()) {
        if (state.sort === 'newest') state.sort = 'relevance';
      } else if (state.sort === 'relevance') {
        state.sort = 'newest';
      }

      syncFilterUI();
      debouncedRender();
    });
  }

  if (filtersEl) {
    filtersEl.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      if (target.closest('[data-filter-toggle]')) {
        const panel = filtersEl.querySelector('[data-filter-panel]') as HTMLElement | null;
        if (panel?.hidden) openFilterPanel();
        else closeFilterPanel();
        return;
      }

      if (target.closest('[data-filter-close]') || target.closest('[data-filter-backdrop]')) {
        closeFilterPanel();
        return;
      }

      const clearBtn = target.closest('[data-clear-filter]') as HTMLElement | null;
      if (clearBtn) {
        const key = clearBtn.getAttribute('data-clear-filter') as keyof HubState | null;
        if (key && key in state) {
          state[key] = '' as never;
          syncFilterUI();
          render();
        }
        return;
      }

      if (target.closest('[data-filter-clear]')) {
        state.topic = '';
        state.format = '';
        state.difficulty = '';
        syncFilterUI();
        render();
        closeFilterPanel();
      }
    });

    filtersEl.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      if (!target.matches('[data-filter]')) return;

      const filter = target.getAttribute('data-filter');
      if (filter === 'sort') {
        state.sort = target.value as SortKey;
        render();
        return;
      }

      if (filter && filter in state) {
        state[filter as keyof HubState] = target.value as never;
        syncFilterUI();
        render();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeFilterPanel();
      return;
    }
    if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput?.focus();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      searchInput?.focus();
    }
  });

  document.addEventListener('click', (e) => {
    const panel = filtersEl?.querySelector('[data-filter-panel]') as HTMLElement | null;
    if (!panel || panel.hidden) return;
    if ((e.target as HTMLElement).closest('[data-library-filters]')) return;
    closeFilterPanel();
  });

  window.addEventListener('resize', () => {
    const panel = filtersEl?.querySelector('[data-filter-panel]') as HTMLElement | null;
    if (panel && !panel.hidden) positionFilterPanel();
  });

  window.addEventListener(
    'scroll',
    () => {
      const panel = filtersEl?.querySelector('[data-filter-panel]') as HTMLElement | null;
      if (panel && !panel.hidden) positionFilterPanel();
    },
    { passive: true }
  );

  readUrlParams();
  render();
}
