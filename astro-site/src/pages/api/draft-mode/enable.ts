import type { APIRoute } from 'astro';
import { validatePreviewUrl } from '@sanity/preview-url-secret';
import { perspectiveCookieName } from '@sanity/preview-url-secret/constants';
import { getSanityClient } from '../../../lib/sanity';

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const token = import.meta.env.SANITY_API_READ_TOKEN;

  if (!token) {
    return new Response('Server misconfigured: missing SANITY_API_READ_TOKEN', {
      status: 500,
    });
  }

  const client = getSanityClient();
  if (!client) {
    return new Response('Server misconfigured: Sanity project not configured', {
      status: 500,
    });
  }

  const clientWithToken = client.withConfig({ token, useCdn: false });
  const { isValid, redirectTo = '/', studioPreviewPerspective } =
    await validatePreviewUrl(clientWithToken, request.url);

  if (!isValid) {
    return new Response('Invalid secret', { status: 401 });
  }

  cookies.set(perspectiveCookieName, studioPreviewPerspective ?? 'drafts', {
    httpOnly: false,
    sameSite: 'none',
    secure: true,
    path: '/',
  });

  return redirect(redirectTo, 307);
};
