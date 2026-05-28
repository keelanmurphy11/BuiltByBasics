import * as React from 'react';
import { useRef } from 'react';
import { useTelemetryAnimation } from '../hooks/useTelemetryAnimation';

export interface ResearchTelemetryBackgroundProps {
  /** Optional className for the outer wrapper */
  className?: string;
  /** Background base color — defaults to near-black lab aesthetic */
  baseColor?: string;
}

export interface ResearchTelemetrySectionProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  baseColor?: string;
}

/**
 * Premium animated telemetry background for research / performance sections.
 *
 * Flowing contour lines, biometric traces, and soft cobalt glow —
 * anchored to the right with a fade into negative space on the left.
 *
 * @example
 * <section className="relative">
 *   <ResearchTelemetryBackground />
 *   <div className="relative z-10">{children}</div>
 * </section>
 */
export function ResearchTelemetryBackground({
  className = '',
  baseColor = '#050505',
}: ResearchTelemetryBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useTelemetryAnimation(canvasRef, containerRef);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 isolate overflow-hidden ${className}`}
      style={{ backgroundColor: baseColor }}
      aria-hidden="true"
      data-research-telemetry-bg
    >
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full opacity-[0.96]" />

      {/* Left fade — keeps heading readable */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to right, ${baseColor} 0%, ${baseColor} 28%, rgba(5,5,5,0.92) 42%, rgba(5,5,5,0.55) 58%, rgba(5,5,5,0.15) 72%, transparent 100%)`,
        }}
      />

      {/* Vertical vignette + radial depth */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(to bottom, ${baseColor} 0%, transparent 16%, transparent 84%, ${baseColor} 100%),
            radial-gradient(ellipse 90% 70% at 82% 50%, transparent 38%, rgba(5,5,5,0.38) 100%)
          `,
        }}
      />

      {/* Subtle grain texture */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

/**
 * Full-width section wrapper with the telemetry background and readable content layer.
 */
export function ResearchTelemetrySection({
  children,
  className = '',
  contentClassName = '',
  baseColor = '#050505',
}: ResearchTelemetrySectionProps) {
  return (
    <section
      className={`relative overflow-hidden border-t border-zinc-800 py-28 text-white sm:py-36 ${className}`}
      style={{ backgroundColor: baseColor }}
    >
      <ResearchTelemetryBackground baseColor={baseColor} />
      <div className={`relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 ${contentClassName}`}>
        {children}
      </div>
    </section>
  );
}

export default ResearchTelemetryBackground;
