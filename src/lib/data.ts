/**
 * Classic Fireworks — central content & configuration.
 * All copy, imagery and lead-routing constants live here so the
 * marketing pages stay purely presentational.
 */

/* ------------------------------------------------------------------ */
/* Lead routing                                                        */
/* ------------------------------------------------------------------ */

/** Address every quote request is routed to. */
export const LEAD_EMAIL = "shows@classicfireworks.com";

/**
 * Optional direct-to-inbox AJAX endpoint (Formspree / Resend / custom
 * backend). When left empty, submission falls back to a pre-filled
 * mailto: hand-off so a lead can never be lost.
 */
export const LEAD_ENDPOINT = "";

export const CONTACT = {
  phone: "(312) 555-0197",
  phoneHref: "tel:+13125550197",
  email: LEAD_EMAIL,
  address: "2108 W. Grand Boulevard, Chicago, IL 60612",
  hours: "Site surveys by appointment · Mon – Sat, 8a – 7p",
};

/* ------------------------------------------------------------------ */
/* Image CDN helper (Pexels) — remote URLs keep the single-file build  */
/* lightweight on 4G                                                   */
/* ------------------------------------------------------------------ */
const px = (id: number, w: number, h: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${w}&h=${h}`;

export const IMAGES = {
  heritage: px(13086749, 1000, 1300),
  servicesHero: px(27051707, 1920, 1080),
};

/* ------------------------------------------------------------------ */
/* Hero ticker — shell & effect inventory                             */
/* ------------------------------------------------------------------ */
export const TICKER_ITEMS = [
  "6″ Golden Peonies",
  "8″ Chrysanthemums",
  "10″ Grand Finale Shells",
  "4″ Salute Batteries",
  "Virginia Rebellions",
  "Charm Cascades",
  "Titan Comets",
  "Strobe Stars",
  "Roman Ladders",
  "Walnut Buds",
];

/* ------------------------------------------------------------------ */
/* Heritage stats (count-up animated on scroll)                       */
/* ------------------------------------------------------------------ */
export interface Stat {
  value: number;
  suffix: string;
  label: string;
  detail: string;
}
export const STATS: Stat[] = [
  { value: 30, suffix: "+", label: "Years Experience", detail: "Family-run since 1993" },
  { value: 100, suffix: "%", label: "Safety Record", detail: "Zero incidents on record" },
  { value: 1000, suffix: "+", label: "Shows Staged", detail: "Salutes to stadium finales" },
];

export const CERTIFICATIONS = [
  { icon: "shield" as const, text: "NFPA 1124 Certified Crews" },
  { icon: "award" as const, text: "ATF & State Display Licenses" },
  { icon: "clipboard" as const, text: "OSHA-Compliant Launch Sites" },
  { icon: "badge" as const, text: "$10M Full Liability Coverage" },
];

/* ------------------------------------------------------------------ */
/* Commission process                                                  */
/* ------------------------------------------------------------------ */
export const PROCESS = [
  {
    num: "01",
    title: "Consultation & Site Survey",
    body: "We walk your venue, model wind corridors, sightlines and blast radii, then map every viewing axis before a single shell is specced.",
  },
  {
    num: "02",
    title: "Shell Design & Choreography",
    body: "Your palette, your music, your story. Our fireworks director composes the sequence shell-by-shell, beat-by-beat, then dry-runs it on site.",
  },
  {
    num: "03",
    title: "Night-of Performance",
    body: "Master pyrotechnician on the firing line, dedicated safety director, and a rehearsed cue sheet executed to the millisecond.",
  },
];

/* ------------------------------------------------------------------ */
/* Service tiers (Page 2)                                              */
/* ------------------------------------------------------------------ */
export interface ServiceTier {
  id: string;
  icon: "gauge" | "music" | "flame" | "gem";
  num: string;
  title: string;
  blurb: string;
  points: string[];
  from: string;
}
export const SERVICE_TIERS: ServiceTier[] = [
  {
    id: "shells",
    icon: "gauge",
    num: "01",
    title: "High-Altitude Shell Displays",
    blurb:
      "Full aerial choreography with 2″ through 10″ shells — engineered for altitude, separation and zero-debris landing corridors.",
    points: ["Up to 2,000 ft burst altitude", "Aerial mapping & wind modeling", "Salutes to multi-tier grand finales"],
    from: "From $18,000",
  },
  {
    id: "pyromusical",
    icon: "music",
    num: "02",
    title: "Musical Pyromusicals",
    blurb:
      "Fireworks fused to music at the millisecond — licensed scores and original compositions cut to your brand's rhythm.",
    points: ["Frame-accurate audio sync", "Original & licensed scoring", "Sound, light and aerial trinity"],
    from: "From $32,000",
  },
  {
    id: "coldspark",
    icon: "flame",
    num: "03",
    title: "Cold Spark & Indoor Effects",
    blurb:
      "Waterless, low-temperature spark machinery for ballrooms, stages and glass houses — spectacle without open flame.",
    points: ["Fountains, tables & arches", "Zero open flame indoors", "Stage & ceremony choreography"],
    from: "From $6,500",
  },
  {
    id: "custom",
    icon: "gem",
    num: "04",
    title: "Custom Corporate & Wedding Shows",
    blurb:
      "A private display written for one occasion — branded palettes, monogram shell patterns and estate-scale staging.",
    points: ["Branded color palettes", "Monogram & logo shell patterns", "Private estate & resort shows"],
    from: "From $12,000",
  },
];

/* ------------------------------------------------------------------ */
/* Theatrical gallery (Page 2)                                         */
/* ------------------------------------------------------------------ */
export interface GalleryItem {
  src: string;
  full: string;
  title: string;
  tag: string;
  meta: string;
  tall?: boolean;
}
export const GALLERY: GalleryItem[] = [
  {
    src: px(31210634, 900, 1250),
    full: px(31210634, 1600, 1000),
    title: "Gilded Peony Train",
    tag: "Aerial",
    meta: "Navy Pier · 2025 · 118 shells",
    tall: true,
  },
  {
    src: px(38562165, 900, 650),
    full: px(38562165, 1800, 1000),
    title: "Skyline Salute",
    tag: "Salute",
    meta: "Millennium Park · 2024 · 240 rounds",
  },
  {
    src: px(33672865, 900, 1250),
    full: px(33672865, 1600, 1000),
    title: "Crimson Charm Cascade",
    tag: "Finale",
    meta: "Lakefront Gala · 2025 · 74 shells",
    tall: true,
  },
  {
    src: px(12745603, 900, 650),
    full: px(12745603, 1800, 1000),
    title: "Stadium Opener Battery",
    tag: "Salute",
    meta: "Soldier Field · 2023 · 300 rounds",
  },
  {
    src: px(5302663, 900, 650),
    full: px(5302663, 1800, 1000),
    title: "Aurora Pyromusical",
    tag: "Musical",
    meta: "Harbor Festival · 2025 · 412 shells",
  },
  {
    src: px(27530280, 900, 1250),
    full: px(27530280, 1600, 1000),
    title: "Estate Display & Cold Spark",
    tag: "Private",
    meta: "Munster County Estate · 2024 · 96 units",
    tall: true,
  },
  {
    src: px(36745051, 900, 650),
    full: px(36745051, 1800, 1000),
    title: "Corporate Grand Finale",
    tag: "Corporate",
    meta: "Meridian Tower Inauguration · 2025",
  },
  {
    src: px(29440437, 900, 650),
    full: px(29440437, 1800, 1000),
    title: "Chrysanthemum Finale",
    tag: "Finale",
    meta: "Civic New Year · 2026 · 1,200 shells",
  },
  {
    src: px(10483823, 900, 650),
    full: px(10483823, 1800, 1000),
    title: "Harbor Finale — Aerial",
    tag: "Aerial",
    meta: "Waterfront Commission · 2024",
  },
];

export const VENUES = [
  "Navy Pier",
  "Soldier Field",
  "Millennium Park",
  "Lincoln Center",
  "Meridian Resort",
  "United Center",
  "Grant Park",
  "The Ritz-Carlton",
  "Lakefront Trust",
  "Garfield Park Conservatory",
];

/* ------------------------------------------------------------------ */
/* Page 2 headline — single source of truth (proofed copy)            */
/* ------------------------------------------------------------------ */
export const SERVICES_HEADLINE = {
  line1: "Masterclass Displays",
  line2: "& Custom Pyrotechnics",
} as const;

/* ------------------------------------------------------------------ */
/* Intake form — venue sizes                                           */
/* ------------------------------------------------------------------ */
export const VENUE_SIZES = [
  "Small / Private",
  "Medium / Corporate",
  "Large / Stadium",
  "Municipal",
] as const;
