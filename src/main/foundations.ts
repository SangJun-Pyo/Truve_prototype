import type { Foundation } from "../api";
import { createRepositories } from "../api/provider";
import { renderTopNav } from "../shared/nav";

const navRoot = document.getElementById("top-nav");
if (navRoot) {
  navRoot.innerHTML = renderTopNav("foundations");
}

const searchInputEl = document.getElementById("search-input") as HTMLInputElement | null;
const categorySelectEl = document.getElementById("category-select") as HTMLSelectElement | null;
const foundationsGridEl = document.getElementById("foundations-grid");

let foundations: Foundation[] = [];

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

function filterFoundations(): Foundation[] {
  const query = (searchInputEl?.value ?? "").trim().toLowerCase();
  const category = categorySelectEl?.value ?? "";

  return foundations.filter((foundation) => {
    const searchable = `${foundation.name} ${foundation.description} ${foundation.tags.join(" ")}`.toLowerCase();
    const queryMatch = query.length === 0 || searchable.includes(query);
    const categoryMatch = category.length === 0 || foundation.category === category;
    return queryMatch && categoryMatch;
  });
}

function renderFoundations(): void {
  if (!foundationsGridEl) {
    return;
  }

  const filtered = filterFoundations();
  if (filtered.length === 0) {
    foundationsGridEl.innerHTML = `<div class="notice">조건에 맞는 재단이 없습니다.</div>`;
    return;
  }

  foundationsGridEl.innerHTML = filtered
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
          <p class="section-desc mt-12">${foundation.description}</p>
          <div class="trust mt-12">증빙 커버리지 ${foundation.trustMetrics.proofCoveragePct}%</div>
          <div class="inline-actions mt-12">
            <a class="btn btn-primary" href="./donation.html?add=${foundation.id}">기부 담기에 추가</a>
          </div>
        </article>
      `;
    })
    .join("");
}

function bindEvents(): void {
  searchInputEl?.addEventListener("input", renderFoundations);
  categorySelectEl?.addEventListener("change", renderFoundations);
}

async function init(): Promise<void> {
  const repositories = await createRepositories();
  foundations = await repositories.foundationRepository.list();
  bindEvents();
  renderFoundations();
}

void init();
