# 김은아 루틴 (routine-kim)

한 사람을 위한 독립형 루틴 기록 웹앱. 세일즈/마케팅과 완전히 분리된 별도 사이트입니다.

- **프레임워크**: Next.js 15 (App Router)
- **DB**: Supabase 전용 프로젝트(routine-kim), 테이블 `rtn_days` 하나
- **인증**: 없음 (URL만 알면 본인이 바로 접속)

## 로컬 실행

```bash
npm install
cp .env.example .env.local   # 값 채우기
npm run dev                  # http://localhost:3000
```

## Supabase 준비

`supabase/schema.sql` 을 Supabase 프로젝트의 SQL Editor 에 붙여넣고 실행하면 `rtn_days` 테이블이 생성됩니다.

## 환경변수

| Key | 설명 |
|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | routine-kim 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | routine-kim anon public 키 |

## 배포 (Vercel)

GitHub 레포에 push → Vercel 에서 Import → 위 환경변수 2개 등록 → Deploy.

## 루틴 항목 수정

`lib/constants.ts` 의 `STEPS` 만 고치면 됩니다. (체크 항목 추가/삭제는 DB 변경 불필요)
