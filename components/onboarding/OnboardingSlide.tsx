import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions, ImageSourcePropType } from 'react-native';
import {Image} from 'expo-image'
import LottieView from 'lottie-react-native';
import { useStylesWithTheme } from '@/hooks/useStylesWithTheme';
import type { ThemeState } from '@/types/theme';

interface OnboardingSlideProps {
  item: {
    id: string;
    animation: any; // Lottie JSON
    title: string;
    subtitle: string;
  };
}

export const OnboardingSlide = ({ item }: OnboardingSlideProps) => {
  const { width } = useWindowDimensions();
  const styles = useStylesWithTheme(getStyles);

  return (
    <View style={[styles.container, { width }]}>
      <LottieView
        source={item.animation}
        autoPlay
        loop
        style={styles.lottie}
      />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
    </View>
  );
};

const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
    },
    lottie: {
      width: '80%',
      aspectRatio: 1,
      marginBottom: theme.spacing['3xl'],
    },
    textContainer: {
      paddingHorizontal: theme.spacing.lg,
    },
    title: {
      fontSize: 26,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      lineHeight: 24,
    },
  });