import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { useTheme } from "@/providers/themeProvider";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import type { ThemeState } from "@/types/theme";

interface BadgeConfig {
  label: string;
  icon: ImageSourcePropType;
  gradientColors: string[];
  textColor?: string;
  showShineEffect: boolean;
}

const badgeConfigMap: Record<string, BadgeConfig> = {
  premium: {
    label: "PREMIUM",
    icon: require("@/assets/images/premium.png"),
    gradientColors: ["#FFD700", "#FFA500"], // dourado vibrante para premium
    textColor: "white",
    showShineEffect: true,
  },
  free: {
    label: "FREE",
    icon: require("@/assets/images/free.png"),
    gradientColors: ["#C0C0C0", "#A9A9A9"], // prateado para free
    textColor: "white",
    showShineEffect: false,
  },
};

const ShineEffect = () => {
  const shinePosition = useSharedValue(-150);

  useEffect(() => {
    shinePosition.value = withRepeat(
      withSequence(
        withDelay(
          1500,
          withTiming(150, { duration: 700, easing: Easing.ease })
        ),
        withDelay(2000, withTiming(-150, { duration: 0 }))
      ),
      -1
    );
  }, [shinePosition]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shinePosition.value }, { rotate: "-45deg" }],
  }));

  const styles = useStylesWithTheme(getShineStyles);

  return (
    <Animated.View style={[styles.shine, animatedStyle]}>
      <LinearGradient
        colors={["transparent", "rgba(255, 255, 255, 0.4)", "transparent"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.shineGradient}
      />
    </Animated.View>
  );
};

interface SubscriptionBadgeProps {
  planName?: string;
  style?: object;
}

export const SubscriptionBadge: React.FC<SubscriptionBadgeProps> = ({
  planName,
  style,
}) => {
  if (!planName) return null;
  const styles = useStylesWithTheme(getBadgeStyles);
  const normalizedPlan = planName.toLowerCase();
  const config = badgeConfigMap[normalizedPlan];

  if (!config) return null;

  return (
    <View style={[styles.badgeContainer, style]}>
      <LinearGradient colors={config.gradientColors} style={styles.gradient}>
        {config.showShineEffect && <ShineEffect />}
        <Image source={config.icon} style={styles.badgeIcon} />
        <Text style={[styles.badgeText, { color: config.textColor }]}>
          {config.label}
        </Text>
      </LinearGradient>
    </View>
  );
};

const getBadgeStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    badgeContainer: {
      borderRadius: theme.borderRadius.medium,
      overflow: "hidden",
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 8,
      alignSelf: "flex-start",
    },
    gradient: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 2,
      paddingHorizontal: theme.spacing.sm,
    },
    badgeIcon: {
      width: 18,
      height: 18,
      marginRight: theme.spacing.xs,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: theme.typography.fontWeight.bold,
      letterSpacing: 0.2,
    },
  });

const getShineStyles = () =>
  StyleSheet.create({
    shine: {
      position: "absolute",
      height: "200%",
      width: 30,
      top: "-50%",
      zIndex: 1,
    },
    shineGradient: {
      flex: 1,
    },
  });
