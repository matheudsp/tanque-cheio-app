import React from 'react';
import { SvgProps } from 'react-native-svg';
import { StyleSheet } from 'react-native';

import GasolinaIcon from '@/assets/icons/fuels/gasolina.svg';
import EtanolIcon from '@/assets/icons/fuels/etanol.svg';
import DieselIcon from '@/assets/icons/fuels/diesel.svg';
import GnvIcon from '@/assets/icons/fuels/gnv.svg';
import GlpIcon from '@/assets/icons/fuels/glp.svg';
import GasPumpIcon from '@/assets/icons/gasPump.svg';
import DefaultIcon from '@/assets/icons/fuels/default.svg';
import PremiumIcon from '@/assets/icons/premium.svg';
import FreeIcon from '@/assets/icons/free.svg';


const iconMap = {
  gasolina: GasolinaIcon,
  etanol: EtanolIcon,
  diesel: DieselIcon,
  gnv: GnvIcon,
  glp: GlpIcon,
  gasPump: GasPumpIcon,
  default: DefaultIcon,
  premium: PremiumIcon,
  free: FreeIcon
};

export type IconName = keyof typeof iconMap;

type AppIconProps = {
  name: IconName; 
} & SvgProps;

/**
 * Componente genérico para renderizar qualquer ícone SVG da aplicação.
 * @param name O nome do ícone a ser renderizado (ex: 'gasolina', 'etanol').
 * @param props Outras propriedades de SVG como width, height, fill, etc.
 */
export const AppIcon: React.FC<AppIconProps> = ({ name, ...props }) => {
  
  const IconComponent = iconMap[name] || DefaultIcon;

  return <IconComponent  {...props} />;
};
