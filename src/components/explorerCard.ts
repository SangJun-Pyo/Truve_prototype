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

function getCoverImage(category: Foundation["category"]): string {
  const map: Record<Foundation["category"], string> = {
    climate: "climate",
    education: "education",
    health: "health",
    animal: "animal",
    humanitarian: "humanitarian",
  };
  return map[category];
}

function getFoundationInitial(name: string): string {
  return name.replace(/^(사단법인|사회복지법인|재단법인)\s*/, "").trim().slice(0, 1) || "T";
}

function getDonationCount(foundation: Foundation): string {
  const seed = Array.from(foundation.id).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return (8_400 + seed * 7).toLocaleString("ko-KR");
}

export function renderFoundationCard(foundation: Foundation, alreadyInCart: boolean): string {
  const coverImage = getCoverImage(foundation.category);

  return `
    <article class="card explore-card" data-card-id="${foundation.id}">
      <div class="foundation-card-top">
        <div class="foundation-logo" aria-hidden="true">${getFoundationInitial(foundation.name)}</div>
        <div class="foundation-asset-flow">
          <span>RLUSD</span>
          <span>USDC</span>
        </div>
      </div>
      <div class="card-visual" style="background-image: url('./foundation-covers/${coverImage}.svg')"></div>
      <div class="card-content">
        <div class="card-header">
          <h3 class="card-title">${foundation.name}</h3>
          <div class="foundation-meta-line">
            <span>${categoryToKorean(foundation.category)}</span>
            <span>${foundation.region}</span>
          </div>
        </div>
        <div class="foundation-card-stats">
          <div>
            <span class="metric-label">총 기부 건수</span>
            <strong>${getDonationCount(foundation)}</strong>
          </div>
          <div>
            <span class="metric-label">지원 자산</span>
            <strong>RLUSD · USDC</strong>
          </div>
        </div>
        <div class="trust-badge-row">
          <span class="trust-badge verified">Verified Foundation</span>
          <span class="trust-badge credential">Credential Ready</span>
        </div>
        <div class="card-footer">
          <a class="foundation-info-link" href="./foundation-detail.html?id=${foundation.id}">상세 보기 <span aria-hidden="true">→</span></a>
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
