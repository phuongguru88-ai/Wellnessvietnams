import Link from "next/link";

export default function NotFound() {
  return (
    <div className="shell flex flex-col items-center gap-4 py-24 text-center sm:py-32">
      <p className="eyebrow">404</p>
      <h1 className="max-w-[20ch] text-3xl sm:text-4xl">
        Trang này không còn hoặc chưa từng tồn tại
      </h1>
      <p className="max-w-prose text-ink-soft">
        Có thể liên kết đã cũ, hoặc nội dung đã được đổi tên. Bạn thử quay lại
        trang chủ hoặc xem danh sách lưu trú.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-primary">
          Về trang chủ
        </Link>
        <Link href="/luu-tru" className="btn btn-ghost">
          Xem lưu trú
        </Link>
      </div>
    </div>
  );
}
