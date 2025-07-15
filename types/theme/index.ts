import { ImageStyle, TextStyle, ViewStyle } from "react-native";

// Utility type para garantir que os estilos sejam objetos de estilo válidos do React Native.
export type NamedStyles<T> = {
  [P in keyof T]: ViewStyle | TextStyle | ImageStyle;
};

// Enum para os temas que a aplicação pode de fato aplicar (light/dark).
export enum Theme {
  LIGHT = "LIGHT",
  DARK = "DARK",
}

// Enum para as opções de preferência do usuário, incluindo a do sistema.
export enum ThemePreference {
  LIGHT = "LIGHT",
  DARK = "DARK",
  SYSTEM = "SYSTEM",
}

// A interface principal que define a estrutura de um objeto de tema.
export interface ThemeState {
  theme: Theme;
  colors: Readonly<ColorTheme>;
  typography: Readonly<Typography>;
  spacing: Readonly<Spacing>;
  borderRadius: Readonly<BorderRadius>;
  shadows: Readonly<Shadows>;
}

// --- Definições detalhadas para cada parte do tema ---

export interface ColorTheme {
  primary: ColorShades;
  secondary: ColorShades;
  background: BackgroundColors;
  text: TextColors;
  button: ButtonColors;
  border: string;
  divider: string;
  error: string;
  warning: string;
  info: string;
  success: string;
  action: ActionColors;
  shadow: string;
}

export interface ColorShades {
  main: string;
  light: string;
  dark: string;
  text: string;
}

export interface BackgroundColors {
  default: string;
  paper: string;
  elevated: string;
}

export interface TextColors {
  primary: string;
  secondary: string;
  disabled: string;
  hint: string;
}

export interface ButtonColors {
  primary: string;
  secondary: string;
  disabled: string;
  text: string;
}

export interface ActionColors {
  active: string;
  hover: string;
  selected: string;
  disabled: string;
}

export interface Typography {
  fontFamily: {
    primary: string;
    secondary: string;
  };
  fontSize: {
    small: number;
    medium: number;
    large: number;
    h1: number;
    h2: number;
  };
  fontWeight: {
    normal: TextStyle["fontWeight"];
    bold: TextStyle["fontWeight"];
    light: TextStyle["fontWeight"];
    semibold: TextStyle["fontWeight"];
  };
  lineHeight: {
    body: number;
    heading: number;
    letterSpacing: {
      normal: number;
      wide: number;
    };
  };
}

export interface Spacing {
  none: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  "2xl": number;
  "3xl": number;
  "4xl": number;
  "5xl": number;
}

export interface BorderRadius {
  none: number;
  small: number;
  medium: number;
  large: number;
  round: number;
}

export interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export interface Shadows {
  shadowSm: ShadowStyle;
  shadowMd: ShadowStyle;
  shadowLg: ShadowStyle;
}
