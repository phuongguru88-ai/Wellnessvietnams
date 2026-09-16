import { NGANH_ICON } from "@/lib/icons";
import type { Nganh } from "@/lib/types";

/** Tag cho Ngành chính thức — trục filter chính, nên nổi bật hơn LoaiHinhTag (thuộc tính phụ). */
export function NganhTag({ value }: { value: Nganh }) {
  const Icon = NGANH_ICON[value];
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-turmeric/10 px-2.5 py-1 text-[11px] font-semibold text-turmeric">
      <Icon aria-hidden size={12} strokeWidth={2} />
      {value}
    </span>
  );
}

export function NganhTags({
  values,
  className = "",
}: {
  values: readonly Nganh[];
  className?: string;
}) {
  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`}>
      {values.map((v) => (
        <li key={v}>
          <NganhTag value={v} />
        </li>
      ))}
    </ul>
  );
}
