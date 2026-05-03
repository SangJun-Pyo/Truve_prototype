import { createRepositories } from "../api/provider";
import { API_BASE } from "../services/apiBase";
import { fetchDbDonations, patchDbDonation } from "../services/db";
import { mergeDonationRecords, upsertLocalDonation, type LocalDonationRecord } from "../services/donations";
import { requestProofNftMintScaffold } from "../services/proofNft";
import { getWalletSession } from "../services/wallet";
import { renderTopNav } from "../shared/nav";

const navRoot = document.getElementById("top-nav");
if (navRoot) {
  navRoot.innerHTML = renderTopNav("status");
}

const summaryEl = document.getElementById("status-summary");
const timelineEl = document.getElementById("status-timeline");
const tableEl = document.getElementById("status-table");
const receiptStatusEl = document.getElementById("receipt-request-status");

const taxDonorTypeEl = document.getElementById("status-tax-donor-type") as HTMLSelectElement | null;
const taxIncomeRangeEl = document.getElementById("status-tax-income-range") as HTMLSelectElement | null;
const taxProfitRangeEl = document.getElementById("status-tax-profit-range") as HTMLSelectElement | null;
const taxDonationTypeEl = document.getElementById("status-tax-donation-type") as HTMLSelectElement | null;
const taxIncomeFieldEl = document.getElementById("status-tax-income-field");
const taxProfitFieldEl = document.getElementById("status-tax-profit-field");
const taxDonationTypeFieldEl = document.getElementById("status-tax-donation-type-field");
const taxSourceBadgeEl = document.getElementById("status-tax-source-badge");
const taxDonationAmountEl = document.getElementById("status-tax-donation-amount");
const taxDeductionRangeEl = document.getElementById("status-tax-deduction-range");
const taxRealCostEl = document.getElementById("status-tax-real-cost");
const taxExplanationEl = document.getElementById("status-tax-explanation");
const taxLawEl = document.getElementById("status-tax-law");
const taxCalcBtnEl = document.getElementById("status-tax-calc-btn") as HTMLButtonElement | null;
const taxPartnerBtnEl = document.getElementById("status-tax-partner-btn") as HTMLButtonElement | null;

const USER_ID = "usr_demo_001";
let totalDonatedForTax = 0;
let currentDonations: LocalDonationRecord[] = [];
let eventsBound = false;

interface TaxSimulationResult {
  estimated_deduction_min: number;
  estimated_deduction_max: number;
  explanation: string;
  applicable_law: string;
  disclaimer: string;
  source?: "anthropic" | "fallback";
}

function formatKrw(value: number): string {
  return `${new Intl.NumberFormat("ko-KR").format(value)}원`;
}

function formatKrwPlain(value: number): string {
  return `${Math.max(0, Math.round(value)).toLocaleString("ko-KR")} KRW`;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function stepToKorean(step: string): string {
  const map: Record<string, string> = {
    paid: "결제 완료",
    pending: "결제 대기",
    failed: "결제 실패",
    recorded: "증빙 기록 완료",
    minted: "Proof NFT 발행 완료",
    scheduled: "정산 예정",
    done: "정산 완료",
    error: "오류",
  };
  return map[step] ?? step;
}

function renderTaxFormState(): void {
  const isCorporate = taxDonorTypeEl?.value === "법인";
  taxIncomeFieldEl?.classList.toggle("hidden", isCorporate);
  taxProfitFieldEl?.classList.toggle("hidden", !isCorporate);
  taxDonationTypeFieldEl?.classList.toggle("hidden", !isCorporate);
}

function resetTaxResult(): void {
  if (taxSourceBadgeEl) {
    taxSourceBadgeEl.textContent = totalDonatedForTax > 0 ? "READY" : "NO DATA";
    taxSourceBadgeEl.className = totalDonatedForTax > 0 ? "status-badge success" : "status-badge error";
  }
  if (taxDonationAmountEl) taxDonationAmountEl.textContent = formatKrw(totalDonatedForTax);
  if (taxDeductionRangeEl) taxDeductionRangeEl.textContent = totalDonatedForTax > 0 ? "계산 대기" : "기부 이력 없음";
  if (taxRealCostEl) taxRealCostEl.textContent = "-";
  if (taxExplanationEl) {
    taxExplanationEl.textContent =
      totalDonatedForTax > 0
        ? "기부 이력과 기부자 유형을 기준으로 참고 추정치를 확인하세요."
        : "계산할 기부 이력이 아직 없습니다. 기부 완료 후 다시 확인하세요.";
  }
  if (taxLawEl) taxLawEl.textContent = "관련 법령: -";
  if (taxCalcBtnEl) taxCalcBtnEl.disabled = totalDonatedForTax <= 0;
}

function getTaxSimulationInput() {
  const donorType = taxDonorTypeEl?.value === "법인" ? "법인" : "개인";
  return {
    donor_type: donorType,
    annual_income_range: donorType === "개인" ? (taxIncomeRangeEl?.value ?? "5천만원_이하") : undefined,
    annual_profit_range: donorType === "법인" ? (taxProfitRangeEl?.value ?? "2억_이하") : undefined,
    donation_type: donorType === "법인" ? (taxDonationTypeEl?.value ?? "지정기부금") : undefined,
    donation_amount: totalDonatedForTax,
  };
}

function renderTaxResult(result: TaxSimulationResult): void {
  const min = Math.max(0, Math.round(result.estimated_deduction_min));
  const max = Math.max(min, Math.round(result.estimated_deduction_max));
  if (taxSourceBadgeEl) {
    taxSourceBadgeEl.textContent = result.source === "anthropic" ? "AI" : "ESTIMATE";
    taxSourceBadgeEl.className = "status-badge success";
  }
  if (taxDonationAmountEl) taxDonationAmountEl.textContent = formatKrw(totalDonatedForTax);
  if (taxDeductionRangeEl) taxDeductionRangeEl.textContent = `${formatKrwPlain(min)} ~ ${formatKrwPlain(max)}`;
  if (taxRealCostEl) taxRealCostEl.textContent = `${formatKrwPlain(totalDonatedForTax - max)} ~ ${formatKrwPlain(totalDonatedForTax - min)}`;
  if (taxExplanationEl) taxExplanationEl.textContent = result.explanation;
  if (taxLawEl) taxLawEl.textContent = `관련 법령: ${result.applicable_law}`;
}

async function calculateTaxSimulation(): Promise<void> {
  if (!taxCalcBtnEl || totalDonatedForTax <= 0) return;

  try {
    taxCalcBtnEl.disabled = true;
    taxCalcBtnEl.textContent = "계산 중";
    if (taxSourceBadgeEl) {
      taxSourceBadgeEl.textContent = "RUNNING";
      taxSourceBadgeEl.className = "status-badge success";
    }

    const response = await fetch(`${API_BASE}/api/tax-sim/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(getTaxSimulationInput()),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`절세 시뮬레이션 오류: ${response.status} ${text}`);
    }

    renderTaxResult((await response.json()) as TaxSimulationResult);
  } catch (error) {
    if (taxSourceBadgeEl) {
      taxSourceBadgeEl.textContent = "ERROR";
      taxSourceBadgeEl.className = "status-badge error";
    }
    if (taxExplanationEl) {
      taxExplanationEl.textContent = error instanceof Error ? error.message : "절세 시뮬레이션에 실패했습니다.";
    }
  } finally {
    taxCalcBtnEl.disabled = totalDonatedForTax <= 0;
    taxCalcBtnEl.textContent = "내 기부 기준 계산";
  }
}

function bindTaxEvents(): void {
  if (eventsBound) return;
  eventsBound = true;

  taxDonorTypeEl?.addEventListener("change", () => {
    renderTaxFormState();
    resetTaxResult();
  });
  taxIncomeRangeEl?.addEventListener("change", resetTaxResult);
  taxProfitRangeEl?.addEventListener("change", resetTaxResult);
  taxDonationTypeEl?.addEventListener("change", resetTaxResult);
  taxCalcBtnEl?.addEventListener("click", () => void calculateTaxSimulation());
  taxPartnerBtnEl?.addEventListener("click", () => {
    window.alert("세무 파트너 상담 연결은 Phase 2 리퍼럴 모델로 준비 중입니다.");
  });
}

function setReceiptStatus(message: string, isError = false): void {
  if (!receiptStatusEl) return;
  receiptStatusEl.textContent = message;
  receiptStatusEl.className = isError ? "notice error" : "notice";
}

async function requestReceiptForDonation(donationId: string): Promise<void> {
  const wallet = getWalletSession();
  const donation = currentDonations.find((item) => item.id === donationId || item.dbId === donationId);

  if (!wallet) {
    setReceiptStatus("먼저 Xaman 지갑을 연결해 주세요.", true);
    return;
  }
  if (!donation?.txHash) {
    setReceiptStatus("트랜잭션 해시가 있는 기부 이력만 영수증/NFT 요청이 가능합니다.", true);
    return;
  }

  try {
    setReceiptStatus("영수증/NFT 요청 서명 대기 중...");
    const result = await requestProofNftMintScaffold({
      account: wallet.account,
      donationId: donation.id,
      donationTxHash: donation.txHash,
    });

    if (!result.txHash) {
      setReceiptStatus("영수증/NFT 요청이 취소되었습니다.", true);
      return;
    }

    const next: LocalDonationRecord = {
      ...donation,
      proofMintStatus: result.validated ? "recorded" : "requested",
      proofMintTxHash: result.txHash,
      nftStatus: result.validated ? "minted" : "pending",
      proofStatus: "recorded",
      proofNftId: result.validated ? `proof_req_${Date.now()}` : donation.proofNftId,
    };

    upsertLocalDonation(next);
    if (next.dbId) {
      void patchDbDonation(next.dbId, {
        nftStatus: next.nftStatus,
        proofStatus: "recorded",
        proofNftId: next.proofNftId ?? null,
      });
    }

    setReceiptStatus(`영수증/NFT 요청 완료: ${result.txHash}`);
    await init();
  } catch (error) {
    setReceiptStatus(error instanceof Error ? error.message : "영수증/NFT 요청 실패", true);
  }
}

async function init(): Promise<void> {
  bindTaxEvents();

  const repositories = await createRepositories();
  const profile = await repositories.userRepository.getProfile(USER_ID);
  const baseStatus = await repositories.userRepository.getDonationStatus(USER_ID);
  const baseDonations = await repositories.donationRepository.listDonationsByUser(USER_ID);

  const wallet = getWalletSession();
  let dbDonations: LocalDonationRecord[] = [];

  if (wallet) {
    const fetched = await fetchDbDonations(wallet.account);
    dbDonations = fetched.map((d) => ({
      id: d.id,
      userId: d.userId,
      donatedAt: d.donatedAt,
      amountKrw: d.amountKrw,
      allocations: d.allocations as LocalDonationRecord["allocations"],
      paymentStatus: d.paymentStatus as LocalDonationRecord["paymentStatus"],
      proofStatus: d.proofStatus as LocalDonationRecord["proofStatus"],
      nftStatus: d.nftStatus as LocalDonationRecord["nftStatus"],
      settlementStatus: d.settlementStatus as LocalDonationRecord["settlementStatus"],
      txHash: d.txHash ?? undefined,
      proofNftId: d.proofNftId ?? undefined,
      explorerUrl: d.explorerUrl ?? undefined,
      validationStatus: d.validationStatus as LocalDonationRecord["validationStatus"],
      source: "local" as const,
      dbId: d.id,
    }));
  }

  const merged = mergeDonationRecords(baseDonations, USER_ID);
  const dbIds = new Set(dbDonations.map((d) => d.id));
  const donations = [...dbDonations, ...merged.filter((d) => !dbIds.has(d.dbId ?? "") && !dbIds.has(d.id))].sort((a, b) =>
    a.donatedAt < b.donatedAt ? 1 : -1,
  );
  currentDonations = donations;

  if (!profile || !baseStatus) {
    if (summaryEl) {
      summaryEl.innerHTML = `<div class="notice error">사용자 상태를 불러오지 못했습니다.</div>`;
    }
    resetTaxResult();
    return;
  }

  const totalDonated = donations.reduce((sum, item) => sum + item.amountKrw, 0);
  totalDonatedForTax = totalDonated;
  renderTaxFormState();
  resetTaxResult();

  if (summaryEl) {
    summaryEl.innerHTML = `
      <div class="summary-box">
        <div class="summary-label">사용자</div>
        <div class="summary-value">${profile.displayName}</div>
      </div>
      <div class="summary-box">
        <div class="summary-label">누적 기부금</div>
        <div class="summary-value">${formatKrw(totalDonated)}</div>
      </div>
      <div class="summary-box">
        <div class="summary-label">티어</div>
        <div class="summary-value">${profile.tier.toUpperCase()}</div>
      </div>
    `;
  }

  if (timelineEl) {
    timelineEl.innerHTML = donations
      .slice(0, 3)
      .map(
        (donation) => `
          <article class="timeline-item">
            <div class="row-between">
              <strong>${formatKrw(donation.amountKrw)}</strong>
              <span class="badge">${formatDate(donation.donatedAt)}</span>
            </div>
            <div class="trust mt-12">1) ${stepToKorean(donation.paymentStatus)}</div>
            <div class="trust">2) ${stepToKorean(donation.proofStatus)}</div>
            <div class="trust">3) ${stepToKorean(donation.nftStatus)}</div>
            <div class="trust">4) ${stepToKorean(donation.settlementStatus)} · 검증 ${donation.validationStatus ?? "-"}</div>
          </article>
        `,
      )
      .join("");
  }

  if (tableEl) {
    const rows = donations
      .map((donation) => {
        const txLink = donation.txHash
          ? `<a class="text-link" href="https://testnet.xrpl.org/transactions/${donation.txHash}" target="_blank" rel="noreferrer">${donation.txHash}</a>`
          : "-";

        const proofStatus =
          donation.proofMintStatus === "recorded"
            ? "요청 기록 완료"
            : donation.proofMintStatus === "requested"
              ? "요청됨"
              : donation.nftStatus === "minted"
                ? "발행 완료"
                : "대기";

        return `
          <tr>
            <td>${formatDate(donation.donatedAt)}</td>
            <td>${formatKrw(donation.amountKrw)}</td>
            <td>${stepToKorean(donation.settlementStatus)} / ${donation.validationStatus ?? "-"}</td>
            <td>${proofStatus}</td>
            <td>${txLink}</td>
            <td>
              <button class="btn btn-secondary receipt-request-btn" type="button" data-receipt-id="${donation.id}" ${donation.txHash ? "" : "disabled"}>
                ${proofStatus === "대기" ? "요청" : "다시 요청"}
              </button>
            </td>
          </tr>
        `;
      })
      .join("");

    tableEl.innerHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>일시</th>
            <th>금액</th>
            <th>정산/검증</th>
            <th>Proof 상태</th>
            <th>트랜잭션</th>
            <th>영수증/NFT</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    tableEl.querySelectorAll<HTMLButtonElement>(".receipt-request-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.dataset.receiptId;
        if (!id) return;
        void requestReceiptForDonation(id);
      });
    });
  }
}

void init();
