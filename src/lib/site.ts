export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://wellnessvietnams.com"
).replace(/\/$/, "");

export const SITE_NAME = "Wellnessvietnams";

export const SITE_TAGLINE =
  "Mạng lưới home, villa, resort và retreat wellness tại Việt Nam";

export const SITE_DESCRIPTION =
  "Wellnessvietnams tuyển chọn home, villa, resort và retreat wellness khắp Việt Nam theo y học phương đông, ẩm thực và thiên nhiên bản địa từng vùng miền, kết hợp cùng tiêu chuẩn nghỉ dưỡng thông thường. Xem lưu trú, chương trình và vé trải nghiệm, để lại thông tin để được tư vấn.";

export const CONTACT = {
  phone: "0909 000 000",
  phoneHref: "tel:+84909000000",
  email: "hello@wellnessvietnams.com",
  zalo: "0909 000 000",
  hours: "8:00 – 21:00 mỗi ngày",
};

export const NAV = [
  { href: "/luu-tru", label: "Lưu trú" },
  { href: "/chuong-trinh", label: "Chương trình" },
  { href: "/trai-nghiem", label: "Trải nghiệm" },
  { href: "/kien-thuc", label: "Kiến thức" },
  { href: "/tro-ly-wellness", label: "Trợ lý AI" },
  { href: "/ve-chung-toi", label: "Về chúng tôi" },
] as const;
