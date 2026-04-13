import type {
  DonationPreview,
  DonationReceipt,
  DonationRepository,
  DonationRequest,
  DonationRecord,
  Foundation,
  FoundationFilters,
  FoundationRepository,
  UserDonationStatus,
  UserProfile,
  UserRepository,
} from "../interfaces";
import type { MockSeedData } from "./mockDataLoader";

export interface MockRepositories {
  foundationRepository: FoundationRepository;
  donationRepository: DonationRepository;
  userRepository: UserRepository;
}

export interface MockRepositoryOptions {
  latencyMs?: number;
  now?: () => Date;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function applyFoundationFilters(
  foundations: Foundation[],
  filters?: FoundationFilters,
): Foundation[] {
  if (!filters) {
    return foundations;
  }

  return foundations.filter((foundation) => {
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const searchable = `${foundation.name} ${foundation.description} ${foundation.tags.join(" ")}`.toLowerCase();
      if (!searchable.includes(q)) {
        return false;
      }
    }

    if (
      filters.categories &&
      filters.categories.length > 0 &&
      !filters.categories.includes(foundation.category)
    ) {
      return false;
    }

    if (
      filters.regions &&
      filters.regions.length > 0 &&
      !filters.regions.includes(foundation.region)
    ) {
      return false;
    }

    if (
      filters.tags &&
      filters.tags.length > 0 &&
      !filters.tags.every((tag) => foundation.tags.includes(tag))
    ) {
      return false;
    }

    if (
      typeof filters.minProofCoveragePct === "number" &&
      foundation.trustMetrics.proofCoveragePct < filters.minProofCoveragePct
    ) {
      return false;
    }

    return true;
  });
}

function ensureAllocationTotal(allocations: DonationRequest["allocations"]): void {
  const total = allocations.reduce((sum, item) => sum + item.ratioPct, 0);
  if (total !== 100) {
    throw new Error(`Allocation must sum to 100. Received: ${total}`);
  }
}

function buildDonationPreview(input: DonationRequest): DonationPreview {
  const estimatedFeeKrw = Math.round(input.amountKrw * 0.006); // 0.6% for demo

  return {
    amountKrw: input.amountKrw,
    estimatedFeeKrw,
    allocations: input.allocations.map((allocation) => ({
      foundationId: allocation.foundationId,
      ratioPct: allocation.ratioPct,
      amountKrw: Math.round((input.amountKrw * allocation.ratioPct) / 100),
    })),
  };
}

class MockFoundationRepository implements FoundationRepository {
  constructor(
    private readonly seedData: MockSeedData,
    private readonly latencyMs: number,
  ) {}

  async list(filters?: FoundationFilters): Promise<Foundation[]> {
    await delay(this.latencyMs);
    return applyFoundationFilters(this.seedData.foundations, filters);
  }

  async getById(id: string): Promise<Foundation | null> {
    await delay(this.latencyMs);
    return this.seedData.foundations.find((foundation) => foundation.id === id) ?? null;
  }

  async listBundles() {
    await delay(this.latencyMs);
    return this.seedData.bundles;
  }
}

class MockDonationRepository implements DonationRepository {
  constructor(
    private readonly seedData: MockSeedData,
    private readonly latencyMs: number,
    private readonly now: () => Date,
  ) {}

  async previewDonation(input: DonationRequest): Promise<DonationPreview> {
    await delay(this.latencyMs);
    ensureAllocationTotal(input.allocations);
    return buildDonationPreview(input);
  }

  async submitDonation(input: DonationRequest): Promise<DonationReceipt> {
    await delay(this.latencyMs);
    ensureAllocationTotal(input.allocations);

    const donationId = `dnt_${Math.random().toString(36).slice(2, 10)}`;
    const txHash = `tx_${Math.random().toString(16).slice(2, 18)}`;
    const proofNftId = `proof_${Math.random().toString(36).slice(2, 10)}`;
    const createdAt = this.now().toISOString();

    const record: DonationRecord = {
      id: donationId,
      userId: input.userId,
      donatedAt: createdAt,
      amountKrw: input.amountKrw,
      allocations: input.allocations,
      paymentStatus: "paid",
      proofStatus: "recorded",
      nftStatus: "minted",
      settlementStatus: "scheduled",
      txHash,
      proofNftId,
    };
    this.seedData.donations.unshift(record);

    return { donationId, txHash, proofNftId, createdAt };
  }

  async listDonationsByUser(userId: string): Promise<DonationRecord[]> {
    await delay(this.latencyMs);
    return this.seedData.donations.filter((donation) => donation.userId === userId);
  }
}

class MockUserRepository implements UserRepository {
  constructor(
    private readonly seedData: MockSeedData,
    private readonly latencyMs: number,
  ) {}

  async getProfile(userId: string): Promise<UserProfile | null> {
    await delay(this.latencyMs);
    return this.seedData.users.find((user) => user.id === userId) ?? null;
  }

  async getDonationStatus(userId: string): Promise<UserDonationStatus | null> {
    await delay(this.latencyMs);
    const user = this.seedData.users.find((candidate) => candidate.id === userId);
    if (!user) {
      return null;
    }

    const userDonations = this.seedData.donations.filter((entry) => entry.userId === userId);
    const total = userDonations.reduce((sum, entry) => sum + entry.amountKrw, 0);
    const sorted = [...userDonations].sort((a, b) => (a.donatedAt < b.donatedAt ? 1 : -1));

    return {
      userId,
      totalDonationsKrw: total,
      donationCount: userDonations.length,
      lastDonationAt: sorted[0]?.donatedAt,
      currentTier: user.tier,
    };
  }
}

export function createMockRepositories(
  seedData: MockSeedData,
  options: MockRepositoryOptions = {},
): MockRepositories {
  const latencyMs = options.latencyMs ?? 120;
  const now = options.now ?? (() => new Date());

  return {
    foundationRepository: new MockFoundationRepository(seedData, latencyMs),
    donationRepository: new MockDonationRepository(seedData, latencyMs, now),
    userRepository: new MockUserRepository(seedData, latencyMs),
  };
}

