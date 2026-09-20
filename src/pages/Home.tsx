import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowUpRight,
  Award,
  BadgeCheck,
  Check,
  ClipboardCheck,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import HeroScene from "../components/three/HeroScene";
import IntakeForm from "../components/IntakeForm";
import SectionHeading from "../components/SectionHeading";
import ShellEmblem from "../components/ShellEmblem";
import { Reveal, EASE } from "../components/Reveal";
import { usePrefersReducedMotion } from "../lib/hooks";
import { CERTIFICATIONS, CONTACT, IMAGES, PROCESS, STATS, TICKER_ITEMS } from "../lib/data";

gsap.registerPlugin(ScrollTrigger);

const certIcons = {
  shield: ShieldCheck,
  award: Award,
  clipboard: ClipboardCheck,
  badge: BadgeCheck,
};

/* ====================================================================
   HERO — full-bleed 3D canvas + dramatic title-card typography
   ==================================================================== */
function Hero() {
  const reduced = usePrefersReducedMotion();
  const navigate = useNavigate();

  const scrollToQuote = () =>
    document.getElementById("quote")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });

  return (
    <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden">
      {/* Real-time Three.js stage */}
      <div className="absolute inset-0" aria-hidden="true">
        <HeroScene />
      </div>

      {/* Cinematic grade: fade the stage floor into obsidian */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, #08090c 4%, rgba(8,9,12,0.55) 30%, rgba(8,9,12,0.08) 55%, rgba(8,9,12,0.4) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Corner registration hairlines */}
      <div className="pointer-events-none absolute left-5 top-24 h-10 w-10 border-l border-t border-gold-400/25 md:left-10" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-6 right-5 h-10 w-10 border-b border-r border-gold-400/25 md:right-10" aria-hidden="true" />

      {/* Vertical house tag */}
      <p
        className="pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 rotate-90 text-[10px] font-semibold uppercase tracking-[0.55em] text-gold-300/40 xl:block"
        aria-hidden="true"
      >
        Master Pyrotechnicians — Since 1993
      </p>

      {/* Title card */}
      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 pb-24 pt-40 md:px-10 md:pb-28">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.9, ease: EASE }}
            className="mb-7 flex items-center gap-4"
          >
            <span className="h-px w-12 bg-gold-400/80" aria-hidden="true" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.42em] text-gold-300 md:text-[11px]">
              Est. 1993 · Licensed Display Pyrotechnics · Chicago, IL
            </p>
          </motion.div>

          <h1 className="font-display font-bold leading-[1.02] text-ivory">
            <span className="block overflow-hidden">
              <motion.span
                className="block text-[clamp(2.5rem,7.2vw,6.2rem)] will-change-transform"
                initial={{ y: "112%" }}
                animate={{ y: "0%" }}
                transition={{ delay: 0.35, duration: 1.25, ease: EASE }}
              >
                Decades of Unrivaled
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-1">
              <motion.span
                className="block text-[clamp(2.5rem,7.2vw,6.2rem)] text-gold-400 will-change-transform"
                initial={{ y: "112%" }}
                animate={{ y: "0%" }}
                transition={{ delay: 0.5, duration: 1.25, ease: EASE }}
              >
                Pyrotechnic Excellence.
              </motion.span>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 1, ease: EASE }}
            className="mt-7 max-w-xl text-[15px] leading-relaxed text-ivory/65 md:text-base"
          >
            A family house of display fireworks. We compose, license and fire
            world-class shell choreography — from a single wedding salute to a
            stadium grand finale of ten thousand shells.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.08, duration: 1, ease: EASE }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <button
              onClick={scrollToQuote}
              className="btn-gold cursor-pointer px-8 py-4 text-xs font-bold uppercase tracking-[0.26em]"
            >
              Request a Quote
            </button>
            <button
              onClick={() => navigate("/services")}
              className="btn-ghost flex cursor-pointer items-center gap-2 px-8 py-4 text-xs font-bold uppercase tracking-[0.26em]"
            >
              Explore the Gallery <ArrowUpRight className="h-4 w-4" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="pointer-events-none absolute bottom-7 left-1/2 z-10 -translate-x-1/2" aria-hidden="true">
        <div className="h-12 w-px overflow-hidden bg-gold-400/15">
          <div className="scroll-cue h-full w-full bg-gold-400/80" />
        </div>
      </div>
    </section>
  );
}

/* ====================================================================
   TICKER — shell & effect inventory marquee
   ==================================================================== */
function Ticker() {
  return (
    <div className="relative overflow-hidden border-y border-gold-400/15 bg-obsidian-900/80 py-4">
      <div className="marquee-track" style={{ ["--marquee-dur" as string]: "52s" }}>
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
            {TICKER_ITEMS.map((item) => (
              <span key={`${copy}-${item}`} className="flex items-center">
                <span className="whitespace-nowrap px-8 font-display text-[12px] font-semibold tracking-[0.32em] text-gold-200/75">
                  {item.toUpperCase()}
                </span>
                <span className="h-1.5 w-1.5 rotate-45 bg-gold-500/50" aria-hidden="true" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ====================================================================
   HERITAGE — GSAP ScrollTrigger narrative + count-up stat badges
   ==================================================================== */
function Heritage() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: imageRef,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-9%", "9%"]);

  useEffect(() => {
    if (reduced || !sectionRef.current) return;
    const ctx = gsap.context(() => {
      /* Narrative lines rise from mask as they enter the frame */
      gsap.utils.toArray<HTMLElement>(".heritage-line").forEach((el, i) => {
        gsap.fromTo(
          el,
          { yPercent: 112 },
          {
            yPercent: 0,
            duration: 1.15,
            ease: "power3.out",
            delay: (i % 3) * 0.09,
            scrollTrigger: { trigger: el, start: "top 86%" },
          },
        );
      });
      /* Gold count-up stat badges */
      gsap.utils.toArray<HTMLElement>(".stat-num").forEach((el) => {
        const target = Number(el.dataset.value ?? 0);
        const suffix = el.dataset.suffix ?? "";
        const counter = { v: 0 };
        gsap.to(counter, {
          v: target,
          duration: 1.9,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
          onUpdate: () => {
            el.textContent = `${Math.round(counter.v).toLocaleString("en-US")}${suffix}`;
          },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [reduced]);

  const paragraphs = [
    "Classic Fireworks was founded in 1993 by master pyrotechnician Marcus Hale — a crew of four, one licensed barge, and a rule that has never been broken: no show flies until the crew can sleep on it.",
    "Today the house composes and fires stadium-scale aerials for civic, corporate and private clients across the region. Every launch is mapped, every landing corridor surveyed, every cue dry-run at full dress before the public ever arrives.",
    "Thirty years. A thousand-plus shows. Zero safety incidents. That ledger is not a marketing line — it is the architecture the company is built on.",
  ];

  return (
    <section id="heritage" className="relative scroll-mt-24 py-24 md:py-36" ref={sectionRef}>
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <SectionHeading
          kicker="The House of Classic"
          lines={["A Legacy Written", "in Light."]}
          meta="Three decades of shell choreography, safety discipline and studio-grade production standards."
        />

        <div className="grid gap-16 lg:grid-cols-12 lg:gap-12">
          {/* Narrative */}
          <div className="lg:col-span-7">
            <div className="space-y-7">
              {paragraphs.map((p, i) => (
                <div key={i} className="overflow-hidden">
                  <p className={`heritage-line max-w-2xl text-[15px] leading-[1.85] text-ivory/70 md:text-base ${i === 2 ? "text-ivory/85" : ""}`}>
                    {p}
                  </p>
                </div>
              ))}
            </div>

            {/* Founder's quote */}
            <Reveal delay={0.1} className="mt-12 border-l-2 border-gold-400/60 pl-6">
              <blockquote className="font-serif text-2xl italic leading-snug text-ivory/90 md:text-[1.7rem]">
                “A display is not fireworks on a clock. It is a story the sky
                tells — we only hold the pen.”
              </blockquote>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-300/80">
                Marcus Hale · Founder &amp; Master Pyrotechnician
              </p>
            </Reveal>

            {/* Stat badges — gilded frames, count-up on scroll */}
            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {STATS.map((s, i) => (
                <Reveal key={s.label} delay={i * 0.12} y={24}>
                  <div className="group relative border border-gold-400/30 bg-obsidian-900/60 px-5 py-6 transition-colors duration-200 hover:border-gold-400/60">
                    <span className="absolute left-0 top-0 h-3 w-3 border-l border-t border-gold-400/70" aria-hidden="true" />
                    <span className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-gold-400/70" aria-hidden="true" />
                    <p className="stat-num font-display text-4xl font-bold text-gold-300 md:text-[2.6rem]" data-value={s.value} data-suffix={s.suffix}>
                      {s.value.toLocaleString("en-US")}
                      {s.suffix}
                    </p>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-ivory/75">
                      {s.label}
                    </p>
                    <p className="mt-1 text-xs text-ivory/40">{s.detail}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Parallax plate */}
          <div className="lg:col-span-5">
            <Reveal y={40}>
              <div className="relative">
                {/* Offset gold frame */}
                <div className="absolute -bottom-4 -right-4 hidden h-full w-full border border-gold-400/30 sm:block" aria-hidden="true" />
                <div ref={imageRef} className="relative overflow-hidden border border-gold-400/20">
                  <motion.img
                    src={IMAGES.heritage}
                    alt="Classic Fireworks crew staging a festival display over a full house"
                    loading="lazy"
                    className="h-[420px] w-full object-cover will-change-transform md:h-[560px]"
                    style={{ y: reduced ? 0 : imgY, scale: 1.12 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/85 via-transparent to-obsidian-950/25" aria-hidden="true" />
                  <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-5 py-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-ivory/70">
                      Lakefront Civic Gala · 2025 · 1,200 shells
                    </p>
                  </div>
                </div>
                {/* Floating standing chip */}
                <div className="absolute -left-4 top-8 hidden items-center gap-2.5 border border-gold-400/40 bg-obsidian-950/90 px-4 py-3 backdrop-blur-sm md:flex">
                  <BadgeCheck className="h-5 w-5 text-gold-300" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold-200">NFPA 1124</p>
                    <p className="text-[10px] text-ivory/50">Certification current</p>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Certifications row */}
            <Reveal delay={0.15} className="mt-10">
              <ul className="grid grid-cols-2 gap-x-6 gap-y-4">
                {CERTIFICATIONS.map((c) => {
                  const Icon = certIcons[c.icon];
                  return (
                    <li key={c.text} className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.18em] text-ivory/55">
                      <Icon className="h-4 w-4 shrink-0 text-gold-400/80" />
                      {c.text}
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ====================================================================
   PROCESS — the commission journey in three acts
   ==================================================================== */
function Process() {
  return (
    <section className="border-t border-gold-400/10 bg-obsidian-900/40 py-24 md:py-32">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <SectionHeading
          kicker="The Commission Process"
          lines={["From First Call", "to Final Burst."]}
          meta="One director owns your show from the first site walk to the last strike."
        />
        <div className="grid gap-px border border-gold-400/15 bg-gold-400/15 md:grid-cols-3">
          {PROCESS.map((step, i) => (
            <Reveal key={step.num} delay={i * 0.14} className="h-full">
              <div className="group h-full bg-obsidian-950 p-8 transition-colors duration-200 hover:bg-obsidian-900 md:p-10">
                <p className="font-display text-5xl font-bold text-gold-400/25 transition-colors duration-200 group-hover:text-gold-400/50 md:text-6xl">
                  {step.num}
                </p>
                <h3 className="mt-6 font-display text-xl font-semibold text-ivory">{step.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-ivory/55">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ====================================================================
   QUOTE — the lead-intake stage (glassmorphic crimson, gilded stroke)
   ==================================================================== */
function QuoteSection() {
  return (
    <section id="quote" className="relative scroll-mt-20 overflow-hidden py-24 md:py-32">
      {/* Venetian ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 58% 52% at 74% 28%, rgba(139,0,0,0.22), transparent 64%)" }}
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-12">
          {/* Pitch */}
          <div className="lg:col-span-5">
            <SectionHeading kicker="Commission a Display" lines={["Tell Us About", "Your Night."]} />
            <Reveal>
              <p className="max-w-md -mt-6 text-[15px] leading-[1.85] text-ivory/65">
                Tell us the occasion, the crowd, the music in your head. A show
                director — not a formbot — reads every request, and you will
                hold a full proposal in under 48 hours.
              </p>
            </Reveal>

            <Reveal delay={0.1} className="mt-10 space-y-5">
              {[
                { icon: Phone, label: "Direct line", value: CONTACT.phone, href: CONTACT.phoneHref },
                { icon: Mail, label: "Show desk", value: CONTACT.email, href: `mailto:${CONTACT.email}` },
                { icon: MapPin, label: "The house", value: CONTACT.address },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-gold-400/30">
                    <row.icon className="h-4.5 w-4.5 text-gold-300" />
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold-300/70">{row.label}</p>
                    {row.href ? (
                      <a href={row.href} className="text-sm text-ivory/80 transition-colors hover:text-gold-200">{row.value}</a>
                    ) : (
                      <p className="text-sm text-ivory/80">{row.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </Reveal>

            <Reveal delay={0.2} className="mt-10">
              <ul className="space-y-3">
                {[
                  "Complimentary site & wind survey",
                  "Full proposal within 48 hours",
                  "Dedicated crew chief & safety director",
                ].map((b) => (
                  <li key={b} className="flex items-center gap-3 text-sm text-ivory/70">
                    <Check className="h-4 w-4 text-gold-400" /> {b}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          {/* Glassmorphic intake card */}
          <div className="lg:col-span-7">
            <Reveal y={44} delay={0.1}>
              <div className="relative border border-gold-400/25 bg-crimson-900/25 shadow-[0_0_90px_-24px_rgba(212,175,55,0.3),inset_0_1px_0_rgba(212,175,55,0.14)] backdrop-blur-xl">
                {/* Header strip */}
                <div className="flex items-center justify-between border-b border-gold-400/20 px-6 py-4 md:px-9">
                  <div className="flex items-center gap-3">
                    <ShellEmblem className="h-8 w-8" />
                    <p className="font-display text-sm font-bold tracking-[0.28em] text-ivory">
                      QUOTE REQUEST
                    </p>
                  </div>
                  <span className="border border-gold-400/40 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.26em] text-gold-200">
                    Now booking 2026
                  </span>
                </div>
                <IntakeForm />
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ====================================================================
   PAGE
   ==================================================================== */
export default function Home() {
  const location = useLocation();
  const reduced = usePrefersReducedMotion();

  /* Cross-page deep links (Services CTA → this page's intake form) */
  useEffect(() => {
    const target = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (!target) return;
    const t = window.setTimeout(() => {
      document.getElementById(target)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    }, 120);
    return () => window.clearTimeout(t);
  }, [location.state, reduced]);

  return (
    <main>
      <Hero />
      <Ticker />
      <Heritage />
      <Process />
      <QuoteSection />
    </main>
  );
}
