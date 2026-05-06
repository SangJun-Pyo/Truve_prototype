import type { DonationBundle, Foundation } from "../api";

function getBundleCover(theme: string): string {
  const map: Record<string, string> = {
    balanced: "education",
    health: "health",
    relief: "humanitarian",
    "local-care": "animal",
  };
  return map[theme] ?? "education";
}

export function renderBundleCard(bundle: DonationBundle, foundations: Foundation[]): string {
  const names = bundle.allocations
    .map((allocation) => {
      const foundation = foundations.find((item) => item.id === allocation.foundationId);
      return foundation?.name ?? allocation.foundationId;
    })
    .slice(0, 3)
    .join(", ");

  const coverImage = getBundleCover(bundle.theme);

  return `
    <article class="card explore-card" data-bundle-card-id="${bundle.id}">
      <div class="card-visual" style="background-image: url('./foundation-covers/${coverImage}.svg')"></div>
      <div class="card-content">
        <div class="card-header">
          <h3 class="card-title">${bundle.name}</h3>
          <span class="card-tag">추천 포트폴리오</span>
        </div>
        <div class="metric mb-12">
          <span class="metric-label">포함 재단</span>
          <span class="metric-value">${bundle.allocations.length}개 · ${names}</span>
        </div>
        <div class="card-footer">
          <div class="metric">
            <span class="metric-label">테마</span>
            <span class="metric-value">${bundle.theme.toUpperCase()}</span>
          </div>
          <button class="add-btn add-bundle-btn" data-bundle-id="${bundle.id}" type="button" aria-label="한 번에 담기">
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
        </div>
      </div>
    </article>
  `;
}
