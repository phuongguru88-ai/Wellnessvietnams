"use server";

import { redirect } from "next/navigation";

import {
  createExperience,
  deleteExperience,
  getExperienceById,
  getProperties,
  parseExperienceForm,
  updateExperience,
  type FieldErrors,
} from "@/lib/data";
import { getActor, ownsProperty, scopeProperties } from "@/lib/scope";

export type ExperienceFormState = { errors: FieldErrors } | null;

export async function createExperienceAction(
  _prev: ExperienceFormState,
  formData: FormData,
): Promise<ExperienceFormState> {
  const actor = await getActor();
  if (!actor) return { errors: { name: "Phiên đăng nhập đã hết hạn." } };

  const validIds = new Set(scopeProperties(actor, await getProperties()).map((p) => p.id));
  const result = parseExperienceForm(formData, validIds);
  if (!result.ok) return { errors: result.errors };

  const experience = await createExperience(result.data);
  redirect(`/quan-tri/trai-nghiem/${experience.id}/sua?created=1`);
}

export async function updateExperienceAction(
  id: string,
  _prev: ExperienceFormState,
  formData: FormData,
): Promise<ExperienceFormState> {
  const actor = await getActor();
  const existing = await getExperienceById(id);
  if (!actor || !existing || !ownsProperty(actor, existing.propertyRef)) {
    return { errors: { name: "Bạn không có quyền sửa vé/buổi này." } };
  }

  const validIds = new Set(scopeProperties(actor, await getProperties()).map((p) => p.id));
  const result = parseExperienceForm(formData, validIds);
  if (!result.ok) return { errors: result.errors };

  const updated = await updateExperience(id, result.data);
  if (!updated) {
    return { errors: { name: "Không tìm thấy vé/buổi này (có thể đã bị xoá)." } };
  }
  redirect(`/quan-tri/trai-nghiem/${id}/sua?saved=1`);
}

export async function deleteExperienceAction(id: string) {
  const actor = await getActor();
  const existing = await getExperienceById(id);
  if (!actor || !existing || !ownsProperty(actor, existing.propertyRef)) {
    redirect(`/quan-tri/trai-nghiem?error=${encodeURIComponent("Bạn không có quyền xoá vé/buổi này.")}`);
  }

  await deleteExperience(id);
  redirect("/quan-tri/trai-nghiem?deleted=1");
}
