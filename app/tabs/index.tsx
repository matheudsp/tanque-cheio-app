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
import * as Location from "expo-location";
import Slider from "@react-native-community/slider";

import { useGasStationStore } from "@/store/GasStationStore";
import { useUserStore } from "@/store/userStore";
import { GasStationCard } from "@/components/GasStationCard";
import { colors } from "@/constants/colors";
import markerImage from "@/assets/images/marker.png";

const INITIAL_REGION = {
  latitude: -5.101460135649267,
  longitude: -42.80321186214014,
  latitudeDelta: 0.8,
  longitudeDelta: 0.8,
};

const { height } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUserStore();
  const {
    nearbyStations,
    fetchNearbyStations,
    userLocation,
    setUserLocation,
    isLoading,
  } = useGasStationStore();

  const [mapRegion, setMapRegion] = useState(INITIAL_REGION);
  const [radius, setRadius] = useState(50); // Raio inicial de 50km

  const handleSearch = useCallback(
    (newRadius: number) => {
      if (!userLocation) {
        Alert.alert(
          "Localização Indisponível",
          "Não foi possível obter sua localização para buscar postos próximos."
        );
        return;
      }
      fetchNearbyStations({
        lat: userLocation.latitude,
        lng: userLocation.longitude,
        radius: newRadius,
      });
    },
    [userLocation, fetchNearbyStations]
  );

  useEffect(() => {
    const requestLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão de Localização",
          "A permissão foi negada. O mapa será centralizado em Floriano."
        );
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({});
        // const { latitude, longitude } = location.coords;
        // Valores fixos para desenvolvimento
        const latitude = -5.101460135649267;
        const longitude = -42.80321186214014;

        setUserLocation(latitude, longitude);
        setMapRegion({
          latitude,
          longitude,
          latitudeDelta: 0.8,
          longitudeDelta: 0.8,
        });
        // Busca inicial com o raio padrão
        handleSearch(radius);
      } catch (error) {
        console.error("Erro ao obter localização: ", error);
        Alert.alert(
          "Erro de Localização",
          "Não foi possível obter sua localização."
        );
      }
    };

    requestLocation();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá,</Text>
          <Text style={styles.name}>{user?.name || "Usuário"}</Text>
        </View>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>⛽</Text>
        </View>
      </View>

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
      </View>

      <View style={styles.controlsContainer}>
        <Text style={styles.radiusLabel}>Raio: {Math.round(radius)} km</Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={100}
          value={radius}
          onSlidingComplete={(value) => {
            setRadius(value);
            handleSearch(value);
          }}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator
          style={styles.loader}
          size="large"
          color={colors.primary}
        />
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
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum posto encontrado.</Text>
              <Text style={styles.emptySubtext}>
                Tente aumentar o raio da busca.
              </Text>
            </View>
          }
        />
      )} */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  },
  map: {
    ...StyleSheet.absoluteFillObject,
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
    paddingBottom: 100, // Espaço para a barra de abas
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: "center",
    justifyContent: "center",
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
  },
});
