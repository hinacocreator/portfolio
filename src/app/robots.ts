import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

// 静的書き出し（output: "export"）では静的に生成する必要がある
export const dynamic = "force-static";

/** robots.txt。公開URLが設定されているとき（NEXT_PUBLIC_SITE_URL）だけ sitemap の場所を書く */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    ...(siteConfig.url ? { sitemap: `${siteConfig.url}/sitemap.xml` } : {}),
  };
}
