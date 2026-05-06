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

function filterFoundations(): Foundation[] {
  const query = (searchEl?.value ?? "").trim().toLowerCase();
  const category = categoryEl?.value ?? "";

  return foundations.filter((foundation) => {
    const searchable = [
      foundation.name,
      foundation.region,
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

function renderFoundationListItem(foundation: Foundation): string {
  return `
    <article class="foundation-list-card card">
      <div>
        <p class="summary-kicker">${categoryToKorean(foundation.category)} · ${foundation.region}</p>
        <h2>${foundation.name}</h2>
      </div>
      <div class="foundation-list-meta">
        <span>데이터 완성도 ${foundation.trustMetrics.proofCoveragePct}%</span>
        <span>${foundation.trustMetrics.verificationLevel.toUpperCase()}</span>
      </div>
      <a class="primary-link-button" href="./foundation-detail.html?id=${foundation.id}">상세 보기</a>
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

  listEl.innerHTML = filtered.map(renderFoundationListItem).join("");
}

async function init(): Promise<void> {
  const repositories = await createRepositories();
  foundations = await repositories.foundationRepository.list();
  render();
}

searchEl?.addEventListener("input", render);
categoryEl?.addEventListener("change", render);

void init();
