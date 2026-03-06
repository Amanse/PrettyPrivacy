import Checkbox from 'expo-checkbox';
import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import * as UI from '@expo/ui/swift-ui';
import * as Modifiers from '@expo/ui/swift-ui/modifiers';
import { useThemeColors } from './Theme';

export default function NativeCheckbox({ label, checked, onChange, style }) {
  const colors = useThemeColors();

  if (Platform.OS === 'ios') {
    return (
      <View style={[styles.iosContainer, style]}>
        <UI.Host style={{ flex: 1, height: 31 }}>
          <UI.Toggle
            label={label}
            isOn={checked}
            onIsOnChange={onChange}
            modifiers={[
                Modifiers.tint(colors.primary)
            ]}
          />
        </UI.Host>
      </View>
    );
  }

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
  iosContainer: {
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
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
