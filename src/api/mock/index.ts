import type { MockDataLoaderOptions } from "./mockDataLoader";
import { loadMockSeedData } from "./mockDataLoader";
import {
  createMockRepositories,
  type MockRepositories,
  type MockRepositoryOptions,
} from "./repositories";

export interface CreateMockApiOptions extends MockDataLoaderOptions, MockRepositoryOptions {}

export async function createMockApi(
  options: CreateMockApiOptions = {},
): Promise<MockRepositories> {
  const seedData = await loadMockSeedData(options);
  return createMockRepositories(seedData, options);
}

