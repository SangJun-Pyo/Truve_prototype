import type { Foundation } from "../api";
import { createRepositories } from "../api/provider";
import { renderTopNav } from "../shared/nav";

const STORAGE_KEY = "truve_governance_round_1";
const USER_ID = "usr_demo_001";
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
    button.addEventListener("click", () => {
      const id = button.dataset.voteId;
      if (!id || !eligible) {
        return;
      }
      voteState[id] = (voteState[id] ?? 0) + weight;
      saveVoteState(voteState);
      renderResults(candidates, voteState);
      window.alert(`투표가 반영되었습니다. (${weight}표 가중치 적용)`);
    });
  });
}

void init();
