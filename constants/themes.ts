import colors from "./colors";
import {
  BorderRadius,
  Shadows,
  Spacing,
  Theme,
  ThemeState,
  Typography,
} from "@/types/theme";

const typography: Typography = {
  fontFamily: {
    primary: "System",
    secondary: "System",
  },
  fontSize: {
    small: 12,
    medium: 16,
    large: 20,
    h1: 32,
    h2: 24,
  },
  fontWeight: {
    normal: "400",
    bold: "700",
    light: "300",
    semibold: "600",
  },
  lineHeight: {
    body: 24,
    heading: 36,
    letterSpacing: { normal: 0, wide: 1.5 },
  },
};

const spacing: Spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  "4xl": 48,
  "5xl": 64,
};

const borderRadius: BorderRadius = {
  none: 0,
  small: 4,
  medium: 8,
  large: 12,
  round: 9999,
};

// As sombras mudam com base no tema (cores de sombra diferentes)
const getShadows = (theme: Theme): Shadows => ({
  shadowSm: {
    shadowColor: colors[theme].shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 2,
  },
  shadowMd: {
    shadowColor: colors[theme].shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  shadowLg: {
    shadowColor: colors[theme].shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    elevation: 7,
  },
});

// Exporta os objetos de tema completos
export const LIGHT_THEME: ThemeState = {
  theme: Theme.LIGHT,
  colors: colors[Theme.LIGHT],
  typography,
  spacing,
  borderRadius,
  shadows: getShadows(Theme.LIGHT),
};

export const DARK_THEME: ThemeState = {
  theme: Theme.DARK,
  colors: colors[Theme.DARK],
  typography,
  spacing,
  borderRadius,
  shadows: getShadows(Theme.DARK),
};
