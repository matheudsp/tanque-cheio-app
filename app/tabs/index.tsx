import { Feather } from "@expo/vector-icons";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

import markerImage from "@/assets/images/marker.png";
import markerSelectedImage from "@/assets/images/playstore.png";
import { GasStationCard } from "@/components/shared/GasStationCard";
import { useGasStationStore } from "@/store/gasStationStore";
import { useUserStore } from "@/store/userStore";
import { useTheme } from "@/providers/themeProvider";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import type { ThemeState } from "@/types/theme";

const { height, width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUserStore();
  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const styles = useStylesWithTheme(getStyles);
  const { themeState } = useTheme();

  const {
    nearbyStations,
    isLoading,
    userLocation,
    fetchNearbyStations,
    searchParams,
    error,
    clearError,
  } = useGasStationStore();

  const [currentMapRegion, setCurrentMapRegion] = useState<
    Region | undefined
  >();
  const [showSearchAreaButton, setShowSearchAreaButton] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(
    null
  );

  const snapPoints = useMemo(() => ["25%", "70%"], []);

  useEffect(() => {
    if (userLocation && mapRef.current) {
      const initialRegion = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
      mapRef.current.animateToRegion(initialRegion, 1000);
      handleSearch(initialRegion);
    }
  }, [userLocation]);

  useEffect(() => {
    return () => {
      if (error) clearError();
    };
  }, [error, clearError]);

  const handleSearch = useCallback(
    async (region: Region) => {
      if (!region) return;
      setShowSearchAreaButton(false);
      setSelectedStationId(null);

      const radiusInKm = Math.max(
        5,
        Math.round((region.latitudeDelta * 111) / 2)
      );

      await fetchNearbyStations({
        ...searchParams,
        lat: region.latitude,
        lng: region.longitude,
        radius: radiusInKm,
        sort: searchParams?.sort || "distanceAsc",
      });
      bottomSheetRef.current?.snapToIndex(0);
    },
    [searchParams, fetchNearbyStations]
  );

  const handleSelectStation = (station: any) => {
    if (!station || station.id === selectedStationId) {
      setSelectedStationId(null);
      mapRef.current?.animateToRegion(
        {
          ...currentMapRegion!,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        600
      );
      return;
    }

    setSelectedStationId(station.id);

    mapRef.current?.animateToRegion(
      {
        latitude: station.localization.coordinates!.coordinates[1],
        longitude: station.localization.coordinates!.coordinates[0],
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      600
    );

    bottomSheetRef.current?.snapToIndex(0);
  };

  const centerOnUserLocation = () => {
    if (userLocation && mapRef.current) {
      const userRegion = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
      mapRef.current.animateToRegion(userRegion, 1000);
      handleSearch(userRegion);
    }
  };

  const renderEmptyList = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator
            size="large"
            color={themeState.colors.primary.main}
          />
          <Text style={styles.loadingText}>Buscando postos...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Feather
          name="map-pin"
          size={40}
          color={themeState.colors.text.secondary}
        />
        <Text style={styles.emptyText}>Nenhum posto encontrado</Text>
        <Text style={styles.emptySubtext}>
          Tente mover o mapa para outra área ou ajuste seus filtros.
          {error ? `\nErro: ${error}` : ""}
        </Text>
      </View>
    );
  };

  const renderBottomSheetHeader = () => (
    <View style={styles.bottomSheetHeader}>
      <View>
        <Text style={styles.listTitle}>Resultados Próximos</Text>
        {!isLoading && (
          <Text style={styles.resultsCount}>
            {nearbyStations.length} postos encontrados
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => router.push("/search")}
      >
        <Feather
          name="sliders"
          size={20}
          color={themeState.colors.primary.main}
        />
        <Text style={styles.filterButtonText}>Filtros</Text>
      </TouchableOpacity>
    </View>
  );

  if (!userLocation) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator
          size="large"
          color={themeState.colors.primary.main}
        />
        <Text style={styles.loadingText}>Obtendo sua localização...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {user?.name || "Usuário"}</Text>
        <TouchableOpacity onPress={() => router.push("/profile")}>
          <Feather
            size={26}
            color={themeState.colors.text.primary}
            name="user"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          onRegionChangeComplete={(region) => {
            setCurrentMapRegion(region);
            setShowSearchAreaButton(true);
          }}
          onPress={() => setSelectedStationId(null)}
          showsUserLocation
          showsMyLocationButton={false}
          mapPadding={{ top: 0, right: 0, bottom: height * 0.22, left: 0 }}
        >
          {nearbyStations.map((station) => (
            <Marker
              key={station.id}
              coordinate={{
                latitude: station.localization.coordinates!.coordinates[1],
                longitude: station.localization.coordinates!.coordinates[0],
              }}
              onPress={() => handleSelectStation(station)}
              zIndex={selectedStationId === station.id ? 99 : 1}
            >
              <Image
                source={
                  selectedStationId === station.id
                    ? markerSelectedImage
                    : markerImage
                }
                style={
                  selectedStationId === station.id
                    ? styles.customMarkerSelected
                    : styles.customMarker
                }
                resizeMode="contain"
              />
            </Marker>
          ))}
        </MapView>

        {showSearchAreaButton && !isLoading && (
          <TouchableOpacity
            style={styles.searchAreaButton}
            onPress={() => currentMapRegion && handleSearch(currentMapRegion)}
          >
            <Feather
              name="search"
              size={18}
              color={themeState.colors.primary.text}
            />
            <Text style={styles.searchAreaButtonText}>Buscar nesta área</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.myLocationButton}
          onPress={centerOnUserLocation}
        >
          <Feather
            name="crosshair"
            size={24}
            color={themeState.colors.text.primary}
          />
        </TouchableOpacity>
      </View>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        handleComponent={() => (
          <View style={styles.bottomSheetHandleContainer}>
            <View style={styles.bottomSheetHandle} />
          </View>
        )}
        backgroundStyle={{
          backgroundColor: themeState.colors.background.paper,
        }}
      >
        <BottomSheetFlatList
          data={nearbyStations}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderBottomSheetHeader}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleSelectStation(item)}
              style={styles.cardContainer}
            >
              <GasStationCard
                station={item}
                isSelected={selectedStationId === item.id}
              />
            </TouchableOpacity>
          )}
          ListEmptyComponent={renderEmptyList}
          contentContainerStyle={styles.listContent}
        />
      </BottomSheet>
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
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colors.background.paper,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    greeting: {
      fontSize: 22,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
    },
    mapContainer: {
      flex: 1,
    },
    map: {
      ...StyleSheet.absoluteFillObject,
    },
    customMarker: {
      width: 40,
      height: 40,
    },
    customMarkerSelected: {
      width: 55,
      height: 55,
    },
    searchAreaButton: {
      position: "absolute",
      top: 20,
      alignSelf: "center",
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.primary.main,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.borderRadius.round,
      ...theme.shadows.shadowMd,
    },
    searchAreaButtonText: {
      marginLeft: theme.spacing.sm,
      color: theme.colors.primary.text,
      fontWeight: theme.typography.fontWeight.bold,
      fontSize: 16,
    },
    myLocationButton: {
      position: "absolute",
      bottom: height * 0.25 + 20,
      right: 20,
      backgroundColor: theme.colors.background.paper,
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: "center",
      alignItems: "center",
      ...theme.shadows.shadowMd,
    },
    bottomSheetHandleContainer: {
      backgroundColor: theme.colors.background.paper,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xs,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      alignItems: "center",
    },
    bottomSheetHandle: {
      width: 40,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: theme.colors.divider,
    },
    bottomSheetHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: theme.spacing.xl,
      paddingBottom: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
      backgroundColor: theme.colors.background.paper,
    },
    listTitle: {
      fontSize: 20,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
    },
    resultsCount: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginTop: 2,
    },
    filterButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.action.selected,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.round,
    },
    filterButtonText: {
      marginLeft: theme.spacing.xs,
      color: theme.colors.primary.main,
      fontWeight: theme.typography.fontWeight.bold,
      fontSize: 14,
    },
    cardContainer: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.sm,
    },
    listContent: {
      backgroundColor: theme.colors.background.paper,
      paddingBottom: 40,
    },
    emptyContainer: {
      width: width,
      alignItems: "center",
      justifyContent: "center",
      padding: theme.spacing.xl,
      height: height * 0.4,
      backgroundColor: theme.colors.background.paper,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
      marginTop: theme.spacing.lg,
    },
    emptySubtext: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.sm,
      textAlign: "center",
      paddingHorizontal: 30,
    },
  });
