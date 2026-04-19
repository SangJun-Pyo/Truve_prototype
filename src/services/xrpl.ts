export interface XrplTxStatus {
  hash: string;
  validated: boolean;
  explorerUrl: string;
}

interface WaitOptions {
  timeoutMs?: number;
  intervalMs?: number;
}

export function getTestnetExplorerLink(txHash: string): string {
  return `https://testnet.xrpl.org/transactions/${txHash}`;
}

async function parseJsonOrThrow(response: Response): Promise<any> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`XRPL 조회 오류: ${response.status} ${text}`);
  }
  return response.json();
}

export async function fetchTxStatus(txHash: string): Promise<XrplTxStatus> {
  const response = await fetch(`/api/xrpl/tx/${txHash}`);
  return parseJsonOrThrow(response);
}

export async function waitForTxValidation(
  txHash: string,
  options: WaitOptions = {},
): Promise<XrplTxStatus> {
  const timeoutMs = options.timeoutMs ?? 90_000;
  const intervalMs = options.intervalMs ?? 3_000;
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const status = await fetchTxStatus(txHash);
    if (status.validated) {
      return status;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return {
    hash: txHash,
    validated: false,
    explorerUrl: getTestnetExplorerLink(txHash),
  };
}
