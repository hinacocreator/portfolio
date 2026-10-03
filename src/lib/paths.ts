/**
 * =========================================================
 * 配信サブパスとサイトURLの扱い
 * =========================================================
 * 【サブパス（basePath）】
 * GitHub Pages のプレビュー公開（https://ユーザー名.github.io/リポジトリ名/）では、
 * サイト全体が /リポジトリ名 の下にぶら下がります。next.config.ts の basePath が
 * その設定で、next/link や _next/ の読み込みには Next.js が自動で付けてくれますが、
 *
 *   ・<img src="..."> / <source srcSet="..."> のような素のHTMLタグ
 *   ・next/image の src（images.unoptimized: true のときは自動付与されない）
 *   ・public/ 直下のファイルへの <a href>
 *
 * には付きません。public/ 以下のファイルを指すパスは withBasePath() を通して渡します。
 *
 * 独自ドメイン運用・ローカル開発では NEXT_PUBLIC_BASE_PATH を設定しないので、
 * basePath は空文字になり、何も起きません。
 *
 * 【サイトURL（siteUrl）】
 * 環境変数 NEXT_PUBLIC_SITE_URL（例: https://example.com）から読みます。
 * サブパス配信のときは「サブパスを含めた」URLを入れます
 * （例: https://ユーザー名.github.io/リポジトリ名）。
 * 未設定なら空文字になり、absoluteUrl() は相対パスを返します（ビルドは壊れません）。
 * ドメインやリポジトリ名をコードに直書きしないでください。
 */

/** 配信サブパス。未設定なら空文字（＝ルート配信）。末尾スラッシュは除く */
export const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/+$/, "");

/** サイトの公開URL。未設定なら空文字。末尾スラッシュは除く */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/+$/, "");

/**
 * public/ 以下のファイルを指すパスに、配信サブパスを前置します。
 * 例）basePath が "/repo" のとき "/images/a.avif" → "/repo/images/a.avif"
 *
 * 先頭が "/" ではないパス（外部URL・data URI など）はそのまま返します。
 */
export function withBasePath(path: string): string {
  if (!basePath) return path;
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  return `${basePath}${path}`;
}

/**
 * 絶対URL（OGP・canonical・JSON-LD 用）を作ります。
 * siteUrl はすでにサブパスを含むため、ここでは basePath を二重に足しません。
 * siteUrl が未設定のときは、相対パス（withBasePath 適用済み）を返します。
 */
export function absoluteUrl(path: string): string {
  if (!siteUrl) return withBasePath(path);
  if (!path.startsWith("/")) return path;
  return `${siteUrl}${path}`;
}
