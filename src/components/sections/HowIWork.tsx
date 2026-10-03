import { howIWork } from "@/content/sections";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionHeading";

/**
 * 5. HOW I WORK（AD v2 §4.5）— 黒帯。4行の目次組み（階段配置はやめた）。
 * 原稿の「—」と「：」は画面に出さない（番号・英字・和文動詞・説明をレイアウトで区切る）。
 * F-10: 英字と和文の間の {" "}、<ol role="list">、.how__ja の margin-left を残す。
 * 番号（.how__no）は読み上げない（aria-hidden）。順序は <ol> が伝える（A11Y-6）。
 */
export function HowIWork() {
  return (
    <section id="how-i-work" className="sec band-ink how">
      <div className="container grid">
        <SectionLabel className="label--on-ink">{howIWork.label}</SectionLabel>

        <ol className="how__list" role="list">
          {howIWork.steps.map((step) => (
            <Reveal key={step.no} as="li" variant="item" className="how__row">
              <h3 className="how__title">
                <span className="how__no" lang="en" aria-hidden="true">
                  {step.no}
                </span>
                <span className="how__en" lang="en">
                  {step.en}
                </span>{" "}
                <span className="how__ja">{step.ja}</span>
              </h3>
              <p className="how__text">{step.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
