import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GasStation, NearbyStationsParams } from "@/types";
import { gasStationsAPI } from "@/services/gas-station.service";

import type { ProductPriceHistory } from "@/types/gas-stations";

interface GasStationState {
  recentlyViewedStations: GasStation[];
  nearbyStations: GasStation[];
  priceHistory: ProductPriceHistory[];
  isDetailsLoading: boolean;
  isHistoryLoading: boolean;
  selectedStation: GasStation | null;
  fuelTypes: {
    id: string;
    name: string;
    category: string;
    unitOfMeasure: string;
    isActive: string;
    createdAt: string;
    updatedAt: string;
  }[];
  historyFilters: {
    product?: string;
    period?: "week" | "month" | "semester";
  };
  userLocation: {
    latitude: number;
    longitude: number;
  } | null;
  searchParams: NearbyStationsParams | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  addRecentlyViewedStation: (station: GasStation) => void;
  fetchNearbyStations: (params: NearbyStationsParams) => Promise<void>;
  fetchStationDetails: (gas_station_id: string) => Promise<void>;
  fetchPriceHistory: (
    gas_station_id: string,
    params?: { start_date?: string; end_date?: string; product?: string }
  ) => Promise<void>;
  fetchFuelTypes: () => Promise<void>;
  setUserLocation: (latitude: number, longitude: number) => void;
  clearSelectedStation: () => void;
  clearError: () => void;
}

export const useGasStationStore = create<GasStationState>()(
  persist(
    (set, get) => ({
      recentlyViewedStations: [],
      nearbyStations: [],
      selectedStation: null,
      priceHistory: [],
      isDetailsLoading: false,
      isHistoryLoading: false,
      historyFilters: { period: "month" },
      fuelTypes: [],
      userLocation: null,
      searchParams: null,
      isLoading: false,
      error: null,

      addRecentlyViewedStation: (stationToAdd) => {
        const { recentlyViewedStations } = get();
        // Remove a estação se ela já existir para evitar duplicatas e movê-la para o topo.
        const filteredStations = recentlyViewedStations.filter(
          (station) => station.id !== stationToAdd.id
        );
        // Adiciona a nova estação ao início da lista.
        const newHistory = [stationToAdd, ...filteredStations];
        // Limita o histórico a 10 itens para não sobrecarregar.
        const limitedHistory = newHistory.slice(0, 5);
        set({ recentlyViewedStations: limitedHistory });
      },

      fetchNearbyStations: async (params: NearbyStationsParams) => {
        set({ isLoading: true, error: null, searchParams: params });
        try {
          const stationsData = await gasStationsAPI.getNearbyStations(params);

          set({
            nearbyStations: stationsData.results || [],
            isLoading: false,
          });
        } catch (error) {
          console.error(`Error fetching nearby stations: ${error}`);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Falha ao buscar postos de combustíveis  nas proximidades",
            isLoading: false,
            nearbyStations: [],
          });
        }
      },

      fetchStationDetails: async (gas_station_id: string) => {
        set({ isDetailsLoading: true, error: null });
        try {
          const station = await gasStationsAPI.getStationDetails(
            gas_station_id
          );
          set({
            selectedStation: station,
            isDetailsLoading: false,
          });
          get().addRecentlyViewedStation(station);
        } catch (error) {
          console.error("Error fetching station details:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Falha ao buscar detalhes do posto de combustível",
            isDetailsLoading: false,
          });
        }
      },

      fetchPriceHistory: async (
        gas_station_id: string,
        params?: { start_date?: string; end_date?: string; product?: string }
      ) => {
        set({ isHistoryLoading: true, error: null }); // Usa o loading do histórico
        try {
          const historyData = await gasStationsAPI.getPriceHistory(
            gas_station_id,
            params
          );
          set({
            priceHistory: historyData,
            isHistoryLoading: false,
          });
        } catch (error) {
          console.error("Error fetching price history:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Falha ao buscar histórico de preços",
            isHistoryLoading: false,
          });
        }
      },

      fetchFuelTypes: async () => {
        try {
          const fuelTypes = await gasStationsAPI.getFuelTypes();
          set({ fuelTypes });
        } catch (error) {
          console.error("Error fetching fuel types:", error);

          throw error;
        }
      },

      setUserLocation: (latitude: number, longitude: number) => {
        const { userLocation, searchParams } = get();

        // Opcional: Evita buscas repetidas se a localização não mudou.
        if (
          userLocation?.latitude === latitude &&
          userLocation?.longitude === longitude
        ) {
          return;
        }

        console.warn("Definindo nova localização e buscando postos...");
        set({ userLocation: { latitude, longitude } });

        const defaultParams = {
          lat: latitude,
          lng: longitude,
          radius: 50,
          sort: "distanceAsc" as const,
        };

        get().fetchNearbyStations({
          ...defaultParams,
          ...searchParams,
          // lat: latitude,
          // lng: longitude,
        });
      },

      clearSelectedStation: () => {
        set({ selectedStation: null, priceHistory: [] });
      },

      clearError: () => {
        set({ error: null });
      },
    }),

    {
      name: "gas-station-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist non-sensitive data
      partialize: (state) => ({
        fuelTypes: state.fuelTypes,
        userLocation: state.userLocation,
        searchParams: state.searchParams,
        recentlyViewedStations: state.recentlyViewedStations,
      }),
    }
  )
);
