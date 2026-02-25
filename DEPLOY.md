# Heart to Hearts – 배포 가이드

## 1. Git 원격 저장소에 올리기

```bash
# GitHub에서 새 저장소 생성 후
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

이미 커밋까지 완료된 상태이므로, 원격만 추가한 뒤 `git push -u origin main` 하면 됩니다.

## 2. Vercel 배포

### GitHub ↔ Vercel 연결 (한 번만 하면 push 시 자동 배포)

1. **Git 설정 페이지 열기**: [Vercel 프로젝트 Git 설정](https://vercel.com/halos-projects-24428129/app/settings/git)
2. **Connect Git Repository**에서 **GitHub** 선택 후 저장소 `axz-halo/h2h` 연결
3. **Root Directory**를 **`app`**으로 설정 (필수)
   - [General 설정](https://vercel.com/halos-projects-24428129/app/settings) → **Root Directory** → Edit → `app` 입력 → Save
   - 이걸 설정하지 않으면 "No Next.js version detected" 오류가 납니다.
4. **Environment Variables**에 아래 변수 추가 (라이브 서버 연동 필수):
   - `NEXT_PUBLIC_SUPABASE_URL` = Supabase 프로젝트 URL (예: `https://xxx.supabase.co`)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` 또는 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` = Supabase Anon/Public key

연결 후에는 `git push origin main` 할 때마다 자동으로 배포됩니다.

### 방법 A: Vercel 대시보드 (권장)

1. [vercel.com](https://vercel.com) 로그인 → **Add New** → **Project**
2. GitHub 저장소 연결 후 **Import**
3. **Root Directory**를 `app`으로 설정 (필수)
4. **Environment Variables**에 추가:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://owfwezypyolfimgfngru.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (Supabase Anon/Public key)
5. **Deploy** 클릭

### 방법 B: Vercel CLI

```bash
cd app
vercel link    # 프로젝트 연결 (또는 새로 생성)
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel --prod
```

배포 후 나온 **Production URL**을 아래 Supabase 설정에 사용합니다.  
(현재 프로덕션: **https://h2h-psi.vercel.app/**)

> 터미널에서 배포: `cd app` 후 `vercel --prod` 실행. (이미 Vercel 프로젝트가 연결된 상태라면 빌드 후 URL이 출력됩니다.)

---

## 3. Supabase URL 연동 (필수)

이메일 로그인(매직 링크)이 동작하려면 Supabase에 앱 URL을 등록해야 합니다.

1. [Supabase Dashboard](https://supabase.com/dashboard) → 프로젝트 선택  
   (현재 프로젝트: https://supabase.com/dashboard/project/owfwezypyolfimgfngru )
2. **Authentication** → **URL Configuration**
3. 아래 값 설정:

| 항목 | 값 |
|------|-----|
| **Site URL** | `https://h2h-psi.vercel.app` |
| **Redirect URLs** | 다음 추가:<br>• `https://h2h-psi.vercel.app/**`<br>• `https://h2h-psi.vercel.app/auth/callback` |

4. **Save** 클릭

로컬 개발 시에는 **Redirect URLs**에 다음도 추가:

- `http://localhost:3000/**`
- `http://localhost:3000/auth/callback`

---

이후 프로덕션에서 이메일 로그인 → 매직 링크 클릭 → `/auth/callback`으로 돌아와 로그인이 완료됩니다.

---

## 4. 라이브 배포 + 서버 연동 체크리스트

서버까지 연동해 라이브로 올릴 때 확인할 것:

1. **Supabase 마이그레이션 적용**  
   Supabase Dashboard → SQL Editor에서 아래 순서로 실행 (이미 적용했다면 생략):
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_seed_questions.sql`
   - `supabase/migrations/003_v2_1_pass_and_max_participants.sql`
   - `supabase/migrations/004_users_email.sql`

2. **Vercel 환경 변수**
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` 또는 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`: Anon key

3. **Supabase Auth URL**
   - Site URL / Redirect URLs에 프로덕션 도메인 등록 (위 3번 참고)

4. **동작 흐름**
   - 로그인 → `/api/users/me`로 프로필 upsert 후 홈/프로필 이동
   - 챌린지 생성 → `POST /api/challenges` (질문 + 패스 1명)
   - 지목 → `POST /api/nominations` (상호 지목 시 mutual 페이지)
   - 편지 → `POST /api/letters` (편지 수신자 = 나를 지목한 사람, API에서 자동 조회)
   - 친구 목록 → `GET /api/friends` (contacts 매칭 + 앱 유저)
