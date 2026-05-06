/* empty css               */import"./modulepreload-polyfill-N-DOuI4P.js";import{c as e,t}from"./db-CVeDYW1a.js";import{t as n}from"./donations-BtxmKuHC.js";import{a as r}from"./xrpl-NF2kgMu0.js";import{t as i}from"./nav-YCQT744t.js";var a=`usr_demo_001`,o=document.getElementById(`top-nav`);o&&(o.innerHTML=i(`status`));var s=document.getElementById(`verify-status`),c=document.getElementById(`verify-result`);function l(){let e=window.location.pathname.split(`/`).filter(Boolean),t=e.findIndex(e=>e===`verify`),n=t>=0?e[t+1]:``,r=new URLSearchParams(window.location.search),i=r.get(`receipt_id`)??r.get(`id`)??``;return decodeURIComponent(n||i||``).trim()}function u(e,t=!1){s&&(s.textContent=e,s.className=t?`status-badge error`:`status-badge success`)}function d(e){return`${Math.round(e).toLocaleString(`ko-KR`)} KRW`}function f(e,t){return e.receiptId===t||e.evidenceHash===t||e.txHash===t||e.id===t||e.dbId===t}function p(e){let t=e.allocations,n=Array.isArray(t)?t:t?.items??[],r=t?.meta??{};return{id:e.id,userId:e.userId,donatedAt:e.donatedAt,amountKrw:e.amountKrw,allocations:n,paymentStatus:e.paymentStatus,proofStatus:e.proofStatus,nftStatus:e.nftStatus,settlementStatus:e.settlementStatus,txHash:e.txHash??void 0,proofNftId:e.proofNftId??void 0,explorerUrl:e.explorerUrl??void 0,validationStatus:e.validationStatus,receiptId:e.receiptId??r.receiptId??void 0,evidenceHash:e.evidenceHash??r.evidenceHash??void 0,complianceHash:e.complianceHash??r.complianceHash??void 0,asset:e.asset??r.asset??void 0,amountAsset:e.amountAsset??r.amountAsset??void 0,proofMintStatus:r.credential?.status===`accepted`?`credential_accepted`:r.credential?.status===`accept_pending`?`credential_accept_pending`:r.credential?.status===`failed`?`credential_failed`:e.txHash?`evidence_ready`:`none`,credentialIssuer:r.credential?.issuer??void 0,credentialType:r.credential?.credentialType??void 0,credentialUri:r.credential?.uri??void 0,credentialIssueTxHash:r.credential?.issueTxHash??void 0,credentialIssueExplorerUrl:r.credential?.issueExplorerUrl??void 0,credentialAcceptTxHash:r.credential?.acceptTxHash??void 0,credentialAcceptExplorerUrl:r.credential?.acceptExplorerUrl??void 0,credentialStatus:r.credential?.status??void 0,source:`local`,dbId:e.id}}function m(e){if(!c)return;let t=e.explorerUrl??(e.txHash?r(e.txHash):``);u(e.validationStatus===`validated`?`VERIFIED`:`RECORDED`),c.innerHTML=`
    <article class="timeline-item">
      <div class="row-between">
        <strong>${e.receiptId??e.id}</strong>
        <span class="badge">${e.validationStatus??`recorded`}</span>
      </div>
      <div class="onchain-card mt-12">
        <div class="onchain-row"><span>Receipt ID</span><strong>${e.receiptId??e.id}</strong></div>
        <div class="onchain-row"><span>Evidence Hash</span><strong>${e.evidenceHash??`not recorded`}</strong></div>
        <div class="onchain-row"><span>Amount</span><strong>${e.amountAsset?`${e.amountAsset} ${e.asset}`:d(e.amountKrw)}</strong></div>
        <div class="onchain-row"><span>KRW Estimate</span><strong>${d(e.amountKrw)}</strong></div>
        <div class="onchain-row"><span>Network</span><strong>${e.network??`testnet`}</strong></div>
        <div class="onchain-row"><span>Destination</span><strong>${e.destinationAddress??e.foundationWallet??`-`}</strong></div>
        <div class="onchain-row"><span>TX Hash</span><strong>${e.txHash??`-`}</strong></div>
        <div class="onchain-row"><span>Evidence</span><strong>${e.evidenceHash?`ready`:`pending`}</strong></div>
        <div class="onchain-row"><span>XLS-70 Credential</span><strong>${e.credentialStatus??`not issued`}</strong></div>
        <div class="onchain-row"><span>Credential Issuer</span><strong>${e.credentialIssuer??`-`}</strong></div>
        <div class="onchain-row"><span>Credential Type</span><strong>${e.credentialType??`-`}</strong></div>
      </div>
      ${t?`<a class="ghost-btn mt-12" href="${t}" target="_blank" rel="noreferrer">Open XRPL Testnet Explorer</a>`:``}
      ${e.credentialAcceptExplorerUrl?`<a class="ghost-btn mt-12" href="${e.credentialAcceptExplorerUrl}" target="_blank" rel="noreferrer">Open CredentialAccept TX</a>`:``}
    </article>
  `}async function h(){let r=l();if(!r){u(`NO ID`,!0),c&&(c.innerHTML=`<p class="tax-disclaimer">Missing receipt_id. Use /verify/{receipt_id}.</p>`);return}let i=await(await e()).donationRepository.listDonationsByUser(a),o=[...n(a),...i.map(e=>({...e,source:`mock`}))].find(e=>f(e,r));if(!o){let e=await t(r);if(e){m(p(e));return}u(`NOT FOUND`,!0),c&&(c.innerHTML=`
        <p class="tax-disclaimer">No local prototype proof found for ${r}.</p>
        <p class="microcopy">This prototype verifies local/browser and demo records. Deployed verification should use the production proof database.</p>
      `);return}m(o)}h();