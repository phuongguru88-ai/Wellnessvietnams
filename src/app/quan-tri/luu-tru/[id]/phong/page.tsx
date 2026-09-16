import type { Metadata } from "next";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { getPropertyById } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { getActor, ownsProperty } from "@/lib/scope";
import { deleteRoomTypeAction } from "./actions";

export const metadata: Metadata = {
  title: "Quản lý hạng phòng",
  robots: { index: false, follow: false },
};

export default async function RoomTypesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; saved?: string; deleted?: string; error?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const [property, actor] = await Promise.all([getPropertyById(id), getActor()]);
  if (!property || !actor || !ownsProperty(actor, id)) notFound();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">
            <Link href={`/quan-tri/luu-tru/${id}/sua`} className="hover:text-ink">
              {property.name}
            </Link>
          </p>
          <h1 className="mt-2 text-3xl">Hạng phòng</h1>
        </div>
        <Link href={`/quan-tri/luu-tru/${id}/phong/moi`} className="btn btn-primary">
          <Plus aria-hidden size={16} strokeWidth={2} />
          Thêm hạng phòng
        </Link>
      </div>

      {(sp.created || sp.saved) && (
        <p className="mt-4 rounded-xl border border-moss bg-card px-4 py-3 text-sm font-medium text-moss">
          {sp.created ? "Đã tạo hạng phòng." : "Đã lưu thay đổi."}
        </p>
      )}
      {sp.deleted && (
        <p className="mt-4 rounded-xl border border-moss bg-card px-4 py-3 text-sm font-medium text-moss">
          Đã xoá.
        </p>
      )}
      {sp.error && (
        <p role="alert" className="mt-4 rounded-xl border border-turmeric bg-card px-4 py-3 text-sm font-medium text-turmeric">
          {sp.error}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-card border border-line">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line bg-card text-left text-xs uppercase tracking-wide text-ink-soft">
              <th className="px-4 py-3 font-semibold">Tên</th>
              <th className="px-4 py-3 font-semibold">Sức chứa</th>
              <th className="px-4 py-3 font-semibold">Diện tích</th>
              <th className="px-4 py-3 font-semibold">Số lượng</th>
              <th className="px-4 py-3 font-semibold">Giá</th>
              <th className="px-4 py-3 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {property.roomTypes.map((r) => (
              <tr key={r.id} className="border-b border-line last:border-b-0">
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3 text-ink-soft">{r.sucChua} khách</td>
                <td className="px-4 py-3 text-ink-soft">{r.dienTich ?? "—"}</td>
                <td className="px-4 py-3 text-ink-soft">{r.soLuong ?? "—"}</td>
                <td className="px-4 py-3 text-ink-soft">{formatPrice(r.giaThamKhao, r.giaUnit)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-4">
                    <Link
                      href={`/luu-tru/${property.slug}#hang-phong`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-ink-soft hover:text-ink"
                    >
                      <Eye aria-hidden size={14} strokeWidth={1.75} />
                      Xem
                    </Link>
                    <Link
                      href={`/quan-tri/luu-tru/${id}/phong/${r.id}/sua`}
                      className="inline-flex items-center gap-1 font-semibold text-turmeric"
                    >
                      <Pencil aria-hidden size={14} strokeWidth={1.75} />
                      Sửa
                    </Link>
                    <ConfirmSubmitButton
                      action={deleteRoomTypeAction.bind(null, id, r.id)}
                      confirmText={`Xoá hạng phòng "${r.name}"? Không thể hoàn tác.`}
                    >
                      <Trash2 aria-hidden size={14} strokeWidth={1.75} />
                      Xoá
                    </ConfirmSubmitButton>
                  </div>
                </td>
              </tr>
            ))}
            {property.roomTypes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink-soft">
                  Chưa có hạng phòng nào — nơi này đang hiện là một loại chỗ duy nhất.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
