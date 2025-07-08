import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  LoginResponseDto,
  RegisterUserDto,
  User,
  ResetPasswordDto,
} from "@/types";
import { authAPI } from "@/services/auth.service";

import { toast } from "@/hooks/useToast";
import { pushNotificationService } from "@/services/push-notification.service";
import { usersAPI } from "@/services/user.service";
import { getTokenData } from "@/services/api";
import { mmkvStorage } from "@/lib/mmkv";

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
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (data: ResetPasswordDto) => Promise<boolean>;

  updateProfile: (userData: Partial<User>) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  updatePreferences: (preferences: User["preferences"]) => Promise<void>;
  checkAuthOnInit: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  setIsPremium: (isPremium: boolean) => void;
  togglePremiumStatus: () => void;
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

/**
 * Função auxiliar para registrar o push token.
 */
const _registerPushToken = async () => {
  try {
    const token =
      await pushNotificationService.registerForPushNotificationsAsync(); //

    if (token) {
      await usersAPI.registerPushToken({ token });
    } else {
      console.log(
        "Permissão para notificações não concedida ou token não obtido."
      );
    }
  } catch (error) {
    console.error("Erro no processo de registro do push token:", error);
  }
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
      togglePremiumStatus: () => {
        set((state) => ({ isPremium: !state.isPremium }));
        const newStatus = !get().isPremium;
        toast.info({
          title: "Status Premium Alterado",
          description: `Agora você ${
            newStatus ? "É" : "NÃO é"
          } um usuário Premium.`,
        });
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

          await _registerPushToken();

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
        if (userData.password !== userData.passwordConfirmation) {
          const errorMsg = "As senhas não coincidem.";
          toast.error({
            title: "Erro de Validação",
            description: errorMsg,
          });
          set({ error: errorMsg, isLoading: false });

          throw new Error(errorMsg);
        }
        try {
          await authAPI.register(userData);
          toast.success({
            title: "Conta Criada com Sucesso!",
            description: "Você já pode fazer o login com suas credenciais.",
          });
          set({ isLoading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Não foi possível criar a conta. Tente novamente.";

          if (
            error instanceof Error &&
            error.message !== "As senhas não coincidem."
          ) {
            toast.error({
              title: "Falha no Cadastro",
              description: errorMessage,
            });
          }

          console.error("Registration error:", error);
          set({ error: errorMessage, isLoading: false });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      forgotPassword: async (email: string): Promise<boolean> => {
        set({ isLoading: true, error: null });
        try {
          await authAPI.forgotPassword(email);
          toast.success({
            title: "Pedido Enviado",
            description:
              "Se uma conta com este e-mail existir, um código de redefinição foi enviado.",
          });
          return true;
        } catch (error: any) {
          toast.error({
            title: "Erro",
            description:
              error.message || "Não foi possível completar a solicitação.",
          });
          set({ error: error.message, isLoading: false });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      resetPassword: async (data: ResetPasswordDto): Promise<boolean> => {
        set({ isLoading: true, error: null });
        if (data.password !== data.passwordConfirmation) {
          toast.error({
            title: "Erro de Validação",
            description: "As senhas não coincidem.",
          });
          set({ error: "As senhas não coincidem.", isLoading: false });
          return false;
        }

        try {
          await authAPI.resetPassword(data);
          toast.success({
            title: "Senha Redefinida!",
            description:
              "Sua senha foi alterada com sucesso. Já pode fazer login.",
          });
          return true;
        } catch (error: any) {
          toast.error({
            title: "Erro",
            description:
              error.message || "Não foi possível redefinir sua senha.",
          });
          set({ error: error.message, isLoading: false });
          return false;
        } finally {
          set({ isLoading: false });
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

      checkAuthOnInit: async () => {
        try {
          const tokenData = await getTokenData();
          if (!tokenData) {
            // Se não há token, não estamos autenticados.
            set({ user: null, isAuthenticated: false });
            return;
          }

          // Se há token, validamos buscando os dados do usuário.
          const currentUser = await usersAPI.getCurrentUser();
          set({
            user: currentUser,
            isAuthenticated: true,
          });
        } catch (error) {
          // Qualquer erro (token expirado, etc.) significa que não estamos autenticados.
          set({ user: null, isAuthenticated: false });
          // O logout aqui garante a limpeza de qualquer token inválido.
          await get().logout();
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "user-storage",
      storage: mmkvStorage,
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isPremium: state.isPremium,
      }),
    }
  )
);
