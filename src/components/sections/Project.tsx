import { Fragment } from "react";
import Link from "next/link";
import { project, ui, whatIDo } from "@/content/sections";
import { joinLines } from "@/lib/copy";
import { KeepText } from "@/lib/keep";
import { getPhoto } from "@/lib/photos";
import { Arrow } from "@/components/ui/Arrow";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { TimesText } from "@/components/ui/TimesText";

/** sizes（AD v2 §7.5） */
const SIZES = {
  fieldCrouch:
    "(min-width: 1280px) 548px, (min-width: 1024px) calc(43.6vw - 8px), (min-width: 768px) calc(54.5vw - 3px), calc(100vw - 40px)",
  expoBooth:
    "(min-width: 1280px) 357px, (min-width: 1024px) calc(29.1vw - 13px), (min-width: 768px) calc(32.7vw - 10px), calc(64vw - 26px)",
  /** expo-booth が単独で cols 1–6 に来るとき（field-crouch が非表示） */
  expoBoothSolo:
    "(min-width: 1280px) 548px, (min-width: 1024px) calc(43.6vw - 8px), (min-width: 768px) calc(54.5vw - 3px), calc(64vw - 26px)",
} as const;

/**
 * 4. PROJECT — GUILD Farm（AD v2 §4.4）。sheet 帯。
 * 写真2枚を visual 幅の両端まで使い、左上の大きい写真（field-crouch）と右下の小さい写真（expo-booth）を対角に置く。
 * キャプション: field-crouch は GUILD Farm の畑と確定していないので「Regional / Agriculture」（原稿の領域名）、
 * expo-booth は「GUILD Farm — Event」。「GUILD Farm」の文字はリンクにせず、詳細への導線は「詳細を見る →」の1本だけ。
 * 写真の ON/OFF（photos.ts の visible）に合わせて配置が切り替わる。
 * 本文は brief-v2 §C の空行どおり3段落（1段落＝1つの <p>。つながない）。
 */
export function Project() {
  const crouch = getPhoto("field-crouch");
  const booth = getPhoto("expo-booth");
  const regional = whatIDo.areas.find((area) => area.id === "regional");

  const photoClass = crouch && booth ? "" : crouch ? "project--only-main" : booth ? "project--only-sub" : "project--no-photos";
  const bandClass = crouch || booth ? "" : " band-sheet--text-only";

  return (
    <section id="project" className={`sec band-sheet${bandClass} project ${photoClass}`.trim()}>
      <div className="container grid">
        <Reveal className="project__intro">
          <h2 className="project__head">
            <span className="label" lang="en">
              {project.label}
            </span>{" "}
            <span className="project__name" lang="en">
              {project.name}
            </span>
          </h2>
          <p className="project__subtitle">
            <TimesText>{project.subtitle}</TimesText>
          </p>
          <ul className="project__tags run" role="list" lang="en">
            {project.tags.map((tag, i) => (
              <Fragment key={tag}>
                {i > 0 ? " " : null}
                <li>{tag}</li>
              </Fragment>
            ))}
          </ul>
        </Reveal>

        {crouch ? (
          <Photo
            photo={crouch}
            sizes={SIZES.fieldCrouch}
            ar="4 / 5"
            op="50% 73%"
            max="552px"
            caption={regional?.name}
            className="project__main"
          />
        ) : null}

        {booth ? (
          <Photo
            photo={booth}
            sizes={crouch ? SIZES.expoBooth : SIZES.expoBoothSolo}
            ar="4 / 5"
            op="50% 50%"
            max={crouch ? "451px" : "568px"}
            caption={ui.captions.guildFarmEvent}
            className="project__sub"
            delay={120}
          />
        ) : null}

        <Reveal className="project__text prose">
          {project.paragraphs.map((lines, i) => (
            <p key={i}>
              <KeepText>{joinLines(lines)}</KeepText>
            </p>
          ))}
          <p className="project__more">
            <Link className="link" href={project.detailLink.href}>
              {project.detailLink.label}
              <Arrow direction="right" />
            </Link>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
