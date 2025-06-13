export interface responseBase {
  statusCode: number;
  statusMessage: string;
  message: string;
}

export interface PriceHistoryPoint {
  id: string;
  productId: string;
  productName: string;
  price: number;
  date: string; // Formato "YYYY-MM-DD"
  unit: string;
}
export interface ProductPriceHistory {
  productName: string;
  prices: PriceHistoryPoint[];
}

export interface GasStation {
  id: string;
  legal_name: string;
  trade_name?: string;
  brand: string;
  localization: {
    city: string;
    state: string;
    coordinates: {
      type: "Point";
      coordinates: [number, number]; // Formato: [longitude, latitude]
    } | null;
  };
  fuelPrices: GasProduct[];
  distance: number;
}
export interface GasProduct {
  name: string;
  price: number;
  lastupdated: string;
  unit: string;
}

export interface NearbyStationsParams {
  lat: number;
  lng: number;
  radius?: number; // default in km
  limit?: number; // Default: 10
  offset?: number; // Default: 0
  sortBy?: "distanceAsc" | "distanceDesc" | "priceAsc" | "priceDesc";
  product?: string;
}

export interface NearbyStationsResponse extends responseBase {
  data: {
    results: GasStation[];
    total: number;
    // ... outros campos
  };
}

export interface AllStationsResponse extends responseBase {
  data: GasStation[];
}

export interface FuelProduct {
  id: string;
  name: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  unitOfMeasure: string;
}

export interface FuelProductResponse extends responseBase {
  data: FuelProduct[];
}
