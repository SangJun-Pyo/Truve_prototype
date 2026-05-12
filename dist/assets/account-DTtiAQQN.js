import"./modulepreload-polyfill-eJgYjmQ8.js";/* empty css               */import{l as e,n as t,o as n,t as r}from"./nav-2t9yL-0h.js";var i=document.getElementById(`top-nav`);i&&(i.innerHTML=r(`account`));var a=document.getElementById(`account-panel`),o=n();a&&(o?(a.innerHTML=`
      <section class="account-profile-card">
        <div class="account-avatar" aria-hidden="true">${o.picture?`<img src="${o.picture}" alt="" />`:e(o).slice(0,1)}</div>
        <div>
          <p class="summary-kicker">Google Account</p>
          <h2>${e(o)}</h2>
          <p>${o.email}</p>
          <div class="account-role-row">
            ${o.demo?`<span class="status-pill orange">DEMO SESSION</span>`:`<span class="status-pill green">CONNECTED</span>`}
            <span class="status-pill ${o.role===`operator`?`green`:`muted`}">${o.role===`operator`?`OPERATOR`:`USER`}</span>
          </div>
        </div>
      </section>
      <section class="auth-help-grid">
        <article>
          <h3>기부 현황에서 관리</h3>
          <p>내 기부 현황 페이지에서 Google 계정, Xaman 지갑, Evidence, Credential 상태를 한 번에 확인할 수 있습니다.</p>
          <a class="ghost-btn" href="./status.html#account-card">기부 현황으로 이동</a>
        </article>
        <article>
          <h3>계정 연결 해제</h3>
          <p>이 브라우저에서 Google 계정 연결을 해제합니다. 기부 기록과 온체인 Credential은 삭제되지 않습니다.</p>
          <button id="disconnect-account-btn" class="ghost-btn" type="button">계정 연결 해제</button>
        </article>
      </section>
      <div class="auth-actions">
        <a class="primary-link-button" href="./status.html">내 기부 현황으로 이동</a>
        <button id="logout-btn" class="secondary-link-button" type="button">로그아웃</button>
      </div>
    `,document.getElementById(`logout-btn`)?.addEventListener(`click`,()=>{t(),window.location.href=`./auth.html`}),document.getElementById(`disconnect-account-btn`)?.addEventListener(`click`,()=>{window.confirm(`이 브라우저에서 Google 계정 연결을 해제할까요? 기부 기록과 온체인 Credential은 삭제되지 않습니다.`)&&(t(),window.location.href=`./auth.html`)})):a.innerHTML=`
      <div class="empty-state auth-empty">
        <p class="summary-kicker">Account</p>
        <h2>로그인이 필요합니다</h2>
        <p>Google 계정으로 로그인하면 내 기부 현황과 Credential 확인 페이지로 이어집니다.</p>
        <a class="primary-link-button" href="./auth.html?next=./account.html">Google 로그인</a>
      </div>
    `);