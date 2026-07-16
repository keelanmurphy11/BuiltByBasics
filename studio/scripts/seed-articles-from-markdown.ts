/**
 * Seeds articles from studio/data/articles/*.md into Sanity.
 *
 * Usage: npm run seed:articles
 */

import { createClient } from '@sanity/client';
import { config } from 'dotenv';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

config({ path: join(__dirname, '..', '.env') });

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET || 'production';
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  console.error('Set SANITY_STUDIO_PROJECT_ID and SANITY_API_WRITE_TOKEN in studio/.env');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
});

const ARTICLE_FILES: Record<string, { slug: string; summary?: string }> = {
  'strength-training.md': {
    slug: 'strength-training',
    summary:
      'Why muscle mass matters, who should strength train, and the five core principles of effective training.',
  },
  'cardiofitness.md': {
    slug: 'cardio-fitness',
    summary:
      'VO2 max, cardiorespiratory fitness, and practical ways to improve cardiovascular health.',
  },
  'fatloss.md': {
    slug: 'fat-loss',
    summary:
      'Calorie deficits, sustainable fat loss habits, and the difference between weight loss and fat loss.',
  },
};

let blockKey = 0;

function nextKey(prefix: string) {
  blockKey += 1;
  return `${prefix}-${blockKey}`;
}

function parseInline(text: string) {
  const children: Array<{
    _type: 'span';
    _key: string;
    text: string;
    marks: string[];
  }> = [];

  const pattern = /(\*\*[^*]+\*\*)/g;
  const parts = text.split(pattern).filter(Boolean);

  for (const part of parts) {
    if (part.startsWith('**') && part.endsWith('**')) {
      children.push({
        _type: 'span',
        _key: nextKey('span'),
        text: part.slice(2, -2),
        marks: ['strong'],
      });
    } else {
      children.push({
        _type: 'span',
        _key: nextKey('span'),
        text: part,
        marks: [],
      });
    }
  }

  return children.length
    ? children
    : [{ _type: 'span', _key: nextKey('span'), text: '', marks: [] }];
}

function makeBlock(
  style: string,
  text: string,
  options: { listItem?: 'bullet' } = {}
) {
  return {
    _type: 'block',
    _key: nextKey('block'),
    style,
    children: parseInline(text),
    markDefs: [],
    ...options,
  };
}

function markdownToBlocks(markdown: string) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReturnType<typeof makeBlock>[] = [];
  let paragraph: string[] = [];
  let quoteLines: string[] = [];

  function flushParagraph() {
    if (!paragraph.length) return;
    blocks.push(makeBlock('normal', paragraph.join(' ').trim()));
    paragraph = [];
  }

  function flushQuote() {
    if (!quoteLines.length) return;
    blocks.push(makeBlock('blockquote', quoteLines.join(' ').trim()));
    quoteLines = [];
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushQuote();
      continue;
    }

    if (line.startsWith('> ')) {
      flushParagraph();
      quoteLines.push(line.slice(2).trim());
      continue;
    }

    flushQuote();

    if (line.startsWith('### ')) {
      flushParagraph();
      blocks.push(makeBlock('h3', line.slice(4).trim()));
      continue;
    }

    if (line.startsWith('## ')) {
      flushParagraph();
      blocks.push(makeBlock('h2', line.slice(3).trim()));
      continue;
    }

    if (line.startsWith('# ')) {
      flushParagraph();
      blocks.push(makeBlock('h1', line.slice(2).trim()));
      continue;
    }

    if (line.startsWith('- ')) {
      flushParagraph();
      blocks.push(makeBlock('normal', line.slice(2).trim(), { listItem: 'bullet' }));
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  flushQuote();
  return blocks;
}

async function seedArticles() {
  const contentDir = join(__dirname, '..', 'data', 'articles');
  const files = readdirSync(contentDir).filter((file) => file.endsWith('.md'));

  console.log('Seeding articles...');

  for (const file of files) {
    const meta = ARTICLE_FILES[file];
    if (!meta) {
      console.log(`  - Skipping ${file}`);
      continue;
    }

    const markdown = readFileSync(join(contentDir, file), 'utf8');
    const blocks = markdownToBlocks(markdown);
    const title =
      blocks.find((block) => block.style === 'h1')?.children?.[0]?.text ||
      file.replace('.md', '');

    await client.createOrReplace({
      _id: `article-${meta.slug}`,
      _type: 'article',
      title,
      slug: { _type: 'slug', current: meta.slug },
      summary: meta.summary,
      status: 'published',
      publishedAt: new Date().toISOString(),
      body: blocks,
    });

    console.log(`  ✓ ${title}`);
  }

  console.log('Article seed complete.');
}

seedArticles().catch((error) => {
  console.error(error);
  process.exit(1);
});
