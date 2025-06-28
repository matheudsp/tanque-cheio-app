import * as Haptics from "expo-haptics";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { useFavoriteStore } from "@/stores/favoriteStore";
import { useTheme } from "@/providers/themeProvider";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import type { ThemeState } from "@/types/theme";
import type { GasStation } from "@/types/gas-stations";

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
  const styles = useStylesWithTheme(getStyles);
  const { themeState } = useTheme();

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
  }, [isVisible, station, fetchFavoritesByStation, translateY]);

  useEffect(() => {
    setLocalSelection(stationSpecificFavorites);
  }, [stationSpecificFavorites]);

  const handleClose = useCallback(() => {
    translateY.value = withTiming(MODAL_HEIGHT, { duration: 250 });
    runOnJS(onClose)();
  }, [onClose, translateY]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateY.value = Math.max(0, event.translationY);
    })
    .onEnd(() => {
      if (translateY.value > CLOSE_THRESHOLD) {
        handleClose();
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

    const productsToAdd = [...localSelection].filter(
      (id) => !stationSpecificFavorites.has(id)
    );
    const productsToRemove = [...stationSpecificFavorites].filter(
      (id) => !localSelection.has(id)
    );

    if (productsToAdd.length > 0 || productsToRemove.length > 0) {
      await updateFavoritesInBulk(station.id, productsToAdd, productsToRemove);
    }

    handleClose();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [
    station?.id,
    localSelection,
    stationSpecificFavorites,
    updateFavoritesInBulk,
    handleClose,
  ]);

  const renderFuelItem = useCallback(
    ({ item }: { item: GasStation["fuel_prices"][0] }) => (
      <View style={styles.fuelItem}>
        <Text style={styles.fuelName}>{item.product_name}</Text>
        <Switch
          trackColor={{
            false: themeState.colors.divider,
            true: themeState.colors.primary.main,
          }}
          thumbColor={themeState.colors.background.paper}
          onValueChange={() => handleToggleSwitch(item.product_id)}
          value={localSelection.has(item.product_id)}
          style={styles.switch}
          disabled={isLoading}
        />
      </View>
    ),
    [localSelection, handleToggleSwitch, isLoading, styles, themeState]
  );

  if (!station) {
    return null;
  }

  return (
    <Modal transparent={true} visible={isVisible} onRequestClose={handleClose}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={handleClose}
      >
        <TouchableOpacity activeOpacity={1}>
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.modalContainer, animatedStyle]}>
              <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                  <View style={styles.headerAction} />
                  <Text style={styles.headerTitle} numberOfLines={1}>
                    Gerenciar Alertas
                  </Text>
                  <TouchableOpacity
                    onPress={handleClose}
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
                      color={themeState.colors.primary.main}
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
                    style={[
                      styles.saveButton,
                      isLoading && styles.savingButton,
                    ]}
                    onPress={handleSaveChanges}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator
                        color={themeState.colors.primary.text}
                      />
                    ) : (
                      <Text style={styles.saveButtonText}>Salvar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </SafeAreaView>
            </Animated.View>
          </GestureDetector>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      justifyContent: "flex-end",
    },
    modalContainer: {
      height: MODAL_HEIGHT,
      backgroundColor: theme.colors.background.default,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: -10 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.lg,
      height: 56,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    headerTitle: {
      flex: 1,
      textAlign: "center",
      fontSize: 17,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
      marginHorizontal: theme.spacing.lg,
    },
    headerAction: {
      width: 64,
      justifyContent: "center",
      alignItems: "center",
    },
    headerCloseText: {
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.primary.main,
      fontSize: 16,
    },
    explanatoryText: {
      fontSize: 13,
      color: theme.colors.text.secondary,
      textAlign: "center",
      paddingHorizontal: theme.spacing.xl,
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
      lineHeight: 18,
    },
    listWrapper: {
      flex: 1,
      marginHorizontal: theme.spacing.lg,
    },
    flatList: {
      backgroundColor: theme.colors.background.paper,
      borderRadius: theme.borderRadius.large,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    fuelItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingLeft: theme.spacing.lg,
      paddingRight: theme.spacing.md,
      height: 48,
      backgroundColor: theme.colors.background.paper,
    },
    fuelName: {
      fontSize: 17,
      color: theme.colors.text.primary,
    },
    switch: {
      transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
    },
    separator: {
      height: 1,
      backgroundColor: theme.colors.divider, 
      marginHorizontal: theme.spacing.lg,
    },
    footer: {
      padding: theme.spacing.lg,
      paddingTop: theme.spacing.md,
    },
    saveButton: {
      backgroundColor: theme.colors.button.primary,
      borderRadius: theme.borderRadius.large,
      paddingVertical: theme.spacing.lg,
      alignItems: "center",
      justifyContent: "center",
    },
    savingButton: {
      backgroundColor: theme.colors.button.disabled,
    },
    saveButtonText: {
      color: theme.colors.primary.text,
      fontSize: 17,
      fontWeight: theme.typography.fontWeight.semibold,
    },
  });
