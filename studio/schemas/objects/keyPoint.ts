import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'keyPoint',
  title: 'Key point',
  type: 'object',
  fields: [
    defineField({
      name: 'text',
      title: 'Key point',
      type: 'text',
      rows: 3,
      description: 'A short highlight shown as a callout in the article body.',
      validation: (rule) => rule.required().max(320),
    }),
  ],
  preview: {
    select: { title: 'text' },
    prepare({ title }) {
      return {
        title: title || 'Key point',
        subtitle: 'Key point highlight',
      };
    },
  },
});
