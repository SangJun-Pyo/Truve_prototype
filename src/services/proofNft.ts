import { createMemoPayload, waitForPayloadResolution } from "./xaman";
import { waitForTxValidation } from "./xrpl";

export interface ProofNftRequestInput {
  account: string;
  donationId: string;
  donationTxHash: string;
}

export interface ProofNftRequestResult {
  txHash?: string;
  explorerUrl?: string;
  validated: boolean;
}

function toHex(input: string): string {
  return Array.from(new TextEncoder().encode(input))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

export async function requestProofNftMintScaffold(
  input: ProofNftRequestInput,
): Promise<ProofNftRequestResult> {
  const memoData = toHex(
    JSON.stringify({
      app: "TRUVE",
      type: "PROOF_NFT_MINT_REQUEST",
      donationId: input.donationId,
      donationTxHash: input.donationTxHash,
      createdAt: new Date().toISOString(),
    }).slice(0, 230),
  );

  const payload = await createMemoPayload({
    account: input.account,
    destination: "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe",
    amountDrops: "1",
    memoType: "TRUVE_PROOF_NFT_REQ",
    memoData,
  });

  const signed = await waitForPayloadResolution(payload.uuid);
  if (!signed.signed || !signed.txHash) {
    return { validated: false };
  }

  const validated = await waitForTxValidation(signed.txHash);
  return {
    txHash: signed.txHash,
    explorerUrl: validated.explorerUrl,
    validated: validated.validated,
  };
}
