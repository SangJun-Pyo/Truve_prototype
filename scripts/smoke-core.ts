type Asset = "XRP" | "RLUSD" | "USDC";

interface DonationLike {
  id: string;
  amountKrw: number;
  asset?: Asset;
  amountAsset?: number;
  credentialStatus?: "issued" | "accept_pending" | "accepted" | "failed";
  proofMintStatus?: "none" | "evidence_ready" | "credential_issued" | "credential_accept_pending" | "credential_accepted" | "credential_failed";
  credentialAcceptTxHash?: string;
  credentialAcceptExplorerUrl?: string;
}

interface CredentialLookupLike {
  accepted: boolean;
  previousTxId?: string | null;
}

interface AllocationPayload {
  items?: unknown[];
  meta?: Record<string, unknown>;
}

const ASSET_KRW_RATES: Record<Asset, number> = {
  XRP: 1000,
  RLUSD: 1400,
  USDC: 1400,
};

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${String(expected)}, got ${String(actual)}`);
  }
}

function getDisplayAssetAmount(donation: DonationLike): number {
  if (!donation.asset) return donation.amountKrw;
  if (typeof donation.amountAsset === "number" && Number.isFinite(donation.amountAsset)) {
    return donation.amountAsset;
  }
  return donation.amountKrw / ASSET_KRW_RATES[donation.asset];
}

function calculateTokenDistribution(donations: DonationLike[]): Record<string, { amount: number; krw: number }> {
  return donations.reduce<Record<string, { amount: number; krw: number }>>((totals, donation) => {
    const asset = donation.asset ?? "KRW";
    const current = totals[asset] ?? { amount: 0, krw: 0 };
    totals[asset] = {
      amount: current.amount + getDisplayAssetAmount(donation),
      krw: current.krw + donation.amountKrw,
    };
    return totals;
  }, {});
}

function applyAcceptedCredentialLookup(donation: DonationLike, credential: CredentialLookupLike | null): DonationLike {
  if (donation.credentialStatus === "accepted" || !credential?.accepted) {
    return donation;
  }
  const acceptTxHash = donation.credentialAcceptTxHash ?? credential.previousTxId ?? undefined;
  return {
    ...donation,
    credentialStatus: "accepted",
    proofMintStatus: "credential_accepted",
    credentialAcceptTxHash: acceptTxHash,
    credentialAcceptExplorerUrl:
      donation.credentialAcceptExplorerUrl ??
      (acceptTxHash ? `https://testnet.xrpl.org/transactions/${encodeURIComponent(acceptTxHash)}` : ""),
  };
}

function mergeCredentialPatch(existingAllocations: AllocationPayload | unknown[], credentialPatch: Record<string, unknown>): AllocationPayload {
  const existingItems = Array.isArray(existingAllocations) ? existingAllocations : (existingAllocations.items ?? []);
  const existingMeta = Array.isArray(existingAllocations) ? {} : (existingAllocations.meta ?? {});
  const existingCredential = (existingMeta.credential ?? {}) as Record<string, unknown>;
  return {
    items: existingItems,
    meta: {
      ...existingMeta,
      credential: {
        ...existingCredential,
        ...credentialPatch,
      },
    },
  };
}

function testTokenDistribution(): void {
  const totals = calculateTokenDistribution([
    { id: "a", amountKrw: 14000, asset: "RLUSD", amountAsset: 10 },
    { id: "b", amountKrw: 7000, asset: "USDC" },
    { id: "c", amountKrw: 3000 },
  ]);
  assertEqual(totals.RLUSD.amount, 10, "RLUSD token amount should use recorded asset amount");
  assertEqual(totals.RLUSD.krw, 14000, "RLUSD KRW total should sum donation KRW");
  assertEqual(totals.USDC.amount, 5, "USDC token amount should fall back to fixed KRW rate");
  assertEqual(totals.KRW.amount, 3000, "Legacy KRW rows should stay as KRW amount");
}

function testCredentialSync(): void {
  const synced = applyAcceptedCredentialLookup(
    {
      id: "dnt_1",
      amountKrw: 1400,
      asset: "RLUSD",
      credentialStatus: "accept_pending",
      proofMintStatus: "credential_accept_pending",
    },
    { accepted: true, previousTxId: "ABC123" },
  );
  assertEqual(synced.credentialStatus, "accepted", "Accepted ledger credential should update status");
  assertEqual(synced.proofMintStatus, "credential_accepted", "Accepted ledger credential should update proof status");
  assertEqual(synced.credentialAcceptTxHash, "ABC123", "Accepted ledger credential should preserve previous tx as accept hash");
  assert(
    synced.credentialAcceptExplorerUrl === "https://testnet.xrpl.org/transactions/ABC123",
    "Accepted ledger credential should build an explorer link",
  );
}

function testDonationCredentialPatchMerge(): void {
  const merged = mergeCredentialPatch(
    {
      items: [{ foundationId: "goodneighbors", ratioPct: 100 }],
      meta: {
        receiptId: "receipt_1",
        credential: {
          issuer: "rIssuer",
          status: "accept_pending",
        },
      },
    },
    {
      status: "accepted",
      acceptTxHash: "ACCEPT_TX",
    },
  );
  assertEqual(merged.items?.length, 1, "Donation patch should preserve allocation items");
  assertEqual(merged.meta?.receiptId, "receipt_1", "Donation patch should preserve existing metadata");
  const credential = merged.meta?.credential as Record<string, unknown>;
  assertEqual(credential.issuer, "rIssuer", "Donation patch should preserve existing credential issuer");
  assertEqual(credential.status, "accepted", "Donation patch should overwrite credential status");
  assertEqual(credential.acceptTxHash, "ACCEPT_TX", "Donation patch should add accept tx hash");
}

const tests = [
  ["token distribution", testTokenDistribution],
  ["credential sync", testCredentialSync],
  ["donation credential patch merge", testDonationCredentialPatchMerge],
] as const;

for (const [name, test] of tests) {
  test();
  console.log(`ok - ${name}`);
}

console.log(`smoke:core passed (${tests.length} checks)`);
