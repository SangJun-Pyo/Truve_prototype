import type {
  DonationBundle,
  DonationRecord,
  Foundation,
  UserProfile,
} from "../interfaces";

export interface MockSeedData {
  foundations: Foundation[];
  bundles: DonationBundle[];
  donations: DonationRecord[];
  users: UserProfile[];
}

export interface MockDataLoaderOptions {
  basePath?: string;
  fetchImpl?: typeof fetch;
}

async function loadJson<T>(fetchImpl: typeof fetch, path: string): Promise<T> {
  const response = await fetchImpl(path);
  if (!response.ok) {
    throw new Error(`Failed to load mock JSON: ${path} (${response.status})`);
  }
  return (await response.json()) as T;
}

let cachedSeedData: MockSeedData | null = null;

export async function loadMockSeedData(
  options: MockDataLoaderOptions = {},
): Promise<MockSeedData> {
  if (cachedSeedData) {
    return cachedSeedData;
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  const basePath = options.basePath ?? "/src/mocks";

  const [foundations, bundles, donations, users] = await Promise.all([
    loadJson<Foundation[]>(fetchImpl, `${basePath}/foundations.json`),
    loadJson<DonationBundle[]>(fetchImpl, `${basePath}/bundles.json`),
    loadJson<DonationRecord[]>(fetchImpl, `${basePath}/donations.json`),
    loadJson<UserProfile[]>(fetchImpl, `${basePath}/users.json`),
  ]);

  cachedSeedData = { foundations, bundles, donations, users };
  return cachedSeedData;
}

export function resetMockSeedCache(): void {
  cachedSeedData = null;
}

