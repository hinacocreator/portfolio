import { contact } from "@/content/sections";
import { unbracket } from "@/lib/copy";
import { channelHref, channelValue } from "@/lib/links";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeadingJa } from "@/components/ui/SectionHeading";

/**
 * 8. CONTACT — 明朝の見出し＋手紙の本文＋テキストリンク。中央寄せ・ボタンなし。幅は AD v2 §4.8（本文は cols 4–10）。
 * リンク先は src/config/site.ts。空文字のものは li ごと出さない。3つとも空なら ul もアドレスも出さない。
 */
export function Contact() {
  const [firstParagraph, ...rest] = contact.paragraphs;
  const channels = contact.channels
    .map((channel) => ({ ...channel, href: channelHref(channel.key) }))
    .filter((channel): channel is typeof channel & { href: string } => channel.href !== null);
  const email = channelValue("email");

  return (
    <section id="contact" className="sec contact">
      <div className="container grid">
        <SectionHeadingJa label={contact.label}>{unbracket(contact.lead)}</SectionHeadingJa>

        <Reveal className="contact__body" delay={90}>
          <p className="contact__lines">
            {firstParagraph.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
          {rest.map((lines) => (
            <p key={lines[0]}>{lines.join("")}</p>
          ))}
        </Reveal>

        {channels.length > 0 ? (
          <>
            <Reveal as="ul" className="contact__links" role="list" lang="en" delay={180}>
              {channels.map((channel) => (
                <li key={channel.key}>
                  <a className="link" href={channel.href}>
                    {channel.label}
                  </a>
                </li>
              ))}
            </Reveal>
            {email ? (
              <Reveal as="p" className="contact__email" delay={180}>
                {email}
              </Reveal>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  );
}
