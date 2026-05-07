import { API_BASE } from "./apiBase";
import type { XamanPayloadCreateResponse } from "./xaman";

export interface IssueDonationCredentialInput {
  subject: string;
  receiptId: string;
  evidenceHash: string;
  txHash: string;
}

export interface IssueDonationCredentialResponse {
  ok: boolean;
  issuer: string;
  subject: string;
  credentialType: string;
  uri: string;
  issueTxHash: string | null;
  issueValidated: boolean;
  issueAlreadyExists: boolean;
  issueExplorerUrl: string | null;
  verifiedPayment: {
    asset: string;
    amount: string;
    destination: string;
  };
  accept: XamanPayloadCreateResponse;
  message: string;
}

export async function issueDonationCredential(
  input: IssueDonationCredentialInput,
): Promise<IssueDonationCredentialResponse> {
  const response = await fetch(`${API_BASE}/api/credentials/issue`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const text = await response.text();
    try {
      const payload = JSON.parse(text) as { error?: string };
      throw new Error(payload.error ?? text);
    } catch (error) {
      if (error instanceof Error && error.message !== text) throw error;
      throw new Error(text);
    }
  }
  return response.json() as Promise<IssueDonationCredentialResponse>;
}
