import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import ShellEmblem from "./ShellEmblem";
import { EASE } from "./Reveal";
import { usePrefersReducedMotion } from "../lib/hooks";
import type { GalleryItem } from "../lib/data";

/* ====================================================================
   Lightbox — full-screen glassmorphic inspection modal.
   · Portal-rendered above every stacking context
   · Close (X / ESC / backdrop) · Arrow keys · on-screen arrows
   · Touch swipe (left/right) on coarse-pointer devices
   · Preloads the neighbouring plates for instant paging
   · Moves focus in on open and restores it on close
   ==================================================================== */

interface Props {
  items: GalleryItem[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (next: number) => void;
}

export default function Lightbox({ items, index, onClose, onIndexChange }: Props) {
  const reduced = usePrefersReducedMotion();
  const open = index !== null;
  const item = index !== null ? items[index] : null;

  const closeBtn = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [loaded, setLoaded] = useState(false);
  const swipe = useRef<{ x: number; y: number; t: number } | null>(null);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (index === null) return;
      setDirection(dir);
      setLoaded(false);
      onIndexChange((index + dir + items.length) % items.length);
    },
    [index, items.length, onIndexChange],
  );

  /* Keyboard, scroll-lock & focus management */
  useEffect(() => {
    if (!open) return;
    restoreFocus.current = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => closeBtn.current?.focus(), 80);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      window.clearTimeout(t);
      restoreFocus.current?.focus?.();
    };
  }, [open, onClose, go]);

  /* Preload neighbours */
  useEffect(() => {
    if (index === null) return;
    [1, -1].forEach((d) => {
      const img = new Image();
      img.src = items[(index + d + items.length) % items.length].full;
    });
  }, [index, items]);

  /* Touch swipe */
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") return;
    swipe.current = { x: e.clientX, y: e.clientY, t: performance.now() };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!swipe.current) return;
    const dx = e.clientX - swipe.current.x;
    const dy = e.clientY - swipe.current.y;
    const dt = performance.now() - swipe.current.t;
    swipe.current = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4 && dt < 700) go(dx < 0 ? 1 : -1);
  };

  if (typeof document === "undefined") return null;

  const slide = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, x: 48 * direction, scale: 0.98 },
        animate: { opacity: 1, x: 0, scale: 1 },
        exit: { opacity: 0, x: -48 * direction, scale: 0.98 },
      };

  return createPortal(
    <AnimatePresence>
      {open && item && (
        <motion.div
          className="fixed inset-0 z-[85] flex flex-col bg-obsidian-950/85 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          role="dialog"
          aria-modal="true"
          aria-label={`${item.title} — image ${index! + 1} of ${items.length}`}
          onClick={onClose}
        >
          {/* Top chrome */}
          <div className="flex items-center justify-between px-4 py-3 md:px-8 md:py-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <ShellEmblem className="h-8 w-8" />
              <div className="leading-none">
                <p className="font-display text-[11px] font-bold tracking-[0.28em] text-ivory">DISPLAY ARCHIVE</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.26em] text-gold-300/60">
                  Plate {String(index! + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                </p>
              </div>
            </div>
            <button
              ref={closeBtn}
              onClick={onClose}
              aria-label="Close lightbox"
              className="flex h-11 w-11 cursor-pointer items-center justify-center border border-gold-400/40 text-gold-200 transition-colors hover:border-gold-400 hover:bg-gold-400/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Stage */}
          <div
            className="relative flex flex-1 items-center justify-center px-14 pb-2 md:px-24"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => (swipe.current = null)}
          >
            {/* Prev / Next */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                go(-1);
              }}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center border border-gold-400/40 bg-obsidian-950/60 text-gold-200 backdrop-blur-sm transition-colors hover:border-gold-400 hover:bg-gold-400/10 md:left-8"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                go(1);
              }}
              aria-label="Next image"
              className="absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center border border-gold-400/40 bg-obsidian-950/60 text-gold-200 backdrop-blur-sm transition-colors hover:border-gold-400 hover:bg-gold-400/10 md:right-8"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Glass plate */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.figure
                key={index}
                {...slide}
                transition={{ duration: 0.42, ease: EASE }}
                className="relative flex max-h-full w-full max-w-5xl flex-col border border-gold-400/35 bg-obsidian-900/40 p-2 shadow-[0_0_140px_-30px_rgba(212,175,55,0.35),inset_0_1px_0_rgba(232,206,124,0.2)] backdrop-blur-2xl md:p-3"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative flex min-h-[40vh] items-center justify-center overflow-hidden bg-obsidian-950/60">
                  {!loaded && (
                    <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                      <span className="h-8 w-8 animate-spin rounded-full border border-gold-400/20 border-t-gold-400" />
                    </div>
                  )}
                  <img
                    src={item.full}
                    alt={item.title}
                    onLoad={() => setLoaded(true)}
                    className={`max-h-[62vh] w-auto max-w-full object-contain transition-opacity duration-300 md:max-h-[66vh] ${loaded ? "opacity-100" : "opacity-0"}`}
                    draggable={false}
                  />
                </div>
                <figcaption className="flex flex-wrap items-end justify-between gap-3 px-2 pb-1 pt-3 md:px-3">
                  <div>
                    <span className="mb-2 inline-block border border-gold-400/50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.24em] text-gold-200">
                      {item.tag}
                    </span>
                    <p className="font-display text-lg font-semibold text-ivory md:text-xl">{item.title}</p>
                    <p className="mt-0.5 text-[11px] uppercase tracking-[0.22em] text-ivory/50">{item.meta}</p>
                  </div>
                  <p className="hidden text-[10px] uppercase tracking-[0.3em] text-ivory/35 sm:block">
                    ← → to navigate · ESC to close
                  </p>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          {/* Thumbnail strip */}
          <div className="hidden justify-center gap-2 px-8 pb-5 pt-2 md:flex" onClick={(e) => e.stopPropagation()}>
            {items.map((g, i) => (
              <button
                key={g.title}
                onClick={() => {
                  setDirection(i > index! ? 1 : -1);
                  setLoaded(false);
                  onIndexChange(i);
                }}
                aria-label={`View ${g.title}`}
                aria-current={i === index}
                className={`h-12 w-16 cursor-pointer overflow-hidden border transition-all duration-200 ${
                  i === index ? "border-gold-400 opacity-100" : "border-gold-400/15 opacity-45 hover:opacity-90"
                }`}
              >
                <img src={g.src} alt="" className="h-full w-full object-cover" loading="lazy" draggable={false} />
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
