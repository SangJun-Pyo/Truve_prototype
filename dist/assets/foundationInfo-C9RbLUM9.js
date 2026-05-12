import"./modulepreload-polyfill-eJgYjmQ8.js";import{n as e}from"./mobileRedirect-BpvrRV-s.js";/* empty css               */import{t}from"./provider-DrGARZ6r.js";import{t as n}from"./explorerCard-BE06kHR8.js";import{t as r}from"./nav-2t9yL-0h.js";var i=6,a=[],o=1;function s(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}function c(e){return e.length<=14?e:`${e.slice(0,6)}...${e.slice(-5)}`}function l(e){switch(e){case`premium`:return`Credential Ready`;case`verified`:return`Verified`;default:return`Basic Review`}}function u(e){return e.trustMetrics.verificationLevel!==`basic`&&e.trustMetrics.proofCoveragePct>=90}function d(e){return[n(e.category),e.region,...e.tags.slice(0,2)].map(e=>`<span>${s(e)}</span>`).join(``)}function f(e){return`
    <article class="foundation-list-card card foundation-hub-card">
      <div class="foundation-list-main">
        <div class="foundation-card-topline">
          <span>${s(l(e.trustMetrics.verificationLevel))}</span>
          <em>${e.trustMetrics.proofCoveragePct}%</em>
        </div>
        <div>
          <p class="summary-kicker">${s(n(e.category))} · ${s(e.region)}</p>
          <h2>${s(e.name)}</h2>
          <p class="foundation-card-desc">${s(e.description)}</p>
        </div>
        <div class="foundation-list-meta">${d(e)}</div>
      </div>
      <div class="foundation-list-side">
        <div class="foundation-card-proof">
          <span>결제/지갑</span>
          <strong>RLUSD · USDC</strong>
          <span>주소</span>
          <strong>${s(c(e.walletAddress))}</strong>
        </div>
        <a class="primary-link-button" href="./foundation-detail.html?id=${encodeURIComponent(e.id)}">재단 소개 보기</a>
      </div>
    </article>
  `}function p(){let e=Array.from(document.querySelectorAll(`.foundation-tab`)),t=Array.from(document.querySelectorAll(`.foundation-panel`));e.forEach(n=>{n.addEventListener(`click`,()=>{let r=n.dataset.panel;e.forEach(e=>e.classList.toggle(`is-active`,e===n)),t.forEach(e=>e.classList.toggle(`is-active`,e.id===`foundation-panel-${r}`))})})}function m(){let e=document.getElementById(`foundation-info-list`),r=document.getElementById(`foundation-info-count`),s=document.getElementById(`foundation-info-search`),c=document.getElementById(`foundation-info-category`),l=document.getElementById(`foundation-info-verified`),d=document.getElementById(`foundation-info-pagination`);function m(){let e=(s?.value??``).trim().toLowerCase(),t=c?.value??``,r=l?.value===`verified`;return a.filter(i=>{let a=[i.name,i.region,i.description,i.tags.join(` `),n(i.category)].join(` `).toLowerCase(),o=e.length===0||a.includes(e),s=t.length===0||i.category===t,c=!r||u(i);return o&&s&&c})}function h(e){if(!d)return;let t=Math.max(1,Math.ceil(e/i));if(t<=1){d.innerHTML=``;return}let n=Array.from({length:t},(e,t)=>t+1);d.innerHTML=`
      <button type="button" data-page="${Math.max(1,o-1)}" ${o===1?`disabled`:``} aria-label="이전 페이지">‹</button>
      ${n.map(e=>`<button type="button" data-page="${e}" class="${e===o?`is-active`:``}" aria-label="${e}페이지">${e}</button>`).join(``)}
      <button type="button" data-page="${Math.min(t,o+1)}" ${o===t?`disabled`:``} aria-label="다음 페이지">›</button>
    `}function g(){if(!e)return;let t=m(),n=Math.max(1,Math.ceil(t.length/i));o=Math.min(o,n);let a=(o-1)*i,s=t.slice(a,a+i);if(r&&(r.textContent=`${t.length.toLocaleString(`ko-KR`)}개`),t.length===0){e.innerHTML=`<div class="empty-state">조건에 맞는 재단이 없습니다.</div>`,h(0);return}e.innerHTML=s.map(f).join(``),h(t.length)}function _(){o=1,g()}async function v(){p(),a=await(await t()).foundationRepository.list(),g()}s?.addEventListener(`input`,_),c?.addEventListener(`change`,_),l?.addEventListener(`change`,_),d?.addEventListener(`click`,e=>{let t=e.target;if(!(t instanceof HTMLButtonElement)||t.disabled)return;let n=Number(t.dataset.page);!Number.isFinite(n)||n===o||(o=n,g(),document.getElementById(`foundation-panel-directory`)?.scrollIntoView({behavior:`smooth`,block:`start`}))}),v()}e();var h=document.getElementById(`top-nav`);h&&(h.innerHTML=r(`foundation-info`)),m();