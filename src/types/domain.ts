export type ID = string;

export type FoundationCategory =
  | "education"
  | "environment"
  | "healthcare"
  | "human-rights"
  | "animal-welfare"
  | "disaster-relief";

export interface Foundation {
  id: ID;
  name: string;
  description: string;
  category: FoundationCategory;
  region: string;
  trustScore: number; // 0-100
  isVerified: boolean;
}

export interface BundleItem {
  foundationId: ID;
  defaultWeight: number;
}

export interface DonationBundle {
  id: ID;
  name: string;
  description: string;
  items: BundleItem[];
}

export interface CartItem {
  foundationId: ID;
  foundationName: string;
}

export type AllocationMap = Record<ID, number>;

export type DonationStep = "payment-complete" | "hash-recorded" | "nft-minted" | "settled";

export interface DonationStatusItem {
  id: ID;
  createdAtISO: string;
  amountKRW: number;
  step: DonationStep;
  txHash?: string;
  nftId?: string;
}

export interface UserStatus {
  userId: ID;
  walletAddress?: string;
  donorTier: "seed" | "sprout" | "forest";
  totalDonatedKRW: number;
  recentStatuses: DonationStatusItem[];
}

export interface FiltersState {
  query: string;
  categories: FoundationCategory[];
  regions: string[];
  verifiedOnly: boolean;
  minTrustScore: number;
  selectedBundleId?: ID;
}

export interface AppState {
  cart: CartItem[];
  allocation: AllocationMap;
  userStatus: UserStatus;
  filters: FiltersState;
}

export const initialAppState: AppState = {
  cart: [],
  allocation: {},
  userStatus: {
    userId: "guest",
    donorTier: "seed",
    totalDonatedKRW: 0,
    recentStatuses: [],
  },
  filters: {
    query: "",
    categories: [],
    regions: [],
    verifiedOnly: false,
    minTrustScore: 0,
  },
};
