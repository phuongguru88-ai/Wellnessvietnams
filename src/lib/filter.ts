import { LOAI_HINH, NGANH, type LoaiHinh, type Muc, type Nganh } from "./types";

export type SearchParams = Record<string, string | string[] | undefined>;

export type ActiveFilter = {
  /** Ngành chính thức — trục filter chính. */
  nganh?: Nganh;
  /** Hình thức dịch vụ — thuộc tính phụ. */
  lh?: LoaiHinh;
  muc?: Muc;
  region?: string;
  type?: string;
  /** Có yếu tố văn hóa vùng miền — tag xuyên suốt, boolean. */
  vanHoaVungMien?: boolean;
  /** Từ khoá tìm kiếm tự do, khớp theo tên/mô tả — xem lib/search.ts. */
  q?: string;
};

const one = (v: string | string[] | undefined) =>
  Array.isArray(v) ? v[0] : v;

/** Chỉ nhận giá trị nằm trong tập hợp lệ — tránh lọc theo tham số rác. */
export function parseFilter(params: SearchParams): ActiveFilter {
  const nganhRaw = one(params.nganh);
  const lhRaw = one(params.lh);
  const mucRaw = one(params.muc);
  const vhvmRaw = one(params.vhvm);
  const qRaw = (one(params.q) ?? "").trim().slice(0, 100);

  return {
    nganh: NGANH.includes(nganhRaw as Nganh) ? (nganhRaw as Nganh) : undefined,
    lh: LOAI_HINH.includes(lhRaw as LoaiHinh) ? (lhRaw as LoaiHinh) : undefined,
    muc:
      mucRaw === "1" || mucRaw === "2" || mucRaw === "3"
        ? (Number(mucRaw) as Muc)
        : undefined,
    region: one(params.region) || undefined,
    type: one(params.type) || undefined,
    vanHoaVungMien: vhvmRaw === "1" ? true : undefined,
    q: qRaw || undefined,
  };
}

/**
 * Lọc chung cho cả 3 tab. `nganh` là trục chính; `loaiHinh` là thuộc tính
 * phụ — cả hai đều nhận một hoặc nhiều giá trị trên từng nội dung.
 * `muc` là Mức cao nhất của nội dung đó.
 */
export function matches<
  T extends {
    nganh: Nganh | Nganh[];
    loaiHinh: LoaiHinh | LoaiHinh[];
    coYeuToVanHoaVungMien?: boolean;
    muc?: Muc;
    mucCaoNhat?: Muc;
    region?: string;
    type?: string;
  },
>(item: T, filter: ActiveFilter) {
  const nganhList = Array.isArray(item.nganh) ? item.nganh : [item.nganh];
  if (filter.nganh && !nganhList.includes(filter.nganh)) return false;

  const loaiHinhList = Array.isArray(item.loaiHinh)
    ? item.loaiHinh
    : [item.loaiHinh];
  if (filter.lh && !loaiHinhList.includes(filter.lh)) return false;

  const muc = item.muc ?? item.mucCaoNhat;
  if (filter.muc && muc !== filter.muc) return false;

  if (filter.vanHoaVungMien && !item.coYeuToVanHoaVungMien) return false;

  if (filter.region && item.region !== filter.region) return false;
  if (filter.type && item.type !== filter.type) return false;

  return true;
}

/** Mô tả bộ lọc đang bật, dùng cho meta description của trang danh sách. */
export function describeFilter(filter: ActiveFilter) {
  const parts: string[] = [];
  if (filter.nganh) parts.push(filter.nganh);
  if (filter.lh) parts.push(filter.lh);
  if (filter.muc) parts.push(`Mức ${filter.muc}`);
  if (filter.region) parts.push(filter.region);
  if (filter.type) parts.push(filter.type);
  if (filter.vanHoaVungMien) parts.push("có yếu tố văn hoá vùng miền");
  if (filter.q) parts.push(`"${filter.q}"`);
  return parts.join(" · ");
}
