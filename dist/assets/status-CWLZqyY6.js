/* empty css               */import"./modulepreload-polyfill-CfRWewTA.js";import{t as e}from"./provider-wBI-_yYj.js";import{i as t,l as n,u as r}from"./db-Bb3MhysS.js";import{n as i,r as a}from"./donations-Yv8Ifjw3.js";import{n as o,o as s,r as c,s as l,t as ee}from"./wallet-Bpxj4PC5.js";import{t as te}from"./nav-BPnoixS_.js";var u=`usr_demo_001`,d=document.getElementById(`top-nav`);d&&(d.innerHTML=te(`status`));var f=document.getElementById(`status-summary`),p=document.getElementById(`status-timeline`),m=document.getElementById(`status-table`),h=document.getElementById(`receipt-request-status`),g=document.getElementById(`status-wallet-badge`),_=document.getElementById(`status-wallet-address`),v=document.getElementById(`status-wallet-sync`),ne=document.getElementById(`status-xaman-connect-btn`),re=document.getElementById(`status-xaman-disconnect-btn`),ie=document.getElementById(`status-refresh-btn`),y=document.getElementById(`status-xaman-qr-wrap`),b=document.getElementById(`status-tax-donor-type`),x=document.getElementById(`status-tax-income-range`),S=document.getElementById(`status-tax-profit-range`),C=document.getElementById(`status-tax-donation-type`),ae=document.getElementById(`status-tax-income-field`),oe=document.getElementById(`status-tax-profit-field`),se=document.getElementById(`status-tax-donation-type-field`),w=document.getElementById(`status-tax-source-badge`),T=document.getElementById(`status-tax-donation-amount`),E=document.getElementById(`status-tax-deduction-range`),D=document.getElementById(`status-tax-real-cost`),O=document.getElementById(`status-tax-explanation`),k=document.getElementById(`status-tax-law`),A=document.getElementById(`status-tax-calc-btn`),ce=document.getElementById(`status-tax-partner-btn`),j=document.getElementById(`tax-scenario-slider`),M=document.getElementById(`tax-scenario-label`),N=document.getElementById(`tax-scenario-chart`),P=document.getElementById(`portfolio-total-amount`),F=document.getElementById(`impact-main-number`),I=document.getElementById(`impact-growth-badge`),L=document.getElementById(`impact-chart-area`),R=document.getElementById(`impact-chart-labels`),z=document.getElementById(`token-distribution`),B=document.getElementById(`credential-list`),V=0,H=[],U=!1;function W(e){return`${Math.max(0,Math.round(e)).toLocaleString(`ko-KR`)}원`}function G(e){return`${Math.max(0,Math.round(e)).toLocaleString(`ko-KR`)} KRW`}function K(e){return e>=1e8?`${(e/1e8).toFixed(1)}억`:e>=1e4?`${Math.round(e/1e4).toLocaleString(`ko-KR`)}만`:e.toLocaleString(`ko-KR`)}function q(e){return e.toLocaleString(`ko-KR`,{maximumFractionDigits:6})}function J(e){return e?`${e.slice(0,6)}...${e.slice(-4)}`:`-`}function le(e){return new Intl.DateTimeFormat(`ko-KR`,{year:`numeric`,month:`2-digit`,day:`2-digit`,hour:`2-digit`,minute:`2-digit`}).format(new Date(e))}function ue(e){return{paid:`결제 완료`,pending:`대기`,failed:`실패`,recorded:`증빙 기록`,minted:`Evidence 기록 완료`,scheduled:`정산 예정`,done:`정산 완료`,error:`오류`}[e]??e}function Y(e,t=!1){h&&(h.textContent=e,h.className=t?`notice error`:`notice`)}function de(e,t){y&&(y.innerHTML=`
    <img src="${e}" alt="Xaman QR" />
    <a class="ghost-btn" href="${t}" target="_blank" rel="noreferrer">Xaman에서 열기</a>
  `)}function fe(){y&&(y.innerHTML=``)}function pe(e=0){let t=o();g&&(g.textContent=t?`CONNECTED`:`NOT CONNECTED`,g.className=t?`status-badge success`:`status-badge error`),_&&(_.textContent=t?`${t.account.slice(0,6)}...${t.account.slice(-4)}`:`-`),v&&(v.textContent=t?`DB 기부 기록 ${e}건 + 로컬/목업 기록`:`Xaman 연결 전: 로컬/목업 기록만 표시`)}async function me(){try{Y(`Xaman SignIn 요청을 생성하는 중입니다.`);let e=await s();de(e.qrPngUrl,e.deepLink);let t=await l(e.uuid);if(!t.signed||!t.account){Y(`Xaman 연결이 취소되었습니다.`,!0);return}c({account:t.account,connectedAt:new Date().toISOString(),lastPayloadUuid:e.uuid}),n(t.account),fe(),Y(`Xaman 지갑이 연결되었습니다. 기부 기록을 동기화합니다.`),await $()}catch(e){Y(e instanceof Error?e.message:`Xaman 연결에 실패했습니다.`,!0)}}function he(){ee(),fe(),Y(`Xaman 연결을 해제했습니다. 로컬/목업 기록만 표시합니다.`),$()}function ge(){let e=b?.value===`법인`;ae?.classList.toggle(`hidden`,e),oe?.classList.toggle(`hidden`,!e),se?.classList.toggle(`hidden`,!e)}function _e(){return(b?.value===`법인`?`법인`:`개인`)==`개인`?x?.value===`1.5억_이상`?[.18,.28]:x?.value===`5천만~1.5억`?[.16,.24]:[.13,.2]:C?.value===`법정기부금`?[.18,.28]:C?.value===`일반기부금`?[.08,.16]:[.12,.22]}function X(e){let[t,n]=_e(),r=Math.round(e*t),i=Math.round(e*n);return{min:r,max:i,realMin:Math.max(0,e-i),realMax:Math.max(0,e-r)}}function ve(){if(!j)return;let e=Math.max(1e6,Math.ceil(Math.max(V,1e5)*2/1e5)*1e5);j.max=String(e),(Number(j.value)<=0||Number(j.value)>e)&&(j.value=String(V||Math.min(1e5,e)))}function Z(e){if(!N)return;let t=Number(j?.max??1e6),n=Math.max(0,Math.min(e,t)),r=X(n),i=Math.max(t,r.realMax,r.max)*1.05,a=e=>58+e/t*638,o=e=>218-e/i*196,s=Array.from({length:18},(e,n)=>t*n/17),c=e=>s.map((t,n)=>`${n===0?`M`:`L`} ${a(t)} ${o(e(t))}`).join(` `),l=a(n);M&&(M.textContent=`${G(n)} · 공제 ${G(r.min)} ~ ${G(r.max)}`),N.innerHTML=`
    <svg viewBox="0 0 720 260" preserveAspectRatio="none">
      <line x1="58" y1="22" x2="58" y2="218" stroke="#CBD5E1" />
      <line x1="58" y1="218" x2="696" y2="218" stroke="#CBD5E1" />
      <text class="tax-chart-label" x="58" y="248">0</text>
      <text class="tax-chart-label" x="618" y="248">${K(t)} KRW</text>
      <text class="tax-chart-label" x="10" y="28">${K(i)}</text>
      <path d="${c(e=>X(e).max)}" fill="none" stroke="#FF5A00" stroke-width="3" />
      <path d="${c(e=>X(e).min)}" fill="none" stroke="#FDBA74" stroke-width="3" stroke-dasharray="6 6" />
      <path d="${c(e=>X(e).realMin)}" fill="none" stroke="#0F172A" stroke-width="3" />
      <line x1="${l}" y1="22" x2="${l}" y2="218" stroke="#64748B" stroke-dasharray="4 4" />
      <circle cx="${l}" cy="${o(r.max)}" r="5" fill="#FF5A00" />
      <circle cx="${l}" cy="${o(r.realMin)}" r="5" fill="#0F172A" />
      <rect x="${Math.min(l+10,490)}" y="32" width="210" height="72" rx="10" fill="white" stroke="#E2E8F0" />
      <text class="tax-chart-value" x="${Math.min(l+24,504)}" y="56">기부액 ${G(n)}</text>
      <text class="tax-chart-label" x="${Math.min(l+24,504)}" y="76">예상 공제 ${G(r.min)} ~ ${G(r.max)}</text>
      <text class="tax-chart-label" x="${Math.min(l+24,504)}" y="94">실질 비용 ${G(r.realMin)} ~ ${G(r.realMax)}</text>
    </svg>
  `}function Q(){w&&(w.textContent=V>0?`READY`:`NO DATA`,w.className=V>0?`status-badge success`:`status-badge error`),T&&(T.textContent=W(V)),E&&(E.textContent=V>0?`계산 대기`:`기부 이력 없음`),D&&(D.textContent=`-`),O&&(O.textContent=V>0?`기부 이력과 기부자 유형을 기준으로 참고 추정치를 확인하세요.`:`계산할 기부 이력이 아직 없습니다.`),k&&(k.textContent=`관련 법령: -`),A&&(A.disabled=V<=0),ve(),Z(Number(j?.value??V))}function ye(){let e=b?.value===`법인`?`법인`:`개인`;return{donor_type:e,annual_income_range:e===`개인`?x?.value??`5천만원_이하`:void 0,annual_profit_range:e===`법인`?S?.value??`2억_이하`:void 0,donation_type:e===`법인`?C?.value??`지정기부금`:void 0,donation_amount:V}}function be(e){let t=Math.max(0,Math.round(e.estimated_deduction_min)),n=Math.max(t,Math.round(e.estimated_deduction_max));w&&(w.textContent=e.source===`anthropic`?`AI`:`ESTIMATE`,w.className=`status-badge success`),T&&(T.textContent=W(V)),E&&(E.textContent=`${G(t)} ~ ${G(n)}`),D&&(D.textContent=`${G(V-n)} ~ ${G(V-t)}`),O&&(O.textContent=e.explanation),k&&(k.textContent=`관련 법령: ${e.applicable_law}`)}async function xe(){if(!(!A||V<=0))try{A.disabled=!0,A.textContent=`계산 중`,w&&(w.textContent=`RUNNING`);let e=await fetch(`${r}/api/tax-sim/calculate`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(ye())});if(!e.ok)throw Error(await e.text());be(await e.json())}catch(e){w&&(w.textContent=`ERROR`,w.className=`status-badge error`),O&&(O.textContent=e instanceof Error?e.message:`절세 시뮬레이션에 실패했습니다.`)}finally{A.disabled=V<=0,A.textContent=`내 기부 기준 계산`}}function Se(){U||(U=!0,b?.addEventListener(`change`,()=>{ge(),Q()}),x?.addEventListener(`change`,Q),S?.addEventListener(`change`,Q),C?.addEventListener(`change`,Q),j?.addEventListener(`input`,()=>Z(Number(j.value))),A?.addEventListener(`click`,()=>void xe()),ce?.addEventListener(`click`,()=>{window.alert(`세무 파트너 상담 연결은 Phase 2 리퍼럴 모델로 준비 중입니다.`)}),ne?.addEventListener(`click`,()=>void me()),re?.addEventListener(`click`,he),ie?.addEventListener(`click`,()=>void $()))}function Ce(e){let t=H.find(t=>t.id===e||t.dbId===e);if(!t?.txHash){Y(`검증 가능한 트랜잭션 해시가 없습니다.`,!0);return}let n=t.receiptId??t.evidenceHash??t.txHash;window.open(`./verify.html?id=${encodeURIComponent(n)}`,`_blank`,`noreferrer`)}function we(e){let t=e.allocations,n=Array.isArray(t)?t:t?.items??[],r=t?.meta??{};return{id:e.id,userId:e.userId,donatedAt:e.donatedAt,amountKrw:e.amountKrw,allocations:n,paymentStatus:e.paymentStatus,proofStatus:e.proofStatus,nftStatus:e.nftStatus,settlementStatus:e.settlementStatus,txHash:e.txHash??void 0,proofNftId:e.proofNftId??void 0,explorerUrl:e.explorerUrl??void 0,validationStatus:e.validationStatus,receiptId:e.receiptId??r.receiptId??void 0,evidenceHash:e.evidenceHash??r.evidenceHash??void 0,complianceHash:e.complianceHash??r.complianceHash??void 0,asset:e.asset??r.asset??void 0,amountAsset:e.amountAsset??r.amountAsset??void 0,proofMintStatus:r.credential?.status===`accepted`?`credential_accepted`:r.credential?.status===`accept_pending`?`credential_accept_pending`:r.credential?.status===`failed`?`credential_failed`:e.txHash?`evidence_ready`:`none`,credentialIssuer:r.credential?.issuer??void 0,credentialType:r.credential?.credentialType??void 0,credentialUri:r.credential?.uri??void 0,credentialIssueTxHash:r.credential?.issueTxHash??void 0,credentialIssueExplorerUrl:r.credential?.issueExplorerUrl??void 0,credentialAcceptTxHash:r.credential?.acceptTxHash??void 0,credentialAcceptExplorerUrl:r.credential?.acceptExplorerUrl??void 0,credentialStatus:r.credential?.status??void 0,source:`local`,dbId:e.id}}function Te(e,t,n){let r=o(),i=H.reduce((e,t)=>e+t.amountKrw,0),a=H.filter(e=>!!e.txHash).length,s=H.filter(e=>!!(e.txHash||e.evidenceHash)).length,c=H.reduce((e,t)=>{let n=t.asset??`KRW`;return e[n]=(e[n]??0)+(t.amountAsset??t.amountKrw),e},{});P&&(P.textContent=G(i)),F&&(F.textContent=G(i)),I&&(I.textContent=`↑ ${H.length>1?`+10%`:`+0%`}`),f&&(f.innerHTML=`
      <article class="portfolio-stat-card">
        <span>연결 지갑</span>
        <strong>${r?`${r.account.slice(0,6)}...${r.account.slice(-4)}`:`미연결`}</strong>
        <p>${r?`DB 동기화 ${n}건`:`Xaman 연결 시 지갑 기준 기록 표시`}</p>
      </article>
      <article class="portfolio-stat-card">
        <span>온체인 기록</span>
        <strong>${a}건</strong>
        <p>Evidence ready ${s}건</p>
      </article>
      <article class="portfolio-stat-card">
        <span>등급</span>
        <strong>${t.toUpperCase()}</strong>
        <p>${e}</p>
      </article>
    `),Ee(),De(c),Oe()}function Ee(){if(!L||!R)return;let e=Array(7).fill(0),t=new Date;H.forEach(n=>{let r=new Date(n.donatedAt),i=6-((t.getFullYear()-r.getFullYear())*12+(t.getMonth()-r.getMonth()));i>=0&&i<e.length&&(e[i]+=n.amountKrw)});let n=[40,60,50,30,45,85,65],r=Math.max(...e,1);L.innerHTML=e.map((e,t)=>{let i=e>0?Math.max(18,Math.round(e/r*85)):n[t],a=t===5||e===r?`solid`:`striped`;return`<div class="bar-wrapper">${a===`solid`?`<span class="bar-indicator"></span>`:``}<div class="bar ${a}" style="height:${i}%"></div></div>`}).join(``),R.innerHTML=Array.from({length:7},(e,n)=>`<span>${new Date(t.getFullYear(),t.getMonth()-(6-n),1).toLocaleDateString(`en-US`,{month:`short`})}</span>`).join(``)}function De(e){if(!z)return;let t=Object.entries(e).filter(([,e])=>e>0),n=t.reduce((e,[,t])=>e+t,0);if(t.length===0||n<=0){z.innerHTML=`<p class="muted-text">아직 표시할 자산 분포가 없습니다.</p>`;return}z.innerHTML=t.map(([e,t],r)=>{let i=Math.round(t/n*100);return`
        <div class="token-row">
          <div class="row-between">
            <span>${e}</span>
            <strong>${q(t)}</strong>
          </div>
          <div class="token-bar"><span class="${r===0?`blue`:`dark`}" style="width:${Math.max(3,i)}%"></span></div>
        </div>
      `}).join(``)}function Oe(){if(!B)return;let e=H.filter(e=>!!(e.txHash||e.evidenceHash)).slice(0,3);if(e.length===0){B.innerHTML=`<p class="muted-text">Evidence가 준비되면 Credential 상태가 여기에 표시됩니다.</p>`;return}B.innerHTML=e.map(e=>{let t=e.credentialStatus??(e.txHash?`evidence_ready`:`pending`);return`
        <article class="credential-mini-card">
          <div class="credential-icon">✓</div>
          <div>
            <strong>${e.receiptId??`Donation Evidence`}</strong>
            <span>${t} · ${J(e.txHash??e.evidenceHash)}</span>
          </div>
        </article>
      `}).join(``)}function ke(){if(!p)return;let e=H.slice(0,4);if(e.length===0){p.innerHTML=`<div class="empty-state">아직 기부 기록이 없습니다.</div>`;return}p.innerHTML=e.map(e=>{let t=e.asset?`${q(e.amountAsset??0)} ${e.asset}`:G(e.amountKrw),n=e.txHash??e.evidenceHash;return`
        <article class="portfolio-list-item">
          <div class="portfolio-avatar">${(e.asset??`T`).slice(0,2)}</div>
          <div class="portfolio-list-info">
            <strong>${e.receiptId??`Donation Evidence`}</strong>
            <span>${le(e.donatedAt)} · <em>${J(n)}</em></span>
          </div>
          <div class="portfolio-list-amount">+${t}</div>
        </article>
      `}).join(``)}function Ae(){m&&(m.innerHTML=`
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
      <tbody>${H.map(e=>{let t=e.txHash?`<a class="text-link" href="https://testnet.xrpl.org/transactions/${e.txHash}" target="_blank" rel="noreferrer">${e.txHash}</a>`:`-`,n=e.proofMintStatus===`credential_accepted`?`Credential issued`:e.proofMintStatus===`credential_accept_pending`?`Credential accept pending`:e.proofMintStatus===`credential_failed`?`Credential failed`:e.proofMintStatus===`evidence_ready`||e.txHash?`Evidence ready`:`Pending`;return`
        <tr>
          <td>${le(e.donatedAt)}</td>
          <td>${e.asset?`${e.amountAsset??`-`} ${e.asset}<br /><span class="trust">${G(e.amountKrw)}</span>`:W(e.amountKrw)}</td>
          <td>${ue(e.settlementStatus)} / ${e.validationStatus??`-`}</td>
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
  `,m.querySelectorAll(`.receipt-request-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.receiptId;t&&Ce(t)})}))}async function $(){Se();let n=await e(),r=await n.userRepository.getProfile(u),s=await n.donationRepository.listDonationsByUser(u),c=o(),l=c?(await t(c.account)).map(we):[];if(pe(l.length),c){let e=i(u,c.account),t=new Set(l.map(e=>e.id)),n=new Set(l.map(e=>e.txHash).filter(Boolean)),r=e.filter(e=>!t.has(e.dbId??``)&&!t.has(e.id)&&!n.has(e.txHash??``));H=[...l,...r].sort((e,t)=>e.donatedAt<t.donatedAt?1:-1)}else H=a(s,u);V=H.reduce((e,t)=>e+t.amountKrw,0),ge(),Q(),Te(r?.displayName??`Demo donor`,r?.tier??`seed`,l.length),ke(),Ae()}$();