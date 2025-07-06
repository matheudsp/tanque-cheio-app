// @/components/shared/FiltersModal.tsx

import { X } from "lucide-react-native";
import React, { useState, useEffect } from "react";
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Button } from "../Button";
import { useTheme } from "@/providers/themeProvider";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import type { ThemeState } from "@/types/theme";

// ✅ Tipagem para os filtros, garantindo consistência
type SearchFilters = {
  product?: string;
  sortBy: "distanceAsc" | "priceAsc" | "distanceDesc" | "priceDesc";
  radius: number;
};

type FiltersModalProps = {
  visible: boolean;
  onClose: () => void;
  fuelTypes: any[];
  initialFilters: SearchFilters;
  onApply: (filters: SearchFilters) => void;
};

export const FiltersModal = ({
  visible,
  onClose,
  fuelTypes,
  initialFilters,
  onApply,
}: FiltersModalProps) => {
  const styles = useStylesWithTheme(getStyles);
  const { themeState } = useTheme();

  const [localFilters, setLocalFilters] =
    useState<SearchFilters>(initialFilters);

  useEffect(() => {
    if (visible) {
      setLocalFilters(initialFilters);
    }
  }, [visible, initialFilters]);

  const handleApply = () => {
    onApply(localFilters);
  };

  const handleClear = () => {
    const defaultFilters: SearchFilters = {
      sortBy: "distanceAsc",
      radius: 50,
      product: undefined,
    };
    setLocalFilters(defaultFilters);
    onApply(defaultFilters);
  };

  const FilterSection: React.FC<{
    title: string;
    children: React.ReactNode;
  }> = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.optionsContainer}>{children}</View>
    </View>
  );

  const FilterOptionButton: React.FC<{
    label: string;
    isActive: boolean;
    onPress: () => void;
  }> = ({ label, isActive, onPress }) => (
    <TouchableOpacity
      style={[styles.optionButton, isActive && styles.optionButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={themeState.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filtrar</Text>
          <TouchableOpacity onPress={handleClear}>
            <Text style={styles.clearButton}>Limpar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <FilterSection title="Combustível">
            <FilterOptionButton
              label="Todos"
              isActive={!localFilters.product}
              onPress={() =>
                setLocalFilters({ ...localFilters, product: undefined })
              }
            />
            {fuelTypes.map((fuel) => (
              <FilterOptionButton
                key={fuel.id}
                label={fuel.name}
                isActive={localFilters.product === fuel.name}
                onPress={() =>
                  setLocalFilters({ ...localFilters, product: fuel.name })
                }
              />
            ))}
          </FilterSection>

          <FilterSection title="Ordenar por">
            <FilterOptionButton
              label="Menor Distância"
              isActive={localFilters.sortBy === "distanceAsc"}
              onPress={() =>
                setLocalFilters({ ...localFilters, sortBy: "distanceAsc" })
              }
            />
            <FilterOptionButton
              label="Maior Distância"
              isActive={localFilters.sortBy === "distanceDesc"}
              onPress={() =>
                setLocalFilters({ ...localFilters, sortBy: "distanceDesc" })
              }
            />
            <FilterOptionButton
              label="Menor Preço"
              isActive={localFilters.sortBy === "priceAsc"}
              onPress={() =>
                setLocalFilters({ ...localFilters, sortBy: "priceAsc" })
              }
            />
            <FilterOptionButton
              label="Maior Preço"
              isActive={localFilters.sortBy === "priceDesc"}
              onPress={() =>
                setLocalFilters({ ...localFilters, sortBy: "priceDesc" })
              }
            />
          </FilterSection>

          <FilterSection title="Raio de Busca">
            {[50, 250, 500, 1000].map((r) => (
              <FilterOptionButton
                key={r}
                label={`${r} km`}
                isActive={localFilters.radius === r}
                onPress={() => setLocalFilters({ ...localFilters, radius: r })}
              />
            ))}
          </FilterSection>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Ver Resultados"
            onPress={handleApply}
            variant="primary"
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: theme.colors.background.default,
      marginTop: "10%",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      overflow: "hidden",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    clearButton: {
      color: theme.colors.primary.main,
      fontSize: 16,
      fontWeight: theme.typography.fontWeight.semibold,
    },
    scrollContent: {
      padding: theme.spacing.lg,
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: theme.typography.fontWeight.semibold,
      marginBottom: theme.spacing.md,
      color: theme.colors.text.primary,
    },
    optionsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.md,
    },
    optionButton: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.round,
      backgroundColor: theme.colors.background.paper,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    optionButtonActive: {
      backgroundColor: theme.colors.action.selected,
      borderColor: theme.colors.primary.main,
    },
    optionText: {
      color: theme.colors.text.primary,
      fontSize: 14,
    },
    optionTextActive: {
      color: theme.colors.primary.main,
      fontWeight: theme.typography.fontWeight.bold,
    },
    footer: {
      padding: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.divider,
      backgroundColor: theme.colors.background.default,
    },
  });
