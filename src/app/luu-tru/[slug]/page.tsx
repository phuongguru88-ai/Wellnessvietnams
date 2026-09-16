import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BedDouble, CheckCircle2, Landmark, MapPin, PhoneCall, Sparkles, Users } from "lucide-react";

import { BookingTriggerButton } from "@/components/BookingTriggerButton";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Media } from "@/components/Media";
import { LoaiHinhTags } from "@/components/LoaiHinhTag";
import { MucBadge } from "@/components/MucBadge";
import { NganhTags } from "@/components/NganhTag";
import { PropertyBookingProvider } from "@/components/PropertyBookingProvider";
import {
  experiencesAtProperty,
  getProperty,
  programsAtProperty,
} from "@/lib/data";
import { formatDuration, formatPrice } from "@/lib/format";
import { EXPERIENCE_ICON, PROGRAM_ICON, PROPERTY_TYPE_ICON } from "@/lib/icons";
import { CONTACT, SITE_URL } from "@/lib/site";
import { MUC_META, PROPERTY_TYPE_LABEL } from "@/lib/types";

// Nội dung do đối tác chỉnh sửa qua /quan-tri — không prerender tĩnh, luôn
// đọc dữ liệu mới nhất mỗi request (xem ghi chú ở lib/store.ts).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = await getProperty(slug);
  if (!property) return {};

  const title = `${property.name} — ${PROPERTY_TYPE_LABEL[property.type]} wellness tại ${property.region}`;
  const description = `${property.name}: ${property.loaiHinh.join(", ")} · ${
    MUC_META[property.mucCaoNhat].label
  } · từ ${formatPrice(property.giaThamKhao, property.giaUnit)}. ${property.description.slice(0, 110)}…`;

  return {
    title,
    description,
    alternates: { canonical: `/luu-tru/${property.slug}` },
    openGraph: { title, description, url: `${SITE_URL}/luu-tru/${property.slug}` },
  };
}

export default async function PropertyDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await getProperty(slug);
  if (!property) notFound();

  const TypeIcon = PROPERTY_TYPE_ICON[property.type];

  const [relatedPrograms, relatedExperiences] = await Promise.all([
    programsAtProperty(property.id),
    experiencesAtProperty(property.id),
  ]);

  const hasRooms = property.roomTypes.length > 0;
  const hasAmenities = property.tienIch.length > 0 || property.diemDenLanCan.length > 0;
  // Chỉ hiển thị thông tin — chưa có luồng thanh toán/QR thật (xem field
  // Property.thanhToan ở lib/types.ts). Tiền đi thẳng vào tài khoản của
  // property, không qua nền tảng.
  const hasPayment = Boolean(
    property.thanhToan?.vietQrBankAccount || property.thanhToan?.momoMerchantId,
  );
  const roomsAvailable = property.roomTypes.reduce((sum, r) => sum + (r.soLuong ?? 0), 0);

  // Dải số liệu nhanh ngay dưới tiêu đề — chỉ hiện các mục có dữ liệu thật.
  const quickStats = [
    { label: "Giá từ", value: formatPrice(property.giaThamKhao, property.giaUnit) },
    hasRooms
      ? {
          label: "Hạng phòng",
          value:
            property.roomTypes.length === 1
              ? "1 hạng phòng"
              : `${property.roomTypes.length} hạng phòng` +
                (roomsAvailable > 0 ? ` · còn ${roomsAvailable} phòng` : ""),
        }
      : null,
    { label: "Mức dịch vụ", value: MUC_META[property.mucCaoNhat].short },
    { label: "Trạng thái", value: property.trangThai },
  ].filter((s): s is { label: string; value: string } => s !== null);

  // Thanh điều hướng nhanh trong trang — chỉ liệt kê mục thực sự tồn tại bên dưới.
  const sectionNav = [
    { id: "tong-quan", label: "Tổng quan" },
    hasRooms ? { id: "hang-phong", label: "Hạng phòng" } : null,
    hasAmenities ? { id: "tien-ich", label: "Tiện ích & vị trí" } : null,
    relatedPrograms.length > 0 ? { id: "chuong-trinh", label: "Chương trình" } : null,
    relatedExperiences.length > 0 ? { id: "trai-nghiem", label: "Trải nghiệm" } : null,
    { id: "faq", label: "Câu hỏi thường gặp" },
  ].filter((s): s is { id: string; label: string } => s !== null);

  // Chỉ dùng thông tin đã đúng thật ở nơi khác trên trang (giữ chỗ không
  // trả trước, tư vấn viên gọi xác nhận, ba mức dịch vụ) — không bịa thêm
  // chính sách hoàn/huỷ cụ thể mà site chưa công bố ở đâu khác.
  const faqItems = [
    {
      q: "Đặt phòng có cần thanh toán trước không?",
      a: "Không. Đây là yêu cầu giữ chỗ tạm, chưa thu bất kỳ khoản nào — tư vấn viên gọi xác nhận phòng còn trống trong 24 giờ sau khi bạn gửi yêu cầu.",
    },
    {
      q: "Mức dịch vụ 1, 2, 3 khác nhau thế nào?",
      a: "Ba mức thể hiện độ đầy đủ của tiện nghi và dịch vụ đi kèm tại nơi ở, không phải xếp hạng sao.",
    },
    {
      q: `Cần tư vấn trước khi giữ chỗ tại ${property.name} thì gọi đâu?`,
      a: `Gọi trực tiếp hotline ${CONTACT.phone} — đội ngũ tư vấn hỗ trợ chọn hạng phòng phù hợp trước khi bạn giữ chỗ.`,
    },
    {
      q: "Muốn đổi lịch hoặc huỷ yêu cầu giữ chỗ thì làm sao?",
      a: `Vì chưa thanh toán trước nên không phát sinh phí khi đổi ý ở bước giữ chỗ. Nếu yêu cầu đã được xác nhận và cần đổi lịch, gọi ${CONTACT.phone} để tư vấn viên sắp xếp trực tiếp.`,
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: property.name,
    description: property.description,
    address: {
      "@type": "PostalAddress",
      addressRegion: property.region,
      addressCountry: "VN",
    },
    url: `${SITE_URL}/luu-tru/${property.slug}`,
    priceRange: formatPrice(property.giaThamKhao, property.giaUnit),
    amenityFeature: property.tienIch.map((t) => ({
      "@type": "LocationFeatureSpecification",
      name: t,
      value: true,
    })),
  };

  return (
    <article className="pb-24 lg:pb-0">
      <PropertyBookingProvider property={property}>
        <div className="shell pt-6">
          <Breadcrumbs
            items={[
              { href: "/", label: "Trang chủ" },
              { href: "/luu-tru", label: "Lưu trú" },
              { label: property.name },
            ]}
          />
        </div>

        <header className="shell pt-4">
          {/* Hero hai cột: giới thiệu bên trái, ảnh lớn bên phải — bắt mắt hơn kiểu tiêu đề rồi ảnh xếp chồng phía dưới, vẫn dùng token/thành phần chung của site. */}
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center lg:gap-14">
            <div>
              <p className="eyebrow flex items-center gap-1.5">
                <TypeIcon aria-hidden size={14} strokeWidth={2} />
                {PROPERTY_TYPE_LABEL[property.type]} · {property.region}
              </p>
              <h1 className="mt-2 text-[2.25rem] leading-[1.05] sm:text-5xl">
                {property.name}
              </h1>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <MucBadge muc={property.mucCaoNhat} />
                <NganhTags values={property.nganh} />
                <LoaiHinhTags values={property.loaiHinh} />
              </div>
              {property.coYeuToVanHoaVungMien && (
                <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-moss">
                  <Sparkles aria-hidden size={13} strokeWidth={2} />
                  Có yếu tố văn hoá vùng miền — chữa lành từ tri thức bản địa
                </p>
              )}
              <p className="mt-5 max-w-prose text-[15px] leading-relaxed text-ink-soft">
                {property.description}
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <BookingTriggerButton className="btn btn-primary" label="Kiểm tra phòng trống" />
                {hasRooms && (
                  <a href="#hang-phong" className="btn btn-ghost">
                    Xem hạng phòng
                  </a>
                )}
              </div>
            </div>

            <div className="overflow-hidden rounded-card border border-line">
              <Media
                feature
                image={property.images[0]}
                className="aspect-[4/3] w-full lg:aspect-[5/4]"
              />
            </div>
          </div>

          {/* Dải số liệu nhanh — nằm sát ngay dưới hero bằng hai đường kẻ trên/dưới, chia cột bằng gạch dọc thay vì đóng khung riêng, cho cảm giác thoáng như một dải dữ liệu chứ không phải một khối thẻ. */}
          <dl className="mt-10 grid grid-cols-2 divide-y divide-[color:var(--line)] border-y border-line sm:grid-cols-4 sm:divide-y-0 sm:divide-x">
            {quickStats.map((s) => (
              <div key={s.label} className="py-4 pr-4 sm:px-5 sm:first:pl-0 sm:last:pr-0">
                <dt className="eyebrow text-[10px]">{s.label}</dt>
                <dd className="mt-1.5 truncate font-display text-2xl text-ink">{s.value}</dd>
              </div>
            ))}
          </dl>
        </header>

        {/* Dải ảnh phụ dưới hero — ảnh đầu đã dùng làm ảnh lớn ở trên nên chỉ hiện các ảnh còn lại. */}
        {property.images.length > 1 && (
          <div className="shell mt-8">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {property.images.slice(1, 5).map((img) => (
                <div
                  key={img.seed}
                  className="overflow-hidden rounded-card border border-line"
                >
                  <Media
                    interactive={false}
                    image={img}
                    className="aspect-square w-full"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Điều hướng nhanh trong trang — dính dưới header chính khi cuộn qua các mục. */}
        {sectionNav.length > 1 && (
          <nav
            aria-label="Điều hướng nhanh trong trang"
            className="sticky top-16 z-30 mt-8 border-y border-line bg-bg/90 backdrop-blur-sm"
          >
            <div className="shell flex gap-1 overflow-x-auto py-2">
              {sectionNav.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium text-ink-soft transition hover:bg-card hover:text-ink"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </nav>
        )}

        <div className="shell mt-12 grid gap-12 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <section id="tong-quan" className="scroll-mt-28 prose-vn">
              <h2 className="text-2xl">Về {property.name}</h2>
              <p className="mt-3">{property.description}</p>
            </section>

            <section className="mt-10">
              <h2 className="text-2xl">Điểm đáng đi</h2>
              <ul className="mt-4 grid gap-x-6 gap-y-3 rounded-card border border-line bg-card p-5 sm:grid-cols-2">
                {property.highlights.map((h) => (
                  <li key={h} className="flex gap-3 text-sm text-ink-soft">
                    <span aria-hidden className="mt-0.5 shrink-0 text-turmeric">
                      ✦
                    </span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </section>

            {hasRooms && (
              <section id="hang-phong" className="mt-10 scroll-mt-28">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="text-2xl">Hạng phòng</h2>
                  <p className="text-sm text-ink-soft">
                    {property.roomTypes.length} hạng phòng
                    {roomsAvailable > 0 && ` · còn ${roomsAvailable} phòng`}
                  </p>
                </div>
                <div className="mt-5 grid gap-6 sm:grid-cols-2">
                  {property.roomTypes.map((r) => (
                    <article
                      key={r.id}
                      className="flex flex-col overflow-hidden rounded-card border border-line bg-card shadow-soft transition hover:shadow-lift"
                    >
                      <div className="aspect-[3/2] overflow-hidden">
                        <Media
                          interactive={false}
                          image={r.images[0] ?? { seed: r.id, alt: r.name }}
                          className="h-full w-full"
                        />
                      </div>

                      <div className="flex flex-1 flex-col gap-3 p-5">
                        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft">
                            <span className="inline-flex items-center gap-1">
                              <Users aria-hidden size={12} strokeWidth={2} />
                              Tối đa {r.sucChua} khách
                            </span>
                            {r.dienTich && (
                              <span className="inline-flex items-center gap-1">
                                <BedDouble aria-hidden size={12} strokeWidth={2} />
                                {r.dienTich}
                              </span>
                            )}
                          </p>
                          {r.soLuong && (
                            <span className="whitespace-nowrap rounded-full bg-moss/15 px-2 py-0.5 text-[11px] font-medium text-moss">
                              Còn {r.soLuong} phòng
                            </span>
                          )}
                        </div>

                        <h3 className="font-display text-xl">{r.name}</h3>

                        {r.description && (
                          <p className="line-clamp-2 text-sm text-ink-soft">{r.description}</p>
                        )}

                        {r.tieuChuan.length > 0 && (
                          <ul className="grid gap-1.5 text-sm text-ink-soft">
                            {r.tieuChuan.slice(0, 3).map((t) => (
                              <li key={t} className="flex gap-2">
                                <span aria-hidden className="mt-1 shrink-0 text-turmeric">✦</span>
                                <span className="line-clamp-1">{t}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4">
                          <p className="whitespace-nowrap font-display text-xl text-turmeric">
                            {formatPrice(r.giaThamKhao, r.giaUnit)}
                          </p>
                          <BookingTriggerButton
                            roomTypeId={r.id}
                            label="Chọn phòng"
                            className="btn btn-primary"
                          />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {hasAmenities && (
              <section id="tien-ich" className="mt-10 scroll-mt-28">
                <h2 className="text-2xl">Tiện ích & vị trí</h2>
                <div className="mt-4 grid overflow-hidden rounded-card border border-line bg-card sm:grid-cols-2 sm:divide-x sm:divide-[color:var(--line)]">
                  {property.tienIch.length > 0 && (
                    <div className="p-5">
                      <h3 className="eyebrow text-turmeric">Tiện ích chung</h3>
                      <ul className="mt-3 space-y-2.5">
                        {property.tienIch.map((t) => (
                          <li key={t} className="flex items-start gap-2 text-sm text-ink-soft">
                            <CheckCircle2 aria-hidden size={15} strokeWidth={2} className="mt-0.5 shrink-0 text-moss" />
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {property.diemDenLanCan.length > 0 && (
                    <div className={`p-5 ${property.tienIch.length > 0 ? "border-t border-line sm:border-t-0" : ""}`}>
                      <h3 className="eyebrow text-turmeric">Điểm đến lân cận</h3>
                      <ul className="mt-3 space-y-2.5">
                        {property.diemDenLanCan.map((d) => (
                          <li key={d.ten} className="flex items-start justify-between gap-3 text-sm">
                            <span className="inline-flex items-start gap-2 text-ink-soft">
                              <MapPin aria-hidden size={15} strokeWidth={2} className="mt-0.5 shrink-0 text-turmeric" />
                              <span>{d.ten}</span>
                            </span>
                            <span className="whitespace-nowrap text-ink-soft">{d.khoangCach}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}

            <section className="mt-10 rounded-card border border-line bg-card p-6">
              <h2 className="text-xl">
                Mức dịch vụ cao nhất tại đây: {MUC_META[property.mucCaoNhat].short}
              </h2>
              <p className="mt-2 text-sm text-ink-soft">
                {MUC_META[property.mucCaoNhat].description}
              </p>
              <Link
                href="/ve-chung-toi#he-muc"
                className="mt-4 inline-block text-sm font-semibold text-turmeric"
              >
                Hiểu về ba mức dịch vụ →
              </Link>
            </section>

            {relatedPrograms.length > 0 && (
              <section id="chuong-trinh" className="mt-12 scroll-mt-28">
                <h2 className="text-2xl">Chương trình tại {property.name}</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {relatedPrograms.map((p) => (
                    <Link
                      key={p.id}
                      href={`/chuong-trinh/${p.slug}`}
                      className="group flex gap-4 rounded-card border border-line bg-card p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
                    >
                      <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl">
                        <Media
                          interactive={false}
                          image={p.images[0] ?? { seed: p.id, alt: p.name }}
                          className="h-full w-full"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="eyebrow flex items-center gap-1.5">
                          <PROGRAM_ICON aria-hidden size={12} strokeWidth={2} />
                          {p.durationLabel}
                        </p>
                        <p className="mt-1 truncate font-display text-lg group-hover:text-turmeric">
                          {p.name}
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <MucBadge muc={p.muc} size="sm" />
                          <span className="text-sm text-ink-soft">{formatPrice(p.price, p.priceUnit)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {relatedExperiences.length > 0 && (
              <section id="trai-nghiem" className="mt-12 scroll-mt-28">
                <h2 className="text-2xl">Trải nghiệm lẻ tại đây</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {relatedExperiences.map((e) => (
                    <Link
                      key={e.id}
                      href={`/trai-nghiem/${e.slug}`}
                      className="group flex gap-4 rounded-card border border-line bg-card p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
                    >
                      <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl">
                        <Media
                          interactive={false}
                          image={e.images[0] ?? { seed: e.id, alt: e.name }}
                          className="h-full w-full"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="eyebrow flex items-center gap-1.5">
                          <EXPERIENCE_ICON aria-hidden size={12} strokeWidth={2} />
                          {formatDuration(e.durationMinutes)}
                        </p>
                        <p className="mt-1 truncate font-display text-lg group-hover:text-turmeric">
                          {e.name}
                        </p>
                        <p className="mt-1.5 text-sm text-ink-soft">{formatPrice(e.price)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Cột phải: giá + đặt phòng — chỉ hiện trên desktop, mobile dùng thanh cố định đáy màn hình */}
          <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
            <div className="rounded-card border border-line bg-card p-6 shadow-soft">
              <p className="eyebrow">Giá tham khảo</p>
              <p className="mt-2 font-display text-3xl">
                {formatPrice(property.giaThamKhao, property.giaUnit)}
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                Giá thay đổi theo mùa và số khách. {property.trangThai}.
              </p>

              <div className="mt-5">
                <BookingTriggerButton />
              </div>

              <p className="mt-3 text-center text-xs text-ink-soft">
                Giữ chỗ tạm, chưa cần thanh toán trước — tư vấn viên gọi xác nhận trong 24 giờ.
              </p>

              <p className="mt-4 border-t border-line pt-4 text-center text-xs text-ink-soft">
                Cần tư vấn trước khi đặt?{" "}
                <a href={CONTACT.phoneHref} className="font-semibold text-ink underline underline-offset-4">
                  Gọi {CONTACT.phone}
                </a>
              </p>

              {/* Chỉ hiển thị thông tin tài khoản nhận tiền của chính property — không có nút/luồng thanh toán thật ở đây, tránh gây hiểu lầm nền tảng đứng ra thu hộ. */}
              {hasPayment && (
                <div className="mt-4 border-t border-line pt-4 text-xs text-ink-soft">
                  <p className="flex items-center gap-1.5 font-semibold text-ink">
                    <Landmark aria-hidden size={13} strokeWidth={2} className="text-turmeric" />
                    Thanh toán trực tiếp cho {property.name}
                  </p>
                  <p className="mt-1.5">
                    Khoản thanh toán đi thẳng vào tài khoản của {property.name} — nền tảng không giữ
                    hộ tiền.
                  </p>
                  <ul className="mt-2 space-y-1">
                    {property.thanhToan?.vietQrBankAccount && (
                      <li>VietQR: {property.thanhToan.vietQrBankAccount}</li>
                    )}
                    {property.thanhToan?.momoMerchantId && (
                      <li>Momo: {property.thanhToan.momoMerchantId}</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Câu hỏi thường gặp — dùng <details>/<summary> gốc, không cần JS riêng, vẫn bo góc/khung đồng bộ các khối khác trên trang. */}
        <div className="shell mt-16">
          <section id="faq" className="scroll-mt-28">
            <h2 className="text-2xl">Chính sách & câu hỏi thường gặp</h2>
            <div className="mt-5 divide-y divide-[color:var(--line)] overflow-hidden rounded-card border border-line bg-card">
              {faqItems.map((item) => (
                <details key={item.q} className="group p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-base text-ink [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span
                      aria-hidden
                      className="shrink-0 text-xl leading-none text-turmeric transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{item.a}</p>
                  {item.q.startsWith("Mức dịch vụ") && (
                    <Link
                      href="/ve-chung-toi#he-muc"
                      className="mt-2 inline-block text-sm font-semibold text-turmeric"
                    >
                      Hiểu về ba mức dịch vụ →
                    </Link>
                  )}
                </details>
              ))}
            </div>
          </section>
        </div>

        {/* Băng CTA cuối trang — nhắc lại lời mời đặt phòng trước khi khách rời trang. */}
        <div className="shell mt-16">
          <div className="overflow-hidden rounded-card bg-turmeric px-6 py-10 text-white sm:px-10 sm:py-14">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
                  Sẵn sàng lên đường?
                </p>
                <h2 className="mt-2 text-white">Giữ chỗ tại {property.name} hôm nay</h2>
                <p className="mt-2 max-w-prose text-sm text-white/85">
                  Giữ chỗ tạm, chưa cần thanh toán trước — tư vấn viên gọi xác nhận phòng còn trống
                  trong 24 giờ.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <BookingTriggerButton className="btn bg-white text-turmeric hover:bg-white/90" />
                <a
                  href={CONTACT.phoneHref}
                  className="btn border border-white/40 text-white hover:bg-white/10"
                >
                  <PhoneCall aria-hidden size={15} strokeWidth={2} />
                  {CONTACT.phone}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Thanh đặt phòng cố định đáy màn hình — chỉ hiện trên mobile, luôn trong tầm tay khi cuộn trang. */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur-sm lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-xs text-ink-soft">Giá tham khảo</p>
              <p className="font-display text-lg leading-tight">
                {formatPrice(property.giaThamKhao, property.giaUnit)}
              </p>
            </div>
            <div className="shrink-0">
              <BookingTriggerButton className="btn btn-primary" />
            </div>
          </div>
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </PropertyBookingProvider>
    </article>
  );
}
