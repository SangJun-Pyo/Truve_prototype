import { createRepositories } from "../api/provider";
import { listLocalDonations, type LocalDonationRecord } from "../services/donations";
import { getTestnetExplorerLink } from "../services/xrpl";
import { renderTopNav } from "../shared/nav";

const USER_ID = "usr_demo_001";

const navRoot = document.getElementById("top-nav");
if (navRoot) navRoot.innerHTML = renderTopNav("status");

const statusEl = document.getElementById("verify-status");
const resultEl = document.getElementById("verify-result");

function getLookupId(): string {
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const verifyIndex = pathParts.findIndex((part) => part === "verify");
  const fromPath = verifyIndex >= 0 ? pathParts[verifyIndex + 1] : "";
  const fromQuery = new URLSearchParams(window.location.search).get("receipt_id") ?? "";
  return decodeURIComponent(fromPath || fromQuery || "").trim();
}

function setStatus(label: string, isError = false): void {
  if (!statusEl) return;
  statusEl.textContent = label;
  statusEl.className = isError ? "status-badge error" : "status-badge success";
}

function formatKrw(amount: number): string {
  return `${Math.round(amount).toLocaleString("ko-KR")} KRW`;
}

function matchesLookup(donation: LocalDonationRecord, lookupId: string): boolean {
  return (
    donation.receiptId === lookupId ||
    donation.evidenceHash === lookupId ||
    donation.txHash === lookupId ||
    donation.id === lookupId ||
    donation.dbId === lookupId
  );
}

function renderDonation(donation: LocalDonationRecord): void {
  if (!resultEl) return;
  const explorer = donation.explorerUrl ?? (donation.txHash ? getTestnetExplorerLink(donation.txHash) : "");
  setStatus(donation.validationStatus === "validated" ? "VERIFIED" : "RECORDED");
  resultEl.innerHTML = `
    <article class="timeline-item">
      <div class="row-between">
        <strong>${donation.receiptId ?? donation.id}</strong>
        <span class="badge">${donation.validationStatus ?? "recorded"}</span>
      </div>
      <div class="onchain-card mt-12">
        <div class="onchain-row"><span>Receipt ID</span><strong>${donation.receiptId ?? donation.id}</strong></div>
        <div class="onchain-row"><span>Evidence Hash</span><strong>${donation.evidenceHash ?? "not recorded"}</strong></div>
        <div class="onchain-row"><span>Amount</span><strong>${donation.amountAsset ? `${donation.amountAsset} ${donation.asset}` : formatKrw(donation.amountKrw)}</strong></div>
        <div class="onchain-row"><span>KRW Estimate</span><strong>${formatKrw(donation.amountKrw)}</strong></div>
        <div class="onchain-row"><span>Network</span><strong>${donation.network ?? "testnet"}</strong></div>
        <div class="onchain-row"><span>Destination</span><strong>${donation.destinationAddress ?? donation.foundationWallet ?? "-"}</strong></div>
        <div class="onchain-row"><span>TX Hash</span><strong>${donation.txHash ?? "-"}</strong></div>
      </div>
      ${
        explorer
          ? `<a class="ghost-btn mt-12" href="${explorer}" target="_blank" rel="noreferrer">Open XRPL Testnet Explorer</a>`
          : ""
      }
    </article>
  `;
}

async function init(): Promise<void> {
  const lookupId = getLookupId();
  if (!lookupId) {
    setStatus("NO ID", true);
    if (resultEl) resultEl.innerHTML = `<p class="tax-disclaimer">Missing receipt_id. Use /verify/{receipt_id}.</p>`;
    return;
  }

  const repositories = await createRepositories();
  const base = await repositories.donationRepository.listDonationsByUser(USER_ID);
  const local = listLocalDonations(USER_ID);
  const records = [...local, ...base.map((item) => ({ ...item, source: "mock" as const }))];
  const donation = records.find((item) => matchesLookup(item, lookupId));

  if (!donation) {
    setStatus("NOT FOUND", true);
    if (resultEl) {
      resultEl.innerHTML = `
        <p class="tax-disclaimer">No local prototype proof found for ${lookupId}.</p>
        <p class="microcopy">This prototype verifies local/browser and demo records. Deployed verification should use the production proof database.</p>
      `;
    }
    return;
  }

  renderDonation(donation);
}

void init();
