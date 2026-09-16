import type { Metadata } from "next";
import { Clock, Mail, Phone } from "lucide-react";

import { ContactForm } from "@/components/ContactForm";
import { PageIntro } from "@/components/PageIntro";
import { CONTACT } from "@/lib/site";
import { MUC_META, type Muc } from "@/lib/types";

export const metadata: Metadata = {
  title: "Liên hệ tư vấn wellness miễn phí",
  description:
    "Để lại họ tên, số điện thoại và thời gian dự kiến — tư vấn viên Wellnessvietnams gọi lại trong 24 giờ để cùng bạn chọn nơi lưu trú, chương trình hoặc buổi trải nghiệm phù hợp.",
  alternates: { canonical: "/lien-he" },
};

export default function LienHePage() {
  return (
    <>
      <PageIntro eyebrow="Liên hệ" title="Nói cho chúng tôi biết bạn đang cần gì">
        <p>
          Không có gói nào phù hợp với tất cả mọi người. Một cuộc gọi 10 phút
          thường đủ để chọn đúng nơi ở, đúng mức dịch vụ và đúng thời điểm đi —
          chúng tôi không thu phí tư vấn và không gọi lại quấy rầy.
        </p>
      </PageIntro>

      <div className="shell grid gap-10 pb-20 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-16">
        <ContactForm source="Trang liên hệ" />

        <aside className="space-y-6">
          <div className="rounded-card border border-line bg-card p-6">
            <h2 className="text-xl">Gọi trực tiếp</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bg text-turmeric">
                  <Phone aria-hidden size={15} strokeWidth={1.75} />
                </span>
                <div>
                  <dt className="text-ink-soft">Điện thoại / Zalo</dt>
                  <dd>
                    <a
                      href={CONTACT.phoneHref}
                      className="font-display text-2xl underline underline-offset-4"
                    >
                      {CONTACT.phone}
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bg text-turmeric">
                  <Mail aria-hidden size={15} strokeWidth={1.75} />
                </span>
                <div>
                  <dt className="text-ink-soft">Email</dt>
                  <dd>
                    <a
                      href={`mailto:${CONTACT.email}`}
                      className="font-medium underline underline-offset-4"
                    >
                      {CONTACT.email}
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bg text-turmeric">
                  <Clock aria-hidden size={15} strokeWidth={1.75} />
                </span>
                <div>
                  <dt className="text-ink-soft">Giờ làm việc</dt>
                  <dd>{CONTACT.hours}</dd>
                </div>
              </div>
            </dl>
          </div>

          <div className="rounded-card border border-line p-6">
            <h2 className="text-xl">Ba mức dịch vụ</h2>
            <p className="mt-2 text-sm text-ink-soft">
              Biết trước mình cần mức nào sẽ giúp cuộc gọi nhanh hơn.
            </p>
            <ul className="mt-4 space-y-4">
              {([1, 2, 3] as Muc[]).map((m) => (
                <li key={m}>
                  <p className="text-sm font-semibold">
                    <span aria-hidden className="mr-2 tracking-[0.12em] text-turmeric">
                      {MUC_META[m].stars}
                    </span>
                    {MUC_META[m].label}
                  </p>
                  <p className="mt-1 text-sm text-ink-soft">
                    {MUC_META[m].description}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-ink-soft">
            Với các dịch vụ Mức 3, tư vấn viên sẽ hỏi thêm về tình trạng sức
            khoẻ và thuốc đang dùng để chuyển đúng chuyên gia phụ trách.
          </p>
        </aside>
      </div>
    </>
  );
}
