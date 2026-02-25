# Supabase 마이그레이션

## 순서

1. `001_initial_schema.sql` — 테이블 생성 (users, contacts, questions, challenges, nominations, letters, payments)
2. `002_seed_questions.sql` — 질문 시드 데이터 (6개 카테고리, 102개)
3. `003_v2_1_pass_and_max_participants.sql` — max_participants, is_pass 컬럼 추가
4. `004_users_email.sql` — email 컬럼, RLS 정책 추가
5. `006_reset_questions.sql` — 기존 질문 DELETE + category CHECK 변경 + 새 102개 INSERT

[Supabase Dashboard](https://supabase.com/dashboard) → 프로젝트 선택 → **SQL Editor**에서 각 파일 내용을 순서대로 실행하면 됩니다.

## 상황별 가이드

- **새 프로젝트**: 001 → 002 → 003 → 004 순서대로 실행 (006은 불필요, 002에 이미 새 카테고리 포함)
- **기존 프로젝트 (001~004 적용 완료)**: **006만 실행** (기존 질문 삭제 + CHECK 변경 + 새 질문 삽입)
