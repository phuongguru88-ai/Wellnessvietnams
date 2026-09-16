import type { Metadata } from "next";
import { Suspense } from "react";

import { FilterBar } from "@/components/FilterBar";
import { ItemCard } from "@/components/ItemCard";
import { PageIntro } from "@/components/PageIntro";
import { getExperiences, getProperties, getRegions } from "@/lib/data";
import {
  describeFilter,
  matches,
  parseFilter,
  type SearchParams,
} from "@/lib/filter";
import { formatDuration, formatPrice } from "@/lib/format";
import { DURATION_ICON, EMPTY_STATE_ICON } from "@/lib/icons";
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
      ? `Vé trải nghiệm wellness: ${label}`
      : "Vé trải nghiệm wellness theo buổi",
    description: label
      ? `Vé trải nghiệm wellness theo buổi ứng với ${label}: thời lượng, mức dịch vụ và giá rõ ràng cho từng buổi.`
      : "Bấm huyệt cổ truyền, massage đá nóng, coaching 1-kèm-1, forest bathing có hướng dẫn — vé lẻ theo buổi, thêm vào kỳ nghỉ bạn đã có.",
    alternates: { canonical: "/trai-nghiem" },
    robots: label ? { index: false, follow: true } : undefined,
  };
}

export default async function TraiNghiemPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const filter = parseFilter(await searchParams);
  const EmptyIcon = EMPTY_STATE_ICON;
  const [experiences, properties, regions] = await Promise.all([
    getExperiences(),
    getProperties(),
    getRegions(),
  ]);
  const propertyById = new Map(properties.map((p) => [p.id, p]));

  // Trải nghiệm không có region riêng — lấy theo nơi tổ chức.
  const list = experiences.filter((e) => {
    const property = propertyById.get(e.propertyRef);
    return (
      matches({ ...e, region: property?.region }, filter) &&
      matchesQuery(
        filter.q,
        e.name,
        e.nganh,
        e.loaiHinh,
        e.description,
        ...e.benefits,
        property?.name,
        property?.region,
      )
    );
  });

  return (
    <>
      <PageIntro eyebrow="Trải nghiệm" title="Từng buổi một, không cần đi cả hành trình">
        <p>
          Vé lẻ cho một buổi trị liệu, một buổi coaching hay một buổi đi rừng.
          Bạn có thể mua thêm khi đã ở tại nơi lưu trú đối tác, hoặc ghép vài
          buổi thành một kỳ nghỉ ngắn.
        </p>
      </PageIntro>

      <div className="shell pb-16">
        <Suspense fallback={<div className="surface h-40 rounded-card" />}>
          <FilterBar
            resultCount={list.length}
            resultNoun="vé trải nghiệm"
            extras={[
              {
                key: "region",
                label: "Vùng miền",
                options: regions.map((r) => ({ value: r, label: r })),
              },
            ]}
          />
        </Suspense>

        {list.length === 0 ? (
          <div className="mt-8 rounded-card border border-dashed border-line p-10 text-center">
            <EmptyIcon aria-hidden size={28} strokeWidth={1.5} className="mx-auto text-ink-soft" />
            <h2 className="mt-3 text-xl">
              {filter.q
                ? `Không tìm thấy vé nào cho "${filter.q}"`
                : "Chưa có vé nào khớp bộ lọc này"}
            </h2>
            <p className="mx-auto mt-2 max-w-prose text-sm text-ink-soft">
              Danh mục vé được bổ sung theo từng đối tác mới. Bạn thử từ khoá
              khác hoặc bỏ bớt một điều kiện, hoặc để lại thông tin để chúng
              tôi gợi ý buổi gần nhất.
            </p>
          </div>
        ) : (
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((e) => {
              const property = propertyById.get(e.propertyRef);
              return (
                <li key={e.id}>
                  <ItemCard
                    href={`/trai-nghiem/${e.slug}`}
                    image={e.images[0]}
                    icon={DURATION_ICON}
                    eyebrow={`${formatDuration(e.durationMinutes)}${property ? ` · ${property.region}` : ""}`}
                    title={e.name}
                    description={e.description}
                    nganh={[e.nganh]}
                    loaiHinh={[e.loaiHinh]}
                    muc={e.muc}
                    price={formatPrice(e.price)}
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
