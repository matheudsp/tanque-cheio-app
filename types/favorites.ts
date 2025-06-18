export interface FavoriteProduct {
  id: string; 
  name: string;
  price: string;
  unit: string;
  lastUpdated: string;
  percentageChange: string;
  trend: "STABLE" | "UP" | "DOWN";
}

export interface FavoriteStation {
  stationId: string;
  stationName: string;
  localization: {
    id: string;
    state: string;
    city: string;
    address: string;
    number: string;
    complement: string | null;
    neighborhood: string;
    zipCode: string;
  };
  favoritedAt: string;
  product: FavoriteProduct;
}