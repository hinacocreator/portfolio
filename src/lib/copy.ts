/**
 * 文章（sections.ts）を画面に出すときの小さな変換。文言は一切足さない・変えない。
 */

/** 段落（行の配列）を1つの文章につなぐ。原稿は1文ごとに行が分かれているため、日本語では区切りなしでつなぐ */
export const joinLines = (lines: readonly string[]): string => lines.join("");

/**
 * 短いキャッチコピーを、読点（、）の位置で前半・後半の2つに分ける（HERO の核メッセージ用）。
 * 例: 「考え、つないで、つくり、届ける。」→「「考え、つないで、」「つくり、届ける。」」
 * 文字数がいちばん半分に近い読点で切る。読点がなければ分けない。
 */
export function splitAtMiddleComma(text: string): string[] {
  const cuts: number[] = [];
  for (let i = 0; i < text.length - 1; i += 1) {
    if (text[i] === "、") cuts.push(i + 1);
  }
  if (cuts.length === 0) return [text];
  const half = text.length / 2;
  const cut = cuts.reduce((best, c) => (Math.abs(c - half) < Math.abs(best - half) ? c : best));
  return [text.slice(0, cut), text.slice(cut)];
}

/**
 * 原稿で「ここからここまでが表示する文言」と示すために付いている、外側の「」を画面では出さない。
 * 対象は、見出し・核メッセージのように「一文まるごと」を括っているところだけ
 * （HERO の核メッセージ / CONTACT の見出し。Art Direction §3.2・§4）。
 * 文の途中の「」や、発話を示す「」（ABOUT の引用、CONTACT の本文）は触らない。
 * データ（sections.ts）は変えない。「」も出したいときは、この関数の呼び出しを外すだけ。
 */
export function unbracket(text: string): string {
  const inner = text.match(/^「([^「」]*)」$/);
  return inner ? inner[1] : text;
}
