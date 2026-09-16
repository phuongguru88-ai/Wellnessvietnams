import { cookies } from "next/headers";

import { ADMIN_COOKIE, verifySessionToken, type Actor } from "./auth";

/**
 * Đọc actor (ai đang đăng nhập) từ cookie phiên — dùng ở Server
 * Component/Server Action trong /quan-tri. middleware.ts đã chặn truy cập
 * khi cookie không hợp lệ, nhưng mọi trang/action vẫn tự đọc lại actor ở
 * đây để biết CỤ THỂ là ai và role gì — không chỉ true/false — rồi mới
 * quyết định lọc/chặn dữ liệu theo lib/scope.ts.
 */
export async function getActor(): Promise<Actor | null> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  return verifySessionToken(token);
}

/** true nếu actor có toàn quyền (role admin) hoặc sở hữu Property này. */
export function ownsProperty(actor: Actor, propertyId: string): boolean {
  return actor.role === "admin" || actor.propertyIds.includes(propertyId);
}

/** Lọc danh sách Property theo quyền — admin thấy tất cả, partner chỉ thấy của mình. */
export function scopeProperties<T extends { id: string }>(actor: Actor, list: T[]): T[] {
  return actor.role === "admin" ? list : list.filter((p) => actor.propertyIds.includes(p.id));
}

/** Lọc danh sách Program/Experience/Booking theo Property mà chúng gắn vào. */
export function scopeByPropertyRef<T extends { propertyId?: string; propertyRef?: string }>(
  actor: Actor,
  list: T[],
): T[] {
  if (actor.role === "admin") return list;
  return list.filter((item) => {
    const propertyId = item.propertyRef ?? item.propertyId;
    return propertyId ? actor.propertyIds.includes(propertyId) : false;
  });
}
