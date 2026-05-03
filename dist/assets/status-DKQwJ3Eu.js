/* empty css               */import"./modulepreload-polyfill-N-DOuI4P.js";import{s as e}from"./xrpl-HgkFuIC6.js";import{t}from"./apiBase-BXOIOaTT.js";import{c as n,n as r,o as i,p as a,r as o,s,t as c,u as l}from"./wallet-BfUZP1Y-.js";import{n as u,r as ee}from"./donations-DhDq83rv.js";import{t as te}from"./proofNft-BAc8sNfv.js";import{t as d}from"./nav-Br5_uZS3.js";var f=`usr_demo_001`,p=document.getElementById(`top-nav`);p&&(p.innerHTML=d(`status`));var m=document.getElementById(`status-summary`),h=document.getElementById(`status-timeline`),g=document.getElementById(`status-table`),_=document.getElementById(`receipt-request-status`),v=document.getElementById(`status-wallet-badge`),y=document.getElementById(`status-wallet-address`),b=document.getElementById(`status-wallet-sync`),x=document.getElementById(`status-xaman-connect-btn`),ne=document.getElementById(`status-xaman-disconnect-btn`),S=document.getElementById(`status-refresh-btn`),C=document.getElementById(`status-xaman-qr-wrap`),w=document.getElementById(`status-tax-donor-type`),T=document.getElementById(`status-tax-income-range`),E=document.getElementById(`status-tax-profit-range`),D=document.getElementById(`status-tax-donation-type`),re=document.getElementById(`status-tax-income-field`),ie=document.getElementById(`status-tax-profit-field`),O=document.getElementById(`status-tax-donation-type-field`),k=document.getElementById(`status-tax-source-badge`),A=document.getElementById(`status-tax-donation-amount`),j=document.getElementById(`status-tax-deduction-range`),M=document.getElementById(`status-tax-real-cost`),N=document.getElementById(`status-tax-explanation`),P=document.getElementById(`status-tax-law`),F=document.getElementById(`status-tax-calc-btn`),ae=document.getElementById(`status-tax-partner-btn`),I=document.getElementById(`tax-scenario-slider`),L=document.getElementById(`tax-scenario-label`),R=document.getElementById(`tax-scenario-chart`),z=0,B=[],V=!1;function H(e){return`${Math.max(0,Math.round(e)).toLocaleString(`ko-KR`)}원`}function U(e){return`${Math.max(0,Math.round(e)).toLocaleString(`ko-KR`)} KRW`}function W(e){return e>=1e8?`${(e/1e8).toFixed(1)}억`:e>=1e4?`${Math.round(e/1e4).toLocaleString(`ko-KR`)}만`:e.toLocaleString(`ko-KR`)}function G(e){return new Intl.DateTimeFormat(`ko-KR`,{year:`numeric`,month:`2-digit`,day:`2-digit`,hour:`2-digit`,minute:`2-digit`}).format(new Date(e))}function K(e){return{paid:`결제 완료`,pending:`대기`,failed:`실패`,recorded:`증빙 기록`,minted:`Proof 기록 완료`,scheduled:`정산 예정`,done:`정산 완료`,error:`오류`}[e]??e}function q(e,t=!1){_&&(_.textContent=e,_.className=t?`notice error`:`notice`)}function oe(e,t){C&&(C.innerHTML=`
    <img src="${e}" alt="Xaman QR" />
    <a class="ghost-btn" href="${t}" target="_blank" rel="noreferrer">Xaman에서 열기</a>
  `)}function J(){C&&(C.innerHTML=``)}function se(e=0){let t=r();v&&(v.textContent=t?`CONNECTED`:`NOT CONNECTED`,v.className=t?`status-badge success`:`status-badge error`),y&&(y.textContent=t?`${t.account.slice(0,6)}...${t.account.slice(-4)}`:`-`),b&&(b.textContent=t?`DB 기부 기록 ${e}건 + 로컬/목업 기록`:`Xaman 연결 전: 로컬/목업 기록만 표시`)}async function ce(){try{q(`Xaman SignIn 요청을 생성하는 중입니다.`);let e=await i();oe(e.qrPngUrl,e.deepLink);let t=await s(e.uuid);if(!t.signed||!t.account){q(`Xaman 연결이 취소되었습니다.`,!0);return}o({account:t.account,connectedAt:new Date().toISOString(),lastPayloadUuid:e.uuid}),a(t.account),J(),q(`Xaman 지갑이 연결되었습니다. 기부 기록을 동기화합니다.`),await $()}catch(e){q(e instanceof Error?e.message:`Xaman 연결에 실패했습니다.`,!0)}}function le(){c(),J(),q(`Xaman 연결을 해제했습니다. 로컬/목업 기록만 표시합니다.`),$()}function Y(){let e=w?.value===`법인`;re?.classList.toggle(`hidden`,e),ie?.classList.toggle(`hidden`,!e),O?.classList.toggle(`hidden`,!e)}function ue(){return(w?.value===`법인`?`법인`:`개인`)==`개인`?T?.value===`1.5억_이상`?[.18,.28]:T?.value===`5천만~1.5억`?[.16,.24]:[.13,.2]:D?.value===`법정기부금`?[.18,.28]:D?.value===`일반기부금`?[.08,.16]:[.12,.22]}function X(e){let[t,n]=ue(),r=Math.round(e*t),i=Math.round(e*n);return{min:r,max:i,realMin:Math.max(0,e-i),realMax:Math.max(0,e-r)}}function de(){if(!I)return;let e=Math.max(1e6,Math.ceil(Math.max(z,1e5)*2/1e5)*1e5);I.max=String(e),(Number(I.value)<=0||Number(I.value)>e)&&(I.value=String(z||Math.min(1e5,e)))}function Z(e){if(!R)return;let t=Number(I?.max??1e6),n=Math.max(0,Math.min(e,t)),r=X(n),i=Math.max(t,r.realMax,r.max)*1.05,a=e=>58+e/t*638,o=e=>218-e/i*196,s=Array.from({length:18},(e,n)=>t*n/17),c=e=>s.map((t,n)=>`${n===0?`M`:`L`} ${a(t)} ${o(e(t))}`).join(` `),l=a(n);L&&(L.textContent=`${U(n)} · 공제 ${U(r.min)} ~ ${U(r.max)}`),R.innerHTML=`
    <svg viewBox="0 0 720 260" preserveAspectRatio="none">
      <line x1="58" y1="22" x2="58" y2="218" stroke="#CBD5E1" />
      <line x1="58" y1="218" x2="696" y2="218" stroke="#CBD5E1" />
      <text class="tax-chart-label" x="58" y="248">0</text>
      <text class="tax-chart-label" x="618" y="248">${W(t)} KRW</text>
      <text class="tax-chart-label" x="10" y="28">${W(i)}</text>
      <path d="${c(e=>X(e).max)}" fill="none" stroke="#FF5A00" stroke-width="3" />
      <path d="${c(e=>X(e).min)}" fill="none" stroke="#FDBA74" stroke-width="3" stroke-dasharray="6 6" />
      <path d="${c(e=>X(e).realMin)}" fill="none" stroke="#0F172A" stroke-width="3" />
      <line x1="${l}" y1="22" x2="${l}" y2="218" stroke="#64748B" stroke-dasharray="4 4" />
      <circle cx="${l}" cy="${o(r.max)}" r="5" fill="#FF5A00" />
      <circle cx="${l}" cy="${o(r.realMin)}" r="5" fill="#0F172A" />
      <rect x="${Math.min(l+10,490)}" y="32" width="210" height="72" rx="10" fill="white" stroke="#E2E8F0" />
      <text class="tax-chart-value" x="${Math.min(l+24,504)}" y="56">기부액 ${U(n)}</text>
      <text class="tax-chart-label" x="${Math.min(l+24,504)}" y="76">예상 공제 ${U(r.min)} ~ ${U(r.max)}</text>
      <text class="tax-chart-label" x="${Math.min(l+24,504)}" y="94">실질 비용 ${U(r.realMin)} ~ ${U(r.realMax)}</text>
    </svg>
  `}function Q(){k&&(k.textContent=z>0?`READY`:`NO DATA`,k.className=z>0?`status-badge success`:`status-badge error`),A&&(A.textContent=H(z)),j&&(j.textContent=z>0?`계산 대기`:`기부 이력 없음`),M&&(M.textContent=`-`),N&&(N.textContent=z>0?`기부 이력과 기부자 유형을 기준으로 참고 추정치를 확인하세요.`:`계산할 기부 이력이 아직 없습니다.`),P&&(P.textContent=`관련 법령: -`),F&&(F.disabled=z<=0),de(),Z(Number(I?.value??z))}function fe(){let e=w?.value===`법인`?`법인`:`개인`;return{donor_type:e,annual_income_range:e===`개인`?T?.value??`5천만원_이하`:void 0,annual_profit_range:e===`법인`?E?.value??`2억_이하`:void 0,donation_type:e===`법인`?D?.value??`지정기부금`:void 0,donation_amount:z}}function pe(e){let t=Math.max(0,Math.round(e.estimated_deduction_min)),n=Math.max(t,Math.round(e.estimated_deduction_max));k&&(k.textContent=e.source===`anthropic`?`AI`:`ESTIMATE`,k.className=`status-badge success`),A&&(A.textContent=H(z)),j&&(j.textContent=`${U(t)} ~ ${U(n)}`),M&&(M.textContent=`${U(z-n)} ~ ${U(z-t)}`),N&&(N.textContent=e.explanation),P&&(P.textContent=`관련 법령: ${e.applicable_law}`)}async function me(){if(!(!F||z<=0))try{F.disabled=!0,F.textContent=`계산 중`,k&&(k.textContent=`RUNNING`);let e=await fetch(`${t}/api/tax-sim/calculate`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(fe())});if(!e.ok)throw Error(await e.text());pe(await e.json())}catch(e){k&&(k.textContent=`ERROR`,k.className=`status-badge error`),N&&(N.textContent=e instanceof Error?e.message:`절세 시뮬레이션에 실패했습니다.`)}finally{F.disabled=z<=0,F.textContent=`내 기부 기준 계산`}}function he(){V||(V=!0,w?.addEventListener(`change`,()=>{Y(),Q()}),T?.addEventListener(`change`,Q),E?.addEventListener(`change`,Q),D?.addEventListener(`change`,Q),I?.addEventListener(`input`,()=>Z(Number(I.value))),F?.addEventListener(`click`,()=>void me()),ae?.addEventListener(`click`,()=>{window.alert(`세무 파트너 상담 연결은 Phase 2 리퍼럴 모델로 준비 중입니다.`)}),x?.addEventListener(`click`,()=>void ce()),ne?.addEventListener(`click`,le),S?.addEventListener(`click`,()=>void $()))}async function ge(e){let t=r(),n=B.find(t=>t.id===e||t.dbId===e);if(!t){q(`먼저 Xaman 지갑을 연결해 주세요.`,!0);return}if(!n?.txHash){q(`트랜잭션 해시가 있는 기부 이력만 Proof 요청을 진행할 수 있습니다.`,!0);return}try{q(`Proof 요청 서명 대기 중...`);let e=await te({account:t.account,donationId:n.id,donationTxHash:n.txHash});if(!e.txHash){q(`Proof 요청이 취소되었습니다.`,!0);return}let r={...n,proofMintStatus:e.validated?`recorded`:`requested`,proofMintTxHash:e.txHash,nftStatus:e.validated?`minted`:`pending`,proofStatus:`recorded`,proofNftId:e.validated?`proof_req_${Date.now()}`:n.proofNftId};ee(r),r.dbId&&l(r.dbId,{nftStatus:r.nftStatus,proofStatus:`recorded`,proofNftId:r.proofNftId??null}),q(`Proof 요청 완료: ${e.txHash}`),await $()}catch(e){q(e instanceof Error?e.message:`Proof 요청 실패`,!0)}}function _e(e){return{id:e.id,userId:e.userId,donatedAt:e.donatedAt,amountKrw:e.amountKrw,allocations:e.allocations,paymentStatus:e.paymentStatus,proofStatus:e.proofStatus,nftStatus:e.nftStatus,settlementStatus:e.settlementStatus,txHash:e.txHash??void 0,proofNftId:e.proofNftId??void 0,explorerUrl:e.explorerUrl??void 0,validationStatus:e.validationStatus,source:`local`,dbId:e.id}}function ve(e,t,n){if(!m)return;let i=r(),a=B.reduce((e,t)=>e+t.amountKrw,0),o=B.filter(e=>!!e.txHash).length,s=B.filter(e=>e.proofStatus===`recorded`||e.nftStatus===`minted`).length,c=B.reduce((e,t)=>{let n=t.asset??`KRW`;return e[n]=(e[n]??0)+(t.amountAsset??t.amountKrw),e},{}),l=Object.entries(c).slice(0,3).map(([e,t])=>`${e} ${Math.round(t*100)/100}`).join(` · `);m.innerHTML=`
    <div class="summary-box">
      <div class="summary-label">연결 지갑</div>
      <div class="summary-value">${i?`${i.account.slice(0,6)}...${i.account.slice(-4)}`:`미연결`}</div>
      <div class="trust mt-12">${i?`DB 동기화 ${n}건`:`Xaman 연결 시 지갑 기준 기록 표시`}</div>
    </div>
    <div class="summary-box">
      <div class="summary-label">누적 기부금</div>
      <div class="summary-value">${U(a)}</div>
      <div class="trust mt-12">${l||`기부 자산 데이터 없음`}</div>
    </div>
    <div class="summary-box">
      <div class="summary-label">온체인 기록</div>
      <div class="summary-value">${o}건</div>
      <div class="trust mt-12">Proof ready ${s}건</div>
    </div>
    <div class="summary-box">
      <div class="summary-label">등급</div>
      <div class="summary-value">${t.toUpperCase()}</div>
      <div class="trust mt-12">${e}</div>
    </div>
  `}function ye(){h&&(h.innerHTML=B.slice(0,3).map(e=>`
        <article class="timeline-item">
          <div class="row-between">
            <strong>${H(e.amountKrw)}</strong>
            <span class="badge">${G(e.donatedAt)}</span>
          </div>
          <div class="trust mt-12">1) ${K(e.paymentStatus)}</div>
          <div class="trust">2) ${K(e.proofStatus)}</div>
          <div class="trust">3) ${K(e.nftStatus)}</div>
          <div class="trust">4) ${K(e.settlementStatus)} · 검증 ${e.validationStatus??`-`}</div>
        </article>
      `).join(``))}function be(){g&&(g.innerHTML=`
    <table class="table">
      <thead>
        <tr>
          <th>일시</th>
          <th>금액</th>
          <th>정산/검증</th>
          <th>Proof 상태</th>
          <th>트랜잭션</th>
          <th>Proof 요청</th>
        </tr>
      </thead>
      <tbody>${B.map(e=>{let t=e.txHash?`<a class="text-link" href="https://testnet.xrpl.org/transactions/${e.txHash}" target="_blank" rel="noreferrer">${e.txHash}</a>`:`-`,n=e.proofMintStatus===`recorded`?`요청 기록 완료`:e.proofMintStatus===`requested`?`요청됨`:e.nftStatus===`minted`?`발행 완료`:`대기`;return`
        <tr>
          <td>${G(e.donatedAt)}</td>
          <td>${e.asset?`${e.amountAsset??`-`} ${e.asset}<br /><span class="trust">${U(e.amountKrw)}</span>`:H(e.amountKrw)}</td>
          <td>${K(e.settlementStatus)} / ${e.validationStatus??`-`}</td>
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
  `,g.querySelectorAll(`.receipt-request-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.receiptId;t&&ge(t)})}))}async function $(){he();let t=await e(),i=await t.userRepository.getProfile(f),a=await t.donationRepository.listDonationsByUser(f),o=r(),s=o?(await n(o.account)).map(_e):[];se(s.length);let c=u(a,f),l=new Set(s.map(e=>e.id));B=[...s,...c.filter(e=>!l.has(e.dbId??``)&&!l.has(e.id))].sort((e,t)=>e.donatedAt<t.donatedAt?1:-1),z=B.reduce((e,t)=>e+t.amountKrw,0),Y(),Q(),ve(i?.displayName??`Demo donor`,i?.tier??`seed`,s.length),ye(),be()}$();