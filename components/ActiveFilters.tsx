import { X } from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useTheme } from "@/providers/themeProvider";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import type { ThemeState } from "@/types/theme";

type ActiveFilterPillProps = {
  label: string;
  onRemove: () => void;
};

type ActiveFiltersProps = {
  selectedFuelType: string;
  sort: string;
  radius: number;
  onClearFuel: () => void;
  onClearSort: () => void;
  onClearRadius: () => void;
};

const sortLabels: { [key: string]: string } = {
  distanceAsc: "Menor Distância",
  distanceDesc: "Maior Distância",
  priceAsc: "Menor Preço",
  priceDesc: "Maior Preço",
};

export const ActiveFilters = ({
  selectedFuelType,
  sort,
  radius,
  onClearFuel,
  onClearSort,
  onClearRadius,
}: ActiveFiltersProps) => {
  const styles = useStylesWithTheme(getStyles);
  const { themeState } = useTheme();

  const ActiveFilterPill = ({ label, onRemove }: ActiveFilterPillProps) => (
    <TouchableOpacity style={styles.pill} onPress={onRemove}>
      <Text style={styles.pillText}>{label}</Text>
      <X size={14} color={themeState.colors.primary.main} />
    </TouchableOpacity>
  );

  const hasActiveFilters = selectedFuelType || sort || radius;

  if (!hasActiveFilters) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {selectedFuelType && (
          <ActiveFilterPill label={selectedFuelType} onRemove={onClearFuel} />
        )}
        {sortLabels[sort] && (
          <ActiveFilterPill label={sortLabels[sort]} onRemove={onClearSort} />
        )}
        {radius && (
          <ActiveFilterPill
            label={`${radius.toString()} km`}
            onRemove={onClearRadius}
          />
        )}
      </ScrollView>
    </View>
  );
};

const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    container: {
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.background.default,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    scrollViewContent: {
      paddingHorizontal: theme.spacing.lg,
    },
    pill: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.action.selected,
      borderColor: theme.colors.primary.light,
      borderWidth: 1,
      borderRadius: theme.borderRadius.round,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      marginRight: theme.spacing.sm,
    },
    pillText: {
      color: theme.colors.primary.main,
      fontWeight: theme.typography.fontWeight.semibold,
      marginRight: theme.spacing.xs,
      fontSize: 13,
    },
  });
