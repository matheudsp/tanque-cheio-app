import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Platform,
  Button,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { useGasStationStore } from "@/store/GasStationStore";
import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { ChartSkeleton } from "@/components/ChartSkeleton";
import { ChipSelector } from "@/components/ChipSelector";
import { FuelIcon } from "@/utils/getFuelIcons";
import { getPeriodDates, type Period } from "@/utils/getPeriodDate";
import { PriceHistoryChart } from "@/components/PriceHistoryChart";

export default function GasStationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

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
    clearError, // Importar a função de limpar o erro
  } = useGasStationStore();

  // Efeito para buscar os dados do posto quando o ID mudar.
  useEffect(() => {
    if (id) {
      fetchStationDetails(id);
    }
    // A função de limpeza garante que, ao sair da tela, os dados antigos sejam removidos.
    // Isso evita mostrar rapidamente os detalhes de um posto anterior ao entrar em um novo.
    return () => {
      clearSelectedStation();
    };
  }, [id, fetchStationDetails]);

  // Efeito para buscar o histórico de preços.
  useEffect(() => {
    if (id) {
      const { startDate, endDate } = getPeriodDates(selectedPeriod);
      const params = {
        startDate,
        endDate,
        product: selectedProduct !== "all" ? selectedProduct : undefined,
      };
      fetchPriceHistory(id, params);
    }
  }, [id, selectedPeriod, selectedProduct, fetchPriceHistory]);

  const handleGetDirections = () => {
    if (!selectedStation?.localization.coordinates) return;
    const { coordinates } = selectedStation.localization.coordinates;
    const [longitude, latitude] = coordinates;
    const scheme = Platform.select({
      ios: "maps:0,0?q=",
      android: "geo:0,0?q=",
    });
    const latLng = `${latitude},${longitude}`;
    const label = selectedStation.legal_name;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });
    if (url) Linking.openURL(url);
  };

  /**
   * ✅ BOA PRÁTICA: Função para tentar a busca novamente.
   * Limpa o erro anterior e chama a função de busca novamente.
   */
  const handleRetry = () => {
    if (id) {
      clearError();
      fetchStationDetails(id);
    }
  };

  /**
   * ✅ BOA PRÁTICA: Gerenciamento explícito dos estados da tela.
   * A lógica de renderização segue uma ordem clara:
   * 1. Está carregando?
   * 2. Ocorreu um erro?
   * 3. Deu sucesso e temos os dados?
   */

  // 1. Estado de Carregamento
  if (isDetailsLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Buscando dados do posto...</Text>
      </View>
    );
  }

  // 2. Estado de Erro
  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={48} color={colors.error} />
        <Text style={styles.errorTitle}>Ocorreu um Erro</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Button
          title="Tentar Novamente"
          onPress={handleRetry}
          color={colors.primary}
        />
      </View>
    );
  }

  // 3. Verificação final de dados antes de renderizar o sucesso.
  // Se não estiver carregando e não tiver erro, mas a estação for nula,
  // é um estado inválido, então não renderizamos nada para evitar crashes.
  if (!selectedStation) {
    // Isso pode acontecer brevemente ou em casos de erro inesperado.
    // Retornar nulo é seguro.
    return null;
  }

  // 4. Estado de Sucesso: Renderiza a tela principal com os dados.
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          headerTransparent: true,
          title: "",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              <Ionicons name="chevron-back" size={24} color={colors.white} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => {}} style={styles.headerButton}>
              <Ionicons name="heart-outline" size={24} color={colors.white} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView>
        <View style={styles.heroSection}>
          <Text style={styles.stationName}>{selectedStation.legal_name}</Text>
          {selectedStation.trade_name && (
            <Text style={styles.tradeName}>{selectedStation.trade_name}</Text>
          )}
          <View style={styles.infoRow}>
            <Ionicons name="pricetag-outline" size={16} color={colors.white} />
            <Text style={styles.heroInfoText}>
              Bandeira: {selectedStation.brand}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color={colors.white} />
            <Text
              style={styles.heroInfoText}
            >{`${selectedStation.localization.city}, ${selectedStation.localization.state}`}</Text>
          </View>
        </View>

        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={styles.directionsButton}
            onPress={handleGetDirections}
          >
            <Ionicons
              name="navigate-circle-outline"
              size={24}
              color={colors.white}
            />
            <Text style={styles.directionsButtonText}>Traçar Rota</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Tabela de Preços</Text>
            {selectedStation.fuelPrices.length > 0 ? (
              selectedStation.fuelPrices.map((fuel) => {
                return (
                  <View key={fuel.name} style={styles.priceRow}>
                    <View style={styles.fuelInfoContainer}>
                      {/* Adicione o ícone aqui */}
                      <FuelIcon
                        fuelName={fuel.name}
                        width={30}
                        height={30}
                      />
                      <View style={styles.fuelTextContainer}>
                        <Text style={styles.fuelName}>{fuel.name}</Text>
                        <Text style={styles.lastUpdated}>
                          Atualizado em:{" "}
                          {new Date(fuel.lastupdated).toLocaleDateString(
                            "pt-BR"
                          )}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.fuelPrice}>
                      {Number(fuel.price).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </Text>
                  </View>
                );
              })
            ) : (
              <Text style={styles.infoText}>Nenhum preço informado.</Text>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Histórico de Preços</Text>

            <Text style={styles.filterLabel}>Período</Text>
            <View style={styles.filterContainer}>
              {(["week", "month", "semester"] as Period[]).map((period) => (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.filterButton,
                    selectedPeriod === period && styles.filterButtonActive,
                  ]}
                  onPress={() => setSelectedPeriod(period)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      selectedPeriod === period &&
                        styles.filterButtonTextActive,
                    ]}
                  >
                    {period === "week"
                      ? "7 dias"
                      : period === "month"
                      ? "30 dias"
                      : "6 meses"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterLabel}>Combustível</Text>

            {/* 2. SUBSTITUIR O SELETOR ANTIGO PELO NOVO */}
            <ChipSelector
              options={selectedStation.fuelPrices.map((p) => p.name)}
              selectedValue={selectedProduct}
              onSelect={setSelectedProduct}
            />

            {isHistoryLoading ? (
              <ChartSkeleton />
            ) : (
              <PriceHistoryChart
                priceHistory={priceHistory}
                selectedProduct={selectedProduct}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fuelInfoContainer: { flexDirection: "row", alignItems: "center" },
  fuelTextContainer: { marginLeft: 12 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: colors.textSecondary,
    fontSize: 16,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },
  headerButton: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    padding: 8,
    borderRadius: 20,
  },
  heroSection: {
    backgroundColor: colors.primary,
    paddingTop: 100,
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  stationName: {
    fontSize: 26,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 4,
  },
  tradeName: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 16,
  },
  infoRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  heroInfoText: { marginLeft: 8, fontSize: 16, color: colors.white },
  ctaContainer: { marginTop: -40, paddingHorizontal: 20, alignItems: "center" },
  directionsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.secondary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    width: "80%",
  },
  directionsButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  contentContainer: { padding: 20 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  fuelName: { fontSize: 16, fontWeight: "500", color: colors.text },
  lastUpdated: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  fuelPrice: { fontSize: 18, fontWeight: "bold", color: colors.primary },
  infoText: { fontSize: 16, color: colors.textSecondary },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 10,
    marginLeft: 4,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.border,
  },
  filterButtonActive: { backgroundColor: colors.primary },
  filterButtonText: { color: colors.textSecondary, fontWeight: "500" },
  filterButtonTextActive: { color: colors.white },
  
});
