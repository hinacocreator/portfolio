import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { pageTitle } from "@/config/site";
import { ui } from "@/content/sections";

// layout の title は文字列（テンプレートなし）なので、これで置き換わる。noindex は Next が自動で付ける
export const metadata: Metadata = { title: pageTitle(ui.notFound.code) };

// 語の途中で改行しない。auto-phrase 非対応（Safari / Firefox）では、最後の漢字のまとまり（動詞の頭）から末尾までを nowrap で守る。
// 文言は ui.notFound.message から導出する（日本語は直書きしない）
const kanjiRuns = [...ui.notFound.message.matchAll(/\p{Script=Han}+/gu)];
const messageAt = kanjiRuns.length >= 2 ? kanjiRuns[kanjiRuns.length - 1].index : -1;

/**
 * 404 ページ（static export では 404.html になる）。
 * 文言は sections.ts の ui.notFound。新しいクラスは作らず、既存の container--content / sec__inner / label / link だけで組む（container は v2 で visual 幅になるので、罫線は content 幅の container--content）。
 * 文字は和文ゴシック（ui の文字は自動でフォント配信に含まれる）。明朝の見出しは使わない（明朝は文字を絞って配信しているため）。
 * トップへのリンクは next/link（basePath は Next が付ける）。
 */
export default function NotFound() {
  return (
    <>
      <Header variant="sub" />
      <main id="main">
        <div
          className="container--content sec__inner"
          style={{ marginTop: "var(--space-M)", paddingBottom: "var(--space-L)" }}
        >
          <p className="label" lang="en">
            {ui.notFound.code}
          </p>
          <h1
            style={{
              marginTop: "var(--space-head)",
              fontSize: "var(--fs-lead-ja)",
              lineHeight: 1.6,
              letterSpacing: "0.06em",
              textWrap: "balance",
              wordBreak: "auto-phrase" as React.CSSProperties["wordBreak"],
            }}
          >
            {messageAt >= 0 ? (
              <>
                {ui.notFound.message.slice(0, messageAt)}
                <span style={{ whiteSpace: "nowrap" }}>{ui.notFound.message.slice(messageAt)}</span>
              </>
            ) : (
              ui.notFound.message
            )}
          </h1>
          <p style={{ marginTop: 32, fontSize: "var(--fs-lead)" }}>
            <Link className="link" href="/">
              {ui.notFound.backToHome}
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
