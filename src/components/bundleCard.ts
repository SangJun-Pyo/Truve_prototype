import type { DonationBundle, Foundation } from "../api";

const BUNDLE_COLORS: Array<[string, string]> = [
  ["#FFF0E5", "#FDBA74"],
  ["#F8FAFC", "#CBD5E1"],
  ["#EEF2FF", "#A5B4FC"],
  ["#ECFEFF", "#67E8F9"],
];

export function renderBundleCard(bundle: DonationBundle, foundations: Foundation[]): string {
  const names = bundle.allocations
    .map((allocation) => {
      const foundation = foundations.find((item) => item.id === allocation.foundationId);
      return foundation?.name ?? allocation.foundationId;
    })
    .slice(0, 3)
    .join(", ");

  const [color1, color2] = BUNDLE_COLORS[Math.abs(bundle.id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0)) % BUNDLE_COLORS.length];

  return `
    <article class="card explore-card" data-bundle-card-id="${bundle.id}">
      <div class="card-visual" style="background: linear-gradient(135deg, ${color1}, ${color2})">
        <div class="visual-pattern"></div>
      </div>
      <div class="card-content">
        <div class="card-header">
          <h3 class="card-title">${bundle.name}</h3>
          <span class="card-tag">ETF 묶음</span>
        </div>
        <p class="card-desc">${bundle.summary}</p>
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
