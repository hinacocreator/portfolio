import { interests } from "@/content/sections";
import { joinLines, splitAtMiddleComma } from "@/lib/copy";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionHeading";

/**
 * 6. INTERESTS（AD v2 §4.6）— 文章一本。1段落目を明朝のリード、2・3段落目をゴシックの本文に。
 * 段落は brief-v2 §E の空行どおり（本文は2つの <p>。つながない）。
 * 原稿に和文見出しは無いので、ラベル「INTERESTS」だけ。リードは読点（、）の後で折る。
 */
export function Interests() {
  const [[lead], ...body] = interests.paragraphs;
  const leadParts = splitAtMiddleComma(lead);

  return (
    <section id="interests" className="sec interests">
      <div className="container grid">
        <SectionLabel>{interests.label}</SectionLabel>

        <Reveal className="interests__lead">
          <p>
            {leadParts.map((part) => (
              <span key={part}>{part}</span>
            ))}
          </p>
        </Reveal>

        <Reveal className="interests__body" delay={90}>
          {body.map((lines, i) => (
            <p key={i}>{joinLines(lines)}</p>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
