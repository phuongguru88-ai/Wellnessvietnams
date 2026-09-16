"use server";

import { redirect } from "next/navigation";

import {
  createProgram,
  deleteProgram,
  getProgramById,
  getProperties,
  parseProgramForm,
  updateProgram,
  type FieldErrors,
} from "@/lib/data";
import { getActor, ownsProperty, scopeProperties } from "@/lib/scope";

export type ProgramFormState = { errors: FieldErrors } | null;

export async function createProgramAction(
  _prev: ProgramFormState,
  formData: FormData,
): Promise<ProgramFormState> {
  const actor = await getActor();
  if (!actor) return { errors: { name: "Phiên đăng nhập đã hết hạn." } };

  // validIds chỉ gồm property của chính actor — partner không thể gán
  // chương trình cho property của đối tác khác dù có sửa giá trị form.
  const validIds = new Set(scopeProperties(actor, await getProperties()).map((p) => p.id));
  const result = parseProgramForm(formData, validIds);
  if (!result.ok) return { errors: result.errors };

  const program = await createProgram(result.data);
  redirect(`/quan-tri/chuong-trinh/${program.id}/sua?created=1`);
}

export async function updateProgramAction(
  id: string,
  _prev: ProgramFormState,
  formData: FormData,
): Promise<ProgramFormState> {
  const actor = await getActor();
  const existing = await getProgramById(id);
  if (!actor || !existing || !ownsProperty(actor, existing.propertyRef)) {
    return { errors: { name: "Bạn không có quyền sửa chương trình này." } };
  }

  const validIds = new Set(scopeProperties(actor, await getProperties()).map((p) => p.id));
  const result = parseProgramForm(formData, validIds);
  if (!result.ok) return { errors: result.errors };

  const updated = await updateProgram(id, result.data);
  if (!updated) {
    return { errors: { name: "Không tìm thấy chương trình này (có thể đã bị xoá)." } };
  }
  redirect(`/quan-tri/chuong-trinh/${id}/sua?saved=1`);
}

export async function deleteProgramAction(id: string) {
  const actor = await getActor();
  const existing = await getProgramById(id);
  if (!actor || !existing || !ownsProperty(actor, existing.propertyRef)) {
    redirect(`/quan-tri/chuong-trinh?error=${encodeURIComponent("Bạn không có quyền xoá chương trình này.")}`);
  }

  await deleteProgram(id);
  redirect("/quan-tri/chuong-trinh?deleted=1");
}
