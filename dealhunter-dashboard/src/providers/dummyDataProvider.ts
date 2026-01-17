import type {
  BaseRecord,
  CrudFilters,
  CrudSorting,
  DataProvider,
  HttpError,
} from "@refinedev/core";

export type DealStatus = "active" | "expired" | "pending";

export type Deal = BaseRecord & {
  id: number;
  title: string;
  price: number;
  originalPrice: number;
  storeName: string;
  imageUrl: string;
  status: DealStatus;
  clicks: number;
  createdAt: string;
  affiliateLink: string;
};

export type User = BaseRecord & {
  id: number;
  username: string;
  email: string;
  role: "admin" | "user";
  status: "active" | "banned";
};

export type Store = BaseRecord & {
  id: number;
  name: string;
  affiliateStatus: "active" | "inactive";
};

export type StatSummary = BaseRecord & {
  id: number;
  revenue: number;
  totalDeals: number;
  activeUsers: number;
  pendingApprovals: number;
};

const deals: Deal[] = [
  {
    id: 1,
    title: "AirPods Pro (2nd Gen)",
    price: 199,
    originalPrice: 249,
    storeName: "Apple Store",
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=60",
    status: "active",
    clicks: 823,
    createdAt: "2025-12-26T09:15:00Z",
    affiliateLink: "https://example.com/airpods-pro",
  },
  {
    id: 2,
    title: "PS5 Slim + Spider-Man 2 Bundle",
    price: 499,
    originalPrice: 569,
    storeName: "GameHub",
    imageUrl:
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=400&q=60",
    status: "pending",
    clicks: 664,
    createdAt: "2025-12-25T15:40:00Z",
    affiliateLink: "https://example.com/ps5-bundle",
  },
  {
    id: 3,
    title: "Kindle Paperwhite Signature Edition",
    price: 149,
    originalPrice: 189,
    storeName: "MegaMart",
    imageUrl:
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=400&q=60",
    status: "active",
    clicks: 412,
    createdAt: "2025-12-24T11:10:00Z",
    affiliateLink: "https://example.com/kindle-signature",
  },
  {
    id: 4,
    title: "Samsung Galaxy Watch 6",
    price: 229,
    originalPrice: 299,
    storeName: "Techtonic",
    imageUrl:
      "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=400&q=60",
    status: "pending",
    clicks: 501,
    createdAt: "2025-12-22T18:25:00Z",
    affiliateLink: "https://example.com/galaxy-watch-6",
  },
  {
    id: 5,
    title: "Dyson V15 Detect Absolute",
    price: 599,
    originalPrice: 749,
    storeName: "HomePro",
    imageUrl:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=60",
    status: "expired",
    clicks: 188,
    createdAt: "2025-12-20T10:05:00Z",
    affiliateLink: "https://example.com/dyson-v15",
  },
  {
    id: 6,
    title: "Nintendo Switch OLED",
    price: 289,
    originalPrice: 349,
    storeName: "PixelPlay",
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=60",
    status: "active",
    clicks: 954,
    createdAt: "2025-12-19T12:45:00Z",
    affiliateLink: "https://example.com/switch-oled",
  },
  {
    id: 7,
    title: "Sonos Era 100 Speaker",
    price: 199,
    originalPrice: 249,
    storeName: "SoundSquare",
    imageUrl:
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=400&q=60",
    status: "pending",
    clicks: 298,
    createdAt: "2025-12-18T16:00:00Z",
    affiliateLink: "https://example.com/sonos-era-100",
  },
  {
    id: 8,
    title: "GoPro HERO12 Black",
    price: 349,
    originalPrice: 449,
    storeName: "AdventureCo",
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=60",
    status: "active",
    clicks: 377,
    createdAt: "2025-12-17T07:30:00Z",
    affiliateLink: "https://example.com/gopro-hero12",
  },
  {
    id: 9,
    title: "LG C3 55\" OLED Smart TV",
    price: 1299,
    originalPrice: 1799,
    storeName: "VisionWorld",
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=60",
    status: "expired",
    clicks: 221,
    createdAt: "2025-12-15T21:55:00Z",
    affiliateLink: "https://example.com/lg-c3",
  },
  {
    id: 10,
    title: "Instant Pot Duo Crisp Ultimate",
    price: 169,
    originalPrice: 229,
    storeName: "KitchenWorks",
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=60",
    status: "active",
    clicks: 543,
    createdAt: "2025-12-14T13:20:00Z",
    affiliateLink: "https://example.com/instant-pot",
  },
];

const users: User[] = [
  {
    id: 1,
    username: "dealboss",
    email: "admin@dealhunter.com",
    role: "admin",
    status: "active",
  },
  {
    id: 2,
    username: "couponqueen",
    email: "couponqueen@example.com",
    role: "user",
    status: "active",
  },
  {
    id: 3,
    username: "techstack",
    email: "techstack@example.com",
    role: "user",
    status: "active",
  },
  {
    id: 4,
    username: "flashhunter",
    email: "flashhunter@example.com",
    role: "user",
    status: "banned",
  },
  {
    id: 5,
    username: "savingsage",
    email: "savingsage@example.com",
    role: "admin",
    status: "active",
  },
];

const stores: Store[] = [
  { id: 1, name: "Apple Store", affiliateStatus: "active" },
  { id: 2, name: "GameHub", affiliateStatus: "active" },
  { id: 3, name: "MegaMart", affiliateStatus: "inactive" },
  { id: 4, name: "Techtonic", affiliateStatus: "active" },
  { id: 5, name: "HomePro", affiliateStatus: "inactive" },
];

const stats: StatSummary[] = [
  {
    id: 1,
    revenue: 48230,
    totalDeals: deals.length,
    activeUsers: users.filter((user) => user.status === "active").length,
    pendingApprovals: deals.filter((deal) => deal.status === "pending").length,
  },
];

const dataStore: { deals: Deal[]; users: User[]; stores: Store[]; stats: StatSummary[] } = { deals, users, stores, stats };

type ResourceName = keyof typeof dataStore;

const httpError = (message: string, statusCode = 404): HttpError => ({
  message,
  statusCode,
});

const assertResourceName = (resource: string): ResourceName => {
  if (resource in dataStore) {
    return resource as ResourceName;
  }

  throw httpError(`Resource ${resource} not found`);
};

const cloneRecord = <T extends BaseRecord>(record: T): T =>
  JSON.parse(JSON.stringify(record));

const applyFilters = <T extends BaseRecord>(
  data: T[],
  filters?: CrudFilters
): T[] => {
  if (!filters || filters.length === 0) {
    return data;
  }

  return filters.reduce<T[]>((acc, filter) => {
    if ("field" in filter && filter.operator) {
      return acc.filter((record) => {
        const value = record[filter.field as keyof T];
        if (filter.operator === "eq") {
          return value === filter.value;
        }

        if (filter.operator === "contains") {
          if (value === undefined || value === null) {
            return false;
          }

          return String(value)
            .toLowerCase()
            .includes(String(filter.value ?? "").toLowerCase());
        }

        return true;
      });
    }

    return acc;
  }, data);
};

const applySorting = <T extends BaseRecord>(
  data: T[],
  sorters?: CrudSorting
): T[] => {
  if (!sorters || sorters.length === 0) {
    return data;
  }

  const sorted = [...data];

  sorted.sort((a, b) => {
    for (const sorter of sorters) {
      const field = sorter.field as keyof T;
      const aValue = a[field];
      const bValue = b[field];

      if (aValue === bValue) {
        continue;
      }

      const order = sorter.order === "desc" ? -1 : 1;

      if (aValue === undefined || aValue === null) {
        return -order;
      }

      if (bValue === undefined || bValue === null) {
        return order;
      }

      if (aValue > bValue) {
        return order;
      }

      if (aValue < bValue) {
        return -order;
      }
    }

    return 0;
  });

  return sorted;
};

const ensureRecord = (resource: ResourceName, id: BaseRecord["id"]) => {
  const collection = dataStore[resource];
  const record = collection.find((item) => String(item.id) === String(id));

  if (!record) {
    throw httpError(`${resource} record ${id} not found`);
  }

  return record;
};

const computeNextId = (collection: BaseRecord[]) => {
  const numericIds = collection
    .map((item) => Number(item.id))
    .filter((value) => Number.isFinite(value));

  if (numericIds.length === 0) {
    return 1;
  }

  return Math.max(...numericIds) + 1;
};

export const dummyDataProvider = {
  getList: async ({ resource, pagination, filters, sorters }: any) => {
    const resourceName = assertResourceName(resource);
    const collection = dataStore[resourceName] as unknown as BaseRecord[];

    const filtered = applyFilters([...collection], filters);
    const sorted = applySorting(filtered, sorters);

    const current = (pagination as any)?.current ?? 1;
    const pageSize = (pagination as any)?.pageSize ?? sorted.length;
    const start = (current - 1) * pageSize;
    const end = start + pageSize;

    const data = sorted.slice(start, end).map(cloneRecord);

    return {
      data,
      total: filtered.length,
    };
  },
  getOne: async ({ resource, id }: any) => {
    const resourceName = assertResourceName(resource);
    const record = ensureRecord(resourceName, id);

    return { data: cloneRecord(record) };
  },
  getMany: async ({ resource, ids }: any) => {
    const resourceName = assertResourceName(resource);
    const data = (ids as any[]).map((id) => cloneRecord(ensureRecord(resourceName, id)));

    return { data };
  },
  create: async ({ resource, variables }: any) => {
    const resourceName = assertResourceName(resource);
    const collection = dataStore[resourceName] as unknown as BaseRecord[];

    const newRecord = {
      id: variables?.id ?? computeNextId(collection),
      ...variables,
    } as BaseRecord;

    (collection as any[]).push(newRecord as any);

    return { data: cloneRecord(newRecord) };
  },
  createMany: async ({ resource, variables }: any) => {
    const responses = await Promise.all(
      ((variables ?? []) as any[]).map((item) =>
        (dummyDataProvider as any).create({ resource, variables: item })
      )
    );

    return { data: responses.map((response) => response.data) };
  },
  update: async ({ resource, id, variables }: any) => {
    const resourceName = assertResourceName(resource);
    const collection = dataStore[resourceName] as unknown as BaseRecord[];
    const index = collection.findIndex((item) => String(item.id) === String(id));

    if (index === -1) {
      throw httpError(`${resource} record ${id} not found`);
    }

    const updated = { ...collection[index], ...variables };
    collection[index] = updated;

    return { data: cloneRecord(updated) };
  },
  updateMany: async ({ resource, ids, variables }: any) => {
    const results = await Promise.all(
      (ids as any[]).map((id) =>
        (dummyDataProvider as any)
          .update({ resource, id, variables })
          .then((res: any) => res.data)
      )
    );

    return { data: results };
  },
  deleteOne: async ({ resource, id }: any) => {
    const resourceName = assertResourceName(resource);
    const collection = dataStore[resourceName] as unknown as BaseRecord[];
    const index = collection.findIndex((item) => String(item.id) === String(id));

    if (index === -1) {
      throw httpError(`${resource} record ${id} not found`);
    }

    const [removed] = collection.splice(index, 1);

    return { data: cloneRecord(removed) };
  },
  deleteMany: async ({ resource, ids }: any) => {
    const responses = await Promise.all(
      (ids as any[]).map((id) => (dummyDataProvider as any).deleteOne({ resource, id }))
    );

    return { data: responses.map((response) => response.data) };
  },
  getApiUrl: () => "",
  custom: async () => ({ data: [] }),
} as unknown as DataProvider;

export default dummyDataProvider as DataProvider;
