import { Fragment } from "react";
import { whatIDo } from "@/content/sections";
import { joinLines } from "@/lib/copy";
import { KeepText } from "@/lib/keep";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeadingJa } from "@/components/ui/SectionHeading";

/**
 * 3. 事業内容 / WHAT I DO（AD v2 §4.3）。
 * 先頭の Amazon を最上位の大見出し（明朝 44px）＋方針の1文＋3項目の仕様行＋注記で見せ、
 * 他3領域は罫線で区切った索引行（見出し 28px・1文のリード・スラッシュ列）にとどめる。
 * カード・枠・背景色・番号・アイコンは使わない。説明文の左端（cols 6）は全行で揃える。
 * 他3領域の lead は1要素＝1段落（brief-v2 の空行どおり。Regional は2段落）。つながない。
 */
export function WhatIDo() {
  const [amazon, ...others] = whatIDo.areas;

  return (
    <section id="work" className="sec work">
      <div className="container grid">
        <SectionHeadingJa label={whatIDo.label}>{whatIDo.heading}</SectionHeadingJa>

        <Reveal className="work__amazon">
          <h3 className="work__amazon-name">{amazon.name}</h3>
          <p className="work__amazon-lead">{joinLines(amazon.lead)}</p>
          <ul className="work__points spec" role="list">
            {amazon.points.map((point, i) => (
              <li key={point.title} className="spec__row">
                <h4 className="spec__name">{point.title}</h4>
                <p className="spec__text">{point.text}</p>
                {i === amazon.points.length - 1 ? <p className="spec__note">{amazon.note}</p> : null}
              </li>
            ))}
          </ul>
        </Reveal>

        <div className="work__index">
          {others.map((area) => (
            <Reveal key={area.id} className="work__row">
              <h3 className="work__name" lang="en">
                {area.name}
              </h3>
              <div className="work__body">
                {area.lead.map((line) => (
                  <p key={line} className="work__lead">
                    <KeepText>{line}</KeepText>
                  </p>
                ))}
                {area.items ? (
                  <ul className="work__items run" role="list">
                    {area.items.map((item, i) => (
                      <Fragment key={item}>
                        {i > 0 ? " " : null}
                        <li>{item}</li>
                      </Fragment>
                    ))}
                  </ul>
                ) : null}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
