import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';

type ChipSelectorProps = {
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
};

export const ChipSelector: React.FC<ChipSelectorProps> = ({ options, selectedValue, onSelect }) => {
  
  const allOptions = ['Todos', ...options];

  return (
    <View style={styles.container}>
      {allOptions.map((option) => {
        const value = option === 'Todos' ? 'all' : option;
        const isActive = selectedValue === value;
        return (
          <TouchableOpacity
            key={option}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onSelect(value)}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Esta é a propriedade chave que faz o grid funcionar
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: colors.border,
    marginRight: 10,
    marginBottom: 10, // Espaçamento para as linhas que quebram
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textSecondary,
    fontWeight: '500',
    fontSize: 14,
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});