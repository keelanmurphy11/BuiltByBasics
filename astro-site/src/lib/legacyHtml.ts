import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Legacy HTML sources live in astro-site/legacy/ (cwd is astro-site during dev/build).
const legacyDir = join(process.cwd(), 'legacy');

const BASE_STYLES = new Set(['css/logo.css', 'css/theme.css', 'css/reveal.css']);

const LINK_REWRITES: Record<string, string> = {
  'index.html': '/',
  'basics.html': '/basics',
  'library.html': '/library',
  'coaching.html': '/coaching',
  'programs.html': '/programs',
  'thank-you.html': '/thank-you',
  'program-2x-full-body.html': '/programs/full-body-2x',
  'program-4x-upper-lower.html': '/programs/upper-lower-4x',
};

function stripQuery(path: string) {
  return path.split('?')[0];
}

function rewriteAssetPath(path: string) {
  const cleaned = path.replace(/^\//, '');
  if (
    cleaned.startsWith('css/') ||
    cleaned.startsWith('js/') ||
    cleaned.startsWith('content/') ||
    cleaned.startsWith('assets/') ||
    cleaned === 'favicon.svg'
  ) {
    return `/${cleaned}`;
  }
  return path;
}

function rewriteHtml(html: string) {
  let output = html;

  for (const [from, to] of Object.entries(LINK_REWRITES)) {
    output = output.replaceAll(`href="${from}"`, `href="${to}"`);
  }

  output = output.replace(/href="css\//g, 'href="/css/');
  output = output.replace(/href="js\//g, 'href="/js/');
  output = output.replace(/href="content\//g, 'href="/content/');
  output = output.replace(/href="assets\//g, 'href="/assets/');
  output = output.replace(/src="css\//g, 'src="/css/');
  output = output.replace(/src="js\//g, 'src="/js/');
  output = output.replace(/src="content\//g, 'src="/content/');
  output = output.replace(/src="assets\//g, 'src="/assets/');
  output = output.replace(/srcset="content\//g, 'srcset="/content/');
  output = output.replace(/url\(content\//g, 'url(/content/');

  return output;
}

export interface LegacyPageContent {
  title: string;
  description: string;
  theme: string;
  bodyClass: string;
  extraCss: string[];
  inlineStyles: string[];
  bodyHtml: string;
}

export function loadLegacyHtml(filename: string): LegacyPageContent {
  const html = readFileSync(join(legacyDir, filename), 'utf8');

  const title = html.match(/<title>([^<]*)<\/title>/)?.[1]?.trim() ?? 'builtbybasics';
  const description =
    html.match(/<meta\s+name="description"\s+content="([^"]*)"/)?.[1]?.trim() ?? '';
  const theme = html.match(/<html[^>]*data-theme="([^"]*)"/)?.[1] ?? 'light';
  const bodyClass =
    html.match(/<body[^>]*class="([^"]*)"/)?.[1]?.replace(/\s*font-body\s*/, ' ').trim() ??
    '';

  const extraCss = [
    ...html.matchAll(/<link\s+rel="stylesheet"\s+href="([^"]+)"/g),
  ]
    .map((match) => match[1])
    .filter((href) => !BASE_STYLES.has(stripQuery(href)))
    .map((href) => rewriteAssetPath(href));

  const inlineStyles = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(
    (match) => match[1].trim()
  );

  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const bodyHtml = rewriteHtml(bodyMatch?.[1]?.trim() ?? '');

  return {
    title,
    description,
    theme,
    bodyClass,
    extraCss,
    inlineStyles,
    bodyHtml,
  };
}
