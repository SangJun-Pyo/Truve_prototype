type Tab = {
  id: string;
  label: string;
  href: string;
};

const TABS: Tab[] = [
  { id: "foundations", label: "기부 탐색", href: "./foundations.html" },
  { id: "donation", label: "기부 담기", href: "./donation.html" },
  { id: "governance", label: "거버넌스", href: "./governance.html" },
  { id: "status", label: "내 기부 현황", href: "./status.html" },
  { id: "about", label: "서비스 소개", href: "./about.html" },
  { id: "support", label: "지원 센터", href: "./support.html" },
];

export function renderTopNav(activeTabId: string): string {
  const links = TABS.map((tab) => {
    const activeClass = tab.id === activeTabId ? "tab-link is-active" : "tab-link";
    return `<a class="${activeClass}" href="${tab.href}">${tab.label}</a>`;
  }).join("");

  return `
    <header class="app-header">
      <h1 class="brand">Truve.</h1>
      <p class="sub-copy">Trust + Give · XRPL Testnet Prototype</p>
    </header>
    <nav class="tab-nav" aria-label="Main Navigation">
      ${links}
    </nav>
  `;
}
