import { useEffect, useState } from "react";

/**
 * Reactive media-query hook. Powers the performance strategy:
 *  - `prefers-reduced-motion`  → static lighting, fixed graphics
 *  - `pointer: coarse`         → 3D stays on, but post-FX & camera pan drop
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** Accessibility: user prefers reduced motion. */
export const usePrefersReducedMotion = () =>
  useMediaQuery("(prefers-reduced-motion: reduce)");

/** Touch-first device — heavy GPU post-processing is disabled here. */
export const useCoarsePointer = () => useMediaQuery("(pointer: coarse)");

/** True on fine-pointer (desktop-class) devices. */
export const useFinePointer = () => useMediaQuery("(pointer: fine)");

/** Simple scroll-threshold flag for the navbar chrome. */
export function useScrolled(threshold = 24): boolean {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

/** Current scrollY (rAF-throttled) — used by the sticky CTA bar. */
export function useScrollY(): number {
  const [y, setY] = useState(0);
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setY(window.scrollY);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return y;
}
