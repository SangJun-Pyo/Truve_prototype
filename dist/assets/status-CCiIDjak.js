/* empty css               */import"./modulepreload-polyfill-EeOZK34R.js";import{t as e}from"./provider-CBt5WCFb.js";import{i as t,n}from"./wallet-Lpa-4DqS.js";import{t as r}from"./donations-7IxgtyX5.js";import{t as i}from"./nav-DOCFXJ5j.js";var a=document.getElementById(`top-nav`);a&&(a.innerHTML=i(`status`));var o=document.getElementById(`status-summary`),s=document.getElementById(`status-timeline`),c=document.getElementById(`status-table`),l=`usr_demo_001`;function u(e){return`${new Intl.NumberFormat(`ko-KR`).format(e)}원`}function d(e){return new Intl.DateTimeFormat(`ko-KR`,{year:`numeric`,month:`2-digit`,day:`2-digit`,hour:`2-digit`,minute:`2-digit`}).format(new Date(e))}function f(e){return{paid:`결제 완료`,pending:`결제 대기`,failed:`결제 실패`,recorded:`증빙 기록 완료`,minted:`Proof NFT 발행 완료`,scheduled:`정산 예정`,done:`정산 완료`,error:`오류`}[e]??e}async function p(){let i=await e(),a=await i.userRepository.getProfile(l),p=await i.userRepository.getDonationStatus(l),m=await i.donationRepository.listDonationsByUser(l),h=n(),g=[];h&&(g=(await t(h.account)).map(e=>({id:e.id,userId:e.userId,donatedAt:e.donatedAt,amountKrw:e.amountKrw,allocations:e.allocations,paymentStatus:e.paymentStatus,proofStatus:e.proofStatus,nftStatus:e.nftStatus,settlementStatus:e.settlementStatus,txHash:e.txHash??void 0,proofNftId:e.proofNftId??void 0,explorerUrl:e.explorerUrl??void 0,validationStatus:e.validationStatus,source:`local`,dbId:e.id})));let _=r(m,l),v=new Set(g.map(e=>e.id)),y=[...g,..._.filter(e=>!v.has(e.dbId??``)&&!v.has(e.id))].sort((e,t)=>e.donatedAt<t.donatedAt?1:-1);if(!a||!p){o&&(o.innerHTML=`<div class="notice error">사용자 상태를 불러오지 못했습니다.</div>`);return}let b=y.reduce((e,t)=>e+t.amountKrw,0);o&&(o.innerHTML=`
      <div class="summary-box">
        <div class="summary-label">사용자</div>
        <div class="summary-value">${a.displayName}</div>
      </div>
      <div class="summary-box">
        <div class="summary-label">누적 기부금</div>
        <div class="summary-value">${u(b)}</div>
      </div>
      <div class="summary-box">
        <div class="summary-label">티어</div>
        <div class="summary-value">${a.tier.toUpperCase()}</div>
      </div>
    `),s&&(s.innerHTML=y.slice(0,3).map(e=>`
          <article class="timeline-item">
            <div class="row-between">
              <strong>${u(e.amountKrw)}</strong>
              <span class="badge">${d(e.donatedAt)}</span>
            </div>
            <div class="trust mt-12">1) ${f(e.paymentStatus)}</div>
            <div class="trust">2) ${f(e.proofStatus)}</div>
            <div class="trust">3) ${f(e.nftStatus)}</div>
            <div class="trust">4) ${f(e.settlementStatus)} · 검증 ${e.validationStatus??`-`}</div>
          </article>
        `).join(``)),c&&(c.innerHTML=`
      <table class="table">
        <thead>
          <tr>
            <th>일시</th>
            <th>금액</th>
            <th>정산/검증</th>
            <th>Proof 상태</th>
            <th>트랜잭션</th>
          </tr>
        </thead>
        <tbody>${y.map(e=>{let t=e.txHash?`<a class="text-link" href="https://testnet.xrpl.org/transactions/${e.txHash}" target="_blank" rel="noreferrer">${e.txHash}</a>`:`-`,n=e.proofMintStatus===`recorded`?`요청 기록 완료`:e.proofMintStatus===`requested`?`요청됨`:e.nftStatus===`minted`?`발행 완료`:`대기`;return`
          <tr>
            <td>${d(e.donatedAt)}</td>
            <td>${u(e.amountKrw)}</td>
            <td>${f(e.settlementStatus)} / ${e.validationStatus??`-`}</td>
            <td>${n}</td>
            <td>${t}</td>
          </tr>
        `}).join(``)}</tbody>
      </table>
    `)}p();