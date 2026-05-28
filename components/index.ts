export {
  ResearchTelemetryBackground,
  ResearchTelemetrySection,
  type ResearchTelemetryBackgroundProps,
  type ResearchTelemetrySectionProps,
} from './ResearchTelemetryBackground';

export { useTelemetryAnimation } from '../hooks/useTelemetryAnimation';
export { useReducedMotion } from '../hooks/useReducedMotion';
export {
  buildTelemetryLayers,
  renderTelemetryFrame,
  type TelemetryLayer,
  type TelemetryLine,
} from '../utils/telemetryEngine';
