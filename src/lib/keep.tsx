import { Fragment } from "react";

/**
 * 折り返しで泣き別れさせない語句（日本語の文章の中で、途中で改行されると読みづらいもの）。
 * 描画時にだけ nowrap の span で包む。データ（sections.ts / projects.ts / site.ts）の文字列は変えない。
 */
export const KEEP_TERMS = [
  "農業 × 暮らしを",
  "テーマにした",
  "GUILD Farm",
  "TikTok Shop",
  "Live Commerce",
  "コンテンツ企画・制作",
  "PR・集客",
  "Experience Design",
  "携わった後、", // BACKGROUND（768・1280・1440 で「携わった｜後、」と折れるのを防ぐ）
] as const;

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** 長い語を優先してマッチさせる（先頭から最長一致）。 */
const KEEP_PATTERN = new RegExp(
  `(${[...KEEP_TERMS]
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join("|")})`,
  "g",
);

/** 「×」だけ <span class="times"> で包む（times=true のとき）。textContent は変わらない。 */
function renderTimes(text: string, enabled: boolean): React.ReactNode {
  if (!enabled || !text.includes("×")) return text;
  const parts = text.split("×");
  return parts.map((part, i) => (
    <Fragment key={i}>
      {i > 0 ? <span className="times">×</span> : null}
      {part}
    </Fragment>
  ));
}

/**
 * 文字列を KEEP_TERMS の出現位置で分け、該当部分を nowrap の span.keep で包む。
 * それ以外は元の文字列のまま。times=true のときは「×」を span.times で包む（どの部分でも）。
 * 出力の textContent は入力と一字一句同じ。
 */
export function KeepText({ children, times = false }: { children: string; times?: boolean }): React.ReactNode {
  // split + capture group: 奇数 index が該当語
  const segments = children.split(KEEP_PATTERN);
  return (
    <>
      {segments.map((seg, i) => {
        if (seg === "") return null;
        if (i % 2 === 1) {
          return (
            <span key={i} className="keep" style={{ whiteSpace: "nowrap" }}>
              {renderTimes(seg, times)}
            </span>
          );
        }
        return <Fragment key={i}>{renderTimes(seg, times)}</Fragment>;
      })}
    </>
  );
}
