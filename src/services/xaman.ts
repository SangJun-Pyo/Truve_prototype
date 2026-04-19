export interface XamanPayloadCreateResponse {
  uuid: string;
  qrPngUrl: string;
  deepLink: string;
}

export interface XamanPayloadStatusResponse {
  uuid: string;
  resolved: boolean;
  signed: boolean;
  expired?: boolean;
  account?: string;
  txHash?: string;
}

interface WaitOptions {
  timeoutMs?: number;
  intervalMs?: number;
}

interface CreatePaymentPayloadInput {
  account: string;
  destination: string;
  amountDrops: string;
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
  const response = await fetch("/api/xaman/signin", { method: "POST" });
  return parseJsonOrThrow(response);
}

export async function createPaymentPayload(
  input: CreatePaymentPayloadInput,
): Promise<XamanPayloadCreateResponse> {
  const response = await fetch("/api/xaman/payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJsonOrThrow(response);
}

export async function createMemoPayload(
  input: CreateMemoPayloadInput,
): Promise<XamanPayloadCreateResponse> {
  const response = await fetch("/api/xaman/memo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJsonOrThrow(response);
}

export async function getPayloadStatus(uuid: string): Promise<XamanPayloadStatusResponse> {
  const response = await fetch(`/api/xaman/payload/${uuid}`);
  return parseJsonOrThrow(response);
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
    if (status.resolved) {
      return status;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error("Xaman 서명 대기 시간이 초과되었습니다.");
}
