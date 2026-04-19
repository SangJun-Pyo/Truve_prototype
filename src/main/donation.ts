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
import { createPaymentPayload, createSignInPayload, waitForPayloadResolution } from "../services/xaman";
import { fetchAccountInfo, getTestnetExplorerLink, waitForTxValidation } from "../services/xrpl";

const USER_ID = "usr_demo_001";

const itemsContainerEl = document.getElementById("items-container");
const previewListEl = document.getElementById("preview-list");
const totalAmountEl = document.getElementById("total-amount") as HTMLInputElement | null;
const quickAmountEls = Array.from(document.querySelectorAll<HTMLButtonElement>(".quick-btn"));
const validationBoxEl = document.getElementById("validation-box");
const validationTotalEl = document.getElementById("validation-total");
const destinationEl = document.getElementById("donation-destination");
const txStatusEl = document.getElementById("donation-tx-status");
const txResultEl = document.getElementById("donation-tx-result");
const executeBtnEl = document.getElementById("execute-btn") as HTMLButtonElement | null;
const rebalanceBtnEl = document.getElementById("rebalance-btn");
const clearBtnEl = document.getElementById("clear-btn");
const proofNftBtnEl = document.getElementById("proof-nft-btn") as HTMLButtonElement | null;
const proofNftStatusEl = document.getElementById("proof-nft-status");

const connectBtnEl = document.getElementById("xaman-connect-btn");
const disconnectBtnEl = document.getElementById("xaman-disconnect-btn");
const walletStatusEl = document.getElementById("wallet-status");
const walletAddressEl = document.getElementById("wallet-address");
const walletBalanceEl = document.getElementById("wallet-balance");
const qrWrapEl = document.getElementById("xaman-qr-wrap");

let foundations: Foundation[] = [];
let lastDonationRecord: LocalDonationRecord | null = null;

function getAmountXrp(): number {
  const value = Number(totalAmountEl?.value ?? 0);
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

function getCardVisual(category: Foundation["category"]): [string, string] {
  const map: Record<Foundation["category"], [string, string]> = {
    climate: ["#D6E4FF", "#ADC8FF"],
    education: ["#FFF1B8", "#FFD666"],
    health: ["#FFEBE6", "#FFBDAD"],
    animal: ["#E0F2FE", "#BAE6FD"],
    humanitarian: ["#F3E8FF", "#D8B4FE"],
  };
  return map[category];
}

function setTxStatus(message: string, isError = false): void {
  if (!txStatusEl) {
    return;
  }
  txStatusEl.textContent = message;
  txStatusEl.className = isError ? "status-badge error" : "status-badge success";
}

function setWalletBadge(account: string | null): void {
  if (!walletStatusEl || !walletAddressEl) {
    return;
  }

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
  if (walletBalanceEl) {
    walletBalanceEl.textContent = message;
  }
}

function renderQrcode(qrPngUrl: string, openUrl: string): void {
  if (!qrWrapEl) {
    return;
  }
  qrWrapEl.innerHTML = `
    <img src="${qrPngUrl}" alt="Xaman QR" />
    <a class="ghost-btn" href="${openUrl}" target="_blank" rel="noreferrer">Xaman 앱으로 열기</a>
  `;
}

function clearQrcode(): void {
  if (!qrWrapEl) {
    return;
  }
  qrWrapEl.innerHTML = "";
}

function renderDestinationInfo(): void {
  if (!destinationEl) {
    return;
  }
  const foundation = getRepresentativeFoundation();
  destinationEl.textContent = foundation ? `${foundation.name}` : "-";
}

function evaluateExecuteState(): void {
  if (!executeBtnEl) {
    return;
  }

  const isWalletConnected = Boolean(getWalletSession());
  const hasItems = getCartView().length > 0;
  const isRatioValid = getRatioTotal() === 100;
  const hasAmount = getAmountXrp() > 0;

  executeBtnEl.disabled = !(isWalletConnected && hasItems && isRatioValid && hasAmount);
}

function renderValidation(): void {
  if (!validationBoxEl || !validationTotalEl) {
    return;
  }

  const total = getRatioTotal();
  validationTotalEl.textContent = `${total}%`;

  if (total === 100) {
    validationBoxEl.className = "validation-box success";
    validationBoxEl.innerHTML = `<span>총 비율</span><span id="validation-total">100% ✓</span>`;
  } else {
    const diff = 100 - total;
    const message = diff > 0 ? `${diff}% 남음` : `${Math.abs(diff)}% 초과`;
    validationBoxEl.className = "validation-box warning";
    validationBoxEl.innerHTML = `<span>${message}</span><span id="validation-total">${total}%</span>`;
  }
}

function renderPreview(): void {
  if (!previewListEl) {
    return;
  }

  const amountXrp = getAmountXrp();
  const items = getCartView();

  if (items.length === 0) {
    previewListEl.innerHTML = `<div class="card-desc">장바구니가 비어 있습니다.</div>`;
    return;
  }

  previewListEl.innerHTML = items
    .map((item) => {
      const [_, color2] = getCardVisual(item.foundation.category);
      const distributed = (amountXrp * item.ratioPct) / 100;
      return `
        <div class="preview-item">
          <div class="preview-row">
            <span>${item.foundation.name}</span>
            <div class="preview-vals">
              <span class="preview-percent">${item.ratioPct}%</span>
              <span class="preview-xrp">${distributed.toFixed(1)} XRP</span>
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

function renderCartItems(): void {
  if (!itemsContainerEl) {
    return;
  }

  const items = getCartView();
  if (items.length === 0) {
    itemsContainerEl.innerHTML = `
      <div class="empty-state">
        <p>포트폴리오가 비어 있습니다.</p>
        <a class="portfolio-back-link" href="./foundations.html" style="justify-content:center; margin-top:8px;">탐색 페이지로 이동</a>
      </div>
    `;
    return;
  }

  itemsContainerEl.innerHTML = items
    .map((item) => {
      const [color1, color2] = getCardVisual(item.foundation.category);
      return `
        <article class="config-card" data-id="${item.foundation.id}">
          <div class="card-header-row">
            <div class="card-info-group">
              <div class="card-visual-small" style="background: linear-gradient(135deg, ${color1}, ${color2});">
                <div class="visual-pattern"></div>
              </div>
              <div>
                <div class="card-title-row">
                  <h3 class="card-title">${item.foundation.name}</h3>
                  <span class="card-tag">${item.foundation.category}</span>
                </div>
                <p class="card-desc">${item.foundation.description}</p>
              </div>
            </div>
            <button class="remove-btn" data-remove-id="${item.foundation.id}" type="button" title="삭제">✕</button>
          </div>

          <div class="allocation-area">
            <div class="allocation-header">
              <span>Allocation</span>
              <span>Target ratio</span>
            </div>
            <div class="allocation-controls">
              <button class="adjust-btn" data-adjust-id="${item.foundation.id}" data-delta="-5" type="button">-5</button>
              <div class="slider-container">
                <input class="allocation-slider" type="range" min="0" max="100" value="${item.ratioPct}" data-ratio-id="${item.foundation.id}" />
              </div>
              <button class="adjust-btn" data-adjust-id="${item.foundation.id}" data-delta="5" type="button">+5</button>
              <div class="percent-input-wrapper">
                <input class="percent-input" type="number" min="0" max="100" value="${item.ratioPct}" data-input-id="${item.foundation.id}" />
                <span>%</span>
              </div>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  itemsContainerEl.querySelectorAll<HTMLButtonElement>("[data-remove-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.removeId;
      if (!id) return;
      removeFoundationFromCart(id);
      renderAll();
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
      const value = Math.max(0, Math.min(100, Number(input.value) || 0));
      updateCartRatio(id, value);
      renderAll();
    });
  });

  itemsContainerEl.querySelectorAll<HTMLButtonElement>("[data-adjust-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.adjustId;
      const delta = Number(button.dataset.delta ?? 0);
      if (!id) return;
      const item = getCartState().items.find((entry) => entry.foundationId === id);
      const next = Math.max(0, Math.min(100, (item?.ratioPct ?? 0) + delta));
      updateCartRatio(id, next);
      renderAll();
    });
  });
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
  txResultEl.innerHTML = record.txHash
    ? `TX: <a class="text-link" href="${explorer}" target="_blank" rel="noreferrer">${record.txHash}</a> (${record.validationStatus ?? "-"})`
    : "트랜잭션 정보 없음";
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
    const accountInfo = await fetchAccountInfo(wallet.account);
    setWalletBalanceText(`${accountInfo.balanceXrp} XRP`);
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
  if (!wallet) {
    window.alert("먼저 Xaman 지갑을 연결해주세요.");
    return;
  }

  if (getCartView().length === 0) {
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
    setTxStatus("Xaman 서명 대기", false);

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
      setTxStatus("서명 취소", true);
      return;
    }

    setTxStatus("검증 대기", false);
    const validated = await waitForTxValidation(signed.txHash);
    const validationStatus = validated.validated ? "validated" : "signed";
    setTxStatus(`완료 (${validationStatus})`, false);

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
    setTxStatus(error instanceof Error ? error.message : "실행 오류", true);
  }
}

async function requestProofNft(): Promise<void> {
  if (!proofNftStatusEl) {
    return;
  }

  const wallet = getWalletSession();
  if (!wallet || !lastDonationRecord?.txHash) {
    proofNftStatusEl.textContent = "먼저 지갑 연결과 기부 실행이 필요합니다.";
    return;
  }

  try {
    proofNftStatusEl.textContent = "Proof NFT 요청 생성 중...";
    const result = await requestProofNftMintScaffold({
      account: wallet.account,
      donationId: lastDonationRecord.id,
      donationTxHash: lastDonationRecord.txHash,
    });

    const next = {
      ...lastDonationRecord,
      proofMintStatus: result.validated ? ("recorded" as const) : ("requested" as const),
      proofMintTxHash: result.txHash,
      nftStatus: result.validated ? ("minted" as const) : ("pending" as const),
      proofNftId: result.validated ? `proof_req_${Date.now()}` : undefined,
    };

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
    proofNftStatusEl.textContent = result.txHash ? `Proof NFT 요청 완료: ${result.txHash}` : "Proof NFT 요청 취소";
  } catch (error) {
    proofNftStatusEl.textContent = error instanceof Error ? error.message : "요청 실패";
  }
}

function bindEvents(): void {
  totalAmountEl?.addEventListener("input", () => {
    renderPreview();
    evaluateExecuteState();
  });

  quickAmountEls.forEach((button) => {
    button.addEventListener("click", () => {
      if (!totalAmountEl) {
        return;
      }
      const add = Number(button.dataset.add ?? 0);
      const next = Math.max(0, (Number(totalAmountEl.value) || 0) + add);
      totalAmountEl.value = String(next);
      renderPreview();
      evaluateExecuteState();
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

  executeBtnEl?.addEventListener("click", () => {
    void submitDonation();
  });

  proofNftBtnEl?.addEventListener("click", () => {
    void requestProofNft();
  });
}

function renderAll(): void {
  renderCartItems();
  renderPreview();
  renderValidation();
  renderDestinationInfo();
  evaluateExecuteState();
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
