import type { AuthProvider } from "@refinedev/core";
import { TOKEN_KEY } from "./constants";

const API_URL = "http://localhost:3000";

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    console.log("[authProvider] Login attempt for:", email);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      console.log("[authProvider] Login response status:", response.status);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error("[authProvider] Login failed:", error);
        return {
          success: false,
          error: {
            name: "LoginError",
            message: error.message || "Invalid email or password",
          },
        };
      }

      const data = await response.json();
      console.log("[authProvider] Login successful, storing token");

      // Store the JWT token
      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Verify token was stored
      const storedToken = localStorage.getItem(TOKEN_KEY);
      console.log("[authProvider] Token stored successfully:", !!storedToken);

      return {
        success: true,
        redirectTo: "/",
      };
    } catch (error) {
      console.error("[authProvider] Login error:", error);
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
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("user");
    return {
      success: true,
      redirectTo: "/login",
    };
  },

  check: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    console.log("[authProvider] Checking auth, token present:", !!token);

    if (token) {
      // Optionally verify token with backend
      try {
        const response = await fetch(`${API_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        console.log("[authProvider] Profile check response:", response.status);

        if (response.ok) {
          return { authenticated: true };
        } else {
          // Token invalid, clear it
          console.log("[authProvider] Token invalid, clearing");
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem("user");
        }
      } catch (err) {
        // Network error, clear token
        console.error("[authProvider] Profile check error:", err);
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
      return {
        logout: true,
        redirectTo: "/login",
      };
    }
    return { error };
  },
};
