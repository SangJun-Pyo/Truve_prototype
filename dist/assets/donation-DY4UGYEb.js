import{a as e,c as t,d as n,l as r,o as i,r as a,u as o}from"./cart-DQyj-aMq.js";/* empty css               */import"./modulepreload-polyfill-iJ-6Fn-a.js";import{a as s,c,g as l,i as ee,l as u,m as te,n as d,o as f,p as ne,r as re,t as ie,u as p,v as m}from"./wallet-BizwjWsR.js";import{n as h}from"./donations-D7ZvcxFw.js";import{t as ae}from"./proofNft-KXwwHBk3.js";var g=n(),_=`usr_demo_001`,v=document.getElementById(`items-container`),y=document.getElementById(`preview-list`),b=document.getElementById(`total-amount`),x=Array.from(document.querySelectorAll(`.quick-btn`)),S=document.getElementById(`validation-box`),C=document.getElementById(`validation-total`),w=document.getElementById(`donation-destination`),T=document.getElementById(`donation-tx-status`),E=document.getElementById(`donation-tx-result`),D=document.getElementById(`execute-btn`),oe=document.getElementById(`rebalance-btn`),se=document.getElementById(`clear-btn`),O=document.getElementById(`proof-nft-btn`),k=document.getElementById(`proof-nft-status`),A=document.getElementById(`xaman-connect-btn`),j=document.getElementById(`xaman-disconnect-btn`),M=document.getElementById(`wallet-status`),N=document.getElementById(`wallet-address`),P=document.getElementById(`wallet-balance`),F=document.getElementById(`xaman-qr-wrap`),I=[],L=null;function R(){let e=Number(b?.value??0);return Number.isFinite(e)&&e>0?e:0}function z(){return e(I)}function B(){return z().reduce((e,t)=>e+t.ratioPct,0)}function V(){return z()[0]?.foundation??null}function H(e){return{climate:[`#D6E4FF`,`#ADC8FF`],education:[`#FFF1B8`,`#FFD666`],health:[`#FFEBE6`,`#FFBDAD`],animal:[`#E0F2FE`,`#BAE6FD`],humanitarian:[`#F3E8FF`,`#D8B4FE`]}[e]}function U(e,t=!1){T&&(T.textContent=e,T.className=t?`status-badge error`:`status-badge success`)}function W(e){if(!(!M||!N)){if(!e){M.textContent=`NOT CONNECTED`,M.className=`status-badge error`,N.textContent=`-`;return}M.textContent=`CONNECTED`,M.className=`status-badge success`,N.textContent=`${e.slice(0,6)}...${e.slice(-4)}`}}function G(e){P&&(P.textContent=e)}function K(e,t){F&&(F.innerHTML=`
    <img src="${e}" alt="Xaman QR" />
    <a class="ghost-btn" href="${t}" target="_blank" rel="noreferrer">Xaman 앱으로 열기</a>
  `)}function q(){F&&(F.innerHTML=``)}function ce(){if(!w)return;let e=V();w.textContent=e?`${e.name}`:`-`}function J(){if(!D)return;let e=!!d(),t=z().length>0,n=B()===100,r=R()>0;D.disabled=!(e&&t&&n&&r)}function le(){if(!S||!C)return;let e=B();if(C.textContent=`${e}%`,e===100)S.className=`validation-box success`,S.innerHTML=`<span>총 비율</span><span id="validation-total">100% ✓</span>`;else{let t=100-e,n=t>0?`${t}% 남음`:`${Math.abs(t)}% 초과`;S.className=`validation-box warning`,S.innerHTML=`<span>${n}</span><span id="validation-total">${e}%</span>`}}function Y(){if(!y)return;let e=R(),t=z();if(t.length===0){y.innerHTML=`<div class="card-desc">장바구니가 비어 있습니다.</div>`;return}y.innerHTML=t.map(t=>{let[n,r]=H(t.foundation.category),i=e*t.ratioPct/100;return`
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
      `}).join(``)}function ue(){if(!v)return;let e=z();if(e.length===0){v.innerHTML=`
      <div class="empty-state">
        <p>포트폴리오가 비어 있습니다.</p>
        <a class="portfolio-back-link" href="./foundations.html" style="justify-content:center; margin-top:8px;">탐색 페이지로 이동</a>
      </div>
    `;return}v.innerHTML=e.map(e=>{let[t,n]=H(e.foundation.category);return`
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
      `}).join(``),v.querySelectorAll(`[data-remove-id]`).forEach(e=>{e.addEventListener(`click`,()=>{let n=e.dataset.removeId;n&&(t(n),$())})}),v.querySelectorAll(`[data-ratio-id]`).forEach(e=>{e.addEventListener(`input`,()=>{let t=e.dataset.ratioId;t&&(o(t,Number(e.value)),$())})}),v.querySelectorAll(`[data-input-id]`).forEach(e=>{e.addEventListener(`change`,()=>{let t=e.dataset.inputId;t&&(o(t,Math.max(0,Math.min(100,Number(e.value)||0))),$())})}),v.querySelectorAll(`[data-adjust-id]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.adjustId,n=Number(e.dataset.delta??0);if(!t)return;let r=i().items.find(e=>e.foundationId===t);o(t,Math.max(0,Math.min(100,(r?.ratioPct??0)+n))),$()})})}function X(e){if(!E)return;if(!e){E.textContent=`아직 제출된 트랜잭션이 없습니다.`;return}let t=e.explorerUrl??(e.txHash?s(e.txHash):`-`);E.innerHTML=e.txHash?`TX: <a class="text-link" href="${t}" target="_blank" rel="noreferrer">${e.txHash}</a> (${e.validationStatus??`-`})`:`트랜잭션 정보 없음`}function de(){let e=i();if(e.items.length===0)return;let t=Math.floor(100/e.items.length),n=100-t*e.items.length;r({items:e.items.map(e=>{let r=+(n>0);return n-=r,{...e,ratioPct:t+r}})})}async function Z(){let e=d();if(!e){W(null),G(`-`),J();return}W(e.account);try{G(`${(await ee(e.account)).balanceXrp} XRP`)}catch{G(`조회 실패`)}J()}async function fe(){try{U(`SignIn 요청 생성 중`,!1);let e=await u();K(e.qrPngUrl,e.deepLink);let t=await p(e.uuid);if(!t.signed||!t.account){U(`지갑 연결 취소`,!0);return}re({account:t.account,connectedAt:new Date().toISOString(),lastPayloadUuid:e.uuid}),l(t.account),q(),await Z()}catch(e){U(e instanceof Error?e.message:`지갑 연결 실패`,!0)}}function pe(){ie(),q(),Z()}function Q(){return z().map(e=>({foundationId:e.foundation.id,ratioPct:e.ratioPct}))}async function me(){let e=d();if(!e){window.alert(`먼저 Xaman 지갑을 연결해주세요.`);return}if(z().length===0){window.alert(`장바구니가 비어 있습니다.`);return}if(B()!==100){window.alert(`비율 합계를 100%로 맞춰주세요.`);return}let t=R();if(t<=0){window.alert(`총 기부 금액(XRP)을 입력해주세요.`);return}let n=V();if(!n){window.alert(`수신 재단 지갑이 없습니다.`);return}try{U(`Xaman 서명 대기`,!1);let r=await c({account:e.account,destination:n.walletAddress,amountDrops:(0,g.xrpToDrops)(t.toFixed(6)),memoType:`TRUVE_DONATION`,memoData:JSON.stringify({userId:_,amountXrp:t,allocations:Q(),createdAt:new Date().toISOString()}).slice(0,230)});K(r.qrPngUrl,r.deepLink);let i=await p(r.uuid);if(!i.signed||!i.txHash){U(`서명 취소`,!0);return}U(`검증 대기`,!1);let a=await f(i.txHash),o=a.validated?`validated`:`signed`;U(`완료 (${o})`,!1);let s=Math.round(t*1e3),l={id:`dnt_live_${Date.now()}`,userId:_,donatedAt:new Date().toISOString(),amountKrw:s,allocations:Q(),paymentStatus:`paid`,proofStatus:`recorded`,nftStatus:`pending`,settlementStatus:`scheduled`,txHash:i.txHash,explorerUrl:a.explorerUrl,validationStatus:o,network:`testnet`,destinationAddress:n.walletAddress,foundationWallet:n.walletAddress,proofMintStatus:`none`,source:`local`};h(l),L=l,X(L),te({xrplAccount:e.account,amountKrw:s,allocations:l.allocations,txHash:l.txHash,explorerUrl:l.explorerUrl}).then(e=>{if(e&&L){let t={...L,dbId:e.id};h(t),L=t}}),O&&(O.disabled=!1),await Z()}catch(e){U(e instanceof Error?e.message:`실행 오류`,!0)}}async function he(){if(!k)return;let e=d();if(!e||!L?.txHash){k.textContent=`먼저 지갑 연결과 기부 실행이 필요합니다.`;return}try{k.textContent=`Proof NFT 요청 생성 중...`;let t=await ae({account:e.account,donationId:L.id,donationTxHash:L.txHash}),n={...L,proofMintStatus:t.validated?`recorded`:`requested`,proofMintTxHash:t.txHash,nftStatus:t.validated?`minted`:`pending`,proofNftId:t.validated?`proof_req_${Date.now()}`:void 0};L=n,h(n),n.dbId&&ne(n.dbId,{nftStatus:n.nftStatus,proofStatus:`recorded`,proofNftId:n.proofNftId??null}),X(n),k.textContent=t.txHash?`Proof NFT 요청 완료: ${t.txHash}`:`Proof NFT 요청 취소`}catch(e){k.textContent=e instanceof Error?e.message:`요청 실패`}}function ge(){b?.addEventListener(`input`,()=>{Y(),J()}),x.forEach(e=>{e.addEventListener(`click`,()=>{if(!b)return;let t=Number(e.dataset.add??0),n=Math.max(0,(Number(b.value)||0)+t);b.value=String(n),Y(),J()})}),oe?.addEventListener(`click`,()=>{de(),$()}),se?.addEventListener(`click`,()=>{a(),$()}),A?.addEventListener(`click`,()=>{fe()}),j?.addEventListener(`click`,()=>{pe()}),D?.addEventListener(`click`,()=>{me()}),O?.addEventListener(`click`,()=>{he()})}function $(){ue(),Y(),le(),ce(),J()}async function _e(){I=await(await m()).foundationRepository.list(),ge(),await Z(),X(L),$()}_e();