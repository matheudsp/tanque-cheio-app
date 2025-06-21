import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo, // NOVO: Para otimizar os snap points do BottomSheet
} from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Image,
  Dimensions,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { Feather } from '@expo/vector-icons';
import { useGasStationStore } from "@/store/gasStationStore";
import { useUserStore } from "@/store/userStore";
import { GasStationCard } from "@/components/shared/GasStationCard";
import { colors } from "@/constants/colors";
import markerImage from "@/assets/images/marker.png";
import markerSelectedImage from "@/assets/images/playstore.png";

const { height, width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUserStore();
  const mapRef = useRef<MapView>(null);
  
  // NOVO: Referência para o BottomSheet
  const bottomSheetRef = useRef<BottomSheet>(null);

  const {
    nearbyStations,
    isLoading,
    userLocation,
    fetchNearbyStations,
    searchParams,
    error,
    clearError,
  } = useGasStationStore();

  const [currentMapRegion, setCurrentMapRegion] = useState<Region | undefined>();
  const [showSearchAreaButton, setShowSearchAreaButton] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);

  // NOVO: Define os "snap points" ou pontos de parada do BottomSheet
  // 25% da tela para o modo "peek" e 70% para o modo expandido.
  const snapPoints = useMemo(() => ['25%', '70%'], []);

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
    return () => { if (error) clearError(); };
  }, [error, clearError]);

  const handleSearch = useCallback(
    async (region: Region) => {
      if (!region) return;
      setShowSearchAreaButton(false);
      setSelectedStationId(null);
      
      const radiusInKm = Math.max(5, Math.round((region.latitudeDelta * 111) / 2));

      await fetchNearbyStations({
        ...searchParams,
        lat: region.latitude,
        lng: region.longitude,
        radius: radiusInKm,
        sort: searchParams?.sort || "distanceAsc",
      });
      // NOVO: Ao buscar, abre o BottomSheet para a posição inicial (peek)
      bottomSheetRef.current?.snapToIndex(0);
    },
    [searchParams, fetchNearbyStations]
  );
  
  // ALTERADO: A lógica de seleção agora interage com o mapa e o BottomSheet
  const handleSelectStation = (station: any) => {
    if (!station || station.id === selectedStationId) {
        setSelectedStationId(null);
        mapRef.current?.animateToRegion({
            ...currentMapRegion!,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02
        }, 600);
        return;
    }
    
    setSelectedStationId(station.id);

    // Centraliza o mapa no posto selecionado
    mapRef.current?.animateToRegion({
        latitude: station.localization.coordinates!.coordinates[1],
        longitude: station.localization.coordinates!.coordinates[0],
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    }, 600);

    // Garante que o BottomSheet esteja aberto
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
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Buscando postos...</Text>
            </View>
        );
    }
    
    return (
        <View style={styles.emptyContainer}>
            <Feather name="map-pin" size={40} color={colors.textSecondary} />
            <Text style={styles.emptyText}>Nenhum posto encontrado</Text>
            <Text style={styles.emptySubtext}>
                Tente mover o mapa para outra área ou ajuste seus filtros.
                {error ? `\nErro: ${error}` : ""}
            </Text>
        </View>
    );
  };
  
  // NOVO: Componente para o cabeçalho do BottomSheet
  const renderBottomSheetHeader = () => (
      <View style={styles.bottomSheetHeader}>
        <View>
            <Text style={styles.listTitle}>Resultados Próximos</Text>
            {!isLoading && <Text style={styles.resultsCount}>{nearbyStations.length} postos encontrados</Text>}
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={() => console.log("Abrir filtros")}>
            <Feather name="sliders" size={20} color={colors.primary} />
            <Text style={styles.filterButtonText}>Filtros</Text>
        </TouchableOpacity>
      </View>
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
      {/* O cabeçalho foi simplificado, pois os filtros irão para o BottomSheet */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {user?.name || "Usuário"}</Text>
        <TouchableOpacity onPress={() => router.push('/profile')}>
            <Feather name="user" size={26} color={colors.text} />
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
                source={selectedStationId === station.id ? markerSelectedImage : markerImage}
                style={selectedStationId === station.id ? styles.customMarkerSelected : styles.customMarker}
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
                <Feather name="search" size={18} color={colors.white} />
                <Text style={styles.searchAreaButtonText}>Buscar nesta área</Text>
            </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.myLocationButton} onPress={centerOnUserLocation}>
            <Feather name="crosshair" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* NOVO: Implementação do BottomSheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1} // Começa fechado
        snapPoints={snapPoints}
        handleComponent={() => (
            // Handle customizado para um visual mais limpo
            <View style={styles.bottomSheetHandleContainer}>
                <View style={styles.bottomSheetHandle} />
            </View>
        )}
      >
        <BottomSheetFlatList
            data={nearbyStations}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={renderBottomSheetHeader}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelectStation(item)} style={styles.cardContainer}>
                  <GasStationCard station={item} isSelected={selectedStationId === item.id} />
              </TouchableOpacity>
            )}
            ListEmptyComponent={renderEmptyList}
            contentContainerStyle={styles.listContent}
        />
      </BottomSheet>
    </SafeAreaView>
  );
}

// ESTILOS AJUSTADOS E NOVOS ESTILOS
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
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: colors.white,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    greeting: {
      fontSize: 22,
      fontWeight: "bold",
      color: colors.text,
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
      backgroundColor: colors.primary, // Cor alterada para maior destaque
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 30,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
    searchAreaButtonText: {
      marginLeft: 8,
      color: colors.white, // Cor do texto ajustada
      fontWeight: "bold",
      fontSize: 16,
    },
    myLocationButton: {
      position: "absolute",
      // Posição ajustada para ficar acima do "peek state" do bottom sheet
      bottom: (height * 0.25) + 20, 
      right: 20,
      backgroundColor: colors.white,
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: "center",
      alignItems: "center",
      elevation: 4,
    },
    // Removido: listPanel e estilos relacionados, substituídos pelo BottomSheet
    
    // --- Novos estilos para o BottomSheet ---
    bottomSheetHandleContainer: {
        backgroundColor: colors.white,
        paddingTop: 12,
        paddingBottom: 6,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        alignItems: 'center',
    },
    bottomSheetHandle: {
        width: 40,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: colors.border,
    },
    bottomSheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.white,
    },
    listTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
    },
    resultsCount: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 2,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    filterButtonText: {
        marginLeft: 6,
        color: colors.primary,
        fontWeight: 'bold',
        fontSize: 14,
    },
    cardContainer: {
        paddingHorizontal: 20,
        paddingVertical: 8, // Espaçamento entre os cards
    },
    listContent: {
        backgroundColor: colors.white,
        paddingBottom: 40, // Espaço no final da lista
    },
    emptyContainer: {
        width: width,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        height: height * 0.4, // Ocupa um espaço maior para ser mais visível
        backgroundColor: colors.white,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
      marginTop: 16,
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 8,
      textAlign: "center",
      paddingHorizontal: 30,
    },
});