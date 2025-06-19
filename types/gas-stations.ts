import type { Product, responseBase } from ".";

export interface ProductPriceHistory {
  product_name: string;
  prices: Product[];
}

export interface GasStation {
  id: string;
  legal_name: string;
  trade_name?: string;
  brand: string;
  tax_id: string;
  localization: {
    state: string;
    city: string;
    address: string;
    neighborhood: string;
    zip_code: string;
    coordinates: {
      type: "Point";
      coordinates: [number, number]; // Formato: [longitude, latitude]
    } | null;
  };
  distance?: number;
  fuel_prices: Product[];
}

export interface NearbyStationsParams {
  lat: number;
  lng: number;
  radius?: number; // default in km
  limit?: number; // Default: 10
  offset?: number; // Default: 0
  sort?: "distanceAsc" | "distanceDesc" | "priceAsc" | "priceDesc";
  product?: string;
}

export interface GetNearbyStationsResponse extends responseBase {
  data: {
    results: GasStation[];
    total: number;
    limit: number;
    offset: number;
    geo: { lat: number; long: number }[];
    radius: number;
    sort: "distanceAsc" | "distanceDesc" | "priceAsc" | "priceDesc";
    product: string | null;
  };
}

