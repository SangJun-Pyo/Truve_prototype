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
    const deployedWithoutApi =
      !API_BASE && !["localhost", "127.0.0.1"].includes(window.location.hostname) && response.status === 404;
    if (deployedWithoutApi) {
      throw new Error(
        "배포 페이지에서 API 서버를 찾지 못했습니다. Cloudflare Pages 빌드 환경변수 VITE_API_BASE_URL을 Railway/Express API URL로 설정하고 다시 배포해 주세요.",
      );
    }
    throw new Error(`API 오류: ${response.status} ${text}`);
  }
  return response.json();
}

async function fetchXamanApi(path: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(`${API_BASE}${path}`, init);
  } catch (error) {
    const crossOriginApi = Boolean(API_BASE) && new URL(API_BASE, window.location.href).origin !== window.location.origin;
    if (crossOriginApi) {
      throw new Error(
        "API 서버에 연결하지 못했습니다. 배포 API의 FRONTEND_ORIGIN/CORS 설정에 현재 웹 도메인이 포함되어 있는지 확인해 주세요.",
      );
    }
    throw error;
  }
}

export async function createSignInPayload(): Promise<XamanPayloadCreateResponse> {
  const response = await fetchXamanApi("/api/xaman/signin", { method: "POST" });
  return parseJsonOrThrow(response);
}

export async function createPaymentPayload(
  input: CreatePaymentPayloadInput,
): Promise<XamanPayloadCreateResponse> {
  const response = await fetchXamanApi("/api/xaman/payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJsonOrThrow(response);
}

export async function createMemoPayload(
  input: CreateMemoPayloadInput,
): Promise<XamanPayloadCreateResponse> {
  const response = await fetchXamanApi("/api/xaman/memo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJsonOrThrow(response);
}

export async function getPayloadStatus(uuid: string): Promise<XamanPayloadStatusResponse> {
  const response = await fetchXamanApi(`/api/xaman/status/${uuid}`, { method: "GET" });
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
