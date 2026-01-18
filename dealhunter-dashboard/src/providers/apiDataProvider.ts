import type { DataProvider } from "@refinedev/core";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Get token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem("refine-auth");
};

// Make authenticated request
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  console.log("[apiDataProvider] Making request to:", url);
  console.log("[apiDataProvider] Token present:", !!token);

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

    console.log("[apiDataProvider] Response status:", response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      console.error("[apiDataProvider] Error:", error);
      throw new Error(error.message || "Request failed");
    }

    const data = await response.json();
    console.log("[apiDataProvider] Response data:", data);
    return data;
  } catch (err) {
    console.error("[apiDataProvider] Fetch error:", err);
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
    const data = await fetchWithAuth(url);
    return { data };
  },

  create: async ({ resource, variables }) => {
    const url = `${API_URL}/${resource}`;
    const data = await fetchWithAuth(url, {
      method: "POST",
      body: JSON.stringify(variables),
    });
    return { data };
  },

  update: async ({ resource, id, variables }) => {
    const url = `${API_URL}/${resource}/${id}`;
    const data = await fetchWithAuth(url, {
      method: "PATCH",
      body: JSON.stringify(variables),
    });
    return { data };
  },

  deleteOne: async ({ resource, id }) => {
    const url = `${API_URL}/${resource}/${id}`;
    await fetchWithAuth(url, { method: "DELETE" });
    return { data: { id } as any };
  },

  getApiUrl: () => API_URL,

  // Custom methods for pending deals workflow
  custom: async ({ url, method, payload }) => {
    const fullUrl = url.startsWith("http") ? url : `${API_URL}${url}`;
    const data = await fetchWithAuth(fullUrl, {
      method: method || "GET",
      body: payload ? JSON.stringify(payload) : undefined,
    });
    return { data };
  },

  getMany: async ({ resource, ids }) => {
    const results = await Promise.all(
      ids.map((id) => fetchWithAuth(`${API_URL}/${resource}/${id}`))
    );
    return { data: results };
  },

  createMany: async ({ resource, variables }) => {
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
    await Promise.all(
      ids.map((id) =>
        fetchWithAuth(`${API_URL}/${resource}/${id}`, { method: "DELETE" })
      )
    );
    return { data: ids.map((id) => ({ id })) as any };
  },
};

export default apiDataProvider;
