// components/search/StationMapView.tsx
import React, { useCallback, useEffect, useRef, useMemo } from "react";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Dimensions,
  Alert, // Import Alert for permissions
} from "react-native";
import { useLocationPermissions } from "expo-maps";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { Navigation2 } from "lucide-react-native";
import * as Location from "expo-location"; // Import expo-location

import { useTheme } from "@/providers/themeProvider";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import type { GasStation } from "@/types";
import type { ThemeState } from "@/types/theme";
import { Loading } from "../ui/Loading";
import MapComponent, { MapComponentRef } from "../Map"; // Import MapComponentRef
import { BrandLogo } from "../ui/BrandLogo";
import { AppIcon } from "../ui/AppIcon";
import { getIconNameFromFuel } from "@/utils/getIconNameFromFuel";
import { getPrimaryFuelInfo, formatCurrencyBRL } from "@/utils/fuel";

interface StationMapViewProps {
  stations: GasStation[];
  isLoading: boolean;
  userLocation: { latitude: number; longitude: number } | null;
  onSelectStation: (station: GasStation | null) => void;
  selectedStationId: string | null;
  onSearchInArea: (region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }) => void;
  onUpdateUserLocation: (location: {
    latitude: number;
    longitude: number;
  }) => void; // Adicionado para atualizar a localização do usuário
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_HEIGHT = 100;

export function StationMapView({
  stations,
  isLoading,
  userLocation,
  onSelectStation,
  selectedStationId,
  onSearchInArea,
  onUpdateUserLocation, // Recebido como prop
}: StationMapViewProps) {
  const styles = useStylesWithTheme(getStyles);
  const { themeState } = useTheme();
  const router = useRouter();

  const [permissionStatus, requestPermission] = useLocationPermissions();
  const mapRef = useRef<MapComponentRef>(null); // Ref para o MapComponent

  const [selectedStation, setSelectedStation] =
    React.useState<GasStation | null>(null);

  const cardTranslateY = useSharedValue(CARD_HEIGHT);
  const cardOpacity = useSharedValue(0);

  useEffect(() => {
    if (permissionStatus?.granted === false) {
      ///requestPermission();  Já está sendo chamado no onMount, mas você deve ser implementando um toast para aviso mais explícito
    }
  }, [permissionStatus]);
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão de Localização",
          "Precisamos da sua permissão para acessar a localização para mostrar postos próximos. Por favor, habilite nas configurações do seu dispositivo."
        );
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      onUpdateUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  useEffect(() => {
    if (selectedStationId) {
      const foundStation = stations.find((s) => s.id === selectedStationId);
      setSelectedStation(foundStation || null);
      if (foundStation) {
        cardTranslateY.value = withTiming(0, { duration: 300 });
        cardOpacity.value = withTiming(1, { duration: 300 });
      }
    } else {
      cardTranslateY.value = withTiming(CARD_HEIGHT, { duration: 300 });
      cardOpacity.value = withTiming(0, { duration: 300 });
      setSelectedStation(null);
    }
  }, [selectedStationId, stations, cardTranslateY, cardOpacity]);

  const handleMarkerPress = useCallback(
    (station: GasStation) => {
      onSelectStation(station);
    },
    [onSelectStation]
  );

  const handleMapClick = useCallback(() => {
    onSelectStation(null);
  }, [onSelectStation]);

  const handleGoToDetails = useCallback(() => {
    if (selectedStation) {
      router.push({
        pathname: "/gas-station/[id]",
        params: { id: selectedStation.id },
      } as any);
    }
  }, [selectedStation, router]);

  // NOVO: Função para centralizar o mapa na localização do usuário
  const centerOnUserLocation = useCallback(async () => {
    // Delimitadores de zoom padrão para a área
    const defaultLatitudeDelta = 0.05; // Definido aqui
    const defaultLongitudeDelta = 0.05; // Definido aqui

    if (userLocation) {
      mapRef.current?.animateToRegion(
        userLocation.latitude,
        userLocation.longitude,
        defaultLatitudeDelta,
        defaultLongitudeDelta
      );
    } else {
      // Se userLocation não estiver disponível, tente obter novamente e peça permissão
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão de Localização",
          "Não foi possível obter sua localização. Por favor, verifique as permissões do aplicativo nas configurações do seu dispositivo."
        );
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      onUpdateUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      // Tente animar novamente após atualizar a localização
      mapRef.current?.animateToRegion(
        location.coords.latitude,
        location.coords.longitude,
        defaultLatitudeDelta,
        defaultLongitudeDelta
      );
    }
  }, [userLocation, onUpdateUserLocation]);

  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: cardTranslateY.value }],
      opacity: cardOpacity.value,
    };
  });

  if (isLoading && stations.length === 0) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <MapComponent
        ref={mapRef}
        userLocation={userLocation}
        stations={stations}
        onMarkerPress={handleMarkerPress}
        onMapPress={handleMapClick}
        onRegionChangeComplete={onSearchInArea}
      />

      <TouchableOpacity
        style={styles.myLocationButton}
        onPress={centerOnUserLocation} // Atribui a função ao onPress
        activeOpacity={0.8}
      >
        <Navigation2
          color={themeState.colors.text.secondary}
          size={themeState.typography.fontSize.h2}
        />
      </TouchableOpacity>

      {selectedStation && (
        <Animated.View style={[styles.cardAboveMarker, animatedCardStyle]}>
          <BrandLogo brandName={selectedStation.brand} style={styles.logo} />
          <View style={styles.cardContent}>
            <Text style={styles.stationNameText} numberOfLines={1}>
              {selectedStation.trade_name || selectedStation.legal_name}
            </Text>
            {(() => {
              const fuel = getPrimaryFuelInfo(selectedStation);
              const price = fuel ? formatCurrencyBRL(fuel.price) : "N/A";
              return (
                <View style={styles.priceContainer}>
                  <AppIcon
                    name={getIconNameFromFuel(fuel?.product_name)}
                    width={20}
                    height={20}
                  />
                  <Text style={styles.priceText}>{price}</Text>
                  {selectedStation.distance !== undefined && (
                    <Text style={styles.distanceText}>
                      • {selectedStation.distance} km
                    </Text>
                  )}
                </View>
              );
            })()}
            <TouchableOpacity
              onPress={handleGoToDetails}
              style={styles.detailsButton}
              activeOpacity={0.8}
            >
              <Text style={styles.detailsButtonText}>Ver detalhes</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingBottom: theme.spacing.sm,
      backgroundColor: theme.colors.background.default,
    },
    map: {
      ...StyleSheet.absoluteFillObject,
    },
    loaderContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.background.default,
    },
    myLocationButton: {
      position: "absolute",
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.round,
      bottom: 100,
      right: theme.spacing.lg,
      backgroundColor: theme.colors.background.elevated,
      justifyContent: "center",
      alignItems: "center",
      ...theme.shadows.shadowMd,
      elevation: 8,
    },
    cardAboveMarker: {
      position: "absolute",
      bottom: theme.spacing.xl + 72,
      left: theme.spacing.lg,
      right: theme.spacing.lg,
      backgroundColor: theme.colors.background.paper,
      borderRadius: theme.borderRadius.large,
      padding: theme.spacing.md,
      flexDirection: "row",
      alignItems: "center",
      ...theme.shadows.shadowLg,
      elevation: 10,
    },
    logo: {
      width: 48,
      height: 48,
      borderRadius: theme.borderRadius.medium,
      marginRight: theme.spacing.md,
      backgroundColor: theme.colors.background.default,
    },
    cardContent: {
      flex: 1,
      justifyContent: "center",
    },
    stationNameText: {
      fontSize: theme.typography.fontSize.medium,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    priceContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.sm,
    },
    priceText: {
      fontSize: 16,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primary.main,
      marginLeft: theme.spacing.sm,
    },
    distanceText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginLeft: theme.spacing.sm,
    },
    detailsButton: {
      backgroundColor: theme.colors.action.selected,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.medium,
      alignSelf: "flex-start",
    },
    detailsButtonText: {
      fontSize: 14,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.primary.main,
    },
  });
