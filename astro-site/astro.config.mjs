// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  // Default static output; opt routes into SSR with `export const prerender = false`
  // Production is on Vercel (builtbybasics.com) — Netlify adapter broke article SSR routes.
  adapter: vercel(),
  integrations: [react()],
});
