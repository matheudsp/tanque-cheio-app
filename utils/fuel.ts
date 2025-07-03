import type { GasStation, Product } from "@/types";

/**
 * Formata um número para a moeda brasileira (BRL).
 * @param value O número a ser formatado.
 * @returns Uma string no formato "R$ 5,89". Retorna "N/A" se o valor for inválido.
 */
export const formatCurrencyBRL = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) {
    return "N/A";
  }
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
  if (isNaN(numericValue)) {
    return "N/A";
  }
  return numericValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

/**
 * Extrai a informação do combustível principal de um posto com base em uma lista de prioridade.
 * Isso garante que, sempre que possível, exibiremos o preço da Gasolina Comum.
 *
 * @param station O objeto do posto de combustível.
 * @returns Um objeto contendo as informações do combustível principal ou null.
 */
export const getPrimaryFuelInfo = (station: GasStation): Product | null => {
  if (!station?.fuel_prices || station.fuel_prices.length === 0) {
    return null;
  }
  
  const fuels = station.fuel_prices;
  const priority = ['GASOLINA COMUM', 'GASOLINA', 'ETANOL'];
  
  for (const fuelName of priority) {
    const foundFuel = fuels.find(f => f.product_name.toUpperCase().includes(fuelName));
    if (foundFuel) {
      return foundFuel;
    }
  }
  
  // Caso nenhum dos combustíveis prioritários seja encontrado, retorna o primeiro da lista.
  return fuels[0];
};