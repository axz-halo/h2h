# Supabase 마이그레이션

## 순서

1. `001_initial_schema.sql`  
2. `002_seed_questions.sql`  
3. `003_v2_1_pass_and_max_participants.sql`  
4. `004_users_email.sql`  

[Supabase Dashboard](https://supabase.com/dashboard) → 프로젝트 선택 → **SQL Editor**에서 각 파일 내용을 순서대로 실행하면 됩니다.

이미 001~003까지 적용했다면 **004_users_email.sql**만 실행하면 됩니다.
