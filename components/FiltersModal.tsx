import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { X } from "lucide-react-native";
import { Button } from "./Button";
import { colors } from "@/constants/colors";


type FiltersModalProps = {
  visible: boolean;
  onClose: () => void;
  fuelTypes: any[];
  selectedFuelType: string;
  setSelectedFuelType: (fuel: string) => void;
  sortBy: string;
  setSortBy: (
    sort: "distanceAsc" | "priceAsc" | "distanceDesc" | "priceDesc"
  ) => void;
  radius: number;
  setRadius: (r: number) => void;
  onApply: () => void;
  onClear: () => void;
  activeFilterCount: number;
};

const FilterSection: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.optionsContainer}>{children}</View>
  </View>
);

const FilterOptionButton: React.FC<{
  label: string;
  isActive: boolean;
  onPress: () => void;
}> = ({ label, isActive, onPress }) => (
  <TouchableOpacity
    style={[styles.optionButton, isActive && styles.optionButtonActive]}
    onPress={onPress}
  >
    <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

export const FiltersModal = ({
  visible,
  onClose,
  fuelTypes,
  selectedFuelType,
  setSelectedFuelType,
  sortBy,
  setSortBy,
  radius,
  setRadius,
  onApply,
  onClear,
  activeFilterCount,
}: FiltersModalProps) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filtrar</Text>
          <TouchableOpacity onPress={onClear}>
            <Text style={styles.clearButton}>Limpar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <FilterSection title="Combustível">
            <FilterOptionButton
              label="Todos"
              isActive={!selectedFuelType}
              onPress={() => setSelectedFuelType("")}
            />
            {fuelTypes.map((fuel,i) => (
              <FilterOptionButton
                key={fuel.id}
                label={fuel.name}
                isActive={selectedFuelType === fuel.name}
                onPress={() => setSelectedFuelType(fuel.name)}
              />
            ))}
          </FilterSection>

          <FilterSection title="Ordenar por">
            <FilterOptionButton
              label="Menor Distância"
              isActive={sortBy === "distanceAsc"}
              onPress={() => setSortBy("distanceAsc")}
            />
            {/* O espaço em branco " " que causava o erro foi removido daqui */}
            <FilterOptionButton
              label="Maior Distância"
              isActive={sortBy === "distanceDesc"}
              onPress={() => setSortBy("distanceDesc")}
            />
            <FilterOptionButton
              label="Menor Preço"
              isActive={sortBy === "priceAsc"}
              onPress={() => setSortBy("priceAsc")}
            />
            <FilterOptionButton
              label="Maior Preço"
              isActive={sortBy === "priceDesc"}
              onPress={() => setSortBy("priceDesc")}
            />
          </FilterSection>

          <FilterSection title="Raio de Busca">
            {[5, 10, 20, 50, 999].map((r) => (
              <FilterOptionButton
                key={r}
                label={`${r} km`}
                isActive={radius === r}
                onPress={() => setRadius(r)}
              />
            ))}
          </FilterSection>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={`Ver Resultados`}
            onPress={onApply}
            variant="primary"
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
    marginTop: "10%", // Simula um BottomSheet
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  clearButton: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "500",
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionButtonActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  optionText: {
    color: colors.text,
    fontSize: 14,
  },
  optionTextActive: {
    color: colors.primary,
    fontWeight: "bold",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});