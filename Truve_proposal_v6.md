# Truve 제안보고서 v6 — 관리용

> **Truve는 기부 플랫폼이 아니라, 재단이 가상자산 기부를 세무·감사 가능한 방식으로 받을 수 있게 하는 Receipt Evidence Infrastructure입니다.**  
> 기부금은 스테이블코인으로 재단에 직접 흐르고, 증빙은 Truve가 표준화하며, 검증은 XRPL이 담당합니다.

---

## 0. v6 핵심 변경 요약

| 영역 | v5 방향 | v6 방향 |
|---|---|---|
| 정체성 | 가상자산 기부 영수증/NFT 플랫폼 | **가상자산 기부 증빙·영수증 표준 인프라** |
| 핵심 고객 | 기부자 + 재단 + 기업 | **재단·비영리단체 1순위, 세무법인·기업 ESG 2순위, 기부자는 End-user** |
| 결제 라인 | XRP/RLUSD/USDC 직접 기부 | **스테이블코인 결제 라인 유지: RLUSD/USDC 중심** |
| NFT 정의 | NFT 영수증 | **공식 영수증 대체물이 아닌 Evidence Package 검증용 Proof Token** |
| 세무 흐름 | NFT/PDF 영수증 발행 | **홈택스 전자기부금영수증 발급을 보조하는 데이터 패키지 생성** |
| Truve 역할 | 기부 실행 + 영수증 발행 | **스테이블코인 기부 거래 검증, 평가액 산정, 증빙 표준화, 감사 기록 제공** |
| 자금 처리 | 기부자 → 재단 직접 송금 | **기부자/제휴 결제라인 → 재단 수령 지갑. Truve는 원칙적으로 수탁·운용하지 않음** |
| 온체인 기록 | KYC 해시 포함 가능 | **개인정보/KYC 원본 및 식별 해시는 온체인 기록 제외. evidence_hash 중심** |
| ETF 묶음 | MVP 포함 | **Cause Bundle로 개명, Phase 2** |
| 절세 시뮬레이터 | MVP 포함 | **세무 증빙 참고 리포트로 축소** |
| ESG Badge NFT | MVP 데모 | **Phase 2 확장 기능** |

---

## 1. 프로젝트 목적

Truve는 한국 재단과 비영리단체가 **스테이블코인 기반 가상자산 기부를 수령하고, 세무·감사에 필요한 증빙을 표준화할 수 있도록 돕는 XRPL 기반 B2B SaaS**입니다.

기존 기부 플랫폼은 원화 결제와 모금 중개에 집중되어 있습니다. 반면 Truve는 재단이 가상자산 기부를 받을 때 필요한 다음 업무를 표준화합니다.

- 기부자의 스테이블코인 결제 거래 확인
- 재단 수령 여부 확인
- 기부 시점 기준가 및 원화 환산액 산정
- 환전/정산 내역 기록
- 홈택스 전자기부금영수증 발급용 데이터 정리
- 세무법인·감사인이 확인 가능한 증빙 패키지 생성
- XRPL 기반 Proof Token을 통한 위변조 검증

Truve는 세무상 공식 기부금영수증을 NFT로 대체하지 않습니다. 공식 영수증은 기부금단체의 홈택스 전자기부금영수증 흐름에 맞춰 처리되며, Truve는 가상자산 기부의 거래 해시, 평가 시점, 환전 내역, 재단 승인, 영수증 발급 상태를 하나의 **Evidence Package**로 표준화합니다.

XRPL은 이 Evidence Package의 위변조 여부를 누구나 검증할 수 있게 하는 **공용 감사 원장**으로 사용됩니다.

---

## 2. 한 줄 정의

### 짧은 버전

> **Truve는 재단이 스테이블코인 기부를 세무·감사 가능한 방식으로 받을 수 있게 하는 가상자산 기부 증빙 인프라입니다.**

### 발표용 버전

> 기부금은 스테이블코인으로 재단에 직접 흐르고, 증빙은 Truve가 표준화하고, 검증은 XRPL이 담당합니다.

### 영문 버전

> **Truve is receipt evidence infrastructure for stablecoin-based crypto donations. We do not replace official tax receipts; we make crypto donations verifiable, auditable, and tax-ready.**

---

## 3. 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 서비스명 | Truve, Trust + Give |
| 핵심 가치 | 스테이블코인 기부의 수령 확인·평가액 산정·영수증 발급 데이터·감사 증빙 표준화 |
| 1차 타겟 | 재단, 비영리단체, 지정기부금단체 |
| 2차 타겟 | 세무법인, 회계법인, 기업 ESG/CSR팀 |
| End-user | 가상자산 보유 기부자 |
| 결제 자산 | RLUSD, USDC on XRPL 등 스테이블코인 중심 |
| 기술 기반 | XRPL Payment + TrustLine + DestinationTag + Memo + XLS-20 Proof Token |
| 핵심 산출물 | Evidence Package, Hometax Export Data, XRPL Proof Token, Verification Page |
| 수익 모델 | 재단 인프라 구독료 + 세무법인 검증 콘솔 + 기업 ESG 리포트 |
| MVP 기간 | 5주 |

---

## 4. 문제 정의

### 4-1. 재단의 가상자산 기부 수령 인프라 부재

한국에는 수많은 등록 비영리단체와 재단이 있지만, 가상자산 기부를 실제로 안정적으로 받을 수 있는 단체는 극히 제한적입니다.

재단이 가상자산 기부를 받지 못하는 이유는 기부 수요가 없어서가 아닙니다. 다음 운영 인프라가 없기 때문입니다.

- 어떤 지갑으로 받을 것인가
- 어떤 자산을 받을 것인가
- 누가 기부했는지 어떻게 확인할 것인가
- 기부 시점의 원화 가치는 어떻게 산정할 것인가
- 환전 내역은 어떻게 보관할 것인가
- 홈택스 기부금영수증 발급에 필요한 데이터는 어떻게 만들 것인가
- 세무법인과 감사인은 무엇을 기준으로 검증할 것인가

즉, 문제는 “기부 버튼”의 부재가 아니라 **세무·감사에 제출 가능한 증빙 패키지의 부재**입니다.

---

### 4-2. 가상자산 기부 증빙 표준 부재

원화 기부는 카드사, 계좌이체, PG, 홈택스 전자기부금영수증 흐름으로 비교적 명확하게 처리됩니다.

반면 가상자산 기부는 다음 데이터가 함께 관리되어야 합니다.

- 기부 거래 해시
- 자산 종류
- 수량
- 기부 시점
- 기부 시점 기준가
- 원화 환산액
- 환전 또는 정산 내역
- 재단 수령 승인
- 영수증 발급 상태
- 세무 검토 상태

현재 대부분의 재단은 이 데이터를 일관된 방식으로 수집·보관·검증할 시스템이 없습니다.

---

### 4-3. 기업 ESG 증빙 한계

기업이 가상자산으로 기부하거나, 블록체인 기업이 사회공헌 활동을 하려 해도 이를 객관적으로 증명할 표준이 부족합니다.

기업 ESG/CSR팀은 다음 자료가 필요합니다.

- 기부 실행 사실
- 수령 재단의 승인
- 기부 시점 평가액
- 환전 또는 집행 내역
- 외부 검증 가능한 증빙 링크
- 감사·IR·후속투자용 리포트

Truve는 이 데이터를 기업 ESG 리포트로 확장할 수 있습니다.

---

### 4-4. 세무법인과 회계법인의 검증 부담

세무법인이 가상자산 기부 건을 검토하려면 거래소 거래내역, 블록체인 거래 해시, 기준가, 환전 내역, 재단 승인 여부를 각각 확인해야 합니다.

이 과정은 수작업 비중이 높고, 건별 검토 시간이 길며, 담당자마다 기준이 달라질 수 있습니다.

Truve는 세무법인이 확인할 수 있는 표준화된 Evidence Package와 Verification Page를 제공합니다.

---

## 5. 핵심 인사이트

> 한국에는 가상자산 기부 시장이 없는 것이 아닙니다.  
> **가상자산 기부를 받을 수 있게 하는 세무·증빙·감사 인프라가 없기 때문에 시장이 열리지 않은 것입니다.**

Truve는 기부금을 모으는 플랫폼이 아니라, 재단이 가상자산 기부 시장에 진입할 수 있도록 돕는 **B2B 인프라**입니다.

---

## 6. 서비스 원칙

### 6-1. 공식 영수증을 대체하지 않는다

Truve의 XRPL Proof Token은 세무상 공식 기부금영수증이 아닙니다.

공식 기부금영수증은 기부금단체의 홈택스 전자기부금영수증 흐름에 맞춰 처리됩니다. Truve는 이 발급을 돕기 위해 거래 증빙, 평가액, 재단 승인, 환전 내역 등을 정리한 데이터를 제공합니다.

---

### 6-2. 기부금은 스테이블코인으로 처리한다

Truve는 결제 라인에서 변동성이 큰 자산보다 RLUSD, USDC on XRPL 등 스테이블코인을 중심으로 설계합니다.

스테이블코인 결제 라인을 유지하는 이유는 다음과 같습니다.

- 기부자와 재단 모두 가격 변동 리스크를 줄일 수 있음
- 기부 시점 원화 환산액 산정이 쉬워짐
- 재단의 회계 처리와 환전 관리가 단순해짐
- 글로벌 기부 및 기업 ESG 기부로 확장하기 좋음
- XRPL의 빠른 결제, 낮은 수수료, TrustLine 구조와 잘 맞음

---

### 6-3. Truve는 증빙 인프라다

Truve의 본질은 결제 사업자가 아니라 증빙 인프라입니다.

Truve는 다음 역할을 수행합니다.

- 재단의 스테이블코인 수령 환경 설정 지원
- 기부 거래 해시 및 입금 정보 검증
- 기부 시점 평가액 산정
- 재단 수령 승인 기록
- 홈택스 입력용 데이터 패키지 생성
- 세무·감사 검토용 리포트 생성
- XRPL Proof Token 발행 및 검증 페이지 제공

---

### 6-4. 개인정보는 온체인에 올리지 않는다

개인정보, KYC 원본, CI, 주민등록번호, 연락처 등은 온체인에 기록하지 않습니다.

온체인에는 다음과 같은 최소 정보만 기록합니다.

- receipt_id
- donation_tx_hash
- evidence_hash
- schema_version
- proof_issued_at

기부자 실명 정보, 세무 발급 정보, 연락처, KYC 결과는 오프체인 암호화 DB에 보관합니다.

---

## 7. 시스템 아키텍처

### 7-1. 전체 구조

```text
[기부자]
  │
  │ RLUSD / USDC on XRPL 스테이블코인 기부
  ▼
[재단 수령 지갑 또는 제휴 결제 라인]
  │
  │ 입금 확인 / 환전 내역 / 수령 승인
  ▼
[Truve Evidence Engine]
  ├─ Transaction Verifier
  ├─ Valuation Snapshot Engine
  ├─ Foundation Approval Module
  ├─ Hometax Export Builder
  ├─ Evidence Package Builder
  └─ XRPL Proof Token Minter
  │
  ▼
[XRPL]
  ├─ Payment Record
  ├─ Memo / DestinationTag
  ├─ TrustLine
  └─ XLS-20 Proof Token
  │
  ▼
[Verification Page]
  ├─ 기부자 확인
  ├─ 재단 확인
  ├─ 세무법인 검토
  └─ 기업 ESG 리포트
```

---

### 7-2. 비수탁 스테이블코인 결제 흐름

```text
1. 재단이 Truve에 가입하고 수령 지갑을 등록한다.
2. 재단은 RLUSD/USDC 수령을 위한 TrustLine을 설정한다.
3. 기부자는 Truve 화면에서 재단과 캠페인을 선택한다.
4. 기부자는 RLUSD/USDC로 재단 지갑에 직접 송금한다.
5. XRPL Payment에는 캠페인 구분용 DestinationTag와 최소 Memo가 포함된다.
6. Truve는 트랜잭션을 검증하고 재단 대시보드에 표시한다.
7. 재단 관리자가 수령 여부를 승인한다.
8. Truve는 기부 시점 기준가와 원화 환산액을 산정한다.
9. Evidence Package를 생성한다.
10. Evidence Package의 hash를 XRPL Proof Token으로 발행한다.
11. 홈택스 입력용 데이터와 세무 검토 리포트를 제공한다.
```

---

## 8. XRPL 활용 전략

### 8-1. 왜 XRPL인가

Truve가 XRPL을 쓰는 이유는 단순히 블록체인을 쓰기 위해서가 아닙니다.

Truve의 핵심 산출물은 투기성 NFT나 복잡한 DeFi 상품이 아니라, 대량으로 발행되는 저비용·고신뢰 증빙 기록입니다.

XRPL은 다음 이유로 Truve에 적합합니다.

| 필요 조건 | XRPL 적합성 |
|---|---|
| 낮은 수수료 | 소액 기부와 대량 증빙 발행에 적합 |
| 빠른 결제 | 스테이블코인 기부 수령 확인에 유리 |
| 네이티브 NFT | 별도 스마트컨트랙트 없이 Proof Token 발행 가능 |
| TrustLine | 재단이 RLUSD/USDC 수령 자산을 명확히 설정 가능 |
| DestinationTag | 재단 내 캠페인/프로젝트별 입금 구분 가능 |
| Memo | 최소 증빙 식별자 기록 가능 |
| 금융 친화성 | 결제·정산·증빙 서비스와 구조적으로 잘 맞음 |

---

### 8-2. 활용 기능

| XRPL 기능 | Truve에서의 사용 |
|---|---|
| Payment | 기부자 → 재단 스테이블코인 직접 송금 |
| TrustLine | 재단의 RLUSD/USDC 수령 설정 |
| DestinationTag | 캠페인별 입금 구분 |
| Memo | receipt_id, evidence_hash 등 최소 식별자 기록 |
| XLS-20 NFT | Evidence Package 검증용 비양도성 Proof Token |
| Explorer Link | 기부자·재단·세무법인이 동일 거래 검증 |

---

### 8-3. NFT가 아니라 Proof Token이다

Truve의 NFT는 투자용 NFT가 아닙니다.

Truve에서는 NFT라는 단어보다 **Proof Token** 또는 **Receipt Verification Token**이라는 표현을 우선 사용합니다.

Proof Token은 다음을 의미합니다.

- 특정 기부 거래와 Evidence Package를 연결하는 검증 토큰
- 공식 세무 영수증의 대체물이 아님
- 거래 해시와 증빙 패키지의 위변조 여부를 확인하는 온체인 포인터
- 원칙적으로 비양도성 또는 제한적 양도 구조
- 발급 주체는 재단, Truve는 기술 제공자

---

## 9. 핵심 산출물: Evidence Package

### 9-1. Evidence Package 정의

Evidence Package는 하나의 가상자산 기부 건을 세무·감사 가능한 형태로 정리한 표준 데이터 묶음입니다.

### 9-2. 포함 데이터

| 데이터 | 설명 |
|---|---|
| receipt_id | Truve 내부 증빙 ID |
| donation_tx_hash | XRPL 원본 기부 거래 해시 |
| asset | RLUSD, USDC 등 기부 자산 |
| amount | 기부 수량 |
| donated_at | 기부 시각 |
| valuation_time | 평가 기준 시각 |
| price_source | 기준가 출처 |
| krw_value | 원화 환산액 |
| foundation_id | 수령 재단 ID |
| campaign_id | 캠페인 ID |
| foundation_approval | 재단 수령 승인 상태 |
| conversion_record | 환전/정산 내역 |
| hometax_export_status | 홈택스 발급용 데이터 상태 |
| tax_review_status | 세무법인 검토 상태 |
| evidence_hash | 전체 증빙 패키지 hash |
| proof_token_id | XRPL Proof Token ID |
| proof_mint_tx_hash | Proof Token 발행 트랜잭션 |

---

### 9-3. Evidence Package 예시

```json
{
  "schema": "truve/evidence-package/v1",
  "receipt_id": "TRV-2026-0000001",
  "donation": {
    "asset": "RLUSD",
    "amount": "100.00",
    "tx_hash": "XRPL_TRANSACTION_HASH",
    "donated_at": "2026-04-26T12:34:00Z",
    "destination_tag": 20260001
  },
  "valuation": {
    "valuation_time": "2026-04-26T12:34:00Z",
    "price_source": "approved_price_source",
    "krw_value": 138000,
    "method": "donation-time stablecoin KRW reference"
  },
  "foundation": {
    "name": "재단명",
    "business_number_hash": "hash...",
    "wallet_address": "r..."
  },
  "approval": {
    "status": "APPROVED",
    "approved_by": "foundation_admin_id",
    "approved_at": "2026-04-26T12:45:00Z"
  },
  "tax": {
    "hometax_export_status": "READY",
    "official_receipt_status": "PENDING_FOUNDATION_ISSUANCE",
    "note": "Official tax receipt is issued by the foundation through Hometax flow."
  },
  "proof": {
    "evidence_hash": "sha256...",
    "proof_token_id": "NFTokenID...",
    "proof_mint_tx_hash": "XRPL_MINT_TX_HASH"
  }
}
```

---

## 10. 핵심 기능 명세

### 10-1. 재단 온보딩

#### 목적

재단이 개발자 없이 스테이블코인 기부 수령 환경을 만들 수 있게 합니다.

#### 기능

- 재단 계정 생성
- 사업자등록 정보 입력
- 지정기부금단체 여부 입력
- 수령 지갑 등록
- RLUSD/USDC TrustLine 설정 가이드
- 캠페인별 DestinationTag 생성
- 홈택스 발급용 기본 정보 등록
- 관리자 권한 설정

---

### 10-2. 스테이블코인 기부 결제 라인

#### 목적

기부자가 변동성 낮은 스테이블코인으로 재단에 직접 기부할 수 있게 합니다.

#### 지원 자산

- RLUSD on XRPL
- USDC on XRPL
- 향후 기타 승인된 스테이블코인

#### 기부 플로우

```text
1. 기부자가 재단/캠페인을 선택한다.
2. 기부 자산을 RLUSD 또는 USDC로 선택한다.
3. 기부 금액을 입력한다.
4. 결제 안내 화면에서 수령 지갑, DestinationTag, Memo를 확인한다.
5. Xaman 또는 지원 지갑으로 송금한다.
6. Truve가 XRPL 트랜잭션을 감지한다.
7. 재단 대시보드에 입금 대기/확인 상태가 표시된다.
8. 재단이 수령을 승인한다.
```

#### Payment Memo 예시

```json
{
  "schema": "truve/donation-payment/v1",
  "receipt_id": "TRV-2026-0000001",
  "foundation_id": "FDN-001",
  "campaign_id": "CAMP-001",
  "evidence_schema": "truve/evidence-package/v1"
}
```

개인정보, KYC hash, 이름, 연락처는 Memo에 기록하지 않습니다.

---

### 10-3. 거래 검증 모듈

#### 기능

- XRPL transaction hash 유효성 확인
- 수령 지갑 일치 여부 확인
- 자산 종류 일치 여부 확인
- 수량 일치 여부 확인
- DestinationTag 일치 여부 확인
- 중복 증빙 생성 방지
- 거래 상태 검증
- Explorer 링크 생성

---

### 10-4. 평가액 산정 모듈

#### 목적

기부 시점의 원화 환산액을 일관되게 산정합니다.

#### 기능

- 기부 시점 timestamp 기록
- 스테이블코인 기준가 조회
- 원화 환산액 계산
- 기준가 출처 저장
- 기준가 snapshot 생성
- 세무 검토용 워크페이퍼 생성

#### 원칙

최종 세무상 평가액과 공제 가능 여부는 재단의 홈택스 발급 및 세무 전문가 검토를 통해 확정됩니다. Truve의 평가는 증빙 참고 데이터입니다.

---

### 10-5. 재단 승인 모듈

#### 목적

재단이 실제 수령 여부를 확인하고 승인합니다.

#### 승인 상태

| 상태 | 의미 |
|---|---|
| PENDING | 거래 감지됨, 재단 승인 전 |
| APPROVED | 재단 수령 승인 |
| REJECTED | 재단이 해당 거래를 기부로 인정하지 않음 |
| NEEDS_REVIEW | 추가 검토 필요 |
| EXPORTED | 홈택스 입력용 데이터 export 완료 |
| OFFICIAL_RECEIPT_ISSUED | 공식 영수증 발급 완료 |

---

### 10-6. 홈택스 입력용 데이터 패키지

#### 목적

재단 담당자가 홈택스 전자기부금영수증 발급에 필요한 데이터를 쉽게 정리할 수 있게 합니다.

#### 제공 형태

- CSV
- Excel
- PDF 워크페이퍼
- 세무법인 검토용 링크

#### 포함 필드

- 기부자 식별 정보, 오프체인
- 재단 정보
- 기부일자
- 기부 자산
- 기부 수량
- 원화 환산액
- 거래 해시
- 평가 기준
- 재단 승인자
- 승인 시각
- Proof Token 링크

---

### 10-7. XRPL Proof Token 발행 모듈

#### 목적

Evidence Package의 위변조 여부를 XRPL에서 검증 가능하게 합니다.

#### 발행 원칙

- 발급 주체: 재단 또는 재단이 승인한 발행 지갑
- 기술 제공자: Truve
- 온체인 기록: receipt_id, donation_tx_hash, evidence_hash
- 개인정보 기록 금지
- 공식 세무 영수증 대체 금지
- 가급적 비양도성 구조

#### NFT Metadata 예시

```json
{
  "schema": "truve/proof-token/v1",
  "receipt_id": "TRV-2026-0000001",
  "issuer": {
    "type": "foundation",
    "name": "재단명",
    "business_number_hash": "hash..."
  },
  "technology_provider": {
    "name": "Truve",
    "role": "evidence infrastructure provider"
  },
  "donation": {
    "asset": "RLUSD",
    "amount": "100.00",
    "tx_hash": "XRPL_TRANSACTION_HASH",
    "donated_at": "2026-04-26T12:34:00Z"
  },
  "evidence": {
    "evidence_hash": "sha256...",
    "verification_url": "https://truve.io/verify/TRV-2026-0000001"
  },
  "tax_note": {
    "official_receipt": "Not replaced by this token",
    "issuer_of_official_receipt": "foundation via Hometax flow"
  }
}
```

#### NFTokenMint 예시

```javascript
{
  TransactionType: "NFTokenMint",
  Account: "{foundation_or_authorized_minter_wallet}",
  Issuer: "{foundation_wallet_address}",
  NFTokenTaxon: 1,
  Flags: 0,
  URI: hex("https://truve.io/proofs/TRV-2026-0000001.json"),
  Memos: [{
    Memo: {
      MemoType: hex("truve/proof/v1"),
      MemoData: hex(JSON.stringify({
        receipt_id: "TRV-2026-0000001",
        donation_tx: "XRPL_TRANSACTION_HASH",
        evidence_hash: "sha256..."
      }))
    }
  }]
}
```

주의: tfTransferable을 설정하면 제3자 이전 가능 의미가 될 수 있으므로, 비양도성 증빙으로 설계할 경우 설정하지 않는 방향으로 관리합니다.

---

### 10-8. 검증 페이지

#### 목적

기부자, 재단, 세무법인, 기업 담당자가 같은 증빙을 확인할 수 있게 합니다.

#### 화면 구성

```text
[Truve Verification Page]
├─ Receipt ID
├─ 재단명
├─ 기부 자산 / 수량
├─ 기부 시점
├─ 원화 환산액
├─ XRPL Donation Transaction Link
├─ XRPL Proof Token Link
├─ Evidence Hash
├─ 재단 승인 상태
├─ 공식 영수증 발급 상태
└─ 세무 검토 상태
```

---

### 10-9. 세무 증빙 참고 리포트

#### 기존 v5의 절세 시뮬레이터를 대체하는 기능

Truve는 세무 자문을 제공하지 않습니다. 대신 세무 전문가가 검토할 수 있는 참고 리포트를 생성합니다.

#### 포함 내용

- 거래 해시
- 기부 자산
- 수량
- 기부 시점
- 기준가
- 원화 환산액
- 평가 방식
- 재단 승인 상태
- 공식 영수증 발급 상태
- Proof Token 링크

#### 면책 문구

> 본 리포트는 세무 검토를 위한 참고 자료입니다. 최종 기부금 공제 가능 여부, 공제 금액, 공식 영수증 발급 여부는 기부금단체의 홈택스 발급 절차 및 세무 전문가 검토를 통해 확정됩니다.

---

### 10-10. 재단 대시보드

#### 핵심 화면

```text
[재단 대시보드]
├─ 오늘의 신규 기부
├─ 입금 감지 / 승인 대기
├─ 승인 완료 기부
├─ Evidence Package 생성 상태
├─ 홈택스 Export 상태
├─ 세무법인 검토 상태
├─ XRPL Proof Token 발행 상태
├─ 캠페인별 수령액
├─ 스테이블코인 자산별 수령액
└─ TrustLine / 지갑 설정
```

---

### 10-11. Cause Bundle, Phase 2

기존 ETF 묶음은 금융상품처럼 보일 위험이 있으므로 **Cause Bundle**로 변경합니다.

#### 정의

Cause Bundle은 복수 재단에 대한 기부 거래를 하나의 증빙 리포트로 묶어 관리하는 기능입니다.

Truve는 금융상품을 구성하거나 운용하지 않습니다. 기부자가 직접 선택한 배분 결과를 증빙화합니다.

---

### 10-12. 기업 ESG 리포트, Phase 2

기업 ESG 대시보드는 Phase 2 확장 기능입니다.

MVP에서는 재단이 기업 기부 건에 대한 검증 가능한 증빙 리포트를 생성할 수 있는 수준까지만 구현합니다.

Phase 2에서는 다음으로 확장합니다.

- 기업별 기부 이력 대시보드
- 분기별 ESG 리포트
- IR/감사용 Proof Link
- 기업 홈페이지 임베드 위젯
- ESG Badge Proof Token

---

## 11. 데이터 모델 초안

```prisma
model Foundation {
  id                         String   @id @default(cuid())
  name                       String
  business_number_hash       String
  designated_org_status      String?
  xrpl_wallet                String
  accepted_assets            String[] // ["RLUSD", "USDC"]
  trustlines_active          Json
  verified                   Boolean  @default(false)
  created_at                 DateTime @default(now())

  campaigns                  Campaign[]
  donations                  Donation[]
}

model Campaign {
  id              String   @id @default(cuid())
  foundation_id   String
  name            String
  purpose         String
  destination_tag Int      @unique
  active          Boolean  @default(true)
  created_at      DateTime @default(now())
}

model Donor {
  id              String   @id @default(cuid())
  email           String?
  kyc_status      String
  xrpl_wallet     String?
  created_at      DateTime @default(now())

  donations       Donation[]
}

model Donation {
  id                    String   @id @default(cuid())
  receipt_id             String   @unique
  donor_id               String?
  foundation_id          String
  campaign_id            String?

  asset                  String   // RLUSD | USDC
  amount                 String
  xrpl_tx_hash           String   @unique
  destination_tag        Int?
  donated_at             DateTime

  status                 String   // DETECTED | APPROVED | REJECTED | NEEDS_REVIEW
  foundation_approved_at DateTime?

  evidence_package_id    String?
  created_at             DateTime @default(now())
}

model ValuationSnapshot {
  id                  String   @id @default(cuid())
  donation_id          String   @unique
  asset               String
  amount              String
  valuation_time      DateTime
  price_source        String
  krw_value           BigInt
  method              String
  created_at          DateTime @default(now())
}

model EvidencePackage {
  id                    String   @id @default(cuid())
  receipt_id             String   @unique
  donation_id            String   @unique

  donation_tx_hash       String
  valuation_snapshot_id  String
  foundation_approval_id String?

  evidence_hash          String   @unique
  proof_token_id         String?
  proof_mint_tx_hash     String?

  hometax_export_status  String   // NOT_READY | READY | EXPORTED | ISSUED | REJECTED
  tax_review_status      String   // NOT_REVIEWED | IN_REVIEW | REVIEWED

  created_at             DateTime @default(now())
}

model ProofToken {
  id                String   @id @default(cuid())
  receipt_id        String   @unique
  nft_token_id      String?
  mint_tx_hash      String?
  metadata_uri      String
  issued_by         String   // foundation wallet
  issued_at         DateTime @default(now())
}

model HometaxExport {
  id                String   @id @default(cuid())
  receipt_id        String   @unique
  export_format     String   // CSV | XLSX | PDF
  export_url        String?
  status            String
  created_at        DateTime @default(now())
}
```

---

## 12. 5주 MVP 실행 계획

### 12-1. MVP 목표

> 5주 안에 “재단이 스테이블코인 기부를 받고, Truve가 Evidence Package를 만들고, XRPL Proof Token으로 검증하는 흐름”을 완성한다.

### 12-2. 포함 기능

| 우선순위 | 기능 | 포함 여부 |
|---|---|---|
| P0 | 재단 온보딩 | 포함 |
| P0 | RLUSD/USDC 수령 설정 | 포함 |
| P0 | TrustLine 설정 가이드 | 포함 |
| P0 | 스테이블코인 Payment 감지 | 포함 |
| P0 | DestinationTag 기반 캠페인 구분 | 포함 |
| P0 | 거래 검증 | 포함 |
| P0 | 재단 수령 승인 | 포함 |
| P0 | 평가액 산정 | 포함 |
| P0 | Evidence Package 생성 | 포함 |
| P0 | XRPL Proof Token 발행 | 포함 |
| P0 | Verification Page | 포함 |
| P1 | 홈택스 입력용 CSV/Excel 생성 | 포함 |
| P1 | 세무 증빙 참고 리포트 | 포함 |
| P2 | 기업 ESG 리포트 | 데모 수준 |
| Phase 2 | Cause Bundle | 제외 |
| Phase 2 | ESG Badge Token | 제외 |
| Phase 2 | DEX 자동 환전 | 제외 |
| Phase 2 | Escrow 조건부 기부 | 제외 |
| Phase 2 | Multi-signing 재단 거버넌스 | 제외 |

---

### 12-3. 주차별 계획

| 주차 | 목표 | 산출물 |
|---|---|---|
| 1주차 | 기반 구축 | Next.js, DB, XRPL Testnet, 재단/캠페인 모델 |
| 2주차 | 스테이블코인 결제 라인 | TrustLine, Payment 감지, DestinationTag, 거래 검증 |
| 3주차 | Evidence Engine | 평가액 산정, 재단 승인, Evidence Package 생성 |
| 4주차 | Proof & Verification | XLS-20 Proof Token, 검증 페이지, 홈택스 Export |
| 5주차 | 통합 데모 | 재단 대시보드, 시연 플로우, 리스크 대응 문서 |

---

## 13. Final Pitch Day 시연 시나리오

### 5분 데모 구조

```text
[0:00~0:30] 문제 정의
재단은 가상자산 기부를 받고 싶어도 세무·감사 증빙 표준이 없어 받지 못한다.

[0:30~1:10] 재단 온보딩
재단이 Truve에 가입하고 RLUSD/USDC 수령 지갑과 TrustLine을 설정한다.

[1:10~2:00] 스테이블코인 기부
기부자가 RLUSD 또는 USDC로 재단 지갑에 직접 기부한다.
XRPL Explorer에서 Payment, DestinationTag, Memo를 확인한다.

[2:00~3:00] Evidence Package 생성
Truve가 거래 해시, 자산 수량, 기부 시점 기준가, 원화 환산액, 재단 승인 정보를 묶는다.

[3:00~4:00] XRPL Proof Token 발행
Evidence Hash를 XLS-20 Proof Token으로 발행하고 검증 페이지에서 대조한다.

[4:00~5:00] 홈택스/세무/감사 연결
재단은 홈택스 입력용 데이터를 받고, 세무법인은 동일한 검증 페이지를 확인한다.
```

### 마무리 멘트

> Truve는 기부 플랫폼이 아닙니다.  
> Truve는 재단이 스테이블코인 기부를 받을 수 있게 하는 증빙 인프라입니다.  
> 결제는 스테이블코인으로, 증빙은 Evidence Package로, 검증은 XRPL로 처리합니다.

---

## 14. 수익 모델

### 14-1. 재단 인프라 구독료

| 플랜 | 월 과금 | 대상 |
|---|---:|---|
| Pilot | 무료 | 초기 파트너 재단 |
| Starter | 30만 원 | 월 기부 건수 적은 재단 |
| Business | 70만 원 | 정기 캠페인 운영 재단 |
| Enterprise | 협의 | 대형 재단, 기업 기부 연계 재단 |

포함 기능:

- 재단 지갑/TrustLine 설정
- 캠페인별 DestinationTag 관리
- Evidence Package 생성
- 홈택스 Export
- Proof Token 발행
- Verification Page

---

### 14-2. 세무법인 검증 콘솔

| 모델 | 내용 |
|---|---|
| Per-seat | 세무 담당자 계정당 월 과금 |
| Per-case | 검토 건당 과금 |
| Partner | 세무법인 B2B2B 리퍼럴 |

---

### 14-3. 기업 ESG 리포트

| 모델 | 내용 |
|---|---|
| ESG 리포트 구독 | 기업별 월 구독 |
| Proof Link 패키지 | 감사/IR용 검증 링크 |
| ESG Badge, Phase 2 | 기업 기부 활동 증빙 토큰 |

---

## 15. 리스크 및 대응

| 리스크 | 질문 | 대응 |
|---|---|---|
| NFT가 공식 영수증인가 | NFT로 세액공제를 받을 수 있나 | 아니오. 공식 영수증은 홈택스 흐름이며, Proof Token은 증빙 검증 레이어입니다. |
| VASP 리스크 | Truve가 가상자산 이전/중개업인가 | Truve는 수탁·운용을 하지 않고, 재단 직접 수령 거래의 증빙을 표준화하는 SaaS로 설계합니다. 필요 시 제휴 VASP/결제 파트너와 역할을 분리합니다. |
| 개인정보 | 개인정보가 온체인에 남나 | 개인정보와 KYC 정보는 온체인에 기록하지 않습니다. 온체인에는 evidence_hash만 기록합니다. |
| 시장 작음 | 가상자산 기부 재단이 적다 | 시장이 작은 것이 아니라 인프라가 없어 열리지 않았습니다. 초기 타겟은 ESG·글로벌 후원 니즈가 있는 상위 재단입니다. |
| 스테이블코인 규제 | RLUSD/USDC 기부가 가능한가 | MVP는 테스트넷/파일럿 중심으로 검증하고, 실제 운영은 법률 자문과 제휴 파트너 구조로 단계적 도입합니다. |
| 평가액 분쟁 | 기준가가 다르면 어떻게 하나 | 평가 기준 시점과 출처를 사전에 고지하고 snapshot으로 저장합니다. 최종 세무 판단은 전문가 검토로 확정합니다. |
| 재단 도입 저항 | 재단이 왜 돈을 내나 | 개발 없이 스테이블코인 기부 창구와 세무·감사 증빙 패키지를 확보하기 때문입니다. |

---

## 16. 심사위원 예상 Q&A

### Q1. Truve는 기부 플랫폼인가요?

아닙니다. Truve는 기부금을 모으는 플랫폼이 아니라, 재단이 스테이블코인 기반 가상자산 기부를 세무·감사 가능한 방식으로 받을 수 있게 하는 증빙 인프라입니다.

---

### Q2. NFT가 기부금영수증인가요?

아닙니다. 세무상 공식 기부금영수증은 재단이 홈택스 전자기부금영수증 흐름에 맞춰 발급합니다. Truve의 Proof Token은 거래 해시, 평가 시점, 재단 승인, 증빙 패키지의 위변조 여부를 검증하는 온체인 증빙입니다.

---

### Q3. 왜 블록체인이 필요한가요? DB로 하면 되지 않나요?

재단, 기부자, 기업, 세무법인, 감사인이 모두 같은 기록을 검증해야 하기 때문입니다. DB는 Truve를 신뢰해야 하지만, XRPL에 남긴 evidence_hash와 거래 해시는 Truve를 믿지 않아도 검증할 수 있습니다.

---

### Q4. 왜 XRPL인가요?

Truve는 복잡한 스마트컨트랙트가 아니라 빠르고 낮은 비용의 결제·증빙 인프라가 필요합니다. XRPL은 스테이블코인 Payment, TrustLine, DestinationTag, Memo, 네이티브 NFT를 제공하므로 재단 기부 수령과 증빙 발행에 적합합니다.

---

### Q5. 왜 스테이블코인인가요?

기부는 회계와 세무 처리가 중요합니다. XRP나 BTC처럼 변동성이 큰 자산보다 RLUSD/USDC 같은 스테이블코인을 사용하면 기부자와 재단 모두 가격 변동 리스크를 줄이고, 평가액 산정과 영수증 발급 프로세스를 단순화할 수 있습니다.

---

### Q6. Truve가 가상자산사업자 신고 대상이 되지 않나요?

Truve는 원칙적으로 자금을 수탁하거나 운용하지 않고, 재단이 직접 수령한 스테이블코인 기부 거래를 검증하고 증빙화하는 SaaS입니다. 실제 운영 단계에서는 제휴 VASP/결제 파트너, 재단, Truve의 역할을 분리하고 법률 자문에 따라 구조를 확정합니다.

---

### Q7. 재단이 왜 Truve에 비용을 내나요?

재단은 가상자산 기부를 받고 싶어도 KYC, 수령 확인, 평가액 산정, 환전 증빙, 홈택스 발급 데이터, 감사 대응을 처리할 인프라가 없습니다. Truve를 쓰면 개발 없이 스테이블코인 기부 창구와 증빙 패키지를 확보할 수 있습니다.

---

## 17. 내부 관리용 체크리스트

### 17-1. 문서에서 제거해야 할 표현

- NFT 영수증이 공식 기부금영수증처럼 보이는 표현
- “회피”라는 단어
- ETF 묶음이라는 이름
- 절세 시뮬레이터가 세무 자문처럼 보이는 표현
- Truve가 자금을 보관/운용/중개하는 표현
- KYC 해시를 온체인에 영구 기록한다는 표현

---

### 17-2. 문서에서 반복해야 할 표현

- 공식 영수증은 홈택스 흐름에 맞춰 재단이 발급
- Truve는 Evidence Package를 표준화
- XRPL Proof Token은 증빙 검증 레이어
- 결제는 스테이블코인 중심
- 재단이 직접 수령하고 Truve는 증빙을 처리
- 개인정보는 온체인에 기록하지 않음
- 시장이 작은 것이 아니라 인프라가 없어 열리지 않았음

---

### 17-3. MVP에서 반드시 보여줘야 할 것

- 재단 온보딩
- RLUSD/USDC 수령 설정
- 스테이블코인 Payment 발생
- DestinationTag로 캠페인 구분
- 거래 검증
- 재단 승인
- 평가액 snapshot
- Evidence Package 생성
- XLS-20 Proof Token 발행
- Verification Page
- 홈택스 입력용 데이터 Export

---

## 18. 최종 포지션

> **Truve는 재단이 스테이블코인 기부를 세무·감사 가능한 방식으로 받을 수 있게 하는 가상자산 기부 증빙 표준 인프라입니다.**

기부금은 재단이 직접 받고, Truve는 그 기부가 언제, 어떤 자산으로, 얼마의 가치로, 어떤 재단에 수령되었는지를 Evidence Package로 표준화합니다.

XRPL은 이 Evidence Package의 위변조 여부를 검증하는 공용 감사 원장입니다.

Truve의 목표는 한국에서 가상자산 기부를 받는 재단을 늘리는 것입니다.  
재단이 개발자 없이 스테이블코인 기부를 받을 수 있게 하고, 세무법인과 감사인이 검증 가능한 증빙을 제공함으로써, 가상자산 기부 시장이 실제로 작동하도록 만드는 것이 Truve의 핵심입니다.

---

**문서 버전**: v6 관리용  
**작성 기준**: v5 제안보고서 + 전략 수정 논의 반영  
**핵심 방향**: Donation Platform → Stablecoin Donation Evidence Infrastructure
