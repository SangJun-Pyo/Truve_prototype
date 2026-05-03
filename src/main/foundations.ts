import { xrpToDrops } from "xrpl";
import type { DonationBundle, Foundation } from "../api";
import { createRepositories } from "../api/provider";
import { renderBundleCard } from "../components/bundleCard";
import { categoryToKorean, renderFoundationCard } from "../components/explorerCard";
import { saveDbDonation, upsertDbUser } from "../services/db";
import {
  addFoundationToCart,
  addManyFoundationsToCart,
  clearCart,
  getCartCount,
  getCartItemsWithFoundations,
  getCartState,
  isInCart,
  removeFoundationFromCart,
  saveCartState,
  updateCartRatio,
} from "../services/cart";
import { upsertLocalDonation, type LocalDonationRecord } from "../services/donations";
import { API_BASE } from "../services/apiBase";
import { clearWalletSession, getWalletSession, setWalletSession } from "../services/wallet";
import { createPaymentPayload, createSignInPayload, waitForPayloadResolution } from "../services/xaman";
import {
  fetchAccountAssetBalances,
  fetchAccountInfo,
  fetchDonationDestination,
  fetchXrplAssets,
  getTestnetExplorerLink,
  waitForTxValidation,
  type XrplAssetConfig,
} from "../services/xrpl";
import { renderTopNav } from "../shared/nav";

const USER_ID = "usr_demo_001";
type DonationAsset = "XRP" | "RLUSD" | "USDC";
const DEMO_KRW_RATES: Record<DonationAsset, number> = {
  XRP: 1000,
  RLUSD: 1400,
  USDC: 1400,
};
const DONATION_ASSETS: DonationAsset[] = ["RLUSD", "USDC"];

const navRoot = document.getElementById("top-nav");
if (navRoot) {
  navRoot.innerHTML = renderTopNav("foundations");
}

const searchInputEl = document.getElementById("search-input") as HTMLInputElement | null;
const categorySelectEl = document.getElementById("category-select") as HTMLSelectElement | null;
const foundationsGridEl = document.getElementById("foundations-grid");
const bundlesGridEl = document.getElementById("bundles-grid");
const tabFoundationEl = document.getElementById("tab-foundation") as HTMLButtonElement | null;
const tabBundleEl = document.getElementById("tab-bundle") as HTMLButtonElement | null;
const cartCountEl = document.getElementById("cart-count");
const consoleEl = document.querySelector<HTMLElement>(".donation-console");

const itemsContainerEl = document.getElementById("items-container");
const previewListEl = document.getElementById("preview-list");
const totalAmountEl = document.getElementById("total-amount") as HTMLInputElement | null;
const quickAmountEls = Array.from(document.querySelectorAll<HTMLButtonElement>(".quick-btn"));
const assetSelectEl = document.getElementById("asset-select") as HTMLSelectElement | null;
const assetHelpEl = document.getElementById("asset-help");
const amountUnitEl = document.getElementById("amount-unit");
const amountKrwEstimateEl = document.getElementById("amount-krw-estimate");
const complianceCheckEl = document.getElementById("compliance-check") as HTMLInputElement | null;
const validationBoxEl = document.getElementById("validation-box");
const destinationEl = document.getElementById("donation-destination");
const txStatusEl = document.getElementById("donation-tx-status");
const txResultEl = document.getElementById("donation-tx-result");
const taxDonorTypeEl = document.getElementById("tax-donor-type") as HTMLSelectElement | null;
const taxIncomeRangeEl = document.getElementById("tax-income-range") as HTMLSelectElement | null;
const taxProfitRangeEl = document.getElementById("tax-profit-range") as HTMLSelectElement | null;
const taxDonationTypeEl = document.getElementById("tax-donation-type") as HTMLSelectElement | null;
const taxIncomeFieldEl = document.getElementById("tax-income-field");
const taxProfitFieldEl = document.getElementById("tax-profit-field");
const taxDonationTypeFieldEl = document.getElementById("tax-donation-type-field");
const taxSourceBadgeEl = document.getElementById("tax-source-badge");
const taxDonationAmountEl = document.getElementById("tax-donation-amount");
const taxDeductionRangeEl = document.getElementById("tax-deduction-range");
const taxRealCostEl = document.getElementById("tax-real-cost");
const taxExplanationEl = document.getElementById("tax-explanation");
const taxLawEl = document.getElementById("tax-law");
const taxCalcBtnEl = document.getElementById("tax-calc-btn") as HTMLButtonElement | null;
const taxPartnerBtnEl = document.getElementById("tax-partner-btn") as HTMLButtonElement | null;
const executeBtnEl = document.getElementById("execute-btn") as HTMLButtonElement | null;
const rebalanceBtnEl = document.getElementById("rebalance-btn");
const clearBtnEl = document.getElementById("clear-btn");
const connectBtnEl = document.getElementById("xaman-connect-btn");
const disconnectBtnEl = document.getElementById("xaman-disconnect-btn");
const walletStatusEl = document.getElementById("wallet-status");
const walletAddressEl = document.getElementById("wallet-address");
const walletBalanceEl = document.getElementById("wallet-balance");
const qrWrapEl = document.getElementById("xaman-qr-wrap");

document.querySelector<HTMLElement>(".donation-console .tax-card")?.remove();

let foundations: Foundation[] = [];
let bundles: DonationBundle[] = [];
let activeTab: "foundation" | "bundle" = "foundation";
let lastDonationRecord: LocalDonationRecord | null = null;
let donationDestination = {
  address: "",
  label: "Truve MVP settlement wallet",
};
let xrplAssets: XrplAssetConfig[] = [
  { asset: "XRP", label: "XRP", native: true, configured: true },
  { asset: "RLUSD", label: "RLUSD", native: false, configured: false },
  { asset: "USDC", label: "USDC", native: false, configured: false },
];

interface TaxSimulationResult {
  estimated_deduction_min: number;
  estimated_deduction_max: number;
  explanation: string;
  applicable_law: string;
  disclaimer: string;
  source?: "anthropic" | "fallback";
}

function getSelectedAsset(): DonationAsset {
  const value = assetSelectEl?.value;
  return value === "USDC" ? "USDC" : "RLUSD";
}

function getSelectedAssetConfig(): XrplAssetConfig | undefined {
  const selected = getSelectedAsset();
  return xrplAssets.find((asset) => asset.asset === selected);
}

function getAmount(): number {
  const value = Number(totalAmountEl?.value ?? 0);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function getDonationAmountKrw(): number {
  return Math.round(getAmount() * DEMO_KRW_RATES[getSelectedAsset()]);
}

function formatKrw(amount: number): string {
  return `${Math.max(0, Math.round(amount)).toLocaleString("ko-KR")} KRW`;
}

function formatKrwRate(asset: DonationAsset): string {
  return `1 ${asset} = ${DEMO_KRW_RATES[asset].toLocaleString("ko-KR")} KRW`;
}

function getCartView() {
  return getCartItemsWithFoundations(foundations);
}

function getRatioTotal(): number {
  return getCartView().reduce((sum, item) => sum + item.ratioPct, 0);
}

function getRepresentativeFoundation(): Foundation | null {
  return getCartView()[0]?.foundation ?? null;
}

function getCardVisual(category: Foundation["category"]): [string, string] {
  const map: Record<Foundation["category"], [string, string]> = {
    climate: ["#FFF0E5", "#FDBA74"],
    education: ["#F8FAFC", "#CBD5E1"],
    health: ["#FFE4E6", "#FDA4AF"],
    animal: ["#ECFEFF", "#67E8F9"],
    humanitarian: ["#EEF2FF", "#A5B4FC"],
  };
  return map[category];
}

function updateCartBadge(): void {
  if (!cartCountEl) return;
  cartCountEl.textContent = String(getCartCount());
}

function filterFoundations(): Foundation[] {
  const query = (searchInputEl?.value ?? "").trim().toLowerCase();
  const category = categorySelectEl?.value ?? "";

  return foundations.filter((foundation) => {
    const searchable = `${foundation.name} ${foundation.description} ${foundation.tags.join(" ")}`.toLowerCase();
    const queryMatch = query.length === 0 || searchable.includes(query);
    const categoryMatch = category.length === 0 || foundation.category === category;
    return queryMatch && categoryMatch;
  });
}

function animateToConsole(sourceElement: HTMLElement): void {
  if (!consoleEl) return;

  const sourceRect = sourceElement.getBoundingClientRect();
  const targetRect = consoleEl.getBoundingClientRect();
  const dot = document.createElement("div");
  dot.className = "flying-dot";
  const startX = sourceRect.left + sourceRect.width / 2 - 10;
  const startY = sourceRect.top + sourceRect.height / 2 - 10;
  dot.style.left = `${startX}px`;
  dot.style.top = `${startY}px`;
  document.body.appendChild(dot);
  dot.getBoundingClientRect();
  const endX = targetRect.left + targetRect.width / 2 - 10;
  const endY = targetRect.top + 36;
  dot.style.transform = `translate(${endX - startX}px, ${endY - startY}px) scale(0.2)`;
  dot.style.opacity = "0";
  dot.addEventListener("transitionend", () => dot.remove());
}

function setTxStatus(message: string, isError = false): void {
  if (!txStatusEl) return;
  txStatusEl.textContent = message;
  txStatusEl.className = isError ? "status-badge error" : "status-badge success";
}

function setWalletBadge(account: string | null): void {
  if (!walletStatusEl || !walletAddressEl) return;

  if (!account) {
    walletStatusEl.textContent = "NOT CONNECTED";
    walletStatusEl.className = "status-badge error";
    walletAddressEl.textContent = "-";
    return;
  }

  walletStatusEl.textContent = "CONNECTED";
  walletStatusEl.className = "status-badge success";
  walletAddressEl.textContent = `${account.slice(0, 6)}...${account.slice(-4)}`;
}

function setWalletBalanceText(message: string): void {
  if (walletBalanceEl) walletBalanceEl.textContent = message;
}

function renderQrcode(qrPngUrl: string, openUrl: string): void {
  if (!qrWrapEl) return;
  qrWrapEl.innerHTML = `
    <img src="${qrPngUrl}" alt="Xaman QR" />
    <a class="ghost-btn" href="${openUrl}" target="_blank" rel="noreferrer">Xaman 앱으로 열기</a>
  `;
}

function clearQrcode(): void {
  if (qrWrapEl) qrWrapEl.innerHTML = "";
}

function renderFoundationTab(): void {
  if (!foundationsGridEl) return;
  const filtered = filterFoundations();
  if (filtered.length === 0) {
    foundationsGridEl.innerHTML = `<div class="empty-state">조건에 맞는 재단이 없습니다.</div>`;
    return;
  }

  foundationsGridEl.innerHTML = filtered
    .map((foundation) => renderFoundationCard(foundation, isInCart(foundation.id)))
    .join("");

  foundationsGridEl.querySelectorAll<HTMLButtonElement>(".add-to-cart-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.addId;
      if (!id) return;
      addFoundationToCart(id);
      animateToConsole(button);
      renderAll();
      renderFoundationTab();
    });
  });
}

function renderBundleTab(): void {
  if (!bundlesGridEl) return;
  bundlesGridEl.innerHTML = bundles.map((bundle) => renderBundleCard(bundle, foundations)).join("");

  bundlesGridEl.querySelectorAll<HTMLButtonElement>(".add-bundle-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const bundleId = button.dataset.bundleId;
      const bundle = bundles.find((item) => item.id === bundleId);
      if (!bundle) return;
      addManyFoundationsToCart(bundle.allocations.map((allocation) => allocation.foundationId));
      animateToConsole(button);
      renderAll();
      renderFoundationTab();
      button.innerHTML = `<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      button.disabled = true;
      button.classList.add("is-added");
    });
  });
}

function syncTabs(): void {
  if (!tabFoundationEl || !tabBundleEl || !foundationsGridEl || !bundlesGridEl) return;
  const isFoundation = activeTab === "foundation";
  tabFoundationEl.classList.toggle("active", isFoundation);
  tabBundleEl.classList.toggle("active", !isFoundation);
  foundationsGridEl.classList.toggle("hidden", !isFoundation);
  bundlesGridEl.classList.toggle("hidden", isFoundation);
}

function renderSelectedItems(): void {
  if (!itemsContainerEl) return;
  const items = getCartView();
  if (items.length === 0) {
    itemsContainerEl.innerHTML = `<div class="empty-state">왼쪽에서 재단 또는 ETF 묶음을 선택하세요.</div>`;
    return;
  }

  itemsContainerEl.innerHTML = items
    .map(
      (item) => `
        <article class="selected-item" data-id="${item.foundation.id}">
          <div class="selected-item-head">
            <div>
              <div class="selected-title">${item.foundation.name}</div>
              <div class="microcopy">${categoryToKorean(item.foundation.category)} · 투명성 ${item.foundation.trustMetrics.proofCoveragePct}%</div>
            </div>
            <button class="remove-btn" data-remove-id="${item.foundation.id}" type="button" title="삭제">×</button>
          </div>
          <div class="allocation-controls">
            <button class="adjust-btn" data-adjust-id="${item.foundation.id}" data-delta="-5" type="button">-</button>
            <input class="allocation-slider" type="range" min="0" max="100" value="${item.ratioPct}" data-ratio-id="${item.foundation.id}" />
            <button class="adjust-btn" data-adjust-id="${item.foundation.id}" data-delta="5" type="button">+</button>
            <div class="percent-input-wrapper">
              <input class="percent-input" type="number" min="0" max="100" value="${item.ratioPct}" data-input-id="${item.foundation.id}" />
              <span>%</span>
            </div>
          </div>
        </article>
      `,
    )
    .join("");

  itemsContainerEl.querySelectorAll<HTMLButtonElement>("[data-remove-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.removeId;
      if (!id) return;
      removeFoundationFromCart(id);
      renderAll();
      renderFoundationTab();
    });
  });

  itemsContainerEl.querySelectorAll<HTMLInputElement>("[data-ratio-id]").forEach((input) => {
    input.addEventListener("input", () => {
      const id = input.dataset.ratioId;
      if (!id) return;
      updateCartRatio(id, Number(input.value));
      renderAll();
    });
  });

  itemsContainerEl.querySelectorAll<HTMLInputElement>("[data-input-id]").forEach((input) => {
    input.addEventListener("change", () => {
      const id = input.dataset.inputId;
      if (!id) return;
      updateCartRatio(id, Math.max(0, Math.min(100, Number(input.value) || 0)));
      renderAll();
    });
  });

  itemsContainerEl.querySelectorAll<HTMLButtonElement>("[data-adjust-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.adjustId;
      const delta = Number(button.dataset.delta ?? 0);
      if (!id) return;
      const item = getCartState().items.find((entry) => entry.foundationId === id);
      updateCartRatio(id, Math.max(0, Math.min(100, (item?.ratioPct ?? 0) + delta)));
      renderAll();
    });
  });
}

function renderPreview(): void {
  if (!previewListEl) return;
  const amount = getAmount();
  const asset = getSelectedAsset();
  const items = getCartView();
  if (items.length === 0) {
    previewListEl.innerHTML = `<div class="card-desc">선택한 재단이 없습니다.</div>`;
    return;
  }

  previewListEl.innerHTML = items
    .map((item) => {
      const [, color2] = getCardVisual(item.foundation.category);
      const distributed = (amount * item.ratioPct) / 100;
      return `
        <div class="preview-item">
          <div class="preview-row">
            <span>${item.foundation.name}</span>
            <div class="preview-vals">
              <span class="preview-percent">${item.ratioPct}%</span>
              <span class="preview-xrp">${distributed.toFixed(1)} ${asset}</span>
            </div>
          </div>
          <div class="mini-progress-bg">
            <div class="mini-progress-fill" style="width:${item.ratioPct}%; background-color:${color2};"></div>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderValidation(): void {
  if (!validationBoxEl) return;
  const total = getRatioTotal();
  if (total === 100) {
    validationBoxEl.className = "validation-box success";
    validationBoxEl.innerHTML = `<span>총 비율</span><span id="validation-total">100% ✓</span>`;
  } else {
    const diff = 100 - total;
    validationBoxEl.className = "validation-box warning";
    validationBoxEl.innerHTML = `<span>${diff > 0 ? `${diff}% 남음` : `${Math.abs(diff)}% 초과`}</span><span>${total}%</span>`;
  }
}

function renderAssetState(): void {
  const asset = getSelectedAsset();
  const config = getSelectedAssetConfig();
  if (amountUnitEl) amountUnitEl.textContent = asset;
  if (amountKrwEstimateEl) {
    amountKrwEstimateEl.innerHTML = `
      <span class="conversion-label">예상 원화 환산액</span>
      <strong>${formatKrw(getDonationAmountKrw())}</strong>
      <span class="conversion-rate">데모 환율 · ${formatKrwRate(asset)}</span>
    `;
  }
  assetSelectEl?.querySelectorAll<HTMLOptionElement>("option").forEach((option) => {
    const optionConfig = xrplAssets.find((item) => item.asset === option.value);
    option.disabled = !DONATION_ASSETS.includes(option.value as DonationAsset) || Boolean(optionConfig && !optionConfig.configured);
  });
  if (assetHelpEl) {
    if (!config?.configured) {
      assetHelpEl.textContent = `${asset} testnet issuer is not configured. Set XRPL_TESTNET_${asset}_ISSUER on the API server.`;
      return;
    }
    const issuer = config.issuer ? `${config.issuer.slice(0, 6)}...${config.issuer.slice(-4)}` : "-";
    assetHelpEl.textContent = `${asset} issued currency payment is ready. Receiver needs a TrustLine to issuer ${issuer}.`;
    return;
    assetHelpEl!.textContent =
      asset === "XRP"
        ? "XRP는 Xaman Testnet 결제 데모를 바로 실행할 수 있습니다."
        : `${asset} 수령은 재단 TrustLine 설정 후 지원됩니다. 현재 데모 실행은 XRP만 활성화됩니다.`;
  }
}

function renderTaxFormState(): void {
  const isCorporate = taxDonorTypeEl?.value === "법인";
  taxIncomeFieldEl?.classList.toggle("hidden", isCorporate);
  taxProfitFieldEl?.classList.toggle("hidden", !isCorporate);
  taxDonationTypeFieldEl?.classList.toggle("hidden", !isCorporate);
}

function resetTaxResult(): void {
  if (taxSourceBadgeEl) {
    taxSourceBadgeEl.textContent = "READY";
    taxSourceBadgeEl.className = "status-badge success";
  }
  if (taxDonationAmountEl) taxDonationAmountEl.textContent = formatKrw(getDonationAmountKrw());
  if (taxDeductionRangeEl) taxDeductionRangeEl.textContent = "계산 대기";
  if (taxRealCostEl) taxRealCostEl.textContent = "-";
  if (taxExplanationEl) taxExplanationEl.textContent = "기부 금액과 기부자 유형을 선택한 뒤 참고 추정치를 확인하세요.";
  if (taxLawEl) taxLawEl.textContent = "관련 법령: -";
}

function renderTaxResult(result: TaxSimulationResult): void {
  const donationAmount = getDonationAmountKrw();
  const min = Math.max(0, Math.round(result.estimated_deduction_min));
  const max = Math.max(min, Math.round(result.estimated_deduction_max));
  if (taxSourceBadgeEl) {
    taxSourceBadgeEl.textContent = result.source === "anthropic" ? "AI" : "ESTIMATE";
    taxSourceBadgeEl.className = "status-badge success";
  }
  if (taxDonationAmountEl) taxDonationAmountEl.textContent = formatKrw(donationAmount);
  if (taxDeductionRangeEl) taxDeductionRangeEl.textContent = `${formatKrw(min)} ~ ${formatKrw(max)}`;
  if (taxRealCostEl) taxRealCostEl.textContent = `${formatKrw(donationAmount - max)} ~ ${formatKrw(donationAmount - min)}`;
  if (taxExplanationEl) taxExplanationEl.textContent = result.explanation;
  if (taxLawEl) taxLawEl.textContent = `관련 법령: ${result.applicable_law}`;
}

function getTaxSimulationInput() {
  const donorType = taxDonorTypeEl?.value === "법인" ? "법인" : "개인";
  return {
    donor_type: donorType,
    annual_income_range: donorType === "개인" ? (taxIncomeRangeEl?.value ?? "5천만원_이하") : undefined,
    annual_profit_range: donorType === "법인" ? (taxProfitRangeEl?.value ?? "2억_이하") : undefined,
    donation_type: donorType === "법인" ? (taxDonationTypeEl?.value ?? "지정기부금") : undefined,
    donation_amount: getDonationAmountKrw(),
  };
}

async function calculateTaxSimulation(): Promise<void> {
  if (!taxCalcBtnEl) return;
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
    taxCalcBtnEl.disabled = false;
    taxCalcBtnEl.textContent = "절세 추정 계산";
  }
}

function renderDestinationInfo(): void {
  if (!destinationEl) return;
  destinationEl.textContent = donationDestination.address
    ? `${donationDestination.label} (${donationDestination.address.slice(0, 6)}...${donationDestination.address.slice(-4)})`
    : "-";
}

function evaluateExecuteState(): void {
  if (!executeBtnEl) return;
  const assetConfig = getSelectedAssetConfig();
  executeBtnEl.disabled = !(
    Boolean(getWalletSession()) &&
    getCartView().length > 0 &&
    getRatioTotal() === 100 &&
    getAmount() > 0 &&
    Boolean(assetConfig?.configured) &&
    Boolean(complianceCheckEl?.checked)
  );
}

function renderTxResult(record: LocalDonationRecord | null): void {
  if (!txResultEl) return;
  if (!record) {
    txResultEl.textContent = "아직 제출된 트랜잭션이 없습니다.";
    return;
  }
  const explorer = record.explorerUrl ?? (record.txHash ? getTestnetExplorerLink(record.txHash) : "-");
  txResultEl.innerHTML = record.txHash
    ? `TX: <a class="text-link" href="${explorer}" target="_blank" rel="noreferrer">${record.txHash}</a> (${record.validationStatus ?? "-"})`
    : "트랜잭션 정보 없음";
}

function normalizeRatiosEqual(): void {
  const state = getCartState();
  if (state.items.length === 0) return;
  const base = Math.floor(100 / state.items.length);
  let remain = 100 - base * state.items.length;
  saveCartState({
    items: state.items.map((item) => {
      const plus = remain > 0 ? 1 : 0;
      remain -= plus;
      return { ...item, ratioPct: base + plus };
    }),
  });
}

async function updateWalletStatusFromSession(): Promise<void> {
  const wallet = getWalletSession();
  if (!wallet) {
    setWalletBadge(null);
    setWalletBalanceText("-");
    evaluateExecuteState();
    return;
  }

  setWalletBadge(wallet.account);
  try {
    const [accountInfo, assetInfo] = await Promise.all([
      fetchAccountInfo(wallet.account),
      fetchAccountAssetBalances(wallet.account),
    ]);
    const issuedBalances = ["RLUSD", "USDC"]
      .map((asset) => {
        const config = xrplAssets.find((item) => item.asset === asset);
        if (!config?.issuer) return `${asset}: no issuer`;
        const line = assetInfo.balances.find(
          (balance) => balance.issuer === config.issuer && balance.displayCurrency === asset,
        );
        return `${asset}: ${line?.balance ?? "no TrustLine"}`;
      })
      .join(" | ");
    setWalletBalanceText(`${accountInfo.balanceXrp} XRP | ${issuedBalances}`);
  } catch {
    setWalletBalanceText("조회 실패");
  }
  evaluateExecuteState();
}

async function connectWallet(): Promise<void> {
  try {
    setTxStatus("SignIn 요청 생성 중", false);
    const payload = await createSignInPayload();
    renderQrcode(payload.qrPngUrl, payload.deepLink);
    const resolved = await waitForPayloadResolution(payload.uuid);
    if (!resolved.signed || !resolved.account) {
      setTxStatus("지갑 연결 취소", true);
      return;
    }

    setWalletSession({
      account: resolved.account,
      connectedAt: new Date().toISOString(),
      lastPayloadUuid: payload.uuid,
    });
    void upsertDbUser(resolved.account);
    clearQrcode();
    await updateWalletStatusFromSession();
  } catch (error) {
    setTxStatus(error instanceof Error ? error.message : "지갑 연결 실패", true);
  }
}

function disconnectWallet(): void {
  clearWalletSession();
  clearQrcode();
  void updateWalletStatusFromSession();
}

function toBundleAllocations() {
  return getCartView().map((item) => ({
    foundationId: item.foundation.id,
    ratioPct: item.ratioPct,
  }));
}

async function submitDonation(): Promise<void> {
  const wallet = getWalletSession();
  if (!wallet || getCartView().length === 0 || !donationDestination.address) return;
  const asset = getSelectedAsset();
  const assetConfig = getSelectedAssetConfig();
  if (!assetConfig?.configured) {
    window.alert(`${asset} testnet issuer is not configured.`);
    return;
  }
  try {
    const amount = getAmount();
    const receiptId = `receipt_${Date.now()}`;
    const evidenceHash = `evidence_${wallet.account.slice(0, 6)}_${receiptId}`;
    setTxStatus("Xaman 서명 대기", false);
    const payload = await createPaymentPayload({
      account: wallet.account,
      destination: donationDestination.address,
      asset,
      amountDrops: asset === "XRP" ? xrpToDrops(amount.toFixed(6)) : undefined,
      amountValue: asset === "XRP" ? undefined : amount.toFixed(6),
      memoType: "TRUVE_DONATION",
      memoData: JSON.stringify({
        userId: USER_ID,
        asset,
        amount,
        allocations: toBundleAllocations(),
        settlement_wallet: donationDestination.address,
        campaignId: "truve_mvp",
        receipt_id: receiptId,
        evidence_hash: evidenceHash,
        createdAt: new Date().toISOString(),
      }).slice(0, 230),
    });

    renderQrcode(payload.qrPngUrl, payload.deepLink);
    const signed = await waitForPayloadResolution(payload.uuid);
    if (!signed.signed || !signed.txHash) {
      setTxStatus("서명 취소", true);
      return;
    }

    setTxStatus("검증 대기", false);
    const validated = await waitForTxValidation(signed.txHash);
    const validationStatus = validated.validated ? "validated" : "signed";
    setTxStatus(`완료 (${validationStatus})`, false);

    const amountKrw = getDonationAmountKrw();
    const donationRecord: LocalDonationRecord = {
      id: `dnt_live_${Date.now()}`,
      userId: USER_ID,
      donatedAt: new Date().toISOString(),
      amountKrw,
      asset,
      amountAsset: amount,
      allocations: toBundleAllocations(),
      paymentStatus: "paid",
      proofStatus: "recorded",
      nftStatus: "pending",
      settlementStatus: "scheduled",
      txHash: signed.txHash,
      explorerUrl: validated.explorerUrl,
      validationStatus,
      receiptId,
      evidenceHash,
      network: "testnet",
      destinationAddress: donationDestination.address,
      foundationWallet: donationDestination.address,
      proofMintStatus: "none",
      source: "local",
    };

    upsertLocalDonation(donationRecord);
    lastDonationRecord = donationRecord;
    renderTxResult(lastDonationRecord);
    void saveDbDonation({
      xrplAccount: wallet.account,
      amountKrw,
      allocations: donationRecord.allocations,
      txHash: donationRecord.txHash,
      explorerUrl: donationRecord.explorerUrl,
    }).then((saved) => {
      if (saved && lastDonationRecord) {
        lastDonationRecord = { ...lastDonationRecord, dbId: saved.id };
        upsertLocalDonation(lastDonationRecord);
      }
    });
    await updateWalletStatusFromSession();
  } catch (error) {
    setTxStatus(error instanceof Error ? error.message : "실행 오류", true);
  }
}

function renderAll(): void {
  updateCartBadge();
  renderSelectedItems();
  renderPreview();
  renderValidation();
  renderAssetState();
  renderTaxFormState();
  resetTaxResult();
  renderDestinationInfo();
  evaluateExecuteState();
}

function bindEvents(): void {
  searchInputEl?.addEventListener("input", () => {
    if (activeTab === "foundation") renderFoundationTab();
  });
  categorySelectEl?.addEventListener("change", () => {
    if (activeTab === "foundation") renderFoundationTab();
  });
  tabFoundationEl?.addEventListener("click", () => {
    activeTab = "foundation";
    syncTabs();
    renderFoundationTab();
  });
  tabBundleEl?.addEventListener("click", () => {
    activeTab = "bundle";
    syncTabs();
    renderBundleTab();
  });
  totalAmountEl?.addEventListener("input", renderAll);
  assetSelectEl?.addEventListener("change", renderAll);
  complianceCheckEl?.addEventListener("change", evaluateExecuteState);
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
  quickAmountEls.forEach((button) => {
    button.addEventListener("click", () => {
      if (!totalAmountEl) return;
      const next = (Number(totalAmountEl.value) || 0) + Number(button.dataset.add ?? 0);
      totalAmountEl.value = String(Math.max(0.000001, Math.round(next * 1_000_000) / 1_000_000));
      renderAll();
    });
  });
  rebalanceBtnEl?.addEventListener("click", () => {
    normalizeRatiosEqual();
    renderAll();
  });
  clearBtnEl?.addEventListener("click", () => {
    clearCart();
    renderAll();
    renderFoundationTab();
  });
  connectBtnEl?.addEventListener("click", () => void connectWallet());
  disconnectBtnEl?.addEventListener("click", disconnectWallet);
  executeBtnEl?.addEventListener("click", () => void submitDonation());
}

async function init(): Promise<void> {
  const repositories = await createRepositories();
  try {
    xrplAssets = (await fetchXrplAssets()).assets;
  } catch {
    xrplAssets = xrplAssets.map((asset) => (asset.asset === "XRP" ? asset : { ...asset, configured: false }));
  }
  try {
    const destinationResponse = await fetchDonationDestination();
    donationDestination = {
      address: destinationResponse.address,
      label: destinationResponse.label,
    };
  } catch {
    donationDestination = {
      address: "",
      label: "Truve MVP settlement wallet",
    };
  }
  foundations = await repositories.foundationRepository.list();
  bundles = await repositories.foundationRepository.listBundles();
  bindEvents();
  syncTabs();
  renderFoundationTab();
  renderBundleTab();
  renderTxResult(lastDonationRecord);
  renderAll();
  await updateWalletStatusFromSession();
}

void init();
