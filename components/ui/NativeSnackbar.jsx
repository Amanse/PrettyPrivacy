import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useThemeColors } from './Theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NativeSnackbar({ visible, onDismiss, children, action }) {
  const colors = useThemeColors();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        onDismiss();
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, onDismiss, opacity]);

  if (!visible) return null;

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <SafeAreaView edges={['bottom']} pointerEvents="box-none">
        <Animated.View style={[styles.container, { backgroundColor: colors.surface, opacity }]}>
          <Text style={[styles.message, { color: colors.text }]}>{children}</Text>
          {action && (
            <TouchableOpacity onPress={action.onPress}>
              <Text style={[styles.action, { color: colors.primary }]}>{action.label}</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    zIndex: 1000,
  },
  container: {
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  message: {
    flex: 1,
    fontSize: 14,
  },
  action: {
    marginLeft: 16,
    fontWeight: '600',
  }
});
