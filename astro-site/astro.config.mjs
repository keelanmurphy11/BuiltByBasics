// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  // Default static output; opt routes into SSR with `export const prerender = false`
  adapter: netlify(),
  integrations: [react()],
});
