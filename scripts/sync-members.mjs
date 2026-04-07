#!/usr/bin/env node

/**
 * sync-members.mjs
 *
 * Google Spreadsheet → members.json 자동 동기화 스크립트
 *
 * 스프레드시트 컬럼 (순서대로):
 *   이름(영어) | 이름(한글) | 소속 | 역할 | 직위 | 이메일 | 웹사이트 | 사진 | 세부분과
 *
 * 사진 파일명 규칙:
 *   영문명 → 소문자 + 공백→언더스코어 + .jpg
 *   예: "Eunji Lee" → eunji_lee.jpg
 *   파일 위치: public/images/members/
 *
 * 사용법:
 *   node scripts/sync-members.mjs
 */

import { writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve, dirname, extname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");

// Google Spreadsheet CSV export URL
const SPREADSHEET_ID = "1JBb_azDOmzVl3hCfJqqAWh1sGMHCB0tGey4k_OX7agY";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv`;

// Valid roles
const VALID_ROLES = ["mentor", "global_mentor", "fellow", "alumni"];

// Map spreadsheet role text → internal role key
const ROLE_MAP = {
  mentor: "mentor",
  "global mentor": "global_mentor",
  fellow: "fellow",
  alumni: "alumni",
};

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
 * Convert Google Drive share URL to direct download URL
 * Supports:
 *   https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 *   https://drive.google.com/open?id=FILE_ID
 */
function toDirectUrl(url) {
  // Google Drive file link
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch) {
    return `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
  }
  // Google Drive open link
  const openMatch = url.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (openMatch) {
    return `https://drive.google.com/uc?export=download&id=${openMatch[1]}`;
  }
  // Already a direct URL
  return url;
}

/**
 * Download image from URL and save to public/images/members/
 * Returns the local path on success, null on failure
 */
async function downloadPhoto(url, nameEn) {
  const base = nameToFilename(nameEn);
  const membersDir = resolve(PROJECT_ROOT, "public", "images", "members");
  mkdirSync(membersDir, { recursive: true });

  try {
    const directUrl = toDirectUrl(url);
    const response = await fetch(directUrl, { redirect: "follow" });
    if (!response.ok) {
      console.log(`    ⚠️  Photo download failed (${response.status}): ${nameEn}`);
      return null;
    }

    // Determine extension from content-type or URL
    const contentType = response.headers.get("content-type") || "";
    let ext = "jpg";
    if (contentType.includes("png")) ext = "png";
    else if (contentType.includes("webp")) ext = "webp";
    else if (contentType.includes("gif")) ext = "gif";
    else {
      // Try from URL
      const urlExt = extname(new URL(directUrl).pathname).replace(".", "").toLowerCase();
      if (["jpg", "jpeg", "png", "webp", "gif"].includes(urlExt)) {
        ext = urlExt === "jpeg" ? "jpg" : urlExt;
      }
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const filename = `${base}.${ext}`;
    const filePath = resolve(membersDir, filename);
    writeFileSync(filePath, buffer);

    console.log(`    📸 Downloaded: ${filename} (${(buffer.length / 1024).toFixed(1)}KB)`);
    return `/images/members/${filename}`;
  } catch (err) {
    console.log(`    ⚠️  Photo download error for ${nameEn}: ${err.message}`);
    return null;
  }
}

/**
 * Get photo path: download from URL if provided, otherwise check local files
 */
async function getPhotoPath(nameEn, photoUrl) {
  // If a URL is provided in the spreadsheet, download it
  if (photoUrl && (photoUrl.startsWith("http://") || photoUrl.startsWith("https://"))) {
    const downloaded = await downloadPhoto(photoUrl, nameEn);
    if (downloaded) return downloaded;
  }

  // Fallback: check if a local file already exists
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

  // Column order: 이름(영어) | 이름(한글) | 소속 | 역할 | 직위 | 이메일 | 웹사이트 | 사진 | 세부분과
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const nameEn = (row[0] || "").trim();

    // Skip empty rows
    if (!nameEn) continue;

    const nameKo = (row[1] || "").trim();
    const affiliation = (row[2] || "").trim();
    const roleRaw = (row[3] || "Mentor").trim().toLowerCase();
    const title = (row[4] || "").trim();
    const email = (row[5] || "").trim();
    const website = (row[6] || "").trim();
    const photoUrl = (row[7] || "").trim();
    const specialty = (row[8] || "").trim();

    // Map role text to internal key
    const role = ROLE_MAP[roleRaw] || "mentor";

    // Build research tags from specialty (split by comma)
    const research = specialty
      ? specialty.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    // Download photo if URL provided, otherwise check local files
    const image = await getPhotoPath(nameEn, photoUrl);

    const member = {
      id: `${role}-${nameToFilename(nameEn)}`,
      name: nameKo,
      nameEn,
      role,
      title,
      affiliation,
      image,
      email,
      website,
      research,
      bio: "",
    };

    members.push(member);
    console.log(`  ✅ ${nameEn} (${nameKo}) [${role}] — ${affiliation}`);
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
