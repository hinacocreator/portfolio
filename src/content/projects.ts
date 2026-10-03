/**
 * =========================================================
 * プロジェクト詳細ページの文章（/projects/guild-farm/）
 * =========================================================
 * 【このファイルについて】
 *   GUILD Farm 詳細ページに表示する文章です。元は docs/brief-v2.md の §P（下書き・本人確認待ち）。
 *   文言は §P のとおりで、scripts/verify-content.mjs（npm run verify:content）が一字一句の一致を確認します。
 *
 * 【書き換えるときの注意】
 *   ・"（ダブルクォート）と行末の , は消さないでください。
 *   ・ photos は写真の台帳（src/config/photos.ts）の id です。表示文章ではありません。
 *   ・ href は basePath を含まないサイト内パスです（表示側で basePath を付けます）。
 *   ・「←」「→」は装飾なので、表示側で付けます（文言データには含めません）。
 *   ・このファイルには「import」を書かず、型・定数だけにしてください（verify:content が直接読み込むため）。
 *
 * 【方針（§P）】
 *   事実記録にあることだけ。数値（再生数・フォロワー数・申込数）、個人名、料金、参加者の声、
 *   社外秘の運用ツール詳細は書かない。スクリーンショット枠は本人確認後に追加する（現在は無し）。
 */

export type ProjectDetail = {
  /** URL の最後の部分（/projects/{slug}/） */
  slug: string;
  /** PROJECT OVERVIEW */
  overview: {
    /** 見出し「PROJECT OVERVIEW」 */
    label: string;
    name: string;
    subtitle: string;
    /** 概要（事業の説明） */
    description: string;
    /** 「担当」（項目名） */
    roleLabel: string;
    role: string;
    /** 「期間」（項目名） */
    periodLabel: string;
    period: string;
    /** 役割タグ（「 / 」区切りだった項目） */
    tags: readonly string[];
  };
  /** WEB / CREATIVE */
  webCreative: { label: string; items: readonly { text: string }[] };
  /** EVENT */
  event: { label: string; items: readonly { text: string }[] };
  /**
   * 使う写真の台帳 id（表示文章ではない）。
   * overview は Art Direction が決めるため、現在は空。event は展示会写真2枚。
   */
  photos: {
    overview: readonly string[];
    event: readonly string[];
  };
  /** 末尾の導線。href はサイト内パス（basePath なし）。「←」は表示側の装飾 */
  backLink: { label: string; href: string };
  contactLink: { label: string; href: string };
};

export const guildFarm: ProjectDetail = {
  slug: "guild-farm",
  overview: {
    label: "PROJECT OVERVIEW",
    name: "GUILD Farm",
    subtitle: "農業 × 暮らしをテーマにした事業のPR・集客支援",
    description:
      "愛媛県松山市・道後を拠点に、畑や農のある暮らしを体験しながら滞在できるシェアハウス事業です。",
    roleLabel: "担当",
    role: "PR・集客支援（事業の見せ方と情報発信の整理、Webサイト、SNS、クリエイティブ、イベント出展）",
    periodLabel: "期間",
    period: "継続中",
    tags: ["Business Planning", "PR", "Marketing", "SNS", "Web", "Creative", "Event"],
  },
  webCreative: {
    label: "WEB / CREATIVE",
    items: [
      {
        text: "公式Webサイトの企画・構成・制作。滞在の内容や過ごし方、プラン、申し込みまでの流れを、初めて知る人にも分かる順番で整理しました。",
      },
    ],
  },
  event: {
    label: "EVENT",
    items: [
      {
        text: "展示会で地域のブースに参加し、GUILD Farmの滞在や地域の取り組みを来場者に紹介しました。",
      },
    ],
  },
  photos: {
    overview: [],
    event: ["expo-booth", "expo-talk"],
  },
  backLink: { label: "トップへ戻る", href: "/#project" },
  contactLink: { label: "CONTACT", href: "/#contact" },
};

/** slug から引けるまとめ（generateStaticParams 用） */
export const projects = {
  "guild-farm": guildFarm,
} as const;

export const projectSlugs: readonly string[] = Object.keys(projects);
