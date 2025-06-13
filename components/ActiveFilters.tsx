import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { X } from "lucide-react-native";
import { colors } from "@/constants/colors";

type ActiveFilterPillProps = {
  label: string;
  onRemove: () => void;
};

const ActiveFilterPill = ({ label, onRemove }: ActiveFilterPillProps) => (
  <TouchableOpacity style={styles.pill} onPress={onRemove}>
    <Text style={styles.pillText}>{label}</Text>
    <X size={14} color={colors.primary} />
  </TouchableOpacity>
);

type ActiveFiltersProps = {
  selectedFuelType: string;
  sortBy: string;
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
  sortBy,
  radius,
  onClearFuel,
  onClearSort,
  onClearRadius,
}: ActiveFiltersProps) => {
  const hasActiveFilters = selectedFuelType || sortBy || radius;

  if (!hasActiveFilters) return null;

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {selectedFuelType && (
          <ActiveFilterPill label={selectedFuelType} onRemove={onClearFuel} />
        )}
        {sortLabels[sortBy] && (
          <ActiveFilterPill label={sortLabels[sortBy]} onRemove={onClearSort} />
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

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  pillText: {
    color: colors.primary,
    fontWeight: "500",
    marginRight: 6,
  },
});
