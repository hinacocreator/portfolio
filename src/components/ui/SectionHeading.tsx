import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

/** 見出し（罫線＋小さな英字ラベル）。罫線は h2 自身に引く（.sec__head）。AD v2 §3.2 */
export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={["label", "sec__head", className].filter(Boolean).join(" ")} lang="en">
      {children}
    </h2>
  );
}

/**
 * 和文の見出しを持つセクション（事業内容 / CONTACT）の h2。
 * h2 の中に英字ラベルと和文見出しを入れる（それぞれ display:block）。
 */
export function SectionHeadingJa({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2 className={["sec__head", "sec-heading", className].filter(Boolean).join(" ")}>
      <span className="label" lang="en">
        {label}
      </span>
      <Reveal as="span" className="heading-ja">
        {children}
      </Reveal>
    </h2>
  );
}
