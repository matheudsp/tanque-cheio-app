import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GasStation, NearbyStationsParams } from "@/types";
import { gasStationsAPI } from "@/services/gas-station.service";

import type { ProductPriceHistory, SearchFilters } from "@/types/gas-stations";

interface GasStationState {
  recentlyViewedStations: GasStation[];
  nearbyStations: GasStation[];
  priceHistory: ProductPriceHistory[];
  isDetailsLoading: boolean;
  isHistoryLoading: boolean;
  selectedStation: GasStation | null;
  filters: SearchFilters;

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
  fetchNearbyStations: () => Promise<void>;
  fetchStationDetails: (gas_station_id: string) => Promise<void>;
  fetchPriceHistory: (
    gas_station_id: string,
    params?: { start_date?: string; end_date?: string; product?: string }
  ) => Promise<void>;
  fetchFuelTypes: () => Promise<void>;
  setUserLocation: (latitude: number, longitude: number) => void;
  clearSelectedStation: () => void;
  clearError: () => void;
  setFilters: (newFilters: Partial<SearchFilters>) => void;
}

const defaultFilters: SearchFilters = {
  sortBy: "distanceAsc",
  radius: 250,
  product: undefined,
};

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
      filters: defaultFilters,

      addRecentlyViewedStation: (stationToAdd) => {
        const { recentlyViewedStations } = get();

        const filteredStations = recentlyViewedStations.filter(
          (station) => station.id !== stationToAdd.id
        );

        const newHistory = [stationToAdd, ...filteredStations];

        const limitedHistory = newHistory.slice(0, 5);
        set({ recentlyViewedStations: limitedHistory });
      },

      fetchNearbyStations: async () => {
        const { userLocation, filters } = get();
        if (!userLocation) return;

        set({ isLoading: true, error: null });

        const params: NearbyStationsParams = {
          lat: userLocation.latitude,
          lng: userLocation.longitude,
          radius: filters.radius,
          sort: filters.sortBy,
          product: filters.product,
        };
        set({ searchParams: params });

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
                : "Falha ao buscar postos de combustíveis nas proximidades",
            isLoading: false,
            nearbyStations: [],
          });
        }
      },

      setFilters: (newFilters: Partial<SearchFilters>) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));

        get().fetchNearbyStations();
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
        set({ isHistoryLoading: true, error: null });
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
        const { userLocation } = get();

        if (
          userLocation?.latitude === latitude &&
          userLocation?.longitude === longitude
        ) {
          return;
        }

        console.warn("Definindo nova localização e buscando postos...");
        set({ userLocation: { latitude, longitude } });
        get().fetchNearbyStations();
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
        filters: state.filters,
        recentlyViewedStations: state.recentlyViewedStations,
      }),
    }
  )
);
