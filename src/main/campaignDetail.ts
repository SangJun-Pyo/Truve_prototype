import { getCampaignDetailByPage } from "../data/campaignDetails";
import { redirectMobileVisitors } from "../shared/mobileRedirect";
import { renderTopNav } from "../shared/nav";

redirectMobileVisitors();

const navRoot = document.getElementById("top-nav");
if (navRoot) {
  navRoot.innerHTML = renderTopNav("foundation-info");
}

const root = document.getElementById("campaign-detail-root");
const currentCampaign = getCampaignDetailByPage(window.location.pathname);

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderProgress(progress: number): string {
  return `
    <div class="campaign-progress detail-progress" aria-label="${progress}% 달성">
      <div class="campaign-progress-head">
        <span>${progress}% ${progress >= 100 ? "완료" : "달성"}</span>
        <strong>${progress >= 100 ? "결과보고 기반" : "모금 진행 중"}</strong>
      </div>
      <div class="campaign-progress-track"><span style="width:${progress}%"></span></div>
    </div>
  `;
}

function render(): void {
  if (!root) return;
  if (!currentCampaign) {
    root.innerHTML = `
      <section class="card campaign-detail-empty">
        <p class="summary-kicker">Campaign Detail</p>
        <h1>캠페인 정보를 찾을 수 없습니다.</h1>
        <a class="primary-link-button" href="./foundation-info.html">프로젝트 모금으로 돌아가기</a>
      </section>
    `;
    return;
  }

  root.innerHTML = `
    <header class="campaign-detail-hero card">
      <div class="campaign-detail-copy">
        <p class="summary-kicker">Good Neighbors ${escapeHtml(currentCampaign.documentType)}</p>
        <h1>${escapeHtml(currentCampaign.title)}</h1>
        <p>${escapeHtml(currentCampaign.summary)}</p>
        <div class="campaign-detail-actions">
          <a class="primary-link-button" href="./foundations.html#campaigns">이 프로젝트에 기부하기</a>
          <a class="secondary-link-button" href="./foundation-info.html#foundation-panel-campaigns">프로젝트 목록</a>
        </div>
      </div>
      <div class="campaign-detail-visual campaign-detail-visual-${currentCampaign.visual}">
        <img src="${escapeHtml(currentCampaign.imageSrc)}" alt="${escapeHtml(currentCampaign.imageAlt)}" />
        <div class="campaign-detail-visual-label">
          <span>${escapeHtml(currentCampaign.documentType)}</span>
          <strong>${escapeHtml(currentCampaign.country)}</strong>
          <small>${escapeHtml(currentCampaign.region)}</small>
        </div>
      </div>
    </header>

    <section class="campaign-detail-grid">
      <article class="card campaign-detail-overview">
        <div class="campaign-card-topline">
          <span class="card-tag">${escapeHtml(currentCampaign.status)}</span>
          <span class="campaign-region">${escapeHtml(currentCampaign.category)}</span>
        </div>
        <h2>사업 개요</h2>
        <div class="campaign-detail-metrics">
          <div>
            <span>기준 금액</span>
            <strong>${escapeHtml(currentCampaign.targetLabel)}</strong>
          </div>
          <div>
            <span>현재 상태</span>
            <strong>${escapeHtml(currentCampaign.raisedLabel)}</strong>
          </div>
          ${currentCampaign.stats
            .map(
              (stat) => `
                <div>
                  <span>${escapeHtml(stat.label)}</span>
                  <strong>${escapeHtml(stat.value)}</strong>
                </div>
              `,
            )
            .join("")}
        </div>
        ${renderProgress(currentCampaign.progress)}
        <p class="campaign-source-note">자료 출처: ${escapeHtml(currentCampaign.sourceDocument)} 기반 요약</p>
      </article>

      <article class="card campaign-detail-highlights">
        <h2>핵심 포인트</h2>
        <ul>
          ${currentCampaign.highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </article>
    </section>

    <section class="campaign-detail-sections">
      ${currentCampaign.sections
        .map(
          (section) => `
            <article class="card campaign-detail-section">
              <h2>${escapeHtml(section.title)}</h2>
              <p>${escapeHtml(section.body)}</p>
              <ul>
                ${section.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}
              </ul>
            </article>
          `,
        )
        .join("")}
    </section>

    <section class="card campaign-detail-evidence">
      <div>
        <p class="summary-kicker">Truve Evidence</p>
        <h2>기부 기록과 어떻게 연결되나요?</h2>
        <p>
          이 상세 페이지의 사업 정보는 기부 시 선택한 Campaign Memo와 Evidence Package에 연결되어,
          결제 TX, 원화 환산액, Credential 상태와 함께 검증 가능한 증빙 흐름으로 이어질 수 있습니다.
        </p>
      </div>
      <ul>
        ${currentCampaign.evidenceNotes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}
      </ul>
    </section>
  `;
}

render();
