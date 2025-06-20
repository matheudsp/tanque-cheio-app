

import { colors } from "@/constants/colors";
import type { GasStation } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Modal, TouchableOpacity, View, Text, FlatList, StyleSheet, Switch } from "react-native";
import { PremiumBadge } from "./shared/PremiumBadge"; // Importe o badge
import { LinearGradient } from 'expo-linear-gradient'; // Importe o gradiente

export const FavoriteFuelModal = ({
  isVisible,
  onClose,
  station,
  onToggleFavorite,
  isFavorite,
}: {
  isVisible: boolean;
  onClose: () => void;
  station: GasStation | null;
  onToggleFavorite: (productId: string) => void;
  isFavorite: (stationId: string, productId: string) => boolean;
}) => {
  if (!station) return null;

  return (
    <Modal
      animationType="slide" // Mude a animação para 'slide' para o efeito de subir
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      {/* O overlay agora fecha o modal ao ser tocado */}
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose} 
      >
        {/* Adicionado para previnir que o toque no modal feche-o */}
        <TouchableOpacity activeOpacity={1} style={styles.modalContainer}>
          {/* CABEÇALHO PREMIUM */}
          <LinearGradient
            colors={[colors.secondary, colors.warning]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerTitleContainer}>
              <Ionicons name="notifications" size={24} color={colors.white} />
              <Text style={styles.modalTitle}>Gerenciar Alertas</Text>
            </View>
            <PremiumBadge />
          </LinearGradient>

          <Text style={styles.modalSubtitle}>
            Selecione os combustíveis que você deseja receber alertas de preço.
          </Text>

          {/* LISTA DE COMBUSTÍVEIS COM SWITCH */}
          <FlatList
            data={station.fuel_prices}
            keyExtractor={(item) => item.product_id}
            style={{ width: "100%" }}
            renderItem={({ item }) => {
              const isAlertActive = isFavorite(station.id, item.product_id);
              return (
                <TouchableOpacity
                  style={styles.fuelItem}
                  onPress={() => onToggleFavorite(item.product_id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.fuelItemText}>{item.product_name}</Text>
                  <Switch
                    value={isAlertActive}
                    onValueChange={() => onToggleFavorite(item.product_id)}
                    trackColor={{ false: colors.border, true: colors.primaryLight }}
                    thumbColor={isAlertActive ? colors.primary : colors.textSecondary}
                    ios_backgroundColor={colors.border}
                  />
                </TouchableOpacity>
              );
            }}
          />

          {/* BOTÃO DE FECHAR */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Concluído</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end", // Alinha o modal na parte de baixo
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  modalContainer: {
    backgroundColor: colors.background, // Cor de fundo do conteúdo
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30, // Espaço para o botão de fechar
    maxHeight: "75%", // Altura máxima do modal
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.white,
  },
  modalSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    padding: 20,
    paddingTop: 16,
  },
  fuelItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  fuelItemText: {
    fontSize: 17,
    color: colors.text,
    flex: 1,
  },
  closeButton: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  closeButtonText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },
});