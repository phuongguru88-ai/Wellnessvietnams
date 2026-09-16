"use server";

import { redirect } from "next/navigation";

import {
  createRoomType,
  deleteRoomType,
  getPropertyById,
  getRoomType,
  parseRoomTypeForm,
  updateRoomType,
  type FieldErrors,
} from "@/lib/data";
import { getActor, ownsProperty } from "@/lib/scope";

export type RoomTypeFormState = { errors: FieldErrors } | null;

export async function createRoomTypeAction(
  propertyId: string,
  _prev: RoomTypeFormState,
  formData: FormData,
): Promise<RoomTypeFormState> {
  const actor = await getActor();
  const property = await getPropertyById(propertyId);
  if (!actor || !property || !ownsProperty(actor, propertyId)) {
    return { errors: { name: "Bạn không có quyền thêm hạng phòng cho nơi lưu trú này." } };
  }

  const result = parseRoomTypeForm(formData, property.giaUnit);
  if (!result.ok) return { errors: result.errors };

  const room = await createRoomType(propertyId, result.data);
  if (!room) {
    return { errors: { name: "Không tìm thấy nơi lưu trú này (có thể đã bị xoá)." } };
  }
  redirect(`/quan-tri/luu-tru/${propertyId}/phong?created=1`);
}

export async function updateRoomTypeAction(
  propertyId: string,
  roomId: string,
  _prev: RoomTypeFormState,
  formData: FormData,
): Promise<RoomTypeFormState> {
  const actor = await getActor();
  const existing = await getRoomType(propertyId, roomId);
  if (!actor || !existing || !ownsProperty(actor, propertyId)) {
    return { errors: { name: "Bạn không có quyền sửa hạng phòng này." } };
  }

  const result = parseRoomTypeForm(formData, existing.property.giaUnit);
  if (!result.ok) return { errors: result.errors };

  const room = await updateRoomType(propertyId, roomId, result.data);
  if (!room) {
    return { errors: { name: "Không tìm thấy hạng phòng này (có thể đã bị xoá)." } };
  }
  redirect(`/quan-tri/luu-tru/${propertyId}/phong?saved=1`);
}

export async function deleteRoomTypeAction(propertyId: string, roomId: string) {
  const actor = await getActor();
  const existing = await getRoomType(propertyId, roomId);
  if (!actor || !existing || !ownsProperty(actor, propertyId)) {
    redirect(
      `/quan-tri/luu-tru/${propertyId}/phong?error=${encodeURIComponent("Bạn không có quyền xoá hạng phòng này.")}`,
    );
  }

  await deleteRoomType(propertyId, roomId);
  redirect(`/quan-tri/luu-tru/${propertyId}/phong?deleted=1`);
}
