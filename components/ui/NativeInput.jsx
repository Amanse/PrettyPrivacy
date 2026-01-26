import React from 'react';
import { TextInput, View, Text, StyleSheet, Platform } from 'react-native';
import { useThemeColors } from './Theme';

export default function NativeInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  multiline,
  style,
  autoCapitalize,
  autoCorrect,
  ...props
}) {
  const colors = useThemeColors();

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || (label ? `Enter ${label.toLowerCase()}` : '')}
        placeholderTextColor={colors.placeholder}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        style={[
          styles.input,
          { 
            color: colors.text,
            backgroundColor: colors.surface,
            borderColor: colors.border,
            minHeight: multiline ? 100 : 48,
            textAlignVertical: multiline ? 'top' : 'center',
            paddingTop: multiline ? 12 : 0, // Padding for multiline
          }
        ]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
});
