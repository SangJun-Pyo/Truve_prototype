import{a as e,c as t,d as n,l as r,o as i,r as a,u as o}from"./cart-B_KX-ywA.js";/* empty css               */import"./modulepreload-polyfill-N-DOuI4P.js";import{a as s,d as ee,m as c,n as l,o as u,p as te,u as d}from"./xrpl-FTcenvDK.js";import{i as f}from"./donations-BtxmKuHC.js";import{a as ne,n as p,o as re,r as ie,s as m,t as ae}from"./wallet-BYPFygYZ.js";import{t as h}from"./proofNft-BLJlE7EF.js";var oe=n(),g=`usr_demo_001`,_=document.getElementById(`items-container`),v=document.getElementById(`preview-list`),y=document.getElementById(`total-amount`),se=Array.from(document.querySelectorAll(`.quick-btn`)),b=document.getElementById(`validation-box`),x=document.getElementById(`validation-total`),S=document.getElementById(`donation-destination`),C=document.getElementById(`donation-tx-status`),w=document.getElementById(`donation-tx-result`),T=document.getElementById(`execute-btn`),ce=document.getElementById(`rebalance-btn`),E=document.getElementById(`clear-btn`),D=document.getElementById(`proof-nft-btn`),O=document.getElementById(`proof-nft-status`),k=document.getElementById(`xaman-connect-btn`),A=document.getElementById(`xaman-disconnect-btn`),j=document.getElementById(`wallet-status`),M=document.getElementById(`wallet-address`),N=document.getElementById(`wallet-balance`),P=document.getElementById(`xaman-qr-wrap`),F=[],I=null;function L(){let e=Number(y?.value??0);return Number.isFinite(e)&&e>0?e:0}function R(){return e(F)}function z(){return R().reduce((e,t)=>e+t.ratioPct,0)}function B(){return R()[0]?.foundation??null}function V(e){return{climate:[`#D6E4FF`,`#ADC8FF`],education:[`#FFF1B8`,`#FFD666`],health:[`#FFEBE6`,`#FFBDAD`],animal:[`#E0F2FE`,`#BAE6FD`],humanitarian:[`#F3E8FF`,`#D8B4FE`]}[e]}function H(e,t=!1){C&&(C.textContent=e,C.className=t?`status-badge error`:`status-badge success`)}function U(e){if(!(!j||!M)){if(!e){j.textContent=`NOT CONNECTED`,j.className=`status-badge error`,M.textContent=`-`;return}j.textContent=`CONNECTED`,j.className=`status-badge success`,M.textContent=`${e.slice(0,6)}...${e.slice(-4)}`}}function W(e){N&&(N.textContent=e)}function G(e,t){P&&(P.innerHTML=`
    <img src="${e}" alt="Xaman QR" />
    <a class="ghost-btn" href="${t}" target="_blank" rel="noreferrer">Xaman 앱으로 열기</a>
  `)}function K(){P&&(P.innerHTML=``)}function le(){if(!S)return;let e=B();S.textContent=e?`${e.name}`:`-`}function q(){if(!T)return;let e=!!p(),t=R().length>0,n=z()===100,r=L()>0;T.disabled=!(e&&t&&n&&r)}function ue(){if(!b||!x)return;let e=z();if(x.textContent=`${e}%`,e===100)b.className=`validation-box success`,b.innerHTML=`<span>총 비율</span><span id="validation-total">100% ✓</span>`;else{let t=100-e,n=t>0?`${t}% 남음`:`${Math.abs(t)}% 초과`;b.className=`validation-box warning`,b.innerHTML=`<span>${n}</span><span id="validation-total">${e}%</span>`}}function J(){if(!v)return;let e=L(),t=R();if(t.length===0){v.innerHTML=`<div class="card-desc">장바구니가 비어 있습니다.</div>`;return}v.innerHTML=t.map(t=>{let[n,r]=V(t.foundation.category),i=e*t.ratioPct/100;return`
        <div class="preview-item">
          <div class="preview-row">
            <span>${t.foundation.name}</span>
            <div class="preview-vals">
              <span class="preview-percent">${t.ratioPct}%</span>
              <span class="preview-xrp">${i.toFixed(1)} XRP</span>
            </div>
          </div>
          <div class="mini-progress-bg">
            <div class="mini-progress-fill" style="width:${t.ratioPct}%; background-color:${r};"></div>
          </div>
        </div>
      `}).join(``)}function Y(){if(!_)return;let e=R();if(e.length===0){_.innerHTML=`
      <div class="empty-state">
        <p>포트폴리오가 비어 있습니다.</p>
        <a class="portfolio-back-link" href="./foundations.html" style="justify-content:center; margin-top:8px;">탐색 페이지로 이동</a>
      </div>
    `;return}_.innerHTML=e.map(e=>{let[t,n]=V(e.foundation.category);return`
        <article class="config-card" data-id="${e.foundation.id}">
          <div class="card-header-row">
            <div class="card-info-group">
              <div class="card-visual-small" style="background: linear-gradient(135deg, ${t}, ${n});">
                <div class="visual-pattern"></div>
              </div>
              <div>
                <div class="card-title-row">
                  <h3 class="card-title">${e.foundation.name}</h3>
                  <span class="card-tag">${e.foundation.category}</span>
                </div>
                <p class="card-desc">${e.foundation.description}</p>
              </div>
            </div>
            <button class="remove-btn" data-remove-id="${e.foundation.id}" type="button" title="삭제">✕</button>
          </div>

          <div class="allocation-area">
            <div class="allocation-header">
              <span>Allocation</span>
              <span>Target ratio</span>
            </div>
            <div class="allocation-controls">
              <button class="adjust-btn" data-adjust-id="${e.foundation.id}" data-delta="-5" type="button">-5</button>
              <div class="slider-container">
                <input class="allocation-slider" type="range" min="0" max="100" value="${e.ratioPct}" data-ratio-id="${e.foundation.id}" />
              </div>
              <button class="adjust-btn" data-adjust-id="${e.foundation.id}" data-delta="5" type="button">+5</button>
              <div class="percent-input-wrapper">
                <input class="percent-input" type="number" min="0" max="100" value="${e.ratioPct}" data-input-id="${e.foundation.id}" />
                <span>%</span>
              </div>
            </div>
          </div>
        </article>
      `}).join(``),_.querySelectorAll(`[data-remove-id]`).forEach(e=>{e.addEventListener(`click`,()=>{let n=e.dataset.removeId;n&&(t(n),$())})}),_.querySelectorAll(`[data-ratio-id]`).forEach(e=>{e.addEventListener(`input`,()=>{let t=e.dataset.ratioId;t&&(o(t,Number(e.value)),$())})}),_.querySelectorAll(`[data-input-id]`).forEach(e=>{e.addEventListener(`change`,()=>{let t=e.dataset.inputId;t&&(o(t,Math.max(0,Math.min(100,Number(e.value)||0))),$())})}),_.querySelectorAll(`[data-adjust-id]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.adjustId,n=Number(e.dataset.delta??0);if(!t)return;let r=i().items.find(e=>e.foundationId===t);o(t,Math.max(0,Math.min(100,(r?.ratioPct??0)+n))),$()})})}function X(e){if(!w)return;if(!e){w.textContent=`아직 제출된 트랜잭션이 없습니다.`;return}let t=e.explorerUrl??(e.txHash?s(e.txHash):`-`);w.innerHTML=e.txHash?`TX: <a class="text-link" href="${t}" target="_blank" rel="noreferrer">${e.txHash}</a> (${e.validationStatus??`-`})`:`트랜잭션 정보 없음`}function de(){let e=i();if(e.items.length===0)return;let t=Math.floor(100/e.items.length),n=100-t*e.items.length;r({items:e.items.map(e=>{let r=+(n>0);return n-=r,{...e,ratioPct:t+r}})})}async function Z(){let e=p();if(!e){U(null),W(`-`),q();return}U(e.account);try{W(`${(await l(e.account)).balanceXrp} XRP`)}catch{W(`조회 실패`)}q()}async function fe(){try{H(`SignIn 요청 생성 중`,!1);let e=await re();G(e.qrPngUrl,e.deepLink);let t=await m(e.uuid);if(!t.signed||!t.account){H(`지갑 연결 취소`,!0);return}ie({account:t.account,connectedAt:new Date().toISOString(),lastPayloadUuid:e.uuid}),te(t.account),K(),await Z()}catch(e){H(e instanceof Error?e.message:`지갑 연결 실패`,!0)}}function pe(){ae(),K(),Z()}function Q(){return R().map(e=>({foundationId:e.foundation.id,ratioPct:e.ratioPct}))}async function me(){let e=p();if(!e){window.alert(`먼저 Xaman 지갑을 연결해주세요.`);return}if(R().length===0){window.alert(`장바구니가 비어 있습니다.`);return}if(z()!==100){window.alert(`비율 합계를 100%로 맞춰주세요.`);return}let t=L();if(t<=0){window.alert(`총 기부 금액(XRP)을 입력해주세요.`);return}let n=B();if(!n){window.alert(`수신 재단 지갑이 없습니다.`);return}try{H(`Xaman 서명 대기`,!1);let r=await ne({account:e.account,destination:n.walletAddress,amountDrops:(0,oe.xrpToDrops)(t.toFixed(6)),memoType:`TRUVE_DONATION`,memoData:JSON.stringify({userId:g,amountXrp:t,allocations:Q(),createdAt:new Date().toISOString()}).slice(0,230)});G(r.qrPngUrl,r.deepLink);let i=await m(r.uuid);if(!i.signed||!i.txHash){H(`서명 취소`,!0);return}H(`검증 대기`,!1);let a=await u(i.txHash),o=a.validated?`validated`:`signed`;H(`완료 (${o})`,!1);let s=Math.round(t*1e3),c={id:`dnt_live_${Date.now()}`,userId:g,donatedAt:new Date().toISOString(),amountKrw:s,allocations:Q(),paymentStatus:`paid`,proofStatus:`recorded`,nftStatus:`pending`,settlementStatus:`scheduled`,txHash:i.txHash,explorerUrl:a.explorerUrl,validationStatus:o,network:`testnet`,destinationAddress:n.walletAddress,foundationWallet:n.walletAddress,proofMintStatus:`none`,source:`local`};f(c),I=c,X(I),ee({xrplAccount:e.account,amountKrw:s,allocations:c.allocations,txHash:c.txHash,explorerUrl:c.explorerUrl}).then(e=>{if(e&&I){let t={...I,dbId:e.id};f(t),I=t}}),D&&(D.disabled=!1),await Z()}catch(e){H(e instanceof Error?e.message:`실행 오류`,!0)}}async function he(){if(!O)return;let e=p();if(!e||!I?.txHash){O.textContent=`먼저 지갑 연결과 기부 실행이 필요합니다.`;return}try{O.textContent=`Proof NFT 요청 생성 중...`;let t=await h({account:e.account,donationId:I.id,donationTxHash:I.txHash}),n={...I,proofMintStatus:t.validated?`recorded`:`requested`,proofMintTxHash:t.txHash,nftStatus:t.validated?`minted`:`pending`,proofNftId:t.validated?`proof_req_${Date.now()}`:void 0};I=n,f(n),n.dbId&&d(n.dbId,{nftStatus:n.nftStatus,proofStatus:`recorded`,proofNftId:n.proofNftId??null}),X(n),O.textContent=t.txHash?`Proof NFT 요청 완료: ${t.txHash}`:`Proof NFT 요청 취소`}catch(e){O.textContent=e instanceof Error?e.message:`요청 실패`}}function ge(){y?.addEventListener(`input`,()=>{J(),q()}),se.forEach(e=>{e.addEventListener(`click`,()=>{if(!y)return;let t=Number(e.dataset.add??0),n=Math.max(0,(Number(y.value)||0)+t);y.value=String(n),J(),q()})}),ce?.addEventListener(`click`,()=>{de(),$()}),E?.addEventListener(`click`,()=>{a(),$()}),k?.addEventListener(`click`,()=>{fe()}),A?.addEventListener(`click`,()=>{pe()}),T?.addEventListener(`click`,()=>{me()}),D?.addEventListener(`click`,()=>{he()})}function $(){Y(),J(),ue(),le(),q()}async function _e(){F=await(await c()).foundationRepository.list(),ge(),await Z(),X(I),$()}_e();