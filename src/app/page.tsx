import type { Metadata } from "next";
import { ArrowRight, PhoneCall } from "lucide-react";
import Link from "next/link";

import { ArticleCard } from "@/components/ArticleCard";
import { Artwork } from "@/components/Artwork";
import { NganhTags } from "@/components/NganhTag";
import { Media } from "@/components/Media";
import { MucBadge } from "@/components/MucBadge";
import {
  countByNganh,
  getExperiences,
  getPrograms,
  getProperties,
  latestBaiViet,
} from "@/lib/data";
import { formatDuration, formatPrice } from "@/lib/format";
import {
  DURATION_ICON,
  EXPERIENCE_ICON,
  NGANH_ICON,
  PROGRAM_ICON,
  STAY_ICON,
} from "@/lib/icons";
import { SITE_DESCRIPTION } from "@/lib/site";
import { MUC_META, NGANH, PROPERTY_TYPE_LABEL, type Muc } from "@/lib/types";

export const metadata: Metadata = {
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [properties, programs, experiences, nganhCounts, latestArticles] = await Promise.all([
    getProperties(),
    getPrograms(),
    getExperiences(),
    Promise.all(NGANH.map((ng) => countByNganh(ng))),
    latestBaiViet(3),
  ]);
  const featuredProperty = properties[0];
  const featuredProgram = programs[0];

  const TABS = [
    {
      href: "/luu-tru",
      label: "Lưu trú",
      icon: STAY_ICON,
      count: properties.length,
      blurb:
        "Home, villa, resort và retreat đối tác đã qua bộ 100 tiêu chí — chọn nơi ở trước, mọi thứ khác xếp quanh nó.",
    },
    {
      href: "/chuong-trinh",
      label: "Chương trình",
      icon: PROGRAM_ICON,
      count: programs.length,
      blurb:
        "Combo hành trình nhiều ngày: lưu trú, ăn uống theo thể trạng, trị liệu và người đồng hành đã gộp thành một gói.",
    },
    {
      href: "/trai-nghiem",
      label: "Trải nghiệm",
      icon: EXPERIENCE_ICON,
      count: experiences.length,
      blurb:
        "Vé lẻ theo buổi: bấm huyệt, spa, coaching, forest bathing — thêm vào kỳ nghỉ bạn đã có.",
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="shell grid gap-10 pt-10 pb-14 sm:pt-14 sm:pb-20 lg:grid-cols-[1.05fr_minmax(0,1fr)] lg:items-center lg:gap-16">
          <div>
            <p className="eyebrow">
              Y học phương đông · Nghỉ dưỡng tiêu chuẩn
            </p>
            <h1 className="mt-3 text-[2.5rem] leading-[1.06] sm:text-6xl">
              Nghỉ dưỡng để khoẻ lên,
              <br />
              <span className="text-turmeric">không chỉ để đổi chỗ ngủ.</span>
            </h1>
            <p className="mt-5 max-w-prose text-lg text-ink-soft">
              Wellnessvietnams tuyển chọn home, villa, resort và retreat khắp Việt Nam
              theo một bộ 100 tiêu chí, kết hợp gốc y học phương đông và chất
              liệu bản địa từng vùng miền với tiêu chuẩn nghỉ dưỡng thông
              thường — rồi xếp mọi thứ có ở đó vào ba mức rõ ràng, từ tiện
              nghi tự dùng đến liệu trình do chuyên gia có chứng chỉ hành
              nghề thực hiện. Bạn biết mình đang mua gì trước khi đi.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/lien-he" className="btn btn-primary">
                <PhoneCall aria-hidden size={15} strokeWidth={2} />
                Nhận tư vấn miễn phí
              </Link>
              <Link href="/luu-tru" className="btn btn-ghost">
                <STAY_ICON aria-hidden size={15} strokeWidth={2} />
                Xem nơi lưu trú
              </Link>
            </div>

            <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-line pt-6 text-sm">
              {[
                ["3", "vùng miền"],
                ["100", "tiêu chí tuyển chọn"],
                ["3", "mức dịch vụ"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="font-display text-2xl text-ink sm:text-3xl">
                    {value}
                  </dt>
                  <dd className="text-ink-soft">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {featuredProperty && (
            <div className="relative">
              <div className="overflow-hidden rounded-card border border-line shadow-lift">
                <Media
                  feature
                  image={featuredProperty.images[0]}
                  className="aspect-[4/5] w-full"
                />
              </div>
              <div className="mt-4 rounded-card border border-line bg-card p-4 sm:absolute sm:-bottom-6 sm:-left-6 sm:mt-0 sm:max-w-[16rem] sm:shadow-lift">
                <MucBadge muc={featuredProperty.mucCaoNhat} size="sm" />
                <p className="mt-2 font-display text-lg">{featuredProperty.name}</p>
                <p className="text-sm text-ink-soft">
                  {PROPERTY_TYPE_LABEL[featuredProperty.type]} ·{" "}
                  {featuredProperty.region}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3 tab */}
      <section className="shell py-16 sm:py-20">
        <p className="eyebrow">Ba cách để bắt đầu</p>
        <h2 className="mt-2 text-3xl sm:text-4xl">
          Chọn theo nơi ở, theo hành trình, hay theo từng buổi
        </h2>
        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="group flex flex-col rounded-card border border-line bg-card p-6 transition hover:-translate-y-0.5 hover:shadow-lift"
            >
              <div className="flex items-start justify-between">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-bg text-turmeric">
                  <tab.icon aria-hidden size={19} strokeWidth={1.75} />
                </span>
                <span className="text-sm text-ink-soft">{tab.count} mục</span>
              </div>
              <h3 className="mt-4 text-2xl">{tab.label}</h3>
              <p className="mt-2 flex-1 text-sm text-ink-soft">{tab.blurb}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-turmeric">
                Xem tất cả
                <ArrowRight
                  aria-hidden
                  size={15}
                  strokeWidth={2}
                  className="transition group-hover:translate-x-1"
                />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Hệ Mức */}
      <section className="border-y border-line bg-card py-16 sm:py-20">
        <div className="shell">
          <p className="eyebrow">Hệ Mức</p>
          <h2 className="mt-2 max-w-[28ch] text-3xl sm:text-4xl">
            Một thang ba mức, dùng chung cho mọi nội dung trên trang
          </h2>
          <p className="mt-4 max-w-prose text-ink-soft">
            Cùng một chữ &ldquo;wellness&rdquo; có thể là một bồn ngâm trong
            phòng, cũng có thể là một liệu trình y tế. Chúng tôi tách rõ ba mức
            để bạn không phải đoán.
          </p>
          <ol className="mt-9 grid gap-5 md:grid-cols-3">
            {([1, 2, 3] as Muc[]).map((m) => (
              <li
                key={m}
                className={`rounded-card border bg-bg p-6 ${
                  m === 3 ? "border-turmeric" : "border-line"
                }`}
              >
                <MucBadge muc={m} />
                <p className="mt-4 text-sm text-ink-soft">
                  {MUC_META[m].description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Ngành */}
      <section className="shell py-16 sm:py-20">
        <p className="eyebrow">Bảy ngành</p>
        <h2 className="mt-2 text-3xl sm:text-4xl">Bạn đang cần điều gì?</h2>
        <ul className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {NGANH.map((ng, i) => {
            const Icon = NGANH_ICON[ng];
            return (
              <li key={ng}>
                <Link
                  href={`/luu-tru?nganh=${encodeURIComponent(ng)}`}
                  className="flex items-center gap-3 rounded-card border border-line px-5 py-4 transition hover:border-ink-soft hover:bg-card"
                >
                  <Icon aria-hidden size={18} strokeWidth={1.75} className="shrink-0 text-turmeric" />
                  <span className="flex-1 font-medium">{ng}</span>
                  <span className="text-sm text-ink-soft">
                    {nganhCounts[i]} mục
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Nổi bật */}
      {featuredProgram && (
      <section className="shell pb-4">
        <div className="grid gap-5 lg:grid-cols-2">
          <Link
            href={`/chuong-trinh/${featuredProgram.slug}`}
            className="group overflow-hidden rounded-card border border-line bg-card transition hover:shadow-lift"
          >
            <Artwork
              image={featuredProgram.images[0]}
              className="aspect-[16/9] w-full transition duration-500 group-hover:scale-[1.02]"
            />
            <div className="p-6">
              <p className="eyebrow flex items-center gap-1.5">
                <PROGRAM_ICON aria-hidden size={13} strokeWidth={2} />
                Chương trình · {featuredProgram.durationLabel}
              </p>
              <h3 className="mt-2 text-2xl">{featuredProgram.name}</h3>
              <p className="mt-2 text-sm text-ink-soft">
                {featuredProgram.summary}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <MucBadge muc={featuredProgram.muc} size="sm" />
                <span className="font-display text-lg">
                  {formatPrice(featuredProgram.price, featuredProgram.priceUnit)}
                </span>
              </div>
            </div>
          </Link>

          <div className="rounded-card border border-line p-6 sm:p-8">
            <p className="eyebrow flex items-center gap-1.5">
              <EXPERIENCE_ICON aria-hidden size={13} strokeWidth={2} />
              Trải nghiệm lẻ
            </p>
            <h3 className="mt-2 text-2xl">Thêm một buổi vào kỳ nghỉ</h3>
            <ul className="mt-5 divide-y divide-[color:var(--line)]">
              {experiences.slice(0, 4).map((e) => (
                <li key={e.id} className="py-3.5">
                  <Link
                    href={`/trai-nghiem/${e.slug}`}
                    className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 hover:text-turmeric"
                  >
                    <span className="font-medium">{e.name}</span>
                    <span className="inline-flex items-center gap-1 text-sm text-ink-soft">
                      <DURATION_ICON aria-hidden size={12} strokeWidth={2} />
                      {formatDuration(e.durationMinutes)} ·{" "}
                      {formatPrice(e.price)}
                    </span>
                  </Link>
                  <NganhTags values={[e.nganh]} className="mt-2" />
                </li>
              ))}
            </ul>
            <Link
              href="/trai-nghiem"
              className="group mt-5 inline-flex items-center gap-1 text-sm font-semibold text-turmeric"
            >
              Xem tất cả vé trải nghiệm
              <ArrowRight
                aria-hidden
                size={15}
                strokeWidth={2}
                className="transition group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </section>
      )}

      {/* Kiến thức */}
      {latestArticles.length > 0 && (
        <section className="shell py-16 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Kiến thức</p>
              <h2 className="mt-2 text-3xl sm:text-4xl">Đọc trước khi đặt chỗ</h2>
            </div>
            <Link
              href="/kien-thuc"
              className="group inline-flex items-center gap-1 text-sm font-semibold text-turmeric"
            >
              Xem tất cả bài viết
              <ArrowRight
                aria-hidden
                size={15}
                strokeWidth={2}
                className="transition group-hover:translate-x-1"
              />
            </Link>
          </div>
          <ul className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {latestArticles.map((article) => (
              <li key={article.id}>
                <ArticleCard article={article} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
