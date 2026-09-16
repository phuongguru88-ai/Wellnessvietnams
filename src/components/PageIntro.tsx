export function PageIntro({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="shell pb-8 pt-6 sm:pt-9">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-2 max-w-[22ch] text-[2rem] leading-[1.1] sm:text-5xl">
        {title}
      </h1>
      {children && (
        <div className="mt-4 max-w-prose text-ink-soft">{children}</div>
      )}
    </div>
  );
}
