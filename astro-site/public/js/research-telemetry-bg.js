/* Research telemetry canvas background.
 *
 * Draws slowly sweeping arcs behind the "Why bother?" research cards.
 * Performance notes:
 * - No canvas shadowBlur: it blurs every stroke separately and was the main
 *   cause of lag. Glow is drawn on a small canvas and scaled up instead.
 * - Redraws at ~30fps and caps the pixel ratio; the motion is slow and soft,
 *   so neither is visible.
 * - Pauses when the section is off screen or the tab is hidden.
 */
'use strict';
(() => {
  const BLUE = { r: 59, g: 130, b: 246 };
  const ACCENT = { r: 147, g: 197, b: 253 };
  const WHITE = { r: 245, g: 248, b: 255 };

  const MAX_PIXEL_RATIO = 1.5;
  const FRAME_INTERVAL = 1000 / 30;
  const GLOW_SCALE = 0.25;
  const GLOW_STRENGTH = 0.35;
  const HIGHLIGHT_SEGMENTS = [
    { start: 0.08, end: 0.38 },
    { start: 0.58, end: 0.88 },
  ];

  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const rgba = (c, a) => `rgba(${c.r}, ${c.g}, ${c.b}, ${a})`;
  const mix = (from, to, t) => ({
    r: lerp(from.r, to.r, t),
    g: lerp(from.g, to.g, t),
    b: lerp(from.b, to.b, t),
  });

  function wave(time, seed, rate) {
    const phase = seed * 1.618;
    return (
      Math.sin(time * rate * 9e-5 + phase) * 0.42 +
      Math.sin(time * rate * 61e-6 + phase * 2.1) * 0.28 +
      Math.sin(time * rate * 37e-6 + phase * 0.7) * 0.18 +
      Math.sin(time * rate * 23e-6 + phase * 3.3) * 0.12
    );
  }

  function breathe(time) {
    return 0.88 + Math.sin(time * 15e-5) * 0.07 + Math.sin(time * 7e-5 + 1.2) * 0.05;
  }

  function pulse(time, seed) {
    const slow = Math.sin(time * 11e-5 + seed * 1.7) * 0.5 + 0.5;
    const flare = Math.max(0, Math.sin(time * 32e-6 + seed * 4.2)) ** 2;
    return 0.5 + slow * 0.28 + flare * 0.42;
  }

  function normalizeSide(side) {
    return side === 'left' ? 'left' : 'right';
  }

  function originAt(time, width, height, side) {
    const drift = wave(time, 1.1, 0.15) * width * 0.012;
    const y = height * 0.5 + wave(time, 2.8, 0.12) * height * 0.035;
    return side === 'right'
      ? { x: width * -0.04 + drift, y }
      : { x: width * 1.04 - drift, y };
  }

  // Splits a line into 2–3 arc segments with small gaps. Fixed per line,
  // so it is worked out once instead of every frame.
  function segmentsFor(line, layerId) {
    const count = layerId === 'mid' ? 3 : 2;
    const span = 1 / count;
    const gap = span * 0.28;
    const segments = [];
    for (let i = 0; i < count; i++) {
      const jitter = (Math.sin(line.seed + i * 2.17) * 0.5 + 0.5) * span * 0.12;
      const start = clamp(i * span + gap * 0.5 + jitter, 0, 1);
      const end = clamp((i + 1) * span - gap * 0.5 + jitter, 0, 1);
      if (end - start > 0.06) segments.push({ start, end });
    }
    return segments;
  }

  function makeLayer(config) {
    const lines = [];
    for (let i = 0; i < config.lineCount; i++) {
      const line = {
        seed: config.seedBase + i * 17.31,
        radiusNorm: (i + 1) / (config.lineCount + 1),
        angleBias: (i - (config.lineCount - 1) / 2) / (config.lineCount + 1),
        phase: i * 2.399,
        opacity: config.opacity * (0.72 + (i % 4) * 0.12),
        accent: i % config.accentEvery === 0,
        speed: config.speed * (0.8 + (i % 7) * 0.06),
      };
      line.segments = segmentsFor(line, config.id);
      lines.push(line);
    }
    return {
      id: config.id,
      lines,
      parallax: config.parallax,
      glow: config.glow,
      strokeWidth: config.strokeWidth,
    };
  }

  function createLayers() {
    return [
      makeLayer({ id: 'deep', lineCount: 10, seedBase: 1.3, opacity: 0.3, accentEvery: 99, speed: 0.55, parallax: 0.35, glow: 0, strokeWidth: 1 }),
      makeLayer({ id: 'mid', lineCount: 14, seedBase: 4.7, opacity: 0.48, accentEvery: 4, speed: 0.75, parallax: 0.65, glow: 6, strokeWidth: 1.15 }),
      makeLayer({ id: 'front', lineCount: 9, seedBase: 9.2, opacity: 0.64, accentEvery: 3, speed: 1, parallax: 1, glow: 10, strokeWidth: 1.35 }),
    ];
  }

  function arcAngles(start, end, toAngle, side) {
    let a = toAngle(start);
    let b = toAngle(end);
    if (side === 'left') {
      a = Math.PI - a;
      b = Math.PI - b;
    }
    return a > b ? [b, a] : [a, b];
  }

  // Each line is queued as { path, width, color, glowSize, glowAlpha } and
  // drawn in two passes by drawFrame.
  function arcPath(origin, radius, segments, toAngle, side) {
    const path = new Path2D();
    for (const segment of segments) {
      const [a, b] = arcAngles(segment.start, segment.end, toAngle, side);
      path.moveTo(origin.x + radius * Math.cos(a), origin.y + radius * Math.sin(a));
      path.arc(origin.x, origin.y, radius, a, b);
    }
    return path;
  }

  function queueLine(strokes, line, layer, time, width, height, breath, side, origin) {
    const glint = pulse(time, line.seed);
    const alpha = clamp(line.opacity * breath * (0.88 + glint * 0.18), 0, 0.82);
    const base = line.accent ? ACCENT : WHITE;
    const tint = line.accent ? 0.65 + glint * 0.2 : 0.18 + glint * 0.12;

    let glowSize = 0;
    let glowAlpha = 0;
    if (layer.glow > 0) {
      const size = line.accent ? layer.glow : layer.glow * 0.45;
      glowSize = size * (0.55 + glint * 0.85);
      glowAlpha = alpha * (0.35 + glint * 0.45);
    } else if (glint > 0.78) {
      glowSize = 5 * glint;
      glowAlpha = alpha * 0.35;
    }

    const radius = Math.max(width, height) * lerp(0.2, 1.05, line.radiusNorm) * (0.58 + layer.parallax * 0.42);
    const sweep = Math.PI * 0.72;
    const timeSweep = time * line.speed * 96e-6 + line.phase;
    const spread = Math.PI * 0.52;
    const toAngle = (frac) => -sweep * 0.5 + frac * sweep + timeSweep + line.angleBias * spread;

    strokes.push({
      path: arcPath(origin, radius, line.segments, toAngle, side),
      width: layer.strokeWidth,
      color: rgba(mix(base, BLUE, tint), alpha),
      glowSize,
      glowAlpha,
    });
  }

  // Six brighter arcs drawn on top of the layers.
  function queueHighlights(strokes, time, width, height, breath, side, origin) {
    const size = Math.max(width, height);
    for (let i = 0; i < 6; i++) {
      const seed = i * 5.17 + 2.4;
      const radius = size * lerp(0.28, 0.92, (i + 1) / 7);
      const bias = (i - 5 / 2) / 7;
      const sweep = Math.PI * 0.38;
      const timeSweep = time * 7e-5 * (i + 1);
      const spread = sweep * 0.55;
      const accent = i === 1 || i === 3;
      const glint = pulse(time, seed);
      const toAngle = (frac) => -sweep * 0.5 + bias * Math.PI * 0.22 + timeSweep + frac * spread;

      strokes.push({
        path: arcPath(origin, radius, HIGHLIGHT_SEGMENTS, toAngle, side),
        width: accent ? 1.2 : 0.95,
        color: accent
          ? rgba(ACCENT, (0.42 + glint * 0.18) * breath)
          : `rgba(235, 240, 255, ${(0.28 + glint * 0.12) * breath})`,
        glowSize: (accent ? 10 : 4) * (0.6 + glint * 0.7),
        glowAlpha: 0.22 + glint * 0.28,
      });
    }
  }

  function drawAmbientGlow(ctx, time, width, height, breath, origin) {
    const glint = pulse(time, 0.9);
    const gradient = ctx.createRadialGradient(origin.x, origin.y, 0, origin.x, origin.y, Math.max(width, height) * 0.95);
    gradient.addColorStop(0, rgba(ACCENT, (0.1 + glint * 0.05) * breath));
    gradient.addColorStop(0.35, rgba(BLUE, (0.045 + glint * 0.025) * breath));
    gradient.addColorStop(0.7, rgba(BLUE, (0.015 + glint * 0.01) * breath));
    gradient.addColorStop(1, 'rgba(5, 5, 5, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  // Glow and ambient light go on a small canvas (GLOW_SCALE of the size) that
  // is stretched over the main one; the upscale softens it like a blur, at a
  // fraction of shadowBlur's cost. Only the thin core lines are full size.
  function drawFrame(ctx, glowCtx, time, width, height, layers, side) {
    if (width === 0 || height === 0) return;
    const breath = breathe(time);
    const origin = originAt(time, width, height, side);
    const strokes = [];
    for (const layer of layers) {
      for (const line of layer.lines) {
        queueLine(strokes, line, layer, time, width, height, breath, side, origin);
      }
    }
    queueHighlights(strokes, time, width, height, breath, side, origin);

    glowCtx.clearRect(0, 0, width, height);
    drawAmbientGlow(glowCtx, time, width, height, breath, origin);
    glowCtx.lineCap = 'round';
    for (const stroke of strokes) {
      if (stroke.glowSize <= 0 || stroke.glowAlpha <= 0) continue;
      glowCtx.strokeStyle = rgba(ACCENT, stroke.glowAlpha * GLOW_STRENGTH);
      glowCtx.lineWidth = stroke.width + stroke.glowSize;
      glowCtx.stroke(stroke.path);
    }

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(glowCtx.canvas, 0, 0, width, height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const stroke of strokes) {
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.stroke(stroke.path);
    }
  }

  function initBackground(root) {
    const canvas = root.querySelector('canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    const glowCtx = document.createElement('canvas').getContext('2d', { alpha: true });
    if (!ctx || !glowCtx) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = motionQuery.matches;
    const layers = createLayers();
    const side = normalizeSide(root.dataset.telemetrySide);

    let width = 0;
    let height = 0;
    let frameId = 0;
    let lastDraw = 0;
    let staticTime = 0;
    let inView = true;

    const tick = (now) => {
      frameId = 0;
      if (!inView) return;
      if (now - lastDraw >= FRAME_INTERVAL - 2) {
        lastDraw = now;
        drawFrame(ctx, glowCtx, now, width, height, layers, side);
      }
      frameId = requestAnimationFrame(tick);
    };

    const start = () => {
      cancelAnimationFrame(frameId);
      frameId = 0;
      if (reducedMotion) {
        if (!staticTime) staticTime = performance.now();
        drawFrame(ctx, glowCtx, staticTime, width, height, layers, side);
        return;
      }
      if (document.visibilityState === 'visible' && inView) {
        lastDraw = 0;
        frameId = requestAnimationFrame(tick);
      }
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
      width = root.clientWidth;
      height = root.clientHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      glowCtx.canvas.width = Math.max(1, Math.ceil(width * GLOW_SCALE));
      glowCtx.canvas.height = Math.max(1, Math.ceil(height * GLOW_SCALE));
      glowCtx.setTransform(GLOW_SCALE, 0, 0, GLOW_SCALE, 0, 0);
      if (width > 0 && height > 0 && inView) start();
    };

    resize();
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(resize).observe(root);
    } else {
      window.addEventListener('resize', resize, { passive: true });
    }

    if (typeof IntersectionObserver !== 'undefined') {
      new IntersectionObserver(
        (entries) => {
          inView = entries[0]?.isIntersecting ?? true;
          if (inView) start();
          else cancelAnimationFrame(frameId);
        },
        { rootMargin: '160px' },
      ).observe(root);
    }

    start();
    document.addEventListener('visibilitychange', start);
    motionQuery.addEventListener('change', (event) => {
      reducedMotion = event.matches;
      staticTime = performance.now();
      start();
    });
  }

  function init() {
    document.querySelectorAll('[data-research-telemetry-bg]').forEach(initBackground);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
