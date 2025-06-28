import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LoginResponseDto, RegisterUserDto, User } from "@/types";
import { authAPI } from "@/services/auth.service";

import { toast } from "@/hooks/useToast";
import { pushNotificationService } from "@/services/push-notification.service";
import { usersAPI } from "@/services/user.service";
import { Platform } from "react-native";
import { getTokenData } from "@/services/api";

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isPremium: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterUserDto) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  updatePreferences: (preferences: User["preferences"]) => Promise<void>;
  checkAuthStatus: () => void;
  refreshToken: () => Promise<boolean>;
  setIsPremium: (isPremium: boolean) => void;
  setUser: (user: User | null) => void;
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
      isPremium: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setIsPremium: (isPremium: boolean) => {
        set({ isPremium });
      },

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

          const pushToken =
            await pushNotificationService.registerForPushNotificationsAsync();
          if (pushToken) {
            // Se obtivermos um token, o enviamos para o backend.
            await usersAPI.registerPushToken({
              token: pushToken,
              device_type: Platform.OS,
            });
          }

          // console.log("Login bem-sucedido:", userData.email);
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "E-mail ou senha inválidos";

          toast.error({
            title: "Falha no Login",
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

          const pushToken =
            await pushNotificationService.registerForPushNotificationsAsync();
          if (pushToken) {
            await usersAPI.registerPushToken({
              token: pushToken,
              device_type: Platform.OS,
            });
          }

          // console.log("Registration successful:", newUser.email);
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Não foi possível criar a conta. Tente novamente.";

          toast.error({
            title: "Falha no Cadastro",
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

          pushNotificationService.removeListeners();
        } catch (error) {
          console.error("Erro durante o processo de logout:", error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            isPremium: false,
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
        try {
          const tokenData = await getTokenData();
          if (!tokenData) {
            throw new Error("Nenhum token válido encontrado.");
          }

          // Se temos um token, tentamos buscar os dados do usuário para validar a sessão.
          const currentUser = await usersAPI.getCurrentUser();
          set({
            user: currentUser,
            isAuthenticated: true,
            error: null,
            isLoading: false,
          });
        } catch (error) {
          // Se qualquer passo falhar (token expirado, erro de rede, etc.), deslogamos o usuário.
          set({
            user: null,
            error: "Sessão inválida. Por favor, faça login novamente.",
            isAuthenticated: false,
            isLoading: false,
          });
          // Limpa o token inválido do storage
          await get().logout();
        } finally {
          set({ isLoading: false });
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
        isPremium: state.isPremium,
      }),
    }
  )
);
