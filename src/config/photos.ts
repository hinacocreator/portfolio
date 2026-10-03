/**
 * =========================================================
 * 写真の台帳（どの写真を、どう載せるか）
 * =========================================================
 * 【ここを書き換えると何が変わるか】
 *   ・visible を false にする → その写真がサイトから消えます（原本は残る）
 *   ・alt を直す             → 画像が見えない人・検索エンジン向けの説明文が変わります
 *   ・consent を直す         → 掲載許諾の記録（"ok" 許諾済み / "pending" 確認中 / "ng" 不可）
 *
 * 【写真を差し替える・追加するとき】
 *   1. 原本を _source-photos/ に置く（同じ名前で上書きすれば差し替え）
 *   2. 下のリストに { id, file, ... } を足す（id は半角英数字とハイフンだけ）
 *   3. ターミナルで `npm run images` を実行 → public/images/ と photo-meta.json が更新される
 *   4. 更新されたファイルを GitHub に反映する
 *   ※ GitHub 上の自動ビルドには原本が無いので、画像の生成は必ず手元で行います。
 *
 * 【このファイルの注意】
 *   ・scripts/images.mjs が、このファイルをそのまま読み込んで画像を作ります
 *     （写真の情報を2か所に書かない仕組み）。そのため、このファイルには
 *     「import」を書かず、型・定数だけにしてください。
 *   ・写真の実寸（width / height）は自動生成の photo-meta.json にあります。手で書かない。
 */

/** 掲載許諾の状態。"ng" の写真は、visible: true にしていても画像を出力しません */
export type PhotoConsent = "ok" | "pending" | "ng";

/**
 * 原本の写真から実際に切り出す範囲（ピクセル。原本の左上が 0,0）。
 * 指定すると、サイズ変換の前に切り出します（写真の一部を物理的に除外したいとき用）。
 * 表示上の見せ方だけを変えたいときは、こちらではなく objectPosition を使います。
 */
export type PhotoCrop = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type PhotoEntry = {
  /** 出力ファイル名の元になる ID（public/images/{id}-{幅}.avif など）。半角英数字とハイフン */
  id: string;
  /** _source-photos/ にある原本のファイル名 */
  file: string;
  /** 代替テキスト（日本語）。本人以外の人物は名前を書かず「同行者」などの表現にする */
  alt: string;
  /** false にするとサイトに出さない（画像も作らない・既存の出力は削除する） */
  visible: boolean;
  /** 掲載許諾の記録 */
  consent: PhotoConsent;
  /** 制作用メモ（サイトには表示されないが、公開リポジトリには載る。人物の描写や許諾の経緯は書かない） */
  note?: string;
  /** クレジット表記が必要な場合のみ */
  credit?: string;
  /** 実ピクセルの切り出し（任意）。上の PhotoCrop を参照 */
  crop?: PhotoCrop;
  /** CSS の object-position（任意）。表示枠で切れるときの寄せ方。例: "40% 50%" */
  objectPosition?: string;
};

export const photoLedger = [
  {
    id: "citrus-closeup",
    file: "2.webp",
    alt: "柑橘の木に顔を寄せ、枝葉の様子を確かめるHinako Kumamoto",
    visible: true,
    consent: "ok",
    objectPosition: "50% 100%",
    note: "ABOUT の縦写真（4:5）。上の畑を約70px落とす見せ方。",
  },
  {
    id: "seto-orchard",
    file: "3.webp",
    alt: "海と港を見下ろす斜面の柑橘園で、木をのぞき込むHinako Kumamoto",
    visible: true,
    consent: "ok",
    objectPosition: "100% 50%",
    note: "OUTSIDE OF WORK の縦写真（4:5）。左の草地を約60px落とし、人物を中央寄りに。",
  },
  {
    id: "field-crouch",
    file: "4.webp",
    alt: "畑にしゃがみ、同行者と一緒に土に向き合うHinako Kumamoto",
    visible: true,
    consent: "ok",
    objectPosition: "50% 73%",
    note: "PROJECT の主写真。crop は使わず objectPosition で見せる。",
  },
  {
    id: "expo-booth",
    file: "5.jpg",
    alt: "展示会のブースで、GUILD Farmの関係者と並んで手を振るHinako Kumamoto。机には柑橘のネクターやチラシが並ぶ",
    visible: true,
    consent: "ok",
    objectPosition: "50% 50%",
    crop: { left: 0, top: 0, width: 768, height: 960 },
    note: "PROJECT / 詳細ページ EVENT。下端を切り出して 4:5 にしている。",
  },
  {
    id: "expo-talk",
    file: "6.jpg",
    alt: "展示会のブースで、関係者の男性とともに来場者に応対するHinako Kumamoto。手前に柑橘のネクター",
    visible: true,
    consent: "ok",
    objectPosition: "50% 50%",
    crop: { left: 410, top: 0, width: 614, height: 768 },
    note: "詳細ページ EVENT。右側を切り出して 4:5 にしている。",
  },
  {
    id: "cafe-table",
    file: "7.jpg",
    alt: "カフェのテーブルで、サラダやピザを前に愛犬を抱くHinako Kumamoto",
    visible: true,
    consent: "ok",
    objectPosition: "50% 50%",
    crop: { left: 40, top: 0, width: 1142, height: 665 },
    note: "OUTSIDE OF WORK の主写真。左端を少し切り出している。モバイルは 4:3・45% 50% で見せる（Outside.tsx）。",
  },
  {
    id: "cafe-sofa",
    file: "8.jpg",
    alt: "自然光の入るカフェのソファで、白い愛犬と並んで座り微笑むHinako Kumamoto",
    visible: true,
    consent: "ok",
    objectPosition: "50% 50%",
    crop: { left: 72, top: 0, width: 1110, height: 665 },
    note: "HERO 写真。左端を少し切り出している。OGP 画像の元でもある。",
  },
] as const satisfies readonly PhotoEntry[];

/** 台帳にある写真 ID の一覧（型）。存在しない ID を指定するとビルド時に型エラーで気づけます */
export type PhotoId = (typeof photoLedger)[number]["id"];

/** 台帳（一般的な型で扱いたいとき用） */
export const photos: readonly PhotoEntry[] = photoLedger;
