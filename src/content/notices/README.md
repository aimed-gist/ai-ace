# Notice MD 파일 관리

Notice 공지사항을 Google Sheet 외에 **Markdown 파일로 직접 관리**할 수 있는 폴더입니다.

## 왜 두 가지 관리 방식?

| 관리 방식 | 언제 쓰나요? |
|---|---|
| **Google Sheet** (Notice 탭) | 짧은 공지, 행정 담당자가 일상적으로 입력 |
| **MD 파일** (이 폴더) | 서식이 필요한 긴 공지, 개발자/교수님이 직접 편집, git 이력 관리 |

두 곳의 데이터는 자동으로 **하나로 병합**되어 홈페이지 Notice 페이지에 표시됩니다.

## 새 공지 작성

1. 이 폴더에 `YYYY-MM-DD-slug.md` 형식으로 파일 생성
2. 다음 frontmatter 헤더 + 본문 작성:

```markdown
---
title: 공지 제목
date: 2026-05-30
pinned: true          # (선택) 상단 고정
link: https://...     # (선택) 외부 링크
image: /path/to/image # (선택) 대표 이미지 (public/... 또는 URL)
---
본문 내용을 자유롭게 작성합니다.

여러 문단으로 나눠도 되고, 빈 줄로 문단을 구분합니다.
```

3. Git commit + push → GitHub Actions가 `next build` 실행 시 자동으로 파싱하여 페이지에 반영

## 필드 설명

- **title** (필수): 공지 제목
- **date** (필수): `YYYY-MM-DD` 형식
- **pinned** (선택, `true`/`false`): `true`면 Notice 목록 최상단에 고정
- **link** (선택): 첨부/외부 링크. 있으면 카드 클릭 시 새 탭에서 열림
- **image** (선택): 대표 이미지. `/images/...` 로컬 경로 또는 https URL

## 파일명 규칙

- 파일명 시작 문자가 `_`이거나 `.`이면 무시됩니다 (초안 보관 용도)
- 확장자 `.md` 필수
- 예: `2026-05-30-spring-seminar.md`, `2026-06-01-recruitment.md`

## 삭제

파일을 삭제하고 git push하면 다음 배포부터 홈페이지에서도 사라집니다.
