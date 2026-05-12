import { renderTopNav } from "../shared/nav";
import {
  clearAuthSession,
  createDemoGoogleSession,
  createDemoOperatorSession,
  decodeGoogleCredential,
  getAuthSession,
  resolveRoleForEmail,
  setAuthSession,
  TruveAuthSession,
} from "../services/auth";

type GoogleCredentialResponse = {
  credential: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: GoogleCredentialResponse) => void }) => void;
          renderButton: (element: HTMLElement, config: Record<string, string | number | boolean>) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const navRoot = document.getElementById("top-nav");
if (navRoot) navRoot.innerHTML = renderTopNav("auth");

const loginSlotEl = document.getElementById("google-login-slot");
const devActionsEl = document.getElementById("auth-dev-actions");
const sessionActionsEl = document.getElementById("auth-session-actions");
const demoLoginBtnEl = document.getElementById("google-demo-login-btn") as HTMLButtonElement | null;
const demoOperatorLoginBtnEl = document.getElementById("google-demo-operator-login-btn") as HTMLButtonElement | null;
const logoutBtnEl = document.getElementById("auth-logout-btn") as HTMLButtonElement | null;
const agreeEl = document.getElementById("auth-terms-agree") as HTMLInputElement | null;
const statusEl = document.getElementById("auth-status");
const existingSession = getAuthSession();
const googleClientId = ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GOOGLE_CLIENT_ID ?? "").trim();
const showDevAuth = new URLSearchParams(window.location.search).get("devAuth") === "1";

if (googleClientId && !showDevAuth) {
  devActionsEl?.classList.add("hidden");
}

function nextUrl(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get("next") || "./status.html";
}

function setStatus(message: string, tone: "muted" | "success" | "error" = "muted"): void {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.dataset.tone = tone;
}

function canContinue(): boolean {
  if (agreeEl?.checked) return true;
  setStatus("서비스 이용약관과 개인정보처리방침 확인 후 Google 로그인을 진행해 주세요.", "error");
  return false;
}

function completeLogin(session: TruveAuthSession): void {
  if (!canContinue()) return;
  setAuthSession(session);
  setStatus(`${session.name} 계정으로 로그인되었습니다.`, "success");
  window.setTimeout(() => {
    window.location.href = nextUrl();
  }, 450);
}

function initGoogleLogin(): void {
  if (existingSession) {
    loginSlotEl?.classList.add("hidden");
    devActionsEl?.classList.add("hidden");
    sessionActionsEl?.classList.remove("hidden");
    setStatus(`${existingSession.name} 계정으로 이미 로그인되어 있습니다.`, "success");
    return;
  }

  if (!googleClientId) {
    setStatus("Google OAuth Client ID가 설정되면 실제 Google 로그인 버튼이 표시됩니다. 현재는 개발 확인용 로그인으로 흐름을 볼 수 있습니다.");
    return;
  }

  if (!window.google?.accounts?.id || !loginSlotEl) {
    setStatus("Google 로그인 스크립트를 불러오는 중입니다.");
    return;
  }

  window.google.accounts.id.initialize({
    client_id: googleClientId,
    callback: (response) => {
      try {
        const profile = decodeGoogleCredential(response.credential);
        if (!profile.email) throw new Error("Google profile email is missing.");
        completeLogin({
          provider: "google",
          role: resolveRoleForEmail(profile.email),
          email: profile.email,
          name: profile.name || profile.email,
          picture: profile.picture,
          sub: profile.sub,
          issuedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error(error);
        setStatus("Google 로그인 응답을 확인하지 못했습니다. 다시 시도해 주세요.", "error");
      }
    },
  });
  loginSlotEl.innerHTML = "";
  window.google.accounts.id.renderButton(loginSlotEl, {
    theme: "outline",
    size: "large",
    text: "continue_with",
    shape: "pill",
    width: 320,
  });
  setStatus("Google 계정으로 로그인할 수 있습니다.", "success");
}

demoLoginBtnEl?.addEventListener("click", () => {
  completeLogin(createDemoGoogleSession());
});

demoOperatorLoginBtnEl?.addEventListener("click", () => {
  completeLogin(createDemoOperatorSession());
});

logoutBtnEl?.addEventListener("click", () => {
  clearAuthSession();
  window.location.href = "./auth.html";
});

agreeEl?.addEventListener("change", () => {
  if (agreeEl.checked) setStatus("확인되었습니다. Google 계정으로 계속 진행할 수 있습니다.", "success");
});

window.addEventListener("load", () => {
  initGoogleLogin();
  window.setTimeout(initGoogleLogin, 600);
});
