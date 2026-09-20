import type { ReactNode } from "react";
import { motion } from "framer-motion";

/** Signature "film lift" easing — slow-out, theatrical. */
export const EASE = [0.16, 1, 0.3, 1] as const;

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  duration?: number;
  once?: boolean;
}

/** Fade-and-rise on scroll into view (transform/opacity only). */
export function Reveal({ children, className, delay = 0, y = 32, duration = 1, once = true }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-12% 0px" }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

interface LineMaskProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/**
 * LineMask — the hero type treatment. Text rises out of an
 * overflow-hidden mask like a title card emerging from darkness.
 */
export function LineMask({ children, className = "", delay = 0 }: LineMaskProps) {
  return (
    <span className={`block overflow-hidden ${className}`}>
      <motion.span
        className="block will-change-transform"
        initial={{ y: "114%" }}
        whileInView={{ y: "0%" }}
        viewport={{ once: true, margin: "-8% 0px" }}
        transition={{ duration: 1.15, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}
