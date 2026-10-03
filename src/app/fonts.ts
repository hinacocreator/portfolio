import localFont from "next/font/local";

/**
 * 欧文書体 Newsreader（OFL）。名前・ラベル・英字見出し・キャプション用。
 * ファイルは Google Fonts の latin サブセット（太さ 400 固定・opsz 6–72 可変）を一度だけ保存したもの。
 * `opsz` が可変なので、88px の名前と 13px のラベルを同じ書体で最適な字形にできる。
 * font-optical-sizing は既定の auto のまま（指定しない）。
 *
 * 和文2書体（Zen Kaku Gothic New / Shippori Mincho）は、layout.tsx で Google Fonts の
 * CSS を text= 付きで読み込む（src/lib/font-text.ts がビルド時に文字を集める）。
 */
export const newsreader = localFont({
  src: [
    { path: "../fonts/newsreader-roman.woff2", weight: "400", style: "normal" },
    { path: "../fonts/newsreader-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-newsreader",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});
