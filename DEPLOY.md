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

배포 후 나온 **Production URL** (예: `https://your-app.vercel.app` 또는 `https://app-xxx.vercel.app`)을 아래 Supabase 설정에 사용합니다.

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
| **Site URL** | `https://YOUR_VERCEL_APP.vercel.app` (프로덕션 주소) |
| **Redirect URLs** | 다음 두 줄 추가:<br>• `https://YOUR_VERCEL_APP.vercel.app/**`<br>• `https://YOUR_VERCEL_APP.vercel.app/auth/callback` |

4. **Save** 클릭

로컬 개발 시에는 **Redirect URLs**에 다음도 추가:

- `http://localhost:3000/**`
- `http://localhost:3000/auth/callback`

---

이후 프로덕션에서 이메일 로그인 → 매직 링크 클릭 → `/auth/callback`으로 돌아와 로그인이 완료됩니다.
