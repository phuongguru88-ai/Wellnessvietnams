import type { MetadataRoute } from "next";

import { getBaiVietList, getExperiences, getPrograms, getProperties } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [properties, programs, experiences, baiViet] = await Promise.all([
    getProperties(),
    getPrograms(),
    getExperiences(),
    getBaiVietList(),
  ]);

  const staticRoutes = [
    "",
    "/nghi-duong",
    "/chuong-trinh",
    "/trai-nghiem",
    "/kien-thuc",
    "/lien-he",
    "/ve-chung-toi",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const detailRoutes = [
    ...properties.map((p) => `/nghi-duong/${p.slug}`),
    ...programs.map((p) => `/chuong-trinh/${p.slug}`),
    ...experiences.map((e) => `/trai-nghiem/${e.slug}`),
    ...baiViet.map((b) => `/kien-thuc/${b.slug}`),
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...detailRoutes];
}
