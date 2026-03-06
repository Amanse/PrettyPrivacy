import React from 'react';
import { Pressable, Text, StyleSheet, Platform, ActivityIndicator, View } from 'react-native';
import * as UI from '@expo/ui/swift-ui';
import * as Modifiers from '@expo/ui/swift-ui/modifiers';
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

  if (Platform.OS === 'ios' && !loading) {
    return (
      <View style={[styles.iosWrapper, style]}>
        <UI.Host style={{ height: 44 }}>
          <UI.Button
            label={typeof children === 'string' ? children : undefined}
            onPress={onPress}
            modifiers={[
              Modifiers.buttonStyle(mode === 'contained' ? 'borderedProminent' : 'borderless'),
              Modifiers.controlSize('regular'),
              Modifiers.disabled(disabled),
              Modifiers.tint(colors.primary)
            ]}
          >
            {typeof children !== 'string' ? children : undefined}
          </UI.Button>
        </UI.Host>
      </View>
    );
  }

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
          {typeof children === 'string' ? children : children} 
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iosWrapper: {
    marginVertical: 4,
  },
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
