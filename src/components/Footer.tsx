import { useLocation, useNavigate } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import BrandLogo from "./BrandLogo";
import { CERTIFICATIONS, CONTACT } from "../lib/data";
import { usePrefersReducedMotion } from "../lib/hooks";

/** Site footer — gilded hairline, house mark, contact ledger. */
export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const reduced = usePrefersReducedMotion();

  const goTo = (path: string, section?: string) => {
    if (section && path === location.pathname) {
      document.getElementById(section)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
      return;
    }
    if (section) navigate(path, { state: { scrollTo: section } });
    else navigate(path);
  };

  return (
    <footer className="relative border-t border-gold-400/15 bg-obsidian-900/70">
      <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-5">
            <button
              type="button"
              onClick={() => goTo("/")}
              className="block min-h-11 cursor-pointer"
              aria-label="Classic Fireworks home"
            >
              <BrandLogo className="w-[150px] sm:w-[170px] md:w-[190px]" />
            </button>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-ivory/50">
              A family house of display pyrotechnics. We compose, license,
              fire and photograph world-class fireworks — from a single
              wedding salute to a stadium grand finale of ten thousand shells.
            </p>
            <p className="mt-6 text-[11px] uppercase tracking-[0.25em] text-gold-300/50">
              ATF Display License No. CF-1993-0197
            </p>
          </div>

          {/* Explore */}
          <div className="md:col-span-2">
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-300/80">
              Explore
            </p>
            <ul className="space-y-3 text-sm text-ivory/60">
              <li><button className="cursor-pointer transition-colors hover:text-gold-300" onClick={() => goTo("/")}>Home</button></li>
              <li><button className="cursor-pointer transition-colors hover:text-gold-300" onClick={() => goTo("/services")}>Services &amp; Gallery</button></li>
              <li><button className="cursor-pointer transition-colors hover:text-gold-300" onClick={() => goTo("/", "heritage")}>Heritage</button></li>
              <li><button className="cursor-pointer transition-colors hover:text-gold-300" onClick={() => goTo("/", "quote")}>Quote Request</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-3">
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-300/80">
              Contact
            </p>
            <ul className="space-y-4 text-sm text-ivory/60">
              <li>
                <a href={CONTACT.phoneHref} className="flex items-center gap-3 transition-colors hover:text-gold-300">
                  <Phone className="h-4 w-4 text-gold-400/70" /> {CONTACT.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-3 transition-colors hover:text-gold-300">
                  <Mail className="h-4 w-4 text-gold-400/70" /> {CONTACT.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-400/70" /> {CONTACT.address}
              </li>
            </ul>
          </div>

          {/* Standing */}
          <div className="md:col-span-2">
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-300/80">
              Standing
            </p>
            <ul className="space-y-3 text-[13px] text-ivory/50">
              {CERTIFICATIONS.map((c) => (
                <li key={c.text} className="border-l border-gold-400/25 pl-3">{c.text}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-gold-400/10 pt-7 text-[11px] tracking-wide text-ivory/35 md:flex-row md:items-center md:justify-between">
          <p>© 2026 Classic Fireworks LLC. All rights reserved.</p>
          <p className="uppercase tracking-[0.2em]">Licensed · Insured · Safety-First</p>
          <p>
            Photography via{" "}
            <a
              href="https://www.pexels.com"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-gold-400/40 underline-offset-2 hover:text-gold-300"
            >
              Pexels
            </a>{" "}
            contributors
          </p>
        </div>
      </div>
    </footer>
  );
}
