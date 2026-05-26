#!/usr/bin/env node

/**
 * sync-partners.mjs
 *
 * Google Spreadsheet 'Partners' 탭 → partners.json + 로고 이미지 다운로드
 *
 * 시트 컬럼:
 *   A: 이름 | B: 유형(university|industry) | C: 웹사이트 | D: 로고(URL or Google Drive)
 *
 * 동작:
 *   - 시트 CSV 다운로드
 *   - 로고 URL이 있으면 public/images/partners/ 로 다운로드
 *   - 로고 비어있으면 placeholder.svg 폴백
 *   - partners.json 작성
 *
 * 사용법:
 *   node scripts/sync-partners.mjs
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { resolve, dirname, extname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");

// ───────────────────────────────────────────────────────────────
// 설정
// ───────────────────────────────────────────────────────────────
const SPREADSHEET_ID = "1JBb_azDOmzVl3hCfJqqAWh1sGMHCB0tGey4k_OX7agY";
const SHEET_NAME = "Partners";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;

const OUTPUT_PATH = resolve(PROJECT_ROOT, "src", "data", "partners.json");
const LOGOS_DIR = resolve(PROJECT_ROOT, "public", "images", "partners");
const PLACEHOLDER = "/images/partners/placeholder.svg";

// ───────────────────────────────────────────────────────────────
// CSV 파서 (sync-members.mjs와 동일)
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

// ───────────────────────────────────────────────────────────────
// 헬퍼
// ───────────────────────────────────────────────────────────────
/**
 * 회사명을 파일명 안전한 슬러그로 변환.
 * 한글/일어/중국어 등 유니코드 문자는 보존 (GitHub Pages는 한글 URL 지원).
 *  예) "㈜티쓰리큐"         → "티쓰리큐"
 *      "CJ 올리브네트웍스"   → "cj_올리브네트웍스"
 *      "ThermoFisher 전자현미경 사업부" → "thermofisher_전자현미경_사업부"
 */
function slugify(s) {
  return String(s)
    .trim()
    .toLowerCase()
    // 한국 회사 접두사/괄호 제거
    .replace(/㈜|\(주\)|\(社\)/g, "")
    // 유니코드 문자(\p{L}: letter)와 숫자(\p{N})만 허용, 그 외 공백/하이픈만 보존
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/[\s-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
}

/**
 * Google Drive 공유 링크 → 직접 다운로드 URL 변환
 */
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

/**
 * 로고 이미지 다운로드
 * @returns 로컬 경로 (예: "/images/partners/kaist.png") 또는 null
 */
async function downloadLogo(url, name) {
  if (!url || !(url.startsWith("http://") || url.startsWith("https://"))) {
    return null;
  }
  mkdirSync(LOGOS_DIR, { recursive: true });

  const base = slugify(name);
  if (!base) {
    console.log(`    ⚠️  Cannot generate filename for: ${name}`);
    return null;
  }

  try {
    const directUrl = toDirectUrl(url);
    const response = await fetch(directUrl, { redirect: "follow" });
    if (!response.ok) {
      console.log(`    ⚠️  Logo download failed (${response.status}): ${name}`);
      return null;
    }

    // 확장자 결정
    const contentType = response.headers.get("content-type") || "";
    let ext = "png";
    if (contentType.includes("svg")) ext = "svg";
    else if (contentType.includes("jpeg") || contentType.includes("jpg")) ext = "jpg";
    else if (contentType.includes("webp")) ext = "webp";
    else if (contentType.includes("png")) ext = "png";
    else {
      const urlExt = extname(new URL(directUrl).pathname).replace(".", "").toLowerCase();
      if (["png", "jpg", "jpeg", "svg", "webp"].includes(urlExt)) {
        ext = urlExt === "jpeg" ? "jpg" : urlExt;
      }
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const filename = `${base}.${ext}`;
    const filePath = resolve(LOGOS_DIR, filename);
    writeFileSync(filePath, buffer);

    console.log(`    🖼️  Downloaded: ${filename} (${(buffer.length / 1024).toFixed(1)}KB)`);
    return `/images/partners/${filename}`;
  } catch (err) {
    console.log(`    ⚠️  Logo download error for ${name}: ${err.message}`);
    return null;
  }
}

/**
 * 로고 경로 결정: URL이면 다운로드, 비어있으면 기존 로컬 파일 검색, 그래도 없으면 placeholder
 */
async function getLogoPath(name, logoUrl) {
  if (logoUrl) {
    const downloaded = await downloadLogo(logoUrl, name);
    if (downloaded) return downloaded;
  }

  // 기존 로컬 파일 폴백 (재실행 시 placeholder로 떨어뜨리지 않기 위함)
  const base = slugify(name);
  if (base) {
    const exts = ["png", "svg", "jpg", "webp"];
    for (const ext of exts) {
      const p = resolve(LOGOS_DIR, `${base}.${ext}`);
      if (existsSync(p)) return `/images/partners/${base}.${ext}`;
    }
  }

  return PLACEHOLDER;
}

// ───────────────────────────────────────────────────────────────
// 메인 처리
// ───────────────────────────────────────────────────────────────
async function fetchPartners() {
  console.log("📡 Fetching Partners tab...");
  const response = await fetch(CSV_URL, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(`Failed to fetch sheet: ${response.status} ${response.statusText}`);
  }
  const text = await response.text();
  const rows = parseCSV(text);

  if (rows.length < 2) {
    console.log("⚠️  Partners 탭에 데이터가 없습니다.");
    return [];
  }

  const headers = rows[0];
  console.log(`📋 Headers: ${headers.join(" | ")}`);
  console.log(`📊 Data rows: ${rows.length - 1}`);

  const partners = [];
  const seenIds = new Set();

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const name = (row[0] || "").trim();
    if (!name) continue;

    const typeRaw = (row[1] || "").trim().toLowerCase();
    const url = (row[2] || "").trim();
    const logoUrl = (row[3] || "").trim();

    // 유형 검증 (university / industry 외에는 일단 그대로 보존, 페이지 필터에서 처리)
    const type = typeRaw || "industry";

    const baseId = slugify(name) || `partner_${i}`;
    let id = `partner-${baseId}`;
    let suffix = 1;
    while (seenIds.has(id)) {
      id = `partner-${baseId}-${++suffix}`;
    }
    seenIds.add(id);

    const logo = await getLogoPath(name, logoUrl);

    partners.push({ id, name, type, logo, url });
    console.log(`  ✅ ${name} [${type}]`);
  }

  return partners;
}

// ───────────────────────────────────────────────────────────────
// 정렬: 유형(university 먼저) → 이름
// ───────────────────────────────────────────────────────────────
function sortPartners(arr) {
  const order = { university: 0, industry: 1 };
  return arr.sort((a, b) => {
    const ao = order[a.type] ?? 99;
    const bo = order[b.type] ?? 99;
    if (ao !== bo) return ao - bo;
    return a.name.localeCompare(b.name);
  });
}

// ───────────────────────────────────────────────────────────────
// Main
// ───────────────────────────────────────────────────────────────
async function main() {
  try {
    console.log("🔄 Syncing partners from Google Spreadsheet...\n");

    let partners = [];
    try {
      partners = await fetchPartners();
    } catch (e) {
      console.log(`⚠️  Partners 탭을 가져올 수 없습니다: ${e.message}`);
    }

    if (partners.length === 0) {
      console.log("\n⚠️  No partners found. Keeping existing data to avoid accidental wipe.");
      return;
    }

    const sorted = sortPartners(partners);

    // 기존 데이터와 비교 (변경 없으면 안 씀)
    let existing = "";
    if (existsSync(OUTPUT_PATH)) {
      existing = readFileSync(OUTPUT_PATH, "utf-8");
    }
    const newJson = JSON.stringify(sorted, null, 2) + "\n";
    if (existing === newJson) {
      console.log("\n✅ No changes detected. partners.json is up to date.");
      return;
    }

    writeFileSync(OUTPUT_PATH, newJson, "utf-8");
    console.log(`\n✅ Updated ${OUTPUT_PATH}`);
    console.log(`   Total partners: ${sorted.length}`);
    const breakdown = {};
    sorted.forEach((p) => {
      breakdown[p.type] = (breakdown[p.type] || 0) + 1;
    });
    console.log(`   Breakdown: ${Object.entries(breakdown).map(([k, v]) => `${k}: ${v}`).join(", ")}`);
  } catch (error) {
    console.error("❌ Sync failed:", error.message);
    process.exit(1);
  }
}

main();
