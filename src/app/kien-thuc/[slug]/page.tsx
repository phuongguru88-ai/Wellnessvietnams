import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/ArticleCard";
import { Artwork } from "@/components/Artwork";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContactForm } from "@/components/ContactForm";
import { getBaiViet, relatedBaiViet } from "@/lib/data";
import { formatArticleDate } from "@/lib/format";
import { CHUYEN_MUC_ICON } from "@/lib/icons";
import { SITE_URL } from "@/lib/site";
import { LOAI_HINH } from "@/lib/types";

// Nội dung do quản trị viên chỉnh sửa qua /quan-tri — không prerender tĩnh.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getBaiViet(slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/kien-thuc/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      url: `${SITE_URL}/kien-thuc/${article.slug}`,
      publishedTime: article.publishedAt,
    },
  };
}

export default async function BaiVietDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getBaiViet(slug);
  if (!article) notFound();

  const related = await relatedBaiViet(article, 3);
  const Icon = CHUYEN_MUC_ICON[article.chuyenMuc];
  const isLoaiHinh = (LOAI_HINH as readonly string[]).includes(article.chuyenMuc);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    author: { "@type": "Organization", name: article.author },
    datePublished: article.publishedAt,
    url: `${SITE_URL}/kien-thuc/${article.slug}`,
  };

  return (
    <article>
      <div className="shell pt-6">
        <Breadcrumbs
          items={[
            { href: "/", label: "Trang chủ" },
            { href: "/kien-thuc", label: "Kiến thức" },
            { label: article.title },
          ]}
        />
      </div>

      <header className="shell mt-6 max-w-prose">
        <p className="eyebrow flex items-center gap-1.5">
          <Icon aria-hidden size={14} strokeWidth={2} />
          {article.chuyenMuc}
        </p>
        <h1 className="mt-2 text-[2.25rem] leading-[1.08] sm:text-5xl">{article.title}</h1>
        <p className="mt-4 text-sm text-ink-soft">
          {article.author} · {formatArticleDate(article.publishedAt)} ·{" "}
          {article.readingMinutes} phút đọc
        </p>
      </header>

      <div className="shell mt-8">
        <div className="overflow-hidden rounded-card border border-line">
          <Artwork feature image={article.images[0]} className="aspect-[16/9] w-full" />
        </div>
      </div>

      <div className="shell mt-12 grid gap-12 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-16">
        <div className="prose-vn max-w-prose">
          {article.content.map((block, i) => {
            if (block.type === "heading") {
              return (
                <h2 key={i} className="mt-10 text-2xl first:mt-0">
                  {block.text}
                </h2>
              );
            }
            if (block.type === "list") {
              return (
                <ul key={i} className="mt-3 list-disc space-y-2 pl-5">
                  {block.items.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              );
            }
            return <p key={i}>{block.text}</p>;
          })}

          {isLoaiHinh && (
            <div className="mt-10 rounded-card border border-line bg-card p-6">
              <p className="text-sm text-ink-soft">Muốn trải nghiệm trực tiếp?</p>
              <Link
                href={`/luu-tru?lh=${encodeURIComponent(article.chuyenMuc)}`}
                className="mt-2 inline-flex items-center gap-1 font-semibold text-turmeric"
              >
                Xem lưu trú theo {article.chuyenMuc} →
              </Link>
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-card border border-line p-6">
            <h2 className="text-xl">Cần tư vấn thêm?</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Để lại thông tin, chúng tôi gọi lại trong 24 giờ.
            </p>
            <div className="mt-4">
              <ContactForm
                compact
                source={`Bài viết: ${article.title}`}
                defaultLoaiHinh={isLoaiHinh ? article.chuyenMuc : undefined}
              />
            </div>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="shell mt-16 border-t border-line pt-12">
          <h2 className="text-2xl">Bài viết liên quan</h2>
          <ul className="mt-6 grid gap-5 sm:grid-cols-3">
            {related.map((r) => (
              <li key={r.id}>
                <ArticleCard article={r} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </article>
  );
}
