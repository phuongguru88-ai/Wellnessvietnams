import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Băm mật khẩu tài khoản đối tác bằng scrypt (Node crypto — CHỈ được import
 * từ Server Action/Server Component, không bao giờ từ middleware.ts, vì
 * "node:crypto" không chạy được ở edge runtime). Xem lib/auth.ts để biết vì
 * sao việc ký phiên đăng nhập lại tách riêng, dùng Web Crypto.
 */

const KEY_LEN = 64;

/** Trả về chuỗi "salt:hash" (cả hai dạng hex) — lưu thẳng vào PartnerAccount.passwordHash. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LEN).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;

  const hashBuf = Buffer.from(hash, "hex");
  const candidate = scryptSync(password, salt, hashBuf.length);
  if (candidate.length !== hashBuf.length) return false;
  return timingSafeEqual(candidate, hashBuf);
}
