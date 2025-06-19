import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import { EmptyState } from "@/components/EmptyState";
import { useMemo, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { Dimensions, ScrollView, View } from "react-native";
import { colors } from "@/constants/colors";
import type { Product } from "@/types";


interface IDataChart {
  product_name: string;
  prices: Product[];
}
export type PriceHistoryChartProps = {
  priceHistory: IDataChart[];
  selectedProduct: string;
};

const screenWidth = Dimensions.get("window").width;

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


export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({
  priceHistory,
  selectedProduct,
}) => {
  const [tooltipPos, setTooltipPos] = useState<any>(null);

  const chartData = useMemo(() => {
    if (!priceHistory || priceHistory.length === 0) return null;
    let filteredHistory = priceHistory;
    if (selectedProduct !== "TODOS") {
      filteredHistory = priceHistory.filter(
        (p: { product_name: string }) => p.product_name === selectedProduct
      );
    }
    if (filteredHistory.length === 0) return null;

    const allPrices: number[] = (
      filteredHistory as IDataChart[]
    ).flatMap((p: IDataChart) =>
      p.prices.map((pricePoint: Product) => Number(pricePoint.price))
    );
    if (allPrices.length === 0) return null;
    const sortedPrices = filteredHistory
      .flatMap((p) => p.prices)
      .sort((a, b) => new Date(a.collection_date).getTime() - new Date(b.collection_date).getTime());
    const labels = [
      ...new Set(
        sortedPrices.map((p) =>
          new Date(p.collection_date).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
          })
        )
      ),
    ];
    const segmentWidth = 60;
    const chartWidth = Math.max(screenWidth - 48, labels.length * segmentWidth);
    const minPrice = Math.min(...allPrices);
    const yAxisMin = Math.max(0, minPrice - 0.1);
    const datasets = filteredHistory.map((productHistory, index) => {
      const data = labels.map((label) => {
        const pricePoint: Product | undefined = (
          productHistory as IDataChart
        ).prices.find(
          (p: Product) =>
            new Date(p.collection_date).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
            }) === label
        );
        return pricePoint ? pricePoint.price : null;
      });
      for (let i = 1; i < data.length; i++) {
        if (data[i] === null) data[i] = data[i - 1];
      }
      return {
        data: data.filter((d) => d !== null).map((d) => Number(d)) as number[],
        color: (opacity = 1) =>
          chartColors[index % chartColors.length](opacity),
        strokeWidth: 2,
      };
    });
    return {
      labels,
      datasets,
      legend: filteredHistory.map((p) => p.product_name),
      chartWidth,
      yAxisMin,
    };
  }, [priceHistory, selectedProduct]);

  if (!chartData) {
    return (
      <EmptyState
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderStyle: "dashed",
          elevation: 0,
          shadowOpacity: 0,
        }}
        icon={
          <Ionicons name="bar-chart-outline" size={40} color={colors.warning} />
        }
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
              const dateLabel = chartData.labels[index] || "";
              setTooltipPos({ x, y, visible: true, value, date: dateLabel });
            }}
          />
          {tooltipPos?.visible && (
            <View
              style={[
                styles.tooltip,
                { left: tooltipPos.x - 40, top: tooltipPos.y - 50 },
              ]}
            >
              <Text
                style={styles.tooltipText}
              >{`Data: ${tooltipPos.date}`}</Text>
              <Text style={styles.tooltipText}>{`Preço: ${Number(
                tooltipPos.value
              ).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}`}</Text>
            </View>
          )}
        </View>
      </ScrollView>
      <View style={styles.legendContainer}>
        {chartData.legend.map((legendItem: string, index: number) => (
          <View key={legendItem} style={styles.legendItem}>
            <View
              style={[
                styles.legendColorBox,
                { backgroundColor: chartColors[index % chartColors.length](1) },
              ]}
            />
            <Text style={styles.legendText}>{legendItem}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chart: { marginVertical: 8, borderRadius: 12 },
  tooltip: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 6,
    padding: 8,
    zIndex: 1000,
  },
  tooltipText: { color: colors.white, fontSize: 12, fontWeight: "bold" },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 12,
    paddingHorizontal: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 8,
  },
  legendColorBox: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  legendText: { fontSize: 12, color: colors.textSecondary },
});
