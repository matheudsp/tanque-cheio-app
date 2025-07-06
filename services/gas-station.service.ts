import {
  GasStation,
  NearbyStationsParams,
  GetNearbyStationsResponse,
} from "@/types";
import { apiRequest } from "./api";
import type { ProductPriceHistory } from "@/types/gas-stations";

// Gas Stations API
export const gasStationsAPI = {
  /**
   * Get a specific gas station by ID, with optional filters for price history
   */
  getStationDetails: async (station_id: string): Promise<GasStation> => {
    try {
      const data = await apiRequest(`/v1/gas-stations/${station_id}`);

      if (!data) {
        throw new Error("Invalid station response: No data received");
      }

      return data;
    } catch (error) {
      console.error("Get station details error:", error);
      throw error;
    }
  },

  /**
   * Busca o histórico de preços para o gráfico.
   */
  getPriceHistory: async (
    station_id: string,
    params?: { start_date?: string; end_date?: string; product?: string }
  ): Promise<ProductPriceHistory[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.start_date)
        queryParams.append("start_date", params.start_date);
      if (params?.end_date) queryParams.append("end_date", params.end_date);
      if (params?.product) queryParams.append("product", params.product);

      const queryString = queryParams.toString();
      const url = `/v1/gas-stations/${station_id}/price-history${
        queryString ? `?${queryString}` : ""
      }`;

      const data = await apiRequest(url);

      return data || [];
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
      queryParams.append("radius", (params.radius || 250).toString());
      queryParams.append("limit", (params.limit || 10).toString());

      if (params.offset) {
        queryParams.append("offset", params.offset.toString());
      }

      if (params.sort) {
        queryParams.append("sort", params.sort);
      }

      if (params.product) {
        queryParams.append("product", params.product);
      }

      const data: GetNearbyStationsResponse = await apiRequest(
        `/v1/gas-stations/nearby?${queryParams.toString()}`
      );
      // console.log(response)
      if (!data) {
        console.warn("No stations found in response");
        return [];
      }

      return data;
    } catch (error) {
      console.warn("Get nearby stations error:", error);
      throw error;
    }
  },

  /**
   * Get all available fuel products
   */

  getFuelTypes: async (): Promise<any[]> => {
    try {
      const data = await apiRequest("/v1/products");
      return data;
    } catch (error) {
      console.error("Get fuel types error:", error);
      throw error;
    }
  },
};
