/**
 * 原稿の一致検証（npm run verify:content）
 * ------------------------------------------------------------
 * docs/brief-v2.md（原稿 v2）と、src/content/sections.ts・src/content/projects.ts（実装）を
 * 突き合わせ、文言が「1字も変わっていない・足されていない」ことを確認する。
 *
 * 方法
 *   1. brief-v2 を「## §HERO / §A〜§H / §P」の単位に分け、各セクションの本文行を取り出す。
 *      ※ 制作側への注記（見出しの括弧書き、「方針:」「見出し:」、（スクリーンショット枠…）、
 *         （展示会写真…）、「（概要）」「（役割タグ）」などの印、「→（/projects/… へ）」）は、
 *         この中の規則で明示的に除く。「（担当）」「（期間）」は項目名として本文に含める。
 *   2. sections.ts / projects.ts の全文字列（id / target / key / href / photos / slug を除く）を、
 *      セクションごとに記述順で連結する。
 *   3. 空白と区切り記号（ / ： : —）だけを取り除いて正規化し、セクションごとに
 *      「brief の本文行の連結」と「実装の連結」が完全に同じであることを確認する。
 *      （区切り記号は、items / tags の配列に分解した際に失われるため比較対象から外す。
 *        「」・、。・ × ・ & などの文字は比較対象に含めるので、1字でも違えば検出される）
 *      過不足があれば、日本語の余計な文が足されている／抜けている、として NG になる。
 *   3b. 段落の区切り: brief-v2 の §A（ABOUT・BACKGROUND）・§B（Regional）・§C・§E は、本文を空行で区切って
 *      グループにし、sections.ts の paragraphs（段落 = 行の配列）と、グループ数・各グループの行まで完全一致を確認する。
 *      （クライアント原稿の空行が、画面の段落の切れ目になるため。空行の無い §F・§G は対象外）
 *   4. ナビ項目・フッター表記・セクション順は、それぞれ個別に厳密比較する。
 *   5. sections.ts の `ui`（スキップリンク・キャプション等、原稿ではない短い表示文字列）は、
 *      Art Direction が追加を認めた一覧（ALLOWED_UI_EXTRAS）と完全一致していること。
 *      新しい文言を足したいときは、Art Direction の承認を得てからこの一覧も更新する。
 *   6. src/components と src/app の .tsx に、日本語の文言が直書きされていないこと（コメントを除く）。
 *      文章はすべて sections.ts / projects.ts / site.ts から読む。
 *   7. src/config/site.ts の links（Instagram / note / Email）が3つとも空なら、警告を出す。
 *      警告だけで、ビルドも検証も止めない（プレビュー公開では空のままでよいため）。
 *
 * docs/ はローカル専用で、公開リポジトリには入れない（.gitignore で /docs/ を除外）。
 * brief-v2.md が無い環境（GitHub Actions など）では、手順 1〜4 の原稿照合を警告つきでスキップし、
 * 手順 5〜7 だけを実行する。原稿の照合は、brief-v2.md のある PC で行うこと。
 *
 * Node 22.18 以上（TypeScript の型除去で sections.ts / projects.ts を直接読み込む）。
 */
import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BRIEF_PATH = path.join(ROOT, "docs", "brief-v2.md");
const SECTIONS_PATH = path.join(ROOT, "src", "content", "sections.ts");
const PROJECTS_PATH = path.join(ROOT, "src", "content", "projects.ts");
const SITE_PATH = path.join(ROOT, "src", "config", "site.ts");

/** brief-v2 の「## §X」→ 実装側セクション ID。headerFromTitle は、見出し行の文字がサイトの見出しになるもの */
const SECTION_MAP = {
  HERO: { id: "hero", headerFromTitle: false },
  A: { id: "about", headerFromTitle: true },
  B: { id: "what-i-do", headerFromTitle: true },
  C: { id: "project", headerFromTitle: false }, // 本文に「PROJECT」「GUILD Farm」の行がある
  D: { id: "how-i-work", headerFromTitle: true },
  E: { id: "interests", headerFromTitle: false }, // 本文に「INTERESTS」の行がある
  F: { id: "outside", headerFromTitle: true },
  G: { id: "contact", headerFromTitle: true },
};

/** 期待するセクション順（brief-v2「構成」の8セクション） */
const EXPECTED_ORDER = ["hero", "about", "what-i-do", "project", "how-i-work", "interests", "outside", "contact"];

/** 本文ではない行（brief-v2 にそのまま存在する制作側の注記）。先頭一致で除外 */
const NOTE_LINE_PREFIXES = [
  "見出し:",
  "方針:",
  "（スクリーンショット枠",
  "（展示会写真",
  "（段落区切り", // §A 冒頭の注記「（段落区切り＝空行。クライアント原稿の空行どおり。…）」。本文ではない
  "4語＋1行説明",
  "### 末尾", // §P の「末尾」は、戻る導線の位置を示す制作側の見出し
];

/** 行頭の印（制作側の注記）。「概要」「役割タグ」は印だけ除く。「担当」「期間」は項目名として本文に含める */
const DROP_MARKERS = ["概要", "役割タグ"];
const KEEP_MARKERS = ["担当", "期間"];

/**
 * `ui`（原稿ではない表示文字列）として追加を認めたもの（docs/art-direction.md §3.3 / §3.6 / §8）。
 * sections.ts の ui と、キーも値も完全に一致していなければならない。
 */
const ALLOWED_UI_EXTRAS = {
  skipLink: "本文へ移動",
  navLabel: "サイト内",
  captions: {
    guildFarmEvent: "GUILD Farm — Event",
  },
  copyright: "©",
  backToTop: "Back to top",
  // 404 ページ（修正計画 F-17 で追加。not-found.tsx が読む）
  notFound: {
    code: "404",
    message: "お探しのページは見つかりませんでした。",
    backToHome: "トップへ戻る",
  },
};

/** コンポーネントの日本語直書きを調べるフォルダ（ROOT からの相対） */
const COMPONENT_DIRS = ["src/components", "src/app"];

/** sections.ts の文字列のうち、文章ではない内部名のキー（比較から除く） */
const NON_COPY_KEYS = new Set(["id", "target", "key", "href", "photos", "slug"]);

/** 比較時に取り除く空白・区切り記号 */
const normalize = (s) => s.replace(/[\s　/／:：—]/g, "");

let failures = 0;
function check(ok, message) {
  if (ok) {
    console.log(`  OK   ${message}`);
  } else {
    failures += 1;
    console.error(`  NG   ${message}`);
  }
}

/** オブジェクトの文章（文字列）を、記述順に取り出す */
function collectStrings(value, key = "") {
  if (typeof value === "string") return NON_COPY_KEYS.has(key) ? [] : [value];
  if (Array.isArray(value)) return value.flatMap((v) => collectStrings(v, key));
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) => collectStrings(v, k));
  }
  return [];
}

function firstDiff(a, b) {
  const n = Math.min(a.length, b.length);
  let i = 0;
  while (i < n && a[i] === b[i]) i += 1;
  return i;
}

/** コメントを取り除く（URL の // は残す）。厳密な構文解析ではなく、検査用の簡易処理 */
function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:"'`\\])\/\/.*$/gm, "$1");
}

async function listSourceFiles(dir) {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...(await listSourceFiles(full)));
    else if (/\.(tsx|ts)$/.test(entry.name)) result.push(full);
  }
  return result;
}

async function findHardcodedJapanese() {
  const cjk = /[\u3040-\u30ff\u3400-\u9fff\uff00-\uffef]/;
  const offenders = [];
  for (const rel of COMPONENT_DIRS) {
    for (const file of await listSourceFiles(path.join(ROOT, rel))) {
      const lines = stripComments(await readFile(file, "utf8")).split(/\r?\n/);
      lines.forEach((line, i) => {
        if (cjk.test(line)) offenders.push(`${path.relative(ROOT, file)}:${i + 1}: ${line.trim()}`);
      });
    }
  }
  return offenders;
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

/** site.ts の links ブロックから、値が入っているキーを調べる（site.ts は "@/" 別名を使うので直接 import しない） */
async function readFilledLinks() {
  const source = stripComments(await readFile(SITE_PATH, "utf8"));
  const block = source.match(/\blinks\s*:\s*\{([^}]*)\}/);
  if (!block) return null;
  const filled = [];
  for (const m of block[1].matchAll(/(\w+)\s*:\s*(["'`])(.*?)\2/g)) {
    if (m[3].trim() !== "") filled.push(m[1]);
  }
  return filled;
}

/** brief-v2 を「§X」ごとの行配列に分ける（§ の無い「## 」見出しに当たったら、そのセクションは終わり） */
function splitBriefSections(lines) {
  const result = {};
  let current = null;
  for (const raw of lines) {
    const m = raw.match(/^## §(\w+)\s*(.*)$/);
    if (m) {
      current = { title: m[2].replace(/（.*）\s*$/, "").trim(), lines: [] };
      result[m[1]] = current;
      continue;
    }
    if (raw.startsWith("## ")) {
      current = null;
      continue;
    }
    if (current) current.lines.push(raw);
  }
  return result;
}

/** 本文行 1 行を、サイトに出る文字列（0〜複数）に変換する。注記は除く */
function briefLineToCopy(raw, sectionKey) {
  let line = raw.trim();
  if (!line) return [];
  if (NOTE_LINE_PREFIXES.some((p) => line.startsWith(p))) return [];

  if (line.startsWith("### ")) {
    const h = line.replace(/^###\s+/, "");
    if (sectionKey === "A") return [h.split(/[:：]\s*/).pop().replace(/（.*）\s*$/, "").trim()]; // 「ABOUT 下部に少し小さく: BACKGROUND（2段落）」→ BACKGROUND
    if (sectionKey === "B") return [h.replace(/^\d+\.\s*/, "").replace(/（.*）\s*$/, "").trim()]; // 「1. EC / Amazon運用（…）」
    return [h.trim()]; // §P の小見出し
  }
  if (line.startsWith("- ")) line = line.slice(2).trim();
  if (line.startsWith("（注記・維持）")) line = line.slice("（注記・維持）".length).trim();

  // 「詳細を見る →（/projects/guild-farm/ へ）」→ 詳細を見る（「→」は UI の装飾、パスは href）
  if (line.startsWith("詳細を見る")) return ["詳細を見る"];
  // 「Instagram / note / Email（リンクは site.ts。未入力）」
  line = line.replace(/（リンクは.*）\s*$/, "");
  // 「Cona Design / …（小さく）」はフッター。本文には含めない
  if (sectionKey === "H") return [];
  // §P 末尾「← トップへ戻る / CONTACT への導線（トップの #contact）」
  if (line.startsWith("← ")) return line.slice(2).replace(/\s*への導線.*$/, "").split(" / ").map((x) => x.trim());

  // 行頭の印「（担当）」など
  const marker = line.match(/^（([^）]+)）(.*)$/);
  if (marker && DROP_MARKERS.includes(marker[1])) return [marker[2].trim()];
  if (marker && KEEP_MARKERS.includes(marker[1])) return [marker[1], marker[2].trim()];

  return [line];
}

/** 行の配列を、空行（空白のみの行を含む）で区切ってグループにする。空行そのものは捨てるが、区切りの位置は保つ */
function groupByBlank(lines) {
  const groups = [];
  let current = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (line === "") {
      if (current.length > 0) groups.push(current);
      current = [];
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) groups.push(current);
  return groups;
}

/** 段落チェック用の本文行（注記行・「### 」見出しを除く） */
const paragraphBodyLines = (lines) =>
  lines.filter((raw) => {
    const t = raw.trim();
    return t === "" || !(t.startsWith("### ") || NOTE_LINE_PREFIXES.some((p) => t.startsWith(p)));
  });

/** brief-v2 の各セクションから、段落チェック用の「本文の行（空行を保つ）」を取り出す */
function briefParagraphSources(parts) {
  const aLines = parts.A.lines;
  const bgAt = aLines.findIndex((l) => l.trim().startsWith("### ABOUT 下部"));
  const regionalAt = parts.B.lines.findIndex((l) => /^###\s*4\.\s*Regional/.test(l.trim()));
  // §C: 先頭の「PROJECT」「GUILD Farm」「subtitle」の3行の後から、タグ行（「詳細を見る」の直前の行）の前まで
  const cLines = parts.C.lines;
  const cStart = (() => {
    let seen = 0;
    for (let i = 0; i < cLines.length; i += 1) {
      if (cLines[i].trim() !== "" && (seen += 1) === 3) return i + 1;
    }
    return cLines.length;
  })();
  const cEnd = cLines.findIndex((l) => l.trim().startsWith("詳細を見る")) - 1; // タグ行
  // §E: 「INTERESTS」ラベル行の後
  const eLines = parts.E.lines;
  const eStart = eLines.findIndex((l) => l.trim() === "INTERESTS") + 1;
  return {
    about: bgAt < 0 ? null : paragraphBodyLines(aLines.slice(0, bgAt)),
    background: bgAt < 0 ? null : paragraphBodyLines(aLines.slice(bgAt + 1)),
    regional: regionalAt < 0 ? null : paragraphBodyLines(parts.B.lines.slice(regionalAt + 1)),
    project: cEnd < cStart ? null : paragraphBodyLines(cLines.slice(cStart, cEnd)),
    interests: eStart === 0 ? null : paragraphBodyLines(eLines.slice(eStart)),
  };
}

/** 空行グループ列（brief）と paragraphs（実装。段落 = 行の配列）を比べ、ずれた場所を具体的に表示する */
function compareParagraphs(label, implName, briefLines, paragraphs) {
  if (briefLines === null) {
    check(false, `${label}: brief-v2 から本文の範囲を取り出せません（見出しの形が変わった？）`);
    return;
  }
  const groups = groupByBlank(briefLines);
  const impl = paragraphs.map((p) => (Array.isArray(p) ? p : [p]));
  const problems = [];
  if (groups.length !== impl.length) {
    problems.push(`${implName} ${impl.length}要素 vs brief ${groups.length}グループ`);
  }
  for (let i = 0; i < Math.min(groups.length, impl.length); i += 1) {
    const a = groups[i];
    const b = impl[i];
    if (a.length === b.length && a.every((line, j) => line === b[j].trim())) continue;
    const at = a.findIndex((line, j) => b[j] === undefined || line !== b[j].trim());
    problems.push(
      `${i + 1}番目: brief ${a.length}行 / 実装 ${b.length}行` +
        (at >= 0 && at < Math.min(a.length, b.length) ? `（${at + 1}行目が違う: brief「${a[at]}」/ 実装「${b[at]}」）` : ""),
    );
  }
  if (problems.length === 0) {
    check(true, `${label}: ${groups.length} 段落の区切り（空行）が一致`);
    return;
  }
  check(false, `${label}: 段落の区切りが brief-v2 の空行と一致しません`);
  for (const p of problems) console.error(`       ${p}`);
}

function compareStreams(label, expectedLines, actualStrings) {
  const exp = normalize(expectedLines.join(""));
  const act = normalize(actualStrings.join(""));
  if (exp === act) {
    check(true, `${label}: 本文 ${expectedLines.length} 行が一致（${act.length} 文字。過不足なし）`);
    return;
  }
  const at = firstDiff(exp, act);
  check(
    false,
    `${label}: 原稿と実装が一致しません（brief ${exp.length} 文字 / 実装 ${act.length} 文字）\n` +
      `       brief 側: …${exp.slice(Math.max(0, at - 8), at + 24)}…\n` +
      `       実装側  : …${act.slice(Math.max(0, at - 8), at + 24)}…`,
  );
}

/** docs/brief-v2.md との照合（[1]〜[4]）。brief-v2.md がある環境でだけ実行する */
async function verifyAgainstBrief({ nav, footer, sectionOrder, sections, guildFarm }) {
  const brief = (await readFile(BRIEF_PATH, "utf8")).split(/\r?\n/);
  const parts = splitBriefSections(brief);

  for (const key of [...Object.keys(SECTION_MAP), "H", "P"]) {
    if (!parts[key]) {
      console.error(`brief-v2.md の構造（## §${key}）が見つかりません。`);
      process.exit(1);
    }
  }

  console.log("原稿（docs/brief-v2.md）と src/content の照合");

  // ---- [1] 本文：セクションごとの完全一致 -------------------------------------------
  console.log("\n[1] 本文（HERO・§A〜§G。トップページ）");
  for (const [key, def] of Object.entries(SECTION_MAP)) {
    const part = parts[key];
    const section = sections[def.id];
    const expected = [];
    if (def.headerFromTitle) {
      // 「事業内容 / WHAT I DO」は日本語の見出し＋英字ラベルの2行、それ以外は英字ラベル1行
      expected.push(...part.title.split(" / ").map((x) => x.trim()));
    }
    for (const raw of part.lines) expected.push(...briefLineToCopy(raw, key));

    // HERO の label（"HERO"）は内部用の名前で、原稿には無い。その他の label は見出しとして原稿にある
    const { label, ...rest } = section;
    const actual = collectStrings(def.id === "hero" ? rest : section);
    if (def.id === "hero") check(label === "HERO", "hero.label は内部名 HERO（画面に出さない）");
    compareStreams(`§${key} ${def.id}`, expected, actual);
  }

  // ---- [1b] 段落の区切り（空行）----------------------------------------------------
  // 契約: brief-v2 の本文を空行で区切ったグループ列 === sections.ts の paragraphs（段落 = 行の配列）
  console.log("\n[1b] 段落の区切り（brief-v2 の空行 = sections.ts の paragraphs の段落）");
  const src = briefParagraphSources(parts);
  compareParagraphs("§A about", "about.paragraphs", src.about, sections.about.paragraphs);
  compareParagraphs("§A background", "about.background.paragraphs", src.background, sections.about.background.paragraphs);
  const regional = sections["what-i-do"].areas.find((a) => a.id === "regional");
  compareParagraphs(
    "§B regional",
    "regional.lead",
    src.regional,
    regional ? regional.lead.map((line) => [line]) : [], // lead の 1 行 = 1 段落
  );
  compareParagraphs("§C project", "project.paragraphs", src.project, sections.project.paragraphs);
  compareParagraphs("§E interests", "interests.paragraphs", src.interests, sections.interests.paragraphs);

  // ---- [2] ナビ ----------------------------------------------------------------
  console.log("\n[2] ナビゲーション");
  const navLine = brief.find((l) => /^-\s*ナビ:/.test(l.trim())) ?? "";
  const navMatch = navLine.match(/ナビ:\s*([A-Z /]+?)（/);
  const navExpected = navMatch ? navMatch[1].split(" / ").map((x) => x.trim()) : [];
  const navActual = nav.map((n) => n.label);
  check(
    navExpected.length > 0 && JSON.stringify(navExpected) === JSON.stringify(navActual),
    `ナビ項目が brief-v2 と一致: ${navExpected.join(" / ")}`,
  );
  check(
    nav.every((n) => sectionOrder.includes(n.target)),
    "ナビの飛び先（target）がすべて実在するセクション ID",
  );
  check(
    nav.find((n) => n.label === "WORK")?.target === "what-i-do" &&
      nav.find((n) => n.label === "INTERESTS")?.target === "interests",
    "WORK → what-i-do（事業内容 / WHAT I DO）、INTERESTS → interests",
  );

  // ---- [3] フッター表記（§H） ---------------------------------------------------
  console.log("\n[3] フッター表記");
  const footerLine = parts.H.lines.map((l) => l.trim()).find((l) => l.startsWith("Cona Design")) ?? "";
  const footerExpected = footerLine.replace(/（.*）\s*$/, "").trim();
  check(footerExpected !== "" && footerExpected === footer.credit, `Cona Design 表記が brief-v2 と一致: ${footerExpected}`);

  // ---- [4] セクション順（「構成」の1行目） -----------------------------------------
  console.log("\n[4] セクションの順番");
  const iaLine = brief.find((l) => /^HERO\s*→/.test(l.trim())) ?? "";
  const iaCount = iaLine.split("→").length;
  check(iaCount === 8, `brief-v2 の構成は 8 セクション（${iaCount}）`);
  check(
    JSON.stringify(sectionOrder) === JSON.stringify(EXPECTED_ORDER),
    `8セクションの順番が一致: ${sectionOrder.join(" → ")}`,
  );
  check(
    sectionOrder.every((id) => sections[id]?.id === id),
    "sections の各 id が sectionOrder と対応している",
  );
  const detailPath = brief.map((l) => l.trim()).find((l) => l.startsWith("- 詳細ページ:")) ?? "";
  check(
    detailPath.includes(sections.project.detailLink.href),
    `詳細ページのパスが brief-v2 と一致: ${sections.project.detailLink.href}`,
  );

  // ---- [4b] §P 詳細ページ -------------------------------------------------------
  console.log("\n[4b] §P GUILD Farm 詳細ページ（下書き・本人確認待ち）");
  const expectedP = [];
  for (const raw of parts.P.lines) expectedP.push(...briefLineToCopy(raw, "P"));
  // slug・photos は内部名（画面の文章ではない）なので比較から外す
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { slug, photos: _photos, ...pRest } = guildFarm;
  compareStreams("§P guildFarm", expectedP, collectStrings(pRest));
  check(
    guildFarm.slug === "guild-farm" && guildFarm.photos.event.join(",") === "expo-booth,expo-talk",
    "slug は guild-farm、EVENT の写真は expo-booth / expo-talk",
  );
}

async function main() {
  const sectionsModule = await import(pathToFileURL(SECTIONS_PATH).href);
  const { nav, footer, sectionOrder, sections, ui } = sectionsModule;
  const { guildFarm } = await import(pathToFileURL(PROJECTS_PATH).href);

  if (await exists(BRIEF_PATH)) {
    await verifyAgainstBrief({ nav, footer, sectionOrder, sections, guildFarm });
  } else {
    console.warn(
      "注意: docs/brief-v2.md が見つかりません（docs/ はローカル専用で、リポジトリには入っていません）。\n" +
        "      原稿との照合 [1]〜[4b] をスキップします。原稿の確認は、brief-v2.md のある PC で行ってください。",
    );
  }

  // ---- 6. 追加を認めた表示文字列（ui） --------------------------------------------
  console.log("\n[5] 追加を認めた表示文字列（ui）");
  check(
    JSON.stringify(ui) === JSON.stringify(ALLOWED_UI_EXTRAS),
    "sections.ts の ui が、Art Direction が認めた一覧と完全一致",
  );

  // ---- 7. 連絡先リンク（警告のみ。ビルドも検証も止めない） -------------------------
  console.log("\n[6] 連絡先リンク（site.ts の links）");
  const filledLinks = await readFilledLinks();
  if (filledLinks === null) {
    console.warn("  注意: site.ts の links を読み取れませんでした（書き方が変わった？）。連絡先の確認をスキップします。");
  } else if (filledLinks.length === 0) {
    console.warn(
      "  警告: Instagram / note / Email が3つとも空です。CONTACT に連絡手段が1つも出ません。\n" +
        "        公開前に、src/config/site.ts の links へ少なくとも1つ入れてください（プレビュー公開なら空のままでも構いません）。",
    );
  } else {
    console.log(`  OK   連絡先が設定されています: ${filledLinks.join(" / ")}`);
  }

  // ---- 8. コンポーネントに日本語の文言が直書きされていない -------------------------
  console.log("\n[7] コンポーネントへの日本語の直書き");
  const offenders = await findHardcodedJapanese();
  check(offenders.length === 0, "src/components・src/app の .tsx / .ts に日本語の文言が直書きされていない（コメントを除く）");
  for (const o of offenders) console.error(`       ${o}`);

  console.log(failures === 0 ? "\n結果: すべて一致しました。" : `\n結果: ${failures} 件の不一致があります。`);
  process.exit(failures === 0 ? 0 : 1);
}

await main();
