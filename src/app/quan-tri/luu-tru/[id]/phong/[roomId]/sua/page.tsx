import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RoomTypeForm } from "@/components/admin/RoomTypeForm";
import { getRoomType } from "@/lib/data";
import { getActor, ownsProperty } from "@/lib/scope";
import { updateRoomTypeAction } from "../../actions";

export const metadata: Metadata = {
  title: "Sửa hạng phòng",
  robots: { index: false, follow: false },
};

export default async function EditRoomTypePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; roomId: string }>;
  searchParams: Promise<{ created?: string; saved?: string }>;
}) {
  const { id, roomId } = await params;
  const sp = await searchParams;
  const [found, actor] = await Promise.all([getRoomType(id, roomId), getActor()]);
  if (!found || !actor || !ownsProperty(actor, id)) notFound();

  return (
    <div>
      <p className="eyebrow">{found.property.name}</p>
      <h1 className="mt-2 text-3xl">Sửa: {found.room.name}</h1>

      {(sp.created || sp.saved) && (
        <p className="mt-4 rounded-xl border border-moss bg-card px-4 py-3 text-sm font-medium text-moss">
          {sp.created ? "Đã tạo hạng phòng. Bạn có thể chỉnh sửa thêm bên dưới." : "Đã lưu thay đổi."}
        </p>
      )}

      <div className="mt-8 max-w-3xl">
        <RoomTypeForm
          action={updateRoomTypeAction.bind(null, id, roomId)}
          initial={found.room}
          submitLabel="Lưu thay đổi"
          cancelHref={`/quan-tri/luu-tru/${id}/phong`}
          defaultGiaUnit={found.property.giaUnit}
        />
      </div>
    </div>
  );
}
