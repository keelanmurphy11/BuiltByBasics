import type {
  LibraryFilters,
  LibraryResource,
  LibraryResourceRaw,
  ResourceFormat,
  SortKey,
  TopicCount,
  TocHeading,
  FeaturedResource,
} from './types';
import { searchLibraryResources } from './library-search';

const WORDS_PER_MINUTE = 200;

export function estimateReadingTime(body?: unknown[]): number {
  if (!body?.length) return 5;

  let words = 0;
  for (const block of body) {
    if (block && typeof block === 'object' && '_type' in block && block._type === 'block') {
      const children = (block as { children?: Array<{ text?: string }> }).children;
      if (children) {
        for (const child of children) {
          if (child.text) {
            words += child.text.split(/\s+/).filter(Boolean).length;
          }
        }
      }
    }
  }

  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`;
}

export function formatDifficulty(difficulty?: string): string {
  if (!difficulty) return '';
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}

export function formatExperienceLevel(level?: string): string {
  if (!level) return '';
  if (level === 'all') return 'All experience levels';
  return formatDifficulty(level);
}

export function getResourceLevelLabel(resource: {
  type: ResourceFormat;
  difficulty?: string;
  experienceLevel?: string;
}): string {
  if (resource.type === 'program') {
    return formatExperienceLevel(resource.experienceLevel);
  }
  return formatDifficulty(resource.difficulty);
}

export function matchesLevelFilter(
  resource: {
    type: ResourceFormat;
    difficulty?: string;
    experienceLevel?: string;
  },
  level: string
): boolean {
  if (resource.type === 'program') {
    return resource.experienceLevel === level || resource.experienceLevel === 'all';
  }
  return resource.difficulty === level;
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatShortDate(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const DEFAULT_FEATURED_IMAGE = '/content/images/gym.jpg';

export function getResourceImageUrl(resource?: LibraryResource | null): string {
  return resource?.coverImageUrl || DEFAULT_FEATURED_IMAGE;
}

export function normalizeResource(raw: LibraryResourceRaw): LibraryResource {
  const isArticle = raw._type === 'article';
  const href = isArticle ? `/articles/${raw.slug}` : `/programs/${raw.slug}`;
  const actionLabel = isArticle ? 'Read Article' : 'View Program';
  const readingTime = isArticle && raw.body ? estimateReadingTime(raw.body) : undefined;
  const duration =
    !isArticle && raw.frequency
      ? `${raw.frequency}${raw.sessions ? ` · ${raw.sessions} sessions` : ''}`
      : undefined;

  return {
    id: raw._id,
    type: isArticle ? 'article' : 'program',
    resourceType: isArticle ? 'Article' : 'Program',
    title: raw.title,
    slug: raw.slug,
    summary: raw.summary,
    href,
    actionLabel,
    topics: raw.topics ?? [],
    difficulty: isArticle ? raw.difficulty : undefined,
    experienceLevel: isArticle ? undefined : raw.experienceLevel,
    featured: raw.featured,
    featuredSlot: raw.featuredSlot,
    popularityScore: raw.popularityScore ?? 0,
    publishedAt: raw.publishedAt,
    updatedAt: raw._updatedAt,
    evidenceLevel: raw.evidenceLevel,
    readingTime,
    duration,
    frequency: raw.frequency,
    sessions: raw.sessions,
    split: raw.split,
    status: raw.status,
    coverImageUrl: raw.coverImageUrl,
  };
}

export function normalizeResources(raws: LibraryResourceRaw[]): LibraryResource[] {
  return raws.map(normalizeResource);
}

export function aggregateTopicCounts(resources: LibraryResource[]): TopicCount[] {
  const counts = new Map<string, number>();

  for (const resource of resources) {
    for (const topic of resource.topics) {
      counts.set(topic, (counts.get(topic) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries()).map(([slug, count]) => ({ slug, count }));
}

export function sortResources(resources: LibraryResource[], sort: SortKey = 'newest'): LibraryResource[] {
  const sorted = [...resources];

  switch (sort) {
    case 'popular':
      return sorted.sort((a, b) => {
        const scoreDiff = (b.popularityScore ?? 0) - (a.popularityScore ?? 0);
        if (scoreDiff !== 0) return scoreDiff;
        return getTimestamp(b) - getTimestamp(a);
      });
    case 'updated':
      return sorted.sort((a, b) => getUpdatedTimestamp(b) - getUpdatedTimestamp(a));
    case 'relevance':
    case 'newest':
    default:
      return sorted.sort((a, b) => getTimestamp(b) - getTimestamp(a));
  }
}

function getTimestamp(resource: LibraryResource): number {
  if (resource.publishedAt) return new Date(resource.publishedAt).getTime();
  if (resource.updatedAt) return new Date(resource.updatedAt).getTime();
  return 0;
}

function getUpdatedTimestamp(resource: LibraryResource): number {
  if (resource.updatedAt) return new Date(resource.updatedAt).getTime();
  return getTimestamp(resource);
}

export function filterResources(
  resources: LibraryResource[],
  filters: LibraryFilters
): LibraryResource[] {
  let result = [...resources];

  if (filters.topic) {
    result = result.filter((r) => r.topics.includes(filters.topic!));
  }

  if (filters.format) {
    const formatMap: Record<string, string> = {
      articles: 'article',
      programs: 'program',
    };
    const type = formatMap[filters.format] ?? filters.format;
    result = result.filter((r) => r.type === type);
  }

  if (filters.difficulty) {
    result = result.filter((r) => matchesLevelFilter(r, filters.difficulty!));
  }

  const query = filters.query?.trim();
  const sort = filters.sort ?? 'newest';

  if (query) {
    const searchSort = sort === 'relevance' || !sort ? 'relevance' : sort;
    return searchLibraryResources(result, query, { sort: searchSort });
  }

  return sortResources(result, sort);
}

export function getFeaturedResources(resources: LibraryResource[]): FeaturedResource[] {
  const startHere =
    resources.find((r) => r.featuredSlot === 'startHere') ??
    resources.find((r) => r.featured && r.featuredSlot === 'startHere');

  const newest =
    resources.find((r) => r.featuredSlot === 'newest') ?? sortResources(resources, 'newest')[0];

  const popular =
    resources.find((r) => r.featuredSlot === 'popular') ?? sortResources(resources, 'popular')[0];

  return [
    {
      slot: 'startHere',
      label: 'Start Here',
      resource: startHere ?? null,
      fallbackHref: '/basics',
      fallbackTitle: 'Basics of Training',
      fallbackSummary: 'Master the fundamentals before exploring the rest of the library.',
      fallbackAction: 'Read the Basics',
    },
    {
      slot: 'newest',
      label: 'Newest',
      resource: newest ?? null,
      fallbackHref: '/library',
      fallbackTitle: 'Browse the Library',
      fallbackSummary: 'Explore the latest resources as they are published.',
      fallbackAction: 'Browse All',
    },
    {
      slot: 'popular',
      label: 'Most Popular',
      resource: popular ?? null,
      fallbackHref: '/library',
      fallbackTitle: 'Browse the Library',
      fallbackSummary: 'Discover what other readers are finding most useful.',
      fallbackAction: 'Browse All',
    },
  ];
}

export function getPrimaryFeaturedResource(resources: LibraryResource[]): LibraryResource | null {
  const featured =
    resources.find((r) => r.featuredSlot === 'startHere' && r.type === 'article') ??
    resources.find((r) => r.featured && r.featuredSlot === 'startHere') ??
    resources.find((r) => r.featured) ??
    sortResources(resources, 'popular')[0];

  return featured ?? null;
}

export function getLatestResources(resources: LibraryResource[], limit = 6): LibraryResource[] {
  return sortResources(resources, 'newest').slice(0, limit);
}

export function extractTocHeadings(body: unknown[]): TocHeading[] {
  const headings: TocHeading[] = [];

  for (const block of body) {
    if (!block || typeof block !== 'object' || !('_type' in block) || block._type !== 'block') {
      continue;
    }

    const style = (block as { style?: string }).style;
    if (style !== 'h2' && style !== 'h3') continue;

    const children = (block as { children?: Array<{ text?: string }> }).children;
    const text = children?.map((c) => c.text ?? '').join('') ?? '';
    if (!text.trim()) continue;

    const id = slugifyHeading(text);
    headings.push({
      id,
      text: text.trim(),
      level: style === 'h2' ? 2 : 3,
    });
  }

  return headings;
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export function getEvidenceLabel(level?: string): string {
  const labels: Record<string, string> = {
    review: 'Systematic Review',
    'meta-analysis': 'Meta-Analysis',
    rct: 'RCT',
    expert: 'Expert Consensus',
    guide: 'Practical Guide',
  };
  return level ? labels[level] ?? level : '';
}

export function resolveLearningPathHref(
  step: { type: string; slug?: string; href?: string },
  resources: LibraryResource[]
): string {
  if (step.href) return step.href;
  if (step.type === 'basics') return '/basics';
  if (step.slug) {
    const match = resources.find((r) => r.slug === step.slug);
    if (match) return match.href;
    if (step.type === 'article') return `/articles/${step.slug}`;
    if (step.type === 'program') return `/programs/${step.slug}`;
  }
  return '/library';
}
