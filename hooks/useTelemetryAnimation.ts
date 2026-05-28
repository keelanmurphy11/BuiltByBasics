import { useEffect, useRef, type RefObject } from 'react';
import { buildTelemetryLayers, renderTelemetryFrame } from '../utils/telemetryEngine';
import { useReducedMotion } from './useReducedMotion';

const DPR_CAP = 2;

interface UseTelemetryAnimationOptions {
  /** Pause rendering when the section is off-screen or the tab is hidden. */
  pauseWhenHidden?: boolean;
}

/**
 * Drives the canvas telemetry animation loop.
 * Handles resize, DPR scaling, visibility, and reduced-motion.
 */
export function useTelemetryAnimation(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  containerRef: RefObject<HTMLElement | null>,
  options: UseTelemetryAnimationOptions = {},
) {
  const { pauseWhenHidden = true } = options;
  const reducedMotion = useReducedMotion();
  const layersRef = useRef(buildTelemetryLayers());
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let rafId = 0;
    let frozenTime = 0;
    let isInView = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      const width = container.clientWidth;
      const height = container.clientHeight;

      sizeRef.current = { width, height, dpr };
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const render = (time: number) => {
      if (reducedMotion && frozenTime === 0) frozenTime = time;
      const t = reducedMotion ? frozenTime : time;

      const { width, height } = sizeRef.current;
      renderTelemetryFrame(ctx, t, width, height, layersRef.current);

      if (!reducedMotion) {
        rafId = requestAnimationFrame(render);
      }
    };

    resize();

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    if (ro) ro.observe(container);
    else window.addEventListener('resize', resize, { passive: true });

    const startLoop = () => {
      cancelAnimationFrame(rafId);
      if (reducedMotion) {
        frozenTime = performance.now();
        render(frozenTime);
      } else if (!pauseWhenHidden || (document.visibilityState === 'visible' && isInView)) {
        rafId = requestAnimationFrame(render);
      }
    };

    const onVisibility = () => {
      if (!pauseWhenHidden) return;
      if (document.visibilityState === 'visible') startLoop();
      else cancelAnimationFrame(rafId);
    };

    const io = pauseWhenHidden && typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver((entries) => {
          isInView = entries[0]?.isIntersecting ?? true;
          if (isInView) startLoop();
          else cancelAnimationFrame(rafId);
        }, { rootMargin: '160px' })
      : null;

    if (io) io.observe(container);

    startLoop();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(rafId);
      ro?.disconnect();
      io?.disconnect();
      if (!ro) window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [canvasRef, containerRef, reducedMotion, pauseWhenHidden]);
}
