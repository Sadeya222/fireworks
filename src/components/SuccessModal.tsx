import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Mail, MapPin, Phone, X } from "lucide-react";
import ShellEmblem from "./ShellEmblem";
import { EASE } from "./Reveal";
import { buildMailto, prettyDate, type LeadReceipt } from "../lib/leads";
import { CONTACT } from "../lib/data";
import { usePrefersReducedMotion } from "../lib/hooks";

/* ====================================================================
   SuccessModal — glowing golden confirmation shown after a lead is
   accepted. Portal-rendered, ESC/backdrop dismiss, focus moved to the
   primary action, auto-closes after 12 s (progress hairline).
   ==================================================================== */

interface Props {
  receipt: LeadReceipt | null;
  onClose: () => void;
}

const AUTO_CLOSE_MS = 12000;

export default function SuccessModal({ receipt, onClose }: Props) {
  const reduced = usePrefersReducedMotion();
  const doneRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!receipt) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const focusT = window.setTimeout(() => doneRef.current?.focus(), 350);
    const closeT = window.setTimeout(onClose, AUTO_CLOSE_MS);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      window.clearTimeout(focusT);
      window.clearTimeout(closeT);
    };
  }, [receipt, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {receipt && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-obsidian-950/80 p-4 backdrop-blur-md sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-title"
        >
          <motion.div
            className="relative w-full max-w-lg"
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.6, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Golden aura — opacity-only pulse (GPU friendly) */}
            <div className="success-aura pointer-events-none absolute -inset-6 rounded-[2rem] bg-gold-400/25 blur-3xl" aria-hidden="true" />

            <div className="relative overflow-hidden border border-gold-400/60 bg-gradient-to-b from-obsidian-850 to-obsidian-950 shadow-[0_0_120px_-20px_rgba(212,175,55,0.55),inset_0_1px_0_rgba(232,206,124,0.35)]">
              {/* Corner brackets */}
              {["top-0 left-0 border-t border-l", "top-0 right-0 border-t border-r", "bottom-0 left-0 border-b border-l", "bottom-0 right-0 border-b border-r"].map((pos) => (
                <span key={pos} className={`pointer-events-none absolute h-5 w-5 border-gold-300 ${pos}`} aria-hidden="true" />
              ))}

              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute right-3 top-3 z-10 flex h-11 w-11 cursor-pointer items-center justify-center text-ivory/60 transition-colors hover:text-gold-200"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="px-7 pb-8 pt-10 text-center sm:px-10">
                {/* Emblem + drawn check */}
                <div className="relative mx-auto h-24 w-24">
                  <motion.div
                    className="absolute inset-0 rounded-full border border-gold-400/50"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border border-gold-400/25"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1.25, opacity: 1 }}
                    transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
                  />
                  <ShellEmblem className="absolute inset-0 m-auto h-14 w-14" />
                  <motion.svg
                    viewBox="0 0 32 32"
                    className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-gold-400 p-2 text-obsidian-950 shadow-[0_0_24px_rgba(212,175,55,0.7)]"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.45, duration: 0.45, ease: EASE }}
                    aria-hidden="true"
                  >
                    <motion.path
                      d="M6 17 L13 24 L26 9"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: reduced ? 1 : 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }}
                    />
                  </motion.svg>
                </div>

                <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.42em] text-gold-300/80">
                  Receipt {receipt.id}
                </p>
                <h3 id="success-title" className="mt-3 font-display text-3xl font-bold text-ivory sm:text-[2.1rem]">
                  Transmission <span className="text-gold-400">Received</span>
                </h3>
                <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-ivory/65">
                  Thank you, {receipt.payload.name.split(" ")[0]}. Your request is with our show
                  director. Expect a personal reply within four business hours.
                </p>

                {/* Receipt ledger */}
                <dl className="mt-7 grid grid-cols-1 gap-3 border-y border-gold-400/20 py-5 text-left sm:grid-cols-3">
                  <div>
                    <dt className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.26em] text-gold-300/70">
                      <Calendar className="h-3 w-3" /> Event
                    </dt>
                    <dd className="mt-1 text-sm text-ivory/85">{prettyDate(receipt.payload.eventDate)}</dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.26em] text-gold-300/70">
                      <MapPin className="h-3 w-3" /> Venue
                    </dt>
                    <dd className="mt-1 text-sm text-ivory/85">{receipt.payload.venueSize}</dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.26em] text-gold-300/70">
                      <Mail className="h-3 w-3" /> Reply to
                    </dt>
                    <dd className="mt-1 truncate text-sm text-ivory/85">{receipt.payload.email}</dd>
                  </div>
                </dl>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <button
                    ref={doneRef}
                    onClick={onClose}
                    className="btn-gold flex-1 cursor-pointer px-6 py-3.5 text-xs font-bold uppercase tracking-[0.26em]"
                  >
                    Done
                  </button>
                  <a
                    href={buildMailto(receipt.payload, receipt.id)}
                    className="btn-ghost flex flex-1 items-center justify-center gap-2 px-6 py-3.5 text-xs font-bold uppercase tracking-[0.26em]"
                  >
                    <Mail className="h-4 w-4" /> Email a Copy
                  </a>
                </div>
                <a
                  href={CONTACT.phoneHref}
                  className="mt-5 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-ivory/45 transition-colors hover:text-gold-200"
                >
                  <Phone className="h-3.5 w-3.5" /> Urgent? Call {CONTACT.phone}
                </a>
              </div>

              {/* Auto-close progress hairline (transform-only) */}
              <div className="h-px w-full bg-gold-400/15" aria-hidden="true">
                <motion.div
                  className="h-full w-full origin-left bg-gold-400"
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: AUTO_CLOSE_MS / 1000, ease: "linear" }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
