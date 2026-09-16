import { Artwork } from "./Artwork";
import type { ImageRef } from "@/lib/types";

type Props = {
  image: ImageRef;
  className?: string;
  /** Ảnh lớn ở đầu trang chi tiết — chuyển tiếp cho Artwork khi chưa có ảnh/video thật. */
  feature?: boolean;
  /**
   * false: dùng cho khung nhỏ (thẻ danh sách, ảnh phụ trong gallery) — video
   * hiện ảnh đại diện tĩnh thay vì phát trực tiếp, tránh nhúng nhiều iframe
   * cùng lúc trên một trang danh sách.
   */
  interactive?: boolean;
};

/**
 * Nguồn ảnh/video có thể đến từ bất kỳ trang nào đối tác dán vào — dùng
 * <img>/<iframe> thường thay vì next/image (vốn cần khai báo trước domain).
 */
export function Media({ image, className = "", feature = false, interactive = true }: Props) {
  if (image.kind === "video" && image.src) {
    if (interactive) {
      return (
        <iframe
          src={image.src}
          title={image.alt}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className={className}
        />
      );
    }
    if (image.thumbnailSrc) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={image.thumbnailSrc} alt={image.alt} loading="lazy" className={`object-cover ${className}`} />;
    }
    return <Artwork image={image} className={className} feature={feature} />;
  }

  if (image.src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image.src} alt={image.alt} loading="lazy" className={`object-cover ${className}`} />;
  }

  return <Artwork image={image} className={className} feature={feature} />;
}
