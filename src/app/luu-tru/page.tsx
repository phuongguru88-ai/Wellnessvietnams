import type { Metadata } from "next";
import { Suspense } from "react";

import { FilterBar } from "@/components/FilterBar";
import { ItemCard } from "@/components/ItemCard";
import { PageIntro } from "@/components/PageIntro";
import { getProperties, getRegions } from "@/lib/data";
import {
  describeFilter,
  matches,
  parseFilter,
  type SearchParams,
} from "@/lib/filter";
import { formatPrice } from "@/lib/format";
import { EMPTY_STATE_ICON, PROPERTY_TYPE_ICON } from "@/lib/icons";
import { matchesQuery } from "@/lib/search";
import { PROPERTY_TYPE_LABEL, type PropertyType } from "@/lib/types";

const TYPES: PropertyType[] = ["Home", "Villa", "Resort", "Retreat"];

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const filter = parseFilter(await searchParams);
  const label = describeFilter(filter);

  return {
    title: label
      ? `Lưu trú wellness: ${label}`
      : "Lưu trú wellness: home, villa, resort & retreat tuyển chọn",
    description: label
      ? `Danh sách home, villa, resort và retreat wellness tại Việt Nam theo ${label}. Xem mức dịch vụ, loại hình và giá tham khảo, để lại thông tin để được tư vấn.`
      : "Home, villa, resort và retreat wellness khắp Việt Nam đã qua bộ 100 tiêu chí tuyển chọn. Lọc theo loại hình, mức dịch vụ và vùng miền, xem giá tham khảo và nhận tư vấn.",
    alternates: { canonical: "/luu-tru" },
    // Trang đã lọc không cần vào index, tránh trùng nội dung.
    robots: label ? { index: false, follow: true } : undefined,
  };
}

export default async function LuuTruPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const filter = parseFilter(await searchParams);
  const [properties, regions] = await Promise.all([getProperties(), getRegions()]);
  const list = properties.filter(
    (p) =>
      matches(p, filter) &&
      matchesQuery(
        filter.q,
        p.name,
        p.region,
        PROPERTY_TYPE_LABEL[p.type],
        p.description,
        ...p.nganh,
        ...p.loaiHinh,
        ...p.highlights,
      ),
  );

  return (
    <>
      <PageIntro eyebrow="Lưu trú" title="Nơi ở là điểm bắt đầu">
        <p>
          Mỗi home, villa, resort và retreat ở đây đều do chúng tôi đi khảo sát và chấm
          theo bộ 100 tiêu chí: chất lượng giấc ngủ, bếp, nguồn nước, cây bản
          địa, và năng lực của người làm trị liệu. Mức cao nhất trên mỗi thẻ là
          mức dịch vụ cao nhất có sẵn tại chỗ.
        </p>
      </PageIntro>

      <div className="shell pb-16">
        <Suspense fallback={<div className="h-40 rounded-card surface" />}>
          <FilterBar
            resultCount={list.length}
            resultNoun="nơi lưu trú"
            extras={[
              {
                key: "region",
                label: "Vùng miền",
                options: regions.map((r) => ({ value: r, label: r })),
              },
              {
                key: "type",
                label: "Loại chỗ ở",
                options: TYPES.map((t) => ({
                  value: t,
                  label: PROPERTY_TYPE_LABEL[t],
                })),
              },
            ]}
          />
        </Suspense>

        {list.length === 0 ? (
          <EmptyState query={filter.q} />
        ) : (
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <li key={p.id}>
                <ItemCard
                  href={`/luu-tru/${p.slug}`}
                  image={p.images[0]}
                  icon={PROPERTY_TYPE_ICON[p.type]}
                  eyebrow={`${PROPERTY_TYPE_LABEL[p.type]} · ${p.region}`}
                  title={p.name}
                  description={p.description}
                  nganh={p.nganh}
                  loaiHinh={p.loaiHinh}
                  muc={p.mucCaoNhat}
                  price={formatPrice(p.giaThamKhao, p.giaUnit)}
                  note={p.trangThai}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function EmptyState({ query }: { query?: string }) {
  const Icon = EMPTY_STATE_ICON;
  return (
    <div className="mt-8 rounded-card border border-dashed border-line p-10 text-center">
      <Icon aria-hidden size={28} strokeWidth={1.5} className="mx-auto text-ink-soft" />
      <h2 className="mt-3 text-xl">
        {query
          ? `Không tìm thấy nơi lưu trú nào cho "${query}"`
          : "Chưa có nơi lưu trú khớp bộ lọc này"}
      </h2>
      <p className="mx-auto mt-2 max-w-prose text-sm text-ink-soft">
        Mạng lưới đối tác đang mở rộng thêm mỗi tháng. Bạn thử từ khoá khác
        hoặc bỏ bớt một điều kiện, hoặc để lại thông tin — chúng tôi sẽ gợi ý
        nơi gần nhất với điều bạn cần.
      </p>
    </div>
  );
}
