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
  addFavorite: (stationId: string, productId: string) => Promise<void>;
  unfavoriteProduct: (stationId: string, productId: string) => Promise<void>;
  isFavorite: (stationId: string, productId: string) => boolean;
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
        favoritesData.map((fav) => `${fav.stationId}-${fav.product.productId}`)
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

  addFavorite: async (stationId: string, productId: string) => {
    const compositeKey = `${stationId}-${productId}`;
    const originalIds = new Set(get().favoriteIds);

    // 1. Atualização otimista do ícone
    const updatedIds = new Set(originalIds).add(compositeKey);
    set({ favoriteIds: updatedIds });

    try {
      // 2. Chamada à API
      await favoritesAPI.addFavorite(stationId, productId);
      // 3. Após sucesso, busca a lista atualizada para ter o objeto completo
      await get().fetchFavorites();
    } catch (error) {
      console.error("Failed to add favorite:", error);
      // 4. Rollback em caso de erro
      set({ favoriteIds: originalIds });
    }
  },

  unfavoriteProduct: async (stationId: string, productId: string) => {
    const originalFavorites = [...get().favorites];
    const compositeKey = `${stationId}-${productId}`;

    // Atualização otimista
    const updatedFavorites = originalFavorites.filter(
      (fav) => !(fav.stationId === stationId && fav.product.productId === productId)
    );
    const updatedIds = new Set(get().favoriteIds);
    updatedIds.delete(compositeKey);
    set({ favorites: updatedFavorites, favoriteIds: updatedIds });

    // Chamada à API
    try {
      await favoritesAPI.removeFavorite(stationId, productId);
    } catch (error) {
      console.error("Failed to unfavorite product:", error);
      // Rollback
      set({
        favorites: originalFavorites,
        favoriteIds: new Set(
          originalFavorites.map((f) => `${f.stationId}-${f.product.productId}`)
        ),
      });
    }
  },

  isFavorite: (stationId: string, productId: string) => {
    const compositeKey = `${stationId}-${productId}`;
    return get().favoriteIds.has(compositeKey);
  },
}));
