import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RoomTypeForm } from "@/components/admin/RoomTypeForm";
import { getPropertyById } from "@/lib/data";
import { getActor, ownsProperty } from "@/lib/scope";
import { createRoomTypeAction } from "../actions";

export const metadata: Metadata = {
  title: "Thêm hạng phòng",
  robots: { index: false, follow: false },
};

export default async function NewRoomTypePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [property, actor] = await Promise.all([getPropertyById(id), getActor()]);
  if (!property || !actor || !ownsProperty(actor, id)) notFound();

  return (
    <div>
      <p className="eyebrow">{property.name}</p>
      <h1 className="mt-2 text-3xl">Thêm hạng phòng</h1>
      <div className="mt-8 max-w-3xl">
        <RoomTypeForm
          action={createRoomTypeAction.bind(null, id)}
          submitLabel="Tạo hạng phòng"
          cancelHref={`/quan-tri/luu-tru/${id}/phong`}
          defaultGiaUnit={property.giaUnit}
        />
      </div>
    </div>
  );
}
