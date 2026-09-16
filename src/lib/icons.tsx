import {
  Activity,
  BatteryCharging,
  Brain,
  Building2,
  CalendarCheck,
  Clock,
  Dumbbell,
  Flame,
  Flower2,
  Home as HomeIcon,
  Inbox,
  Moon,
  Newspaper,
  Palmtree,
  Route,
  Soup,
  Sparkles,
  Ticket,
  Trees,
  Wind,
  type LucideIcon,
} from "lucide-react";

import type { BaiVietChuyenMuc, LoaiHinh, Nganh, PropertyType } from "./types";

/** Icon minh hoạ cho từng Ngành chính thức — dùng ở tag, filter, danh sách (trục chính). */
export const NGANH_ICON: Record<Nganh, LucideIcon> = {
  "Giảm căng thẳng & Phục hồi năng lượng": BatteryCharging,
  "Cải thiện giấc ngủ": Moon,
  "Thanh lọc cơ thể": Wind,
  "Tăng cường thể lực": Dumbbell,
  "Cân bằng cảm xúc & Chánh niệm": Brain,
  "Dưỡng sinh & Phòng ngừa theo Y học phương đông": Flame,
  "Làm đẹp & Thư giãn": Sparkles,
};

/** Icon minh hoạ cho từng Hình thức dịch vụ (loại hình) — thuộc tính phụ, dùng ở tag, filter, danh sách. */
export const LOAI_HINH_ICON: Record<LoaiHinh, LucideIcon> = {
  "Ăn ngủ & Dinh dưỡng": Soup,
  "Spa & Làm đẹp": Sparkles,
  "Vận động & Thân-tâm": Activity,
  "Sức khỏe tinh thần": Brain,
  "Thiên nhiên & Sinh thái": Trees,
  "Y học phương đông": Flame,
};

/** Icon cho từng loại chỗ ở. */
export const PROPERTY_TYPE_ICON: Record<PropertyType, LucideIcon> = {
  Home: HomeIcon,
  Villa: Building2,
  Resort: Palmtree,
  Retreat: Flower2,
};

/** Icon dùng cho trạng thái rỗng (không có kết quả). */
export const EMPTY_STATE_ICON = Inbox;

/** Icon đại diện cho từng tab nội dung. */
export const STAY_ICON = Building2;
export const PROGRAM_ICON = Route;
export const EXPERIENCE_ICON = Ticket;
export const ARTICLE_ICON = Newspaper;
export const DURATION_ICON = Clock;
export const BOOKING_ICON = CalendarCheck;

/** Icon cho từng chuyên mục Bài viết — dùng chung bộ icon Loại hình, thêm "Ngành wellness". */
export const CHUYEN_MUC_ICON: Record<BaiVietChuyenMuc, LucideIcon> = {
  "Ngành wellness": Newspaper,
  ...LOAI_HINH_ICON,
};
