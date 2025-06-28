import type {
  LoginResponseDto,
  RegisterResponseDTO,
  RegisterUserDto,
  User,
} from "@/types";
import {
  apiRequest,
  convertBackendUser,
  getTokenData,
  refreshAuthToken,
  saveTokenData,
} from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Auth API
export const authAPI = {
  login: async (email: string, password: string): Promise<LoginResponseDto> => {
    try {
      const response: LoginResponseDto = await apiRequest(
        "/auth/local/sign-in",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        }
      );

      // Validate response structure
      if (!response.data || !response.data.access_token) {
        throw new Error("Invalid login response: No access token received");
      }

      // Save token data
      await saveTokenData(response);

      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  register: async (userData: RegisterUserDto): Promise<RegisterResponseDTO> => {
    try {
      // Convert userData to match backend expectations
      const backendUserData = {
        email: userData.email,
        password: userData.password,
        name: `${userData.name}`,
      };

      const response: RegisterResponseDTO = await apiRequest(
        "/auth/local/sign-up",
        {
          method: "POST",
          body: JSON.stringify(backendUserData),
        }
      );

      // Validate response structure
      if (!response.data || !response.data.access_token) {
        throw new Error(
          "Invalid registration response: No access token received"
        );
      }

      // Save token data
      await saveTokenData(response);

      return response;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },


  refreshToken: async (): Promise<boolean> => {
    return refreshAuthToken();
  },

  logout: async (): Promise<void> => {
    try {
      const tokenData = await getTokenData();

      if (tokenData) {
        // Optional: Call logout endpoint to invalidate token on server
        try {
          await apiRequest("/auth/logout", {
            method: "POST",
            // body: JSON.stringify({
            //   refresh_token: tokenData.refresh_token,
            // }),
          });
        } catch (error) {
          console.warn("Server logout failed:", error);
          // Continue with local logout even if server logout fails
        }
      }

      // Clear local storage
      await AsyncStorage.removeItem("auth_token_data");
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear local storage on error
      await AsyncStorage.removeItem("auth_token_data");
    }
  },
};
