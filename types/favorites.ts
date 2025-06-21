import type { Product } from "./";

export interface FavoriteStation {
  gas_station_id: string;
  gas_station_name: string;
  gas_station_brand: string;
  localization: {
    id: string;
    state: string;
    city: string;
    address: string;
    number: string;
    complement: string | null;
    neighborhood: string;
    zip_code: string;
    coordinates: any;
    created_at: string;
    updated_at: string;
  };
  favorited_at: string;
  product: Product;
}
