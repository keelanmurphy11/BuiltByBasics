import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'workoutSlot',
  title: 'Workout Slot',
  type: 'object',
  fields: [
    defineField({
      name: 'slotType',
      title: 'Slot type',
      type: 'string',
      options: {
        list: [
          { title: 'Single pattern', value: 'pattern' },
          { title: 'Choose one', value: 'choice' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'pattern',
      title: 'Movement pattern',
      type: 'reference',
      to: [{ type: 'movementPattern' }],
      hidden: ({ parent }) => parent?.slotType !== 'pattern',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { slotType?: string };
          if (parent?.slotType === 'pattern' && !value) {
            return 'A movement pattern is required for single-pattern slots';
          }
          return true;
        }),
    }),
    defineField({
      name: 'choiceLabel',
      title: 'Choice label',
      type: 'string',
      description: 'Optional heading for choice slots (defaults to "Choose one")',
      hidden: ({ parent }) => parent?.slotType !== 'choice',
    }),
    defineField({
      name: 'choices',
      title: 'Choice patterns',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'movementPattern' }] }],
      hidden: ({ parent }) => parent?.slotType !== 'choice',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { slotType?: string };
          if (parent?.slotType === 'choice' && (!value || value.length < 2)) {
            return 'At least two patterns are required for choice slots';
          }
          return true;
        }),
    }),
  ],
  preview: {
    select: {
      slotType: 'slotType',
      patternTitle: 'pattern.title',
      choiceCount: 'choices',
    },
    prepare({ slotType, patternTitle, choiceCount }) {
      if (slotType === 'choice') {
        const count = Array.isArray(choiceCount) ? choiceCount.length : 0;
        return {
          title: 'Choose one',
          subtitle: `${count} pattern option${count === 1 ? '' : 's'}`,
        };
      }
      return {
        title: patternTitle || 'Movement pattern slot',
      };
    },
  },
});
