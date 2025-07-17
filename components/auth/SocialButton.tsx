import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { SvgProps } from "react-native-svg";
import GoogleIcon from "@/assets/icons/social/google.svg";
import AppleIcon from "@/assets/icons/social/apple.svg";
import { useTheme } from "@/providers/themeProvider";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import type { ThemeState } from "@/types/theme";
import { Loading } from "../ui/Loading";

interface SocialButtonProps {
  type: "google" | "apple";
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const socialConfig = {
  google: {
    Icon: (props: SvgProps) => <GoogleIcon {...props} />,
    label: "Continuar com Google",
  },
  apple: {
    Icon: (props: SvgProps) => <AppleIcon {...props} />,
    label: "Continuar com Apple",
  },
};

export const SocialButton = ({
  type,
  onPress,
  disabled,
  loading,
}: SocialButtonProps) => {
  const { themeState } = useTheme();
  const styles = useStylesWithTheme(getStyles);
  const { Icon, label } = socialConfig[type];

  const isApple = type === "apple";
  const appleButtonStyle = isApple && {
    backgroundColor: themeState.theme === "DARK" ? "#FFFFFF" : "#000000",
  };
  const appleTextStyle = isApple && {
    color: themeState.theme === "DARK" ? "#000000" : "#FFFFFF",
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        appleButtonStyle,
        disabled && styles.buttonDisabled,
      ]}
      disabled={disabled}
      activeOpacity={0.7}
      onPress={onPress}
    >
      {loading ? (
        <Loading size="small"/>
      ) : (
        <>
          <Icon width={22} height={22} style={[styles.icon]} />
          <Text style={[styles.text, appleTextStyle]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    button: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.background.paper,
      borderRadius: theme.borderRadius.large,
      height: 52,
      paddingHorizontal: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      width: "100%",
      marginBottom: theme.spacing.md,
    },
    icon: {
      position: "absolute",
      left: theme.spacing.lg,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    text: {
      fontSize: 16,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
    },
  });
