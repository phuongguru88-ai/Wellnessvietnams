import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ExperienceForm } from "@/components/admin/ExperienceForm";
import { getExperienceById, getProperties } from "@/lib/data";
import { getActor, ownsProperty, scopeProperties } from "@/lib/scope";
import { updateExperienceAction } from "../../actions";

export const metadata: Metadata = {
  title: "Sửa trải nghiệm",
  robots: { index: false, follow: false },
};

export default async function EditExperiencePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; saved?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const [experience, allProperties, actor] = await Promise.all([
    getExperienceById(id),
    getProperties(),
    getActor(),
  ]);
  if (!experience || !actor || !ownsProperty(actor, experience.propertyRef)) notFound();
  const properties = scopeProperties(actor, allProperties);

  return (
    <div>
      <p className="eyebrow">Quản trị đối tác</p>
      <h1 className="mt-2 text-3xl">Sửa: {experience.name}</h1>

      {(sp.created || sp.saved) && (
        <p className="mt-4 rounded-xl border border-moss bg-card px-4 py-3 text-sm font-medium text-moss">
          {sp.created ? "Đã tạo vé/buổi. Bạn có thể chỉnh sửa thêm bên dưới." : "Đã lưu thay đổi."}
        </p>
      )}

      <div className="mt-8 max-w-3xl">
        <ExperienceForm
          action={updateExperienceAction.bind(null, id)}
          initial={experience}
          submitLabel="Lưu thay đổi"
          properties={properties}
        />
      </div>
    </div>
  );
}
