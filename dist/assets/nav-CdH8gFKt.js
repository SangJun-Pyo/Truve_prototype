var e=[{id:`foundations`,label:`기부 탐색`,href:`./foundations.html`},{id:`donation`,label:`기부 담기`,href:`./donation.html`},{id:`governance`,label:`거버넌스`,href:`./governance.html`},{id:`status`,label:`내 기부 현황`,href:`./status.html`},{id:`about`,label:`서비스 소개`,href:`./about.html`}];function t(t){return`
    <header class="app-header">
      <h1 class="brand">Truve.</h1>
      <p class="sub-copy">Trust + Give · XRPL Testnet Prototype</p>
    </header>
    <nav class="tab-nav" aria-label="Main Navigation">
      ${e.map(e=>`<a class="${e.id===t?`tab-link is-active`:`tab-link`}" href="${e.href}">${e.label}</a>`).join(``)}
    </nav>
  `}export{t};