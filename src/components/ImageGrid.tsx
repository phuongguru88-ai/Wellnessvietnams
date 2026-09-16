import { Media } from "./Media";
import type { ImageRef } from "@/lib/types";

/** Bộ ảnh đầu trang chi tiết: 1 ảnh/video lớn + các ảnh phụ xếp cạnh. */
export function ImageGrid({ images }: { images: ImageRef[] }) {
  const [lead, ...rest] = images;

  return (
    <figure className="grid gap-3 sm:grid-cols-[1.6fr_minmax(0,1fr)]">
      <div className="overflow-hidden rounded-card border border-line">
        <Media feature image={lead} className="aspect-[4/3] w-full" />
      </div>

      {rest.length > 0 && (
        <div className="grid gap-3 sm:grid-rows-2">
          {rest.slice(0, 2).map((img) => (
            <div
              key={img.seed}
              className="overflow-hidden rounded-card border border-line"
            >
              <Media
                interactive={false}
                image={img}
                className="aspect-[4/3] w-full sm:h-full sm:aspect-auto"
              />
            </div>
          ))}
        </div>
      )}

      <figcaption className="sr-only">
        {images.map((i) => i.alt).join(". ")}
      </figcaption>
    </figure>
  );
}
