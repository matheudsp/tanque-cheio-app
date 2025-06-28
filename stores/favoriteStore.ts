import { create } from "zustand";
import { favoritesAPI } from "@/services/favorites.service";
import type { FavoriteStation } from "@/types/favorites";
import { useGasStationStore } from "./gasStationStore";
interface FavoriteState {
  favorites: FavoriteStation[];
  favoriteIds: Set<string>; // Armazena uma chave composta "stationId-productId"
  isLoading: boolean;
  error: string | null;
  stationSpecificFavorites: Set<string>;

  // Actions
  fetchFavoritesByStation: (stationId: string) => Promise<void>;
  fetchFavorites: () => Promise<void>;
  updateFavoritesInBulk: (
    stationId: string,
    productsToAdd: string[],
    productsToRemove: string[]
  ) => Promise<void>;

  isFavorite: (gas_station_id: string, product_id: string) => boolean;
}

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  favorites: [],
  favoriteIds: new Set(),
  isLoading: false,
  error: null,
  stationSpecificFavorites: new Set(),

  fetchFavoritesByStation: async (stationId: string) => {
    set({ isLoading: true });
    try {
      const favoritedProductIds = await favoritesAPI.getFavoritesForStation(
        stationId
      );
      set({
        stationSpecificFavorites: new Set(favoritedProductIds),
        isLoading: false,
      });
    } catch (error) {
      console.error("Falha ao buscar favoritos do posto no store:", error);
      set({
        error: "Não foi possível carregar os favoritos deste posto.",
        isLoading: false,
      });
    }
  },

  fetchFavorites: async () => {
    set({ isLoading: true, error: null });
    try {
      const favoritesData = await favoritesAPI.getFavorites();
      const favoriteIds = new Set(
        // O ID do produto está dentro do objeto 'product'
        favoritesData.map(
          (fav) => `${fav.gas_station_id}-${fav.product.product_id}`
        )
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

  isFavorite: (gas_station_id: string, product_id: string) => {
    return get().favoriteIds.has(`${gas_station_id}-${product_id}`);
  },

  // ---- AÇÃO EM LOTE COM ATUALIZAÇÃO OTIMISTA ----
  updateFavoritesInBulk: async (
    stationId: string,
    productsToAdd: string[],
    productsToRemove: string[]
  ) => {
    set({ isLoading: true, error: null });
    const originalFavorites = get().favorites;
    const originalFavoriteIds = new Set(get().favoriteIds);

    const favoritesAfterRemoval = originalFavorites.filter(
      (fav) =>
        !(
          fav.gas_station_id === stationId &&
          productsToRemove.includes(fav.product.product_id)
        )
    );

    const newFavoriteIds = new Set(originalFavoriteIds);
    productsToRemove.forEach((productId) =>
      newFavoriteIds.delete(`${stationId}-${productId}`)
    );
    productsToAdd.forEach((productId) =>
      newFavoriteIds.add(`${stationId}-${productId}`)
    );

    set({ favorites: favoritesAfterRemoval, favoriteIds: newFavoriteIds });

    try {
      const apiPromises = [];
      if (productsToAdd.length > 0) {
        apiPromises.push(
          favoritesAPI.addFavoritesBulk(stationId, productsToAdd)
        );
      }
      if (productsToRemove.length > 0) {
        apiPromises.push(
          favoritesAPI.removeFavoritesBulk(stationId, productsToRemove)
        );
      }

      await Promise.all(apiPromises);
      await get().fetchFavorites();
      useGasStationStore.getState().fetchStationDetails(stationId);

      set({ isLoading: false });
    } catch (error) {
      console.error("Falha na atualização em lote dos favoritos:", error);
      set({
        favorites: originalFavorites,
        favoriteIds: originalFavoriteIds,
        error: "Não foi possível salvar as alterações.",
        isLoading: false,
      });
    }
  },
}));
