import React, { useRef, useMemo, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  Dimensions,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { Feather } from "@expo/vector-icons";

import type { GasStation } from "@/types";
import { useTheme } from "@/providers/themeProvider";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import type { ThemeState } from "@/types/theme";
import markerImage from "@/assets/images/marker.png";
import markerSelectedImage from "@/assets/images/playstore.png";
import { GasStationCard } from "@/components/shared/GasStationCard";
import { GasStationCardSkeleton } from "../GasStationCardSkeleton";
import { EmptyState } from "../ui/EmptyState";

const { height } = Dimensions.get("window");

interface StationMapViewProps {
  stations: GasStation[];
  isLoading: boolean;
  userLocation: any;
  onSelectStation: (station: GasStation | null) => void;
  selectedStationId: string | null;
  onSearchInArea: (region: Region) => void;
}

export function StationMapView({
  stations,
  isLoading,
  userLocation,
  onSelectStation,
  selectedStationId,
  onSearchInArea,
}: StationMapViewProps) {
  const styles = useStylesWithTheme(getStyles);
  const { themeState } = useTheme();

  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const [currentMapRegion, setCurrentMapRegion] = useState<
    Region | undefined
  >();
  const [showSearchAreaButton, setShowSearchAreaButton] = useState(false);

  const snapPoints = useMemo(() => ["25%", "70%"], []);

  // Anima o mapa para a estação selecionada
  useEffect(() => {
    const station = stations.find((s) => s.id === selectedStationId);
    if (station && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: station.localization.coordinates!.coordinates[1],
          longitude: station.localization.coordinates!.coordinates[0],
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        600
      );
      bottomSheetRef.current?.snapToIndex(0);
    }
  }, [selectedStationId, stations]);

  const centerOnUserLocation = () => {
    if (userLocation && mapRef.current) {
      const userRegion = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
      mapRef.current.animateToRegion(userRegion, 1000);
      onSearchInArea(userRegion);
    }
  };

  const renderBottomSheetHeader = () => (
    <View style={styles.bottomSheetHeader}>
      <Text style={styles.listTitle}>
        {stations.length > 0
          ? `${stations.length} postos encontrados`
          : "Resultados Próximos"}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onRegionChangeComplete={(region) => {
          setCurrentMapRegion(region);
          setShowSearchAreaButton(true);
        }}
        onPress={() => onSelectStation(null)}
        showsUserLocation
        showsMyLocationButton={false}
        mapPadding={{ top: 0, right: 0, bottom: height * 0.22, left: 0 }}
      >
        {stations.map((station) => (
          <Marker
            key={station.id}
            coordinate={{
              latitude: station.localization.coordinates!.coordinates[1],
              longitude: station.localization.coordinates!.coordinates[0],
            }}
            onPress={() => onSelectStation(station)}
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
          onPress={() => currentMapRegion && onSearchInArea(currentMapRegion)}
        >
          <Feather
            name="search"
            size={18}
            color={themeState.colors.primary.main}
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

      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        handleComponent={() => (
          <View style={styles.bottomSheetHandleContainer}>
            <View style={styles.bottomSheetHandle} />
          </View>
        )}
        backgroundStyle={{
          backgroundColor: themeState.colors.background.default,
        }}
      >
        <BottomSheetFlatList
          data={isLoading ? Array.from({ length: 5 }) : stations}
          keyExtractor={(item, index) =>
            (item as GasStation)?.id ?? index.toString()
          }
          ListHeaderComponent={renderBottomSheetHeader}
          renderItem={({ item }) =>
            isLoading ? (
              <View style={styles.cardContainer}>
                <GasStationCardSkeleton />
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => onSelectStation(item)}
                style={styles.cardContainer}
              >
                <GasStationCard
                  station={item}
                  isSelected={selectedStationId === (item as GasStation).id}
                />
              </TouchableOpacity>
            )
          }
          ListEmptyComponent={
            !isLoading ? (
              <EmptyState
                icon={
                  <Feather
                    name="map-pin"
                    size={40}
                    color={themeState.colors.text.secondary}
                  />
                }
                fullScreen
                title="Nenhum posto encontrado"
                description="Tente mover o mapa para outra área ou ajuste seus filtros."
              />
            ) : null
          }
          contentContainerStyle={styles.listContent}
        />
      </BottomSheet>
    </View>
  );
}

const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    container: { flex: 1 },
    map: { ...StyleSheet.absoluteFillObject },
    customMarker: { width: 40, height: 40 },
    customMarkerSelected: { width: 55, height: 55 },
    searchAreaButton: {
      position: "absolute",
      top: 20,
      alignSelf: "center",
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.background.default,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.borderRadius.round,
      ...theme.shadows.shadowMd,
    },
    searchAreaButtonText: {
      marginLeft: theme.spacing.sm,
      color: theme.colors.primary.main,
      fontWeight: theme.typography.fontWeight.bold,
      fontSize: 16,
    },
    myLocationButton: {
      position: "absolute",
      bottom: height * 0.25 + 20,
      right: 20,
      backgroundColor: theme.colors.background.default,
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: "center",
      alignItems: "center",
      ...theme.shadows.shadowMd,
    },
    bottomSheetHandleContainer: {
      backgroundColor: theme.colors.background.default,
      paddingVertical: theme.spacing.md,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      alignItems: "center",
    },
    bottomSheetHandle: {
      width: 40,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: theme.colors.text.hint,
    },
    bottomSheetHeader: {
      paddingHorizontal: theme.spacing.xl,
      paddingBottom: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
      backgroundColor: theme.colors.background.default,
    },
    listTitle: {
      fontSize: 18,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
    },
    cardContainer: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.sm,
    },
    listContent: {
      backgroundColor: theme.colors.background.default,
      paddingBottom: 40,
    },
  });
