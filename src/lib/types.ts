/**
 * 7 Ngành chính thức — trục filter chính của toàn bộ trang, trả lời câu hỏi
 * "Bạn đang cần điều gì?". Dùng chung cho cả 3 tab (Lưu trú / Chương trình /
 * Trải nghiệm), thay cho vai trò trước đây của LOAI_HINH.
 */
export const NGANH = [
  "Giảm căng thẳng & Phục hồi năng lượng",
  "Cải thiện giấc ngủ",
  "Thanh lọc cơ thể",
  "Tăng cường thể lực",
  "Cân bằng cảm xúc & Chánh niệm",
  "Dưỡng sinh & Phòng ngừa theo Y học phương đông",
  "Làm đẹp & Thư giãn",
] as const;

export type Nganh = (typeof NGANH)[number];

/**
 * 6 giá trị cố định — mô tả HÌNH THỨC dịch vụ (spa, vận động, y học phương
 * đông...), là thuộc tính phụ đi kèm mỗi Ngành, không còn là trục filter
 * chính (xem NGANH ở trên).
 */
export const LOAI_HINH = [
  "Ăn ngủ & Dinh dưỡng",
  "Spa & Làm đẹp",
  "Vận động & Thân-tâm",
  "Sức khỏe tinh thần",
  "Thiên nhiên & Sinh thái",
  "Y học phương đông",
] as const;

export type LoaiHinh = (typeof LOAI_HINH)[number];

/** Hệ Mức áp dụng thống nhất cho Property / Program / Experience. */
export type Muc = 1 | 2 | 3;

export const MUC_META: Record<
  Muc,
  { stars: string; label: string; short: string; description: string }
> = {
  1: {
    stars: "★☆☆",
    label: "Mức 1 – Tiện nghi",
    short: "Tiện nghi",
    description:
      "Có sẵn tại nơi lưu trú, khách tự sử dụng, không cần người hỗ trợ.",
  },
  2: {
    stars: "★★☆",
    label: "Mức 2 – Đồng hành",
    short: "Đồng hành",
    description:
      "Có người hướng dẫn đi cùng, từ một buổi cho đến hành trình đa ngày.",
  },
  3: {
    stars: "★★★",
    label: "Mức 3 – Chuyên gia",
    short: "Chuyên gia",
    description:
      "Y tế / tâm lý / cá nhân hóa 1-kèm-1, do người có chứng chỉ hành nghề thực hiện.",
  },
};

/** Mục tiêu chương trình hướng tới — dùng để khách lọc theo nhu cầu cụ thể của mình. */
export const MUC_TIEU = [
  "Phục hồi thể lực",
  "Giảm căng thẳng",
  "Cải thiện giấc ngủ",
  "Thanh lọc cơ thể",
  "Cân bằng vóc dáng",
  "Gắn kết đôi lứa & gia đình",
  "Cai nghiện kỹ thuật số",
  "Chăm sóc sau sinh",
] as const;

export type MucTieu = (typeof MUC_TIEU)[number];

export type PropertyType = "Home" | "Villa" | "Resort" | "Retreat";

export const PROPERTY_TYPE_LABEL: Record<PropertyType, string> = {
  Home: "Homestay",
  Villa: "Villa",
  Resort: "Resort",
  Retreat: "Retreat",
};

export type TrangThai = "Đang nhận khách" | "Sắp mở" | "Tạm dừng";

export interface ImageRef {
  /** Dùng làm seed cho tranh minh hoạ SVG sinh tại chỗ khi chưa có ảnh/video thật. */
  seed: string;
  alt: string;
  /** "image" (ảnh thật) hoặc "video" (nhúng từ YouTube/Vimeo). Bỏ trống = dùng minh hoạ SVG từ seed. */
  kind?: "image" | "video";
  /** URL ảnh thật, hoặc URL nhúng (embed) của video đã chuẩn hoá từ link người dùng dán vào. */
  src?: string;
  /** Ảnh đại diện tĩnh cho video — dùng ở khung nhỏ (thẻ danh sách, ảnh phụ) thay vì phát trực tiếp. */
  thumbnailSrc?: string;
}

/** Một hạng phòng trong một nơi lưu trú — dùng để hiển thị tiêu chuẩn và cho khách chọn khi đặt phòng. */
export interface RoomType {
  /** Duy nhất trong phạm vi một Property (không phải toàn hệ thống). */
  id: string;
  name: string;
  sucChua: number;
  /** Diện tích, giữ dạng chữ tự do — vd "28 m²". */
  dienTich?: string;
  giaThamKhao: number;
  giaUnit: string;
  /** Số phòng loại này hiện có — chỉ để hiển thị, không khoá tồn kho thật. */
  soLuong?: number;
  /** Mô tả riêng của hạng phòng — view, cách bài trí, điểm khác với các hạng khác. */
  description: string;
  images: ImageRef[];
  /** Tiêu chuẩn / tiện nghi, mỗi dòng một ý. */
  tieuChuan: string[];
}

/** Một điểm đến/tiện ích lân cận nơi ở — dùng để khách hình dung khu vực xung quanh. */
export interface DiemDenLanCan {
  ten: string;
  /** Khoảng cách hoặc thời gian di chuyển, giữ dạng chữ tự do — vd "15 phút đi bộ". */
  khoangCach: string;
}

export interface Property {
  id: string;
  slug: string;
  name: string;
  type: PropertyType;
  region: string;
  images: ImageRef[];
  description: string;
  highlights: string[];
  /** Ngành chính thức — trục filter chính, trả lời "khách đang cần điều gì". */
  nganh: Nganh[];
  loaiHinh: LoaiHinh[];
  /** Trải nghiệm ở đây có được thiết kế có mục đích chữa lành từ văn hoá bản địa (nghi lễ, tri thức dưỡng sinh truyền thống) hay không — không dùng cho tham quan/mua sắm thông thường. */
  coYeuToVanHoaVungMien: boolean;
  mucCaoNhat: Muc;
  giaThamKhao: number;
  giaUnit: string;
  trangThai: TrangThai;
  /** Các hạng phòng cụ thể — có thể rỗng nếu nơi ở chỉ có một loại chỗ duy nhất. */
  roomTypes: RoomType[];
  /** Tiện ích chung của cả nơi ở (không thuộc riêng hạng phòng nào) — wifi, bãi đỗ xe, đưa đón... */
  tienIch: string[];
  /** Điểm tham quan/tiện ích quanh khu vực, kèm khoảng cách. */
  diemDenLanCan: DiemDenLanCan[];
  /**
   * Chuẩn bị data model cho thanh toán "Combo Tiết Kiệm" (SME) — CHƯA có
   * luồng thanh toán thật, chưa có UI dùng field này ở giai đoạn 1. Tiền
   * luôn đi thẳng vào tài khoản/merchant ID của TỪNG property, không có
   * khái niệm "tài khoản thanh toán chung của nền tảng" (xem mục Mô hình
   * kinh doanh & Vai trò pháp lý — nền tảng là trung gian marketing, không
   * giữ hộ tiền). Không thêm ZaloPay ở giai đoạn này.
   */
  thanhToan?: {
    /** Số tài khoản ngân hàng của property — kênh thanh toán chính. */
    vietQrBankAccount?: string;
    /** ID merchant Momo Business của property — kênh phụ, không bắt buộc. */
    momoMerchantId?: string;
  };
}

/** Trạng thái mở bán của một Chương trình — khác với TrangThai của Property vì đây là gói bán theo đợt, không phải chỗ ở vận hành liên tục. */
export const PROGRAM_TRANG_THAI = ["Đang mở bán", "Theo mùa", "Tạm ngừng"] as const;
export type ProgramTrangThai = (typeof PROGRAM_TRANG_THAI)[number];

export interface Program {
  id: string;
  slug: string;
  name: string;
  /** Tóm tắt ngắn — dùng ở thẻ danh sách và meta description. */
  summary: string;
  /** Mô tả đầy đủ — phần "Tổng quan" trên trang chi tiết. */
  description: string;
  images: ImageRef[];

  // Phân loại
  /** Ngành chính thức — trục filter chính, trả lời "khách đang cần điều gì". */
  nganh: Nganh[];
  loaiHinh: LoaiHinh[];
  /** Chương trình có được thiết kế có mục đích chữa lành từ văn hoá bản địa (nghi lễ, tri thức dưỡng sinh truyền thống) hay không — không dùng cho tham quan/mua sắm thông thường. */
  coYeuToVanHoaVungMien: boolean;
  muc: Muc;
  mucTieu: MucTieu[];
  /** Chân dung khách phù hợp, mỗi dòng một ý — vd "Người hay mất ngủ, làm việc quá tải". */
  doiTuongPhuHop: string[];
  /** Cảnh báo chống chỉ định, mỗi dòng một ý — vd "Phụ nữ mang thai", "Người mới phẫu thuật trong 3 tháng". */
  doiTuongKhongPhuHop: string[];

  // Nội dung
  durationLabel: string;
  /** Rich text đơn giản: mỗi ngày một khối, mỗi khối nhiều dòng lịch trình. */
  itinerary: { day: string; title: string; items: string[] }[];
  /** Những gì đã gồm trong giá — vd "Toàn bộ bữa ăn theo thể trạng". */
  baoGom: string[];
  /** Những gì khách tự lo — vd "Di chuyển tới nơi tổ chức". */
  khongBaoGom: string[];
  propertyRef: string;

  // Vận hành & an toàn
  /** Việc khách cần chuẩn bị/khai báo trước khi tham gia — vd "Khai báo tiền sử bệnh lý". */
  yeuCauTruocKhi: string[];
  /** Mô tả ngắn về đội ngũ phụ trách — vd "Lương y y học cổ truyền có giấy phép hành nghề". */
  chuyenMonDoiNgu: string;
  /** Quy mô nhóm tối thiểu/tối đa — bỏ trống nếu chương trình chỉ phục vụ riêng từng khách. */
  quyMoNhom?: { min: number; max: number };
  /** Giới hạn/cam kết vận hành — vd "Chỉ nhận khách đăng ký trọn gói, không tách lẻ từng ngày". */
  gioiHanCamKet: string;

  // Thương mại
  price: number;
  priceUnit: string;
  /** Giá phân theo hạng phòng/loại khách nếu khác giá tham khảo — vd phòng đôi so với phòng đơn. */
  giaTheoLoai?: { loai: string; gia: number }[];
  chinhSachHuy: string;
  trangThai: ProgramTrangThai;
}

export interface Experience {
  id: string;
  slug: string;
  name: string;
  /** Ngành chính thức — trục filter chính, trả lời "khách đang cần điều gì". */
  nganh: Nganh;
  loaiHinh: LoaiHinh;
  /** Buổi này có được thiết kế có mục đích chữa lành từ văn hoá bản địa (nghi lễ, tri thức dưỡng sinh truyền thống) hay không — không dùng cho tham quan/mua sắm thông thường. */
  coYeuToVanHoaVungMien: boolean;
  muc: Muc;
  durationMinutes: number;
  description: string;
  benefits: string[];
  images: ImageRef[];
  price: number;
  propertyRef: string;
}

/** Chuyên mục cho Bài viết kiến thức: 6 loại hình dùng chung + một mục giới thiệu ngành. */
export const BAI_VIET_CHUYEN_MUC = ["Ngành wellness", ...LOAI_HINH] as const;
export type BaiVietChuyenMuc = (typeof BAI_VIET_CHUYEN_MUC)[number];

export type ContentBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

export interface BaiViet {
  id: string;
  slug: string;
  title: string;
  chuyenMuc: BaiVietChuyenMuc;
  /** Tóm tắt ngắn — dùng ở thẻ danh sách và meta description. */
  excerpt: string;
  content: ContentBlock[];
  images: ImageRef[];
  author: string;
  /** ISO date, dạng "YYYY-MM-DD". */
  publishedAt: string;
  readingMinutes: number;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  date: string;
  loaiHinhQuanTam: LoaiHinh | "Chưa rõ, cần tư vấn";
  note: string;
  createdAt: string;
  /** Trang/nội dung khách đang xem khi gửi form — giúp sale vào đúng ngữ cảnh. */
  source?: string;
  /** Tư vấn viên đã liên hệ khách hay chưa — đánh dấu thủ công trong trang quản trị. */
  contactedAt?: string;
}

export type PartnerRole = "admin" | "partner";

/**
 * Tài khoản đăng nhập /quan-tri. "admin" toàn quyền trên mọi nội dung.
 * "partner" chỉ quản lý được các Property nằm trong propertyIds (và các
 * Program/Experience/Booking gắn với những Property đó) — xem lib/scope.ts.
 */
export interface PartnerAccount {
  id: string;
  /** Dùng để đăng nhập — duy nhất, không phân biệt hoa/thường. */
  username: string;
  /** "salt:hash" theo scrypt — không bao giờ trả nguyên văn ra ngoài server, xem lib/password.ts. */
  passwordHash: string;
  /** Tên hiển thị — vd tên đối tác hoặc tên nhân viên vận hành. */
  name: string;
  role: PartnerRole;
  /** Các Property được quản lý — bỏ trống nếu role "admin" (không cần vì đã toàn quyền). */
  propertyIds: string[];
  /** Tắt để khoá đăng nhập mà không cần xoá tài khoản. */
  active: boolean;
  createdAt: string;
}

export const BOOKING_STATUS = ["Chờ xác nhận", "Đã xác nhận", "Đã huỷ"] as const;
export type BookingStatus = (typeof BOOKING_STATUS)[number];

/**
 * Yêu cầu đặt phòng gửi từ trang chi tiết Lưu trú. Đây là "giữ chỗ tạm" —
 * không khoá tồn kho, không thu tiền; tư vấn viên xác nhận phòng còn trống
 * qua điện thoại rồi đổi trạng thái trong trang quản trị.
 */
export interface Booking {
  id: string;
  propertyId: string;
  propertyName: string;
  propertySlug: string;
  roomTypeId?: string;
  roomTypeName?: string;
  /** ISO date "YYYY-MM-DD". */
  checkIn: string;
  /** ISO date "YYYY-MM-DD". */
  checkOut: string;
  nights: number;
  guests: number;
  name: string;
  phone: string;
  email?: string;
  note: string;
  /** nights * giá hạng phòng (hoặc giá tham khảo của property nếu không chọn hạng phòng) — chỉ mang tính tham khảo. */
  estimatedTotal?: number;
  status: BookingStatus;
  createdAt: string;
  confirmedAt?: string;
}
