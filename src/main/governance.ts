import type { Foundation } from "../api";
import { createRepositories } from "../api/provider";
import {
  listGovernanceRecords,
  upsertGovernanceRecord,
  type GovernanceVoteRecord,
} from "../services/governance";
import { clearWalletSession, getWalletSession, setWalletSession } from "../services/wallet";
import {
  createMemoPayload,
  createSignInPayload,
  waitForPayloadResolution,
} from "../services/xaman";
import { waitForTxValidation } from "../services/xrpl";
import { renderTopNav } from "../shared/nav";

const STORAGE_KEY = "truve_governance_round_1";
const USER_ID = "usr_demo_001";
const PROPOSAL_ID = "proposal_q3_treasury_allocation";
const TIER_WEIGHT: Record<string, number> = {
  seed: 1,
  sprout: 2,
  forest: 3,
};

const navRoot = document.getElementById("top-nav");
if (navRoot) {
  navRoot.innerHTML = renderTopNav("governance");
}

const eligibilityEl = document.getElementById("governance-eligibility");
const optionsEl = document.getElementById("governance-options");
const resultsEl = document.getElementById("governance-results");
const walletStatusEl = document.getElementById("governance-wallet-status");
const qrWrapEl = document.getElementById("governance-qr-wrap");
const connectBtnEl = document.getElementById("governance-connect-btn");
const disconnectBtnEl = document.getElementById("governance-disconnect-btn");
const txLogEl = document.getElementById("governance-tx-log");

type VoteState = Record<string, number>;

function loadVoteState(candidateIds: string[]): VoteState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return candidateIds.reduce<VoteState>((acc, id) => {
      acc[id] = 0;
      return acc;
    }, {});
  }

  try {
    const parsed = JSON.parse(raw) as VoteState;
    return candidateIds.reduce<VoteState>((acc, id) => {
      acc[id] = Number(parsed[id] ?? 0);
      return acc;
    }, {});
  } catch {
    return candidateIds.reduce<VoteState>((acc, id) => {
      acc[id] = 0;
      return acc;
    }, {});
  }
}

function saveVoteState(state: VoteState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function setWalletStatus(message: string, isError = false): void {
  if (!walletStatusEl) {
    return;
  }
  walletStatusEl.className = isError ? "notice error mt-12" : "notice mt-12";
  walletStatusEl.textContent = message;
}

function renderQrcode(qrPngUrl: string, deepLink: string): void {
  if (!qrWrapEl) {
    return;
  }
  qrWrapEl.innerHTML = `
    <img src="${qrPngUrl}" alt="Xaman QR" />
    <a class="btn btn-primary" href="${deepLink}" target="_blank" rel="noreferrer">Xaman 앱으로 열기</a>
  `;
}

function clearQrcode(): void {
  if (!qrWrapEl) {
    return;
  }
  qrWrapEl.innerHTML = "";
}

function updateWalletStatusFromSession(): void {
  const wallet = getWalletSession();
  if (!wallet) {
    setWalletStatus("지갑 미연결");
    return;
  }
  setWalletStatus(`연결됨: ${wallet.account}`);
}

function renderResults(candidates: Foundation[], voteState: VoteState): void {
  if (!resultsEl) {
    return;
  }

  const sorted = [...candidates].sort((a, b) => (voteState[b.id] ?? 0) - (voteState[a.id] ?? 0));
  resultsEl.innerHTML = sorted
    .map((candidate) => {
      const votes = voteState[candidate.id] ?? 0;
      return `
        <article class="result-item">
          <div class="row-between">
            <strong>${candidate.name}</strong>
            <span class="badge">${votes}표</span>
          </div>
          <p class="section-desc">${candidate.description}</p>
        </article>
      `;
    })
    .join("");
}

function renderTxLog(): void {
  if (!txLogEl) {
    return;
  }

  const records = listGovernanceRecords(USER_ID);
  if (records.length === 0) {
    txLogEl.innerHTML = `<div class="notice">아직 온체인 투표 기록이 없습니다.</div>`;
    return;
  }

  txLogEl.innerHTML = records
    .map((record) => {
      const txLine = record.txHash
        ? `<a class="text-link" href="${record.explorerUrl}" target="_blank" rel="noreferrer">${record.txHash}</a>`
        : "-";

      return `
        <article class="result-item">
          <div class="row-between">
            <strong>${record.candidateName}</strong>
            <span class="badge">${record.validationStatus}</span>
          </div>
          <div class="trust mt-12">가중치: ${record.weight}표</div>
          <div class="trust">TX: ${txLine}</div>
        </article>
      `;
    })
    .join("");
}

async function connectWallet(): Promise<void> {
  try {
    setWalletStatus("Xaman SignIn QR 생성 중...");
    const payload = await createSignInPayload();
    renderQrcode(payload.qrPngUrl, payload.deepLink);
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
    clearQrcode();
    updateWalletStatusFromSession();
  } catch (error) {
    setWalletStatus(error instanceof Error ? error.message : "지갑 연결 실패", true);
  }
}

function disconnectWallet(): void {
  clearWalletSession();
  clearQrcode();
  updateWalletStatusFromSession();
}

async function init(): Promise<void> {
  const repositories = await createRepositories();
  const [profile, donations, foundations] = await Promise.all([
    repositories.userRepository.getProfile(USER_ID),
    repositories.donationRepository.listDonationsByUser(USER_ID),
    repositories.foundationRepository.list(),
  ]);

  if (!profile || !eligibilityEl || !optionsEl) {
    return;
  }

  const nftCount = donations.filter((item) => item.nftStatus === "minted" && item.proofNftId).length;
  const eligible = nftCount > 0;
  const weight = TIER_WEIGHT[profile.tier] ?? 1;

  eligibilityEl.className = eligible ? "notice" : "notice error";
  eligibilityEl.innerHTML = eligible
    ? `투표 가능: ${profile.displayName} 님 · NFT ${nftCount}개 보유 · 티어 <strong>${profile.tier.toUpperCase()}</strong> · 가중치 <strong>${weight}표</strong>`
    : `투표 불가: Proof NFT 보유가 확인되지 않았습니다. 기부 후 NFT를 발급받아 참여해 주세요.`;

  const candidates = foundations.filter((foundation) =>
    ["fnd_truve-community", "fnd_green-earth", "fnd_next-class", "fnd_relief-now"].includes(foundation.id),
  );
  const voteState = loadVoteState(candidates.map((item) => item.id));
  renderResults(candidates, voteState);
  renderTxLog();
  updateWalletStatusFromSession();

  connectBtnEl?.addEventListener("click", () => {
    void connectWallet();
  });
  disconnectBtnEl?.addEventListener("click", () => {
    disconnectWallet();
  });

  optionsEl.innerHTML = candidates
    .map((candidate) => {
      return `
        <article class="vote-option">
          <div class="row-between">
            <strong>${candidate.name}</strong>
            <span class="badge">${candidate.region}</span>
          </div>
          <p class="section-desc">${candidate.description}</p>
          <button class="btn btn-primary mt-12" data-vote-id="${candidate.id}" ${eligible ? "" : "disabled"}>
            이 재단에 투표
          </button>
        </article>
      `;
    })
    .join("");

  optionsEl.querySelectorAll<HTMLButtonElement>("[data-vote-id]").forEach((button) => {
    button.addEventListener("click", async () => {
      const candidateId = button.dataset.voteId;
      if (!candidateId || !eligible) {
        return;
      }

      const wallet = getWalletSession();
      if (!wallet) {
        window.alert("먼저 Xaman 지갑을 연결해 주세요.");
        return;
      }

      const candidate = candidates.find((item) => item.id === candidateId);
      if (!candidate) {
        return;
      }

      try {
        button.disabled = true;
        const payload = await createMemoPayload({
          account: wallet.account,
          destination: candidate.walletAddress,
          amountDrops: "1",
          memoType: "TRUVE_GOV_VOTE",
          memoData: JSON.stringify({
            proposalId: PROPOSAL_ID,
            candidateId,
            weight,
            userId: USER_ID,
            createdAt: new Date().toISOString(),
          }).slice(0, 230),
        });

        renderQrcode(payload.qrPngUrl, payload.deepLink);
        const signed = await waitForPayloadResolution(payload.uuid);
        if (!signed.signed || !signed.txHash) {
          window.alert("투표 트랜잭션 서명이 거절되었습니다.");
          return;
        }

        const validated = await waitForTxValidation(signed.txHash);
        const status = validated.validated ? "validated" : "signed";

        voteState[candidateId] = (voteState[candidateId] ?? 0) + weight;
        saveVoteState(voteState);
        renderResults(candidates, voteState);

        const voteRecord: GovernanceVoteRecord = {
          id: `gov_${Date.now()}`,
          userId: USER_ID,
          proposalId: PROPOSAL_ID,
          candidateId,
          candidateName: candidate.name,
          weight,
          txHash: signed.txHash,
          explorerUrl: validated.explorerUrl,
          validationStatus: status,
          createdAt: new Date().toISOString(),
        };
        upsertGovernanceRecord(voteRecord);
        renderTxLog();
        window.alert(`투표가 온체인에 기록되었습니다. (${status})`);
      } catch (error) {
        window.alert(error instanceof Error ? error.message : "투표 처리 중 오류가 발생했습니다.");
      } finally {
        button.disabled = false;
      }
    });
  });
}

void init();
