# Truve 제안보고서 v6 FULL
## Stablecoin Donation Evidence Infrastructure for Korean Foundations

> **Truve는 기부 플랫폼이 아니라, 재단이 스테이블코인 기반 가상자산 기부를 세무·감사 가능한 방식으로 받을 수 있게 하는 Receipt Evidence Infrastructure입니다.**  
> 기부금은 스테이블코인으로 재단에 직접 흐르고, 증빙은 Truve가 표준화하며, 검증은 XRPL이 담당합니다.

---

## 문서 메타

| 항목 | 내용 |
|---|---|
| 문서명 | Truve 제안보고서 v6 FULL |
| 목적 | v5 제안보고서의 풀 리라이팅 및 v6 전략 반영 |
| 작성 기준 | 기부 플랫폼 → 스테이블코인 기부 증빙 표준 인프라 |
| 핵심 변경 | NFT 영수증 중심에서 Evidence Package + XRPL Proof Token 중심으로 전환 |
| 결제 라인 | RLUSD / USDC on XRPL 등 스테이블코인 중심 |
| 사용 목적 | 내부 관리, 개발 에이전트 전달, 피치덱/신청서 작성용 원본 문서 |

---

## 0. v6 핵심 변경 요약

| 영역 | v5 방향 | v6 FULL 방향 |
|---|---|---|
| 정체성 | 가상자산 기부 영수증/NFT 플랫폼 | **스테이블코인 기반 가상자산 기부 증빙·세무·감사 표준 인프라** |
| 핵심 고객 | B2C 기부자 + 재단 + 기업 | **재단·비영리단체 1순위, 세무법인·기업 ESG팀 2순위, 기부자는 End-user** |
| 결제 라인 | XRP / RLUSD / USDC 직접 기부 | **RLUSD / USDC on XRPL 등 스테이블코인 결제 라인 유지** |
| NFT 정의 | 가상자산 기부 영수증 NFT | **공식 영수증 대체물이 아닌 Evidence Package 검증용 Proof Token** |
| 세무 흐름 | NFT/PDF 영수증 발행 | **홈택스 전자기부금영수증 발급을 보조하는 데이터 패키지 생성** |
| Truve 역할 | 기부 실행 + 영수증 발행 | **기부 거래 검증, 평가액 산정, 증빙 표준화, 감사 기록 제공** |
| 자금 처리 | 기부자 → 재단 직접 송금 | **기부자/제휴 결제라인 → 재단 수령 지갑. Truve는 원칙적으로 수탁·운용하지 않음** |
| 온체인 기록 | KYC hash 포함 가능 | **개인정보/KYC 원본 및 식별 해시는 온체인 기록 제외. evidence_hash 중심** |
| ETF 묶음 | MVP 포함 | **Cause Bundle로 개명, Phase 2** |
| 절세 시뮬레이터 | MVP 포함 | **세무 증빙 참고 리포트로 축소** |
| ESG Badge NFT | MVP 데모 포함 | **Phase 2 확장 기능** |
| MVP 초점 | 기부자 앱 + NFT 영수증 | **재단 온보딩 + 스테이블코인 수령 + Evidence Package + XRPL Proof Token** |

---

## 1. 보고서 목적

Truve는 한국 재단과 비영리단체가 **스테이블코인 기반 가상자산 기부를 수령하고, 세무·감사에 필요한 증빙을 표준화할 수 있도록 돕는 XRPL 기반 B2B SaaS**입니다.

기존 기부 플랫폼은 원화 결제와 모금 중개에 집중되어 있습니다. 반면 Truve는 재단이 가상자산 기부를 받을 때 반드시 필요한 다음 업무를 표준화합니다.

- 재단의 스테이블코인 수령 환경 구축
- RLUSD / USDC on XRPL 기반 기부 거래 확인
- 재단 수령 여부 확인
- 기부 시점 기준가 및 원화 환산액 산정
- 환전/정산 내역 기록
- 홈택스 전자기부금영수증 발급용 데이터 정리
- 세무법인·회계법인·감사인이 확인 가능한 증빙 패키지 생성
- XRPL 기반 Proof Token을 통한 위변조 검증

Truve는 세무상 공식 기부금영수증을 NFT로 대체하지 않습니다. 공식 영수증은 기부금단체의 홈택스 전자기부금영수증 흐름에 맞춰 처리되며, Truve는 가상자산 기부의 거래 해시, 평가 시점, 환전 내역, 재단 승인, 영수증 발급 상태를 하나의 **Evidence Package**로 표준화합니다.

XRPL은 이 Evidence Package의 위변조 여부를 누구나 검증할 수 있게 하는 **공용 감사 원장**으로 사용됩니다.

---

## 2. 한 줄 정의

### 2-1. 짧은 버전

> **Truve는 재단이 스테이블코인 기부를 세무·감사 가능한 방식으로 받을 수 있게 하는 가상자산 기부 증빙 인프라입니다.**

### 2-2. 발표용 버전

> 기부금은 스테이블코인으로 재단에 직접 흐르고, 증빙은 Truve가 표준화하고, 검증은 XRPL이 담당합니다.

### 2-3. 영문 버전

> **Truve is receipt evidence infrastructure for stablecoin-based crypto donations. We do not replace official tax receipts; we make crypto donations verifiable, auditable, and tax-ready.**

### 2-4. 피치용 핵심 문장

> 한국에는 가상자산 기부 수요가 없는 것이 아닙니다.  
> 재단이 가상자산 기부를 받을 수 있게 하는 세무·증빙·감사 인프라가 없기 때문에 시장이 열리지 않은 것입니다.

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

### 3-1. 핵심 포지셔닝

Truve는 기부금을 모으는 서비스가 아닙니다. Truve는 재단이 스테이블코인 기반 가상자산 기부를 받을 수 있도록 수령·증빙·세무·감사 흐름을 표준화하는 B2B 인프라입니다.

### 3-2. 무엇을 하지 않는가

Truve는 다음을 하지 않습니다.

- 공식 기부금영수증을 NFT로 대체하지 않음
- 기부자의 개인정보를 퍼블릭 체인에 기록하지 않음
- 기부금을 임의로 보관·운용하지 않음
- ETF 또는 투자상품을 구성하지 않음
- 세무 자문을 제공하지 않음
- 재단 대신 공식 세무 판단을 하지 않음

### 3-3. 무엇을 하는가

Truve는 다음을 합니다.

- 재단의 스테이블코인 수령 준비를 지원
- 기부 거래 해시를 검증
- 기부 시점 기준가와 원화 환산액을 기록
- 재단 승인 기록을 남김
- 홈택스 입력용 데이터를 생성
- 세무법인 검토용 리포트를 생성
- XRPL Proof Token을 발행해 증빙 위변조 여부를 검증

---

## 4. 문제 정의

### 4-1. 재단의 가상자산 기부 수령 인프라 부재

한국에는 수많은 등록 비영리단체와 재단이 있지만, 가상자산 기부를 실제로 안정적으로 받을 수 있는 단체는 극히 제한적입니다.

재단이 가상자산 기부를 받지 못하는 이유는 기부 수요가 없어서가 아닙니다. 다음 운영 인프라가 없기 때문입니다.

- 어떤 지갑으로 받을 것인가
- 어떤 자산을 받을 것인가
- 스테이블코인 수령을 위한 TrustLine은 어떻게 설정할 것인가
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

## 7. 디지털 자산 & XRPL 활용 요약

```text
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 Truve v6의 디지털 자산 & XRPL 활용 요약
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▷ 다루는 디지털 자산
  • RLUSD on XRPL — 변동성 낮은 스테이블코인 기부 결제 라인
  • USDC on XRPL — 글로벌 호환 스테이블코인 기부 결제 라인
  • XRP — 네트워크 수수료 및 테스트/운영 보조 자산
  • Truve Proof Token — Evidence Package 검증용 XLS-20 기반 증빙 토큰

▷ 활용하는 XRPL 핵심 기능, MVP 5주
  ① Payment — 기부자 → 재단 스테이블코인 직접 송금
  ② TrustLine — 재단의 RLUSD/USDC 수령 설정
  ③ DestinationTag — 캠페인별 입금 구분
  ④ Memo — receipt_id, schema_version 등 최소 증빙 식별자 기록
  ⑤ XLS-20 NFT — Evidence Package 검증용 Proof Token 발행

▷ Phase 2 확장 기능
  ⑥ DEX — 재단의 스테이블코인/기타 자산 환전 옵션 검토
  ⑦ Escrow — 조건부 기부 또는 캠페인 목표 미달 시 환불 구조 검토
  ⑧ AMM — 유동성 및 환전 최적화 검토
  ⑨ Multi-signing — 재단 내부 승인/거버넌스 구조
  ⑩ Credential / Permissioned Domain — 기관·세무법인·재단 접근권한 고도화 검토

▷ 핵심 차별점
  Truve는 NFT를 공식 영수증처럼 주장하지 않는다.
  Truve의 Proof Token은 Evidence Package의 위변조 여부를 확인하는 온체인 포인터다.
  공식 세무 영수증은 홈택스 흐름에 맞춰 재단이 발급하고,
  Truve는 그 발급을 위해 필요한 가상자산 기부 증빙 데이터를 표준화한다.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 8. 시스템 아키텍처

### 8-1. 전체 구조

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

### 8-2. 비수탁 스테이블코인 결제 흐름

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

### 8-3. 사용자 레이어

```text
┌──────────────────────────────────────────────────────────────┐
│ 사용자 레이어                                                   │
├──────────────────────┬──────────────────────┬────────────────┤
│ End-user 기부자       │ Primary 재단           │ Secondary 파트너 │
│ 스테이블코인 기부 실행 │ 수령 승인/영수증 발급   │ 세무/감사/ESG 검증 │
└──────────┬───────────┴──────────┬───────────┴───────┬────────┘
           │                      │                   │
           ▼                      ▼                   ▼
┌──────────────────────────────────────────────────────────────┐
│ Truve Platform                                                │
│ - Donor Payment Guide                                         │
│ - Foundation Dashboard                                        │
│ - Evidence Package Engine                                     │
│ - Hometax Export Builder                                      │
│ - Proof Token Minting                                         │
│ - Verification Page                                           │
└──────────────────────────────────────────────────────────────┘
```

---

## 9. XRPL 활용 전략

### 9-1. 왜 XRPL인가

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

### 9-2. 활용 기능

| XRPL 기능 | Truve에서의 사용 | MVP 여부 |
|---|---|---|
| Payment | 기부자 → 재단 스테이블코인 직접 송금 | 포함 |
| TrustLine | 재단의 RLUSD/USDC 수령 설정 | 포함 |
| DestinationTag | 캠페인별 입금 구분 | 포함 |
| Memo | receipt_id, evidence_schema 등 최소 식별자 기록 | 포함 |
| XLS-20 NFT | Evidence Package 검증용 Proof Token | 포함 |
| Explorer Link | 기부자·재단·세무법인이 동일 거래 검증 | 포함 |
| DEX | 환전 옵션 검토 | Phase 2 |
| Escrow | 조건부 기부/목표 미달 환불 | Phase 2 |
| Multi-signing | 재단 내부 승인 구조 | Phase 2 |

---

### 9-3. NFT가 아니라 Proof Token이다

Truve의 NFT는 투자용 NFT가 아닙니다.

Truve에서는 NFT라는 단어보다 **Proof Token** 또는 **Receipt Verification Token**이라는 표현을 우선 사용합니다.

Proof Token은 다음을 의미합니다.

- 특정 기부 거래와 Evidence Package를 연결하는 검증 토큰
- 공식 세무 영수증의 대체물이 아님
- 거래 해시와 증빙 패키지의 위변조 여부를 확인하는 온체인 포인터
- 원칙적으로 비양도성 또는 제한적 양도 구조
- 발급 주체는 재단, Truve는 기술 제공자

---

## 10. 핵심 산출물: Evidence Package

### 10-1. Evidence Package 정의

Evidence Package는 하나의 가상자산 기부 건을 세무·감사 가능한 형태로 정리한 표준 데이터 묶음입니다.

### 10-2. 포함 데이터

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

### 10-3. Evidence Package 예시

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

## 11. 핵심 기능 명세

### 11-1. 재단 온보딩 모듈

#### 목적

재단이 개발자 없이 스테이블코인 기부 수령 환경을 만들 수 있게 합니다.

#### 기능

| 기능 | 입력 | 출력 | 비고 |
|---|---|---|---|
| 재단 계정 생성 | 이메일, 담당자 정보 | Foundation Admin 계정 | 관리자 권한 부여 |
| 재단 정보 등록 | 사업자 정보, 지정기부금단체 여부 | Foundation Profile | 원본 서류는 오프체인 |
| 지갑 등록 | XRPL 지갑 주소 | Foundation Wallet | 소유권 검증 필요 |
| TrustLine 설정 | RLUSD/USDC 선택 | TrustSet Payload | Xaman 또는 지원 지갑 서명 |
| 캠페인 등록 | 캠페인명, 목적, 기간 | Campaign + DestinationTag | 캠페인별 입금 구분 |
| 홈택스 기본정보 | 발급 담당자, 기부금 유형 | Hometax Export 기본값 | 실제 발급은 재단 수행 |

#### API 엔드포인트

```text
POST   /api/foundation/register
POST   /api/foundation/verify-business
POST   /api/foundation/wallet/register
POST   /api/foundation/trustline/build
POST   /api/foundation/trustline/verify
POST   /api/foundation/campaign
GET    /api/foundation/dashboard
GET    /api/foundation/settings
```

---

### 11-2. 스테이블코인 기부 결제 라인

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

#### API 엔드포인트

```text
POST   /api/donation/init
POST   /api/donation/build-payment-payload
POST   /api/donation/confirm
GET    /api/donation/{receipt_id}
GET    /api/donation/list
```

---

### 11-3. 거래 검증 모듈

#### 목적

기부자가 제출한 거래 또는 Truve가 감지한 거래가 실제 재단 기부 거래인지 검증합니다.

#### 검증 항목

- XRPL transaction hash 유효성 확인
- 수령 지갑 일치 여부 확인
- 자산 종류 일치 여부 확인
- 수량 일치 여부 확인
- DestinationTag 일치 여부 확인
- Memo schema 일치 여부 확인
- 중복 증빙 생성 방지
- 거래 성공 여부 검증
- Explorer 링크 생성

#### API 엔드포인트

```text
POST   /api/tx/verify
GET    /api/tx/{hash}
GET    /api/tx/watch/foundation/{foundation_id}
```

---

### 11-4. 평가액 산정 모듈

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

#### API 엔드포인트

```text
POST   /api/valuation/create
GET    /api/valuation/{donation_id}
GET    /api/valuation/source/list
```

---

### 11-5. 재단 승인 모듈

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

#### API 엔드포인트

```text
POST   /api/foundation/donation/{id}/approve
POST   /api/foundation/donation/{id}/reject
POST   /api/foundation/donation/{id}/review
GET    /api/foundation/donations
```

---

### 11-6. 홈택스 입력용 데이터 패키지

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

#### API 엔드포인트

```text
POST   /api/hometax/export/create
GET    /api/hometax/export/{receipt_id}
GET    /api/hometax/export/list
```

---

### 11-7. XRPL Proof Token 발행 모듈

#### 목적

Evidence Package의 위변조 여부를 XRPL에서 검증 가능하게 합니다.

#### 발행 원칙

- 발급 주체: 재단 또는 재단이 승인한 발행 지갑
- 기술 제공자: Truve
- 온체인 기록: receipt_id, donation_tx_hash, evidence_hash
- 개인정보 기록 금지
- 공식 세무 영수증 대체 금지
- 가급적 비양도성 구조

#### Proof Token Metadata 예시

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

#### API 엔드포인트

```text
POST   /api/proof/mint
GET    /api/proof/{receipt_id}
GET    /api/proof/{receipt_id}/metadata
GET    /api/proof/{receipt_id}/verify
```

---

### 11-8. 검증 페이지

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

#### API 엔드포인트

```text
GET    /verify/{receipt_id}
GET    /api/verify/{receipt_id}
POST   /api/verify/hash-check
```

---

### 11-9. 세무 증빙 참고 리포트

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

### 11-10. 재단 대시보드

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

#### API 엔드포인트

```text
GET    /api/foundation/dashboard
GET    /api/foundation/donations
GET    /api/foundation/evidence-packages
GET    /api/foundation/hometax-exports
GET    /api/foundation/proofs
```

---

### 11-11. 세무법인 콘솔, Phase 2 우선순위

#### 핵심 기능

- 고객 재단별 기부 데이터 조회
- Evidence Package 검토
- 홈택스 입력용 데이터 검토
- 세무 검토 상태 업데이트
- 건별 검토 리포트 생성
- Per-seat 라이선스 과금

---

### 11-12. Cause Bundle, Phase 2

기존 ETF 묶음은 금융상품처럼 보일 위험이 있으므로 **Cause Bundle**로 변경합니다.

#### 정의

Cause Bundle은 복수 재단에 대한 기부 거래를 하나의 증빙 리포트로 묶어 관리하는 기능입니다.

Truve는 금융상품을 구성하거나 운용하지 않습니다. 기부자가 직접 선택한 배분 결과를 증빙화합니다.

---

### 11-13. 기업 ESG 리포트, Phase 2

기업 ESG 대시보드는 Phase 2 확장 기능입니다.

MVP에서는 재단이 기업 기부 건에 대한 검증 가능한 증빙 리포트를 생성할 수 있는 수준까지만 구현합니다.

Phase 2에서는 다음으로 확장합니다.

- 기업별 기부 이력 대시보드
- 분기별 ESG 리포트
- IR/감사용 Proof Link
- 기업 홈페이지 임베드 위젯
- ESG Badge Proof Token

---

## 12. 데이터 모델, Prisma Schema 초안

```prisma
model User {
  id              String   @id @default(cuid())
  type            UserType
  email           String   @unique
  kyc_status      KYCStatus @default(NOT_STARTED)
  xrpl_wallet     String?
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt

  donor           Donor?
  foundation_admin FoundationAdmin?
  tax_partner     TaxPartner?
  company_admin   CompanyAdmin?
}

model Donor {
  id              String   @id @default(cuid())
  user_id          String   @unique
  user            User     @relation(fields: [user_id], references: [id])
  display_name     String?
  encrypted_identity_ref String?
  donations       Donation[]
  created_at      DateTime @default(now())
}

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
  updated_at                 DateTime @updatedAt

  admins                     FoundationAdmin[]
  campaigns                  Campaign[]
  donations                  Donation[]
}

model FoundationAdmin {
  id              String   @id @default(cuid())
  user_id          String   @unique
  user            User     @relation(fields: [user_id], references: [id])
  foundation_id    String
  foundation       Foundation @relation(fields: [foundation_id], references: [id])
  role            String   // OWNER | MANAGER | VIEWER
  created_at      DateTime @default(now())
}

model Campaign {
  id              String   @id @default(cuid())
  foundation_id   String
  foundation      Foundation @relation(fields: [foundation_id], references: [id])
  name            String
  purpose         String
  destination_tag Int      @unique
  active          Boolean  @default(true)
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt

  donations       Donation[]
}

model Donation {
  id                    String   @id @default(cuid())
  receipt_id             String   @unique
  donor_id               String?
  donor                 Donor?   @relation(fields: [donor_id], references: [id])
  foundation_id          String
  foundation             Foundation @relation(fields: [foundation_id], references: [id])
  campaign_id            String?
  campaign               Campaign? @relation(fields: [campaign_id], references: [id])

  asset                  String   // RLUSD | USDC
  amount                 String
  xrpl_tx_hash           String   @unique
  destination_tag        Int?
  donated_at             DateTime

  status                 DonationStatus @default(DETECTED)
  foundation_approved_at DateTime?
  approved_by_user_id    String?

  valuation_snapshot     ValuationSnapshot?
  evidence_package       EvidencePackage?
  created_at             DateTime @default(now())
  updated_at             DateTime @updatedAt
}

model ValuationSnapshot {
  id                  String   @id @default(cuid())
  donation_id          String   @unique
  donation             Donation @relation(fields: [donation_id], references: [id])
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
  donation               Donation @relation(fields: [donation_id], references: [id])

  donation_tx_hash       String
  valuation_snapshot_id  String
  foundation_approval_id String?

  evidence_hash          String   @unique
  proof_token_id         String?
  proof_mint_tx_hash     String?

  hometax_export_status  HometaxExportStatus @default(NOT_READY)
  tax_review_status      TaxReviewStatus @default(NOT_REVIEWED)

  proof_token            ProofToken?
  hometax_export         HometaxExport?
  created_at             DateTime @default(now())
  updated_at             DateTime @updatedAt
}

model ProofToken {
  id                String   @id @default(cuid())
  receipt_id        String   @unique
  evidence_package_id String @unique
  evidence_package EvidencePackage @relation(fields: [evidence_package_id], references: [id])
  nft_token_id      String?
  mint_tx_hash      String?
  metadata_uri      String
  issued_by         String   // foundation wallet or authorized minter
  issued_at         DateTime @default(now())
}

model HometaxExport {
  id                String   @id @default(cuid())
  receipt_id        String   @unique
  evidence_package_id String @unique
  evidence_package EvidencePackage @relation(fields: [evidence_package_id], references: [id])
  export_format     String   // CSV | XLSX | PDF
  export_url        String?
  status            HometaxExportStatus
  created_at        DateTime @default(now())
}

model Company {
  id                  String   @id @default(cuid())
  name                String
  business_number_hash String
  subscription_plan   SubscriptionPlan @default(FREE_PILOT)
  subscription_status SubscriptionStatus @default(ACTIVE)
  created_at          DateTime @default(now())

  admins              CompanyAdmin[]
}

model CompanyAdmin {
  id              String   @id @default(cuid())
  user_id          String   @unique
  user            User     @relation(fields: [user_id], references: [id])
  company_id       String
  company          Company  @relation(fields: [company_id], references: [id])
  role            String
}

model TaxPartner {
  id              String   @id @default(cuid())
  user_id          String   @unique
  user            User     @relation(fields: [user_id], references: [id])
  firm_name        String
  role            String
  created_at      DateTime @default(now())
}

enum UserType {
  DONOR
  FOUNDATION_ADMIN
  COMPANY_ADMIN
  TAX_PARTNER
  INTERNAL_ADMIN
}

enum KYCStatus {
  NOT_STARTED
  IN_PROGRESS
  VERIFIED
  REJECTED
}

enum DonationStatus {
  DETECTED
  PENDING
  APPROVED
  REJECTED
  NEEDS_REVIEW
  EXPORTED
  OFFICIAL_RECEIPT_ISSUED
}

enum HometaxExportStatus {
  NOT_READY
  READY
  EXPORTED
  ISSUED
  REJECTED
}

enum TaxReviewStatus {
  NOT_REVIEWED
  IN_REVIEW
  REVIEWED
}

enum SubscriptionPlan {
  FREE_PILOT
  STARTER
  BUSINESS
  ENTERPRISE
}

enum SubscriptionStatus {
  ACTIVE
  PAUSED
  CANCELED
}
```

---

## 13. 기술 스택, 구현 명세

### 13-1. 의존성

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
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts"
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
    "tailwindcss": "^3.4.0",
    "lucide-react": "^0.383.0",
    "recharts": "^2.12.0",
    "zod": "^3.23.0",
    "date-fns": "^3.6.0",
    "puppeteer": "^22.0.0",
    "next-auth": "^4.24.0",
    "@trpc/server": "^11.0.0",
    "@trpc/client": "^11.0.0",
    "@trpc/react-query": "^11.0.0",
    "@tanstack/react-query": "^5.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "14.2.0",
    "tsx": "^4.0.0"
  }
}
```

---

### 13-2. 폴더 구조

```text
truve/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (donor)/
│   │   │   ├── page.tsx
│   │   │   ├── donate/[foundationId]/page.tsx
│   │   │   └── receipts/page.tsx
│   │   ├── (foundation)/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── donations/page.tsx
│   │   │   ├── evidence/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── (tax)/
│   │   │   └── console/page.tsx
│   │   ├── (company)/
│   │   │   └── dashboard/page.tsx
│   │   ├── verify/[receiptId]/page.tsx
│   │   ├── api/
│   │   │   ├── foundation/...
│   │   │   ├── donation/...
│   │   │   ├── tx/...
│   │   │   ├── valuation/...
│   │   │   ├── evidence/...
│   │   │   ├── proof/...
│   │   │   ├── hometax/...
│   │   │   └── verify/...
│   │   └── layout.tsx
│   ├── components/
│   ├── lib/
│   │   ├── xrpl/
│   │   │   ├── client.ts
│   │   │   ├── payment.ts
│   │   │   ├── trustline.ts
│   │   │   ├── memo-encoder.ts
│   │   │   ├── nft-mint.ts
│   │   │   └── tx-watcher.ts
│   │   ├── evidence/
│   │   │   ├── package-builder.ts
│   │   │   ├── hash.ts
│   │   │   └── verifier.ts
│   │   ├── valuation/
│   │   │   └── snapshot.ts
│   │   ├── hometax/
│   │   │   ├── export-builder.ts
│   │   │   └── report-generator.ts
│   │   ├── foundation/
│   │   │   └── approval.ts
│   │   ├── xaman/
│   │   │   └── payload-builder.ts
│   │   └── db.ts
│   ├── server/
│   │   └── routers/
│   └── styles/
├── public/
├── .env.example
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

### 13-3. 환경 변수

```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/truve"

# XRPL
XRPL_NETWORK="testnet"
XRPL_NODE_URL="wss://s.altnet.rippletest.net:51233"
XRPL_PROOF_MINTER_SEED="sXXX..."
XRPL_PROOF_MINTER_ADDRESS="rXXX..."

# Xaman
XUMM_API_KEY="xxx"
XUMM_API_SECRET="xxx"

# Stablecoin issuers
RLUSD_ISSUER="r..."
USDC_XRPL_ISSUER="r..."

# Auth
NEXTAUTH_SECRET="xxx"
NEXTAUTH_URL="http://localhost:3000"

# Truve
TRUVE_BASE_URL="https://truve.io"
TRUVE_PROOF_BASE_URL="https://truve.io/proofs"
TRUVE_VERIFY_BASE_URL="https://truve.io/verify"

# Price source
PRICE_SOURCE_API_KEY="xxx"

# Internal
INTERNAL_ADMIN_EMAIL="admin@truve.io"
```

---

## 14. 5주 MVP 실행 계획

### 14-1. MVP 목표

> 5주 안에 “재단이 스테이블코인 기부를 받고, Truve가 Evidence Package를 만들고, XRPL Proof Token으로 검증하는 흐름”을 완성한다.

---

### 14-2. MVP 포함 / 제외 매트릭스

#### MVP 포함

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

#### Phase 2 제외

| 기능 | 제외 이유 |
|---|---|
| Cause Bundle | MVP 집중도 유지 |
| ESG Badge Token | 핵심 증빙 인프라 이후 확장 |
| DEX 자동 환전 | 법률·운영 검토 필요 |
| Escrow 조건부 기부 | 구현 및 정책 복잡도 |
| Multi-signing 재단 거버넌스 | 재단 온보딩 이후 고도화 |
| 세무법인 콘솔 고도화 | MVP에서는 검토 링크 중심 |

---

### 14-3. 주차별 계획

| 주차 | 목표 | Definition of Done |
|---|---|---|
| 1주차 | 기반 구축 | Next.js, Prisma, XRPL Testnet, 재단/캠페인 모델, 테스트 지갑 |
| 2주차 | 스테이블코인 결제 라인 | TrustLine 설정, Payment Payload, DestinationTag, Memo, 거래 감지 |
| 3주차 | Evidence Engine | 거래 검증, 평가액 산정, 재단 승인, Evidence Package 생성 |
| 4주차 | Proof & Verification | XLS-20 Proof Token 발행, 검증 페이지, 홈택스 Export |
| 5주차 | 통합 데모 | 재단 대시보드, E2E 시연, 리스크 대응 문서, 피치 준비 |

---

## 15. Final Pitch Day 시연 시나리오

### 15-1. 5분 데모 구조

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

### 15-2. 마무리 멘트

> Truve는 기부 플랫폼이 아닙니다.  
> Truve는 재단이 스테이블코인 기부를 받을 수 있게 하는 증빙 인프라입니다.  
> 결제는 스테이블코인으로, 증빙은 Evidence Package로, 검증은 XRPL로 처리합니다.

---

## 16. 사업화 가능성

### 16-1. 초기 시장

초기 시장은 “모든 재단”이 아니라 다음 조건을 가진 상위 재단입니다.

- ESG/CSR 후원 니즈가 있는 재단
- 글로벌 후원자 또는 해외 커뮤니티와 연결된 재단
- 블록체인·핀테크 기업 후원을 받을 가능성이 있는 재단
- 디지털 기부 채널을 확장하려는 재단
- 세무·감사 대응 체계가 필요한 중대형 비영리단체

### 16-2. 수익 모델

#### 재단 인프라 구독료

| 플랜 | 월 과금 | 대상 | 포함 기능 |
|---|---:|---|---|
| Pilot | 무료 | 초기 파트너 재단 | 핵심 기능 테스트 |
| Starter | 30만 원 | 월 기부 건수 적은 재단 | 수령/증빙 기본 기능 |
| Business | 70만 원 | 정기 캠페인 운영 재단 | 홈택스 Export, 리포트 포함 |
| Enterprise | 협의 | 대형 재단/기업 연계 재단 | 커스텀 검증, 파트너 연계 |

#### 세무법인 검증 콘솔

| 모델 | 내용 |
|---|---|
| Per-seat | 세무 담당자 계정당 월 과금 |
| Per-case | 검토 건당 과금 |
| Partner | 세무법인 B2B2B 리퍼럴 |

#### 기업 ESG 리포트

| 모델 | 내용 |
|---|---|
| ESG 리포트 구독 | 기업별 월 구독 |
| Proof Link 패키지 | 감사/IR용 검증 링크 |
| ESG Badge, Phase 2 | 기업 기부 활동 증빙 토큰 |

---

## 17. 리스크 및 대응

| 리스크 | 질문 | 대응 |
|---|---|---|
| NFT가 공식 영수증인가 | NFT로 세액공제를 받을 수 있나 | 아니오. 공식 영수증은 홈택스 흐름이며, Proof Token은 증빙 검증 레이어입니다. |
| VASP 리스크 | Truve가 가상자산 이전/중개업인가 | Truve는 수탁·운용을 하지 않고, 재단 직접 수령 거래의 증빙을 표준화하는 SaaS로 설계합니다. 필요 시 제휴 VASP/결제 파트너와 역할을 분리합니다. |
| 개인정보 | 개인정보가 온체인에 남나 | 개인정보와 KYC 정보는 온체인에 기록하지 않습니다. 온체인에는 evidence_hash만 기록합니다. |
| 시장 작음 | 가상자산 기부 재단이 적다 | 시장이 작은 것이 아니라 인프라가 없어 열리지 않았습니다. 초기 타겟은 ESG·글로벌 후원 니즈가 있는 상위 재단입니다. |
| 스테이블코인 규제 | RLUSD/USDC 기부가 가능한가 | MVP는 테스트넷/파일럿 중심으로 검증하고, 실제 운영은 법률 자문과 제휴 파트너 구조로 단계적 도입합니다. |
| 평가액 분쟁 | 기준가가 다르면 어떻게 하나 | 평가 기준 시점과 출처를 사전에 고지하고 snapshot으로 저장합니다. 최종 세무 판단은 전문가 검토로 확정합니다. |
| 재단 도입 저항 | 재단이 왜 돈을 내나 | 개발 없이 스테이블코인 기부 창구와 세무·감사 증빙 패키지를 확보하기 때문입니다. |
| Proof Token 오해 | 투자용 NFT인가 | Proof Token은 투자용 NFT가 아니라 Evidence Package의 검증 포인터입니다. |
| 결제 라인 혼동 | Truve가 결제 사업자인가 | Truve는 수령·증빙 워크플로우를 제공하고, 운영 단계에서 결제/환전은 제휴 파트너 또는 재단 직접 수령 구조로 분리합니다. |

---

## 18. 심사위원 예상 Q&A

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

### Q8. 가상자산 기부 시장이 너무 작은 것 아닌가요?

현재 시장이 작은 것이 아니라, 재단이 받을 수 있는 인프라가 없어서 시장이 열리지 않은 것입니다. Truve의 초기 목표는 전체 재단이 아니라 ESG·글로벌 후원·디지털 기부 니즈가 있는 상위 재단을 온보딩하는 것입니다.

---

## 19. 개발 에이전트 작업 지시

### 19-1. 첫 작업, Day 1~2

```bash
npx create-next-app@latest truve --typescript --tailwind --app --src-dir
cd truve

npm install xrpl xumm-sdk @prisma/client prisma lucide-react recharts zod date-fns puppeteer next-auth @trpc/server @trpc/client @trpc/react-query @tanstack/react-query

npx prisma init

mkdir -p src/lib/{xrpl,evidence,valuation,hometax,foundation,xaman}
mkdir -p src/app/{api,verify,\(donor\),\(foundation\),\(tax\),\(company\)}
```

---

### 19-2. Critical Path 구현 순서

1. `src/lib/xrpl/client.ts` — XRPL Testnet client 초기화
2. `src/lib/xrpl/trustline.ts` — RLUSD/USDC TrustLine 설정
3. `src/lib/xrpl/payment.ts` — 스테이블코인 Payment 트랜잭션 빌더
4. `src/lib/xrpl/memo-encoder.ts` — Memo 인코딩/디코딩
5. `src/lib/xrpl/tx-watcher.ts` — 재단 지갑 입금 감지
6. `src/lib/valuation/snapshot.ts` — 기부 시점 평가액 snapshot
7. `src/lib/foundation/approval.ts` — 재단 승인 상태 관리
8. `src/lib/evidence/package-builder.ts` — Evidence Package 생성
9. `src/lib/evidence/hash.ts` — evidence_hash 생성
10. `src/lib/xrpl/nft-mint.ts` — Proof Token 발행
11. `src/app/verify/[receiptId]/page.tsx` — 검증 페이지
12. `src/app/(foundation)/dashboard/page.tsx` — 재단 대시보드
13. `src/lib/hometax/export-builder.ts` — 홈택스 입력용 Export

---

### 19-3. 테스트 데이터 시드

```typescript
const foundations = [
  {
    name: "환경재단_테스트",
    category_tags: ["환경"],
    xrpl_wallet: "rTestFoundation1...",
    accepted_assets: ["RLUSD", "USDC"]
  },
  {
    name: "아동복지재단_테스트",
    category_tags: ["아동"],
    xrpl_wallet: "rTestFoundation2...",
    accepted_assets: ["RLUSD", "USDC"]
  }
];

const campaigns = [
  {
    foundation_name: "환경재단_테스트",
    name: "해양 플라스틱 저감 캠페인",
    purpose: "해양 환경 보호",
    destination_tag: 20260001
  },
  {
    foundation_name: "아동복지재단_테스트",
    name: "디지털 교육 지원 캠페인",
    purpose: "취약계층 아동 교육",
    destination_tag: 20260002
  }
];
```

---

### 19-4. 작업 완료 정의

각 모듈은 다음 조건을 만족해야 완료로 간주합니다.

- TypeScript 타입 정의
- Zod 스키마 기반 입력 검증
- XRPL 트랜잭션 Explorer 링크 반환
- 개인정보 온체인 기록 금지
- evidence_hash 생성 로직 포함
- 실패 상태 및 재시도 처리
- 재단 승인 상태 변경 기록
- 데모용 Testnet E2E 플로우 통과

---

## 20. 내부 관리용 체크리스트

### 20-1. 문서에서 제거해야 할 표현

- NFT 영수증이 공식 기부금영수증처럼 보이는 표현
- “회피”라는 단어
- ETF 묶음이라는 이름
- 절세 시뮬레이터가 세무 자문처럼 보이는 표현
- Truve가 자금을 보관/운용/중개하는 표현
- KYC 해시를 온체인에 영구 기록한다는 표현

---

### 20-2. 문서에서 반복해야 할 표현

- 공식 영수증은 홈택스 흐름에 맞춰 재단이 발급
- Truve는 Evidence Package를 표준화
- XRPL Proof Token은 증빙 검증 레이어
- 결제는 스테이블코인 중심
- 재단이 직접 수령하고 Truve는 증빙을 처리
- 개인정보는 온체인에 기록하지 않음
- 시장이 작은 것이 아니라 인프라가 없어 열리지 않았음

---

### 20-3. MVP에서 반드시 보여줘야 할 것

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

## 21. 최종 결론

Truve는 한국 가상자산 기부 시장의 병목을 “기부자 수요 부족”이 아니라 **재단의 수령·증빙·세무·감사 인프라 부재**로 정의합니다.

Truve는 기부금을 모으는 플랫폼이 아닙니다. 재단이 스테이블코인 기부를 직접 수령하고, 그 기부가 언제, 어떤 자산으로, 얼마의 가치로, 어떤 재단에 수령되었는지를 Evidence Package로 표준화합니다.

XRPL은 이 Evidence Package의 위변조 여부를 검증하는 공용 감사 원장입니다. XLS-20 기반 Proof Token은 공식 세무 영수증이 아니라, 특정 기부 거래와 증빙 패키지를 연결하는 검증용 포인터입니다.

Truve의 목표는 한국에서 가상자산 기부를 받을 수 있는 재단을 늘리는 것입니다. 재단이 개발자 없이 스테이블코인 기부를 받을 수 있게 하고, 세무법인과 감사인이 검증 가능한 증빙을 제공함으로써, 가상자산 기부 시장이 실제로 작동하도록 만드는 것이 Truve의 핵심입니다.

---

## 부록 A. v6 문서 작성 원칙

1. “기부 플랫폼”이라는 표현은 최소화한다.
2. “NFT 영수증”보다 “Proof Token”을 우선 사용한다.
3. “공식 영수증 대체”처럼 보이는 문장은 사용하지 않는다.
4. 결제 라인은 RLUSD/USDC 등 스테이블코인 중심으로 설명한다.
5. Truve는 자금 수탁자가 아니라 Evidence Infrastructure Provider로 표현한다.
6. 개인정보와 KYC 정보는 온체인에 기록하지 않는다고 명확히 쓴다.
7. ETF, 절세 시뮬레이터, ESG Badge는 Phase 2 또는 보조 기능으로 둔다.
8. MVP는 재단 온보딩, 스테이블코인 수령, Evidence Package, Proof Token, Verification Page에 집중한다.

---

**문서 버전**: v6 FULL  
**핵심 방향**: Donation Platform → Stablecoin Donation Evidence Infrastructure  
**결제 라인**: RLUSD / USDC on XRPL 중심  
**검증 레이어**: XRPL Proof Token + Evidence Package  
**공식 영수증**: 홈택스 전자기부금영수증 흐름 보조
