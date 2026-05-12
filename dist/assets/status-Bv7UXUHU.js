import"./modulepreload-polyfill-eJgYjmQ8.js";import{n as e}from"./mobileRedirect-BpvrRV-s.js";/* empty css               */import{t}from"./provider-DrGARZ6r.js";import{i as n,l as r,o as i,u as a}from"./db-By3Tvzib.js";import{i as o,n as s,r as c}from"./donations-DQggemAx.js";import{n as l,o as u,r as ee,s as d,t as te}from"./wallet-CNWbn9dU.js";import{i as ne}from"./xrpl-CtQFP9ic.js";import{l as re,n as ie,o as ae,t as oe}from"./nav-2t9yL-0h.js";e();var f=`usr_demo_001`,se=document.getElementById(`top-nav`);se&&(se.innerHTML=oe(`status`));var ce=document.getElementById(`status-summary`),le=document.getElementById(`status-timeline`),ue=document.getElementById(`status-table`),de=document.getElementById(`receipt-request-status`),fe=document.getElementById(`status-wallet-badge`),pe=document.getElementById(`status-wallet-address`),me=document.getElementById(`status-wallet-sync`),he=document.getElementById(`status-xaman-connect-btn`),ge=document.getElementById(`status-xaman-disconnect-btn`),_e=document.getElementById(`status-refresh-btn`),p=document.getElementById(`status-xaman-qr-wrap`),m=document.getElementById(`status-account-badge`),h=document.getElementById(`status-account-avatar`),g=document.getElementById(`status-account-name`),ve=document.getElementById(`status-account-email`),ye=document.getElementById(`status-account-role`),be=document.getElementById(`status-account-login-link`),xe=document.getElementById(`status-account-logout-btn`),_=document.getElementById(`status-tax-donor-type`),v=document.getElementById(`status-tax-income-range`),Se=document.getElementById(`status-tax-profit-range`),y=document.getElementById(`status-tax-donation-type`),Ce=document.getElementById(`status-tax-income-field`),we=document.getElementById(`status-tax-profit-field`),Te=document.getElementById(`status-tax-donation-type-field`),b=document.getElementById(`status-tax-source-badge`),x=document.getElementById(`status-tax-donation-amount`),S=document.getElementById(`status-tax-deduction-range`),C=document.getElementById(`status-tax-real-cost`),w=document.getElementById(`status-tax-explanation`),T=document.getElementById(`status-tax-law`),E=document.getElementById(`status-tax-calc-btn`),Ee=document.getElementById(`status-tax-partner-btn`),D=document.getElementById(`tax-scenario-slider`),De=document.getElementById(`tax-scenario-label`),Oe=document.getElementById(`tax-scenario-chart`),ke=document.getElementById(`impact-main-number`),O=document.getElementById(`impact-growth-badge`),k=document.getElementById(`impact-chart-area`),A=document.getElementById(`impact-chart-labels`),Ae=document.getElementById(`impact-period-control`),j=document.getElementById(`token-distribution`),M=document.getElementById(`credential-list`),N=0,P=[],je=!1,F=`day`,I=1,L=1,R=1,z=4,B=3,V=8,Me={XRP:1e3,RLUSD:1400,USDC:1400};function Ne(){let e=ae();if(!(!m||!g||!ve||!ye||!h)){if(!e){m.textContent=`LOGIN REQUIRED`,m.className=`status-badge error`,h.textContent=`T`,h.innerHTML=`T`,g.textContent=`로그인이 필요합니다`,ve.textContent=`Google 계정으로 로그인하면 기부 전 확인 이름을 자동으로 연결할 수 있습니다.`,ye.textContent=`-`,be?.classList.remove(`hidden`),xe?.classList.add(`hidden`);return}m.textContent=e.role===`operator`?`OPERATOR`:`USER`,m.className=`status-badge success`,e.picture?h.innerHTML=`<img src="${e.picture}" alt="" />`:h.textContent=re(e).slice(0,1),g.textContent=re(e),ve.textContent=e.email,ye.textContent=e.role===`operator`?`운영자`:`일반 유저`,be?.classList.add(`hidden`),xe?.classList.remove(`hidden`)}}function Pe(e){return`${Math.max(0,Math.round(e)).toLocaleString(`ko-KR`)}원`}function H(e){return`${Math.max(0,Math.round(e)).toLocaleString(`ko-KR`)} KRW`}function Fe(e){return e>=1e8?`${(e/1e8).toFixed(1)}억`:e>=1e4?`${Math.round(e/1e4).toLocaleString(`ko-KR`)}만`:e.toLocaleString(`ko-KR`)}function U(e){return e.toLocaleString(`ko-KR`,{maximumFractionDigits:6})}function Ie(e){return e.asset?typeof e.amountAsset==`number`&&Number.isFinite(e.amountAsset)?e.amountAsset:e.amountKrw/Me[e.asset]:e.amountKrw}function Le(e){return e.reduce((e,t)=>{let n=t.asset??`KRW`,r=e[n]??{amount:0,krw:0};return e[n]={amount:r.amount+Ie(t),krw:r.krw+t.amountKrw},e},{})}function W(e){return e?`${e.slice(0,6)}...${e.slice(-4)}`:`-`}function G(e){return String(e??`-`).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function K(e){return e?`https://testnet.xrpl.org/transactions/${encodeURIComponent(e)}`:``}function Re(e){return e?.tx_json??e?.tx??e?.transaction??e}function ze(e){return e?.meta??e?.metaData??e?.metadata??{}}function Be(e){if(!e)return`-`;if(typeof e==`string`)return`${U(Number(e)/1e6)} XRP`;let t=Number(e.value??0),n=e.currency??`Issued asset`;return`${U(t)} ${n}`}function Ve(e){if(!e)return`-`;try{let t=e.replace(/[^0-9a-f]/gi,``).match(/.{1,2}/g)?.map(e=>Number.parseInt(e,16))??[];return new TextDecoder().decode(new Uint8Array(t))}catch{return e}}function He(e){return(Array.isArray(e?.Memos)?e.Memos:[]).map(e=>e?.Memo).filter(Boolean).map(e=>{let t=Ve(e.MemoType),n=Ve(e.MemoData);return t&&t!==`-`?`${t}: ${n}`:n})}function Ue(e){switch(e){case`accepted`:return`Credential accepted`;case`accept_pending`:return`Accept pending`;case`issued`:return`Issued`;case`failed`:return`Failed`;default:return`Evidence ready`}}function We(e){return e?e.accepted?`Ledger verified`:e.exists?`Issued, waiting for accept`:`Not found on ledger`:`Not checked`}function Ge(e){let t=new Date,n=e===`ytd`?Math.min(t.getMonth()+1,7):7,r=Array.from({length:n},(r,i)=>{let a=n-1-i,o,s,c;if(e===`day`)o=new Date(t.getFullYear(),t.getMonth(),t.getDate()-a),s=new Date(o.getFullYear(),o.getMonth(),o.getDate()+1),c=o.toLocaleDateString(`ko-KR`,{month:`numeric`,day:`numeric`});else if(e===`week`){let e=t.getDay()===0?6:t.getDay()-1;o=new Date(t.getFullYear(),t.getMonth(),t.getDate()-e-a*7),s=new Date(o.getFullYear(),o.getMonth(),o.getDate()+7),c=`${o.toLocaleDateString(`ko-KR`,{month:`numeric`,day:`numeric`})}주`}else e===`ytd`?(o=new Date(t.getFullYear(),t.getMonth()-a,1),s=new Date(o.getFullYear(),o.getMonth()+1,1),c=`${o.getMonth()+1}월`):(o=new Date(t.getFullYear(),t.getMonth()-a,1),s=new Date(o.getFullYear(),o.getMonth()+1,1),c=o.toLocaleDateString(`en-US`,{month:`short`}));return{label:c,amount:0,start:o,end:s}});return P.forEach(e=>{let t=new Date(e.donatedAt),n=r.find(e=>t>=e.start&&t<e.end);n&&(n.amount+=e.amountKrw)}),r}function Ke(e){if(F===`total`)return P.reduce((e,t)=>e+t.amountKrw,0);if(F===`ytd`){let e=new Date().getFullYear();return P.filter(t=>new Date(t.donatedAt).getFullYear()===e).reduce((e,t)=>e+t.amountKrw,0)}return e.reduce((e,t)=>e+t.amount,0)}function qe(e){let t=Array.isArray(e)?e.filter(e=>e>0):[e].filter(e=>e>0);if(t.length<2)return null;let n=t[t.length-1]??0,r=t[t.length-2]??0;return r<=0?null:Math.round((n-r)/r*100)}function q(e,t,n){let r=Math.max(1,Math.ceil(t/n));return Math.min(Math.max(1,e),r)}function Je(e,t,n,r){let i=Math.max(1,Math.ceil(n/r));if(i<=1)return``;let a=Array.from({length:i},(n,r)=>{let i=r+1;return`<button class="${i===t?`is-active`:``}" type="button" data-status-page-target="${e}" data-page="${i}">${i}</button>`}).join(``);return`
    <nav class="status-pagination" aria-label="${e} pagination">
      <button type="button" data-status-page-target="${e}" data-page="${t-1}" ${t<=1?`disabled`:``}>‹</button>
      ${a}
      <button type="button" data-status-page-target="${e}" data-page="${t+1}" ${t>=i?`disabled`:``}>›</button>
    </nav>
  `}function Ye(e,t){if(e===`timeline`){I=q(t,P.length,z),Ct();return}if(e===`credentials`){let e=P.filter(e=>!!(e.txHash||e.evidenceHash)).length;L=q(t,e,B),_t();return}R=q(t,P.length,V),wt()}async function Xe(e){if(!e.xrplAccount||!e.credentialIssuer||!e.credentialType)return null;try{let t=new URLSearchParams({subject:e.xrplAccount,issuer:e.credentialIssuer,credentialType:e.credentialType}),n=await fetch(`${a}/api/xrpl/credential?${t.toString()}`);if(!n.ok&&n.status!==404)throw Error(await n.text());return await n.json()}catch(e){return{exists:!1,accepted:!1,error:e instanceof Error?e.message:`Credential lookup failed`}}}async function Ze(){P=await Promise.all(P.map(async e=>{if(e.credentialStatus===`accepted`)return e;let t=await Xe(e);if(!t?.accepted)return e;let n=e.credentialAcceptTxHash??t.previousTxId??void 0,r={...e,credentialStatus:`accepted`,proofMintStatus:`credential_accepted`,credentialAcceptTxHash:n,credentialAcceptExplorerUrl:e.credentialAcceptExplorerUrl??K(n)};return o(r),r.dbId&&await i(r.dbId,{credential:{issuer:r.credentialIssuer,credentialType:r.credentialType,uri:r.credentialUri,issueTxHash:r.credentialIssueTxHash,issueExplorerUrl:r.credentialIssueExplorerUrl,acceptTxHash:r.credentialAcceptTxHash,acceptExplorerUrl:r.credentialAcceptExplorerUrl,status:`accepted`}}),r}))}function J(e){return new Intl.DateTimeFormat(`ko-KR`,{year:`numeric`,month:`2-digit`,day:`2-digit`,hour:`2-digit`,minute:`2-digit`}).format(new Date(e))}function Qe(e){return{paid:`결제 완료`,pending:`대기`,failed:`실패`,recorded:`증빙 기록`,minted:`Evidence 기록 완료`,scheduled:`정산 예정`,done:`정산 완료`,error:`오류`}[e]??e}function Y(e,t=!1){de&&(de.textContent=e,de.className=t?`notice error`:`notice`)}function $e(e,t){p&&(p.innerHTML=`
    <img src="${e}" alt="Xaman QR" />
    <a class="ghost-btn" href="${t}" target="_blank" rel="noreferrer">Xaman에서 열기</a>
  `)}function et(){p&&(p.innerHTML=``)}function tt(e=0){let t=l();fe&&(fe.textContent=t?`CONNECTED`:`NOT CONNECTED`,fe.className=t?`status-badge success`:`status-badge error`),pe&&(pe.textContent=t?`${t.account.slice(0,6)}...${t.account.slice(-4)}`:`-`),me&&(me.textContent=t?`DB 기부 기록 ${e}건 + 로컬/목업 기록`:`Xaman 연결 전: 로컬/목업 기록만 표시`)}async function nt(){try{Y(`Xaman SignIn 요청을 생성하는 중입니다.`);let e=await u();$e(e.qrPngUrl,e.deepLink);let t=await d(e.uuid);if(!t.signed||!t.account){Y(`Xaman 연결이 취소되었습니다.`,!0);return}ee({account:t.account,connectedAt:new Date().toISOString(),lastPayloadUuid:e.uuid}),r(t.account),et(),Y(`Xaman 지갑이 연결되었습니다. 기부 기록을 동기화합니다.`),await $()}catch(e){Y(e instanceof Error?e.message:`Xaman 연결에 실패했습니다.`,!0)}}function rt(){te(),et(),Y(`Xaman 연결을 해제했습니다. 로컬/목업 기록만 표시합니다.`),$()}function it(){let e=_?.value===`법인`;Ce?.classList.toggle(`hidden`,e),we?.classList.toggle(`hidden`,!e),Te?.classList.toggle(`hidden`,!e)}function at(){return(_?.value===`법인`?`법인`:`개인`)==`개인`?v?.value===`1.5억_이상`?[.18,.28]:v?.value===`5천만~1.5억`?[.16,.24]:[.13,.2]:y?.value===`법정기부금`?[.18,.28]:y?.value===`일반기부금`?[.08,.16]:[.12,.22]}function X(e){let[t,n]=at(),r=Math.round(e*t),i=Math.round(e*n);return{min:r,max:i,realMin:Math.max(0,e-i),realMax:Math.max(0,e-r)}}function ot(){if(!D)return;let e=Math.max(1e6,Math.ceil(Math.max(N,1e5)*2/1e5)*1e5);D.max=String(e),(Number(D.value)<=0||Number(D.value)>e)&&(D.value=String(N||Math.min(1e5,e)))}function st(e){if(!Oe)return;let t=Number(D?.max??1e6),n=Math.max(0,Math.min(e,t)),r=X(n),i=Math.max(t,r.realMax,r.max)*1.05,a=e=>58+e/t*638,o=e=>218-e/i*196,s=Array.from({length:18},(e,n)=>t*n/17),c=e=>s.map((t,n)=>`${n===0?`M`:`L`} ${a(t)} ${o(e(t))}`).join(` `),l=a(n);De&&(De.textContent=`${H(n)} · 공제 ${H(r.min)} ~ ${H(r.max)}`),Oe.innerHTML=`
    <svg viewBox="0 0 720 260" preserveAspectRatio="none">
      <line x1="58" y1="22" x2="58" y2="218" stroke="#CBD5E1" />
      <line x1="58" y1="218" x2="696" y2="218" stroke="#CBD5E1" />
      <text class="tax-chart-label" x="58" y="248">0</text>
      <text class="tax-chart-label" x="618" y="248">${Fe(t)} KRW</text>
      <text class="tax-chart-label" x="10" y="28">${Fe(i)}</text>
      <path d="${c(e=>X(e).max)}" fill="none" stroke="#FF5A00" stroke-width="3" />
      <path d="${c(e=>X(e).min)}" fill="none" stroke="#FDBA74" stroke-width="3" stroke-dasharray="6 6" />
      <path d="${c(e=>X(e).realMin)}" fill="none" stroke="#0F172A" stroke-width="3" />
      <line x1="${l}" y1="22" x2="${l}" y2="218" stroke="#64748B" stroke-dasharray="4 4" />
      <circle cx="${l}" cy="${o(r.max)}" r="5" fill="#FF5A00" />
      <circle cx="${l}" cy="${o(r.realMin)}" r="5" fill="#0F172A" />
      <rect x="${Math.min(l+10,490)}" y="32" width="210" height="72" rx="10" fill="white" stroke="#E2E8F0" />
      <text class="tax-chart-value" x="${Math.min(l+24,504)}" y="56">기부액 ${H(n)}</text>
      <text class="tax-chart-label" x="${Math.min(l+24,504)}" y="76">예상 공제 ${H(r.min)} ~ ${H(r.max)}</text>
      <text class="tax-chart-label" x="${Math.min(l+24,504)}" y="94">실질 비용 ${H(r.realMin)} ~ ${H(r.realMax)}</text>
    </svg>
  `}function Z(){b&&(b.textContent=N>0?`READY`:`NO DATA`,b.className=N>0?`status-badge success`:`status-badge error`),x&&(x.textContent=Pe(N)),S&&(S.textContent=N>0?`계산 대기`:`기부 이력 없음`),C&&(C.textContent=`-`),w&&(w.textContent=N>0?`기부 이력과 기부자 유형을 기준으로 참고 추정치를 확인하세요.`:`계산할 기부 이력이 아직 없습니다.`),T&&(T.textContent=`관련 법령: -`),E&&(E.disabled=N<=0),ot(),st(Number(D?.value??N))}function ct(){let e=_?.value===`법인`?`법인`:`개인`;return{donor_type:e,annual_income_range:e===`개인`?v?.value??`5천만원_이하`:void 0,annual_profit_range:e===`법인`?Se?.value??`2억_이하`:void 0,donation_type:e===`법인`?y?.value??`지정기부금`:void 0,donation_amount:N}}function lt(e){let t=Math.max(0,Math.round(e.estimated_deduction_min)),n=Math.max(t,Math.round(e.estimated_deduction_max));b&&(b.textContent=e.source===`anthropic`?`AI`:`ESTIMATE`,b.className=`status-badge success`),x&&(x.textContent=Pe(N)),S&&(S.textContent=`${H(t)} ~ ${H(n)}`),C&&(C.textContent=`${H(N-n)} ~ ${H(N-t)}`),w&&(w.textContent=e.explanation),T&&(T.textContent=`관련 법령: ${e.applicable_law}`)}async function ut(){if(!(!E||N<=0))try{E.disabled=!0,E.textContent=`계산 중`,b&&(b.textContent=`RUNNING`);let e=await fetch(`${a}/api/tax-sim/calculate`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(ct())});if(!e.ok)throw Error(await e.text());lt(await e.json())}catch(e){b&&(b.textContent=`ERROR`,b.className=`status-badge error`),w&&(w.textContent=e instanceof Error?e.message:`절세 시뮬레이션에 실패했습니다.`)}finally{E.disabled=N<=0,E.textContent=`내 기부 기준 계산`}}function dt(){je||(je=!0,xe?.addEventListener(`click`,()=>{ie(),Ne(),window.location.reload()}),_?.addEventListener(`change`,()=>{it(),Z()}),v?.addEventListener(`change`,Z),Se?.addEventListener(`change`,Z),y?.addEventListener(`change`,Z),D?.addEventListener(`input`,()=>st(Number(D.value))),E?.addEventListener(`click`,()=>void ut()),Ee?.addEventListener(`click`,()=>{window.alert(`세무 파트너 상담 연결은 Phase 2 리퍼럴 모델로 준비 중입니다.`)}),he?.addEventListener(`click`,()=>void nt()),ge?.addEventListener(`click`,rt),_e?.addEventListener(`click`,()=>void $()),M?.addEventListener(`click`,e=>{let t=e.target?.closest(`.credential-detail-btn`);t?.dataset.donationId&&xt(t.dataset.donationId)}),document.addEventListener(`click`,e=>{let t=e.target?.closest(`.payment-detail-btn`);t?.dataset.donationId&&bt(t.dataset.donationId)}),document.addEventListener(`click`,e=>{let t=e.target?.closest(`button[data-status-page-target]`),n=t?.dataset.statusPageTarget,r=Number(t?.dataset.page??1);n&&Ye(n,r)}),document.addEventListener(`click`,St),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&document.querySelector(`.credential-detail-modal, .payment-detail-modal`)?.remove()}),Ae?.addEventListener(`click`,e=>{let t=e.target?.closest(`button[data-period]`);t&&(F=t.dataset.period??`month`,Ae.querySelectorAll(`button`).forEach(e=>e.classList.toggle(`active`,e===t)),ht())}))}function ft(e){let t=P.find(t=>t.id===e||t.dbId===e);if(!t?.txHash){Y(`검증 가능한 트랜잭션 해시가 없습니다.`,!0);return}let n=t.receiptId??t.evidenceHash??t.txHash;window.open(`./verify.html?id=${encodeURIComponent(n)}`,`_blank`,`noreferrer`)}function pt(e,t){let n=e.allocations,r=Array.isArray(n)?n:n?.items??[],i=n?.meta??{};return{id:e.id,userId:e.userId,donatedAt:e.donatedAt,amountKrw:e.amountKrw,allocations:r,paymentStatus:e.paymentStatus,proofStatus:e.proofStatus,nftStatus:e.nftStatus,settlementStatus:e.settlementStatus,txHash:e.txHash??void 0,proofNftId:e.proofNftId??void 0,explorerUrl:e.explorerUrl??void 0,validationStatus:e.validationStatus,receiptId:e.receiptId??i.receiptId??void 0,evidenceHash:e.evidenceHash??i.evidenceHash??void 0,complianceHash:e.complianceHash??i.complianceHash??void 0,asset:e.asset??i.asset??void 0,amountAsset:e.amountAsset??i.amountAsset??void 0,xrplAccount:e.xrplAccount??t,proofMintStatus:i.credential?.status===`accepted`?`credential_accepted`:i.credential?.status===`accept_pending`?`credential_accept_pending`:i.credential?.status===`failed`?`credential_failed`:e.txHash?`evidence_ready`:`none`,credentialIssuer:i.credential?.issuer??void 0,credentialType:i.credential?.credentialType??void 0,credentialUri:i.credential?.uri??void 0,credentialIssueTxHash:i.credential?.issueTxHash??void 0,credentialIssueExplorerUrl:i.credential?.issueExplorerUrl??void 0,credentialAcceptTxHash:i.credential?.acceptTxHash??void 0,credentialAcceptExplorerUrl:i.credential?.acceptExplorerUrl??void 0,credentialStatus:i.credential?.status??void 0,source:`local`,dbId:e.id}}function mt(e,t,n){let r=l(),i=P.filter(e=>!!e.txHash).length,a=P.filter(e=>!!(e.txHash||e.evidenceHash)).length,o=Le(P);ce&&(ce.innerHTML=`
      <article class="portfolio-stat-card">
        <span>연결 지갑</span>
        <strong>${r?`${r.account.slice(0,6)}...${r.account.slice(-4)}`:`미연결`}</strong>
        <p>${r?`DB 동기화 ${n}건`:`Xaman 연결 시 지갑 기준 기록 표시`}</p>
      </article>
      <article class="portfolio-stat-card">
        <span>온체인 기록</span>
        <strong>${i}건</strong>
        <p>Evidence ready ${a}건</p>
      </article>
      <article class="portfolio-stat-card">
        <span>등급</span>
        <strong>${t.toUpperCase()}</strong>
        <p>${e}</p>
      </article>
    `),ht(),gt(o),_t()}function ht(){if(!k||!A)return;let e=Ge(F),t=e.map(e=>e.amount),n=Math.max(...t,1),r=Ke(e),i=qe(t);ke&&(ke.textContent=H(r)),O&&(F===`total`?O.textContent=`TOTAL`:F===`ytd`?O.textContent=`YTD`:i===null?O.textContent=`최근 기부`:O.textContent=`${i>=0?`↑`:`↓`} ${i>0?`+`:``}${i}%`);let a=F!==`total`;if(k.classList.toggle(`hidden`,!a),A.classList.toggle(`hidden`,!a),!a){k.innerHTML=``,A.innerHTML=``;return}k.innerHTML=e.map(({amount:e})=>{let t=e>0?Math.max(18,Math.round(e/n*85)):4,r=e>0?`solid`:`empty`,i=e>0?`<span class="bar-value">${H(e)}</span><span class="bar-indicator" aria-hidden="true"></span>`:``;return`<div class="bar-wrapper" title="${H(e)}">${i}<div class="bar ${r}" style="height:${t}%"></div></div>`}).join(``),A.innerHTML=e.map(e=>`<span>${G(e.label)}</span>`).join(``)}function gt(e){if(!j)return;let t=Object.entries(e).filter(([,e])=>e.amount>0).sort(([e],[t])=>e===`KRW`?1:t===`KRW`?-1:e.localeCompare(t)),n=t.reduce((e,[,t])=>e+t.krw,0);if(t.length===0||n<=0){j.innerHTML=`<p class="muted-text">아직 표시할 자산 분포가 없습니다.</p>`;return}j.innerHTML=t.map(([e,t],r)=>{let i=Math.round(t.krw/n*100);return`
        <div class="token-row">
          <div class="row-between">
            <span>${e}</span>
            <strong>${e===`KRW`?H(t.krw):`${U(t.amount)} ${e}`}</strong>
          </div>
          <p class="token-subvalue">${e===`KRW`?`자산 정보가 없는 과거 기록`:`≈ ${H(t.krw)}`}</p>
          <div class="token-bar"><span class="${r===0?`blue`:`dark`}" style="width:${Math.max(3,i)}%"></span></div>
        </div>
      `}).join(``),j.insertAdjacentHTML(`beforeend`,`
      <div class="token-rate-note">
        <strong>환산 기준</strong>
        <span>XRPL Testnet 데모 지표이며, RLUSD/USDC는 1토큰 = 1,400 KRW 고정 환율로 표시합니다. 실제 세무·회계 금액은 기부 시점 기준가로 별도 확정해야 합니다.</span>
      </div>
    `)}function _t(){if(!M)return;let e=P.filter(e=>!!(e.txHash||e.evidenceHash));L=q(L,e.length,B);let t=(L-1)*B,n=e.slice(t,t+B);if(n.length===0){M.innerHTML=`<p class="muted-text">Evidence가 준비되면 Credential 상태가 여기에 표시됩니다.</p>`;return}M.innerHTML=n.map(e=>{let t=e.credentialStatus??(e.txHash?`evidence_ready`:`pending`),n=e.credentialStatus===`accepted`?`accepted`:e.credentialStatus===`failed`?`failed`:`pending`;return`
        <button class="credential-mini-card credential-detail-btn" type="button" data-donation-id="${G(e.id)}">
          <div class="credential-icon">✓</div>
          <div>
            <strong>${G(e.receiptId??`Donation Evidence`)}</strong>
            <span><em class="credential-status-dot ${n}"></em>${G(t)} · ${G(W(e.credentialAcceptTxHash??e.txHash??e.evidenceHash))}</span>
          </div>
          <small>상세보기</small>
        </button>
      `}).join(``)+Je(`credentials`,L,e.length,B)}function Q(e,t,n){let r=n?`<a class="text-link" href="${G(n)}" target="_blank" rel="noreferrer">${G(t)}</a>`:`<strong>${G(t)}</strong>`;return`<div class="credential-detail-row"><span>${G(e)}</span>${r}</div>`}function vt(e){let t=We(e);return`
    <div class="credential-ledger-summary">
      <article>
        <span>Ledger status</span>
        <strong><em class="credential-status-dot ${e?.accepted?`accepted`:e?.exists?`pending`:`failed`}"></em>${G(t)}</strong>
      </article>
      <article>
        <span>Credential object</span>
        <strong>${G(W(e?.index??void 0))}</strong>
      </article>
      <article>
        <span>Previous TX</span>
        <strong>${G(W(e?.previousTxId??void 0))}</strong>
      </article>
    </div>
  `}function yt(e){let t=ze(e?.result)?.TransactionResult??e?.result?.engine_result??`-`,n=Be(Re(e?.result)?.Amount);return`
    <div class="credential-ledger-summary">
      <article>
        <span>Payment status</span>
        <strong><em class="credential-status-dot ${e?.validated?`accepted`:`failed`}"></em>${e?.validated?`Validated`:`Not validated`}</strong>
      </article>
      <article>
        <span>Amount</span>
        <strong>${G(n)}</strong>
      </article>
      <article>
        <span>Result</span>
        <strong>${G(t)}</strong>
      </article>
    </div>
  `}async function bt(e){let t=P.find(t=>t.id===e||t.dbId===e);if(!t?.txHash)return;document.querySelectorAll(`.credential-detail-modal, .payment-detail-modal`).forEach(e=>e.remove());let n=null;try{n=await ne(t.txHash)}catch(e){n={hash:t.txHash,validated:!1,explorerUrl:K(t.txHash),error:e instanceof Error?e.message:`Payment transaction lookup failed`}}let r=Re(n.result),i=ze(n.result),a=He(r),o=Be(r?.Amount),s=Be(i?.delivered_amount??i?.DeliveredAmount),c=r?.Fee?`${U(Number(r.Fee)/1e6)} XRP`:`-`,l=typeof r?.Amount==`object`?r.Amount.issuer:void 0,u=t.receiptId??t.evidenceHash??t.txHash??t.id,ee=`./verify.html?id=${encodeURIComponent(u)}`,d=document.createElement(`div`);d.className=`modal-backdrop payment-detail-modal`,d.innerHTML=`
    <article class="modal-panel credential-detail-panel" role="dialog" aria-modal="true" aria-labelledby="payment-detail-title">
      <div class="modal-head">
        <div>
          <p class="modal-kicker">XRPL Payment Transaction</p>
          <h3 id="payment-detail-title">${G(W(t.txHash))}</h3>
          <p>${G(n.validated?`Payment validated`:`Payment not validated`)} · ${G(J(t.donatedAt))}</p>
        </div>
        <button class="modal-close payment-detail-close" type="button" aria-label="Close">&times;</button>
      </div>
      ${yt(n)}
      <div class="credential-detail-grid">
        ${Q(`Transaction Type`,r?.TransactionType)}
        ${Q(`TX Hash`,t.txHash,n.explorerUrl)}
        ${Q(`Result`,i?.TransactionResult??n.result?.engine_result)}
        ${Q(`Sender`,r?.Account)}
        ${Q(`Destination`,r?.Destination)}
        ${Q(`Amount`,o)}
        ${Q(`Delivered Amount`,s)}
        ${Q(`Asset Issuer`,l)}
        ${Q(`Fee`,c)}
        ${Q(`Ledger Index`,n.result?.ledger_index??r?.ledger_index)}
        ${Q(`Close Time`,n.result?.close_time_iso)}
        ${Q(`Receipt ID`,t.receiptId)}
        ${Q(`Evidence Hash`,t.evidenceHash)}
        ${Q(`Compliance Hash`,t.complianceHash)}
        ${Q(`Memo`,a.length>0?a.join(` | `):`-`)}
      </div>
      <div class="modal-actions">
        <a class="primary-btn" href="${G(n.explorerUrl)}" target="_blank" rel="noreferrer">Open XRPL Explorer</a>
        <a class="ghost-btn" href="${G(ee)}" target="_blank" rel="noreferrer">Open verification page</a>
      </div>
      ${n.error?`<p class="tax-disclaimer mt-12">Payment lookup: ${G(n.error)}</p>`:``}
    </article>
  `,document.body.appendChild(d),d.querySelector(`.payment-detail-close`)?.focus()}async function xt(e){let t=P.find(t=>t.id===e||t.dbId===e);if(!t)return;document.querySelector(`.credential-detail-modal`)?.remove();let n=await Xe(t),r=t.explorerUrl??K(t.txHash),i=t.credentialIssueExplorerUrl??K(t.credentialIssueTxHash),a=t.credentialAcceptTxHash??n?.previousTxId??void 0,o=t.credentialAcceptExplorerUrl??K(a),s=t.receiptId??t.evidenceHash??t.txHash??t.id,c=`./verify.html?id=${encodeURIComponent(s)}`,l=Ue(t.credentialStatus),u=We(n),ee=t.asset?`${U(Ie(t))} ${t.asset} (${H(t.amountKrw)})`:H(t.amountKrw),d=document.createElement(`div`);d.className=`modal-backdrop credential-detail-modal`,d.innerHTML=`
    <article class="modal-panel credential-detail-panel" role="dialog" aria-modal="true" aria-labelledby="credential-detail-title">
      <div class="modal-head">
        <div>
          <p class="modal-kicker">XLS-70 Credential</p>
          <h3 id="credential-detail-title">${G(t.receiptId??`Donation Evidence`)}</h3>
          <p>${G(l)} · ${G(u)} · ${G(J(t.donatedAt))}</p>
        </div>
        <button class="modal-close credential-detail-close" type="button" aria-label="Close">&times;</button>
      </div>
      ${vt(n)}
      <div class="credential-detail-grid">
        ${Q(`Status`,l)}
        ${Q(`Ledger Credential`,u)}
        ${Q(`Amount`,ee)}
        ${Q(`Holder`,t.xrplAccount)}
        ${Q(`Issuer`,t.credentialIssuer)}
        ${Q(`Credential Type`,t.credentialType)}
        ${Q(`Credential URI`,n?.uri??t.credentialUri)}
        ${Q(`Credential Object ID`,n?.index)}
        ${Q(`Ledger Index`,n?.ledgerIndex)}
        ${Q(`Ledger Flags`,n?.flags)}
        ${Q(`Payment TX`,W(t.txHash),r)}
        ${Q(`Credential Issue TX`,W(t.credentialIssueTxHash),i)}
        ${Q(`Credential Accept TX`,W(a),o)}
        ${Q(`Evidence Hash`,t.evidenceHash)}
        ${Q(`Compliance Hash`,t.complianceHash)}
      </div>
      <div class="modal-actions">
        <a class="primary-btn" href="${G(c)}" target="_blank" rel="noreferrer">Open verification page</a>
        ${t.txHash?`<button class="ghost-btn payment-detail-btn" type="button" data-donation-id="${G(t.id)}">Open Payment detail</button>`:``}
        ${o?`<a class="ghost-btn" href="${G(o)}" target="_blank" rel="noreferrer">Open Credential TX</a>`:``}
      </div>
      ${n?.error?`<p class="tax-disclaimer mt-12">Ledger lookup: ${G(n.error)}</p>`:``}
    </article>
  `,document.body.appendChild(d),d.querySelector(`.credential-detail-close`)?.focus()}function St(e){let t=e.target;(t?.classList.contains(`credential-detail-modal`)||t?.closest(`.credential-detail-close`)||t?.classList.contains(`payment-detail-modal`)||t?.closest(`.payment-detail-close`))&&document.querySelectorAll(`.credential-detail-modal, .payment-detail-modal`).forEach(e=>e.remove())}function Ct(){if(!le)return;I=q(I,P.length,z);let e=(I-1)*z,t=P.slice(e,e+z);if(t.length===0){le.innerHTML=`<div class="empty-state">아직 기부 기록이 없습니다.</div>`;return}le.innerHTML=t.map(e=>{let t=e.asset?`${U(Ie(e))} ${e.asset}`:H(e.amountKrw),n=e.txHash??e.evidenceHash;return`
        <article class="portfolio-list-item">
          <div class="portfolio-avatar">${(e.asset??`T`).slice(0,2)}</div>
          <div class="portfolio-list-info">
            <strong>${e.receiptId??`Donation Evidence`}</strong>
            <span>${J(e.donatedAt)} · <em>${W(n)}</em></span>
          </div>
          <div class="portfolio-list-amount">+${t}</div>
        </article>
      `}).join(``)+Je(`timeline`,I,P.length,z)}function wt(){if(!ue)return;R=q(R,P.length,V);let e=(R-1)*V;ue.innerHTML=`
    <table class="table">
      <thead>
        <tr>
          <th>일시</th>
          <th>금액</th>
          <th>정산/검증</th>
          <th>Credential 상태</th>
          <th>트랜잭션</th>
          <th>검증</th>
        </tr>
      </thead>
      <tbody>${P.slice(e,e+V).map(e=>{let t=e.txHash?`
          <div class="tx-cell-actions">
            <a class="text-link" href="${G(K(e.txHash))}" target="_blank" rel="noreferrer">${G(W(e.txHash))}</a>
            <button class="inline-link-btn payment-detail-btn" type="button" data-donation-id="${G(e.id)}">상세보기</button>
          </div>
        `:`-`,n=e.proofMintStatus===`credential_accepted`?`Credential issued`:e.proofMintStatus===`credential_accept_pending`?`Credential accept pending`:e.proofMintStatus===`credential_failed`?`Credential failed`:e.proofMintStatus===`evidence_ready`||e.txHash?`Evidence ready`:`Pending`;return`
        <tr>
          <td>${J(e.donatedAt)}</td>
          <td>${e.asset?`${e.amountAsset??`-`} ${e.asset}<br /><span class="trust">${H(e.amountKrw)}</span>`:Pe(e.amountKrw)}</td>
          <td>${Qe(e.settlementStatus)} / ${e.validationStatus??`-`}</td>
          <td>${n}</td>
          <td>${t}</td>
          <td>
            <button class="btn btn-secondary receipt-request-btn" type="button" data-receipt-id="${e.id}" ${e.txHash?``:`disabled`}>
              ${n===`Pending`?`대기`:`검증 보기`}
            </button>
          </td>
        </tr>
      `}).join(``)}</tbody>
    </table>
    ${Je(`table`,R,P.length,V)}
  `,ue.querySelectorAll(`.receipt-request-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.receiptId;t&&ft(t)})})}async function $(){dt();let e=await t(),r=await e.userRepository.getProfile(f),i=await e.donationRepository.listDonationsByUser(f),a=l(),o=a?(await n(a.account)).map(e=>pt(e,a.account)):[];if(tt(o.length),a){let e=s(f,a.account),t=new Set(o.map(e=>e.id)),n=new Set(o.map(e=>e.txHash).filter(Boolean)),r=e.filter(e=>!t.has(e.dbId??``)&&!t.has(e.id)&&!n.has(e.txHash??``));P=[...o,...r].sort((e,t)=>e.donatedAt<t.donatedAt?1:-1)}else P=c(i,f);await Ze(),I=q(I,P.length,z),L=q(L,P.filter(e=>!!(e.txHash||e.evidenceHash)).length,B),R=q(R,P.length,V),N=P.reduce((e,t)=>e+t.amountKrw,0),it(),Z(),Ne(),mt(r?.displayName??`Demo donor`,r?.tier??`seed`,o.length),Ct(),wt()}$();