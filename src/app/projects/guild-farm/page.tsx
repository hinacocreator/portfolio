import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { ProjectDetail } from "@/components/sections/ProjectDetail";
import { pageTitle, siteConfig } from "@/config/site";
import { guildFarm } from "@/content/projects";
import { absoluteUrl } from "@/lib/paths";

/**
 * GUILD Farm 詳細ページ（/projects/guild-farm/）。
 * 文章は src/content/projects.ts の guildFarm。ドメイン・サブパスは直書きしない（paths.ts 経由）。
 * canonical / OGP の URL は、公開URL（NEXT_PUBLIC_SITE_URL）があれば絶対URL、なければ相対（サブパス込み）。
 * og:image はトップと同じ（絶対URLがあるときだけ metadata API、ないときは layout.tsx の <head> の相対 meta）。
 */
const path = `/projects/${guildFarm.slug}/`;
const hasSiteUrl = Boolean(siteConfig.url);
const url = absoluteUrl(path);
const title = pageTitle(guildFarm.overview.name);
const description = guildFarm.overview.subtitle;
const ogImageUrl = absoluteUrl(siteConfig.ogImage);

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url,
    siteName: siteConfig.name,
    title,
    description,
    ...(hasSiteUrl ? { images: [{ url: ogImageUrl, width: 1200, height: 630, alt: siteConfig.ogImageAlt }] } : {}),
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    ...(hasSiteUrl ? { images: [{ url: ogImageUrl, alt: siteConfig.ogImageAlt }] } : {}),
  },
};

export default function GuildFarmPage() {
  return (
    <>
      <Header variant="sub" />
      <ProjectDetail project={guildFarm} />
    </>
  );
}
