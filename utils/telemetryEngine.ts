/** Shared telemetry curve engine - used by canvas renderer and React hook */

export const COBALT = { r: 59, g: 130, b: 246 } as const;
export const COBALT_GLOW = { r: 147, g: 197, b: 253 } as const;
const LINE_COLOR = { r: 245, g: 248, b: 255 } as const;

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Layered sine drift with incommensurate periods - avoids obvious loops */
export function drift(time: number, seed: number, scale: number): number {
  const s = seed * 1.618;
  return (
    Math.sin(time * scale * 0.00009 + s) * 0.42 +
    Math.sin(time * scale * 0.000061 + s * 2.1) * 0.28 +
    Math.sin(time * scale * 0.000037 + s * 0.7) * 0.18 +
    Math.sin(time * scale * 0.000023 + s * 3.3) * 0.12
  );
}

export function pulseIntensity(time: number): number {
  return 0.88 + Math.sin(time * 0.00015) * 0.07 + Math.sin(time * 0.00007 + 1.2) * 0.05;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export interface TelemetryLine {
  seed: number;
  /** Normalized radius from the left-side origin (0 = inner, 1 = outer ripple) */
  radiusNorm: number;
  /** Even vertical spread across the visible fan */
  angleBias: number;
  phase: number;
  opacity: number;
  accent: boolean;
  speed: number;
}

export interface TelemetryLayer {
  id: string;
  lines: TelemetryLine[];
  parallax: number;
  blur: number;
  strokeWidth: number;
}

/** Left-edge origin - arcs sweep outward toward the right */
function getFlowOrigin(
  time: number,
  width: number,
  height: number,
): { x: number; y: number } {
  return {
    x: width * -0.04 + drift(time, 1.1, 0.15) * width * 0.012,
    y: height * 0.5 + drift(time, 2.8, 0.12) * height * 0.035,
  };
}

function lineGlowPulse(time: number, seed: number): number {
  const slow = Math.sin(time * 0.00011 + seed * 1.7) * 0.5 + 0.5;
  const occasional = Math.max(0, Math.sin(time * 0.000032 + seed * 4.2)) ** 2;
  return 0.5 + slow * 0.28 + occasional * 0.42;
}

function createLayer(config: {
  id: string;
  lineCount: number;
  seedBase: number;
  opacity: number;
  accentEvery: number;
  speed: number;
  parallax: number;
  blur: number;
  strokeWidth: number;
}): TelemetryLayer {
  const lines: TelemetryLine[] = [];
  for (let i = 0; i < config.lineCount; i++) {
    lines.push({
      seed: config.seedBase + i * 17.31,
      radiusNorm: (i + 1) / (config.lineCount + 1),
      angleBias: (i - (config.lineCount - 1) / 2) / (config.lineCount + 1),
      phase: i * 2.399,
      opacity: config.opacity * (0.72 + (i % 4) * 0.12),
      accent: i % config.accentEvery === 0,
      speed: config.speed * (0.8 + (i % 7) * 0.06),
    });
  }
  return {
    id: config.id,
    lines,
    parallax: config.parallax,
    blur: config.blur,
    strokeWidth: config.strokeWidth,
  };
}

export function buildTelemetryLayers(): TelemetryLayer[] {
  return [
    createLayer({
      id: 'deep',
      lineCount: 10,
      seedBase: 1.3,
      opacity: 0.3,
      accentEvery: 99,
      speed: 0.55,
      parallax: 0.35,
      blur: 0,
      strokeWidth: 1.0,
    }),
    createLayer({
      id: 'mid',
      lineCount: 14,
      seedBase: 4.7,
      opacity: 0.48,
      accentEvery: 4,
      speed: 0.75,
      parallax: 0.65,
      blur: 6,
      strokeWidth: 1.15,
    }),
    createLayer({
      id: 'front',
      lineCount: 9,
      seedBase: 9.2,
      opacity: 0.64,
      accentEvery: 3,
      speed: 1,
      parallax: 1,
      blur: 10,
      strokeWidth: 1.35,
    }),
  ];
}

interface ArcSegment {
  start: number;
  end: number;
}

/** Split each arc into discrete strokes with visible gaps */
function getArcSegments(line: TelemetryLine, layer: TelemetryLayer): ArcSegment[] {
  const count = layer.id === 'mid' ? 3 : 2;
  const slot = 1 / count;
  const gap = slot * 0.28;
  const segments: ArcSegment[] = [];

  for (let i = 0; i < count; i++) {
    const shift = (Math.sin(line.seed + i * 2.17) * 0.5 + 0.5) * slot * 0.12;
    const start = clamp(i * slot + gap * 0.5 + shift, 0, 1);
    const end = clamp((i + 1) * slot - gap * 0.5 + shift, 0, 1);
    if (end - start > 0.06) segments.push({ start, end });
  }

  return segments;
}

/** Pure circular arc geometry - no wobble or drift along the stroke */
function getArcGeometry(
  line: TelemetryLine,
  layer: TelemetryLayer,
  time: number,
  width: number,
  height: number,
): { origin: { x: number; y: number }; radius: number; sweep: number; timeSweep: number; angleSpread: number } {
  const origin = getFlowOrigin(time, width, height);
  const span = Math.max(width, height);
  const visibleMin = 0.2;
  const visibleMax = 1.05;
  const radius =
    span * lerp(visibleMin, visibleMax, line.radiusNorm) * (0.58 + layer.parallax * 0.42);

  return {
    origin,
    radius,
    sweep: Math.PI * 0.72,
    timeSweep: time * line.speed * 0.000096 + line.phase,
    angleSpread: Math.PI * 0.52,
  };
}

function arcAngle(
  line: TelemetryLine,
  tNorm: number,
  sweep: number,
  timeSweep: number,
  angleSpread: number,
): number {
  return -sweep * 0.5 + tNorm * sweep + timeSweep + line.angleBias * angleSpread;
}

function drawArcStroke(
  ctx: CanvasRenderingContext2D,
  line: TelemetryLine,
  layer: TelemetryLayer,
  time: number,
  width: number,
  height: number,
  tStart: number,
  tEnd: number,
): void {
  const { origin, radius, sweep, timeSweep, angleSpread } = getArcGeometry(
    line,
    layer,
    time,
    width,
    height,
  );
  const startAngle = arcAngle(line, tStart, sweep, timeSweep, angleSpread);
  const endAngle = arcAngle(line, tEnd, sweep, timeSweep, angleSpread);

  ctx.beginPath();
  ctx.arc(origin.x, origin.y, radius, startAngle, endAngle);
  ctx.stroke();
}

function applyLineStroke(
  ctx: CanvasRenderingContext2D,
  line: TelemetryLine,
  layer: TelemetryLayer,
  time: number,
  intensity: number,
): void {
  const glow = lineGlowPulse(time, line.seed);
  const alpha = clamp(line.opacity * intensity * (0.88 + glow * 0.18), 0, 0.82);
  const color = line.accent ? COBALT_GLOW : LINE_COLOR;
  const mix = line.accent ? 0.65 + glow * 0.2 : 0.18 + glow * 0.12;

  ctx.strokeStyle = `rgba(${lerp(color.r, COBALT.r, mix)}, ${lerp(color.g, COBALT.g, mix)}, ${lerp(color.b, COBALT.b, mix)}, ${alpha})`;
  ctx.lineWidth = layer.strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const blurBase = layer.blur > 0 ? (line.accent ? layer.blur : layer.blur * 0.45) : 0;
  if (blurBase > 0) {
    ctx.shadowBlur = blurBase * (0.55 + glow * 0.85);
    ctx.shadowColor = `rgba(${COBALT_GLOW.r}, ${COBALT_GLOW.g}, ${COBALT_GLOW.b}, ${alpha * (0.35 + glow * 0.45)})`;
  } else if (glow > 0.78) {
    ctx.shadowBlur = 5 * glow;
    ctx.shadowColor = `rgba(${COBALT_GLOW.r}, ${COBALT_GLOW.g}, ${COBALT_GLOW.b}, ${alpha * 0.35})`;
  } else {
    ctx.shadowBlur = 0;
  }
}

function drawContour(
  ctx: CanvasRenderingContext2D,
  line: TelemetryLine,
  layer: TelemetryLayer,
  time: number,
  width: number,
  height: number,
  intensity: number,
): void {
  applyLineStroke(ctx, line, layer, time, intensity);

  getArcSegments(line, layer).forEach((segment) => {
    drawArcStroke(ctx, line, layer, time, width, height, segment.start, segment.end);
  });

  ctx.shadowBlur = 0;
}

function drawTelemetryTraces(
  ctx: CanvasRenderingContext2D,
  time: number,
  width: number,
  height: number,
  intensity: number,
): void {
  const traceCount = 6;
  const origin = getFlowOrigin(time, width, height);
  const span = Math.max(width, height);

  for (let t = 0; t < traceCount; t++) {
    const seed = t * 5.17 + 2.4;
    const radiusNorm = (t + 1) / (traceCount + 1);
    const baseRadius = span * lerp(0.28, 0.92, radiusNorm);
    const angleBias = (t - (traceCount - 1) / 2) / (traceCount + 1);
    const arcSpan = Math.PI * 0.38;
    const timeSweep = time * 0.00007 * (t + 1);
    const sweep = arcSpan * 0.55;
    const accent = t === 1 || t === 3;
    const glow = lineGlowPulse(time, seed);

    ctx.strokeStyle = accent
      ? `rgba(${COBALT_GLOW.r}, ${COBALT_GLOW.g}, ${COBALT_GLOW.b}, ${(0.42 + glow * 0.18) * intensity})`
      : `rgba(235, 240, 255, ${(0.28 + glow * 0.12) * intensity})`;
    ctx.lineWidth = accent ? 1.2 : 0.95;
    ctx.lineCap = 'round';
    ctx.shadowBlur = (accent ? 10 : 4) * (0.6 + glow * 0.7);
    ctx.shadowColor = `rgba(${COBALT_GLOW.r}, ${COBALT_GLOW.g}, ${COBALT_GLOW.b}, ${0.22 + glow * 0.28})`;

    const strokeSlots = [
      { start: 0.08, end: 0.38 },
      { start: 0.58, end: 0.88 },
    ];

    for (const slot of strokeSlots) {
      const slotStart = -arcSpan * 0.5 + angleBias * Math.PI * 0.22 + timeSweep + slot.start * sweep;
      const slotEnd = -arcSpan * 0.5 + angleBias * Math.PI * 0.22 + timeSweep + slot.end * sweep;

      ctx.beginPath();
      ctx.arc(origin.x, origin.y, baseRadius, slotStart, slotEnd);
      ctx.stroke();
    }

    ctx.shadowBlur = 0;
  }
}

function drawAmbientGlow(
  ctx: CanvasRenderingContext2D,
  time: number,
  width: number,
  height: number,
  intensity: number,
): void {
  const origin = getFlowOrigin(time, width, height);
  const radius = Math.max(width, height) * 0.95;
  const glow = lineGlowPulse(time, 0.9);

  const grad = ctx.createRadialGradient(origin.x, origin.y, 0, origin.x, origin.y, radius);
  grad.addColorStop(0, `rgba(${COBALT_GLOW.r}, ${COBALT_GLOW.g}, ${COBALT_GLOW.b}, ${(0.1 + glow * 0.05) * intensity})`);
  grad.addColorStop(0.35, `rgba(${COBALT.r}, ${COBALT.g}, ${COBALT.b}, ${(0.045 + glow * 0.025) * intensity})`);
  grad.addColorStop(0.7, `rgba(${COBALT.r}, ${COBALT.g}, ${COBALT.b}, ${(0.015 + glow * 0.01) * intensity})`);
  grad.addColorStop(1, 'rgba(5, 5, 5, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}

/** Single-frame render - called each animation tick */
export function renderTelemetryFrame(
  ctx: CanvasRenderingContext2D,
  time: number,
  width: number,
  height: number,
  layers: TelemetryLayer[],
): void {
  if (width === 0 || height === 0) return;

  ctx.clearRect(0, 0, width, height);
  const intensity = pulseIntensity(time);

  drawAmbientGlow(ctx, time, width, height, intensity);

  layers.forEach((layer) => {
    layer.lines.forEach((line) => {
      drawContour(ctx, line, layer, time, width, height, intensity);
    });
  });

  drawTelemetryTraces(ctx, time, width, height, intensity);
}
