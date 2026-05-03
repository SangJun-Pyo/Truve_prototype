import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { Client } from "xrpl";
const prisma = new PrismaClient();

const app = express();
const port = Number(process.env.API_PORT ?? process.env.PORT ?? 8787);
const frontendOrigins = (process.env.FRONTEND_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const isProd = process.env.NODE_ENV === "production";
const xrplTestnetWs = process.env.XRPL_TESTNET_WS ?? "wss://s.altnet.rippletest.net:51233";
const xamanApiKey = process.env.XAMAN_API_KEY;
const xamanApiSecret = process.env.XAMAN_API_SECRET;
const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
const anthropicModel = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5";
const fallbackDonationDestination =
  process.env.XRPL_TESTNET_DONATION_DESTINATION ?? "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe";
const fallbackGovernanceDestination =
  process.env.XRPL_TESTNET_GOVERNANCE_DESTINATION ?? "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe";

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || frontendOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS origin is not allowed: ${origin}`));
    },
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
    qr_url: payload?.refs?.qr_png,
    next_url: payload?.next?.always,
  };
}

type TaxDonorType = "개인" | "법인";
type TaxSimulationInput = {
  donor_type: TaxDonorType;
  annual_income_range?: "5천만원_이하" | "5천만~1.5억" | "1.5억_이상";
  annual_profit_range?: "2억_이하" | "2억~200억" | "200억_이상";
  donation_type?: "지정기부금" | "법정기부금" | "일반기부금";
  donation_amount: number;
};

function extractJsonObject(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI 응답에서 JSON을 찾지 못했습니다.");
  }
  return text.slice(start, end + 1);
}

function normalizeTaxSimulationInput(input: any): TaxSimulationInput {
  const donorType = input?.donor_type === "법인" ? "법인" : "개인";
  const donationAmount = Number(input?.donation_amount);
  if (!Number.isFinite(donationAmount) || donationAmount <= 0) {
    throw new Error("donation_amount는 0보다 큰 숫자여야 합니다.");
  }

  return {
    donor_type: donorType,
    annual_income_range: input?.annual_income_range,
    annual_profit_range: input?.annual_profit_range,
    donation_type: input?.donation_type,
    donation_amount: Math.round(donationAmount),
  };
}

function fallbackTaxSimulation(input: TaxSimulationInput) {
  const amount = input.donation_amount;
  const rate =
    input.donor_type === "개인"
      ? input.annual_income_range === "1.5억_이상"
        ? [0.18, 0.28]
        : input.annual_income_range === "5천만~1.5억"
          ? [0.16, 0.24]
          : [0.13, 0.2]
      : input.donation_type === "법정기부금"
        ? [0.18, 0.28]
        : input.donation_type === "일반기부금"
          ? [0.08, 0.16]
          : [0.12, 0.22];

  return {
    estimated_deduction_min: Math.round(amount * rate[0]),
    estimated_deduction_max: Math.round(amount * rate[1]),
    explanation:
      input.donor_type === "법인"
        ? "법인 기부금은 기부금 종류와 손금산입 한도, 당해 연도 이익 규모에 따라 효과가 달라지는 참고용 추정치입니다."
        : "개인 기부자는 소득 구간과 공제 한도에 따라 실제 공제 효과가 달라지는 참고용 추정치입니다.",
    applicable_law: input.donor_type === "법인" ? "법인세법 제24조" : "소득세법 제34조 및 조세특례제한법 관련 규정",
    disclaimer: "정확한 산정은 세무사 상담 필요",
    source: "fallback",
  };
}

async function calculateTaxSimulationWithAnthropic(input: TaxSimulationInput) {
  if (!anthropicApiKey) {
    return fallbackTaxSimulation(input);
  }

  const prompt = `
당신은 한국 세법 참고 정보를 안내하는 도우미입니다.
다음 기부 정보를 바탕으로 일반적인 평균 세액공제 효과를 추정하되,
반드시 "참고용 추정치"임을 명시하고 정확한 수치 단정은 피하세요.

입력:
- 기부자 유형: ${input.donor_type}
- 기부 금액: ${input.donation_amount.toLocaleString()} KRW
- ${
    input.donor_type === "법인"
      ? `연 영업이익 구간: ${input.annual_profit_range}, 기부금 종류: ${input.donation_type}`
      : `연 소득 구간: ${input.annual_income_range}`
  }

출력은 아래 JSON 객체만 반환하세요.
{
  "estimated_deduction_min": 숫자,
  "estimated_deduction_max": 숫자,
  "explanation": "300자 이내 설명",
  "applicable_law": "관련 법령 명시",
  "disclaimer": "정확한 산정은 세무사 상담 필요"
}
  `;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": anthropicApiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: anthropicModel,
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Anthropic API 오류: ${response.status} ${text}`);
  }

  const data = await response.json();
  const text = Array.isArray(data?.content)
    ? data.content.map((part: any) => (part?.type === "text" ? part.text : "")).join("\n")
    : "";
  const parsed = JSON.parse(extractJsonObject(text));
  return { ...parsed, source: "anthropic" };
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "truve-api" });
});

app.post("/api/tax-sim/calculate", async (req, res) => {
  try {
    const input = normalizeTaxSimulationInput(req.body);
    const result = await calculateTaxSimulationWithAnthropic(input);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "절세 시뮬레이션 실패" });
  }
});

app.post("/api/xaman/signin", async (_req, res) => {
  try {
    const payload = await callXaman("/payload", {
      method: "POST",
      body: JSON.stringify({
        txjson: { TransactionType: "SignIn" },
        options: {
          submit: false,
          force_network: "TESTNET",
        },
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

app.get("/api/xaman/status/:uuid", async (req, res) => {
  try {
    const payload = await callXaman(`/payload/${req.params.uuid}`, { method: "GET" });
    const signed = Boolean(payload?.meta?.signed);
    res.json({
      signed,
      address: signed ? payload?.response?.account : undefined,
      resolved: Boolean(payload?.meta?.resolved),
      expired: Boolean(payload?.meta?.expired),
      txHash: payload?.response?.txid,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Payload status 조회 실패" });
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

app.get("/api/xrpl/account/:address", async (req, res) => {
  const address = req.params.address;
  const client = new Client(xrplTestnetWs);

  try {
    await client.connect();
    const accountInfo = await client.request({
      command: "account_info",
      account: address,
      ledger_index: "validated",
    });

    const result = accountInfo.result as any;
    const balanceDrops = String(result?.account_data?.Balance ?? "0");
    const balanceXrp = (Number(balanceDrops) / 1_000_000).toFixed(6);
    const sequence = Number(result?.account_data?.Sequence ?? 0);

    res.json({
      address,
      balanceDrops,
      balanceXrp,
      sequence,
    });
  } catch (error) {
    res.status(500).json({
      address,
      error: error instanceof Error ? error.message : "계정 조회 실패",
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

// ── 프로덕션: dist/ 정적 파일 서빙 ────────────────────────────────────
if (isProd) {
  const distPath = path.resolve(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("/{*splat}", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(port, () => {
  console.log(`[truve-api] listening on http://localhost:${port}`);
});
