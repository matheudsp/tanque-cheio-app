import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/providers/themeProvider";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import type { ThemeState } from "@/types/theme";
import { getIconNameFromFuel } from "@/utils/getIconNameFromFuel";
import { AppIcon } from "./ui/AppIcon";

type FuelSelectorProps = {
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
};

export const FuelSelector: React.FC<FuelSelectorProps> = ({
  options,
  selectedValue,
  onSelect,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const translateY = useSharedValue(300);
  const styles = useStylesWithTheme(getStyles);
  const { themeState } = useTheme();

  const openModal = () => {
    setModalVisible(true);
    translateY.value = withTiming(0, { duration: 300 });
  };

  const closeModal = () => {
    translateY.value = withTiming(300, { duration: 300 });
    setTimeout(() => setModalVisible(false), 300);
  };

  const handleSelect = (option: string) => {
    onSelect(option);
    closeModal();
  };

  const modalAnimatedStyle = useAnimatedStyle(
    () => ({
      transform: [{ translateY: translateY.value }],
    }),
    []
  );

  const iconName = getIconNameFromFuel(selectedValue);

  return (
    <>
      <TouchableOpacity style={styles.selectorButton} onPress={openModal}>
        <View style={styles.selectorContent}>
          <AppIcon name={iconName} width={24} height={24} />
          <Text style={styles.selectedValueText}>
            {selectedValue.toUpperCase()}
          </Text>
        </View>
        <Ionicons
          name="chevron-down"
          size={20}
          color={themeState.colors.primary.main}
        />
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
        animationType="none"
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={closeModal}
        >
          <Animated.View style={[styles.modalContainer, modalAnimatedStyle]}>
            <SafeAreaView edges={["bottom"]}>
              <Text style={styles.modalTitle}>Selecione um Combustível</Text>
              <FlatList
                data={options}
                keyExtractor={(item) => item}
                renderItem={({ item }) => {
                  const itemIconName = getIconNameFromFuel(item);
                  const isSelected = selectedValue === item;
                  return (
                    <TouchableOpacity
                      style={styles.optionItem}
                      onPress={() => handleSelect(item)}
                    >
                      <AppIcon name={itemIconName} width={28} height={28} />
                      <Text
                        style={[
                          styles.optionText,
                          isSelected && styles.optionTextSelected,
                        ]}
                      >
                        {item.toUpperCase()}
                      </Text>
                      {isSelected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color={themeState.colors.primary.main}
                        />
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            </SafeAreaView>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    selectorButton: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.colors.background.paper,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.large,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.shadowSm,
      marginBottom: theme.spacing.sm,
    },
    selectorContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    selectedValueText: {
      fontSize: theme.typography.fontSize.medium,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.primary.main,
      marginLeft: theme.spacing.sm,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "flex-end",
    },
    modalContainer: {
      backgroundColor: theme.colors.background.paper,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: theme.spacing.xl,
      maxHeight: "60%",
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
      textAlign: "center",
      marginBottom: theme.spacing.xl,
    },
    optionItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    optionText: {
      flex: 1,
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.text.secondary,
      marginLeft: theme.spacing.lg,
    },
    optionTextSelected: {
      color: theme.colors.primary.main,
      fontWeight: theme.typography.fontWeight.bold,
    },
  });
