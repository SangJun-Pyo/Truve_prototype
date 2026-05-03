import type { DonationRecord } from "../api";

const DONATION_STORAGE_KEY = "truve_local_donations_v2";

export interface LocalDonationRecord extends DonationRecord {
  source: "mock" | "local";
  dbId?: string;
}

function loadStoredDonations(): LocalDonationRecord[] {
  const raw = localStorage.getItem(DONATION_STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw) as LocalDonationRecord[];
  } catch {
    return [];
  }
}

function saveStoredDonations(records: LocalDonationRecord[]): void {
  localStorage.setItem(DONATION_STORAGE_KEY, JSON.stringify(records));
}

export function listLocalDonations(userId: string): LocalDonationRecord[] {
  return loadStoredDonations().filter((item) => item.userId === userId);
}

export function listWalletLocalDonations(userId: string, xrplAccount: string): LocalDonationRecord[] {
  return loadStoredDonations().filter(
    (item) => item.userId === userId && item.xrplAccount === xrplAccount,
  );
}

export function upsertLocalDonation(record: LocalDonationRecord): void {
  const records = loadStoredDonations();
  const index = records.findIndex((item) => item.id === record.id);
  if (index >= 0) {
    records[index] = record;
  } else {
    records.unshift(record);
  }
  saveStoredDonations(records);
}

export function patchLocalDonation(
  donationId: string,
  patch: Partial<LocalDonationRecord>,
): LocalDonationRecord | null {
  const records = loadStoredDonations();
  const index = records.findIndex((item) => item.id === donationId);
  if (index < 0) {
    return null;
  }
  const next = {
    ...records[index],
    ...patch,
  };
  records[index] = next;
  saveStoredDonations(records);
  return next;
}

export function mergeDonationRecords(
  baseRecords: DonationRecord[],
  userId: string,
): LocalDonationRecord[] {
  const base = baseRecords
    .filter((item) => item.userId === userId)
    .map((item) => ({ ...item, source: "mock" as const }));
  const local = listLocalDonations(userId);

  const map = new Map<string, LocalDonationRecord>();
  [...base, ...local].forEach((record) => {
    map.set(record.id, record);
  });

  return [...map.values()].sort((a, b) => (a.donatedAt < b.donatedAt ? 1 : -1));
}
