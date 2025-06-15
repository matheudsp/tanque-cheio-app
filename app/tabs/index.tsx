import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Alert,
  Image,
  FlatList,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from "react-native-maps";
import Slider from "@react-native-community/slider";
import { useGasStationStore } from "@/store/gasStationStore";
import { useUserStore } from "@/store/userStore";
import { GasStationCard } from "@/components/GasStationCard";
import { colors } from "@/constants/colors";
import markerImage from "@/assets/images/marker.png";

const INITIAL_REGION = {
  latitude: -5.101460135649267,
  longitude: -42.80321186214014,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

const { height } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUserStore();

  const {
    nearbyStations,
    isLoading,
    userLocation,
    fetchNearbyStations, // Action para buscar postos
    searchParams, // Parâmetros de busca salvos
    error,
    clearError,
  } = useGasStationStore();

  const [mapRegion, setMapRegion] = useState(INITIAL_REGION);
  const [radius, setRadius] = useState(searchParams?.radius || 50);

  useEffect(() => {
    if (userLocation) {
      setMapRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    }
  }, [userLocation]);

  // Função de busca implementada com useCallback para otimização
  const handleSearch = useCallback(
    (newRadius: number) => {
      if (!userLocation) {
        Alert.alert(
          "Localização não disponível",
          "Não foi possível realizar a busca pois sua localização não foi encontrada."
        );
        return;
      }

      fetchNearbyStations({
        ...searchParams,
        lat: userLocation.latitude,
        lng: userLocation.longitude,
        radius: newRadius,
        sortBy: searchParams?.sortBy || "distanceAsc",
      });
      console.log(
        searchParams,
        userLocation.latitude,
        userLocation.longitude,
        newRadius,
        searchParams?.sortBy || "distanceAsc"
      );

      if (error) {
        clearError;
      }
    },
    [userLocation, searchParams, fetchNearbyStations]
  );

  if (!userLocation) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Obtendo sua localização...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá,</Text>
          <Text style={styles.name}>{user?.name || "Usuário"}</Text>
        </View>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>⛽</Text>
        </View>
      </View>

      {/* Mapa e Controles */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          region={mapRegion}
          showsUserLocation
          showsMyLocationButton
        >
          {nearbyStations.map((station) => (
            <Marker
              key={station.id}
              coordinate={{
                latitude: station.localization.coordinates!.coordinates[1],
                longitude: station.localization.coordinates!.coordinates[0],
              }}
            >
              <Image
                source={markerImage}
                style={styles.customMarker}
                resizeMode="contain"
              />
              <Callout
                tooltip
                onPress={() => router.push(`/gas-station/${station.id}` as any)}
              >
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle} numberOfLines={1}>
                    {station.legal_name}
                  </Text>
                  <Text style={styles.calloutBrand}>
                    Bandeira: {station.brand}
                  </Text>
                  <Text style={styles.detailsButtonText}>Ver Detalhes</Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
        {/* Mostra mensagem de erro/vazio sobre o mapa se necessário */}
        {!isLoading && nearbyStations.length === 0 && error && (
          <View style={[styles.centerContent, styles.mapOverlay]}>
            <Text style={styles.emptyText}>Nenhum posto encontrado.</Text>
            <Text style={styles.emptySubtext}>
              Tente aumentar o raio da busca. {error}
            </Text>
          </View>
        )}
      </View>

      {/* Controles do Raio */}
      <View style={styles.controlsContainer}>
        <Text style={styles.radiusLabel}>Raio: {Math.round(radius)} km</Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={100}
          value={radius}
          onValueChange={setRadius}
          onSlidingComplete={(value) =>
            handleSearch(parseInt(value.toString()))
          }
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
        />
      </View>

      {/* Indicador de carregamento para a lista */}
      {isLoading ? (
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator
            style={styles.loader}
            size="large"
            color={colors.primary}
          />
        </View>
      ) : (
        <FlatList
          data={nearbyStations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.cardContainer}>
              <GasStationCard station={item} />
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  greeting: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
  },
  logoContainer: {
    width: 40,
    height: 40,
    backgroundColor: colors.secondary,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "bold",
  },
  mapContainer: {
    height: height * 0.4,
    backgroundColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.7)", // Fundo semitransparente
  },
  customMarker: {
    width: 40,
    height: 40,
  },
  calloutContainer: {
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: 8,
    borderColor: colors.border,
    borderWidth: 1,
    width: 200,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 2,
  },
  calloutBrand: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  detailsButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  controlsContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  radiusLabel: {
    fontSize: 14,
    color: colors.text,
    textAlign: "center",
    marginBottom: 4,
    fontWeight: "500",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  loader: {
    marginTop: 20,
  },
  cardContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
