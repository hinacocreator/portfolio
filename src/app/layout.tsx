import type { Metadata, Viewport } from "next";
import { preconnect } from "react-dom";
import { Footer } from "@/components/Footer";
import { RevealController } from "@/components/ui/RevealController";
import { siteConfig } from "@/config/site";
import { ui } from "@/content/sections";
import { gothicFontHref, minchoFontHref } from "@/lib/font-text";
import { sameAsLinks } from "@/lib/links";
import { absoluteUrl, withBasePath } from "@/lib/paths";
import { newsreader } from "./fonts";
import "./globals.css";

/**
 * 公開URL（NEXT_PUBLIC_SITE_URL）がある → canonical / OGP 画像 / JSON-LD の url は絶対URL。
 * ない（ローカル・プレビュー）→ 相対のまま壊れずに出力する（localhost のURLを埋め込まない）。
 */
const hasSiteUrl = Boolean(siteConfig.url);
const pageUrl = absoluteUrl("/"); // URLなし: "/" or "/サブパス/"、あり: "https://…/"
const ogImageUrl = absoluteUrl(siteConfig.ogImage);

export const metadata: Metadata = {
  metadataBase: hasSiteUrl ? new URL(siteConfig.url) : undefined,
  title: siteConfig.title,
  description: siteConfig.description,
  alternates: { canonical: pageUrl },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: pageUrl,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    // 相対URLの og:image は Next が localhost の絶対URLに変えてしまうため、URLがあるときだけ metadata API で出す
    // （ないときは下の <head> に相対のまま出す）
    ...(hasSiteUrl ? { images: [{ url: ogImageUrl, width: 1200, height: 630, alt: siteConfig.ogImageAlt }] } : {}),
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    ...(hasSiteUrl ? { images: [{ url: ogImageUrl, alt: siteConfig.ogImageAlt }] } : {}),
  },
};

export const viewport: Viewport = {
  themeColor: "#F4F0E8", // paper
};

/** JSON-LD（Person）。sameAs は設定済みのリンクだけ。URL がなければ url も出さない */
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: siteConfig.name,
  jobTitle: siteConfig.jobTitle,
  description: siteConfig.description,
  ...(hasSiteUrl ? { url: pageUrl } : {}),
  ...(sameAsLinks().length > 0 ? { sameAs: sameAsLinks() } : {}),
};

/**
 * <head> の最初に動く小さなスクリプト（描画前）。
 *  ・js クラス … ヘッダーの名前の出し入れ（JS 有効時だけ初期非表示）
 *  ・reveal-on クラス … fade/reveal の初期非表示。reduced-motion のとき、および URL に #アンカー が
 *    付いているとき（着地点が白く抜けないように）は付けない
 *  ・4秒たっても RevealController が data-ready を立てなければ両方を外す（JS が壊れても本文を隠したままにしない）
 */
const headScript = `(function(){try{var d=document.documentElement;d.classList.add('js');if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&!location.hash){d.classList.add('reveal-on')}setTimeout(function(){if(!d.hasAttribute('data-ready')){d.classList.remove('js','reveal-on')}},4000)}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Google Fonts（和文2書体）への接続を先に開く。<head> の先頭に <link rel="preconnect"> が出る
  preconnect("https://fonts.googleapis.com");
  preconnect("https://fonts.gstatic.com", { crossOrigin: "anonymous" });

  return (
    <html lang="ja" className={newsreader.variable} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: headScript }} />
        {/* 和文2書体: ページで使う文字だけ（text=）。ビルド時に content / config から作る（src/lib/font-text.ts） */}
        <link rel="stylesheet" href={gothicFontHref} />
        <link rel="stylesheet" href={minchoFontHref} />
        {hasSiteUrl ? null : (
          <>
            <meta property="og:image" content={withBasePath(siteConfig.ogImage)} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={siteConfig.ogImageAlt} />
            <meta name="twitter:image" content={withBasePath(siteConfig.ogImage)} />
            <meta name="twitter:image:alt" content={siteConfig.ogImageAlt} />
          </>
        )}
      </head>
      <body>
        {/* ヘッダーはページごとに置く（トップは variant="home"、下層ページ・404 は variant="sub"） */}
        <a className="skip" href="#main">
          {ui.skipLink}
        </a>
        {children}
        <Footer />
        <RevealController />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
