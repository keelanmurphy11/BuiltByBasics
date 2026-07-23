export interface LibraryTopic {
  slug: string;
  title: string;
  description: string;
  icon: string;
}

export interface ResourceTypeConfig {
  slug: string;
  title: string;
  description: string;
  available: boolean;
  cmsType?: 'article' | 'program';
}

export type CollectionIcon = 'programs' | 'articles' | 'videos';
export type CollectionIconTone = 'blue' | 'green' | 'purple';

export interface LibrarySection {
  slug: string;
  title: string;
  description: string;
  href?: string;
  available: boolean;
  countKey?: 'program' | 'article';
  icon?: CollectionIcon;
  iconTone?: CollectionIconTone;
  countLabel?: string;
  exploreLabel?: string;
}

export const LIBRARY_SECTIONS: LibrarySection[] = [
  {
    slug: 'programs',
    title: 'Plans & Programs',
    description: 'Structured training plans designed to help you achieve specific goals.',
    href: '/programs',
    available: true,
    countKey: 'program',
    icon: 'programs',
    iconTone: 'blue',
    countLabel: 'programs',
    exploreLabel: 'Explore all programs',
  },
  {
    slug: 'articles',
    title: 'Articles / Blog',
    description: 'In-depth explanations of training, nutrition and recovery.',
    href: '/articles',
    available: true,
    countKey: 'article',
    icon: 'articles',
    iconTone: 'green',
    countLabel: 'articles',
    exploreLabel: 'See all articles',
  },
  {
    slug: 'videos',
    title: 'Videos',
    description: 'Practical demonstrations, technique guides and lectures.',
    available: false,
    icon: 'videos',
    iconTone: 'purple',
    exploreLabel: 'Learn more',
  },
];

export interface LibraryCategoryChip {
  slug: string;
  label: string;
  href?: string;
  available: boolean;
  /** Shown before “View all filters”; omit for secondary topic chips. */
  primary?: boolean;
}

export const LIBRARY_CATEGORY_CHIPS: LibraryCategoryChip[] = [
  { slug: 'all', label: 'All', href: '/library/search', available: true, primary: true },
  { slug: 'programs', label: 'Programs', href: '/library/search?format=programs', available: true, primary: true },
  { slug: 'articles', label: 'Articles', href: '/library/search?format=articles', available: true, primary: true },
  { slug: 'videos', label: 'Videos', available: false },
  { slug: 'nutrition', label: 'Nutrition', href: '/library/search?topic=nutrition', available: true },
  { slug: 'strength', label: 'Strength', href: '/library/search?topic=strength', available: true },
  { slug: 'running', label: 'Running', href: '/library/search?topic=running', available: true },
  { slug: 'recovery', label: 'Recovery', href: '/library/search?topic=recovery', available: true },
  { slug: 'mobility', label: 'Mobility', href: '/library/search?topic=mobility', available: true },
];

export interface LearningPathStep {
  type: 'article' | 'program' | 'basics' | 'external';
  slug?: string;
  href?: string;
  title: string;
}

export interface LearningPath {
  slug: string;
  title: string;
  description: string;
  steps: LearningPathStep[];
}

export const LIBRARY_TOPICS: LibraryTopic[] = [
  {
    slug: 'strength',
    title: 'Strength',
    description: 'Resistance training, hypertrophy, and strength development.',
    icon: '💪',
  },
  {
    slug: 'running',
    title: 'Running',
    description: 'Endurance, pacing, and run-specific training.',
    icon: '🏃',
  },
  {
    slug: 'cycling',
    title: 'Cycling',
    description: 'Bike fitness, power, and cycling performance.',
    icon: '🚴',
  },
  {
    slug: 'nutrition',
    title: 'Nutrition',
    description: 'Fueling, macros, and dietary strategies.',
    icon: '🥗',
  },
  {
    slug: 'recovery',
    title: 'Recovery',
    description: 'Sleep, rest, and regeneration practices.',
    icon: '😴',
  },
  {
    slug: 'performance',
    title: 'Performance',
    description: 'Athletic output, peaking, and competition prep.',
    icon: '⚡',
  },
  {
    slug: 'fat-loss',
    title: 'Fat Loss',
    description: 'Body composition and sustainable fat loss.',
    icon: '📉',
  },
  {
    slug: 'longevity',
    title: 'Longevity',
    description: 'Healthspan, aging, and lifelong fitness.',
    icon: '🌿',
  },
  {
    slug: 'mobility',
    title: 'Mobility',
    description: 'Flexibility, movement quality, and injury prevention.',
    icon: '🧘',
  },
  {
    slug: 'programming',
    title: 'Programming',
    description: 'Plan design, periodization, and training structure.',
    icon: '📋',
  },
];

export const RESOURCE_TYPES: ResourceTypeConfig[] = [
  {
    slug: 'articles',
    title: 'Articles / Blog',
    description: 'Evidence-based long-form guides and explainers.',
    available: true,
    cmsType: 'article',
  },
  {
    slug: 'programs',
    title: 'Programs',
    description: 'Structured training plans you can follow today.',
    available: true,
    cmsType: 'program',
  },
  {
    slug: 'videos',
    title: 'Videos',
    description: 'Technique demos, walkthroughs, and visual guides.',
    available: false,
  },
  {
    slug: 'podcasts',
    title: 'Podcasts',
    description: 'Audio deep-dives and conversations on training.',
    available: false,
  },
  {
    slug: 'downloads',
    title: 'Downloads',
    description: 'PDFs, checklists, and printable resources.',
    available: false,
  },
  {
    slug: 'tools',
    title: 'Tools',
    description: 'Calculators, trackers, and interactive utilities.',
    available: false,
  },
  {
    slug: 'research-reviews',
    title: 'Research Reviews',
    description: 'Curated summaries of the latest evidence.',
    available: false,
  },
];

export const LEARNING_PATHS: LearningPath[] = [
  {
    slug: 'beginner-foundations',
    title: 'Beginner Foundations',
    description: 'Start with the core principles before diving into specifics.',
    steps: [{ type: 'basics', href: '/basics', title: 'Basics of Training' }],
  },
  {
    slug: 'build-muscle',
    title: 'Build Muscle',
    description: 'A structured path from fundamentals to hypertrophy programming.',
    steps: [
      { type: 'basics', href: '/basics', title: 'Basics of Training' },
      { type: 'article', slug: 'strength-training', title: 'Strength Training' },
      { type: 'program', slug: 'full-body-2x', title: 'Full Body 2x' },
    ],
  },
  {
    slug: '5k-training',
    title: '5K Training',
    description: 'Build aerobic fitness and prepare for your first 5K.',
    steps: [
      { type: 'basics', href: '/basics', title: 'Basics of Training' },
      { type: 'article', slug: 'cardio-fitness', title: 'Cardio Fitness' },
    ],
  },
  {
    slug: 'fat-loss',
    title: 'Fat Loss',
    description: 'Evidence-based approach to sustainable body composition change.',
    steps: [
      { type: 'basics', href: '/basics', title: 'Basics of Training' },
      { type: 'article', slug: 'fat-loss', title: 'Fat Loss' },
      { type: 'program', slug: 'full-body-2x', title: 'Full Body 2x' },
    ],
  },
  {
    slug: 'half-marathon',
    title: 'Half Marathon',
    description: 'Progress from base fitness to half marathon readiness.',
    steps: [
      { type: 'article', slug: 'cardio-fitness', title: 'Cardio Fitness' },
      { type: 'article', slug: 'strength-training', title: 'Strength Training' },
    ],
  },
];

export function getTopicBySlug(slug: string): LibraryTopic | undefined {
  return LIBRARY_TOPICS.find((t) => t.slug === slug);
}

export function getResourceTypeBySlug(slug: string): ResourceTypeConfig | undefined {
  return RESOURCE_TYPES.find((t) => t.slug === slug);
}
