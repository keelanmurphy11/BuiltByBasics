import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'programDay',
  title: 'Program Day',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Day title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'guidance',
      title: 'Guidance',
      type: 'string',
      description: 'Sets, reps, rest, and intensity notes shown above the slot list.',
    }),
    defineField({
      name: 'slots',
      title: 'Slots',
      type: 'array',
      of: [{ type: 'workoutSlot' }],
    }),
    defineField({
      name: 'accessories',
      title: 'Accessories',
      type: 'array',
      of: [{ type: 'string' }],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      slotCount: 'slots',
    },
    prepare({ title, slotCount }) {
      const count = Array.isArray(slotCount) ? slotCount.length : 0;
      return {
        title: title || 'Program day',
        subtitle: `${count} slot${count === 1 ? '' : 's'}`,
      };
    },
  },
});
