import { clearAuthSession, getAuthSession, sessionDisplayName } from "../services/auth";
import { renderTopNav } from "../shared/nav";

const navRoot = document.getElementById("top-nav");
if (navRoot) navRoot.innerHTML = renderTopNav("account");

const accountPanelEl = document.getElementById("account-panel");
const session = getAuthSession();

if (accountPanelEl) {
  if (!session) {
    accountPanelEl.innerHTML = `
      <div class="empty-state auth-empty">
        <p class="summary-kicker">Account</p>
        <h2>로그인이 필요합니다</h2>
        <p>Google 계정으로 로그인하면 내 기부 현황과 Credential 확인 페이지로 이어집니다.</p>
        <a class="primary-link-button" href="./auth.html?next=./account.html">Google 로그인</a>
      </div>
    `;
  } else {
    accountPanelEl.innerHTML = `
      <section class="account-profile-card">
        <div class="account-avatar" aria-hidden="true">${session.picture ? `<img src="${session.picture}" alt="" />` : sessionDisplayName(session).slice(0, 1)}</div>
        <div>
          <p class="summary-kicker">Google Account</p>
          <h2>${sessionDisplayName(session)}</h2>
          <p>${session.email}</p>
          <div class="account-role-row">
            ${session.demo ? `<span class="status-pill orange">DEMO SESSION</span>` : `<span class="status-pill green">CONNECTED</span>`}
            <span class="status-pill ${session.role === "operator" ? "green" : "muted"}">${session.role === "operator" ? "OPERATOR" : "USER"}</span>
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
    `;

    document.getElementById("logout-btn")?.addEventListener("click", () => {
      clearAuthSession();
      window.location.href = "./auth.html";
    });
    document.getElementById("disconnect-account-btn")?.addEventListener("click", () => {
      const confirmed = window.confirm("이 브라우저에서 Google 계정 연결을 해제할까요? 기부 기록과 온체인 Credential은 삭제되지 않습니다.");
      if (!confirmed) return;
      clearAuthSession();
      window.location.href = "./auth.html";
    });
  }
}
