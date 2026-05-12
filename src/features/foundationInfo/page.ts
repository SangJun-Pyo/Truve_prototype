import type { Foundation } from "../../api";
import { createRepositories } from "../../api/provider";
import { categoryToKorean } from "../../components/explorerCard";

const PAGE_SIZE = 6;

let foundations: Foundation[] = [];
let currentPage = 1;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function shortWallet(address: string): string {
  if (address.length <= 14) return address;
  return `${address.slice(0, 6)}...${address.slice(-5)}`;
}

function levelLabel(level: Foundation["trustMetrics"]["verificationLevel"]): string {
  switch (level) {
    case "premium":
      return "Credential Ready";
    case "verified":
      return "Verified";
    default:
      return "Basic Review";
  }
}

function isVerified(foundation: Foundation): boolean {
  return foundation.trustMetrics.verificationLevel !== "basic" && foundation.trustMetrics.proofCoveragePct >= 90;
}

function renderTagList(foundation: Foundation): string {
  const tags = [categoryToKorean(foundation.category), foundation.region, ...foundation.tags.slice(0, 2)];
  return tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
}

function renderFoundationListItem(foundation: Foundation): string {
  return `
    <article class="foundation-list-card card foundation-hub-card">
      <div class="foundation-list-main">
        <div class="foundation-card-topline">
          <span>${escapeHtml(levelLabel(foundation.trustMetrics.verificationLevel))}</span>
          <em>${foundation.trustMetrics.proofCoveragePct}%</em>
        </div>
        <div>
          <p class="summary-kicker">${escapeHtml(categoryToKorean(foundation.category))} 쨌 ${escapeHtml(foundation.region)}</p>
          <h2>${escapeHtml(foundation.name)}</h2>
          <p class="foundation-card-desc">${escapeHtml(foundation.description)}</p>
        </div>
        <div class="foundation-list-meta">${renderTagList(foundation)}</div>
      </div>
      <div class="foundation-list-side">
        <div class="foundation-card-proof">
          <span>?섎졊 ?먯궛</span>
          <strong>RLUSD 쨌 USDC</strong>
          <span>吏媛?/span>
          <strong>${escapeHtml(shortWallet(foundation.walletAddress))}</strong>
        </div>
        <a class="primary-link-button" href="./foundation-detail.html?id=${encodeURIComponent(foundation.id)}">?곸꽭 蹂닿린</a>
      </div>
    </article>
  `;
}

function bindPanelTabs(): void {
  const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>(".foundation-tab"));
  const panels = Array.from(document.querySelectorAll<HTMLElement>(".foundation-panel"));

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.panel;
      tabs.forEach((item) => item.classList.toggle("is-active", item === tab));
      panels.forEach((panel) => panel.classList.toggle("is-active", panel.id === `foundation-panel-${target}`));
    });
  });
}

export function initFoundationInfoPage(): void {
  const listEl = document.getElementById("foundation-info-list");
  const countEl = document.getElementById("foundation-info-count");
  const searchEl = document.getElementById("foundation-info-search") as HTMLInputElement | null;
  const categoryEl = document.getElementById("foundation-info-category") as HTMLSelectElement | null;
  const verifiedEl = document.getElementById("foundation-info-verified") as HTMLSelectElement | null;
  const paginationEl = document.getElementById("foundation-info-pagination");

  function filterFoundations(): Foundation[] {
    const query = (searchEl?.value ?? "").trim().toLowerCase();
    const category = categoryEl?.value ?? "";
    const verifiedOnly = verifiedEl?.value === "verified";

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
      const verifiedMatch = !verifiedOnly || isVerified(foundation);
      return queryMatch && categoryMatch && verifiedMatch;
    });
  }

  function renderPagination(totalItems: number): void {
    if (!paginationEl) return;
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
    if (totalPages <= 1) {
      paginationEl.innerHTML = "";
      return;
    }

    const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
    paginationEl.innerHTML = `
      <button type="button" data-page="${Math.max(1, currentPage - 1)}" ${currentPage === 1 ? "disabled" : ""} aria-label="?댁쟾 ?섏씠吏">??/button>
      ${pages
        .map(
          (page) =>
            `<button type="button" data-page="${page}" class="${page === currentPage ? "is-active" : ""}" aria-label="${page}?섏씠吏">${page}</button>`,
        )
        .join("")}
      <button type="button" data-page="${Math.min(totalPages, currentPage + 1)}" ${currentPage === totalPages ? "disabled" : ""} aria-label="?ㅼ쓬 ?섏씠吏">??/button>
    `;
  }

  function render(): void {
    if (!listEl) return;
    const filtered = filterFoundations();
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    currentPage = Math.min(currentPage, totalPages);
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = filtered.slice(start, start + PAGE_SIZE);

    if (countEl) {
      countEl.textContent = `${filtered.length.toLocaleString("ko-KR")}怨?`;
    }

    if (filtered.length === 0) {
      listEl.innerHTML = `<div class="empty-state">議곌굔??留욌뒗 ?щ떒???놁뒿?덈떎.</div>`;
      renderPagination(0);
      return;
    }

    listEl.innerHTML = pageItems.map(renderFoundationListItem).join("");
    renderPagination(filtered.length);
  }

  function resetAndRender(): void {
    currentPage = 1;
    render();
  }

  async function init(): Promise<void> {
    bindPanelTabs();
    const repositories = await createRepositories();
    foundations = await repositories.foundationRepository.list();
    render();
  }

  searchEl?.addEventListener("input", resetAndRender);
  categoryEl?.addEventListener("change", resetAndRender);
  verifiedEl?.addEventListener("change", resetAndRender);
  paginationEl?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement) || target.disabled) return;
    const nextPage = Number(target.dataset.page);
    if (!Number.isFinite(nextPage) || nextPage === currentPage) return;
    currentPage = nextPage;
    render();
    document.getElementById("foundation-panel-directory")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  void init();
}
