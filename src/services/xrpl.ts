import { API_BASE } from "./apiBase";

export interface XrplTxStatus {
  hash: string;
  validated: boolean;
  explorerUrl: string;
}

export interface XrplAccountInfo {
  address: string;
  balanceDrops: string;
  balanceXrp: string;
  sequence?: number;
}

export interface XrplAssetConfig {
  asset: "XRP" | "RLUSD" | "USDC";
  label: string;
  native: boolean;
  configured: boolean;
  currency?: string;
  displayCurrency?: string;
  issuer?: string | null;
}

export interface XrplIssuedBalance {
  currency: string;
  displayCurrency: string;
  issuer: string;
  balance: string;
  limit: string;
}

export interface XrplAssetConfigResponse {
  network: string;
  assets: XrplAssetConfig[];
}

export interface XrplAccountAssetsResponse {
  address: string;
  balances: XrplIssuedBalance[];
  assets: XrplAssetConfig[];
}

export interface XrplDonationDestination {
  network: string;
  address: string;
  label: string;
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
  const response = await fetch(`${API_BASE}/api/xrpl/tx/${txHash}`);
  return parseJsonOrThrow(response);
}

export async function fetchAccountInfo(address: string): Promise<XrplAccountInfo> {
  const response = await fetch(`${API_BASE}/api/xrpl/account/${address}`);
  return parseJsonOrThrow(response);
}

export async function fetchXrplAssets(): Promise<XrplAssetConfigResponse> {
  const response = await fetch(`${API_BASE}/api/xrpl/assets`);
  return parseJsonOrThrow(response);
}

export async function fetchAccountAssetBalances(address: string): Promise<XrplAccountAssetsResponse> {
  const response = await fetch(`${API_BASE}/api/xrpl/account/${encodeURIComponent(address)}/assets`);
  return parseJsonOrThrow(response);
}

export async function fetchDonationDestination(): Promise<XrplDonationDestination> {
  const response = await fetch(`${API_BASE}/api/xrpl/donation-destination`);
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
