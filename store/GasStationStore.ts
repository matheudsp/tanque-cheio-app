import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GasStation, NearbyStationsParams } from "@/types";
import { gasStationsAPI } from "@/services/gas-station.service";
import { fallbackFuelTypes } from "@/constants/mockData";
import type { FuelProduct, ProductPriceHistory } from "@/types/gas-station";

interface GasStationState {
  allStations: GasStation[];
  nearbyStations: GasStation[];
  priceHistory: ProductPriceHistory[];
  isDetailsLoading: boolean;
  isHistoryLoading: boolean;
  selectedStation: GasStation | null;
  fuelTypes: FuelProduct[];
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
  fetchNearbyStations: (params: NearbyStationsParams) => Promise<void>;
  fetchAllStations: () => Promise<void>;
  fetchStationDetails: (stationId: string) => Promise<void>;
  fetchPriceHistory: (
    stationId: string,
    params?: { startDate?: string; endDate?: string; product?: string }
  ) => Promise<void>;
  fetchFuelTypes: () => Promise<void>;
  setUserLocation: (latitude: number, longitude: number) => void;
  clearSelectedStation: () => void;
  clearError: () => void;
}

export const useGasStationStore = create<GasStationState>()(
  persist(
    (set, get) => ({
      allStations: [],
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

      fetchAllStations: async () => {
        set({ isLoading: true, error: null });
        try {
          const stations = await gasStationsAPI.getAllStations();
          set({
            allStations: stations || [],
            isLoading: false,
          });
        } catch (error) {
          console.error(`Error fetching all stations: ${error}`);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Falha ao buscar postos de combustíveis",
            isLoading: false,
            allStations: [],
          });
        }
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

      fetchStationDetails: async (stationId: string) => {
        set({ isDetailsLoading: true, error: null });
        try {
          const station = await gasStationsAPI.getStationDetails(stationId);
          set({
            selectedStation: station,
            isDetailsLoading: false,
          });
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
        stationId: string,
        params?: { startDate?: string; endDate?: string; product?: string }
      ) => {
        set({ isHistoryLoading: true, error: null }); // Usa o loading do histórico
        try {
          const historyData = await gasStationsAPI.getPriceHistory(
            stationId,
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
          // Set default fuel types on error
          set({
            fuelTypes: fallbackFuelTypes,
            error:
              error instanceof Error
                ? error.message
                : "Falha ao buscar tipos de combustíveis",
          });
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
          sortBy: "distanceAsc" as const,
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
      }),
    }
  )
);
