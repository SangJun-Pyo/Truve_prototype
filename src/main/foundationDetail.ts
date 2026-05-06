import type { Foundation } from "../api";
import { createRepositories } from "../api/provider";
import { categoryToKorean } from "../components/explorerCard";
import { renderTopNav } from "../shared/nav";

const navRoot = document.getElementById("top-nav");
if (navRoot) {
  navRoot.innerHTML = renderTopNav("foundation-info");
}

const rootEl = document.getElementById("foundation-detail-root");

function shortWallet(address: string): string {
  return `${address.slice(0, 10)}...${address.slice(-8)}`;
}

function renderDetail(foundation: Foundation): string {
  const tags = foundation.tags.map((tag) => `<span>${tag}</span>`).join("");
  return `
    <header class="page-header foundation-detail-hero">
      <p class="summary-kicker">${categoryToKorean(foundation.category)} · ${foundation.region}</p>
      <h1>${foundation.name}</h1>
      <p class="subtitle">${foundation.description}</p>
      <div class="foundation-profile-tags">${tags}</div>
    </header>

    <section class="foundation-detail-layout">
      <article class="card foundation-detail-main">
        <h2>재단 소개</h2>
        <p>${foundation.description}</p>
        <p>
          이 페이지의 재단 정보는 국세청 공개 목록을 바탕으로 구성한 프로토타입 데이터입니다.
          실제 서비스에서는 재단 승인 상태, 공식 지갑, 수령 가능 자산, 감사·증빙 자료를 추가 검증한 뒤 표시합니다.
        </p>
      </article>

      <aside class="card foundation-detail-side">
        <div>
          <span>데이터 완성도</span>
          <strong>${foundation.trustMetrics.proofCoveragePct}%</strong>
        </div>
        <div>
          <span>검증 레벨</span>
          <strong>${foundation.trustMetrics.verificationLevel.toUpperCase()}</strong>
        </div>
        <div>
          <span>업데이트 기준일</span>
          <strong>${foundation.trustMetrics.auditedAt}</strong>
        </div>
        <div>
          <span>테스트넷 수령 지갑</span>
          <strong title="${foundation.walletAddress}">${shortWallet(foundation.walletAddress)}</strong>
        </div>
        <a class="primary-link-button" href="./foundations.html">기부하기로 이동</a>
      </aside>
    </section>
  `;
}

async function init(): Promise<void> {
  if (!rootEl) return;
  const id = new URLSearchParams(window.location.search).get("id");
  const repositories = await createRepositories();
  const foundations = await repositories.foundationRepository.list();
  const foundation = foundations.find((item) => item.id === id) ?? foundations[0];

  if (!foundation) {
    rootEl.innerHTML = `<section class="card empty-state">재단 정보를 찾을 수 없습니다.</section>`;
    return;
  }

  rootEl.innerHTML = renderDetail(foundation);
}

void init();
