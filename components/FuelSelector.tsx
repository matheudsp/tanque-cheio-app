import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { AppIcon } from './shared/AppIcon';
import { getIconNameFromFuel } from '@/utils/getIconNameFromFuel';

type FuelSelectorProps = {
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
};

export const FuelSelector: React.FC<FuelSelectorProps> = ({ options, selectedValue, onSelect }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const translateY = useSharedValue(300);

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

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const iconName = getIconNameFromFuel(selectedValue);

  return (
    <>
      <TouchableOpacity style={styles.selectorButton} onPress={openModal}>
        <View style={styles.selectorContent}>
          <AppIcon name={iconName} width={24} height={24} />
          <Text style={styles.selectedValueText}>{selectedValue.toUpperCase()}</Text>
        </View>
        <Ionicons name="chevron-down" size={20} color={colors.primary} />
      </TouchableOpacity>

      <Modal transparent={true} visible={modalVisible} onRequestClose={closeModal} animationType="none">
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closeModal}>
          <Animated.View style={[styles.modalContainer, modalAnimatedStyle]}>
            <SafeAreaView edges={['bottom']}>
              <Text style={styles.modalTitle}>Selecione um Combustível</Text>
              <FlatList
                data={options}
                keyExtractor={(item) => item}
                renderItem={({ item }) => {
                  const itemIconName = getIconNameFromFuel(item);
                  const isSelected = selectedValue === item;
                  return (
                    <TouchableOpacity style={styles.optionItem} onPress={() => handleSelect(item)}>
                      <AppIcon name={itemIconName} width={28} height={28} />
                      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{item.toUpperCase()}</Text>
                      {isSelected && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
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

const styles = StyleSheet.create({
  selectorButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom:8
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedValueText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 10,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 16,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});