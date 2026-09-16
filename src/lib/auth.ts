/**
 * Phiên đăng nhập quản trị — không dùng database session, chỉ ký một token
 * bằng HMAC-SHA256 (Web Crypto, chạy được cả ở middleware edge runtime lẫn
 * Node) rồi lưu trong cookie httpOnly. Xác thực lại = tính lại chữ ký và so
 * sánh, không cần tra cứu ở đâu khác.
 *
 * Token mang theo danh tính (Actor) đã ký sẵn — id/vai trò/các Property được
 * quản lý — nên middleware và trang quản trị biết NGAY người đang đăng nhập
 * là ai mà không cần đọc lại data/partners.json mỗi request. Đánh đổi: đổi
 * quyền một tài khoản chỉ có hiệu lực từ lần đăng nhập tiếp theo.
 *
 * File này KHÔNG được import "node:crypto" (băm mật khẩu) — sẽ làm hỏng
 * bundle của middleware (edge runtime). Băm/so khớp mật khẩu nằm ở
 * lib/password.ts, chỉ dùng trong Server Action (Node runtime).
 */

export const ADMIN_COOKIE = "wv_admin";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 giờ

export type PartnerRole = "admin" | "partner";

export type Actor = {
  id: string;
  username: string;
  name: string;
  role: PartnerRole;
  /** Chỉ có ý nghĩa khi role "partner" — id các Property được quản lý. */
  propertyIds: string[];
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function getSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "wellnessvietnams-dev-secret-doi-truoc-khi-deploy"
  );
}

async function hmacKey() {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

function toHex(buf: ArrayBuffer) {
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function sign(payload: string) {
  const key = await hmacKey();
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toHex(sig);
}

function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function toBase64Url(bytes: Uint8Array) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string) {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "=");
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export async function createSessionToken(actor: Actor, ttlMs = SESSION_TTL_MS) {
  const payload = { ...actor, exp: Date.now() + ttlMs };
  const encoded = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const sig = await sign(encoded);
  return `${encoded}.${sig}`;
}

/** Xác thực chữ ký + hạn dùng, trả về Actor đã ký nếu hợp lệ, ngược lại null. */
export async function verifySessionToken(token: string | undefined | null): Promise<Actor | null> {
  if (!token) return null;
  const dot = token.indexOf(".");
  if (dot === -1) return null;

  const encoded = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expected = await sign(encoded);
  if (!constantTimeEqual(expected, sig)) return null;

  try {
    const payload = JSON.parse(decoder.decode(fromBase64Url(encoded))) as Record<string, unknown>;
    if (typeof payload.exp !== "number" || Date.now() > payload.exp) return null;
    if (payload.role !== "admin" && payload.role !== "partner") return null;
    if (typeof payload.id !== "string" || typeof payload.username !== "string") return null;

    return {
      id: payload.id,
      username: payload.username,
      name: typeof payload.name === "string" ? payload.name : payload.username,
      role: payload.role,
      propertyIds: Array.isArray(payload.propertyIds) ? payload.propertyIds.map(String) : [],
    };
  } catch {
    return null;
  }
}
