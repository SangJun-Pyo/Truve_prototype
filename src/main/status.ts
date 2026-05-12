import { createRepositories } from "../api/provider";
import { API_BASE } from "../services/apiBase";
import { fetchDbDonations, patchDbDonation, upsertDbUser } from "../services/db";
import { fetchTxStatus } from "../services/xrpl";
import {
  listWalletLocalDonations,
  mergeDonationRecords,
  upsertLocalDonation,
  type LocalDonationRecord,
} from "../services/donations";
import { clearWalletSession, getWalletSession, setWalletSession } from "../services/wallet";
import { createSignInPayload, waitForPayloadResolution } from "../services/xaman";
import { redirectMobileVisitors } from "../shared/mobileRedirect";
import { renderTopNav } from "../shared/nav";

redirectMobileVisitors();

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
const portfolioTotalAmountEl = document.getElementById("portfolio-total-amount");
const impactMainNumberEl = document.getElementById("impact-main-number");
const impactGrowthBadgeEl = document.getElementById("impact-growth-badge");
const impactChartAreaEl = document.getElementById("impact-chart-area");
const impactChartLabelsEl = document.getElementById("impact-chart-labels");
const impactPeriodControlEl = document.getElementById("impact-period-control");
const tokenDistributionEl = document.getElementById("token-distribution");
const credentialListEl = document.getElementById("credential-list");

let totalDonatedForTax = 0;
let currentDonations: LocalDonationRecord[] = [];
let eventsBound = false;
let impactPeriod: "day" | "week" | "month" = "day";
let timelinePage = 1;
let credentialPage = 1;
let tablePage = 1;

const TIMELINE_PAGE_SIZE = 4;
const CREDENTIAL_PAGE_SIZE = 3;
const TABLE_PAGE_SIZE = 8;

const ASSET_KRW_RATES: Record<"XRP" | "RLUSD" | "USDC", number> = {
  XRP: 1000,
  RLUSD: 1400,
  USDC: 1400,
};

interface AssetDistribution {
  amount: number;
  krw: number;
}

type StatusPageTarget = "timeline" | "credentials" | "table";

interface TaxSimulationResult {
  estimated_deduction_min: number;
  estimated_deduction_max: number;
  explanation: string;
  applicable_law: string;
  disclaimer: string;
  source?: "anthropic" | "fallback";
}

interface CredentialLookupResult {
  exists: boolean;
  accepted: boolean;
  index?: string | null;
  ledgerIndex?: number | string | null;
  previousTxId?: string | null;
  uri?: string | null;
  flags?: number | null;
  error?: string;
}

interface XrplTxLookupResult {
  hash: string;
  validated: boolean;
  explorerUrl: string;
  result?: any;
  error?: string;
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

function formatAssetAmount(value: number): string {
  return value.toLocaleString("ko-KR", { maximumFractionDigits: 6 });
}

function getDisplayAssetAmount(donation: LocalDonationRecord): number {
  if (!donation.asset) return donation.amountKrw;
  if (typeof donation.amountAsset === "number" && Number.isFinite(donation.amountAsset)) {
    return donation.amountAsset;
  }
  return donation.amountKrw / ASSET_KRW_RATES[donation.asset];
}

function getAssetTotals(donations: LocalDonationRecord[]): Record<string, AssetDistribution> {
  return donations.reduce<Record<string, AssetDistribution>>((totals, item) => {
    const asset = item.asset ?? "KRW";
    const current = totals[asset] ?? { amount: 0, krw: 0 };
    totals[asset] = {
      amount: current.amount + getDisplayAssetAmount(item),
      krw: current.krw + item.amountKrw,
    };
    return totals;
  }, {});
}

function formatAssetBreakdown(assetTotals: Record<string, AssetDistribution>): string {
  const entries = Object.entries(assetTotals)
    .filter(([asset, totals]) => asset !== "KRW" && totals.amount > 0)
    .sort(([assetA], [assetB]) => assetA.localeCompare(assetB));
  if (entries.length === 0) return "자산 수량 정보가 있는 기부 기록이 없습니다.";
  return entries.map(([asset, totals]) => `${formatAssetAmount(totals.amount)} ${asset}`).join(" · ");
}

function renderAmountSubtext(anchor: Element | null, id: string, text: string): void {
  if (!anchor) return;
  let node = document.getElementById(id);
  if (!node) {
    node = document.createElement("span");
    node.id = id;
    node.className = "asset-subtotal";
    anchor.insertAdjacentElement("afterend", node);
  }
  node.textContent = text;
}

function shortHash(value?: string): string {
  if (!value) return "-";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function escapeHtml(value?: string | number | null): string {
  return String(value ?? "-")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getTestnetExplorerLink(txHash?: string): string {
  return txHash ? `https://testnet.xrpl.org/transactions/${encodeURIComponent(txHash)}` : "";
}

function getTxJson(result?: any): any {
  return result?.tx_json ?? result?.tx ?? result?.transaction ?? result;
}

function getTxMeta(result?: any): any {
  return result?.meta ?? result?.metaData ?? result?.metadata ?? {};
}

function getPaymentAmountLabel(amount: any): string {
  if (!amount) return "-";
  if (typeof amount === "string") return `${formatAssetAmount(Number(amount) / 1_000_000)} XRP`;
  const value = Number(amount.value ?? 0);
  const currency = amount.currency ?? "Issued asset";
  return `${formatAssetAmount(value)} ${currency}`;
}

function decodeMemoHex(hex?: string): string {
  if (!hex) return "-";
  try {
    const clean = hex.replace(/[^0-9a-f]/gi, "");
    const bytes = clean.match(/.{1,2}/g)?.map((byte) => Number.parseInt(byte, 16)) ?? [];
    return new TextDecoder().decode(new Uint8Array(bytes));
  } catch {
    return hex;
  }
}

function parseTxMemos(txJson: any): string[] {
  const memos = Array.isArray(txJson?.Memos) ? txJson.Memos : [];
  return memos
    .map((item: any) => item?.Memo)
    .filter(Boolean)
    .map((memo: any) => {
      const type = decodeMemoHex(memo.MemoType);
      const data = decodeMemoHex(memo.MemoData);
      return type && type !== "-" ? `${type}: ${data}` : data;
    });
}

function credentialStatusLabel(status?: LocalDonationRecord["credentialStatus"]): string {
  switch (status) {
    case "accepted":
      return "Credential accepted";
    case "accept_pending":
      return "Accept pending";
    case "issued":
      return "Issued";
    case "failed":
      return "Failed";
    default:
      return "Evidence ready";
  }
}

function credentialLedgerLabel(credential: CredentialLookupResult | null): string {
  if (!credential) return "Not checked";
  if (credential.accepted) return "Ledger verified";
  if (credential.exists) return "Issued, waiting for accept";
  return "Not found on ledger";
}

function getImpactBuckets(period: typeof impactPeriod): Array<{ label: string; amount: number; start: Date; end: Date }> {
  const now = new Date();
  const buckets = Array.from({ length: 7 }, (_, index) => {
    const offset = 6 - index;
    let start: Date;
    let end: Date;
    let label: string;

    if (period === "day") {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
      end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);
      label = start.toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" });
    } else if (period === "week") {
      const day = now.getDay() === 0 ? 6 : now.getDay() - 1;
      const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day - offset * 7);
      start = monday;
      end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7);
      label = `${start.toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })}주`;
    } else {
      start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
      label = start.toLocaleDateString("en-US", { month: "short" });
    }

    return { label, amount: 0, start, end };
  });

  currentDonations.forEach((donation) => {
    const donatedAt = new Date(donation.donatedAt);
    const bucket = buckets.find((item) => donatedAt >= item.start && donatedAt < item.end);
    if (bucket) bucket.amount += donation.amountKrw;
  });

  return buckets;
}

function clampPage(page: number, totalItems: number, pageSize: number): number {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  return Math.min(Math.max(1, page), totalPages);
}

function renderStatusPagination(target: StatusPageTarget, currentPage: number, totalItems: number, pageSize: number): string {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalPages <= 1) return "";
  const buttons = Array.from({ length: totalPages }, (_, index) => {
    const page = index + 1;
    return `<button class="${page === currentPage ? "is-active" : ""}" type="button" data-status-page-target="${target}" data-page="${page}">${page}</button>`;
  }).join("");
  return `
    <nav class="status-pagination" aria-label="${target} pagination">
      <button type="button" data-status-page-target="${target}" data-page="${currentPage - 1}" ${currentPage <= 1 ? "disabled" : ""}>‹</button>
      ${buttons}
      <button type="button" data-status-page-target="${target}" data-page="${currentPage + 1}" ${currentPage >= totalPages ? "disabled" : ""}>›</button>
    </nav>
  `;
}

function setStatusPage(target: StatusPageTarget, page: number): void {
  if (target === "timeline") {
    timelinePage = clampPage(page, currentDonations.length, TIMELINE_PAGE_SIZE);
    renderTimeline();
    return;
  }
  if (target === "credentials") {
    const credentialCount = currentDonations.filter((donation) => Boolean(donation.txHash || donation.evidenceHash)).length;
    credentialPage = clampPage(page, credentialCount, CREDENTIAL_PAGE_SIZE);
    renderCredentialList();
    return;
  }
  tablePage = clampPage(page, currentDonations.length, TABLE_PAGE_SIZE);
  renderTable();
}

async function lookupCredentialOnLedger(donation: LocalDonationRecord): Promise<CredentialLookupResult | null> {
  if (!donation.xrplAccount || !donation.credentialIssuer || !donation.credentialType) {
    return null;
  }
  try {
    const params = new URLSearchParams({
      subject: donation.xrplAccount,
      issuer: donation.credentialIssuer,
      credentialType: donation.credentialType,
    });
    const response = await fetch(`${API_BASE}/api/xrpl/credential?${params.toString()}`);
    if (!response.ok && response.status !== 404) {
      throw new Error(await response.text());
    }
    return (await response.json()) as CredentialLookupResult;
  } catch (error) {
    return {
      exists: false,
      accepted: false,
      error: error instanceof Error ? error.message : "Credential lookup failed",
    };
  }
}

async function syncCredentialStatuses(): Promise<void> {
  const synced = await Promise.all(
    currentDonations.map(async (donation) => {
      if (donation.credentialStatus === "accepted") return donation;
      const credential = await lookupCredentialOnLedger(donation);
      if (!credential?.accepted) return donation;

      const acceptTxHash = donation.credentialAcceptTxHash ?? credential.previousTxId ?? undefined;
      const next: LocalDonationRecord = {
        ...donation,
        credentialStatus: "accepted",
        proofMintStatus: "credential_accepted",
        credentialAcceptTxHash: acceptTxHash,
        credentialAcceptExplorerUrl: donation.credentialAcceptExplorerUrl ?? getTestnetExplorerLink(acceptTxHash),
      };

      upsertLocalDonation(next);
      if (next.dbId) {
        await patchDbDonation(next.dbId, {
          credential: {
            issuer: next.credentialIssuer,
            credentialType: next.credentialType,
            uri: next.credentialUri,
            issueTxHash: next.credentialIssueTxHash,
            issueExplorerUrl: next.credentialIssueExplorerUrl,
            acceptTxHash: next.credentialAcceptTxHash,
            acceptExplorerUrl: next.credentialAcceptExplorerUrl,
            status: "accepted",
          },
        });
      }
      return next;
    }),
  );
  currentDonations = synced;
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
    minted: "Evidence 기록 완료",
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
  credentialListEl?.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>(".credential-detail-btn");
    if (button?.dataset.donationId) void openCredentialDetail(button.dataset.donationId);
  });
  document.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>(".payment-detail-btn");
    if (button?.dataset.donationId) void openPaymentDetail(button.dataset.donationId);
  });
  document.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>("button[data-status-page-target]");
    const target = button?.dataset.statusPageTarget as StatusPageTarget | undefined;
    const page = Number(button?.dataset.page ?? 1);
    if (target) setStatusPage(target, page);
  });
  document.addEventListener("click", closeCredentialDetail);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") document.querySelector(".credential-detail-modal, .payment-detail-modal")?.remove();
  });
  impactPeriodControlEl?.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>("button[data-period]");
    if (!button) return;
    impactPeriod = (button.dataset.period as typeof impactPeriod) ?? "month";
    impactPeriodControlEl.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button));
    renderImpactChart();
  });
}

function openVerificationForDonation(donationId: string): void {
  const donation = currentDonations.find((item) => item.id === donationId || item.dbId === donationId);
  if (!donation?.txHash) {
    setReceiptStatus("검증 가능한 트랜잭션 해시가 없습니다.", true);
    return;
  }
  const verificationKey = donation.receiptId ?? donation.evidenceHash ?? donation.txHash;
  window.open(`./verify.html?id=${encodeURIComponent(verificationKey)}`, "_blank", "noreferrer");
}

function mapDbDonation(
  d: Awaited<ReturnType<typeof fetchDbDonations>>[number],
  fallbackXrplAccount?: string,
): LocalDonationRecord {
  const allocationPayload = d.allocations as any;
  const allocations = Array.isArray(allocationPayload) ? allocationPayload : (allocationPayload?.items ?? []);
  const meta = allocationPayload?.meta ?? {};
  return {
    id: d.id,
    userId: d.userId,
    donatedAt: d.donatedAt,
    amountKrw: d.amountKrw,
    allocations: allocations as LocalDonationRecord["allocations"],
    paymentStatus: d.paymentStatus as LocalDonationRecord["paymentStatus"],
    proofStatus: d.proofStatus as LocalDonationRecord["proofStatus"],
    nftStatus: d.nftStatus as LocalDonationRecord["nftStatus"],
    settlementStatus: d.settlementStatus as LocalDonationRecord["settlementStatus"],
    txHash: d.txHash ?? undefined,
    proofNftId: d.proofNftId ?? undefined,
    explorerUrl: d.explorerUrl ?? undefined,
    validationStatus: d.validationStatus as LocalDonationRecord["validationStatus"],
    receiptId: d.receiptId ?? meta.receiptId ?? undefined,
    evidenceHash: d.evidenceHash ?? meta.evidenceHash ?? undefined,
    complianceHash: d.complianceHash ?? meta.complianceHash ?? undefined,
    asset: d.asset ?? meta.asset ?? undefined,
    amountAsset: d.amountAsset ?? meta.amountAsset ?? undefined,
    xrplAccount: d.xrplAccount ?? fallbackXrplAccount,
    proofMintStatus:
      meta.credential?.status === "accepted"
        ? "credential_accepted"
        : meta.credential?.status === "accept_pending"
          ? "credential_accept_pending"
          : meta.credential?.status === "failed"
            ? "credential_failed"
            : d.txHash
              ? "evidence_ready"
              : "none",
    credentialIssuer: meta.credential?.issuer ?? undefined,
    credentialType: meta.credential?.credentialType ?? undefined,
    credentialUri: meta.credential?.uri ?? undefined,
    credentialIssueTxHash: meta.credential?.issueTxHash ?? undefined,
    credentialIssueExplorerUrl: meta.credential?.issueExplorerUrl ?? undefined,
    credentialAcceptTxHash: meta.credential?.acceptTxHash ?? undefined,
    credentialAcceptExplorerUrl: meta.credential?.acceptExplorerUrl ?? undefined,
    credentialStatus: meta.credential?.status ?? undefined,
    source: "local",
    dbId: d.id,
  };
}

function renderSummary(profileName: string, tier: string, walletDbCount: number): void {
  const wallet = getWalletSession();
  const total = currentDonations.reduce((sum, item) => sum + item.amountKrw, 0);
  const onchainCount = currentDonations.filter((item) => Boolean(item.txHash)).length;
  const evidenceReadyCount = currentDonations.filter((item) => Boolean(item.txHash || item.evidenceHash)).length;
  const assetTotals = getAssetTotals(currentDonations);

  if (portfolioTotalAmountEl) portfolioTotalAmountEl.textContent = formatKrwPlain(total);
  renderAmountSubtext(portfolioTotalAmountEl, "portfolio-total-assets", formatAssetBreakdown(assetTotals));

  if (summaryEl) {
    summaryEl.innerHTML = `
      <article class="portfolio-stat-card">
        <span>연결 지갑</span>
        <strong>${wallet ? `${wallet.account.slice(0, 6)}...${wallet.account.slice(-4)}` : "미연결"}</strong>
        <p>${wallet ? `DB 동기화 ${walletDbCount}건` : "Xaman 연결 시 지갑 기준 기록 표시"}</p>
      </article>
      <article class="portfolio-stat-card">
        <span>온체인 기록</span>
        <strong>${onchainCount}건</strong>
        <p>Evidence ready ${evidenceReadyCount}건</p>
      </article>
      <article class="portfolio-stat-card">
        <span>등급</span>
        <strong>${tier.toUpperCase()}</strong>
        <p>${profileName}</p>
      </article>
    `;
  }

  renderImpactChart();
  renderTokenDistribution(assetTotals);
  renderCredentialList();
}

function renderImpactChart(): void {
  if (!impactChartAreaEl || !impactChartLabelsEl) return;
  const buckets = getImpactBuckets(impactPeriod);
  const amounts = buckets.map((bucket) => bucket.amount);
  const max = Math.max(...amounts, 1);
  const periodTotal = amounts.reduce((sum, amount) => sum + amount, 0);
  const latest = amounts[amounts.length - 1] ?? 0;
  const previous = amounts[amounts.length - 2] ?? 0;
  const growthPct = previous > 0 ? Math.round(((latest - previous) / previous) * 100) : latest > 0 ? 100 : 0;

  if (impactMainNumberEl) impactMainNumberEl.textContent = formatKrwPlain(periodTotal);
  const periodDonations = currentDonations.filter((donation) => {
    const donatedAt = new Date(donation.donatedAt);
    return buckets.some((bucket) => donatedAt >= bucket.start && donatedAt < bucket.end);
  });
  renderAmountSubtext(impactMainNumberEl, "impact-asset-total", formatAssetBreakdown(getAssetTotals(periodDonations)));
  if (impactGrowthBadgeEl) {
    const sign = growthPct > 0 ? "+" : "";
    const arrow = growthPct >= 0 ? "↑" : "↓";
    impactGrowthBadgeEl.textContent = `${arrow} ${sign}${growthPct}%`;
  }

  impactChartAreaEl.innerHTML = buckets
    .map(({ amount }) => {
      const height = amount > 0 ? Math.max(18, Math.round((amount / max) * 85)) : 4;
      const activeClass = amount > 0 ? "solid" : "empty";
      const valueLabel = amount > 0 ? `<span class="bar-value">${formatKrwPlain(amount)}</span><span class="bar-indicator" aria-hidden="true"></span>` : "";
      return `<div class="bar-wrapper" title="${formatKrwPlain(amount)}">${valueLabel}<div class="bar ${activeClass}" style="height:${height}%"></div></div>`;
    })
    .join("");

  impactChartLabelsEl.innerHTML = buckets.map((bucket) => `<span>${escapeHtml(bucket.label)}</span>`).join("");
}

function renderTokenDistribution(assetTotals: Record<string, AssetDistribution>): void {
  if (!tokenDistributionEl) return;
  const entries = Object.entries(assetTotals)
    .filter(([, totals]) => totals.amount > 0)
    .sort(([assetA], [assetB]) => (assetA === "KRW" ? 1 : assetB === "KRW" ? -1 : assetA.localeCompare(assetB)));
  const totalKrw = entries.reduce((sum, [, totals]) => sum + totals.krw, 0);
  if (entries.length === 0 || totalKrw <= 0) {
    tokenDistributionEl.innerHTML = `<p class="muted-text">아직 표시할 자산 분포가 없습니다.</p>`;
    return;
  }

  tokenDistributionEl.innerHTML = entries
    .map(([asset, totals], index) => {
      const pct = Math.round((totals.krw / totalKrw) * 100);
      const primaryAmount = asset === "KRW" ? formatKrwPlain(totals.krw) : `${formatAssetAmount(totals.amount)} ${asset}`;
      const secondaryAmount = asset === "KRW" ? "자산 정보가 없는 과거 기록" : `≈ ${formatKrwPlain(totals.krw)}`;
      return `
        <div class="token-row">
          <div class="row-between">
            <span>${asset}</span>
            <strong>${primaryAmount}</strong>
          </div>
          <p class="token-subvalue">${secondaryAmount}</p>
          <div class="token-bar"><span class="${index === 0 ? "blue" : "dark"}" style="width:${Math.max(3, pct)}%"></span></div>
        </div>
      `;
    })
    .join("");
  tokenDistributionEl.insertAdjacentHTML(
    "beforeend",
    `
      <div class="token-rate-note">
        <strong>환산 기준</strong>
        <span>XRPL Testnet 데모 지표이며, RLUSD/USDC는 1토큰 = 1,400 KRW 고정 환율로 표시합니다. 실제 세무·회계 금액은 기부 시점 기준가로 별도 확정해야 합니다.</span>
      </div>
    `,
  );
}

function renderCredentialList(): void {
  if (!credentialListEl) return;
  const allCredentials = currentDonations.filter((donation) => Boolean(donation.txHash || donation.evidenceHash));
  credentialPage = clampPage(credentialPage, allCredentials.length, CREDENTIAL_PAGE_SIZE);
  const start = (credentialPage - 1) * CREDENTIAL_PAGE_SIZE;
  const credentials = allCredentials.slice(start, start + CREDENTIAL_PAGE_SIZE);
  if (credentials.length === 0) {
    credentialListEl.innerHTML = `<p class="muted-text">Evidence가 준비되면 Credential 상태가 여기에 표시됩니다.</p>`;
    return;
  }

  credentialListEl.innerHTML =
    credentials
    .map((donation) => {
      const status = donation.credentialStatus ?? (donation.txHash ? "evidence_ready" : "pending");
      const statusClass =
        donation.credentialStatus === "accepted" ? "accepted" : donation.credentialStatus === "failed" ? "failed" : "pending";
      return `
        <button class="credential-mini-card credential-detail-btn" type="button" data-donation-id="${escapeHtml(donation.id)}">
          <div class="credential-icon">✓</div>
          <div>
            <strong>${escapeHtml(donation.receiptId ?? "Donation Evidence")}</strong>
            <span><em class="credential-status-dot ${statusClass}"></em>${escapeHtml(status)} · ${escapeHtml(shortHash(donation.credentialAcceptTxHash ?? donation.txHash ?? donation.evidenceHash))}</span>
          </div>
          <small>상세보기</small>
        </button>
      `;
    })
      .join("") +
    renderStatusPagination("credentials", credentialPage, allCredentials.length, CREDENTIAL_PAGE_SIZE);
}

function renderCredentialDetailRow(label: string, value?: string | number | null, link?: string): string {
  const content = link
    ? `<a class="text-link" href="${escapeHtml(link)}" target="_blank" rel="noreferrer">${escapeHtml(value)}</a>`
    : `<strong>${escapeHtml(value)}</strong>`;
  return `<div class="credential-detail-row"><span>${escapeHtml(label)}</span>${content}</div>`;
}

function renderCredentialLedgerSummary(credential: CredentialLookupResult | null): string {
  const state = credentialLedgerLabel(credential);
  const stateClass = credential?.accepted ? "accepted" : credential?.exists ? "pending" : "failed";
  return `
    <div class="credential-ledger-summary">
      <article>
        <span>Ledger status</span>
        <strong><em class="credential-status-dot ${stateClass}"></em>${escapeHtml(state)}</strong>
      </article>
      <article>
        <span>Credential object</span>
        <strong>${escapeHtml(shortHash(credential?.index ?? undefined))}</strong>
      </article>
      <article>
        <span>Previous TX</span>
        <strong>${escapeHtml(shortHash(credential?.previousTxId ?? undefined))}</strong>
      </article>
    </div>
  `;
}

function renderPaymentLedgerSummary(tx: XrplTxLookupResult | null): string {
  const result = getTxMeta(tx?.result)?.TransactionResult ?? tx?.result?.engine_result ?? "-";
  const txJson = getTxJson(tx?.result);
  const amount = getPaymentAmountLabel(txJson?.Amount);
  return `
    <div class="credential-ledger-summary">
      <article>
        <span>Payment status</span>
        <strong><em class="credential-status-dot ${tx?.validated ? "accepted" : "failed"}"></em>${tx?.validated ? "Validated" : "Not validated"}</strong>
      </article>
      <article>
        <span>Amount</span>
        <strong>${escapeHtml(amount)}</strong>
      </article>
      <article>
        <span>Result</span>
        <strong>${escapeHtml(result)}</strong>
      </article>
    </div>
  `;
}

async function openPaymentDetail(donationId: string): Promise<void> {
  const donation = currentDonations.find((item) => item.id === donationId || item.dbId === donationId);
  if (!donation?.txHash) return;

  document.querySelectorAll(".credential-detail-modal, .payment-detail-modal").forEach((modal) => modal.remove());
  let tx: XrplTxLookupResult | null = null;
  try {
    tx = (await fetchTxStatus(donation.txHash)) as XrplTxLookupResult;
  } catch (error) {
    tx = {
      hash: donation.txHash,
      validated: false,
      explorerUrl: getTestnetExplorerLink(donation.txHash),
      error: error instanceof Error ? error.message : "Payment transaction lookup failed",
    };
  }

  const txJson = getTxJson(tx.result);
  const meta = getTxMeta(tx.result);
  const memos = parseTxMemos(txJson);
  const amount = getPaymentAmountLabel(txJson?.Amount);
  const deliveredAmount = getPaymentAmountLabel(meta?.delivered_amount ?? meta?.DeliveredAmount);
  const feeXrp = txJson?.Fee ? `${formatAssetAmount(Number(txJson.Fee) / 1_000_000)} XRP` : "-";
  const assetIssuer = typeof txJson?.Amount === "object" ? txJson.Amount.issuer : undefined;
  const verificationKey = donation.receiptId ?? donation.evidenceHash ?? donation.txHash ?? donation.id;
  const verifyLink = `./verify.html?id=${encodeURIComponent(verificationKey)}`;

  const modal = document.createElement("div");
  modal.className = "modal-backdrop payment-detail-modal";
  modal.innerHTML = `
    <article class="modal-panel credential-detail-panel" role="dialog" aria-modal="true" aria-labelledby="payment-detail-title">
      <div class="modal-head">
        <div>
          <p class="modal-kicker">XRPL Payment Transaction</p>
          <h3 id="payment-detail-title">${escapeHtml(shortHash(donation.txHash))}</h3>
          <p>${escapeHtml(tx.validated ? "Payment validated" : "Payment not validated")} · ${escapeHtml(formatDate(donation.donatedAt))}</p>
        </div>
        <button class="modal-close payment-detail-close" type="button" aria-label="Close">&times;</button>
      </div>
      ${renderPaymentLedgerSummary(tx)}
      <div class="credential-detail-grid">
        ${renderCredentialDetailRow("Transaction Type", txJson?.TransactionType)}
        ${renderCredentialDetailRow("TX Hash", donation.txHash, tx.explorerUrl)}
        ${renderCredentialDetailRow("Result", meta?.TransactionResult ?? tx.result?.engine_result)}
        ${renderCredentialDetailRow("Sender", txJson?.Account)}
        ${renderCredentialDetailRow("Destination", txJson?.Destination)}
        ${renderCredentialDetailRow("Amount", amount)}
        ${renderCredentialDetailRow("Delivered Amount", deliveredAmount)}
        ${renderCredentialDetailRow("Asset Issuer", assetIssuer)}
        ${renderCredentialDetailRow("Fee", feeXrp)}
        ${renderCredentialDetailRow("Ledger Index", tx.result?.ledger_index ?? txJson?.ledger_index)}
        ${renderCredentialDetailRow("Close Time", tx.result?.close_time_iso)}
        ${renderCredentialDetailRow("Receipt ID", donation.receiptId)}
        ${renderCredentialDetailRow("Evidence Hash", donation.evidenceHash)}
        ${renderCredentialDetailRow("Compliance Hash", donation.complianceHash)}
        ${renderCredentialDetailRow("Memo", memos.length > 0 ? memos.join(" | ") : "-")}
      </div>
      <div class="modal-actions">
        <a class="primary-btn" href="${escapeHtml(tx.explorerUrl)}" target="_blank" rel="noreferrer">Open XRPL Explorer</a>
        <a class="ghost-btn" href="${escapeHtml(verifyLink)}" target="_blank" rel="noreferrer">Open verification page</a>
      </div>
      ${tx.error ? `<p class="tax-disclaimer mt-12">Payment lookup: ${escapeHtml(tx.error)}</p>` : ""}
    </article>
  `;
  document.body.appendChild(modal);
  modal.querySelector<HTMLButtonElement>(".payment-detail-close")?.focus();
}

async function openCredentialDetail(donationId: string): Promise<void> {
  const donation = currentDonations.find((item) => item.id === donationId || item.dbId === donationId);
  if (!donation) return;

  document.querySelector(".credential-detail-modal")?.remove();
  const credential = await lookupCredentialOnLedger(donation);
  const paymentLink = donation.explorerUrl ?? getTestnetExplorerLink(donation.txHash);
  const issueLink = donation.credentialIssueExplorerUrl ?? getTestnetExplorerLink(donation.credentialIssueTxHash);
  const acceptTxHash = donation.credentialAcceptTxHash ?? credential?.previousTxId ?? undefined;
  const acceptLink = donation.credentialAcceptExplorerUrl ?? getTestnetExplorerLink(acceptTxHash);
  const verificationKey = donation.receiptId ?? donation.evidenceHash ?? donation.txHash ?? donation.id;
  const verifyLink = `./verify.html?id=${encodeURIComponent(verificationKey)}`;
  const status = credentialStatusLabel(donation.credentialStatus);
  const ledgerStatus = credentialLedgerLabel(credential);
  const amount = donation.asset
    ? `${formatAssetAmount(getDisplayAssetAmount(donation))} ${donation.asset} (${formatKrwPlain(donation.amountKrw)})`
    : formatKrwPlain(donation.amountKrw);

  const modal = document.createElement("div");
  modal.className = "modal-backdrop credential-detail-modal";
  modal.innerHTML = `
    <article class="modal-panel credential-detail-panel" role="dialog" aria-modal="true" aria-labelledby="credential-detail-title">
      <div class="modal-head">
        <div>
          <p class="modal-kicker">XLS-70 Credential</p>
          <h3 id="credential-detail-title">${escapeHtml(donation.receiptId ?? "Donation Evidence")}</h3>
          <p>${escapeHtml(status)} · ${escapeHtml(ledgerStatus)} · ${escapeHtml(formatDate(donation.donatedAt))}</p>
        </div>
        <button class="modal-close credential-detail-close" type="button" aria-label="Close">&times;</button>
      </div>
      ${renderCredentialLedgerSummary(credential)}
      <div class="credential-detail-grid">
        ${renderCredentialDetailRow("Status", status)}
        ${renderCredentialDetailRow("Ledger Credential", ledgerStatus)}
        ${renderCredentialDetailRow("Amount", amount)}
        ${renderCredentialDetailRow("Holder", donation.xrplAccount)}
        ${renderCredentialDetailRow("Issuer", donation.credentialIssuer)}
        ${renderCredentialDetailRow("Credential Type", donation.credentialType)}
        ${renderCredentialDetailRow("Credential URI", credential?.uri ?? donation.credentialUri)}
        ${renderCredentialDetailRow("Credential Object ID", credential?.index)}
        ${renderCredentialDetailRow("Ledger Index", credential?.ledgerIndex)}
        ${renderCredentialDetailRow("Ledger Flags", credential?.flags)}
        ${renderCredentialDetailRow("Payment TX", shortHash(donation.txHash), paymentLink)}
        ${renderCredentialDetailRow("Credential Issue TX", shortHash(donation.credentialIssueTxHash), issueLink)}
        ${renderCredentialDetailRow("Credential Accept TX", shortHash(acceptTxHash), acceptLink)}
        ${renderCredentialDetailRow("Evidence Hash", donation.evidenceHash)}
        ${renderCredentialDetailRow("Compliance Hash", donation.complianceHash)}
      </div>
      <div class="modal-actions">
        <a class="primary-btn" href="${escapeHtml(verifyLink)}" target="_blank" rel="noreferrer">Open verification page</a>
        ${donation.txHash ? `<button class="ghost-btn payment-detail-btn" type="button" data-donation-id="${escapeHtml(donation.id)}">Open Payment detail</button>` : ""}
        ${acceptLink ? `<a class="ghost-btn" href="${escapeHtml(acceptLink)}" target="_blank" rel="noreferrer">Open Credential TX</a>` : ""}
      </div>
      ${credential?.error ? `<p class="tax-disclaimer mt-12">Ledger lookup: ${escapeHtml(credential.error)}</p>` : ""}
    </article>
  `;
  document.body.appendChild(modal);
  modal.querySelector<HTMLButtonElement>(".credential-detail-close")?.focus();
}

function closeCredentialDetail(event: Event): void {
  const target = event.target as HTMLElement | null;
  if (
    target?.classList.contains("credential-detail-modal") ||
    target?.closest(".credential-detail-close") ||
    target?.classList.contains("payment-detail-modal") ||
    target?.closest(".payment-detail-close")
  ) {
    document.querySelectorAll(".credential-detail-modal, .payment-detail-modal").forEach((modal) => modal.remove());
  }
}

function renderTimeline(): void {
  if (!timelineEl) return;
  timelinePage = clampPage(timelinePage, currentDonations.length, TIMELINE_PAGE_SIZE);
  const start = (timelinePage - 1) * TIMELINE_PAGE_SIZE;
  const items = currentDonations.slice(start, start + TIMELINE_PAGE_SIZE);
  if (items.length === 0) {
    timelineEl.innerHTML = `<div class="empty-state">아직 기부 기록이 없습니다.</div>`;
    return;
  }

  timelineEl.innerHTML =
    items
    .map((donation) => {
      const amount = donation.asset
        ? `${formatAssetAmount(getDisplayAssetAmount(donation))} ${donation.asset}`
        : formatKrwPlain(donation.amountKrw);
      const proof = donation.txHash ?? donation.evidenceHash;
      return `
        <article class="portfolio-list-item">
          <div class="portfolio-avatar">${(donation.asset ?? "T").slice(0, 2)}</div>
          <div class="portfolio-list-info">
            <strong>${donation.receiptId ?? "Donation Evidence"}</strong>
            <span>${formatDate(donation.donatedAt)} · <em>${shortHash(proof)}</em></span>
          </div>
          <div class="portfolio-list-amount">+${amount}</div>
        </article>
      `;
    })
      .join("") +
    renderStatusPagination("timeline", timelinePage, currentDonations.length, TIMELINE_PAGE_SIZE);
}

function renderTable(): void {
  if (!tableEl) return;
  tablePage = clampPage(tablePage, currentDonations.length, TABLE_PAGE_SIZE);
  const start = (tablePage - 1) * TABLE_PAGE_SIZE;
  const pageItems = currentDonations.slice(start, start + TABLE_PAGE_SIZE);
  const rows = pageItems
    .map((donation) => {
      const txCell = donation.txHash
        ? `
          <div class="tx-cell-actions">
            <a class="text-link" href="${escapeHtml(getTestnetExplorerLink(donation.txHash))}" target="_blank" rel="noreferrer">${escapeHtml(shortHash(donation.txHash))}</a>
            <button class="inline-link-btn payment-detail-btn" type="button" data-donation-id="${escapeHtml(donation.id)}">상세보기</button>
          </div>
        `
        : "-";
      const proofStatus =
        donation.proofMintStatus === "credential_accepted"
          ? "Credential issued"
          : donation.proofMintStatus === "credential_accept_pending"
            ? "Credential accept pending"
            : donation.proofMintStatus === "credential_failed"
              ? "Credential failed"
              : donation.proofMintStatus === "evidence_ready" || donation.txHash
                ? "Evidence ready"
                : "Pending";
      return `
        <tr>
          <td>${formatDate(donation.donatedAt)}</td>
          <td>${donation.asset ? `${donation.amountAsset ?? "-"} ${donation.asset}<br /><span class="trust">${formatKrwPlain(donation.amountKrw)}</span>` : formatKrw(donation.amountKrw)}</td>
          <td>${stepToKorean(donation.settlementStatus)} / ${donation.validationStatus ?? "-"}</td>
          <td>${proofStatus}</td>
          <td>${txCell}</td>
          <td>
            <button class="btn btn-secondary receipt-request-btn" type="button" data-receipt-id="${donation.id}" ${donation.txHash ? "" : "disabled"}>
              ${proofStatus === "Pending" ? "대기" : "검증 보기"}
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
          <th>Credential 상태</th>
          <th>트랜잭션</th>
          <th>검증</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    ${renderStatusPagination("table", tablePage, currentDonations.length, TABLE_PAGE_SIZE)}
  `;
  tableEl.querySelectorAll<HTMLButtonElement>(".receipt-request-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.receiptId;
      if (id) openVerificationForDonation(id);
    });
  });
}

async function init(): Promise<void> {
  bindEvents();
  const repositories = await createRepositories();
  const profile = await repositories.userRepository.getProfile(USER_ID);
  const baseDonations = await repositories.donationRepository.listDonationsByUser(USER_ID);
  const wallet = getWalletSession();
  const dbDonations = wallet
    ? (await fetchDbDonations(wallet.account)).map((donation) => mapDbDonation(donation, wallet.account))
    : [];
  renderWalletSyncState(dbDonations.length);

  if (wallet) {
    const walletLocal = listWalletLocalDonations(USER_ID, wallet.account);
    const dbIds = new Set(dbDonations.map((d) => d.id));
    const dbTxHashes = new Set(dbDonations.map((d) => d.txHash).filter(Boolean));
    const localOnly = walletLocal.filter(
      (d) => !dbIds.has(d.dbId ?? "") && !dbIds.has(d.id) && !dbTxHashes.has(d.txHash ?? ""),
    );
    currentDonations = [...dbDonations, ...localOnly].sort((a, b) => (a.donatedAt < b.donatedAt ? 1 : -1));
  } else {
    currentDonations = mergeDonationRecords(baseDonations, USER_ID);
  }

  await syncCredentialStatuses();
  timelinePage = clampPage(timelinePage, currentDonations.length, TIMELINE_PAGE_SIZE);
  credentialPage = clampPage(
    credentialPage,
    currentDonations.filter((donation) => Boolean(donation.txHash || donation.evidenceHash)).length,
    CREDENTIAL_PAGE_SIZE,
  );
  tablePage = clampPage(tablePage, currentDonations.length, TABLE_PAGE_SIZE);
  totalDonatedForTax = currentDonations.reduce((sum, item) => sum + item.amountKrw, 0);
  renderTaxFormState();
  resetTaxResult();
  renderSummary(profile?.displayName ?? "Demo donor", profile?.tier ?? "seed", dbDonations.length);
  renderTimeline();
  renderTable();
}

void init();
