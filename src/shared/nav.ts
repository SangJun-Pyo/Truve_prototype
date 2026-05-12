import { getAuthSession, isOperatorSession } from "../services/auth";

type Tab = {
  id: string;
  label: string;
  href: string;
};

const TABS: Tab[] = [
  { id: "foundations", label: "기부하기", href: "./foundations.html" },
  { id: "foundation-info", label: "기부재단 소개", href: "./foundation-info.html" },
  { id: "status", label: "내 기부 현황", href: "./status.html" },
  { id: "community", label: "커뮤니티", href: "./community.html" },
  { id: "about", label: "서비스 소개", href: "./about.html" },
  { id: "admin", label: "Admin", href: "./admin.html" },
];

export function renderTopNav(activeTabId: string): string {
  const session = getAuthSession();
  const visibleTabs = TABS.filter((tab) => tab.id !== "admin" || isOperatorSession());
  const links = visibleTabs.map((tab) => {
    const activeClass = tab.id === activeTabId ? "tab-link is-active" : "tab-link";
    return `<a class="${activeClass}" href="${tab.href}">${tab.label}</a>`;
  }).join("");
  const authClass = activeTabId === "auth" || activeTabId === "account" ? "tab-link auth-nav-link is-active" : "tab-link auth-nav-link";
  const authHref = session ? "./account.html" : "./auth.html";
  const authLabel = session ? "내 정보" : "로그인";

  return `
    <header class="app-header glass-nav">
      <a class="brand-lockup" href="./foundations.html" aria-label="Truve home">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 32 32">
            <path class="logo-layer logo-layer-top" d="M16 7 6 12.2 16 17.4 26 12.2 16 7Z"></path>
            <path class="logo-layer logo-layer-mid" d="M7.5 17.4 16 21.8 24.5 17.4"></path>
            <path class="logo-layer logo-layer-bottom" d="M8.5 22 16 25.8 23.5 22"></path>
          </svg>
        </span>
        <span class="brand">Truve</span>
      </a>
      <p class="sub-copy">XRPL Donation Credential infrastructure</p>
      <nav class="tab-nav" aria-label="Main Navigation">
        ${links}
        <a class="${authClass}" href="${authHref}">${authLabel}</a>
      </nav>
    </header>
  `;
}
