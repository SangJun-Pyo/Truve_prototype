/* empty css               */import"./modulepreload-polyfill-iJ-6Fn-a.js";import{_ as e,d as t,n,p as r,v as i}from"./wallet-BizwjWsR.js";import{n as a,t as o}from"./donations-D7ZvcxFw.js";import{t as s}from"./proofNft-KXwwHBk3.js";import{t as c}from"./nav-DrZOEPA-.js";var l=document.getElementById(`top-nav`);l&&(l.innerHTML=c(`status`));var u=document.getElementById(`status-summary`),d=document.getElementById(`status-timeline`),f=document.getElementById(`status-table`),p=document.getElementById(`receipt-request-status`),m=document.getElementById(`status-tax-donor-type`),h=document.getElementById(`status-tax-income-range`),g=document.getElementById(`status-tax-profit-range`),_=document.getElementById(`status-tax-donation-type`),v=document.getElementById(`status-tax-income-field`),y=document.getElementById(`status-tax-profit-field`),b=document.getElementById(`status-tax-donation-type-field`),x=document.getElementById(`status-tax-source-badge`),S=document.getElementById(`status-tax-donation-amount`),C=document.getElementById(`status-tax-deduction-range`),w=document.getElementById(`status-tax-real-cost`),T=document.getElementById(`status-tax-explanation`),E=document.getElementById(`status-tax-law`),D=document.getElementById(`status-tax-calc-btn`),O=document.getElementById(`status-tax-partner-btn`),k=`usr_demo_001`,A=0,j=[],M=!1;function N(e){return`${new Intl.NumberFormat(`ko-KR`).format(e)}원`}function P(e){return`${Math.max(0,Math.round(e)).toLocaleString(`ko-KR`)} KRW`}function F(e){return new Intl.DateTimeFormat(`ko-KR`,{year:`numeric`,month:`2-digit`,day:`2-digit`,hour:`2-digit`,minute:`2-digit`}).format(new Date(e))}function I(e){return{paid:`결제 완료`,pending:`결제 대기`,failed:`결제 실패`,recorded:`증빙 기록 완료`,minted:`Proof NFT 발행 완료`,scheduled:`정산 예정`,done:`정산 완료`,error:`오류`}[e]??e}function L(){let e=m?.value===`법인`;v?.classList.toggle(`hidden`,e),y?.classList.toggle(`hidden`,!e),b?.classList.toggle(`hidden`,!e)}function R(){x&&(x.textContent=A>0?`READY`:`NO DATA`,x.className=A>0?`status-badge success`:`status-badge error`),S&&(S.textContent=N(A)),C&&(C.textContent=A>0?`계산 대기`:`기부 이력 없음`),w&&(w.textContent=`-`),T&&(T.textContent=A>0?`기부 이력과 기부자 유형을 기준으로 참고 추정치를 확인하세요.`:`계산할 기부 이력이 아직 없습니다. 기부 완료 후 다시 확인하세요.`),E&&(E.textContent=`관련 법령: -`),D&&(D.disabled=A<=0)}function z(){let e=m?.value===`법인`?`법인`:`개인`;return{donor_type:e,annual_income_range:e===`개인`?h?.value??`5천만원_이하`:void 0,annual_profit_range:e===`법인`?g?.value??`2억_이하`:void 0,donation_type:e===`법인`?_?.value??`지정기부금`:void 0,donation_amount:A}}function B(e){let t=Math.max(0,Math.round(e.estimated_deduction_min)),n=Math.max(t,Math.round(e.estimated_deduction_max));x&&(x.textContent=e.source===`anthropic`?`AI`:`ESTIMATE`,x.className=`status-badge success`),S&&(S.textContent=N(A)),C&&(C.textContent=`${P(t)} ~ ${P(n)}`),w&&(w.textContent=`${P(A-n)} ~ ${P(A-t)}`),T&&(T.textContent=e.explanation),E&&(E.textContent=`관련 법령: ${e.applicable_law}`)}async function V(){if(!(!D||A<=0))try{D.disabled=!0,D.textContent=`계산 중`,x&&(x.textContent=`RUNNING`,x.className=`status-badge success`);let t=await fetch(`${e}/api/tax-sim/calculate`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(z())});if(!t.ok){let e=await t.text();throw Error(`절세 시뮬레이션 오류: ${t.status} ${e}`)}B(await t.json())}catch(e){x&&(x.textContent=`ERROR`,x.className=`status-badge error`),T&&(T.textContent=e instanceof Error?e.message:`절세 시뮬레이션에 실패했습니다.`)}finally{D.disabled=A<=0,D.textContent=`내 기부 기준 계산`}}function H(){M||(M=!0,m?.addEventListener(`change`,()=>{L(),R()}),h?.addEventListener(`change`,R),g?.addEventListener(`change`,R),_?.addEventListener(`change`,R),D?.addEventListener(`click`,()=>void V()),O?.addEventListener(`click`,()=>{window.alert(`세무 파트너 상담 연결은 Phase 2 리퍼럴 모델로 준비 중입니다.`)}))}function U(e,t=!1){p&&(p.textContent=e,p.className=t?`notice error`:`notice`)}async function W(e){let t=n(),i=j.find(t=>t.id===e||t.dbId===e);if(!t){U(`먼저 Xaman 지갑을 연결해 주세요.`,!0);return}if(!i?.txHash){U(`트랜잭션 해시가 있는 기부 이력만 영수증/NFT 요청이 가능합니다.`,!0);return}try{U(`영수증/NFT 요청 서명 대기 중...`);let e=await s({account:t.account,donationId:i.id,donationTxHash:i.txHash});if(!e.txHash){U(`영수증/NFT 요청이 취소되었습니다.`,!0);return}let n={...i,proofMintStatus:e.validated?`recorded`:`requested`,proofMintTxHash:e.txHash,nftStatus:e.validated?`minted`:`pending`,proofStatus:`recorded`,proofNftId:e.validated?`proof_req_${Date.now()}`:i.proofNftId};a(n),n.dbId&&r(n.dbId,{nftStatus:n.nftStatus,proofStatus:`recorded`,proofNftId:n.proofNftId??null}),U(`영수증/NFT 요청 완료: ${e.txHash}`),await G()}catch(e){U(e instanceof Error?e.message:`영수증/NFT 요청 실패`,!0)}}async function G(){H();let e=await i(),r=await e.userRepository.getProfile(k),a=await e.userRepository.getDonationStatus(k),s=await e.donationRepository.listDonationsByUser(k),c=n(),l=[];c&&(l=(await t(c.account)).map(e=>({id:e.id,userId:e.userId,donatedAt:e.donatedAt,amountKrw:e.amountKrw,allocations:e.allocations,paymentStatus:e.paymentStatus,proofStatus:e.proofStatus,nftStatus:e.nftStatus,settlementStatus:e.settlementStatus,txHash:e.txHash??void 0,proofNftId:e.proofNftId??void 0,explorerUrl:e.explorerUrl??void 0,validationStatus:e.validationStatus,source:`local`,dbId:e.id})));let p=o(s,k),m=new Set(l.map(e=>e.id)),h=[...l,...p.filter(e=>!m.has(e.dbId??``)&&!m.has(e.id))].sort((e,t)=>e.donatedAt<t.donatedAt?1:-1);if(j=h,!r||!a){u&&(u.innerHTML=`<div class="notice error">사용자 상태를 불러오지 못했습니다.</div>`),R();return}let g=h.reduce((e,t)=>e+t.amountKrw,0);A=g,L(),R(),u&&(u.innerHTML=`
      <div class="summary-box">
        <div class="summary-label">사용자</div>
        <div class="summary-value">${r.displayName}</div>
      </div>
      <div class="summary-box">
        <div class="summary-label">누적 기부금</div>
        <div class="summary-value">${N(g)}</div>
      </div>
      <div class="summary-box">
        <div class="summary-label">티어</div>
        <div class="summary-value">${r.tier.toUpperCase()}</div>
      </div>
    `),d&&(d.innerHTML=h.slice(0,3).map(e=>`
          <article class="timeline-item">
            <div class="row-between">
              <strong>${N(e.amountKrw)}</strong>
              <span class="badge">${F(e.donatedAt)}</span>
            </div>
            <div class="trust mt-12">1) ${I(e.paymentStatus)}</div>
            <div class="trust">2) ${I(e.proofStatus)}</div>
            <div class="trust">3) ${I(e.nftStatus)}</div>
            <div class="trust">4) ${I(e.settlementStatus)} · 검증 ${e.validationStatus??`-`}</div>
          </article>
        `).join(``)),f&&(f.innerHTML=`
      <table class="table">
        <thead>
          <tr>
            <th>일시</th>
            <th>금액</th>
            <th>정산/검증</th>
            <th>Proof 상태</th>
            <th>트랜잭션</th>
            <th>영수증/NFT</th>
          </tr>
        </thead>
        <tbody>${h.map(e=>{let t=e.txHash?`<a class="text-link" href="https://testnet.xrpl.org/transactions/${e.txHash}" target="_blank" rel="noreferrer">${e.txHash}</a>`:`-`,n=e.proofMintStatus===`recorded`?`요청 기록 완료`:e.proofMintStatus===`requested`?`요청됨`:e.nftStatus===`minted`?`발행 완료`:`대기`;return`
          <tr>
            <td>${F(e.donatedAt)}</td>
            <td>${N(e.amountKrw)}</td>
            <td>${I(e.settlementStatus)} / ${e.validationStatus??`-`}</td>
            <td>${n}</td>
            <td>${t}</td>
            <td>
              <button class="btn btn-secondary receipt-request-btn" type="button" data-receipt-id="${e.id}" ${e.txHash?``:`disabled`}>
                ${n===`대기`?`요청`:`다시 요청`}
              </button>
            </td>
          </tr>
        `}).join(``)}</tbody>
      </table>
    `,f.querySelectorAll(`.receipt-request-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.receiptId;t&&W(t)})}))}G();