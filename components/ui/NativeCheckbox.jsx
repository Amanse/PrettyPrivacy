import Checkbox from 'expo-checkbox';
import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useThemeColors } from './Theme';

export default function NativeCheckbox({ label, checked, onChange, style }) {
  const colors = useThemeColors();

  return (
    <Pressable 
      onPress={() => onChange(!checked)} 
      style={[styles.container, style]}
    >
      <Checkbox
        value={checked}
        onValueChange={onChange}
        color={checked ? colors.primary : colors.placeholder}
        style={styles.checkbox}
      />
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkbox: {
    marginRight: 12,
    borderRadius: Platform.OS === 'ios' ? 4 : 2,
  },
  label: {
    fontSize: 16,
  }
});
