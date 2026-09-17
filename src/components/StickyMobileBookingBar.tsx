/** Thanh giá dính dưới màn hình trên mobile — sidebar đặt chỗ nằm cuối trang nên cần lối tắt này để không phải cuộn hết trang mới thấy CTA. Ẩn trên desktop vì sidebar đã sticky sẵn. */
export function StickyMobileBookingBar({
  priceLabel,
  targetId,
  ctaLabel,
}: {
  priceLabel: string;
  targetId: string;
  ctaLabel: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/95 backdrop-blur lg:hidden">
      <div className="shell flex items-center justify-between gap-4 py-3">
        <div>
          <p className="text-[11px] text-ink-soft">Giá chương trình</p>
          <p className="font-display text-lg leading-tight">{priceLabel}</p>
        </div>
        <a href={`#${targetId}`} className="btn btn-primary shrink-0">
          {ctaLabel}
        </a>
      </div>
    </div>
  );
}
