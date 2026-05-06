var e=[{id:`foundations`,label:`기부하기`,href:`./foundations.html`},{id:`foundation-info`,label:`기부재단 소개`,href:`./foundation-info.html`},{id:`status`,label:`내 기부 현황`,href:`./status.html`},{id:`about`,label:`서비스 소개`,href:`./about.html`},{id:`admin`,label:`Admin`,href:`./admin.html`}];function t(t){return`
    <header class="app-header glass-nav">
      <a class="brand-lockup" href="./foundations.html" aria-label="Truve home">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 32 32">
            <path class="logo-layer logo-layer-top" d="M16 7 6 12.2 16 17.4 26 12.2 16 7Z"></path>
            <path class="logo-layer logo-layer-mid" d="M7.5 17.4 16 21.8 24.5 17.4"></path>
            <path class="logo-layer logo-layer-bottom" d="M8.5 22 16 25.8 23.5 22"></path>
          </svg>
        </span>
        <span class="brand">Truve</span>
      </a>
      <p class="sub-copy">XRPL Donation Credential infrastructure</p>
      <nav class="tab-nav" aria-label="Main Navigation">
        ${e.map(e=>`<a class="${e.id===t?`tab-link is-active`:`tab-link`}" href="${e.href}">${e.label}</a>`).join(``)}
      </nav>
    </header>
  `}export{t};