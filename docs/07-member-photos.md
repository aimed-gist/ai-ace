# 멤버 사진 자동 동기화 설정 가이드

## 문제 배경

Members 시트의 **H열(사진)에 Drive 파일 칩(스마트 칩)** 으로 사진을 넣으면,
GitHub Actions가 시트를 CSV로 내려받을 때 **칩의 링크가 사라지고 파일명만 남습니다**
(예: `"28. 고현협 교수.png"`). 그래서 sync 스크립트가 사진을 다운로드하지 못하고
placeholder 이미지가 표시됩니다.

## 해결 구조

```
[H열: 파일 칩]
     │  Apps Script (member-photos.gs, 매일 22시 자동)
     ▼
[J열: 사진 URL (자동)]  ← 칩에서 추출한 다운로드 가능한 URL
     │  GitHub Actions (sync-members, 매일 00시)
     ▼
public/images/members/*.jpg + members.json
     │  deploy 워크플로 자동 실행 (이번에 추가됨)
     ▼
웹사이트 갱신
```

Apps Script는 URL 추출과 함께 **파일 공유를 "링크가 있는 모든 사용자 - 뷰어"로
자동 변경**합니다 (다운로드가 가능해야 하므로).

## 설치 (1회, 시트 관리자)

1. 스프레드시트 → **확장 프로그램 → Apps Script** 열기
2. 파일 추가(+) → 스크립트 → 이름 `member-photos` →
   `scripts/apps-script/member-photos.gs` 내용 전체 붙여넣기 → 저장
3. 왼쪽 사이드바 **"서비스(Services)" 옆 + 클릭 → "Google Sheets API" 추가**
   (식별자는 기본값 `Sheets` 그대로)
4. 상단 함수 드롭다운에서 `installMemberPhotoTriggers` 선택 → **실행(▶)** → 권한 승인
   - 매일 22시(KST) 자동 실행 트리거 + 시트 메뉴 등록이 설치됩니다.
5. 시트 새로고침 → 상단에 **"📸 Member Photos"** 메뉴가 보이면 성공
6. 메뉴 → **"🔄 사진 링크 갱신 (전체)"** 를 한 번 실행해서 J열이 채워지는지 확인

## 운영 방법 (사진 담당자)

- H열에 **Drive 파일 칩**(셀에서 `@파일명` 입력 후 선택) 또는 **Drive 공유 링크**를 넣으면 됩니다.
- 매일 22시에 J열이 자동 갱신되고, 자정에 웹사이트로 반영됩니다.
  바로 반영하고 싶으면: 메뉴 "🔄 사진 링크 갱신" → GitHub Actions에서
  "Sync Members from Spreadsheet" 수동 실행(Run workflow).
- **H열 셀에 노란 메모가 생기면 문제가 있는 행입니다.** 메모 내용을 확인하세요:
  - "링크를 찾지 못했습니다" → 칩/URL이 아닌 일반 텍스트만 있음
  - "공유 설정 실패" → 파일 소유자가 직접 '링크가 있는 모든 사용자 - 뷰어'로 공유 필요
  - "웹에서 표시할 수 없습니다" → `.emf` 등 → **jpg/png/webp로 다시 업로드 필요**

## 함께 수정된 것 (2026-08)

1. `scripts/sync-members.mjs`
   - J열(사진 URL 자동) 우선 사용, H열은 URL일 때만 사용
   - 다운로드한 파일이 실제 이미지인지 바이트 시그니처 검증
     (권한 오류 HTML이 .jpg로 저장되는 것 방지)
   - 사진 없는 멤버 명단을 Actions 로그에 출력
2. `.github/workflows/sync-*.yml` (5개 전부)
   - **봇이 커밋을 푸시해도 사이트가 재배포되지 않던 문제 수정.**
     GitHub Actions의 기본 토큰으로 푸시된 커밋은 `on: push` 워크플로를
     트리거하지 않으므로, 변경이 있을 때 `gh workflow run deploy.yml`로
     배포를 명시적으로 실행하도록 함 (`permissions: actions: write` 추가).

## 참고

- Notice / Media Coverage / Co-Lab / Publications 탭의 이미지 열은
  여전히 **일반 URL 텍스트**만 지원합니다. 그 탭들에도 파일 칩을 쓰기 시작하면
  같은 방식의 Apps Script 확장이 필요합니다.
- 사진 열이 비어 있으면 `public/images/members/`의 기존 파일
  (`영문명 소문자_언더스코어.jpg`)을 사용하고, 그것도 없으면 placeholder가 표시됩니다.
