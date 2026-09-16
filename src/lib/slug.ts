import { normalizeSearch } from "./search";

/** "Villa Chàm — Hà Giang" -> "villa-cham-ha-giang" */
export function slugify(input: string): string {
  const base = normalizeSearch(input)
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return base || "muc";
}

/** Thêm hậu tố -2, -3... nếu slug đã tồn tại trong danh sách. */
export function ensureUniqueSlug(
  base: string,
  taken: Set<string>,
  ignoring?: string,
): string {
  const candidates = new Set(taken);
  if (ignoring) candidates.delete(ignoring);

  if (!candidates.has(base)) return base;
  let i = 2;
  while (candidates.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}
