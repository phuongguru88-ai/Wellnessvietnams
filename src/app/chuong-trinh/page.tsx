import type { Metadata } from "next";
import { Suspense } from "react";

import { FilterBar } from "@/components/FilterBar";
import { ItemCard } from "@/components/ItemCard";
import { PageIntro } from "@/components/PageIntro";
import { getProperties, getPrograms } from "@/lib/data";
import {
  describeFilter,
  matches,
  parseFilter,
  type SearchParams,
} from "@/lib/filter";
import { formatPrice } from "@/lib/format";
import { EMPTY_STATE_ICON, PROGRAM_ICON } from "@/lib/icons";
import { matchesQuery } from "@/lib/search";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const filter = parseFilter(await searchParams);
  const label = describeFilter(filter);

  return {
    title: label
      ? `Chương trình wellness: ${label}`
      : "Chương trình wellness nhiều ngày tại Việt Nam",
    description: label
      ? `Các chương trình wellness nhiều ngày theo ${label}: lưu trú, ăn uống theo thể trạng, trị liệu và người đồng hành trong một gói.`
      : "Combo hành trình nhiều ngày: dưỡng sinh theo y học phương đông, thanh lọc tinh thần, nghỉ tân hôn. Đã gộp lưu trú, ăn uống, trị liệu và người đồng hành.",
    alternates: { canonical: "/chuong-trinh" },
    robots: label ? { index: false, follow: true } : undefined,
  };
}

export default async function ChuongTrinhPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const filter = parseFilter(await searchParams);
  const EmptyIcon = EMPTY_STATE_ICON;
  const [programs, properties] = await Promise.all([getPrograms(), getProperties()]);
  const propertyById = new Map(properties.map((p) => [p.id, p]));

  const list = programs.filter((p) => {
    const property = propertyById.get(p.propertyRef);
    return (
      matches(p, filter) &&
      matchesQuery(
        filter.q,
        p.name,
        p.durationLabel,
        p.summary,
        ...p.nganh,
        ...p.loaiHinh,
        property?.name,
        property?.region,
      )
    );
  });

  return (
    <>
      <PageIntro eyebrow="Chương trình" title="Hành trình đã được sắp sẵn">
        <p>
          Mỗi chương trình là một combo nhiều ngày: nơi ở, bữa ăn theo thể
          trạng, các buổi trị liệu và người đồng hành đã xếp thành một lịch
          trình. Bạn chỉ cần có mặt.
        </p>
      </PageIntro>

      <div className="shell pb-16">
        <Suspense fallback={<div className="surface h-40 rounded-card" />}>
          <FilterBar resultCount={list.length} resultNoun="chương trình" showLoaiHinh={false} />
        </Suspense>

        {list.length === 0 ? (
          <div className="mt-8 rounded-card border border-dashed border-line p-10 text-center">
            <EmptyIcon aria-hidden size={28} strokeWidth={1.5} className="mx-auto text-ink-soft" />
            <h2 className="mt-3 text-xl">
              {filter.q
                ? `Không tìm thấy chương trình nào cho "${filter.q}"`
                : "Chưa có chương trình khớp bộ lọc này"}
            </h2>
            <p className="mx-auto mt-2 max-w-prose text-sm text-ink-soft">
              Chúng tôi nhận thiết kế hành trình riêng theo thể trạng và thời
              gian của bạn — để lại thông tin ở form dưới trang.
            </p>
          </div>
        ) : (
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => {
              const property = propertyById.get(p.propertyRef);
              return (
                <li key={p.id}>
                  <ItemCard
                    href={`/chuong-trinh/${p.slug}`}
                    image={p.images[0]}
                    icon={PROGRAM_ICON}
                    eyebrow={`${p.durationLabel}${property ? ` · ${property.region}` : ""}`}
                    title={p.name}
                    description={p.summary}
                    nganh={p.nganh}
                    muc={p.muc}
                    price={formatPrice(p.price, p.priceUnit)}
                    note={property?.name}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
