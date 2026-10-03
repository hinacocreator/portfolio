import type { CSSProperties } from "react";
import type { PhotoAsset } from "@/lib/photos";
import { Reveal } from "./Reveal";

/**
 * 写真（<figure> + <picture>）。AVIF → WebP の順に srcset を出し、width / height で CLS を防ぐ。
 * 比率と object-position は CSS 変数で、ブレークポイントごとに切り替える（globals.css の .photo）。
 *   --ar / --ar-md(≥768) / --ar-lg(≥1024)    … aspect-ratio
 *   --op / --op-md(≥768) / --op-lg(≥1024)    … object-position（未指定は台帳 photos.ts の objectPosition）
 * 角丸・影・枠線・filter は付けない。HERO だけ eager + fetchPriority high。
 *
 * 写真が非表示（getPhoto が null）のときは、呼び出し側が描画しない。
 */
type Props = {
  photo: PhotoAsset;
  /** <picture> の sizes（Art Direction §5.3。cover ではみ出す分を含めた値） */
  sizes: string;
  /** 比率（"4 / 5" のように CSS の aspect-ratio 値） */
  ar: string;
  arMd?: string;
  arLg?: string;
  /** object-position。未指定なら台帳の値 */
  op?: string;
  opMd?: string;
  opLg?: string;
  /** 最大表示幅（CSS の長さ。例 "var(--photo-portrait-max)"）。拡大表示を防ぐ上限 */
  max?: string;
  /** キャプション（欧文イタリック）。付けるのは REGIONAL / PROJECT の記録写真だけ */
  caption?: string;
  /** HERO の写真だけ true（eager + fetchPriority high、Reveal なし） */
  priority?: boolean;
  /** 遅延（ms）。同じセクションの2枚目は 120ms */
  delay?: number;
  className?: string;
};

export function Photo({ photo, sizes, ar, arMd, arLg, op, opMd, opLg, max, caption, priority, delay, className }: Props) {
  const style = {
    "--ar": ar,
    "--ar-md": arMd,
    "--ar-lg": arLg,
    "--op": op ?? photo.objectPosition ?? "50% 50%",
    "--op-md": opMd,
    "--op-lg": opLg,
    "--photo-max": max,
  } as CSSProperties;

  const body = (
    <>
      <div className="photo__frame">
        <picture>
          <source type="image/avif" srcSet={photo.srcSet.avif} sizes={sizes} />
          <source type="image/webp" srcSet={photo.srcSet.webp} sizes={sizes} />
          <img
            src={photo.src}
            width={photo.width}
            height={photo.height}
            alt={photo.alt}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={priority ? "high" : undefined}
          />
        </picture>
      </div>
      {caption ? <figcaption lang="en">{caption}</figcaption> : null}
    </>
  );

  const cls = ["photo", className].filter(Boolean).join(" ");
  if (priority) {
    return (
      <figure className={cls} style={style}>
        {body}
      </figure>
    );
  }
  return (
    <Reveal as="figure" variant="photo" delay={delay} className={cls} style={style}>
      {body}
    </Reveal>
  );
}
