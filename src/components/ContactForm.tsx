"use client";

import { CheckCircle2, Loader2, RotateCcw, Send } from "lucide-react";
import { useId, useState } from "react";

import { LOAI_HINH } from "@/lib/types";

type Status = "idle" | "sending" | "done" | "error";

/**
 * Form thu lead. Gửi về /api/leads, hiện xác nhận ngay trên UI,
 * không điều hướng sang trang khác.
 */
export function ContactForm({
  source,
  defaultLoaiHinh,
  compact = false,
}: {
  /** Nội dung khách đang xem — giúp tư vấn viên vào đúng ngữ cảnh. */
  source?: string;
  defaultLoaiHinh?: string;
  compact?: boolean;
}) {
  const uid = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());

    setStatus("sending");
    setErrors({});

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, source: source ?? "Trang liên hệ" }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        errors?: Record<string, string>;
        message?: string;
      };

      if (!res.ok || !data.ok) {
        setErrors(data.errors ?? {});
        setMessage(
          data.message ??
            "Chưa gửi được. Bạn thử lại hoặc gọi trực tiếp giúp chúng tôi nhé.",
        );
        setStatus("error");
        return;
      }

      form.reset();
      setStatus("done");
    } catch {
      setMessage(
        "Mất kết nối khi gửi. Bạn thử lại hoặc gọi trực tiếp giúp chúng tôi nhé.",
      );
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div
        role="status"
        className="surface rounded-card p-6 text-center sm:p-8"
      >
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-moss/15 text-moss">
          <CheckCircle2 aria-hidden size={26} strokeWidth={1.75} />
        </span>
        <h3 className="mt-3 text-xl">Đã nhận thông tin của bạn</h3>
        <p className="mx-auto mt-2 max-w-prose text-sm text-ink-soft">
          Tư vấn viên sẽ gọi lại trong vòng 24 giờ (giờ làm việc 8:00 – 21:00)
          để cùng bạn chọn nơi lưu trú, chương trình hoặc buổi trải nghiệm phù
          hợp với thể trạng và thời gian bạn có.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="btn btn-ghost mt-5"
        >
          <RotateCcw aria-hidden size={15} strokeWidth={1.75} />
          Gửi thêm một yêu cầu khác
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className={compact ? "" : "surface rounded-card p-5 sm:p-7"}
    >
      <div className={`grid gap-4 ${compact ? "" : "sm:grid-cols-2"}`}>
        <Field
          id={`${uid}-name`}
          name="name"
          label="Họ và tên"
          placeholder="Nguyễn Thị An"
          autoComplete="name"
          required
          error={errors.name}
        />
        <Field
          id={`${uid}-phone`}
          name="phone"
          type="tel"
          label="Số điện thoại"
          placeholder="0909 000 000"
          autoComplete="tel"
          inputMode="tel"
          required
          error={errors.phone}
        />
        <Field
          id={`${uid}-date`}
          name="date"
          type="date"
          label="Dự kiến đi ngày"
          required
          error={errors.date}
        />

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`${uid}-lh`}
            className="text-sm font-semibold text-ink"
          >
            Loại hình quan tâm <span className="text-turmeric">*</span>
          </label>
          <select
            id={`${uid}-lh`}
            name="loaiHinhQuanTam"
            defaultValue={defaultLoaiHinh ?? "Chưa rõ, cần tư vấn"}
            className="rounded-xl border border-line bg-bg px-3.5 py-2.5 text-sm text-ink"
            aria-invalid={Boolean(errors.loaiHinhQuanTam)}
          >
            <option value="Chưa rõ, cần tư vấn">Chưa rõ, cần tư vấn</option>
            {LOAI_HINH.map((lh) => (
              <option key={lh} value={lh}>
                {lh}
              </option>
            ))}
          </select>
          {errors.loaiHinhQuanTam && <ErrorText>{errors.loaiHinhQuanTam}</ErrorText>}
        </div>

        <div className={`flex flex-col gap-1.5 ${compact ? "" : "sm:col-span-2"}`}>
          <label
            htmlFor={`${uid}-note`}
            className="text-sm font-semibold text-ink"
          >
            Điều bạn đang cần
          </label>
          <textarea
            id={`${uid}-note`}
            name="note"
            rows={compact ? 3 : 4}
            placeholder="Số người đi, tình trạng sức khỏe cần lưu ý, ngân sách dự kiến, vùng miền bạn muốn tới…"
            className="rounded-xl border border-line bg-bg px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/70"
          />
          {errors.note && <ErrorText>{errors.note}</ErrorText>}
        </div>
      </div>

      {status === "error" && message && (
        <p role="alert" className="mt-4 text-sm font-medium text-rose-600 dark:text-rose-400">
          {message}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === "sending"}
          className="btn btn-primary disabled:opacity-60"
        >
          {status === "sending" ? (
            <Loader2 aria-hidden size={15} strokeWidth={2} className="animate-spin" />
          ) : (
            <Send aria-hidden size={15} strokeWidth={2} />
          )}
          {status === "sending" ? "Đang gửi…" : "Nhận tư vấn miễn phí"}
        </button>
        <p className="text-xs text-ink-soft">
          Chúng tôi chỉ dùng thông tin này để liên hệ tư vấn.
        </p>
      </div>
    </form>
  );
}

function Field({
  id,
  name,
  label,
  error,
  required,
  ...rest
}: {
  id: string;
  name: string;
  label: string;
  error?: string;
  required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label} {required && <span className="text-turmeric">*</span>}
      </label>
      <input
        id={id}
        name={name}
        aria-invalid={Boolean(error)}
        className="rounded-xl border border-line bg-bg px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/70"
        {...rest}
      />
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{children}</p>;
}
