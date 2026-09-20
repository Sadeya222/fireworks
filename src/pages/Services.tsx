import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Flame, Gauge, Gem, Music4, Phone, ZoomIn } from "lucide-react";
import Lightbox from "../components/Lightbox";
import SectionHeading from "../components/SectionHeading";
import ShellEmblem from "../components/ShellEmblem";
import { Reveal, EASE } from "../components/Reveal";
import { useScrollY } from "../lib/hooks";
import { CONTACT, GALLERY, IMAGES, SERVICE_TIERS, SERVICES_HEADLINE, VENUES } from "../lib/data";

const tierIcons = { gauge: Gauge, music: Music4, flame: Flame, gem: Gem };

/* Cinzel packs "hn" tightly at heavy weights — open the tracking and
   kill ligatures so the headline reads cleanly at every size. */
const HEADLINE_STYLE: React.CSSProperties = {
  fontVariantLigatures: "none",
  letterSpacing: "0.015em",
  textRendering: "optimizeLegibility",
};

/* ====================================================================
   SUB-HERO — "Masterclass Displays & Custom Pyrotechnics"
   ==================================================================== */
function SubHero() {
  const facts = ["Licensed in 14 States", "40+ Crew Per Show", "2,000 ft Max Altitude"];
  return (
    <section className="relative overflow-hidden pb-20 pt-36 md:pb-28 md:pt-44">
      {/* Backdrop plate */}
      <div className="absolute inset-0" aria-hidden="true">
        <img src={IMAGES.servicesHero} alt="" loading="eager" className="h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian-950/90 via-obsidian-950/70 to-obsidian-950" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 45% at 50% 0%, rgba(139,0,0,0.28), transparent 70%)" }} />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-5 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE }}
          className="mb-7 flex items-center gap-4"
        >
          <span className="h-px w-12 bg-gold-400/80" aria-hidden="true" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.42em] text-gold-300 md:text-[11px]">
            Services &amp; Display Gallery
          </p>
        </motion.div>

        <h1 className="max-w-5xl font-display font-bold leading-[1.06] text-ivory" style={HEADLINE_STYLE}>
          <span className="block overflow-hidden">
            <motion.span
              className="block text-[clamp(2.2rem,5.4vw,4.5rem)] will-change-transform"
              initial={{ y: "112%" }}
              animate={{ y: "0%" }}
              transition={{ delay: 0.2, duration: 1.15, ease: EASE }}
            >
              {SERVICES_HEADLINE.line1}
            </motion.span>
          </span>
          <span className="block overflow-hidden pb-1">
            <motion.span
              className="block text-[clamp(2.2rem,5.4vw,4.5rem)] text-gold-400 will-change-transform"
              initial={{ y: "112%" }}
              animate={{ y: "0%" }}
              transition={{ delay: 0.34, duration: 1.15, ease: EASE }}
            >
              {SERVICES_HEADLINE.line2}
            </motion.span>
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 1, ease: EASE }}
          className="mt-6 max-w-xl text-[15px] leading-relaxed text-ivory/65 md:text-base"
        >
          Four service lines, one standard: a show the audience will describe
          for years. Every tier includes licensed crewing, full insurance and
          a documented site-safety survey.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.95, duration: 1 }}
          className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3"
        >
          {facts.map((f, i) => (
            <span key={f} className="flex items-center gap-8">
              {i > 0 && <span className="hidden h-8 w-px bg-gold-400/25 md:block" aria-hidden="true" />}
              <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-200/80">{f}</span>
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ====================================================================
   SERVICE TIERS — gold edge-glow cards (<200ms film timing)
   ==================================================================== */
function Tiers() {
  const navigate = useNavigate();
  const toQuote = () => navigate("/", { state: { scrollTo: "quote" } });

  return (
    <section id="tiers" className="scroll-mt-24 py-24 md:py-32">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <SectionHeading
          kicker="Service Lines"
          lines={["Four Ways We", "Set the Sky."]}
          meta="Each tier ships with full crewing, insurance and a documented site survey."
        />
        <div className="grid gap-5 md:grid-cols-2">
          {SERVICE_TIERS.map((tier, i) => {
            const Icon = tierIcons[tier.icon];
            return (
              <Reveal key={tier.id} delay={(i % 2) * 0.12} y={36}>
                <article className="tier-card group h-full p-7 md:p-10">
                  {/* Index numeral */}
                  <span
                    className="pointer-events-none absolute right-6 top-5 font-display text-6xl font-bold text-gold-400/15 transition-colors duration-200 group-hover:text-gold-400/30"
                    aria-hidden="true"
                  >
                    {tier.num}
                  </span>

                  {/* Diamond-ringed icon */}
                  <span className="relative ml-2 mt-2 inline-flex h-14 w-14 rotate-45 items-center justify-center border border-gold-400/45 transition-colors duration-200 group-hover:border-gold-400">
                    <Icon className="h-6 w-6 -rotate-45 text-gold-300" />
                  </span>

                  <h3 className="mt-8 font-display text-2xl font-semibold leading-tight text-ivory">{tier.title}</h3>
                  <p className="mt-4 max-w-md text-sm leading-relaxed text-ivory/55">{tier.blurb}</p>

                  <ul className="mt-7 space-y-3 border-t border-gold-400/15 pt-6">
                    {tier.points.map((p) => (
                      <li key={p} className="flex items-center gap-3 text-[13px] text-ivory/70">
                        <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-gold-400/80" aria-hidden="true" />
                        {p}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-gold-300/85">{tier.from}</p>
                    <button
                      onClick={toQuote}
                      className="flex min-h-[44px] cursor-pointer items-center gap-2 text-[11px] font-bold uppercase tracking-[0.26em] text-ivory/70 transition-colors duration-200 hover:text-gold-200"
                    >
                      Inquire <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ====================================================================
   THEATRICAL GALLERY — masonry grid, every plate opens the Lightbox
   ==================================================================== */
function Gallery({ onLightboxChange }: { onLightboxChange: (open: boolean) => void }) {
  const [active, setActive] = useState<number | null>(null);

  const open = useCallback(
    (i: number) => {
      setActive(i);
      onLightboxChange(true);
    },
    [onLightboxChange],
  );
  const close = useCallback(() => {
    setActive(null);
    onLightboxChange(false);
  }, [onLightboxChange]);

  return (
    <section id="gallery" className="scroll-mt-24 border-t border-gold-400/10 bg-obsidian-900/40 py-24 md:py-32">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <SectionHeading
          kicker="From the Vault"
          lines={["Theatrical", "Gallery."]}
          meta="Tap any plate to inspect it at full resolution. Arrow keys or swipe to page through."
        />

        <div className="grid auto-rows-[180px] grid-cols-2 gap-3 md:auto-rows-[225px] md:gap-4 lg:grid-cols-3">
          {GALLERY.map((item, i) => (
            <Reveal key={item.title} delay={(i % 3) * 0.08} y={28} className={item.tall ? "row-span-2" : ""}>
              <button
                type="button"
                onClick={() => open(i)}
                aria-label={`Inspect ${item.title}`}
                className="group relative block h-full w-full cursor-pointer overflow-hidden border border-gold-400/12 text-left transition-colors duration-200 hover:border-gold-400/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400"
              >
                <img
                  src={item.src}
                  alt={item.title}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover will-change-transform transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                />
                {/* Always-visible zoom affordance on touch; hover overlay on desktop */}
                <span className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center border border-gold-400/40 bg-obsidian-950/60 text-gold-200 backdrop-blur-sm transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100">
                  <ZoomIn className="h-4 w-4" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/90 via-obsidian-950/20 to-transparent opacity-70 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100" />
                <div className="absolute inset-x-0 bottom-0 p-3 transition-all duration-200 md:translate-y-3 md:p-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
                  <span className="mb-1.5 inline-block border border-gold-400/50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.24em] text-gold-200">
                    {item.tag}
                  </span>
                  <p className="font-display text-sm font-semibold leading-tight text-ivory md:text-lg">{item.title}</p>
                  <p className="mt-0.5 hidden items-center gap-2 text-[11px] text-gold-300/85 md:flex">
                    Inspect <ArrowUpRight className="h-3.5 w-3.5" />
                  </p>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <Lightbox items={GALLERY} index={active} onClose={close} onIndexChange={setActive} />
    </section>
  );
}

/* ====================================================================
   VENUES MARQUEE — where the house has flown
   ==================================================================== */
function Venues() {
  return (
    <section className="overflow-hidden border-t border-gold-400/10 py-10">
      <p className="mb-6 text-center text-[10px] font-semibold uppercase tracking-[0.5em] text-gold-300/50">
        As Performed Across the Great Lakes Region
      </p>
      <div className="marquee-track" style={{ ["--marquee-dur" as string]: "64s" }}>
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
            {VENUES.map((v) => (
              <span key={`${copy}-${v}`} className="flex items-center">
                <span className="whitespace-nowrap px-10 font-display text-lg font-semibold tracking-[0.18em] text-ivory/30">
                  {v.toUpperCase()}
                </span>
                <span className="h-1.5 w-1.5 rotate-45 bg-gold-500/40" aria-hidden="true" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ====================================================================
   FINAL CTA BAND + STICKY CALL BAR
   ==================================================================== */
function CtaBand() {
  const navigate = useNavigate();
  return (
    <section className="py-24 md:py-28">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <Reveal>
          <div className="relative overflow-hidden border border-gold-400/25 bg-gradient-to-br from-obsidian-900 to-obsidian-950 px-8 py-14 md:px-16">
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(ellipse 50% 90% at 15% 50%, rgba(139,0,0,0.25), transparent 70%)" }}
              aria-hidden="true"
            />
            <ShellEmblem className="pointer-events-none absolute -bottom-8 -right-6 h-44 w-44 opacity-[0.06]" />
            <div className="relative flex flex-col items-start justify-between gap-10 md:flex-row md:items-center">
              <div>
                <h3 className="font-display text-3xl font-bold leading-tight text-ivory md:text-4xl">
                  The season fills <span className="text-gold-400">fast.</span>
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-ivory/55">
                  Grand finale dates from July through September are already
                  reserved in most municipalities. Lock your night before the
                  sky is spoken for.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate("/", { state: { scrollTo: "quote" } })}
                  className="btn-gold cursor-pointer px-8 py-4 text-xs font-bold uppercase tracking-[0.26em]"
                >
                  Plan Your Display
                </button>
                <a href={CONTACT.phoneHref} className="btn-ghost flex items-center gap-2 px-8 py-4 text-xs font-bold uppercase tracking-[0.26em]">
                  <Phone className="h-4 w-4" /> {CONTACT.phone}
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** Sticky quick-access bar — click-to-call + jump to the intake form. */
function StickyCta({ hidden }: { hidden: boolean }) {
  const y = useScrollY();
  const navigate = useNavigate();
  const visible = y > 620 && !hidden;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.45, ease: EASE }}
          className="fixed inset-x-0 bottom-0 z-[70] border-t border-gold-400/25 bg-obsidian-950/92 backdrop-blur-md"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 md:px-10">
            <div className="hidden items-center gap-3 sm:flex">
              <ShellEmblem className="h-8 w-8" />
              <div>
                <p className="font-display text-xs font-bold tracking-[0.22em] text-ivory">CLASSIC FIREWORKS</p>
                <p className="text-[10px] uppercase tracking-[0.24em] text-gold-300/60">2026 season — filling fast</p>
              </div>
            </div>
            <div className="flex w-full items-center gap-3 sm:w-auto sm:justify-end">
              <a
                href={CONTACT.phoneHref}
                className="btn-gold flex min-h-[46px] flex-1 items-center justify-center gap-2 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.22em] sm:flex-none"
              >
                <Phone className="h-4 w-4" />
                <span className="hidden sm:inline">{CONTACT.phone}</span>
                <span className="sm:hidden">Call Now</span>
              </a>
              <button
                onClick={() => navigate("/", { state: { scrollTo: "quote" } })}
                className="btn-ghost flex min-h-[46px] flex-1 cursor-pointer items-center justify-center gap-2 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.22em] sm:flex-none"
              >
                <span className="hidden sm:inline">Plan Your Display</span>
                <span className="sm:hidden">Get a Quote</span>
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ====================================================================
   PAGE
   ==================================================================== */
export default function Services() {
  /* The sticky bar tucks away while the lightbox is open */
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <main>
      <SubHero />
      <Tiers />
      <Gallery onLightboxChange={setLightboxOpen} />
      <Venues />
      <CtaBand />
      {/* Breathing room so the sticky bar never buries the footer */}
      <div className="h-16" aria-hidden="true" />
      <StickyCta hidden={lightboxOpen} />
    </main>
  );
}
