/* empty css               */import"./modulepreload-polyfill-N-DOuI4P.js";import{c as e,m as t,p as n}from"./xrpl-FTcenvDK.js";import{t as r}from"./apiBase-BXOIOaTT.js";import{n as i,r as a}from"./donations-BtxmKuHC.js";import{n as o,o as s,r as c,s as l,t as u}from"./wallet-Dr8BPKSq.js";import"./proofNft--DKgeF2C.js";import{t as ee}from"./nav-Br5_uZS3.js";var d=`usr_demo_001`,f=document.getElementById(`top-nav`);f&&(f.innerHTML=ee(`status`));var p=document.getElementById(`status-summary`),m=document.getElementById(`status-timeline`),h=document.getElementById(`status-table`),g=document.getElementById(`receipt-request-status`),_=document.getElementById(`status-wallet-badge`),v=document.getElementById(`status-wallet-address`),y=document.getElementById(`status-wallet-sync`),te=document.getElementById(`status-xaman-connect-btn`),b=document.getElementById(`status-xaman-disconnect-btn`),x=document.getElementById(`status-refresh-btn`),S=document.getElementById(`status-xaman-qr-wrap`),C=document.getElementById(`status-tax-donor-type`),w=document.getElementById(`status-tax-income-range`),T=document.getElementById(`status-tax-profit-range`),E=document.getElementById(`status-tax-donation-type`),ne=document.getElementById(`status-tax-income-field`),re=document.getElementById(`status-tax-profit-field`),ie=document.getElementById(`status-tax-donation-type-field`),D=document.getElementById(`status-tax-source-badge`),O=document.getElementById(`status-tax-donation-amount`),k=document.getElementById(`status-tax-deduction-range`),A=document.getElementById(`status-tax-real-cost`),j=document.getElementById(`status-tax-explanation`),M=document.getElementById(`status-tax-law`),N=document.getElementById(`status-tax-calc-btn`),ae=document.getElementById(`status-tax-partner-btn`),P=document.getElementById(`tax-scenario-slider`),F=document.getElementById(`tax-scenario-label`),I=document.getElementById(`tax-scenario-chart`),L=0,R=[],z=!1;function B(e){return`${Math.max(0,Math.round(e)).toLocaleString(`ko-KR`)}원`}function V(e){return`${Math.max(0,Math.round(e)).toLocaleString(`ko-KR`)} KRW`}function H(e){return e>=1e8?`${(e/1e8).toFixed(1)}억`:e>=1e4?`${Math.round(e/1e4).toLocaleString(`ko-KR`)}만`:e.toLocaleString(`ko-KR`)}function U(e){return new Intl.DateTimeFormat(`ko-KR`,{year:`numeric`,month:`2-digit`,day:`2-digit`,hour:`2-digit`,minute:`2-digit`}).format(new Date(e))}function W(e){return{paid:`결제 완료`,pending:`대기`,failed:`실패`,recorded:`증빙 기록`,minted:`Proof 기록 완료`,scheduled:`정산 예정`,done:`정산 완료`,error:`오류`}[e]??e}function G(e,t=!1){g&&(g.textContent=e,g.className=t?`notice error`:`notice`)}function K(e,t){S&&(S.innerHTML=`
    <img src="${e}" alt="Xaman QR" />
    <a class="ghost-btn" href="${t}" target="_blank" rel="noreferrer">Xaman에서 열기</a>
  `)}function q(){S&&(S.innerHTML=``)}function oe(e=0){let t=o();_&&(_.textContent=t?`CONNECTED`:`NOT CONNECTED`,_.className=t?`status-badge success`:`status-badge error`),v&&(v.textContent=t?`${t.account.slice(0,6)}...${t.account.slice(-4)}`:`-`),y&&(y.textContent=t?`DB 기부 기록 ${e}건 + 로컬/목업 기록`:`Xaman 연결 전: 로컬/목업 기록만 표시`)}async function se(){try{G(`Xaman SignIn 요청을 생성하는 중입니다.`);let e=await s();K(e.qrPngUrl,e.deepLink);let t=await l(e.uuid);if(!t.signed||!t.account){G(`Xaman 연결이 취소되었습니다.`,!0);return}c({account:t.account,connectedAt:new Date().toISOString(),lastPayloadUuid:e.uuid}),n(t.account),q(),G(`Xaman 지갑이 연결되었습니다. 기부 기록을 동기화합니다.`),await $()}catch(e){G(e instanceof Error?e.message:`Xaman 연결에 실패했습니다.`,!0)}}function ce(){u(),q(),G(`Xaman 연결을 해제했습니다. 로컬/목업 기록만 표시합니다.`),$()}function J(){let e=C?.value===`법인`;ne?.classList.toggle(`hidden`,e),re?.classList.toggle(`hidden`,!e),ie?.classList.toggle(`hidden`,!e)}function le(){return(C?.value===`법인`?`법인`:`개인`)==`개인`?w?.value===`1.5억_이상`?[.18,.28]:w?.value===`5천만~1.5억`?[.16,.24]:[.13,.2]:E?.value===`법정기부금`?[.18,.28]:E?.value===`일반기부금`?[.08,.16]:[.12,.22]}function Y(e){let[t,n]=le(),r=Math.round(e*t),i=Math.round(e*n);return{min:r,max:i,realMin:Math.max(0,e-i),realMax:Math.max(0,e-r)}}function ue(){if(!P)return;let e=Math.max(1e6,Math.ceil(Math.max(L,1e5)*2/1e5)*1e5);P.max=String(e),(Number(P.value)<=0||Number(P.value)>e)&&(P.value=String(L||Math.min(1e5,e)))}function X(e){if(!I)return;let t=Number(P?.max??1e6),n=Math.max(0,Math.min(e,t)),r=Y(n),i=Math.max(t,r.realMax,r.max)*1.05,a=e=>58+e/t*638,o=e=>218-e/i*196,s=Array.from({length:18},(e,n)=>t*n/17),c=e=>s.map((t,n)=>`${n===0?`M`:`L`} ${a(t)} ${o(e(t))}`).join(` `),l=a(n);F&&(F.textContent=`${V(n)} · 공제 ${V(r.min)} ~ ${V(r.max)}`),I.innerHTML=`
    <svg viewBox="0 0 720 260" preserveAspectRatio="none">
      <line x1="58" y1="22" x2="58" y2="218" stroke="#CBD5E1" />
      <line x1="58" y1="218" x2="696" y2="218" stroke="#CBD5E1" />
      <text class="tax-chart-label" x="58" y="248">0</text>
      <text class="tax-chart-label" x="618" y="248">${H(t)} KRW</text>
      <text class="tax-chart-label" x="10" y="28">${H(i)}</text>
      <path d="${c(e=>Y(e).max)}" fill="none" stroke="#FF5A00" stroke-width="3" />
      <path d="${c(e=>Y(e).min)}" fill="none" stroke="#FDBA74" stroke-width="3" stroke-dasharray="6 6" />
      <path d="${c(e=>Y(e).realMin)}" fill="none" stroke="#0F172A" stroke-width="3" />
      <line x1="${l}" y1="22" x2="${l}" y2="218" stroke="#64748B" stroke-dasharray="4 4" />
      <circle cx="${l}" cy="${o(r.max)}" r="5" fill="#FF5A00" />
      <circle cx="${l}" cy="${o(r.realMin)}" r="5" fill="#0F172A" />
      <rect x="${Math.min(l+10,490)}" y="32" width="210" height="72" rx="10" fill="white" stroke="#E2E8F0" />
      <text class="tax-chart-value" x="${Math.min(l+24,504)}" y="56">기부액 ${V(n)}</text>
      <text class="tax-chart-label" x="${Math.min(l+24,504)}" y="76">예상 공제 ${V(r.min)} ~ ${V(r.max)}</text>
      <text class="tax-chart-label" x="${Math.min(l+24,504)}" y="94">실질 비용 ${V(r.realMin)} ~ ${V(r.realMax)}</text>
    </svg>
  `}function Z(){D&&(D.textContent=L>0?`READY`:`NO DATA`,D.className=L>0?`status-badge success`:`status-badge error`),O&&(O.textContent=B(L)),k&&(k.textContent=L>0?`계산 대기`:`기부 이력 없음`),A&&(A.textContent=`-`),j&&(j.textContent=L>0?`기부 이력과 기부자 유형을 기준으로 참고 추정치를 확인하세요.`:`계산할 기부 이력이 아직 없습니다.`),M&&(M.textContent=`관련 법령: -`),N&&(N.disabled=L<=0),ue(),X(Number(P?.value??L))}function de(){let e=C?.value===`법인`?`법인`:`개인`;return{donor_type:e,annual_income_range:e===`개인`?w?.value??`5천만원_이하`:void 0,annual_profit_range:e===`법인`?T?.value??`2억_이하`:void 0,donation_type:e===`법인`?E?.value??`지정기부금`:void 0,donation_amount:L}}function Q(e){let t=Math.max(0,Math.round(e.estimated_deduction_min)),n=Math.max(t,Math.round(e.estimated_deduction_max));D&&(D.textContent=e.source===`anthropic`?`AI`:`ESTIMATE`,D.className=`status-badge success`),O&&(O.textContent=B(L)),k&&(k.textContent=`${V(t)} ~ ${V(n)}`),A&&(A.textContent=`${V(L-n)} ~ ${V(L-t)}`),j&&(j.textContent=e.explanation),M&&(M.textContent=`관련 법령: ${e.applicable_law}`)}async function fe(){if(!(!N||L<=0))try{N.disabled=!0,N.textContent=`계산 중`,D&&(D.textContent=`RUNNING`);let e=await fetch(`${r}/api/tax-sim/calculate`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(de())});if(!e.ok)throw Error(await e.text());Q(await e.json())}catch(e){D&&(D.textContent=`ERROR`,D.className=`status-badge error`),j&&(j.textContent=e instanceof Error?e.message:`절세 시뮬레이션에 실패했습니다.`)}finally{N.disabled=L<=0,N.textContent=`내 기부 기준 계산`}}function pe(){z||(z=!0,C?.addEventListener(`change`,()=>{J(),Z()}),w?.addEventListener(`change`,Z),T?.addEventListener(`change`,Z),E?.addEventListener(`change`,Z),P?.addEventListener(`input`,()=>X(Number(P.value))),N?.addEventListener(`click`,()=>void fe()),ae?.addEventListener(`click`,()=>{window.alert(`세무 파트너 상담 연결은 Phase 2 리퍼럴 모델로 준비 중입니다.`)}),te?.addEventListener(`click`,()=>void se()),b?.addEventListener(`click`,ce),x?.addEventListener(`click`,()=>void $()))}function me(e){let t=R.find(t=>t.id===e||t.dbId===e);if(!t?.txHash){G(`검증 가능한 트랜잭션 해시가 없습니다.`,!0);return}let n=t.txHash??t.receiptId??t.evidenceHash;window.open(`./verify.html?id=${encodeURIComponent(n)}`,`_blank`,`noreferrer`)}function he(e){let t=e.allocations,n=Array.isArray(t)?t:t?.items??[],r=t?.meta??{};return{id:e.id,userId:e.userId,donatedAt:e.donatedAt,amountKrw:e.amountKrw,allocations:n,paymentStatus:e.paymentStatus,proofStatus:e.proofStatus,nftStatus:e.nftStatus,settlementStatus:e.settlementStatus,txHash:e.txHash??void 0,proofNftId:e.proofNftId??void 0,explorerUrl:e.explorerUrl??void 0,validationStatus:e.validationStatus,receiptId:e.receiptId??r.receiptId??void 0,evidenceHash:e.evidenceHash??r.evidenceHash??void 0,complianceHash:e.complianceHash??r.complianceHash??void 0,asset:e.asset??r.asset??void 0,amountAsset:e.amountAsset??r.amountAsset??void 0,proofMintStatus:e.txHash?`recorded`:`none`,source:`local`,dbId:e.id}}function ge(e,t,n){if(!p)return;let r=o(),i=R.reduce((e,t)=>e+t.amountKrw,0),a=R.filter(e=>!!e.txHash).length,s=R.filter(e=>e.proofStatus===`recorded`||e.nftStatus===`minted`).length,c=R.reduce((e,t)=>{let n=t.asset??`KRW`;return e[n]=(e[n]??0)+(t.amountAsset??t.amountKrw),e},{}),l=Object.entries(c).slice(0,3).map(([e,t])=>`${e} ${Math.round(t*100)/100}`).join(` · `);p.innerHTML=`
    <div class="summary-box">
      <div class="summary-label">연결 지갑</div>
      <div class="summary-value">${r?`${r.account.slice(0,6)}...${r.account.slice(-4)}`:`미연결`}</div>
      <div class="trust mt-12">${r?`DB 동기화 ${n}건`:`Xaman 연결 시 지갑 기준 기록 표시`}</div>
    </div>
    <div class="summary-box">
      <div class="summary-label">누적 기부금</div>
      <div class="summary-value">${V(i)}</div>
      <div class="trust mt-12">${l||`기부 자산 데이터 없음`}</div>
    </div>
    <div class="summary-box">
      <div class="summary-label">온체인 기록</div>
      <div class="summary-value">${a}건</div>
      <div class="trust mt-12">Proof ready ${s}건</div>
    </div>
    <div class="summary-box">
      <div class="summary-label">등급</div>
      <div class="summary-value">${t.toUpperCase()}</div>
      <div class="trust mt-12">${e}</div>
    </div>
  `}function _e(){m&&(m.innerHTML=R.slice(0,3).map(e=>`
        <article class="timeline-item">
          <div class="row-between">
            <strong>${B(e.amountKrw)}</strong>
            <span class="badge">${U(e.donatedAt)}</span>
          </div>
          <div class="trust mt-12">1) ${W(e.paymentStatus)}</div>
          <div class="trust">2) ${W(e.proofStatus)}</div>
          <div class="trust">3) ${W(e.nftStatus)}</div>
          <div class="trust">4) ${W(e.settlementStatus)} · 검증 ${e.validationStatus??`-`}</div>
        </article>
      `).join(``))}function ve(){h&&(h.innerHTML=`
    <table class="table">
      <thead>
        <tr>
          <th>일시</th>
          <th>금액</th>
          <th>정산/검증</th>
          <th>Proof 상태</th>
          <th>트랜잭션</th>
          <th>Proof</th>
        </tr>
      </thead>
      <tbody>${R.map(e=>{let t=e.txHash?`<a class="text-link" href="https://testnet.xrpl.org/transactions/${e.txHash}" target="_blank" rel="noreferrer">${e.txHash}</a>`:`-`,n=e.proofMintStatus===`recorded`?`Proof ready`:e.proofMintStatus===`requested`?`요청됨`:e.nftStatus===`minted`?`Proof ready`:`대기`;return`
        <tr>
          <td>${U(e.donatedAt)}</td>
          <td>${e.asset?`${e.amountAsset??`-`} ${e.asset}<br /><span class="trust">${V(e.amountKrw)}</span>`:B(e.amountKrw)}</td>
          <td>${W(e.settlementStatus)} / ${e.validationStatus??`-`}</td>
          <td>${n}</td>
          <td>${t}</td>
          <td>
            <button class="btn btn-secondary receipt-request-btn" type="button" data-receipt-id="${e.id}" ${e.txHash?``:`disabled`}>
              ${n===`대기`?`대기`:`Proof 보기`}
            </button>
          </td>
        </tr>
      `}).join(``)}</tbody>
    </table>
  `,h.querySelectorAll(`.receipt-request-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.receiptId;t&&me(t)})}))}async function $(){pe();let n=await t(),r=await n.userRepository.getProfile(d),s=await n.donationRepository.listDonationsByUser(d),c=o(),l=c?(await e(c.account)).map(he):[];if(oe(l.length),c){let e=i(d,c.account),t=new Set(l.map(e=>e.id)),n=new Set(l.map(e=>e.txHash).filter(Boolean)),r=e.filter(e=>!t.has(e.dbId??``)&&!t.has(e.id)&&!n.has(e.txHash??``));R=[...l,...r].sort((e,t)=>e.donatedAt<t.donatedAt?1:-1)}else R=a(s,d);L=R.reduce((e,t)=>e+t.amountKrw,0),J(),Z(),ge(r?.displayName??`Demo donor`,r?.tier??`seed`,l.length),_e(),ve()}$();