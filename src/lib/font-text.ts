/**
 * 和文フォント（Zen Kaku Gothic New / Shippori Mincho）の「ページで使う文字だけ」の一覧と、
 * Google Fonts の CSS URL を、ビルド時に content / config から作ります。
 * （Art Direction §2.2: text= パラメータで必要な文字だけ配信 → 2書体で約65KB）
 *
 * ・文章を直すと、次のビルドで自動的に文字の一覧も更新されます。手書きしないでください。
 * ・2書体は別々の URL にします（1本にまとめると text= が両方に効いて明朝の文字数が倍以上になる）。
 */
import {
  contact,
  footer,
  hero,
  howIWork,
  interests,
  nav,
  project,
  sectionOrder,
  sections,
  ui,
  whatIDo,
} from "@/content/sections";
import { projects } from "@/content/projects";
import { siteConfig } from "@/config/site";

/** 文章ではない内部名のキー（画面に出ない。href・slug・写真の台帳 id を含む） */
const NON_COPY_KEYS = new Set(["id", "target", "key", "href", "slug", "photos"]);

/** 原稿に含まれる矢印（Arrow.tsx が文字として出す。データには入っていない。AD v2 §3.4） */
const ARROWS = "→←";

function collectStrings(value: unknown, key = ""): string[] {
  if (typeof value === "string") return NON_COPY_KEYS.has(key) ? [] : [value];
  if (Array.isArray(value)) return value.flatMap((v) => collectStrings(v));
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) => collectStrings(v, k));
  }
  return [];
}

/** 文字列の集合 → 重複を除いて並べ替えた文字の並び */
const uniqueChars = (texts: readonly string[]): string =>
  [...new Set(texts.join(""))].sort().join("");

/** ゴシック（本文）で出しうる全文字: 原稿・詳細ページ・ナビ・フッター・UI・矢印・メールアドレス・数字（年・番号） */
const gothicChars = uniqueChars([
  ...sectionOrder.flatMap((id) => collectStrings(sections[id])),
  ...Object.values(projects).flatMap((p) => collectStrings(p)),
  ...collectStrings(nav),
  ARROWS,
  footer.credit,
  ...collectStrings(ui),
  siteConfig.links.email,
  "0123456789",
]);

/**
 * 明朝で出すフィールドだけ（AD v2 §9.2「明朝で出す文字列」）。
 * 「×」は .times（Shippori）で出すので、subtitle の文字はここに入っている必要がある。
 */
const minchoChars = uniqueChars([
  hero.tagline, // HERO 核メッセージ
  whatIDo.heading, // 事業内容 見出し
  whatIDo.areas[0].name, // 事業内容 Amazon の大見出し
  ...whatIDo.areas[0].lead, // 事業内容 Amazon のリード
  project.subtitle, // PROJECT サブタイトル
  projects["guild-farm"].overview.subtitle, // 詳細ページ サブタイトル
  ...howIWork.steps.map((s) => s.ja), // HOW I WORK の和文動詞
  interests.paragraphs[0][0], // INTERESTS リード（1文目）
  contact.lead, // CONTACT 見出し
]);

const css2 = (family: string, weight: number, chars: string) =>
  `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&display=swap&text=${encodeURIComponent(chars)}`;

export const gothicFontHref = css2("Zen+Kaku+Gothic+New", 400, gothicChars);
export const minchoFontHref = css2("Shippori+Mincho", 500, minchoChars);
