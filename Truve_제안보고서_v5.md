# Truve
## 한국 최초의 가상자산 기부 영수증 인프라

> **"We are not a donation platform. We are receipt infrastructure for crypto giving."**

**Korea Financial Innovation Program 2026 제출용 제안 보고서 v5 (구현 명세 포함)**

---

## 📋 v5 변경 요약 (v4 대비)

| 영역 | v4 | v5 |
|---|---|---|
| 정체성 | 거버넌스 레이어 + B2B ESG SaaS | **가상자산 기부 영수증 인프라** |
| 메인 수익 | B2B ESG SaaS 구독 | **재단 인프라 구독 + 기업 ESG SaaS (1+1)** |
| 거버넌스 투표 | MVP 포함 | **Phase 2 이연 (법적 리스크)** |
| 디지털 자산 | XRP, Proof NFT만 언급 | **XRP, RLUSD, USDC on XRPL, XLS-20 NFT 명시** |
| XRPL 기능 활용 | 추상적 언급 | **NFT/Payment/Memo/TrustLine 5주 구현, DEX/Escrow Phase 2** |
| ETF 묶음 | Phase 2 | **MVP 포함 (이미 구현됨, 사용자 커스텀 방식)** |
| 절세 시뮬레이터 | Phase 2 | **MVP 포함 (AI API 기반 참고용)** |
| 종교 NFT | — | **검토 후 폐기** |

---

## 1. 보고서 목적

Truve는 **한국 최초의 가상자산 기부 영수증 인프라**를 구축하는 XRPL 기반 B2B SaaS입니다.

기존 기부 플랫폼이 "원화 기부 중개"에 머물렀다면, Truve는 **가상자산 기부 영수증을 위변조 불가능한 NFT로 발행하고**, 재단·기업·세무법인이 이 영수증 인프라를 사용하는 대가로 구독료를 지불하는 **B2B 인프라 비즈니스**입니다.

본 보고서는 KFIP 2026 1차 서류 심사 기준(디지털 자산 활용 + XRPL 기능 활용)에 맞춰, **MVP 5주 내 구현 가능한 기능 명세**를 포함하여 작성됩니다. 본 문서는 그대로 개발 에이전트(Claude Code, Codex 등)에 전달되어 프로토타입 구현이 시작될 수 있도록 설계되었습니다.

---

## 2. 디지털 자산 & XRPL 활용 요약

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 Truve의 디지털 자산 & XRPL 활용 요약
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▷ 다루는 디지털 자산
  • XRP (네이티브 자산, 기부 처리 + 트랜잭션 수수료)
  • RLUSD (Ripple 공식 스테이블코인, 변동성 회피용)
  • USDC on XRPL (글로벌 호환)
  • Truve Receipt NFT (XLS-20 자체 발행, 영수증 자체가 디지털 자산)
  • Truve ESG Badge NFT (XLS-20 자체 발행, 기업 증빙용)

▷ 활용하는 XRPL 핵심 기능 (MVP 5주)
  ① XLS-20 NFT — 위변조 불가능한 가상자산 기부 영수증 발행
  ② Payment — 기부자 → 재단 직접 송금 (XRP / RLUSD / USDC)
  ③ Memo — 기부 목적 / 캠페인 ID / KYC 해시 온체인 영구 기록
  ④ DestinationTag — 재단 내 캠페인 자금 구분
  ⑤ TrustLine — 재단의 RLUSD/USDC 수령 자동 설정

▷ Phase 2 확장 기능
  ⑥ DEX — 재단의 가상자산 → 안정 자산 자동 환전
  ⑦ Escrow — 캠페인 목표 미달 시 자동 환불
  ⑧ AMM — 효율적 환전 풀
  ⑨ Multi-signing — 재단 내부 거버넌스
  ⑩ Freeze/Clawback — 의심 거래 대응

▷ 핵심 차별점
  XRPL의 NFT 네이티브 표준(XLS-20)을 활용해
  한국 최초의 "가상자산 기부 영수증 인프라"를 구축한다.
  자체 스마트 컨트랙트 없이, XRPL 네이티브 기능만으로 작동한다.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 3. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 서비스명 | Truve (Trust + Give) |
| 핵심 가치 | 가상자산 기부의 영수증·증빙·세무 인프라 |
| 타겟 | (B2C) 가상자산 보유 기부자, (B2B) 재단·기업·세무법인 |
| 기술 기반 | XRPL (XLS-20 NFT) + 하이브리드 오프체인 KYC/세무 처리 |
| **메인 수익** | **재단 인프라 구독료(40%) + 기업 ESG SaaS(30%) + 거래소·세무법인 채널(30%)** |
| MVP 기간 | 5주 (Final Pitch Day: 6월 25일) |

### 한 줄 요약

> 가상자산은 거래소에서 흐르고, 영수증은 XRPL 위에 영원히 남는다.
> Truve는 재단이 가상자산 기부 시장에 진입할 수 있게 하는 인프라다.

---

## 4. 문제 정의

### 한국 가상자산 기부 시장의 4가지 구조적 문제

**1. 재단의 가상자산 기부 인프라 부재**
- 한국 등록 비영리단체 15,000개 중 가상자산 기부 수령 가능 단체는 10곳 미만
- 자체 구축 시 개발비 수억 원 소요, 중소 재단은 진입 불가
- 가상자산 보유 MZ 세대 기부자(잠재 시장 약 600만 명) 접근 불가

**2. 가상자산 기부 영수증 표준 부재**
- 국세청은 가상자산 기부 영수증 발행을 인정하지만, 실무 인프라 없음
- 재단마다 수기 처리, 평가 시점·기준가 분쟁 빈번
- 위변조 가능한 PDF 영수증의 한계

**3. 기업 ESG 증빙 한계**
- 가상자산 기부도 ESG 활동으로 인정되지만, 증빙 표준 부재
- IPO·후속투자 시 ESG 지표 요구 증가, 그러나 기업이 증빙할 방법 없음

**4. 세무법인의 검증 부담**
- 고객사 가상자산 기부 검증 시 거래소 거래내역, 평가 시점, 시가 산정 등 수기 처리
- 1건당 평균 2~3시간 소요, 인건비 낭비

### 핵심 인사이트

> 한국에는 가상자산 기부 시장이 없는 게 아니라, **시장을 작동시킬 인프라가 없다.**
> Truve는 그 인프라를 제공한다. 아마존이 직접 물건을 안 팔고 인프라를 판매하듯이.

---

## 5. 시스템 아키텍처

### 5-1. 전체 흐름도

```
┌─────────────────────────────────────────────────────────────────┐
│                       사용자 레이어 (3-Sided)                       │
├──────────────────┬──────────────────┬──────────────────────────┤
│  B2C 기부자        │  B2B 재단         │  B2B 기업 / 세무법인         │
│  (가상자산 보유)    │  (수령처)         │  (증빙 활용)               │
└────────┬─────────┴─────────┬────────┴──────────────┬───────────┘
         │                   │                       │
         ▼                   ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Truve 플랫폼 (Next.js)                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Frontend (Next.js 14 App Router)                         │   │
│  │  - 기부자 앱  - 재단 대시보드  - 기업 대시보드  - 세무 콘솔     │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Backend API (Next.js Route Handlers + tRPC)              │   │
│  │  - KYC 모듈   - Payment 모듈   - Receipt 모듈              │   │
│  │  - Tax Sim 모듈   - ESG Report 모듈                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  XRPL Integration Layer (xrpl.js)                         │   │
│  │  - NFT Mint   - Payment   - TrustLine   - Memo Encoder    │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Database (PostgreSQL + Prisma)                           │   │
│  │  - Users   - Donations   - Foundations   - Receipts       │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────┬──────────────────────────────┬──────────────────┘
               │                              │
               ▼                              ▼
        ┌──────────────┐              ┌──────────────┐
        │  Xaman Wallet  │              │  XRPL Network │
        │  (사용자 서명)   │              │  (Testnet→Main)│
        └──────────────┘              └──────────────┘
```

### 5-2. 자금 흐름

```
[기부자]                                 [재단]
거래소 지갑 ──────── XRPL Payment ────────▶ 재단 지갑
(KYC 완료)          + Memo (목적)           (TrustLine 사전 설정)
                    + DestinationTag
                                            │
                                            ▼
                                    ┌────────────────┐
                                    │  Truve 백엔드   │
                                    │  트랜잭션 감지   │
                                    └───────┬────────┘
                                            │
                                            ▼
                                    [XLS-20 NFT 민팅]
                                    Receipt NFT 자동 발행
                                            │
                                            ├──▶ 기부자 지갑 (영수증)
                                            └──▶ 재단 대시보드 (증빙 기록)
```

> **핵심**: Truve는 자금을 일시적으로도 보유하지 않습니다. 기부자 → 재단 직접 송금(P2P)이며, Truve는 **트랜잭션을 관찰하고 영수증 NFT를 발행**할 뿐입니다. 이는 기부금품법상 모금기관 등록 의무를 회피하는 핵심 설계입니다.

---

## 6. 핵심 기능 명세 (구현 단위)

### 6-1. KYC 온보딩 모듈

#### 비즈니스 요구사항
- 가상자산 기부 영수증 발급을 위해서는 실명 확인 필수 (소득세법 시행규칙)
- 거래소 계정 검증을 통한 자금세탁방지

#### 기능 명세
| 기능 | 입력 | 출력 | 비고 |
|---|---|---|---|
| 본인 인증 | 휴대폰 본인인증 (PASS/통신사) | KYC 토큰 | NICE/KCB API 연동 |
| 거래소 지갑 검증 | 거래소 출금 주소 확인 | TrustLine 검증 결과 | 화이트리스트 거래소만 |
| 통제 포인트 약관 동의 | 체크박스 7종 | 약관 동의 해시 | 온체인 Memo에 기록 |

#### 통제 포인트 (약관 항목)
1. 실명 기반 온보딩
2. 거래소 계정 기반 기부만 허용 (업비트, 빗썸, 코빗, 코인원)
3. 허용 가능한 가상자산 리스트 제한 (XRP, RLUSD, USDC on XRPL)
4. 기부 목적 및 사용처 명시
5. 철회 불가 (가상자산 기부의 비가역성)
6. 평가 기준 사전 안내 (기부 시점 거래소 종가 기준)
7. 영수증 발급 구조 사전 안내 (NFT + PDF 동시 발급)

> 특수관계인 여부는 약관에 "본인 책임 확인" 조항으로 처리하고, 시스템 차원의 사전 검증은 하지 않습니다 (개인정보 수집 최소화 원칙).

#### API 엔드포인트
```
POST   /api/kyc/start          → KYC 세션 생성
POST   /api/kyc/verify-phone   → 본인 인증 (PASS 콜백)
POST   /api/kyc/verify-wallet  → 거래소 지갑 검증
POST   /api/kyc/agree-terms    → 약관 동의 + 해시 생성
GET    /api/kyc/status         → 온보딩 진행 상태
```

---

### 6-2. 기부 실행 모듈

#### 비즈니스 요구사항
- 기부자가 거래소 지갑에서 재단 지갑으로 직접 송금
- 모든 송금에 Memo (기부 목적) + DestinationTag (캠페인) 필수
- Truve는 자금을 보유하지 않음

#### 사용자 플로우 (B2C 기부자)
```
1. 재단/캠페인 선택 (단일 재단 or ETF 묶음)
2. 기부 자산 선택 (XRP / RLUSD / USDC on XRPL)
3. 기부 수량 입력
4. 절세 시뮬레이션 결과 확인 (참고용)
5. Xaman Wallet 서명 요청 → 사용자 서명
6. XRPL 트랜잭션 전송
7. 백엔드 트랜잭션 감지
8. Receipt NFT 자동 민팅 (기부자 지갑으로)
9. PDF 영수증 다운로드 가능
```

#### XRPL Payment 트랜잭션 구조
```javascript
{
  TransactionType: "Payment",
  Account: "{donor_wallet_address}",
  Destination: "{foundation_wallet_address}",
  DestinationTag: 캠페인_ID,  // 재단 내 캠페인 구분
  Amount: {
    // XRP의 경우: drops 단위 문자열
    // RLUSD/USDC의 경우: { currency, issuer, value } 객체
  },
  Memos: [{
    Memo: {
      MemoType: hex("truve/donation/v1"),
      MemoFormat: hex("application/json"),
      MemoData: hex(JSON.stringify({
        purpose: "기부 목적 텍스트",
        kyc_hash: "기부자 KYC 해시 (sha256)",
        foundation_id: "재단 식별자",
        campaign_id: "캠페인 식별자",
        terms_agreed_at: "ISO8601 timestamp",
        terms_hash: "약관 동의 해시"
      }))
    }
  }]
}
```

#### API 엔드포인트
```
POST   /api/donation/init           → 기부 세션 생성 + 절세 시뮬레이션
POST   /api/donation/build-payload  → Xaman 서명 요청 페이로드 생성
POST   /api/donation/confirm        → 트랜잭션 해시 검증 + 영수증 NFT 트리거
GET    /api/donation/{id}           → 기부 상세 조회
GET    /api/donation/list           → 기부 이력 조회
```

---

### 6-3. Receipt NFT 발행 모듈 (★ 핵심 차별화)

#### 비즈니스 요구사항
- 기부 완료 시 즉시 XLS-20 NFT 영수증 발행
- 영수증 메타데이터에 법정 필수 항목 포함
- 개인정보는 해시 처리 (개인정보보호법 준수)

#### NFT 메타데이터 구조 (JSON, IPFS 또는 Truve CDN 호스팅)
```json
{
  "schema": "truve/receipt/v1",
  "receipt_id": "TRV-2026-0000001",
  "issued_at": "2026-04-26T12:34:56Z",
  "issuer": {
    "name": "Truve",
    "operator": "Truve 운영법인명",
    "business_number": "사업자번호"
  },
  "donor": {
    "kyc_hash": "sha256(이름+생년월일+CI)",
    "exchange": "Upbit",
    "wallet_address": "rXXX..."
  },
  "donation": {
    "asset": "XRP",
    "amount": "100",
    "krw_value_at_donation": 380000,
    "valuation_basis": "Upbit closing price 2026-04-26",
    "tx_hash": "XRPL 트랜잭션 해시",
    "donated_at": "2026-04-26T12:34:00Z"
  },
  "recipient": {
    "name": "재단명",
    "business_number": "재단 사업자번호",
    "designated_donation_org_no": "지정기부금단체 등록번호 (있을 시)",
    "wallet_address": "rYYY..."
  },
  "donation_purpose": {
    "category": "환경",
    "campaign_id": "CAMP-2026-001",
    "campaign_name": "캠페인명",
    "purpose_text": "구체적 기부 목적"
  },
  "tax_info": {
    "donation_type": "지정기부금",
    "deductibility_note": "법인세법 제24조에 따라 손금산입 한도 내 공제 가능. 정확한 산정은 세무사 상담 필요.",
    "withdrawn_irrevocable": true
  },
  "terms_agreement": {
    "terms_hash": "sha256(약관 본문)",
    "agreed_at": "2026-04-26T12:30:00Z"
  }
}
```

#### XRPL NFTokenMint 트랜잭션
```javascript
{
  TransactionType: "NFTokenMint",
  Account: "{truve_minter_wallet}",
  NFTokenTaxon: 1,  // Receipt NFT taxon
  Flags: 8,  // tfTransferable=false (양도 불가, 영수증 특성)
  URI: hex("https://truve.io/receipts/TRV-2026-0000001.json"),
  Memos: [{
    Memo: {
      MemoType: hex("truve/receipt-mint/v1"),
      MemoData: hex(JSON.stringify({
        receipt_id: "TRV-2026-0000001",
        donation_tx: "원본 기부 트랜잭션 해시"
      }))
    }
  }]
}
```

#### 발행 후 후처리
1. 민팅 트랜잭션 해시 DB 저장
2. NFTokenCreateOffer로 기부자 지갑에 무료 전송 (또는 직접 민팅 시 기부자 지갑에 바로 발행)
3. PDF 영수증 자동 생성 (NFT 메타데이터 기반)
4. 기부자 이메일로 PDF + NFT Explorer 링크 전송
5. 재단 대시보드에 기록 추가

#### API 엔드포인트
```
POST   /api/receipt/mint            → NFT 민팅 (백엔드 자동 호출)
GET    /api/receipt/{id}            → 영수증 메타데이터 조회
GET    /api/receipt/{id}/pdf        → PDF 다운로드
GET    /api/receipt/{id}/verify     → 위변조 검증 (XRPL 원본 대조)
```

---

### 6-4. TrustLine 자동 설정 모듈

#### 비즈니스 요구사항
- 재단이 RLUSD, USDC on XRPL 등 IOU 자산 수령 위해 TrustLine 필요
- 일반 재단은 XRPL 지식 부족 → Truve가 자동 설정 가이드 제공

#### 재단 온보딩 플로우
```
1. 재단 가입 → Truve 운영팀 검증 (사업자등록 + 지정기부금단체 확인)
2. XRPL 지갑 생성 안내 (Xaman Wallet)
3. Truve 대시보드에서 "TrustLine 설정" 버튼 클릭
4. 다음 자산에 대한 TrustLine 일괄 생성:
   - RLUSD (issuer: rMxCKbE...)
   - USDC on XRPL (issuer: rcEGreD...)
5. Xaman 서명 → TrustLine 활성화
6. 재단은 이제 RLUSD, USDC 수령 가능
```

#### XRPL TrustSet 트랜잭션
```javascript
{
  TransactionType: "TrustSet",
  Account: "{foundation_wallet}",
  LimitAmount: {
    currency: "USD",  // RLUSD currency code
    issuer: "rMxCKbE...",  // Ripple RLUSD issuer
    value: "1000000000"  // 사실상 무제한
  }
}
```

#### API 엔드포인트
```
POST   /api/foundation/trustline/build  → TrustLine 페이로드 생성
POST   /api/foundation/trustline/verify → 활성화 검증
GET    /api/foundation/trustline/list   → 활성 TrustLine 조회
```

---

### 6-5. ETF 묶음 (다중 재단 동시 기부)

#### 비즈니스 요구사항
- 사용자가 복수 재단을 한 번에 기부 (장바구니 UX)
- 각 재단 비율은 사용자 커스텀 (Truve가 책임지지 않음)
- 추천 비율은 표시하되, 수정 가능

#### 사용자 플로우
```
1. ETF 카테고리 선택 (예: "환경 패키지")
2. 추천 재단 3~5곳 자동 표시 + 추천 비율 (40/30/30 등)
3. 사용자가 비율 슬라이더로 조정 가능
4. 총 기부액 입력 → 각 재단별 자동 계산
5. 절세 시뮬레이션 결과 표시
6. 기부 실행:
   - 옵션 A (단순): 각 재단별 별도 트랜잭션 N개 (가스 비용 N배지만 XRPL은 거의 무료)
   - 옵션 B (효율): Truve가 일시 보유 → 분배 (모금기관 등록 의무 발생, 폐기)
   - **선택: 옵션 A**
7. 각 트랜잭션마다 Receipt NFT N개 발행
```

#### 데이터 모델
```typescript
interface ETFBundle {
  id: string;
  name: string;            // 예: "환경 패키지"
  category: "환경" | "아동" | "노인" | "장애" | "긴급구호";
  description: string;
  recommended_foundations: {
    foundation_id: string;
    recommended_ratio: number;  // 0~100
  }[];
  curator: "Truve" | "User";  // 큐레이션 주체
  disclaimer: string;  // "본 비율은 추천이며 사용자가 자유롭게 조정 가능합니다"
}
```

#### API 엔드포인트
```
GET    /api/etf/list             → ETF 묶음 목록
GET    /api/etf/{id}             → ETF 상세
POST   /api/etf/donate           → ETF 기반 기부 실행 (다중 트랜잭션)
```

---

### 6-6. 절세 시뮬레이터 (AI API 기반, 참고용)

#### 비즈니스 요구사항
- 기부자가 절세 효과를 직관적으로 이해
- 정확한 산정이 아닌 **참고 정보**로 명시 (법적 책임 회피)
- 실제 적용은 세무사 상담 권장

#### 면책 조항 (UI 필수 표시)
> ⚠️ 본 시뮬레이션은 일반적인 평균값 기반 추정치이며, 실제 세액공제 효과는 귀사의 당해 연도 재무 상황, 기부금 종류(지정/법정/일반), 손금산입 한도에 따라 달라질 수 있습니다. **정확한 산정은 반드시 세무 전문가 상담을 받으시기 바랍니다.**

#### 입력 변수 (단순화)
```typescript
interface TaxSimulationInput {
  donor_type: "개인" | "법인";

  // 개인 기부자
  annual_income_range?: "5천만원_이하" | "5천만~1.5억" | "1.5억_이상";

  // 법인 기부자
  annual_profit_range?: "2억_이하" | "2억~200억" | "200억_이상";
  donation_type?: "지정기부금" | "법정기부금" | "일반기부금";

  donation_amount: number;  // KRW
}
```

#### AI API 호출 (Anthropic Claude API)
```typescript
// /api/tax-sim/calculate
async function calculateTaxSimulation(input: TaxSimulationInput) {
  const prompt = `
당신은 한국 세법 참고 정보를 안내하는 도우미입니다.
다음 기부 정보를 바탕으로 일반적인 평균 세액공제 효과를 추정하되,
반드시 "참고용 추정치"임을 명시하고 정확한 수치 단정은 피하세요.

입력:
- 기부자 유형: ${input.donor_type}
- 기부 금액: ${input.donation_amount.toLocaleString()} KRW
- ${input.donor_type === "법인"
    ? `연 영업이익 구간: ${input.annual_profit_range}, 기부금 종류: ${input.donation_type}`
    : `연 소득 구간: ${input.annual_income_range}`}

출력 (JSON):
{
  "estimated_deduction_min": 숫자,    // 최소 추정 세액공제 (KRW)
  "estimated_deduction_max": 숫자,    // 최대 추정 세액공제 (KRW)
  "explanation": "300자 이내 설명",
  "applicable_law": "관련 법령 명시 (예: 법인세법 제24조)",
  "disclaimer": "정확한 산정은 세무사 상담 필요"
}
  `;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }]
  });

  return JSON.parse(extractJSON(response.content));
}
```

#### UI 표시 형식
```
┌──────────────────────────────────────────┐
│  💡 절세 효과 참고 시뮬레이션               │
├──────────────────────────────────────────┤
│  기부 예정액:        1,000,000 KRW        │
│  예상 세액공제 범위:  150,000 ~ 220,000   │
│  실질 기부 비용:      780,000 ~ 850,000   │
├──────────────────────────────────────────┤
│  ⚠️ 본 수치는 평균 추정치입니다.            │
│  정확한 산정은 세무 전문가에게 문의하세요.   │
│  [세무 파트너 상담 연결] →                 │
└──────────────────────────────────────────┘
```

> **수익 연계**: "세무 파트너 상담 연결" 버튼은 추후 세무법인 리퍼럴 수수료 모델로 발전 (Phase 2).

---

### 6-7. 재단 대시보드

#### 핵심 화면
```
[재단 홈]
├── 수령 현황 카드
│   ├── 누적 기부액 (XRP / RLUSD / USDC / 합계 KRW)
│   ├── 이번 달 신규 기부자 수
│   └── 다음 정산 예정 (Phase 2)
│
├── 기부 내역 테이블
│   ├── 기부자 (KYC 해시 일부만 표시)
│   ├── 자산 / 수량 / KRW 환산
│   ├── 기부 목적 (Memo에서 추출)
│   ├── 트랜잭션 해시 (Explorer 링크)
│   └── Receipt NFT 발행 상태
│
├── ESG 임팩트 리포트
│   ├── 기부 카테고리별 분포
│   ├── 월별 추이
│   └── PDF/NFT 다운로드
│
└── 설정
    ├── XRPL 지갑 관리
    ├── TrustLine 관리
    └── 캠페인 등록
```

#### API 엔드포인트
```
GET    /api/foundation/dashboard          → 대시보드 메인 데이터
GET    /api/foundation/donations          → 기부 내역
POST   /api/foundation/campaign           → 캠페인 생성
GET    /api/foundation/esg-report         → ESG 리포트 생성
```

---

### 6-8. 기업 ESG 대시보드

#### 핵심 화면
```
[기업 홈]
├── ESG 증빙 현황
│   ├── 누적 기부액 (CSR 활동 총액)
│   ├── 발급된 ESG Badge NFT 수
│   └── 위변조 불가 증빙 보유율 100%
│
├── ESG Badge NFT 갤러리
│   └── 분기별/연도별 그룹핑된 NFT 컬렉션
│
├── 홈페이지 임베드 위젯
│   ├── 위젯 코드 복사 (iframe)
│   └── 미리보기
│
├── IR/감사 리포트
│   ├── 분기 ESG 활동 요약 PDF
│   ├── 온체인 검증 가능 링크
│   └── 영문 리포트 (글로벌 IR용)
│
└── 결제 / 구독 관리
```

---

### 6-9. 세무법인 콘솔 (Phase 2 우선순위)

#### 핵심 기능
- 고객사별 기부 데이터 조회
- 국세청 XML 포맷 일괄 다운로드
- 평가 시점 기준가 자동 산정
- Per-seat 라이선스

> Phase 2 우선순위로 분류 (5주 MVP에서는 데이터 모델만 준비, UI는 Phase 2)

---

## 7. 데이터 모델 (Prisma Schema 요약)

```prisma
// schema.prisma

model User {
  id              String   @id @default(cuid())
  type            UserType // DONOR | FOUNDATION_ADMIN | COMPANY_ADMIN | TAX_PARTNER
  email           String   @unique
  kyc_status      KYCStatus
  kyc_hash        String?  // sha256(이름+생년월일+CI)
  xrpl_wallet     String?
  exchange        String?  // Upbit, Bithumb, Korbit, Coinone
  created_at      DateTime @default(now())

  donations       Donation[]
  foundation_id   String?
  foundation      Foundation? @relation(fields: [foundation_id], references: [id])
  company_id      String?
  company         Company? @relation(fields: [company_id], references: [id])
}

model Foundation {
  id                          String   @id @default(cuid())
  name                        String
  business_number             String   @unique
  designated_donation_org_no  String?
  xrpl_wallet                 String   @unique
  trustlines_active           Json     // ["RLUSD", "USDC"]
  category_tags               String[] // ["환경", "아동", ...]
  description                 String
  verified                    Boolean  @default(false)

  users                       User[]
  donations                   Donation[]
  campaigns                   Campaign[]
}

model Campaign {
  id              String   @id @default(cuid())
  foundation_id   String
  foundation      Foundation @relation(fields: [foundation_id], references: [id])
  destination_tag Int      @unique  // XRPL DestinationTag
  name            String
  purpose         String
  goal_amount_krw BigInt?
  start_at        DateTime
  end_at          DateTime?
}

model Donation {
  id                      String   @id @default(cuid())
  donor_id                String
  donor                   User     @relation(fields: [donor_id], references: [id])
  foundation_id           String
  foundation              Foundation @relation(fields: [foundation_id], references: [id])
  campaign_id             String?

  asset                   String   // "XRP" | "RLUSD" | "USDC"
  amount                  String   // 정밀도 보존을 위한 string
  krw_value_at_donation   BigInt
  valuation_basis         String   // "Upbit closing 2026-04-26"

  xrpl_tx_hash            String   @unique
  xrpl_block_height       BigInt?
  donated_at              DateTime

  receipt_nft_id          String?
  receipt                 Receipt? @relation(fields: [receipt_nft_id], references: [id])

  donation_purpose        String
  terms_hash              String
}

model Receipt {
  id                String   @id @default(cuid())
  receipt_id        String   @unique  // "TRV-2026-0000001"
  donation_id       String   @unique

  nft_token_id      String   @unique  // XRPL NFTokenID
  nft_mint_tx_hash  String
  metadata_uri      String   // https://truve.io/receipts/...json

  pdf_url           String?
  issued_at         DateTime @default(now())

  donation          Donation?
}

model Company {
  id                  String   @id @default(cuid())
  name                String
  business_number     String   @unique
  subscription_plan   SubscriptionPlan  // STARTER | BUSINESS | ENTERPRISE
  subscription_status SubscriptionStatus
  esg_badges          ESGBadge[]
  users               User[]
}

model ESGBadge {
  id            String   @id @default(cuid())
  company_id    String
  company       Company  @relation(fields: [company_id], references: [id])
  nft_token_id  String   @unique
  period        String   // "2026-Q1"
  total_amount  BigInt
  metadata_uri  String
  issued_at     DateTime @default(now())
}

enum UserType {
  DONOR
  FOUNDATION_ADMIN
  COMPANY_ADMIN
  TAX_PARTNER
}

enum KYCStatus {
  NOT_STARTED
  IN_PROGRESS
  VERIFIED
  REJECTED
}

enum SubscriptionPlan {
  FREE_PILOT
  STARTER         // 30만 원/월
  BUSINESS        // 70만 원/월
  ENTERPRISE      // 협의
}

enum SubscriptionStatus {
  ACTIVE
  PAUSED
  CANCELED
}
```

---

## 8. 기술 스택 (구현 명세)

### 8-1. 의존성

```json
{
  "name": "truve",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:push": "prisma db push",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "next": "14.2.0",
    "react": "18.3.0",
    "react-dom": "18.3.0",
    "typescript": "5.4.0",

    "xrpl": "^4.0.0",
    "xumm-sdk": "^1.11.0",

    "@prisma/client": "^5.20.0",
    "prisma": "^5.20.0",

    "@anthropic-ai/sdk": "^0.27.0",

    "tailwindcss": "^3.4.0",
    "shadcn-ui": "latest",
    "lucide-react": "^0.383.0",
    "recharts": "^2.12.0",

    "zod": "^3.23.0",
    "date-fns": "^3.6.0",
    "puppeteer": "^22.0.0",  // PDF 생성

    "next-auth": "^4.24.0",  // 인증

    "@trpc/server": "^11.0.0",
    "@trpc/client": "^11.0.0",
    "@trpc/react-query": "^11.0.0",
    "@tanstack/react-query": "^5.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "14.2.0"
  }
}
```

### 8-2. 폴더 구조

```
truve/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/                          # Next.js 14 App Router
│   │   ├── (donor)/                  # 기부자 영역
│   │   │   ├── page.tsx              # 홈 (재단 탐색)
│   │   │   ├── donate/[id]/page.tsx  # 기부 페이지
│   │   │   ├── etf/[id]/page.tsx     # ETF 묶음 페이지
│   │   │   └── receipts/page.tsx     # 내 영수증
│   │   ├── (foundation)/
│   │   │   └── dashboard/page.tsx
│   │   ├── (company)/
│   │   │   └── dashboard/page.tsx
│   │   ├── api/
│   │   │   ├── kyc/...
│   │   │   ├── donation/...
│   │   │   ├── receipt/...
│   │   │   ├── foundation/...
│   │   │   ├── etf/...
│   │   │   └── tax-sim/...
│   │   └── layout.tsx
│   ├── components/                   # shadcn/ui 기반
│   ├── lib/
│   │   ├── xrpl/
│   │   │   ├── client.ts             # XRPL Client 초기화
│   │   │   ├── nft-mint.ts           # ★ XLS-20 NFT 발행
│   │   │   ├── payment.ts            # ★ Payment 트랜잭션
│   │   │   ├── trustline.ts          # ★ TrustLine 설정
│   │   │   ├── memo-encoder.ts       # ★ Memo 인코딩/디코딩
│   │   │   └── tx-watcher.ts         # 트랜잭션 감지
│   │   ├── xaman/
│   │   │   └── payload-builder.ts    # Xaman 페이로드 생성
│   │   ├── kyc/
│   │   │   ├── pass-verify.ts        # PASS 본인인증
│   │   │   └── hash-builder.ts       # KYC 해시 생성
│   │   ├── receipt/
│   │   │   ├── metadata-builder.ts   # NFT 메타데이터 생성
│   │   │   ├── pdf-generator.ts      # PDF 생성 (puppeteer)
│   │   │   └── verifier.ts           # 위변조 검증
│   │   ├── tax-sim/
│   │   │   └── ai-calculator.ts      # Claude API 연동
│   │   ├── price/
│   │   │   └── exchange-quote.ts     # 거래소 시가 조회
│   │   └── db.ts                     # Prisma client
│   ├── server/                       # tRPC routers
│   │   └── routers/
│   └── styles/
├── public/
├── .env.example
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

### 8-3. 환경 변수

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/truve"

# XRPL
XRPL_NETWORK="testnet"  # testnet | mainnet
XRPL_NODE_URL="wss://s.altnet.rippletest.net:51233"
XRPL_MINTER_SEED="sXXX..."          # NFT 민팅 전용 지갑 시드 (환경별 분리)
XRPL_MINTER_ADDRESS="rXXX..."

# Xaman
XUMM_API_KEY="xxx"
XUMM_API_SECRET="xxx"

# Anthropic Claude API (절세 시뮬레이터)
ANTHROPIC_API_KEY="sk-ant-..."

# KYC (PASS 본인인증)
NICE_API_KEY="xxx"
NICE_API_SECRET="xxx"

# 거래소 시가 API
UPBIT_API_KEY="xxx"

# 인증
NEXTAUTH_SECRET="xxx"
NEXTAUTH_URL="http://localhost:3000"

# Truve 내부
TRUVE_RECEIPT_BASE_URL="https://truve.io/receipts"
TRUVE_OPERATOR_NAME="Truve 운영법인명"
TRUVE_BUSINESS_NUMBER="000-00-00000"

# RLUSD/USDC Issuer (Mainnet 정식 출시 시 변경)
RLUSD_ISSUER="rMxCKbE..."
USDC_XRPL_ISSUER="rcEGreD..."
```

---

## 9. 5주 MVP 실행 계획

### 9-1. 주차별 마일스톤

| 주차 | 목표 | Definition of Done |
|------|------|---------------------|
| **1주차** | 기반 구축 | • Next.js 14 프로젝트 세팅<br>• Prisma 스키마 정의 + DB 마이그레이션<br>• XRPL Testnet 지갑 3종 생성 (Truve Minter, 테스트 재단, 테스트 기부자)<br>• Xaman Sandbox 연동 완료<br>• 재단 파트너 2~3곳 초기 협의 |
| **2주차** | 핵심 XRPL 흐름 구현 | • Payment 트랜잭션 + Memo + DestinationTag 작동<br>• 트랜잭션 감지 → Receipt NFT 자동 민팅<br>• TrustLine 설정 페이지<br>• KYC 약관 동의 + 해시 생성 |
| **3주차** | 사용자 영역 + ETF | • 기부자 앱 메인 (재단 탐색)<br>• ETF 묶음 페이지 (이미 구현분 통합)<br>• 절세 시뮬레이터 (Claude API)<br>• 영수증 PDF 생성 |
| **4주차** | 재단/기업 대시보드 + 통합 테스트 | • 재단 대시보드 완성<br>• 기업 ESG 대시보드 (데모 수준)<br>• ESG Badge NFT 발행 데모<br>• 전체 흐름 E2E 테스트 |
| **5주차** | Mainnet PoC + 피치 준비 | • Receipt NFT 발행 + Payment 2개 기능 Mainnet 전환<br>• 시연 시나리오 리허설<br>• 신청서 최종본 작성<br>• GitHub README 정리 |

### 9-2. MVP 포함 / 제외 매트릭스

#### ✅ MVP 5주 포함
- KYC 온보딩 (PASS 본인인증 + 약관 7종)
- XRPL Payment (XRP 기부)
- TrustLine 설정 (RLUSD, USDC 수령 가능)
- Memo + DestinationTag (목적/캠페인 온체인 기록)
- Receipt NFT 발행 (XLS-20)
- PDF 영수증 생성
- 절세 시뮬레이터 (Claude API)
- ETF 묶음 (사용자 커스텀 비율)
- 재단 대시보드
- 기업 ESG 대시보드 (데모 수준)
- ESG Badge NFT 발행 (데모 수준)
- 위변조 검증 (XRPL 원본 대조)

#### ⏭️ Phase 2 이연
- **거버넌스 투표** (법적 리스크 검토 후)
- DEX 자동 환전 (구현 복잡도)
- AMM 활용
- Escrow 조건부 기부
- Multi-signing 재단 거버넌스
- Freeze/Clawback 자금세탁 대응
- 세무법인 콘솔 (UI 완성)
- 기업 홈페이지 임베드 위젯 (실제 임베드)
- AI 기부 추천
- 거래소 직접 연동 (B2B2C)
- 글로벌 확장 (영문 UI)

---

## 10. Final Pitch Day 시연 시나리오

> **목표**: "한국 최초 가상자산 기부 영수증 인프라"가 실제로 작동함을 5분 안에 증명한다.

### 시연 순서 (5분)

```
[0:00~0:30] 인트로
- "한국에서 가상자산 기부를 받을 수 있는 재단은 10곳도 안 됩니다.
   왜? 인프라가 없기 때문입니다. Truve가 그 인프라입니다."

[0:30~1:30] B2C 기부자 흐름 (Mainnet 시연)
1. ETF 묶음 "환경 패키지" 선택
2. 비율 슬라이더로 3개 재단 분배
3. 절세 시뮬레이션 결과 확인 (참고용)
4. Xaman 서명 → XRP 기부 실행
5. XRPL Mainnet Explorer에서 실시간 트랜잭션 확인
   → Memo에 기부 목적 + KYC 해시 보임

[1:30~2:30] Receipt NFT 발행 (Mainnet 시연)
1. 백엔드 자동 트리거 → NFTokenMint 트랜잭션
2. 기부자 지갑에 영수증 NFT 도착
3. NFT 메타데이터 펼쳐서 보여주기
   → 법정 필수 항목 모두 포함
4. PDF 영수증 다운로드
5. "이 영수증은 위변조가 불가능합니다.
    XRPL 원본과 클릭 한 번에 대조 가능합니다."

[2:30~3:30] B2B 재단 대시보드
1. 재단 로그인
2. 방금 받은 기부 자동 표시
3. 카테고리별 ESG 임팩트 차트
4. "이 재단은 처음으로 가상자산 기부를 받았습니다."

[3:30~4:30] B2B 기업 ESG 대시보드 (데모)
1. 기업 로그인
2. 분기별 ESG Badge NFT 갤러리
3. IR 리포트 미리보기
4. "위변조 불가능한 ESG 증빙으로 IPO 준비 가능"

[4:30~5:00] 마무리
- "Truve는 자금을 보유하지 않습니다.
   영수증 인프라만 제공합니다.
   B2B 재단 + 기업 구독료로 수익을 냅니다.
   기부자에게는 단 1원도 받지 않습니다."

- "Phase 2: 거버넌스, DEX 환전, 세무법인 채널, 글로벌 확장"
```

### 핵심 메시지
> "We don't move money. We mint truth.
>  Truve makes crypto donation receivable, verifiable, and auditable for every Korean foundation."

---

## 11. 사업화 가능성

### 시장 규모

| 지표 | 수치 | 출처 |
|------|------|------|
| 국내 연간 기부금 총액 | 약 1조 5,000억 원 | 2023 통계청 |
| 국내 가상자산 보유자 | 약 600만 명 (인구 12%) | 2024 금융위 |
| 가상자산 기부 잠재 시장 (1% 가정) | 약 1,500억 원/년 | 추산 |
| 한국 등록 비영리단체 | 15,000개 | 행안부 |
| **현재 가상자산 기부 가능 재단** | **10곳 미만** | **Truve의 시장** |
| 기업 ESG 의무공시 대상 (2025~) | 자산 2조 원 이상 상장사 | 금융위 |

### 수익 모델 (재확인)

| 수익원 | 단가 | Phase 1 (3개월) | Phase 2 (6개월) | Phase 3 (12개월) |
|---|---|---|---|---|
| 재단 인프라 구독 | 월 30~100만 원 | 파일럿 3곳 (무료) | 유료 5곳, MRR 200만 원 | 유료 30곳, MRR 1,500만 원 |
| 기업 ESG SaaS | 월 50~200만 원 | 파일럿 2곳 (무료) | 유료 3곳, MRR 200만 원 | 유료 20곳, MRR 2,000만 원 |
| 거래소 파트너십 | 거래액의 0.1~0.3% | — | 1곳 협의 | 2곳 라이브 |
| 세무법인 B2B2B | Per-seat 5만 원/월 | — | 1곳 파일럿 | 5곳, MRR 500만 원 |
| **합계 ARR** | — | 0 | 약 4,800만 원 | **약 4.8억 원** |

### KFIP 파트너사 연계

| 파트너 | 연계 포인트 |
|--------|-------------|
| **Toss** | 거래소 파트너십 후보 (트래블룰 인프라 보유) |
| **IBK기업은행** | 재단 원화 정산 계좌, B2B 영업 채널 |
| **하나은행** | 기업금융 고객 대상 ESG 솔루션 채널 |
| **법무법인 태평양** | 가상자산 기부 영수증 법적 효력 자문 |
| **삼정/안진/EY 한영** | 세무법인 B2B2B 채널 (MOU 추후 추진) |

---

## 12. 리스크 및 대응

| 리스크 | 내용 | 대응 |
|--------|------|------|
| 자금세탁 우려 | 가상자산 기부 자금세탁 통로 의심 | 거래소 KYC 검증 지갑만 허용 + 화이트리스트 자산 제한 |
| 영수증 법적 효력 | NFT 영수증 국세청 인정 여부 | 법정 필수 항목 모두 포함 + PDF 동시 발급 + 법무법인 자문 |
| 평가 시점 분쟁 | 가상자산 변동성으로 기부 가치 분쟁 | 기부 시점 거래소 종가 명시 + 약관 사전 안내 |
| 재단 온보딩 속도 | XRPL 지식 부족한 재단 | TrustLine 자동 설정 가이드 + Truve 운영팀 핸즈온 지원 |
| Mainnet 일정 | 5주차 Mainnet 전환 실패 | 핵심 2개 기능(NFT, Payment)만 Mainnet 제한, 나머지 Testnet |
| 개인정보 보호 | NFT 메타데이터 개인정보 노출 | 모든 개인정보 sha256 해시 처리, 원본은 오프체인 DB |
| AI 절세 시뮬레이터 책임 | 부정확한 시뮬레이션 결과 책임 | "참고용 추정치" 명시 + 세무사 상담 권장 + 면책 조항 |
| 거버넌스 투표 누락 비판 | KFIP가 Web3 거버넌스 기대 | "법적 검토 후 Phase 2 단계적 도입"으로 책임 있는 접근 강조 |

---

## 13. 결론

Truve는 한국 가상자산 기부 시장의 **인프라 부재 문제**를 해결합니다.

기존 기부 플랫폼이 "원화 기부 중개"에 머무는 동안, 한국의 600만 가상자산 보유자는 기부를 시작할 인프라가 없었습니다. 가상자산 보유 MZ 세대는 가장 큰 잠재 기부자 풀이지만, 받을 수 있는 재단이 10곳 미만입니다.

Truve는 자금을 직접 다루지 않습니다. **재단이 가상자산 기부를 받을 수 있게 하고, 그 영수증을 위변조 불가능한 NFT로 발행하고, 기업이 ESG 증빙으로 활용할 수 있게 하는 인프라**입니다. 아마존이 직접 물건을 안 팔고 인프라를 제공하듯이.

XRPL의 NFT 네이티브 표준(XLS-20)을 활용하여, **자체 스마트 컨트랙트 없이도 5주 안에 작동하는 영수증 시스템**을 만들 수 있습니다. 기부자 → 재단 직접 송금(P2P) 구조로 기부금품법 모금기관 등록 의무를 회피하고, Memo 필드에 기부 목적을 영구 기록하며, TrustLine으로 RLUSD/USDC 등 스테이블코인까지 처리합니다.

수익은 기부금에서 떼지 않습니다. **재단 인프라 구독료(40%) + 기업 ESG SaaS(30%) + 거래소·세무법인 채널(30%)**로 구성된 B2B 인프라 비즈니스이며, 3년차 ARR 약 4.8억 원 목표로 SaaS 밸류에이션 적용 시 약 24~48억 원 기업가치가 가능합니다.

5주 MVP에서는 XRPL의 NFT, Payment, Memo, DestinationTag, TrustLine 5개 핵심 기능을 모두 구현하고, Mainnet에서 영수증 NFT 발행을 시연합니다. 거버넌스 투표, DEX 환전, Escrow 등 복잡도 높거나 법적 검토가 필요한 기능은 Phase 2로 책임 있게 분리합니다.

**Truve의 차별점 다섯 줄 요약**

1. 자금을 보유하지 않는 P2P 인프라 — 기부금품법 모금기관 등록 회피
2. XLS-20 NFT 영수증 — 위변조 불가능, 법정 필수 항목 모두 포함
3. RLUSD/USDC 멀티 자산 처리 — 한국 최초 XRPL 스테이블코인 기부 인프라
4. B2B 인프라 수익 모델 — 기부자에게 1원도 받지 않음
5. 5주 안에 Mainnet 작동 — KFIP 심사 기준 "실제 작동하는 서비스" 충족

---

> **Truve — Trust + Give**
> We don't move money. We mint truth.

---

## 부록 A: 개발 에이전트 작업 지시

> 이 섹션은 Claude Code, Codex 등 개발 에이전트가 본 기획서를 받아 즉시 작업을 시작할 수 있도록 작성된 명시적 지시 사항입니다.

### A-1. 첫 작업 (Day 1~2)

```bash
# 1. 프로젝트 초기화
npx create-next-app@latest truve --typescript --tailwind --app --src-dir
cd truve

# 2. 의존성 설치
npm install xrpl xumm-sdk @prisma/client prisma @anthropic-ai/sdk \
  shadcn-ui lucide-react recharts zod date-fns puppeteer \
  next-auth @trpc/server @trpc/client @trpc/react-query @tanstack/react-query

# 3. shadcn/ui 초기화
npx shadcn-ui@latest init

# 4. Prisma 초기화
npx prisma init

# 5. 폴더 구조 생성 (§8-2 참고)
mkdir -p src/lib/{xrpl,xaman,kyc,receipt,tax-sim,price}
mkdir -p src/app/{api,\(donor\),\(foundation\),\(company\)}
```

### A-2. 구현 우선순위 (Critical Path)

다음 순서로 구현해야 시연 가능한 데모가 가장 빨리 나옵니다:

1. **`src/lib/xrpl/client.ts`** — XRPL Testnet client 초기화
2. **`src/lib/xrpl/payment.ts`** — Payment 트랜잭션 빌더
3. **`src/lib/xrpl/memo-encoder.ts`** — Memo 인코딩
4. **`src/lib/xrpl/nft-mint.ts`** — XLS-20 NFT 민팅
5. **`src/lib/receipt/metadata-builder.ts`** — NFT 메타데이터 생성
6. **`src/app/api/donation/build-payload/route.ts`** — Xaman 페이로드 API
7. **`src/app/api/donation/confirm/route.ts`** — 트랜잭션 검증 + NFT 민팅 트리거
8. **`src/app/(donor)/donate/[id]/page.tsx`** — 기부 UI
9. **`src/lib/xrpl/trustline.ts`** — TrustLine 설정
10. **`src/app/(foundation)/dashboard/page.tsx`** — 재단 대시보드

### A-3. 테스트 데이터 시드

```typescript
// prisma/seed.ts
// 다음 데이터로 시드 생성
const foundations = [
  { name: "환경재단_테스트", category_tags: ["환경"], xrpl_wallet: "rTest1..." },
  { name: "아동복지재단_테스트", category_tags: ["아동"], xrpl_wallet: "rTest2..." },
  { name: "노인복지재단_테스트", category_tags: ["노인"], xrpl_wallet: "rTest3..." }
];

const etfBundles = [
  {
    name: "환경 패키지",
    category: "환경",
    recommended_foundations: [
      { foundation_id: "...", recommended_ratio: 50 },
      { foundation_id: "...", recommended_ratio: 30 },
      { foundation_id: "...", recommended_ratio: 20 }
    ]
  }
];
```

### A-4. 작업 완료 정의 (Done Criteria)

각 모듈은 다음 조건을 모두 만족해야 완료로 간주합니다:

- [ ] TypeScript 타입 100% 정의
- [ ] Zod 스키마로 입력 검증
- [ ] 에러 핸들링 (try-catch + 사용자 친화 메시지)
- [ ] XRPL 트랜잭션의 경우 Explorer 링크 반환
- [ ] 단위 테스트 작성 (Critical Path만 우선)

### A-5. 시연 데모 환경 변수

```bash
# 시연용 .env.demo
XRPL_NETWORK="mainnet"  # Final Pitch Day 시연 시
XRPL_NODE_URL="wss://xrplcluster.com"

# 시연 5주차 전까지는 testnet 유지
```

### A-6. 외부 자료 참고 링크

- XRPL.js 공식 문서: https://js.xrpl.org/
- XLS-20 NFT 표준: https://xrpl.org/non-fungible-tokens.html
- Xaman SDK: https://github.com/XRPL-Labs/xumm-sdk
- RLUSD: https://ripple.com/solutions/stablecoin/
- Anthropic Claude API: https://docs.claude.com/

---

**문서 작성 일자**: 2026-04-26
**작성 기준**: KFIP 2026 1차 서류 심사 + 개발 에이전트 즉시 착수 가능
**다음 액션**: 본 기획서를 개발 에이전트에 전달하여 Day 1 셋업 시작
