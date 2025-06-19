import type { responseBase } from "./base";

export interface Product {
  product_id: string;
  product_name: string;
  price: string;
  unit_of_measure: string;
  collection_date: string;
  percentage_change: number;
  trend: "DOWN" | "STABLE" | "UP";
}


export interface ProductResponse extends responseBase {
  data: Product[];
}