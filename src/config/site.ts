/**
 * =========================================================
 * サイト設定（文章ではない設定値）
 * =========================================================
 * 【ここを書き換えると何が変わるか】
 *   ・ links の Instagram / note / Email … 連絡先のリンク先。
 *       "" （空文字）のままなら、そのリンクは自動で非表示になります。レイアウトは崩れません。
 *       - instagram / note : "https://..." で始まるURLを入れる
 *       - email            : メールアドレスだけを入れる（例: name@example.com）。mailto: は不要
 *   ・ footer.href … フッターの「Cona Design」表記にリンクを付けたいときのURL。空なら文字だけ。
 *   ・ projects.guildFarm … PROJECT の「GUILD Farm」の文字にリンクを付けたいときのURL。空なら文字だけ（現在は未使用。詳細ページへの導線は「詳細を見る →」の1本）。
 *   ・ ogImage … SNSでシェアされたときの画像（public/ に置いたファイル名）。
 *
 * 【表示される文章について】
 *   サイト名・肩書・説明文・フッターの Cona Design 表記は、表示される文章なので
 *   src/content/sections.ts が元です（ここでは参照しているだけ）。直したいときは
 *   sections.ts の hero / footer を書き換えてください。
 *   説明文（description）は HERO の紹介文をそのまま使っています（新しい文言は足していません）。
 *
 * 【公開URL・サブパスについて】
 *   ドメインやリポジトリ名はコードに書かず、ビルド時の環境変数で渡します（src/lib/paths.ts 参照）。
 *     NEXT_PUBLIC_SITE_URL  … 公開URL（未設定でもビルドできる）
 *     NEXT_PUBLIC_BASE_PATH … サブパス配信のときだけ
 *   GitHub Actions では、GitHub Pages の設定から自動で渡されます。
 */
import { footer, hero } from "@/content/sections";
import { siteUrl } from "@/lib/paths";

/** 下層ページの <title>。「ページ名｜サイト名」（トップの title と同じ区切り） */
export const pageTitle = (pageName: string): string => `${pageName}｜${hero.name}`;

export const siteConfig = {
  /** サイト名・本人名（sections.ts の hero.name） */
  name: hero.name,

  /** 肩書（sections.ts の hero.title）。JSON-LD の jobTitle などに使う */
  jobTitle: hero.title,

  /** <title> に入る文字列 */
  title: `${hero.name}｜${hero.title}`,

  /** 検索結果・SNSシェア時の説明文。HERO の紹介文を連結したもの */
  description: hero.paragraphs.flat().join(""),

  /**
   * 公開URL（環境変数 NEXT_PUBLIC_SITE_URL）。未設定のときは空文字です。
   * 空のときは、絶対URLが必要な箇所は相対パスにフォールバックします（paths.ts の absoluteUrl）。
   */
  url: siteUrl,

  /** SNSシェア画像（public/ 以下のパス。1200x630）。`npm run og`（scripts/og.mjs）で作ります */
  ogImage: "/og.jpg",

  /**
   * 連絡先リンク。 "" （空文字）＝非表示。URL が決まったらここに入れるだけで表示されます。
   * Instagram / note は https:// から始まるURL、Email はメールアドレスのみ。
   */
  links: {
    instagram: "https://www.instagram.com/hinacof/",
    note: "",
    email: "",
  },

  /**
   * プロジェクトのリンク先。 "" （空文字）なら文字だけで、リンクは付きません。
   * guildFarm … PROJECT の見出し「GUILD Farm」に付けるURL（https:// から始まるもの）。
   */
  projects: {
    guildFarm: "",
  },

  /** SNSシェア画像の代替テキスト。名前と肩書から自動で作ります */
  ogImageAlt: `${hero.name} — ${hero.title}`,

  /** フッターの表記。文言は sections.ts の footer.credit。href が空ならリンクなし */
  footer: {
    credit: footer.credit,
    href: "",
  },
} as const;

export type SiteLinks = typeof siteConfig.links;
