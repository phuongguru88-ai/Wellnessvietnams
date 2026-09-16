"use server";

import { redirect } from "next/navigation";

import {
  createPartner,
  deletePartner,
  getPartnerById,
  parsePartnerForm,
  updatePartner,
  usernameOwnerMap,
  type FieldErrors,
} from "@/lib/partners";
import { getActor } from "@/lib/scope";

export type PartnerFormState = { errors: FieldErrors } | null;

async function requireAdmin() {
  const actor = await getActor();
  return actor?.role === "admin";
}

export async function createPartnerAction(
  _prev: PartnerFormState,
  formData: FormData,
): Promise<PartnerFormState> {
  if (!(await requireAdmin())) return { errors: { name: "Bạn không có quyền tạo tài khoản đối tác." } };

  const result = parsePartnerForm(formData, await usernameOwnerMap());
  if (!result.ok) return { errors: result.errors };

  const partner = await createPartner(result.data);
  redirect(`/quan-tri/doi-tac/${partner.id}/sua?created=1`);
}

export async function updatePartnerAction(
  id: string,
  _prev: PartnerFormState,
  formData: FormData,
): Promise<PartnerFormState> {
  if (!(await requireAdmin())) return { errors: { name: "Bạn không có quyền sửa tài khoản đối tác." } };

  const existing = await getPartnerById(id);
  if (!existing) return { errors: { name: "Không tìm thấy tài khoản này (có thể đã bị xoá)." } };

  const result = parsePartnerForm(formData, await usernameOwnerMap(), id, existing.passwordHash);
  if (!result.ok) return { errors: result.errors };

  await updatePartner(id, result.data);
  redirect(`/quan-tri/doi-tac/${id}/sua?saved=1`);
}

export async function deletePartnerAction(id: string) {
  if (!(await requireAdmin())) redirect("/quan-tri/doi-tac");

  await deletePartner(id);
  redirect("/quan-tri/doi-tac?deleted=1");
}
