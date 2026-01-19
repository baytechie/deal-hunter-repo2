import type { AuthProvider } from "@refinedev/core";
import { TOKEN_KEY } from "./constants";
import { createContextLogger } from "../services/logger";

const log = createContextLogger('AuthProvider');

// Use environment variable for API URL with fallback for development
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    log.info("Login attempt", { email });
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      log.debug("Login response", { status: response.status });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        log.error("Login failed", { status: response.status, error });
        return {
          success: false,
          error: {
            name: "LoginError",
            message: error.message || "Invalid email or password",
          },
        };
      }

      const data = await response.json();
      log.info("Login successful", { userId: data.user?.id });

      // Store the JWT token
      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Verify token was stored
      const storedToken = localStorage.getItem(TOKEN_KEY);
      log.debug("Token stored", { success: !!storedToken });

      return {
        success: true,
        redirectTo: "/",
      };
    } catch (error) {
      log.error("Login error", { error: error instanceof Error ? error.message : String(error) });
      return {
        success: false,
        error: {
          name: "LoginError",
          message: "Unable to connect to server",
        },
      };
    }
  },

  logout: async () => {
    log.info("Logout");
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("user");
    return {
      success: true,
      redirectTo: "/login",
    };
  },

  check: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    log.debug("Checking auth", { tokenPresent: !!token });

    if (token) {
      // Optionally verify token with backend
      try {
        const response = await fetch(`${API_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        log.debug("Profile check response", { status: response.status });

        if (response.ok) {
          return { authenticated: true };
        } else {
          // Token invalid, clear it
          log.warn("Token invalid, clearing");
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem("user");
        }
      } catch (err) {
        // Network error, clear token
        log.error("Profile check error", { error: err instanceof Error ? err.message : String(err) });
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem("user");
      }
    }

    return {
      authenticated: false,
      redirectTo: "/login",
    };
  },

  getPermissions: async () => {
    const user = localStorage.getItem("user");
    if (user) {
      return "admin"; // All authenticated users are admins for now
    }
    return null;
  },

  getIdentity: async () => {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      return {
        id: userData.id,
        name: userData.name,
        avatar: "https://i.pravatar.cc/300",
      };
    }
    return null;
  },

  onError: async (error) => {
    if (error.status === 401) {
      log.warn("Unauthorized error, logging out");
      return {
        logout: true,
        redirectTo: "/login",
      };
    }
    log.error("Auth error", { error });
    return { error };
  },
};
