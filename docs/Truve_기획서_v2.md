# Truve 기획서 v2

**작성일**: 2026-04-19  
**버전**: v2.0 (코드 역분석 기반 전면 갱신)  
**작성자**: SangJun-Pyo  
**상태**: 프로토타입 구현 완료, 검증 중

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [핵심 가치 제안](#2-핵심-가치-제안)
3. [정보 구조 (IA)](#3-정보-구조-ia)
4. [기술 스택 및 아키텍처](#4-기술-스택-및-아키텍처)
5. [기능 명세](#5-기능-명세)
6. [데이터 모델](#6-데이터-모델)
7. [사용자 플로우](#7-사용자-플로우)
8. [API 명세](#8-api-명세)
9. [Mock 데이터 설계](#9-mock-데이터-설계)
10. [현재 제약사항](#10-현재-제약사항)
11. [향후 개발 로드맵](#11-향후-개발-로드맵)
12. [데모 시나리오](#12-데모-시나리오)

---

## 1. 프로젝트 개요

### 1.1 서비스명
**Truve** — Trust + Give

### 1.2 한 줄 정의
기부를 단순 결제가 아닌 **참여 권한**으로 전환하는 XRPL 기반 투명 기부 플랫폼

### 1.3 배경 및 문제 정의

| 현행 기부의 문제 | Truve의 해법 |
|---|---|
| 기부 후 사용처 확인 불가 | XRPL 온체인 증빙 → 불변 기록 |
| 단일 재단에만 기부 가능 | ETF형 번들 → 여러 재단에 비율 분산 |
| 기부자에게 의사결정 권한 없음 | Proof NFT 기반 거버넌스 투표 |
| 기부 행위의 낮은 몰입감 | 책가방/포트폴리오 UX |

### 1.4 프로토타입 목표

1. **기부 UX 검증**: 책가방/포트폴리오 방식의 재단 선택 + 비율 조정 흐름
2. **XRPL 연동 가능성 검증**: Xaman 지갑 QR 기부 플로우 (Testnet 기반)
3. **거버넌스 컨셉 검증**: Proof NFT 보유 기반 가중치 투표 흐름
4. **KFIP 2026 제출용 PoC** 완성

---

## 2. 핵심 가치 제안

### 2.1 기부의 사용성 (Usability)
- 재단을 하나씩 선택하거나 **ETF형 번들**(환경 집중, 균형 임팩트, 로컬 케어)로 한 번에 담기
- 슬라이더로 각 재단의 비율 자유 조정, 합계 100% 실시간 검증
- 자동 균등 배분 기능

### 2.2 기부의 신뢰성 (Transparency)
- 기부 트랜잭션을 **XRPL Testnet에 기록** → Explorer에서 누구나 확인 가능
- **Proof NFT** 발행: 기부 행위의 온체인 증명서
- 재단별 신뢰지표(trustMetrics) 제공: basic / verified / premium

### 2.3 기부의 참여성 (Governance)
- Proof NFT 보유자만 거버넌스 투표 참여 가능
- **티어 기반 가중치**: Seed(1표) / Sprout(2표) / Forest(3표)
- 투표 결과도 온체인(XRPL 메모) 기록

---

## 3. 정보 구조 (IA)

### 3.1 전체 페이지 구조

```
Truve
├── index.html          # 랜딩 페이지 (각 탭 진입점)
├── donation.html       # [탭 1] 기부 담기
├── foundations.html    # [탭 2] 재단 탐색
├── governance.html     # [탭 3] 거버넌스 투표
├── about.html          # [탭 4] Truve 설명
└── status.html         # [탭 5] 내 기부 Status
```

### 3.2 탭 간 연결 동선

```
재단 탐색 → "기부 담기에 추가" → 기부 담기 탭
           URL 파라미터: ?add={foundationId}

기부 담기 → 기부 완료 → Proof NFT 민팅 →  거버넌스 투표 자격 획득

거버넌스 투표 → NFT 미보유 → 기부 담기 탭 유도
```

### 3.3 상단 네비게이션 (공통)
모든 페이지에서 `src/shared/nav.ts`가 공통 탭 네비게이션 렌더링

---

## 4. 기술 스택 및 아키텍처

### 4.1 기술 스택

| 레이어 | 기술 | 버전 |
|---|---|---|
| 프론트엔드 | HTML5 + TypeScript | TS 6.0.2 |
| 번들러 | Vite | 8.0.8 |
| 백엔드 | Node.js + Express | Express 5.2.1 |
| TS 실행 | tsx | - |
| 병렬 실행 | concurrently | 9.2.1 |
| XRPL | xrpl.js | 4.6.0 |
| 외부 지갑 | Xaman Platform API | - |
| 환경변수 | dotenv | 17.4.2 |

### 4.2 시스템 아키텍처

```
Browser (Vite Dev Server :5173)
│
├── HTML Pages
├── TypeScript (src/main/*.ts)
│   ├── src/api/         ← Repository 추상화층
│   ├── src/services/    ← 비즈니스 로직
│   ├── src/store/       ← 상태 관리
│   └── src/shared/      ← 공통 컴포넌트
│
└── /api/* (Vite 프록시)
        ↓
    Express Server (:8787)
        ├── Xaman Platform API (외부)
        └── XRPL Testnet WebSocket (wss://s.altnet.rippletest.net:51233)
```

### 4.3 API 추상화 설계

리포지토리 패턴으로 데이터 소스 교체 가능성 확보:

```
FoundationRepository  ← Mock Adapter (현재)  ← 실 API Adapter (향후)
DonationRepository    ← Mock Adapter (현재)  ← 실 API Adapter (향후)
UserRepository        ← Mock Adapter (현재)  ← 실 API Adapter (향후)
```

Mock 데이터는 `src/mocks/*.json`에서 로드하며, `src/api/mock/mockDataLoader.ts`가 처리.

### 4.4 디렉토리 구조

```
Truve_v1/
├── src/
│   ├── main/                # 페이지별 엔트리포인트
│   │   ├── donation.ts      # 기부 담기 (핵심, 600+ 줄)
│   │   ├── governance.ts    # 거버넌스 투표
│   │   ├── foundations.ts   # 재단 탐색
│   │   ├── status.ts        # 기부 Status
│   │   └── about.ts         # 서비스 설명
│   ├── api/
│   │   ├── interfaces.ts    # 도메인 인터페이스
│   │   ├── provider.ts      # 저장소 팩토리
│   │   └── mock/            # Mock 구현체
│   ├── services/            # 비즈니스 로직
│   │   ├── xaman.ts         # Xaman 페이로드 생성/폴링
│   │   ├── xrpl.ts          # 트랜잭션 검증
│   │   ├── wallet.ts        # 지갑 세션 (localStorage)
│   │   ├── donations.ts     # 기부 이력 (localStorage)
│   │   ├── governance.ts    # 투표 기록 (localStorage)
│   │   └── proofNft.ts      # Proof NFT 민팅 요청
│   ├── shared/
│   │   └── nav.ts           # 공통 네비게이션
│   ├── store/
│   │   └── createStore.ts   # 간단한 상태 스토어
│   ├── types/
│   │   └── domain.ts        # 앱 상태 타입
│   └── mocks/               # 모의 데이터 (JSON)
│       ├── foundations.json
│       ├── bundles.json
│       ├── donations.json
│       └── users.json
├── server/
│   └── index.ts             # Express API 서버
├── assets/
│   └── styles.css
├── *.html                   # 각 페이지 HTML
├── vite.config.ts
├── tsconfig.json
├── package.json
└── .env.example
```

---

## 5. 기능 명세

### 5.1 기부 담기 탭 (`donation.html`)

#### 5.1.1 재단 목록 조회
- 7개 재단 카드 렌더링 (이름, 카테고리, 지역, 신뢰지표, 태그)
- "담기" 버튼으로 장바구니(cart 배열)에 추가

#### 5.1.2 ETF형 번들 선택
- 3개 번들 제공:
  - **균형 임팩트**: 그린어스(40%) + 넥스트클래스(30%) + 릴리프나우(30%)
  - **환경 집중**: 그린어스(70%) + 블루오션(30%)
  - **로컬 케어**: 넥스트클래스(50%) + 애니멀케어(50%)
- 번들 선택 시 해당 재단들이 자동으로 cart에 추가되고 비율 세팅

#### 5.1.3 비율 조정
- 각 재단마다 슬라이더(0~100%)로 비율 조정
- 실시간 합계 표시 (100% 미달/초과 시 경고)
- 자동 균등 배분 버튼

#### 5.1.4 지갑 연결 (Xaman SignIn)
- "지갑 연결" 버튼 → SignIn 페이로드 생성 → QR 팝업
- Xaman 앱에서 QR 스캔 및 서명
- 2초 폴링으로 상태 확인 (최대 180초 타임아웃)
- 연결 완료 시 XRPL 주소 표시, localStorage에 세션 저장
- "연결 해제" 버튼 제공

#### 5.1.5 기부 실행
- 금액 입력 (KRW, 최소 1,000원)
- KRW → XRP 환산 (환율 API 또는 고정 비율)
- Payment 페이로드 생성 (수취 주소, 금액, 메모에 재단 비율 포함)
- Xaman QR 팝업 → 사용자 서명
- 서명 완료 후 XRPL에서 트랜잭션 검증 (3초 폴링, 90초 타임아웃)
- localStorage에 기부 기록 저장 (`truve_local_donations_v1`)

#### 5.1.6 Proof NFT 민팅
- 기부 완료 후 "NFT 민팅" 버튼 활성화
- 기부 txHash를 메모에 포함한 Memo 페이로드 생성
- Xaman QR 서명 → XRPL에 메모 트랜잭션 기록
- 거버넌스 투표 자격 획득

---

### 5.2 재단 탐색 탭 (`foundations.html`)

#### 5.2.1 재단 검색
- 이름, 설명, 태그에서 문자열 검색 (대소문자 무시)

#### 5.2.2 카테고리 필터
- 전체 / 환경(climate) / 교육(education) / 의료(health) / 동물(animal) / 긴급구호(humanitarian)
- 필터 버튼 클릭으로 즉시 반영

#### 5.2.3 재단 카드
- 이름, 카테고리 배지, 지역, 설명, 태그
- 신뢰지표: 인증 등급(basic/verified/premium) + 증빙 커버리지 %
- "기부 담기에 추가" 버튼 → `donation.html?add={id}`로 이동

---

### 5.3 거버넌스 투표 탭 (`governance.html`)

#### 5.3.1 투표 자격 확인
- Proof NFT 보유 여부 확인 (localStorage `proofNfts`)
- 미보유 시: 안내 메시지 + "기부하러 가기" 링크 표시
- 보유 시: 티어 및 가중치 표시

#### 5.3.2 티어 가중치

| 티어 | 가중치 |
|---|---|
| Seed | 1표 |
| Sprout | 2표 |
| Forest | 3표 |

#### 5.3.3 투표 프로세스
- 현재 라운드(Round 1) 후보 4곳: Truve 커뮤니티 펀드, 그린어스, 넥스트클래스, 릴리프나우
- 지갑 미연결 시 SignIn 유도
- "이 재단에 투표" 버튼 → Memo 페이로드 생성 (proposalId, candidateId, weight 포함)
- QR 서명 → XRPL 트랜잭션 검증
- localStorage에 투표 기록 저장 (`truve_governance_records_v1`)

#### 5.3.4 투표 결과
- 실시간 바 차트 표시 (가중치 합산)
- 내 투표 표시 (투표 완료 후 비활성화)
- 각 후보별 트랜잭션 검증 상태 표시

---

### 5.4 Truve 설명 탭 (`about.html`)

서비스 구조 4단계 시각화:
1. 원화 결제 (오프체인, 카드/계좌)
2. 기부 증명 기록 (XRPL 메모 트랜잭션)
3. Proof NFT 발행 (온체인 증명서)
4. 내역 추적 및 거버넌스 참여

---

### 5.5 내 기부 Status 탭 (`status.html`)

#### 5.5.1 사용자 요약
- 이름, 티어(Seed/Sprout/Forest), 누적 기부금(KRW)

#### 5.5.2 최근 기부 타임라인
- 최근 3건 단계별 진행 표시:
  - 결제 완료 → 해시 기록 → NFT 발행 → 정산 완료

#### 5.5.3 기부 내역 테이블
- 일시, 금액(KRW), 결제/증빙/NFT/정산 상태
- XRPL Explorer 링크 (Testnet)
- Mock 데이터 + 실제 기부 기록 통합 표시

---

## 6. 데이터 모델

### 6.1 재단 (Foundation)

```typescript
interface Foundation {
  id: string;                   // "fnd_green-earth"
  name: string;                 // "그린어스 얼라이언스"
  category: "climate" | "education" | "health" | "animal" | "humanitarian";
  region: string;               // "KR", "APAC", "Global"
  description: string;
  tags: string[];
  walletAddress: string;        // XRPL 테스트넷 주소
  trustMetrics: {
    level: "basic" | "verified" | "premium";
    proofCoverage: number;      // 0~100 (%)
  };
}
```

### 6.2 기부 번들 (DonationBundle)

```typescript
interface DonationBundle {
  id: string;
  name: string;
  summary: string;
  theme: string;
  allocations: Array<{
    foundationId: string;
    ratioPct: number;           // 합계 = 100
  }>;
}
```

### 6.3 기부 기록 (DonationRecord)

```typescript
interface DonationRecord {
  id: string;
  userId: string;
  donatedAt: string;            // ISO 8601
  amountKrw: number;
  allocations: BundleAllocation[];

  // 처리 상태 4단계
  paymentStatus:    "paid" | "pending" | "failed";
  proofStatus:      "recorded" | "pending" | "error";
  nftStatus:        "minted" | "pending" | "error";
  settlementStatus: "scheduled" | "done" | "error";

  // 온체인 데이터
  txHash?: string;
  proofNftId?: string;
  explorerUrl?: string;
  validationStatus?: "pending" | "signed" | "validated" | "failed";
}
```

### 6.4 사용자 프로필 (UserProfile)

```typescript
interface UserProfile {
  id: string;
  displayName: string;
  tier: "seed" | "sprout" | "forest";
  joinedAt: string;
  totalDonatedKrw: number;
}
```

### 6.5 거버넌스 투표 기록 (GovernanceVoteRecord)

```typescript
interface GovernanceVoteRecord {
  id: string;
  userId: string;
  proposalId: string;
  candidateId: string;
  candidateName: string;
  weight: number;               // 티어 기반 가중치
  votedAt: string;
  txHash?: string;
  validationStatus: "pending" | "signed" | "validated" | "failed";
}
```

### 6.6 지갑 세션 (WalletSession)

```typescript
interface WalletSession {
  account: string;              // XRPL 주소 (r...)
  connectedAt: string;
  lastPayloadUuid?: string;
}
```

localStorage 키: `truve_wallet_session_v1`

---

## 7. 사용자 플로우

### 7.1 기부 플로우

```
[재단 탐색] 또는 [기부 담기]에서 시작
    │
    ▼
재단 선택 / 번들 선택
    │
    ▼
비율 조정 (슬라이더, 합계 = 100%)
    │
    ▼
금액 입력 (KRW)
    │
    ▼
지갑 연결 (Xaman SignIn QR)
    ├── Xaman 앱 QR 스캔 → 서명
    └── 폴링 2초 간격, 타임아웃 180초
    │
    ▼
기부 실행 (Xaman Payment QR)
    ├── Xaman 앱 QR 스캔 → 서명
    └── XRPL 트랜잭션 제출
    │
    ▼
XRPL 검증 대기 (3초 폴링, 타임아웃 90초)
    │
    ▼
기부 완료 화면
    ├── txHash 표시
    ├── XRPL Explorer 링크 제공
    └── localStorage 기록 저장
    │
    ▼
[선택] Proof NFT 민팅
    ├── Memo 페이로드 생성
    ├── Xaman QR 서명
    └── 거버넌스 투표 자격 획득
```

### 7.2 거버넌스 투표 플로우

```
거버넌스 탭 진입
    │
    ▼
Proof NFT 보유 확인
    ├── 미보유: 기부 유도 메시지 → 기부 담기로 이동
    └── 보유: 티어/가중치 표시
    │
    ▼
지갑 연결 (미연결 시)
    │
    ▼
후보 재단 선택
    │
    ▼
투표 실행 (Xaman Memo QR)
    ├── 페이로드: {proposalId, candidateId, weight}
    └── XRPL 트랜잭션 검증
    │
    ▼
결과 반영 (실시간 바 차트 업데이트)
```

---

## 8. API 명세

### 8.1 서버 엔드포인트 (Express :8787)

| 메서드 | 경로 | 설명 | 요청 바디 |
|---|---|---|---|
| GET | `/api/health` | 헬스 체크 | - |
| POST | `/api/xaman/signin` | SignIn 페이로드 생성 | `{ returnUrl? }` |
| POST | `/api/xaman/payment` | Payment 페이로드 생성 | `{ destination, amountDrops, memo }` |
| POST | `/api/xaman/memo` | Memo 페이로드 생성 | `{ account, memoData, memoType }` |
| GET | `/api/xaman/payload/:uuid` | 페이로드 상태 조회 | - |
| GET | `/api/xrpl/tx/:hash` | 트랜잭션 검증 상태 | - |

### 8.2 Xaman 페이로드 응답 구조

```typescript
// 생성 응답
{
  uuid: string;
  qrPng: string;           // Base64 PNG
  deepLink: string;        // xumm://... deep link
  nextUrl: string;
}

// 상태 조회 응답
{
  resolved: boolean;
  signed: boolean;
  rejected: boolean;
  txHash?: string;         // 서명 완료 시
  account?: string;        // SignIn 시 계정 주소
}
```

### 8.3 XRPL 트랜잭션 응답 구조

```typescript
{
  validated: boolean;
  txHash: string;
  explorerUrl: string;     // https://testnet.xrpl.org/transactions/{hash}
  ledgerIndex?: number;
  fee?: string;
}
```

### 8.4 환경 변수 (.env)

```
API_PORT=8787
FRONTEND_ORIGIN=http://localhost:5173

# Xaman Platform API (필수)
XAMAN_API_KEY=
XAMAN_API_SECRET=

# XRPL
XRPL_TESTNET_WS=wss://s.altnet.rippletest.net:51233
XRPL_TESTNET_DONATION_DESTINATION=rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe
XRPL_TESTNET_GOVERNANCE_DESTINATION=rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe
```

---

## 9. Mock 데이터 설계

### 9.1 재단 마스터 (foundations.json)

| ID | 이름 | 카테고리 | 지역 | 인증 레벨 | 커버리지 |
|---|---|---|---|---|---|
| fnd_green-earth | 그린어스 얼라이언스 | 환경 | KR | verified | 92% |
| fnd_blue-ocean | 블루오션 레스큐 | 환경 | APAC | verified | 88% |
| fnd_next-class | 넥스트클래스 재단 | 교육 | KR | premium | 95% |
| fnd_open-health | 오픈헬스 파트너스 | 의료 | Global | basic | 84% |
| fnd_animal-care | 애니멀케어 네트워크 | 동물 | KR | verified | 90% |
| fnd_truve-community | Truve 커뮤니티 펀드 | 긴급구호 | KR | verified | 80% |
| fnd_relief-now | 릴리프나우 코얼리션 | 긴급구호 | Global | premium | 87% |

> Truve 커뮤니티 펀드는 플랫폼 자체 후원 트랙으로, 투명성 공개 기준 별도 적용

### 9.2 번들 (bundles.json)

| ID | 이름 | 구성 |
|---|---|---|
| bundle_balanced | 균형 임팩트 | 그린어스 40% + 넥스트클래스 30% + 릴리프나우 30% |
| bundle_eco | 환경 집중 | 그린어스 70% + 블루오션 30% |
| bundle_local | 로컬 케어 | 넥스트클래스 50% + 애니멀케어 50% |

### 9.3 사용자 (users.json)

| ID | 이름 | 티어 |
|---|---|---|
| usr_demo_001 | 김상진 | Sprout |
| usr_demo_002 | 박민지 | Seed |

### 9.4 기부 이력 (donations.json)

| ID | 금액 | 결제 | 증빙 | NFT | 정산 |
|---|---|---|---|---|---|
| don_001 | 100,000 KRW | paid | recorded | minted | done |
| don_002 | 50,000 KRW | paid | recorded | minted | done |
| don_003 | 70,000 KRW | paid | recorded | pending | scheduled |

---

## 10. 현재 제약사항

### 10.1 기술적 제약

| 항목 | 현황 | 영향 |
|---|---|---|
| 영속 DB | 미구현 (로컬 스토리지 + Mock JSON) | 기기 간 데이터 공유 불가 |
| Xaman 키 관리 | 환경변수 (서버 측 보관) | 운영 환경 보안 검토 필요 |
| NFT 민팅 | 메모 트랜잭션 기반 기록만 | 실제 XRPL NFT 발행 미구현 |
| KRW→XRP 환산 | 고정 비율 또는 미연동 | 실시간 환율 반영 필요 |
| 멀티유저 | Mock 단일 사용자 기준 | 실제 인증/세션 체계 미구현 |

### 10.2 운영적 제약

| 항목 | 현황 |
|---|---|
| 규제 준수 | 기부금품법, 전자금융거래법 미검토 |
| 보안 감사 | 감사 로그, 접근 제어 미구현 |
| KYC/AML | 신원 확인 체계 없음 |
| Testnet | 실제 XRP 아닌 Faucet XRP 사용 |

---

## 11. 향후 개발 로드맵

### Phase 1 (현재): 프로토타입 PoC
- [x] 재단 탐색 + 기부 담기 + 비율 조정 UX
- [x] Xaman SignIn / Payment / Memo 연동 (Testnet)
- [x] XRPL 트랜잭션 검증
- [x] Proof NFT 민팅 요청 플로우
- [x] 거버넌스 투표 (로컬 스토리지 기반)
- [x] 기부 Status 페이지

### Phase 2: 백엔드 강화 + 영속성
- [ ] 영속 DB 연동 (PostgreSQL 또는 Supabase)
- [ ] 실시간 KRW→XRP 환율 API 연동
- [ ] 기부/투표 내역 서버 저장
- [ ] 감사 로그 체계 구축
- [ ] Xaman API 키 보안 강화 (서버 측 완전 격리)

### Phase 3: 기능 확장
- [ ] 실제 XRPL NFT 발행 (NFTokenMint)
- [ ] 정기 기부 및 자동 리밸런싱
- [ ] 커뮤니티 탭 (재단 하위 → 상위 탭 분리)
- [ ] 거버넌스 안건 관리 (제안/마감/실행 추적)
- [ ] 번들 추천/개인화 알고리즘

### Phase 4: 운영 레벨
- [ ] Mainnet 전환
- [ ] KYC/AML 체계 도입
- [ ] 규제 준수 법률 검토 완료
- [ ] Truve 커뮤니티 펀드 사용처 공개 기준 수립
- [ ] 이해상충 방지 정책 (Truve 안건 라벨링)

---

## 12. 데모 시나리오

### 시나리오 A: 첫 기부

```
1. index.html → "기부 담기" 탭 진입
2. "균형 임팩트" 번들 선택 → 재단 3개 자동 담기
3. 슬라이더로 그린어스 비율을 50%로 조정, 나머지 재조정
4. 금액 10,000원 입력
5. "지갑 연결" → Xaman QR 스캔 → 연결 완료
6. "기부하기" → Payment QR 스캔 → 서명
7. 트랜잭션 검증 완료 → txHash + Explorer 링크 확인
8. "Proof NFT 민팅" → Memo QR 서명
9. status.html에서 기부 내역 확인
```

### 시나리오 B: 거버넌스 투표

```
1. governance.html → NFT 보유 확인 (Sprout 등급, 2표)
2. 지갑 연결 (이미 연결된 경우 Skip)
3. "그린어스 얼라이언스"에 투표 버튼 클릭
4. Memo QR 생성 → Xaman 서명
5. 트랜잭션 검증 완료 → 투표 결과 반영 (가중치 2표 추가)
```

### 시나리오 C: 재단 탐색 후 기부 연결

```
1. foundations.html → "환경" 카테고리 필터
2. "블루오션 레스큐" 카드에서 "기부 담기에 추가" 클릭
3. donation.html?add=fnd_blue-ocean 자동 이동
4. 블루오션이 cart에 자동 추가된 상태로 기부 진행
```

---

## 부록 A: 개발 환경 설정

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env
# .env에 XAMAN_API_KEY, XAMAN_API_SECRET 입력

# 개발 서버 실행 (프론트 :5173 + 백엔드 :8787 동시 실행)
npm run dev

# 타입 검사
npm run typecheck

# 빌드
npm run build
```

---

## 부록 B: 주요 로컬 스토리지 키

| 키 | 내용 |
|---|---|
| `truve_wallet_session_v1` | 연결된 Xaman 지갑 세션 |
| `truve_local_donations_v1` | 로컬에 저장된 기부 기록 |
| `truve_governance_records_v1` | 거버넌스 투표 기록 |
| `TRUVE_GOVERNANCE_ROUND_1` | Round 1 투표 집계 |
| `truve_proof_nfts_v1` | Proof NFT 기록 |

---

*본 문서는 Truve_v1 코드베이스를 역분석하여 작성한 기획서입니다.*  
*최신 코드 상태를 기준으로 작성되었으며, 구현이 변경될 경우 함께 갱신이 필요합니다.*
