"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const client_1 = require("@prisma/client");
const xrpl_1 = require("xrpl");
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
const port = Number(process.env.API_PORT ?? process.env.PORT ?? 8787);
const frontendOrigins = (process.env.FRONTEND_ORIGIN ?? "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
const shouldServeStaticDist = process.env.NODE_ENV === "production";
const xrplTestnetWs = process.env.XRPL_TESTNET_WS ?? "wss://s.altnet.rippletest.net:51233";
const xrplNetwork = process.env.XRPL_NETWORK ?? "testnet";
const xrplTestnetWss = process.env.XRPL_TESTNET_WSS ?? xrplTestnetWs;
const xamanApiKey = process.env.XAMAN_API_KEY;
const xamanApiSecret = process.env.XAMAN_API_SECRET;
const adminSecret = process.env.ADMIN_SECRET;
const adminFaucetEnabled = process.env.ADMIN_FAUCET_ENABLED === "true";
const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
const anthropicModel = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5";
const fallbackDonationDestination = process.env.XRPL_TESTNET_DONATION_DESTINATION ?? "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe";
const fallbackGovernanceDestination = process.env.XRPL_TESTNET_GOVERNANCE_DESTINATION ?? "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe";
const issuedAssetConfig = {
    RLUSD: {
        label: "RLUSD",
        currency: process.env.XRPL_TESTNET_RLUSD_CURRENCY ?? "RLUSD",
        issuer: process.env.XRPL_TESTNET_RLUSD_ISSUER_ADDRESS ?? process.env.XRPL_TESTNET_RLUSD_ISSUER ?? "",
        seed: process.env.XRPL_TESTNET_RLUSD_ISSUER_SEED ?? "",
    },
    USDC: {
        label: "USDC",
        currency: process.env.XRPL_TESTNET_USDC_CURRENCY ?? "USDC",
        issuer: process.env.XRPL_TESTNET_USDC_ISSUER_ADDRESS ?? process.env.XRPL_TESTNET_USDC_ISSUER ?? "",
        seed: process.env.XRPL_TESTNET_USDC_ISSUER_SEED ?? "",
    },
};
app.use((0, cors_1.default)({
    origin(origin, callback) {
        if (!origin || frontendOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error(`CORS origin is not allowed: ${origin}`));
    },
    credentials: false,
}));
app.use(express_1.default.json());
function requireXamanKeys() {
    if (!xamanApiKey || !xamanApiSecret) {
        throw new Error("Xaman API 키가 설정되지 않았습니다. .env를 확인해 주세요.");
    }
}
function toHex(input) {
    return Buffer.from(input, "utf8").toString("hex").toUpperCase();
}
function toXrplCurrencyCode(code) {
    const trimmed = String(code).trim();
    if (/^[A-Fa-f0-9]{40}$/.test(trimmed)) {
        return trimmed.toUpperCase();
    }
    if (/^[A-Za-z0-9?!@#$%^&*<>(){}\[\]|]{3}$/.test(trimmed) && trimmed !== "XRP") {
        return trimmed;
    }
    const bytes = Buffer.from(trimmed, "ascii");
    if (bytes.length === 0 || bytes.length > 20) {
        throw new Error("Issued currency code must be 1-20 ASCII characters.");
    }
    return bytes.toString("hex").toUpperCase().padEnd(40, "0");
}
function fromXrplCurrencyCode(code) {
    if (!/^[A-Fa-f0-9]{40}$/.test(code)) {
        return code;
    }
    return Buffer.from(code, "hex").toString("ascii").replace(/\0+$/g, "") || code;
}
function normalizeIssuedValue(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("Issued currency amount must be greater than 0.");
    }
    return amount.toFixed(6).replace(/\.?0+$/g, "");
}
function getIssuedAsset(asset) {
    if (asset === "XRP")
        return null;
    const config = issuedAssetConfig[asset];
    if (!config?.issuer) {
        throw new Error(`${asset} testnet issuer is not configured.`);
    }
    return {
        ...config,
        currency: toXrplCurrencyCode(config.currency),
    };
}
function getFaucetIssuer(asset) {
    const config = issuedAssetConfig[asset];
    if (!config.issuer || !config.seed) {
        throw new Error(`${asset} faucet issuer address/seed is not configured.`);
    }
    const wallet = xrpl_1.Wallet.fromSeed(config.seed);
    if (wallet.address !== config.issuer) {
        throw new Error(`${asset} issuer seed does not match issuer address.`);
    }
    return {
        wallet,
        currency: toXrplCurrencyCode(config.currency),
    };
}
function requireAdminSecret(req) {
    if (!adminSecret) {
        throw new Error("ADMIN_SECRET is not configured.");
    }
    if (req.header("x-admin-secret") !== adminSecret) {
        const error = new Error("Admin secret is invalid.");
        error.statusCode = 401;
        throw error;
    }
}
function normalizeFaucetInput(input) {
    const recipient = String(input?.recipient ?? "").trim();
    const currency = String(input?.currency ?? "").trim();
    const amount = String(input?.amount ?? "").trim();
    if (xrplNetwork !== "testnet") {
        throw new Error("Testnet Faucet is blocked because XRPL_NETWORK is not testnet.");
    }
    if (!adminFaucetEnabled) {
        throw new Error("Testnet Faucet is disabled. Set ADMIN_FAUCET_ENABLED=true.");
    }
    if (!(0, xrpl_1.isValidClassicAddress)(recipient)) {
        throw new Error("Recipient must be a valid XRPL classic address.");
    }
    if (currency !== "RLUSD" && currency !== "USDC") {
        throw new Error("currency must be RLUSD or USDC.");
    }
    const config = issuedAssetConfig[currency];
    if (recipient === config.issuer) {
        throw new Error("Recipient cannot be the issuer wallet. Enter a different Xaman testnet wallet that has opened a TrustLine for this token issuer.");
    }
    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
        throw new Error("amount must be greater than 0.");
    }
    return {
        recipient,
        currency: currency,
        amount: normalizeIssuedValue(amount),
    };
}
function normalizeTrustLineInput(input) {
    const recipient = String(input?.recipient ?? "").trim();
    const currency = String(input?.currency ?? "").trim();
    const limit = String(input?.limit ?? input?.amount ?? "1000000").trim();
    if (xrplNetwork !== "testnet") {
        throw new Error("Testnet TrustLine request is blocked because XRPL_NETWORK is not testnet.");
    }
    if (!adminFaucetEnabled) {
        throw new Error("Testnet TrustLine request is disabled. Set ADMIN_FAUCET_ENABLED=true.");
    }
    if (!(0, xrpl_1.isValidClassicAddress)(recipient)) {
        throw new Error("Recipient must be a valid XRPL classic address.");
    }
    if (currency !== "RLUSD" && currency !== "USDC") {
        throw new Error("currency must be RLUSD or USDC.");
    }
    if (!Number.isFinite(Number(limit)) || Number(limit) <= 0) {
        throw new Error("TrustLine limit must be greater than 0.");
    }
    const issuedAsset = getIssuedAsset(currency);
    return {
        recipient,
        currency: currency,
        limit: normalizeIssuedValue(limit),
        issuer: issuedAsset?.issuer,
        xrplCurrency: issuedAsset?.currency,
    };
}
function normalizeIssuerOpsInput(input) {
    const currency = String(input?.currency ?? "").trim();
    if (xrplNetwork !== "testnet") {
        throw new Error("Issuer operation is blocked because XRPL_NETWORK is not testnet.");
    }
    if (!adminFaucetEnabled) {
        throw new Error("Issuer operation is disabled. Set ADMIN_FAUCET_ENABLED=true.");
    }
    if (currency !== "RLUSD" && currency !== "USDC") {
        throw new Error("currency must be RLUSD or USDC.");
    }
    return {
        currency: currency,
    };
}
function listAssets() {
    return [
        { asset: "XRP", label: "XRP", native: true, configured: true },
        ...Object.entries(issuedAssetConfig).map(([asset, config]) => ({
            asset,
            label: config.label,
            native: false,
            currency: toXrplCurrencyCode(config.currency),
            displayCurrency: config.currency,
            issuer: config.issuer || null,
            configured: Boolean(config.issuer),
        })),
    ];
}
async function callXaman(path, init) {
    requireXamanKeys();
    const response = await fetch(`https://xumm.app/api/v1/platform${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            "x-api-key": xamanApiKey,
            "x-api-secret": xamanApiSecret,
            ...(init.headers ?? {}),
        },
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Xaman API 오류: ${response.status} ${text}`);
    }
    return response.json();
}
function mapPayloadCreateResponse(payload) {
    return {
        uuid: payload.uuid,
        qrPngUrl: payload?.refs?.qr_png,
        deepLink: payload?.next?.always,
        qr_url: payload?.refs?.qr_png,
        next_url: payload?.next?.always,
    };
}
function extractJsonObject(text) {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
        throw new Error("AI 응답에서 JSON을 찾지 못했습니다.");
    }
    return text.slice(start, end + 1);
}
function normalizeTaxSimulationInput(input) {
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
function fallbackTaxSimulation(input) {
    const amount = input.donation_amount;
    const rate = input.donor_type === "개인"
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
        explanation: input.donor_type === "법인"
            ? "법인 기부금은 기부금 종류와 손금산입 한도, 당해 연도 이익 규모에 따라 효과가 달라지는 참고용 추정치입니다."
            : "개인 기부자는 소득 구간과 공제 한도에 따라 실제 공제 효과가 달라지는 참고용 추정치입니다.",
        applicable_law: input.donor_type === "법인" ? "법인세법 제24조" : "소득세법 제34조 및 조세특례제한법 관련 규정",
        disclaimer: "정확한 산정은 세무사 상담 필요",
        source: "fallback",
    };
}
async function calculateTaxSimulationWithAnthropic(input) {
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
- ${input.donor_type === "법인"
        ? `연 영업이익 구간: ${input.annual_profit_range}, 기부금 종류: ${input.donation_type}`
        : `연 소득 구간: ${input.annual_income_range}`}

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
        ? data.content.map((part) => (part?.type === "text" ? part.text : "")).join("\n")
        : "";
    const parsed = JSON.parse(extractJsonObject(text));
    return { ...parsed, source: "anthropic" };
}
app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "truve-api" });
});
app.get("/api/xrpl/assets", (_req, res) => {
    try {
        res.json({ network: "XRPL Testnet", assets: listAssets() });
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "Asset config lookup failed" });
    }
});
app.get("/api/xrpl/donation-destination", (_req, res) => {
    res.json({
        network: "XRPL Testnet",
        address: fallbackDonationDestination,
        label: "Truve MVP settlement wallet",
    });
});
app.post("/api/admin/testnet-faucet", async (req, res) => {
    const client = new xrpl_1.Client(xrplTestnetWss);
    try {
        requireAdminSecret(req);
        const input = normalizeFaucetInput(req.body);
        const issuer = getFaucetIssuer(input.currency);
        await client.connect();
        const tx = {
            TransactionType: "Payment",
            Account: issuer.wallet.address,
            Destination: input.recipient,
            Amount: {
                currency: issuer.currency,
                issuer: issuer.wallet.address,
                value: input.amount,
            },
        };
        const prepared = await client.autofill(tx);
        const signed = issuer.wallet.sign(prepared);
        const submitted = await client.submitAndWait(signed.tx_blob);
        const result = submitted.result;
        const engineResult = result?.engine_result ?? result?.meta?.TransactionResult;
        if (engineResult && engineResult !== "tesSUCCESS") {
            throw new Error(`XRPL transaction failed: ${engineResult}`);
        }
        res.json({
            ok: true,
            currency: input.currency,
            amount: input.amount,
            recipient: input.recipient,
            txHash: signed.hash,
            validated: Boolean(result?.validated),
            explorerUrl: `https://testnet.xrpl.org/transactions/${signed.hash}`,
            message: "Test token sent successfully. Testnet only · No real value.",
        });
    }
    catch (error) {
        const rawMessage = error instanceof Error ? error.message : "Testnet faucet failed.";
        const trustLineHint = /tecNO_LINE|tecPATH_DRY|trustline|trust line|path/i.test(rawMessage)
            ? " Recipient wallet must open a TrustLine for this token issuer before receiving test tokens."
            : "";
        const statusCode = error?.statusCode ?? 400;
        res.status(statusCode).json({ error: `${rawMessage}${trustLineHint}` });
    }
    finally {
        if (client.isConnected()) {
            await client.disconnect();
        }
    }
});
app.post("/api/admin/testnet-trustline", async (req, res) => {
    try {
        requireAdminSecret(req);
        const input = normalizeTrustLineInput(req.body);
        const payload = await callXaman("/payload", {
            method: "POST",
            body: JSON.stringify({
                txjson: {
                    TransactionType: "TrustSet",
                    Account: input.recipient,
                    Flags: 262144,
                    LimitAmount: {
                        currency: input.xrplCurrency,
                        issuer: input.issuer,
                        value: input.limit,
                    },
                },
                options: { submit: true, force_network: "TESTNET" },
            }),
        });
        res.json({
            ...mapPayloadCreateResponse(payload),
            currency: input.currency,
            issuer: input.issuer,
            limit: input.limit,
            message: "Open this TrustLine request in the recipient Xaman testnet wallet. Testnet only · No real value.",
        });
    }
    catch (error) {
        const statusCode = error?.statusCode ?? 400;
        res.status(statusCode).json({
            error: error instanceof Error ? error.message : "Testnet TrustLine request failed.",
        });
    }
});
app.post("/api/admin/issuer/default-ripple", async (req, res) => {
    const client = new xrpl_1.Client(xrplTestnetWss);
    try {
        requireAdminSecret(req);
        const input = normalizeIssuerOpsInput(req.body);
        const issuer = getFaucetIssuer(input.currency);
        await client.connect();
        const accountInfo = await client.request({
            command: "account_info",
            account: issuer.wallet.address,
            ledger_index: "validated",
        });
        const flags = Number(accountInfo.result.account_data?.Flags ?? 0);
        const defaultRippleEnabled = (flags & 0x00800000) !== 0;
        if (defaultRippleEnabled) {
            res.json({
                ok: true,
                currency: input.currency,
                issuer: issuer.wallet.address,
                alreadyEnabled: true,
                defaultRippleEnabled: true,
                message: "Issuer Default Ripple is already enabled. Testnet only · No real value.",
            });
            return;
        }
        const tx = {
            TransactionType: "AccountSet",
            Account: issuer.wallet.address,
            SetFlag: 8,
        };
        const prepared = await client.autofill(tx);
        const signed = issuer.wallet.sign(prepared);
        const submitted = await client.submitAndWait(signed.tx_blob);
        const result = submitted.result;
        const engineResult = result?.engine_result ?? result?.meta?.TransactionResult;
        if (engineResult && engineResult !== "tesSUCCESS") {
            throw new Error(`XRPL transaction failed: ${engineResult}`);
        }
        res.json({
            ok: true,
            currency: input.currency,
            issuer: issuer.wallet.address,
            txHash: signed.hash,
            validated: Boolean(result?.validated),
            defaultRippleEnabled: true,
            explorerUrl: `https://testnet.xrpl.org/transactions/${signed.hash}`,
            message: "Issuer Default Ripple enabled. Holder-to-holder test token transfers can now path through the issuer.",
        });
    }
    catch (error) {
        const statusCode = error?.statusCode ?? 400;
        res.status(statusCode).json({
            error: error instanceof Error ? error.message : "Issuer Default Ripple operation failed.",
        });
    }
    finally {
        if (client.isConnected()) {
            await client.disconnect();
        }
    }
});
app.post("/api/admin/issuer/clear-no-ripple", async (req, res) => {
    const client = new xrpl_1.Client(xrplTestnetWss);
    try {
        requireAdminSecret(req);
        const input = normalizeTrustLineInput(req.body);
        const issuer = getFaucetIssuer(input.currency);
        await client.connect();
        const tx = {
            TransactionType: "TrustSet",
            Account: issuer.wallet.address,
            Flags: 262144,
            LimitAmount: {
                currency: issuer.currency,
                issuer: input.recipient,
                value: "0",
            },
        };
        const prepared = await client.autofill(tx);
        const signed = issuer.wallet.sign(prepared);
        const submitted = await client.submitAndWait(signed.tx_blob);
        const result = submitted.result;
        const engineResult = result?.engine_result ?? result?.meta?.TransactionResult;
        if (engineResult && engineResult !== "tesSUCCESS") {
            throw new Error(`XRPL transaction failed: ${engineResult}`);
        }
        res.json({
            ok: true,
            currency: input.currency,
            issuer: issuer.wallet.address,
            peer: input.recipient,
            txHash: signed.hash,
            validated: Boolean(result?.validated),
            explorerUrl: `https://testnet.xrpl.org/transactions/${signed.hash}`,
            message: "Issuer-side NoRipple cleared for this TrustLine. The holder wallet may also need to sign a Clear NoRipple TrustSet request.",
        });
    }
    catch (error) {
        const statusCode = error?.statusCode ?? 400;
        res.status(statusCode).json({
            error: error instanceof Error ? error.message : "Issuer Clear NoRipple operation failed.",
        });
    }
    finally {
        if (client.isConnected()) {
            await client.disconnect();
        }
    }
});
app.post("/api/tax-sim/calculate", async (req, res) => {
    try {
        const input = normalizeTaxSimulationInput(req.body);
        const result = await calculateTaxSimulationWithAnthropic(input);
        res.json(result);
    }
    catch (error) {
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
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "SignIn 생성 실패" });
    }
});
app.post("/api/xaman/payment", async (req, res) => {
    try {
        const { account, destination, amountDrops, amountValue, asset, memoType, memoData } = req.body ?? {};
        const selectedAsset = (asset === "RLUSD" || asset === "USDC" ? asset : "XRP");
        if (!account || !destination) {
            res.status(400).json({ error: "account, destination, amountDrops는 필수입니다." });
            return;
        }
        const issuedAsset = getIssuedAsset(selectedAsset);
        const amount = selectedAsset === "XRP"
            ? String(amountDrops)
            : {
                currency: issuedAsset?.currency,
                issuer: issuedAsset?.issuer,
                value: normalizeIssuedValue(amountValue),
            };
        if (selectedAsset === "XRP" && !amountDrops) {
            res.status(400).json({ error: "amountDrops is required for XRP payments." });
            return;
        }
        const payload = await callXaman("/payload", {
            method: "POST",
            body: JSON.stringify({
                txjson: {
                    TransactionType: "Payment",
                    Account: account,
                    Destination: destination ?? fallbackDonationDestination,
                    Amount: amount,
                    Memos: memoType && memoData
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
                options: { submit: true, force_network: "TESTNET" },
            }),
        });
        res.json(mapPayloadCreateResponse(payload));
    }
    catch (error) {
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
                options: { submit: true, force_network: "TESTNET" },
            }),
        });
        res.json(mapPayloadCreateResponse(payload));
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "Payload status 조회 실패" });
    }
});
app.get("/api/xrpl/tx/:hash", async (req, res) => {
    const hash = req.params.hash;
    const client = new xrpl_1.Client(xrplTestnetWs);
    try {
        await client.connect();
        const tx = await client.request({
            command: "tx",
            transaction: hash,
        });
        const validated = Boolean(tx.result?.validated);
        res.json({
            hash,
            validated,
            explorerUrl: `https://testnet.xrpl.org/transactions/${hash}`,
            result: tx.result,
        });
    }
    catch (error) {
        res.status(500).json({
            hash,
            validated: false,
            explorerUrl: `https://testnet.xrpl.org/transactions/${hash}`,
            error: error instanceof Error ? error.message : "트랜잭션 조회 실패",
        });
    }
    finally {
        if (client.isConnected()) {
            await client.disconnect();
        }
    }
});
app.get("/api/xrpl/account/:address", async (req, res) => {
    const address = req.params.address;
    const client = new xrpl_1.Client(xrplTestnetWs);
    try {
        await client.connect();
        const accountInfo = await client.request({
            command: "account_info",
            account: address,
            ledger_index: "validated",
        });
        const result = accountInfo.result;
        const balanceDrops = String(result?.account_data?.Balance ?? "0");
        const balanceXrp = (Number(balanceDrops) / 1000000).toFixed(6);
        const sequence = Number(result?.account_data?.Sequence ?? 0);
        res.json({
            address,
            balanceDrops,
            balanceXrp,
            sequence,
        });
    }
    catch (error) {
        res.status(500).json({
            address,
            error: error instanceof Error ? error.message : "계정 조회 실패",
        });
    }
    finally {
        if (client.isConnected()) {
            await client.disconnect();
        }
    }
});
// ── DB: 사용자 upsert (지갑 연결 시 호출) ──────────────────────────────
app.get("/api/xrpl/account/:address/assets", async (req, res) => {
    const address = req.params.address;
    const client = new xrpl_1.Client(xrplTestnetWs);
    try {
        await client.connect();
        const lines = await client.request({
            command: "account_lines",
            account: address,
            ledger_index: "validated",
        });
        const balances = (lines.result?.lines ?? []).map((line) => ({
            currency: line.currency,
            displayCurrency: fromXrplCurrencyCode(String(line.currency)),
            issuer: line.account,
            balance: line.balance,
            limit: line.limit,
        }));
        res.json({
            address,
            balances,
            assets: listAssets(),
        });
    }
    catch (error) {
        res.status(500).json({
            address,
            error: error instanceof Error ? error.message : "Issued currency balance lookup failed",
        });
    }
    finally {
        if (client.isConnected()) {
            await client.disconnect();
        }
    }
});
app.get("/api/xrpl/account/:address/trustlines", async (req, res) => {
    const address = req.params.address;
    const client = new xrpl_1.Client(xrplTestnetWs);
    try {
        if (!(0, xrpl_1.isValidClassicAddress)(address)) {
            res.status(400).json({ error: "address must be a valid XRPL classic address." });
            return;
        }
        await client.connect();
        const lines = await client.request({
            command: "account_lines",
            account: address,
            ledger_index: "validated",
        });
        const balances = (lines.result?.lines ?? []).map((line) => ({
            currency: line.currency,
            displayCurrency: fromXrplCurrencyCode(String(line.currency)),
            issuer: line.account,
            balance: line.balance,
            limit: line.limit,
        }));
        const trustlines = ["RLUSD", "USDC"].map((asset) => {
            const config = issuedAssetConfig[asset];
            const xrplCurrency = toXrplCurrencyCode(config.currency);
            const line = balances.find((balance) => balance.issuer === config.issuer && balance.currency === xrplCurrency);
            return {
                asset,
                issuer: config.issuer || null,
                configured: Boolean(config.issuer),
                ready: Boolean(line),
                balance: line?.balance ?? null,
                limit: line?.limit ?? null,
            };
        });
        res.json({ address, trustlines });
    }
    catch (error) {
        res.status(500).json({
            address,
            error: error instanceof Error ? error.message : "TrustLine lookup failed",
        });
    }
    finally {
        if (client.isConnected()) {
            await client.disconnect();
        }
    }
});
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
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "사용자 저장 실패" });
    }
});
// ── DB: 기부 기록 저장 ─────────────────────────────────────────────────
app.post("/api/db/donations", async (req, res) => {
    try {
        const { xrplAccount, amountKrw, allocations, txHash, explorerUrl, receiptId, evidenceHash, complianceHash, asset, amountAsset } = req.body ?? {};
        if (!xrplAccount || !amountKrw || !allocations) {
            res.status(400).json({ error: "xrplAccount, amountKrw, allocations는 필수입니다." });
            return;
        }
        const user = await prisma.user.upsert({
            where: { xrplAccount },
            update: {},
            create: { xrplAccount },
        });
        if (txHash) {
            const existing = await prisma.donation.findFirst({
                where: { userId: user.id, txHash },
            });
            if (existing) {
                res.json(existing);
                return;
            }
        }
        const allocationPayload = {
            items: allocations,
            meta: {
                receiptId: receiptId ?? null,
                evidenceHash: evidenceHash ?? null,
                complianceHash: complianceHash ?? null,
                asset: asset ?? null,
                amountAsset: amountAsset ?? null,
            },
        };
        const donation = await prisma.donation.create({
            data: {
                userId: user.id,
                amountKrw: Number(amountKrw),
                allocations: allocationPayload,
                paymentStatus: "paid",
                proofStatus: txHash ? "recorded" : "pending",
                nftStatus: txHash ? "minted" : "pending",
                txHash: txHash ?? null,
                explorerUrl: explorerUrl ?? null,
                validationStatus: txHash ? "validated" : "pending",
            },
        });
        res.json(donation);
    }
    catch (error) {
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
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "기부 조회 실패" });
    }
});
app.get("/api/db/donation-by-tx/:txHash", async (req, res) => {
    try {
        const donation = await prisma.donation.findFirst({
            where: { txHash: req.params.txHash },
        });
        if (!donation) {
            res.status(404).json({ error: "Donation not found" });
            return;
        }
        res.json(donation);
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "투표 집계 실패" });
    }
});
// ── 프로덕션: dist/ 정적 파일 서빙 ────────────────────────────────────
if (shouldServeStaticDist) {
    const distPath = path_1.default.resolve(process.cwd(), "dist");
    app.use(express_1.default.static(distPath));
    app.get("/{*splat}", (_req, res) => {
        res.sendFile(path_1.default.join(distPath, "index.html"));
    });
}
app.listen(port, () => {
    console.log(`[truve-api] listening on http://localhost:${port}`);
});
