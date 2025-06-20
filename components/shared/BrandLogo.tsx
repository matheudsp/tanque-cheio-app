// gemini/components/ui/BrandLogo.tsx
import React from 'react';
import { Image, ImageProps, StyleSheet } from 'react-native';

const logoMap: Record<string, any> = {
  'vibra': require('@/assets/images/brands/vibra.png'),
  'ipiranga': require('@/assets/images/brands/ipiranga.png'),
  'raizen': require('@/assets/images/brands/raizen.png'),
  'ale': require('@/assets/images/brands/ale.jpg'),
  'branca': require('@/assets/images/brands/branca.png'),
  'supergasbras energia': require('@/assets/images/brands/supergasbras.png'),
  'nacional gás butano': require('@/assets/images/brands/nacionalgas.png'),
  'ultragaz': require('@/assets/images/brands/ultragaz.png'),
  'liquigás': require('@/assets/images/brands/liquigas.png'),
  'copa energia': require('@/assets/images/brands/copaenergia.png'),
  'bahiana': require('@/assets/images/brands/bahiana.png'),
  'fogas': require('@/assets/images/brands/fogas.png'),
  'consigaz': require('@/assets/images/brands/consigaz.png'),
  'sabbá': require('@/assets/images/brands/sabba.png'),
  'amazongás': require('@/assets/images/brands/amazongas.jpg'),
};

// Imagem padrão para ser usada caso uma logo específica não seja encontrada.
const defaultLogo = require('@/assets/images/brands/default.png');

interface BrandLogoProps extends Omit<ImageProps, 'source'> {
  brandName?: string;
}


export const BrandLogo: React.FC<BrandLogoProps> = ({ brandName, style, ...props }) => {
  const normalizedBrand = (brandName || '').toLowerCase().trim();
  
  const logoSource = logoMap[normalizedBrand] || defaultLogo;

  return (
    <Image
      source={logoSource}
      style={[styles.logo, style]}
      resizeMode="contain"
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  logo: {
    borderRadius: 12,
    width: 35, 
    height: 35, 
  },
});