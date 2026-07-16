import { LIBRARY_TOPICS, type LibraryTopic } from './library-config';
import type { LibraryResource, SortKey } from './types';

const STOP_WORDS = new Set(['a', 'an', 'the', 'for', 'and', 'or', 'to', 'of', 'in', 'on', 'with']);

/** Maps search terms/phrases to related topic slugs. */
export const SEARCH_TOPIC_ALIASES: Record<string, string[]> = {
  strength: ['strength'],
  'weight lifting': ['strength'],
  weightlifting: ['strength'],
  lifting: ['strength'],
  weights: ['strength'],
  gym: ['strength'],
  hypertrophy: ['strength'],
  muscle: ['strength'],
  resistance: ['strength'],
  barbell: ['strength'],
  dumbbell: ['strength'],
  powerlifting: ['strength'],

  running: ['running', 'performance'],
  run: ['running', 'performance'],
  jogging: ['running'],
  jog: ['running'],
  '5k': ['running'],
  marathon: ['running'],
  cardio: ['running', 'cycling', 'performance'],
  endurance: ['running', 'cycling', 'performance'],
  aerobic: ['running', 'cycling', 'performance'],

  cycling: ['cycling'],
  bike: ['cycling'],
  biking: ['cycling'],
  peloton: ['cycling'],

  nutrition: ['nutrition'],
  diet: ['nutrition'],
  macros: ['nutrition'],
  protein: ['nutrition'],
  fueling: ['nutrition'],
  calories: ['nutrition'],
  eating: ['nutrition'],
  food: ['nutrition'],

  recovery: ['recovery'],
  sleep: ['recovery'],
  rest: ['recovery'],
  deload: ['recovery'],
  regeneration: ['recovery'],

  mobility: ['mobility'],
  stretch: ['mobility'],
  stretching: ['mobility'],
  flexibility: ['mobility'],
  yoga: ['mobility'],

  'fat loss': ['fat-loss'],
  'fat-loss': ['fat-loss'],
  cut: ['fat-loss'],
  cutting: ['fat-loss'],
  'body composition': ['fat-loss'],
  lean: ['fat-loss'],

  performance: ['performance'],
  athletic: ['performance'],
  peaking: ['performance'],
  competition: ['performance'],

  longevity: ['longevity'],
  healthspan: ['longevity'],
  aging: ['longevity'],

  programming: ['programming'],
  periodization: ['programming'],
  'program design': ['programming'],
  plan: ['programming'],
};

export interface TopicCatalogEntry {
  slug: string;
  title: string;
  description: string;
  searchText: string;
}

export interface SearchExpansion {
  phrase: string;
  tokens: string[];
  topics: string[];
  keywords: string[];
}

export interface ScoredLibraryResource {
  resource: LibraryResource;
  score: number;
}

export interface SearchLibraryOptions {
  sort?: SortKey;
}

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function tokenizeQuery(query: string): string[] {
  const normalized = normalizeQuery(query);
  if (!normalized) return [];

  return normalized
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

export function buildTopicCatalog(topics: LibraryTopic[] = LIBRARY_TOPICS): TopicCatalogEntry[] {
  return topics.map((topic) => ({
    slug: topic.slug,
    title: topic.title,
    description: topic.description,
    searchText: `${topic.title} ${topic.description}`.toLowerCase(),
  }));
}

export function expandSearchQuery(
  query: string,
  topicCatalog: TopicCatalogEntry[] = buildTopicCatalog()
): SearchExpansion {
  const phrase = normalizeQuery(query);
  const tokens = tokenizeQuery(query);
  const topics = new Set<string>();
  const keywords = new Set<string>(tokens);

  const candidates = [phrase, ...tokens];
  for (const candidate of candidates) {
    const aliasTopics = SEARCH_TOPIC_ALIASES[candidate];
    if (aliasTopics) {
      for (const topic of aliasTopics) topics.add(topic);
    }
  }

  for (const entry of topicCatalog) {
    const slugNormalized = entry.slug.replace(/-/g, ' ');
    if (
      tokens.includes(entry.slug) ||
      tokens.some((token) => entry.slug.includes(token) || slugNormalized.includes(token))
    ) {
      topics.add(entry.slug);
    }

    for (const token of tokens) {
      if (entry.searchText.includes(token)) {
        topics.add(entry.slug);
        keywords.add(token);
      }
    }
  }

  return {
    phrase,
    tokens,
    topics: Array.from(topics),
    keywords: Array.from(keywords),
  };
}

function textContainsToken(text: string, token: string): boolean {
  return text.includes(token);
}

function popularityBonus(score: number): number {
  return Math.min(5, score / 20);
}

export function scoreLibraryResource(
  resource: LibraryResource,
  expansion: SearchExpansion,
  topicCatalog: TopicCatalogEntry[] = buildTopicCatalog()
): number {
  if (!expansion.phrase) return 0;

  const title = resource.title.toLowerCase();
  const summary = (resource.summary ?? '').toLowerCase();
  const slug = resource.slug.toLowerCase();
  const resourceTopics = resource.topics ?? [];

  let score = 0;

  if (expansion.phrase && title.includes(expansion.phrase)) {
    score += 100;
  }

  if (expansion.tokens.length > 0) {
    const allTokensInTitle = expansion.tokens.every((token) => textContainsToken(title, token));
    if (allTokensInTitle) score += 60;

    for (const token of expansion.tokens) {
      if (textContainsToken(title, token)) score += 25;
      if (textContainsToken(summary, token)) score += 15;
      if (textContainsToken(slug, token)) score += 20;
    }
  }

  for (const topicSlug of expansion.topics) {
    if (resourceTopics.includes(topicSlug)) {
      score += 50;
    }

    const catalogEntry = topicCatalog.find((entry) => entry.slug === topicSlug);
    if (!catalogEntry) continue;

    for (const token of expansion.tokens) {
      if (textContainsToken(catalogEntry.searchText, token)) {
        score += 30;
      }
    }
  }

  for (const keyword of expansion.keywords) {
    if (textContainsToken(title, keyword)) score += 10;
    if (textContainsToken(summary, keyword)) score += 8;
  }

  for (const topicSlug of resourceTopics) {
    const catalogEntry = topicCatalog.find((entry) => entry.slug === topicSlug);
    if (!catalogEntry) continue;

    if (expansion.phrase && catalogEntry.searchText.includes(expansion.phrase)) {
      score += 35;
    }

    for (const token of expansion.tokens) {
      if (textContainsToken(catalogEntry.title.toLowerCase(), token)) {
        score += 30;
      }
    }
  }

  if (score > 0) {
    score += popularityBonus(resource.popularityScore ?? 0);
  }

  return score;
}

function compareBySort(a: LibraryResource, b: LibraryResource, sort: SortKey): number {
  if (sort === 'popular') {
    const diff = (b.popularityScore ?? 0) - (a.popularityScore ?? 0);
    if (diff !== 0) return diff;
  }

  if (sort === 'updated') {
    const aDate = new Date(a.updatedAt || a.publishedAt || 0).getTime();
    const bDate = new Date(b.updatedAt || b.publishedAt || 0).getTime();
    return bDate - aDate;
  }

  const aDate = new Date(a.publishedAt || 0).getTime();
  const bDate = new Date(b.publishedAt || 0).getTime();
  return bDate - aDate;
}

export function searchLibraryResources(
  resources: LibraryResource[],
  query: string,
  options: SearchLibraryOptions = {}
): LibraryResource[] {
  const normalizedQuery = normalizeQuery(query);
  const sort = options.sort ?? 'newest';
  const topicCatalog = buildTopicCatalog();

  if (!normalizedQuery) {
    return [...resources].sort((a, b) => compareBySort(a, b, sort));
  }

  const expansion = expandSearchQuery(normalizedQuery, topicCatalog);
  const scored: ScoredLibraryResource[] = [];

  for (const resource of resources) {
    const score = scoreLibraryResource(resource, expansion, topicCatalog);
    if (score > 0) {
      scored.push({ resource, score });
    }
  }

  scored.sort((a, b) => {
    const scoreDiff = b.score - a.score;
    if (scoreDiff !== 0) return scoreDiff;

    const tiebreakerSort = sort === 'relevance' ? 'newest' : sort;
    return compareBySort(a.resource, b.resource, tiebreakerSort);
  });

  return scored.map((entry) => entry.resource);
}
