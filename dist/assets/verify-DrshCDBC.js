/* empty css               */import"./modulepreload-polyfill-N-DOuI4P.js";import{a as e,m as t,s as n}from"./xrpl-FTcenvDK.js";import{t as r}from"./donations-BtxmKuHC.js";import{t as i}from"./nav-Br5_uZS3.js";var a=`usr_demo_001`,o=document.getElementById(`top-nav`);o&&(o.innerHTML=i(`status`));var s=document.getElementById(`verify-status`),c=document.getElementById(`verify-result`);function l(){let e=window.location.pathname.split(`/`).filter(Boolean),t=e.findIndex(e=>e===`verify`),n=t>=0?e[t+1]:``,r=new URLSearchParams(window.location.search),i=r.get(`receipt_id`)??r.get(`id`)??``;return decodeURIComponent(n||i||``).trim()}function u(e,t=!1){s&&(s.textContent=e,s.className=t?`status-badge error`:`status-badge success`)}function d(e){return`${Math.round(e).toLocaleString(`ko-KR`)} KRW`}function f(e,t){return e.receiptId===t||e.evidenceHash===t||e.txHash===t||e.id===t||e.dbId===t}function p(e){let t=e.allocations,n=Array.isArray(t)?t:t?.items??[],r=t?.meta??{};return{id:e.id,userId:e.userId,donatedAt:e.donatedAt,amountKrw:e.amountKrw,allocations:n,paymentStatus:e.paymentStatus,proofStatus:e.proofStatus,nftStatus:e.nftStatus,settlementStatus:e.settlementStatus,txHash:e.txHash??void 0,proofNftId:e.proofNftId??void 0,explorerUrl:e.explorerUrl??void 0,validationStatus:e.validationStatus,receiptId:e.receiptId??r.receiptId??void 0,evidenceHash:e.evidenceHash??r.evidenceHash??void 0,complianceHash:e.complianceHash??r.complianceHash??void 0,asset:e.asset??r.asset??void 0,amountAsset:e.amountAsset??r.amountAsset??void 0,proofMintStatus:e.txHash?`recorded`:`none`,source:`local`,dbId:e.id}}function m(t){if(!c)return;let n=t.explorerUrl??(t.txHash?e(t.txHash):``);u(t.validationStatus===`validated`?`VERIFIED`:`RECORDED`),c.innerHTML=`
    <article class="timeline-item">
      <div class="row-between">
        <strong>${t.receiptId??t.id}</strong>
        <span class="badge">${t.validationStatus??`recorded`}</span>
      </div>
      <div class="onchain-card mt-12">
        <div class="onchain-row"><span>Receipt ID</span><strong>${t.receiptId??t.id}</strong></div>
        <div class="onchain-row"><span>Evidence Hash</span><strong>${t.evidenceHash??`not recorded`}</strong></div>
        <div class="onchain-row"><span>Amount</span><strong>${t.amountAsset?`${t.amountAsset} ${t.asset}`:d(t.amountKrw)}</strong></div>
        <div class="onchain-row"><span>KRW Estimate</span><strong>${d(t.amountKrw)}</strong></div>
        <div class="onchain-row"><span>Network</span><strong>${t.network??`testnet`}</strong></div>
        <div class="onchain-row"><span>Destination</span><strong>${t.destinationAddress??t.foundationWallet??`-`}</strong></div>
        <div class="onchain-row"><span>TX Hash</span><strong>${t.txHash??`-`}</strong></div>
      </div>
      ${n?`<a class="ghost-btn mt-12" href="${n}" target="_blank" rel="noreferrer">Open XRPL Testnet Explorer</a>`:``}
    </article>
  `}async function h(){let e=l();if(!e){u(`NO ID`,!0),c&&(c.innerHTML=`<p class="tax-disclaimer">Missing receipt_id. Use /verify/{receipt_id}.</p>`);return}let i=await(await t()).donationRepository.listDonationsByUser(a),o=[...r(a),...i.map(e=>({...e,source:`mock`}))].find(t=>f(t,e));if(!o){let t=await n(e);if(t){m(p(t));return}u(`NOT FOUND`,!0),c&&(c.innerHTML=`
        <p class="tax-disclaimer">No local prototype proof found for ${e}.</p>
        <p class="microcopy">This prototype verifies local/browser and demo records. Deployed verification should use the production proof database.</p>
      `);return}m(o)}h();