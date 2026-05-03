import { createRepositories } from "../api/provider";
import { API_BASE } from "../services/apiBase";
import { fetchDbDonations, patchDbDonation, upsertDbUser } from "../services/db";
import { mergeDonationRecords, upsertLocalDonation, type LocalDonationRecord } from "../services/donations";
import { requestProofNftMintScaffold } from "../services/proofNft";
import { clearWalletSession, getWalletSession, setWalletSession } from "../services/wallet";
import { createSignInPayload, waitForPayloadResolution } from "../services/xaman";
import { renderTopNav } from "../shared/nav";

const USER_ID = "usr_demo_001";

const navRoot = document.getElementById("top-nav");
if (navRoot) navRoot.innerHTML = renderTopNav("status");

const summaryEl = document.getElementById("status-summary");
const timelineEl = document.getElementById("status-timeline");
const tableEl = document.getElementById("status-table");
const receiptStatusEl = document.getElementById("receipt-request-status");
const walletBadgeEl = document.getElementById("status-wallet-badge");
const walletAddressEl = document.getElementById("status-wallet-address");
const walletSyncEl = document.getElementById("status-wallet-sync");
const connectBtnEl = document.getElementById("status-xaman-connect-btn") as HTMLButtonElement | null;
const disconnectBtnEl = document.getElementById("status-xaman-disconnect-btn") as HTMLButtonElement | null;
const refreshBtnEl = document.getElementById("status-refresh-btn") as HTMLButtonElement | null;
const qrWrapEl = document.getElementById("status-xaman-qr-wrap");

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
const taxScenarioSliderEl = document.getElementById("tax-scenario-slider") as HTMLInputElement | null;
const taxScenarioLabelEl = document.getElementById("tax-scenario-label");
const taxScenarioChartEl = document.getElementById("tax-scenario-chart");

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
  return `${Math.max(0, Math.round(value)).toLocaleString("ko-KR")}원`;
}

function formatKrwPlain(value: number): string {
  return `${Math.max(0, Math.round(value)).toLocaleString("ko-KR")} KRW`;
}

function formatCompactKrw(value: number): string {
  if (value >= 100_000_000) return `${(value / 100_000_000).toFixed(1)}억`;
  if (value >= 10_000) return `${Math.round(value / 10_000).toLocaleString("ko-KR")}만`;
  return value.toLocaleString("ko-KR");
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
    pending: "대기",
    failed: "실패",
    recorded: "증빙 기록",
    minted: "Proof 기록 완료",
    scheduled: "정산 예정",
    done: "정산 완료",
    error: "오류",
  };
  return map[step] ?? step;
}

function setReceiptStatus(message: string, isError = false): void {
  if (!receiptStatusEl) return;
  receiptStatusEl.textContent = message;
  receiptStatusEl.className = isError ? "notice error" : "notice";
}

function renderQrcode(qrPngUrl: string, openUrl: string): void {
  if (!qrWrapEl) return;
  qrWrapEl.innerHTML = `
    <img src="${qrPngUrl}" alt="Xaman QR" />
    <a class="ghost-btn" href="${openUrl}" target="_blank" rel="noreferrer">Xaman에서 열기</a>
  `;
}

function clearQrcode(): void {
  if (qrWrapEl) qrWrapEl.innerHTML = "";
}

function renderWalletSyncState(dbCount = 0): void {
  const wallet = getWalletSession();
  if (walletBadgeEl) {
    walletBadgeEl.textContent = wallet ? "CONNECTED" : "NOT CONNECTED";
    walletBadgeEl.className = wallet ? "status-badge success" : "status-badge error";
  }
  if (walletAddressEl) {
    walletAddressEl.textContent = wallet ? `${wallet.account.slice(0, 6)}...${wallet.account.slice(-4)}` : "-";
  }
  if (walletSyncEl) {
    walletSyncEl.textContent = wallet ? `DB 기부 기록 ${dbCount}건 + 로컬/목업 기록` : "Xaman 연결 전: 로컬/목업 기록만 표시";
  }
}

async function connectWalletAndSync(): Promise<void> {
  try {
    setReceiptStatus("Xaman SignIn 요청을 생성하는 중입니다.");
    const payload = await createSignInPayload();
    renderQrcode(payload.qrPngUrl, payload.deepLink);
    const resolved = await waitForPayloadResolution(payload.uuid);
    if (!resolved.signed || !resolved.account) {
      setReceiptStatus("Xaman 연결이 취소되었습니다.", true);
      return;
    }
    setWalletSession({ account: resolved.account, connectedAt: new Date().toISOString(), lastPayloadUuid: payload.uuid });
    void upsertDbUser(resolved.account);
    clearQrcode();
    setReceiptStatus("Xaman 지갑이 연결되었습니다. 기부 기록을 동기화합니다.");
    await init();
  } catch (error) {
    setReceiptStatus(error instanceof Error ? error.message : "Xaman 연결에 실패했습니다.", true);
  }
}

function disconnectWalletAndSync(): void {
  clearWalletSession();
  clearQrcode();
  setReceiptStatus("Xaman 연결을 해제했습니다. 로컬/목업 기록만 표시합니다.");
  void init();
}

function renderTaxFormState(): void {
  const isCorporate = taxDonorTypeEl?.value === "법인";
  taxIncomeFieldEl?.classList.toggle("hidden", isCorporate);
  taxProfitFieldEl?.classList.toggle("hidden", !isCorporate);
  taxDonationTypeFieldEl?.classList.toggle("hidden", !isCorporate);
}

function getTaxRateRange(): [number, number] {
  const donorType = taxDonorTypeEl?.value === "법인" ? "법인" : "개인";
  if (donorType === "개인") {
    if (taxIncomeRangeEl?.value === "1.5억_이상") return [0.18, 0.28];
    if (taxIncomeRangeEl?.value === "5천만~1.5억") return [0.16, 0.24];
    return [0.13, 0.2];
  }
  if (taxDonationTypeEl?.value === "법정기부금") return [0.18, 0.28];
  if (taxDonationTypeEl?.value === "일반기부금") return [0.08, 0.16];
  return [0.12, 0.22];
}

function estimateTaxRange(amount: number): { min: number; max: number; realMin: number; realMax: number } {
  const [minRate, maxRate] = getTaxRateRange();
  const min = Math.round(amount * minRate);
  const max = Math.round(amount * maxRate);
  return { min, max, realMin: Math.max(0, amount - max), realMax: Math.max(0, amount - min) };
}

function syncTaxScenarioControl(): void {
  if (!taxScenarioSliderEl) return;
  const max = Math.max(1_000_000, Math.ceil(Math.max(totalDonatedForTax, 100_000) * 2 / 100_000) * 100_000);
  taxScenarioSliderEl.max = String(max);
  if (Number(taxScenarioSliderEl.value) <= 0 || Number(taxScenarioSliderEl.value) > max) {
    taxScenarioSliderEl.value = String(totalDonatedForTax || Math.min(100_000, max));
  }
}

function renderTaxScenarioChart(activeAmount: number): void {
  if (!taxScenarioChartEl) return;
  const maxAmount = Number(taxScenarioSliderEl?.max ?? 1_000_000);
  const amount = Math.max(0, Math.min(activeAmount, maxAmount));
  const active = estimateTaxRange(amount);
  const chartMax = Math.max(maxAmount, active.realMax, active.max) * 1.05;
  const width = 720;
  const height = 260;
  const left = 58;
  const right = 24;
  const top = 22;
  const bottom = 42;
  const plotW = width - left - right;
  const plotH = height - top - bottom;
  const x = (v: number) => left + (v / maxAmount) * plotW;
  const y = (v: number) => top + plotH - (v / chartMax) * plotH;
  const points = Array.from({ length: 18 }, (_, index) => (maxAmount * index) / 17);
  const pathFor = (selector: (v: number) => number) =>
    points.map((v, i) => `${i === 0 ? "M" : "L"} ${x(v)} ${y(selector(v))}`).join(" ");
  const activeX = x(amount);

  if (taxScenarioLabelEl) {
    taxScenarioLabelEl.textContent = `${formatKrwPlain(amount)} · 공제 ${formatKrwPlain(active.min)} ~ ${formatKrwPlain(active.max)}`;
  }

  taxScenarioChartEl.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
      <line x1="${left}" y1="${top}" x2="${left}" y2="${top + plotH}" stroke="#CBD5E1" />
      <line x1="${left}" y1="${top + plotH}" x2="${left + plotW}" y2="${top + plotH}" stroke="#CBD5E1" />
      <text class="tax-chart-label" x="${left}" y="${height - 12}">0</text>
      <text class="tax-chart-label" x="${left + plotW - 78}" y="${height - 12}">${formatCompactKrw(maxAmount)} KRW</text>
      <text class="tax-chart-label" x="10" y="${top + 6}">${formatCompactKrw(chartMax)}</text>
      <path d="${pathFor((v) => estimateTaxRange(v).max)}" fill="none" stroke="#FF5A00" stroke-width="3" />
      <path d="${pathFor((v) => estimateTaxRange(v).min)}" fill="none" stroke="#FDBA74" stroke-width="3" stroke-dasharray="6 6" />
      <path d="${pathFor((v) => estimateTaxRange(v).realMin)}" fill="none" stroke="#0F172A" stroke-width="3" />
      <line x1="${activeX}" y1="${top}" x2="${activeX}" y2="${top + plotH}" stroke="#64748B" stroke-dasharray="4 4" />
      <circle cx="${activeX}" cy="${y(active.max)}" r="5" fill="#FF5A00" />
      <circle cx="${activeX}" cy="${y(active.realMin)}" r="5" fill="#0F172A" />
      <rect x="${Math.min(activeX + 10, width - 230)}" y="${top + 10}" width="210" height="72" rx="10" fill="white" stroke="#E2E8F0" />
      <text class="tax-chart-value" x="${Math.min(activeX + 24, width - 216)}" y="${top + 34}">기부액 ${formatKrwPlain(amount)}</text>
      <text class="tax-chart-label" x="${Math.min(activeX + 24, width - 216)}" y="${top + 54}">예상 공제 ${formatKrwPlain(active.min)} ~ ${formatKrwPlain(active.max)}</text>
      <text class="tax-chart-label" x="${Math.min(activeX + 24, width - 216)}" y="${top + 72}">실질 비용 ${formatKrwPlain(active.realMin)} ~ ${formatKrwPlain(active.realMax)}</text>
    </svg>
  `;
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
      totalDonatedForTax > 0 ? "기부 이력과 기부자 유형을 기준으로 참고 추정치를 확인하세요." : "계산할 기부 이력이 아직 없습니다.";
  }
  if (taxLawEl) taxLawEl.textContent = "관련 법령: -";
  if (taxCalcBtnEl) taxCalcBtnEl.disabled = totalDonatedForTax <= 0;
  syncTaxScenarioControl();
  renderTaxScenarioChart(Number(taxScenarioSliderEl?.value ?? totalDonatedForTax));
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
    if (taxSourceBadgeEl) taxSourceBadgeEl.textContent = "RUNNING";
    const response = await fetch(`${API_BASE}/api/tax-sim/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(getTaxSimulationInput()),
    });
    if (!response.ok) throw new Error(await response.text());
    renderTaxResult((await response.json()) as TaxSimulationResult);
  } catch (error) {
    if (taxSourceBadgeEl) {
      taxSourceBadgeEl.textContent = "ERROR";
      taxSourceBadgeEl.className = "status-badge error";
    }
    if (taxExplanationEl) taxExplanationEl.textContent = error instanceof Error ? error.message : "절세 시뮬레이션에 실패했습니다.";
  } finally {
    taxCalcBtnEl.disabled = totalDonatedForTax <= 0;
    taxCalcBtnEl.textContent = "내 기부 기준 계산";
  }
}

function bindEvents(): void {
  if (eventsBound) return;
  eventsBound = true;
  taxDonorTypeEl?.addEventListener("change", () => {
    renderTaxFormState();
    resetTaxResult();
  });
  taxIncomeRangeEl?.addEventListener("change", resetTaxResult);
  taxProfitRangeEl?.addEventListener("change", resetTaxResult);
  taxDonationTypeEl?.addEventListener("change", resetTaxResult);
  taxScenarioSliderEl?.addEventListener("input", () => renderTaxScenarioChart(Number(taxScenarioSliderEl.value)));
  taxCalcBtnEl?.addEventListener("click", () => void calculateTaxSimulation());
  taxPartnerBtnEl?.addEventListener("click", () => {
    window.alert("세무 파트너 상담 연결은 Phase 2 리퍼럴 모델로 준비 중입니다.");
  });
  connectBtnEl?.addEventListener("click", () => void connectWalletAndSync());
  disconnectBtnEl?.addEventListener("click", disconnectWalletAndSync);
  refreshBtnEl?.addEventListener("click", () => void init());
}

async function requestReceiptForDonation(donationId: string): Promise<void> {
  const wallet = getWalletSession();
  const donation = currentDonations.find((item) => item.id === donationId || item.dbId === donationId);
  if (!wallet) {
    setReceiptStatus("먼저 Xaman 지갑을 연결해 주세요.", true);
    return;
  }
  if (!donation?.txHash) {
    setReceiptStatus("트랜잭션 해시가 있는 기부 이력만 Proof 요청을 진행할 수 있습니다.", true);
    return;
  }
  try {
    setReceiptStatus("Proof 요청 서명 대기 중...");
    const result = await requestProofNftMintScaffold({ account: wallet.account, donationId: donation.id, donationTxHash: donation.txHash });
    if (!result.txHash) {
      setReceiptStatus("Proof 요청이 취소되었습니다.", true);
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
      void patchDbDonation(next.dbId, { nftStatus: next.nftStatus, proofStatus: "recorded", proofNftId: next.proofNftId ?? null });
    }
    setReceiptStatus(`Proof 요청 완료: ${result.txHash}`);
    await init();
  } catch (error) {
    setReceiptStatus(error instanceof Error ? error.message : "Proof 요청 실패", true);
  }
}

function mapDbDonation(d: Awaited<ReturnType<typeof fetchDbDonations>>[number]): LocalDonationRecord {
  return {
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
    source: "local",
    dbId: d.id,
  };
}

function renderSummary(profileName: string, tier: string, walletDbCount: number): void {
  if (!summaryEl) return;
  const wallet = getWalletSession();
  const total = currentDonations.reduce((sum, item) => sum + item.amountKrw, 0);
  const onchainCount = currentDonations.filter((item) => Boolean(item.txHash)).length;
  const proofReadyCount = currentDonations.filter((item) => item.proofStatus === "recorded" || item.nftStatus === "minted").length;
  const assetTotals = currentDonations.reduce<Record<string, number>>((totals, item) => {
    const asset = item.asset ?? "KRW";
    totals[asset] = (totals[asset] ?? 0) + (item.amountAsset ?? item.amountKrw);
    return totals;
  }, {});
  const assetSummary = Object.entries(assetTotals)
    .slice(0, 3)
    .map(([asset, amount]) => `${asset} ${Math.round(amount * 100) / 100}`)
    .join(" · ");

  summaryEl.innerHTML = `
    <div class="summary-box">
      <div class="summary-label">연결 지갑</div>
      <div class="summary-value">${wallet ? `${wallet.account.slice(0, 6)}...${wallet.account.slice(-4)}` : "미연결"}</div>
      <div class="trust mt-12">${wallet ? `DB 동기화 ${walletDbCount}건` : "Xaman 연결 시 지갑 기준 기록 표시"}</div>
    </div>
    <div class="summary-box">
      <div class="summary-label">누적 기부금</div>
      <div class="summary-value">${formatKrwPlain(total)}</div>
      <div class="trust mt-12">${assetSummary || "기부 자산 데이터 없음"}</div>
    </div>
    <div class="summary-box">
      <div class="summary-label">온체인 기록</div>
      <div class="summary-value">${onchainCount}건</div>
      <div class="trust mt-12">Proof ready ${proofReadyCount}건</div>
    </div>
    <div class="summary-box">
      <div class="summary-label">등급</div>
      <div class="summary-value">${tier.toUpperCase()}</div>
      <div class="trust mt-12">${profileName}</div>
    </div>
  `;
}

function renderTimeline(): void {
  if (!timelineEl) return;
  timelineEl.innerHTML = currentDonations
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

function renderTable(): void {
  if (!tableEl) return;
  const rows = currentDonations
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
          <td>${donation.asset ? `${donation.amountAsset ?? "-"} ${donation.asset}<br /><span class="trust">${formatKrwPlain(donation.amountKrw)}</span>` : formatKrw(donation.amountKrw)}</td>
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
          <th>Proof 요청</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
  tableEl.querySelectorAll<HTMLButtonElement>(".receipt-request-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.receiptId;
      if (id) void requestReceiptForDonation(id);
    });
  });
}

async function init(): Promise<void> {
  bindEvents();
  const repositories = await createRepositories();
  const profile = await repositories.userRepository.getProfile(USER_ID);
  const baseDonations = await repositories.donationRepository.listDonationsByUser(USER_ID);
  const wallet = getWalletSession();
  const dbDonations = wallet ? (await fetchDbDonations(wallet.account)).map(mapDbDonation) : [];
  renderWalletSyncState(dbDonations.length);

  const merged = mergeDonationRecords(baseDonations, USER_ID);
  const dbIds = new Set(dbDonations.map((d) => d.id));
  currentDonations = [...dbDonations, ...merged.filter((d) => !dbIds.has(d.dbId ?? "") && !dbIds.has(d.id))].sort((a, b) =>
    a.donatedAt < b.donatedAt ? 1 : -1,
  );

  totalDonatedForTax = currentDonations.reduce((sum, item) => sum + item.amountKrw, 0);
  renderTaxFormState();
  resetTaxResult();
  renderSummary(profile?.displayName ?? "Demo donor", profile?.tier ?? "seed", dbDonations.length);
  renderTimeline();
  renderTable();
}

void init();
