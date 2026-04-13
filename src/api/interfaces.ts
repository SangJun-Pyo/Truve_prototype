export type FoundationCategory =
  | "climate"
  | "education"
  | "health"
  | "animal"
  | "humanitarian";

export interface TrustMetrics {
  auditedAt: string;
  proofCoveragePct: number;
  updateCadenceDays: number;
  verificationLevel: "basic" | "verified" | "premium";
}

export interface Foundation {
  id: string;
  name: string;
  category: FoundationCategory;
  region: string;
  description: string;
  tags: string[];
  trustMetrics: TrustMetrics;
}

export interface BundleAllocation {
  foundationId: string;
  ratioPct: number;
}

export interface DonationBundle {
  id: string;
  name: string;
  summary: string;
  theme: string;
  allocations: BundleAllocation[];
}

export interface DonationRequest {
  userId: string;
  amountKrw: number;
  allocations: BundleAllocation[];
}

export interface DonationPreview {
  amountKrw: number;
  estimatedFeeKrw: number;
  allocations: Array<{
    foundationId: string;
    ratioPct: number;
    amountKrw: number;
  }>;
}

export interface DonationRecord {
  id: string;
  userId: string;
  donatedAt: string;
  amountKrw: number;
  allocations: BundleAllocation[];
  paymentStatus: "paid" | "pending" | "failed";
  proofStatus: "recorded" | "pending" | "error";
  nftStatus: "minted" | "pending" | "error";
  settlementStatus: "scheduled" | "done" | "error";
  txHash?: string;
  proofNftId?: string;
}

export interface DonationReceipt {
  donationId: string;
  txHash: string;
  proofNftId: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  tier: "seed" | "sprout" | "forest";
  joinedAt: string;
}

export interface UserDonationStatus {
  userId: string;
  totalDonationsKrw: number;
  donationCount: number;
  lastDonationAt?: string;
  currentTier: "seed" | "sprout" | "forest";
}

export interface FoundationFilters {
  query?: string;
  categories?: FoundationCategory[];
  regions?: string[];
  tags?: string[];
  minProofCoveragePct?: number;
}

export interface FoundationRepository {
  list(filters?: FoundationFilters): Promise<Foundation[]>;
  getById(id: string): Promise<Foundation | null>;
  listBundles(): Promise<DonationBundle[]>;
}

export interface DonationRepository {
  previewDonation(input: DonationRequest): Promise<DonationPreview>;
  submitDonation(input: DonationRequest): Promise<DonationReceipt>;
  listDonationsByUser(userId: string): Promise<DonationRecord[]>;
}

export interface UserRepository {
  getProfile(userId: string): Promise<UserProfile | null>;
  getDonationStatus(userId: string): Promise<UserDonationStatus | null>;
}

