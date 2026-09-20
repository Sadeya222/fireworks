/**
 * ShellEmblem — the Classic Fireworks brand mark.
 * A fan-shaped shell burst with burnished-gold ribbing over a
 * Venetian-crimson fill, drawn as pure SVG so it stays razor-sharp
 * at any size (nav, footer, forms, lightbox).
 */
interface Props {
  className?: string;
  title?: string;
}

const PETAL = "M0 0 C5.4 -3.5 6.6 -13 0 -21 C-6.6 -13 -5.4 -3.5 0 0 Z";
const PETAL_LONG = "M0 0 C6 -4 7.4 -15.5 0 -26 C-7.4 -15.5 -6 -4 0 0 Z";
const ANGLE_SET = [-75, -50, -25, 25, 50, 75] as const;

export default function ShellEmblem({ className = "h-9 w-9", title }: Props) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}

      {/* Outer gold rib arcs fanning over the petals */}
      <path
        d="M 19.95 47.13 A 13 13 0 0 1 44.05 47.13"
        fill="none"
        stroke="#D4AF37"
        strokeWidth="0.9"
        opacity="0.85"
      />
      <path
        d="M 12.69 46.83 A 20 20 0 0 1 51.31 46.83"
        fill="none"
        stroke="#D4AF37"
        strokeWidth="0.9"
        opacity="0.55"
      />

      {/* Crimson petals with gold rims — side fan */}
      {ANGLE_SET.map((a) => (
        <g key={a} transform={`translate(32 52) rotate(${a})`}>
          <path d={PETAL} fill="#8B0000" stroke="#D4AF37" strokeWidth="0.9" />
          <circle cy="-18.4" r="1.05" fill="#D4AF37" />
        </g>
      ))}

      {/* Center petal — the tallest of the burst */}
      <g transform="translate(32 52)">
        <path d={PETAL_LONG} fill="#9A1B1E" stroke="#E8CE7C" strokeWidth="1" />
        <circle cy="-23" r="1.25" fill="#E8CE7C" />
      </g>

      {/* Firing-point base: gilded shell mouth */}
      <circle cx="32" cy="52" r="4.1" fill="#D4AF37" />
      <circle cx="32" cy="52" r="2" fill="#0F1117" />
      <circle cx="32" cy="52" r="0.85" fill="#E8CE7C" />
    </svg>
  );
}
