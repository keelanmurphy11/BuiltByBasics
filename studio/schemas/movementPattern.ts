import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'movementPattern',
  title: 'Movement Pattern',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Label',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'examples',
      title: 'Example exercises',
      type: 'array',
      of: [{ type: 'string' }],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      examples: 'examples',
    },
    prepare({ title, examples }) {
      const count = Array.isArray(examples) ? examples.length : 0;
      return {
        title,
        subtitle: `${count} example${count === 1 ? '' : 's'}`,
      };
    },
  },
});
