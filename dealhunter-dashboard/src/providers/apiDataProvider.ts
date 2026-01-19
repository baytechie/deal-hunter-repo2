import type { DataProvider } from "@refinedev/core";
import { createContextLogger } from "../services/logger";

const log = createContextLogger('DataProvider');

// Use environment variable for API URL with fallback for development
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Get token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem("refine-auth");
};

// Make authenticated request
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  log.debug("Making request", { url, tokenPresent: !!token });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    log.debug("Response received", { url, status: response.status });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      log.error("Request failed", { url, status: response.status, error });
      throw new Error(error.message || "Request failed");
    }

    const data = await response.json();
    log.debug("Response data", { url, dataType: Array.isArray(data) ? 'array' : typeof data });
    return data;
  } catch (err) {
    log.error("Fetch error", { url, error: err instanceof Error ? err.message : String(err) });
    throw err;
  }
};

export const apiDataProvider: DataProvider = {
  getList: async ({ resource, pagination, filters, sorters: _sorters }) => {
    // Note: pagination in refine v5+ uses pageSize, not current
    const current = (pagination as any)?.current ?? 1;
    const pageSize = pagination?.pageSize ?? 10;

    // Map resource names to API endpoints
    let endpoint = resource;
    if (resource === "pending-deals") {
      endpoint = "pending-deals";
    }

    // Build query params
    const params = new URLSearchParams();
    params.append("page", String(current));
    params.append("limit", String(pageSize));

    // Apply filters
    if (filters) {
      filters.forEach((filter) => {
        if ("field" in filter && filter.value !== undefined) {
          params.append(filter.field, String(filter.value));
        }
      });
    }

    const url = `${API_URL}/${endpoint}?${params.toString()}`;
    log.info("Fetching list", { resource, page: current, pageSize });
    const result = await fetchWithAuth(url);

    // Handle paginated response from NestJS
    if (result.data && result.total !== undefined) {
      return {
        data: result.data,
        total: result.total,
      };
    }

    // Handle array response
    if (Array.isArray(result)) {
      return {
        data: result,
        total: result.length,
      };
    }

    return {
      data: result.data || [],
      total: result.total || 0,
    };
  },

  getOne: async ({ resource, id }) => {
    const url = `${API_URL}/${resource}/${id}`;
    log.info("Fetching one", { resource, id });
    const data = await fetchWithAuth(url);
    return { data };
  },

  create: async ({ resource, variables }) => {
    const url = `${API_URL}/${resource}`;
    log.info("Creating resource", { resource });
    const data = await fetchWithAuth(url, {
      method: "POST",
      body: JSON.stringify(variables),
    });
    return { data };
  },

  update: async ({ resource, id, variables }) => {
    const url = `${API_URL}/${resource}/${id}`;
    log.info("Updating resource", { resource, id });
    const data = await fetchWithAuth(url, {
      method: "PATCH",
      body: JSON.stringify(variables),
    });
    return { data };
  },

  deleteOne: async ({ resource, id }) => {
    const url = `${API_URL}/${resource}/${id}`;
    log.info("Deleting resource", { resource, id });
    await fetchWithAuth(url, { method: "DELETE" });
    return { data: { id } as any };
  },

  getApiUrl: () => API_URL,

  // Custom methods for pending deals workflow
  custom: async ({ url, method, payload }) => {
    const fullUrl = url.startsWith("http") ? url : `${API_URL}${url}`;
    log.info("Custom request", { url: fullUrl, method });
    const data = await fetchWithAuth(fullUrl, {
      method: method || "GET",
      body: payload ? JSON.stringify(payload) : undefined,
    });
    return { data };
  },

  getMany: async ({ resource, ids }) => {
    log.info("Fetching many", { resource, count: ids.length });
    const results = await Promise.all(
      ids.map((id) => fetchWithAuth(`${API_URL}/${resource}/${id}`))
    );
    return { data: results };
  },

  createMany: async ({ resource, variables }) => {
    log.info("Creating many", { resource, count: variables.length });
    const results = await Promise.all(
      variables.map((item) =>
        fetchWithAuth(`${API_URL}/${resource}`, {
          method: "POST",
          body: JSON.stringify(item),
        })
      )
    );
    return { data: results };
  },

  updateMany: async ({ resource, ids, variables }) => {
    log.info("Updating many", { resource, count: ids.length });
    const results = await Promise.all(
      ids.map((id) =>
        fetchWithAuth(`${API_URL}/${resource}/${id}`, {
          method: "PATCH",
          body: JSON.stringify(variables),
        })
      )
    );
    return { data: results };
  },

  deleteMany: async ({ resource, ids }) => {
    log.info("Deleting many", { resource, count: ids.length });
    await Promise.all(
      ids.map((id) =>
        fetchWithAuth(`${API_URL}/${resource}/${id}`, { method: "DELETE" })
      )
    );
    return { data: ids.map((id) => ({ id })) as any };
  },
};

export default apiDataProvider;
