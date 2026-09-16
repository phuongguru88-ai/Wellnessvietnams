import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PropertyForm } from "@/components/admin/PropertyForm";
import { getPropertyById } from "@/lib/data";
import { getActor, ownsProperty } from "@/lib/scope";
import { updatePropertyAction } from "../../actions";

export const metadata: Metadata = {
  title: "Sửa nơi lưu trú",
  robots: { index: false, follow: false },
};

export default async function EditPropertyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; saved?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const [property, actor] = await Promise.all([getPropertyById(id), getActor()]);
  if (!property || !actor || !ownsProperty(actor, property.id)) notFound();

  return (
    <div>
      <p className="eyebrow">Quản trị đối tác</p>
      <h1 className="mt-2 text-3xl">Sửa: {property.name}</h1>

      {(sp.created || sp.saved) && (
        <p className="mt-4 rounded-xl border border-moss bg-card px-4 py-3 text-sm font-medium text-moss">
          {sp.created ? "Đã tạo nơi lưu trú. Bạn có thể chỉnh sửa thêm bên dưới." : "Đã lưu thay đổi."}
        </p>
      )}

      <div className="mt-8 max-w-3xl">
        <PropertyForm
          action={updatePropertyAction.bind(null, id)}
          initial={property}
          submitLabel="Lưu thay đổi"
        />
      </div>
    </div>
  );
}
