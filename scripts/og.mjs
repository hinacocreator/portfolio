#!/usr/bin/env node
/**
 * OGP 画像の生成（npm run og）→ public/og.jpg（1200x630）
 * ------------------------------------------------------------
 * 仕様: docs/art-direction.md §5.5
 *   左 630px … 生成り（#F4F0E8）に、名前（2行）・罫線・肩書・核メッセージ
 *   右 570px … _source-photos/8.jpg の x=278,y=0,w=602,h=665 を 570x630 に縮小（拡大しない）
 *
 * 文字は satori で「パス（図形）」にしてから sharp で描くので、実行する環境にフォントが
 * 入っていなくても、いつでも同じ画像になります。フォントは scripts/og-fonts/ に置いたもの
 * （Newsreader / Shippori Mincho。どちらも SIL Open Font License）を読み込みます。
 *
 * 文言は src/content/sections.ts の hero（name / title / tagline）から読みます（ここに直書きしない）。
 * 原稿の外側の「」は、サイトの画面と同じく出しません（src/lib/copy.ts の unbracket と同じ扱い）。
 *
 * ※ 写真の原本（_source-photos/）が必要です。原本のあるPCでだけ実行し、できた public/og.jpg を
 *   コミットしてください（GitHub Actions では実行しません）。
 * ※ Node 22.18 以上（sections.ts を型除去で直接読み込むため）。
 */
import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import satori from "satori";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FONT_DIR = path.join(ROOT, "scripts", "og-fonts");
const SOURCE_PHOTO = path.join(ROOT, "_source-photos", "8.jpg");
const OUTPUT = path.join(ROOT, "public", "og.jpg");

// ---- 仕様値（Art Direction §5.5）--------------------------------------------
const W = 1200;
const H = 630;
const PAPER = "#F4F0E8";
const INK = "#26231F";
const INK_2 = "#4D4841";
const LEFT = 72; // 文字の左端
const RULE_RIGHT = 558; // 罫線の右端（文字の安全域 x 72–558）
/** 原本 8.jpg（1182x665）から切り出す範囲。左端の他人（x≈17–60）は範囲外 */
const PHOTO_CROP = { left: 278, top: 0, width: 602, height: 665 };
const PHOTO_BOX = { left: 630, top: 0, width: 570, height: 630 };
const MAX_BYTES = 200 * 1024;

/** 文字の指定: ベースライン y をそのまま指定する（下の topFor が satori の top に直す） */
const TEXT = {
  name: { size: 80, lineHeight: 80, letterSpacing: -0.8, baselines: [200, 280] },
  rule: { y: 318, height: 2 },
  title: { size: 28, lineHeight: 40, letterSpacing: 0.28, baseline: 366 },
  tagline: { size: 28, lineHeight: 40, letterSpacing: 1.12, baseline: 540 },
};

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

function fail(message) {
  console.error(`\nエラー: ${message}`);
  process.exit(1);
}

/** TTF の hhea / head から、ascent・descent（em 比）を読む */
function readMetrics(buf) {
  const numTables = buf.readUInt16BE(4);
  const tables = {};
  for (let i = 0; i < numTables; i += 1) {
    const o = 12 + i * 16;
    tables[buf.toString("ascii", o, o + 4)] = buf.readUInt32BE(o + 8);
  }
  const unitsPerEm = buf.readUInt16BE(tables.head + 18);
  const ascent = buf.readInt16BE(tables.hhea + 4);
  const descent = buf.readInt16BE(tables.hhea + 6); // 負の値
  return { ascent: ascent / unitsPerEm, descent: -descent / unitsPerEm };
}

/** ベースラインが y に来るように、行の top を求める（行の中で字面を上下中央に置く satori の配置に合わせる） */
function topFor(baseline, spec, metrics) {
  const content = (metrics.ascent + metrics.descent) * spec.size;
  return baseline - (spec.lineHeight - content) / 2 - metrics.ascent * spec.size;
}

/** 原稿の外側の「」を外す（src/lib/copy.ts の unbracket と同じ） */
const unbracket = (text) => text.match(/^「([^「」]*)」$/)?.[1] ?? text;

async function loadHero() {
  const mod = await import(pathToFileURL(path.join(ROOT, "src", "content", "sections.ts")).href);
  return mod.hero;
}

const node = (type, style, children) => ({ type, props: { style, children } });

async function renderText(hero) {
  const [romanBuf, italicBuf, minchoBuf] = await Promise.all([
    readFile(path.join(FONT_DIR, "Newsreader-opsz72-Regular.ttf")),
    readFile(path.join(FONT_DIR, "Newsreader-opsz28-Italic.ttf")),
    readFile(path.join(FONT_DIR, "ShipporiMincho-Medium-subset.ttf")),
  ]);
  const metrics = {
    roman: readMetrics(romanBuf),
    italic: readMetrics(italicBuf),
    mincho: readMetrics(minchoBuf),
  };

  const nameParts = hero.name.split(" ");
  const tagline = unbracket(hero.tagline);
  const abs = { position: "absolute", display: "flex", whiteSpace: "nowrap", color: INK };

  const children = [
    // 名前（2行）
    ...nameParts.slice(0, TEXT.name.baselines.length).map((part, i) =>
      node(
        "div",
        {
          ...abs,
          left: LEFT,
          top: topFor(TEXT.name.baselines[i], TEXT.name, metrics.roman),
          fontFamily: "Newsreader",
          fontWeight: 400,
          fontSize: TEXT.name.size,
          lineHeight: `${TEXT.name.lineHeight}px`,
          letterSpacing: TEXT.name.letterSpacing,
        },
        part,
      ),
    ),
    // 罫線
    node("div", {
      position: "absolute",
      left: LEFT,
      top: TEXT.rule.y,
      width: RULE_RIGHT - LEFT,
      height: TEXT.rule.height,
      background: INK,
    }),
    // 肩書
    node(
      "div",
      {
        ...abs,
        color: INK_2,
        left: LEFT,
        top: topFor(TEXT.title.baseline, TEXT.title, metrics.italic),
        fontFamily: "Newsreader",
        fontStyle: "italic",
        fontWeight: 400,
        fontSize: TEXT.title.size,
        lineHeight: `${TEXT.title.lineHeight}px`,
        letterSpacing: TEXT.title.letterSpacing,
      },
      hero.title,
    ),
    // 核メッセージ
    node(
      "div",
      {
        ...abs,
        left: LEFT,
        top: topFor(TEXT.tagline.baseline, TEXT.tagline, metrics.mincho),
        fontFamily: "Shippori Mincho",
        fontWeight: 500,
        fontSize: TEXT.tagline.size,
        lineHeight: `${TEXT.tagline.lineHeight}px`,
        letterSpacing: TEXT.tagline.letterSpacing,
      },
      tagline,
    ),
  ];

  const svg = await satori(node("div", { position: "relative", display: "flex", width: W, height: H }, children), {
    width: W,
    height: H,
    fonts: [
      { name: "Newsreader", data: romanBuf, weight: 400, style: "normal" },
      { name: "Newsreader", data: italicBuf, weight: 400, style: "italic" },
      { name: "Shippori Mincho", data: minchoBuf, weight: 500, style: "normal" },
    ],
  });
  return Buffer.from(svg);
}

async function main() {
  if (!(await exists(SOURCE_PHOTO))) {
    fail("_source-photos/8.jpg が見つかりません。原本のあるPCでだけ実行してください（CI では実行しません）。");
  }
  const meta = await sharp(SOURCE_PHOTO).metadata();
  if (meta.width !== 1182 || meta.height !== 665) {
    fail(`8.jpg が想定の 1182x665 ではありません（${meta.width}x${meta.height}）。切り出し範囲 PHOTO_CROP を見直してください。`);
  }

  const hero = await loadHero();
  const textSvg = await renderText(hero);

  // 写真: 切り出し → 570x630 に縮小（倍率 0.947。拡大しない）
  const photo = await sharp(SOURCE_PHOTO)
    .rotate()
    .extract(PHOTO_CROP)
    .resize(PHOTO_BOX.width, PHOTO_BOX.height, { fit: "fill" })
    .toBuffer();

  const compose = (quality) =>
    sharp({ create: { width: W, height: H, channels: 3, background: PAPER } })
      .composite([
        { input: photo, left: PHOTO_BOX.left, top: PHOTO_BOX.top },
        { input: textSvg, left: 0, top: 0 },
      ])
      .toColourspace("srgb")
      .jpeg({ quality, progressive: true, mozjpeg: true })
      .toBuffer();

  let quality = 86;
  let output = await compose(quality);
  while (output.length > MAX_BYTES && quality > 60) {
    quality -= 4;
    output = await compose(quality);
  }
  if (output.length > MAX_BYTES) fail(`og.jpg が ${Math.round(output.length / 1024)}KB で、200KB を超えました。`);

  await writeFile(OUTPUT, output);
  const info = await sharp(output).metadata();
  console.log(
    `OGP 画像を生成しました: ${path.relative(ROOT, OUTPUT)}（${info.width}x${info.height}, ${Math.round(output.length / 1024)}KB, quality ${quality}）`,
  );
}

await main();
