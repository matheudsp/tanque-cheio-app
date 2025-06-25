import { Filter, Fuel } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActiveFilters } from "@/components/ActiveFilters";
import { GasStationCardSkeleton } from "@/components/GasStationCardSkeleton";
import { GasStationCard } from "@/components/shared/GasStationCard";
import { FiltersModal } from "@/components/shared/FiltersModal";
import { useGasStationStore } from "@/store/gasStationStore";
import { useTheme } from "@/providers/themeProvider";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import type { ThemeState } from "@/types/theme";
import type { GasStation, NearbyStationsParams } from "@/types";
import { EmptyState } from "@/components/ui/EmptyState";

export default function SearchScreen() {
  const {
    nearbyStations,
    fuelTypes,
    userLocation,
    isLoading,
    error,
    fetchNearbyStations,
    fetchFuelTypes,
    clearError,
  } = useGasStationStore();

  const styles = useStylesWithTheme(getStyles);
  const { themeState } = useTheme();

  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [selectedFuelType, setSelectedFuelType] = useState("");
  const [radius, setRadius] = useState(50);
  const [sort, setSort] = useState<
    "distanceAsc" | "priceAsc" | "distanceDesc" | "priceDesc"
  >("distanceAsc");

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedFuelType) count++;
    if (sort) count++;
    if (radius) count++;
    return count;
  }, [selectedFuelType, sort, radius]);

  useEffect(() => {
    fetchFuelTypes();
  }, [fetchFuelTypes]);

  const handleSearchWithFilters = (
    overrideParams?: Partial<NearbyStationsParams>
  ) => {
    if (!userLocation) {
      return;
    }
    const params: NearbyStationsParams = {
      lat: userLocation.latitude,
      lng: userLocation.longitude,
      radius: radius,
      sort,
      product: selectedFuelType || undefined,
      ...overrideParams,
    };
    fetchNearbyStations(params);
  };

  const handleRefresh = () => {
    clearError();
    handleSearchWithFilters();
  };

  const clearFilters = () => {
    setSelectedFuelType("");
    setSort("distanceAsc");
    setRadius(50);
  };

  const applyFiltersAndSearch = () => {
    setShowFiltersModal(false);
    handleSearchWithFilters();
  };

  const renderStation = ({ item }: { item: GasStation }) => (
    <GasStationCard station={item} filteredFuel={selectedFuelType} />
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.headerContainer}>
        <View style={styles.titleContainer}>
          <Fuel size={22} color={themeState.colors.text.secondary} />
          <Text style={styles.titleText}>Próximos a você</Text>
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFiltersModal(true)}
        >
          <Filter size={20} color={themeState.colors.primary.main} />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ActiveFilters
        selectedFuelType={selectedFuelType}
        sort={sort}
        radius={radius}
        onClearFuel={() => {
          const newFuel = "";
          setSelectedFuelType(newFuel);
          handleSearchWithFilters({ product: newFuel || undefined });
        }}
        onClearSort={() => {
          const newSort = "distanceAsc";
          setSort(newSort);
          handleSearchWithFilters({ sort: newSort });
        }}
        onClearRadius={() => {
          const newRadius = 50;
          setRadius(newRadius);
          handleSearchWithFilters({ radius: newRadius });
        }}
      />

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {isLoading && (
        <FlatList
          data={Array.from({ length: 5 }, (_, i) => i)}
          renderItem={() => <GasStationCardSkeleton />}
          keyExtractor={(item) => item.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
      {!isLoading && (
        <FlatList
          data={nearbyStations}
          renderItem={renderStation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              colors={[themeState.colors.secondary.main]}
              tintColor={themeState.colors.secondary.main}
            />
          }
          ListEmptyComponent={
            <EmptyState
              lottieAnimation={require("@/assets/animations/sad-circle.json")}
              title="Nenhum posto encontrado"
              description="Tente ajustar os filtros ou a sua busca."
              actionLabel="Alterar filtros"
              onAction={() => {
                setShowFiltersModal(true);
              }}
            />
          }
        />
      )}

      <FiltersModal
        visible={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        fuelTypes={fuelTypes}
        selectedFuelType={selectedFuelType}
        setSelectedFuelType={setSelectedFuelType}
        sortBy={sort}
        setSortBy={setSort as any}
        radius={radius}
        setRadius={setRadius}
        onApply={applyFiltersAndSearch}
        onClear={() => {
          clearFilters();
          setShowFiltersModal(false);
          handleSearchWithFilters({
            product: undefined,
            sort: "distanceAsc",
            radius: 50,
          });
        }}
        activeFilterCount={activeFilterCount}
      />
    </SafeAreaView>
  );
}

const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.default,
    },
    headerContainer: {
      flexDirection: "row",
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      alignItems: "center",
      backgroundColor: theme.colors.background.default,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    titleContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
    },
    titleText: {
      marginLeft: theme.spacing.md,
      fontSize: 20,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
    },
    filterButton: {
      padding: theme.spacing.sm,
      marginLeft: theme.spacing.sm,
    },
    filterBadge: {
      position: "absolute",
      right: 2,
      top: 2,
      backgroundColor: theme.colors.error,
      borderRadius: 10,
      width: 18,
      height: 18,
      justifyContent: "center",
      alignItems: "center",
    },
    filterBadgeText: {
      color: theme.colors.primary.text,
      fontSize: 11,
      fontWeight: theme.typography.fontWeight.bold,
    },
    errorContainer: {
      backgroundColor: theme.colors.error,
      padding: theme.spacing.md,
      alignItems: "center",
    },
    errorText: {
      color: theme.colors.primary.text,
    },
    listContainer: {
      padding: theme.spacing.lg,
      paddingBottom: 80,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: theme.spacing.xl,
      marginTop: "20%",
    },
    emptyText: {
      fontSize: 18,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
      textAlign: "center",
      marginTop: theme.spacing.md,
    },
    emptySubtext: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      textAlign: "center",
      marginTop: theme.spacing.xs,
    },
  });
