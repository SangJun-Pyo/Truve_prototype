import { xrpToDrops } from "xrpl";
import type { DonationBundle, Foundation } from "../api";
import { createRepositories } from "../api/provider";
import { renderTopNav } from "../shared/nav";

type CartEntry = {
  foundationId: string;
  foundationName: string;
};

type XamanCredentials = {
  apiKey: string;
  apiSecret: string;
};

const MOCK_KRW_PER_XRP = 1000;
const TESTNET_DONATION_ADDRESS = "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe";

const navRoot = document.getElementById("top-nav");
if (navRoot) {
  navRoot.innerHTML = renderTopNav("donation");
}

const foundationListEl = document.getElementById("foundation-list");
const bundleListEl = document.getElementById("bundle-list");
const cartItemsEl = document.getElementById("cart-items");
const allocationSummaryEl = document.getElementById("allocation-summary");
const previewEl = document.getElementById("preview");
const amountInputEl = document.getElementById("donation-amount") as HTMLInputElement | null;
const rebalanceBtnEl = document.getElementById("rebalance-btn");
const clearBtnEl = document.getElementById("clear-btn");
const submitBtnEl = document.getElementById("submit-btn");

const xamanApiKeyEl = document.getElementById("xaman-api-key") as HTMLInputElement | null;
const xamanApiSecretEl = document.getElementById("xaman-api-secret") as HTMLInputElement | null;
const xamanConnectBtnEl = document.getElementById("xaman-connect-btn");
const walletStatusEl = document.getElementById("wallet-status");
const xamanQrWrapEl = document.getElementById("xaman-qr-wrap");

let foundations: Foundation[] = [];
let bundles: DonationBundle[] = [];
let cart: CartEntry[] = [];
let allocationMap: Record<string, number> = {};
let previewRequestSeq = 0;
let xamanCreds: XamanCredentials | null = null;
let connectedWalletAddress: string | null = null;

function formatKrw(value: number): string {
  return `${new Intl.NumberFormat("ko-KR").format(value)}원`;
}

function toHex(input: string): string {
  return Array.from(new TextEncoder().encode(input))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
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

function setWalletStatus(message: string, isError = false): void {
  if (!walletStatusEl) {
    return;
  }
  walletStatusEl.className = isError ? "notice error mt-12" : "notice mt-12";
  walletStatusEl.textContent = message;
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

async function createXamanPayload(
  creds: XamanCredentials,
  payload: Record<string, unknown>,
): Promise<any> {
  const response = await fetch("https://xumm.app/api/v1/platform/payload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": creds.apiKey,
      "x-api-secret": creds.apiSecret,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Xaman payload 생성 실패: ${response.status} ${text}`);
  }

  return response.json();
}

async function getXamanPayload(creds: XamanCredentials, uuid: string): Promise<any> {
  const response = await fetch(`https://xumm.app/api/v1/platform/payload/${uuid}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": creds.apiKey,
      "x-api-secret": creds.apiSecret,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Xaman payload 조회 실패: ${response.status} ${text}`);
  }
  return response.json();
}

async function waitForXamanResult(creds: XamanCredentials, uuid: string): Promise<any> {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const payload = await getXamanPayload(creds, uuid);
    if (payload?.meta?.resolved) {
      return payload;
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  throw new Error("Xaman 응답 대기 시간이 초과되었습니다.");
}

function getCurrentAmount(): number {
  const amount = Number(amountInputEl?.value ?? 0);
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

function getAllocationTotal(): number {
  return cart.reduce((sum, item) => sum + (allocationMap[item.foundationId] ?? 0), 0);
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
    userId: "usr_demo_001",
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

async function connectXaman(): Promise<void> {
  const apiKey = xamanApiKeyEl?.value.trim() ?? "";
  const apiSecret = xamanApiSecretEl?.value.trim() ?? "";
  if (!apiKey || !apiSecret) {
    setWalletStatus("Xaman API Key/Secret을 입력해 주세요.", true);
    return;
  }

  xamanCreds = { apiKey, apiSecret };
  setWalletStatus("Xaman SignIn QR을 생성 중입니다...");

  try {
    const payload = await createXamanPayload(xamanCreds, {
      txjson: { TransactionType: "SignIn" },
      options: { submit: false },
    });

    renderXamanQrSection(payload.refs.qr_png, payload.next.always);
    setWalletStatus("Xaman 앱에서 SignIn 요청을 승인해 주세요.");

    const resolved = await waitForXamanResult(xamanCreds, payload.uuid);
    if (!resolved?.meta?.signed) {
      setWalletStatus("SignIn 요청이 거절되었습니다.", true);
      return;
    }

    connectedWalletAddress = resolved?.response?.account ?? null;
    if (!connectedWalletAddress) {
      setWalletStatus("연결 주소를 확인하지 못했습니다.", true);
      return;
    }

    setWalletStatus(`연결 완료: ${connectedWalletAddress}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Xaman 연결 중 오류가 발생했습니다.";
    setWalletStatus(message, true);
  }
}

async function submitDonation(): Promise<void> {
  const amount = getCurrentAmount();
  if (cart.length === 0) {
    window.alert("먼저 재단을 담아주세요.");
    return;
  }
  if (amount <= 0) {
    window.alert("기부 금액을 입력해 주세요.");
    return;
  }
  if (getAllocationTotal() !== 100) {
    window.alert("비율 합계를 100%로 맞춰주세요.");
    return;
  }
  if (!xamanCreds) {
    window.alert("먼저 Xaman 연결을 진행해 주세요.");
    return;
  }
  if (!connectedWalletAddress) {
    window.alert("지갑 주소가 연결되지 않았습니다. SignIn을 완료해 주세요.");
    return;
  }

  const repositories = await createRepositories();
  const allocations = cart.map((entry) => ({
    foundationId: entry.foundationId,
    ratioPct: allocationMap[entry.foundationId] ?? 0,
  }));
  const donationSummary = {
    app: "TRUVE",
    amountKrw: amount,
    allocations,
    createdAt: new Date().toISOString(),
  };

  const amountXrp = (amount / MOCK_KRW_PER_XRP).toFixed(6);
  const drops = xrpToDrops(amountXrp);

  try {
    setWalletStatus("기부 결제 QR을 생성 중입니다...");

    const payload = await createXamanPayload(xamanCreds, {
      txjson: {
        TransactionType: "Payment",
        Account: connectedWalletAddress,
        Destination: TESTNET_DONATION_ADDRESS,
        Amount: drops,
        Memos: [
          {
            Memo: {
              MemoType: toHex("TRUVE_DONATION"),
              MemoData: toHex(JSON.stringify(donationSummary).slice(0, 230)),
            },
          },
        ],
      },
      options: { submit: true },
    });

    renderXamanQrSection(payload.refs.qr_png, payload.next.always);
    setWalletStatus("Xaman 앱에서 기부 결제 서명을 승인해 주세요.");

    const resolved = await waitForXamanResult(xamanCreds, payload.uuid);
    if (!resolved?.meta?.signed) {
      setWalletStatus("결제 요청이 거절되었습니다.", true);
      return;
    }

    const txHash = resolved?.response?.txid;
    setWalletStatus(`기부 트랜잭션 완료: ${txHash ?? "해시 미확인"}`);

    const receipt = await repositories.donationRepository.submitDonation({
      userId: "usr_demo_001",
      amountKrw: amount,
      allocations,
    });

    window.alert(
      [
        "목업 기부가 완료되었습니다.",
        `기부 ID: ${receipt.donationId}`,
        `Xaman TX: ${txHash ?? "확인 필요"}`,
      ].join("\n"),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "기부 요청 중 오류가 발생했습니다.";
    setWalletStatus(message, true);
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

  submitBtnEl?.addEventListener("click", () => {
    void submitDonation();
  });
}

function renderAll(): void {
  renderFoundationList();
  renderBundleList();
  renderCart();
  renderSummary();
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
  renderAll();
}

void init();
