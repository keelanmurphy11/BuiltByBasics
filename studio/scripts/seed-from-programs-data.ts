/**
 * Seeds movement patterns and programs from js/programs-data.js into Sanity.
 *
 * Usage:
 *   1. Copy .env.example to .env and fill in project ID + write token
 *   2. npm run seed
 *
 * Topic tagging: programs are seeded with topics ["strength", "programming"].
 * Tag articles in Sanity Studio under Library Metadata > Topics using the
 * same slug values defined in astro-site/src/lib/library-config.ts.
 */

import { createClient } from '@sanity/client';
import { config } from 'dotenv';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

config({ path: join(__dirname, '..', '.env') });

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET || 'production';
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || projectId === 'your-project-id') {
  console.error('Set SANITY_STUDIO_PROJECT_ID in studio/.env before seeding.');
  process.exit(1);
}

if (!token) {
  console.error('Set SANITY_API_WRITE_TOKEN in studio/.env before seeding.');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
});

// Load programs-data.js from repo root (const declarations, no exports)
const dataPath = join(__dirname, '..', '..', 'js', 'programs-data.js');
const dataSource = readFileSync(dataPath, 'utf8');
const loadData = new Function(
  `${dataSource}\nreturn { MOVEMENT_PATTERNS, PROGRAM_COLLECTIONS, PROGRAMS_BY_COLLECTION };`
);
const { MOVEMENT_PATTERNS, PROGRAM_COLLECTIONS, PROGRAMS_BY_COLLECTION } = loadData() as {
  MOVEMENT_PATTERNS: Record<string, { label: string; examples: string[] }>;
  PROGRAM_COLLECTIONS: Array<{
    id: string;
    title: string;
    summary: string;
    status: string;
    frequency: string;
    sessions: number;
    split: string;
  }>;
  PROGRAMS_BY_COLLECTION: Record<
    string,
    Array<{
      id: string;
      title: string;
      intro?: string;
      guidance?: string;
      slots?: Array<{ patternId?: string; choice?: string[]; choiceLabel?: string }>;
      accessories?: string[];
    }>
  >;
};

type PatternRef = { _type: 'reference'; _ref: string };

function patternRef(slug: string): PatternRef {
  return { _type: 'reference', _ref: `movementPattern-${slug}` };
}

async function seedMovementPatterns() {
  console.log('Seeding movement patterns...');

  for (const [slug, pattern] of Object.entries(MOVEMENT_PATTERNS)) {
    await client.createOrReplace({
      _id: `movementPattern-${slug}`,
      _type: 'movementPattern',
      title: pattern.label,
      slug: { _type: 'slug', current: slug },
      examples: pattern.examples,
    });
    console.log(`  ✓ ${pattern.label}`);
  }
}

async function seedPrograms() {
  console.log('Seeding programs...');

  for (const collection of PROGRAM_COLLECTIONS) {
    const days = PROGRAMS_BY_COLLECTION[collection.id] || [];

    await client.createOrReplace({
      _id: `program-${collection.id}`,
      _type: 'program',
      title: collection.title,
      slug: { _type: 'slug', current: collection.id },
      summary: collection.summary,
      status: collection.status,
      frequency: collection.frequency,
      sessions: collection.sessions,
      split: collection.split,
      isFree: true,
      topics: ['strength', 'programming'],
      experienceLevel: 'all',
      goal: 'Build strength and movement proficiency',
      durationWeeks: 8,
      popularityScore: collection.id === 'full-body-2x' ? 10 : 5,
      days: days.map((day) => ({
        _type: 'programDay',
        _key: day.id,
        title: day.title,
        intro: day.intro,
        guidance: day.guidance,
        accessories: day.accessories,
        slots: (day.slots || []).map((slot, index) => {
          if (slot.choice?.length) {
            return {
              _type: 'workoutSlot',
              _key: `${day.id}-slot-${index}`,
              slotType: 'choice',
              choiceLabel: slot.choiceLabel,
              choices: slot.choice.map(patternRef),
            };
          }

          return {
            _type: 'workoutSlot',
            _key: `${day.id}-slot-${index}`,
            slotType: 'pattern',
            pattern: slot.patternId ? patternRef(slot.patternId) : undefined,
          };
        }),
      })),
    });

    console.log(`  ✓ ${collection.title}`);
  }
}

async function main() {
  await seedMovementPatterns();
  await seedPrograms();
  console.log('Seed complete.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
