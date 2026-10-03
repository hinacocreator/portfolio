import { Fragment } from "react";
import { whatIDo } from "@/content/sections";
import { KeepText } from "@/lib/keep";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeadingJa } from "@/components/ui/SectionHeading";

/** 欧文だけの見出しか（lang="en" を付けるかどうか。「EC / Amazon運用」は和欧混植なので付けない） */
const isLatinOnly = (text: string) => /^[\x20-\x7E]+$/.test(text);

/**
 * 3. 事業内容 / WHAT I DO（AD v2 §4.3 → 改訂 v1.1）。
 * 4領域を同じ構造の番号付き索引行で並べる（どれか1つだけを大きくしない）。
 *   行 = 番号（01〜04、配列の index から生成）＋見出し | リード → 小項目（スラッシュ列 or Amazon の3項目）→ 注記
 * 番号は HOW I WORK（.how__no）と同じ扱い: Newsreader 14px・字間 0.1em・控えめな色・読み上げない（順序は <ol> が伝える）。
 * カード・枠・背景色・アイコンは使わない。罫線と文字の大きさだけで区切る。
 * lead は1要素＝1段落（brief-v2 の空行どおり。Regional は2段落）。つながない。
 */
export function WhatIDo() {
  return (
    <section id="work" className="sec work">
      <div className="container grid">
        <SectionHeadingJa label={whatIDo.label}>{whatIDo.heading}</SectionHeadingJa>

        <ol className="work__index" role="list">
          {whatIDo.areas.map((area, index) => (
            <Reveal key={area.id} as="li" className="work__row">
              <h3 className="work__title">
                <span className="work__no" lang="en" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="work__name" lang={isLatinOnly(area.name) ? "en" : undefined}>
                  {area.name}
                </span>
              </h3>
              <div className="work__body">
                {area.lead.map((line) => (
                  <p key={line} className="work__lead">
                    <KeepText>{line}</KeepText>
                  </p>
                ))}
                {"items" in area && area.items ? (
                  <ul className="work__items run" role="list">
                    {area.items.map((item, i) => (
                      <Fragment key={item}>
                        {i > 0 ? " " : null}
                        <li>{item}</li>
                      </Fragment>
                    ))}
                  </ul>
                ) : null}
                {"points" in area ? (
                  <ul className="work__points" role="list">
                    {area.points.map((point) => (
                      <li key={point.title} className="work__point">
                        <h4 className="work__point-name">{point.title}</h4>
                        <p className="work__point-text">
                          <KeepText>{point.text}</KeepText>
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {"note" in area ? <p className="work__note">{area.note}</p> : null}
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
