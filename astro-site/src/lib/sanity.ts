import { createClient, type SanityClient } from '@sanity/client';

export interface SanityConfig {
  projectId: string;
  dataset: string;
  token?: string;
  isConfigured: boolean;
}

export function getSanityConfig(): SanityConfig {
  const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID || '';
  const dataset = import.meta.env.PUBLIC_SANITY_DATASET || 'production';
  const token = import.meta.env.SANITY_API_READ_TOKEN;

  const isConfigured = Boolean(
    projectId && projectId !== 'your-project-id' && projectId.trim().length > 0
  );

  return { projectId, dataset, token, isConfigured };
}

export function getSanityClient(): SanityClient | null {
  const config = getSanityConfig();
  if (!config.isConfigured) {
    return null;
  }

  return createClient({
    projectId: config.projectId,
    dataset: config.dataset,
    apiVersion: '2024-01-01',
    useCdn: import.meta.env.PROD,
    token: config.token,
  });
}

export async function fetchSanity<T>(
  query: string,
  params: Record<string, unknown> = {}
): Promise<T | null> {
  const client = getSanityClient();
  if (!client) {
    return null;
  }

  try {
    return await client.fetch<T>(query, params);
  } catch (error) {
    console.error('[sanity] fetch failed:', error);
    return null;
  }
}
