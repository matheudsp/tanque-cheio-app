import { Filter } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";

import { Region } from "@/types/gas-stations";
import { ActiveFilters } from "@/components/ActiveFilters";
import { FiltersModal } from "@/components/shared/FiltersModal";
import { StationListView } from "@/components/search/StationListView";
import { StationMapView } from "@/components/search/StationMapView";
import { ViewModeToggle } from "@/components/search/ViewModeToggle";
import { useGasStationStore } from "@/stores/gasStationStore";
import { useTheme } from "@/providers/themeProvider";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import type { ThemeState } from "@/types/theme";
import type { GasStation } from "@/types";
import { Loading } from "@/components/ui/Loading";

export default function SearchScreen() {
  const {
    nearbyStations,
    fuelTypes,
    userLocation,
    isLoading,
    error,
    filters,
    setFilters,
    fetchFuelTypes,
    clearError,
    fetchNearbyStations,
    fetchMoreNearbyStations,
    isFetchingMore,
  } = useGasStationStore(
    useShallow((state) => ({
      nearbyStations: state.nearbyStations,
      fuelTypes: state.fuelTypes,
      userLocation: state.userLocation,
      isLoading: state.isLoading,
      error: state.error,
      filters: state.filters,
      setFilters: state.setFilters,
      fetchFuelTypes: state.fetchFuelTypes,
      clearError: state.clearError,
      fetchNearbyStations: state.fetchNearbyStations,
      isFetchingMore: state.isFetchingMore,
      fetchMoreNearbyStations: state.fetchMoreNearbyStations,
    }))
  );

  const styles = useStylesWithTheme(getStyles);
  const { themeState } = useTheme();

  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(
    null
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.product) count++;
    if (filters.sortBy !== "distanceAsc") count++;
    if (filters.radius !== 50) count++;
    return count;
  }, [filters]);

  useEffect(() => {
    fetchFuelTypes();
  }, [fetchFuelTypes]);

  const handleRefresh = () => {
    clearError();
    fetchNearbyStations();
  };

  const handleSearchInMapArea = (region: Region) => {
    const radiusInKm = Math.max(
      2,
      Math.round((region.latitudeDelta * 111) / 2)
    );
    if (userLocation) {
      setFilters({ radius: radiusInKm });
    }
  };

  const handleSelectStation = (station: GasStation | null) => {
    setSelectedStationId(station?.id || null);
  };

  if (!userLocation) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.headerContainer}>
        <View style={styles.titleContainer}>
          <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFiltersModal(true)}
        >
          <Filter size={24} color={themeState.colors.primary.main} />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ActiveFilters
        selectedFuelType={filters.product || ""}
        sort={filters.sortBy}
        radius={filters.radius}
        onClearFuel={() => setFilters({ product: undefined })}
        onClearSort={() => setFilters({ sortBy: "distanceAsc" })}
        onClearRadius={() => setFilters({ radius: 50 })}
      />

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.content}>
        {viewMode === "list" ? (
          <StationListView
            stations={nearbyStations}
            isLoading={isLoading}
            onRefresh={handleRefresh}
            filteredFuel={filters.product}
            onShowFilters={() => setShowFiltersModal(true)}
            onEndReached={fetchMoreNearbyStations}
            isFetchingMore={isFetchingMore}
          />
        ) : (
          // <StationMapView
          //   stations={nearbyStations}
          //   isLoading={isLoading}
          //   userLocation={userLocation}
          //   onSelectStation={handleSelectStation}
          //   selectedStationId={selectedStationId}
          //   onSearchInArea={handleSearchInMapArea}
          //   onUpdateUserLocation={function (location: {
          //     latitude: number;
          //     longitude: number;
          //   }): void {
          //     throw new Error("Function not implemented.");
          //   }}
          // />
          <Text>HI</Text>
        )}
      </View>

      <FiltersModal
        visible={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        fuelTypes={fuelTypes}
        initialFilters={filters}
        // ✅ 'onApply' simplesmente chama `setFilters` com o novo objeto.
        onApply={(newFilters) => {
          setShowFiltersModal(false);
          setFilters(newFilters);
        }}
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
    centerContent: {
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: theme.spacing.sm,
      fontSize: 16,
      color: theme.colors.text.secondary,
    },
    headerContainer: {
      flexDirection: "row",
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
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
    content: {
      flex: 1,
    },
  });
