/**
 * src/config/site.ts のリンク設定を、空文字を含む一般的な型で扱うための窓口。
 * 空文字（未設定）のリンクは、呼び出し側で描画しない。
 */
import type { ContactChannelKey } from "@/content/sections";
import { siteConfig } from "@/config/site";

const channelValues: Readonly<Record<ContactChannelKey, string>> = siteConfig.links;

/** 設定値の前後の空白を除いた文字列。未設定なら空文字 */
const clean = (value: string | undefined): string => (value ?? "").trim();

/** 連絡手段の設定値（Instagram / note は URL、Email はアドレス）。未設定なら空文字 */
export function channelValue(key: ContactChannelKey): string {
  return clean(channelValues[key]);
}

/** 連絡手段のリンク先。Email は mailto: を付ける。未設定なら null（描画しない） */
export function channelHref(key: ContactChannelKey): string | null {
  const value = channelValue(key);
  if (!value) return null;
  return key === "email" ? `mailto:${value}` : value;
}

/** GUILD Farm のリンク先。未設定なら null */
export function guildFarmHref(): string | null {
  const projects: Readonly<{ guildFarm: string }> = siteConfig.projects;
  return clean(projects.guildFarm) || null;
}

/** フッターの Cona Design 表記のリンク先。未設定なら null */
export function footerHref(): string | null {
  const footer: Readonly<{ href: string }> = siteConfig.footer;
  return clean(footer.href) || null;
}

/** JSON-LD の sameAs に使う、設定済みの SNS リンク（空は除外） */
export function sameAsLinks(): string[] {
  return (["instagram", "note"] as const).map(channelValue).filter(Boolean);
}
