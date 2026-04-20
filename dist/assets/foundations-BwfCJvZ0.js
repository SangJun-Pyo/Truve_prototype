import{t as e}from"./provider-BW_KG98z.js";import{i as t,n,s as r,t as i}from"./cart-poU_UKBB.js";import{t as a}from"./nav-CMc74gyL.js";var o=[[`#E8F5E9`,`#C8E6C9`],[`#F3E8FF`,`#D8B4FE`],[`#FFEFD5`,`#FFD6A5`],[`#E6F4FF`,`#C5E2FF`]];function s(e,t){let n=e.allocations.map(e=>t.find(t=>t.id===e.foundationId)?.name??e.foundationId).slice(0,3).join(`, `),[r,i]=o[Math.abs(e.id.split(``).reduce((e,t)=>e+t.charCodeAt(0),0))%o.length];return`
    <article class="card explore-card" data-bundle-card-id="${e.id}">
      <div class="card-visual" style="background: linear-gradient(135deg, ${r}, ${i})">
        <div class="visual-pattern"></div>
      </div>
      <div class="card-content">
        <div class="card-header">
          <h3 class="card-title">${e.name}</h3>
          <span class="card-tag">ETF 묶음</span>
        </div>
        <p class="card-desc">${e.summary}</p>
        <div class="metric mb-12">
          <span class="metric-label">포함 재단</span>
          <span class="metric-value">${e.allocations.length}개 · ${n}</span>
        </div>
        <div class="card-footer">
          <div class="metric">
            <span class="metric-label">테마</span>
            <span class="metric-value">${e.theme.toUpperCase()}</span>
          </div>
          <button class="add-btn add-bundle-btn" data-bundle-id="${e.id}" type="button" aria-label="한 번에 담기">
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
        </div>
      </div>
    </article>
  `}function c(e){return{climate:`환경`,education:`아동/교육`,health:`의료`,animal:`동물`,humanitarian:`긴급구호`}[e]}function l(e){return{climate:[`#D6E4FF`,`#ADC8FF`],education:[`#FFF1B8`,`#FFD666`],health:[`#FFEBE6`,`#FFBDAD`],animal:[`#E0F2FE`,`#BAE6FD`],humanitarian:[`#F3E8FF`,`#D8B4FE`]}[e]}function u(e,t){let[n,r]=l(e.category);return`
    <article class="card explore-card" data-card-id="${e.id}">
      <div class="card-visual" style="background: linear-gradient(135deg, ${n}, ${r})">
        <div class="visual-pattern"></div>
      </div>
      <div class="card-content">
        <div class="card-header">
          <h3 class="card-title">${e.name}</h3>
          <span class="card-tag">${c(e.category)}</span>
        </div>
        <p class="card-desc">${e.description}</p>
        <div class="card-footer">
          <div class="metric">
            <span class="metric-label">투명성</span>
            <span class="metric-value">${e.trustMetrics.proofCoveragePct}%</span>
          </div>
          <button class="add-btn add-to-cart-btn ${t?`is-added`:``}" aria-label="장바구니 담기" data-add-id="${e.id}" ${t?`disabled`:``} type="button">
            ${t?`<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>`:`<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`}
          </button>
        </div>
      </div>
    </article>
  `}var d=document.getElementById(`top-nav`);d&&(d.innerHTML=a(`foundations`));var f=document.getElementById(`search-input`),p=document.getElementById(`category-select`),m=document.getElementById(`foundations-grid`),h=document.getElementById(`bundles-grid`),g=document.getElementById(`tab-foundation`),_=document.getElementById(`tab-bundle`),v=document.getElementById(`cart-count`),y=document.getElementById(`cart-fab`),b=[],x=[],S=`foundation`;function C(){v&&(v.classList.remove(`bump`),v.offsetWidth,v.classList.add(`bump`))}function w(){if(!v)return;let e=t();v.textContent=String(e),v.classList.toggle(`active`,e>0)}function T(){let e=(f?.value??``).trim().toLowerCase(),t=p?.value??``;return b.filter(n=>{let r=`${n.name} ${n.description} ${n.tags.join(` `)}`.toLowerCase(),i=e.length===0||r.includes(e),a=t.length===0||n.category===t;return i&&a})}function E(e){if(!y)return;let t=e.getBoundingClientRect(),n=y.getBoundingClientRect(),r=document.createElement(`div`);r.className=`flying-dot`;let i=t.left+t.width/2-10,a=t.top+t.height/2-10;r.style.left=`${i}px`,r.style.top=`${a}px`,document.body.appendChild(r),r.getBoundingClientRect();let o=n.left+n.width/2-10,s=n.top+n.height/2-10;r.style.transform=`translate(${o-i}px, ${s-a}px) scale(0.2)`,r.style.opacity=`0`,r.addEventListener(`transitionend`,()=>{r.remove()})}function D(){if(!m)return;let e=T();if(e.length===0){m.innerHTML=`<div class="empty-state">조건에 맞는 재단이 없습니다.</div>`;return}m.innerHTML=e.map(e=>u(e,r(e.id))).join(``),m.querySelectorAll(`.add-to-cart-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.addId;t&&(i(t),E(e),w(),C(),D())})})}function O(){h&&(h.innerHTML=x.map(e=>s(e,b)).join(``),h.querySelectorAll(`.add-bundle-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.bundleId;if(!t)return;let r=x.find(e=>e.id===t);r&&(n(r.allocations.map(e=>e.foundationId)),E(e),w(),C(),D(),e.innerHTML=`<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>`,e.disabled=!0,e.classList.add(`is-added`))})}))}function k(){if(!g||!_||!m||!h)return;let e=S===`foundation`;g.classList.toggle(`active`,e),_.classList.toggle(`active`,!e),m.classList.toggle(`hidden`,!e),h.classList.toggle(`hidden`,e)}function A(){f?.addEventListener(`input`,()=>{S===`foundation`&&D()}),p?.addEventListener(`change`,()=>{S===`foundation`&&D()}),g?.addEventListener(`click`,()=>{S=`foundation`,k(),D()}),_?.addEventListener(`click`,()=>{S=`bundle`,k(),O()})}async function j(){let t=await e();b=await t.foundationRepository.list(),x=await t.foundationRepository.listBundles(),A(),k(),D(),O(),w()}j();