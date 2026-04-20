import"./styles-BzChqKUB.js";import{t as e}from"./provider-BW_KG98z.js";import{t}from"./nav-CMc74gyL.js";import{a as n,c as r,l as i,n as a,r as o,t as s}from"./wallet-Dhb9Radt.js";import{i as c,o as l,r as u,s as d}from"./xrpl-BPg40chf.js";var f=`truve_governance_records_v1`;function p(){let e=localStorage.getItem(f);if(!e)return[];try{return JSON.parse(e)}catch{return[]}}function m(e){localStorage.setItem(f,JSON.stringify(e))}function h(e){return p().filter(t=>t.userId===e)}function g(e){let t=p(),n=t.findIndex(t=>t.id===e.id);n>=0?t[n]=e:t.unshift(e),m(t)}var _=`truve_governance_round_1`,v=`usr_demo_001`,y=`proposal_q3_treasury_allocation`,b={seed:1,sprout:2,forest:3},x=document.getElementById(`top-nav`);x&&(x.innerHTML=t(`governance`));var S=document.getElementById(`governance-eligibility`),C=document.getElementById(`governance-options`),w=document.getElementById(`governance-results`),T=document.getElementById(`governance-wallet-status`),E=document.getElementById(`governance-qr-wrap`),D=document.getElementById(`governance-connect-btn`),O=document.getElementById(`governance-disconnect-btn`),k=document.getElementById(`governance-tx-log`);function A(e){let t=localStorage.getItem(_);if(!t)return e.reduce((e,t)=>(e[t]=0,e),{});try{let n=JSON.parse(t);return e.reduce((e,t)=>(e[t]=Number(n[t]??0),e),{})}catch{return e.reduce((e,t)=>(e[t]=0,e),{})}}function j(e){localStorage.setItem(_,JSON.stringify(e))}function M(e,t=!1){T&&(T.className=t?`notice error mt-12`:`notice mt-12`,T.textContent=e)}function N(e,t){E&&(E.innerHTML=`
    <img src="${e}" alt="Xaman QR" />
    <a class="btn btn-primary" href="${t}" target="_blank" rel="noreferrer">Xaman 앱으로 열기</a>
  `)}function P(){E&&(E.innerHTML=``)}function F(){let e=a();if(!e){M(`지갑 미연결`);return}M(`연결됨: ${e.account}`)}function I(e,t){w&&(w.innerHTML=[...e].sort((e,n)=>(t[n.id]??0)-(t[e.id]??0)).map(e=>{let n=t[e.id]??0;return`
        <article class="result-item">
          <div class="row-between">
            <strong>${e.name}</strong>
            <span class="badge">${n}표</span>
          </div>
          <p class="section-desc">${e.description}</p>
        </article>
      `}).join(``))}function L(){if(!k)return;let e=h(v);if(e.length===0){k.innerHTML=`<div class="notice">아직 온체인 투표 기록이 없습니다.</div>`;return}k.innerHTML=e.map(e=>{let t=e.txHash?`<a class="text-link" href="${e.explorerUrl}" target="_blank" rel="noreferrer">${e.txHash}</a>`:`-`;return`
        <article class="result-item">
          <div class="row-between">
            <strong>${e.candidateName}</strong>
            <span class="badge">${e.validationStatus}</span>
          </div>
          <div class="trust mt-12">가중치: ${e.weight}표</div>
          <div class="trust">TX: ${t}</div>
        </article>
      `}).join(``)}async function R(){try{M(`Xaman SignIn 요청 생성 중...`);let e=await l();N(e.qrPngUrl,e.deepLink);let t=await d(e.uuid);if(!t.signed||!t.account){M(`지갑 연결이 취소되었습니다.`,!0);return}o({account:t.account,connectedAt:new Date().toISOString(),lastPayloadUuid:e.uuid}),i(t.account),P(),F()}catch(e){M(e instanceof Error?e.message:`지갑 연결 실패`,!0)}}function z(){s(),P(),F()}async function B(){let t=await e(),[i,o,s]=await Promise.all([t.userRepository.getProfile(v),t.donationRepository.listDonationsByUser(v),t.foundationRepository.list()]);if(!i||!S||!C)return;let l=o.filter(e=>e.nftStatus===`minted`&&e.proofNftId).length,f=l>0,p=b[i.tier]??1;S.className=f?`notice`:`notice error`,S.innerHTML=f?`투표 가능: ${i.displayName} · NFT ${l}개 보유 · 티어 <strong>${i.tier.toUpperCase()}</strong> · 가중치 <strong>${p}표</strong>`:`투표 불가: Proof NFT 보유가 확인되지 않았습니다. 기부 후 NFT를 발급받아 참여해주세요.`;let m=s.filter(e=>[`fnd_truve-community`,`fnd_green-earth`,`fnd_next-class`,`fnd_relief-now`].includes(e.id)),h=A(m.map(e=>e.id)),_=await n(y);_.length>0&&_.forEach(e=>{h[e.candidateId]=e._sum.weight??0}),I(m,h),L(),F(),D?.addEventListener(`click`,()=>{R()}),O?.addEventListener(`click`,()=>{z()}),C.innerHTML=m.map(e=>`
        <article class="vote-option">
          <div class="row-between">
            <strong>${e.name}</strong>
            <span class="badge">${e.region}</span>
          </div>
          <p class="section-desc">${e.description}</p>
          <button class="btn btn-primary mt-12" data-vote-id="${e.id}" ${f?``:`disabled`}>
            이 재단에 투표
          </button>
        </article>
      `).join(``),C.querySelectorAll(`[data-vote-id]`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.dataset.voteId;if(!t||!f)return;let n=a();if(!n){window.alert(`먼저 Xaman 지갑을 연결해주세요.`);return}let i=m.find(e=>e.id===t);if(i)try{e.disabled=!0;let a=await c({account:n.account,destination:i.walletAddress,amountDrops:`1`,memoType:`TRUVE_GOV_VOTE`,memoData:JSON.stringify({proposalId:y,candidateId:t,weight:p,userId:v,createdAt:new Date().toISOString()}).slice(0,230)});N(a.qrPngUrl,a.deepLink);let o=await d(a.uuid);if(!o.signed||!o.txHash){window.alert(`투표 트랜잭션 서명이 취소되었습니다.`);return}let s=await u(o.txHash),l=s.validated?`validated`:`signed`;h[t]=(h[t]??0)+p,j(h),I(m,h),g({id:`gov_${Date.now()}`,userId:v,proposalId:y,candidateId:t,candidateName:i.name,weight:p,txHash:o.txHash,explorerUrl:s.explorerUrl,validationStatus:l,createdAt:new Date().toISOString()}),r({xrplAccount:n.account,proposalId:y,candidateId:t,candidateName:i.name,weight:p,txHash:o.txHash}),L(),window.alert(`투표가 온체인에 기록되었습니다. (${l})`)}catch(e){window.alert(e instanceof Error?e.message:`투표 처리 중 오류가 발생했습니다.`)}finally{e.disabled=!1}})})}B();