/**
 * 写真の台帳（config/photos.ts）と、画像パイプラインが出力したメタ情報
 * （config/photo-meta.json）を結び付けて、<picture> に渡す情報を返します。
 *
 * ・visible: false の写真は null を返す（呼び出し側は何も描画しなければよい）。
 * ・visible: true なのに画像が未生成（`npm run images` 未実行）なら、ビルド時にエラーにする。
 *   → 壊れた画像のまま公開されるのを防ぐ。
 */
import photoMeta from "@/config/photo-meta.json";
import { photos, type PhotoId } from "@/config/photos";
import { withBasePath } from "@/lib/paths";

type PhotoMetaEntry = {
  sourceWidth: number;
  sourceHeight: number;
  width: number;
  height: number;
  aspect: number;
  outputWidths: number[];
};

const metaById = photoMeta.photos as Record<string, PhotoMetaEntry | undefined>;

export type PhotoAsset = {
  id: string;
  alt: string;
  /** 最大サイズの実寸（<img width/height> に使う。CLS防止） */
  width: number;
  height: number;
  /** width / height */
  aspect: number;
  /** 台帳の objectPosition（任意） */
  objectPosition?: string;
  /** <source srcSet> 用（type="image/avif" / "image/webp"） */
  srcSet: { avif: string; webp: string };
  /** <img src> 用のフォールバック（最大サイズの WebP） */
  src: string;
  /** 出力されている最大幅 */
  maxWidth: number;
};

const srcSetFor = (id: string, widths: number[], ext: "avif" | "webp") =>
  widths.map((w) => `${withBasePath(`/images/${id}-${w}.${ext}`)} ${w}w`).join(", ");

export function getPhoto(id: PhotoId): PhotoAsset | null {
  const entry = photos.find((p) => p.id === id);
  if (!entry) throw new Error(`写真 "${id}" は src/config/photos.ts にありません。`);
  if (!entry.visible) return null;

  const meta = metaById[id];
  if (!meta || meta.outputWidths.length === 0) {
    throw new Error(
      `写真 "${id}" は visible: true ですが、画像が生成されていません。` +
        "原本のあるPCで `npm run images` を実行し、public/images/ と src/config/photo-meta.json をコミットしてください。",
    );
  }

  const widths = meta.outputWidths;
  const maxWidth = widths[widths.length - 1];
  return {
    id,
    alt: entry.alt,
    width: meta.width,
    height: meta.height,
    aspect: meta.aspect,
    objectPosition: entry.objectPosition,
    srcSet: { avif: srcSetFor(id, widths, "avif"), webp: srcSetFor(id, widths, "webp") },
    src: withBasePath(`/images/${id}-${maxWidth}.webp`),
    maxWidth,
  };
}
