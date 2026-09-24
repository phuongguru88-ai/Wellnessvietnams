"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";

import { Media } from "./Media";
import type { ImageRef } from "@/lib/types";

export function ImageGrid({ images }: { images: ImageRef[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const visibleImages = images.slice(0, 3);

  useEffect(() => {
    if (activeIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowLeft") {
        setActiveIndex((current) =>
          current === null ? null : (current - 1 + images.length) % images.length,
        );
      }
      if (event.key === "ArrowRight") {
        setActiveIndex((current) =>
          current === null ? null : (current + 1) % images.length,
        );
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, images.length]);

  if (images.length === 0) return null;

  const showPrevious = () =>
    setActiveIndex((current) =>
      current === null ? null : (current - 1 + images.length) % images.length,
    );
  const showNext = () =>
    setActiveIndex((current) =>
      current === null ? null : (current + 1) % images.length,
    );

  return (
    <>
      <figure>
        <div
          className={`relative grid gap-2 overflow-hidden rounded-[24px] sm:gap-3 ${
            visibleImages.length > 1
              ? "sm:grid-cols-[minmax(0,1.65fr)_minmax(220px,0.85fr)] sm:grid-rows-2"
              : ""
          }`}
        >
          {visibleImages.map((image, index) => (
            <button
              key={`${image.seed}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Mở ảnh ${index + 1}: ${image.alt}`}
              className={`group relative block overflow-hidden bg-card text-left ${
                index === 0
                  ? "aspect-[4/3] sm:row-span-2 sm:aspect-[16/10]"
                  : `aspect-[4/3] min-h-0 sm:aspect-auto ${
                      visibleImages.length === 2 ? "sm:row-span-2" : ""
                    }`
              } ${index > 0 ? "hidden sm:block" : ""}`}
            >
              <Media
                feature={index === 0}
                interactive={false}
                image={image}
                className="h-full w-full transition duration-500 ease-out group-hover:scale-[1.025]"
              />
              <span className="absolute inset-0 bg-ink/0 transition group-hover:bg-ink/10" />

              {index === visibleImages.length - 1 && images.length > 1 && (
                <span className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full border border-white/50 bg-ink/75 px-3.5 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-sm">
                  <Images aria-hidden size={15} strokeWidth={2} />
                  Xem tất cả {images.length} ảnh
                </span>
              )}
            </button>
          ))}

          {images.length > 1 && (
            <button
              type="button"
              onClick={() => setActiveIndex(0)}
              className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full border border-white/50 bg-ink/75 px-3.5 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-sm sm:hidden"
            >
              <Images aria-hidden size={15} strokeWidth={2} />
              Xem tất cả {images.length} ảnh
            </button>
          )}
        </div>

        <figcaption className="sr-only">
          {images.map((image) => image.alt).join(". ")}
        </figcaption>
      </figure>

      {activeIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Thư viện ảnh"
          className="fixed inset-0 z-[80] flex flex-col bg-ink/95 p-4 text-white backdrop-blur-md sm:p-6"
          onClick={() => setActiveIndex(null)}
        >
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-white/80">
              {activeIndex + 1} / {images.length}
            </p>
            <button
              type="button"
              onClick={() => setActiveIndex(null)}
              aria-label="Đóng thư viện ảnh"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-white/10 transition hover:bg-white/20"
            >
              <X aria-hidden size={21} />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center" onClick={(event) => event.stopPropagation()}>
            <div className="flex h-full w-full max-w-6xl items-center justify-center overflow-hidden py-5 sm:px-16">
              <Media
                image={images[activeIndex]}
                className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
              />
            </div>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPrevious}
                  aria-label="Ảnh trước"
                  className="absolute left-0 grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-white/10 transition hover:bg-white/20"
                >
                  <ChevronLeft aria-hidden size={22} />
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  aria-label="Ảnh tiếp theo"
                  className="absolute right-0 grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-white/10 transition hover:bg-white/20"
                >
                  <ChevronRight aria-hidden size={22} />
                </button>
              </>
            )}
          </div>

          <p className="mx-auto max-w-2xl text-center text-sm text-white/80">
            {images[activeIndex].alt}
          </p>
        </div>
      )}
    </>
  );
}
