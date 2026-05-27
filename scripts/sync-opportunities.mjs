#!/usr/bin/env node

/**
 * sync-opportunities.mjs
 *
 * Google Spreadsheet 'Opportunities' 탭 → opportunities.json
 *
 * 시트 컬럼:
 *   A: 제목 | B: 유형(fellowship|position|intern|other) | C: 마감일(YYYY-MM-DD)
 *   D: 본문 | E: 지원방법(이메일/URL) | F: 활성(자동)
 *
 * 동작:
 *   - 마감일 비교 기준: 오늘 00:00 KST
 *   - 마감일 > 오늘   → active = true
 *   - 마감일 ≤ 오늘   → active = false
 *   - 마감일 비어있음 → active = true (상시 모집)
 *   - 행정이 F열에 직접 FALSE 입력해두면 강제로 false 유지
 *
 * 사용법:
 *   node scripts/sync-opportunities.mjs
 */

import { writeFileSync, readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");

const SPREADSHEET_ID = "1JBb_azDOmzVl3hCfJqqAWh1sGMHCB0tGey4k_OX7agY";
const SHEET_NAME = "Opportunities";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;
const OUTPUT_PATH = resolve(PROJECT_ROOT, "src", "data", "opportunities.json");

const VALID_TYPES = new Set(["fellowship", "position", "intern", "other"]);

// 첫 컬럼 헤더가 이 값과 일치해야 우리 의도한 탭임을 확신할 수 있음.
// (gviz는 시트 이름을 못 찾을 때 첫 번째 시트를 반환하므로 헤더 검증으로 차단)
const EXPECTED_FIRST_HEADER = "제목";

// ───────────────────────────────────────────────────────────────
// CSV parser
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

function cell(row, idx) {
  return (row[idx] || "").trim();
}

function slugify(s) {
  return String(s)
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/[\s-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
}

function normalizeDate(s) {
  if (!s) return "";
  const str = String(s).trim();
  const m = str.match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})/);
  if (m) {
    const [, y, mo, d] = m;
    return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return str;
}

function parseBoolForce(s) {
  // 사용자가 F열에 직접 FALSE 입력했는지 확인
  const v = String(s || "").trim().toLowerCase();
  if (v === "false" || v === "0" || v === "no" || v === "n") return false;
  if (v === "true" || v === "1" || v === "yes" || v === "y") return true;
  return null; // 빈 값 또는 자동 판단
}

// ───────────────────────────────────────────────────────────────
// 마감일 → active 판정
// ───────────────────────────────────────────────────────────────
function computeActive(deadlineStr, forceVal) {
  // 행정이 직접 FALSE를 입력했으면 그대로 비활성
  if (forceVal === false) return false;
  // 마감일 없으면 상시 모집 → 활성
  if (!deadlineStr) return true;

  // 날짜 비교: YYYY-MM-DD 만 허용
  const m = deadlineStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) {
    // 형식이 잘못됐어도 일단 활성으로 (행정이 인지하도록)
    return true;
  }
  const [, y, mo, d] = m;
  const deadline = new Date(Date.UTC(parseInt(y), parseInt(mo) - 1, parseInt(d), 23, 59, 59));
  const now = new Date();
  return now <= deadline;
}

// ───────────────────────────────────────────────────────────────
// Main 처리
// ───────────────────────────────────────────────────────────────
async function fetchOpportunities() {
  console.log("📡 Fetching Opportunities tab...");
  const resp = await fetch(CSV_URL, { redirect: "follow" });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const rows = parseCSV(await resp.text());

  if (rows.length < 1) {
    console.log("⚠️  Opportunities 탭에 데이터가 없습니다.");
    return [];
  }

  // 헤더 검증: gviz가 다른 시트를 반환했을 가능성 차단
  const firstHeader = (rows[0][0] || "").trim();
  if (firstHeader !== EXPECTED_FIRST_HEADER) {
    console.log(`⚠️  헤더 검증 실패: 첫 헤더가 "${EXPECTED_FIRST_HEADER}"가 아니라 "${firstHeader}" 입니다.`);
    console.log(`   Opportunities 탭이 시트에 존재하지 않거나 헤더가 다릅니다.`);
    console.log(`   안전을 위해 sync를 중단합니다 (기존 opportunities.json 그대로 유지).`);
    return [];
  }

  if (rows.length < 2) {
    console.log("⚠️  Opportunities 탭에 헤더만 있고 데이터가 없습니다.");
    return [];
  }

  console.log(`📋 Headers: ${rows[0].join(" | ")}`);

  const items = [];
  const seenIds = new Set();

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const title = cell(r, 0);
    if (!title) continue;

    const typeRaw = cell(r, 1).toLowerCase();
    const type = VALID_TYPES.has(typeRaw) ? typeRaw : "other";
    const deadline = normalizeDate(cell(r, 2));
    const description = cell(r, 3);
    const contact = cell(r, 4);
    const forceVal = parseBoolForce(cell(r, 5));

    const active = computeActive(deadline, forceVal);

    const baseId = slugify(title) || `opp_${i}`;
    let id = `opp-${baseId}`;
    let suffix = 1;
    while (seenIds.has(id)) {
      id = `opp-${baseId}-${++suffix}`;
    }
    seenIds.add(id);

    items.push({
      id,
      title,
      type,
      deadline,
      description,
      contact,
      active,
      // 행정 매뉴얼용 호환 필드 (이전 스키마와 약간의 호환성)
      requirements: [],
    });

    console.log(`  ${active ? "✅" : "⏰"} [${type}] ${title.slice(0, 50)} (마감: ${deadline || "상시"}, 활성: ${active})`);
  }

  return items;
}

function sortItems(items) {
  // 활성 우선, 마감일 임박 순
  return items.sort((a, b) => {
    if (a.active !== b.active) return a.active ? -1 : 1;
    const da = a.deadline || "9999-12-31";
    const db = b.deadline || "9999-12-31";
    return da.localeCompare(db);
  });
}

async function main() {
  console.log("🔄 Syncing opportunities from Google Spreadsheet...\n");

  let items = [];
  try {
    items = await fetchOpportunities();
  } catch (e) {
    console.log(`⚠️  Opportunities 탭 가져오기 실패: ${e.message}`);
  }

  if (items.length === 0) {
    console.log("\n⚠️  No items found. Keeping existing data to avoid accidental wipe.");
    return;
  }

  const sorted = sortItems(items);

  let existing = "";
  if (existsSync(OUTPUT_PATH)) existing = readFileSync(OUTPUT_PATH, "utf-8");
  const newJson = JSON.stringify(sorted, null, 2) + "\n";

  if (existing === newJson) {
    console.log("\n✅ No changes detected.");
    return;
  }

  writeFileSync(OUTPUT_PATH, newJson, "utf-8");
  console.log(`\n✅ Updated ${OUTPUT_PATH}`);
  console.log(`   Total: ${sorted.length}, Active: ${sorted.filter((x) => x.active).length}`);
}

main().catch((e) => {
  console.error("❌ Sync failed:", e.message);
  process.exit(1);
});
