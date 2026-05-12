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
          <h3>비밀번호 찾기</h3>
          <p>Truve는 Google 로그인만 사용하므로 별도 비밀번호를 저장하지 않습니다. 계정 복구는 Google에서 진행합니다.</p>
          <a class="ghost-btn" href="https://accounts.google.com/signin/recovery" target="_blank" rel="noreferrer">Google 계정 복구</a>
        </article>
        <article>
          <h3>비밀번호 수정</h3>
          <p>비밀번호 변경과 2단계 인증 설정은 Google 계정 보안 페이지에서 관리합니다.</p>
          <a class="ghost-btn" href="https://myaccount.google.com/security" target="_blank" rel="noreferrer">Google 보안 설정</a>
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
  }
}
