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
  
      await apiRequest("/v1/push-notifications/tokens/register", {
        //
        method: "POST",
        body: JSON.stringify(tokenData),
      });
      console.log("Push token registrado com sucesso no backend."); //
    } catch (error) {
      console.error("Falha ao registrar o push token no backend:", error); //
      // Mesmo que falhe, não lançamos o erro para não quebrar o fluxo de login
    }
  },
};
