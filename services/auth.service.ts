import type {
  LoginResponseDto,
  RegisterResponseDTO,
  RegisterUserDto,
  User,
  ForgotPasswordDto,
  ResetPasswordDto,
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
        passwordConfirmation: userData.password,
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
      // if (!response.data || !response.data.access_token) {
      //   throw new Error(
      //     "Invalid registration response: No access token received"
      //   );
      // }

      // Save token data
      // await saveTokenData(response);

      return response;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  refreshToken: async (): Promise<boolean> => {
    return refreshAuthToken();
  },

  forgotPassword: async (email: string): Promise<void> => {
    try {
      const payload: ForgotPasswordDto = { email };
      await apiRequest("/auth/local/forgot-password", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      throw error;
    }
  },

  resetPassword: async (data: ResetPasswordDto): Promise<void> => {
    try {
      await apiRequest("/auth/local/reset-password", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("Reset password error:", error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      // Clear local storage
      await AsyncStorage.removeItem("auth_token_data");
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear local storage on error
      await AsyncStorage.removeItem("auth_token_data");
    }
  },
};
