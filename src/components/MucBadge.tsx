import { MUC_META, type Muc } from "@/lib/types";

/**
 * Badge Mức: sao + nhãn chữ (không hiện trần số).
 * Mức 3 nổi bật nhất bằng turmeric đặc, Mức 1 chỉ viền trung tính.
 */
export function MucBadge({
  muc,
  size = "md",
}: {
  muc: Muc;
  size?: "sm" | "md";
}) {
  const meta = MUC_META[muc];

  const tone =
    muc === 3
      ? "bg-turmeric text-white border-transparent"
      : muc === 2
        ? "bg-[color-mix(in_srgb,var(--turmeric)_16%,transparent)] text-ink border-[color-mix(in_srgb,var(--turmeric)_42%,transparent)]"
        : "bg-transparent text-ink-soft border-line";

  const dims =
    size === "sm"
      ? "px-2.5 py-1 text-[11px] gap-1.5"
      : "px-3 py-1.5 text-xs gap-2";

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border font-semibold ${tone} ${dims}`}
      title={meta.description}
    >
      <span aria-hidden className="tracking-[0.12em]">
        {meta.stars}
      </span>
      <span className="whitespace-nowrap">{meta.label}</span>
    </span>
  );
}
