import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'source',
  title: 'Research Source',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'citation',
      title: 'Citation',
      type: 'string',
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'url' },
  },
});
