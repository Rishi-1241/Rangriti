import { cn } from "@/lib/cn";

/** Line-drawn monogram: an arch (mehrab) framing a serif R. */
export function Monogram({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden className={className}>
      <path
        d="M8 44V22C8 12.6 15.2 5 24 5s16 7.6 16 17v22"
        stroke="var(--brass)"
        strokeWidth="1"
      />
      <path d="M12.5 44V23c0-6.9 5.1-12.5 11.5-12.5S35.5 16.1 35.5 23v21" stroke="var(--line-strong)" strokeWidth="0.75" />
      <text
        x="24"
        y="35"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="20"
        fontStyle="italic"
        fill="var(--accent)"
      >
        R
      </text>
      <path d="M4 44h40" stroke="var(--brass)" strokeWidth="1" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <Monogram size={34} />
      <span className="leading-none max-[359px]:hidden">
        <span className="block font-display text-[1.2rem] font-medium tracking-wide text-ink sm:text-[1.35rem]">Rangriti</span>
        <span className="eyebrow mt-1 block !text-[0.56rem]">Studio</span>
      </span>
    </span>
  );
}

/** Repeating jaali arches for hero backgrounds. */
export function ArchMotif({ className }: { className?: string }) {
  const arches = Array.from({ length: 5 });
  return (
    <svg viewBox="0 0 600 700" fill="none" aria-hidden className={className} preserveAspectRatio="xMidYMid slice">
      {arches.map((_, i) => {
        const inset = i * 44;
        const w = 600 - inset * 2;
        const top = 90 + inset * 1.1;
        return (
          <path
            key={i}
            d={`M${inset + 40} 700 V${top + w / 2} C${inset + 40} ${top + 40} ${300 - w * 0.2} ${top} 300 ${top - 40} C${300 + w * 0.2} ${top} ${600 - inset - 40} ${top + 40} ${600 - inset - 40} ${top + w / 2} V700`}
            stroke={i === 0 ? "var(--brass)" : "var(--line-strong)"}
            strokeWidth={i === 0 ? 1.2 : 0.8}
            style={{ strokeDasharray: 1800, ["--len" as string]: 1800, animation: `draw-stroke 2.4s var(--ease-draw) ${0.15 * i}s both` }}
          />
        );
      })}
      <circle cx="300" cy="40" r="3" fill="var(--accent)" style={{ animation: "breathe 4s ease-in-out infinite" }} />
    </svg>
  );
}
