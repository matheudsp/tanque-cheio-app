import type { GasProduct } from "./gas-station";

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
  product: GasProduct;
}