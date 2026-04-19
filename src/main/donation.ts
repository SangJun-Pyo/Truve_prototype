import { xrpToDrops } from "xrpl";
import type { BundleAllocation, DonationBundle, Foundation } from "../api";
import { createRepositories } from "../api/provider";
import { upsertLocalDonation, type LocalDonationRecord } from "../services/donations";
import { requestProofNftMintScaffold } from "../services/proofNft";
import { getWalletSession, setWalletSession, clearWalletSession } from "../services/wallet";
import {
  createPaymentPayload,
  createSignInPayload,
  waitForPayloadResolution,
} from "../services/xaman";
import { getTestnetExplorerLink, waitForTxValidation } from "../services/xrpl";
import { renderTopNav } from "../shared/nav";

type CartEntry = {
  foundationId: string;
  foundationName: string;
};

const MOCK_KRW_PER_XRP = 1000;
const USER_ID = "usr_demo_001";

const navRoot = document.getElementById("top-nav");
if (navRoot) {
  navRoot.innerHTML = renderTopNav("donation");
}

const foundationListEl = document.getElementById("foundation-list");
const bundleListEl = document.getElementById("bundle-list");
const cartItemsEl = document.getElementById("cart-items");
const allocationSummaryEl = document.getElementById("allocation-summary");
const destinationEl = document.getElementById("donation-destination");
const txStatusEl = document.getElementById("donation-tx-status");
const txResultEl = document.getElementById("donation-tx-result");
const previewEl = document.getElementById("preview");
const amountInputEl = document.getElementById("donation-amount") as HTMLInputElement | null;
const rebalanceBtnEl = document.getElementById("rebalance-btn");
const clearBtnEl = document.getElementById("clear-btn");
const submitBtnEl = document.getElementById("submit-btn");
const proofNftBtnEl = document.getElementById("proof-nft-btn") as HTMLButtonElement | null;
const proofNftStatusEl = document.getElementById("proof-nft-status");

const xamanConnectBtnEl = document.getElementById("xaman-connect-btn");
const xamanDisconnectBtnEl = document.getElementById("xaman-disconnect-btn");
const walletStatusEl = document.getElementById("wallet-status");
const xamanQrWrapEl = document.getElementById("xaman-qr-wrap");

let foundations: Foundation[] = [];
let bundles: DonationBundle[] = [];
let cart: CartEntry[] = [];
let allocationMap: Record<string, number> = {};
let previewRequestSeq = 0;
let lastDonationRecord: LocalDonationRecord | null = null;

function formatKrw(value: number): string {
  return `${new Intl.NumberFormat("ko-KR").format(value)}원`;
}

function setWalletStatus(message: string, isError = false): void {
  if (!walletStatusEl) {
    return;
  }
  walletStatusEl.className = isError ? "notice error mt-12" : "notice mt-12";
  walletStatusEl.textContent = message;
}

function setTxStatus(message: string, isError = false): void {
  if (!txStatusEl) {
    return;
  }
  txStatusEl.className = isError ? "notice error mt-12" : "notice mt-12";
  txStatusEl.textContent = message;
}

function renderXamanQrSection(qrPngUrl: string, openUrl: string): void {
  if (!xamanQrWrapEl) {
    return;
  }
  xamanQrWrapEl.innerHTML = `
    <img src="${qrPngUrl}" alt="Xaman QR" />
    <a class="btn btn-primary" href="${openUrl}" target="_blank" rel="noreferrer">Xaman 앱으로 열기</a>
  `;
}

function clearXamanQrSection(): void {
  if (!xamanQrWrapEl) {
    return;
  }
  xamanQrWrapEl.innerHTML = "";
}

function categoryToKorean(category: Foundation["category"]): string {
  const map: Record<Foundation["category"], string> = {
    climate: "환경",
    education: "교육",
    health: "의료",
    animal: "동물",
    humanitarian: "긴급구호",
  };
  return map[category];
}

function getCurrentAmount(): number {
  const amount = Number(amountInputEl?.value ?? 0);
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

function getAllocationTotal(): number {
  return cart.reduce((sum, item) => sum + (allocationMap[item.foundationId] ?? 0), 0);
}

function getRepresentativeFoundation(): Foundation | null {
  const first = cart[0];
  if (!first) {
    return null;
  }
  return foundations.find((item) => item.id === first.foundationId) ?? null;
}

function renderDestinationInfo(): void {
  if (!destinationEl) {
    return;
  }

  const representative = getRepresentativeFoundation();
  if (!representative) {
    destinationEl.textContent = "대표 전송 지갑이 아직 선택되지 않았습니다.";
    return;
  }

  destinationEl.textContent = `대표 전송 지갑: ${representative.name} (${representative.walletAddress})`;
}

function setEqualAllocation(): void {
  if (cart.length === 0) {
    allocationMap = {};
    return;
  }

  const base = Math.floor(100 / cart.length);
  let remain = 100 - base * cart.length;
  const next: Record<string, number> = {};

  cart.forEach((item) => {
    const extra = remain > 0 ? 1 : 0;
    next[item.foundationId] = base + extra;
    remain -= extra;
  });

  allocationMap = next;
}

function addToCart(foundationId: string): void {
  if (cart.some((entry) => entry.foundationId === foundationId)) {
    return;
  }

  const foundation = foundations.find((item) => item.id === foundationId);
  if (!foundation) {
    return;
  }

  cart.push({
    foundationId: foundation.id,
    foundationName: foundation.name,
  });
  setEqualAllocation();
  renderAll();
}

function applyBundle(bundleId: string): void {
  const bundle = bundles.find((item) => item.id === bundleId);
  if (!bundle) {
    return;
  }

  cart = bundle.allocations
    .map((allocation) => {
      const foundation = foundations.find((item) => item.id === allocation.foundationId);
      if (!foundation) {
        return null;
      }
      return {
        foundationId: foundation.id,
        foundationName: foundation.name,
      };
    })
    .filter((item): item is CartEntry => item !== null);

  allocationMap = {};
  bundle.allocations.forEach((allocation) => {
    allocationMap[allocation.foundationId] = allocation.ratioPct;
  });
  renderAll();
}

function removeFromCart(foundationId: string): void {
  cart = cart.filter((item) => item.foundationId !== foundationId);
  delete allocationMap[foundationId];
  if (cart.length > 0) {
    setEqualAllocation();
  }
  renderAll();
}

function renderFoundationList(): void {
  if (!foundationListEl) {
    return;
  }

  foundationListEl.innerHTML = foundations
    .map((foundation) => {
      return `
        <article class="foundation-card">
          <div class="foundation-top">
            <div>
              <h4 class="foundation-name">${foundation.name}</h4>
              <div class="trust">${categoryToKorean(foundation.category)} · ${foundation.region}</div>
            </div>
            <span class="badge">${foundation.trustMetrics.verificationLevel.toUpperCase()}</span>
          </div>
          <p class="section-desc">${foundation.description}</p>
          <div class="trust mt-12">수취 지갑: ${foundation.walletAddress}</div>
          <div class="row-between mt-12">
            <span class="trust">증빙 커버리지 ${foundation.trustMetrics.proofCoveragePct}%</span>
            <button class="btn btn-secondary" data-add-id="${foundation.id}" type="button">담기</button>
          </div>
        </article>
      `;
    })
    .join("");

  foundationListEl.querySelectorAll<HTMLButtonElement>("[data-add-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.addId;
      if (id) {
        addToCart(id);
      }
    });
  });
}

function renderBundleList(): void {
  if (!bundleListEl) {
    return;
  }

  bundleListEl.innerHTML = bundles
    .map((bundle) => {
      const chips = bundle.allocations
        .map((allocation) => {
          const foundation = foundations.find((item) => item.id === allocation.foundationId);
          return `<span class="badge">${foundation?.name ?? allocation.foundationId} ${allocation.ratioPct}%</span>`;
        })
        .join(" ");

      return `
        <article class="bundle-card">
          <h4 class="foundation-name">${bundle.name}</h4>
          <p class="section-desc">${bundle.summary}</p>
          <div class="stack gap-10 mt-12">${chips}</div>
          <button class="btn btn-primary mt-12" data-bundle-id="${bundle.id}" type="button">번들 적용</button>
        </article>
      `;
    })
    .join("");

  bundleListEl.querySelectorAll<HTMLButtonElement>("[data-bundle-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.bundleId;
      if (id) {
        applyBundle(id);
      }
    });
  });
}

function renderCart(): void {
  if (!cartItemsEl) {
    return;
  }

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `<div class="notice">아직 담긴 재단이 없습니다. 왼쪽에서 재단이나 번들을 선택해 주세요.</div>`;
    return;
  }

  cartItemsEl.innerHTML = cart
    .map((entry) => {
      const ratio = allocationMap[entry.foundationId] ?? 0;
      return `
        <article class="cart-item">
          <div class="row-between">
            <strong>${entry.foundationName}</strong>
            <button class="btn btn-ghost" data-remove-id="${entry.foundationId}" type="button">삭제</button>
          </div>
          <label class="field mt-12">
            <span>비율: <strong>${ratio}%</strong></span>
            <input type="range" min="0" max="100" value="${ratio}" data-ratio-id="${entry.foundationId}" />
          </label>
        </article>
      `;
    })
    .join("");

  cartItemsEl.querySelectorAll<HTMLInputElement>("[data-ratio-id]").forEach((input) => {
    input.addEventListener("input", () => {
      const id = input.dataset.ratioId;
      if (!id) {
        return;
      }
      allocationMap[id] = Number(input.value);
      renderSummary();
      void renderPreview();
      renderDestinationInfo();
    });
  });

  cartItemsEl.querySelectorAll<HTMLButtonElement>("[data-remove-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.removeId;
      if (id) {
        removeFromCart(id);
      }
    });
  });
}

function renderSummary(): void {
  if (!allocationSummaryEl) {
    return;
  }

  const total = getAllocationTotal();
  const isValid = total === 100;
  allocationSummaryEl.className = isValid ? "notice" : "notice error";
  allocationSummaryEl.textContent = isValid
    ? `비율 합계 ${total}% · 기부 가능`
    : `비율 합계 ${total}% · 100%로 맞춰야 기부할 수 있습니다.`;
}

async function renderPreview(): Promise<void> {
  if (!previewEl) {
    return;
  }

  const amount = getCurrentAmount();
  if (cart.length === 0) {
    previewEl.textContent = "재단을 담으면 예상 분배 내역이 표시됩니다.";
    return;
  }
  if (amount <= 0) {
    previewEl.textContent = "기부 금액을 입력해 주세요.";
    return;
  }
  if (getAllocationTotal() !== 100) {
    previewEl.textContent = "비율 합계가 100%일 때 예상 분배를 계산합니다.";
    return;
  }

  const seq = ++previewRequestSeq;
  const repositories = await createRepositories();
  const preview = await repositories.donationRepository.previewDonation({
    userId: USER_ID,
    amountKrw: amount,
    allocations: cart.map((entry) => ({
      foundationId: entry.foundationId,
      ratioPct: allocationMap[entry.foundationId] ?? 0,
    })),
  });
  if (seq !== previewRequestSeq) {
    return;
  }

  const lines = preview.allocations
    .map((allocation) => {
      const foundation = foundations.find((item) => item.id === allocation.foundationId);
      return `<li>${foundation?.name ?? allocation.foundationId}: ${formatKrw(allocation.amountKrw)} (${allocation.ratioPct}%)</li>`;
    })
    .join("");

  previewEl.innerHTML = `
    <div class="row-between"><strong>총 기부금</strong><strong>${formatKrw(preview.amountKrw)}</strong></div>
    <div class="row-between"><span>예상 결제 수수료(목업)</span><strong>${formatKrw(preview.estimatedFeeKrw)}</strong></div>
    <div class="trust mt-12">환산 기준(목업): 1 XRP = ${MOCK_KRW_PER_XRP.toLocaleString("ko-KR")}원</div>
    <ul class="mt-12">${lines}</ul>
  `;
}

function updateWalletStatusFromSession(): void {
  const session = getWalletSession();
  if (!session) {
    setWalletStatus("지갑이 아직 연결되지 않았습니다.");
    return;
  }
  setWalletStatus(`연결됨: ${session.account}`);
}

function renderTxResult(record: LocalDonationRecord | null): void {
  if (!txResultEl) {
    return;
  }
  if (!record) {
    txResultEl.textContent = "아직 제출된 트랜잭션이 없습니다.";
    return;
  }
  const explorer = record.explorerUrl ?? (record.txHash ? getTestnetExplorerLink(record.txHash) : "-");
  txResultEl.innerHTML = `
    <div class="row-between"><span>기부 ID</span><strong>${record.id}</strong></div>
    <div class="row-between"><span>상태</span><strong>${record.validationStatus ?? "-"}</strong></div>
    <div class="row-between"><span>tx hash</span><strong>${record.txHash ?? "-"}</strong></div>
    ${
      record.txHash
        ? `<div class="mt-12"><a class="text-link" href="${explorer}" target="_blank" rel="noreferrer">Testnet Explorer에서 보기</a></div>`
        : ""
    }
  `;
}

async function connectXaman(): Promise<void> {
  try {
    setWalletStatus("Xaman SignIn QR 생성 중...");
    const payload = await createSignInPayload();
    renderXamanQrSection(payload.qrPngUrl, payload.deepLink);
    const resolved = await waitForPayloadResolution(payload.uuid);

    if (!resolved.signed || !resolved.account) {
      setWalletStatus("지갑 연결이 거절되었습니다.", true);
      return;
    }

    setWalletSession({
      account: resolved.account,
      connectedAt: new Date().toISOString(),
      lastPayloadUuid: payload.uuid,
    });
    clearXamanQrSection();
    updateWalletStatusFromSession();
  } catch (error) {
    const message = error instanceof Error ? error.message : "지갑 연결 중 오류가 발생했습니다.";
    setWalletStatus(message, true);
  }
}

function disconnectXaman(): void {
  clearWalletSession();
  clearXamanQrSection();
  updateWalletStatusFromSession();
}

async function submitDonation(): Promise<void> {
  const amountKrw = getCurrentAmount();
  if (cart.length === 0) {
    window.alert("먼저 재단을 담아주세요.");
    return;
  }
  if (amountKrw <= 0) {
    window.alert("기부 금액을 입력해 주세요.");
    return;
  }
  if (getAllocationTotal() !== 100) {
    window.alert("비율 합계를 100%로 맞춰주세요.");
    return;
  }

  const wallet = getWalletSession();
  if (!wallet) {
    window.alert("먼저 Xaman 지갑을 연결해 주세요.");
    return;
  }

  const destination = getRepresentativeFoundation();
  if (!destination) {
    window.alert("대표 수취 재단을 찾을 수 없습니다.");
    return;
  }

  const allocations: BundleAllocation[] = cart.map((entry) => ({
    foundationId: entry.foundationId,
    ratioPct: allocationMap[entry.foundationId] ?? 0,
  }));

  const amountXrp = (amountKrw / MOCK_KRW_PER_XRP).toFixed(6);
  const amountDrops = xrpToDrops(amountXrp);

  try {
    setTxStatus("상태: pending (Xaman 서명 대기 중)");
    const payload = await createPaymentPayload({
      account: wallet.account,
      destination: destination.walletAddress,
      amountDrops,
      memoType: "TRUVE_DONATION",
      memoData: JSON.stringify({
        app: "TRUVE",
        userId: USER_ID,
        amountKrw,
        allocations,
        createdAt: new Date().toISOString(),
      }).slice(0, 230),
    });

    renderXamanQrSection(payload.qrPngUrl, payload.deepLink);
    const resolved = await waitForPayloadResolution(payload.uuid);
    if (!resolved.signed || !resolved.txHash) {
      setTxStatus("상태: failed (서명이 거절되었습니다.)", true);
      return;
    }

    setTxStatus("상태: signed (검증 대기 중)");
    const validated = await waitForTxValidation(resolved.txHash);
    const validationStatus = validated.validated ? "validated" : "signed";
    setTxStatus(`상태: ${validationStatus}`);

    const donationRecord: LocalDonationRecord = {
      id: `dnt_live_${Date.now()}`,
      userId: USER_ID,
      donatedAt: new Date().toISOString(),
      amountKrw,
      allocations,
      paymentStatus: "paid",
      proofStatus: "recorded",
      nftStatus: "pending",
      settlementStatus: "scheduled",
      txHash: resolved.txHash,
      explorerUrl: validated.explorerUrl,
      validationStatus,
      network: "testnet",
      destinationAddress: destination.walletAddress,
      foundationWallet: destination.walletAddress,
      proofMintStatus: "none",
      source: "local",
    };

    upsertLocalDonation(donationRecord);
    lastDonationRecord = donationRecord;
    renderTxResult(lastDonationRecord);

    if (proofNftBtnEl) {
      proofNftBtnEl.disabled = false;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "기부 트랜잭션 처리 중 오류가 발생했습니다.";
    setTxStatus(`상태: failed (${message})`, true);
  }
}

async function requestProofNftScaffold(): Promise<void> {
  if (!proofNftStatusEl) {
    return;
  }
  const wallet = getWalletSession();
  if (!wallet) {
    proofNftStatusEl.className = "notice error mt-12";
    proofNftStatusEl.textContent = "지갑 연결이 필요합니다.";
    return;
  }
  if (!lastDonationRecord?.txHash) {
    proofNftStatusEl.className = "notice error mt-12";
    proofNftStatusEl.textContent = "먼저 기부 트랜잭션을 완료해 주세요.";
    return;
  }

  try {
    proofNftStatusEl.className = "notice mt-12";
    proofNftStatusEl.textContent = "Proof NFT 민팅 요청 트랜잭션 생성 중...";

    const result = await requestProofNftMintScaffold({
      account: wallet.account,
      donationId: lastDonationRecord.id,
      donationTxHash: lastDonationRecord.txHash,
    });

    const patch = {
      proofMintStatus: result.validated ? ("recorded" as const) : ("requested" as const),
      proofMintTxHash: result.txHash,
      nftStatus: result.validated ? ("minted" as const) : ("pending" as const),
      proofNftId: result.validated ? `proof_req_${Date.now()}` : undefined,
    };

    const nextRecord: LocalDonationRecord = {
      ...lastDonationRecord,
      ...patch,
    };

    upsertLocalDonation(nextRecord);
    lastDonationRecord = nextRecord;
    renderTxResult(nextRecord);

    if (result.txHash) {
      proofNftStatusEl.className = "notice mt-12";
      proofNftStatusEl.innerHTML = `Proof NFT 요청 기록 완료: <a class="text-link" href="${result.explorerUrl}" target="_blank" rel="noreferrer">${result.txHash}</a>`;
    } else {
      proofNftStatusEl.className = "notice error mt-12";
      proofNftStatusEl.textContent = "Proof NFT 요청이 거절되었거나 실패했습니다.";
    }
  } catch (error) {
    proofNftStatusEl.className = "notice error mt-12";
    proofNftStatusEl.textContent =
      error instanceof Error ? error.message : "Proof NFT 요청 중 오류가 발생했습니다.";
  }
}

function bindEvents(): void {
  amountInputEl?.addEventListener("input", () => {
    void renderPreview();
  });

  rebalanceBtnEl?.addEventListener("click", () => {
    setEqualAllocation();
    renderAll();
  });

  clearBtnEl?.addEventListener("click", () => {
    cart = [];
    allocationMap = {};
    renderAll();
  });

  xamanConnectBtnEl?.addEventListener("click", () => {
    void connectXaman();
  });

  xamanDisconnectBtnEl?.addEventListener("click", () => {
    disconnectXaman();
  });

  submitBtnEl?.addEventListener("click", () => {
    void submitDonation();
  });

  proofNftBtnEl?.addEventListener("click", () => {
    void requestProofNftScaffold();
  });
}

function renderAll(): void {
  renderFoundationList();
  renderBundleList();
  renderCart();
  renderSummary();
  renderDestinationInfo();
  void renderPreview();
}

async function init(): Promise<void> {
  const repositories = await createRepositories();
  foundations = await repositories.foundationRepository.list();
  bundles = await repositories.foundationRepository.listBundles();

  const url = new URL(window.location.href);
  const preselectId = url.searchParams.get("add");
  if (preselectId) {
    addToCart(preselectId);
  }

  bindEvents();
  updateWalletStatusFromSession();
  renderTxResult(lastDonationRecord);
  renderAll();
}

void init();
