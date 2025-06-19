import { create } from "zustand";
import { favoritesAPI } from "@/services/favorites.service";
import type { FavoriteStation } from "@/types/favorites";

interface FavoriteState {
  favorites: FavoriteStation[];
  favoriteIds: Set<string>; // Armazena uma chave composta "stationId-productId"
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchFavorites: () => Promise<void>;
  addFavorite: (gas_station_id: string, product_id: string) => Promise<void>;
  unfavoriteProduct: (gas_station_id: string, product_id: string) => Promise<void>;
  isFavorite: (gas_station_id: string, product_id: string) => boolean;
}

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  favorites: [],
  favoriteIds: new Set(),
  isLoading: false,
  error: null,

  fetchFavorites: async () => {
    set({ isLoading: true, error: null });
    try {
      const favoritesData = await favoritesAPI.getFavorites();
      const favoriteIds = new Set(
        // O ID do produto está dentro do objeto 'product'
        favoritesData.map((fav) => `${fav.gas_station_id}-${fav.product.product_id}`)
      );
      set({
        favorites: favoritesData,
        favoriteIds,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
      set({ error: "Falha ao buscar favoritos.", isLoading: false });
    }
  },

  addFavorite: async (gas_station_id: string, product_id: string) => {
    const compositeKey = `${gas_station_id}-${product_id}`;
    const originalIds = new Set(get().favoriteIds);

    // 1. Atualização otimista do ícone
    const updatedIds = new Set(originalIds).add(compositeKey);
    set({ favoriteIds: updatedIds });

    try {
      // 2. Chamada à API
      await favoritesAPI.addFavorite(gas_station_id, product_id);
      // 3. Após sucesso, busca a lista atualizada para ter o objeto completo
      await get().fetchFavorites();
    } catch (error) {
      console.error("Failed to add favorite:", error);
      // 4. Rollback em caso de erro
      set({ favoriteIds: originalIds });
    }
  },

  unfavoriteProduct: async (gas_station_id: string, product_id: string) => {
    const originalFavorites = [...get().favorites];
    const compositeKey = `${gas_station_id}-${product_id}`;

    // Atualização otimista
    const updatedFavorites = originalFavorites.filter(
      (fav) => !(fav.gas_station_id === gas_station_id && fav.product.product_id === product_id)
    );
    const updatedIds = new Set(get().favoriteIds);
    updatedIds.delete(compositeKey);
    set({ favorites: updatedFavorites, favoriteIds: updatedIds });

    // Chamada à API
    try {
      await favoritesAPI.removeFavorite(gas_station_id, product_id);
    } catch (error) {
      console.error("Failed to unfavorite product:", error);
      // Rollback
      set({
        favorites: originalFavorites,
        favoriteIds: new Set(
          originalFavorites.map((f) => `${f.gas_station_id}-${f.product.product_id}`)
        ),
      });
    }
  },

  isFavorite: (gas_station_id: string, product_id: string) => {
    const compositeKey = `${gas_station_id}-${product_id}`;
    return get().favoriteIds.has(compositeKey);
  },
}));
