import { Fragment } from "react";
import { outside } from "@/content/sections";
import { joinLines } from "@/lib/copy";
import { getPhoto } from "@/lib/photos";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionHeading";

/** sizes（AD v2 §7.5。cover ではみ出す分を含む） */
const SIZES = {
  cafeTable:
    "(min-width: 1280px) 662px, (min-width: 1024px) calc(52.4vw - 5px), (min-width: 768px) calc(78.6vw + 5px), calc(129vw - 52px)",
  setoOrchard:
    "(min-width: 1280px) 389px, (min-width: 1024px) calc(31.7vw - 14px), (min-width: 768px) calc(47.5vw - 7px), calc(54.5vw - 31px)",
} as const;

/**
 * 7. OUTSIDE OF WORK（AD v2 §4.7）— 写真が先に来る唯一のセクション（横大＋縦小の段違い）＋短文。
 * 写真は visual 幅の両端（cols 1–7 と 9–12）まで、テキストは content の左端（cols 2–7）から。
 * ラベル（Sea / Agriculture / ...）が写真のキャプション代わり。キャプションは付けない。
 */
export function Outside() {
  const table = getPhoto("cafe-table");
  const orchard = getPhoto("seto-orchard");

  return (
    <section id="outside" className="sec outside">
      <div className="container grid">
        <SectionLabel>{outside.label}</SectionLabel>

        {table ? (
          <Photo
            photo={table}
            sizes={SIZES.cafeTable}
            ar="4 / 3"
            arMd="5 / 3"
            op="45% 50%"
            opMd="50% 50%"
            max="652px"
            className="outside__main"
          />
        ) : null}

        {orchard ? (
          <Photo
            photo={orchard}
            sizes={SIZES.setoOrchard}
            ar="4 / 5"
            op="100% 50%"
            max="400px"
            className="outside__sub"
            delay={120}
          />
        ) : null}

        <Reveal as="ul" className="outside__items run" role="list" lang="en" delay={90}>
          {outside.items.map((item, i) => (
            <Fragment key={item}>
              {i > 0 ? " " : null}
              <li>{item}</li>
            </Fragment>
          ))}
        </Reveal>

        <Reveal className="outside__text prose" delay={180}>
          <p>{joinLines(outside.paragraphs.flat())}</p>
        </Reveal>
      </div>
    </section>
  );
}
