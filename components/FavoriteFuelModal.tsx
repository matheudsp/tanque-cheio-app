import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Modal,
  TouchableOpacity,
  View,
  Text,
  FlatList,
  StyleSheet,
  Switch,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { GasStation } from "@/types/gas-stations";
import { colors } from "@/constants/colors";
import { useFavoriteStore } from "@/store/favoriteStore";

// Imports para Gestos e Feedback Tátil
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

// Lógica de props e funcional intacta
interface FavoriteFuelModalProps {
  isVisible: boolean;
  onClose: () => void;
  station: GasStation | null;
}

const MODAL_HEIGHT = Dimensions.get("window").height * 0.65;
const CLOSE_THRESHOLD = MODAL_HEIGHT * 0.4;

export const FavoriteFuelModal = ({
  isVisible,
  onClose,
  station,
}: FavoriteFuelModalProps) => {
  if (!station) return null;

  // --- LÓGICA FUNCIONAL (INTACTA) ---
  const {
    isFavorite,
    updateFavoritesInBulk,
    isLoading: isSaving,
  } = useFavoriteStore();
  const [localSelectedProducts, setLocalSelectedProducts] = useState<
    Set<string>
  >(new Set());

  const translateY = useSharedValue(MODAL_HEIGHT);

  const initialSelectedProducts = useMemo(() => {
    const initiallyFavorited = new Set<string>();
    if (station) {
      station.fuel_prices.forEach((product) => {
        if (isFavorite(station.id, product.product_id)) {
          initiallyFavorited.add(product.product_id);
        }
      });
    }
    return initiallyFavorited;
  }, [station, isFavorite]);

  useEffect(() => {
    if (isVisible) {
      translateY.value = withSpring(0, { damping: 15 });
      setLocalSelectedProducts(new Set(initialSelectedProducts));
    }
  }, [isVisible, initialSelectedProducts]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateY.value = Math.max(0, event.translationY);
    })
    .onEnd(() => {
      if (translateY.value > CLOSE_THRESHOLD) {
        translateY.value = withTiming(MODAL_HEIGHT, { duration: 250 });
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0, { damping: 15 });
      }
    });

  const handleSaveChanges = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const productsToAdd = [...localSelectedProducts].filter(
      (id) => !initialSelectedProducts.has(id)
    );
    const productsToRemove = [...initialSelectedProducts].filter(
      (id) => !initialSelectedProducts.has(id)
    );

    if (productsToAdd.length > 0 || productsToRemove.length > 0) {
      await updateFavoritesInBulk(station.id, productsToAdd, productsToRemove);
    }
    onClose();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [
    station?.id,
    localSelectedProducts,
    initialSelectedProducts,
    updateFavoritesInBulk,
    onClose,
  ]);

  const handleToggleSwitch = useCallback((productId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLocalSelectedProducts((prev) => {
      const newSelection = new Set(prev);
      newSelection.has(productId)
        ? newSelection.delete(productId)
        : newSelection.add(productId);
      return newSelection;
    });
  }, []);

  const renderFuelItem = useCallback(
    ({ item }: { item: GasStation["fuel_prices"][0] }) => (
      <View style={styles.fuelItem}>
        <Text style={styles.fuelName}>{item.product_name}</Text>
        <Switch
          trackColor={{ false: "#E9E9EA", true: colors.primary }}
          thumbColor={colors.white}
          onValueChange={() => handleToggleSwitch(item.product_id)}
          value={localSelectedProducts.has(item.product_id)}
          style={styles.switch}
        />
      </View>
    ),
    [localSelectedProducts, handleToggleSwitch]
  );
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <Modal transparent={true} visible={isVisible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.modalContainer, animatedStyle]}>
            <SafeAreaView style={{ flex: 1 }}>
              {/* Header com Título Centralizado e Botão de Fechar na Direita */}
              <View style={styles.header}>
                <View style={styles.headerAction} />
                <Text
                  style={styles.headerTitle}
                  numberOfLines={1}
                >{`Gerenciar Alertas`}</Text>
                <TouchableOpacity
                  onPress={onClose}
                  disabled={isSaving}
                  style={styles.headerAction}
                >
                 <Text style={styles.headerCloseText}>Fechar</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.explanatoryText}>
                Ative os combustíveis que você mais usa para vê-los em destaque
                na sua lista de favoritos.
              </Text>

              <View style={styles.listWrapper}>
                <FlatList
                  data={station.fuel_prices}
                  renderItem={renderFuelItem}
                  keyExtractor={(item) => item.product_id}
                  ItemSeparatorComponent={() => (
                    <View style={styles.separator} />
                  )}
                  style={styles.flatList}
                />
              </View>

              <View style={styles.footer}>
                <TouchableOpacity
                  style={[styles.saveButton, isSaving && styles.savingButton]}
                  onPress={handleSaveChanges}
                  disabled={isSaving}
                  accessibilityLabel="Salvar alterações de favoritos"
                >
                  {isSaving ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.saveButtonText}>Salvar e Fechar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
};

// --- NOVOS ESTILOS COM FOCO NO HEADER ---
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    height: MODAL_HEIGHT,
    backgroundColor: "#F2F2F7",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0, 0, 0, 0.2)",
  },
  headerTitle: {
    flex: 1, // Permite que o título ocupe o espaço central
    textAlign: "center", // Centraliza o texto dentro do espaço
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
    marginHorizontal: 16, // Garante que o texto não cole nos botões
  },
  headerAction: {
    width: 64, 
    justifyContent: "center",
    alignItems: "center",
  },
  headerCloseText:{
    fontWeight:'600',
    color:colors.primary,
    fontSize:16
  },
  
  explanatoryText: {
    fontSize: 13,
    color: "#6D6D72",
    textAlign: "center",
    paddingHorizontal: 24,
    marginTop: 20,
    marginBottom: 16,
    lineHeight: 18,
  },
  listWrapper: {
    flex: 1,
    marginHorizontal: 16,
  },
  flatList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  fuelItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: 16,
    paddingRight: 12,
    height: 48,
    backgroundColor: "#FFFFFF",
  },
  fuelName: {
    fontSize: 17,
    color: "#000",
  },
  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  separator: {
    height: 0.5,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    marginLeft: 16,
  },
  footer: {
    padding: 16,
    paddingTop: 12,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  savingButton: {
    backgroundColor: colors.primary + "B3",
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: "600",
  },
});
