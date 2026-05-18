# Partners 시트 셋업 가이드

> **대상**: 시트 관리자 (보통 교수님 또는 시스템 담당자)
> **소요 시간**: 약 5분
> **선행 조건**: 기존 워크북 (멤버/Publications 탭이 있는 시트) 사용

이 가이드는 같은 워크북에 **`Partners`** 탭을 추가하는 절차입니다. 한 번만 셋업하면 행정 담당자는 시트에만 입력하면 됩니다.

---

## 1. `Partners` 탭 만들기

### 1-1. 탭 생성

1. 기존 워크북 ([바로가기](https://docs.google.com/spreadsheets/d/1JBb_azDOmzVl3hCfJqqAWh1sGMHCB0tGey4k_OX7agY/edit)) 을 엽니다
2. 하단 `+` 버튼 클릭
3. 새 시트 이름을 **`Partners`** 로 변경 (대소문자 정확히)

### 1-2. 헤더 입력

A1부터 D1에 다음을 입력합니다:

| 셀 | 헤더 텍스트 |
|---|---|
| A1 | 이름 |
| B1 | 유형 |
| C1 | 웹사이트 |
| D1 | 로고 |

### 1-3. 데이터 검증 (드롭다운)

**유형 (B열)**

1. B2:B1000 선택
2. 메뉴 **데이터 → 데이터 확인**
3. 기준: **드롭다운**
4. 항목 직접 입력:
   - `university`
   - `industry`
5. 잘못된 데이터일 경우: **거부**
6. 저장

> 💡 향후 `institute`, `government` 등 다른 유형이 필요하면 시스템 담당자가 페이지 코드와 함께 추가하면 됩니다.

### 1-4. 스타일 (선택)

1. 1행 헤더 굵게 + 배경색
2. 메뉴 **보기 → 고정 → 1행**
3. 열 너비 추천:
   - A (이름): 200px
   - B (유형): 120px
   - C (웹사이트): 300px
   - D (로고): 350px

---

## 2. 데이터 입력 형식

### 이름 (A열)
파트너 기관의 공식 영문명. 예: `KAIST`, `Samsung Electronics`, `Seoul National University`

### 유형 (B열)
드롭다운에서 선택:
- `university` — 대학, 연구기관
- `industry` — 기업, 산업체

### 웹사이트 (C열)
파트너의 공식 홈페이지 URL. 예: `https://www.kaist.ac.kr`
- `https://` 또는 `http://`를 꼭 포함
- 클릭 시 새 탭에서 열림

### 로고 (D열) — **중요**
로고 이미지의 URL. **두 가지 방식 모두 지원**:

**방식 A: Google Drive 공유 링크 (권장 — 행정 친화)**
1. Google Drive에 로고 이미지 업로드 (PNG/JPG/SVG/WebP)
2. 우클릭 → "공유" → **"링크가 있는 모든 사용자"** 로 변경
3. 링크 복사 (`https://drive.google.com/file/d/FILE_ID/view?usp=sharing` 형식)
4. D열에 그대로 붙여넣기

> ⚠️ **반드시 "링크가 있는 모든 사용자" 권한이어야** GitHub Actions가 다운로드할 수 있습니다.

**방식 B: 직접 이미지 URL**
- 파트너 회사 공식 사이트의 로고 이미지 URL을 그대로 붙여넣기
- 예: `https://example.com/assets/logo.png`
- 단, 출처 사이트가 hotlinking을 막으면 동작 안 할 수 있음 → 이 경우 방식 A 사용 권장

**비워둘 경우**
- 로고 컬럼이 비어있으면 → 자동으로 placeholder 표시 (`/images/partners/placeholder.svg`)
- 추후 로고 URL을 채워넣으면 다음 sync 때 자동 다운로드

---

## 3. 예시 데이터 (테스트용)

처음 입력해보실 때 참고:

| 이름 | 유형 | 웹사이트 | 로고 |
|---|---|---|---|
| KAIST | university | https://www.kaist.ac.kr | (드라이브 링크 또는 공식 로고 URL) |
| Samsung Electronics | industry | https://www.samsung.com | (드라이브 링크) |
| Seoul National University | university | https://www.snu.ac.kr | |

세 번째 행은 로고를 비워둔 예 — placeholder가 표시됩니다.

---

## 4. 동작 흐름

```
[행정 담당자]
   ↓
시트에 행 추가 (이름, 유형, URL, 로고 링크)
   ↓
매일 KST 00:30 또는 수동 트리거
   ↓
sync-partners.mjs 실행
   ├─ 시트 CSV 읽기
   ├─ 로고 이미지 다운로드 → public/images/partners/ 저장
   └─ partners.json 갱신
   ↓
GitHub Pages 자동 재배포
   ↓
홈페이지 Partners 페이지에 반영
```

---

## 5. 자가 점검 체크리스트

- [ ] `Partners` 탭이 워크북에 존재한다
- [ ] A1~D1 에 헤더가 정확히 입력되어 있다 (`이름`, `유형`, `웹사이트`, `로고`)
- [ ] B열 클릭 시 드롭다운에서 `university` / `industry` 가 선택 가능하다
- [ ] 테스트로 행 한 개 추가 후 GitHub Actions에서 `Sync Partners` 워크플로우 수동 실행 → 1~2분 후 partners.json 갱신 확인

---

## 6. 운영 팁

- **로고 사이즈**: 가로:세로 비율 약 **5:2** 가 가장 깔끔 (페이지 카드 비율과 일치). 정확한 비율 아니어도 자동으로 맞춰 표시되니 너무 신경 쓰지 않으셔도 됩니다.
- **배경 투명한 PNG** 가 가장 보기 좋습니다 (회색 배경에 잘 어울림).
- **권한 실수 가장 흔함**: 드라이브 링크 권한을 "본인만" 또는 "조직 내"로 두면 다운로드 실패. **반드시 "링크가 있는 모든 사용자"** 로.
- **삭제**: 시트에서 행을 지우면 다음 sync 때 partners.json에서도 사라집니다. 단, `public/images/partners/` 의 이미지 파일은 남아있음 (홈페이지엔 영향 없음).

---

## 7. 다음 단계

이 가이드를 완료한 후:
- 시스템 담당자가 `scripts/sync-partners.mjs` 와 `.github/workflows/sync-partners.yml` 가 push되어 있는지 확인
- GitHub Actions → "Sync Partners from Spreadsheet" 첫 수동 실행으로 동작 검증
- 행정 담당자에게 사용법 안내 (Members/Publications와 동일한 방식이므로 추가 학습 부담 없음)
