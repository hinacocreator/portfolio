import { KeepText } from "@/lib/keep";

/**
 * 明朝スタックの文章の中の「×」だけ、Newsreader の小さく低い字形を避けて Shippori にする（AD v2 §3.5）。
 * 文言は変えない（「×」だけ <span class="times"> で包む）。
 * あわせて KeepText で、「農業 × 暮らしを」「テーマにした」などの途中改行を避ける（WRAP-SUBTITLE）。
 */
export function TimesText({ children }: { children: string }) {
  return <KeepText times>{children}</KeepText>;
}
