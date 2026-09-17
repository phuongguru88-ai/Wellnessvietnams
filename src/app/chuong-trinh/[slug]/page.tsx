import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CheckCircle2, ShieldAlert, Sparkles, Users, XCircle } from "lucide-react";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContactForm } from "@/components/ContactForm";
import { LoaiHinhTags } from "@/components/LoaiHinhTag";
import { Media } from "@/components/Media";
import { MucBadge } from "@/components/MucBadge";
import { NganhTags } from "@/components/NganhTag";
import { ProgramSectionNav } from "@/components/ProgramSectionNav";
import { StickyMobileBookingBar } from "@/components/StickyMobileBookingBar";
import { getProgram, getPropertyById } from "@/lib/data";
import { formatPrice, formatVnd } from "@/lib/format";
import { PROGRAM_ICON } from "@/lib/icons";
import { SITE_URL } from "@/lib/site";
import { MUC_META, PROPERTY_TYPE_LABEL } from "@/lib/types";

// Nội dung do đối tác chỉnh sửa qua /quan-tri — không prerender tĩnh.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const program = await getProgram(slug);
  if (!program) return {};

  const property = await getPropertyById(program.propertyRef);
  const title = `${program.name} ${program.durationLabel}${property ? ` tại ${property.region}` : ""}`;
  const description = `${program.name} (${program.durationLabel}) · ${
    MUC_META[program.muc].label
  } · ${formatPrice(program.price, program.priceUnit)}. ${program.summary.slice(0, 110)}…`;

  return {
    title,
    description,
    alternates: { canonical: `/chuong-trinh/${program.slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/chuong-trinh/${program.slug}`,
    },
  };
}

export default async function ProgramDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const program = await getProgram(slug);
  if (!program) notFound();

  const property = await getPropertyById(program.propertyRef);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: program.name,
    description: program.summary,
    url: `${SITE_URL}/chuong-trinh/${program.slug}`,
    offers: {
      "@type": "Offer",
      price: program.price,
      priceCurrency: "VND",
      availability: "https://schema.org/InStock",
    },
    itinerary: program.itinerary.map((day) => ({
      "@type": "ItemList",
      name: `${day.day} — ${day.title}`,
      itemListElement: day.items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item,
      })),
    })),
  };

  const [leadImage, ...extraImages] = program.images;

  const sections = [
    { id: "tong-quan", label: "Tổng quan" },
    { id: "phu-hop", label: "Dành cho ai" },
    { id: "lich-trinh", label: "Lịch trình" },
    { id: "bao-gom", label: "Bao gồm" },
    { id: "doi-ngu", label: "Đội ngũ" },
    ...(program.giangVien && program.giangVien.length > 0
      ? [{ id: "giang-vien", label: "Giảng viên" }]
      : []),
    ...(program.yeuCauTruocKhi.length > 0 ? [{ id: "chuan-bi", label: "Cần chuẩn bị" }] : []),
    ...(property ? [{ id: "dia-diem", label: "Địa điểm" }] : []),
  ];

  return (
    <article className="pb-24 lg:pb-0">
      <div className="shell pt-6">
        <Breadcrumbs
          items={[
            { href: "/", label: "Trang chủ" },
            { href: "/chuong-trinh", label: "Chương trình" },
            { label: program.name },
          ]}
        />
      </div>

      <header className="shell pt-4">
        {/* Hero hai cột: giới thiệu bên trái, ảnh lớn bên phải — đồng bộ với hero của trang Lưu trú. */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center lg:gap-14">
          <div>
            <p className="eyebrow flex items-center gap-1.5">
              <PROGRAM_ICON aria-hidden size={14} strokeWidth={2} />
              {program.durationLabel}
              {property ? ` · ${property.name}, ${property.region}` : ""}
            </p>
            <h1 className="mt-2 text-[2.25rem] leading-[1.05] sm:text-5xl">{program.name}</h1>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <MucBadge muc={program.muc} />
              <NganhTags values={program.nganh} />
              <LoaiHinhTags values={program.loaiHinh} />
              {program.trangThai !== "Đang mở bán" && (
                <span className="rounded-full border border-line px-2.5 py-1 text-[11px] font-medium text-ink-soft">
                  {program.trangThai}
                </span>
              )}
            </div>
            {program.coYeuToVanHoaVungMien && (
              <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-moss">
                <Sparkles aria-hidden size={13} strokeWidth={2} />
                Có yếu tố văn hoá vùng miền — chữa lành từ tri thức bản địa
              </p>
            )}
            <p className="mt-5 max-w-prose text-[15px] leading-relaxed text-ink-soft">
              {program.summary}
            </p>
            {program.mucTieu.length > 0 && (
              <p className="mt-3 text-sm text-ink-soft">Mục tiêu: {program.mucTieu.join(" · ")}</p>
            )}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a href="#dat-cho" className="btn btn-primary">
                Giữ chỗ ngay
              </a>
              <a href="#lich-trinh" className="btn btn-ghost">
                Xem lịch trình
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-card border border-line">
            <Media feature image={leadImage} className="aspect-[4/3] w-full" />
          </div>
        </div>

        {extraImages.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {extraImages.slice(0, 4).map((img) => (
              <div key={img.seed} className="overflow-hidden rounded-card border border-line">
                <Media interactive={false} image={img} className="aspect-[4/3] w-full" />
              </div>
            ))}
          </div>
        )}
      </header>

      <ProgramSectionNav sections={sections} />

      <div className="shell mt-10 grid gap-12 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-16">
        <div>
          <section id="tong-quan" className="prose-vn scroll-mt-28">
            <h2 className="text-2xl">Tổng quan</h2>
            <p className="mt-3">{program.description}</p>
          </section>

          <section id="phu-hop" className="mt-10 scroll-mt-28">
            <h2 className="text-2xl">Chương trình này dành cho ai</h2>
            <div className="mt-4 grid overflow-hidden rounded-card border border-line bg-card sm:grid-cols-2 sm:divide-x sm:divide-[color:var(--line)]">
              <div className="p-5">
                <h3 className="eyebrow text-moss">Phù hợp với</h3>
                <ul className="mt-3 space-y-2.5">
                  {program.doiTuongPhuHop.map((d) => (
                    <li key={d} className="flex items-start gap-2 text-sm text-ink-soft">
                      <CheckCircle2 aria-hidden size={15} strokeWidth={2} className="mt-0.5 shrink-0 text-moss" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {program.doiTuongKhongPhuHop.length > 0 && (
                <div className="border-t border-line p-5 sm:border-t-0">
                  <h3 className="eyebrow text-turmeric">Không phù hợp với</h3>
                  <ul className="mt-3 space-y-2.5">
                    {program.doiTuongKhongPhuHop.map((d) => (
                      <li key={d} className="flex items-start gap-2 text-sm text-ink-soft">
                        <XCircle aria-hidden size={15} strokeWidth={2} className="mt-0.5 shrink-0 text-turmeric" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>

          <section id="lich-trinh" className="mt-12 scroll-mt-28">
            <h2 className="text-2xl">Lịch trình</h2>
            <ol className="mt-6 space-y-8">
              {program.itinerary.map((day) => (
                <li key={day.day} className="relative border-l border-line pl-6">
                  <span
                    aria-hidden
                    className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-turmeric"
                  />
                  <p className="eyebrow">{day.day}</p>
                  <h3 className="mt-1 text-xl">{day.title}</h3>
                  <ul className="mt-3 space-y-2">
                    {day.items.map((item) => (
                      <li key={item} className="text-sm text-ink-soft">
                        {item}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </section>

          <section id="bao-gom" className="mt-12 scroll-mt-28">
            <h2 className="text-2xl">Đã bao gồm & không bao gồm</h2>
            <div className="mt-4 grid overflow-hidden rounded-card border border-line bg-card sm:grid-cols-2 sm:divide-x sm:divide-[color:var(--line)]">
              <div className="p-5">
                <h3 className="eyebrow text-moss">Đã bao gồm</h3>
                <ul className="mt-3 space-y-2.5">
                  {program.baoGom.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-ink-soft">
                      <CheckCircle2 aria-hidden size={15} strokeWidth={2} className="mt-0.5 shrink-0 text-moss" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {program.khongBaoGom.length > 0 && (
                <div className="border-t border-line p-5 sm:border-t-0">
                  <h3 className="eyebrow text-ink-soft">Không bao gồm</h3>
                  <ul className="mt-3 space-y-2.5">
                    {program.khongBaoGom.map((k) => (
                      <li key={k} className="flex items-start gap-2 text-sm text-ink-soft">
                        <XCircle aria-hidden size={15} strokeWidth={2} className="mt-0.5 shrink-0 text-ink-soft" />
                        <span>{k}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>

          <section id="doi-ngu" className="mt-12 scroll-mt-28 rounded-card border border-line bg-card p-6">
            <h2 className="text-xl">Đội ngũ phụ trách & vận hành</h2>
            <p className="mt-2 flex items-start gap-2 text-sm text-ink-soft">
              <ShieldAlert aria-hidden size={15} strokeWidth={2} className="mt-0.5 shrink-0 text-turmeric" />
              <span>{program.chuyenMonDoiNgu}</span>
            </p>
            {program.quyMoNhom && (
              <p className="mt-2 flex items-center gap-2 text-sm text-ink-soft">
                <Users aria-hidden size={15} strokeWidth={2} className="shrink-0 text-turmeric" />
                Quy mô nhóm: {program.quyMoNhom.min}–{program.quyMoNhom.max} khách mỗi lượt
              </p>
            )}
            <p className="mt-3 border-t border-line pt-3 text-sm text-ink-soft">{program.gioiHanCamKet}</p>
          </section>

          {program.giangVien && program.giangVien.length > 0 && (
            <section id="giang-vien" className="mt-12 scroll-mt-28">
              <h2 className="text-2xl">Giảng viên/người hướng dẫn</h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {program.giangVien.map((gv) => (
                  <div key={gv.name} className="flex gap-4 rounded-card border border-line bg-card p-5">
                    <Media
                      image={gv.images[0]}
                      interactive={false}
                      className="h-20 w-20 shrink-0 rounded-full"
                    />
                    <div>
                      <p className="font-display text-lg leading-tight">{gv.name}</p>
                      <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-turmeric">
                        {gv.vaiTro}
                      </p>
                      <p className="mt-2 whitespace-pre-line text-sm text-ink-soft">{gv.moTa}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {program.yeuCauTruocKhi.length > 0 && (
            <section id="chuan-bi" className="mt-12 scroll-mt-28">
              <h2 className="text-2xl">Cần chuẩn bị trước</h2>
              <ul className="mt-4 space-y-2.5">
                {program.yeuCauTruocKhi.map((y) => (
                  <li key={y} className="flex items-start gap-2 text-sm text-ink-soft">
                    <span aria-hidden className="mt-1 shrink-0 text-turmeric">✦</span>
                    <span>{y}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-12 rounded-card border border-line bg-card p-6">
            <h2 className="text-xl">
              {MUC_META[program.muc].label.replace(" – ", " — ")}
            </h2>
            <p className="mt-2 text-sm text-ink-soft">
              {MUC_META[program.muc].description}
            </p>
          </section>

          {property && (
            <section id="dia-diem" className="mt-12 scroll-mt-28">
              <h2 className="text-2xl">Diễn ra tại</h2>
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
        </div>

        <aside id="dat-cho" className="scroll-mt-28 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-card border border-line bg-card p-6 shadow-soft">
            <p className="eyebrow">Giá chương trình</p>
            <p className="mt-2 font-display text-3xl">
              {formatPrice(program.price, program.priceUnit)}
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              Đã gồm lưu trú, các bữa ăn và toàn bộ buổi trị liệu trong lịch
              trình. Chưa gồm di chuyển tới nơi.
            </p>

            {program.giaTheoLoai && program.giaTheoLoai.length > 0 && (
              <ul className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
                {program.giaTheoLoai.map((g) => (
                  <li key={g.loai} className="flex items-center justify-between gap-3">
                    <span className="text-ink-soft">{g.loai}</span>
                    <span className="font-medium text-ink">{formatVnd(g.gia)}</span>
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-4 border-t border-line pt-4 text-xs text-ink-soft">
              {program.chinhSachHuy}
            </p>
          </div>

          <div className="mt-5 rounded-card border border-line p-6">
            <h2 className="text-xl">
              {program.trangThai === "Tạm ngừng" ? "Đăng ký danh sách chờ" : "Giữ chỗ chương trình này"}
            </h2>
            {program.trangThai === "Tạm ngừng" && (
              <p className="mt-2 text-sm text-ink-soft">
                Chương trình đang tạm ngừng nhận khách mới. Để lại thông tin, chúng tôi báo khi mở lại.
              </p>
            )}
            <div className="mt-4">
              <ContactForm
                compact
                source={`Chương trình: ${program.name}`}
                defaultLoaiHinh={program.loaiHinh[0]}
              />
            </div>
          </div>
        </aside>
      </div>

      <StickyMobileBookingBar
        priceLabel={formatPrice(program.price, program.priceUnit)}
        targetId="dat-cho"
        ctaLabel={program.trangThai === "Tạm ngừng" ? "Đăng ký chờ" : "Giữ chỗ"}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </article>
  );
}
