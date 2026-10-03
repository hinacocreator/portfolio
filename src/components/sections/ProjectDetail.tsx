import { Fragment } from "react";
import Link from "next/link";
import { ui } from "@/content/sections";
import type { ProjectDetail as ProjectDetailData } from "@/content/projects";
import type { PhotoId } from "@/config/photos";
import { getPhoto } from "@/lib/photos";
import { Arrow } from "@/components/ui/Arrow";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionHeading";
import { TimesText } from "@/components/ui/TimesText";
import { KeepText } from "@/lib/keep";

/** sizes（AD v2 §7.5） */
const SIZES = {
  main: "(min-width: 1280px) 548px, (min-width: 1024px) calc(43.6vw - 8px), (min-width: 768px) calc(65.4vw + 1px), calc(100vw - 40px)",
  sub: "(min-width: 1280px) 453px, (min-width: 1024px) calc(36.3vw - 11px), (min-width: 768px) calc(54.5vw - 3px), calc(100vw - 40px)",
} as const;

/**
 * プロジェクト詳細ページの本体（AD v2 §6）。
 * PROJECT OVERVIEW → WEB / CREATIVE → EVENT（sheet 帯・展示会写真を大きく）→ 末尾の導線。
 * （WHAT I DO は 2026-10-03 本人指示で削除）
 * 文章はすべて src/content/projects.ts。数値・個人名・料金は原稿に無く、ここでも足さない。
 * テキストは content 幅、写真は EVENT の2枚だけ visual 幅。冒頭にキービジュアルは置かない。
 * スクリーンショット枠は既定で出さない（本人確認後に追加）。
 */
export function ProjectDetail({ project }: { project: ProjectDetailData }) {
  const { overview } = project;
  const eventPhotos = project.photos.event.map((id) => getPhoto(id as PhotoId)).filter((p) => p !== null);
  const [booth, talk] = eventPhotos;
  const onlyTalk = !booth && Boolean(talk);

  return (
    <main id="main">
      {/* #top はフッターの「Back to top」の行き先 */}
      <section id="top" className="sec detail-top">
        <div className="container grid">
          <p className="detail__label label" lang="en">
            {overview.label}
          </p>
          <h1 className="detail__title" lang="en">
            {overview.name}
          </h1>
          <div className="detail__lede">
            <p className="detail__subtitle">
              <TimesText>{overview.subtitle}</TimesText>
            </p>
            <p className="detail__desc">
              <KeepText>{overview.description}</KeepText>
            </p>
          </div>
          <dl className="detail__meta">
            <div className="detail__meta-row">
              <dt>{overview.roleLabel}</dt>
              <dd>
                <KeepText>{overview.role}</KeepText>
              </dd>
            </div>
            <div className="detail__meta-row">
              <dt>{overview.periodLabel}</dt>
              <dd>{overview.period}</dd>
            </div>
          </dl>
          <ul className="detail__tags run" role="list" lang="en">
            {overview.tags.map((tag, i) => (
              <Fragment key={tag}>
                {i > 0 ? " " : null}
                <li>{tag}</li>
              </Fragment>
            ))}
          </ul>
        </div>
      </section>

      <section className="sec detail__sec--web">
        <div className="container grid">
          <SectionLabel>{project.webCreative.label}</SectionLabel>
          {project.webCreative.items.map((item) => (
            <Reveal key={item.text} className="detail__text">
              <p>
                <KeepText>{item.text}</KeepText>
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className={`sec band-sheet detail__event${booth || talk ? "" : " band-sheet--text-only"}`}>
        <div className="container grid">
          <SectionLabel>{project.event.label}</SectionLabel>
          {project.event.items.map((item) => (
            <Reveal key={item.text} className="detail__text">
              <p>
                <KeepText>{item.text}</KeepText>
              </p>
            </Reveal>
          ))}
          {booth ? (
            <Photo
              photo={booth}
              sizes={SIZES.main}
              ar="4 / 5"
              op="50% 50%"
              max="568px"
              className="detail__event-main"
            />
          ) : null}
          {talk ? (
            <Photo
              photo={talk}
              sizes={SIZES.sub}
              ar="4 / 5"
              op="50% 50%"
              max="455px"
              caption={ui.captions.guildFarmEvent}
              className={`detail__event-sub${onlyTalk ? " detail__event-sub--solo" : ""}`}
              delay={120}
            />
          ) : null}
        </div>
      </section>

      <div className="container--content detail__end">
        <Link className="link detail__end-back" href={project.backLink.href}>
          <Arrow direction="left" />
          {project.backLink.label}
        </Link>
        <Link className="link detail__end-contact" href={project.contactLink.href} lang="en">
          {project.contactLink.label}
        </Link>
      </div>
    </main>
  );
}
