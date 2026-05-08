# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

한국/미국 주식 포트폴리오 관리 웹앱. 멀티 계좌, 실시간 수익 계산, 섹터 분류, 자산 현황을 제공한다.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS (다크 모드 기반)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Auth & DB**: Supabase

## Commands

```bash
npm run dev       # 개발 서버 실행
npm run build     # 프로덕션 빌드
npm run lint      # ESLint 검사
```

## Architecture

App Router 구조를 사용하며, 기능별로 컴포넌트를 분리한다.

```
app/
  layout.tsx          # 루트 레이아웃 (다크 모드, Supabase Provider)
  page.tsx            # 메인 대시보드
  (auth)/             # 인증 관련 라우트
components/
  sidebar/            # 계좌 목록 및 계좌 추가 UI
  portfolio/          # 종목 입력, 수익 계산 카드
  charts/             # Recharts 기반 그래프 (원형 자산 비중 등)
  ui/                 # 공용 UI 컴포넌트
lib/
  supabase/           # Supabase 클라이언트 및 DB 쿼리
  finance/            # 주가 조회 로직 (한국/미국 종목)
```

## Key Features & Rules

### 계좌(사람) 관리
- 좌측 사이드바에서 계좌 추가: 이름, 계좌번호, 아이콘 설정
- 계좌별로 포트폴리오를 독립적으로 관리

### 종목 입력
- 한국(KRX) / 미국(NYSE, NASDAQ) 종목 코드 입력 시 종목 정보 자동 조회
- 매수 시점: 현재가 또는 과거 날짜 선택 가능

### 수익 계산
- Google Finance 스타일: 평가손익, 수익률을 실시간으로 표시
- 상승: 빨간색(`text-red-500`), 하락: 파란색(`text-blue-500`) — 한국 증시 관례 적용

### 자산 관리
- 원화(KRW) / 달러(USD) 입력 스위칭
- 현금 입출금 기능
- 전체 자산 내 현금 비중: 원형 그래프(Recharts `PieChart`)로 표시

### 섹터 분류
- 반도체, 전력, 바이오 등 섹터 태그를 종목별로 설정·변경 가능

## Development Principles

- 컴포넌트는 기능 단위로 분리한다. 하나의 파일이 하나의 역할만 담당하도록 유지한다.
- 코드 가독성을 최우선으로 한다. 복잡한 로직은 커스텀 훅(`hooks/`)으로 추출한다.
- 수정 후에는 반드시 `npm run dev`로 실행하고 브라우저에서 결과를 직접 확인(스크린샷)한 뒤 완료를 보고한다.

## Design System

- 기본 테마: 다크 모드
- 상승: `text-red-500` / `bg-red-500`
- 하락: `text-blue-500` / `bg-blue-500`
- 아이콘 라이브러리: Lucide React만 사용
