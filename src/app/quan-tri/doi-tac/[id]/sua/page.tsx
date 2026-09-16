import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { PartnerForm } from "@/components/admin/PartnerForm";
import { getProperties } from "@/lib/data";
import { getPartnerById } from "@/lib/partners";
import { getActor } from "@/lib/scope";
import { updatePartnerAction } from "../../actions";

export const metadata: Metadata = {
  title: "Sửa tài khoản đối tác",
  robots: { index: false, follow: false },
};

export default async function EditPartnerPage({
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
  const [partner, properties] = await Promise.all([getPartnerById(id), getProperties()]);
  if (!partner) notFound();

  return (
    <div>
      <p className="eyebrow">Quản trị đối tác</p>
      <h1 className="mt-2 text-3xl">Sửa: {partner.name}</h1>

      {(sp.created || sp.saved) && (
        <p className="mt-4 rounded-xl border border-moss bg-card px-4 py-3 text-sm font-medium text-moss">
          {sp.created ? "Đã tạo tài khoản. Bạn có thể chỉnh sửa thêm bên dưới." : "Đã lưu thay đổi."}
        </p>
      )}

      <div className="mt-8 max-w-2xl">
        <PartnerForm
          action={updatePartnerAction.bind(null, id)}
          initial={partner}
          submitLabel="Lưu thay đổi"
          properties={properties}
        />
      </div>
    </div>
  );
}
