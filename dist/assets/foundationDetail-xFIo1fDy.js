import"./modulepreload-polyfill-eJgYjmQ8.js";/* empty css               */import{t as e}from"./provider-DrGARZ6r.js";import{t}from"./explorerCard-BE06kHR8.js";import{t as n}from"./nav-2t9yL-0h.js";var r=document.getElementById(`top-nav`);r&&(r.innerHTML=n(`foundation-info`));var i=document.getElementById(`foundation-detail-root`);function a(e){return`${e.slice(0,10)}...${e.slice(-8)}`}function o(e){let n=e.tags.map(e=>`<span>${e}</span>`).join(``);return`
    <header class="page-header foundation-detail-hero">
      <p class="summary-kicker">${t(e.category)} · ${e.region}</p>
      <h1>${e.name}</h1>
      <p class="subtitle">${e.description}</p>
      <div class="foundation-profile-tags">${n}</div>
    </header>

    <section class="foundation-detail-layout">
      <article class="card foundation-detail-main">
        <h2>재단 소개</h2>
        <p>${e.description}</p>
        <p>
          이 페이지의 재단 정보는 국세청 공개 목록을 바탕으로 구성한 프로토타입 데이터입니다.
          실제 서비스에서는 재단 승인 상태, 공식 지갑, 수령 가능 자산, 감사·증빙 자료를 추가 검증한 뒤 표시합니다.
        </p>
      </article>

      <aside class="card foundation-detail-side">
        <div>
          <span>데이터 완성도</span>
          <strong>${e.trustMetrics.proofCoveragePct}%</strong>
        </div>
        <div>
          <span>검증 레벨</span>
          <strong>${e.trustMetrics.verificationLevel.toUpperCase()}</strong>
        </div>
        <div>
          <span>업데이트 기준일</span>
          <strong>${e.trustMetrics.auditedAt}</strong>
        </div>
        <div>
          <span>테스트넷 수령 지갑</span>
          <strong title="${e.walletAddress}">${a(e.walletAddress)}</strong>
        </div>
        <a class="primary-link-button" href="./foundations.html">기부하기로 이동</a>
      </aside>
    </section>
  `}async function s(){if(!i)return;let t=new URLSearchParams(window.location.search).get(`id`),n=await(await e()).foundationRepository.list(),r=n.find(e=>e.id===t)??n[0];if(!r){i.innerHTML=`<section class="card empty-state">재단 정보를 찾을 수 없습니다.</section>`;return}i.innerHTML=o(r)}s();