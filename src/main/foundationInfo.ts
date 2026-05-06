import type { Foundation } from "../api";
import { createRepositories } from "../api/provider";
import { categoryToKorean } from "../components/explorerCard";
import { renderTopNav } from "../shared/nav";

const navRoot = document.getElementById("top-nav");
if (navRoot) {
  navRoot.innerHTML = renderTopNav("foundation-info");
}

const listEl = document.getElementById("foundation-info-list");
const countEl = document.getElementById("foundation-info-count");
const searchEl = document.getElementById("foundation-info-search") as HTMLInputElement | null;
const categoryEl = document.getElementById("foundation-info-category") as HTMLSelectElement | null;

let foundations: Foundation[] = [];

function shortWallet(address: string): string {
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

function verificationLabel(level: Foundation["trustMetrics"]["verificationLevel"]): string {
  const labels: Record<Foundation["trustMetrics"]["verificationLevel"], string> = {
    basic: "Basic",
    verified: "Verified",
    premium: "Premium",
  };
  return labels[level];
}

function filterFoundations(): Foundation[] {
  const query = (searchEl?.value ?? "").trim().toLowerCase();
  const category = categoryEl?.value ?? "";

  return foundations.filter((foundation) => {
    const searchable = [
      foundation.name,
      foundation.region,
      foundation.description,
      foundation.tags.join(" "),
      categoryToKorean(foundation.category),
    ]
      .join(" ")
      .toLowerCase();
    const queryMatch = query.length === 0 || searchable.includes(query);
    const categoryMatch = category.length === 0 || foundation.category === category;
    return queryMatch && categoryMatch;
  });
}

function renderFoundation(foundation: Foundation): string {
  const tags = foundation.tags.map((tag) => `<span>${tag}</span>`).join("");

  return `
    <article id="${foundation.id}" class="foundation-profile card">
      <div class="foundation-profile-main">
        <div>
          <p class="summary-kicker">${categoryToKorean(foundation.category)} · ${foundation.region}</p>
          <h2>${foundation.name}</h2>
        </div>
        <p>${foundation.description}</p>
        <div class="foundation-profile-tags">${tags}</div>
      </div>
      <aside class="foundation-profile-side">
        <div>
          <span>데이터 완성도</span>
          <strong>${foundation.trustMetrics.proofCoveragePct}%</strong>
        </div>
        <div>
          <span>검증 레벨</span>
          <strong>${verificationLabel(foundation.trustMetrics.verificationLevel)}</strong>
        </div>
        <div>
          <span>수령 지갑</span>
          <strong title="${foundation.walletAddress}">${shortWallet(foundation.walletAddress)}</strong>
        </div>
        <a class="primary-link-button" href="./foundations.html">기부하기</a>
      </aside>
    </article>
  `;
}

function render(): void {
  if (!listEl) return;
  const filtered = filterFoundations();

  if (countEl) {
    countEl.textContent = `${foundations.length.toLocaleString("ko-KR")}곳`;
  }

  if (filtered.length === 0) {
    listEl.innerHTML = `<div class="empty-state">조건에 맞는 재단이 없습니다.</div>`;
    return;
  }

  listEl.innerHTML = filtered.map(renderFoundation).join("");
}

async function init(): Promise<void> {
  const repositories = await createRepositories();
  foundations = await repositories.foundationRepository.list();
  render();

  const hashId = decodeURIComponent(window.location.hash.replace("#", ""));
  if (hashId) {
    requestAnimationFrame(() => {
      document.getElementById(hashId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

searchEl?.addEventListener("input", render);
categoryEl?.addEventListener("change", render);

void init();
