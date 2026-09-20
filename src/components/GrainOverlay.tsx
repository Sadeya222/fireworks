/**
 * GrainOverlay — site-wide cinematic post layer.
 * Animated film grain (transform-only) + a radial vignette that
 * seats every page in the "projector room". Purely decorative,
 * pointer-events disabled, and disabled for reduced-motion users
 * (handled in CSS).
 */
export default function GrainOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[95] overflow-hidden" aria-hidden="true">
      {/* Film grain */}
      <div className="grain-layer opacity-[0.05] mix-blend-overlay" />
      {/* Radial vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 72% 68% at 50% 42%, transparent 55%, rgba(4,5,8,0.52) 100%)",
        }}
      />
    </div>
  );
}
