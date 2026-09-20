import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Phone, X } from "lucide-react";
import BrandLogo from "./BrandLogo";
import { useScrolled, usePrefersReducedMotion } from "../lib/hooks";
import { CONTACT } from "../lib/data";
import { cn } from "../utils/cn";

/**
 * Navbar — transparent over the hero, condensing to a smoked-obsidian
 * bar with a gilded hairline on scroll. Section links navigate
 * cross-page via router state so the target page auto-scrolls.
 */
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const scrolled = useScrolled(32);
  const reduced = usePrefersReducedMotion();
  const location = useLocation();
  const navigate = useNavigate();

  /** Navigate, optionally to a section on the home page. */
  const goTo = (path: string, section?: string) => {
    setOpen(false);
    if (section) {
      if (path === location.pathname) {
        document.getElementById(section)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
        return;
      }
      navigate(path, { state: { scrollTo: section } });
    } else if (path !== location.pathname) {
      navigate(path);
    }
  };

  const links = [
    { label: "Home", path: "/" },
    { label: "Services & Gallery", path: "/services" },
    { label: "Heritage", path: "/", section: "heritage" },
    { label: "Quote", path: "/", section: "quote" },
  ];

  const isActive = (l: (typeof links)[number]) =>
    !l.section && l.path === location.pathname;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled || open
            ? "border-b border-gold-400/15 bg-obsidian-950/85 backdrop-blur-md"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 md:h-[76px] md:px-10">
          {/* Supplied brand artwork; dimensions preserve its native 190:84 ratio. */}
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="group flex min-h-11 items-center"
            aria-label="Classic Fireworks home"
          >
            <BrandLogo
              eager
              className="w-[98px] transition-transform duration-300 group-hover:scale-[1.03] sm:w-[112px] md:w-[124px]"
            />
          </Link>

          {/* Desktop links */}
          <nav className="hidden items-center gap-9 lg:flex" aria-label="Primary">
            {links.map((l) => (
              <button
                key={l.label}
                onClick={() => goTo(l.path, l.section)}
                data-active={isActive(l)}
                className="nav-link cursor-pointer text-[11px] font-semibold uppercase tracking-[0.3em] text-ivory/70 transition-colors duration-200 hover:text-ivory"
              >
                {l.label}
              </button>
            ))}
            <a
              href={CONTACT.phoneHref}
              className="flex items-center gap-2.5 border border-gold-400/40 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-200 transition-all duration-200 hover:border-gold-400 hover:bg-gold-400/10"
            >
              <Phone className="h-3.5 w-3.5" />
              {CONTACT.phone}
            </a>
          </nav>

          {/* Mobile toggle */}
          <button
            className="flex h-11 w-11 items-center justify-center border border-gold-400/30 text-gold-200 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile overlay menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col justify-between bg-obsidian-950/[0.985] px-7 pb-10 pt-28 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
          >
            <nav className="flex flex-col gap-2" aria-label="Mobile">
              {links.map((l, i) => (
                <motion.button
                  key={l.label}
                  onClick={() => goTo(l.path, l.section)}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * i + 0.08, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-baseline gap-4 border-b border-gold-400/10 py-5 text-left"
                >
                  <span className="font-display text-xs text-gold-500/70">0{i + 1}</span>
                  <span className="font-display text-3xl font-semibold text-ivory">{l.label}</span>
                </motion.button>
              ))}
            </nav>
            <a href={CONTACT.phoneHref} className="btn-gold flex items-center justify-center gap-3 py-4 text-sm font-bold uppercase tracking-[0.24em]">
              <Phone className="h-4 w-4" /> Call {CONTACT.phone}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
