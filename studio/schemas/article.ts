import { defineField, defineType } from 'sanity';
import {
  DIFFICULTY_OPTIONS,
  EVIDENCE_LEVEL_OPTIONS,
  FEATURED_SLOT_OPTIONS,
  TOPIC_OPTIONS,
} from './constants';

export default defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'metadata', title: 'Library Metadata' },
    { name: 'relations', title: 'Related & Sources' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      group: 'content',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'content',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Published', value: 'published' },
          { title: 'Coming soon', value: 'comingSoon' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      group: 'content',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover image',
      type: 'image',
      group: 'content',
      options: { hotspot: true },
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      group: 'content',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'topics',
      title: 'Topics',
      type: 'array',
      group: 'metadata',
      of: [{ type: 'string' }],
      options: { list: TOPIC_OPTIONS },
    }),
    defineField({
      name: 'difficulty',
      title: 'Difficulty',
      type: 'string',
      group: 'metadata',
      options: { list: DIFFICULTY_OPTIONS, layout: 'radio' },
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      group: 'metadata',
      initialValue: false,
    }),
    defineField({
      name: 'featuredSlot',
      title: 'Featured slot',
      type: 'string',
      group: 'metadata',
      options: { list: FEATURED_SLOT_OPTIONS },
      description: 'Optional override for the Featured Resources row on the library page.',
    }),
    defineField({
      name: 'popularityScore',
      title: 'Popularity score',
      type: 'number',
      group: 'metadata',
      description: 'Manual ranking until analytics are available. Higher = more popular.',
      initialValue: 0,
    }),
    defineField({
      name: 'evidenceLevel',
      title: 'Evidence level',
      type: 'string',
      group: 'metadata',
      options: { list: EVIDENCE_LEVEL_OPTIONS },
    }),
    defineField({
      name: 'keyTakeaways',
      title: 'Key takeaways',
      type: 'array',
      group: 'metadata',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'sources',
      title: 'Research sources',
      type: 'array',
      group: 'relations',
      of: [{ type: 'source' }],
    }),
    defineField({
      name: 'relatedResources',
      title: 'Related resources',
      type: 'array',
      group: 'relations',
      of: [{ type: 'reference', to: [{ type: 'article' }, { type: 'program' }] }],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      status: 'status',
      media: 'coverImage',
    },
    prepare({ title, status }) {
      return {
        title,
        subtitle: status,
      };
    },
  },
});
