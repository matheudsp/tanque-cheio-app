import React from "react";
import {
  ActivityIndicator,
  Image,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { useTheme } from "@/providers/themeProvider";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import type { ThemeState } from "@/types/theme";

interface AppLoadingProps {
  message?: string;
  fullScreen?: boolean;
  size?: "small" | "large";
  style?: StyleProp<ViewStyle>;
}

export const AppLoading: React.FC<AppLoadingProps> = ({
  message,
  fullScreen = true,
  size = "large",
  style,
}) => {
  const { themeState } = useTheme();
  const styles = useStylesWithTheme(getStyles);

  const scale = useSharedValue(1);
  React.useEffect(() => {
    const animationFactor = size === "large" ? 1.05 : 1.02;
    scale.value = withRepeat(
      withSequence(
        withTiming(animationFactor, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      true
    );
  }, [scale, size]);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const logoSize = size === "large" ? 100 : 50;
  const messageFontSize = size === "large" ? 16 : 13;

  return (
    <View
      style={[
        styles.containerBase,
        fullScreen && styles.containerFullScreen,
        style,
      ]}
    >
      <Animated.View style={animatedLogoStyle}>
        <Image
          source={require("@/assets/images/playstore.png")}
          style={[styles.logo, { width: logoSize, height: logoSize }]}
        />
      </Animated.View>

      <ActivityIndicator
        size={size}
        color={themeState.colors.secondary.main}
        style={styles.spinner}
      />

      {message && (
        <Text style={[styles.message, { fontSize: messageFontSize }]}>
          {message}
        </Text>
      )}
    </View>
  );
};

const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    containerBase: {
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.background.default,
      padding: theme.spacing.xl,
    },
    containerFullScreen: {
      flex: 1,
    },
    logo: {
      borderRadius: theme.borderRadius.large,
      marginBottom: theme.spacing.xl,
    },
    spinner: {
      transform: [{ scale: 1.2 }],
    },
    message: {
      marginTop: theme.spacing.lg,
      color: theme.colors.text.secondary,
      fontWeight: theme.typography.fontWeight.semibold,
      textAlign: "center",
    },
  });
