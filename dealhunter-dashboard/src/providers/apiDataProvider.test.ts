import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock import.meta.env before importing the module
vi.stubGlobal('import', {
  meta: {
    env: {
      VITE_API_URL: 'http://localhost:3000',
    },
  },
});

// Mock the logger service
vi.mock('../services/logger', () => ({
  createContextLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

// Import after mocks are set up
const { apiDataProvider } = await import('./apiDataProvider');

describe('apiDataProvider', () => {
  const mockFetch = vi.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = mockFetch;
    mockFetch.mockClear();
    localStorage.clear();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('getList', () => {
    it('should fetch a list of resources with pagination', async () => {
      const mockResponse = {
        data: [
          { id: '1', title: 'Deal 1' },
          { id: '2', title: 'Deal 2' },
        ],
        total: 2,
        page: 1,
        limit: 10,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiDataProvider.getList!({
        resource: 'deals',
        pagination: { currentPage: 1, pageSize: 10 },
        filters: [],
        sorters: [],
        meta: {},
      });

      expect(result.data).toEqual(mockResponse.data);
      expect(result.total).toBe(2);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/deals?page=1&limit=10'),
        expect.any(Object)
      );
    });

    it('should apply filters to the request', async () => {
      const mockResponse = { data: [], total: 0 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await apiDataProvider.getList!({
        resource: 'deals',
        pagination: { currentPage: 1, pageSize: 10 },
        filters: [{ field: 'category', operator: 'eq', value: 'Electronics' }],
        sorters: [],
        meta: {},
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('category=Electronics'),
        expect.any(Object)
      );
    });

    it('should apply sorting to the request', async () => {
      const mockResponse = { data: [], total: 0 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await apiDataProvider.getList!({
        resource: 'deals',
        pagination: { currentPage: 1, pageSize: 10 },
        filters: [],
        sorters: [{ field: 'price', order: 'desc' }],
        meta: {},
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('sortField=price'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('sortOrder=DESC'),
        expect.any(Object)
      );
    });

    it('should handle array response', async () => {
      const mockResponse = [
        { id: '1', title: 'Deal 1' },
        { id: '2', title: 'Deal 2' },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiDataProvider.getList!({
        resource: 'deals',
        pagination: { currentPage: 1, pageSize: 10 },
        filters: [],
        sorters: [],
        meta: {},
      });

      expect(result.data).toEqual(mockResponse);
      expect(result.total).toBe(2);
    });
  });

  describe('getOne', () => {
    it('should fetch a single resource by id', async () => {
      const mockDeal = { id: '123', title: 'Test Deal', price: 50 };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDeal),
      });

      const result = await apiDataProvider.getOne!({
        resource: 'deals',
        id: '123',
        meta: {},
      });

      expect(result.data).toEqual(mockDeal);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/deals/123'),
        expect.any(Object)
      );
    });
  });

  describe('create', () => {
    it('should create a new resource', async () => {
      const newDeal = { title: 'New Deal', price: 100 };
      const createdDeal = { id: '123', ...newDeal };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createdDeal),
      });

      const result = await apiDataProvider.create!({
        resource: 'deals',
        variables: newDeal,
        meta: {},
      });

      expect(result.data).toEqual(createdDeal);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/deals'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(newDeal),
        })
      );
    });
  });

  describe('update', () => {
    it('should update an existing resource', async () => {
      const updateData = { title: 'Updated Deal' };
      const updatedDeal = { id: '123', title: 'Updated Deal', price: 100 };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(updatedDeal),
      });

      const result = await apiDataProvider.update!({
        resource: 'deals',
        id: '123',
        variables: updateData,
        meta: {},
      });

      expect(result.data).toEqual(updatedDeal);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/deals/123'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(updateData),
        })
      );
    });
  });

  describe('deleteOne', () => {
    it('should delete a resource', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const result = await apiDataProvider.deleteOne!({
        resource: 'deals',
        id: '123',
        meta: {},
      });

      expect(result.data.id).toBe('123');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/deals/123'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('getApiUrl', () => {
    it('should return the API URL', () => {
      const url = apiDataProvider.getApiUrl();
      expect(url).toBeDefined();
      expect(typeof url).toBe('string');
    });
  });

  describe('authentication', () => {
    it('should include auth token in requests when available', async () => {
      localStorage.setItem('refine-auth', 'test-token');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [], total: 0 }),
      });

      await apiDataProvider.getList!({
        resource: 'deals',
        pagination: { currentPage: 1, pageSize: 10 },
        filters: [],
        sorters: [],
        meta: {},
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });
  });

  describe('error handling', () => {
    it('should throw error on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ message: 'Resource not found' }),
      });

      await expect(
        apiDataProvider.getOne!({
          resource: 'deals',
          id: 'non-existent',
          meta: {},
        })
      ).rejects.toThrow('Resource not found');
    });
  });

  describe('custom', () => {
    it('should make custom API requests', async () => {
      const customResponse = { status: 'ok' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(customResponse),
      });

      const result = await apiDataProvider.custom!({
        url: '/pending-deals/123/approve',
        method: 'post',
        payload: { isHot: true },
        meta: {},
      });

      expect(result.data).toEqual(customResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/pending-deals/123/approve'),
        expect.objectContaining({
          method: 'post',
          body: JSON.stringify({ isHot: true }),
        })
      );
    });
  });
});
