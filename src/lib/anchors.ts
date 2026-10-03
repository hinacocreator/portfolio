import type { SectionId } from "@/content/sections";

/**
 * ページ内リンク（#○○）の名前。sections.ts の SectionId（内部名）から、
 * Art Direction §3.1 / v2 §4.0 で決めたアンカー名に変換します。
 *   WORK      → #work       （事業内容 / WHAT I DO の <section>）
 *   INTERESTS → #interests
 *   HERO      → #top
 */
export const anchorId: Readonly<Record<SectionId, string>> = {
  hero: "top",
  about: "about",
  "what-i-do": "work",
  project: "project",
  "how-i-work": "how-i-work",
  interests: "interests",
  outside: "outside",
  contact: "contact",
};
