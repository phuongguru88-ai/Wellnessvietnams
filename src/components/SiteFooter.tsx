import { Clock, Mail, Phone } from "lucide-react";
import Link from "next/link";

import { ContactForm } from "./ContactForm";
import { CONTACT, NAV, SITE_NAME, SITE_TAGLINE } from "@/lib/site";

/** Footer có nhúng lại form liên hệ — yêu cầu: form xuất hiện ở mọi trang. */
export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-card">
      <div className="shell grid gap-10 py-14 lg:grid-cols-[1fr_minmax(0,1.1fr)] lg:gap-16">
        <div>
          <p className="eyebrow">Liên hệ</p>
          <h2 className="mt-2 text-3xl sm:text-4xl">
            Chưa biết bắt đầu từ đâu?
          </h2>
          <p className="mt-3 max-w-prose text-ink-soft">
            Để lại số điện thoại, chúng tôi gọi lại trong 24 giờ và cùng bạn
            chọn theo thể trạng, thời gian và vùng miền bạn muốn tới — không
            thu phí tư vấn.
          </p>

          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex items-center gap-2.5">
              <dt>
                <Phone aria-hidden size={16} strokeWidth={1.75} className="text-turmeric" />
                <span className="sr-only">Điện thoại / Zalo</span>
              </dt>
              <dd>
                <a href={CONTACT.phoneHref} className="font-semibold underline underline-offset-4">
                  {CONTACT.phone}
                </a>{" "}
                <span className="text-ink-soft">(cũng là Zalo)</span>
              </dd>
            </div>
            <div className="flex items-center gap-2.5">
              <dt>
                <Mail aria-hidden size={16} strokeWidth={1.75} className="text-turmeric" />
                <span className="sr-only">Email</span>
              </dt>
              <dd>
                <a href={`mailto:${CONTACT.email}`} className="font-semibold underline underline-offset-4">
                  {CONTACT.email}
                </a>
              </dd>
            </div>
            <div className="flex items-center gap-2.5">
              <dt>
                <Clock aria-hidden size={16} strokeWidth={1.75} className="text-turmeric" />
                <span className="sr-only">Giờ làm việc</span>
              </dt>
              <dd className="text-ink-soft">{CONTACT.hours}</dd>
            </div>
          </dl>

          <nav aria-label="Liên kết chân trang" className="mt-8">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-soft">
              {[...NAV, { href: "/lien-he", label: "Liên hệ" }].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-ink">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="rounded-card border border-line bg-bg p-5 sm:p-7">
          <h3 className="text-xl">Gửi yêu cầu tư vấn</h3>
          <p className="mt-1 text-sm text-ink-soft">
            Điền nhanh, chúng tôi gọi lại cho bạn.
          </p>
          <div className="mt-5">
            <ContactForm compact source="Form chân trang" />
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="shell flex flex-col gap-1 py-6 text-xs text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE_NAME}. {SITE_TAGLINE}.
          </p>
          <p>
            Thông tin trên trang mang tính tham khảo, không thay thế chẩn đoán
            và điều trị y khoa.
          </p>
        </div>
      </div>
    </footer>
  );
}
