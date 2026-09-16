import type { ImageRef } from "@/lib/types";

/**
 * Tranh minh hoạ SVG sinh từ `seed` — placeholder cho ảnh thật.
 * Cùng một seed luôn cho ra cùng một hình (không hydration mismatch),
 * dùng đúng bộ màu thương hiệu và tự đổi theo light/dark qua CSS variable.
 *
 * Khi có ảnh thật: đổi `ImageRef` thành { src, alt } và thay component này
 * bằng next/image — mọi nơi gọi đều giữ nguyên API.
 */

function hash(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

type Props = {
  image: ImageRef;
  className?: string;
  /** Ảnh lớn ở đầu trang chi tiết dùng nhiều lớp hơn. */
  feature?: boolean;
};

export function Artwork({ image, className = "", feature = false }: Props) {
  const h = hash(image.seed);
  const variant = h % 3;
  const uid = `a${(h % 99991).toString(36)}`;

  const rand = (i: number, min: number, max: number) => {
    const v = ((h >> (i * 3)) % 1000) / 1000;
    return min + v * (max - min);
  };

  const tints: [string, string, string] = [
    ["var(--indigo)", "var(--moss)", "var(--turmeric)"],
    ["var(--moss)", "var(--turmeric)", "var(--indigo)"],
    ["var(--turmeric)", "var(--indigo)", "var(--moss)"],
  ][variant] as [string, string, string];

  return (
    <svg
      viewBox="0 0 640 420"
      className={className}
      role="img"
      aria-label={image.alt}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="var(--card)" />
          <stop offset="100%" stopColor={tints[0]} stopOpacity="0.28" />
        </linearGradient>
        <linearGradient id={`${uid}-far`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tints[0]} stopOpacity="0.5" />
          <stop offset="100%" stopColor={tints[0]} stopOpacity="0.28" />
        </linearGradient>
        <linearGradient id={`${uid}-near`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tints[1]} stopOpacity="0.9" />
          <stop offset="100%" stopColor={tints[1]} stopOpacity="0.62" />
        </linearGradient>
      </defs>

      <rect width="640" height="420" fill={`url(#${uid}-sky)`} />

      {/* Mặt trời / mặt trăng */}
      <circle
        cx={rand(1, 120, 520)}
        cy={rand(2, 70, 130)}
        r={rand(3, 34, 54)}
        fill={tints[2]}
        opacity="0.42"
      />

      {variant === 0 && (
        <>
          {/* Núi đá vôi xếp lớp */}
          <path
            d={`M0 ${240 + rand(4, -20, 20)} L${rand(5, 90, 150)} ${150} L${rand(6, 200, 260)} ${248} L${rand(7, 330, 390)} ${132} L${rand(8, 470, 530)} ${246} L640 ${190} L640 420 L0 420 Z`}
            fill={`url(#${uid}-far)`}
          />
          <path
            d={`M0 ${320} L${rand(9, 110, 190)} ${232} L${rand(10, 300, 380)} ${328} L${rand(11, 480, 560)} ${254} L640 ${330} L640 420 L0 420 Z`}
            fill={`url(#${uid}-near)`}
          />
        </>
      )}

      {variant === 1 && (
        <>
          {/* Vịnh biển: những đường nước song song */}
          <path
            d={`M0 ${262} C160 ${232 + rand(4, -14, 14)} 320 ${292} 640 ${248} L640 420 L0 420 Z`}
            fill={`url(#${uid}-far)`}
          />
          <path
            d={`M0 ${326} C180 ${296 + rand(5, -16, 16)} 400 ${356} 640 ${312} L640 420 L0 420 Z`}
            fill={`url(#${uid}-near)`}
          />
          {[0, 1, 2, 3].map((i) => (
            <path
              key={i}
              d={`M${40 + i * 30} ${368 + i * 12} C${200} ${352 + i * 12} ${420} ${384 + i * 12} ${610 - i * 26} ${366 + i * 12}`}
              stroke="var(--bg)"
              strokeOpacity="0.32"
              strokeWidth="2"
              fill="none"
            />
          ))}
        </>
      )}

      {variant === 2 && (
        <>
          {/* Ruộng bậc thang / vườn thuốc */}
          <path
            d={`M0 ${228} L${rand(4, 180, 280)} ${162} L640 ${222} L640 420 L0 420 Z`}
            fill={`url(#${uid}-far)`}
          />
          {[0, 1, 2, 3, 4].map((i) => (
            <path
              key={i}
              d={`M0 ${262 + i * 32} C${160 + i * 20} ${240 + i * 32} ${430 - i * 18} ${292 + i * 32} 640 ${258 + i * 32} L640 ${300 + i * 32} C${420} ${300 + i * 32} ${190} ${272 + i * 32} 0 ${304 + i * 32} Z`}
              fill={tints[1]}
              opacity={0.24 + i * 0.12}
            />
          ))}
        </>
      )}

      {feature && (
        /* Vân giấy dó nhẹ, chỉ dùng ở ảnh lớn để giữ file nhẹ */
        <g opacity="0.14" fill="var(--ink)">
          {Array.from({ length: 26 }, (_, i) => (
            <circle
              key={i}
              cx={((i * 97 + h) % 640)}
              cy={((i * 151 + h) % 420)}
              r={1.5}
            />
          ))}
        </g>
      )}
    </svg>
  );
}
