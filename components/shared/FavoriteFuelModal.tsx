import React, { useState, useEffect, useCallback } from "react";
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
import type { GasStation } from "@/types/gas-stations";
import { colors } from "@/constants/colors";
import { useFavoriteStore } from "@/store/favoriteStore";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

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

  const {
    updateFavoritesInBulk,
    isLoading,
    fetchFavoritesByStation,
    stationSpecificFavorites,
  } = useFavoriteStore();
  const [localSelection, setLocalSelection] = useState<Set<string>>(new Set());
  const translateY = useSharedValue(MODAL_HEIGHT);

  useEffect(() => {
    if (isVisible && station) {
      translateY.value = withSpring(0, { damping: 15 });

      fetchFavoritesByStation(station.id);
    }
  }, [isVisible, station, fetchFavoritesByStation]);

  useEffect(() => {
    setLocalSelection(stationSpecificFavorites);
  }, [stationSpecificFavorites]);

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

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleToggleSwitch = useCallback((productId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLocalSelection((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(productId)) {
        newSelection.delete(productId);
      } else {
        newSelection.add(productId);
      }
      return newSelection;
    });
  }, []);

  const handleSaveChanges = useCallback(async () => {
    if (!station) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Compara o estado inicial com a seleção local para determinar o que mudou
    const productsToAdd = [...localSelection].filter(
      (id) => !stationSpecificFavorites.has(id)
    );
    const productsToRemove = [...stationSpecificFavorites].filter(
      (id) => !localSelection.has(id)
    );

    // Só chama a API se houver mudanças
    if (productsToAdd.length > 0 || productsToRemove.length > 0) {
      await updateFavoritesInBulk(station.id, productsToAdd, productsToRemove);
    }

    runOnJS(onClose)(); // A função de fechar precisa ser chamada via runOnJS
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [
    station?.id,
    localSelection,
    stationSpecificFavorites,
    updateFavoritesInBulk,
    onClose,
  ]);

  const renderFuelItem = useCallback(
    ({ item }: { item: GasStation["fuel_prices"][0] }) => (
      <View style={styles.fuelItem}>
        <Text style={styles.fuelName}>{item.product_name}</Text>
        <Switch
          trackColor={{ false: "#E9E9EA", true: colors.primary }}
          thumbColor={colors.white}
          onValueChange={() => handleToggleSwitch(item.product_id)}
          value={localSelection.has(item.product_id)} // Usa a seleção local
          style={styles.switch}
          disabled={isLoading} // Desabilita durante o carregamento inicial
        />
      </View>
    ),
    [localSelection, handleToggleSwitch, isLoading]
  );

  // --- RENDERIZAÇÃO DO COMPONENTE ---

  return (
    <Modal transparent={true} visible={isVisible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.modalContainer, animatedStyle]}>
            <SafeAreaView style={{ flex: 1 }}>
              <View style={styles.header}>
                <View style={styles.headerAction} />
                <Text style={styles.headerTitle} numberOfLines={1}>
                  Gerenciar Alertas
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  disabled={isLoading}
                  style={styles.headerAction}
                >
                  <Text style={styles.headerCloseText}>Fechar</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.explanatoryText}>
                Ative os combustíveis que você deseja seguir para receber
                alertas sobre os preços.
              </Text>

              <View style={styles.listWrapper}>
                {isLoading ? (
                  <ActivityIndicator
                    size="large"
                    color={colors.primary}
                    style={{ marginTop: 40 }}
                  />
                ) : (
                  <FlatList
                    data={station.fuel_prices}
                    renderItem={renderFuelItem}
                    keyExtractor={(item) => item.product_id}
                    ItemSeparatorComponent={() => (
                      <View style={styles.separator} />
                    )}
                    style={styles.flatList}
                  />
                )}
              </View>

              <View style={styles.footer}>
                <TouchableOpacity
                  style={[styles.saveButton, isLoading && styles.savingButton]}
                  onPress={handleSaveChanges}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.saveButtonText}>Salvar</Text>
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

// ESTILOS (Os estilos permanecem os mesmos do arquivo original)
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
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
    marginHorizontal: 16,
  },
  headerAction: {
    width: 64,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCloseText: {
    fontWeight: "600",
    color: colors.primary,
    fontSize: 16,
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
