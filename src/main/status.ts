import { createRepositories } from "../api/provider";
import { mergeDonationRecords, type LocalDonationRecord } from "../services/donations";
import { fetchDbDonations } from "../services/db";
import { getWalletSession } from "../services/wallet";
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
  const baseStatus = await repositories.userRepository.getDonationStatus(USER_ID);
  const baseDonations = await repositories.donationRepository.listDonationsByUser(USER_ID);

  // 지갑 연결된 경우 DB에서 실제 기부 내역 추가 병합
  const wallet = getWalletSession();
  let dbDonations: LocalDonationRecord[] = [];
  if (wallet) {
    const fetched = await fetchDbDonations(wallet.account);
    dbDonations = fetched.map((d) => ({
      id: d.id,
      userId: d.userId,
      donatedAt: d.donatedAt,
      amountKrw: d.amountKrw,
      allocations: d.allocations as LocalDonationRecord["allocations"],
      paymentStatus: d.paymentStatus as LocalDonationRecord["paymentStatus"],
      proofStatus: d.proofStatus as LocalDonationRecord["proofStatus"],
      nftStatus: d.nftStatus as LocalDonationRecord["nftStatus"],
      settlementStatus: d.settlementStatus as LocalDonationRecord["settlementStatus"],
      txHash: d.txHash ?? undefined,
      proofNftId: d.proofNftId ?? undefined,
      explorerUrl: d.explorerUrl ?? undefined,
      validationStatus: d.validationStatus as LocalDonationRecord["validationStatus"],
      source: "local" as const,
      dbId: d.id,
    }));
  }

  // mock + localStorage + DB 통합 (중복 제거: dbId 기준)
  const merged = mergeDonationRecords(baseDonations, USER_ID);
  const dbIds = new Set(dbDonations.map((d) => d.id));
  const donations = [
    ...dbDonations,
    ...merged.filter((d) => !dbIds.has(d.dbId ?? "") && !dbIds.has(d.id)),
  ].sort((a, b) => (a.donatedAt < b.donatedAt ? 1 : -1));

  if (!profile || !baseStatus) {
    if (summaryEl) {
      summaryEl.innerHTML = `<div class="notice error">사용자 상태를 불러오지 못했습니다.</div>`;
    }
    return;
  }

  const totalDonated = donations.reduce((sum, item) => sum + item.amountKrw, 0);
  if (summaryEl) {
    summaryEl.innerHTML = `
      <div class="summary-box">
        <div class="summary-label">사용자</div>
        <div class="summary-value">${profile.displayName}</div>
      </div>
      <div class="summary-box">
        <div class="summary-label">누적 기부금</div>
        <div class="summary-value">${formatKrw(totalDonated)}</div>
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
            <div class="trust">4) ${stepToKorean(donation.settlementStatus)} · 검증 ${donation.validationStatus ?? "-"}</div>
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
        const proofStatus =
          donation.proofMintStatus === "recorded"
            ? "요청 기록 완료"
            : donation.proofMintStatus === "requested"
              ? "요청됨"
              : donation.nftStatus === "minted"
                ? "발행 완료"
                : "대기";

        return `
          <tr>
            <td>${formatDate(donation.donatedAt)}</td>
            <td>${formatKrw(donation.amountKrw)}</td>
            <td>${stepToKorean(donation.settlementStatus)} / ${donation.validationStatus ?? "-"}</td>
            <td>${proofStatus}</td>
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
            <th>정산/검증</th>
            <th>Proof 상태</th>
            <th>증빙 링크</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }
}

void init();
