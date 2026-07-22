import { createClient, type ClientPerspective, type QueryParams, type SanityClient } from '@sanity/client';

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

export function getSanityClient(options?: { stega?: boolean }): SanityClient | null {
  const config = getSanityConfig();
  if (!config.isConfigured) {
    return null;
  }

  return createClient({
    projectId: config.projectId,
    dataset: config.dataset,
    apiVersion: '2024-01-01',
    useCdn: import.meta.env.PROD && !options?.stega,
    token: config.token,
    stega: options?.stega
      ? {
          enabled: true,
          studioUrl: import.meta.env.PUBLIC_SANITY_STUDIO_URL || 'http://localhost:3333',
        }
      : undefined,
  });
}

function parsePerspective(raw: string | undefined): ClientPerspective | undefined {
  if (!raw) return undefined;
  const decoded = decodeURIComponent(raw);
  if (decoded.startsWith('[')) {
    try {
      return JSON.parse(decoded) as ClientPerspective;
    } catch {
      return undefined;
    }
  }
  return decoded as ClientPerspective;
}

/**
 * Fetch Sanity content. When `perspectiveCookie` is set (draft mode),
 * uses drafts perspective + stega encoding for Presentation overlays.
 */
export async function loadQuery<T>({
  query,
  params = {},
  perspectiveCookie,
}: {
  query: string;
  params?: QueryParams;
  perspectiveCookie?: string;
}): Promise<T | null> {
  const draftMode = Boolean(perspectiveCookie);
  const token = import.meta.env.SANITY_API_READ_TOKEN;

  if (draftMode && !token) {
    throw new Error(
      'SANITY_API_READ_TOKEN is required for Visual Editing / draft preview.'
    );
  }

  const client = getSanityClient({ stega: draftMode });
  if (!client) {
    return null;
  }

  const perspective: ClientPerspective = draftMode
    ? (parsePerspective(perspectiveCookie) ?? 'drafts')
    : 'published';

  try {
    return await client.fetch<T>(query, params, {
      perspective,
      stega: draftMode,
      ...(draftMode ? { token, useCdn: false } : {}),
    });
  } catch (error) {
    console.error('[sanity] loadQuery failed:', error);
    return null;
  }
}

/** Published-only fetch (build-time / non-preview pages). */
export async function fetchSanity<T>(
  query: string,
  params: Record<string, unknown> = {}
): Promise<T | null> {
  return loadQuery<T>({ query, params });
}
