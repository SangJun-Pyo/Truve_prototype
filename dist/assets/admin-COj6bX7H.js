/* empty css               */import"./modulepreload-polyfill-CfRWewTA.js";import{n as e,t,u as n}from"./db-Bb3MhysS.js";import{t as r}from"./nav-BPnoixS_.js";var i=`truve_admin_secret`,a=document.getElementById(`top-nav`);a&&(a.innerHTML=r(`admin`));var o=document.getElementById(`faucet-form`),s=document.getElementById(`admin-secret`),c=document.getElementById(`recipient-address`),l=document.getElementById(`token-select`),u=document.getElementById(`token-amount`),d=document.getElementById(`send-token-btn`),f=document.getElementById(`trustline-btn`),p=document.getElementById(`default-ripple-btn`),m=document.getElementById(`clear-no-ripple-btn`),h=document.getElementById(`trustline-qr-wrap`),g=document.getElementById(`faucet-status`),_=document.getElementById(`faucet-result`),v=document.getElementById(`foundation-admin-list`),y=document.getElementById(`refresh-foundations-btn`),b=document.getElementById(`audit-form`),x=document.getElementById(`audit-receipt-id`),S=document.getElementById(`audit-wallet`),C=document.getElementById(`audit-tx-hash`),w=document.getElementById(`audit-status`),T=document.getElementById(`audit-note`),E=document.getElementById(`audit-log-list`),ee=document.getElementById(`export-audit-btn`),D=document.getElementById(`admin-donation-list`),O=document.getElementById(`refresh-donations-btn`),k=`truve_foundation_review_status`,A=`truve_foundation_audit_log_v1`;function j(){return s?.value.trim()??``}function M(e,t=!1){g&&(g.textContent=e,g.className=t?`status-badge error`:`status-badge success`)}function N(e,t=!1){_&&(_.innerHTML=`<p class="${t?`tax-disclaimer`:`microcopy`}">${e}</p>`)}function P(e){_&&(S&&(S.value=e.recipient),C&&(C.value=e.txHash),_.innerHTML=`
    <p class="microcopy"><strong>Test token sent successfully.</strong> Testnet only · No real value.</p>
    <div class="result-row"><span>Token</span><strong>${e.currency}</strong></div>
    <div class="result-row"><span>Amount</span><strong>${e.amount}</strong></div>
    <div class="result-row"><span>Recipient</span><strong>${e.recipient}</strong></div>
    <div class="result-row"><span>Tx Hash</span><a class="text-link" href="${e.explorerUrl}" target="_blank" rel="noreferrer">${e.txHash}</a></div>
    <div class="result-row"><span>Explorer</span><a class="text-link" href="${e.explorerUrl}" target="_blank" rel="noreferrer">Open XRPL Testnet Explorer</a></div>
  `)}function F(e){_&&(_.innerHTML=`
    <p class="microcopy"><strong>Issuer Default Ripple ${e.alreadyEnabled?`already enabled`:`enabled`}.</strong> Testnet only · No real value.</p>
    <div class="result-row"><span>Token</span><strong>${e.currency}</strong></div>
    <div class="result-row"><span>Issuer</span><strong>${e.issuer}</strong></div>
    <div class="result-row"><span>Status</span><strong>${e.defaultRippleEnabled?`ENABLED`:`DISABLED`}</strong></div>
    ${e.txHash&&e.explorerUrl?`<div class="result-row"><span>Tx Hash</span><a class="text-link" href="${e.explorerUrl}" target="_blank" rel="noreferrer">${e.txHash}</a></div>
           <div class="result-row"><span>Explorer</span><a class="text-link" href="${e.explorerUrl}" target="_blank" rel="noreferrer">Open XRPL Testnet Explorer</a></div>`:``}
    <p class="microcopy">${e.message}</p>
  `)}function I(e){_&&(_.innerHTML=`
    <p class="microcopy"><strong>Issuer-side NoRipple cleared.</strong> Testnet only · No real value.</p>
    <div class="result-row"><span>Token</span><strong>${e.currency}</strong></div>
    <div class="result-row"><span>Issuer</span><strong>${e.issuer}</strong></div>
    <div class="result-row"><span>TrustLine Peer</span><strong>${e.peer}</strong></div>
    <div class="result-row"><span>Tx Hash</span><a class="text-link" href="${e.explorerUrl}" target="_blank" rel="noreferrer">${e.txHash}</a></div>
    <div class="result-row"><span>Explorer</span><a class="text-link" href="${e.explorerUrl}" target="_blank" rel="noreferrer">Open XRPL Testnet Explorer</a></div>
    <p class="microcopy">${e.message}</p>
  `)}function L(){return l?.value===`USDC`?`USDC`:`RLUSD`}function R(){try{return JSON.parse(localStorage.getItem(k)??`{}`)}catch{return{}}}function z(e,t){let n=R();n[e]={status:t,reviewedAt:new Date().toISOString()},localStorage.setItem(k,JSON.stringify(n))}function B(){try{return JSON.parse(localStorage.getItem(A)??`[]`)}catch{return[]}}function V(e){localStorage.setItem(A,JSON.stringify(e))}function H(){return`receipt_${new Date().toISOString().replace(/[-:.TZ]/g,``).slice(0,14)}`}async function U(e){let t=new TextEncoder().encode(e),n=await crypto.subtle.digest(`SHA-256`,t);return[...new Uint8Array(n)].map(e=>e.toString(16).padStart(2,`0`)).join(``)}function W(){if(!E)return;let e=B();if(e.length===0){E.innerHTML=`<p class="microcopy">No audit events recorded yet.</p>`;return}E.innerHTML=e.map(e=>`
        <article class="foundation-admin-card">
          <div class="foundation-admin-head">
            <div>
              <h3>${e.receiptId}</h3>
              <p class="microcopy">${e.foundationWallet} · ${new Date(e.recordedAt).toLocaleString(`ko-KR`)}</p>
            </div>
            <span class="status-badge ${e.status===`flagged`?`error`:`success`}">${e.status.toUpperCase()}</span>
          </div>
          <div class="result-row"><span>Tx Hash</span><strong>${e.txHash}</strong></div>
          <div class="result-row"><span>Evidence Hash</span><strong>${e.evidenceHash}</strong></div>
          <p class="microcopy">${e.note||`No personal data stored.`}</p>
        </article>
      `).join(``)}function G(e){let t=e.allocations;return Array.isArray(t)?{}:t?.meta??{}}function K(e){let t=G(e),n=t.asset??e.asset,r=t.amountAsset??e.amountAsset;return n&&r?`${r} ${n}`:`${e.amountKrw.toLocaleString(`ko-KR`)} KRW`}function q(e){if(D){if(e.length===0){D.innerHTML=`<p class="microcopy">No DB donation records found.</p>`;return}D.innerHTML=e.map(e=>{let t=G(e),n=t.credential??{};return`
        <article class="foundation-admin-card">
          <div class="foundation-admin-head">
            <div>
              <h3>${K(e)}</h3>
              <p class="microcopy">${e.xrplAccount??`-`} · ${new Date(e.donatedAt).toLocaleString(`ko-KR`)}</p>
            </div>
            <span class="status-badge ${n.status===`failed`?`error`:`success`}">${n.status??`evidence_ready`}</span>
          </div>
          <div class="result-row"><span>Receipt ID</span><strong>${t.receiptId??e.id}</strong></div>
          <div class="result-row"><span>Evidence Hash</span><strong>${t.evidenceHash??`-`}</strong></div>
          <div class="result-row"><span>Tx Hash</span><strong>${e.txHash??`-`}</strong></div>
          <div class="foundation-admin-actions">
            ${e.txHash?`<a class="ghost-btn" href="./verify.html?id=${encodeURIComponent(t.receiptId??e.txHash)}" target="_blank" rel="noreferrer">Verify</a>`:``}
            <button class="ghost-btn admin-delete-donation-btn" type="button" data-donation-id="${e.id}">Hide/Delete Test Record</button>
          </div>
        </article>
      `}).join(``),D.querySelectorAll(`.admin-delete-donation-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.donationId;t&&Y(t)})})}}async function J(){if(!D)return;let t=j();if(localStorage.setItem(i,t),!t){D.innerHTML=`<p class="tax-disclaimer">Enter Admin Secret to load DB donation records.</p>`;return}D.innerHTML=`<p class="microcopy">Loading DB donation records...</p>`;try{q(await e(t))}catch(e){D.innerHTML=`<p class="tax-disclaimer">${e instanceof Error?e.message:`Donation lookup failed.`}</p>`}}async function Y(e){let n=j();if(!n){N(`Admin Secret is required to delete test records.`,!0);return}if(window.confirm(`Delete this test donation record from the prototype DB?`))try{await t(n,e),N(`Deleted test donation record ${e}.`),await J()}catch(e){N(e instanceof Error?e.message:`Delete failed.`,!0)}}async function X(){let e=(x?.value.trim()||H()).slice(0,80),t=S?.value.trim()??``,n=C?.value.trim()??``,r=w?.value===`flagged`?`flagged`:w?.value===`reviewed`?`reviewed`:`received`,i=(T?.value.trim()??``).slice(0,180);if(!t||!n){N(`Foundation Wallet and Tx Hash are required to record an audit event.`,!0);return}let a=new Date().toISOString(),o=await U(JSON.stringify({receiptId:e,foundationWallet:t,txHash:n,status:r,note:i,recordedAt:a}));V([{id:`audit_${Date.now()}`,receiptId:e,foundationWallet:t,txHash:n,status:r,evidenceHash:o,note:i,recordedAt:a},...B()]),x&&(x.value=H()),C&&(C.value=``),T&&(T.value=``),W(),N(`Audit event recorded with evidence_hash ${o}.`)}function Z(){let e=B(),t=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),events:e},null,2)],{type:`application/json`}),n=URL.createObjectURL(t),r=document.createElement(`a`);r.href=n,r.download=`truve-audit-log-${Date.now()}.json`,r.click(),URL.revokeObjectURL(n)}async function Q(e){let t=await fetch(`${n}/api/xrpl/account/${encodeURIComponent(e)}/trustlines`);return t.ok?(await t.json()).trustlines:[{asset:`RLUSD`,ready:!1,balance:null,limit:null,configured:!1},{asset:`USDC`,ready:!1,balance:null,limit:null,configured:!1}]}function te(e){return e.map(e=>{let t=e.ready?`${e.asset} ready`:`${e.asset} missing`,n=e.ready&&e.limit?` · limit ${e.limit}`:``;return`<span class="pill ${e.ready?`ready`:`missing`}">${t}${n}</span>`}).join(``)}async function $(){if(v){v.innerHTML=`<p class="microcopy">Checking foundation wallets and TrustLines...</p>`;try{let e=await(await fetch(`/mocks/foundations.json`)).json(),t=R();v.innerHTML=(await Promise.all(e.map(async e=>{let n=t[e.id]?.status??`pending`,r=await Q(e.walletAddress);return`
          <article class="foundation-admin-card">
            <div class="foundation-admin-head">
              <div>
                <h3>${e.name}</h3>
                <p class="microcopy">${e.region} / ${e.walletAddress}</p>
              </div>
              <span class="status-badge ${n===`approved`?`success`:`error`}">${n.toUpperCase()}</span>
            </div>
            <div class="trustline-pills">${te(r)}</div>
            <div class="result-row">
              <span>Audit</span>
              <strong>${e.trustMetrics.verificationLevel} / ${e.trustMetrics.proofCoveragePct}% data / ${e.trustMetrics.auditedAt}</strong>
            </div>
            <div class="foundation-admin-actions">
              <button class="ghost-btn foundation-review-btn" data-foundation-id="${e.id}" data-status="approved" type="button">Approve</button>
              <button class="ghost-btn foundation-review-btn" data-foundation-id="${e.id}" data-status="paused" type="button">Pause</button>
            </div>
          </article>
        `}))).join(``),v.querySelectorAll(`.foundation-review-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.foundationId,n=e.dataset.status===`approved`?`approved`:`paused`;t&&(z(t,n),$())})})}catch(e){v.innerHTML=`<p class="tax-disclaimer">${e instanceof Error?e.message:`Foundation onboarding dashboard failed.`}</p>`}}}function ne(e){h&&(h.innerHTML=`
    <p class="microcopy"><strong>TrustLine request ready.</strong> Scan or open with the recipient Xaman testnet wallet before sending tokens.</p>
    <img src="${e.qrPngUrl}" alt="Xaman TrustLine QR" />
    <a class="ghost-btn" href="${e.deepLink}" target="_blank" rel="noreferrer">Open in Xaman</a>
    <p class="microcopy">${e.currency} issuer: ${e.issuer}</p>
  `)}async function re(){let e=s?.value.trim()??``,t=c?.value.trim()??``,r=L();if(localStorage.setItem(i,e),!e||!t){M(`ERROR`,!0),N(`Admin Secret and Recipient Address are required to create a TrustLine request.`,!0);return}try{f&&(f.disabled=!0,f.textContent=`Creating...`),M(`TRUSTLINE`),N(`Creating a Xaman TrustSet request. Testnet only · No real value.`);let i=await fetch(`${n}/api/admin/testnet-trustline`,{method:`POST`,headers:{"Content-Type":`application/json`,"x-admin-secret":e},body:JSON.stringify({recipient:t,currency:r,limit:`1000000`})}),a=await i.json();if(!i.ok)throw Error(a?.error??`TrustLine request failed with ${i.status}`);M(`SIGN TRUSTLINE`),ne(a),N(`TrustLine QR created. Sign it in the recipient Xaman testnet wallet, then send the test token.`)}catch(e){M(`ERROR`,!0),N(e instanceof Error?e.message:`TrustLine request failed.`,!0)}finally{f&&(f.disabled=!1,f.textContent=`Create TrustLine Request`)}}async function ie(){let e=s?.value.trim()??``,t=c?.value.trim()??``,r=u?.value.trim()??``,a=L();if(localStorage.setItem(i,e),!e||!t||!r){M(`ERROR`,!0),N(`Admin Secret, Recipient Address, and Amount are required.`,!0);return}try{d&&(d.disabled=!0,d.textContent=`Sending...`),M(`SENDING`),N(`This sends test tokens on XRPL Testnet only.`);let i=await fetch(`${n}/api/admin/testnet-faucet`,{method:`POST`,headers:{"Content-Type":`application/json`,"x-admin-secret":e},body:JSON.stringify({recipient:t,currency:a,amount:r})}),o=await i.json();if(!i.ok)throw Error(o?.error??`Faucet request failed with ${i.status}`);M(`SUCCESS`),P(o)}catch(e){M(`ERROR`,!0),N(e instanceof Error?e.message:`Faucet request failed.`,!0)}finally{d&&(d.disabled=!1,d.textContent=`Send Test Token`)}}async function ae(){let e=s?.value.trim()??``,t=L();if(localStorage.setItem(i,e),!e){M(`ERROR`,!0),N(`Admin Secret is required to enable issuer Default Ripple.`,!0);return}try{p&&(p.disabled=!0,p.textContent=`Enabling...`),M(`ISSUER OPS`),N(`Enabling issuer Default Ripple on XRPL Testnet. Testnet only · No real value.`);let r=await fetch(`${n}/api/admin/issuer/default-ripple`,{method:`POST`,headers:{"Content-Type":`application/json`,"x-admin-secret":e},body:JSON.stringify({currency:t})}),i=await r.json();if(!r.ok)throw Error(i?.error??`Issuer Default Ripple request failed with ${r.status}`);M(`SUCCESS`),F(i)}catch(e){M(`ERROR`,!0),N(e instanceof Error?e.message:`Issuer Default Ripple request failed.`,!0)}finally{p&&(p.disabled=!1,p.textContent=`Enable Issuer Default Ripple`)}}async function oe(){let e=s?.value.trim()??``,t=c?.value.trim()??``,r=L();if(localStorage.setItem(i,e),!e||!t){M(`ERROR`,!0),N(`Admin Secret and Recipient Address are required to clear issuer-side NoRipple.`,!0);return}try{m&&(m.disabled=!0,m.textContent=`Clearing...`),M(`ISSUER OPS`),N(`Clearing issuer-side NoRipple for the selected TrustLine. Testnet only · No real value.`);let i=await fetch(`${n}/api/admin/issuer/clear-no-ripple`,{method:`POST`,headers:{"Content-Type":`application/json`,"x-admin-secret":e},body:JSON.stringify({recipient:t,currency:r,limit:`1000000`})}),a=await i.json();if(!i.ok)throw Error(a?.error??`Issuer Clear NoRipple request failed with ${i.status}`);M(`SUCCESS`),I(a)}catch(e){M(`ERROR`,!0),N(e instanceof Error?e.message:`Issuer Clear NoRipple request failed.`,!0)}finally{m&&(m.disabled=!1,m.textContent=`Clear Issuer NoRipple`)}}s?.setAttribute(`value`,localStorage.getItem(i)??``),x&&(x.value=H()),W(),o?.addEventListener(`submit`,e=>{e.preventDefault(),ie()}),b?.addEventListener(`submit`,e=>{e.preventDefault(),X()}),ee?.addEventListener(`click`,Z),f?.addEventListener(`click`,()=>{re()}),p?.addEventListener(`click`,()=>{ae()}),m?.addEventListener(`click`,()=>{oe()}),y?.addEventListener(`click`,()=>{$()}),O?.addEventListener(`click`,()=>{J()}),$(),J();