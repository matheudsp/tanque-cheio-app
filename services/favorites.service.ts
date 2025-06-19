import type { FavoriteStation } from "@/types/favorites";
import { apiRequest } from "./api";

export const favoritesAPI = {
  /**
   * Busca a lista de postos favoritados pelo usuário.
   */
  getFavorites: async (): Promise<FavoriteStation[]> => {
    try {
      const response = await apiRequest('/v1/favorites');
      // A API retorna um objeto com uma propriedade 'data' que contém a lista
      return response.data || [];
    } catch (error) {
      console.error("Get favorites error:", error);
      throw error;
    }
  },

  /**
   * Adiciona um produto de um posto aos favoritos.
   */
  addFavorite: async (station_id: string, product_id: string): Promise<void> => {
    try {
      await apiRequest('/v1/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ station_id, product_id }),
      });
    } catch (error) {
      console.error("Add favorite error:", error);
      throw error;
    }
  },

  /**
   * Remove um produto de um posto dos favoritos.
   */
  removeFavorite: async (station_id: string, product_id: string): Promise<void> => {
    try {
      await apiRequest(`/v1/favorites/${station_id}?productId=${product_id}`, {
        method: 'DELETE'
      });
      
    } catch (error) {
      console.error("Remove favorite error:", error);
      throw error;
    }
  },
};
