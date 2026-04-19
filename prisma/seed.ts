/**
 * 테스트용 시드 데이터 스크립트
 * 실행: npx tsx prisma/seed.ts
 * 삭제: npx tsx prisma/seed.ts --reset
 *
 * 모든 시드 데이터는 xrplAccount가 "SEED_" 접두사로 구분됨
 * 삭제 시: prisma.user.deleteMany({ where: { xrplAccount: { startsWith: "SEED_" } } })
 */

import { PrismaClient, Tier } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

const SEED_MARKER = "SEED_";

const SEED_USERS = [
  {
    xrplAccount: "SEED_rDemoUser001KimSangjin",
    displayName: "김상진 (테스트)",
    tier: Tier.SPROUT,
  },
  {
    xrplAccount: "SEED_rDemoUser002ParkMinji",
    displayName: "박민지 (테스트)",
    tier: Tier.SEED,
  },
];

const SEED_DONATIONS = [
  // usr_demo_001 기부 이력
  {
    userXrpl: "SEED_rDemoUser001KimSangjin",
    donatedAt: new Date("2026-04-05T09:30:00.000Z"),
    amountKrw: 100000,
    allocations: [
      { foundationId: "fnd_green-earth", ratioPct: 50 },
      { foundationId: "fnd_next-class", ratioPct: 50 },
    ],
    paymentStatus: "paid",
    proofStatus: "recorded",
    nftStatus: "minted",
    settlementStatus: "done",
    txHash: "SEED_tx_a17bc91ef003",
    proofNftId: "SEED_proof_7a21cd33",
    explorerUrl: "https://testnet.xrpl.org/transactions/SEED_tx_a17bc91ef003",
    validationStatus: "validated",
  },
  {
    userXrpl: "SEED_rDemoUser001KimSangjin",
    donatedAt: new Date("2026-04-10T13:12:00.000Z"),
    amountKrw: 50000,
    allocations: [{ foundationId: "fnd_relief-now", ratioPct: 100 }],
    paymentStatus: "paid",
    proofStatus: "recorded",
    nftStatus: "minted",
    settlementStatus: "scheduled",
    txHash: "SEED_tx_f9d30ab8be10",
    proofNftId: "SEED_proof_901ccd71",
    explorerUrl: "https://testnet.xrpl.org/transactions/SEED_tx_f9d30ab8be10",
    validationStatus: "validated",
  },
  {
    userXrpl: "SEED_rDemoUser001KimSangjin",
    donatedAt: new Date("2026-04-15T10:00:00.000Z"),
    amountKrw: 30000,
    allocations: [
      { foundationId: "fnd_blue-ocean", ratioPct: 70 },
      { foundationId: "fnd_animal-care", ratioPct: 30 },
    ],
    paymentStatus: "paid",
    proofStatus: "pending",
    nftStatus: "pending",
    settlementStatus: "scheduled",
    txHash: "SEED_tx_c8e12f44da99",
    explorerUrl: "https://testnet.xrpl.org/transactions/SEED_tx_c8e12f44da99",
    validationStatus: "signed",
  },
  // usr_demo_002 기부 이력
  {
    userXrpl: "SEED_rDemoUser002ParkMinji",
    donatedAt: new Date("2026-04-11T07:40:00.000Z"),
    amountKrw: 70000,
    allocations: [
      { foundationId: "fnd_animal-care", ratioPct: 60 },
      { foundationId: "fnd_open-health", ratioPct: 40 },
    ],
    paymentStatus: "pending",
    proofStatus: "pending",
    nftStatus: "pending",
    settlementStatus: "scheduled",
    validationStatus: "pending",
  },
];

const SEED_VOTES = [
  {
    userXrpl: "SEED_rDemoUser001KimSangjin",
    proposalId: "proposal_q3_treasury_allocation",
    candidateId: "fnd_green-earth",
    candidateName: "그린어스 얼라이언스",
    weight: 2,
    txHash: "SEED_vote_tx_001",
    validationStatus: "validated",
  },
  {
    userXrpl: "SEED_rDemoUser002ParkMinji",
    proposalId: "proposal_q3_treasury_allocation",
    candidateId: "fnd_next-class",
    candidateName: "넥스트클래스 재단",
    weight: 1,
    txHash: "SEED_vote_tx_002",
    validationStatus: "validated",
  },
];

async function seed() {
  console.log("🌱 시드 데이터 삽입 시작...\n");

  // 사용자 생성
  const userMap: Record<string, string> = {};
  for (const u of SEED_USERS) {
    const user = await prisma.user.upsert({
      where: { xrplAccount: u.xrplAccount },
      update: { displayName: u.displayName, tier: u.tier },
      create: u,
    });
    userMap[u.xrplAccount] = user.id;
    console.log(`  ✅ User: ${u.displayName} (${u.xrplAccount})`);
  }

  // 기부 기록 생성
  for (const d of SEED_DONATIONS) {
    const userId = userMap[d.userXrpl];
    await prisma.donation.create({
      data: {
        userId,
        donatedAt: d.donatedAt,
        amountKrw: d.amountKrw,
        allocations: d.allocations,
        paymentStatus: d.paymentStatus,
        proofStatus: d.proofStatus,
        nftStatus: d.nftStatus,
        settlementStatus: d.settlementStatus,
        txHash: d.txHash ?? null,
        proofNftId: d.proofNftId ?? null,
        explorerUrl: d.explorerUrl ?? null,
        validationStatus: d.validationStatus,
      },
    });
    console.log(`  ✅ Donation: ${d.amountKrw.toLocaleString()}원 (${d.userXrpl.replace(SEED_MARKER, "")})`);
  }

  // 거버넌스 투표 생성
  for (const v of SEED_VOTES) {
    const userId = userMap[v.userXrpl];
    await prisma.governanceVote.create({
      data: {
        userId,
        proposalId: v.proposalId,
        candidateId: v.candidateId,
        candidateName: v.candidateName,
        weight: v.weight,
        txHash: v.txHash,
        validationStatus: v.validationStatus,
      },
    });
    console.log(`  ✅ Vote: ${v.candidateName} (weight: ${v.weight}, ${v.userXrpl.replace(SEED_MARKER, "")})`);
  }

  console.log("\n✨ 시드 완료!");
  console.log(`\n삭제하려면: npx tsx prisma/seed.ts --reset`);
}

async function reset() {
  console.log("🗑️  시드 데이터 삭제 중...\n");

  const users = await prisma.user.findMany({
    where: { xrplAccount: { startsWith: SEED_MARKER } },
    select: { id: true, displayName: true, xrplAccount: true },
  });

  const userIds = users.map((u) => u.id);

  const deletedVotes = await prisma.governanceVote.deleteMany({
    where: { userId: { in: userIds } },
  });
  const deletedDonations = await prisma.donation.deleteMany({
    where: { userId: { in: userIds } },
  });
  const deletedUsers = await prisma.user.deleteMany({
    where: { xrplAccount: { startsWith: SEED_MARKER } },
  });

  console.log(`  🗑️  GovernanceVotes: ${deletedVotes.count}건 삭제`);
  console.log(`  🗑️  Donations: ${deletedDonations.count}건 삭제`);
  console.log(`  🗑️  Users: ${deletedUsers.count}명 삭제`);
  console.log("\n✨ 시드 데이터 삭제 완료!");
}

async function main() {
  const isReset = process.argv.includes("--reset");
  try {
    if (isReset) {
      await reset();
    } else {
      await seed();
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
