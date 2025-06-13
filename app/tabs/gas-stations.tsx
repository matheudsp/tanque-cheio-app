import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, Filter, Navigation, Fuel } from "lucide-react-native";
import * as Location from "expo-location";
import { useGasStationStore } from "@/store/GasStationStore";
import { GasStationCard } from "@/components/GasStationCard";
import { ActiveFilters } from "@/components/ActiveFilters";
import { FiltersModal } from "@/components/FiltersModal";
import { colors } from "@/constants/colors";
import {
  GasStation,
  NearbyStationsParams,
} from "@/types";
import { GasStationCardSkeleton } from "@/components/GasStationCardSkeleton";

export default function GasStationsScreen() {
  const {
    nearbyStations,
    fuelTypes,
    userLocation,
    isLoading,
    error,
    fetchNearbyStations,
    fetchFuelTypes,
    setUserLocation,
    clearError,
  } = useGasStationStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GasStation[]>([]);

  const [showFiltersModal, setShowFiltersModal] = useState(false);

  const [selectedFuelType, setSelectedFuelType] = useState("");
  const [radius, setRadius] = useState(5);
  const [sortBy, setSortBy] = useState<
    "distanceAsc" | "priceAsc" | "distanceDesc" | "priceDesc"
  >("distanceAsc");

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedFuelType) count++;
    if (sortBy) count++;
    if (radius) count++;
    return count;
  }, [selectedFuelType, sortBy, radius]);

  useEffect(() => {
    fetchFuelTypes();
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão de Localização",
        "Precisamos da sua localização para encontrar postos próximos."
      );
      return;
    }
    const location = await Location.getCurrentPositionAsync({});
    setUserLocation(location.coords.latitude, location.coords.longitude);
    handleSearchNearby({
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    });
  };

  const handleSearchNearby = (
    overrideParams?: Partial<NearbyStationsParams>
  ) => {
    if (!userLocation) {
      requestLocationPermission();
      return;
    }
    const params: NearbyStationsParams = {
      lat: userLocation.latitude,
      lng: userLocation.longitude,
      radius: radius,
      sortBy,
      product: selectedFuelType || undefined,
      ...overrideParams,
    };
    fetchNearbyStations(params);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleRefresh = () => {
    clearError();

    handleSearchNearby();
  };

  const clearFilters = () => {
    setSelectedFuelType("");
    setSortBy("distanceAsc");
    setRadius(5);
  };

  const applyFiltersAndSearch = () => {
    setShowFiltersModal(false);
    handleSearchNearby();
  };

  const displayedStations = searchQuery.trim() ? searchResults : nearbyStations;

  const renderStation = ({ item }: { item: GasStation }) => (
     <GasStationCard
      station={item}
      showDistance={!searchQuery.trim()}
      filteredFuel={selectedFuelType}
    /> 
    
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.headerContainer}>
        <View style={styles.titleContainer}>
          <Fuel size={22} color={colors.textSecondary} />
          <Text style={styles.titleText}>Próximos a você</Text>
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFiltersModal(true)}
        >
          <Filter size={20} color={colors.primary} />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ActiveFilters
        selectedFuelType={selectedFuelType}
        sortBy={sortBy}
        radius={radius}
        onClearFuel={() => {
          const newFuel = "";
          setSelectedFuelType(newFuel);
          handleSearchNearby({ product: newFuel || undefined });
        }}
        onClearSort={() => {
          const newSort = "distanceAsc";
          setSortBy(newSort);
          handleSearchNearby({ sortBy: newSort });
        }}
        onClearRadius={() => {
          const newRadius = 5;
          setRadius(newRadius);
          handleSearchNearby({ radius: newRadius });
        }}
      />

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {isLoading && !searchQuery.trim() && (
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
          data={displayedStations}
          renderItem={renderStation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Fuel size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>Nenhum posto encontrado</Text>
              <Text style={styles.emptySubtext}>
                Tente ajustar os filtros ou a sua busca.
              </Text>
            </View>
          }
        />
      )}

      <FiltersModal
        visible={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        fuelTypes={fuelTypes}
        selectedFuelType={selectedFuelType}
        setSelectedFuelType={setSelectedFuelType}
        sortBy={sortBy}
        setSortBy={setSortBy as any}
        radius={radius}
        setRadius={setRadius}
        onApply={applyFiltersAndSearch}
        onClear={() => {
          clearFilters();
          setShowFiltersModal(false);
          handleSearchNearby({
            product: undefined,
            sortBy: "distanceAsc",
            radius: 5,
          });
        }}
        activeFilterCount={activeFilterCount}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  titleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  titleText: {
    marginLeft: 12,
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  filterButton: {
    padding: 8,
    marginLeft: 8,
  },
  filterBadge: {
    position: "absolute",
    right: 2,
    top: 2,
    backgroundColor: colors.error,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "bold",
  },
  errorContainer: {
    backgroundColor: colors.error,
    padding: 12,
    alignItems: "center",
  },
  errorText: {
    color: colors.white,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    marginTop: "20%",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    textAlign: "center",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
  },
});
