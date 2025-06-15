import { colors } from "@/constants/colors";
import { getIconNameFromFuel } from "@/utils/getIconNameFromFuel";
import { View, Text, StyleSheet } from "react-native";
import { AppIcon } from "./ui/AppIcon";

type FuelPrice = {
  name: string;
  price: number;
  lastupdated: string;
};

type TablePriceProps = {
  selectedStation: { fuelPrices: FuelPrice[] };
};

export const TablePrices: React.FC<TablePriceProps> = ({ selectedStation }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Tabela de Preços</Text>
      {selectedStation.fuelPrices.map((fuel, index) => {
        const iconName = getIconNameFromFuel(fuel.name);
        return (
          <View
            key={fuel.name}
            style={[
              styles.priceRow,
              index === selectedStation.fuelPrices.length - 1 &&
                styles.priceRowLast,
            ]}
          >
            <View style={styles.fuelInfoContainer}>
              <AppIcon name={iconName} width={30} height={30} />
              <View style={styles.fuelTextContainer}>
                <Text style={styles.fuelName}>{fuel.name}</Text>
                <Text style={styles.lastUpdated}>
                  Atualizado em:{" "}
                  {new Date(fuel.lastupdated).toLocaleDateString("pt-BR")}
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
