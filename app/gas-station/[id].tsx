import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Platform,
  Button,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGasStationStore } from "@/store/GasStationStore";
import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { ChartSkeleton } from "@/components/ChartSkeleton";
import { ChipSelector } from "@/components/ChipSelector";
import { FuelIcon } from "@/utils/getFuelIcons";
import { getPeriodDates, type Period } from "@/utils/getPeriodDate";
import { PriceHistoryChart } from "@/components/PriceHistoryChart";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  withTiming,
} from "react-native-reanimated";

import { useSafeAreaInsets } from "react-native-safe-area-context";

// Apenas a altura máxima é uma constante global agora.
const HEADER_MAX_HEIGHT = 280;

export default function GasStationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { top } = useSafeAreaInsets();

  // =================================================================
  // ✅ INÍCIO DA CORREÇÃO: Constantes de animação dinâmicas
  // =================================================================
  // A altura mínima agora considera o topo da área segura + a altura dos botões + espaçamento.
  const HEADER_MIN_HEIGHT = top + 60; // 60px é uma boa altura para a barra de navegação recolhida.
  const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;
  // =================================================================
  // FIM DA CORREÇÃO
  // =================================================================

  const [selectedPeriod, setSelectedPeriod] = useState<Period>("month");
  const [selectedProduct, setSelectedProduct] = useState<string>("all");

  const {
    selectedStation,
    priceHistory,
    isDetailsLoading,
    isHistoryLoading,
    error,
    fetchStationDetails,
    fetchPriceHistory,
    clearSelectedStation,
    clearError,
  } = useGasStationStore();

  const scrollY = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(20);

  useEffect(() => {
    if (id) fetchStationDetails(id);
    return () => clearSelectedStation();
  }, [id, fetchStationDetails]);

  useEffect(() => {
    if (id && selectedProduct !== "all") {
        const { startDate, endDate } = getPeriodDates(selectedPeriod);
        fetchPriceHistory(id, { startDate, endDate, product: selectedProduct });
    }
  }, [id, selectedPeriod, selectedProduct, fetchPriceHistory]);

  useEffect(() => {
    if (!isDetailsLoading && selectedStation) {
      contentOpacity.value = withTiming(1, { duration: 500 });
      contentTranslateY.value = withTiming(0, { duration: 500 });
    }
  }, [isDetailsLoading, selectedStation]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    height: interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
      "clamp"
    ),
  }));

  const heroContentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE / 2],
      [1, 0],
      "clamp"
    ),
  }));

  const collapsedHeaderContentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [HEADER_SCROLL_DISTANCE * 0.7, HEADER_SCROLL_DISTANCE],
      [0, 1],
      "clamp"
    ),
  }));

  const cardsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const handleGetDirections = () => {
    if (!selectedStation?.localization.coordinates) return;
    const [longitude, latitude] = selectedStation.localization.coordinates.coordinates;
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${latitude},${longitude}`;
    const label = selectedStation.legal_name;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });
    if (url) Linking.openURL(url);
  };

  const handleRetry = () => {
    if (id) {
      clearError();
      fetchStationDetails(id);
    }
  };

  if (isDetailsLoading) {
    return (
      <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>
    );
  }
  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={48} color={colors.error} />
        <Text style={styles.errorTitle}>Ocorreu um Erro</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Tentar Novamente" onPress={handleRetry} color={colors.primary} />
      </View>
    );
  }
  if (!selectedStation) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: HEADER_MAX_HEIGHT }}
      >
        <Animated.View style={[styles.contentContainer, cardsAnimatedStyle]}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Tabela de Preços</Text>
            {selectedStation.fuelPrices.map((fuel, index) => (
              <View
                key={fuel.name}
                style={[styles.priceRow, index === selectedStation.fuelPrices.length - 1 && styles.priceRowLast]}
              >
                <View style={styles.fuelInfoContainer}>
                  <FuelIcon fuelName={fuel.name} width={30} height={30} />
                  <View style={styles.fuelTextContainer}>
                    <Text style={styles.fuelName}>{fuel.name}</Text>
                    <Text style={styles.lastUpdated}>
                      Atualizado em:{" "}
                      {new Date(fuel.lastupdated).toLocaleDateString("pt-BR")}
                    </Text>
                  </View>
                </View>
                <Text style={styles.fuelPrice}>
                  {Number(fuel.price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </Text>
              </View>
            ))}
          </View>
          
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Histórico de Preços</Text>
             <Text style={styles.filterLabel}>Combustível</Text>
            <ChipSelector
              options={selectedStation.fuelPrices.map((p) => p.name)}
              selectedValue={selectedProduct}
              onSelect={setSelectedProduct}
            />
            {isHistoryLoading ? (
              <ChartSkeleton />
            ) : (
              <PriceHistoryChart priceHistory={priceHistory} selectedProduct={selectedProduct} />
            )}
          </View>
        </Animated.View>
      </Animated.ScrollView>

      <Animated.View style={[styles.headerContainer, headerAnimatedStyle]}>
        <View style={[styles.topNavContainer, { height: HEADER_MIN_HEIGHT, paddingTop: top }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Animated.View style={[styles.collapsedTitleContainer, collapsedHeaderContentStyle]}>
            <Text style={styles.collapsedTitle} numberOfLines={1}>
              {selectedStation.trade_name || selectedStation.legal_name}
            </Text>
          </Animated.View>
          <TouchableOpacity onPress={() => {}} style={styles.headerButton}>
            <Ionicons name="heart-outline" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        <Animated.View style={[styles.heroContentContainer, heroContentAnimatedStyle]} pointerEvents="box-none">
          <Text style={styles.stationName}>{selectedStation.legal_name}</Text>
          {selectedStation.trade_name && (
            <Text style={styles.tradeName}>{selectedStation.trade_name}</Text>
          )}
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color={colors.white} />
            <Text style={styles.heroInfoText}>{`${selectedStation.localization.city}, ${selectedStation.localization.state}`}</Text>
          </View>
          <TouchableOpacity style={styles.directionsButton} onPress={handleGetDirections}>
            <Ionicons name="navigate-outline" size={22} color={colors.primary} />
            <Text style={styles.directionsButtonText}>Traçar Rota</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
    loadingText: { marginTop: 10, color: colors.textSecondary, fontSize: 16 },
    errorTitle: { fontSize: 22, fontWeight: "bold", color: colors.text, marginTop: 16, marginBottom: 8 },
    errorText: { fontSize: 16, color: colors.textSecondary, textAlign: "center", marginBottom: 20 },
    
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.primary,
        zIndex: 1,
        overflow: 'hidden',
    },
    
    topNavContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        width: '100%',
    },
    headerButton: {
        backgroundColor: "rgba(0,0,0,0.3)",
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    collapsedTitleContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    collapsedTitle: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },

    heroContentContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingBottom: 20,
    },
    stationName: { fontSize: 24, fontWeight: "bold", color: colors.white, textAlign: 'center', marginBottom: 4, paddingHorizontal: 20 },
    tradeName: { fontSize: 16, color: "rgba(255,255,255,0.9)", textAlign: 'center', marginBottom: 12 },
    infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
    heroInfoText: { marginLeft: 8, fontSize: 16, color: colors.white },
    directionsButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.white,
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 30,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    directionsButtonText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 10,
    },

    contentContainer: {
        padding: 20,
        backgroundColor: colors.background,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
    },
    sectionTitle: { fontSize: 20, fontWeight: "bold", color: colors.text, marginBottom: 16 },
    priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
    priceRowLast: { borderBottomWidth: 0 },
    fuelInfoContainer: { flexDirection: "row", alignItems: "center" },
    fuelTextContainer: { marginLeft: 12 },
    fuelName: { fontSize: 16, fontWeight: "600", color: colors.text },
    lastUpdated: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
    fuelPrice: { fontSize: 18, fontWeight: "bold", color: colors.primary },
    infoText: { fontSize: 16, color: colors.textSecondary },

    filterLabel: { fontSize: 14, fontWeight: "600", color: colors.textSecondary, marginBottom: 10, marginLeft: 4 },
    filterContainer: { flexDirection: "row", marginBottom: 20 },
});