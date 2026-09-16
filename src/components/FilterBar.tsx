"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { LOAI_HINH_ICON, NGANH_ICON } from "@/lib/icons";
import { LOAI_HINH, MUC_META, NGANH } from "@/lib/types";

export type ExtraFilter = {
  /** Tên tham số trên URL, ví dụ "region" hoặc "type". */
  key: string;
  label: string;
  options: { value: string; label: string }[];
};

/**
 * Filter dùng chung cho cả 3 tab (Lưu trú / Chương trình / Trải nghiệm).
 * Trạng thái nằm trên URL nên kết quả chia sẻ được và render được ở server.
 */
export function FilterBar({
  extras = [],
  resultCount,
  resultNoun,
  showLoaiHinh = true,
}: {
  extras?: ExtraFilter[];
  resultCount: number;
  resultNoun: string;
  /** Tắt dòng "Hình thức dịch vụ" — dùng cho trang mà thuộc tính này không phù hợp. */
  showLoaiHinh?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const current = (key: string) => params.get(key) ?? "";

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  const toggle = useCallback(
    (key: string, value: string) => {
      setParam(key, current(key) === value ? "" : value);
    },
    [setParam, params],
  );

  // Ô tìm kiếm gõ tự do — debounce trước khi cập nhật URL để không giật khi gõ nhanh.
  const [searchInput, setSearchInput] = useState(current("q"));
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setSearchInput(current("q"));
    // Chỉ đồng bộ lại khi URL đổi từ nơi khác (vd. bấm "Xoá bộ lọc").
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.get("q")]);

  const onSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setParam("q", value.trim()), 350);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const hasFilter = ["nganh", "lh", "muc", "vhvm", "q", ...extras.map((e) => e.key)].some(
    (k) => params.get(k),
  );

  return (
    <section
      aria-label="Bộ lọc"
      className="surface rounded-card p-4 sm:p-5 shadow-soft"
    >
      <div className="border-b border-line pb-4">
        <label htmlFor="filter-search" className="sr-only">
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
            id="filter-search"
            type="search"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên, vùng miền, công dụng…"
            className="w-full rounded-full border border-line bg-bg py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-soft/70"
          />
        </div>
      </div>

      <Row label="Ngành">
        {NGANH.map((ng) => {
          const Icon = NGANH_ICON[ng];
          return (
            <Chip
              key={ng}
              active={current("nganh") === ng}
              onClick={() => toggle("nganh", ng)}
            >
              <Icon aria-hidden size={13} strokeWidth={2} className="mr-1.5 -ml-0.5" />
              {ng}
            </Chip>
          );
        })}
      </Row>

      {showLoaiHinh && (
        <Row label="Hình thức dịch vụ">
          {LOAI_HINH.map((lh) => {
            const Icon = LOAI_HINH_ICON[lh];
            return (
              <Chip
                key={lh}
                active={current("lh") === lh}
                onClick={() => toggle("lh", lh)}
              >
                <Icon aria-hidden size={13} strokeWidth={2} className="mr-1.5 -ml-0.5" />
                {lh}
              </Chip>
            );
          })}
        </Row>
      )}

      <Row label="Mức">
        {([1, 2, 3] as const).map((m) => (
          <Chip
            key={m}
            active={current("muc") === String(m)}
            onClick={() => toggle("muc", String(m))}
            title={MUC_META[m].description}
          >
            <span aria-hidden className="mr-1.5 tracking-[0.1em]">
              {MUC_META[m].stars}
            </span>
            {MUC_META[m].label}
          </Chip>
        ))}
      </Row>

      {extras.map((extra) => (
        <Row key={extra.key} label={extra.label}>
          {extra.options.map((opt) => (
            <Chip
              key={opt.value}
              active={current(extra.key) === opt.value}
              onClick={() => toggle(extra.key, opt.value)}
            >
              {opt.label}
            </Chip>
          ))}
        </Row>
      ))}

      <Row label="Tag">
        <Chip
          active={current("vhvm") === "1"}
          onClick={() => toggle("vhvm", "1")}
          title="Trải nghiệm được thiết kế có mục đích chữa lành từ văn hoá bản địa — nghi lễ, tri thức dưỡng sinh truyền thống."
        >
          Có yếu tố văn hoá vùng miền
        </Chip>
      </Row>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
        <p aria-live="polite" className="text-sm text-ink-soft">
          <strong className="font-semibold text-ink">{resultCount}</strong>{" "}
          {resultNoun} phù hợp
        </p>
        {hasFilter && (
          <button
            type="button"
            onClick={() => router.replace(pathname, { scroll: false })}
            className="text-sm font-semibold text-turmeric underline underline-offset-4"
          >
            Xoá bộ lọc
          </button>
        )}
      </div>
    </section>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-line py-3 first:pt-0 last:border-b-0 sm:flex-row sm:items-start sm:gap-4">
      <p className="eyebrow pt-1.5 sm:w-28 sm:shrink-0">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "border-transparent bg-ink text-bg"
          : "border-line text-ink-soft hover:border-ink-soft hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
