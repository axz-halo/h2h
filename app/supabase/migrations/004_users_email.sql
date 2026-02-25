-- Support email-based auth (magic link). Keep phone_number for optional future use.
alter table public.users
  add column if not exists email text;

comment on column public.users.email is '이메일 (매직 링크 로그인용).';

-- Allow existing rows: make phone_number nullable so email-only users can exist
alter table public.users
  alter column phone_number drop not null;

create unique index if not exists idx_users_email on public.users(email) where email is not null;

-- Allow user to insert own row on first login (e.g. after magic link)
create policy "users_insert_own" on public.users
  for insert with check (auth.uid() = id);
