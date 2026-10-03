import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { projectSlugs } from "@/content/projects";

// 静的書き出し（output: "export"）では静的に生成する必要がある
export const dynamic = "force-static";

/**
 * sitemap.xml（トップ＋プロジェクト詳細ページ）。サイトマップには絶対URLが必要なので、
 * 公開URL（NEXT_PUBLIC_SITE_URL）が設定されているときだけ中身が入る。未設定なら空。
 * trailingSlash: true に合わせて、どのURLも末尾は「/」。
 */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteConfig.url) return [];
  return [
    { url: `${siteConfig.url}/` },
    ...projectSlugs.map((slug) => ({ url: `${siteConfig.url}/projects/${slug}/` })),
  ];
}
