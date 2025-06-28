import type { RegisterPushTokenDTO, User } from "@/types/user";
import { apiRequest, convertBackendUser } from "./api";

export const usersAPI = {
    getCurrentUser: async (): Promise<User> => {
    try {
      const data = await apiRequest("/v1/users/me");
      // console.log('GET CURRENT USER',data)
      // Adiciona uma verificação para garantir que os dados recebidos são válidos
      if (!data || !data.id) {
        throw new Error("Dados do usuário inválidos recebidos da API.");
      }

      // Retorna diretamente os dados do usuário
      return data;
    } catch (error) {
      console.error("Get current user error:", error);
      throw error;
    }
  },
  /**
   * Envia o Expo Push Token para o backend para associá-lo ao usuário logado.
   * @param tokenData - O objeto contendo o token.
   */
  registerPushToken: async (tokenData: RegisterPushTokenDTO): Promise<void> => {
    try {
      // Necessário criar este endpoint no backend.
      await apiRequest("/user/push-token", {
        method: "POST",
        body: JSON.stringify(tokenData),
      });
      console.log("Push token registered successfully with the backend.");
    } catch (error) {
      console.error("Failed to register push token with the backend:", error);
      // Mesmo que falhe, não lançamos o erro para não quebrar o fluxo de login.
      // A lógica de retentativa deve ser implementada aqui.
    }
  },
};
