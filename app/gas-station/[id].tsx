import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Linking,
  Platform,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { useGasStationStore } from "@/store/GasStationStore";
import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import { EmptyState } from "@/components/EmptyState";
import { ChartSkeleton } from "@/components/ChartSkeleton";
import { ChipSelector } from "@/components/ChipSelector"; // 1. Importar o novo componente

const screenWidth = Dimensions.get("window").width;
type Period = "week" | "month" | "semester";

// Função auxiliar para calcular datas
const getPeriodDates = (period: Period) => {
  const endDate = new Date();
  const startDate = new Date();
  switch (period) {
    case "week": startDate.setDate(endDate.getDate() - 7); break;
    case "semester": startDate.setMonth(endDate.getMonth() - 6); break;
    case "month": default: startDate.setDate(endDate.getDate() - 30); break;
  }
  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
};

// Sub-componente para o gráfico, para melhor organização
type PriceHistoryChartProps = {
  priceHistory: any[]; // Replace 'any[]' with the correct type if available
  selectedProduct: string;
};

const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ priceHistory, selectedProduct }) => {
  const [tooltipPos, setTooltipPos] = useState<any>(null);

  const chartData = useMemo(() => {
    if (!priceHistory || priceHistory.length === 0) return null;
    let filteredHistory = priceHistory;
    if (selectedProduct !== 'all') {
      filteredHistory = priceHistory.filter((p) => p.productName === selectedProduct);
    }
    if (filteredHistory.length === 0) return null;
    interface PricePoint {
      date: string;
      price: number;
    }

    interface ProductPriceHistory {
      productName: string;
      prices: PricePoint[];
    }

    const allPrices: number[] = (filteredHistory as ProductPriceHistory[]).flatMap((p: ProductPriceHistory) => p.prices.map((pricePoint: PricePoint) => pricePoint.price));
    if (allPrices.length === 0) return null;
    const sortedPrices = filteredHistory.flatMap(p => p.prices).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const labels = [...new Set(sortedPrices.map((p) => new Date(p.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })))];
    const segmentWidth = 60;
    const chartWidth = Math.max(screenWidth - 48, labels.length * segmentWidth);
    const minPrice = Math.min(...allPrices);
    const yAxisMin = Math.max(0, minPrice - 0.10);
    const datasets = filteredHistory.map((productHistory, index) => {
      const data = labels.map((label) => {
        const pricePoint = productHistory.prices.find((p) => new Date(p.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) === label);
        return pricePoint ? pricePoint.price : null;
      });
      for (let i = 1; i < data.length; i++) { if (data[i] === null) data[i] = data[i - 1]; }
      return {
        data: data.filter((d) => d !== null) as number[],
        color: (opacity = 1) => chartColors[index % chartColors.length](opacity),
        strokeWidth: 2,
      };
    });
    return { labels, datasets, legend: filteredHistory.map((p) => p.productName), chartWidth, yAxisMin };
  }, [priceHistory, selectedProduct]);

  if (!chartData) {
    return (
      <EmptyState
        style={{ borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed', elevation: 0, shadowOpacity: 0 }}
        icon={<Ionicons name="bar-chart-outline" size={40} color={colors.warning} />}
        title="Sem Dados para Exibir"
        description="Não encontramos histórico de preços para o período ou combustível selecionado. Tente alterar os filtros."
      />
    );
  }

  const chartConfig = { ...lineChartConfig, yAxisMin: chartData.yAxisMin };

  return (
    <View onTouchStart={() => setTooltipPos(null)}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <LineChart
            data={{ labels: chartData.labels, datasets: chartData.datasets }}
            width={chartData.chartWidth}
            height={250}
            yAxisLabel="R$ "
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            fromZero={false}
            onDataPointClick={({ value, x, y, index }) => {
              const dateLabel = chartData.labels[index] || '';
              setTooltipPos({ x, y, visible: true, value, date: dateLabel });
            }}
          />
          {tooltipPos?.visible && (
            <View style={[styles.tooltip, { left: tooltipPos.x - 40, top: tooltipPos.y - 50 }]}>
              <Text style={styles.tooltipText}>{`Data: ${tooltipPos.date}`}</Text>
              <Text style={styles.tooltipText}>{`Preço: ${Number(tooltipPos.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}</Text>
            </View>
          )}
        </View>
      </ScrollView>
      <View style={styles.legendContainer}>
        {chartData.legend.map((legendItem: string, index: number) => (
          <View key={legendItem} style={styles.legendItem}>
            <View style={[styles.legendColorBox, { backgroundColor: chartColors[index % chartColors.length](1) }]} />
            <Text style={styles.legendText}>{legendItem}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default function GasStationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [selectedPeriod, setSelectedPeriod] = useState<Period>("month");
  const [selectedProduct, setSelectedProduct] = useState<string>("all");

  const {
    selectedStation, priceHistory, isDetailsLoading, isHistoryLoading,
    error, fetchStationDetails, fetchPriceHistory, clearSelectedStation,
  } = useGasStationStore();

  useEffect(() => { if (id) fetchStationDetails(id); return () => clearSelectedStation(); }, [id, fetchStationDetails]);
  useEffect(() => { if (id) { const { startDate, endDate } = getPeriodDates(selectedPeriod); const params = { startDate, endDate, product: selectedProduct !== "all" ? selectedProduct : undefined }; fetchPriceHistory(id, params); } }, [id, selectedPeriod, selectedProduct, fetchPriceHistory]);

  const handleGetDirections = () => {
    if (!selectedStation?.localization.coordinates) return;
    const { coordinates } = selectedStation.localization.coordinates; const [longitude, latitude] = coordinates;
    const scheme = Platform.select({ ios: "maps:0,0?q=", android: "geo:0,0?q=" });
    const latLng = `${latitude},${longitude}`; const label = selectedStation.legal_name;
    const url = Platform.select({ ios: `${scheme}${label}@${latLng}`, android: `${scheme}${latLng}(${label})` });
    if (url) Linking.openURL(url);
  };

  if (isDetailsLoading && !selectedStation) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Buscando dados do posto...</Text>
      </View>
    );
  }

  if (error || !selectedStation) {
    if (!isDetailsLoading) router.back();
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          headerTransparent: true,
          title: "",
          headerLeft: () => (<TouchableOpacity onPress={() => router.back()} style={styles.headerButton}><Ionicons name="chevron-back" size={24} color={colors.white} /></TouchableOpacity>),
          headerRight: () => (<TouchableOpacity onPress={() => {}} style={styles.headerButton}><Ionicons name="heart-outline" size={24} color={colors.white} /></TouchableOpacity>),
        }}
      />

      <ScrollView>
        <View style={styles.heroSection}>
          <Text style={styles.stationName}>{selectedStation.legal_name}</Text>
          {selectedStation.trade_name && (<Text style={styles.tradeName}>{selectedStation.trade_name}</Text>)}
          <View style={styles.infoRow}><Ionicons name="pricetag-outline" size={16} color={colors.white} /><Text style={styles.heroInfoText}>Bandeira: {selectedStation.brand}</Text></View>
          <View style={styles.infoRow}><Ionicons name="location-outline" size={16} color={colors.white} /><Text style={styles.heroInfoText}>{`${selectedStation.localization.city}, ${selectedStation.localization.state}`}</Text></View>
        </View>

        <View style={styles.ctaContainer}>
          <TouchableOpacity style={styles.directionsButton} onPress={handleGetDirections}>
            <Ionicons name="navigate-circle-outline" size={24} color={colors.white} />
            <Text style={styles.directionsButtonText}>Traçar Rota</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Tabela de Preços</Text>
            {selectedStation.fuelPrices.length > 0 ? (
              selectedStation.fuelPrices.map((fuel) => (
                <View key={fuel.name} style={styles.priceRow}>
                  <View>
                    <Text style={styles.fuelName}>{fuel.name}</Text>
                    <Text style={styles.lastUpdated}>Atualizado em: {new Date(fuel.lastupdated).toLocaleDateString("pt-BR")}</Text>
                  </View>
                  <Text style={styles.fuelPrice}>{Number(fuel.price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</Text>
                </View>
              ))
            ) : (<Text style={styles.infoText}>Nenhum preço informado.</Text>)}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Histórico de Preços</Text>
            
            <Text style={styles.filterLabel}>Período</Text>
            <View style={styles.filterContainer}>
              {(["week", "month", "semester"] as Period[]).map((period) => (
                <TouchableOpacity key={period} style={[styles.filterButton, selectedPeriod === period && styles.filterButtonActive]} onPress={() => setSelectedPeriod(period)}>
                  <Text style={[styles.filterButtonText, selectedPeriod === period && styles.filterButtonTextActive]}>
                    {period === "week" ? "7 dias" : period === "month" ? "30 dias" : "6 meses"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterLabel}>Combustível</Text>
            
            {/* 2. SUBSTITUIR O SELETOR ANTIGO PELO NOVO */}
            <ChipSelector
                options={selectedStation.fuelPrices.map(p => p.name)}
                selectedValue={selectedProduct}
                onSelect={setSelectedProduct}
            />
            
            {isHistoryLoading ? (
              <ChartSkeleton />
            ) : (
              <PriceHistoryChart priceHistory={priceHistory} selectedProduct={selectedProduct} />
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Configurações de cores e estilos
const chartColors = [
  (opacity = 1) => `rgba(28, 115, 204, ${opacity})`,
  (opacity = 1) => `rgba(220, 53, 69, ${opacity})`,
  (opacity = 1) => `rgba(25, 135, 84, ${opacity})`,
  (opacity = 1) => `rgba(255, 193, 7, ${opacity})`,
];

const lineChartConfig = {
  backgroundGradientFrom: colors.white,
  backgroundGradientTo: colors.white,
  decimalPlaces: 2,
  color: (opacity = 1) => `rgba(28, 115, 204, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
  propsForDots: { r: "4", strokeWidth: "2" },
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background },
  loadingText: { marginTop: 10, color: colors.textSecondary },
  headerButton: { backgroundColor: "rgba(0, 0, 0, 0.3)", padding: 8, borderRadius: 20 },
  heroSection: { backgroundColor: colors.primary, paddingTop: 100, paddingHorizontal: 20, paddingBottom: 60 },
  stationName: { fontSize: 26, fontWeight: "bold", color: colors.white, marginBottom: 4 },
  tradeName: { fontSize: 18, color: "rgba(255, 255, 255, 0.9)", marginBottom: 16 },
  infoRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  heroInfoText: { marginLeft: 8, fontSize: 16, color: colors.white },
  ctaContainer: { marginTop: -40, paddingHorizontal: 20, alignItems: "center" },
  directionsButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: colors.secondary, paddingVertical: 16, paddingHorizontal: 32, borderRadius: 30, elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65, width: "80%" },
  directionsButtonText: { color: colors.white, fontSize: 18, fontWeight: "bold", marginLeft: 10 },
  contentContainer: { padding: 20 },
  card: { backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 20, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: colors.text, marginBottom: 16 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  fuelName: { fontSize: 16, fontWeight: "500", color: colors.text },
  lastUpdated: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  fuelPrice: { fontSize: 18, fontWeight: "bold", color: colors.primary },
  infoText: { fontSize: 16, color: colors.textSecondary },
  chart: { marginVertical: 8, borderRadius: 12 },
  filterLabel: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 10, marginLeft: 4 },
  filterContainer: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  filterButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: colors.border },
  filterButtonActive: { backgroundColor: colors.primary },
  filterButtonText: { color: colors.textSecondary, fontWeight: "500" },
  filterButtonTextActive: { color: colors.white },
  tooltip: { position: "absolute", backgroundColor: "rgba(0, 0, 0, 0.7)", borderRadius: 6, padding: 8, zIndex: 1000 }, // zIndex alto
  tooltipText: { color: colors.white, fontSize: 12, fontWeight: "bold" },
  legendContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 12, paddingHorizontal: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16, marginBottom: 8 },
  legendColorBox: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  legendText: { fontSize: 12, color: colors.textSecondary },
});