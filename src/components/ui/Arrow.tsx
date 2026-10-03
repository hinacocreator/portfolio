/**
 * 原稿に含まれる矢印（「詳細を見る →」「← トップへ戻る」）。文字として出す（SVG・アイコンにしない）。AD v2 §3.4。
 * 装飾なので読み上げない（aria-hidden）。inline-block にして、リンクの下線を矢印にかけない。
 */
export function Arrow({ direction }: { direction: "right" | "left" }) {
  return direction === "right" ? (
    <span className="arrow" aria-hidden="true">
      →
    </span>
  ) : (
    <span className="arrow arrow--before" aria-hidden="true">
      ←
    </span>
  );
}
