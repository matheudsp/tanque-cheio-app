import { colors } from "@/constants/colors";
import { getIconNameFromFuel } from "@/utils/getIconNameFromFuel";
import { View, Text, StyleSheet } from "react-native";
import { AppIcon } from "./shared/AppIcon";
import type { Product } from "@/types";


type TablePriceProps = {
  selectedStation: { fuel_prices: Product[] };
};

/**
 * @param dateString A data no formato 'AAAA-MM-DD'.
 * @returns A data formatada como 'dd/MM/yyyy' ou uma mensagem de erro.
 */
const formatDate = (dateString: string) => {
  try {
    if (!dateString) return "Data não informada";
    const date = new Date(`${dateString}T00:00:00`);
    
    if (isNaN(date.getTime())) {
      return "Data inválida";
    }
    return date.toLocaleDateString("pt-BR", {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return "Data inválida";
  }
};

export const TablePrices: React.FC<TablePriceProps> = ({ selectedStation }) => {
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
                  Atualizado em:{" "}
                  
                  {formatDate(fuel.collection_date)}
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  priceRowLast: { borderBottomWidth: 0 },
  fuelInfoContainer: { flexDirection: "row", alignItems: "center" },
  fuelTextContainer: { marginLeft: 12 },
  fuelName: { fontSize: 16, fontWeight: "600", color: colors.text },
  lastUpdated: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  fuelPrice: { fontSize: 18, fontWeight: "bold", color: colors.primary },
});
