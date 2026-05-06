function e(e){return{climate:`환경`,education:`아동/교육`,health:`의료`,animal:`동물`,humanitarian:`긴급구호`}[e]}function t(e){return{climate:[`#FFF0E5`,`#FDBA74`],education:[`#F8FAFC`,`#CBD5E1`],health:[`#FFE4E6`,`#FDA4AF`],animal:[`#ECFEFF`,`#67E8F9`],humanitarian:[`#EEF2FF`,`#A5B4FC`]}[e]}function n(n,r){let[i,a]=t(n.category);return`
    <article class="card explore-card" data-card-id="${n.id}">
      <div class="card-visual" style="background: linear-gradient(135deg, ${i}, ${a})">
        <div class="visual-pattern"></div>
      </div>
      <div class="card-content">
        <div class="card-header">
          <h3 class="card-title">${n.name}</h3>
          <span class="card-tag">${e(n.category)}</span>
        </div>
        <p class="card-desc">${n.description}</p>
        <a class="foundation-info-link" href="./foundation-info.html#${n.id}">소개 보기</a>
        <div class="card-footer">
          <div class="metric">
            <span class="metric-label">데이터 완성도</span>
            <span class="metric-value">${n.trustMetrics.proofCoveragePct}%</span>
          </div>
          <button class="add-btn add-to-cart-btn ${r?`is-added`:``}" aria-label="장바구니 담기" data-add-id="${n.id}" ${r?`disabled`:``} type="button">
            ${r?`<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>`:`<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`}
          </button>
        </div>
      </div>
    </article>
  `}export{n,e as t};