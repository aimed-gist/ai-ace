/**
 * AI-ACE@GIST — Member Photos Link Resolver (Google Apps Script)
 *
 * 문제:
 *   Members 탭의 H열(사진)에 Drive 파일 "칩(스마트 칩)"으로 사진을 넣으면,
 *   CSV 내보내기 시 링크가 사라지고 파일명만 남아 sync 스크립트가
 *   사진을 다운로드하지 못합니다 (→ placeholder 이미지로 표시됨).
 *
 * 동작:
 *   1. Members 탭 H열의 각 셀에서 Drive 파일 칩의 링크(URL)를 읽어
 *      J열("사진 URL (자동)")에 기록합니다.
 *      - H열에 칩 대신 일반 URL 텍스트가 있으면 그 URL을 그대로 복사합니다.
 *   2. 링크된 Drive 파일의 공유 설정을 "링크가 있는 모든 사용자 - 뷰어"로
 *      변경합니다 (권한이 없으면 셀 메모로 알려줌).
 *   3. 문제가 있는 행(칩 없음, 공유 실패, 웹 표시 불가 포맷 등)은
 *      H열 셀에 메모(📌 노란 표시)로 사유를 남깁니다.
 *
 * 설치 (1회):
 *   1. 시트 메뉴 → 확장 프로그램 → Apps Script
 *   2. 파일 추가(+) → 스크립트 → "member-photos" → 이 파일 전체 붙여넣기 → 저장
 *   3. 왼쪽 "서비스(Services)" 옆 + 클릭 → "Google Sheets API" 선택 → 추가
 *      (식별자는 기본값 "Sheets" 그대로)
 *   4. 편집기에서 함수 선택 드롭다운 → installMemberPhotoTriggers → 실행(▶)
 *      → 권한 승인 1회
 *      (매일 22시에 자동 실행 + 시트 열 때 "📸 Member Photos" 메뉴 등록)
 *   5. 시트 새로고침 → 메뉴 "📸 Member Photos" → "🔄 사진 링크 갱신" 실행
 *
 * 참고:
 *   - GitHub Actions의 sync-members는 매일 KST 00:00에 실행되므로,
 *     22시 자동 실행이 그 전에 J열을 채워 둡니다.
 *   - .emf 등 웹에서 표시할 수 없는 포맷은 경고 메모가 남습니다.
 *     jpg/png/webp로 다시 받아주세요.
 */

// ─────────────────────────────────────────────────────────────
// 설정
// ─────────────────────────────────────────────────────────────
const MP_SHEET_NAME = "Members";
const MP_PHOTO_COL = 8;      // H열: 사진 (칩 또는 URL)
const MP_URL_COL = 10;       // J열: 사진 URL (자동)
const MP_URL_HEADER = "사진 URL (자동)";
const MP_HEADER_ROW = 1;
// 웹에서 표시 가능한 이미지 확장자
const MP_WEB_OK_EXT = ["jpg", "jpeg", "png", "webp", "gif"];

// ─────────────────────────────────────────────────────────────
// 트리거/메뉴 설치 (편집기에서 1회 실행)
// ─────────────────────────────────────────────────────────────
function installMemberPhotoTriggers() {
  // 중복 설치 방지
  ScriptApp.getProjectTriggers().forEach(function (t) {
    const fn = t.getHandlerFunction();
    if (fn === "syncMemberPhotoLinks" || fn === "memberPhotoMenu") {
      ScriptApp.deleteTrigger(t);
    }
  });

  // 매일 22시(시트 시간대 기준) 자동 실행 — 00시 GitHub sync 전에 J열 갱신
  ScriptApp.newTrigger("syncMemberPhotoLinks")
    .timeBased()
    .everyDays(1)
    .atHour(22)
    .create();

  // 시트 열 때 메뉴 등록 (publications.gs 의 onOpen 과 충돌하지 않도록 installable trigger 사용)
  ScriptApp.newTrigger("memberPhotoMenu")
    .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
    .onOpen()
    .create();

  SpreadsheetApp.getActiveSpreadsheet().toast(
    "설치 완료: 매일 22시 자동 실행 + 📸 메뉴 등록",
    "Member Photos"
  );
}

function memberPhotoMenu() {
  SpreadsheetApp.getUi()
    .createMenu("📸 Member Photos")
    .addItem("🔄 사진 링크 갱신 (전체)", "syncMemberPhotoLinksWithAlert")
    .addSeparator()
    .addItem("❓ 사용법", "showMemberPhotoHelp")
    .addToUi();
}

// ─────────────────────────────────────────────────────────────
// 메인: H열 칩 → J열 URL
// ─────────────────────────────────────────────────────────────
function syncMemberPhotoLinksWithAlert() {
  const summary = syncMemberPhotoLinks();
  SpreadsheetApp.getUi().alert("📸 사진 링크 갱신 결과\n\n" + summary);
}

function syncMemberPhotoLinks() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(MP_SHEET_NAME);
  if (!sheet) throw new Error('"' + MP_SHEET_NAME + '" 탭을 찾을 수 없습니다.');

  const lastRow = sheet.getLastRow();
  if (lastRow <= MP_HEADER_ROW) return "데이터 행이 없습니다.";

  // J열 헤더 보장
  if (sheet.getRange(MP_HEADER_ROW, MP_URL_COL).getValue() !== MP_URL_HEADER) {
    sheet.getRange(MP_HEADER_ROW, MP_URL_COL).setValue(MP_URL_HEADER);
  }

  // Sheets API(고급 서비스)로 H열의 칩 정보 읽기
  const colLetter = "H";
  const range =
    MP_SHEET_NAME + "!" + colLetter + (MP_HEADER_ROW + 1) + ":" + colLetter + lastRow;
  const resp = Sheets.Spreadsheets.get(ss.getId(), {
    ranges: [range],
    fields: "sheets(data(rowData(values(formattedValue,chipRuns))))",
  });

  const rowData =
    (resp.sheets &&
      resp.sheets[0] &&
      resp.sheets[0].data &&
      resp.sheets[0].data[0] &&
      resp.sheets[0].data[0].rowData) ||
    [];

  let ok = 0, empty = 0, noChip = 0, shareFail = 0, badFormat = 0;
  const urlValues = [];
  const notes = [];

  for (let i = 0; i < lastRow - MP_HEADER_ROW; i++) {
    const cell = (rowData[i] && rowData[i].values && rowData[i].values[0]) || {};
    const text = (cell.formattedValue || "").toString().trim();
    let note = "";
    let url = "";

    // 1) 칩에서 URL 추출
    const chipRuns = cell.chipRuns || [];
    for (let c = 0; c < chipRuns.length; c++) {
      const chip = chipRuns[c].chip || {};
      if (chip.richLinkProperties && chip.richLinkProperties.uri) {
        url = chip.richLinkProperties.uri;
        break;
      }
    }

    // 2) 칩이 없으면: 셀 텍스트가 URL인지 확인
    if (!url && /^https?:\/\//i.test(text)) url = text;

    if (!text && !url) {
      empty++;
      urlValues.push([""]);
      notes.push([null]); // 메모 유지 안 함 (빈 행)
      continue;
    }

    if (!url) {
      noChip++;
      urlValues.push([""]);
      note =
        "⚠️ 사진 링크를 찾지 못했습니다.\n" +
        "셀에 Drive 파일 칩(@파일명) 또는 공유 링크(URL)를 넣어주세요.";
      notes.push([note]);
      continue;
    }

    // 3) 웹 표시 불가 포맷 경고 (.emf 등)
    const extMatch = text.toLowerCase().match(/\.([a-z0-9]+)$/);
    if (extMatch && MP_WEB_OK_EXT.indexOf(extMatch[1]) === -1) {
      badFormat++;
      note =
        "⚠️ ." + extMatch[1] + " 파일은 웹에서 표시할 수 없습니다.\n" +
        "jpg/png/webp 형식으로 다시 올려주세요.";
    }

    // 4) Drive 파일 공유 설정: 링크가 있는 모든 사용자(뷰어)
    const fileId = mpExtractFileId_(url);
    if (fileId) {
      try {
        const file = DriveApp.getFileById(fileId);
        const access = file.getSharingAccess();
        if (
          access !== DriveApp.Access.ANYONE_WITH_LINK &&
          access !== DriveApp.Access.ANYONE
        ) {
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        }
      } catch (e) {
        shareFail++;
        note =
          (note ? note + "\n" : "") +
          "⚠️ 파일 공유 설정 실패 (권한 없음).\n" +
          "파일 소유자가 '링크가 있는 모든 사용자 - 뷰어'로 공유해야 합니다.";
      }
    }

    ok++;
    urlValues.push([url]);
    notes.push([note || null]);
  }

  // J열에 URL 기록 + H열 메모 갱신
  const n = urlValues.length;
  if (n > 0) {
    sheet.getRange(MP_HEADER_ROW + 1, MP_URL_COL, n, 1).setValues(urlValues);
    const noteRange = sheet.getRange(MP_HEADER_ROW + 1, MP_PHOTO_COL, n, 1);
    noteRange.setNotes(notes.map(function (r) { return [r[0] || ""]; }));
  }

  const summary =
    "URL 기록: " + ok + "행\n" +
    "빈 행: " + empty + "\n" +
    "링크 못 찾음: " + noChip + " (H열 메모 확인)\n" +
    "공유 설정 실패: " + shareFail + " (H열 메모 확인)\n" +
    "웹 표시 불가 포맷: " + badFormat + " (.emf 등 → jpg/png 필요)";
  Logger.log(summary);
  return summary;
}

// Drive URL → fileId
function mpExtractFileId_(url) {
  let m = url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/);
  if (m) return m[1];
  m = url.match(/[?&]id=([^&#]+)/);
  if (m) return m[1];
  return null;
}

function showMemberPhotoHelp() {
  SpreadsheetApp.getUi().alert(
    "📸 Member Photos 사용법\n\n" +
      "1. Members 탭 H열(사진)에 Drive 파일 칩(@파일명) 또는 공유 링크를 넣습니다.\n" +
      "2. 메뉴 → '🔄 사진 링크 갱신'을 실행하면 J열에 다운로드 가능한 URL이 채워지고,\n" +
      "   파일 공유가 자동으로 '링크 보기'로 설정됩니다.\n" +
      "   (매일 22시에도 자동 실행됩니다)\n" +
      "3. 웹사이트는 매일 자정(KST) J열의 URL로 사진을 내려받아 갱신됩니다.\n\n" +
      "⚠️ H열 셀에 노란 메모가 표시되면 그 행에 문제가 있는 것입니다 (메모 내용 참고).\n" +
      "⚠️ .emf 등은 웹에서 표시되지 않으니 jpg/png/webp로 올려주세요."
  );
}
