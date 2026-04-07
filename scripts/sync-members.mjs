#!/usr/bin/env node

/**
 * sync-members.mjs
 *
 * Google Spreadsheet → members.json 자동 동기화 스크립트
 *
 * 스프레드시트 컬럼 (순서대로):
 *   이름 | 소속 | 직위 | 이메일 | 웹사이트 | 사진 | 세부분과 | 역할
 *
 * 사진 파일명 규칙:
 *   영문명 → 소문자 + 공백→언더스코어 + .jpg
 *   예: "Eunji Lee" → eunji_lee.jpg
 *   파일 위치: public/images/members/
 *
 * 사용법:
 *   node scripts/sync-members.mjs
 */

import { writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");

// Google Spreadsheet CSV export URL
const SPREADSHEET_ID = "1JBb_azDOmzVl3hCfJqqAWh1sGMHCB0tGey4k_OX7agY";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv`;

// Valid roles
const VALID_ROLES = ["mentor", "global_mentor", "fellow", "alumni"];

/**
 * Simple CSV parser (handles quoted fields with commas)
 */
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
 * Convert English name to image filename
 * "Eunji Lee" → "eunji_lee"
 */
function nameToFilename(nameEn) {
  return nameEn
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "_");
}

/**
 * Check if photo file exists in public/images/members/
 */
function getPhotoPath(nameEn) {
  const base = nameToFilename(nameEn);
  const extensions = ["jpg", "jpeg", "png", "webp"];

  for (const ext of extensions) {
    const filePath = resolve(PROJECT_ROOT, "public", "images", "members", `${base}.${ext}`);
    if (existsSync(filePath)) {
      return `/images/members/${base}.${ext}`;
    }
  }
  return "/images/members/placeholder.svg";
}

/**
 * Fetch and parse the spreadsheet
 */
async function fetchSpreadsheet() {
  console.log("📡 Fetching spreadsheet...");

  const response = await fetch(CSV_URL, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(`Failed to fetch spreadsheet: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  const rows = parseCSV(text);

  if (rows.length < 2) {
    throw new Error("Spreadsheet has no data rows");
  }

  // First row is headers
  const headers = rows[0];
  console.log(`📋 Headers: ${headers.join(" | ")}`);
  console.log(`📊 Data rows: ${rows.length - 1}`);

  const members = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const nameEn = (row[0] || "").trim();

    // Skip empty rows
    if (!nameEn) continue;

    const affiliation = (row[1] || "").trim();
    const title = (row[2] || "").trim();
    const email = (row[3] || "").trim();
    const website = (row[4] || "").trim();
    // row[5] = 사진 (unused, we use filename convention)
    const specialty = (row[6] || "").trim();
    const roleRaw = (row[7] || "mentor").trim().toLowerCase();

    // Validate role
    const role = VALID_ROLES.includes(roleRaw) ? roleRaw : "mentor";

    // Build research tags from specialty (split by comma)
    const research = specialty
      ? specialty.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    // Generate Korean name placeholder (empty if not in spreadsheet)
    const name = "";

    const member = {
      id: `${role}-${nameToFilename(nameEn)}`,
      name,
      nameEn,
      role,
      title,
      affiliation,
      image: getPhotoPath(nameEn),
      email,
      website,
      research,
      bio: "",
    };

    members.push(member);
    console.log(`  ✅ ${nameEn} (${role}) — ${affiliation}`);
  }

  return members;
}

/**
 * Main
 */
async function main() {
  try {
    console.log("🔄 Syncing members from Google Spreadsheet...\n");

    const members = await fetchSpreadsheet();

    if (members.length === 0) {
      console.log("\n⚠️  No members found. Keeping existing data.");
      return;
    }

    // Sort: mentors first, then global_mentors, fellows, alumni
    const roleOrder = { mentor: 0, global_mentor: 1, fellow: 2, alumni: 3 };
    members.sort((a, b) => (roleOrder[a.role] ?? 99) - (roleOrder[b.role] ?? 99));

    // Write to members.json
    const outputPath = resolve(PROJECT_ROOT, "src", "data", "members.json");
    writeFileSync(outputPath, JSON.stringify(members, null, 2) + "\n", "utf-8");

    console.log(`\n✅ Updated ${outputPath}`);
    console.log(`   Total members: ${members.length}`);

    const summary = VALID_ROLES.map(
      (r) => `${r}: ${members.filter((m) => m.role === r).length}`
    );
    console.log(`   Breakdown: ${summary.join(", ")}`);
  } catch (error) {
    console.error("❌ Sync failed:", error.message);
    process.exit(1);
  }
}

main();
