import type { Metadata } from "next";
import Link from "next/link";

import { ArticleCard } from "@/components/ArticleCard";
import { PageIntro } from "@/components/PageIntro";
import { sortedBaiVietList } from "@/lib/data";
import { CHUYEN_MUC_ICON, EMPTY_STATE_ICON } from "@/lib/icons";
import { matchesQuery } from "@/lib/search";
import { BAI_VIET_CHUYEN_MUC, type BaiVietChuyenMuc } from "@/lib/types";

type SearchParams = Record<string, string | string[] | undefined>;

function parseChuyenMuc(sp: SearchParams): BaiVietChuyenMuc | undefined {
  const raw = Array.isArray(sp.chuyenMuc) ? sp.chuyenMuc[0] : sp.chuyenMuc;
  return (BAI_VIET_CHUYEN_MUC as readonly string[]).includes(raw ?? "")
    ? (raw as BaiVietChuyenMuc)
    : undefined;
}

function parseQuery(sp: SearchParams): string | undefined {
  const raw = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  const q = (raw ?? "").trim().slice(0, 100);
  return q || undefined;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const chuyenMuc = parseChuyenMuc(sp);
  const q = parseQuery(sp);
  const label = [chuyenMuc, q ? `"${q}"` : undefined].filter(Boolean).join(" · ");

  return {
    title: label ? `Kiến thức: ${label}` : "Kiến thức chăm sóc sức khỏe & ngành wellness",
    description: label
      ? `Bài viết kiến thức về ${label} tại Wellnessvietnams.`
      : "Ngành du lịch chăm sóc sức khỏe hoạt động ra sao, và những kiến thức hữu ích về y học phương đông, dinh dưỡng, vận động, tinh thần trước khi bạn chọn một chương trình.",
    alternates: { canonical: "/kien-thuc" },
    robots: label ? { index: false, follow: true } : undefined,
  };
}

export default async function KienThucPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const chuyenMuc = parseChuyenMuc(sp);
  const q = parseQuery(sp);
  const EmptyIcon = EMPTY_STATE_ICON;

  const all = await sortedBaiVietList();
  const list = all.filter(
    (b) =>
      (!chuyenMuc || b.chuyenMuc === chuyenMuc) &&
      matchesQuery(q, b.title, b.excerpt, b.chuyenMuc),
  );

  return (
    <>
      <PageIntro eyebrow="Kiến thức" title="Hiểu ngành wellness và cơ thể mình, trước khi đặt chỗ">
        <p>
          Bài viết ngắn gọn, dễ đọc: ngành du lịch chăm sóc sức khỏe hoạt động
          ra sao, và những kiến thức chăm sóc sức khỏe hữu ích để bạn chọn
          đúng chương trình cho mình.
        </p>
      </PageIntro>

      <div className="shell pb-16">
        <div className="surface rounded-card p-4 shadow-soft sm:p-5">
          <form action="/kien-thuc" className="border-b border-line pb-4">
            {chuyenMuc && <input type="hidden" name="chuyenMuc" value={chuyenMuc} />}
            <label htmlFor="q" className="sr-only">
              Tìm kiếm
            </label>
            <div className="relative">
              <span
                aria-hidden
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft"
              >
                ⌕
              </span>
              <input
                id="q"
                name="q"
                type="search"
                defaultValue={q}
                placeholder="Tìm theo tiêu đề, chủ đề…"
                className="w-full rounded-full border border-line bg-bg py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-soft/70"
              />
            </div>
          </form>

          <div className="flex flex-wrap gap-2 pt-4">
            <Link
              href="/kien-thuc"
              className={`inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                !chuyenMuc
                  ? "border-transparent bg-ink text-bg"
                  : "border-line text-ink-soft hover:border-ink-soft hover:text-ink"
              }`}
            >
              Tất cả
            </Link>
            {BAI_VIET_CHUYEN_MUC.map((cm) => {
              const Icon = CHUYEN_MUC_ICON[cm];
              const active = chuyenMuc === cm;
              return (
                <Link
                  key={cm}
                  href={`/kien-thuc?chuyenMuc=${encodeURIComponent(cm)}`}
                  className={`inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? "border-transparent bg-ink text-bg"
                      : "border-line text-ink-soft hover:border-ink-soft hover:text-ink"
                  }`}
                >
                  <Icon aria-hidden size={13} strokeWidth={2} className="mr-1.5 -ml-0.5" />
                  {cm}
                </Link>
              );
            })}
          </div>

          <p aria-live="polite" className="mt-4 border-t border-line pt-3 text-sm text-ink-soft">
            <strong className="font-semibold text-ink">{list.length}</strong> bài viết phù hợp
          </p>
        </div>

        {list.length === 0 ? (
          <div className="mt-8 rounded-card border border-dashed border-line p-10 text-center">
            <EmptyIcon aria-hidden size={28} strokeWidth={1.5} className="mx-auto text-ink-soft" />
            <h2 className="mt-3 text-xl">
              {q ? `Không tìm thấy bài viết nào cho "${q}"` : "Chưa có bài viết trong chuyên mục này"}
            </h2>
            <p className="mx-auto mt-2 max-w-prose text-sm text-ink-soft">
              Thử một từ khoá khác, hoặc xem tất cả bài viết.
            </p>
          </div>
        ) : (
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((article) => (
              <li key={article.id}>
                <ArticleCard article={article} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
