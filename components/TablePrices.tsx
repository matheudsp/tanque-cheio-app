import { StyleSheet, Text, View } from "react-native";
import React from "react";

import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import { getIconNameFromFuel } from "@/utils/getIconNameFromFuel";
import type { ThemeState } from "@/types/theme";
import type { Product } from "@/types";
import { AppIcon } from "./ui/AppIcon";

type TablePriceProps = {
  selectedStation: { fuel_prices: Product[] };
};

const formatDate = (dateString: string) => {
  try {
    if (!dateString) return "Data não informada";
    const date = new Date(`${dateString}T00:00:00`);

    if (isNaN(date.getTime())) {
      return "Data inválida";
    }
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return "Data inválida";
  }
};

export const TablePrices: React.FC<TablePriceProps> = ({ selectedStation }) => {
  const styles = useStylesWithTheme(getStyles);

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Tabela de Preços</Text>
      {selectedStation.fuel_prices.map((fuel, index) => {
        const iconName = getIconNameFromFuel(fuel.product_name);
        return (
          <View
            key={fuel.product_name}
            style={[
              styles.priceRow,
              index === selectedStation.fuel_prices.length - 1 &&
                styles.priceRowLast,
            ]}
          >
            <View style={styles.fuelInfoContainer}>
              <AppIcon name={iconName} width={30} height={30} />
              <View style={styles.fuelTextContainer}>
                <Text style={styles.fuelName}>{fuel.product_name}</Text>
                <Text style={styles.lastUpdated}>
                  Atualizado em: {formatDate(fuel.collection_date)}
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
      })}
    </View>
  );
};

const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.background.paper,
      borderRadius: theme.borderRadius.large,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.large,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.lg,
    },
    priceRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    priceRowLast: {
      borderBottomWidth: 0,
    },
    fuelInfoContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    fuelTextContainer: {
      marginLeft: theme.spacing.md,
    },
    fuelName: {
      fontSize: theme.typography.fontSize.medium,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
    },
    lastUpdated: {
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.xs,
    },
    fuelPrice: {
      fontSize: 18,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primary.main,
    },
  });
