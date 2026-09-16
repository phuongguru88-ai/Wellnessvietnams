import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { BaiVietForm } from "@/components/admin/BaiVietForm";
import { getBaiVietById } from "@/lib/data";
import { getActor } from "@/lib/scope";
import { updateBaiVietAction } from "../../actions";

export const metadata: Metadata = {
  title: "Sửa bài viết",
  robots: { index: false, follow: false },
};

export default async function EditBaiVietPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; saved?: string }>;
}) {
  const actor = await getActor();
  if (actor?.role !== "admin") redirect("/quan-tri");

  const { id } = await params;
  const sp = await searchParams;
  const article = await getBaiVietById(id);
  if (!article) notFound();

  return (
    <div>
      <p className="eyebrow">Quản trị đối tác</p>
      <h1 className="mt-2 text-3xl">Sửa: {article.title}</h1>

      {(sp.created || sp.saved) && (
        <p className="mt-4 rounded-xl border border-moss bg-card px-4 py-3 text-sm font-medium text-moss">
          {sp.created ? "Đã tạo bài viết. Bạn có thể chỉnh sửa thêm bên dưới." : "Đã lưu thay đổi."}
        </p>
      )}

      <div className="mt-8 max-w-3xl">
        <BaiVietForm
          action={updateBaiVietAction.bind(null, id)}
          initial={article}
          submitLabel="Lưu thay đổi"
        />
      </div>
    </div>
  );
}
