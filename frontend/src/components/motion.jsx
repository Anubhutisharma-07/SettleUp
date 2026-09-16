import { useEffect, useRef, useState } from 'react';

/* ------------------------------------------------------------------ */
/*  useReducedMotion — respects the user's OS setting                  */
/* ------------------------------------------------------------------ */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}

/* ------------------------------------------------------------------ */
/*  useInView — boolean once an element scrolls into view              */
/* ------------------------------------------------------------------ */
export function useInView(options = { threshold: 0.2 }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      options
    );
    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [ref, inView];
}

/* ------------------------------------------------------------------ */
/*  Reveal — fades/slides children in when scrolled into view          */
/* ------------------------------------------------------------------ */
export function Reveal({ children, delay = 0, className = '', y = 24 }) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{ '--reveal-delay': `${delay}ms`, '--reveal-y': `${y}px` }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CountUp — animates a number when it enters the viewport            */
/* ------------------------------------------------------------------ */
export function CountUp({ end, duration = 1100, decimals = 0, prefix = '', suffix = '', className = '' }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            const start = performance.now();
            const tick = (now) => {
              const t = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - t, 3);
              setValue(end * eased);
              if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  AnimatedValue — smoothly re-counts whenever `value` changes        */
/* ------------------------------------------------------------------ */
export function AnimatedValue({ value, duration = 650, format = (v) => Math.round(v).toLocaleString('en-IN'), className = '' }) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const to = Number(value) || 0;
    if (from === to) return undefined;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = from + (to - from) * eased;
      setDisplay(current);
      fromRef.current = current;
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return <span className={className}>{format(display)}</span>;
}

/* ------------------------------------------------------------------ */
/*  FlowRing — progress ring that fills to `percent` when in view      */
/* ------------------------------------------------------------------ */
export function FlowRing({ percent = 0, size = 72, stroke = 6, className = '', trackClass = 'text-slate-200 dark:text-slate-800', children }) {
  const [ref, inView] = useInView({ threshold: 0.4 });
  const reduced = useReducedMotion();
  const shown = reduced ? percent : inView ? percent : 0;

  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(Math.max(shown, 0), 100) / 100);

  return (
    <div ref={ref} className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} className={trackClass} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-brand-500 transition-[stroke-dashoffset] duration-[900ms] ease-out"
          style={{ transitionDelay: inView ? '120ms' : '0ms' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  useTilt — pointer-driven 3D tilt for signature surfaces.           */
/*  Sets --tilt-x/--tilt-y (deg) + --mx/--my (%) for a light sheen.    */
/*  Disabled for prefers-reduced-motion and touch devices.             */
/* ------------------------------------------------------------------ */
export function useTilt(max = 6) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node || reduced) return undefined;
    if (window.matchMedia('(hover: none)').matches) return undefined;

    let raf = 0;
    const onMove = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = node.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        node.style.setProperty('--tilt-x', `${(-py * max).toFixed(2)}deg`);
        node.style.setProperty('--tilt-y', `${(px * max).toFixed(2)}deg`);
        node.style.setProperty('--mx', `${((px + 0.5) * 100).toFixed(1)}%`);
        node.style.setProperty('--my', `${((py + 0.5) * 100).toFixed(1)}%`);
      });
    };
    const onLeave = () => {
      node.style.setProperty('--tilt-x', '0deg');
      node.style.setProperty('--tilt-y', '0deg');
    };
    node.addEventListener('pointermove', onMove);
    node.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      node.removeEventListener('pointermove', onMove);
      node.removeEventListener('pointerleave', onLeave);
    };
  }, [max, reduced]);

  return ref;
}
