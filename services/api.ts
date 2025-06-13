import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  BookingFormData,
  Lesson,
  LoginResponseDto,
  LoginUserDto,
  RegisterResponseDTO,
  RegisterUserDto,
  Registration,
  Scenario,
  Session,
  User,
  TokenData,
  ApiErrorResponse,
} from "@/types";

// Base API URL
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
// const API_URL = "http://137.184.48.203/api";

// Token management helpers
export const getTokenData = async (): Promise<TokenData | null> => {
  try {
    const tokenDataString = await AsyncStorage.getItem("auth_token_data");
    if (!tokenDataString) return null;
    
    const tokenData: TokenData = JSON.parse(tokenDataString);
    
    // Check if token is expired
    if (Date.now() >= tokenData.expires_at) {
      await AsyncStorage.removeItem("auth_token_data");
      return null;
    }
    
    return tokenData;
  } catch (error) {
    console.error("Error getting token data:", error);
    return null;
  }
};

export const saveTokenData = async (loginResponse: LoginResponseDto): Promise<void> => {
  try {
    const tokenData: TokenData = {
      access_token: loginResponse.data.access_token,
      refresh_token: loginResponse.data.refresh_token,
      expires_in: loginResponse.data.expires_in,
      token_type: loginResponse.data.token_type,
      expires_at: Date.now() + (loginResponse.data.expires_in * 1000), // Convert to milliseconds
    };
    
    await AsyncStorage.setItem("auth_token_data", JSON.stringify(tokenData));
  } catch (error) {
    console.error("Error saving token data:", error);
    throw new Error("Failed to save authentication data");
  }
};

export const getToken = async (): Promise<string | null> => {
  const tokenData = await getTokenData();
  return tokenData ? tokenData.access_token : null;
};

// Generic API request handler with error handling and timeout
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

  try {
    // Do not include Authorization header for login or registration
    const isAuthEndpoint = endpoint === "/auth/local/sign-in" ||
      endpoint === "/auth/local/sign-up" ||
      endpoint.startsWith("/auth/");
    
    const token = isAuthEndpoint ? null : await getToken();

    const headers = {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    console.log("API URL:", API_URL)

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 401 || response.status === 403) {
        // Clear invalid token
        await AsyncStorage.removeItem("auth_token_data");
        throw new Error(
          `Authentication failed (${response.status}): Please log in again`,
        );
      }

      if (response.status === 404) {
        throw new Error("Resource not found");
      }

      if (response.status >= 500) {
        throw new Error("Server error. Please try again later.");
      }

      // Try to get error message from response
      try {
        const errorData: ApiErrorResponse = await response.json();
        throw new Error(
          errorData.message ||
            `HTTP ${response.status}: ${response.statusText}`,
        );
      } catch {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    }

    // Handle empty responses
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const rawText = await response.clone().text();
      const json = JSON.parse(rawText || "{}");
      return json;
    } else {
      return {}; // Return empty object for non-JSON responses
    }
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("Request timeout");
      }
      // Re-throw our custom errors
      throw error;
    }

    console.error("API request failed:", error);
    throw error;
  }
};

// Helper to refresh token when needed
export const refreshAuthToken = async (): Promise<boolean> => {
  try {
    const tokenData = await getTokenData();
    if (!tokenData || !tokenData.refresh_token) {
      return false;
    }

    const response = await apiRequest("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({
        refresh_token: tokenData.refresh_token,
      }),
    });

    if (response && response.data) {
      await saveTokenData(response);
      return true;
    }

    return false;
  } catch (error) {
    console.error("Token refresh failed:", error);
    await AsyncStorage.removeItem("auth_token_data");
    return false;
  }
};

// Helper function to convert backend user to frontend User format
export const convertBackendUser = (backendUser: any, role?: any): User => {
  // Split name into firstName and lastName if needed
  const nameParts = backendUser.name ? backendUser.name.split(" ") : ["", ""];
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  return {
    id: backendUser.id,
    name: backendUser.name,
    email: backendUser.email,
    created_at: backendUser.created_at,
    updated_at: backendUser.updated_at,
    deleted_at: backendUser.deleted_at,
    // Computed properties for frontend compatibility
    role: role,
    // Additional fields with defaults
  };
};






// Admin Dashboard API (keeping existing structure)
export const adminAPI = {
  // Users management
  users: {
    getAll: async (): Promise<User[]> => {
      const response = await apiRequest("/admin-dashboard/users");
      return response.data ? response.data.map((user: any) => convertBackendUser(user)) : response;
    },

    getById: async (id: string): Promise<User> => {
      const response = await apiRequest(`/admin-dashboard/users/${id}`);
      return response.data ? convertBackendUser(response.data) : response;
    },

    updateName: async (
      id: string,
      firstName: string,
      lastName: string,
    ): Promise<User> => {
      const response = await apiRequest(`/admin-dashboard/users/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: `${firstName} ${lastName}`,
        }),
      });
      return response.data ? convertBackendUser(response.data) : response;
    },

    delete: async (id: string): Promise<void> => {
      return apiRequest(`/admin-dashboard/users/${id}`, {
        method: "DELETE",
      });
    },
  },

  // Sessions management (keeping existing structure)
  sessions: {
    getAll: async (): Promise<Session[]> => {
      return apiRequest("/admin-dashboard/sessions");
    },

    getById: async (id: string): Promise<Session> => {
      return apiRequest(`/admin-dashboard/sessions/${id}`);
    },

    create: async (session: Partial<Session>): Promise<Session> => {
      return apiRequest("/admin-dashboard/sessions", {
        method: "POST",
        body: JSON.stringify(session),
      });
    },

    delete: async (id: string): Promise<void> => {
      return apiRequest(`/admin-dashboard/sessions/${id}`, {
        method: "DELETE",
      });
    },
  },

  // Registrations management (keeping existing structure)
  registrations: {
    getAll: async (): Promise<Registration[]> => {
      return apiRequest("/admin-dashboard/registrations");
    },

    getById: async (id: string): Promise<Registration> => {
      return apiRequest(`/admin-dashboard/registrations/${id}`);
    },

    delete: async (id: string): Promise<void> => {
      return apiRequest(`/admin-dashboard/registrations/${id}`, {
        method: "DELETE",
      });
    },
  },
};



// Webhook API (keeping existing structure)
export const webhookAPI = {
  processPayment: async (paymentData: any): Promise<any> => {
    return apiRequest("/webhook/payments", {
      method: "POST",
      body: JSON.stringify(paymentData),
    });
  },
};

// Error types for better error handling
export interface ApiError {
  status: number;
  message: string;
}

export const isApiError = (error: any): error is ApiError => {
  return error && typeof error.status === "number" &&
    typeof error.message === "string";
};