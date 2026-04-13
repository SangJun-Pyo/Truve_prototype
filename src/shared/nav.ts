type Tab = {
  id: string;
  label: string;
  href: string;
};

const TABS: Tab[] = [
  { id: "donation", label: "기부 담기", href: "./donation.html" },
  { id: "foundations", label: "재단 탐색", href: "./foundations.html" },
  { id: "about", label: "Truve 설명", href: "./about.html" },
  { id: "status", label: "내 기부 Status", href: "./status.html" },
];

export function renderTopNav(activeTabId: string): string {
  const links = TABS.map((tab) => {
    const activeClass = tab.id === activeTabId ? "tab-link is-active" : "tab-link";
    return `<a class="${activeClass}" href="${tab.href}">${tab.label}</a>`;
  }).join("");

  return `
    <header class="app-header">
      <div>
        <h1 class="brand">Truve 목업</h1>
        <p class="sub-copy">기부 책가방 + 재단 탐색 프로토타입</p>
      </div>
    </header>
    <nav class="tab-nav" aria-label="Main tab navigation">
      ${links}
    </nav>
  `;
}
