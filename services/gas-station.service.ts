import {
  GasStation,
  NearbyStationsParams,
  NearbyStationsResponse,
  AllStationsResponse,
} from "@/types";
import { apiRequest } from "./api";
import type { FuelProduct, FuelProductResponse, ProductPriceHistory } from "@/types/gas-station";
import { fallbackFuelTypes } from "@/constants/mockData";

// Gas Stations API
export const gasStationsAPI = {
  /**
   * Get a specific gas station by ID, with optional filters for price history
   */
   getStationDetails: async (stationId: string): Promise<GasStation> => {
    try {
      // A URL agora é simples, sem parâmetros de query.
      const url = `/v1/gas-stations/${stationId}`;
      const response = await apiRequest(url);

      if (!response.data) {
        throw new Error("Invalid station response: No data received");
      }
      return response.data;
    } catch (error) {
      console.error("Get station details error:", error);
      throw error;
    }
  },

   /**
   * Busca o histórico de preços para o gráfico.
   */
  getPriceHistory: async (
    stationId: string,
    params?: { startDate?: string; endDate?: string; product?: string }
  ): Promise<ProductPriceHistory[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.product) queryParams.append('product', params.product);

      const queryString = queryParams.toString();
      const url = `/v1/gas-stations/${stationId}/price-history${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiRequest(url);
      
      return response.data || [];
    } catch (error) {
      console.error("Get price history error:", error);
      throw error;
    }
  },

  
  /**
   * Get nearby gas stations based on location and filters
   */
  getNearbyStations: async (params: NearbyStationsParams): Promise<any> => {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();

      // Required parameters
      queryParams.append("lat", params.lat.toString());
      queryParams.append("lng", params.lng.toString());

      // Optional parameters with defaults
      queryParams.append("radius", (params.radius || 50).toString());
      queryParams.append("limit", (params.limit || 10).toString());

      if (params.offset) {
        queryParams.append("offset", params.offset.toString());
      }

      if (params.sortBy) {
        queryParams.append("sortBy", params.sortBy);
      }

      if (params.product) {
        queryParams.append("product", params.product);
      }

      const response: NearbyStationsResponse = await apiRequest(
        `/v1/gas-stations/nearby?${queryParams.toString()}`
      );
      // console.log(response)
      if (!response.data) {
        console.warn("No stations found in response");
        return [];
      }

      return response.data;
    } catch (error) {
      console.error("Get nearby stations error:", error);
      throw error;
    }
  },

  /**
   * Get all gas stations available
   */
  getAllStations: async (): Promise<GasStation[]> => {
    try {
      const response: AllStationsResponse = await apiRequest(
        `/v1/gas-stations/all`
      );

      if (!response.data) {
        console.warn("No stations found in response for getAllStations");
        return [];
      }
      return response.data;
    } catch (error) {
      console.error("Get all stations error:", error);
      throw error;
    }
  },

  /**
   * Get all available fuel products
   */

  getFuelTypes: async (): Promise<FuelProduct[]> => {
    try {
      const response = await apiRequest("/v1/products");
      return response.data || fallbackFuelTypes;
    } catch (error) {
      console.error("Get fuel types error:", error);
      // Return common fuel types as fallback
      return fallbackFuelTypes;
    }
  },
};
