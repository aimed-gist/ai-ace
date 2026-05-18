/**
 * AI-ACE@GIST — Publications Auto-Fill (Google Apps Script)
 *
 * 동작:
 *   1. Publications 탭의 A열(DOI)에 값이 입력/변경되면 즉시 Crossref API를 호출하여
 *      G(제목), H(저자), I(저널), J(연도) 컬럼을 자동으로 채웁니다.
 *   2. 상단 메뉴 "📚 Publications" 에서 일괄 새로고침 / 선택 행 새로고침 가능.
 *
 * 시트 구조 가정 (Publications 탭):
 *   A: DOI | B: 제출 PI | C: 분과 | D: 유형 | E: Featured | F: 비고
 *   G: 제목 | H: 저자 | I: 저널 | J: 연도 | K: 상태 | L: 마지막 동기화
 *
 * 설치:
 *   1. 시트 메뉴 → 확장 프로그램 → Apps Script
 *   2. 이 파일 전체를 복사해서 Code.gs 에 붙여넣기
 *   3. 저장 (디스크 아이콘) → "프로젝트 이름 변경" 시 "AI-ACE Publications" 등으로 지정
 *   4. 트리거 설정: 시계 아이콘 → "트리거 추가"
 *      - 실행할 함수: onEditTrigger
 *      - 배포: Head
 *      - 이벤트 소스: 스프레드시트에서
 *      - 이벤트 유형: 수정 시
 *      - (저장 시 권한 승인 1회 필요)
 *   5. 시트 새로고침 → 상단에 "📚 Publications" 메뉴가 나타나면 성공
 *
 * 디버깅:
 *   메뉴 → "📚 Publications" → "❓ 사용법" 또는
 *   Apps Script 편집기 → "실행" 버튼으로 testFetchSingle() 실행
 */

// ─────────────────────────────────────────────────────────────
// 설정
// ─────────────────────────────────────────────────────────────
const SHEET_NAME = "Publications";
const COL = {
  DOI: 1,            // A
  PI: 2,             // B
  DIVISION: 3,       // C
  TYPE: 4,           // D
  FEATURED: 5,       // E
  NOTE: 6,           // F
  TITLE: 7,          // G
  AUTHORS: 8,        // H
  JOURNAL: 9,        // I
  YEAR: 10,          // J
  STATUS: 11,        // K
  SYNCED_AT: 12,     // L
};
const HEADER_ROW = 1;
const CROSSREF_BASE = "https://api.crossref.org/works/";
const CROSSREF_MAILTO = "ai-ace-webmaster@gist.ac.kr"; // Crossref "polite" pool 등록용
const STATUS = {
  OK: "OK",
  NOT_FOUND: "DOI 없음",
  ERROR: "Error",
  MANUAL: "manual",
  EMPTY: "",
};

// ─────────────────────────────────────────────────────────────
// 메뉴 등록 (시트 열릴 때 자동)
// ─────────────────────────────────────────────────────────────
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("📚 Publications")
    .addItem("📥 선택한 행 새로고침", "refreshSelectedRows")
    .addItem("🔄 전체 새로고침 (DOI 있는 모든 행)", "refreshAllRows")
    .addSeparator()
    .addItem("❓ 사용법", "showHelp")
    .addToUi();
}

// ─────────────────────────────────────────────────────────────
// onEdit 트리거 (설치형 트리거에서 호출)
// ─────────────────────────────────────────────────────────────
function onEditTrigger(e) {
  if (!e || !e.range) return;
  const sheet = e.range.getSheet();
  if (sheet.getName() !== SHEET_NAME) return;

  const range = e.range;
  const row = range.getRow();
  const col = range.getColumn();

  // 헤더 행 스킵
  if (row <= HEADER_ROW) return;

  // DOI 컬럼이 변경된 경우만 처리 (단일 셀 또는 다중 셀 붙여넣기 모두 대응)
  const startCol = col;
  const endCol = col + range.getNumColumns() - 1;
  if (startCol > COL.DOI || endCol < COL.DOI) return;

  // 다중 행 붙여넣기 대응
  const startRow = row;
  const endRow = row + range.getNumRows() - 1;

  for (let r = startRow; r <= endRow; r++) {
    fillRow_(sheet, r);
  }
}

// ─────────────────────────────────────────────────────────────
// 메뉴 액션
// ─────────────────────────────────────────────────────────────
function refreshSelectedRows() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    SpreadsheetApp.getUi().alert("Publications 탭을 찾을 수 없습니다.");
    return;
  }
  const activeSheet = SpreadsheetApp.getActiveSheet();
  if (activeSheet.getName() !== SHEET_NAME) {
    SpreadsheetApp.getUi().alert("Publications 탭에서 행을 선택한 후 실행해주세요.");
    return;
  }
  const ranges = activeSheet.getActiveRangeList()
    ? activeSheet.getActiveRangeList().getRanges()
    : [activeSheet.getActiveRange()];

  const rowsToProcess = new Set();
  ranges.forEach((r) => {
    const startRow = r.getRow();
    const endRow = startRow + r.getNumRows() - 1;
    for (let row = startRow; row <= endRow; row++) {
      if (row > HEADER_ROW) rowsToProcess.add(row);
    }
  });

  if (rowsToProcess.size === 0) {
    SpreadsheetApp.getUi().alert("선택된 행이 없습니다.");
    return;
  }

  let ok = 0, err = 0;
  rowsToProcess.forEach((row) => {
    const result = fillRow_(sheet, row);
    if (result === "ok") ok++;
    else if (result === "err") err++;
  });

  SpreadsheetApp.getUi().alert(
    `새로고침 완료\n  성공: ${ok}\n  실패: ${err}\n  건너뜀: ${rowsToProcess.size - ok - err}`
  );
}

function refreshAllRows() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    SpreadsheetApp.getUi().alert("Publications 탭을 찾을 수 없습니다.");
    return;
  }
  const lastRow = sheet.getLastRow();
  if (lastRow <= HEADER_ROW) {
    SpreadsheetApp.getUi().alert("데이터가 없습니다.");
    return;
  }

  const confirm = SpreadsheetApp.getUi().alert(
    "전체 새로고침",
    `DOI가 입력된 모든 행 (최대 ${lastRow - HEADER_ROW}개)을 다시 가져옵니다.\n계속하시겠습니까?`,
    SpreadsheetApp.getUi().ButtonSet.OK_CANCEL
  );
  if (confirm !== SpreadsheetApp.getUi().Button.OK) return;

  let ok = 0, err = 0, skipped = 0;
  for (let row = HEADER_ROW + 1; row <= lastRow; row++) {
    const result = fillRow_(sheet, row);
    if (result === "ok") ok++;
    else if (result === "err") err++;
    else skipped++;
    // Crossref polite rate (안전마진 — 50 req/s 한도, 우리는 훨씬 느림)
    Utilities.sleep(150);
  }

  SpreadsheetApp.getUi().alert(
    `전체 새로고침 완료\n  성공: ${ok}\n  실패: ${err}\n  건너뜀(DOI없음/manual): ${skipped}`
  );
}

function showHelp() {
  const html = HtmlService.createHtmlOutput(`
    <div style="font-family: -apple-system, sans-serif; padding: 16px; line-height: 1.6; font-size: 13px;">
      <h3>📚 Publications 시트 사용법</h3>
      <h4>새 논문 추가</h4>
      <ol>
        <li>A열에 <b>DOI</b>를 붙여넣습니다. (예: <code>10.1038/s41586-024-12345-6</code>)</li>
        <li>B열에서 <b>제출 PI</b>를 선택합니다.</li>
        <li>C열에서 <b>분과</b>를 선택합니다. (선택사항)</li>
        <li>D열에서 <b>유형</b>을 선택합니다. (publication / preprint)</li>
        <li>잠시 후 G~J열에 제목/저자/저널/연도가 자동으로 채워집니다.</li>
        <li>K열 <b>상태</b>가 "OK"인지 확인합니다.</li>
      </ol>
      <h4>상태 컬럼(K) 의미</h4>
      <ul>
        <li><b>OK</b> — 정상적으로 가져왔습니다.</li>
        <li><b>DOI 없음</b> — Crossref에 등록되지 않은 DOI입니다. DOI를 다시 확인하거나, G~J 열에 직접 입력해도 됩니다.</li>
        <li><b>Error</b> — 일시적 오류입니다. 메뉴의 "선택한 행 새로고침"으로 재시도하세요.</li>
        <li><b>manual</b> — 수동 입력으로 표시된 행입니다. 자동 새로고침이 이 행을 덮어쓰지 않습니다.</li>
      </ul>
      <h4>수동 수정</h4>
      <p>자동으로 채워진 G~J열을 직접 수정할 수 있습니다. 수정 후 K열을 "manual"로 바꾸면 이후 새로고침에서 덮어쓰지 않습니다.</p>
      <h4>일괄 새로고침</h4>
      <p>메뉴 "📚 Publications" → "🔄 전체 새로고침"으로 모든 행을 다시 가져올 수 있습니다.</p>
    </div>
  `).setWidth(500).setHeight(500);
  SpreadsheetApp.getUi().showModalDialog(html, "Publications 사용법");
}

// ─────────────────────────────────────────────────────────────
// 핵심 로직: 한 행을 채우기
// ─────────────────────────────────────────────────────────────
/**
 * @returns "ok" | "err" | "skip"
 */
function fillRow_(sheet, row) {
  const doiCell = sheet.getRange(row, COL.DOI);
  const rawDoi = String(doiCell.getValue() || "").trim();
  const statusCell = sheet.getRange(row, COL.STATUS);
  const currentStatus = String(statusCell.getValue() || "").trim().toLowerCase();

  // DOI 없으면 스킵 (단, 기존 상태 청소)
  if (!rawDoi) {
    if (currentStatus) {
      // 빈 DOI는 상태도 비우기
      sheet.getRange(row, COL.STATUS).setValue("");
      sheet.getRange(row, COL.SYNCED_AT).setValue("");
    }
    return "skip";
  }

  // manual 표시된 행은 건드리지 않음
  if (currentStatus === STATUS.MANUAL.toLowerCase()) {
    return "skip";
  }

  // DOI 정규화
  const doi = normalizeDoi_(rawDoi);
  if (!doi) {
    writeStatus_(sheet, row, STATUS.NOT_FOUND, "DOI 형식이 올바르지 않습니다");
    return "err";
  }

  // 정규화된 DOI를 셀에 되돌려 저장 (사용자가 URL을 붙여넣은 경우 정리)
  if (doi !== rawDoi) {
    // 트리거 재호출 방지: 같은 셀을 다시 쓰지만 값이 변경되면 onEdit이 다시 호출됨.
    // 무한루프 방지를 위해 정규화된 DOI가 다를 때만 업데이트하고, 그 다음 호출은 같은 값이므로 즉시 종료됨.
    doiCell.setValue(doi);
  }

  // Crossref 호출
  let meta;
  try {
    meta = fetchCrossref_(doi);
  } catch (e) {
    writeStatus_(sheet, row, STATUS.ERROR, String(e).slice(0, 100));
    return "err";
  }

  if (!meta) {
    writeStatus_(sheet, row, STATUS.NOT_FOUND, "Crossref에서 찾을 수 없음");
    return "err";
  }

  // 시트에 쓰기
  sheet.getRange(row, COL.TITLE).setValue(meta.title || "");
  sheet.getRange(row, COL.AUTHORS).setValue(meta.authors || "");
  sheet.getRange(row, COL.JOURNAL).setValue(meta.journal || "");
  sheet.getRange(row, COL.YEAR).setValue(meta.year || "");
  writeStatus_(sheet, row, STATUS.OK, "");

  return "ok";
}

function writeStatus_(sheet, row, status, _note) {
  sheet.getRange(row, COL.STATUS).setValue(status);
  sheet.getRange(row, COL.SYNCED_AT).setValue(formatTimestamp_(new Date()));
}

// ─────────────────────────────────────────────────────────────
// DOI 정규화
// ─────────────────────────────────────────────────────────────
function normalizeDoi_(raw) {
  if (!raw) return "";
  let s = String(raw).trim();

  // doi: prefix
  s = s.replace(/^doi:\s*/i, "");
  // URL 형식
  s = s.replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");
  // 끝의 공백/점/슬래시 제거
  s = s.replace(/[\s.]+$/g, "");

  // 형식 검증: 10.xxxx/xxxxx
  if (!/^10\.\d{4,9}\/\S+/i.test(s)) {
    return "";
  }
  return s;
}

// ─────────────────────────────────────────────────────────────
// Crossref API 호출
// ─────────────────────────────────────────────────────────────
function fetchCrossref_(doi) {
  const url = CROSSREF_BASE + encodeURIComponent(doi) + "?mailto=" + encodeURIComponent(CROSSREF_MAILTO);
  const options = {
    method: "get",
    muteHttpExceptions: true,
    headers: {
      // Crossref는 User-Agent에 메일을 포함하면 polite pool 사용 (속도 보장)
      "User-Agent": "AI-ACE-Publications-Sync/1.0 (mailto:" + CROSSREF_MAILTO + ")",
    },
  };
  const resp = UrlFetchApp.fetch(url, options);
  const code = resp.getResponseCode();

  if (code === 404) {
    return null; // DOI 없음
  }
  if (code !== 200) {
    throw new Error("HTTP " + code);
  }

  const json = JSON.parse(resp.getContentText());
  const msg = json && json.message;
  if (!msg) return null;

  // 제목
  const titleArr = msg.title || [];
  const title = titleArr.length > 0 ? String(titleArr[0]).trim() : "";

  // 저자
  const authors = (msg.author || []).map((a) => {
    const family = (a.family || "").trim();
    const given = (a.given || "").trim();
    if (family && given) {
      // 이니셜화: "Sangjun" → "S."
      const initial = given.split(/\s+/).map((g) => g.charAt(0).toUpperCase() + ".").join(" ");
      return family + ", " + initial;
    } else if (family) {
      return family;
    } else if (given) {
      return given;
    }
    return (a.name || "").trim();
  }).filter(Boolean).join(", ");

  // 저널/컨퍼런스명
  const containerArr = msg["container-title"] || [];
  const journal = containerArr.length > 0 ? String(containerArr[0]).trim() : "";

  // 연도: published-print > published-online > issued > created
  const year = extractYear_(msg["published-print"])
    || extractYear_(msg["published-online"])
    || extractYear_(msg["issued"])
    || extractYear_(msg["created"]);

  return {
    title: title,
    authors: authors,
    journal: journal,
    year: year || "",
  };
}

function extractYear_(dateObj) {
  if (!dateObj) return null;
  const parts = dateObj["date-parts"];
  if (!Array.isArray(parts) || !Array.isArray(parts[0])) return null;
  return parts[0][0] || null;
}

// ─────────────────────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────────────────────
function formatTimestamp_(date) {
  const tz = Session.getScriptTimeZone() || "Asia/Seoul";
  return Utilities.formatDate(date, tz, "yyyy-MM-dd HH:mm");
}

// ─────────────────────────────────────────────────────────────
// 테스트용 함수 (Apps Script 편집기에서 직접 실행해서 확인)
// ─────────────────────────────────────────────────────────────
function testFetchSingle() {
  const doi = "10.1038/nature12373"; // 테스트용 잘 알려진 DOI
  const meta = fetchCrossref_(doi);
  Logger.log(JSON.stringify(meta, null, 2));
}

function testNormalize() {
  const cases = [
    "10.1038/nature12373",
    "https://doi.org/10.1038/nature12373",
    "https://dx.doi.org/10.1038/nature12373",
    "doi:10.1038/nature12373",
    "  10.1038/nature12373 ",
    "invalid-doi",
    "",
  ];
  cases.forEach((c) => Logger.log(c + " => " + normalizeDoi_(c)));
}
