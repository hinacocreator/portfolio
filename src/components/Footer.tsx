import { ui } from "@/content/sections";
import { siteConfig } from "@/config/site";
import { footerHref } from "@/lib/links";
import { KeepText } from "@/lib/keep";

/**
 * フッター（paper-deep の帯）。Cona Design は主役にしないので小さな1行。
 * href が設定されていればテキストリンク、空なら素のテキスト。
 */
export function Footer() {
  const year = new Date().getFullYear();
  const href = footerHref();

  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <p className="site-footer__copy" lang="en">
          {ui.copyright} {year} {siteConfig.name}
        </p>
        <div className="site-footer__right">
          <p className="site-footer__credit" lang="en">
            {href ? (
              <a className="link" href={href}>
                <KeepText>{siteConfig.footer.credit}</KeepText>
              </a>
            ) : (
              <KeepText>{siteConfig.footer.credit}</KeepText>
            )}
          </p>
          <a className="site-footer__top link" href="#top" lang="en">
            {ui.backToTop}
          </a>
        </div>
      </div>
    </footer>
  );
}
