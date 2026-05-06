/* empty css               */import"./modulepreload-polyfill-CfRWewTA.js";import{t as e}from"./provider-wBI-_yYj.js";import{t}from"./explorerCard-D2FI8z-m.js";import{t as n}from"./nav-BPnoixS_.js";var r=document.getElementById(`top-nav`);r&&(r.innerHTML=n(`foundation-info`));var i=document.getElementById(`foundation-info-list`),a=document.getElementById(`foundation-info-count`),o=document.getElementById(`foundation-info-search`),s=document.getElementById(`foundation-info-category`),c=[];function l(){let e=(o?.value??``).trim().toLowerCase(),n=s?.value??``;return c.filter(r=>{let i=[r.name,r.region,r.tags.join(` `),t(r.category)].join(` `).toLowerCase(),a=e.length===0||i.includes(e),o=n.length===0||r.category===n;return a&&o})}function u(e){return`
    <article class="foundation-list-card card">
      <div>
        <p class="summary-kicker">${t(e.category)} · ${e.region}</p>
        <h2>${e.name}</h2>
      </div>
      <div class="foundation-list-meta">
        <span>데이터 완성도 ${e.trustMetrics.proofCoveragePct}%</span>
        <span>${e.trustMetrics.verificationLevel.toUpperCase()}</span>
      </div>
      <a class="primary-link-button" href="./foundation-detail.html?id=${e.id}">상세 보기</a>
    </article>
  `}function d(){if(!i)return;let e=l();if(a&&(a.textContent=`${c.length.toLocaleString(`ko-KR`)}곳`),e.length===0){i.innerHTML=`<div class="empty-state">조건에 맞는 재단이 없습니다.</div>`;return}i.innerHTML=e.map(u).join(``)}async function f(){c=await(await e()).foundationRepository.list(),d()}o?.addEventListener(`input`,d),s?.addEventListener(`change`,d),f();