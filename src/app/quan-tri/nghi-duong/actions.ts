"use server";

import { redirect } from "next/navigation";

import {
  createProperty,
  deleteProperty,
  parsePropertyForm,
  updateProperty,
  type FieldErrors,
} from "@/lib/data";
import { getActor, ownsProperty } from "@/lib/scope";

export type PropertyFormState = { errors: FieldErrors } | null;

export async function createPropertyAction(
  _prev: PropertyFormState,
  formData: FormData,
): Promise<PropertyFormState> {
  // Tạo mới chỉ dành cho đội vận hành trung tâm (xem trang moi/page.tsx) —
  // kiểm tra lại ở action vì đây mới là nơi thực sự ghi dữ liệu.
  const actor = await getActor();
  if (actor?.role !== "admin") {
    return { errors: { name: "Bạn không có quyền tạo nơi nghỉ dưỡng mới." } };
  }

  const result = parsePropertyForm(formData);
  if (!result.ok) return { errors: result.errors };

  const property = await createProperty(result.data);
  redirect(`/quan-tri/nghi-duong/${property.id}/sua?created=1`);
}

export async function updatePropertyAction(
  id: string,
  _prev: PropertyFormState,
  formData: FormData,
): Promise<PropertyFormState> {
  const actor = await getActor();
  if (!actor || !ownsProperty(actor, id)) {
    return { errors: { name: "Bạn không có quyền sửa nơi nghỉ dưỡng này." } };
  }

  const result = parsePropertyForm(formData);
  if (!result.ok) return { errors: result.errors };

  const updated = await updateProperty(id, result.data);
  if (!updated) {
    return { errors: { name: "Không tìm thấy nơi nghỉ dưỡng này (có thể đã bị xoá)." } };
  }
  redirect(`/quan-tri/nghi-duong/${id}/sua?saved=1`);
}

export async function deletePropertyAction(id: string) {
  const actor = await getActor();
  if (!actor || !ownsProperty(actor, id)) {
    redirect(`/quan-tri/nghi-duong?error=${encodeURIComponent("Bạn không có quyền xoá nơi nghỉ dưỡng này.")}`);
  }

  const result = await deleteProperty(id);
  if (!result.ok) {
    redirect(`/quan-tri/nghi-duong?error=${encodeURIComponent(result.reason)}`);
  }
  redirect("/quan-tri/nghi-duong?deleted=1");
}
