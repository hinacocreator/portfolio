import Link from "next/link";
import { nav, ui } from "@/content/sections";
import { siteConfig } from "@/config/site";
import { anchorId } from "@/lib/anchors";
import { HeaderNameObserver } from "@/components/ui/HeaderNameObserver";

/**
 * 固定ナビ（ABOUT / WORK / INTERESTS / CONTACT）。CTAボタン・ハンバーガー・現在地ハイライトなし。
 * 名前は 640px 以上で表示。トップページでは HERO の名前が画面内にある間は隠す（HeaderNameObserver）。
 *
 * variant:
 *   "home" … トップページ。ページ内のハッシュだけ（#about。再読み込みしない）。名前は #top へ。
 *   "sub"  … 詳細ページ・404。トップの各アンカーへ（/#about）。next/link なので basePath は Next が付ける。
 *            名前はトップ（/）へのリンクで、常に表示される（#site-title が無いページ）。
 */
export function Header({ variant = "home" }: { variant?: "home" | "sub" }) {
  const isHome = variant === "home";

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        {isHome ? (
          <a className="site-header__name" href="#top" lang="en">
            {siteConfig.name}
          </a>
        ) : (
          <Link className="site-header__name is-visible" href="/" lang="en">
            {siteConfig.name}
          </Link>
        )}
        <nav className="site-header__nav" aria-label={ui.navLabel}>
          <ul role="list">
            {nav.map((item) => (
              <li key={item.target}>
                {isHome ? (
                  <a className="site-header__link" href={`#${anchorId[item.target]}`} lang="en">
                    {item.label}
                  </a>
                ) : (
                  <Link className="site-header__link" href={`/#${anchorId[item.target]}`} lang="en">
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <HeaderNameObserver />
    </header>
  );
}
