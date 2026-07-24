import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'bodyImage',
  title: 'Image',
  type: 'image',
  options: { hotspot: true },
  fields: [
    defineField({
      name: 'alt',
      type: 'string',
      title: 'Alt text',
      description: 'Describe the image for accessibility and SEO.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'caption',
      type: 'string',
      title: 'Caption',
    }),
  ],
  preview: {
    select: {
      alt: 'alt',
      caption: 'caption',
      media: 'asset',
    },
    prepare({ alt, caption, media }) {
      return {
        title: alt || caption || 'Image',
        subtitle: 'Body image',
        media,
      };
    },
  },
});
