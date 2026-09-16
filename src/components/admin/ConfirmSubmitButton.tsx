"use client";

/** Nút submit cho một <form action={serverAction}> yêu cầu xác nhận trước khi gửi. */
export function ConfirmSubmitButton({
  action,
  confirmText,
  children,
  className,
}: {
  action: (formData: FormData) => void | Promise<void>;
  confirmText: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
    >
      <button
        type="submit"
        className={
          className ??
          "inline-flex items-center gap-1 font-semibold text-turmeric hover:underline underline-offset-4"
        }
      >
        {children}
      </button>
    </form>
  );
}
