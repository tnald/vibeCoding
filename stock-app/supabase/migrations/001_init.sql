-- ============================================================
-- 포트폴리오 앱 초기 스키마
-- Supabase SQL Editor에 이 파일 전체를 붙여넣고 실행하세요.
-- ============================================================

-- 1. 계좌 테이블
create table if not exists accounts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  account_number text,
  icon        text not null default '👤',
  cash_krw    numeric not null default 0,
  cash_usd    numeric not null default 0,
  created_at  timestamptz default now()
);

-- 2. 종목 테이블
create table if not exists stocks (
  id          uuid primary key default gen_random_uuid(),
  account_id  uuid references accounts(id) on delete cascade not null,
  ticker      text not null,
  name        text not null,
  market      text not null check (market in ('KR', 'US')),
  sector      text not null,
  quantity    numeric not null,
  avg_price   numeric not null,
  currency    text not null check (currency in ('KRW', 'USD')),
  buy_date    date not null,
  created_at  timestamptz default now()
);

-- 3. Row Level Security 활성화
alter table accounts enable row level security;
alter table stocks   enable row level security;

-- 4. 계좌 RLS: 본인 계좌만 조회/수정/삭제
create policy "accounts_select" on accounts for select using (auth.uid() = user_id);
create policy "accounts_insert" on accounts for insert with check (auth.uid() = user_id);
create policy "accounts_update" on accounts for update using (auth.uid() = user_id);
create policy "accounts_delete" on accounts for delete using (auth.uid() = user_id);

-- 5. 종목 RLS: 본인 계좌에 속한 종목만 접근
create policy "stocks_select" on stocks for select
  using (account_id in (select id from accounts where user_id = auth.uid()));

create policy "stocks_insert" on stocks for insert
  with check (account_id in (select id from accounts where user_id = auth.uid()));

create policy "stocks_update" on stocks for update
  using (account_id in (select id from accounts where user_id = auth.uid()));

create policy "stocks_delete" on stocks for delete
  using (account_id in (select id from accounts where user_id = auth.uid()));
