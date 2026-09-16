import type { Metadata } from "next";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { getProperties } from "@/lib/data";
import { getPartners } from "@/lib/partners";
import { getActor } from "@/lib/scope";
import { deletePartnerAction } from "./actions";

export const metadata: Metadata = {
  title: "Quản lý tài khoản đối tác",
  robots: { index: false, follow: false },
};

export default async function AdminPartnersPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}) {
  const actor = await getActor();
  if (actor?.role !== "admin") redirect("/quan-tri");

  const sp = await searchParams;
  const [partners, properties] = await Promise.all([getPartners(), getProperties()]);
  const propertyById = new Map(properties.map((p) => [p.id, p]));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Quản trị đối tác</p>
          <h1 className="mt-2 text-3xl">Tài khoản đối tác</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Mỗi đối tác đăng nhập /quan-tri riêng bằng tên đăng nhập và mật khẩu của mình, chỉ thấy
            và sửa được nơi lưu trú (cùng chương trình/trải nghiệm/đặt phòng liên quan) đã gán cho
            họ ở đây.
          </p>
        </div>
        <Link href="/quan-tri/doi-tac/moi" className="btn btn-primary">
          <Plus aria-hidden size={16} strokeWidth={2} />
          Thêm tài khoản
        </Link>
      </div>

      {sp.deleted && (
        <p className="mt-4 rounded-xl border border-moss bg-card px-4 py-3 text-sm font-medium text-moss">
          Đã xoá.
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-card border border-line">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line bg-card text-left text-xs uppercase tracking-wide text-ink-soft">
              <th className="px-4 py-3 font-semibold">Tên</th>
              <th className="px-4 py-3 font-semibold">Tên đăng nhập</th>
              <th className="px-4 py-3 font-semibold">Vai trò</th>
              <th className="px-4 py-3 font-semibold">Quản lý</th>
              <th className="px-4 py-3 font-semibold">Trạng thái</th>
              <th className="px-4 py-3 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {partners.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-b-0">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-ink-soft">{p.username}</td>
                <td className="px-4 py-3 text-ink-soft">
                  {p.role === "admin" ? "Quản trị viên" : "Đối tác"}
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  {p.role === "admin"
                    ? "Toàn quyền"
                    : p.propertyIds.length > 0
                      ? p.propertyIds.map((id) => propertyById.get(id)?.name ?? "—").join(", ")
                      : "Chưa gán nơi lưu trú nào"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${
                      p.active ? "border-transparent bg-moss text-bg" : "border-line text-ink-soft"
                    }`}
                  >
                    {p.active ? "Đang hoạt động" : "Đã khoá"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-4">
                    <Link
                      href={`/quan-tri/doi-tac/${p.id}/sua`}
                      className="inline-flex items-center gap-1 font-semibold text-turmeric"
                    >
                      <Pencil aria-hidden size={14} strokeWidth={1.75} />
                      Sửa
                    </Link>
                    <ConfirmSubmitButton
                      action={deletePartnerAction.bind(null, p.id)}
                      confirmText={`Xoá tài khoản "${p.name}"? Không thể hoàn tác.`}
                    >
                      <Trash2 aria-hidden size={14} strokeWidth={1.75} />
                      Xoá
                    </ConfirmSubmitButton>
                  </div>
                </td>
              </tr>
            ))}
            {partners.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink-soft">
                  Chưa có tài khoản đối tác nào — mọi người đang đăng nhập bằng tài khoản quản trị
                  viên gốc (biến môi trường ADMIN_USERNAME/ADMIN_PASSWORD).
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
