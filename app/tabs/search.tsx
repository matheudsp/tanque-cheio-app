import { Filter } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Region } from "react-native-maps";

import { ActiveFilters } from "@/components/ActiveFilters";
import { FiltersModal } from "@/components/shared/FiltersModal";
import { StationListView } from "@/components/search/StationListView";
import { StationMapView } from "@/components/search/StationMapView";
import { ViewModeToggle } from "@/components/search/ViewModeToggle";
import { useGasStationStore } from "@/store/gasStationStore";
import { useTheme } from "@/providers/themeProvider";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import type { ThemeState } from "@/types/theme";
import type { GasStation, NearbyStationsParams } from "@/types";

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

  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  
  // Estado dos filtros
  const [selectedFuelType, setSelectedFuelType] = useState("");
  const [radius, setRadius] = useState(10); // Raio inicial menor
  const [sort, setSort] = useState<"distanceAsc" | "priceAsc">("distanceAsc");

  // Estado para o mapa
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedFuelType) count++;
    if (sort !== "distanceAsc") count++;
    if (radius !== 10) count++;
    return count;
  }, [selectedFuelType, sort, radius]);

  useEffect(() => {
    fetchFuelTypes();
    // Realiza a busca inicial quando a localização do usuário estiver disponível
    if (userLocation) {
      handleSearchWithFilters();
    }
  }, [userLocation]);

  const handleSearchWithFilters = (
    overrideParams?: Partial<NearbyStationsParams>
  ) => {
    if (!userLocation) return;

    // Limpa a seleção de posto ao fazer nova busca
    setSelectedStationId(null); 

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
  
  const handleSearchInMapArea = (region: Region) => {
     if (!userLocation) return;
     
     const radiusInKm = Math.max(
        2, // Mínimo de 2km
        Math.round((region.latitudeDelta * 111) / 2) // Raio aproximado da área visível
      );

     handleSearchWithFilters({
        lat: region.latitude,
        lng: region.longitude,
        radius: radiusInKm
     });
  }

  const handleRefresh = () => {
    clearError();
    handleSearchWithFilters();
  };
  
  const handleSelectStation = (station: GasStation | null) => {
    if (!station) {
        setSelectedStationId(null);
        return;
    }
    setSelectedStationId(station.id);
  }

  const applyFiltersAndSearch = () => {
    setShowFiltersModal(false);
    handleSearchWithFilters();
  };

  if (!userLocation) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={themeState.colors.primary.main} />
        <Text style={styles.loadingText}>Obtendo sua localização...</Text>
      </View>
    );
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
        selectedFuelType={selectedFuelType}
        sort={sort}
        radius={radius}
        onClearFuel={() => {
          setSelectedFuelType("");
          handleSearchWithFilters({ product: undefined });
        }}
        onClearSort={() => {
          setSort("distanceAsc");
          handleSearchWithFilters({ sort: "distanceAsc" });
        }}
        onClearRadius={() => {
          setRadius(10);
          handleSearchWithFilters({ radius: 10 });
        }}
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
            filteredFuel={selectedFuelType}
            onShowFilters={() => setShowFiltersModal(true)}
          />
        ) : (
          <StationMapView 
            stations={nearbyStations}
            isLoading={isLoading}
            userLocation={userLocation}
            onSelectStation={handleSelectStation}
            selectedStationId={selectedStationId}
            onSearchInArea={handleSearchInMapArea}
          />
        )}
      </View>

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
          setSelectedFuelType("");
          setSort("distanceAsc");
          setRadius(10);
          setShowFiltersModal(false);
          handleSearchWithFilters({
            product: undefined,
            sort: "distanceAsc",
            radius: 10,
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
    }
  });