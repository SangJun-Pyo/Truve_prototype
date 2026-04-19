const GOVERNANCE_STORAGE_KEY = "truve_governance_records_v1";

export interface GovernanceVoteRecord {
  id: string;
  userId: string;
  proposalId: string;
  candidateId: string;
  candidateName: string;
  weight: number;
  txHash?: string;
  explorerUrl?: string;
  validationStatus: "pending" | "signed" | "validated" | "failed";
  createdAt: string;
}

function loadRecords(): GovernanceVoteRecord[] {
  const raw = localStorage.getItem(GOVERNANCE_STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw) as GovernanceVoteRecord[];
  } catch {
    return [];
  }
}

function saveRecords(records: GovernanceVoteRecord[]): void {
  localStorage.setItem(GOVERNANCE_STORAGE_KEY, JSON.stringify(records));
}

export function listGovernanceRecords(userId: string): GovernanceVoteRecord[] {
  return loadRecords().filter((record) => record.userId === userId);
}

export function upsertGovernanceRecord(record: GovernanceVoteRecord): void {
  const records = loadRecords();
  const index = records.findIndex((item) => item.id === record.id);
  if (index >= 0) {
    records[index] = record;
  } else {
    records.unshift(record);
  }
  saveRecords(records);
}
