"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_COOKIE, createSessionToken, type Actor } from "@/lib/auth";
import { getPartnerByUsername } from "@/lib/partners";
import { verifyPassword } from "@/lib/password";

function timingSafeEqualStr(a: string, b: string) {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

function safeNext(next: string) {
  return next.startsWith("/") && !next.startsWith("//") ? next : "/quan-tri";
}

/**
 * Tài khoản quản trị viên gốc (siêu admin) vẫn cấu hình qua biến môi trường
 * — dùng để đăng nhập lần đầu và tạo các tài khoản đối tác thật trong
 * /quan-tri/doi-tac. Mọi tài khoản khác nằm trong data/partners.json.
 */
async function checkRootAdmin(username: string, password: string): Promise<Actor | null> {
  const rootUsername = process.env.ADMIN_USERNAME || "admin";
  if (!process.env.ADMIN_PASSWORD) return null;
  if (username.toLowerCase() !== rootUsername.toLowerCase()) return null;
  if (!timingSafeEqualStr(password, process.env.ADMIN_PASSWORD)) return null;

  return { id: "root-admin", username: rootUsername, name: "Quản trị viên", role: "admin", propertyIds: [] };
}

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(String(formData.get("next") ?? "/quan-tri"));

  if (!username || !password) {
    redirect(`/quan-tri/dang-nhap?error=thieu-thong-tin&next=${encodeURIComponent(next)}`);
  }

  let actor = await checkRootAdmin(username, password);

  if (!actor) {
    const partner = await getPartnerByUsername(username);
    if (partner && partner.active && verifyPassword(password, partner.passwordHash)) {
      actor = {
        id: partner.id,
        username: partner.username,
        name: partner.name,
        role: partner.role,
        propertyIds: partner.propertyIds,
      };
    }
  }

  if (!actor) {
    redirect(`/quan-tri/dang-nhap?error=sai-tai-khoan&next=${encodeURIComponent(next)}`);
  }

  const token = await createSessionToken(actor);
  (await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  redirect(next);
}
