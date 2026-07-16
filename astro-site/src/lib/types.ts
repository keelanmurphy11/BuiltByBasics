export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type ExperienceLevel = 'all' | Difficulty;
export type FeaturedSlot = 'startHere' | 'newest' | 'popular';
export type ResourceFormat = 'article' | 'program';
export type SortKey = 'newest' | 'popular' | 'updated' | 'relevance';
export type EvidenceLevel = 'review' | 'meta-analysis' | 'rct' | 'expert' | 'guide';

export interface ResearchSource {
  title: string;
  url: string;
  citation?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface RelatedResourceRef {
  _id: string;
  _type: 'article' | 'program';
  title: string;
  slug: string;
  summary?: string;
  difficulty?: Difficulty;
  experienceLevel?: ExperienceLevel;
}

export interface LibraryResourceRaw {
  _id: string;
  _type: 'article' | 'program';
  _updatedAt?: string;
  title: string;
  slug: string;
  summary?: string;
  topics?: string[];
  difficulty?: Difficulty;
  experienceLevel?: ExperienceLevel;
  featured?: boolean;
  featuredSlot?: FeaturedSlot;
  popularityScore?: number;
  publishedAt?: string;
  status?: string;
  evidenceLevel?: EvidenceLevel;
  frequency?: string;
  sessions?: number;
  split?: string;
  body?: unknown[];
  coverImageUrl?: string;
}

export interface LibraryResource {
  id: string;
  type: ResourceFormat;
  resourceType: string;
  title: string;
  slug: string;
  summary?: string;
  href: string;
  actionLabel: string;
  topics: string[];
  difficulty?: Difficulty;
  experienceLevel?: ExperienceLevel;
  featured?: boolean;
  featuredSlot?: FeaturedSlot;
  popularityScore: number;
  publishedAt?: string;
  updatedAt?: string;
  evidenceLevel?: EvidenceLevel;
  readingTime?: number;
  duration?: string;
  frequency?: string;
  sessions?: number;
  split?: string;
  status?: string;
  coverImageUrl?: string;
}

export interface FeaturedResource {
  slot: 'startHere' | 'newest' | 'popular';
  label: string;
  resource: LibraryResource | null;
  fallbackHref?: string;
  fallbackTitle?: string;
  fallbackSummary?: string;
  fallbackAction?: string;
}

export interface TopicCount {
  slug: string;
  count: number;
}

export interface ResourceTypeCount {
  slug: string;
  count: number;
}

export interface ArticleDetail extends ArticleSummary {
  body?: unknown[];
  coverImage?: unknown;
  keyTakeaways?: string[];
  sources?: ResearchSource[];
  relatedResources?: RelatedResourceRef[];
  evidenceLevel?: EvidenceLevel;
  difficulty?: Difficulty;
  topics?: string[];
  featured?: boolean;
  featuredSlot?: FeaturedSlot;
  popularityScore?: number;
  _updatedAt?: string;
}

export interface ProgramOverviewImage {
  url?: string;
  alt?: string;
  caption?: string;
}

export interface ProgramDetail extends ProgramSummary {
  days?: ProgramDay[];
  equipment?: string[];
  goal?: string;
  durationWeeks?: number;
  faq?: FaqItem[];
  relatedResources?: RelatedResourceRef[];
  overviewImage?: ProgramOverviewImage | null;
  pdfFile?: { asset?: { url?: string } };
  topics?: string[];
  featured?: boolean;
  featuredSlot?: FeaturedSlot;
  popularityScore?: number;
  _updatedAt?: string;
}

export interface MovementPattern {
  _id: string;
  title: string;
  slug: string;
  examples?: string[];
}

export interface WorkoutSlot {
  slotType: 'pattern' | 'choice';
  choiceLabel?: string;
  pattern?: MovementPattern | null;
  choices?: MovementPattern[];
}

export interface ProgramDay {
  _key: string;
  title: string;
  intro?: string;
  guidance?: string;
  slots?: WorkoutSlot[];
  accessories?: string[];
}

export interface ProgramSummary {
  _id: string;
  title: string;
  slug: string;
  summary?: string;
  status: 'available' | 'comingSoon' | 'paid';
  frequency?: string;
  sessions?: number;
  split?: string;
  isFree?: boolean;
  stripePriceId?: string;
  topics?: string[];
  experienceLevel?: ExperienceLevel;
  popularityScore?: number;
  _updatedAt?: string;
}

export interface ArticleSummary {
  _id: string;
  title: string;
  slug: string;
  summary?: string;
  status: 'draft' | 'published' | 'comingSoon';
  publishedAt?: string;
  topics?: string[];
  difficulty?: Difficulty;
  evidenceLevel?: EvidenceLevel;
  popularityScore?: number;
  _updatedAt?: string;
}

export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface LibraryFilters {
  query?: string;
  topic?: string;
  format?: string;
  difficulty?: string;
  sort?: SortKey;
}
