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
  priceAsc: "Menor Preço",
  distanceDesc: "Maior Distância",
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

  const hasActiveFilters = selectedFuelType || sort || radius;

  if (!hasActiveFilters) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {selectedFuelType && (
          <FilterTag label={selectedFuelType} onClear={onClearFuel} />
        )}
        {sort && (
          <FilterTag label={sortLabels[sort]} onClear={onClearSort} />
        )}
        {radius && (
          <FilterTag label={`${radius} km`} onClear={onClearRadius} />
        )}
      </ScrollView>
    </View>
  );
};

const FilterTag: React.FC<{ label: string; onClear: () => void }> = ({
  label,
  onClear,
}) => {
  const styles = useStylesWithTheme(getStyles);
  return (
    <View style={styles.filterTag}>
      <Text style={styles.filterText}>{label}</Text>
      <TouchableOpacity onPress={onClear} style={styles.closeIcon}>
        <X size={14} color={styles.filterText.color} />
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    container: {
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.background.default,
      paddingHorizontal: theme.spacing.lg,
    },
    scrollContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
    },

    filterTag: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.action.selected,
      borderRadius: theme.borderRadius.medium,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.primary.main,
    },
    filterText: {
      color: theme.colors.primary.main,
      fontWeight: theme.typography.fontWeight.semibold,
    },
    closeIcon: {
      marginLeft: theme.spacing.xs,
      padding: 2,
    },
  });
