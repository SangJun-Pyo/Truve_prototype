/* empty css               */import"./modulepreload-polyfill-N-DOuI4P.js";import{f as e,l as t,m as n,o as r,p as i}from"./xrpl-FTcenvDK.js";import{i as a,n as o,o as s,r as c,s as l,t as u}from"./wallet-Dr8BPKSq.js";import{t as d}from"./nav-Br5_uZS3.js";var f=`truve_governance_records_v1`;function p(){let e=localStorage.getItem(f);if(!e)return[];try{return JSON.parse(e)}catch{return[]}}function m(e){localStorage.setItem(f,JSON.stringify(e))}function h(e){return p().filter(t=>t.userId===e)}function g(e){let t=p(),n=t.findIndex(t=>t.id===e.id);n>=0?t[n]=e:t.unshift(e),m(t)}var _=`truve_governance_round_1`,v=`usr_demo_001`,y=`proposal_q3_treasury_allocation`,b={seed:1,sprout:2,forest:3},x=document.getElementById(`top-nav`);x&&(x.innerHTML=d(`governance`));var S=document.getElementById(`governance-eligibility`),C=document.getElementById(`governance-options`),w=document.getElementById(`governance-results`),T=document.getElementById(`governance-wallet-status`),E=document.getElementById(`governance-qr-wrap`),D=document.getElementById(`governance-connect-btn`),O=document.getElementById(`governance-disconnect-btn`),k=document.getElementById(`governance-tx-log`);function A(e){let t=localStorage.getItem(_);if(!t)return e.reduce((e,t)=>(e[t]=0,e),{});try{let n=JSON.parse(t);return e.reduce((e,t)=>(e[t]=Number(n[t]??0),e),{})}catch{return e.reduce((e,t)=>(e[t]=0,e),{})}}function j(e){localStorage.setItem(_,JSON.stringify(e))}function M(e,t=!1){T&&(T.className=t?`notice error mt-12`:`notice mt-12`,T.textContent=e)}function N(e,t){E&&(E.innerHTML=`
    <img src="${e}" alt="Xaman QR" />
    <a class="btn btn-primary" href="${t}" target="_blank" rel="noreferrer">Xaman 앱으로 열기</a>
  `)}function P(){E&&(E.innerHTML=``)}function F(){let e=o();if(!e){M(`지갑 미연결`);return}M(`연결됨: ${e.account}`)}function I(e,t){w&&(w.innerHTML=[...e].sort((e,n)=>(t[n.id]??0)-(t[e.id]??0)).map(e=>{let n=t[e.id]??0;return`
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
      `}).join(``)}async function R(){try{M(`Xaman SignIn 요청 생성 중...`);let e=await s();N(e.qrPngUrl,e.deepLink);let t=await l(e.uuid);if(!t.signed||!t.account){M(`지갑 연결이 취소되었습니다.`,!0);return}c({account:t.account,connectedAt:new Date().toISOString(),lastPayloadUuid:e.uuid}),i(t.account),P(),F()}catch(e){M(e instanceof Error?e.message:`지갑 연결 실패`,!0)}}function z(){u(),P(),F()}async function B(){let i=await n(),[s,c,u]=await Promise.all([i.userRepository.getProfile(v),i.donationRepository.listDonationsByUser(v),i.foundationRepository.list()]);if(!s||!S||!C)return;let d=c.filter(e=>e.nftStatus===`minted`&&e.proofNftId).length,f=d>0,p=b[s.tier]??1;S.className=f?`notice`:`notice error`,S.innerHTML=f?`투표 가능: ${s.displayName} · NFT ${d}개 보유 · 티어 <strong>${s.tier.toUpperCase()}</strong> · 가중치 <strong>${p}표</strong>`:`투표 불가: Proof NFT 보유가 확인되지 않았습니다. 기부 후 NFT를 발급받아 참여해주세요.`;let m=u.filter(e=>[`fnd_truve-community`,`fnd_green-earth`,`fnd_next-class`,`fnd_relief-now`].includes(e.id)),h=A(m.map(e=>e.id)),_=await t(y);_.length>0&&_.forEach(e=>{h[e.candidateId]=e._sum.weight??0}),I(m,h),L(),F(),D?.addEventListener(`click`,()=>{R()}),O?.addEventListener(`click`,()=>{z()}),C.innerHTML=m.map(e=>`
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
      `).join(``),C.querySelectorAll(`[data-vote-id]`).forEach(t=>{t.addEventListener(`click`,async()=>{let n=t.dataset.voteId;if(!n||!f)return;let i=o();if(!i){window.alert(`먼저 Xaman 지갑을 연결해주세요.`);return}let s=m.find(e=>e.id===n);if(s)try{t.disabled=!0;let o=await a({account:i.account,destination:s.walletAddress,amountDrops:`1`,memoType:`TRUVE_GOV_VOTE`,memoData:JSON.stringify({proposalId:y,candidateId:n,weight:p,userId:v,createdAt:new Date().toISOString()}).slice(0,230)});N(o.qrPngUrl,o.deepLink);let c=await l(o.uuid);if(!c.signed||!c.txHash){window.alert(`투표 트랜잭션 서명이 취소되었습니다.`);return}let u=await r(c.txHash),d=u.validated?`validated`:`signed`;h[n]=(h[n]??0)+p,j(h),I(m,h),g({id:`gov_${Date.now()}`,userId:v,proposalId:y,candidateId:n,candidateName:s.name,weight:p,txHash:c.txHash,explorerUrl:u.explorerUrl,validationStatus:d,createdAt:new Date().toISOString()}),e({xrplAccount:i.account,proposalId:y,candidateId:n,candidateName:s.name,weight:p,txHash:c.txHash}),L(),window.alert(`투표가 온체인에 기록되었습니다. (${d})`)}catch(e){window.alert(e instanceof Error?e.message:`투표 처리 중 오류가 발생했습니다.`)}finally{t.disabled=!1}})})}B();