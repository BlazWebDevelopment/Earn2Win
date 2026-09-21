/**
 * Understated, verifiable facts about the product.
 * Deliberately no monetary totals — nothing here would need a disclaimer.
 */
const STATS = [
  { value: "5", label: "Social platforms" },
  { value: "1", label: "E2W ecosystem token" },
  { value: "Solana", label: "Network" },
  { value: "24/7", label: "Market tracking" },
] as const;

export function Stats() {
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line lg:grid-cols-4">
      {STATS.map((stat) => (
        <div key={stat.label} className="bg-card px-5 py-6 sm:px-6 sm:py-7">
          <dt className="text-[11px] font-medium tracking-[0.14em] text-fg-muted uppercase">
            {stat.label}
          </dt>
          <dd className="mt-2.5 text-[26px] leading-none font-semibold tracking-[-0.03em] sm:text-[32px]">
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
