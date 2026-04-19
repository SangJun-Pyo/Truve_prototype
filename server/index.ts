import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { PrismaClient } from "@prisma/client";
import { Client } from "xrpl";

const prisma = new PrismaClient();

dotenv.config();

const app = express();
const port = Number(process.env.API_PORT ?? 8787);
const frontendOrigin = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";
const xrplTestnetWs = process.env.XRPL_TESTNET_WS ?? "wss://s.altnet.rippletest.net:51233";
const xamanApiKey = process.env.XAMAN_API_KEY;
const xamanApiSecret = process.env.XAMAN_API_SECRET;
const fallbackDonationDestination =
  process.env.XRPL_TESTNET_DONATION_DESTINATION ?? "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe";
const fallbackGovernanceDestination =
  process.env.XRPL_TESTNET_GOVERNANCE_DESTINATION ?? "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe";

app.use(
  cors({
    origin: frontendOrigin,
    credentials: false,
  }),
);
app.use(express.json());

function requireXamanKeys(): void {
  if (!xamanApiKey || !xamanApiSecret) {
    throw new Error("Xaman API 키가 설정되지 않았습니다. .env를 확인해 주세요.");
  }
}

function toHex(input: string): string {
  return Buffer.from(input, "utf8").toString("hex").toUpperCase();
}

async function callXaman(path: string, init: RequestInit): Promise<any> {
  requireXamanKeys();
  const response = await fetch(`https://xumm.app/api/v1/platform${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": xamanApiKey as string,
      "x-api-secret": xamanApiSecret as string,
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Xaman API 오류: ${response.status} ${text}`);
  }

  return response.json();
}

function mapPayloadCreateResponse(payload: any) {
  return {
    uuid: payload.uuid,
    qrPngUrl: payload?.refs?.qr_png,
    deepLink: payload?.next?.always,
  };
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "truve-api" });
});

app.post("/api/xaman/signin", async (_req, res) => {
  try {
    const payload = await callXaman("/payload", {
      method: "POST",
      body: JSON.stringify({
        txjson: { TransactionType: "SignIn" },
        options: { submit: false },
      }),
    });
    res.json(mapPayloadCreateResponse(payload));
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "SignIn 생성 실패" });
  }
});

app.post("/api/xaman/payment", async (req, res) => {
  try {
    const { account, destination, amountDrops, memoType, memoData } = req.body ?? {};
    if (!account || !destination || !amountDrops) {
      res.status(400).json({ error: "account, destination, amountDrops는 필수입니다." });
      return;
    }

    const payload = await callXaman("/payload", {
      method: "POST",
      body: JSON.stringify({
        txjson: {
          TransactionType: "Payment",
          Account: account,
          Destination: destination ?? fallbackDonationDestination,
          Amount: String(amountDrops),
          Memos:
            memoType && memoData
              ? [
                  {
                    Memo: {
                      MemoType: toHex(String(memoType)),
                      MemoData: toHex(String(memoData)),
                    },
                  },
                ]
              : undefined,
        },
        options: { submit: true },
      }),
    });

    res.json(mapPayloadCreateResponse(payload));
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Payment payload 생성 실패" });
  }
});

app.post("/api/xaman/memo", async (req, res) => {
  try {
    const { account, destination, amountDrops, memoType, memoData } = req.body ?? {};
    if (!account || !memoType || !memoData) {
      res.status(400).json({ error: "account, memoType, memoData는 필수입니다." });
      return;
    }

    const payload = await callXaman("/payload", {
      method: "POST",
      body: JSON.stringify({
        txjson: {
          TransactionType: "Payment",
          Account: account,
          Destination: destination ?? fallbackGovernanceDestination,
          Amount: String(amountDrops ?? "1"),
          Memos: [
            {
              Memo: {
                MemoType: toHex(String(memoType)),
                MemoData: toHex(String(memoData)),
              },
            },
          ],
        },
        options: { submit: true },
      }),
    });

    res.json(mapPayloadCreateResponse(payload));
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Memo payload 생성 실패" });
  }
});

app.get("/api/xaman/payload/:uuid", async (req, res) => {
  try {
    const payload = await callXaman(`/payload/${req.params.uuid}`, { method: "GET" });
    res.json({
      uuid: req.params.uuid,
      resolved: Boolean(payload?.meta?.resolved),
      signed: Boolean(payload?.meta?.signed),
      expired: Boolean(payload?.meta?.expired),
      account: payload?.response?.account,
      txHash: payload?.response?.txid,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Payload 조회 실패" });
  }
});

app.get("/api/xrpl/tx/:hash", async (req, res) => {
  const hash = req.params.hash;
  const client = new Client(xrplTestnetWs);

  try {
    await client.connect();
    const tx = await client.request({
      command: "tx",
      transaction: hash,
    });
    const validated = Boolean((tx.result as any)?.validated);
    res.json({
      hash,
      validated,
      explorerUrl: `https://testnet.xrpl.org/transactions/${hash}`,
      result: tx.result,
    });
  } catch (error) {
    res.status(500).json({
      hash,
      validated: false,
      explorerUrl: `https://testnet.xrpl.org/transactions/${hash}`,
      error: error instanceof Error ? error.message : "트랜잭션 조회 실패",
    });
  } finally {
    if (client.isConnected()) {
      await client.disconnect();
    }
  }
});

// ── DB: 사용자 upsert (지갑 연결 시 호출) ──────────────────────────────
app.post("/api/db/users", async (req, res) => {
  try {
    const { xrplAccount, displayName } = req.body ?? {};
    if (!xrplAccount) {
      res.status(400).json({ error: "xrplAccount는 필수입니다." });
      return;
    }
    const user = await prisma.user.upsert({
      where: { xrplAccount },
      update: { displayName: displayName ?? undefined },
      create: { xrplAccount, displayName: displayName ?? null },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "사용자 저장 실패" });
  }
});

// ── DB: 기부 기록 저장 ─────────────────────────────────────────────────
app.post("/api/db/donations", async (req, res) => {
  try {
    const { xrplAccount, amountKrw, allocations, txHash, explorerUrl } = req.body ?? {};
    if (!xrplAccount || !amountKrw || !allocations) {
      res.status(400).json({ error: "xrplAccount, amountKrw, allocations는 필수입니다." });
      return;
    }
    const user = await prisma.user.upsert({
      where: { xrplAccount },
      update: {},
      create: { xrplAccount },
    });
    const donation = await prisma.donation.create({
      data: {
        userId: user.id,
        amountKrw: Number(amountKrw),
        allocations,
        paymentStatus: "paid",
        proofStatus: txHash ? "recorded" : "pending",
        txHash: txHash ?? null,
        explorerUrl: explorerUrl ?? null,
        validationStatus: txHash ? "validated" : "pending",
      },
    });
    res.json(donation);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "기부 저장 실패" });
  }
});

// ── DB: 기부 내역 조회 ─────────────────────────────────────────────────
app.get("/api/db/donations/:xrplAccount", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { xrplAccount: req.params.xrplAccount },
      include: { donations: { orderBy: { donatedAt: "desc" } } },
    });
    res.json(user?.donations ?? []);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "기부 조회 실패" });
  }
});

// ── DB: 기부 상태 업데이트 (NFT 민팅 후 등) ───────────────────────────
app.patch("/api/db/donations/:id", async (req, res) => {
  try {
    const donation = await prisma.donation.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(donation);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "기부 업데이트 실패" });
  }
});

// ── DB: 거버넌스 투표 저장 ─────────────────────────────────────────────
app.post("/api/db/governance", async (req, res) => {
  try {
    const { xrplAccount, proposalId, candidateId, candidateName, weight, txHash } = req.body ?? {};
    if (!xrplAccount || !proposalId || !candidateId || !weight) {
      res.status(400).json({ error: "xrplAccount, proposalId, candidateId, weight는 필수입니다." });
      return;
    }
    const user = await prisma.user.upsert({
      where: { xrplAccount },
      update: {},
      create: { xrplAccount },
    });
    const vote = await prisma.governanceVote.create({
      data: {
        userId: user.id,
        proposalId,
        candidateId,
        candidateName,
        weight: Number(weight),
        txHash: txHash ?? null,
        validationStatus: txHash ? "validated" : "pending",
      },
    });
    res.json(vote);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "투표 저장 실패" });
  }
});

// ── DB: 거버넌스 투표 집계 조회 ────────────────────────────────────────
app.get("/api/db/governance/:proposalId", async (req, res) => {
  try {
    const votes = await prisma.governanceVote.groupBy({
      by: ["candidateId", "candidateName"],
      where: { proposalId: req.params.proposalId },
      _sum: { weight: true },
    });
    res.json(votes);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "투표 집계 실패" });
  }
});

app.listen(port, () => {
  console.log(`[truve-api] listening on http://localhost:${port}`);
});
