import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { LoaiHinhTags } from "./LoaiHinhTag";
import { Media } from "./Media";
import { MucBadge } from "./MucBadge";
import { NganhTags } from "./NganhTag";
import type { ImageRef, LoaiHinh, Muc, Nganh } from "@/lib/types";

/** Card dùng chung cho cả 3 tab. */
export function ItemCard({
  href,
  image,
  icon: Icon,
  eyebrow,
  title,
  description,
  nganh,
  loaiHinh,
  muc,
  price,
  note,
}: {
  href: string;
  image: ImageRef;
  /** Icon nhỏ đứng trước dòng eyebrow — vd. loại chỗ ở, thời lượng. */
  icon?: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  nganh: readonly Nganh[];
  /** Bỏ trống ở trang mà thuộc tính này không phù hợp (vd. Chương trình). */
  loaiHinh?: readonly LoaiHinh[];
  muc: Muc;
  price: string;
  note?: string;
}) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-card border border-line bg-card shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Media
          interactive={false}
          image={image}
          className="h-full w-full transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute left-3 top-3">
          <MucBadge muc={muc} size="sm" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <p className="eyebrow flex items-center gap-1.5">
          {Icon && <Icon aria-hidden size={13} strokeWidth={2} />}
          {eyebrow}
        </p>

        <h3 className="text-xl">
          <Link href={href} className="after:absolute after:inset-0">
            {title}
          </Link>
        </h3>

        <p className="line-clamp-3 text-sm text-ink-soft">{description}</p>

        <NganhTags values={nganh} className="mt-auto pt-1" />
        {loaiHinh && <LoaiHinhTags values={loaiHinh} />}

        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t border-line pt-3">
          <p className="font-display text-lg text-ink">{price}</p>
          {note && <p className="text-xs text-ink-soft">{note}</p>}
        </div>
      </div>
    </article>
  );
}
