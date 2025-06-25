import React from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";

import type { GasStation } from "@/types";
import { GasStationCard } from "@/components/shared/GasStationCard";
import { GasStationCardSkeleton } from "../GasStationCardSkeleton";
import { EmptyState } from "../ui/EmptyState";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import type { ThemeState } from "@/types/theme";
import { useTheme } from "@/providers/themeProvider";

interface StationListViewProps {
  stations: GasStation[];
  isLoading: boolean;
  onRefresh: () => void;
  filteredFuel?: string;
  onShowFilters: () => void;
}

export function StationListView({
  stations,
  isLoading,
  onRefresh,
  filteredFuel,
  onShowFilters,
}: StationListViewProps) {
  const styles = useStylesWithTheme(getStyles);
  const { themeState } = useTheme();

  if (isLoading && stations.length === 0) {
    return (
      <FlatList
        data={Array.from({ length: 7 })}
        renderItem={() => <GasStationCardSkeleton />}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    );
  }

  return (
    <FlatList
      data={stations}
      renderItem={({ item }) => (
        <GasStationCard station={item} filteredFuel={filteredFuel} />
      )}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={onRefresh}
          colors={[themeState.colors.secondary.main]}
          tintColor={themeState.colors.secondary.main}
        />
      }
      ListEmptyComponent={
        !isLoading ? (
          <EmptyState
            lottieAnimation={require("@/assets/animations/sad-circle.json")}
            title="Nenhum posto encontrado"
            description="Tente ajustar os filtros ou a sua busca para encontrar postos."
            actionLabel="Alterar Filtros"
            onAction={onShowFilters}
          />
        ) : null
      }
    />
  );
}

const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    listContainer: {
      padding: theme.spacing.lg,
      paddingBottom: 80, // Espaço para o tab navigator
    },
  });