/* empty css               */import"./modulepreload-polyfill-Btlm8H0F.js";import{t as e}from"./provider-CJy0T7hV.js";import{t}from"./explorerCard-vk88b9WG.js";import{t as n}from"./nav-BPJhJNtb.js";var r=document.getElementById(`top-nav`);r&&(r.innerHTML=n(`foundation-info`));var i=document.getElementById(`foundation-info-list`),a=document.getElementById(`foundation-info-count`),o=document.getElementById(`foundation-info-search`),s=document.getElementById(`foundation-info-category`),c=[];function l(e){return`${e.slice(0,8)}...${e.slice(-6)}`}function u(e){return{basic:`Basic`,verified:`Verified`,premium:`Premium`}[e]}function d(){let e=(o?.value??``).trim().toLowerCase(),n=s?.value??``;return c.filter(r=>{let i=[r.name,r.region,r.description,r.tags.join(` `),t(r.category)].join(` `).toLowerCase(),a=e.length===0||i.includes(e),o=n.length===0||r.category===n;return a&&o})}function f(e){let n=e.tags.map(e=>`<span>${e}</span>`).join(``);return`
    <article id="${e.id}" class="foundation-profile card">
      <div class="foundation-profile-main">
        <div>
          <p class="summary-kicker">${t(e.category)} · ${e.region}</p>
          <h2>${e.name}</h2>
        </div>
        <p>${e.description}</p>
        <div class="foundation-profile-tags">${n}</div>
      </div>
      <aside class="foundation-profile-side">
        <div>
          <span>데이터 완성도</span>
          <strong>${e.trustMetrics.proofCoveragePct}%</strong>
        </div>
        <div>
          <span>검증 레벨</span>
          <strong>${u(e.trustMetrics.verificationLevel)}</strong>
        </div>
        <div>
          <span>수령 지갑</span>
          <strong title="${e.walletAddress}">${l(e.walletAddress)}</strong>
        </div>
        <a class="primary-link-button" href="./foundations.html">기부하기</a>
      </aside>
    </article>
  `}function p(){if(!i)return;let e=d();if(a&&(a.textContent=`${c.length.toLocaleString(`ko-KR`)}곳`),e.length===0){i.innerHTML=`<div class="empty-state">조건에 맞는 재단이 없습니다.</div>`;return}i.innerHTML=e.map(f).join(``)}async function m(){c=await(await e()).foundationRepository.list(),p();let t=decodeURIComponent(window.location.hash.replace(`#`,``));t&&requestAnimationFrame(()=>{document.getElementById(t)?.scrollIntoView({behavior:`smooth`,block:`start`})})}o?.addEventListener(`input`,p),s?.addEventListener(`change`,p),m();