import type { FavoriteStation } from "@/types/favorites";
import { apiRequest } from "./api";

export const favoritesAPI = {
  /**
   * Busca a lista de postos favoritados pelo usuário.
   */
  getFavorites: async (): Promise<FavoriteStation[]> => {
    try {
      const response = await apiRequest("/v1/favorites");
      // A API retorna um objeto com uma propriedade 'data' que contém a lista
      return response.data || [];
    } catch (error) {
      console.error("Get favorites error:", error);
      throw error;
    }
  },

  /**
   * Adiciona uma lista de produtos favoritos de um posto em uma única requisição.
   */
  addFavoritesBulk: async (
    station_id: string,
    product_ids: string[]
  ): Promise<void> => {
    try {
      await apiRequest("/v1/favorites/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ station_id, product_ids }),
      });
    } catch (error) {
      console.error("Add favorites bulk error:", error);
      throw error;
    }
  },

   /**
   * Remove uma lista de produtos favoritos de um posto em uma única requisição.
   */
  removeFavoritesBulk: async (station_id: string, product_ids: string[]): Promise<void> => {
    try {
      await apiRequest('/v1/favorites/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ station_id, product_ids }),
      });
    } catch (error) {
      console.error("Remove favorites bulk error:", error);
      throw error;
    }
  },
};
