-- v2.1: 패스 메커니즘 및 최대 참여 인원
-- CHALLENGES.max_participants: 챌린지당 최대 30명
-- NOMINATIONS.is_pass: 생성자의 패스(true) vs 참여자의 지목(false)

alter table public.challenges
  add column if not exists max_participants int not null default 30;

comment on column public.challenges.max_participants is '챌린지당 최대 참여자 수 (기본 30). v2.1';

alter table public.nominations
  add column if not exists is_pass boolean not null default false;

comment on column public.nominations.is_pass is '패스 여부. 생성자만 true, 참여자 지목은 false. v2.1';

create index if not exists idx_nominations_challenge_is_pass
  on public.nominations(challenge_id, is_pass);
