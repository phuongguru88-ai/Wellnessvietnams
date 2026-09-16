"use server";

import { redirect } from "next/navigation";

import {
  createBaiViet,
  deleteBaiViet,
  parseBaiVietForm,
  updateBaiViet,
  type FieldErrors,
} from "@/lib/data";
import { getActor } from "@/lib/scope";

export type BaiVietFormState = { errors: FieldErrors } | null;

// Bài viết kiến thức không gắn với một Property cụ thể — chỉ đội nội dung
// trung tâm (role admin) được tạo/sửa/xoá, xem lib/scope.ts.
async function requireAdmin() {
  const actor = await getActor();
  return actor?.role === "admin";
}

export async function createBaiVietAction(
  _prev: BaiVietFormState,
  formData: FormData,
): Promise<BaiVietFormState> {
  if (!(await requireAdmin())) return { errors: { title: "Bạn không có quyền tạo bài viết." } };

  const result = parseBaiVietForm(formData);
  if (!result.ok) return { errors: result.errors };

  const article = await createBaiViet(result.data);
  redirect(`/quan-tri/bai-viet/${article.id}/sua?created=1`);
}

export async function updateBaiVietAction(
  id: string,
  _prev: BaiVietFormState,
  formData: FormData,
): Promise<BaiVietFormState> {
  if (!(await requireAdmin())) return { errors: { title: "Bạn không có quyền sửa bài viết." } };

  const result = parseBaiVietForm(formData);
  if (!result.ok) return { errors: result.errors };

  const updated = await updateBaiViet(id, result.data);
  if (!updated) {
    return { errors: { title: "Không tìm thấy bài viết này (có thể đã bị xoá)." } };
  }
  redirect(`/quan-tri/bai-viet/${id}/sua?saved=1`);
}

export async function deleteBaiVietAction(id: string) {
  if (!(await requireAdmin())) redirect("/quan-tri/bai-viet");

  await deleteBaiViet(id);
  redirect("/quan-tri/bai-viet?deleted=1");
}
