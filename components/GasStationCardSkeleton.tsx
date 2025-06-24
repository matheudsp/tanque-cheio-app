import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { useTheme } from "@/providers/themeProvider";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import type { ThemeState } from "@/types/theme";

const ShimmerPlaceholder = ({ style }: { style?: any }) => {
  const progress = useSharedValue(0);
  const { themeState } = useTheme();
  const styles = useStylesWithTheme(getShimmerStyles);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(progress.value, [0, 1], [-300, 300]);
    return {
      transform: [{ translateX }],
    };
  });

  const shimmerColors = [
    "transparent",
    themeState.colors.action.hover,
    "transparent",
  ];

  return (
    <View style={[styles.placeholder, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.05)", "transparent"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

export const GasStationCardSkeleton = () => {
  const styles = useStylesWithTheme(getSkeletonStyles);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <ShimmerPlaceholder style={styles.iconPlaceholder} />
          <View style={styles.titleInfo}>
            <ShimmerPlaceholder
              style={{ width: "80%", height: 16, marginBottom: 6 }}
            />
            <ShimmerPlaceholder style={{ width: "50%", height: 14 }} />
          </View>
        </View>
        <ShimmerPlaceholder style={styles.distanceBadge} />
      </View>
      <View style={styles.locationRow}>
        <ShimmerPlaceholder style={styles.iconPlaceholder} />
        <ShimmerPlaceholder
          style={{ width: "70%", height: 14, marginLeft: 8 }}
        />
      </View>
      <View style={styles.priceContainer}>
        <View style={styles.priceItem}>
          <ShimmerPlaceholder
            style={{ width: "70%", height: 12, marginBottom: 4 }}
          />
          <ShimmerPlaceholder style={{ width: "50%", height: 16 }} />
        </View>
        <View style={styles.priceItem}>
          <ShimmerPlaceholder
            style={{ width: "70%", height: 12, marginBottom: 4 }}
          />
          <ShimmerPlaceholder style={{ width: "50%", height: 16 }} />
        </View>
      </View>
    </View>
  );
};

const getShimmerStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    placeholder: {
      backgroundColor: theme.colors.divider,
      overflow: "hidden",
    },
  });

const getSkeletonStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background.paper,
      borderRadius: theme.borderRadius.large,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: theme.spacing.md,
    },
    titleContainer: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    iconPlaceholder: {
      width: 20,
      height: 20,
      borderRadius: theme.borderRadius.small,
    },
    titleInfo: {
      marginLeft: theme.spacing.md,
      flex: 1,
    },
    distanceBadge: {
      width: 50,
      height: 24,
      borderRadius: theme.borderRadius.large,
    },
    locationRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.sm,
    },
    priceContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.divider,
    },
    priceItem: {
      alignItems: "center",
      width: "45%",
    },
  });
