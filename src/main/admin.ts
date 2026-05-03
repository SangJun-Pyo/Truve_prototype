import { API_BASE } from "../services/apiBase";
import { renderTopNav } from "../shared/nav";

const ADMIN_SECRET_STORAGE_KEY = "truve_admin_secret";

const navRoot = document.getElementById("top-nav");
if (navRoot) {
  navRoot.innerHTML = renderTopNav("admin");
}

const formEl = document.getElementById("faucet-form") as HTMLFormElement | null;
const secretEl = document.getElementById("admin-secret") as HTMLInputElement | null;
const recipientEl = document.getElementById("recipient-address") as HTMLInputElement | null;
const tokenEl = document.getElementById("token-select") as HTMLSelectElement | null;
const amountEl = document.getElementById("token-amount") as HTMLInputElement | null;
const sendBtnEl = document.getElementById("send-token-btn") as HTMLButtonElement | null;
const trustlineBtnEl = document.getElementById("trustline-btn") as HTMLButtonElement | null;
const defaultRippleBtnEl = document.getElementById("default-ripple-btn") as HTMLButtonElement | null;
const clearNoRippleBtnEl = document.getElementById("clear-no-ripple-btn") as HTMLButtonElement | null;
const trustlineQrWrapEl = document.getElementById("trustline-qr-wrap");
const statusEl = document.getElementById("faucet-status");
const resultEl = document.getElementById("faucet-result");
const foundationListEl = document.getElementById("foundation-admin-list");
const refreshFoundationsBtnEl = document.getElementById("refresh-foundations-btn") as HTMLButtonElement | null;
const auditFormEl = document.getElementById("audit-form") as HTMLFormElement | null;
const auditReceiptIdEl = document.getElementById("audit-receipt-id") as HTMLInputElement | null;
const auditWalletEl = document.getElementById("audit-wallet") as HTMLInputElement | null;
const auditTxHashEl = document.getElementById("audit-tx-hash") as HTMLInputElement | null;
const auditStatusEl = document.getElementById("audit-status") as HTMLSelectElement | null;
const auditNoteEl = document.getElementById("audit-note") as HTMLInputElement | null;
const auditLogListEl = document.getElementById("audit-log-list");
const exportAuditBtnEl = document.getElementById("export-audit-btn") as HTMLButtonElement | null;

const FOUNDATION_REVIEW_STORAGE_KEY = "truve_foundation_review_status";
const FOUNDATION_AUDIT_STORAGE_KEY = "truve_foundation_audit_log_v1";

interface FaucetResponse {
  ok: boolean;
  currency: "RLUSD" | "USDC";
  amount: string;
  recipient: string;
  txHash: string;
  validated: boolean;
  explorerUrl: string;
  message: string;
}

interface TrustLineResponse {
  uuid: string;
  qrPngUrl: string;
  deepLink: string;
  currency: "RLUSD" | "USDC";
  issuer: string;
  limit: string;
  message: string;
}

interface DefaultRippleResponse {
  ok: boolean;
  currency: "RLUSD" | "USDC";
  issuer: string;
  alreadyEnabled?: boolean;
  defaultRippleEnabled: boolean;
  txHash?: string;
  validated?: boolean;
  explorerUrl?: string;
  message: string;
}

interface ClearNoRippleResponse {
  ok: boolean;
  currency: "RLUSD" | "USDC";
  issuer: string;
  peer: string;
  txHash: string;
  validated: boolean;
  explorerUrl: string;
  message: string;
}

interface FoundationMock {
  id: string;
  name: string;
  region: string;
  walletAddress: string;
  trustMetrics: {
    proofCoveragePct: number;
    verificationLevel: string;
    auditedAt: string;
  };
}

interface FoundationReviewStatus {
  status: "pending" | "approved" | "paused";
  reviewedAt?: string;
}

interface FoundationTrustLine {
  asset: "RLUSD" | "USDC";
  ready: boolean;
  balance: string | null;
  limit: string | null;
  configured: boolean;
}

interface AuditEvent {
  id: string;
  receiptId: string;
  foundationWallet: string;
  txHash: string;
  status: "received" | "reviewed" | "flagged";
  evidenceHash: string;
  note: string;
  recordedAt: string;
}

function setStatus(label: string, isError = false): void {
  if (!statusEl) return;
  statusEl.textContent = label;
  statusEl.className = isError ? "status-badge error" : "status-badge success";
}

function renderMessage(message: string, isError = false): void {
  if (!resultEl) return;
  resultEl.innerHTML = `<p class="${isError ? "tax-disclaimer" : "microcopy"}">${message}</p>`;
}

function renderSuccess(result: FaucetResponse): void {
  if (!resultEl) return;
  if (auditWalletEl) auditWalletEl.value = result.recipient;
  if (auditTxHashEl) auditTxHashEl.value = result.txHash;
  resultEl.innerHTML = `
    <p class="microcopy"><strong>Test token sent successfully.</strong> Testnet only · No real value.</p>
    <div class="result-row"><span>Token</span><strong>${result.currency}</strong></div>
    <div class="result-row"><span>Amount</span><strong>${result.amount}</strong></div>
    <div class="result-row"><span>Recipient</span><strong>${result.recipient}</strong></div>
    <div class="result-row"><span>Tx Hash</span><a class="text-link" href="${result.explorerUrl}" target="_blank" rel="noreferrer">${result.txHash}</a></div>
    <div class="result-row"><span>Explorer</span><a class="text-link" href="${result.explorerUrl}" target="_blank" rel="noreferrer">Open XRPL Testnet Explorer</a></div>
  `;
}

function renderDefaultRippleSuccess(result: DefaultRippleResponse): void {
  if (!resultEl) return;
  resultEl.innerHTML = `
    <p class="microcopy"><strong>Issuer Default Ripple ${result.alreadyEnabled ? "already enabled" : "enabled"}.</strong> Testnet only · No real value.</p>
    <div class="result-row"><span>Token</span><strong>${result.currency}</strong></div>
    <div class="result-row"><span>Issuer</span><strong>${result.issuer}</strong></div>
    <div class="result-row"><span>Status</span><strong>${result.defaultRippleEnabled ? "ENABLED" : "DISABLED"}</strong></div>
    ${
      result.txHash && result.explorerUrl
        ? `<div class="result-row"><span>Tx Hash</span><a class="text-link" href="${result.explorerUrl}" target="_blank" rel="noreferrer">${result.txHash}</a></div>
           <div class="result-row"><span>Explorer</span><a class="text-link" href="${result.explorerUrl}" target="_blank" rel="noreferrer">Open XRPL Testnet Explorer</a></div>`
        : ""
    }
    <p class="microcopy">${result.message}</p>
  `;
}

function renderClearNoRippleSuccess(result: ClearNoRippleResponse): void {
  if (!resultEl) return;
  resultEl.innerHTML = `
    <p class="microcopy"><strong>Issuer-side NoRipple cleared.</strong> Testnet only · No real value.</p>
    <div class="result-row"><span>Token</span><strong>${result.currency}</strong></div>
    <div class="result-row"><span>Issuer</span><strong>${result.issuer}</strong></div>
    <div class="result-row"><span>TrustLine Peer</span><strong>${result.peer}</strong></div>
    <div class="result-row"><span>Tx Hash</span><a class="text-link" href="${result.explorerUrl}" target="_blank" rel="noreferrer">${result.txHash}</a></div>
    <div class="result-row"><span>Explorer</span><a class="text-link" href="${result.explorerUrl}" target="_blank" rel="noreferrer">Open XRPL Testnet Explorer</a></div>
    <p class="microcopy">${result.message}</p>
  `;
}

function getCurrency(): "RLUSD" | "USDC" {
  return tokenEl?.value === "USDC" ? "USDC" : "RLUSD";
}

function loadReviewStatuses(): Record<string, FoundationReviewStatus> {
  try {
    return JSON.parse(localStorage.getItem(FOUNDATION_REVIEW_STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveReviewStatus(foundationId: string, status: FoundationReviewStatus["status"]): void {
  const statuses = loadReviewStatuses();
  statuses[foundationId] = { status, reviewedAt: new Date().toISOString() };
  localStorage.setItem(FOUNDATION_REVIEW_STORAGE_KEY, JSON.stringify(statuses));
}

function loadAuditEvents(): AuditEvent[] {
  try {
    return JSON.parse(localStorage.getItem(FOUNDATION_AUDIT_STORAGE_KEY) ?? "[]") as AuditEvent[];
  } catch {
    return [];
  }
}

function saveAuditEvents(events: AuditEvent[]): void {
  localStorage.setItem(FOUNDATION_AUDIT_STORAGE_KEY, JSON.stringify(events));
}

function makeReceiptId(): string {
  return `receipt_${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}`;
}

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function renderAuditLog(): void {
  if (!auditLogListEl) return;
  const events = loadAuditEvents();
  if (events.length === 0) {
    auditLogListEl.innerHTML = `<p class="microcopy">No audit events recorded yet.</p>`;
    return;
  }

  auditLogListEl.innerHTML = events
    .map(
      (event) => `
        <article class="foundation-admin-card">
          <div class="foundation-admin-head">
            <div>
              <h3>${event.receiptId}</h3>
              <p class="microcopy">${event.foundationWallet} · ${new Date(event.recordedAt).toLocaleString("ko-KR")}</p>
            </div>
            <span class="status-badge ${event.status === "flagged" ? "error" : "success"}">${event.status.toUpperCase()}</span>
          </div>
          <div class="result-row"><span>Tx Hash</span><strong>${event.txHash}</strong></div>
          <div class="result-row"><span>Evidence Hash</span><strong>${event.evidenceHash}</strong></div>
          <p class="microcopy">${event.note || "No personal data stored."}</p>
        </article>
      `,
    )
    .join("");
}

async function recordAuditEvent(): Promise<void> {
  const receiptId = (auditReceiptIdEl?.value.trim() || makeReceiptId()).slice(0, 80);
  const foundationWallet = auditWalletEl?.value.trim() ?? "";
  const txHash = auditTxHashEl?.value.trim() ?? "";
  const status =
    auditStatusEl?.value === "flagged" ? "flagged" : auditStatusEl?.value === "reviewed" ? "reviewed" : "received";
  const note = (auditNoteEl?.value.trim() ?? "").slice(0, 180);

  if (!foundationWallet || !txHash) {
    renderMessage("Foundation Wallet and Tx Hash are required to record an audit event.", true);
    return;
  }

  const recordedAt = new Date().toISOString();
  const evidenceHash = await sha256Hex(JSON.stringify({ receiptId, foundationWallet, txHash, status, note, recordedAt }));
  const event: AuditEvent = {
    id: `audit_${Date.now()}`,
    receiptId,
    foundationWallet,
    txHash,
    status,
    evidenceHash,
    note,
    recordedAt,
  };

  saveAuditEvents([event, ...loadAuditEvents()]);
  if (auditReceiptIdEl) auditReceiptIdEl.value = makeReceiptId();
  if (auditTxHashEl) auditTxHashEl.value = "";
  if (auditNoteEl) auditNoteEl.value = "";
  renderAuditLog();
  renderMessage(`Audit event recorded with evidence_hash ${evidenceHash}.`);
}

function exportAuditLog(): void {
  const events = loadAuditEvents();
  const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), events }, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `truve-audit-log-${Date.now()}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function fetchFoundationTrustLines(walletAddress: string): Promise<FoundationTrustLine[]> {
  const response = await fetch(`${API_BASE}/api/xrpl/account/${encodeURIComponent(walletAddress)}/trustlines`);
  if (!response.ok) {
    return [
      { asset: "RLUSD", ready: false, balance: null, limit: null, configured: false },
      { asset: "USDC", ready: false, balance: null, limit: null, configured: false },
    ];
  }
  const payload = (await response.json()) as { trustlines: FoundationTrustLine[] };
  return payload.trustlines;
}

function renderTrustLinePills(trustlines: FoundationTrustLine[]): string {
  return trustlines
    .map((line) => {
      const label = line.ready ? `${line.asset} ready` : `${line.asset} missing`;
      const detail = line.ready && line.limit ? ` · limit ${line.limit}` : "";
      return `<span class="pill ${line.ready ? "ready" : "missing"}">${label}${detail}</span>`;
    })
    .join("");
}

async function renderFoundationDashboard(): Promise<void> {
  if (!foundationListEl) return;
  foundationListEl.innerHTML = `<p class="microcopy">Checking foundation wallets and TrustLines...</p>`;

  try {
    const response = await fetch("/mocks/foundations.json");
    const foundations = (await response.json()) as FoundationMock[];
    const statuses = loadReviewStatuses();
    const rows = await Promise.all(
      foundations.map(async (foundation) => {
        const review = statuses[foundation.id]?.status ?? "pending";
        const trustlines = await fetchFoundationTrustLines(foundation.walletAddress);
        return `
          <article class="foundation-admin-card">
            <div class="foundation-admin-head">
              <div>
                <h3>${foundation.name}</h3>
                <p class="microcopy">${foundation.region} · ${foundation.walletAddress}</p>
              </div>
              <span class="status-badge ${review === "approved" ? "success" : "error"}">${review.toUpperCase()}</span>
            </div>
            <div class="trustline-pills">${renderTrustLinePills(trustlines)}</div>
            <div class="result-row">
              <span>Audit</span>
              <strong>${foundation.trustMetrics.verificationLevel} · ${foundation.trustMetrics.proofCoveragePct}% proof · ${foundation.trustMetrics.auditedAt}</strong>
            </div>
            <div class="foundation-admin-actions">
              <button class="ghost-btn foundation-review-btn" data-foundation-id="${foundation.id}" data-status="approved" type="button">Approve</button>
              <button class="ghost-btn foundation-review-btn" data-foundation-id="${foundation.id}" data-status="paused" type="button">Pause</button>
            </div>
          </article>
        `;
      }),
    );

    foundationListEl.innerHTML = rows.join("");
    foundationListEl.querySelectorAll<HTMLButtonElement>(".foundation-review-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const foundationId = button.dataset.foundationId;
        const status = button.dataset.status === "approved" ? "approved" : "paused";
        if (!foundationId) return;
        saveReviewStatus(foundationId, status);
        void renderFoundationDashboard();
      });
    });
  } catch (error) {
    foundationListEl.innerHTML = `<p class="tax-disclaimer">${
      error instanceof Error ? error.message : "Foundation onboarding dashboard failed."
    }</p>`;
  }
}

function renderTrustLineQr(result: TrustLineResponse): void {
  if (!trustlineQrWrapEl) return;
  trustlineQrWrapEl.innerHTML = `
    <p class="microcopy"><strong>TrustLine request ready.</strong> Scan or open with the recipient Xaman testnet wallet before sending tokens.</p>
    <img src="${result.qrPngUrl}" alt="Xaman TrustLine QR" />
    <a class="ghost-btn" href="${result.deepLink}" target="_blank" rel="noreferrer">Open in Xaman</a>
    <p class="microcopy">${result.currency} issuer: ${result.issuer}</p>
  `;
}

async function createTrustLineRequest(): Promise<void> {
  const adminSecret = secretEl?.value.trim() ?? "";
  const recipient = recipientEl?.value.trim() ?? "";
  const currency = getCurrency();
  const limit = "1000000";

  localStorage.setItem(ADMIN_SECRET_STORAGE_KEY, adminSecret);

  if (!adminSecret || !recipient) {
    setStatus("ERROR", true);
    renderMessage("Admin Secret and Recipient Address are required to create a TrustLine request.", true);
    return;
  }

  try {
    if (trustlineBtnEl) {
      trustlineBtnEl.disabled = true;
      trustlineBtnEl.textContent = "Creating...";
    }
    setStatus("TRUSTLINE");
    renderMessage("Creating a Xaman TrustSet request. Testnet only · No real value.");

    const response = await fetch(`${API_BASE}/api/admin/testnet-trustline`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-secret": adminSecret,
      },
      body: JSON.stringify({ recipient, currency, limit }),
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload?.error ?? `TrustLine request failed with ${response.status}`);
    }

    setStatus("SIGN TRUSTLINE");
    renderTrustLineQr(payload as TrustLineResponse);
    renderMessage("TrustLine QR created. Sign it in the recipient Xaman testnet wallet, then send the test token.");
  } catch (error) {
    setStatus("ERROR", true);
    renderMessage(error instanceof Error ? error.message : "TrustLine request failed.", true);
  } finally {
    if (trustlineBtnEl) {
      trustlineBtnEl.disabled = false;
      trustlineBtnEl.textContent = "Create TrustLine Request";
    }
  }
}

async function sendTestToken(): Promise<void> {
  const adminSecret = secretEl?.value.trim() ?? "";
  const recipient = recipientEl?.value.trim() ?? "";
  const amount = amountEl?.value.trim() ?? "";
  const currency = getCurrency();

  localStorage.setItem(ADMIN_SECRET_STORAGE_KEY, adminSecret);

  if (!adminSecret || !recipient || !amount) {
    setStatus("ERROR", true);
    renderMessage("Admin Secret, Recipient Address, and Amount are required.", true);
    return;
  }

  try {
    if (sendBtnEl) {
      sendBtnEl.disabled = true;
      sendBtnEl.textContent = "Sending...";
    }
    setStatus("SENDING");
    renderMessage("This sends test tokens on XRPL Testnet only.");

    const response = await fetch(`${API_BASE}/api/admin/testnet-faucet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-secret": adminSecret,
      },
      body: JSON.stringify({ recipient, currency, amount }),
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload?.error ?? `Faucet request failed with ${response.status}`);
    }

    setStatus("SUCCESS");
    renderSuccess(payload as FaucetResponse);
  } catch (error) {
    setStatus("ERROR", true);
    renderMessage(error instanceof Error ? error.message : "Faucet request failed.", true);
  } finally {
    if (sendBtnEl) {
      sendBtnEl.disabled = false;
      sendBtnEl.textContent = "Send Test Token";
    }
  }
}

async function enableIssuerDefaultRipple(): Promise<void> {
  const adminSecret = secretEl?.value.trim() ?? "";
  const currency = getCurrency();

  localStorage.setItem(ADMIN_SECRET_STORAGE_KEY, adminSecret);

  if (!adminSecret) {
    setStatus("ERROR", true);
    renderMessage("Admin Secret is required to enable issuer Default Ripple.", true);
    return;
  }

  try {
    if (defaultRippleBtnEl) {
      defaultRippleBtnEl.disabled = true;
      defaultRippleBtnEl.textContent = "Enabling...";
    }
    setStatus("ISSUER OPS");
    renderMessage("Enabling issuer Default Ripple on XRPL Testnet. Testnet only · No real value.");

    const response = await fetch(`${API_BASE}/api/admin/issuer/default-ripple`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-secret": adminSecret,
      },
      body: JSON.stringify({ currency }),
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload?.error ?? `Issuer Default Ripple request failed with ${response.status}`);
    }

    setStatus("SUCCESS");
    renderDefaultRippleSuccess(payload as DefaultRippleResponse);
  } catch (error) {
    setStatus("ERROR", true);
    renderMessage(error instanceof Error ? error.message : "Issuer Default Ripple request failed.", true);
  } finally {
    if (defaultRippleBtnEl) {
      defaultRippleBtnEl.disabled = false;
      defaultRippleBtnEl.textContent = "Enable Issuer Default Ripple";
    }
  }
}

async function clearIssuerNoRipple(): Promise<void> {
  const adminSecret = secretEl?.value.trim() ?? "";
  const recipient = recipientEl?.value.trim() ?? "";
  const currency = getCurrency();

  localStorage.setItem(ADMIN_SECRET_STORAGE_KEY, adminSecret);

  if (!adminSecret || !recipient) {
    setStatus("ERROR", true);
    renderMessage("Admin Secret and Recipient Address are required to clear issuer-side NoRipple.", true);
    return;
  }

  try {
    if (clearNoRippleBtnEl) {
      clearNoRippleBtnEl.disabled = true;
      clearNoRippleBtnEl.textContent = "Clearing...";
    }
    setStatus("ISSUER OPS");
    renderMessage("Clearing issuer-side NoRipple for the selected TrustLine. Testnet only · No real value.");

    const response = await fetch(`${API_BASE}/api/admin/issuer/clear-no-ripple`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-secret": adminSecret,
      },
      body: JSON.stringify({ recipient, currency, limit: "1000000" }),
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload?.error ?? `Issuer Clear NoRipple request failed with ${response.status}`);
    }

    setStatus("SUCCESS");
    renderClearNoRippleSuccess(payload as ClearNoRippleResponse);
  } catch (error) {
    setStatus("ERROR", true);
    renderMessage(error instanceof Error ? error.message : "Issuer Clear NoRipple request failed.", true);
  } finally {
    if (clearNoRippleBtnEl) {
      clearNoRippleBtnEl.disabled = false;
      clearNoRippleBtnEl.textContent = "Clear Issuer NoRipple";
    }
  }
}

secretEl?.setAttribute("value", localStorage.getItem(ADMIN_SECRET_STORAGE_KEY) ?? "");
if (auditReceiptIdEl) auditReceiptIdEl.value = makeReceiptId();
renderAuditLog();

formEl?.addEventListener("submit", (event) => {
  event.preventDefault();
  void sendTestToken();
});

auditFormEl?.addEventListener("submit", (event) => {
  event.preventDefault();
  void recordAuditEvent();
});

exportAuditBtnEl?.addEventListener("click", exportAuditLog);

trustlineBtnEl?.addEventListener("click", () => {
  void createTrustLineRequest();
});

defaultRippleBtnEl?.addEventListener("click", () => {
  void enableIssuerDefaultRipple();
});

clearNoRippleBtnEl?.addEventListener("click", () => {
  void clearIssuerNoRipple();
});

refreshFoundationsBtnEl?.addEventListener("click", () => {
  void renderFoundationDashboard();
});

void renderFoundationDashboard();
