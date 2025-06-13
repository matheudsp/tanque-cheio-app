import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';

const ShimmerPlaceholder = ({ style }: { style?: any }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(progress.value, [0, 1], [-200, 200]);
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View style={[styles.placeholder, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.05)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

export const GasStationCardSkeleton = () => (
  <View style={styles.container}>
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <ShimmerPlaceholder style={styles.iconPlaceholder} />
        <View style={styles.titleInfo}>
          <ShimmerPlaceholder style={{ width: '80%', height: 16, marginBottom: 6 }} />
          <ShimmerPlaceholder style={{ width: '50%', height: 14 }} />
        </View>
      </View>
      <ShimmerPlaceholder style={styles.distanceBadge} />
    </View>
    <View style={styles.locationRow}>
      <ShimmerPlaceholder style={styles.iconPlaceholder} />
      <ShimmerPlaceholder style={{ width: '70%', height: 14, marginLeft: 8 }} />
    </View>
    <View style={styles.priceContainer}>
      <View style={styles.priceItem}>
        <ShimmerPlaceholder style={{ width: '70%', height: 12, marginBottom: 4 }} />
        <ShimmerPlaceholder style={{ width: '50%', height: 16 }} />
      </View>
      <View style={styles.priceItem}>
        <ShimmerPlaceholder style={{ width: '70%', height: 12, marginBottom: 4 }} />
        <ShimmerPlaceholder style={{ width: '50%', height: 16 }} />
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  titleInfo: {
    marginLeft: 12,
    flex: 1,
  },
  distanceBadge: {
    width: 50,
    height: 24,
    borderRadius: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  priceItem: {
    alignItems: 'center',
    width: '45%',
  },
});