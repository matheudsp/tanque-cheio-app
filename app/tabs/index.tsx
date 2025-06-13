import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Alert,
  Image, // 1. IMPORTADO
  TouchableOpacity, // 1. IMPORTADO
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { useGasStationStore } from "@/store/GasStationStore";
import { useUserStore } from "@/store/userStore";
import { colors } from "@/constants/colors";


import markerImage from "@/assets/images/marker.png";

// Coordenadas iniciais para Floriano, PI
const INITIAL_REGION = {
  latitude: -6.7706,
  longitude: -43.0311,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUserStore();
  const {
    allStations,
    fetchAllStations,
    setUserLocation,
    isLoading,
  } = useGasStationStore();
  
  const [mapRegion, setMapRegion] = useState(INITIAL_REGION);
  const [isLocationReady, setIsLocationReady] = useState(false);

  useEffect(() => {
    fetchAllStations(); 

    const requestLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão de Localização",
          "A permissão foi negada. O mapa será centralizado em Floriano."
        );
        setIsLocationReady(true);
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        
        setUserLocation(latitude, longitude);
        setMapRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } catch (error) {
        console.error("Erro ao obter localização: ", error);
      } finally {
        setIsLocationReady(true);
      }
    };

    requestLocation();
  }, [fetchAllStations, setUserLocation]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá,</Text>
          <Text style={styles.name}>{user?.name || "Usuário"}</Text>
        </View>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>⛽</Text>
        </View>
      </View>

      <View style={styles.mapContainer}>
        {(!isLocationReady || (isLoading && allStations.length === 0)) ? (
          <ActivityIndicator style={StyleSheet.absoluteFill} size="large" color={colors.primary} />
        ) : (
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={mapRegion}
            showsUserLocation
            showsMyLocationButton
          >
            {allStations
              .filter(station => station.localization.coordinates && station.localization.coordinates.coordinates)
              .map((station) => (
              <Marker
                key={station.id}
                coordinate={{
                  latitude: station.localization.coordinates!.coordinates[1],
                  longitude: station.localization.coordinates!.coordinates[0],
                }}
              >
                 {/* 3. ÍCONE SUBSTITUÍDO PELA IMAGEM PERSONALIZADA */}
                 <Image
                    source={markerImage}
                    style={styles.customMarker}
                    resizeMode="contain"
                  />
                 
                 <Callout tooltip>
                   <View style={styles.calloutContainer}>
                      <Text style={styles.calloutTitle}>{station.legal_name}</Text>
                      <Text style={styles.calloutBrand}>Bandeira: {station.brand}</Text>
                      
                      <View style={styles.separator} />

                      <Text style={styles.fuelPricesTitle}>Preços dos Combustíveis:</Text>
                      {station.fuelPrices && station.fuelPrices.length > 0 ? (
                        station.fuelPrices.map((fuel) => (
                          <View key={fuel.name} style={styles.fuelPriceRow}>
                            <Text style={styles.fuelName}>{fuel.name}</Text>
                            <Text style={styles.fuelPrice}>{Number(fuel.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.noFuelData}>Sem dados de preços.</Text>
                      )}

                      {/* 4. BOTÃO PARA NAVEGAÇÃO ADICIONADO */}
                      <TouchableOpacity 
                        style={styles.detailsButton}
                        onPress={() => router.push(`/gas-station/${station.id}`)}
                      >
                        <Text style={styles.detailsButtonText}>Ver Detalhes</Text>
                      </TouchableOpacity>
                   </View>
                 </Callout>
              </Marker>
            ))}
          </MapView>
        )}
      </View>
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
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
    flex: 1,
    backgroundColor: colors.border,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  // 5. ESTILOS DO MARCADOR ANTIGO REMOVIDOS E NOVOS ESTILOS ADICIONADOS
  customMarker: {
    width: 40, // ajuste a largura conforme necessário
    height: 40, // ajuste a altura conforme necessário
  },
  calloutContainer: {
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 10,
    borderColor: colors.border,
    borderWidth: 1,
    width: 250, 
    elevation: 5, // Sombra para Android
    shadowColor: '#000', // Sombra para iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  calloutBrand: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  fuelPricesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  fuelPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  fuelName: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  fuelPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  noFuelData: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  detailsButton: {
    marginTop: 12,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
});