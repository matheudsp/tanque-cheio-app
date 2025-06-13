import React from 'react';
import { SvgProps } from 'react-native-svg';

import GasComumIcon from '@/assets/icons/fuels/gasolina.svg';
import EtanolIcon from '@/assets/icons/fuels/etanol.svg';
import DieselIcon from '@/assets/icons/fuels/diesel.svg';
import GnvIcon from '@/assets/icons/fuels/gnv.svg';
import GlpIcon from '@/assets/icons/fuels/glp.svg';
import DefaultIcon from '@/assets/icons/fuels/default.svg'; // Ícone Padrão

type FuelIconProps = {
  fuelName?: string;
} & SvgProps;

export const FuelIcon: React.FC<FuelIconProps> = ({ fuelName, ...props }) => {
  const name = (fuelName || '').toUpperCase();

  switch (true) {
    case name.includes('GASOLINA'):
      return <GasComumIcon {...props} />;
    case name.includes('ETANOL'):
      return <EtanolIcon {...props} />;
    case name.includes('DIESEL'):
      return <DieselIcon {...props} />;
    case name.includes('GNV'):
      return <GnvIcon {...props} />;
    case name.includes('GLP'):
      return <GlpIcon {...props} />;
    default:
      return <DefaultIcon {...props} />;
  }
};