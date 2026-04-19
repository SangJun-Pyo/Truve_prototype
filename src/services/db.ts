const BASE = "/api/db";

export interface DbDonation {
  id: string;
  userId: string;
  donatedAt: string;
  amountKrw: number;
  allocations: unknown;
  paymentStatus: string;
  proofStatus: string;
  nftStatus: string;
  settlementStatus: string;
  txHash: string | null;
  proofNftId: string | null;
  explorerUrl: string | null;
  validationStatus: string;
}

export interface DbVoteTally {
  candidateId: string;
  candidateName: string;
  _sum: { weight: number | null };
}

async function post(path: string, body: unknown): Promise<Response> {
  return fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function upsertDbUser(xrplAccount: string, displayName?: string): Promise<void> {
  try {
    await post("/users", { xrplAccount, displayName });
  } catch {
    // DB 저장 실패해도 UI 흐름은 계속
  }
}

export async function saveDbDonation(params: {
  xrplAccount: string;
  amountKrw: number;
  allocations: unknown;
  txHash?: string;
  explorerUrl?: string;
}): Promise<DbDonation | null> {
  try {
    const res = await post("/donations", params);
    if (!res.ok) return null;
    return res.json() as Promise<DbDonation>;
  } catch {
    return null;
  }
}

export async function patchDbDonation(id: string, patch: Record<string, unknown>): Promise<void> {
  try {
    await fetch(`${BASE}/donations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
  } catch {
    // silent
  }
}

export async function fetchDbDonations(xrplAccount: string): Promise<DbDonation[]> {
  try {
    const res = await fetch(`${BASE}/donations/${encodeURIComponent(xrplAccount)}`);
    if (!res.ok) return [];
    return res.json() as Promise<DbDonation[]>;
  } catch {
    return [];
  }
}

export async function saveDbVote(params: {
  xrplAccount: string;
  proposalId: string;
  candidateId: string;
  candidateName: string;
  weight: number;
  txHash?: string;
}): Promise<void> {
  try {
    await post("/governance", params);
  } catch {
    // silent
  }
}

export async function fetchDbVoteTally(proposalId: string): Promise<DbVoteTally[]> {
  try {
    const res = await fetch(`${BASE}/governance/${encodeURIComponent(proposalId)}`);
    if (!res.ok) return [];
    return res.json() as Promise<DbVoteTally[]>;
  } catch {
    return [];
  }
}
