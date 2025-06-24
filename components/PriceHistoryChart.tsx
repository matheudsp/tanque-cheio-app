import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { AbstractChartConfig } from "react-native-chart-kit/dist/AbstractChart";

import { EmptyState } from "./ui/EmptyState";
import { useTheme } from "@/providers/themeProvider";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import type { ThemeState } from "@/types/theme";
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

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({
  priceHistory,
  selectedProduct,
}) => {
  const [tooltipPos, setTooltipPos] = useState<any>(null);
  const { themeState } = useTheme();
  const styles = useStylesWithTheme(getStyles);

  const chartColors = useMemo(
    () => [
      (opacity = 1) =>
        `rgba(${parseInt(
          themeState.colors.primary.main.slice(1, 3),
          16
        )}, ${parseInt(
          themeState.colors.primary.main.slice(3, 5),
          16
        )}, ${parseInt(
          themeState.colors.primary.main.slice(5, 7),
          16
        )}, ${opacity})`,
      (opacity = 1) =>
        `rgba(${parseInt(themeState.colors.error.slice(1, 3), 16)}, ${parseInt(
          themeState.colors.error.slice(3, 5),
          16
        )}, ${parseInt(themeState.colors.error.slice(5, 7), 16)}, ${opacity})`,
      (opacity = 1) =>
        `rgba(${parseInt(
          themeState.colors.success.slice(1, 3),
          16
        )}, ${parseInt(themeState.colors.success.slice(3, 5), 16)}, ${parseInt(
          themeState.colors.success.slice(5, 7),
          16
        )}, ${opacity})`,
      (opacity = 1) =>
        `rgba(${parseInt(
          themeState.colors.warning.slice(1, 3),
          16
        )}, ${parseInt(themeState.colors.warning.slice(3, 5), 16)}, ${parseInt(
          themeState.colors.warning.slice(5, 7),
          16
        )}, ${opacity})`,
    ],
    [themeState]
  );

  const lineChartConfig: AbstractChartConfig = useMemo(
    () => ({
      backgroundGradientFrom: themeState.colors.background.paper,
      backgroundGradientTo: themeState.colors.background.paper,
      decimalPlaces: 2,
      color: (opacity = 1) =>
        `rgba(${parseInt(
          themeState.colors.text.primary.slice(1, 3),
          16
        )}, ${parseInt(
          themeState.colors.text.primary.slice(3, 5),
          16
        )}, ${parseInt(
          themeState.colors.text.primary.slice(5, 7),
          16
        )}, ${opacity})`,
      labelColor: (opacity = 1) =>
        `rgba(${parseInt(
          themeState.colors.text.secondary.slice(1, 3),
          16
        )}, ${parseInt(
          themeState.colors.text.secondary.slice(3, 5),
          16
        )}, ${parseInt(
          themeState.colors.text.secondary.slice(5, 7),
          16
        )}, ${opacity})`,
      propsForDots: { r: "4", strokeWidth: "2" },
    }),
    [themeState]
  );

  const chartData = useMemo(() => {
    if (!priceHistory || priceHistory.length === 0) return null;
    let filteredHistory = priceHistory;
    if (selectedProduct !== "TODOS") {
      filteredHistory = priceHistory.filter(
        (p) => p.product_name === selectedProduct
      );
    }
    if (filteredHistory.length === 0) return null;

    const allPrices: number[] = filteredHistory.flatMap((p) =>
      p.prices.map((pricePoint) => Number(pricePoint.price))
    );
    if (allPrices.length === 0) return null;
    const sortedPrices = filteredHistory
      .flatMap((p) => p.prices)
      .sort(
        (a, b) =>
          new Date(a.collection_date).getTime() -
          new Date(b.collection_date).getTime()
      );
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
        const pricePoint = productHistory.prices.find(
          (p) =>
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
        data: data.filter((d) => d !== null).map((d) => Number(d)),
        color: chartColors[index % chartColors.length],
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
  }, [priceHistory, selectedProduct, chartColors]);

  if (!chartData) {
    return (
      <EmptyState
        style={styles.emptyContainer}
        icon={
          <Ionicons
            name="bar-chart-outline"
            size={40}
            color={themeState.colors.warning}
          />
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

const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    chart: {
      marginVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.large,
    },
    tooltip: {
      position: "absolute",
      backgroundColor: theme.colors.background.elevated,
      borderRadius: theme.borderRadius.small,
      padding: theme.spacing.sm,
      zIndex: 1000,
      ...theme.shadows.shadowMd,
    },
    tooltipText: {
      color: theme.colors.text.primary,
      fontSize: 12,
      fontWeight: "bold",
    },
    legendContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      marginTop: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
    },
    legendColorBox: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: theme.spacing.sm,
    },
    legendText: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    emptyContainer: {
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderStyle: "dashed",
      elevation: 0,
      shadowOpacity: 0,
      backgroundColor: "transparent",
    },
  });
