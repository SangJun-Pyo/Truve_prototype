type Tab = {
  id: string;
  label: string;
  href: string;
};

const TABS: Tab[] = [
  { id: "foundations", label: "기부하기", href: "./foundations.html" },
  { id: "status", label: "내 기부 현황", href: "./status.html" },
  { id: "governance", label: "거버넌스", href: "./governance.html" },
  { id: "about", label: "서비스 소개", href: "./about.html" },
  { id: "support", label: "지원 센터", href: "./support.html" },
  { id: "admin", label: "Admin", href: "./admin.html" },
];

export function renderTopNav(activeTabId: string): string {
  const links = TABS.map((tab) => {
    const activeClass = tab.id === activeTabId ? "tab-link is-active" : "tab-link";
    return `<a class="${activeClass}" href="${tab.href}">${tab.label}</a>`;
  }).join("");

  return `
    <header class="app-header glass-nav">
      <a class="brand-lockup" href="./foundations.html" aria-label="Truve home">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M12 3 3 8l9 5 9-5-9-5Z"></path>
            <path d="M3 16l9 5 9-5M3 11.5l9 5 9-5"></path>
          </svg>
        </span>
        <span class="brand">Truve</span>
      </a>
      <p class="sub-copy">Crypto donation receipts on XRPL</p>
      <nav class="tab-nav" aria-label="Main Navigation">
        ${links}
      </nav>
    </header>
  `;
}
