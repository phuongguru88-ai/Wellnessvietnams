import type { Metadata } from "next";
import {
  ClipboardCheck,
  Flame,
  Handshake,
  PhoneCall,
  ShieldCheck,
  Sprout,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { PageIntro } from "@/components/PageIntro";
import { STAY_ICON } from "@/lib/icons";
import { MUC_META, type Muc } from "@/lib/types";

export const metadata: Metadata = {
  title: "Về chúng tôi — triết lý và bộ tiêu chí tuyển chọn",
  description:
    "Wellnessvietnams tuyển chọn đối tác theo bộ 100 tiêu chí nội bộ, lấy y học phương đông và chất liệu bản địa từng vùng miền làm gốc, kết hợp cùng tiêu chuẩn nghỉ dưỡng thông thường. Tìm hiểu triết lý và cách chúng tôi thẩm định.",
  alternates: { canonical: "/ve-chung-toi" },
};

const TIEU_CHI_NHOM: { nhom: string; icon: LucideIcon; soLuong: number; vi: string[] }[] = [
  {
    nhom: "Con người & chuyên môn",
    icon: UserCheck,
    soLuong: 28,
    vi: [
      "Lương y / kỹ thuật viên / nhà tâm lý có chứng chỉ hành nghề hợp lệ",
      "Có mặt thường trú hoặc lịch làm việc cố định tại chỗ, không thuê ngoài theo mùa vụ",
      "Được phỏng vấn trực tiếp trước khi ký hợp tác",
    ],
  },
  {
    nhom: "Nguồn gốc & nguyên liệu",
    icon: Sprout,
    soLuong: 24,
    vi: [
      "Dược liệu, thực phẩm có nguồn gốc truy được, ưu tiên tự trồng hoặc trong vùng",
      "Không dùng phụ gia, chất bảo quản trong bếp phục vụ khách lưu trú dài ngày",
      "Vườn thuốc / vườn rau được khảo sát thực địa trước khi công nhận",
    ],
  },
  {
    nhom: "Không gian & an toàn",
    icon: ShieldCheck,
    soLuong: 22,
    vi: [
      "Tiện nghi phòng nghỉ (đệm, nước nóng, wifi, dọn phòng) đạt chuẩn nghỉ dưỡng thông thường",
      "Chất lượng nước, ánh sáng phòng ngủ, độ ồn được đo khi khảo sát",
      "Quy trình vệ sinh phòng trị liệu và dụng cụ theo tiêu chuẩn spa/y tế",
      "Có phương án xử lý khẩn cấp và bảo hiểm trách nhiệm",
    ],
  },
  {
    nhom: "Vận hành & cam kết",
    icon: Handshake,
    soLuong: 26,
    vi: [
      "Minh bạch giá, không phụ thu ẩn với khách đặt qua Wellnessvietnams",
      "Phản hồi yêu cầu tư vấn trong 24 giờ",
      "Tái khảo sát định kỳ mỗi 6–12 tháng để giữ chuẩn",
    ],
  },
];

export default function VeChungToiPage() {
  return (
    <>
      <PageIntro eyebrow="Về chúng tôi" title="Một mạng lưới được chọn, không phải được liệt kê">
        <p>
          Wellnessvietnams không phải sàn đặt phòng mở cho mọi đối tác đăng ký.
          Mỗi home, villa, resort, retreat và mỗi người thực hành trên trang đều được
          chúng tôi khảo sát trực tiếp trước khi xuất hiện — dựa trên gốc y
          học phương đông và chất liệu bản địa của từng vùng miền, kết hợp
          cùng tiêu chuẩn nghỉ dưỡng thông thường mà khách đi resort vẫn mong
          đợi.
        </p>
      </PageIntro>

      <section className="shell grid gap-10 pb-16 lg:grid-cols-3 lg:gap-10">
        <div className="prose-vn">
          <h2 className="flex items-center gap-2 text-2xl">
            <Flame aria-hidden size={19} strokeWidth={1.75} className="text-turmeric" />
            Vì sao lấy y học phương đông làm gốc
          </h2>
          <p className="mt-3">
            Ẩm thực và thiên nhiên mỗi vùng miền ở Việt Nam vốn đã gắn với một
            hệ tri thức chăm sóc sức khỏe lâu đời — cách ăn theo mùa, cây
            thuốc quanh nhà, cách xông, cách bấm huyệt truyền trong gia đình.
            Chúng tôi chọn giữ hệ tri thức đó làm trục, thay vì lắp một mô
            hình spa nhập khẩu vào mọi nơi.
          </p>
          <p>
            Vì vậy mỗi đối tác được thẩm định không chỉ ở tiện nghi, mà ở việc
            người thực hành tại đó có thật sự hiểu và hành nghề đúng chuyên
            môn của mình hay không.
          </p>
        </div>

        <div className="prose-vn">
          <h2 className="flex items-center gap-2 text-2xl">
            <STAY_ICON aria-hidden size={19} strokeWidth={1.75} className="text-turmeric" />
            Kết hợp với nghỉ dưỡng tiêu chuẩn
          </h2>
          <p className="mt-3">
            Gốc y học phương đông không thay cho chất lượng nghỉ dưỡng —
            phòng ốc, bữa ăn và dịch vụ tại mỗi đối tác vẫn phải đạt chuẩn mà
            khách quen đi resort mong đợi: nệm êm, nước nóng ổn định, dọn
            phòng đúng giờ, món ăn ngon chứ không chỉ &ldquo;lành&rdquo;.
          </p>
          <p>
            Nhờ vậy bạn có thể chỉ đơn giản là đi nghỉ như một kỳ nghỉ bình
            thường (Mức 1), rồi thêm dần các buổi trị liệu khi thấy phù hợp
            (Mức 2, Mức 3) — không bị ép vào một liệu trình ngay từ đầu.
          </p>
        </div>

        <div className="prose-vn">
          <h2 className="flex items-center gap-2 text-2xl">
            <ClipboardCheck aria-hidden size={19} strokeWidth={1.75} className="text-turmeric" />
            Cách chúng tôi thẩm định
          </h2>
          <p className="mt-3">
            Trước khi hợp tác, đội ngũ Wellnessvietnams khảo sát thực địa từng
            nơi: nói chuyện với người phụ trách trị liệu, kiểm tra nguồn
            nguyên liệu, thử trực tiếp bữa ăn và ít nhất một liệu trình. Chỉ
            những nơi đạt đủ bộ 100 tiêu chí nội bộ mới được đưa lên trang.
          </p>
          <p>
            Bộ tiêu chí được rà soát lại định kỳ, và mỗi đối tác được tái khảo
            sát để giữ đúng chuẩn đã cam kết với khách.
          </p>
        </div>
      </section>

      <section className="border-y border-line bg-card py-16 sm:py-20">
        <div className="shell">
          <p className="eyebrow">Bộ 100 tiêu chí nội bộ</p>
          <h2 className="mt-2 max-w-[30ch] text-3xl sm:text-4xl">
            Bốn nhóm tiêu chí, chấm trước khi bất kỳ đối tác nào được công bố
          </h2>
          <div className="mt-9 grid gap-5 sm:grid-cols-2">
            {TIEU_CHI_NHOM.map((nhom) => (
              <div
                key={nhom.nhom}
                className="rounded-card border border-line bg-bg p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-card text-turmeric">
                      <nhom.icon aria-hidden size={17} strokeWidth={1.75} />
                    </span>
                    <h3 className="text-xl">{nhom.nhom}</h3>
                  </div>
                  <span className="shrink-0 pt-1.5 text-sm text-ink-soft">
                    {nhom.soLuong} tiêu chí
                  </span>
                </div>
                <ul className="mt-4 space-y-2.5">
                  {nhom.vi.map((v) => (
                    <li key={v} className="flex gap-2.5 text-sm text-ink-soft">
                      <span aria-hidden className="mt-0.5 text-turmeric">
                        ✦
                      </span>
                      <span>{v}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="he-muc" className="shell scroll-mt-24 py-16 sm:py-20">
        <p className="eyebrow">Hệ Mức</p>
        <h2 className="mt-2 max-w-[28ch] text-3xl sm:text-4xl">
          Một thang ba mức, áp dụng cho cả lưu trú, chương trình và trải
          nghiệm
        </h2>
        <p className="mt-4 max-w-prose text-ink-soft">
          Mức thể hiện ai là người đứng sau dịch vụ đó — không phải mức độ sang
          trọng. Một villa Mức 1 vẫn có thể rất đẹp; một buổi trị liệu Mức 3
          luôn cần người có chứng chỉ hành nghề.
        </p>
        <ol className="mt-9 grid gap-5 md:grid-cols-3">
          {([1, 2, 3] as Muc[]).map((m) => (
            <li
              key={m}
              className={`rounded-card border p-6 ${
                m === 3 ? "border-turmeric bg-card" : "border-line"
              }`}
            >
              <span
                aria-hidden
                className="tracking-[0.12em] text-turmeric"
              >
                {MUC_META[m].stars}
              </span>
              <h3 className="mt-2 text-xl">{MUC_META[m].label}</h3>
              <p className="mt-2 text-sm text-ink-soft">
                {MUC_META[m].description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="shell pb-20">
        <div className="rounded-card border border-line bg-card p-8 text-center sm:p-12">
          <h2 className="mx-auto max-w-[24ch] text-2xl sm:text-3xl">
            Muốn được tư vấn theo đúng thể trạng của bạn?
          </h2>
          <Link href="/lien-he" className="btn btn-primary mt-6 inline-flex">
            <PhoneCall aria-hidden size={15} strokeWidth={2} />
            Nhận tư vấn miễn phí
          </Link>
        </div>
      </section>
    </>
  );
}
