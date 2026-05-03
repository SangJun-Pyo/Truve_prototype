import { API_BASE } from "./apiBase";

export interface XamanPayloadCreateResponse {
  uuid: string;
  qrPngUrl: string;
  deepLink: string;
  qr_url?: string;
  next_url?: string;
}

export interface XamanPayloadStatusResponse {
  signed: boolean;
  uuid?: string;
  resolved?: boolean;
  expired?: boolean;
  account?: string;
  address?: string;
  txHash?: string;
}

interface WaitOptions {
  timeoutMs?: number;
  intervalMs?: number;
}

interface CreatePaymentPayloadInput {
  account: string;
  destination: string;
  asset?: "XRP" | "RLUSD" | "USDC";
  amountDrops?: string;
  amountValue?: string;
  memoType: string;
  memoData: string;
}

interface CreateMemoPayloadInput {
  account: string;
  destination: string;
  amountDrops?: string;
  memoType: string;
  memoData: string;
}

async function parseJsonOrThrow(response: Response): Promise<any> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API 오류: ${response.status} ${text}`);
  }
  return response.json();
}

export async function createSignInPayload(): Promise<XamanPayloadCreateResponse> {
  const response = await fetch(`${API_BASE}/api/xaman/signin`, { method: "POST" });
  return parseJsonOrThrow(response);
}

export async function createPaymentPayload(
  input: CreatePaymentPayloadInput,
): Promise<XamanPayloadCreateResponse> {
  const response = await fetch(`${API_BASE}/api/xaman/payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJsonOrThrow(response);
}

export async function createMemoPayload(
  input: CreateMemoPayloadInput,
): Promise<XamanPayloadCreateResponse> {
  const response = await fetch(`${API_BASE}/api/xaman/memo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJsonOrThrow(response);
}

export async function getPayloadStatus(uuid: string): Promise<XamanPayloadStatusResponse> {
  const response = await fetch(`${API_BASE}/api/xaman/status/${uuid}`);
  const status = (await parseJsonOrThrow(response)) as XamanPayloadStatusResponse;
  return {
    ...status,
    account: status.account ?? status.address,
  };
}

export async function waitForPayloadResolution(
  uuid: string,
  options: WaitOptions = {},
): Promise<XamanPayloadStatusResponse> {
  const timeoutMs = options.timeoutMs ?? 180_000;
  const intervalMs = options.intervalMs ?? 2_000;
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const status = await getPayloadStatus(uuid);
    if (status.signed || status.resolved || status.expired) {
      return status;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error("Xaman 서명 대기 시간이 초과되었습니다.");
}
