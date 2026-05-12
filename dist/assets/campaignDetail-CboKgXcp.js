import{n as e}from"./mobileRedirect-BpvrRV-s.js";import{t}from"./campaignDetails-D_vrAlFq.js";import{t as n}from"./nav-2t9yL-0h.js";e();var r=document.getElementById(`top-nav`);r&&(r.innerHTML=n(`foundation-info`));var i=document.getElementById(`campaign-detail-root`),a=t(window.location.pathname);function o(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}function s(e){return`
    <div class="campaign-progress detail-progress" aria-label="${e}% 달성">
      <div class="campaign-progress-head">
        <span>${e}% ${e>=100?`완료`:`달성`}</span>
        <strong>${e>=100?`결과보고 기반`:`모금 진행 중`}</strong>
      </div>
      <div class="campaign-progress-track"><span style="width:${e}%"></span></div>
    </div>
  `}function c(){if(i){if(!a){i.innerHTML=`
      <section class="card campaign-detail-empty">
        <p class="summary-kicker">Campaign Detail</p>
        <h1>캠페인 정보를 찾을 수 없습니다.</h1>
        <a class="primary-link-button" href="./foundation-info.html">프로젝트 모금으로 돌아가기</a>
      </section>
    `;return}i.innerHTML=`
    <header class="campaign-detail-hero card">
      <div class="campaign-detail-copy">
        <p class="summary-kicker">Good Neighbors ${o(a.documentType)}</p>
        <h1>${o(a.title)}</h1>
        <p>${o(a.summary)}</p>
        <div class="campaign-detail-actions">
          <a class="primary-link-button" href="./foundations.html#campaigns">이 프로젝트에 기부하기</a>
          <a class="secondary-link-button" href="./foundation-info.html#foundation-panel-campaigns">프로젝트 목록</a>
        </div>
      </div>
      <div class="campaign-detail-visual campaign-detail-visual-${a.visual}">
        <img src="${o(a.imageSrc)}" alt="${o(a.imageAlt)}" />
        <div class="campaign-detail-visual-label">
          <span>${o(a.documentType)}</span>
          <strong>${o(a.country)}</strong>
          <small>${o(a.region)}</small>
        </div>
      </div>
    </header>

    <section class="campaign-detail-grid">
      <article class="card campaign-detail-overview">
        <div class="campaign-card-topline">
          <span class="card-tag">${o(a.status)}</span>
          <span class="campaign-region">${o(a.category)}</span>
        </div>
        <h2>사업 개요</h2>
        <div class="campaign-detail-metrics">
          <div>
            <span>기준 금액</span>
            <strong>${o(a.targetLabel)}</strong>
          </div>
          <div>
            <span>현재 상태</span>
            <strong>${o(a.raisedLabel)}</strong>
          </div>
          ${a.stats.map(e=>`
                <div>
                  <span>${o(e.label)}</span>
                  <strong>${o(e.value)}</strong>
                </div>
              `).join(``)}
        </div>
        ${s(a.progress)}
        <p class="campaign-source-note">자료 출처: ${o(a.sourceDocument)} 기반 요약</p>
      </article>

      <article class="card campaign-detail-highlights">
        <h2>핵심 포인트</h2>
        <ul>
          ${a.highlights.map(e=>`<li>${o(e)}</li>`).join(``)}
        </ul>
      </article>
    </section>

    <section class="campaign-detail-sections">
      ${a.sections.map(e=>`
            <article class="card campaign-detail-section">
              <h2>${o(e.title)}</h2>
              <p>${o(e.body)}</p>
              <ul>
                ${e.bullets.map(e=>`<li>${o(e)}</li>`).join(``)}
              </ul>
            </article>
          `).join(``)}
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
        ${a.evidenceNotes.map(e=>`<li>${o(e)}</li>`).join(``)}
      </ul>
    </section>
  `}}c();