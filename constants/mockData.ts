// Mock data for the app
import type { FuelProduct, FuelProductResponse } from '@/types/gas-station';


export const fallbackFuelTypes: FuelProduct[] = [
  {
    id: "1",
    name: "GASOLINA COMUM",
    category: "COMBUSTÍVEL",
    createdAt: "",
    updatedAt: "",
    unitOfMeasure: "R$ / litro",
  },
  {
    id: "2",
    name: "GASOLINA ADITIVADA",
    category: "COMBUSTÍVEL",
    createdAt: "",
    updatedAt: "",
    unitOfMeasure: "R$ / litro",
  },
  {
    id: "3",
    name: "ETANOL",
    category: "COMBUSTÍVEL",
    createdAt: "",
    updatedAt: "",
    unitOfMeasure: "R$ / litro",
  },
  {
    id: "4",
    name: "DIESEL S10",
    category: "COMBUSTÍVEL",
    createdAt: "",
    updatedAt: "",
    unitOfMeasure: "R$ / litro",
  },
  {
    id: "5",
    name: "DIESEL S500",
    category: "COMBUSTÍVEL",
    createdAt: "",
    updatedAt: "",
    unitOfMeasure: "R$ / litro",
  },
  {
    id: "6",
    name: "GLP",
    category: "GLP",
    createdAt: "",
    updatedAt: "",
    unitOfMeasure: "R$ / 13 kg",
  },
  {
    id: "7",
    name: "GNV",
    category: "GNV",
    createdAt: "",
    updatedAt: "",
    unitOfMeasure: "R$ / m³",
  }
];
    


export const fallbackFuelTypesWithResponse: FuelProductResponse[] = [
      {
        statusCode: 200,
        statusMessage: 'OK',
        message: "Success",
        data: [
          {
            id: "1",
            name: "GASOLINA COMUM",
            category: "COMBUSTÍVEL",
            createdAt: "",
            updatedAt: "",
            unitOfMeasure: "R$ / litro",
          },
          {
            id: "2",
            name: "GASOLINA ADITIVADA",
            category: "COMBUSTÍVEL",
            createdAt: "",
            updatedAt: "",
            unitOfMeasure: "R$ / litro",
          },
          {
            id: "3",
            name: "ETANOL",
            category: "COMBUSTÍVEL",
            createdAt: "",
            updatedAt: "",
            unitOfMeasure: "R$ / litro",
          },
          {
            id: "4",
            name: "DIESEL S10",
            category: "COMBUSTÍVEL",
            createdAt: "",
            updatedAt: "",
            unitOfMeasure: "R$ / litro",
          },
          {
            id: "5",
            name: "DIESEL S500",
            category: "COMBUSTÍVEL",
            createdAt: "",
            updatedAt: "",
            unitOfMeasure: "R$ / litro",
          },
         
        ],
      },
    ];
    