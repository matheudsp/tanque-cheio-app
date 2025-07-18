import { storage } from "@/lib/mmkv";
import {
  LoginResponseDto,
  LoginUserDto,
  RegisterResponseDTO,
  RegisterUserDto,
  User,
  TokenData,
  ApiErrorResponse,
} from "@/types";
import Constants from "expo-constants";

// Base API URL
const API_URL = Constants.expoConfig?.extra?.API_URL;
const TOKEN_DATA_KEY = "auth_token_data";
// Token management helpers
export const getTokenData = async (): Promise<TokenData | null> => {
  try {
    const tokenDataString = storage.getString(TOKEN_DATA_KEY);
    if (!tokenDataString) return null;

    const tokenData: TokenData = JSON.parse(tokenDataString);

    if (Date.now() >= tokenData.expires_at) {
      storage.delete(TOKEN_DATA_KEY);
      return null;
    }

    return tokenData;
  } catch (error) {
    console.error("Error getting token data:", error);
    return null;
  }
};

export const saveTokenData = async (
  loginResponse: LoginResponseDto
): Promise<void> => {
  try {
    const tokenData: TokenData = {
      access_token: loginResponse.data.access_token,
      refresh_token: loginResponse.data.refresh_token,
      expires_in: loginResponse.data.expires_in,
      token_type: loginResponse.data.token_type,
      expires_at: Date.now() + loginResponse.data.expires_in * 1000,
    };

    storage.set(TOKEN_DATA_KEY, JSON.stringify(tokenData));
  } catch (error) {
    console.error("Error saving token data:", error);
    throw new Error("Failed to save authentication data");
  }
};

export const getToken = async (): Promise<string | null> => {
  const tokenData = await getTokenData();
  return tokenData ? tokenData.access_token : null;
};

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
    storage.delete(TOKEN_DATA_KEY);
    return false;
  }
};

export const removeTokenData = async (): Promise<void> => {
  try {
    storage.delete(TOKEN_DATA_KEY);
  } catch (error) {
    console.error("Error removing token data:", error);
    throw error;
  }
};

// Helper function to convert backend user to frontend User format
export const convertBackendUser = (backendUser: any, role?: any): User => {
  return {
    id: backendUser.id,
    name: backendUser.name,
    email: backendUser.email,
    created_at: backendUser.created_at,
    updated_at: backendUser.updated_at,
    deleted_at: backendUser.deleted_at,
    role: role,
  };
};

// API request handler with error handling and timeout
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const isAuthEndpoint =
      endpoint.startsWith("/auth/local/") || endpoint.startsWith("/auth/");

    const token = isAuthEndpoint ? null : await getToken();
    const headers: Record<string, string> = {
      ...(options.headers instanceof Headers
        ? Object.fromEntries(options.headers.entries())
        : (options.headers as Record<string, string>)),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const hasBody = options.body !== null && options.body !== undefined;
    if (hasBody && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Se a resposta for 204 No Content (comum em DELETE), não há corpo para ler
    if (response.status === 204) {
      return; // Retorna undefined, que é um valor "vazio" válido
    }

    const responseBody = await response.json();

    if (!response.ok) {
      const errorMessage =
        responseBody.message ||
        responseBody.statusMessage ||
        `Erro HTTP: ${response.status}`;
      throw new Error(errorMessage);
    }
    if (isAuthEndpoint) {
      return responseBody;
    }
    return responseBody.data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("A requisição demorou muito para responder (timeout).");
      }
      throw error;
    }

    console.error("Falha na requisição da API:", error);
    throw new Error("Ocorreu um erro de conexão. Verifique sua internet.");
  }
};
