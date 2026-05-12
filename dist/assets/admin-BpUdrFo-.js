import"./modulepreload-polyfill-eJgYjmQ8.js";/* empty css               */import{n as e,t,u as n}from"./db-By3Tvzib.js";import{s as r,t as i}from"./nav-2t9yL-0h.js";var a=`truve_admin_secret`,o=document.getElementById(`top-nav`);if(o&&(o.innerHTML=i(`admin`)),!r())throw window.location.href=`./foundations.html`,Error(`Operator role is required to open Admin.`);var s=document.getElementById(`faucet-form`),c=document.getElementById(`admin-secret`),l=document.getElementById(`recipient-address`),u=document.getElementById(`token-select`),d=document.getElementById(`token-amount`),f=document.getElementById(`send-token-btn`),p=document.getElementById(`trustline-btn`),m=document.getElementById(`default-ripple-btn`),h=document.getElementById(`clear-no-ripple-btn`),g=document.getElementById(`trustline-qr-wrap`),_=document.getElementById(`faucet-status`),v=document.getElementById(`faucet-result`),y=document.getElementById(`foundation-admin-list`),b=document.getElementById(`refresh-foundations-btn`),x=document.getElementById(`audit-form`),S=document.getElementById(`audit-receipt-id`),C=document.getElementById(`audit-wallet`),w=document.getElementById(`audit-tx-hash`),T=document.getElementById(`audit-status`),E=document.getElementById(`audit-note`),D=document.getElementById(`audit-log-list`),O=document.getElementById(`export-audit-btn`),k=document.getElementById(`admin-donation-list`),A=document.getElementById(`refresh-donations-btn`),j=`truve_foundation_review_status`,M=`truve_foundation_audit_log_v1`;function N(){return c?.value.trim()??``}function P(e,t=!1){_&&(_.textContent=e,_.className=t?`status-badge error`:`status-badge success`)}function F(e,t=!1){v&&(v.innerHTML=`<p class="${t?`tax-disclaimer`:`microcopy`}">${e}</p>`)}function I(e){v&&(C&&(C.value=e.recipient),w&&(w.value=e.txHash),v.innerHTML=`
    <p class="microcopy"><strong>Test token sent successfully.</strong> Testnet only · No real value.</p>
    <div class="result-row"><span>Token</span><strong>${e.currency}</strong></div>
    <div class="result-row"><span>Amount</span><strong>${e.amount}</strong></div>
    <div class="result-row"><span>Recipient</span><strong>${e.recipient}</strong></div>
    <div class="result-row"><span>Tx Hash</span><a class="text-link" href="${e.explorerUrl}" target="_blank" rel="noreferrer">${e.txHash}</a></div>
    <div class="result-row"><span>Explorer</span><a class="text-link" href="${e.explorerUrl}" target="_blank" rel="noreferrer">Open XRPL Testnet Explorer</a></div>
  `)}function ee(e){v&&(v.innerHTML=`
    <p class="microcopy"><strong>Issuer Default Ripple ${e.alreadyEnabled?`already enabled`:`enabled`}.</strong> Testnet only · No real value.</p>
    <div class="result-row"><span>Token</span><strong>${e.currency}</strong></div>
    <div class="result-row"><span>Issuer</span><strong>${e.issuer}</strong></div>
    <div class="result-row"><span>Status</span><strong>${e.defaultRippleEnabled?`ENABLED`:`DISABLED`}</strong></div>
    ${e.txHash&&e.explorerUrl?`<div class="result-row"><span>Tx Hash</span><a class="text-link" href="${e.explorerUrl}" target="_blank" rel="noreferrer">${e.txHash}</a></div>
           <div class="result-row"><span>Explorer</span><a class="text-link" href="${e.explorerUrl}" target="_blank" rel="noreferrer">Open XRPL Testnet Explorer</a></div>`:``}
    <p class="microcopy">${e.message}</p>
  `)}function L(e){v&&(v.innerHTML=`
    <p class="microcopy"><strong>Issuer-side NoRipple cleared.</strong> Testnet only · No real value.</p>
    <div class="result-row"><span>Token</span><strong>${e.currency}</strong></div>
    <div class="result-row"><span>Issuer</span><strong>${e.issuer}</strong></div>
    <div class="result-row"><span>TrustLine Peer</span><strong>${e.peer}</strong></div>
    <div class="result-row"><span>Tx Hash</span><a class="text-link" href="${e.explorerUrl}" target="_blank" rel="noreferrer">${e.txHash}</a></div>
    <div class="result-row"><span>Explorer</span><a class="text-link" href="${e.explorerUrl}" target="_blank" rel="noreferrer">Open XRPL Testnet Explorer</a></div>
    <p class="microcopy">${e.message}</p>
  `)}function R(){return u?.value===`USDC`?`USDC`:`RLUSD`}function z(){try{return JSON.parse(localStorage.getItem(j)??`{}`)}catch{return{}}}function B(e,t){let n=z();n[e]={status:t,reviewedAt:new Date().toISOString()},localStorage.setItem(j,JSON.stringify(n))}function V(){try{return JSON.parse(localStorage.getItem(M)??`[]`)}catch{return[]}}function H(e){localStorage.setItem(M,JSON.stringify(e))}function U(){return`receipt_${new Date().toISOString().replace(/[-:.TZ]/g,``).slice(0,14)}`}async function W(e){let t=new TextEncoder().encode(e),n=await crypto.subtle.digest(`SHA-256`,t);return[...new Uint8Array(n)].map(e=>e.toString(16).padStart(2,`0`)).join(``)}function G(){if(!D)return;let e=V();if(e.length===0){D.innerHTML=`<p class="microcopy">No audit events recorded yet.</p>`;return}D.innerHTML=e.map(e=>`
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
      `).join(``)}function K(e){let t=e.allocations;return Array.isArray(t)?{}:t?.meta??{}}function q(e){let t=K(e),n=t.asset??e.asset,r=t.amountAsset??e.amountAsset;return n&&r?`${r} ${n}`:`${e.amountKrw.toLocaleString(`ko-KR`)} KRW`}function J(e){if(k){if(e.length===0){k.innerHTML=`<p class="microcopy">No DB donation records found.</p>`;return}k.innerHTML=e.map(e=>{let t=K(e),n=t.credential??{};return`
        <article class="foundation-admin-card">
          <div class="foundation-admin-head">
            <div>
              <h3>${q(e)}</h3>
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
      `}).join(``),k.querySelectorAll(`.admin-delete-donation-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.donationId;t&&X(t)})})}}async function Y(){if(!k)return;let t=N();if(localStorage.setItem(a,t),!t){k.innerHTML=`<p class="tax-disclaimer">Enter Admin Secret to load DB donation records.</p>`;return}k.innerHTML=`<p class="microcopy">Loading DB donation records...</p>`;try{J(await e(t))}catch(e){k.innerHTML=`<p class="tax-disclaimer">${e instanceof Error?e.message:`Donation lookup failed.`}</p>`}}async function X(e){let n=N();if(!n){F(`Admin Secret is required to delete test records.`,!0);return}if(window.confirm(`Delete this test donation record from the prototype DB?`))try{await t(n,e),F(`Deleted test donation record ${e}.`),await Y()}catch(e){F(e instanceof Error?e.message:`Delete failed.`,!0)}}async function Z(){let e=(S?.value.trim()||U()).slice(0,80),t=C?.value.trim()??``,n=w?.value.trim()??``,r=T?.value===`flagged`?`flagged`:T?.value===`reviewed`?`reviewed`:`received`,i=(E?.value.trim()??``).slice(0,180);if(!t||!n){F(`Foundation Wallet and Tx Hash are required to record an audit event.`,!0);return}let a=new Date().toISOString(),o=await W(JSON.stringify({receiptId:e,foundationWallet:t,txHash:n,status:r,note:i,recordedAt:a}));H([{id:`audit_${Date.now()}`,receiptId:e,foundationWallet:t,txHash:n,status:r,evidenceHash:o,note:i,recordedAt:a},...V()]),S&&(S.value=U()),w&&(w.value=``),E&&(E.value=``),G(),F(`Audit event recorded with evidence_hash ${o}.`)}function Q(){let e=V(),t=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),events:e},null,2)],{type:`application/json`}),n=URL.createObjectURL(t),r=document.createElement(`a`);r.href=n,r.download=`truve-audit-log-${Date.now()}.json`,r.click(),URL.revokeObjectURL(n)}async function te(e){let t=await fetch(`${n}/api/xrpl/account/${encodeURIComponent(e)}/trustlines`);return t.ok?(await t.json()).trustlines:[{asset:`RLUSD`,ready:!1,balance:null,limit:null,configured:!1},{asset:`USDC`,ready:!1,balance:null,limit:null,configured:!1}]}function ne(e){return e.map(e=>{let t=e.ready?`${e.asset} ready`:`${e.asset} missing`,n=e.ready&&e.limit?` · limit ${e.limit}`:``;return`<span class="pill ${e.ready?`ready`:`missing`}">${t}${n}</span>`}).join(``)}async function $(){if(y){y.innerHTML=`<p class="microcopy">Checking foundation wallets and TrustLines...</p>`;try{let e=await(await fetch(`/mocks/foundations.json`)).json(),t=z();y.innerHTML=(await Promise.all(e.map(async e=>{let n=t[e.id]?.status??`pending`,r=await te(e.walletAddress);return`
          <article class="foundation-admin-card">
            <div class="foundation-admin-head">
              <div>
                <h3>${e.name}</h3>
                <p class="microcopy">${e.region} / ${e.walletAddress}</p>
              </div>
              <span class="status-badge ${n===`approved`?`success`:`error`}">${n.toUpperCase()}</span>
            </div>
            <div class="trustline-pills">${ne(r)}</div>
            <div class="result-row">
              <span>Audit</span>
              <strong>${e.trustMetrics.verificationLevel} / ${e.trustMetrics.proofCoveragePct}% data / ${e.trustMetrics.auditedAt}</strong>
            </div>
            <div class="foundation-admin-actions">
              <button class="ghost-btn foundation-review-btn" data-foundation-id="${e.id}" data-status="approved" type="button">Approve</button>
              <button class="ghost-btn foundation-review-btn" data-foundation-id="${e.id}" data-status="paused" type="button">Pause</button>
            </div>
          </article>
        `}))).join(``),y.querySelectorAll(`.foundation-review-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.foundationId,n=e.dataset.status===`approved`?`approved`:`paused`;t&&(B(t,n),$())})})}catch(e){y.innerHTML=`<p class="tax-disclaimer">${e instanceof Error?e.message:`Foundation onboarding dashboard failed.`}</p>`}}}function re(e){g&&(g.innerHTML=`
    <p class="microcopy"><strong>TrustLine request ready.</strong> Scan or open with the recipient Xaman testnet wallet before sending tokens.</p>
    <img src="${e.qrPngUrl}" alt="Xaman TrustLine QR" />
    <a class="ghost-btn" href="${e.deepLink}" target="_blank" rel="noreferrer">Open in Xaman</a>
    <p class="microcopy">${e.currency} issuer: ${e.issuer}</p>
  `)}async function ie(){let e=c?.value.trim()??``,t=l?.value.trim()??``,r=R();if(localStorage.setItem(a,e),!e||!t){P(`ERROR`,!0),F(`Admin Secret and Recipient Address are required to create a TrustLine request.`,!0);return}try{p&&(p.disabled=!0,p.textContent=`Creating...`),P(`TRUSTLINE`),F(`Creating a Xaman TrustSet request. Testnet only · No real value.`);let i=await fetch(`${n}/api/admin/testnet-trustline`,{method:`POST`,headers:{"Content-Type":`application/json`,"x-admin-secret":e},body:JSON.stringify({recipient:t,currency:r,limit:`1000000`})}),a=await i.json();if(!i.ok)throw Error(a?.error??`TrustLine request failed with ${i.status}`);P(`SIGN TRUSTLINE`),re(a),F(`TrustLine QR created. Sign it in the recipient Xaman testnet wallet, then send the test token.`)}catch(e){P(`ERROR`,!0),F(e instanceof Error?e.message:`TrustLine request failed.`,!0)}finally{p&&(p.disabled=!1,p.textContent=`Create TrustLine Request`)}}async function ae(){let e=c?.value.trim()??``,t=l?.value.trim()??``,r=d?.value.trim()??``,i=R();if(localStorage.setItem(a,e),!e||!t||!r){P(`ERROR`,!0),F(`Admin Secret, Recipient Address, and Amount are required.`,!0);return}try{f&&(f.disabled=!0,f.textContent=`Sending...`),P(`SENDING`),F(`This sends test tokens on XRPL Testnet only.`);let a=await fetch(`${n}/api/admin/testnet-faucet`,{method:`POST`,headers:{"Content-Type":`application/json`,"x-admin-secret":e},body:JSON.stringify({recipient:t,currency:i,amount:r})}),o=await a.json();if(!a.ok)throw Error(o?.error??`Faucet request failed with ${a.status}`);P(`SUCCESS`),I(o)}catch(e){P(`ERROR`,!0),F(e instanceof Error?e.message:`Faucet request failed.`,!0)}finally{f&&(f.disabled=!1,f.textContent=`Send Test Token`)}}async function oe(){let e=c?.value.trim()??``,t=R();if(localStorage.setItem(a,e),!e){P(`ERROR`,!0),F(`Admin Secret is required to enable issuer Default Ripple.`,!0);return}try{m&&(m.disabled=!0,m.textContent=`Enabling...`),P(`ISSUER OPS`),F(`Enabling issuer Default Ripple on XRPL Testnet. Testnet only · No real value.`);let r=await fetch(`${n}/api/admin/issuer/default-ripple`,{method:`POST`,headers:{"Content-Type":`application/json`,"x-admin-secret":e},body:JSON.stringify({currency:t})}),i=await r.json();if(!r.ok)throw Error(i?.error??`Issuer Default Ripple request failed with ${r.status}`);P(`SUCCESS`),ee(i)}catch(e){P(`ERROR`,!0),F(e instanceof Error?e.message:`Issuer Default Ripple request failed.`,!0)}finally{m&&(m.disabled=!1,m.textContent=`Enable Issuer Default Ripple`)}}async function se(){let e=c?.value.trim()??``,t=l?.value.trim()??``,r=R();if(localStorage.setItem(a,e),!e||!t){P(`ERROR`,!0),F(`Admin Secret and Recipient Address are required to clear issuer-side NoRipple.`,!0);return}try{h&&(h.disabled=!0,h.textContent=`Clearing...`),P(`ISSUER OPS`),F(`Clearing issuer-side NoRipple for the selected TrustLine. Testnet only · No real value.`);let i=await fetch(`${n}/api/admin/issuer/clear-no-ripple`,{method:`POST`,headers:{"Content-Type":`application/json`,"x-admin-secret":e},body:JSON.stringify({recipient:t,currency:r,limit:`1000000`})}),a=await i.json();if(!i.ok)throw Error(a?.error??`Issuer Clear NoRipple request failed with ${i.status}`);P(`SUCCESS`),L(a)}catch(e){P(`ERROR`,!0),F(e instanceof Error?e.message:`Issuer Clear NoRipple request failed.`,!0)}finally{h&&(h.disabled=!1,h.textContent=`Clear Issuer NoRipple`)}}c?.setAttribute(`value`,localStorage.getItem(a)??``),S&&(S.value=U()),G(),s?.addEventListener(`submit`,e=>{e.preventDefault(),ae()}),x?.addEventListener(`submit`,e=>{e.preventDefault(),Z()}),O?.addEventListener(`click`,Q),p?.addEventListener(`click`,()=>{ie()}),m?.addEventListener(`click`,()=>{oe()}),h?.addEventListener(`click`,()=>{se()}),b?.addEventListener(`click`,()=>{$()}),A?.addEventListener(`click`,()=>{Y()}),$(),Y();