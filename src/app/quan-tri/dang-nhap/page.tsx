import type { Metadata } from "next";

import { loginAction } from "./actions";

export const metadata: Metadata = {
  title: "Đăng nhập quản trị",
  robots: { index: false, follow: false },
};

const ERROR_MESSAGES: Record<string, string> = {
  "sai-tai-khoan": "Sai tên đăng nhập hoặc mật khẩu. Thử lại nhé.",
  "thieu-thong-tin": "Vui lòng nhập đủ tên đăng nhập và mật khẩu.",
};

export default async function DangNhapPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const next = sp.next && sp.next.startsWith("/") ? sp.next : "/quan-tri";
  const error = sp.error ? (ERROR_MESSAGES[sp.error] ?? "Có lỗi xảy ra, thử lại.") : undefined;

  return (
    <div className="mx-auto max-w-sm">
      <p className="eyebrow">Wellnessvietnams</p>
      <h1 className="mt-2 text-3xl">Đăng nhập quản trị</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Dành cho đối tác và đội vận hành. Liên hệ quản trị viên nếu bạn chưa
        có mật khẩu.
      </p>

      <form action={loginAction} className="surface mt-6 rounded-card p-6">
        <input type="hidden" name="next" value={next} />

        <label htmlFor="username" className="text-sm font-semibold text-ink">
          Tên đăng nhập
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          autoFocus
          autoComplete="username"
          className="mt-1.5 w-full rounded-xl border border-line bg-bg px-3.5 py-2.5 text-sm text-ink"
        />

        <label htmlFor="password" className="mt-4 block text-sm font-semibold text-ink">
          Mật khẩu
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1.5 w-full rounded-xl border border-line bg-bg px-3.5 py-2.5 text-sm text-ink"
        />

        {error && (
          <p role="alert" className="mt-3 text-sm font-medium text-turmeric">
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-primary mt-5 w-full">
          Đăng nhập
        </button>
      </form>
    </div>
  );
}
