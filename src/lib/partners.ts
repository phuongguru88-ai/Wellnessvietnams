import { hashPassword } from "./password";
import { slugify } from "./slug";
import { readJson, writeJson } from "./store";
import type { PartnerAccount, PartnerRole } from "./types";

const PARTNERS_FILE = "partners.json";

export async function getPartners(): Promise<PartnerAccount[]> {
  return readJson<PartnerAccount[]>(PARTNERS_FILE, []);
}

export async function getPartnerById(id: string) {
  return (await getPartners()).find((p) => p.id === id);
}

export async function getPartnerByUsername(username: string) {
  const needle = username.trim().toLowerCase();
  return (await getPartners()).find((p) => p.username.toLowerCase() === needle);
}

export type FieldErrors = Record<string, string>;
export type FormResult<T> = { ok: true; data: T } | { ok: false; errors: FieldErrors };

export type PartnerInput = Omit<PartnerAccount, "id" | "createdAt">;

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const ROLES: PartnerRole[] = ["admin", "partner"];

/**
 * `existingId`: truyền id đang sửa để loại chính nó khỏi kiểm tra trùng
 * username. `keepPasswordHash`: hash hiện có — dùng khi sửa và người dùng để
 * trống ô mật khẩu (nghĩa là không đổi).
 */
export function parsePartnerForm(
  fd: FormData,
  existingUsernames: Map<string, string>,
  existingId?: string,
  keepPasswordHash?: string,
): FormResult<PartnerInput> {
  const errors: FieldErrors = {};

  const name = str(fd, "name");
  if (name.length < 2) errors.name = "Vui lòng nhập tên (từ 2 ký tự).";

  const usernameRaw = str(fd, "username");
  const username = usernameRaw ? slugify(usernameRaw) : "";
  if (username.length < 3) {
    errors.username = "Tên đăng nhập cần ít nhất 3 ký tự (chữ, số, gạch nối).";
  } else {
    const owner = existingUsernames.get(username);
    if (owner && owner !== existingId) {
      errors.username = "Tên đăng nhập này đã có người dùng.";
    }
  }

  const password = str(fd, "password");
  let passwordHash = keepPasswordHash;
  if (!keepPasswordHash && !password) {
    errors.password = "Vui lòng đặt mật khẩu.";
  } else if (password && password.length < 8) {
    errors.password = "Mật khẩu cần ít nhất 8 ký tự.";
  } else if (password) {
    passwordHash = hashPassword(password);
  }

  const roleRaw = str(fd, "role");
  const role = ROLES.includes(roleRaw as PartnerRole) ? (roleRaw as PartnerRole) : undefined;
  if (!role) errors.role = "Chọn vai trò.";

  const propertyIds = fd.getAll("propertyIds").map(String);
  if (role === "partner" && propertyIds.length === 0) {
    errors.propertyIds = "Chọn ít nhất một nơi lưu trú cho tài khoản đối tác.";
  }

  const active = fd.get("active") !== null;

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      username,
      passwordHash: passwordHash!,
      name,
      role: role!,
      propertyIds: role === "admin" ? [] : propertyIds,
      active,
    },
  };
}

export async function createPartner(input: PartnerInput): Promise<PartnerAccount> {
  const list = await getPartners();
  const partner: PartnerAccount = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  };
  await writeJson(PARTNERS_FILE, [...list, partner]);
  return partner;
}

export async function updatePartner(
  id: string,
  input: PartnerInput,
): Promise<PartnerAccount | undefined> {
  const list = await getPartners();
  const existing = list.find((p) => p.id === id);
  if (!existing) return undefined;

  const updated: PartnerAccount = { ...existing, ...input, id };
  await writeJson(
    PARTNERS_FILE,
    list.map((p) => (p.id === id ? updated : p)),
  );
  return updated;
}

export async function deletePartner(id: string): Promise<void> {
  const list = await getPartners();
  await writeJson(PARTNERS_FILE, list.filter((p) => p.id !== id));
}

/** Dùng để kiểm tra trùng username khi tạo/sửa — map username (thường) -> id chủ sở hữu. */
export async function usernameOwnerMap(): Promise<Map<string, string>> {
  const list = await getPartners();
  return new Map(list.map((p) => [p.username.toLowerCase(), p.id]));
}
