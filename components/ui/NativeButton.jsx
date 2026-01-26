import React from 'react';
import { Pressable, Text, StyleSheet, Platform, ActivityIndicator, Animated } from 'react-native';
import { useThemeColors } from './Theme';

export default function NativeButton({ 
  onPress, 
  children, 
  mode = 'contained', // contained | text
  disabled = false, 
  loading = false,
  style,
  textStyle 
}) {
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={disabled || loading ? null : onPress}
      style={({ pressed }) => [
        styles.base,
        mode === 'contained' && { backgroundColor: disabled ? colors.border : colors.primary },
        mode === 'text' && { backgroundColor: 'transparent' },
        pressed && mode === 'contained' && { opacity: 0.8 }, // iOS style fade
        pressed && mode === 'text' && { opacity: 0.6 },
        style
      ]}
      android_ripple={!disabled && { color: 'rgba(255, 255, 255, 0.2)' }}
    >
      {loading ? (
        <ActivityIndicator color={mode === 'contained' ? '#FFF' : colors.primary} />
      ) : (
        <Text style={[
          styles.text,
          { color: mode === 'contained' ? '#FFF' : (disabled ? colors.placeholder : colors.primary) },
          textStyle
        ]}>
          {typeof children === 'string' ? children.toUpperCase() : children} 
          {/* Uppercase for Android/Material feel? Or standard? Let's keep standard casing for iOS native feel. */}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8, // Standard modern radius
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  }
});
