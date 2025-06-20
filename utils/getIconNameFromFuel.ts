import { IconName } from '@/components/shared/AppIcon'; // Importa o tipo do nosso componente

/**
 * Retorna o nome do ícone correspondente a um nome de combustível.
 * @param fuelName O nome completo do combustível (ex: "GASOLINA ADITIVADA").
 * @returns O nome do ícone para ser usado no componente AppIcon (ex: 'gasolina').
 */
export const getIconNameFromFuel = (fuelName?: string): IconName => {
  const name = (fuelName || '').toUpperCase();

  if (name.includes('GASOLINA')) return 'gasolina';
  if (name.includes('ETANOL')) return 'etanol';
  if (name.includes('DIESEL')) return 'diesel';
  if (name.includes('GNV')) return 'gnv';
  if (name.includes('GLP')) return 'glp';
  if (name.includes('GASPUMP')) return 'gasPump';
  
  return 'default'; // Retorna o nome do ícone padrão
};