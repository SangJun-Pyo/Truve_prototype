const WALLET_STORAGE_KEY = "truve_wallet_session_v1";

export interface WalletSession {
  account: string;
  connectedAt: string;
  lastPayloadUuid?: string;
}

export function getWalletSession(): WalletSession | null {
  const raw = localStorage.getItem(WALLET_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as WalletSession;
  } catch {
    return null;
  }
}

export function setWalletSession(session: WalletSession): void {
  localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(session));
}

export function clearWalletSession(): void {
  localStorage.removeItem(WALLET_STORAGE_KEY);
}
