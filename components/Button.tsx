import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";

import { useTheme } from "@/providers/themeProvider";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import type { ThemeState } from "@/types/theme";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "small" | "medium" | "large";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  textStyle?: TextStyle;
}

export const Button = ({
  title,
  variant = "primary",
  size = "medium",
  loading = false,
  icon,
  fullWidth = false,
  style,
  textStyle,
  ...props
}: ButtonProps) => {
  // Usamos os dois hooks: um para os estilos e outro para acessar
  // valores do tema para props que não são de estilo (como a cor do ActivityIndicator).
  const styles = useStylesWithTheme(getStyles);
  const { themeState } = useTheme();

  // Define a cor do ActivityIndicator com base na variante do botão e no tema.
  const spinnerColor =
    variant === "outline" || variant === "ghost"
      ? themeState.colors.primary.main
      : themeState.colors.primary.text; // Cor de texto para botões primários

  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        style,
      ]}
      disabled={loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} size="small" />
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text
            style={[
              styles.text,
              styles[`${variant}Text`],
              styles[`${size}Text`],
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

// A função getStyles agora cria os estilos usando o objeto de tema.
const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    button: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: theme.borderRadius.medium, // Usando o border-radius do tema
    },
    fullWidth: {
      width: "100%",
    },
    iconContainer: {
      marginRight: theme.spacing.sm, // Usando o espaçamento do tema
    },
    // Variantes do botão com cores do tema
    primary: {
      backgroundColor: theme.colors.button.primary,
    },
    secondary: {
      backgroundColor: theme.colors.button.secondary,
    },
    outline: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: theme.colors.primary.main,
    },
    ghost: {
      backgroundColor: "transparent",
    },
    // Tamanhos
    small: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
    },
    medium: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
    },
    large: {
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xl,
    },
    // Estilos de texto
    text: {
      fontWeight: theme.typography.fontWeight.semibold,
      textAlign: "center",
    },
    primaryText: {
      color: theme.colors.primary.text,
    },
    secondaryText: {
      color: theme.colors.secondary.text,
    },
    outlineText: {
      color: theme.colors.primary.main,
    },
    ghostText: {
      color: theme.colors.primary.main,
    },
    smallText: {
      fontSize: theme.typography.fontSize.small,
    },
    mediumText: {
      fontSize: theme.typography.fontSize.medium,
    },
    largeText: {
      fontSize: theme.typography.fontSize.large,
    },
  });
