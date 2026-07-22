/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SANITY_PROJECT_ID: string;
  readonly PUBLIC_SANITY_DATASET: string;
  readonly PUBLIC_SANITY_STUDIO_URL?: string;
  readonly SANITY_API_READ_TOKEN: string;
  readonly PUBLIC_BEEHIIV_EMBED_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
