#!/usr/bin/env node
/**
 * 画像パイプライン（npm run images）
 * ------------------------------------------------------------
 * 入力 : src/config/photos.ts の台帳（photoLedger）＋ _source-photos/ の原本
 * 出力 : public/images/{id}-{幅}.avif / .webp
 *        src/config/photo-meta.json（各写真の実寸・aspect・出力幅。自動生成）
 *
 * ルール
 *   ・visible: true の写真だけを出力する。visible: false の写真は出力せず、既存の出力は削除する。
 *   ・consent: "ng" の写真は visible: true でもエラーにする（誤公開の防止）。
 *   ・幅は 480 / 768 / 1200 / 1600 / 2000 のうち「原本（crop 後）の幅より小さいもの」＋
 *     原本幅そのもの。原本より大きく拡大した画像は作らない。
 *   ・AVIF q55 / WebP q78。EXIF・ICC は除去し、色空間は sRGB。
 *   ・台帳に crop があれば、サイズ変換の前に原本座標で切り出す。
 *
 * 台帳は photos.ts を直接 import する（Node の型除去機能を使う。Node 22.18 以上が必要）。
 * photos.ts と別に JSON を持たないので、写真の情報が二重管理になりません。
 *
 * ※ GitHub Actions には原本がないので、CI ではこのスクリプトを実行しません。
 *   生成物（public/images/ と photo-meta.json）はコミットしてください。
 */
import { access, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_DIR = path.join(ROOT, "_source-photos");
const OUTPUT_DIR = path.join(ROOT, "public", "images");
const LEDGER_PATH = path.join(ROOT, "src", "config", "photos.ts");
const META_PATH = path.join(ROOT, "src", "config", "photo-meta.json");

const WIDTH_LADDER = [480, 768, 1200, 1600, 2000];
/** 段の幅が原本幅の 1/1.08 より近いときは、段を捨てて原本幅を最大サイズにする（ほぼ同じ画像を2枚作らない） */
const NEAR_RATIO = 1.08;
const AVIF_QUALITY = 55;
const WEBP_QUALITY = 78;

const ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const GENERATED_PATTERN = /^(.+)-(\d+)\.(avif|webp)$/;

function fail(message) {
  console.error(`\nエラー: ${message}`);
  process.exit(1);
}

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

/** 原本（crop 後）の幅から、出力する幅の一覧を決める。原本幅を超える値は含めない */
export function outputWidthsFor(sourceWidth) {
  const widths = WIDTH_LADDER.filter((w) => w < sourceWidth);
  const last = widths[widths.length - 1];
  if (last !== undefined && sourceWidth / last < NEAR_RATIO) widths.pop();
  widths.push(sourceWidth);
  return widths;
}

async function loadLedger() {
  const [major, minor] = process.versions.node.split(".").map(Number);
  if (major < 22 || (major === 22 && minor < 18)) {
    fail(
      `Node ${process.versions.node} では実行できません。Node 22.18 以上（推奨 24）を使ってください。` +
        "（台帳 photos.ts を型除去で直接読み込むため）",
    );
  }
  try {
    const mod = await import(pathToFileURL(LEDGER_PATH).href);
    if (!Array.isArray(mod.photoLedger)) fail("photos.ts から photoLedger が読み込めません。");
    return mod.photoLedger;
  } catch (error) {
    fail(`台帳 src/config/photos.ts を読み込めませんでした。\n${error instanceof Error ? error.message : error}`);
  }
}

function validateLedger(ledger) {
  const ids = new Set();
  for (const entry of ledger) {
    if (!ID_PATTERN.test(entry.id)) {
      fail(`id "${entry.id}" は使えません。半角の小文字英数字とハイフンだけにしてください。`);
    }
    if (ids.has(entry.id)) fail(`id "${entry.id}" が重複しています。`);
    ids.add(entry.id);
    if (typeof entry.file !== "string" || !entry.file) fail(`"${entry.id}" の file がありません。`);
    if (entry.visible && entry.consent === "ng") {
      fail(`"${entry.id}" は consent: "ng"（掲載不可）ですが visible: true になっています。visible を false にしてください。`);
    }
  }
}

/** crop の検証。原本（向き補正後）の範囲に収まっていなければエラー */
function resolveRegion(entry, sourceWidth, sourceHeight) {
  const crop = entry.crop;
  if (!crop) return { left: 0, top: 0, width: sourceWidth, height: sourceHeight };
  const { left, top, width, height } = crop;
  const allIntegers = [left, top, width, height].every((n) => Number.isInteger(n));
  if (!allIntegers || left < 0 || top < 0 || width <= 0 || height <= 0) {
    fail(`"${entry.id}" の crop は、0 以上の整数（width / height は 1 以上）で指定してください。`);
  }
  if (left + width > sourceWidth || top + height > sourceHeight) {
    fail(
      `"${entry.id}" の crop が原本（${sourceWidth}x${sourceHeight}）からはみ出しています: ` +
        `left ${left} + width ${width} / top ${top} + height ${height}`,
    );
  }
  return { left, top, width, height };
}

/** 向き補正後の原本サイズ */
async function readSourceSize(sourcePath) {
  const meta = await sharp(sourcePath).metadata();
  const rotated = meta.orientation !== undefined && meta.orientation >= 5;
  return rotated
    ? { width: meta.height, height: meta.width }
    : { width: meta.width, height: meta.height };
}

function buildPipeline(sourcePath, region, isCropped, targetWidth) {
  // rotate() は EXIF の向きを画素に反映する（EXIF を消すため、先に反映しておく）
  let pipeline = sharp(sourcePath, { failOn: "none" }).rotate();
  if (isCropped) pipeline = pipeline.extract(region);
  if (targetWidth < region.width) {
    // 縮小のみ。withoutEnlargement は拡大禁止の保険
    pipeline = pipeline.resize({ width: targetWidth, withoutEnlargement: true });
  }
  return pipeline.toColorspace("srgb");
}

async function writeVariants(entry, sourcePath, region, widths) {
  const isCropped = Boolean(entry.crop);
  const results = [];
  for (const width of widths) {
    const base = path.join(OUTPUT_DIR, `${entry.id}-${width}`);
    const avifInfo = await buildPipeline(sourcePath, region, isCropped, width)
      .avif({ quality: AVIF_QUALITY })
      .toFile(`${base}.avif`);
    const webpInfo = await buildPipeline(sourcePath, region, isCropped, width)
      .webp({ quality: WEBP_QUALITY })
      .toFile(`${base}.webp`);

    for (const [ext, info] of [["avif", avifInfo], ["webp", webpInfo]]) {
      if (info.width !== width) {
        fail(`${entry.id}-${width}.${ext} の幅が ${info.width}px になりました（想定 ${width}px）。`);
      }
      if (info.width > region.width) {
        fail(`${entry.id}-${width}.${ext} が原本より大きくなっています（拡大禁止）。`);
      }
      const written = await sharp(`${base}.${ext}`).metadata();
      if (written.exif || written.icc) {
        fail(`${entry.id}-${width}.${ext} にメタデータ（EXIF/ICC）が残っています。`);
      }
    }
    results.push({ width, avifBytes: avifInfo.size, webpBytes: webpInfo.size });
  }
  return results;
}

/** 今回の出力に含まれない生成物（visible:false の写真・古い幅・削除した ID）を消す */
async function removeStaleOutputs(expectedFiles) {
  const removed = [];
  for (const name of await readdir(OUTPUT_DIR)) {
    if (!GENERATED_PATTERN.test(name)) continue; // 手で置いた他のファイルには触らない
    if (expectedFiles.has(name)) continue;
    await rm(path.join(OUTPUT_DIR, name));
    removed.push(name);
  }
  return removed;
}

const kb = (bytes) => `${(bytes / 1024).toFixed(0)}KB`;

async function main() {
  const ledger = await loadLedger();
  validateLedger(ledger);

  if (!(await exists(SOURCE_DIR))) {
    fail(
      "_source-photos/ が見つかりません。原本は公開リポジトリに入れていないため、" +
        "原本を持っているPCでだけ実行してください（CI では実行しません）。",
    );
  }
  await mkdir(OUTPUT_DIR, { recursive: true });

  const meta = {
    generatedBy: "scripts/images.mjs（npm run images）が自動生成。手で編集しないでください。",
    photos: {},
  };
  const expectedFiles = new Set();
  const lines = [];

  for (const entry of ledger) {
    const sourcePath = path.join(SOURCE_DIR, entry.file);
    if (!(await exists(sourcePath))) {
      if (entry.visible) fail(`"${entry.id}" の原本 _source-photos/${entry.file} が見つかりません。`);
      lines.push(`  - ${entry.id}: 非表示（原本なし・スキップ）`);
      continue;
    }

    const source = await readSourceSize(sourcePath);
    const region = resolveRegion(entry, source.width, source.height);
    const widths = outputWidthsFor(region.width);

    meta.photos[entry.id] = {
      sourceWidth: source.width,
      sourceHeight: source.height,
      // 最大サイズ（crop 後）の実寸。<img width/height> と aspect-ratio にそのまま使える
      width: region.width,
      height: region.height,
      aspect: Number((region.width / region.height).toFixed(4)),
      // 実際に public/images/ へ出力した幅。非表示の写真は空
      outputWidths: entry.visible ? widths : [],
    };

    if (!entry.visible) {
      lines.push(`  - ${entry.id}: 非表示（visible:false）→ 出力なし／既存の出力は削除`);
      continue;
    }

    const results = await writeVariants(entry, sourcePath, region, widths);
    for (const { width } of results) {
      expectedFiles.add(`${entry.id}-${width}.avif`);
      expectedFiles.add(`${entry.id}-${width}.webp`);
    }
    const sizes = results
      .map((r) => `${r.width}w(avif ${kb(r.avifBytes)} / webp ${kb(r.webpBytes)})`)
      .join(", ");
    const cropNote = entry.crop ? ` crop=${region.left},${region.top} ${region.width}x${region.height}` : "";
    lines.push(`  - ${entry.id}: ${region.width}x${region.height}${cropNote} → ${sizes}`);
  }

  const removed = await removeStaleOutputs(expectedFiles);
  // outputWidths のような数値の配列は1行に収めて読みやすくする
  const metaJson = JSON.stringify(meta, null, 2).replace(/\[\s+(\d[\d,\s]*?)\s+\]/g, (_, inner) => `[${inner.replace(/\s+/g, " ")}]`);
  await writeFile(META_PATH, `${metaJson}\n`);

  // 台帳にない原本は警告だけ出す
  const known = new Set(ledger.map((e) => e.file));
  const orphans = (await readdir(SOURCE_DIR)).filter((f) => !f.startsWith(".") && !known.has(f));

  console.log("画像を生成しました。");
  console.log(lines.join("\n"));
  if (removed.length > 0) console.log(`\n不要になった出力を削除: ${removed.join(", ")}`);
  if (orphans.length > 0) {
    console.warn(`\n警告: 台帳（photos.ts）に載っていない原本があります: ${orphans.join(", ")}`);
  }
  console.log(`\nメタ情報: ${path.relative(ROOT, META_PATH)}`);
}

// import されたとき（テスト等）は実行しない
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
