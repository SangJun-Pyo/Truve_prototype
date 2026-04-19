-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('SEED', 'SPROUT', 'FOREST');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "xrplAccount" TEXT NOT NULL,
    "displayName" TEXT,
    "tier" "Tier" NOT NULL DEFAULT 'SEED',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "donatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amountKrw" INTEGER NOT NULL,
    "allocations" JSONB NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "proofStatus" TEXT NOT NULL DEFAULT 'pending',
    "nftStatus" TEXT NOT NULL DEFAULT 'pending',
    "settlementStatus" TEXT NOT NULL DEFAULT 'scheduled',
    "txHash" TEXT,
    "proofNftId" TEXT,
    "explorerUrl" TEXT,
    "validationStatus" TEXT NOT NULL DEFAULT 'pending',

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GovernanceVote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "candidateName" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "votedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "txHash" TEXT,
    "validationStatus" TEXT NOT NULL DEFAULT 'pending',

    CONSTRAINT "GovernanceVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_xrplAccount_key" ON "User"("xrplAccount");

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovernanceVote" ADD CONSTRAINT "GovernanceVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
