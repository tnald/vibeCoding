# PortfolioX — 멀티 계좌 주식 포트폴리오 관리 앱

> 한국(KRX) 및 미국(NYSE/NASDAQ) 주식을 멀티 계좌로 통합 관리하는 웹 애플리케이션

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-green?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)

---

## 목차

- [프로젝트 개요](#프로젝트-개요)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [데이터베이스 스키마](#데이터베이스-스키마)
- [API 명세](#api-명세)
- [시작하기](#시작하기)
- [환경 변수](#환경-변수)
- [아키텍처 설계](#아키텍처-설계)
- [알려진 한계점](#알려진-한계점)

---

## 프로젝트 개요

PortfolioX는 여러 증권 계좌의 주식 포트폴리오를 한 곳에서 통합 관리할 수 있는 웹 앱입니다.  
실시간 주가 조회(네이버 금융 / Yahoo Finance), 손익 계산, 섹터별 자산 분석, 매수·매도 거래 내역 관리를 지원합니다.

**대상 사용자:** 한국 주식과 미국 주식을 동시에 보유하며 계좌가 여러 개인 개인 투자자

---

## 주요 기능

### 계좌 관리
- 이모지 아이콘으로 계좌 구분 (15종 선택)
- 계좌별 원화(KRW) · 달러(USD) 현금 잔고 관리
- 입금 / 출금 기능

### 주식 거래 관리
- 한국 주식 (KRX) 및 미국 주식 (NYSE/NASDAQ) 모두 지원
- 매수 · 매도 거래 기록 (음수 수량으로 매도 관리)
- 종목별 거래 내역 조회 및 인라인 편집 (날짜, 가격, 수량)
- 티커 자동완성 (한국 13개 · 미국 17개 주요 종목)
- 시장 자동 감지: 숫자만이면 KRX, 영숫자 혼합이면 US

### 실시간 수익률 계산
- 현재가 기반 평가금액, 손익금액, 수익률(%) 실시간 표시
- 한국 주식 관습에 따라 수익=빨강, 손실=파랑으로 표시
- 원화/달러 표시 전환 (1USD = 1,380 KRW 고정 환율)

### 포트폴리오 시각화
- **섹터 도넛 차트:** 내원=현금, 외원=섹터별 주식 비중
- **수익률 바 차트:** 종목별 수익률 가로 막대그래프
- **8개 통계 카드:** 순자산, 총손익, 수익률, 현금, 국내/해외 평가금액 및 손익
- 계좌 전환 시 스켈레톤 로딩 UI

### 섹터 분류
반도체 · 전력 · 바이오 · IT · 금융 · 소비재 · 에너지 · 기타 (8개 섹터)

### 테마
다크 모드(기본) / 라이트 모드 전환, `localStorage` 영속화

### 인증
- 사용자명 → `{username}@portfoliox.app` 이메일로 변환 후 Supabase Auth 처리
- JWT 세션 기반, SSR 미들웨어로 라우트 보호

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 14 (App Router) |
| 언어 | TypeScript 5 |
| 스타일링 | Tailwind CSS 3.4, CSS Variables |
| 데이터 시각화 | Recharts 3.8 |
| 아이콘 | Lucide React |
| 인증 · DB | Supabase (Auth + PostgreSQL) |
| Supabase SSR | @supabase/ssr 0.10 |
| 배포 | Vercel |
| 주가 데이터 | 네이버 금융 API (KRX), Yahoo Finance API (US) |

---

## 프로젝트 구조

```
stock-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # 루트 레이아웃 (메타데이터, 폰트)
│   │   ├── page.tsx                    # 메인 대시보드
│   │   ├── globals.css                 # CSS 변수 (테마 색상)
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx          # 로그인 페이지
│   │   │   └── signup/page.tsx         # 회원가입 페이지
│   │   └── api/
│   │       └── price/route.ts          # 주가 조회 API Route
│   ├── components/
│   │   ├── sidebar/
│   │   │   ├── AccountSidebar.tsx      # 계좌 목록 · 선택
│   │   │   └── AddAccountModal.tsx     # 계좌 추가 모달
│   │   ├── dashboard/
│   │   │   ├── DashboardHeader.tsx     # 헤더 (현금관리, 테마, 로그아웃)
│   │   │   ├── AccountSummaryCard.tsx  # 8개 통계 카드
│   │   │   ├── StatCard.tsx            # 개별 통계 카드
│   │   │   └── EmptyDashboard.tsx      # 계좌 미선택 시 화면
│   │   ├── portfolio/
│   │   │   ├── StockListSection.tsx    # KR/US 주식 테이블
│   │   │   ├── PortfolioTable.tsx      # 테이블 컨테이너
│   │   │   ├── StockRow.tsx            # 종목 행
│   │   │   ├── AddStockModal.tsx       # 매수 추가 모달
│   │   │   ├── StockTransactionModal.tsx # 거래 내역 모달
│   │   │   ├── SellStockModal.tsx      # 매도 모달
│   │   │   └── CashPanel.tsx           # 현금 패널
│   │   └── charts/
│   │       ├── PortfolioAnalysisChart.tsx # 섹터 도넛 차트
│   │       └── StockReturnChart.tsx    # 수익률 바 차트
│   ├── hooks/
│   │   ├── useAccounts.ts              # 계좌 CRUD
│   │   ├── useStocks.ts                # 주식 CRUD
│   │   ├── useQuotes.ts                # 실시간 주가 조회
│   │   ├── useCurrencyFormat.ts        # 금액 포맷팅
│   │   └── useTheme.ts                 # 다크/라이트 모드
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts               # 브라우저 Supabase 클라이언트
│   │   │   ├── server.ts               # 서버 Supabase 클라이언트
│   │   │   └── queries.ts              # DB 쿼리 함수
│   │   └── finance/
│   │       └── tickerUtils.ts          # 티커 감지 · 자동완성
│   ├── types/
│   │   └── index.ts                    # TypeScript 타입 정의
│   └── middleware.ts                   # 인증 미들웨어
├── public/
├── .env.local                          # 환경 변수 (Supabase 키)
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 데이터베이스 스키마

### `accounts` 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | 계좌 고유 ID |
| user_id | UUID (FK) | auth.users 참조 |
| name | text | 계좌 이름 |
| account_number | text (nullable) | 계좌번호 |
| icon | text | 이모지 아이콘 |
| cash_krw | numeric | 원화 현금 잔고 |
| cash_usd | numeric | 달러 현금 잔고 |
| created_at | timestamp | 생성 시각 |

### `stocks` 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | 거래 고유 ID |
| account_id | UUID (FK) | accounts.id 참조 |
| ticker | text | 종목 코드 (예: 005930, AAPL) |
| name | text | 종목명 |
| market | text | "KR" 또는 "US" |
| sector | text | 섹터 분류 (8개) |
| quantity | numeric | 수량 (매도 시 음수) |
| avg_price | numeric | 평균 매수 단가 |
| currency | text | "KRW" 또는 "USD" |
| buy_date | text | 매수일 (YYYY-MM-DD) |
| created_at | timestamp | 생성 시각 |

> **매도 처리 방식:** 별도 삭제 없이 음수 수량 레코드를 추가하여 `netQuantity = sum(quantity)`로 보유 수량을 계산합니다.

---

## API 명세

### `GET /api/price`

주식 현재가 또는 특정 날짜 종가를 조회합니다.

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| ticker | string | O | 종목 코드 (예: `005930`, `AAPL`) |
| market | string | X | `KR` 또는 `US` (기본값: `US`) |
| date | string | X | 과거 날짜 조회 (YYYY-MM-DD) |

**Response**

```json
{
  "ticker": "AAPL",
  "name": "Apple Inc.",
  "price": 150.25,
  "currency": "USD",
  "market": "US",
  "change": 2.50,
  "changePercent": 1.69
}
```

**데이터 소스 (Fallback 전략)**

- **한국 주식:** 네이버 모바일 API → 네이버 Polling API → 네이버 금융 HTML 스크래핑
- **미국 주식:** Yahoo Finance Chart API (query1) → Yahoo Finance (query2)

---

## 시작하기

### 사전 요구사항

- Node.js 18+
- npm
- Supabase 프로젝트 (무료 플랜 가능)

### 설치

```bash
git clone https://github.com/tnald/vibeCoding.git
cd vibeCoding/stock-app
npm install
```

### Supabase 테이블 생성

Supabase SQL Editor에서 아래 쿼리를 실행합니다.

```sql
-- accounts 테이블
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  account_number TEXT,
  icon TEXT NOT NULL DEFAULT '💼',
  cash_krw NUMERIC NOT NULL DEFAULT 0,
  cash_usd NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own accounts"
  ON accounts FOR ALL USING (auth.uid() = user_id);

-- stocks 테이블
CREATE TABLE stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  name TEXT NOT NULL,
  market TEXT NOT NULL CHECK (market IN ('KR', 'US')),
  sector TEXT NOT NULL DEFAULT '기타',
  quantity NUMERIC NOT NULL,
  avg_price NUMERIC NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('KRW', 'USD')),
  buy_date TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own stocks"
  ON stocks FOR ALL
  USING (account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid()));
```

### 환경 변수 설정

`.env.local` 파일을 생성하고 Supabase 키를 입력합니다.

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 개발 서버 실행

```bash
npm run dev
# http://localhost:3000 에서 확인
```

---

## 환경 변수

| 변수명 | 설명 |
|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |

> `NEXT_PUBLIC_` 접두사가 붙은 변수는 클라이언트에 노출됩니다. Supabase의 Row Level Security(RLS)가 데이터를 보호합니다.

---

## 아키텍처 설계

### 인증 흐름

```
사용자 접속
    │
    ▼
middleware.ts (Supabase SSR 세션 검증)
    │
    ├── 미인증 → /login 리다이렉트
    └── 인증됨 → 대시보드 렌더링
```

**로그인 방식:** 사용자명 입력 → `{username}@portfoliox.app` 이메일로 변환 → Supabase Auth

### 데이터 흐름

```
page.tsx (서버 컴포넌트)
    │
    ├── useAccounts() ──────────────→ Supabase accounts 테이블
    ├── useStocks(accountId) ───────→ Supabase stocks 테이블
    └── useQuotes(stocks) ──────────→ /api/price (중복 티커 제거 후 병렬 요청)
                                            │
                                            ├── KR: 네이버 금융 API (3단계 폴백)
                                            └── US: Yahoo Finance API (2단계 폴백)
```

### 상태 관리

별도의 전역 상태 라이브러리 없이 React Custom Hooks 패턴으로 관리합니다.

| 훅 | 역할 |
|----|------|
| `useAccounts` | 계좌 목록 CRUD + 현금 관리 |
| `useStocks` | 종목 거래 CRUD |
| `useQuotes` | 실시간 주가 조회 (Promise.allSettled 병렬 처리) |
| `useCurrencyFormat` | 금액 포맷팅 (₩/$ 전환) |
| `useTheme` | 다크/라이트 모드 |

### 수익률 계산 공식

```
netQuantity = sum(quantity)              // 매도는 음수
avgPrice    = sum(buy_qty × buy_price) / sum(buy_qty)
profit      = (currentPrice − avgPrice) × netQuantity
returnPct   = profit / (avgPrice × netQuantity) × 100
```

---

## 알려진 한계점

| 항목 | 현황 | 개선 방향 |
|------|------|-----------|
| USD/KRW 환율 | 1,380원 고정 | 실시간 환율 API 연동 |
| 티커 자동완성 | 30개 종목 하드코딩 | 검색 API 연동 |
| 주가 업데이트 | 수동 갱신 | WebSocket 실시간 스트리밍 |
| 과거 성과 | 미지원 | 포트폴리오 수익률 히스토리 |
| 내보내기 | 미지원 | CSV / PDF 내보내기 |
| 리밸런싱 알림 | 미지원 | 목표 비중 설정 및 알림 |
| 서버사이드 입력 검증 | 미적용 | API Route 유효성 검사 추가 |

---

## 라이선스

This project is for personal/educational use.
