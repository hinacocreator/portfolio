import { createElement, type CSSProperties, type ElementType, type HTMLAttributes } from "react";

/**
 * スクロールで現れる fade / reveal の「印」を付ける要素。
 * このコンポーネント自体は動かない（サーバーでクラスを付けるだけ）。
 * 実際の動きは RevealController（IntersectionObserver）が `is-in` クラスを付けて起こす。
 *
 *   variant="text"  … 下から 16px 上がりながら現れる（700ms）。テキストのまとまり
 *   variant="photo" … フェードのみ（900ms）。写真
 *   variant="item"  … 12px 上がる（600ms）。INTERESTED IN の各行
 *
 * 初期非表示は <html class="reveal-on"> のときだけ（JS 有効かつ reduced-motion でないとき）。
 * JS 無効・失敗時、reduced-motion、印刷では最初から全部見える（globals.css 参照）。
 */
type Variant = "text" | "photo" | "item";

type Props = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  variant?: Variant;
  /** 同じまとまりの中での遅延（ms）。90ms ずつ・最大3段（Art Direction §6） */
  delay?: number;
};

const variantClass: Record<Variant, string> = {
  text: "reveal",
  photo: "reveal-photo",
  item: "reveal reveal--item",
};

export function Reveal({ as = "div", variant = "text", delay = 0, className, style, children, ...rest }: Props) {
  const merged = [variantClass[variant], className].filter(Boolean).join(" ");
  const withDelay = delay ? ({ ...style, "--reveal-delay": `${delay}ms` } as CSSProperties) : style;
  return createElement(as, { ...rest, className: merged, style: withDelay }, children);
}
