import { createRepositories } from "../api/provider";
import { renderTopNav } from "../shared/nav";

const navRoot = document.getElementById("top-nav");
if (navRoot) {
  navRoot.innerHTML = renderTopNav("status");
}

const summaryEl = document.getElementById("status-summary");
const timelineEl = document.getElementById("status-timeline");
const tableEl = document.getElementById("status-table");

const USER_ID = "usr_demo_001";

function formatKrw(value: number): string {
  return `${new Intl.NumberFormat("ko-KR").format(value)}원`;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function stepToKorean(step: string): string {
  const map: Record<string, string> = {
    paid: "결제 완료",
    pending: "결제 대기",
    failed: "결제 실패",
    recorded: "해시 기록 완료",
    minted: "Proof NFT 발행 완료",
    scheduled: "정산 예정",
    done: "정산 완료",
    error: "오류",
  };
  return map[step] ?? step;
}

async function init(): Promise<void> {
  const repositories = await createRepositories();
  const profile = await repositories.userRepository.getProfile(USER_ID);
  const status = await repositories.userRepository.getDonationStatus(USER_ID);
  const donations = await repositories.donationRepository.listDonationsByUser(USER_ID);

  if (!profile || !status) {
    if (summaryEl) {
      summaryEl.innerHTML = `<div class="notice error">사용자 상태를 불러오지 못했습니다.</div>`;
    }
    return;
  }

  if (summaryEl) {
    summaryEl.innerHTML = `
      <div class="summary-box">
        <div class="summary-label">사용자</div>
        <div class="summary-value">${profile.displayName}</div>
      </div>
      <div class="summary-box">
        <div class="summary-label">누적 기부금</div>
        <div class="summary-value">${formatKrw(status.totalDonationsKrw)}</div>
      </div>
      <div class="summary-box">
        <div class="summary-label">등급</div>
        <div class="summary-value">${profile.tier.toUpperCase()}</div>
      </div>
    `;
  }

  if (timelineEl) {
    timelineEl.innerHTML = donations
      .slice(0, 3)
      .map((donation) => {
        return `
          <article class="timeline-item">
            <div class="row-between">
              <strong>${formatKrw(donation.amountKrw)}</strong>
              <span class="badge">${formatDate(donation.donatedAt)}</span>
            </div>
            <div class="trust mt-12">1) ${stepToKorean(donation.paymentStatus)}</div>
            <div class="trust">2) ${stepToKorean(donation.proofStatus)}</div>
            <div class="trust">3) ${stepToKorean(donation.nftStatus)}</div>
            <div class="trust">4) ${stepToKorean(donation.settlementStatus)}</div>
          </article>
        `;
      })
      .join("");
  }

  if (tableEl) {
    const rows = donations
      .map((donation) => {
        const txLink = donation.txHash
          ? `<a class="text-link" href="https://testnet.xrpl.org/transactions/${donation.txHash}" target="_blank" rel="noreferrer">${donation.txHash}</a>`
          : "-";

        return `
          <tr>
            <td>${formatDate(donation.donatedAt)}</td>
            <td>${formatKrw(donation.amountKrw)}</td>
            <td>${stepToKorean(donation.settlementStatus)}</td>
            <td>${txLink}</td>
          </tr>
        `;
      })
      .join("");

    tableEl.innerHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>일시</th>
            <th>금액</th>
            <th>정산 상태</th>
            <th>증빙 링크</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }
}

void init();
