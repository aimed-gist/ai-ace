#!/usr/bin/env node

/**
 * build-content.mjs
 *
 * src/content/notices/*.md    → src/data/notices-md.json
 * src/content/opportunities/*.md → src/data/opportunities-md.json
 *
 * MD 파일 형식:
 * ---
 * title: 공지 제목
 * date: 2026-05-30
 * pinned: true          # (선택) 상단 고정
 * link: https://...     # (선택) 첨부/외부 링크
 * image: /path or URL   # (선택) 대표 이미지
 * ---
 * 본문 내용 (텍스트 그대로 표시됨, whitespace preserve)
 *
 * Opportunities 전용 추가 필드:
 *   type: fellowship | position | intern | other
 *   deadline: 2026-12-31
 *   contact: 이메일 또는 URL
 *
 * 실행:
 *   node scripts/build-content.mjs
 *
 * 자동 실행: package.json 의 prebuild 훅에서 next build 이전 실행
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from "fs";
import { resolve, dirname, extname, basename } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");

const NOTICES_DIR = resolve(PROJECT_ROOT, "src", "content", "notices");
const OPPS_DIR = resolve(PROJECT_ROOT, "src", "content", "opportunities");
const OUT_NOTICES = resolve(PROJECT_ROOT, "src", "data", "notices-md.json");
const OUT_OPPS = resolve(PROJECT_ROOT, "src", "data", "opportunities-md.json");

// ───────────────────────────────────────────────────────────────
// 미니 frontmatter 파서 (외부 의존성 없이 YAML 부분만 파싱)
// ───────────────────────────────────────────────────────────────
function parseFrontmatter(raw) {
  const text = raw.replace(/^﻿/, ""); // BOM 제거
  const match = text.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, content: text.trim() };

  const yamlBlock = match[1];
  const body = match[2] || "";
  const data = {};

  for (const line of yamlBlock.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const m = line.match(/^\s*([\w-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    let value = m[2].trim();
    // 따옴표 제거
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    // 타입 변환
    if (value === "true") value = true;
    else if (value === "false") value = false;
    else if (/^-?\d+$/.test(value)) value = parseInt(value, 10);
    data[m[1]] = value;
  }
  return { data, content: body.trim() };
}

function slugify(s) {
  return String(s)
    .trim()
    .toLowerCase()
    .replace(/㈜|\(주\)/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/[\s-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
}

function normalizeDate(d) {
  if (!d) return "";
  const s = String(d).trim();
  const m = s.match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  return s;
}

// ───────────────────────────────────────────────────────────────
// 디렉토리 내 md 파일 수집
// ───────────────────────────────────────────────────────────────
function listMdFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => {
      if (!f.endsWith(".md")) return false;
      if (f.startsWith("_") || f.startsWith(".")) return false;
      if (f.toLowerCase() === "readme.md") return false; // README 자동 스킵
      return true;
    })
    .map((f) => resolve(dir, f))
    .filter((p) => statSync(p).isFile());
}

// ───────────────────────────────────────────────────────────────
// Notice MD → 뉴스 아이템 (news.json과 병합 가능한 스키마)
// ───────────────────────────────────────────────────────────────
function buildNotices() {
  const files = listMdFiles(NOTICES_DIR);
  const items = [];

  for (const filePath of files) {
    const raw = readFileSync(filePath, "utf-8");
    const { data, content } = parseFrontmatter(raw);
    const fileSlug = basename(filePath, ".md");

    if (!data.title) {
      console.log(`  ⚠️  Skip: ${fileSlug} — title 누락`);
      continue;
    }

    items.push({
      id: `notice-md-${slugify(data.title) || fileSlug}`,
      category: "notice",
      title: String(data.title),
      date: normalizeDate(data.date),
      summary: content,
      link: data.link ? String(data.link) : "",
      image: data.image ? String(data.image) : "",
      pinned: data.pinned === true,
      source: "md",
    });
    console.log(`  ✅ notice-md [${normalizeDate(data.date)}] ${data.title}${data.pinned ? " 📌" : ""}`);
  }

  return items;
}

// ───────────────────────────────────────────────────────────────
// Opportunities MD → opportunities 스키마
// ───────────────────────────────────────────────────────────────
function computeActive(deadline) {
  if (!deadline) return true; // 상시 모집
  const m = String(deadline).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return true;
  const [, y, mo, d] = m;
  const dl = new Date(Date.UTC(parseInt(y), parseInt(mo) - 1, parseInt(d), 23, 59, 59));
  return new Date() <= dl;
}

const VALID_TYPES = new Set(["fellowship", "position", "intern", "other"]);

function buildOpportunities() {
  const files = listMdFiles(OPPS_DIR);
  const items = [];

  for (const filePath of files) {
    const raw = readFileSync(filePath, "utf-8");
    const { data, content } = parseFrontmatter(raw);
    const fileSlug = basename(filePath, ".md");

    if (!data.title) {
      console.log(`  ⚠️  Skip: ${fileSlug} — title 누락`);
      continue;
    }

    const type = VALID_TYPES.has(String(data.type)) ? String(data.type) : "other";
    const deadline = normalizeDate(data.deadline);
    const active = computeActive(deadline);

    items.push({
      id: `opp-md-${slugify(data.title) || fileSlug}`,
      title: String(data.title),
      type,
      deadline,
      description: content,
      contact: data.contact ? String(data.contact) : "",
      active,
      requirements: [],
      pinned: data.pinned === true,
      source: "md",
    });
    console.log(`  ${active ? "✅" : "⏰"} opportunity-md [${type}] ${data.title}${data.pinned ? " 📌" : ""} (${deadline || "상시"})`);
  }

  return items;
}

// ───────────────────────────────────────────────────────────────
// Main
// ───────────────────────────────────────────────────────────────
function writeIfChanged(filePath, newContent) {
  let old = "";
  if (existsSync(filePath)) old = readFileSync(filePath, "utf-8");
  if (old === newContent) {
    console.log(`  (변경 없음) ${filePath}`);
    return false;
  }
  writeFileSync(filePath, newContent, "utf-8");
  console.log(`  ✅ ${filePath} 갱신됨`);
  return true;
}

function main() {
  console.log("🔄 Building MD content → JSON...\n");

  console.log("📂 Notices (src/content/notices)");
  const notices = buildNotices();
  writeIfChanged(OUT_NOTICES, JSON.stringify(notices, null, 2) + "\n");

  console.log("\n📂 Opportunities (src/content/opportunities)");
  const opps = buildOpportunities();
  writeIfChanged(OUT_OPPS, JSON.stringify(opps, null, 2) + "\n");

  console.log(`\n📊 Summary: notices=${notices.length}, opportunities=${opps.length}`);
}

main();
