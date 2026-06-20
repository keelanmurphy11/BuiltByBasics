/**
 * Static-site bootstrap for the research telemetry canvas background.
 * Bundled to js/research-telemetry-bg.js via esbuild.
 */
import { buildTelemetryLayers, renderTelemetryFrame } from '../utils/telemetryEngine';

const DPR_CAP = 2;

function init(): void {
  const container = document.querySelector<HTMLElement>('[data-research-telemetry-bg]');
  const canvas = container?.querySelector('canvas');
  if (!container || !canvas) return;

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reducedMotion = motionQuery.matches;
  const layers = buildTelemetryLayers();
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let rafId = 0;
  let isInView = true;
  let frozenTime = 0;

  const resize = (): void => {
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    width = container.clientWidth;
    height = container.clientHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Layout can settle after first paint - restart once we have real dimensions.
    if (width > 0 && height > 0 && isInView) {
      start();
    }
  };

  const render = (time: number): void => {
    if (!isInView && !reducedMotion) return;

    if (reducedMotion && frozenTime === 0) frozenTime = time;
    const t = reducedMotion ? frozenTime : time;

    if (width > 0 && height > 0) {
      renderTelemetryFrame(ctx, t, width, height, layers);
    }

    if (!reducedMotion && isInView) {
      rafId = requestAnimationFrame(render);
    }
  };

  const start = (): void => {
    cancelAnimationFrame(rafId);
    if (reducedMotion) {
      frozenTime = performance.now();
      render(frozenTime);
      return;
    }
    if (document.visibilityState === 'visible' && isInView) {
      rafId = requestAnimationFrame(render);
    }
  };

  resize();

  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
  if (ro) ro.observe(container);
  else window.addEventListener('resize', resize, { passive: true });

  const io = typeof IntersectionObserver !== 'undefined'
    ? new IntersectionObserver((entries) => {
        isInView = entries[0]?.isIntersecting ?? true;
        if (isInView) start();
        else cancelAnimationFrame(rafId);
      }, { rootMargin: '160px' })
    : null;

  if (io) io.observe(container);
  start();

  document.addEventListener('visibilitychange', start);

  motionQuery.addEventListener('change', (event) => {
    reducedMotion = event.matches;
    frozenTime = performance.now();
    start();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
