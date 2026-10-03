import { Fragment } from "react";
import { preload } from "react-dom";
import { hero } from "@/content/sections";
import { splitAtMiddleComma, unbracket } from "@/lib/copy";
import { getPhoto } from "@/lib/photos";
import { Photo } from "@/components/ui/Photo";

/** 8.jpg の sizes（AD v2 §7.5。cols 7–12 = 548px。モバイルは 1:1 で左右がはみ出す分を含む） */
const HERO_SIZES =
  "(min-width: 1280px) 548px, (min-width: 1024px) calc(43.6vw - 8px), (min-width: 768px) calc(65.4vw + 1px), calc(167vw - 67px)";

/** 1. HERO — マストヘッド。Reveal は付けない（最初の画面は即表示）。幅は visual（AD v2 §4.1） */
export function Hero() {
  const photo = getPhoto("cafe-sofa");
  const nameParts = hero.name.split(" ");
  const tagline = splitAtMiddleComma(unbracket(hero.tagline));

  // LCP 対策: HERO 写真の AVIF を先読み（<head> に <link rel="preload" as="image"> が1本出る）
  if (photo) {
    preload(photo.src, {
      as: "image",
      imageSrcSet: photo.srcSet.avif,
      imageSizes: HERO_SIZES,
      type: "image/avif",
      fetchPriority: "high",
    });
  }

  return (
    <section id="top" className="sec hero">
      <div className="container grid">
        <h1 id="site-title" className="hero__name" lang="en">
          {nameParts.map((part, i) => (
            <Fragment key={part}>
              {i > 0 ? " " : null}
              <span>{part}</span>
            </Fragment>
          ))}
        </h1>
        <p className="hero__title" lang="en">
          {hero.title}
        </p>

        {photo ? (
          <Photo
            photo={photo}
            sizes={HERO_SIZES}
            ar="1 / 1"
            arMd="5 / 3"
            op="50% 50%"
            max="652px"
            className="hero__photo"
            priority
          />
        ) : null}

        <p className="hero__tagline">
          {tagline.map((part) => (
            <span key={part}>{part}</span>
          ))}
        </p>
        <div className="hero__lead">
          {hero.paragraphs.flat().map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
