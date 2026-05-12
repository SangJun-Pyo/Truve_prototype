import { xrpToDrops } from "xrpl";
import type { DonationBundle, Foundation } from "../api";
import { createRepositories } from "../api/provider";
import { renderBundleCard } from "../components/bundleCard";
import { categoryToKorean, renderFoundationCard } from "../components/explorerCard";
import { getCampaignDetailHref } from "../data/campaignDetails";
import { saveDbDonation, upsertDbUser, type DonationCredentialMeta } from "../services/db";
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
import { issueDonationCredential } from "../services/credentials";
import { upsertLocalDonation, type LocalDonationRecord } from "../services/donations";
import { API_BASE } from "../services/apiBase";
import { getAuthSession } from "../services/auth";
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
import { redirectMobileVisitors } from "../shared/mobileRedirect";
import { renderTopNav } from "../shared/nav";

redirectMobileVisitors();

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
const foundationsPaginationEl = document.getElementById("foundations-pagination");
const bundlesGridEl = document.getElementById("bundles-grid");
const eventsGridEl = document.getElementById("events-grid");
const tabFoundationEl = document.getElementById("tab-foundation") as HTMLButtonElement | null;
const tabBundleEl = document.getElementById("tab-bundle") as HTMLButtonElement | null;
const tabEventEl = document.getElementById("tab-event") as HTMLButtonElement | null;
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
const successModalEl = document.getElementById("success-modal");
const successModalKickerEl = document.getElementById("success-modal-kicker");
const successModalTitleEl = document.getElementById("success-modal-title");
const successModalMessageEl = document.getElementById("success-modal-message");
const successModalDetailsEl = document.getElementById("success-modal-details");
const successModalPrimaryLinkEl = document.getElementById("success-modal-primary-link") as HTMLAnchorElement | null;
const successModalCloseBtnEl = document.getElementById("success-modal-close-btn") as HTMLButtonElement | null;
const successModalOkBtnEl = document.getElementById("success-modal-ok-btn") as HTMLButtonElement | null;
const preflightModalEl = document.getElementById("preflight-modal");
const preflightRealNameEl = document.getElementById("preflight-real-name") as HTMLInputElement | null;
const preflightPurposeEl = document.getElementById("preflight-purpose") as HTMLSelectElement | null;
const preflightAssetSourceEl = document.getElementById("preflight-asset-source") as HTMLSelectElement | null;
const preflightRelatedPartyEl = document.getElementById("preflight-related-party") as HTMLSelectElement | null;
const preflightExchangeNoticeEl = document.getElementById("preflight-exchange-notice") as HTMLInputElement | null;
const preflightProofConsentEl = document.getElementById("preflight-proof-consent") as HTMLInputElement | null;
const preflightConfirmBtnEl = document.getElementById("preflight-confirm-btn") as HTMLButtonElement | null;
const preflightCloseBtnEl = document.getElementById("preflight-close-btn") as HTMLButtonElement | null;
const preflightCancelBtnEl = document.getElementById("preflight-cancel-btn") as HTMLButtonElement | null;

document.querySelector<HTMLElement>(".donation-console .tax-card")?.remove();

let foundations: Foundation[] = [];
let bundles: DonationBundle[] = [];
let activeTab: "foundation" | "bundle" | "event" = window.location.hash === "#foundations" ? "foundation" : window.location.hash === "#curations" ? "bundle" : "event";
let foundationPage = 1;
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

interface ComplianceSnapshot {
  realNameHash: string;
  purpose: string;
  assetSource: string;
  relatedParty: string;
  exchangeNoticeAccepted: boolean;
  proofConsentAccepted: boolean;
  complianceHash: string;
  capturedAt: string;
}

interface TaxSimulationResult {
  estimated_deduction_min: number;
  estimated_deduction_max: number;
  explanation: string;
  applicable_law: string;
  disclaimer: string;
  source?: "anthropic" | "fallback";
}

type DonationFlowPhase = "idle" | "payment" | "evidence" | "credential" | "complete" | "credential_error" | "error";

interface DonationProgressStep {
  key: "payment" | "evidence" | "credential";
  title: string;
  description: string;
  state: "waiting" | "active" | "done" | "error";
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

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
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

interface CampaignEvent {
  id: string;
  foundationId: string;
  title: string;
  category: Foundation["category"];
  region: string;
  status: "fundraising" | "reported";
  summary: string;
  targetKrw: number;
  raisedKrw: number;
  beneficiaries: string;
  evidence: string;
  tags: string[];
  reportLabel: string;
  visual: string;
  imageSrc: string;
  imageAlt: string;
}

const CAMPAIGN_STORAGE_KEY = "truve_selected_campaign_v1";
const GOODNEIGHBORS_FOUNDATION_ID = "fnd-2aaedf20bf";

const campaignEvents: CampaignEvent[] = [
  {
    id: "gn-chad-water-2026",
    foundationId: GOODNEIGHBORS_FOUNDATION_ID,
    title: "굿네이버스 차드 식수위생지원사업",
    category: "humanitarian",
    region: "차드 4개 CDP",
    status: "fundraising",
    summary: "차드 수도 인근 4개 CDP 지역에 식수펌프, 물탱크, 태양광 시스템과 위생교육을 연결합니다.",
    targetKrw: 58_000_000,
    raisedKrw: 21_460_000,
    beneficiaries: "총 수혜자 96,483명",
    evidence: "제안서 기반 · Campaign Memo Ready",
    tags: ["식수위생", "모금중", "굿네이버스"],
    reportLabel: "제안서",
    visual: "water",
    imageSrc: "/partners/goodneighbors-logo.jpg",
    imageAlt: "식수 펌프에서 물을 사용하는 아이들",
  },
  {
    id: "gn-ethiopia-school-2026",
    foundationId: GOODNEIGHBORS_FOUNDATION_ID,
    title: "굿네이버스 에티오피아 학교건축사업",
    category: "education",
    region: "에티오피아",
    status: "fundraising",
    summary: "교육이 중단된 지역 아동을 위해 신규 교실, 교무실, 화장실과 식수시설을 조성합니다.",
    targetKrw: 100_000_000,
    raisedKrw: 34_000_000,
    beneficiaries: "교육 접근성 회복",
    evidence: "제안서 기반 · XLS-70 Ready",
    tags: ["교육", "모금중", "학교건축"],
    reportLabel: "제안서",
    visual: "school",
    imageSrc: "/partners/goodneighbors-logo.jpg",
    imageAlt: "굿네이버스 교육 지원을 받는 교실의 아이들",
  },
  {
    id: "gn-rwanda-school-report-2025",
    foundationId: GOODNEIGHBORS_FOUNDATION_ID,
    title: "굿네이버스 르완다 학교건축사업",
    category: "education",
    region: "르완다 Ngoma CDP",
    status: "reported",
    summary: "EP Magu 학교에 교실 5개동과 학습 기자재, 빗물집수 시스템을 구축한 완료 캠페인입니다.",
    targetKrw: 95_000_000,
    raisedKrw: 95_000_000,
    beneficiaries: "직접 수혜 230명 · 전체 재학생 1,629명",
    evidence: "결과보고 공개 · Evidence Sample",
    tags: ["교육", "결과보고", "학교건축"],
    reportLabel: "결과보고서",
    visual: "school",
    imageSrc: "/partners/goodneighbors-logo.jpg",
    imageAlt: "르완다 학교 앞에 선 학생들",
  },
  {
    id: "gn-malawi-water-report-2024",
    foundationId: GOODNEIGHBORS_FOUNDATION_ID,
    title: "굿네이버스 말라위 식수위생지원사업",
    category: "humanitarian",
    region: "말라위",
    status: "reported",
    summary: "식수 접근성과 위생 환경 개선을 위한 완료형 프로젝트로 결과보고 기반의 증빙 샘플로 활용됩니다.",
    targetKrw: 7_997_100,
    raisedKrw: 7_997_100,
    beneficiaries: "식수위생 프로젝트 완료",
    evidence: "결과보고 공개 · Proof Link Ready",
    tags: ["식수위생", "결과보고", "굿네이버스"],
    reportLabel: "결과보고서",
    visual: "water",
    imageSrc: "/partners/goodneighbors-logo.jpg",
    imageAlt: "말라위 식수 펌프에서 물을 마시는 아이",
  },
];

function getSelectedCampaignId(): string | null {
  return localStorage.getItem(CAMPAIGN_STORAGE_KEY);
}

function getSelectedCampaign(): CampaignEvent | null {
  const selectedId = getSelectedCampaignId();
  return campaignEvents.find((campaign) => campaign.id === selectedId) ?? null;
}

function setSelectedCampaign(campaignId: string | null): void {
  if (!campaignId) {
    localStorage.removeItem(CAMPAIGN_STORAGE_KEY);
    return;
  }
  localStorage.setItem(CAMPAIGN_STORAGE_KEY, campaignId);
}

function getCampaignProgress(campaign: CampaignEvent): number {
  return Math.min(100, Math.round((campaign.raisedKrw / campaign.targetKrw) * 100));
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
  const totalPages = Math.max(1, Math.ceil(filtered.length / FOUNDATION_PAGE_SIZE));
  foundationPage = Math.min(foundationPage, totalPages);
  const startIndex = (foundationPage - 1) * FOUNDATION_PAGE_SIZE;
  const pageItems = filtered.slice(startIndex, startIndex + FOUNDATION_PAGE_SIZE);

  if (filtered.length === 0) {
    foundationsGridEl.innerHTML = `<div class="empty-state">조건에 맞는 재단이 없습니다.</div>`;
    renderFoundationPagination(0);
    return;
  }

  foundationsGridEl.innerHTML = pageItems
    .map((foundation) => renderFoundationCard(foundation, isInCart(foundation.id)))
    .join("");
  renderFoundationPagination(filtered.length);

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

function filterCampaignEvents(): CampaignEvent[] {
  const query = (searchInputEl?.value ?? "").trim().toLowerCase();
  const category = categorySelectEl?.value ?? "";

  return campaignEvents.filter((campaign) => {
    const searchable = `${campaign.title} ${campaign.summary} ${campaign.region} ${campaign.tags.join(" ")}`.toLowerCase();
    const queryMatch = query.length === 0 || searchable.includes(query);
    const categoryMatch = category.length === 0 || campaign.category === category;
    return queryMatch && categoryMatch;
  });
}

function renderCampaignEventCard(campaign: CampaignEvent): string {
  const progress = getCampaignProgress(campaign);
  const statusLabel = campaign.status === "fundraising" ? "모금중" : "결과보고 공개";
  const selected = getSelectedCampaignId() === campaign.id;
  const detailHref = getCampaignDetailHref(campaign.id);

  return `
    <article class="card explore-card campaign-card" data-campaign-card-id="${campaign.id}">
      <div class="campaign-visual campaign-visual-${campaign.visual}">
        <img src="${campaign.imageSrc}" alt="${campaign.imageAlt}" loading="lazy" />
        <span>${campaign.reportLabel}</span>
      </div>
      <div class="card-content">
        <div class="campaign-card-topline">
          <span class="card-tag">${statusLabel}</span>
          <span class="campaign-region">${campaign.region}</span>
        </div>
        <h3 class="card-title">${campaign.title}</h3>
        <p class="campaign-summary">${campaign.summary}</p>
        <div class="campaign-stats">
          <div>
            <span class="metric-label">목표 금액</span>
            <strong>${campaign.targetKrw.toLocaleString("ko-KR")}원</strong>
          </div>
          <div>
            <span class="metric-label">현재 모금</span>
            <strong>${campaign.raisedKrw.toLocaleString("ko-KR")}원</strong>
          </div>
        </div>
        <div class="campaign-progress" aria-label="${progress}% 달성">
          <div class="campaign-progress-head">
            <span>${progress}% 달성</span>
            <strong>${campaign.beneficiaries}</strong>
          </div>
          <div class="campaign-progress-track">
            <span style="width: ${progress}%"></span>
          </div>
        </div>
        <div class="campaign-proof-row">
          <span>${campaign.evidence}</span>
        </div>
        <div class="card-footer">
            <div class="campaign-tags">${campaign.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
            <a class="secondary-link-button" href="./${detailHref}">상세보기</a>
          <button class="add-btn add-campaign-btn ${selected ? "is-added" : ""}" data-campaign-id="${campaign.id}" data-foundation-id="${campaign.foundationId}" type="button" aria-label="캠페인 기부 담기">
            ${
              selected
                ? `<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>`
                : `<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`
            }
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderEventTab(): void {
  if (!eventsGridEl) return;
  const campaigns = filterCampaignEvents();
  if (campaigns.length === 0) {
    eventsGridEl.innerHTML = `<div class="empty-state">조건에 맞는 캠페인이 없습니다.</div>`;
    return;
  }

  eventsGridEl.innerHTML = campaigns.map(renderCampaignEventCard).join("");
  eventsGridEl.querySelectorAll<HTMLButtonElement>(".add-campaign-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const campaignId = button.dataset.campaignId;
      const foundationId = button.dataset.foundationId;
      if (!campaignId || !foundationId) return;

      setSelectedCampaign(campaignId);
      addFoundationToCart(foundationId);
      if (preflightPurposeEl) preflightPurposeEl.value = "campaign-support";
      animateToConsole(button);
      renderAll();
      renderEventTab();
      renderFoundationTab();
    });
  });
}

function syncTabs(): void {
  if (!tabFoundationEl || !tabBundleEl || !tabEventEl || !foundationsGridEl || !bundlesGridEl || !eventsGridEl) return;
  const isFoundation = activeTab === "foundation";
  const isBundle = activeTab === "bundle";
  const isEvent = activeTab === "event";
  tabFoundationEl.classList.toggle("active", isFoundation);
  tabBundleEl.classList.toggle("active", isBundle);
  tabEventEl.classList.toggle("active", isEvent);
  foundationsGridEl.classList.toggle("hidden", !isFoundation);
  foundationsPaginationEl?.classList.toggle("hidden", !isFoundation);
  bundlesGridEl.classList.toggle("hidden", !isBundle);
  eventsGridEl.classList.toggle("hidden", !isEvent);
}

function renderSelectedItems(): void {
  if (!itemsContainerEl) return;
  const items = getCartView();
  const selectedCampaign = getSelectedCampaign();
  if (items.length === 0) {
    itemsContainerEl.innerHTML = `<div class="empty-state">왼쪽에서 재단 또는 큐레이션을 선택하세요.</div>`;
    return;
  }

  const campaignNote =
    selectedCampaign && items.some((item) => item.foundation.id === selectedCampaign.foundationId)
      ? `
        <div class="selected-campaign-note">
          <span>지정 캠페인</span>
          <strong>${selectedCampaign.title}</strong>
          <button class="remove-campaign-btn" type="button">해제</button>
        </div>
      `
      : "";

  itemsContainerEl.innerHTML =
    campaignNote +
    items
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

  itemsContainerEl.querySelector<HTMLButtonElement>(".remove-campaign-btn")?.addEventListener("click", () => {
    setSelectedCampaign(null);
    renderAll();
    renderEventTab();
  });

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
    Boolean(assetConfig?.configured)
  );
}

function isPreflightComplete(): boolean {
  return Boolean(
    preflightRealNameEl?.value.trim() &&
      preflightPurposeEl?.value &&
      preflightAssetSourceEl?.value &&
      preflightRelatedPartyEl?.value &&
      preflightExchangeNoticeEl?.checked &&
      preflightProofConsentEl?.checked,
  );
}

function updatePreflightState(): void {
  if (preflightConfirmBtnEl) preflightConfirmBtnEl.disabled = !isPreflightComplete();
}

function prefillPreflightFromAuth(): void {
  const session = getAuthSession();
  if (!session || !preflightRealNameEl) return;
  if (!preflightRealNameEl.value.trim()) {
    preflightRealNameEl.value = session.name;
  }
}

function openPreflightModal(): void {
  prefillPreflightFromAuth();
  preflightModalEl?.classList.remove("hidden");
  updatePreflightState();
  preflightRealNameEl?.focus();
}

function closePreflightModal(): void {
  preflightModalEl?.classList.add("hidden");
}

function shortAddress(address: string): string {
  return address.length > 14 ? `${address.slice(0, 6)}...${address.slice(-4)}` : address;
}

const FOUNDATION_PAGE_SIZE = 9;

function getFoundationPageNumbers(totalPages: number): Array<number | "..."> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages]);
  for (let page = foundationPage - 1; page <= foundationPage + 1; page += 1) {
    if (page > 1 && page < totalPages) pages.add(page);
  }

  const sorted = Array.from(pages).sort((a, b) => a - b);
  return sorted.flatMap((page, index) => {
    const previous = sorted[index - 1];
    if (previous && page - previous > 1) return ["..." as const, page];
    return [page];
  });
}

function renderFoundationPagination(totalItems: number): void {
  if (!foundationsPaginationEl) return;
  const totalPages = Math.ceil(totalItems / FOUNDATION_PAGE_SIZE);

  if (totalPages <= 1) {
    foundationsPaginationEl.innerHTML = "";
    return;
  }

  const pageButtons = getFoundationPageNumbers(totalPages)
    .map((page) => {
      if (page === "...") {
        return `<button type="button" disabled aria-hidden="true">...</button>`;
      }

      const isActive = page === foundationPage;
      return `<button type="button" class="${isActive ? "is-active" : ""}" data-page="${page}" aria-label="${page}페이지" aria-current="${isActive ? "page" : "false"}">${page}</button>`;
    })
    .join("");

  foundationsPaginationEl.innerHTML = `
    <button type="button" data-page="${foundationPage - 1}" ${foundationPage === 1 ? "disabled" : ""} aria-label="이전 페이지">‹</button>
    ${pageButtons}
    <button type="button" data-page="${foundationPage + 1}" ${foundationPage === totalPages ? "disabled" : ""} aria-label="다음 페이지">›</button>
  `;
}

function resetFoundationPageAndRender(): void {
  foundationPage = 1;
  renderFoundationTab();
}

function getDonationProgressSteps(phase: DonationFlowPhase): DonationProgressStep[] {
  const order: DonationProgressStep["key"][] = ["payment", "evidence", "credential"];
  const activeIndex = phase === "idle" ? -1 : phase === "payment" ? 0 : phase === "evidence" ? 1 : 2;
  const base = {
    payment: {
      title: "결제 완료",
      description: "Xaman에서 Payment가 서명되고 XRPL Testnet에 제출됩니다.",
    },
    evidence: {
      title: "증빙 생성 완료",
      description: "Payment 해시와 기부 메모를 기반으로 Evidence Package를 준비합니다.",
    },
    credential: {
      title: "Credential 승인",
      description: "기부자 지갑에서 XLS-70 Donation Credential을 승인합니다.",
    },
  };

  return order.map((key, index) => {
    let state: DonationProgressStep["state"] = "waiting";
    if (phase === "complete") state = "done";
    else if (phase === "credential_error" && key === "credential") state = "error";
    else if (phase === "error" && index === Math.max(activeIndex, 0)) state = "error";
    else if (index < activeIndex) state = "done";
    else if (index === activeIndex) state = "active";
    return { key, state, ...base[key] };
  });
}

function renderDonationProgress(phase: DonationFlowPhase): string {
  return `
    <div class="donation-progress">
      ${getDonationProgressSteps(phase)
        .map(
          (step) => `
            <div class="donation-progress-step ${step.state}">
              <span>${step.state === "done" ? "✓" : step.state === "error" ? "!" : ""}</span>
              <div>
                <strong>${step.title}</strong>
                <p>${step.description}</p>
              </div>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderDonationFlowState(phase: DonationFlowPhase, message: string): void {
  if (!txResultEl) return;
  txResultEl.innerHTML = `
    ${renderDonationProgress(phase)}
    <p class="donation-progress-message">${message}</p>
  `;
}

function closeSuccessModal(): void {
  successModalEl?.classList.add("hidden");
}

function openSuccessModal(input: {
  kicker: string;
  title: string;
  message: string;
  details?: Array<[string, string]>;
  link?: { label: string; href: string };
}): void {
  if (!successModalEl) return;
  if (successModalKickerEl) successModalKickerEl.textContent = input.kicker;
  if (successModalTitleEl) successModalTitleEl.textContent = input.title;
  if (successModalMessageEl) successModalMessageEl.textContent = input.message;
  if (successModalDetailsEl) {
    successModalDetailsEl.replaceChildren(
      ...(input.details ?? []).map(([label, value]) => {
        const row = document.createElement("div");
        const labelEl = document.createElement("span");
        const valueEl = document.createElement("strong");
        row.className = "success-modal-row";
        labelEl.textContent = label;
        valueEl.textContent = value;
        row.append(labelEl, valueEl);
        return row;
      }),
    );
    successModalDetailsEl.classList.toggle("hidden", !input.details?.length);
  }
  if (successModalPrimaryLinkEl) {
    if (input.link) {
      successModalPrimaryLinkEl.href = input.link.href;
      successModalPrimaryLinkEl.textContent = input.link.label;
      successModalPrimaryLinkEl.classList.remove("hidden");
    } else {
      successModalPrimaryLinkEl.removeAttribute("href");
      successModalPrimaryLinkEl.classList.add("hidden");
    }
  }
  successModalEl.classList.remove("hidden");
}

async function collectComplianceSnapshot(receiptId: string, walletAccount: string): Promise<ComplianceSnapshot> {
  const capturedAt = new Date().toISOString();
  const realNameHash = await sha256Hex(`${walletAccount}:${receiptId}:${preflightRealNameEl?.value.trim() ?? ""}`);
  const snapshot = {
    realNameHash,
    purpose: preflightPurposeEl?.value ?? "",
    assetSource: preflightAssetSourceEl?.value ?? "",
    relatedParty: preflightRelatedPartyEl?.value ?? "",
    exchangeNoticeAccepted: Boolean(preflightExchangeNoticeEl?.checked),
    proofConsentAccepted: Boolean(preflightProofConsentEl?.checked),
    capturedAt,
  };
  const complianceHash = await sha256Hex(JSON.stringify(snapshot));
  return { ...snapshot, complianceHash };
}

function renderTxResult(record: LocalDonationRecord | null): void {
  if (!txResultEl) return;
  if (!record) {
    renderDonationFlowState("idle", "기부를 실행하면 결제, 증빙, Credential 승인 단계가 여기에 표시됩니다.");
    return;
  }
  const explorer = record.explorerUrl ?? (record.txHash ? getTestnetExplorerLink(record.txHash) : "-");
  if (!record.txHash) {
    renderDonationFlowState("error", "트랜잭션 정보를 찾을 수 없습니다.");
    return;
  }
  const credentialLink =
    record.credentialAcceptExplorerUrl ?? (record.credentialAcceptTxHash ? getTestnetExplorerLink(record.credentialAcceptTxHash) : "");
  const phase = record.credentialStatus === "failed" ? "credential_error" : record.credentialStatus === "accepted" ? "complete" : "credential";
  const credentialText =
    record.credentialStatus === "accepted"
      ? "Credential 승인 완료"
      : record.credentialStatus === "accept_pending"
        ? "Credential 승인 대기"
        : record.credentialStatus === "failed"
          ? "Credential 확인 필요"
          : "Credential 준비 중";
  txResultEl.innerHTML = `
    ${renderDonationProgress(phase)}
    <div class="donation-progress-detail">
      <div><span>Payment</span><a class="text-link" href="${explorer}" target="_blank" rel="noreferrer">${shortAddress(record.txHash)}</a></div>
      <div><span>Evidence</span><strong>${record.evidenceHash ? "생성 완료" : "생성 대기"}</strong></div>
      <div><span>Credential</span><strong>${credentialText}</strong>${
        credentialLink ? ` <a class="text-link" href="${credentialLink}" target="_blank" rel="noreferrer">TX 보기</a>` : ""
      }</div>
    </div>
  `;
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
    openSuccessModal({
      kicker: "Wallet Connected",
      title: "Xaman 지갑 연결 완료",
      message: "이제 선택한 재단으로 테스트넷 기부를 진행할 수 있습니다.",
      details: [["연결 계정", shortAddress(resolved.account)]],
    });
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

function getCampaignMemoId(): string {
  return getSelectedCampaign()?.id ?? "truve_mvp";
}

async function submitDonation(): Promise<void> {
  const wallet = getWalletSession();
  if (!wallet || getCartView().length === 0 || !donationDestination.address) return;
  if (!isPreflightComplete()) {
    openPreflightModal();
    return;
  }
  const asset = getSelectedAsset();
  const assetConfig = getSelectedAssetConfig();
  if (!assetConfig?.configured) {
    window.alert(`${asset} testnet issuer is not configured.`);
    return;
  }
  try {
    const amount = getAmount();
    const receiptId = `receipt_${Date.now()}`;
    const campaignId = getCampaignMemoId();
    const compliance = await collectComplianceSnapshot(receiptId, wallet.account);
    const evidenceHash = await sha256Hex(
      JSON.stringify({
        receiptId,
        wallet: wallet.account,
        destination: donationDestination.address,
        asset,
        amount,
        allocations: toBundleAllocations(),
        campaignId,
        complianceHash: compliance.complianceHash,
      }),
    );
    setTxStatus("Xaman에서 결제 서명을 기다리는 중", false);
    renderDonationFlowState("payment", "Xaman 앱에서 Payment 요청을 확인하고 서명해 주세요.");
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
        campaignId,
        receipt_id: receiptId,
        evidence_hash: evidenceHash,
        compliance_hash: compliance.complianceHash,
        createdAt: new Date().toISOString(),
      }).slice(0, 900),
    });

    renderQrcode(payload.qrPngUrl, payload.deepLink);
    const signed = await waitForPayloadResolution(payload.uuid);
    const paymentSender = signed.account ?? wallet.account;
    if (!signed.signed || !signed.txHash) {
      setTxStatus("결제 서명이 취소되었습니다", true);
      renderDonationFlowState("error", "기부 결제가 완료되지 않았습니다. 다시 실행하면 새 결제 요청이 생성됩니다.");
      return;
    }

    setTxStatus("Payment 검증 중", false);
    renderDonationFlowState("payment", "결제 서명은 완료되었습니다. XRPL Testnet에서 Payment 확정을 확인하고 있습니다.");
    if (paymentSender !== wallet.account) {
      setWalletSession({
        account: paymentSender,
        connectedAt: wallet.connectedAt,
        lastPayloadUuid: signed.uuid ?? payload.uuid,
      });
      void upsertDbUser(paymentSender);
    }
    const validated = await waitForTxValidation(signed.txHash);
    const validationStatus = validated.validated ? "validated" : "signed";
    setTxStatus("증빙 생성 완료", false);
    renderDonationFlowState("evidence", "Payment가 확인되어 Evidence Package가 생성되었습니다.");

    let credentialMeta: DonationCredentialMeta | null = null;
    try {
      setTxStatus("Credential 발급 준비 중", false);
      renderDonationFlowState("credential", "Evidence를 기반으로 XLS-70 Donation Credential 승인 요청을 준비합니다.");
      const issuedCredential = await issueDonationCredential({
        subject: paymentSender,
        receiptId,
        evidenceHash,
        txHash: signed.txHash,
      });
      renderQrcode(issuedCredential.accept.qrPngUrl, issuedCredential.accept.deepLink);
      setTxStatus("Credential 승인 대기", false);
      renderDonationFlowState("credential", "Xaman에서 Credential 승인 요청을 확인해 주세요.");
      const accepted = await waitForPayloadResolution(issuedCredential.accept.uuid);
      credentialMeta = {
        issuer: issuedCredential.issuer,
        credentialType: issuedCredential.credentialType,
        uri: issuedCredential.uri,
        issueTxHash: issuedCredential.issueTxHash,
        issueExplorerUrl: issuedCredential.issueExplorerUrl,
        acceptTxHash: accepted.txHash ?? null,
        acceptExplorerUrl: accepted.txHash ? getTestnetExplorerLink(accepted.txHash) : null,
        status: accepted.signed && accepted.txHash ? "accepted" : "accept_pending",
      };
      setTxStatus(
        credentialMeta.status === "accepted" ? "Credential 승인 완료" : "Credential 승인 대기",
        false,
      );
      renderDonationFlowState(
        credentialMeta.status === "accepted" ? "complete" : "credential",
        credentialMeta.status === "accepted"
          ? "결제, 증빙 생성, Credential 승인이 모두 완료되었습니다."
          : "Credential 승인 요청이 생성되었습니다. 승인 완료 후 기부현황에서 다시 확인할 수 있습니다.",
      );
    } catch (credentialError) {
      const credentialErrorMessage = credentialError instanceof Error ? credentialError.message : "unknown";
      credentialMeta = { status: "failed", errorMessage: credentialErrorMessage };
      setTxStatus(
        `증빙 생성 완료 · Credential 확인 필요`,
        true,
      );
      renderDonationFlowState(
        "credential_error",
        `Payment와 Evidence는 완료되었습니다. Credential은 다시 확인이 필요합니다. (${credentialErrorMessage})`,
      );
    }

    const amountKrw = getDonationAmountKrw();
    const donationRecord: LocalDonationRecord = {
      id: `dnt_live_${Date.now()}`,
      userId: USER_ID,
      xrplAccount: paymentSender,
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
      complianceHash: compliance.complianceHash,
      compliancePurpose: compliance.purpose,
      assetSource: compliance.assetSource,
      relatedParty: compliance.relatedParty,
      network: "testnet",
      destinationAddress: donationDestination.address,
      foundationWallet: donationDestination.address,
      proofMintStatus:
        credentialMeta?.status === "accepted"
          ? "credential_accepted"
          : credentialMeta?.status === "accept_pending"
            ? "credential_accept_pending"
            : credentialMeta?.status === "failed"
              ? "credential_failed"
              : "evidence_ready",
      credentialIssuer: credentialMeta?.issuer,
      credentialType: credentialMeta?.credentialType,
      credentialUri: credentialMeta?.uri,
      credentialIssueTxHash: credentialMeta?.issueTxHash ?? undefined,
      credentialIssueExplorerUrl: credentialMeta?.issueExplorerUrl ?? undefined,
      credentialAcceptTxHash: credentialMeta?.acceptTxHash ?? undefined,
      credentialAcceptExplorerUrl: credentialMeta?.acceptExplorerUrl ?? undefined,
      credentialStatus: credentialMeta?.status,
      source: "local",
    };

    upsertLocalDonation(donationRecord);
    lastDonationRecord = donationRecord;
    renderTxResult(lastDonationRecord);
    void saveDbDonation({
      xrplAccount: paymentSender,
      amountKrw,
      allocations: donationRecord.allocations,
      txHash: donationRecord.txHash,
      explorerUrl: donationRecord.explorerUrl,
      receiptId,
      evidenceHash,
      complianceHash: compliance.complianceHash,
      asset,
      amountAsset: amount,
      credential: credentialMeta ?? undefined,
    }).then((saved) => {
      if (saved && lastDonationRecord) {
        lastDonationRecord = { ...lastDonationRecord, dbId: saved.id };
        upsertLocalDonation(lastDonationRecord);
      }
    });
    openSuccessModal({
      kicker: "Payment Complete",
      title: "기부 결제가 완료되었습니다",
      message:
        credentialMeta?.status === "failed"
          ? "결제와 증빙 생성은 완료되었습니다. Credential은 기부현황에서 다시 확인해 주세요."
          : credentialMeta?.status === "accepted"
            ? "결제, 증빙 생성, Credential 승인이 모두 완료되었습니다."
            : "결제와 증빙 생성이 완료되었습니다. Credential 승인 상태는 기부현황에서 계속 확인할 수 있습니다.",
      details: [
        ["결제", validationStatus === "validated" ? "완료" : "서명 완료"],
        ["결제 계정", shortAddress(paymentSender)],
        ["Tx Hash", signed.txHash],
        ["증빙", "Evidence 생성 완료"],
        ["Credential", credentialMeta?.status === "accepted" ? "승인 완료" : credentialMeta?.status === "failed" ? "확인 필요" : "승인 대기"],
        ...(credentialMeta?.errorMessage ? [["Credential 사유", credentialMeta.errorMessage] as [string, string]] : []),
      ],
      link: {
        label: "Payment 확인",
        href: validated.explorerUrl ?? getTestnetExplorerLink(signed.txHash),
      },
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
    if (activeTab === "foundation") resetFoundationPageAndRender();
    if (activeTab === "event") renderEventTab();
  });
  categorySelectEl?.addEventListener("change", () => {
    if (activeTab === "foundation") resetFoundationPageAndRender();
    if (activeTab === "event") renderEventTab();
  });
  foundationsPaginationEl?.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-page]");
    if (!button || button.disabled) return;
    const nextPage = Number(button.dataset.page);
    const totalPages = Math.max(1, Math.ceil(filterFoundations().length / FOUNDATION_PAGE_SIZE));
    if (!Number.isFinite(nextPage) || nextPage < 1 || nextPage > totalPages) return;

    foundationPage = nextPage;
    renderFoundationTab();
    foundationsGridEl?.scrollIntoView({ behavior: "smooth", block: "start" });
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
  tabEventEl?.addEventListener("click", () => {
    activeTab = "event";
    syncTabs();
    renderEventTab();
  });
  totalAmountEl?.addEventListener("input", renderAll);
  assetSelectEl?.addEventListener("change", renderAll);
  complianceCheckEl?.addEventListener("change", evaluateExecuteState);
  [
    preflightRealNameEl,
    preflightPurposeEl,
    preflightAssetSourceEl,
    preflightRelatedPartyEl,
    preflightExchangeNoticeEl,
    preflightProofConsentEl,
  ].forEach((element) => {
    element?.addEventListener("input", updatePreflightState);
    element?.addEventListener("change", updatePreflightState);
  });
  preflightCloseBtnEl?.addEventListener("click", closePreflightModal);
  preflightCancelBtnEl?.addEventListener("click", closePreflightModal);
  preflightModalEl?.addEventListener("click", (event) => {
    if (event.target === preflightModalEl) closePreflightModal();
  });
  successModalCloseBtnEl?.addEventListener("click", closeSuccessModal);
  successModalOkBtnEl?.addEventListener("click", closeSuccessModal);
  successModalEl?.addEventListener("click", (event) => {
    if (event.target === successModalEl) closeSuccessModal();
  });
  preflightConfirmBtnEl?.addEventListener("click", () => {
    closePreflightModal();
    void submitDonation();
  });
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
    setSelectedCampaign(null);
    renderAll();
    renderFoundationTab();
    renderEventTab();
  });
  connectBtnEl?.addEventListener("click", () => void connectWallet());
  disconnectBtnEl?.addEventListener("click", disconnectWallet);
  executeBtnEl?.addEventListener("click", openPreflightModal);
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
  renderEventTab();
  renderTxResult(lastDonationRecord);
  renderAll();
  await updateWalletStatusFromSession();
}

void init();
