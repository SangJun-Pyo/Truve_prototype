import { xrpToDrops } from "xrpl";
import type { Foundation } from "../api";
import { createRepositories } from "../api/provider";
import { upsertDbUser, saveDbDonation, patchDbDonation } from "../services/db";
import {
  clearCart,
  getCartItemsWithFoundations,
  getCartState,
  removeFoundationFromCart,
  saveCartState,
  updateCartRatio,
} from "../services/cart";
import { upsertLocalDonation, type LocalDonationRecord } from "../services/donations";
import { requestProofNftMintScaffold } from "../services/proofNft";
import { clearWalletSession, getWalletSession, setWalletSession } from "../services/wallet";
import {
  createPaymentPayload,
  createSignInPayload,
  waitForPayloadResolution,
} from "../services/xaman";
import { fetchAccountInfo, getTestnetExplorerLink, waitForTxValidation } from "../services/xrpl";
import { renderTopNav } from "../shared/nav";

const USER_ID = "usr_demo_001";

const navRoot = document.getElementById("top-nav");
if (navRoot) {
  navRoot.innerHTML = renderTopNav("donation");
}

const cartItemsEl = document.getElementById("cart-items");
const cartEmptyEl = document.getElementById("cart-empty");
const allocationSummaryEl = document.getElementById("allocation-summary");
const destinationEl = document.getElementById("donation-destination");
const txStatusEl = document.getElementById("donation-tx-status");
const txResultEl = document.getElementById("donation-tx-result");
const previewEl = document.getElementById("preview");
const amountInputEl = document.getElementById("donation-amount-xrp") as HTMLInputElement | null;
const amountChipEls = Array.from(document.querySelectorAll<HTMLButtonElement>(".amount-chip"));
const rebalanceBtnEl = document.getElementById("rebalance-btn");
const clearBtnEl = document.getElementById("clear-btn");
const submitBtnEl = document.getElementById("submit-btn");
const proofNftBtnEl = document.getElementById("proof-nft-btn") as HTMLButtonElement | null;
const proofNftStatusEl = document.getElementById("proof-nft-status");

const connectBtnEl = document.getElementById("xaman-connect-btn");
const disconnectBtnEl = document.getElementById("xaman-disconnect-btn");
const walletStatusEl = document.getElementById("wallet-status");
const walletBalanceEl = document.getElementById("wallet-balance");
const qrWrapEl = document.getElementById("xaman-qr-wrap");

let foundations: Foundation[] = [];
let lastDonationRecord: LocalDonationRecord | null = null;

function formatXrp(value: number): string {
  return `${new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 6 }).format(value)} XRP`;
}

function setWalletStatus(message: string, isError = false): void {
  if (!walletStatusEl) {
    return;
  }
  walletStatusEl.className = isError ? "notice error mt-12" : "notice mt-12";
  walletStatusEl.textContent = message;
}

function setWalletBalance(message: string, isError = false): void {
  if (!walletBalanceEl) {
    return;
  }
  walletBalanceEl.className = isError ? "notice error mt-12" : "notice mt-12";
  walletBalanceEl.textContent = message;
}

function setTxStatus(message: string, isError = false): void {
  if (!txStatusEl) {
    return;
  }
  txStatusEl.className = isError ? "notice error mt-12" : "notice mt-12";
  txStatusEl.textContent = message;
}

function renderQrcode(qrPngUrl: string, openUrl: string): void {
  if (!qrWrapEl) {
    return;
  }
  qrWrapEl.innerHTML = `
    <img src="${qrPngUrl}" alt="Xaman QR" />
    <a class="btn btn-primary" href="${openUrl}" target="_blank" rel="noreferrer">Xaman 앱으로 열기</a>
  `;
}

function clearQrcode(): void {
  if (!qrWrapEl) {
    return;
  }
  qrWrapEl.innerHTML = "";
}

function getAmountXrp(): number {
  const value = Number(amountInputEl?.value ?? 0);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function getCartView() {
  return getCartItemsWithFoundations(foundations);
}

function getRatioTotal(): number {
  return getCartView().reduce((sum, item) => sum + item.ratioPct, 0);
}

function getRepresentativeFoundation(): Foundation | null {
  const item = getCartView()[0];
  return item?.foundation ?? null;
}

function renderDestinationInfo(): void {
  if (!destinationEl) {
    return;
  }
  const foundation = getRepresentativeFoundation();
  if (!foundation) {
    destinationEl.textContent = "수신 재단 지갑이 아직 선택되지 않았습니다.";
    return;
  }
  destinationEl.textContent = `선택 수신 지갑: ${foundation.name} (${foundation.walletAddress})`;
}

function renderRatioSummary(): void {
  if (!allocationSummaryEl) {
    return;
  }
  const total = getRatioTotal();
  if (total === 100) {
    allocationSummaryEl.className = "notice mt-12";
    allocationSummaryEl.textContent = `비율 합계 ${total}% · 정상`;
    return;
  }
  allocationSummaryEl.className = "notice error mt-12";
  allocationSummaryEl.textContent = `비율 합계 ${total}% · 100%로 맞춰야 실행 가능합니다.`;
}

function renderPreview(): void {
  if (!previewEl) {
    return;
  }
  const items = getCartView();
  const amountXrp = getAmountXrp();

  if (items.length === 0) {
    previewEl.textContent = "장바구니에 재단을 담으면 분배 결과가 표시됩니다.";
    return;
  }
  if (amountXrp <= 0) {
    previewEl.textContent = "총 기부 금액(XRP)을 입력해주세요.";
    return;
  }

  const rows = items
    .map((item) => {
      const distributed = (amountXrp * item.ratioPct) / 100;
      return `<li>${item.foundation.name} ${item.ratioPct}% → <strong>${formatXrp(distributed)}</strong></li>`;
    })
    .join("");

  previewEl.innerHTML = `<ul>${rows}</ul>`;
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
    <div class="row-between"><span>TX Hash</span><strong>${record.txHash ?? "-"}</strong></div>
    ${
      record.txHash
        ? `<div class="mt-12"><a class="text-link" href="${explorer}" target="_blank" rel="noreferrer">Testnet Explorer에서 보기</a></div>`
        : ""
    }
  `;
}

function normalizeRatiosEqual(): void {
  const state = getCartState();
  if (state.items.length === 0) {
    return;
  }

  const base = Math.floor(100 / state.items.length);
  let remain = 100 - base * state.items.length;

  const next = {
    items: state.items.map((item) => {
      const plus = remain > 0 ? 1 : 0;
      remain -= plus;
      return { ...item, ratioPct: base + plus };
    }),
  };

  saveCartState(next);
}

function renderCartItems(): void {
  if (!cartItemsEl || !cartEmptyEl) {
    return;
  }

  const items = getCartView();
  cartEmptyEl.classList.toggle("hidden", items.length > 0);

  if (items.length === 0) {
    cartItemsEl.innerHTML = "";
    return;
  }

  cartItemsEl.innerHTML = items
    .map((item) => {
      return `
        <article class="cart-item">
          <div class="row-between">
            <strong>${item.foundation.name}</strong>
            <button class="btn btn-ghost" data-remove-id="${item.foundation.id}" type="button">삭제</button>
          </div>
          <div class="trust mt-12">재단 지갑: ${item.foundation.walletAddress}</div>
          <label class="field mt-12">
            <span>비율 <strong>${item.ratioPct}%</strong></span>
            <input type="range" min="0" max="100" value="${item.ratioPct}" data-ratio-id="${item.foundation.id}" />
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
      updateCartRatio(id, Number(input.value));
      renderAll();
    });
  });

  cartItemsEl.querySelectorAll<HTMLButtonElement>("[data-remove-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.removeId;
      if (!id) {
        return;
      }
      removeFoundationFromCart(id);
      renderAll();
    });
  });
}

async function updateWalletStatusFromSession(): Promise<void> {
  const wallet = getWalletSession();
  if (!wallet) {
    setWalletStatus("지갑이 아직 연결되지 않았습니다.");
    setWalletBalance("지갑 잔고: -");
    return;
  }

  setWalletStatus(`연결됨: ${wallet.account}`);

  try {
    const accountInfo = await fetchAccountInfo(wallet.account);
    setWalletBalance(`지갑 잔고: ${accountInfo.balanceXrp} XRP`);
  } catch (error) {
    setWalletBalance(
      `지갑 잔고 조회 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`,
      true,
    );
  }
}

async function connectWallet(): Promise<void> {
  try {
    setWalletStatus("Xaman SignIn 요청을 생성 중입니다...");
    const payload = await createSignInPayload();
    renderQrcode(payload.qrPngUrl, payload.deepLink);

    const resolved = await waitForPayloadResolution(payload.uuid);
    if (!resolved.signed || !resolved.account) {
      setWalletStatus("지갑 연결이 취소되었습니다.", true);
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
    setWalletStatus(error instanceof Error ? error.message : "지갑 연결 실패", true);
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
  if (!wallet) {
    window.alert("먼저 Xaman 지갑을 연결해주세요.");
    return;
  }

  const cartItems = getCartView();
  if (cartItems.length === 0) {
    window.alert("장바구니가 비어 있습니다.");
    return;
  }

  const ratioTotal = getRatioTotal();
  if (ratioTotal !== 100) {
    window.alert("비율 합계를 100%로 맞춰주세요.");
    return;
  }

  const amountXrp = getAmountXrp();
  if (amountXrp <= 0) {
    window.alert("총 기부 금액(XRP)을 입력해주세요.");
    return;
  }

  const destination = getRepresentativeFoundation();
  if (!destination) {
    window.alert("수신 재단 지갑이 없습니다.");
    return;
  }

  try {
    setTxStatus("pending: Xaman 서명 대기");

    const payload = await createPaymentPayload({
      account: wallet.account,
      destination: destination.walletAddress,
      amountDrops: xrpToDrops(amountXrp.toFixed(6)),
      memoType: "TRUVE_DONATION",
      memoData: JSON.stringify({
        userId: USER_ID,
        amountXrp,
        allocations: toBundleAllocations(),
        createdAt: new Date().toISOString(),
      }).slice(0, 230),
    });

    renderQrcode(payload.qrPngUrl, payload.deepLink);
    const signed = await waitForPayloadResolution(payload.uuid);

    if (!signed.signed || !signed.txHash) {
      setTxStatus("failed: 서명이 취소되었습니다.", true);
      return;
    }

    setTxStatus("signed: 검증 대기 중");
    const validated = await waitForTxValidation(signed.txHash);
    const validationStatus = validated.validated ? "validated" : "signed";
    setTxStatus(`${validationStatus}: 트랜잭션 기록 완료`);

    const amountKrw = Math.round(amountXrp * 1000);
    const donationRecord: LocalDonationRecord = {
      id: `dnt_live_${Date.now()}`,
      userId: USER_ID,
      donatedAt: new Date().toISOString(),
      amountKrw,
      allocations: toBundleAllocations(),
      paymentStatus: "paid",
      proofStatus: "recorded",
      nftStatus: "pending",
      settlementStatus: "scheduled",
      txHash: signed.txHash,
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

    void saveDbDonation({
      xrplAccount: wallet.account,
      amountKrw,
      allocations: donationRecord.allocations,
      txHash: donationRecord.txHash,
      explorerUrl: donationRecord.explorerUrl,
    }).then((saved) => {
      if (saved && lastDonationRecord) {
        const withDbId: LocalDonationRecord = { ...lastDonationRecord, dbId: saved.id };
        upsertLocalDonation(withDbId);
        lastDonationRecord = withDbId;
      }
    });

    if (proofNftBtnEl) {
      proofNftBtnEl.disabled = false;
    }

    await updateWalletStatusFromSession();
  } catch (error) {
    setTxStatus(`failed: ${error instanceof Error ? error.message : "실행 오류"}`, true);
  }
}

async function requestProofNft(): Promise<void> {
  if (!proofNftStatusEl) {
    return;
  }

  const wallet = getWalletSession();
  if (!wallet || !lastDonationRecord?.txHash) {
    proofNftStatusEl.className = "notice error mt-12";
    proofNftStatusEl.textContent = "먼저 지갑 연결과 기부 실행이 필요합니다.";
    return;
  }

  try {
    proofNftStatusEl.className = "notice mt-12";
    proofNftStatusEl.textContent = "Proof NFT 민팅 요청 트랜잭션 생성 중입니다...";

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

    const next = { ...lastDonationRecord, ...patch };
    lastDonationRecord = next;
    upsertLocalDonation(next);

    if (next.dbId) {
      void patchDbDonation(next.dbId, {
        nftStatus: next.nftStatus,
        proofStatus: "recorded",
        proofNftId: next.proofNftId ?? null,
      });
    }

    renderTxResult(next);
    proofNftStatusEl.className = "notice mt-12";
    proofNftStatusEl.innerHTML = result.txHash
      ? `Proof NFT 요청 완료: <a class="text-link" href="${result.explorerUrl}" target="_blank" rel="noreferrer">${result.txHash}</a>`
      : "Proof NFT 요청이 취소되었습니다.";
  } catch (error) {
    proofNftStatusEl.className = "notice error mt-12";
    proofNftStatusEl.textContent = error instanceof Error ? error.message : "요청 실패";
  }
}

function bindEvents(): void {
  amountInputEl?.addEventListener("input", renderPreview);

  amountChipEls.forEach((button) => {
    button.addEventListener("click", () => {
      if (!amountInputEl) {
        return;
      }
      amountInputEl.value = button.dataset.xrp ?? "10";
      renderPreview();
    });
  });

  rebalanceBtnEl?.addEventListener("click", () => {
    normalizeRatiosEqual();
    renderAll();
  });

  clearBtnEl?.addEventListener("click", () => {
    clearCart();
    renderAll();
  });

  connectBtnEl?.addEventListener("click", () => {
    void connectWallet();
  });

  disconnectBtnEl?.addEventListener("click", () => {
    disconnectWallet();
  });

  submitBtnEl?.addEventListener("click", () => {
    void submitDonation();
  });

  proofNftBtnEl?.addEventListener("click", () => {
    void requestProofNft();
  });
}

function renderAll(): void {
  renderCartItems();
  renderRatioSummary();
  renderDestinationInfo();
  renderPreview();
}

async function init(): Promise<void> {
  const repositories = await createRepositories();
  foundations = await repositories.foundationRepository.list();

  bindEvents();
  await updateWalletStatusFromSession();
  renderTxResult(lastDonationRecord);
  renderAll();
}

void init();
