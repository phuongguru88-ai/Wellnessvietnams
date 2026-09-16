import Link from "next/link";

import { Artwork } from "./Artwork";
import { formatArticleDate } from "@/lib/format";
import { CHUYEN_MUC_ICON } from "@/lib/icons";
import type { BaiViet } from "@/lib/types";

/** Card cho bài viết kiến thức — dùng ở trang danh sách, trang chủ và "bài liên quan". */
export function ArticleCard({ article }: { article: BaiViet }) {
  const Icon = CHUYEN_MUC_ICON[article.chuyenMuc];

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-card border border-line bg-card shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Artwork
          image={article.images[0]}
          className="h-full w-full transition duration-500 group-hover:scale-[1.03]"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <p className="eyebrow flex items-center gap-1.5">
          <Icon aria-hidden size={13} strokeWidth={2} />
          {article.chuyenMuc}
        </p>

        <h3 className="text-xl">
          <Link href={`/kien-thuc/${article.slug}`} className="after:absolute after:inset-0">
            {article.title}
          </Link>
        </h3>

        <p className="line-clamp-3 text-sm text-ink-soft">{article.excerpt}</p>

        <div className="mt-auto flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t border-line pt-3 text-xs text-ink-soft">
          <span>{formatArticleDate(article.publishedAt)}</span>
          <span>{article.readingMinutes} phút đọc</span>
        </div>
      </div>
    </article>
  );
}
