-- Heart to Hearts - Initial Database Schema
-- Based on the ERD from the planning document v2.0

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- =============================================================
-- USERS TABLE
-- Linked to Supabase Auth via auth.users.id
-- =============================================================
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  phone_number text unique not null,
  nickname text check (char_length(nickname) between 2 and 8),
  profile_image_url text,
  school text,
  challenge_create_remaining int not null default 3 check (challenge_create_remaining >= 0 and challenge_create_remaining <= 3),
  fcm_token text,
  status text not null default 'active' check (status in ('active', 'suspended', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_users_phone on public.users(phone_number);
create index idx_users_status on public.users(status);

-- =============================================================
-- CONTACTS TABLE
-- Stores hashed phone numbers from user's address book
-- =============================================================
create table public.contacts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  contact_phone_hash text not null,
  matched_user_id uuid references public.users(id) on delete set null,
  synced_at timestamptz not null default now()
);

create index idx_contacts_user on public.contacts(user_id);
create index idx_contacts_phone_hash on public.contacts(contact_phone_hash);
create unique index idx_contacts_user_phone on public.contacts(user_id, contact_phone_hash);

-- =============================================================
-- QUESTIONS TABLE
-- Server-managed question sets by category
-- =============================================================
create table public.questions (
  id uuid primary key default uuid_generate_v4(),
  category text not null check (category in ('romance', 'friendship', 'curiosity', 'gratitude')),
  question_text text not null,
  is_active boolean not null default true,
  usage_count int not null default 0,
  created_at timestamptz not null default now()
);

create index idx_questions_category on public.questions(category);
create index idx_questions_active on public.questions(is_active);

-- =============================================================
-- CHALLENGES TABLE
-- 48-hour challenge events
-- =============================================================
create table public.challenges (
  id uuid primary key default uuid_generate_v4(),
  question_id uuid not null references public.questions(id),
  creator_id uuid not null references public.users(id),
  status text not null default 'active' check (status in ('active', 'expired', 'result_delivered')),
  participant_count int not null default 1,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '48 hours')
);

create index idx_challenges_creator on public.challenges(creator_id);
create index idx_challenges_status on public.challenges(status);
create index idx_challenges_status_expires on public.challenges(status, expires_at);

-- =============================================================
-- NOMINATIONS TABLE
-- Chain of nominations within a challenge
-- =============================================================
create table public.nominations (
  id uuid primary key default uuid_generate_v4(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  nominator_id uuid not null references public.users(id),
  nominee_id uuid not null references public.users(id),
  is_mutual boolean not null default false,
  chain_order int not null default 1,
  status text not null default 'pending' check (status in ('pending', 'completed', 'expired')),
  created_at timestamptz not null default now()
);

create index idx_nominations_challenge_nominee on public.nominations(challenge_id, nominee_id);
create index idx_nominations_challenge_nominator on public.nominations(challenge_id, nominator_id);
create index idx_nominations_nominee_status on public.nominations(nominee_id, status);

-- =============================================================
-- LETTERS TABLE
-- Anonymous letters created on mutual nomination
-- =============================================================
create table public.letters (
  id uuid primary key default uuid_generate_v4(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  nomination_id uuid not null references public.nominations(id),
  sender_id uuid not null references public.users(id),
  receiver_id uuid not null references public.users(id),
  content text not null check (char_length(content) between 10 and 500),
  is_revealed boolean not null default false,
  is_reported boolean not null default false,
  is_blinded boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_letters_receiver on public.letters(receiver_id);
create index idx_letters_challenge on public.letters(challenge_id);
create index idx_letters_sender on public.letters(sender_id);

-- =============================================================
-- PAYMENTS TABLE
-- In-app purchase records for identity reveal
-- =============================================================
create table public.payments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id),
  letter_id uuid references public.letters(id),
  challenge_id uuid not null references public.challenges(id),
  product_type text not null check (product_type in ('reveal_one', 'reveal_all')),
  amount int not null,
  store text not null default 'web' check (store in ('web', 'apple', 'google')),
  store_transaction_id text,
  status text not null default 'pending' check (status in ('pending', 'completed', 'refunded', 'failed')),
  created_at timestamptz not null default now()
);

create index idx_payments_user on public.payments(user_id);
create index idx_payments_letter on public.payments(letter_id);

-- =============================================================
-- REPORTS TABLE
-- User reports on letter content
-- =============================================================
create table public.reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid not null references public.users(id),
  letter_id uuid not null references public.letters(id),
  reason text not null check (reason in ('abuse', 'spam', 'harassment', 'other')),
  description text,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'resolved')),
  created_at timestamptz not null default now()
);

create index idx_reports_letter on public.reports(letter_id);
create unique index idx_reports_unique on public.reports(reporter_id, letter_id);

-- =============================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================

alter table public.users enable row level security;
alter table public.contacts enable row level security;
alter table public.questions enable row level security;
alter table public.challenges enable row level security;
alter table public.nominations enable row level security;
alter table public.letters enable row level security;
alter table public.payments enable row level security;
alter table public.reports enable row level security;

-- Users: can read own, update own
create policy "users_read_own" on public.users
  for select using (auth.uid() = id);

create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

create policy "users_read_friends" on public.users
  for select using (
    id in (
      select matched_user_id from public.contacts
      where user_id = auth.uid() and matched_user_id is not null
    )
  );

-- Contacts: users manage their own contacts
create policy "contacts_own" on public.contacts
  for all using (auth.uid() = user_id);

-- Questions: everyone can read active questions
create policy "questions_read" on public.questions
  for select using (is_active = true);

-- Challenges: participants can read, creators can create
create policy "challenges_read" on public.challenges
  for select using (
    creator_id = auth.uid()
    or id in (select challenge_id from public.nominations where nominee_id = auth.uid() or nominator_id = auth.uid())
  );

create policy "challenges_create" on public.challenges
  for insert with check (creator_id = auth.uid());

-- Nominations: participants can read challenge nominations, users can create
create policy "nominations_read" on public.nominations
  for select using (nominator_id = auth.uid() or nominee_id = auth.uid());

create policy "nominations_create" on public.nominations
  for insert with check (nominator_id = auth.uid());

-- Letters: receiver can read, sender can create
create policy "letters_read_receiver" on public.letters
  for select using (receiver_id = auth.uid());

create policy "letters_read_sender" on public.letters
  for select using (sender_id = auth.uid());

create policy "letters_create" on public.letters
  for insert with check (sender_id = auth.uid());

-- Payments: users manage own payments
create policy "payments_own" on public.payments
  for all using (auth.uid() = user_id);

-- Reports: users can create and read own
create policy "reports_own" on public.reports
  for all using (auth.uid() = reporter_id);

-- =============================================================
-- HELPER FUNCTIONS
-- =============================================================

-- Auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at
  before update on public.users
  for each row execute function public.handle_updated_at();

-- Function to check mutual nomination
create or replace function public.check_mutual_nomination(
  p_challenge_id uuid,
  p_nominator_id uuid,
  p_nominee_id uuid
)
returns boolean as $$
declare
  v_exists boolean;
begin
  select exists(
    select 1 from public.nominations
    where challenge_id = p_challenge_id
      and nominator_id = p_nominee_id
      and nominee_id = p_nominator_id
      and status = 'completed'
  ) into v_exists;
  return v_exists;
end;
$$ language plpgsql security definer;

-- Function to expire challenges (for cron job)
create or replace function public.expire_challenges()
returns void as $$
begin
  update public.challenges
  set status = 'expired'
  where status = 'active' and expires_at <= now();

  update public.nominations
  set status = 'expired'
  where status = 'pending'
    and challenge_id in (
      select id from public.challenges where status = 'expired'
    );
end;
$$ language plpgsql security definer;
