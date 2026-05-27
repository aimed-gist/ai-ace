#!/usr/bin/env node

/**
 * sync-news.mjs
 *
 * Google Spreadsheet 3개 탭 → news.json
 *   - Notice         : 공지사항       (제목 | 날짜 | 본문 | 첨부 링크)
 *   - Media Coverage : 언론 보도      (제목 | 매체명 | 날짜 | 기사 링크)
 *   - Co-Lab         : 행사 사진      (제목 | 날짜 | 사진 링크)
 *
 * Co-Lab 사진은 Google Drive 등에서 public/images/colab/ 로 자동 다운로드.
 *
 * 사용법:
 *   node scripts/sync-news.mjs
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { resolve, dirname, extname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");

const SPREADSHEET_ID = "1JBb_azDOmzVl3hCfJqqAWh1sGMHCB0tGey4k_OX7agY";
const OUTPUT_PATH = resolve(PROJECT_ROOT, "src", "data", "news.json");
const COLAB_IMG_DIR = resolve(PROJECT_ROOT, "public", "images", "colab");

function sheetCsvUrl(sheetName) {
  return `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
}

// ───────────────────────────────────────────────────────────────
// CSV parser (다른 sync 스크립트와 동일)
// ───────────────────────────────────────────────────────────────
function parseCSV(text) {
  const result = [];
  let row = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      row.push(current);
      current = "";
    } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (current || row.length > 0) {
        row.push(current);
        current = "";
      }
      if (row.length > 0) {
        result.push([...row]);
        row = [];
      }
      if (ch === "\r" && text[i + 1] === "\n") i++;
    } else {
      current += ch;
    }
  }
  if (current || row.length > 0) {
    row.push(current);
    result.push([...row]);
  }
  return result;
}

/**
 * 시트 fetch + 헤더 검증.
 * gviz는 시트 이름을 못 찾으면 첫 번째 시트를 반환하므로,
 * 첫 헤더가 기대값과 다르면 다른 시트가 반환된 것으로 간주하고 빈 결과 반환.
 */
async function fetchSheet(sheetName, expectedFirstHeader) {
  console.log(`📡 Fetching tab: ${sheetName}`);
  const resp = await fetch(sheetCsvUrl(sheetName), { redirect: "follow" });
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status}`);
  }
  const rows = parseCSV(await resp.text());

  // 헤더 검증
  if (rows.length === 0) return rows;
  const firstHeader = (rows[0][0] || "").trim();
  if (expectedFirstHeader && firstHeader !== expectedFirstHeader) {
    console.log(`⚠️  ${sheetName} 탭 헤더 검증 실패: "${expectedFirstHeader}" 기대했으나 "${firstHeader}" 받음`);
    console.log(`   → 탭이 존재하지 않거나 헤더가 다릅니다. 이 탭은 건너뜁니다.`);
    return [];
  }
  return rows;
}

// ───────────────────────────────────────────────────────────────
// 공통 헬퍼
// ───────────────────────────────────────────────────────────────
function cell(row, idx) {
  return (row[idx] || "").trim();
}

function slugify(s) {
  return String(s)
    .trim()
    .toLowerCase()
    .replace(/㈜|\(주\)|\(社\)/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/[\s-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
}

function normalizeDate(s) {
  if (!s) return "";
  // 다양한 입력을 YYYY-MM-DD로 정규화
  const str = String(s).trim();
  // 2026-05-26 / 2026.05.26 / 2026/05/26
  let m = str.match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})/);
  if (m) {
    const [, y, mo, d] = m;
    return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  // 다른 형식은 그대로 보존 (페이지에서 처리)
  return str;
}

function toDirectUrl(url) {
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch) {
    return `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
  }
  const openMatch = url.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (openMatch) {
    return `https://drive.google.com/uc?export=download&id=${openMatch[1]}`;
  }
  return url;
}

async function downloadImage(url, slug, outDir, urlPrefix) {
  if (!url || !(url.startsWith("http://") || url.startsWith("https://"))) {
    return "";
  }
  if (!slug) return "";

  mkdirSync(outDir, { recursive: true });

  try {
    const directUrl = toDirectUrl(url);
    const response = await fetch(directUrl, { redirect: "follow" });
    if (!response.ok) {
      console.log(`    ⚠️  Image download failed (${response.status}) for ${slug}`);
      return "";
    }

    // content-type 또는 magic number로 이미지 검증
    const buffer = Buffer.from(await response.arrayBuffer());
    if (!isImageBuffer(buffer)) {
      console.log(`    ⚠️  Downloaded file is not an image (Drive 권한 확인 필요): ${slug}`);
      return "";
    }

    let ext = "jpg";
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("png")) ext = "png";
    else if (contentType.includes("webp")) ext = "webp";
    else if (contentType.includes("svg")) ext = "svg";
    else if (contentType.includes("gif")) ext = "gif";
    else if (contentType.includes("jpeg") || contentType.includes("jpg")) ext = "jpg";
    else {
      const urlExt = extname(new URL(directUrl).pathname).replace(".", "").toLowerCase();
      if (["png", "jpg", "jpeg", "webp", "svg", "gif"].includes(urlExt)) {
        ext = urlExt === "jpeg" ? "jpg" : urlExt;
      }
    }

    const filename = `${slug}.${ext}`;
    writeFileSync(resolve(outDir, filename), buffer);
    console.log(`    🖼️  Downloaded: ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
    return `${urlPrefix}/${filename}`;
  } catch (err) {
    console.log(`    ⚠️  Image download error for ${slug}: ${err.message}`);
    return "";
  }
}

/**
 * 바이트 시그니처로 이미지 여부 판별 (HTML 에러 페이지가 jpg로 저장되는 것 방지)
 */
function isImageBuffer(buf) {
  if (!buf || buf.length < 4) return false;
  // JPEG
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return true;
  // PNG
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return true;
  // GIF
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return true;
  // WebP (RIFF....WEBP)
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46) return true;
  // SVG (<svg or <?xml)
  const head = buf.toString("utf8", 0, Math.min(256, buf.length)).trim().toLowerCase();
  if (head.startsWith("<svg") || head.startsWith("<?xml")) return true;
  return false;
}

async function getColabImagePath(slug, url) {
  if (url) {
    const downloaded = await downloadImage(url, slug, COLAB_IMG_DIR, "/images/colab");
    if (downloaded) return downloaded;
  }
  // 기존 파일 폴백
  if (slug) {
    const exts = ["jpg", "png", "webp", "svg", "gif"];
    for (const ext of exts) {
      const p = resolve(COLAB_IMG_DIR, `${slug}.${ext}`);
      if (existsSync(p)) return `/images/colab/${slug}.${ext}`;
    }
  }
  return "";
}

// ───────────────────────────────────────────────────────────────
// 각 탭 파서
// ───────────────────────────────────────────────────────────────
function parseNotice(rows) {
  if (rows.length < 2) return [];
  const items = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const title = cell(r, 0);
    if (!title) continue;
    const date = normalizeDate(cell(r, 1));
    const body = cell(r, 2);
    const link = cell(r, 3);
    items.push({
      id: `notice-${slugify(title) || i}`,
      category: "notice",
      title,
      date,
      summary: body,
      link,
      image: "",
    });
    console.log(`  ✅ notice [${date}] ${title.slice(0, 50)}`);
  }
  return items;
}

function parseMedia(rows) {
  if (rows.length < 2) return [];
  const items = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const title = cell(r, 0);
    if (!title) continue;
    const source = cell(r, 1);
    const date = normalizeDate(cell(r, 2));
    const link = cell(r, 3);
    items.push({
      id: `media-${slugify(title) || i}`,
      category: "media",
      title,
      date,
      summary: source, // 매체명을 summary로
      link,
      image: "",
    });
    console.log(`  ✅ media [${date}] ${source ? source + " · " : ""}${title.slice(0, 50)}`);
  }
  return items;
}

async function parseCoLab(rows) {
  if (rows.length < 2) return [];
  const items = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const title = cell(r, 0);
    if (!title) continue;
    const date = normalizeDate(cell(r, 1));
    const photoUrl = cell(r, 2);
    const slug = slugify(title) || `colab_${i}`;
    const image = await getColabImagePath(slug, photoUrl);
    items.push({
      id: `colab-${slug}`,
      category: "co-lab",
      title,
      date,
      summary: "",
      link: "",
      image,
    });
    console.log(`  ✅ co-lab [${date}] ${title.slice(0, 50)}${image ? "" : " (사진 없음)"}`);
  }
  return items;
}

// ───────────────────────────────────────────────────────────────
// 정렬: 날짜 내림차순 (최신 위)
// ───────────────────────────────────────────────────────────────
function sortItems(items) {
  return items.sort((a, b) => {
    const da = a.date || "";
    const db = b.date || "";
    if (db !== da) return db.localeCompare(da);
    return a.title.localeCompare(b.title);
  });
}

// ───────────────────────────────────────────────────────────────
// Main
// ───────────────────────────────────────────────────────────────
async function main() {
  console.log("🔄 Syncing news from Google Spreadsheet (Notice / Media Coverage / Co-Lab)\n");

  let noticeRows = [];
  let mediaRows = [];
  let colabRows = [];

  // 모든 News 시트 탭의 첫 헤더는 "제목" — gviz의 잘못된 시트 반환을 차단
  try { noticeRows = await fetchSheet("Notice", "제목"); }
  catch (e) { console.log(`⚠️  Notice 탭 가져오기 실패: ${e.message}`); }

  try { mediaRows = await fetchSheet("Media Coverage", "제목"); }
  catch (e) { console.log(`⚠️  Media Coverage 탭 가져오기 실패: ${e.message}`); }

  try { colabRows = await fetchSheet("Co-Lab", "제목"); }
  catch (e) { console.log(`⚠️  Co-Lab 탭 가져오기 실패: ${e.message}`); }

  const notice = parseNotice(noticeRows);
  const media = parseMedia(mediaRows);
  const colab = await parseCoLab(colabRows);

  const all = sortItems([...notice, ...media, ...colab]);

  // 비교 후 저장
  let existing = "";
  if (existsSync(OUTPUT_PATH)) existing = readFileSync(OUTPUT_PATH, "utf-8");
  const newJson = JSON.stringify(all, null, 2) + "\n";

  if (existing === newJson) {
    console.log("\n✅ No changes detected.");
    return;
  }
  if (all.length === 0) {
    console.log("\n⚠️  No items found. Keeping existing data to avoid accidental wipe.");
    return;
  }

  writeFileSync(OUTPUT_PATH, newJson, "utf-8");
  console.log(`\n✅ Updated ${OUTPUT_PATH}`);
  console.log(`   notice: ${notice.length}, media: ${media.length}, co-lab: ${colab.length}, total: ${all.length}`);
}

main().catch((e) => {
  console.error("❌ Sync failed:", e.message);
  process.exit(1);
});
