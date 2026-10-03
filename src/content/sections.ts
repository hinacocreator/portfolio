/**
 * =========================================================
 * サイトに表示する文章（全8セクション＋ナビ＋フッター）
 * =========================================================
 * 【ここを書き換えると何が変わるか】
 *   サイトに出る文章は、すべてこのファイルが元になっています。
 *   "（ダブルクォート）で囲まれた部分が表示される文章です。文章を直したいときは、
 *   その引用符の「中」だけを書き換えてください。
 *
 * 【書き換えるときの注意】
 *   ・"（引用符）と、行末の , （カンマ）は消さないでください。消すとサイトが表示されなくなります。
 *   ・ id: "about" のような id / target / key は、ページ内リンク用の内部名です。変えないでください。
 *   ・ label: "ABOUT" のような英字ラベルは、各セクションの見出しに使われます。
 *   ・「 」（かぎ括弧）も文章の一部です。そのまま表示されます。
 *
 * 【文章の並べ方のルール】
 *   ・ paragraphs は「段落」の配列です。1つの段落は、さらに「行」の配列になっています。
 *       paragraphs: [
 *         ["1段落目の1行目", "1段落目の2行目"],
 *         ["2段落目の1行目"],
 *       ]
 *     1つの行は、元の原稿（docs/brief-v2.md）の1行に対応しています（言葉は1字も変えていません）。
 *     段落（paragraphs の1要素）＝ brief-v2 で空行に区切られたまとまり です。画面では1段落＝1つの
 *     <p>（または引用の1かたまり）になり、段落の間に間隔が付きます。切れ目は原稿の空行どおりなので、
 *     変えないでください（行を別の [ ] に移すと、原稿にない段落ができる／原稿の段落が消えます）。
 *     この形は scripts/verify-content.mjs の段落構造チェックと共通の約束です。
 *   ・ " / " や "：" でつながっていた項目（WHAT I DO の items、PROJECT の tags など）は、items / tags のように
 *     1項目ずつの配列にしています。項目の間の区切り記号は、表示する側（デザイン）で付けます。
 *
 * 【リンクについて】
 *   Instagram / note / Email のリンク先（URL）は、この文章のファイルではなく
 *   src/config/site.ts の links に入れます。空のままなら、そのリンクは自動で非表示になります。
 *
 * 【このファイルの注意】
 *   scripts/verify-content.mjs（npm run verify:content）が、このファイルを
 *   docs/brief-v2.md の原稿と突き合わせて文言の一致を確認します。そのため、
 *   このファイルには「import」を書かず、型・定数だけにしてください。
 */

/** ページ内リンク（アンカー）に使う各セクションの内部名 */
export type SectionId =
  | "hero"
  | "about"
  | "what-i-do"
  | "project"
  | "how-i-work"
  | "interests"
  | "outside"
  | "contact";

/** 段落＝行の配列。配列の1要素が原稿（brief-v2.md）の1行 */
export type Paragraph = readonly string[];

type SectionBase<Id extends SectionId> = {
  id: Id;
  /** 原稿のセクション名（英字ラベル）。見出し・ラベルに使う */
  label: string;
};

export type HeroContent = SectionBase<"hero"> & {
  name: string;
  /** 肩書 */
  title: string;
  /** コアメッセージ（原稿どおり「」付き） */
  tagline: string;
  paragraphs: readonly Paragraph[];
};

export type AboutContent = SectionBase<"about"> & {
  paragraphs: readonly Paragraph[];
  /** ABOUT の下部に小さく置く BACKGROUND（独立セクションではない） */
  background: { label: string; paragraphs: readonly Paragraph[] };
};

/** 事業領域の共通部分 */
type AreaBase = {
  /** 内部名（変えない） */
  id: "amazon" | "marketing" | "sns" | "regional";
  /** 領域名（英字を含む） */
  name: string;
  /** 導入文。1要素＝原稿の1行＝1段落（Regional は空行で区切られた2段落） */
  lead: readonly string[];
};

/** 最上位・最も大きな領域（Amazon）。小項目3つ＋注記を持つ */
export type AmazonArea = AreaBase & {
  id: "amazon";
  points: readonly { title: string; text: string }[];
  /** 注記（原稿どおり、括弧なしの文） */
  note: string;
};

/** Marketing / SNS / Regional。items は「 / 」区切りだった項目（Regional は無し） */
export type StandardArea = AreaBase & {
  id: "marketing" | "sns" | "regional";
  items?: readonly string[];
};

export type WhatIDoContent = SectionBase<"what-i-do"> & {
  /** 日本語の見出し（「事業内容」）。label は英字側（WHAT I DO） */
  heading: string;
  /** 4領域。先頭が Amazon。カード並列にしない（Art Direction で表現を決める） */
  areas: readonly [AmazonArea, ...StandardArea[]];
};

export type ProjectContent = SectionBase<"project"> & {
  name: string;
  subtitle: string;
  paragraphs: readonly Paragraph[];
  /** 「Business Planning / PR / ...」の分解 */
  tags: readonly string[];
  /** 詳細ページへのリンク。href は basePath を含まないサイト内パス（UI 側で basePath を付ける）。「→」は UI 側の装飾 */
  detailLink: { label: string; href: string };
};

export type HowIWorkContent = SectionBase<"how-i-work"> & {
  /** 「01 THINK — 考える：…」の分解 */
  steps: readonly { no: string; en: string; ja: string; text: string }[];
};

export type InterestsContent = SectionBase<"interests"> & {
  /** 文章のみ（項目の羅列はしない） */
  paragraphs: readonly Paragraph[];
};

export type OutsideContent = SectionBase<"outside"> & {
  items: readonly string[];
  paragraphs: readonly Paragraph[];
};

/** 連絡手段。リンク先（URL）は src/config/site.ts の links.{key} */
export type ContactChannelKey = "instagram" | "note" | "email";

export type ContactContent = SectionBase<"contact"> & {
  /** 見出し代わりの一文（原稿どおり「」付き） */
  lead: string;
  paragraphs: readonly Paragraph[];
  /** 表示名の定義。URL が空文字のものは site.ts 側の設定で自動的に非表示にする */
  channels: readonly { key: ContactChannelKey; label: string }[];
};

export type NavItem = {
  label: string;
  /** 飛び先のセクション（id）。href では "#" + target になる */
  target: SectionId;
};

// ---------------------------------------------------------
// ナビゲーション（brief-v2: ABOUT / WORK / INTERESTS / CONTACT）
//   WORK      → 事業内容 / WHAT I DO
//   INTERESTS → INTERESTS
// ---------------------------------------------------------
export const nav: readonly NavItem[] = [
  { label: "ABOUT", target: "about" },
  { label: "WORK", target: "what-i-do" },
  { label: "INTERESTS", target: "interests" },
  { label: "CONTACT", target: "contact" },
];

// ---------------------------------------------------------
// 1. HERO
// ---------------------------------------------------------
export const hero: HeroContent = {
  id: "hero",
  label: "HERO",
  name: "Hinako Kumamoto",
  title: "Creative Producer / Marketer",
  tagline: "「考え、つないで、つくり、届ける。」",
  paragraphs: [
    [
      "Amazon・ECを軸に、マーケティング戦略、広告運用、デザイン、Web・SNS制作、事業企画などを行っています。",
      "現在は企業のブランド支援に加えて、農業や地域に関わるプロジェクトにも携わっています。",
    ],
  ],
};

// ---------------------------------------------------------
// 2. ABOUT（BACKGROUND を下部に内包）
// ---------------------------------------------------------
export const about: AboutContent = {
  id: "about",
  label: "ABOUT",
  // brief-v2 §A の空行どおり 11 段落。[0]〜[2] リード／[3]〜[5] 引用（明朝）／[6]〜[10] 本文
  paragraphs: [
    ["これまでEC支援会社で、ブランド事業者のAmazon支援に携わってきました。"],
    ["独立後は、Amazonの販売戦略・広告運用・ページデザインを軸に、SNS戦略やWebサイト制作、事業企画など、支援する領域を広げています。"],
    ["最近では、農や地域に関わる仕事も増えてきました。"],
    ["仕事は、"],
    ["「こんなことをやりたい」", "「こういう未来をつくりたい」"],
    ["という、まだ曖昧な段階からご相談いただくことも多くあります。"],
    ["話を聞きながら、事業やプロダクトの背景にある考えを整理し、"],
    ["「だったら、こんなことができるかもしれない」"],
    ["と一緒に構想するところから、取り組みが始まります。"],
    ["そこから戦略を考え、必要な人や手段をつなぎ、実際のアウトプットまで形にしていく。"],
    ["戦略から実務まで、構想から実行まで一緒に進めることを大切にしています。"],
  ],
  background: {
    label: "BACKGROUND",
    paragraphs: [
      [
        "EC支援会社にて、Amazonを中心としたブランド支援を経験。販売戦略、広告運用、商品ページ改善、クリエイティブ制作、数値分析などに携わった後、マネジメント・プロジェクトディレクションを担当。",
      ],
      ["独立後はAmazon・ECを軸に、Web、SNS、クリエイティブ、事業企画、地域・農業プロジェクトへ活動領域を広げています。"],
    ],
  },
};

// ---------------------------------------------------------
// 3. 事業内容 / WHAT I DO（4領域。先頭の Amazon が最上位・最大）
// ---------------------------------------------------------
export const whatIDo: WhatIDoContent = {
  id: "what-i-do",
  heading: "事業内容",
  label: "WHAT I DO",
  areas: [
    {
      id: "amazon",
      name: "EC / Amazon販売支援",
      lead: ["ブランド事業全体を踏まえ、Amazon事業の戦略設計から日々の運用まで支援します。"],
      points: [
        {
          title: "Amazon事業戦略",
          text: "ブランド全体の方針や事業状況を踏まえ、Amazonでの販売戦略を設計。売上・利益を見ながらP/L管理や施策の優先順位を整理します。",
        },
        {
          title: "運用・改善",
          text: "広告運用、商品ページ改善、クリエイティブの企画・制作、セール施策、在庫管理など、Amazon運営に必要な実務を行います。",
        },
        {
          title: "Direction / Management",
          text: "社内外の運用メンバーと連携したチームディレクションや、Amazon事業全体のプロジェクトマネジメントにも対応します。",
        },
      ],
      note: "守秘義務等の都合により、一部クライアントワークは非公開です。詳細な実績は必要に応じてご紹介します。",
    },
    {
      id: "marketing",
      name: "Marketing / Creative",
      lead: ["事業や商品の目的を整理した上で、マーケティング戦略からクリエイティブ制作まで行います。"],
      items: ["マーケティング戦略", "コンセプト設計", "デザイン", "Webサイト制作", "コピー・文章", "動画", "AI Creative"],
    },
    {
      id: "sns",
      name: "SNS / Social Commerce",
      lead: [
        "SNSの戦略設計、コンテンツ企画・制作、運用支援。TikTok Shopやライブコマースなど、SNSから購買につなげる取り組みにも対応しています。",
      ],
      items: ["SNS戦略", "コンテンツ企画・制作", "SNS運用", "TikTok Shop", "Live Commerce"],
    },
    {
      id: "regional",
      name: "Regional / Agriculture",
      lead: [
        "農業や地域に関わる事業の企画・マーケティング支援。",
        "事業の整理からPR、SNS、Web、集客まで、プロジェクトに合わせて必要な施策を一緒に考えます。",
      ],
    },
  ],
};

// ---------------------------------------------------------
// 4. PROJECT — GUILD Farm（詳細ページ /projects/guild-farm/ へ）
// ---------------------------------------------------------
export const project: ProjectContent = {
  id: "project",
  label: "PROJECT",
  name: "GUILD Farm",
  subtitle: "農業 × 暮らしをテーマにした事業のPR・集客支援",
  paragraphs: [
    ["農家や地域事業者、地域に根ざしたプロダクト・体験事業のマーケティングを支援しています。"],
    ["現在はGUILD Farmの「農業 × シェアハウス」事業を中心に、PR・集客をサポート。"],
    [
      "事業の見せ方や情報発信の整理から、Webサイト、SNS、クリエイティブ、イベント出展など、認知・集客に必要な施策を一緒に進めています。",
    ],
  ],
  tags: ["Business Planning", "PR", "Marketing", "SNS", "Web", "Creative", "Event"],
  detailLink: { label: "詳細を見る", href: "/projects/guild-farm/" },
};

// ---------------------------------------------------------
// 5. HOW I WORK
// ---------------------------------------------------------
export const howIWork: HowIWorkContent = {
  id: "how-i-work",
  label: "HOW I WORK",
  steps: [
    { no: "01", en: "THINK", ja: "考える", text: "事業の背景、目的、課題を整理する。" },
    { no: "02", en: "CONNECT", ja: "つなぐ", text: "必要な人、企業、クリエイター、技術、手段を組み合わせる。" },
    { no: "03", en: "CREATE", ja: "つくる", text: "広告、デザイン、Web、SNS、動画など実際に使えるものまで形にする。" },
    { no: "04", en: "DELIVER", ja: "届ける", text: "制作して終わらず、ユーザーへ届け、数字や反応を見ながら改善する。" },
  ],
};

// ---------------------------------------------------------
// 6. INTERESTS（文章のみ）
// ---------------------------------------------------------
export const interests: InterestsContent = {
  id: "interests",
  label: "INTERESTS",
  paragraphs: [
    ["地域性のあるプロダクトや、地域の体験・事業づくりに関心があります。"],
    ["特にこれから関わっていきたいのは、食や農を起点とした6次産業化や地域事業。"],
    [
      "生産するだけでなく、商品やサービスとして形にし、マーケティングやEC、SNSを通じて販売・発信していくところまで、これまでの経験を活かして関わっていきたいと考えています。",
    ],
  ],
};

// ---------------------------------------------------------
// 7. OUTSIDE OF WORK（説明文を長くせず写真を主役に）
// ---------------------------------------------------------
export const outside: OutsideContent = {
  id: "outside",
  label: "OUTSIDE OF WORK",
  items: ["Sea", "Agriculture", "Cooking", "Art", "Books & Philosophy", "Life with Snoop"],
  paragraphs: [
    ["仕事以外では、海の近くで暮らしながら、料理、本、アートなどを楽しんでいます。"],
    ["農家を訪ね、その土地のものを食べたり、つくっている人の話を聞いたりすることにも関心があります。"],
  ],
};

// ---------------------------------------------------------
// 8. CONTACT
// ---------------------------------------------------------
export const contact: ContactContent = {
  id: "contact",
  label: "CONTACT",
  lead: "「一緒にできそうなことがあれば、ぜひ。」",
  paragraphs: [
    [
      "仕事のご相談はもちろん、",
      "「こんなことをやりたいんだけど、相談できる？」",
      "「この人と会ったら面白そう」",
      "「一緒に何かできそう」",
      "くらいの段階でも歓迎です。",
    ],
    ["交流会や仕事、友人の紹介などでお会いした方も、気軽にご連絡ください。"],
  ],
  channels: [
    { key: "instagram", label: "Instagram" },
    { key: "note", label: "note" },
    { key: "email", label: "Email" },
  ],
};

// ---------------------------------------------------------
// フッター（Cona Design は主役にしない。フッター付近に小さく表記する）
// リンク先を付ける場合は src/config/site.ts の footer.href に入れます。
// ---------------------------------------------------------
export const footer = {
  credit: "Cona Design / Regional Projects & Experience Design",
} as const;

// ---------------------------------------------------------
// 画面の操作・記録写真まわりの短い表示文字列（原稿ではない）
// Art Direction（docs/art-direction.md §3.3 / §3.6 / §8）が追加を認めたものだけです。
// 原稿の語だけで作ったキャプション・スキップリンク等で、verify:content が
// 「この一覧と完全一致していること」を確認します（新しい文言を足すとエラーになります）。
// brief-v2 で旧 REGIONAL セクション用の projectLabel / captions.regional は廃止しました。
// ---------------------------------------------------------
export const ui = {
  /** スキップリンク（キーボード操作の人が本文へ飛ぶ。通常は見えない） */
  skipLink: "本文へ移動",
  /** ナビゲーションのスクリーンリーダー向けの名前 */
  navLabel: "サイト内",
  /** 写真のキャプション（GUILD Farm の展示会写真） */
  captions: {
    guildFarmEvent: "GUILD Farm — Event",
  },
  /** フッターの「© 年 名前」の © 記号（年はビルド時、名前は hero.name から作る） */
  copyright: "©",
  /** フッターの「ページ先頭へ」リンク */
  backToTop: "Back to top",
  /** 404 ページ（存在しない URL を開いたとき） */
  notFound: {
    code: "404",
    message: "お探しのページは見つかりませんでした。",
    backToHome: "トップへ戻る",
  },
} as const;

/** 表示順（brief-v2 の構成順） */
export const sectionOrder: readonly SectionId[] = [
  "hero",
  "about",
  "what-i-do",
  "project",
  "how-i-work",
  "interests",
  "outside",
  "contact",
];

/** id から引けるまとめ。Hero.tsx などはここか、上の個別の export を使う */
export const sections = {
  hero,
  about,
  "what-i-do": whatIDo,
  project,
  "how-i-work": howIWork,
  interests,
  outside,
  contact,
} as const;
