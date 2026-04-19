import type { Foundation } from "../api";

export function categoryToKorean(category: Foundation["category"]): string {
  const map: Record<Foundation["category"], string> = {
    climate: "환경",
    education: "아동/교육",
    health: "의료",
    animal: "동물",
    humanitarian: "긴급구호",
  };
  return map[category];
}

function getVisualColors(category: Foundation["category"]): [string, string] {
  const map: Record<Foundation["category"], [string, string]> = {
    climate: ["#D6E4FF", "#ADC8FF"],
    education: ["#FFF1B8", "#FFD666"],
    health: ["#FFEBE6", "#FFBDAD"],
    animal: ["#E0F2FE", "#BAE6FD"],
    humanitarian: ["#F3E8FF", "#D8B4FE"],
  };
  return map[category];
}

export function renderFoundationCard(foundation: Foundation, alreadyInCart: boolean): string {
  const [color1, color2] = getVisualColors(foundation.category);

  return `
    <article class="card explore-card" data-card-id="${foundation.id}">
      <div class="card-visual" style="background: linear-gradient(135deg, ${color1}, ${color2})">
        <div class="visual-pattern"></div>
      </div>
      <div class="card-content">
        <div class="card-header">
          <h3 class="card-title">${foundation.name}</h3>
          <span class="card-tag">${categoryToKorean(foundation.category)}</span>
        </div>
        <p class="card-desc">${foundation.description}</p>
        <div class="card-footer">
          <div class="metric">
            <span class="metric-label">투명성</span>
            <span class="metric-value">${foundation.trustMetrics.proofCoveragePct}%</span>
          </div>
          <button class="add-btn add-to-cart-btn ${alreadyInCart ? "is-added" : ""}" aria-label="장바구니 담기" data-add-id="${foundation.id}" ${
            alreadyInCart ? "disabled" : ""
          } type="button">
            ${
              alreadyInCart
                ? `<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>`
                : `<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`
            }
          </button>
        </div>
      </div>
    </article>
  `;
}
