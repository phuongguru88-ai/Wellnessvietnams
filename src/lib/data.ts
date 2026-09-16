import { estimateReadingMinutes, parseContentText } from "./content";
import { parseItineraryText } from "./itinerary";
import { buildImageRef } from "./media";
import { ensureUniqueSlug, slugify } from "./slug";
import { readJson, writeJson } from "./store";
import {
  BAI_VIET_CHUYEN_MUC,
  LOAI_HINH,
  MUC_TIEU,
  NGANH,
  PROGRAM_TRANG_THAI,
  type BaiViet,
  type BaiVietChuyenMuc,
  type DiemDenLanCan,
  type Experience,
  type ImageRef,
  type LoaiHinh,
  type Muc,
  type MucTieu,
  type Nganh,
  type Program,
  type ProgramTrangThai,
  type Property,
  type PropertyType,
  type RoomType,
  type TrangThai,
} from "./types";

/**
 * Nguồn dữ liệu nội dung: file JSON trên đĩa (xem lib/store.ts), khởi tạo
 * từ bộ dữ liệu mẫu trong /data. Trang quản trị (/quan-tri) đọc/ghi qua
 * đúng các hàm ở file này — không có bản sao dữ liệu nào khác trong app.
 */

const PROPERTIES_FILE = "properties.json";
const PROGRAMS_FILE = "programs.json";
const EXPERIENCES_FILE = "experiences.json";
const BAI_VIET_FILE = "bai-viet.json";

export async function getProperties(): Promise<Property[]> {
  return readJson<Property[]>(PROPERTIES_FILE, []);
}
export async function getPrograms(): Promise<Program[]> {
  return readJson<Program[]>(PROGRAMS_FILE, []);
}
export async function getExperiences(): Promise<Experience[]> {
  return readJson<Experience[]>(EXPERIENCES_FILE, []);
}
export async function getBaiVietList(): Promise<BaiViet[]> {
  return readJson<BaiViet[]>(BAI_VIET_FILE, []);
}

/* ------------------------------ Truy vấn ------------------------------ */

export async function getProperty(slug: string) {
  return (await getProperties()).find((p) => p.slug === slug);
}
export async function getProgram(slug: string) {
  return (await getPrograms()).find((p) => p.slug === slug);
}
export async function getExperience(slug: string) {
  return (await getExperiences()).find((e) => e.slug === slug);
}

export async function getBaiViet(slug: string) {
  return (await getBaiVietList()).find((b) => b.slug === slug);
}

export async function getPropertyById(id: string) {
  return (await getProperties()).find((p) => p.id === id);
}
export async function getProgramById(id: string) {
  return (await getPrograms()).find((p) => p.id === id);
}
export async function getExperienceById(id: string) {
  return (await getExperiences()).find((e) => e.id === id);
}
export async function getBaiVietById(id: string) {
  return (await getBaiVietList()).find((b) => b.id === id);
}

/** Bài mới nhất trước — dùng ở trang chủ và trang danh sách kiến thức. */
export async function sortedBaiVietList(): Promise<BaiViet[]> {
  return (await getBaiVietList())
    .slice()
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function latestBaiViet(limit: number) {
  return (await sortedBaiVietList()).slice(0, limit);
}

/** Bài cùng chuyên mục trước, sau đó bù bằng bài mới nhất khác chuyên mục. */
export async function relatedBaiViet(current: BaiViet, limit: number) {
  const others = (await sortedBaiVietList()).filter((b) => b.id !== current.id);
  const sameChuyenMuc = others.filter((b) => b.chuyenMuc === current.chuyenMuc);
  const rest = others.filter((b) => b.chuyenMuc !== current.chuyenMuc);
  return [...sameChuyenMuc, ...rest].slice(0, limit);
}

export async function getRegions() {
  return Array.from(new Set((await getProperties()).map((p) => p.region)));
}

export async function programsAtProperty(propertyId: string) {
  return (await getPrograms()).filter((p) => p.propertyRef === propertyId);
}
export async function experiencesAtProperty(propertyId: string) {
  return (await getExperiences()).filter((e) => e.propertyRef === propertyId);
}

/** Đếm nội dung của cả 3 tab theo từng Loại hình — dùng ở trang chủ. */
export async function countByLoaiHinh(loaiHinh: LoaiHinh) {
  const [properties, programs, experiences] = await Promise.all([
    getProperties(),
    getPrograms(),
    getExperiences(),
  ]);
  return (
    properties.filter((p) => p.loaiHinh.includes(loaiHinh)).length +
    programs.filter((p) => p.loaiHinh.includes(loaiHinh)).length +
    experiences.filter((e) => e.loaiHinh === loaiHinh).length
  );
}

/** Đếm nội dung của cả 3 tab theo từng Ngành chính thức — dùng ở trang chủ. */
export async function countByNganh(nganh: Nganh) {
  const [properties, programs, experiences] = await Promise.all([
    getProperties(),
    getPrograms(),
    getExperiences(),
  ]);
  return (
    properties.filter((p) => p.nganh.includes(nganh)).length +
    programs.filter((p) => p.nganh.includes(nganh)).length +
    experiences.filter((e) => e.nganh === nganh).length
  );
}

/* -------------------------- Helpers dùng chung -------------------------- */

export type FieldErrors = Record<string, string>;
export type FormResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: FieldErrors };

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const lines = (fd: FormData, key: string) =>
  str(fd, key)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

export function parseImages(fd: FormData, key: string, seedBase: string, fallbackAlt: string): ImageRef[] {
  const rawLines = lines(fd, key);
  const list = rawLines.length > 0 ? rawLines : [fallbackAlt];
  return list.map((line, i) => buildImageRef(line, `${seedBase}-${i + 1}`, fallbackAlt));
}

/** Mỗi dòng "Tên | Khoảng cách" — ví dụ "Chợ phiên Đồng Văn | 15 phút đi bộ". */
function parseDiemDenLanCan(fd: FormData, key: string): DiemDenLanCan[] {
  return lines(fd, key)
    .map((line) => {
      const [ten, khoangCach] = line.split("|").map((s) => s.trim());
      return { ten: ten || "", khoangCach: khoangCach || "" };
    })
    .filter((d) => d.ten);
}

function parseMuc(fd: FormData, key: string): Muc | undefined {
  const raw = str(fd, key);
  return raw === "1" || raw === "2" || raw === "3" ? (Number(raw) as Muc) : undefined;
}

function parseLoaiHinhMulti(fd: FormData, key: string): LoaiHinh[] {
  return fd
    .getAll(key)
    .map(String)
    .filter((v): v is LoaiHinh => (LOAI_HINH as readonly string[]).includes(v));
}

function parseNganhMulti(fd: FormData, key: string): Nganh[] {
  return fd
    .getAll(key)
    .map(String)
    .filter((v): v is Nganh => (NGANH as readonly string[]).includes(v));
}

/** Checkbox đơn — có mặt trong FormData (bất kỳ giá trị nào) nghĩa là đã tick. */
function parseBool(fd: FormData, key: string): boolean {
  return fd.get(key) !== null;
}

function parseMucTieuMulti(fd: FormData, key: string): MucTieu[] {
  return fd
    .getAll(key)
    .map(String)
    .filter((v): v is MucTieu => (MUC_TIEU as readonly string[]).includes(v));
}

/** Mỗi dòng "Loại | Giá" — ví dụ "Phòng đôi | 6.900.000". Dòng thiếu giá hợp lệ bị bỏ qua. */
function parseGiaTheoLoai(fd: FormData, key: string): Program["giaTheoLoai"] {
  const list = lines(fd, key)
    .map((line) => {
      const [loai, giaRaw] = line.split("|").map((s) => s.trim());
      const gia = Number((giaRaw ?? "").replace(/[.,\s]/g, ""));
      return loai && Number.isFinite(gia) && gia > 0 ? { loai, gia } : null;
    })
    .filter((v): v is { loai: string; gia: number } => v !== null);
  return list.length > 0 ? list : undefined;
}

/** Quy mô nhóm tối thiểu/tối đa — cả hai đều phải là số nguyên dương hợp lệ thì mới nhận. */
function parseQuyMoNhom(fd: FormData, minKey: string, maxKey: string): Program["quyMoNhom"] {
  const min = parseInt1(fd, minKey);
  const max = parseInt1(fd, maxKey);
  return min && max && max >= min ? { min, max } : undefined;
}

function parsePrice(fd: FormData, key: string): number | undefined {
  const raw = str(fd, key).replace(/[.,\s]/g, "");
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function parseInt1(fd: FormData, key: string): number | undefined {
  const raw = str(fd, key);
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 && Number.isInteger(n) ? n : undefined;
}

/* -------------------------------- Property -------------------------------- */

const PROPERTY_TYPES: PropertyType[] = ["Home", "Villa", "Resort", "Retreat"];
const TRANG_THAI: TrangThai[] = ["Đang nhận khách", "Sắp mở", "Tạm dừng"];

// roomTypes không còn nằm trong form Property — quản lý riêng qua
// createRoomType/updateRoomType/deleteRoomType bên dưới (xem
// /quan-tri/luu-tru/[id]/phong), để mỗi hạng phòng có form + ảnh riêng
// thay vì gộp chung một ô văn bản khó soạn.
export type PropertyInput = Omit<Property, "id" | "slug" | "roomTypes"> & { slugInput?: string };

export function parsePropertyForm(fd: FormData): FormResult<PropertyInput> {
  const errors: FieldErrors = {};

  const name = str(fd, "name");
  if (name.length < 2) errors.name = "Vui lòng nhập tên (từ 2 ký tự).";

  const type = str(fd, "type") as PropertyType;
  if (!PROPERTY_TYPES.includes(type)) errors.type = "Chọn loại chỗ ở.";

  const region = str(fd, "region");
  if (!region) errors.region = "Vui lòng nhập vùng miền.";

  const description = str(fd, "description");
  if (description.length < 20) errors.description = "Mô tả cần ít nhất 20 ký tự.";

  const highlights = lines(fd, "highlights");
  if (highlights.length === 0) errors.highlights = "Nhập ít nhất một điểm nổi bật, mỗi dòng một ý.";

  const nganh = parseNganhMulti(fd, "nganh");
  if (nganh.length === 0) errors.nganh = "Chọn ít nhất một ngành.";

  const loaiHinh = parseLoaiHinhMulti(fd, "loaiHinh");
  if (loaiHinh.length === 0) errors.loaiHinh = "Chọn ít nhất một hình thức dịch vụ.";

  const coYeuToVanHoaVungMien = parseBool(fd, "coYeuToVanHoaVungMien");

  const mucCaoNhat = parseMuc(fd, "mucCaoNhat");
  if (!mucCaoNhat) errors.mucCaoNhat = "Chọn mức dịch vụ cao nhất.";

  const giaThamKhao = parsePrice(fd, "giaThamKhao");
  if (!giaThamKhao) errors.giaThamKhao = "Giá tham khảo phải là số dương.";

  const giaUnit = str(fd, "giaUnit") || "đêm";

  const trangThai = str(fd, "trangThai") as TrangThai;
  if (!TRANG_THAI.includes(trangThai)) errors.trangThai = "Chọn trạng thái.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const seedBase = slugify(str(fd, "slug") || name);
  return {
    ok: true,
    data: {
      slugInput: str(fd, "slug") || undefined,
      name,
      type,
      region,
      description,
      highlights,
      nganh,
      loaiHinh,
      coYeuToVanHoaVungMien,
      mucCaoNhat: mucCaoNhat!,
      giaThamKhao: giaThamKhao!,
      giaUnit,
      trangThai,
      images: parseImages(fd, "images", seedBase, name),
      tienIch: lines(fd, "tienIch"),
      diemDenLanCan: parseDiemDenLanCan(fd, "diemDenLanCan"),
    },
  };
}

export async function createProperty(input: PropertyInput): Promise<Property> {
  const list = await getProperties();
  const slug = ensureUniqueSlug(
    slugify(input.slugInput || input.name),
    new Set(list.map((p) => p.slug)),
  );
  const { slugInput: _slugInput, ...rest } = input;
  const property: Property = { id: crypto.randomUUID(), slug, roomTypes: [], ...rest };
  await writeJson(PROPERTIES_FILE, [...list, property]);
  return property;
}

export async function updateProperty(
  id: string,
  input: PropertyInput,
): Promise<Property | undefined> {
  const list = await getProperties();
  const existing = list.find((p) => p.id === id);
  if (!existing) return undefined;

  const slug = ensureUniqueSlug(
    slugify(input.slugInput || input.name),
    new Set(list.map((p) => p.slug)),
    existing.slug,
  );
  const { slugInput: _slugInput, ...rest } = input;
  // roomTypes không nằm trong form này — giữ nguyên giá trị hiện có.
  const updated: Property = { id, slug, roomTypes: existing.roomTypes, ...rest };
  await writeJson(
    PROPERTIES_FILE,
    list.map((p) => (p.id === id ? updated : p)),
  );
  return updated;
}

/* ----------------------------- Hạng phòng ----------------------------- */
// Mỗi hạng phòng có form + ảnh riêng, tách khỏi form Property (xem
// /quan-tri/luu-tru/[id]/phong). Vẫn lưu lồng trong Property.roomTypes vì
// đó là đúng quan hệ dữ liệu (hạng phòng luôn thuộc về một Property) —
// không cần tách thành file JSON riêng.

export type RoomTypeInput = Omit<RoomType, "id">;

export function parseRoomTypeForm(fd: FormData, defaultGiaUnit: string): FormResult<RoomTypeInput> {
  const errors: FieldErrors = {};

  const name = str(fd, "name");
  if (name.length < 2) errors.name = "Vui lòng nhập tên hạng phòng (từ 2 ký tự).";

  const sucChua = parseInt1(fd, "sucChua");
  if (!sucChua) errors.sucChua = "Sức chứa phải là số nguyên dương.";

  const giaThamKhao = parsePrice(fd, "giaThamKhao");
  if (!giaThamKhao) errors.giaThamKhao = "Giá tham khảo phải là số dương.";

  const description = str(fd, "description");

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const seedBase = slugify(name) || "hang-phong";
  const soLuong = parseInt1(fd, "soLuong");

  return {
    ok: true,
    data: {
      name,
      sucChua: sucChua!,
      dienTich: str(fd, "dienTich") || undefined,
      giaThamKhao: giaThamKhao!,
      giaUnit: str(fd, "giaUnit") || defaultGiaUnit,
      soLuong,
      description,
      images: parseImages(fd, "images", seedBase, name),
      tieuChuan: lines(fd, "tieuChuan"),
    },
  };
}

export async function getRoomType(propertyId: string, roomId: string) {
  const property = await getPropertyById(propertyId);
  const room = property?.roomTypes.find((r) => r.id === roomId);
  return property && room ? { property, room } : undefined;
}

export async function createRoomType(
  propertyId: string,
  input: RoomTypeInput,
): Promise<RoomType | undefined> {
  const list = await getProperties();
  const property = list.find((p) => p.id === propertyId);
  if (!property) return undefined;

  const id = ensureUniqueSlug(
    slugify(input.name) || "hang-phong",
    new Set(property.roomTypes.map((r) => r.id)),
  );
  const room: RoomType = { id, ...input };
  const updated: Property = { ...property, roomTypes: [...property.roomTypes, room] };
  await writeJson(
    PROPERTIES_FILE,
    list.map((p) => (p.id === propertyId ? updated : p)),
  );
  return room;
}

export async function updateRoomType(
  propertyId: string,
  roomId: string,
  input: RoomTypeInput,
): Promise<RoomType | undefined> {
  const list = await getProperties();
  const property = list.find((p) => p.id === propertyId);
  if (!property || !property.roomTypes.some((r) => r.id === roomId)) return undefined;

  const room: RoomType = { id: roomId, ...input };
  const updated: Property = {
    ...property,
    roomTypes: property.roomTypes.map((r) => (r.id === roomId ? room : r)),
  };
  await writeJson(
    PROPERTIES_FILE,
    list.map((p) => (p.id === propertyId ? updated : p)),
  );
  return room;
}

export async function deleteRoomType(propertyId: string, roomId: string): Promise<boolean> {
  const list = await getProperties();
  const property = list.find((p) => p.id === propertyId);
  if (!property) return false;

  const updated: Property = {
    ...property,
    roomTypes: property.roomTypes.filter((r) => r.id !== roomId),
  };
  await writeJson(
    PROPERTIES_FILE,
    list.map((p) => (p.id === propertyId ? updated : p)),
  );
  return true;
}

export async function deleteProperty(
  id: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const [properties, programs, experiences] = await Promise.all([
    getProperties(),
    getPrograms(),
    getExperiences(),
  ]);
  const dependents =
    programs.filter((p) => p.propertyRef === id).length +
    experiences.filter((e) => e.propertyRef === id).length;
  if (dependents > 0) {
    return {
      ok: false,
      reason: `Còn ${dependents} chương trình/trải nghiệm đang gắn với nơi này — xoá hoặc chuyển chúng sang nơi khác trước.`,
    };
  }
  await writeJson(PROPERTIES_FILE, properties.filter((p) => p.id !== id));
  return { ok: true };
}

/* -------------------------------- Program -------------------------------- */

export type ProgramInput = Omit<Program, "id" | "slug"> & { slugInput?: string };

export function parseProgramForm(
  fd: FormData,
  validPropertyIds: Set<string>,
): FormResult<ProgramInput> {
  const errors: FieldErrors = {};

  const name = str(fd, "name");
  if (name.length < 2) errors.name = "Vui lòng nhập tên (từ 2 ký tự).";

  const durationLabel = str(fd, "durationLabel");
  if (!durationLabel) errors.durationLabel = 'Vui lòng nhập thời lượng, ví dụ "3 ngày 2 đêm".';

  const nganh = parseNganhMulti(fd, "nganh");
  if (nganh.length === 0) errors.nganh = "Chọn ít nhất một ngành.";

  const loaiHinh = parseLoaiHinhMulti(fd, "loaiHinh");
  if (loaiHinh.length === 0) errors.loaiHinh = "Chọn ít nhất một hình thức dịch vụ.";

  const coYeuToVanHoaVungMien = parseBool(fd, "coYeuToVanHoaVungMien");

  const muc = parseMuc(fd, "muc");
  if (!muc) errors.muc = "Chọn mức dịch vụ.";

  const mucTieu = parseMucTieuMulti(fd, "mucTieu");
  if (mucTieu.length === 0) errors.mucTieu = "Chọn ít nhất một mục tiêu.";

  const summary = str(fd, "summary");
  if (summary.length < 20) errors.summary = "Tóm tắt ngắn cần ít nhất 20 ký tự.";

  const description = str(fd, "description");
  if (description.length < 20) errors.description = "Mô tả đầy đủ cần ít nhất 20 ký tự.";

  const doiTuongPhuHop = lines(fd, "doiTuongPhuHop");
  if (doiTuongPhuHop.length === 0) errors.doiTuongPhuHop = "Nhập ít nhất một đối tượng phù hợp.";

  const doiTuongKhongPhuHop = lines(fd, "doiTuongKhongPhuHop");

  const itineraryText = str(fd, "itinerary");
  const itinerary = itineraryText ? parseItineraryText(itineraryText) : [];
  if (itinerary.length === 0) {
    errors.itinerary = 'Nhập lịch trình, bắt đầu mỗi ngày bằng dòng "## Ngày 1: ...".';
  }

  const baoGom = lines(fd, "baoGom");
  if (baoGom.length === 0) errors.baoGom = "Nhập ít nhất một mục đã bao gồm.";

  const khongBaoGom = lines(fd, "khongBaoGom");

  const propertyRef = str(fd, "propertyRef");
  if (!validPropertyIds.has(propertyRef)) errors.propertyRef = "Chọn nơi lưu trú diễn ra chương trình.";

  const yeuCauTruocKhi = lines(fd, "yeuCauTruocKhi");

  const chuyenMonDoiNgu = str(fd, "chuyenMonDoiNgu");
  if (!chuyenMonDoiNgu) errors.chuyenMonDoiNgu = "Vui lòng mô tả chuyên môn của đội ngũ phụ trách.";

  const quyMoNhom = parseQuyMoNhom(fd, "quyMoNhomMin", "quyMoNhomMax");

  const gioiHanCamKet = str(fd, "gioiHanCamKet");
  if (!gioiHanCamKet) errors.gioiHanCamKet = "Vui lòng nhập giới hạn/cam kết vận hành.";

  const price = parsePrice(fd, "price");
  if (!price) errors.price = "Giá phải là số dương.";

  const priceUnit = str(fd, "priceUnit") || "khách";

  const giaTheoLoai = parseGiaTheoLoai(fd, "giaTheoLoai");

  const chinhSachHuy = str(fd, "chinhSachHuy");
  if (!chinhSachHuy) errors.chinhSachHuy = "Vui lòng nhập chính sách huỷ.";

  const trangThaiRaw = str(fd, "trangThai");
  const trangThai = (PROGRAM_TRANG_THAI as readonly string[]).includes(trangThaiRaw)
    ? (trangThaiRaw as ProgramTrangThai)
    : undefined;
  if (!trangThai) errors.trangThai = "Chọn trạng thái.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const seedBase = slugify(str(fd, "slug") || name);
  return {
    ok: true,
    data: {
      slugInput: str(fd, "slug") || undefined,
      name,
      summary,
      description,
      nganh,
      loaiHinh,
      coYeuToVanHoaVungMien,
      muc: muc!,
      mucTieu,
      doiTuongPhuHop,
      doiTuongKhongPhuHop,
      durationLabel,
      itinerary,
      baoGom,
      khongBaoGom,
      propertyRef,
      yeuCauTruocKhi,
      chuyenMonDoiNgu,
      quyMoNhom,
      gioiHanCamKet,
      price: price!,
      priceUnit,
      giaTheoLoai,
      chinhSachHuy,
      trangThai: trangThai!,
      images: parseImages(fd, "images", seedBase, name),
    },
  };
}

export async function createProgram(input: ProgramInput): Promise<Program> {
  const list = await getPrograms();
  const slug = ensureUniqueSlug(
    slugify(input.slugInput || input.name),
    new Set(list.map((p) => p.slug)),
  );
  const { slugInput: _slugInput, ...rest } = input;
  const program: Program = { id: crypto.randomUUID(), slug, ...rest };
  await writeJson(PROGRAMS_FILE, [...list, program]);
  return program;
}

export async function updateProgram(
  id: string,
  input: ProgramInput,
): Promise<Program | undefined> {
  const list = await getPrograms();
  const existing = list.find((p) => p.id === id);
  if (!existing) return undefined;

  const slug = ensureUniqueSlug(
    slugify(input.slugInput || input.name),
    new Set(list.map((p) => p.slug)),
    existing.slug,
  );
  const { slugInput: _slugInput, ...rest } = input;
  const updated: Program = { id, slug, ...rest };
  await writeJson(
    PROGRAMS_FILE,
    list.map((p) => (p.id === id ? updated : p)),
  );
  return updated;
}

export async function deleteProgram(id: string): Promise<void> {
  const list = await getPrograms();
  await writeJson(PROGRAMS_FILE, list.filter((p) => p.id !== id));
}

/* ------------------------------ Experience ------------------------------ */

export type ExperienceInput = Omit<Experience, "id" | "slug"> & { slugInput?: string };

export function parseExperienceForm(
  fd: FormData,
  validPropertyIds: Set<string>,
): FormResult<ExperienceInput> {
  const errors: FieldErrors = {};

  const name = str(fd, "name");
  if (name.length < 2) errors.name = "Vui lòng nhập tên (từ 2 ký tự).";

  const nganhRaw = str(fd, "nganh");
  const nganh = (NGANH as readonly string[]).includes(nganhRaw) ? (nganhRaw as Nganh) : undefined;
  if (!nganh) errors.nganh = "Chọn một ngành.";

  const loaiHinhRaw = str(fd, "loaiHinh");
  const loaiHinh = (LOAI_HINH as readonly string[]).includes(loaiHinhRaw)
    ? (loaiHinhRaw as LoaiHinh)
    : undefined;
  if (!loaiHinh) errors.loaiHinh = "Chọn một hình thức dịch vụ.";

  const coYeuToVanHoaVungMien = parseBool(fd, "coYeuToVanHoaVungMien");

  const muc = parseMuc(fd, "muc");
  if (!muc) errors.muc = "Chọn mức dịch vụ.";

  const durationMinutes = parseInt1(fd, "durationMinutes");
  if (!durationMinutes) errors.durationMinutes = "Thời lượng phải là số phút nguyên dương.";

  const description = str(fd, "description");
  if (description.length < 20) errors.description = "Mô tả cần ít nhất 20 ký tự.";

  const benefits = lines(fd, "benefits");
  if (benefits.length === 0) errors.benefits = "Nhập ít nhất một lợi ích, mỗi dòng một ý.";

  const price = parsePrice(fd, "price");
  if (!price) errors.price = "Giá phải là số dương.";

  const propertyRef = str(fd, "propertyRef");
  if (!validPropertyIds.has(propertyRef)) errors.propertyRef = "Chọn nơi tổ chức.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const seedBase = slugify(str(fd, "slug") || name);
  return {
    ok: true,
    data: {
      slugInput: str(fd, "slug") || undefined,
      name,
      nganh: nganh!,
      loaiHinh: loaiHinh!,
      coYeuToVanHoaVungMien,
      muc: muc!,
      durationMinutes: durationMinutes!,
      description,
      benefits,
      price: price!,
      propertyRef,
      images: parseImages(fd, "images", seedBase, name),
    },
  };
}

export async function createExperience(input: ExperienceInput): Promise<Experience> {
  const list = await getExperiences();
  const slug = ensureUniqueSlug(
    slugify(input.slugInput || input.name),
    new Set(list.map((e) => e.slug)),
  );
  const { slugInput: _slugInput, ...rest } = input;
  const experience: Experience = { id: crypto.randomUUID(), slug, ...rest };
  await writeJson(EXPERIENCES_FILE, [...list, experience]);
  return experience;
}

export async function updateExperience(
  id: string,
  input: ExperienceInput,
): Promise<Experience | undefined> {
  const list = await getExperiences();
  const existing = list.find((e) => e.id === id);
  if (!existing) return undefined;

  const slug = ensureUniqueSlug(
    slugify(input.slugInput || input.name),
    new Set(list.map((e) => e.slug)),
    existing.slug,
  );
  const { slugInput: _slugInput, ...rest } = input;
  const updated: Experience = { id, slug, ...rest };
  await writeJson(
    EXPERIENCES_FILE,
    list.map((e) => (e.id === id ? updated : e)),
  );
  return updated;
}

export async function deleteExperience(id: string): Promise<void> {
  const list = await getExperiences();
  await writeJson(EXPERIENCES_FILE, list.filter((e) => e.id !== id));
}

/* -------------------------------- Bài viết -------------------------------- */

export type BaiVietInput = Omit<BaiViet, "id" | "slug"> & { slugInput?: string };

export function parseBaiVietForm(fd: FormData): FormResult<BaiVietInput> {
  const errors: FieldErrors = {};

  const title = str(fd, "title");
  if (title.length < 2) errors.title = "Vui lòng nhập tiêu đề (từ 2 ký tự).";

  const chuyenMucRaw = str(fd, "chuyenMuc");
  const chuyenMuc = (BAI_VIET_CHUYEN_MUC as readonly string[]).includes(chuyenMucRaw)
    ? (chuyenMucRaw as BaiVietChuyenMuc)
    : undefined;
  if (!chuyenMuc) errors.chuyenMuc = "Chọn chuyên mục.";

  const excerpt = str(fd, "excerpt");
  if (excerpt.length < 20) errors.excerpt = "Mô tả ngắn cần ít nhất 20 ký tự.";

  const contentText = str(fd, "content");
  const content = contentText ? parseContentText(contentText) : [];
  if (content.length === 0) errors.content = "Nhập nội dung bài viết.";

  const author = str(fd, "author") || "Đội ngũ Wellnessvietnams";

  const publishedAtRaw = str(fd, "publishedAt");
  const publishedAt = /^\d{4}-\d{2}-\d{2}$/.test(publishedAtRaw)
    ? publishedAtRaw
    : new Date().toISOString().slice(0, 10);

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const seedBase = slugify(str(fd, "slug") || title);
  return {
    ok: true,
    data: {
      slugInput: str(fd, "slug") || undefined,
      title,
      chuyenMuc: chuyenMuc!,
      excerpt,
      content,
      author,
      publishedAt,
      readingMinutes: estimateReadingMinutes(content),
      images: parseImages(fd, "images", seedBase, title),
    },
  };
}

export async function createBaiViet(input: BaiVietInput): Promise<BaiViet> {
  const list = await getBaiVietList();
  const slug = ensureUniqueSlug(
    slugify(input.slugInput || input.title),
    new Set(list.map((b) => b.slug)),
  );
  const { slugInput: _slugInput, ...rest } = input;
  const article: BaiViet = { id: crypto.randomUUID(), slug, ...rest };
  await writeJson(BAI_VIET_FILE, [...list, article]);
  return article;
}

export async function updateBaiViet(
  id: string,
  input: BaiVietInput,
): Promise<BaiViet | undefined> {
  const list = await getBaiVietList();
  const existing = list.find((b) => b.id === id);
  if (!existing) return undefined;

  const slug = ensureUniqueSlug(
    slugify(input.slugInput || input.title),
    new Set(list.map((b) => b.slug)),
    existing.slug,
  );
  const { slugInput: _slugInput, ...rest } = input;
  const updated: BaiViet = { id, slug, ...rest };
  await writeJson(
    BAI_VIET_FILE,
    list.map((b) => (b.id === id ? updated : b)),
  );
  return updated;
}

export async function deleteBaiViet(id: string): Promise<void> {
  const list = await getBaiVietList();
  await writeJson(BAI_VIET_FILE, list.filter((b) => b.id !== id));
}
