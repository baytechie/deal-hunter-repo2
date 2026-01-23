// Test setup for Node environment
// Mock localStorage for Node environment
const localStorageMock = {
  getItem: (key: string) => localStorageMock.store[key] || null,
  setItem: (key: string, value: string) => { localStorageMock.store[key] = value; },
  removeItem: (key: string) => { delete localStorageMock.store[key]; },
  clear: () => { localStorageMock.store = {}; },
  store: {} as Record<string, string>,
};

// @ts-ignore
global.localStorage = localStorageMock;

// Mock import.meta.env
// @ts-ignore
global.import = {
  meta: {
    env: {
      VITE_API_URL: 'http://localhost:3000',
    },
  },
};
