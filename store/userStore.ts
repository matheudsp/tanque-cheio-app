import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LoginResponseDto, RegisterUserDto, User } from "@/types";
import { authAPI } from "@/services/auth.service";

import { notificationService } from "@/hooks/useNotifications";

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Actions
  login: (email: string, password:string) => Promise<void>;
  register: (userData: RegisterUserDto) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  updatePreferences: (preferences: User["preferences"]) => Promise<void>;
  checkAuthStatus: () => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
}

const convertLoginResponseToUser = (loginResponse: LoginResponseDto): User => {
  
  const { user, role } = loginResponse.data;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    created_at: user.created_at,
    updated_at: user.updated_at,
    deleted_at: user.deleted_at,
    role: role,
  };
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response: LoginResponseDto = await authAPI.login(
            email,
            password
          );

          if (
            !response.data ||
            !response.data.access_token ||
            !response.data.user
          ) {
            throw new Error("Resposta de login inválida");
          }

          const userData = convertLoginResponseToUser(response);

          set({
            user: userData,
            isLoading: false,
            isAuthenticated: true,
            error: null,
          });

          console.log("Login bem-sucedido:", userData.email);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "E-mail ou senha inválidos";
          
        
          notificationService.error({
            title: 'Falha no Login',
            description: errorMessage,
          });

          console.error("Erro no login:", error);
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
            user: null,
          });
          throw error;
        }
      },

      
      register: async (userData: RegisterUserDto) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.register(userData);

          // Validate response structure
          if (
            !response.data ||
            !response.data.access_token ||
            !response.data.user
          ) {
            throw new Error("Invalid registration response format");
          }

          // Convert backend response to frontend user format
          const newUser = convertLoginResponseToUser(response);

          set({
            user: newUser,
            isLoading: false,
            isAuthenticated: true,
            error: null,
          });

          console.log("Registration successful:", newUser.email);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Não foi possível criar a conta. Tente novamente.";
          
          notificationService.error({
            title: 'Falha no Cadastro',
            description: errorMessage,
          });

          console.error("Registration error:", error);
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
            user: null,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authAPI.logout();

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });

          console.log("Logout successful");
        } catch (error) {
          console.error("Logout error:", error);
          // Even if logout fails on server, clear local state
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      updateProfile: async (userData: Partial<User>) => {
        set({ isLoading: true, error: null });
        try {
          // only local, need create endpoint in api

          set((state) => {
            if (!state.user) return state;

            const updatedUser = { ...state.user, ...userData };

            return {
              ...state,
              user: updatedUser,
              isLoading: false,
            };
          });

          console.log("Profile updated locally");
        } catch (error) {
          console.error("Profile update error:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to update profile",
            isLoading: false,
          });
          throw error;
        }
      },

      updateUser: async (userData: Partial<User>) => {
        // Alias for updateProfile for backward compatibility
        return get().updateProfile(userData);
      },

      refreshToken: async () => {
        try {
          const success = await authAPI.refreshToken();
          if (!success) {
            // If refresh fails, logout user
            set({
              user: null,
              isAuthenticated: false,
              error: "Session expired. Please log in again.",
            });
          }
          return success;
        } catch (error) {
          console.error("Token refresh error:", error);
          set({
            user: null,
            isAuthenticated: false,
            error: "Session expired. Please log in again.",
          });
          return false;
        }
      },

      updatePreferences: async (preferences: User["preferences"]) => {
        set({ isLoading: true, error: null });
        try {
          set((state) => ({
            user: state.user
              ? {
                  ...state.user,
                  preferences: { ...state.user.preferences, ...preferences },
                }
              : null,
            isLoading: false,
          }));
        } catch (error) {
          console.error("Preferences update error:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to update preferences",
            isLoading: false,
          });
          throw error;
        }
      },

      checkAuthStatus: async () => {
        set({ isLoading: true });
        try {
          // Check if we have valid token in storage
          const tokenDataString = await AsyncStorage.getItem("auth_token_data");

          if (!tokenDataString) {
            set({ isAuthenticated: false, isLoading: false });
            return false;
          }

          const tokenData = JSON.parse(tokenDataString);

          // Check if token is expired
          if (Date.now() >= tokenData.expires_at) {
            console.log("Token expired, attempting refresh");
            const refreshSuccess = await get().refreshToken();
            if (!refreshSuccess) {
              set({ isAuthenticated: false, isLoading: false });
              return false;
            }
          }

          // If we have a valid token but no user data, try to get current user
          if (!get().user) {
            try {
              const userData = await authAPI.getCurrentUser();
              set({
                user: userData,
                isAuthenticated: true,
                isLoading: false,
              });
            } catch (error) {
              console.warn("Could not fetch current user data:", error);
              // Token might be valid but user endpoint not implemented
              // Keep authenticated state but without user data
              set({
                isAuthenticated: true,
                isLoading: false,
              });
            }
          } else {
            set({ isAuthenticated: true, isLoading: false });
          }

          return true;
        } catch (error) {
          console.error("Auth check error:", error);
          // Clear invalid token data
          await AsyncStorage.removeItem("auth_token_data");
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          return false;
        }
      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist user data, not loading states or errors
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);