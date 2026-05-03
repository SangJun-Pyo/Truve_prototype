/* empty css               */import"./modulepreload-polyfill-N-DOuI4P.js";import{a as e,s as t}from"./xrpl-HgkFuIC6.js";import{t as n}from"./donations-DhDq83rv.js";import{t as r}from"./nav-Br5_uZS3.js";var i=`usr_demo_001`,a=document.getElementById(`top-nav`);a&&(a.innerHTML=r(`status`));var o=document.getElementById(`verify-status`),s=document.getElementById(`verify-result`);function c(){let e=window.location.pathname.split(`/`).filter(Boolean),t=e.findIndex(e=>e===`verify`),n=t>=0?e[t+1]:``,r=new URLSearchParams(window.location.search).get(`receipt_id`)??``;return decodeURIComponent(n||r||``).trim()}function l(e,t=!1){o&&(o.textContent=e,o.className=t?`status-badge error`:`status-badge success`)}function u(e){return`${Math.round(e).toLocaleString(`ko-KR`)} KRW`}function d(e,t){return e.receiptId===t||e.evidenceHash===t||e.txHash===t||e.id===t||e.dbId===t}function f(t){if(!s)return;let n=t.explorerUrl??(t.txHash?e(t.txHash):``);l(t.validationStatus===`validated`?`VERIFIED`:`RECORDED`),s.innerHTML=`
    <article class="timeline-item">
      <div class="row-between">
        <strong>${t.receiptId??t.id}</strong>
        <span class="badge">${t.validationStatus??`recorded`}</span>
      </div>
      <div class="onchain-card mt-12">
        <div class="onchain-row"><span>Receipt ID</span><strong>${t.receiptId??t.id}</strong></div>
        <div class="onchain-row"><span>Evidence Hash</span><strong>${t.evidenceHash??`not recorded`}</strong></div>
        <div class="onchain-row"><span>Amount</span><strong>${t.amountAsset?`${t.amountAsset} ${t.asset}`:u(t.amountKrw)}</strong></div>
        <div class="onchain-row"><span>KRW Estimate</span><strong>${u(t.amountKrw)}</strong></div>
        <div class="onchain-row"><span>Network</span><strong>${t.network??`testnet`}</strong></div>
        <div class="onchain-row"><span>Destination</span><strong>${t.destinationAddress??t.foundationWallet??`-`}</strong></div>
        <div class="onchain-row"><span>TX Hash</span><strong>${t.txHash??`-`}</strong></div>
      </div>
      ${n?`<a class="ghost-btn mt-12" href="${n}" target="_blank" rel="noreferrer">Open XRPL Testnet Explorer</a>`:``}
    </article>
  `}async function p(){let e=c();if(!e){l(`NO ID`,!0),s&&(s.innerHTML=`<p class="tax-disclaimer">Missing receipt_id. Use /verify/{receipt_id}.</p>`);return}let r=await(await t()).donationRepository.listDonationsByUser(i),a=[...n(i),...r.map(e=>({...e,source:`mock`}))].find(t=>d(t,e));if(!a){l(`NOT FOUND`,!0),s&&(s.innerHTML=`
        <p class="tax-disclaimer">No local prototype proof found for ${e}.</p>
        <p class="microcopy">This prototype verifies local/browser and demo records. Deployed verification should use the production proof database.</p>
      `);return}f(a)}p();