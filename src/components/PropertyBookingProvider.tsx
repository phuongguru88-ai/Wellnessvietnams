"use client";

import {
  CalendarCheck,
  Check,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Users,
  X,
} from "lucide-react";
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import { Media } from "./Media";
import { formatPrice, formatVnd } from "@/lib/format";
import type { Property, RoomType } from "@/lib/types";

type Status = "idle" | "sending" | "done" | "error";

const todayIso = () => new Date().toISOString().slice(0, 10);
const plusDaysIso = (iso: string, days: number) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const BookingContext = createContext<{ openBooking: (roomTypeId?: string) => void } | null>(null);

/** Dùng trong các nút "Đặt phòng" rải rác trên trang chi tiết — cùng mở một popup duy nhất. */
export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking phải được gọi bên trong PropertyBookingProvider");
  return ctx;
}

/**
 * Bọc quanh toàn bộ trang chi tiết một nơi lưu trú. Mọi nút "Đặt phòng"
 * (sidebar, thanh cố định mobile, từng thẻ hạng phòng) đều gọi chung một
 * popup duy nhất qua context — chọn phòng ở đâu cũng ra cùng một chỗ điền
 * thông tin, không phải chọn lại. Gửi thẳng về /api/bookings: đây là yêu
 * cầu giữ chỗ, KHÔNG phải đặt phòng có thanh toán — tư vấn viên gọi xác
 * nhận phòng còn trống trong 24 giờ.
 */
export function PropertyBookingProvider({
  property,
  children,
}: {
  property: Property;
  children: React.ReactNode;
}) {
  const uid = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [summary, setSummary] = useState<{ checkIn: string; checkOut: string; guests: number } | null>(
    null,
  );

  const hasRoomTypes = property.roomTypes.length > 0;
  const [roomTypeId, setRoomTypeId] = useState(property.roomTypes[0]?.id ?? "");
  const [checkIn, setCheckIn] = useState(todayIso());
  const [checkOut, setCheckOut] = useState(plusDaysIso(todayIso(), 2));

  const selectedRoom = hasRoomTypes ? property.roomTypes.find((r) => r.id === roomTypeId) : undefined;
  const unitPrice = selectedRoom?.giaThamKhao ?? property.giaThamKhao;

  const nights = useMemo(() => {
    const ms = Date.parse(checkOut) - Date.parse(checkIn);
    const n = Math.round(ms / 86_400_000);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [checkIn, checkOut]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close() {
    setOpen(false);
    if (status !== "sending") {
      setStatus("idle");
      setErrors({});
    }
  }

  function openBooking(presetRoomTypeId?: string) {
    if (presetRoomTypeId) setRoomTypeId(presetRoomTypeId);
    setOpen(true);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const payload = {
      propertyId: property.id,
      roomTypeId: hasRoomTypes ? roomTypeId : undefined,
      checkIn: String(fd.get("checkIn") ?? ""),
      checkOut: String(fd.get("checkOut") ?? ""),
      guests: String(fd.get("guests") ?? ""),
      name: String(fd.get("name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      email: String(fd.get("email") ?? ""),
      note: String(fd.get("note") ?? ""),
    };

    setStatus("sending");
    setErrors({});

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        errors?: Record<string, string>;
        message?: string;
      };

      if (!res.ok || !data.ok) {
        setErrors(data.errors ?? {});
        setMessage(data.message ?? "Chưa gửi được. Bạn thử lại hoặc gọi trực tiếp giúp chúng tôi nhé.");
        setStatus("error");
        return;
      }

      setSummary({ checkIn: payload.checkIn, checkOut: payload.checkOut, guests: Number(payload.guests) });
      setStatus("done");
    } catch {
      setMessage("Mất kết nối khi gửi. Bạn thử lại hoặc gọi trực tiếp giúp chúng tôi nhé.");
      setStatus("error");
    }
  }

  return (
    <BookingContext.Provider value={{ openBooking }}>
      {children}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${uid}-title`}
            tabIndex={-1}
            className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-card bg-bg shadow-lift outline-none sm:max-h-[88vh] sm:rounded-card"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
              <div>
                <p className="eyebrow">Đặt phòng</p>
                <h2 id={`${uid}-title`} className="mt-0.5 text-lg font-semibold">
                  {property.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Đóng"
                className="rounded-full p-2 text-ink-soft hover:bg-card hover:text-ink"
              >
                <X aria-hidden size={18} strokeWidth={2} />
              </button>
            </div>

            {status === "done" && summary ? (
              <div className="flex-1 overflow-y-auto px-5 py-8 text-center sm:px-6">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-moss/15 text-moss">
                  <CheckCircle2 aria-hidden size={26} strokeWidth={1.75} />
                </span>
                <h3 className="mt-3 text-lg">Đã nhận yêu cầu giữ chỗ</h3>
                <p className="mx-auto mt-2 max-w-prose text-sm text-ink-soft">
                  {summary.checkIn} → {summary.checkOut} cho {summary.guests} khách. Tư vấn viên sẽ
                  gọi lại trong 24 giờ để xác nhận phòng còn trống — đây chưa phải xác nhận cuối cùng
                  và chưa cần thanh toán trước.
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStatus("idle");
                      setSummary(null);
                    }}
                    className="btn btn-ghost"
                  >
                    <RotateCcw aria-hidden size={15} strokeWidth={1.75} />
                    Gửi yêu cầu khác
                  </button>
                  <button type="button" onClick={close} className="btn btn-primary">
                    Xong
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="flex flex-1 flex-col overflow-hidden">
                <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
                  {hasRoomTypes && (
                    <div>
                      <h3 className="text-sm font-semibold text-ink">Chọn hạng phòng</h3>
                      <div className="mt-3 space-y-2.5">
                        {property.roomTypes.map((r) => (
                          <RoomOption
                            key={r.id}
                            room={r}
                            selected={r.id === roomTypeId}
                            onSelect={() => setRoomTypeId(r.id)}
                          />
                        ))}
                      </div>
                      {errors.roomTypeId && <ErrorText>{errors.roomTypeId}</ErrorText>}
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-semibold text-ink">Thông tin đặt phòng</h3>
                    <div className="mt-3 space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <DateField
                          id={`${uid}-checkin`}
                          name="checkIn"
                          label="Nhận phòng"
                          value={checkIn}
                          min={todayIso()}
                          onChange={(v) => {
                            setCheckIn(v);
                            if (Date.parse(checkOut) <= Date.parse(v)) setCheckOut(plusDaysIso(v, 1));
                          }}
                          error={errors.checkIn}
                        />
                        <DateField
                          id={`${uid}-checkout`}
                          name="checkOut"
                          label="Trả phòng"
                          value={checkOut}
                          min={plusDaysIso(checkIn, 1)}
                          onChange={setCheckOut}
                          error={errors.checkOut}
                        />
                      </div>

                      <Field
                        id={`${uid}-guests`}
                        name="guests"
                        type="number"
                        label="Số khách"
                        defaultValue={2}
                        min={1}
                        required
                        error={errors.guests}
                        hint={selectedRoom ? `Hạng phòng này chứa tối đa ${selectedRoom.sucChua} khách.` : undefined}
                      />

                      <Field
                        id={`${uid}-name`}
                        name="name"
                        label="Họ và tên"
                        placeholder="Nguyễn Thị An"
                        autoComplete="name"
                        required
                        error={errors.name}
                      />
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                          id={`${uid}-email`}
                          name="email"
                          type="email"
                          label="Email (không bắt buộc)"
                          placeholder="ban@email.com"
                          autoComplete="email"
                          error={errors.email}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label htmlFor={`${uid}-note`} className="text-sm font-semibold text-ink">
                          Ghi chú
                        </label>
                        <textarea
                          id={`${uid}-note`}
                          name="note"
                          rows={2}
                          placeholder="Tình trạng sức khỏe cần lưu ý, yêu cầu riêng…"
                          className="rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/70"
                        />
                        {errors.note && <ErrorText>{errors.note}</ErrorText>}
                      </div>
                    </div>
                  </div>

                  {status === "error" && message && (
                    <p role="alert" className="text-sm font-medium text-rose-600 dark:text-rose-400">
                      {message}
                    </p>
                  )}
                </div>

                <div className="border-t border-line px-5 py-4 sm:px-6">
                  {nights > 0 && unitPrice > 0 && (
                    <div className="mb-3 flex items-center justify-between text-sm">
                      <span className="text-ink-soft">
                        {nights} đêm × {formatVnd(unitPrice)}
                      </span>
                      <span className="font-display text-lg">{formatVnd(unitPrice * nights)}</span>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="btn btn-primary w-full disabled:opacity-60"
                  >
                    {status === "sending" ? (
                      <Loader2 aria-hidden size={15} strokeWidth={2} className="animate-spin" />
                    ) : (
                      <CalendarCheck aria-hidden size={15} strokeWidth={2} />
                    )}
                    {status === "sending" ? "Đang gửi…" : "Gửi yêu cầu giữ chỗ"}
                  </button>
                  <p className="mt-2 text-center text-xs text-ink-soft">
                    Giữ chỗ tạm, chưa thanh toán trước. Tư vấn viên gọi xác nhận trong 24 giờ.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </BookingContext.Provider>
  );
}

function RoomOption({
  room,
  selected,
  onSelect,
}: {
  room: RoomType;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex w-full items-start gap-3 rounded-xl border p-2.5 text-left transition ${
        selected ? "border-turmeric bg-turmeric/5" : "border-line hover:border-ink-soft"
      }`}
    >
      {room.images[0] ? (
        <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg">
          <Media interactive={false} image={room.images[0]} className="h-full w-full" />
        </div>
      ) : (
        <div className="h-16 w-20 shrink-0 rounded-lg bg-card" />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink">{room.name}</p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-soft">
          <Users aria-hidden size={11} strokeWidth={2} />
          Tối đa {room.sucChua} khách{room.dienTich ? ` · ${room.dienTich}` : ""}
        </p>
        <p className="mt-1 whitespace-nowrap font-display text-sm text-turmeric">
          {formatPrice(room.giaThamKhao, room.giaUnit)}
        </p>
      </div>
      <span
        aria-hidden
        className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
          selected ? "border-turmeric bg-turmeric text-bg" : "border-line"
        }`}
      >
        {selected && <Check size={13} strokeWidth={3} />}
      </span>
    </button>
  );
}

function Field({
  id,
  name,
  label,
  error,
  required,
  hint,
  ...rest
}: {
  id: string;
  name: string;
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
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
        className="rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/70"
        {...rest}
      />
      {hint && !error && <p className="text-xs text-ink-soft">{hint}</p>}
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}

function DateField({
  id,
  name,
  label,
  value,
  min,
  onChange,
  error,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  min?: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label} <span className="text-turmeric">*</span>
      </label>
      <input
        id={id}
        name={name}
        type="date"
        required
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        className="rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm text-ink"
      />
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{children}</p>;
}
