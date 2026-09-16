import type { Metadata } from "next";
import Link from "next/link";

import { ExperienceForm } from "@/components/admin/ExperienceForm";
import { getProperties } from "@/lib/data";
import { getActor, scopeProperties } from "@/lib/scope";
import { createExperienceAction } from "../actions";

export const metadata: Metadata = {
  title: "Thêm trải nghiệm",
  robots: { index: false, follow: false },
};

export default async function NewExperiencePage() {
  const actor = await getActor();
  if (!actor) return null;
  const properties = scopeProperties(actor, await getProperties());

  if (properties.length === 0) {
    return (
      <div>
        <p className="eyebrow">Quản trị đối tác</p>
        <h1 className="mt-2 text-3xl">Thêm trải nghiệm</h1>
        <p className="mt-4 text-ink-soft">
          {actor.role === "admin" ? (
            <>
              Cần có ít nhất một nơi lưu trú trước khi tạo trải nghiệm.{" "}
              <Link href="/quan-tri/luu-tru/moi" className="font-semibold text-turmeric">
                Thêm nơi lưu trú →
              </Link>
            </>
          ) : (
            "Tài khoản của bạn chưa được gán quản lý nơi lưu trú nào — liên hệ quản trị viên để được gán."
          )}
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="eyebrow">Quản trị đối tác</p>
      <h1 className="mt-2 text-3xl">Thêm trải nghiệm</h1>
      <div className="mt-8 max-w-3xl">
        <ExperienceForm
          action={createExperienceAction}
          submitLabel="Tạo vé/buổi"
          properties={properties}
        />
      </div>
    </div>
  );
}
