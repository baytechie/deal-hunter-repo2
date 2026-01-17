import type { AuthProvider } from "@refinedev/core";
import { TOKEN_KEY } from "./constants";

// Hardcoded credentials for authentication
const VALID_CREDENTIALS = [
  { email: "admin@dealhunter.com", password: "admin123", name: "Admin User", role: "admin" },
  { email: "user@dealhunter.com", password: "user123", name: "Regular User", role: "user" },
  { email: "demo@refine.dev", password: "demodemo", name: "Demo User", role: "admin" },
];

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    const user = VALID_CREDENTIALS.find(
      (cred) => cred.email === email && cred.password === password
    );

    if (user) {
      localStorage.setItem(TOKEN_KEY, JSON.stringify(user));
      return {
        success: true,
        redirectTo: "/",
      };
    }

    return {
      success: false,
      error: {
        name: "LoginError",
        message: "Invalid email or password",
      },
    };
  },
  logout: async () => {
    localStorage.removeItem(TOKEN_KEY);
    return {
      success: true,
      redirectTo: "/login",
    };
  },
  check: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      redirectTo: "/login",
    };
  },
  getPermissions: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      const user = JSON.parse(token);
      return user.role;
    }
    return null;
  },
  getIdentity: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      const user = JSON.parse(token);
      return {
        id: 1,
        name: user.name,
        avatar: "https://i.pravatar.cc/300",
      };
    }
    return null;
  },
  onError: async (error) => {
    console.error(error);
    return { error };
  },
};
