import { useEffect, useRef } from 'react';
import { useReducedMotion } from './motion';

/* ==========================================================================
   AmbientBackground — the settlement watermark.

   Abstract rings, orbital arcs and translucent spheres living behind the
   landing content: "a system operating behind the interface", moving
   quietly toward balance. Many paths → convergence → one settled state.

   Rules baked in:
   - aria-hidden + pointer-events:none + z-index 0 (content sits above)
   - all theming via --ambient-* CSS variables (designed per theme)
   - parallax via the shared hook: one window listener, CSS vars only
   - reduced motion: parallax off, ambient animations disabled in CSS
   - mobile: composition simplified (elements hidden via utility classes)
   ========================================================================== */

/* One rAF-throttled pointer listener per composition (never per shape). */
function useAmbientParallax(active) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || !active) return undefined;
    if (window.matchMedia('(hover: none)').matches) return undefined;

    let raf = 0;
    const onMove = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const nx = (e.clientX / window.innerWidth) * 2 - 1; // -1 … 1
        const ny = (e.clientY / window.innerHeight) * 2 - 1;
        node.style.setProperty('--px', nx.toFixed(3));
        node.style.setProperty('--py', ny.toFixed(3));
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [active]);

  return ref;
}

/* Thin SVG orbital curves — the "many paths" of the settlement story. */
function OrbitalArcs({ className = '', strong = 0 }) {
  return (
    <svg
      className={`ambient-arc absolute ${className}`}
      viewBox="0 0 800 600"
      fill="none"
      aria-hidden="true"
    >
      <path d="M-60 430 C 180 300, 420 420, 860 240" strokeWidth="1.2" />
      {strong > 0 && <path d="M-40 520 C 220 360, 470 500, 850 330" strokeWidth="1.4" className="ambient-arc-strong" />}
      {strong > 1 && <path d="M120 640 C 300 420, 560 560, 780 400" strokeWidth="1.1" />}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  HERO — the richest composition (edges only, never behind text)     */
/* ------------------------------------------------------------------ */
function HeroAmbient() {
  return (
    <>
      {/* Giant torus entering from bottom-left */}
      <div
        data-depth="4"
        style={{ '--depth': 4, width: 560, height: 560, left: '-15%', bottom: '-38%' }}
        className="ambient-ring ambient-ring--tube ambient-drift-slow ambient-hide-md"
      />
      {/* Large thin ring partially visible top-right */}
      <div
        data-depth="6"
        style={{ '--depth': 6, width: 720, height: 720, right: '-22%', top: '-52%' }}
        className="ambient-ring ambient-ring--thin ambient-spin ambient-hide-md"
      />
      {/* Mid ring, right edge behind the demo card (card wins hierarchy) */}
      <div
        data-depth="3"
        style={{ '--depth': 3, width: 380, height: 380, right: '-12%', top: '26%' }}
        className="ambient-ring ambient-ring--soft ambient-drift ambient-hide-sm"
      />
      {/* Deep-background sphere, small and far */}
      <div
        data-depth="2"
        style={{ '--depth': 2, width: 96, height: 96, right: '30%', top: '12%' }}
        className="ambient-orb ambient-breathe"
      />
      {/* Orbital curves converging toward the content */}
      <div data-depth="3" style={{ '--depth': 3 }} className="absolute inset-0 ambient-hide-md">
        <OrbitalArcs className="w-[120%] h-[130%] -left-[8%] -top-[12%]" strong={1} />
      </div>
      {/* Clean reading zone behind the headline */}
      <div
        data-depth="1"
        style={{ '--depth': 1, width: '56%', height: '68%', left: '2%', top: '10%' }}
        className="ambient-veil"
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  ENGINE — slightly more geometric / orbital                         */
/* ------------------------------------------------------------------ */
function EngineAmbient() {
  return (
    <>
      {/* Concentric convergence rings, right side */}
      <div
        data-depth="3"
        style={{ '--depth': 3, width: 640, height: 640, right: '-26%', top: '8%' }}
        className="ambient-ring ambient-ring--thin ambient-spin-rev ambient-hide-md"
      />
      <div
        data-depth="2"
        style={{ '--depth': 2, width: 420, height: 420, right: '-14%', top: '22%' }}
        className="ambient-ring ambient-ring--soft ambient-hide-sm"
      />
      {/* Soft orb bottom-left */}
      <div
        data-depth="2"
        style={{ '--depth': 2, width: 84, height: 84, left: '4%', bottom: '8%' }}
        className="ambient-orb ambient-breathe ambient-hide-sm"
      />
      <div data-depth="2" style={{ '--depth': 2 }} className="absolute inset-0 ambient-hide-md">
        <OrbitalArcs className="w-[130%] h-[140%] -left-[12%] -top-[16%]" strong={2} />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  FEATURES — very subtle                                             */
/* ------------------------------------------------------------------ */
function FeaturesAmbient() {
  return (
    <>
      <div
        data-depth="2"
        style={{ '--depth': 2, width: 520, height: 520, left: '-18%', top: '-18%' }}
        className="ambient-ring ambient-ring--soft ambient-drift-slow ambient-hide-sm"
      />
      <div
        data-depth="1"
        style={{ '--depth': 1, width: 64, height: 64, right: '8%', bottom: '10%' }}
        className="ambient-orb ambient-breathe"
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  JOURNEY — a single quiet shape (the scroll story carries itself)   */
/* ------------------------------------------------------------------ */
function JourneyAmbient() {
  return (
    <div
      data-depth="2"
      style={{ '--depth': 2, width: 460, height: 460, right: '-16%', top: '30%' }}
      className="ambient-ring ambient-ring--soft ambient-drift-slow ambient-hide-sm"
    />
  );
}

const VARIANTS = {
  hero: HeroAmbient,
  engine: EngineAmbient,
  features: FeaturesAmbient,
  journey: JourneyAmbient,
};

export default function AmbientBackground({ variant = 'hero', className = '' }) {
  const reduced = useReducedMotion();
  const ref = useAmbientParallax(!reduced);
  const Shape = VARIANTS[variant] || HeroAmbient;

  return (
    <div ref={ref} className={`ambient ${className}`} aria-hidden="true">
      <Shape />
    </div>
  );
}
