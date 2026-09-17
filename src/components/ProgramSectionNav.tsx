"use client";

import { useEffect, useState } from "react";

type Section = { id: string; label: string };

/**
 * Mục lục anchor dính đầu trang chi tiết chương trình — tự làm nổi mục
 * đang xem bằng IntersectionObserver khi cuộn trang, giống các trang
 * đặt tour/retreat tham khảo. Chỉ nhận danh sách section thực sự tồn tại
 * trên trang (server component lọc trước khi truyền vào).
 */
export function ProgramSectionNav({ sections }: { sections: Section[] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id);

  useEffect(() => {
    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <nav
      aria-label="Mục lục chương trình"
      className="sticky top-16 z-10 mt-8 border-b border-line bg-bg/95 backdrop-blur"
    >
      <ul className="shell flex gap-1 overflow-x-auto py-2.5">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition ${
                activeId === s.id
                  ? "bg-ink text-bg"
                  : "text-ink-soft hover:bg-card hover:text-ink"
              }`}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
