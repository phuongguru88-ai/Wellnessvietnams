import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Sparkles } from "lucide-react";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContactForm } from "@/components/ContactForm";
import { ImageGrid } from "@/components/ImageGrid";
import { LoaiHinhTags } from "@/components/LoaiHinhTag";
import { MucBadge } from "@/components/MucBadge";
import { NganhTags } from "@/components/NganhTag";
import {
  experiencesAtProperty,
  getExperience,
  getPropertyById,
} from "@/lib/data";
import { formatDuration, formatPrice } from "@/lib/format";
import { DURATION_ICON } from "@/lib/icons";
import { SITE_URL } from "@/lib/site";
import { MUC_META, PROPERTY_TYPE_LABEL } from "@/lib/types";

// Nội dung do đối tác chỉnh sửa qua /quan-tri — không prerender tĩnh.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const experience = await getExperience(slug);
  if (!experience) return {};

  const property = await getPropertyById(experience.propertyRef);
  const title = `${experience.name} ${formatDuration(experience.durationMinutes)}${
    property ? ` tại ${property.region}` : ""
  }`;
  const description = `${experience.name} · ${experience.loaiHinh} · ${
    MUC_META[experience.muc].label
  } · ${formatPrice(experience.price)}. ${experience.description.slice(0, 110)}…`;

  return {
    title,
    description,
    alternates: { canonical: `/trai-nghiem/${experience.slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/trai-nghiem/${experience.slug}`,
    },
  };
}

export default async function ExperienceDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const experience = await getExperience(slug);
  if (!experience) notFound();

  const property = await getPropertyById(experience.propertyRef);
  const siblings = property
    ? (await experiencesAtProperty(property.id)).filter((e) => e.id !== experience.id)
    : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: experience.name,
    serviceType: experience.loaiHinh,
    description: experience.description,
    url: `${SITE_URL}/trai-nghiem/${experience.slug}`,
    areaServed: property?.region,
    offers: {
      "@type": "Offer",
      price: experience.price,
      priceCurrency: "VND",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <article>
      <div className="shell pt-6">
        <Breadcrumbs
          items={[
            { href: "/", label: "Trang chủ" },
            { href: "/trai-nghiem", label: "Trải nghiệm" },
            { label: experience.name },
          ]}
        />
      </div>

      <header className="shell pt-4">
        <p className="eyebrow flex items-center gap-1.5">
          <DURATION_ICON aria-hidden size={14} strokeWidth={2} />
          {formatDuration(experience.durationMinutes)}
          {property ? ` · ${property.name}, ${property.region}` : ""}
        </p>
        <h1 className="mt-2 text-[2.25rem] leading-[1.08] sm:text-5xl">
          {experience.name}
        </h1>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <MucBadge muc={experience.muc} />
          <NganhTags values={[experience.nganh]} />
          <LoaiHinhTags values={[experience.loaiHinh]} />
        </div>
        {experience.coYeuToVanHoaVungMien && (
          <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-moss">
            <Sparkles aria-hidden size={13} strokeWidth={2} />
            Có yếu tố văn hoá vùng miền — chữa lành từ tri thức bản địa
          </p>
        )}
      </header>

      <div className="shell mt-8">
        <ImageGrid images={experience.images} />
      </div>

      <div className="shell mt-12 grid gap-12 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-16">
        <div>
          <section className="prose-vn">
            <h2 className="text-2xl">Buổi này diễn ra thế nào</h2>
            <p className="mt-3">{experience.description}</p>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl">Bạn nhận được gì</h2>
            <ul className="mt-4 space-y-3">
              {experience.benefits.map((b) => (
                <li key={b} className="flex gap-3 text-ink-soft">
                  <span aria-hidden className="mt-1 text-turmeric">
                    ✦
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10 rounded-card border border-line bg-card p-6">
            <h2 className="text-xl">{MUC_META[experience.muc].label}</h2>
            <p className="mt-2 text-sm text-ink-soft">
              {MUC_META[experience.muc].description}
            </p>
          </section>

          {property && (
            <section className="mt-12">
              <h2 className="text-2xl">Nơi tổ chức</h2>
              <Link
                href={`/luu-tru/${property.slug}`}
                className="group mt-4 flex flex-col gap-1 rounded-card border border-line p-6 transition hover:border-ink-soft hover:bg-card"
              >
                <p className="eyebrow">
                  {PROPERTY_TYPE_LABEL[property.type]} · {property.region}
                </p>
                <p className="font-display text-xl group-hover:text-turmeric">
                  {property.name}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-ink-soft">
                  {property.description}
                </p>
              </Link>
            </section>
          )}

          {siblings.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl">Buổi khác tại cùng nơi</h2>
              <ul className="mt-4 divide-y divide-[color:var(--line)]">
                {siblings.map((e) => (
                  <li key={e.id} className="py-4">
                    <Link
                      href={`/trai-nghiem/${e.slug}`}
                      className="group flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1"
                    >
                      <span className="font-medium group-hover:text-turmeric">
                        {e.name}
                      </span>
                      <span className="text-sm text-ink-soft">
                        {formatDuration(e.durationMinutes)} ·{" "}
                        {formatPrice(e.price)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-card border border-line bg-card p-6">
            <p className="eyebrow">Giá vé</p>
            <p className="mt-2 font-display text-3xl">
              {formatPrice(experience.price)}
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              Cho một khách, một buổi {formatDuration(experience.durationMinutes)}.
              Đặt trước tối thiểu 24 giờ.
            </p>
          </div>

          <div className="mt-5 rounded-card border border-line p-6">
            <h2 className="text-xl">Đặt buổi này</h2>
            <div className="mt-4">
              <ContactForm
                compact
                source={`Trải nghiệm: ${experience.name}`}
                defaultLoaiHinh={experience.loaiHinh}
              />
            </div>
          </div>
        </aside>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </article>
  );
}
