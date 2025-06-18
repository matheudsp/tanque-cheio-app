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
  productId: string;
  productName: string;
  price: string;
  unit: string;
  lastUpdated: string;
  percentageChange: string
  trend: 'DOWN' | 'STABLE'| 'UP';
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
    
  };
}

export interface AllStationsResponse extends responseBase {
  data: GasStation[];
}



export interface FuelProductResponse extends responseBase {
  data: GasProduct[];
}
