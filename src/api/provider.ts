import type {
  DonationRepository,
  FoundationRepository,
  UserRepository,
} from "./interfaces";
import { createMockApi } from "./mock";

export interface Repositories {
  foundationRepository: FoundationRepository;
  donationRepository: DonationRepository;
  userRepository: UserRepository;
}

export async function createRepositories(): Promise<Repositories> {
  // Prototype default: mock adapter. Replace with real API adapter in Phase 2.
  return createMockApi();
}

