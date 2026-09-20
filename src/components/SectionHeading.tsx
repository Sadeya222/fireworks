import { LineMask } from "./Reveal";

interface Props {
  kicker: string;
  /** Each entry renders as its own masked line. */
  lines: string[];
  /** Optional meta note, right-aligned on wide screens. */
  meta?: string;
  /** Render the last line in burnished gold. */
  goldLast?: boolean;
}

/**
 * SectionHeading — house typographic device:
 * gold hairline + letterspaced kicker over masked Cinzel display lines.
 */
export default function SectionHeading({ kicker, lines, meta, goldLast = true }: Props) {
  return (
    <div className="mb-14 flex items-end justify-between gap-10 md:mb-20">
      <div>
        <div className="mb-6 flex items-center gap-4">
          <span className="h-px w-10 bg-gold-400/70" aria-hidden="true" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-gold-300/90">
            {kicker}
          </p>
        </div>
        <h2 className="font-display text-4xl font-semibold leading-[1.06] text-ivory md:text-5xl lg:text-[3.4rem]">
          {lines.map((line, i) => (
            <LineMask key={i} delay={i * 0.1}>
              <span className={goldLast && i === lines.length - 1 ? "text-gold-400" : undefined}>
                {line}
              </span>
            </LineMask>
          ))}
        </h2>
      </div>
      {meta ? (
        <p className="hidden max-w-[220px] shrink-0 pb-1 text-right text-[13px] leading-relaxed text-ivory/40 md:block">
          {meta}
        </p>
      ) : null}
    </div>
  );
}
