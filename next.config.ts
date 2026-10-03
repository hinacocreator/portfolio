import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 無料の静的ホスト（GitHub Pages / Cloudflare Pages）向けに静的書き出しする。
  // このサイトは動的ルート・API Route・Server Actions を使わないため export 可能。
  output: "export",
  // next/image の最適化サーバーは静的書き出しでは動かない。
  // 画像は scripts/images.mjs が事前生成するので、ここでは最適化を無効にする。
  images: { unoptimized: true },
  // 静的ホストで /about/ のようなパスを正しく解決するため、/about/index.html を出力する。
  trailingSlash: true,
  // サブパス配信（GitHub Pages の https://ユーザー名.github.io/リポジトリ名/ など）用。
  // 環境変数 NEXT_PUBLIC_BASE_PATH を渡したビルドのときだけ有効（未設定なら空＝ルート配信）。
  // 独自ドメイン運用に移ったら、この環境変数を外すだけでよい。
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  reactStrictMode: true,
};

export default nextConfig;
