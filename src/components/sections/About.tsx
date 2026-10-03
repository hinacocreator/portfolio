import { Fragment } from "react";
import { about } from "@/content/sections";
import { joinLines } from "@/lib/copy";
import { KeepText } from "@/lib/keep";
import { getPhoto } from "@/lib/photos";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionHeading";

/** 2.webp の sizes（AD v2 §7.5。cols 9–12 = 357px） */
const SIZES =
  "(min-width: 1280px) 357px, (min-width: 1024px) calc(29.1vw - 13px), (min-width: 768px) calc(32.7vw - 10px), calc(80vw - 32px)";

/**
 * 2. ABOUT（BACKGROUND を下部に内包）— ゴシックのリード → ゴシックの本文 ＋ 右に縦写真。
 * 段落は brief-v2 §A の空行どおり（1段落＝1つの <p>。つながない）:
 *   [0]〜[2] = リード（3段落）
 *   [3]〜[10] = 本文（8段落。「仕事は、」〜「ことも多くあります。」も本文と同じ組みで流す。
 *              引用風の大きな明朝にはしない＝2026-10-03 本人指示。複数行の段落は原稿の改行を <br> で保持）
 * 下部の BACKGROUND は独立セクションではない（id なし）。罫線は rule 色・文字は小さく・ink-2（AD v2 §4.2）。
 */
export function About() {
  const intro = about.paragraphs.slice(0, 3);
  const body = about.paragraphs.slice(3);
  const photo = getPhoto("citrus-closeup");

  return (
    <section id="about" className="sec about">
      <div className="container grid">
        <SectionLabel>{about.label}</SectionLabel>

        <Reveal className="about__lead">
          {intro.map((lines, i) => (
            <p key={i}>
              <KeepText>{joinLines(lines)}</KeepText>
            </p>
          ))}
        </Reveal>

        {photo ? (
          <Photo photo={photo} sizes={SIZES} ar="4 / 5" op="50% 100%" max="429px" className="about__photo" />
        ) : null}

        <Reveal className="about__body prose" delay={90}>
          {body.map((lines, i) => (
            <p key={i}>
              {lines.map((line, j) => (
                <Fragment key={line}>
                  {j > 0 ? <br /> : null}
                  <KeepText>{line}</KeepText>
                </Fragment>
              ))}
            </p>
          ))}
        </Reveal>

        <Reveal className="about__bg">
          <h3 className="about__bg-label label" lang="en">
            {about.background.label}
          </h3>
          <div className="about__bg-text">
            {about.background.paragraphs.map((lines, i) => (
              <p key={i}>
                <KeepText>{joinLines(lines)}</KeepText>
              </p>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
