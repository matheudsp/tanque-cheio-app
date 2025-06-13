import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

export const ChartSkeleton = () => {
  return (
    <View style={styles.container}>
      <View style={styles.chartArea} />
      <View style={styles.labelContainer}>
        <View style={styles.labelPill} />
        <View style={styles.labelPill} />
        <View style={styles.labelPill} />
        <View style={styles.labelPill} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
  },
  chartArea: {
    height: 180,
    backgroundColor: colors.border,
    borderRadius: 8,
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labelPill: {
    height: 20,
    width: '20%',
    backgroundColor: colors.border,
    borderRadius: 10,
  },
});