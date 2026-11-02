import type { MetadataRoute } from "next";
import { ARTICLES } from "@/content/academy";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const pages = ["", "/simulateur", "/academie", "/ressources", "/a-propos", "/contact", "/confidentialite"].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : path === "/simulateur" ? 0.9 : 0.7,
  }));
  const articles = ARTICLES.map((a) => ({
    url: `${base}/academie/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));
  return [...pages, ...articles];
}
