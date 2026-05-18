#!/usr/bin/env node

/**
 * sync-publications.mjs
 *
 * Google Spreadsheet (Publications + Patents 탭) → papers.json 자동 동기화 스크립트
 *
 * 시트 컬럼:
 *   [Publications 탭]
 *     A: DOI | B: 제출 PI | C: 분과 | D: 유형(publication|preprint)
 *     E: Featured | F: 비고 | G: 제목 | H: 저자 | I: 저널 | J: 연도
 *     K: 상태 | L: 마지막 동기화
 *
 *   [Patents 탭]
 *     A: 특허명 | B: 발명자 | C: 출원/등록번호 | D: 국가 | E: 상태
 *     F: 연도 | G: 제출 PI | H: 분과 | I: 비고
 *
 * 동작:
 *   - 시트의 두 탭을 CSV로 읽어옴
 *   - Publications: K열(상태)이 OK 또는 manual인 행만 포함
 *   - Patents: 특허명이 있는 모든 행 포함
 *   - papers.json 출력 (기존 페이지가 사용하는 스키마 유지 + 신규 필드 추가)
 *
 * 사용법:
 *   node scripts/sync-publications.mjs
 */

import { writeFileSync, readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");

// ───────────────────────────────────────────────────────────────
// 설정
// ───────────────────────────────────────────────────────────────
const SPREADSHEET_ID = "1JBb_azDOmzVl3hCfJqqAWh1sGMHCB0tGey4k_OX7agY";

// gviz CSV endpoint (sheet name으로 접근, gid 불필요)
function sheetCsvUrl(sheetName) {
  return `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
}

const OUTPUT_PATH = resolve(PROJECT_ROOT, "src", "data", "papers.json");

// 시트 상태 → 처리 정책
const ALLOWED_STATUSES = new Set(["ok", "manual"]); // 소문자 비교

// ───────────────────────────────────────────────────────────────
// CSV 파서 (sync-members.mjs와 동일한 구현)
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

async function fetchSheet(sheetName) {
  const url = sheetCsvUrl(sheetName);
  console.log(`📡 Fetching tab: ${sheetName}`);
  const resp = await fetch(url, { redirect: "follow" });
  if (!resp.ok) {
    throw new Error(`Failed to fetch "${sheetName}": HTTP ${resp.status}`);
  }
  const text = await resp.text();
  return parseCSV(text);
}

// ───────────────────────────────────────────────────────────────
// 헬퍼
// ───────────────────────────────────────────────────────────────
function cell(row, idx) {
  return (row[idx] || "").trim();
}

function parseAuthors(s) {
  if (!s) return [];
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function parseFeatured(s) {
  const v = String(s || "").trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes" || v === "y";
}

function parseYear(s) {
  if (!s) return null;
  const n = parseInt(String(s).trim(), 10);
  return Number.isFinite(n) ? n : null;
}

// ───────────────────────────────────────────────────────────────
// Publications 변환
// ───────────────────────────────────────────────────────────────
function parsePublications(rows) {
  if (rows.length < 2) {
    console.log("⚠️  Publications 탭에 데이터가 없습니다.");
    return [];
  }
  const headers = rows[0];
  console.log(`📋 Publications headers: ${headers.join(" | ")}`);

  const seenDois = new Set();
  const items = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const doi = cell(row, 0);
    if (!doi) continue;

    // 상태 컬럼 검사 (K = index 10)
    const status = cell(row, 10).toLowerCase();
    if (!ALLOWED_STATUSES.has(status)) {
      console.log(`  ⏭️  Skip [${doi}] status="${status}"`);
      continue;
    }

    // 중복 DOI
    const doiLower = doi.toLowerCase();
    if (seenDois.has(doiLower)) {
      console.log(`  ⚠️  Duplicate DOI skipped: ${doi}`);
      continue;
    }
    seenDois.add(doiLower);

    const pi = cell(row, 1);
    const division = cell(row, 2);
    const typeRaw = cell(row, 3).toLowerCase();
    const featured = parseFeatured(cell(row, 4));
    const note = cell(row, 5);
    const title = cell(row, 6);
    const authorsRaw = cell(row, 7);
    const journal = cell(row, 8);
    const year = parseYear(cell(row, 9));

    if (!title) {
      console.log(`  ⚠️  Skip [${doi}] — 제목 비어있음 (상태=${status})`);
      continue;
    }

    const type = typeRaw === "preprint" ? "preprint" : "publication";

    items.push({
      id: `${type}-${slugify(doi) || slugify(title) || String(i)}`,
      title,
      authors: parseAuthors(authorsRaw),
      journal,
      year,
      doi,
      type,
      pi,
      division,
      featured,
      note,
      abstract: "",
    });

    console.log(`  ✅ ${type} [${year}] ${title.slice(0, 60)}${title.length > 60 ? "…" : ""}`);
  }

  return items;
}

// ───────────────────────────────────────────────────────────────
// Patents 변환
// ───────────────────────────────────────────────────────────────
function parsePatents(rows) {
  if (rows.length < 2) {
    console.log("⚠️  Patents 탭에 데이터가 없습니다.");
    return [];
  }
  const headers = rows[0];
  console.log(`📋 Patents headers: ${headers.join(" | ")}`);

  const items = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const title = cell(row, 0);
    if (!title) continue;

    const inventorsRaw = cell(row, 1);
    const number = cell(row, 2);
    const country = cell(row, 3);
    const status = cell(row, 4);
    const year = parseYear(cell(row, 5));
    const pi = cell(row, 6);
    const division = cell(row, 7);
    const note = cell(row, 8);

    items.push({
      id: `patent-${slugify(number) || slugify(title) || String(i)}`,
      title,
      authors: parseAuthors(inventorsRaw),
      journal: number ? `${country ? country + " " : ""}${number}${status ? " (" + status + ")" : ""}`.trim() : "",
      year,
      doi: number,
      type: "patent",
      pi,
      division,
      featured: false,
      note,
      abstract: "",
    });

    console.log(`  ✅ patent [${year}] ${title.slice(0, 60)}${title.length > 60 ? "…" : ""}`);
  }

  return items;
}

// ───────────────────────────────────────────────────────────────
// 정렬: featured 우선 → 연도 내림차순 → 제목
// ───────────────────────────────────────────────────────────────
function sortItems(items) {
  return items.sort((a, b) => {
    if ((b.featured ? 1 : 0) !== (a.featured ? 1 : 0)) {
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    }
    const ya = a.year || 0;
    const yb = b.year || 0;
    if (yb !== ya) return yb - ya;
    return a.title.localeCompare(b.title);
  });
}

// ───────────────────────────────────────────────────────────────
// Main
// ───────────────────────────────────────────────────────────────
async function main() {
  try {
    console.log("🔄 Syncing publications & patents from Google Spreadsheet...\n");

    let pubRows = [];
    let patRows = [];

    try {
      pubRows = await fetchSheet("Publications");
    } catch (e) {
      console.log(`⚠️  Publications 탭을 가져올 수 없습니다: ${e.message}`);
    }

    try {
      patRows = await fetchSheet("Patents");
    } catch (e) {
      console.log(`⚠️  Patents 탭을 가져올 수 없습니다: ${e.message}`);
    }

    const publications = parsePublications(pubRows);
    const patents = parsePatents(patRows);

    const all = sortItems([...publications, ...patents]);

    // 기존 데이터와 비교 (변경 없으면 파일 안 씀)
    let existing = "";
    if (existsSync(OUTPUT_PATH)) {
      existing = readFileSync(OUTPUT_PATH, "utf-8");
    }
    const newJson = JSON.stringify(all, null, 2) + "\n";

    if (existing === newJson) {
      console.log("\n✅ No changes detected. papers.json is up to date.");
      return;
    }

    if (all.length === 0) {
      console.log("\n⚠️  No items found. Keeping existing data to avoid accidental wipe.");
      return;
    }

    writeFileSync(OUTPUT_PATH, newJson, "utf-8");
    console.log(`\n✅ Updated ${OUTPUT_PATH}`);
    console.log(`   Publications: ${publications.length}`);
    console.log(`   Patents:      ${patents.length}`);
    console.log(`   Total:        ${all.length}`);
  } catch (error) {
    console.error("❌ Sync failed:", error.message);
    process.exit(1);
  }
}

main();
