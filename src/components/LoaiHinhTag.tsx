import { LOAI_HINH_ICON } from "@/lib/icons";
import type { LoaiHinh } from "@/lib/types";

export function LoaiHinhTag({ value }: { value: LoaiHinh }) {
  const Icon = LOAI_HINH_ICON[value];
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line px-2.5 py-1 text-[11px] font-medium text-ink-soft">
      <Icon aria-hidden size={12} strokeWidth={2} />
      {value}
    </span>
  );
}

export function LoaiHinhTags({
  values,
  className = "",
}: {
  values: readonly LoaiHinh[];
  className?: string;
}) {
  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`}>
      {values.map((v) => (
        <li key={v}>
          <LoaiHinhTag value={v} />
        </li>
      ))}
    </ul>
  );
}
