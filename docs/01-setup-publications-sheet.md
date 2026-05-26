# Publications 시트 셋업 가이드

> **대상**: 시트를 처음 만드는 관리자 (보통 교수님 또는 시스템 담당자)
> **소요 시간**: 약 15분
> **준비물**: 기존 멤버 관리 시트 (`1JBb_azDOmzVl3hCfJqqAWh1sGMHCB0tGey4k_OX7agY`)

이 문서는 멤버 관리에 사용 중인 Google Sheet 워크북에 **Publications**, **Patents**, **_Dropdowns** 탭을 추가하는 가이드입니다. 한 번만 셋업하면 행정 담당자는 시트만 사용하면 됩니다.

---

## 0. 시작하기 전에

기존 멤버 관리 시트를 엽니다:
`https://docs.google.com/spreadsheets/d/1JBb_azDOmzVl3hCfJqqAWh1sGMHCB0tGey4k_OX7agY/edit`

시트 하단 탭 영역에서 **`+` 버튼**으로 새 시트(탭)를 3개 만들 예정입니다.

---

## 1. `_Dropdowns` 탭 만들기 (드롭다운 옵션 관리)

이 탭은 다른 탭의 드롭다운 옵션을 모아두는 곳입니다. 가장 먼저 만들어야 다른 탭에서 참조할 수 있습니다.

### 1-1. 탭 생성

1. 하단 `+` 버튼 클릭
2. 새 시트 이름을 더블클릭해서 **`_Dropdowns`** 로 변경 (언더스코어 포함)

### 1-2. 컬럼 입력

다음 내용을 그대로 입력합니다 (A1부터):

| A | B |
|---|---|
| **PI 목록** | **분과 목록** |
| Mansu Kim | Artificial Peptide |
| Hyunju Lee | Collective Intelligence |
| Eunji Lee | Emerging Devices |
| Mi-Ryoung Song | |
| Jae Young Lee | |
| Zee Yong Park | |
| Jong-Chan Lee | |
| Ja-Hyoung Ryu | |
| JaeHong Kim | |
| Myungeun Seo | |
| Tae-Hyuk Kwon | |
| Jong Min Yuk | |
| Byeong Chae Kim | |
| Ji-Joon Song | |
| Ue-Hwan Kim | |
| MinKyung Kim | |
| Duk-Jo Kong | |
| Byuong-Hoon Park | |
| Hyunsu Ju | |
| Hyeon-Ho Jeong | |
| Jung Ah Lim | |
| Dong Ki Yoon | |
| Chang-Hee Cho | |
| Hyeon-Jin Shin | |
| Jeong-Eun Park | |
| Hyunseob Lim | |
| Shin-Hyun Kim | |
| Sung Yang | |
| Hyunhyub Ko | |
| Young Min Song | |
| Myung-Han Yoon | |

> 💡 **PI 목록**은 멤버 시트의 `이름(영어)` 컬럼에서 멘토 전체를 복사·붙여넣기 하면 빠릅니다. 새 멤버가 들어오면 행정 담당자가 직접 추가할 수 있게 자유롭게 늘려둘 수 있습니다.

### 1-3. 탭 숨김 (선택)

행정 담당자에게 보이지 않게 하려면:
- `_Dropdowns` 탭 우클릭 → **"시트 숨기기"**

숨겨도 데이터 검증은 정상 동작합니다.

---

## 2. `Publications` 탭 만들기

### 2-1. 탭 생성

1. 하단 `+` 버튼 클릭
2. 새 시트 이름을 **`Publications`** 로 변경 (대소문자 정확히)

### 2-2. 헤더 입력

A1부터 M1에 다음을 그대로 입력합니다:

| 셀 | 헤더 텍스트 |
|---|---|
| A1 | DOI |
| B1 | 제출 PI |
| C1 | 분과 |
| D1 | 유형 |
| E1 | Featured |
| F1 | 비고 |
| G1 | 제목 |
| H1 | 저자 |
| I1 | 저널 |
| J1 | 연도 |
| K1 | 상태 |
| L1 | 마지막 동기화 |
| M1 | 대표 이미지 |

### 2-3. 헤더 스타일 (선택, 보기 좋게)

1. **1행 전체 선택** (행 번호 `1` 클릭)
2. **굵게(Ctrl+B)**, **배경색** 회색(`#e0e0e0`) 또는 원하는 색
3. **자동/수동 구분**을 위해 G~L열을 다른 색(예: 연한 노란색 `#fff9c4`)으로 칠해두기 — 행정이 한눈에 "자동 채워질 컬럼"임을 인지
4. M열(대표 이미지)은 행정이 수동 입력하므로 입력 컬럼 색(A~F열과 동일)으로 통일하는 것을 추천

### 2-4. 데이터 검증 (드롭다운) 설정

**제출 PI (B열)**

1. B2:B1000 선택 (B열의 헤더 제외한 전체 범위)
2. 메뉴 **데이터 → 데이터 확인**
3. 기준: **드롭다운(범위)**
4. 범위 선택 박스 클릭 → `=_Dropdowns!A2:A` 입력
5. **"잘못된 데이터일 경우": 거부** 선택
6. **저장**

**분과 (C열)**

1. C2:C1000 선택
2. 데이터 → 데이터 확인
3. 기준: **드롭다운(범위)**, 범위: `=_Dropdowns!B2:B`
4. 잘못된 데이터일 경우: **경고 표시** (분과 비워둬도 무방하므로)
5. 저장

**유형 (D열)**

1. D2:D1000 선택
2. 데이터 → 데이터 확인
3. 기준: **드롭다운**
4. 항목 직접 입력:
   - `publication`
   - `preprint`
5. 잘못된 데이터일 경우: **거부**
6. 저장

**Featured (E열, 체크박스)**

1. E2:E1000 선택
2. 메뉴 **삽입 → 체크박스**
3. 자동으로 체크박스가 들어갑니다 (값: 체크 시 `TRUE`, 미체크 시 `FALSE`)

### 2-5. 열 너비 조정 (보기 편하게, 선택)

대략적으로:
- A (DOI): 250px
- B (PI): 130px
- C (분과): 160px
- D (유형): 100px
- E (Featured): 80px
- F (비고): 200px
- G (제목): 400px
- H (저자): 300px
- I (저널): 200px
- J (연도): 70px
- K (상태): 100px
- L (마지막 동기화): 150px
- M (대표 이미지): 300px

### 2-6. 행 고정 (헤더 고정)

1. 메뉴 **보기 → 고정 → 1행**

---

## 3. `Patents` 탭 만들기

### 3-1. 탭 생성

1. 하단 `+` 버튼 클릭
2. 새 시트 이름을 **`Patents`** 로 변경

### 3-2. 헤더 입력

A1부터 I1에 다음을 입력합니다:

| 셀 | 헤더 텍스트 |
|---|---|
| A1 | 특허명 |
| B1 | 발명자 |
| C1 | 출원/등록번호 |
| D1 | 국가 |
| E1 | 상태 |
| F1 | 연도 |
| G1 | 제출 PI |
| H1 | 분과 |
| I1 | 비고 |

### 3-3. 데이터 검증

**국가 (D열)**: 드롭다운 직접 입력 → `KR`, `US`, `EP`, `JP`, `WO`, `CN`

**상태 (E열)**: 드롭다운 직접 입력 → `출원`, `공개`, `등록`

**제출 PI (G열)**: 범위 `=_Dropdowns!A2:A`

**분과 (H열)**: 범위 `=_Dropdowns!B2:B`

### 3-4. 헤더 고정, 스타일

Publications와 동일하게 1행 고정 + 굵게 + 배경색.

---

## 4. 권한 설정 (선택, 그러나 권장)

행정 담당자가 시트 구조 자체를 실수로 망가뜨리지 않도록 보호 설정을 권장합니다.

### 4-1. 헤더 행 보호

1. **1행 전체 선택**
2. 메뉴 **데이터 → 시트 및 범위 보호**
3. **+ 시트 또는 범위 추가**
4. "범위" 선택, 설명: "헤더 보호"
5. **권한 설정** → "이 범위를 수정할 때 경고 표시"
6. 저장

### 4-2. `_Dropdowns` 탭 보호

전체 탭에 같은 보호를 걸어두면 안전합니다.

---

## 5. 셋업 완료 후 다음 단계

이 가이드를 완료한 후:

1. **`docs/02-apps-script-setup.md`** — Apps Script 등록 가이드로 진행
2. 그 후 행정 담당자에게 **`docs/03-admin-guide.md`** 를 공유

---

## 부록: 시트가 정확히 만들어졌는지 자가 점검 체크리스트

- [ ] `Publications`, `Patents`, `_Dropdowns` 세 탭이 존재한다
- [ ] `Publications` 탭의 A1~M1에 헤더가 정확히 입력되어 있다 (M열 `대표 이미지` 포함)
- [ ] `Publications`의 B열, C열에서 셀 클릭 시 드롭다운 화살표가 보인다
- [ ] `Publications`의 D열에서 `publication` / `preprint` 두 옵션이 보인다
- [ ] `Publications`의 E열 셀이 체크박스로 표시된다
- [ ] `Patents` 탭의 A1~I1에 헤더가 정확히 입력되어 있다
- [ ] `Patents`의 D열, E열, G열, H열에서 드롭다운이 동작한다
- [ ] `_Dropdowns` 탭의 PI 목록(A열)과 분과 목록(B열)이 채워져 있다

모두 체크되면 다음 단계(Apps Script 설치)로 넘어가세요.
