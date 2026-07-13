# Opportunities MD 파일 관리

채용공고를 Google Sheet 외에 **Markdown 파일로 직접 관리**할 수 있는 폴더입니다.

## 파일 형식

```markdown
---
title: 공고 제목
type: fellowship          # fellowship | position | intern | other
date: 2026-05-01          # 게시일 (선택)
deadline: 2026-12-31      # 마감일 (선택, 비우면 상시 모집)
pinned: true              # (선택) 상단 고정
contact: apply@gist.ac.kr # 이메일 또는 지원 URL
---
본문 내용을 자유롭게 작성합니다.

여러 문단, 리스트 등으로 상세 정보를 담을 수 있습니다.
```

## 자동 처리

- **마감일 지나면 자동 비활성화** (페이지에서 숨김) — 시트 방식과 동일
- **상시 모집**: `deadline` 비워두면 항상 활성
- **Notice에도 자동 노출**: 활성 채용공고는 Notice 페이지에도 카드로 함께 표시됨
- **파일명 시작이 `_` 또는 `.`이면 무시** (초안 보관)

## 삭제

파일 삭제 + git push → 다음 배포부터 홈페이지에서 사라집니다.
