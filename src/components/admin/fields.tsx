/** Các ô nhập dùng chung cho form quản trị — không có logic riêng, chỉ trình bày. */

export function FieldError({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-medium text-turmeric">{children}</p>;
}

export function TextField({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  error,
  placeholder,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  type?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-semibold text-ink">
        {label} {required && <span className="text-turmeric">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className="rounded-xl border border-line bg-bg px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/70"
      />
      {hint && !error && <p className="text-xs text-ink-soft">{hint}</p>}
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
}

export function TextArea({
  label,
  name,
  defaultValue,
  required,
  error,
  placeholder,
  rows = 4,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
  rows?: number;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-semibold text-ink">
        {label} {required && <span className="text-turmeric">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className="rounded-xl border border-line bg-bg px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/70"
      />
      {hint && !error && <p className="text-xs text-ink-soft">{hint}</p>}
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
}

export function Select({
  label,
  name,
  defaultValue,
  options,
  error,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
  error?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-semibold text-ink">
        {label} {required && <span className="text-turmeric">*</span>}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        aria-invalid={Boolean(error)}
        className="rounded-xl border border-line bg-bg px-3.5 py-2.5 text-sm text-ink"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
}

export function RadioGroup({
  label,
  name,
  defaultValue,
  options,
  error,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
  error?: string;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-sm font-semibold text-ink">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={o.value}
            className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-full border border-line px-3 py-1.5 text-xs font-medium has-[:checked]:border-transparent has-[:checked]:bg-ink has-[:checked]:text-bg"
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              defaultChecked={defaultValue === o.value}
              className="sr-only"
            />
            {o.label}
          </label>
        ))}
      </div>
      {error && <FieldError>{error}</FieldError>}
    </fieldset>
  );
}

/** Một checkbox boolean độc lập — khác CheckboxGroup (chọn nhiều trong một tập giá trị). */
export function Checkbox({
  label,
  name,
  defaultChecked,
  hint,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
  hint?: string;
}) {
  return (
    <label className="flex items-start gap-2.5">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-line text-turmeric focus:ring-turmeric"
      />
      <span className="text-sm">
        <span className="font-medium text-ink">{label}</span>
        {hint && <span className="block text-xs text-ink-soft">{hint}</span>}
      </span>
    </label>
  );
}

export function CheckboxGroup({
  label,
  name,
  defaultValues,
  options,
  error,
}: {
  label: string;
  name: string;
  defaultValues?: string[];
  options: { value: string; label: string }[];
  error?: string;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-sm font-semibold text-ink">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={o.value}
            className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-full border border-line px-3 py-1.5 text-xs font-medium has-[:checked]:border-transparent has-[:checked]:bg-ink has-[:checked]:text-bg"
          >
            <input
              type="checkbox"
              name={name}
              value={o.value}
              defaultChecked={defaultValues?.includes(o.value)}
              className="sr-only"
            />
            {o.label}
          </label>
        ))}
      </div>
      {error && <FieldError>{error}</FieldError>}
    </fieldset>
  );
}
