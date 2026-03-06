import React from 'react';
import { View, StyleSheet, Platform, KeyboardAvoidingView, Pressable, Animated, Text } from 'react-native';
import * as UI from '@expo/ui/swift-ui';
import * as Modifiers from '@expo/ui/swift-ui/modifiers';
import { useThemeColors } from './Theme';

export default function NativeDialog({ visible, onDismiss, children, title }) {
  const colors = useThemeColors();
  const [shouldRender, setShouldRender] = React.useState(visible);
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      setShouldRender(true);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setShouldRender(false);
      });
    }
  }, [visible]);

  if (!shouldRender) return null;

  return (
    <View style={styles.absoluteWrapper} pointerEvents={visible ? 'auto' : 'none'}>
      <Animated.View style={[styles.overlay, { opacity }]}>
        <Pressable style={styles.backdrop} onPress={onDismiss} />
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.keyboardView}
        >
          <View style={[styles.dialog, { backgroundColor: colors.surface }]}>
            {title && (
              <View style={styles.header}>
                <Text style={[styles.titleText, { color: colors.text }]}>{title}</Text>
              </View>
            )}
            <View style={styles.content}>
              {children}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  absoluteWrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  keyboardView: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialog: {
    width: '85%',
    maxWidth: 320,
    borderRadius: 14,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    marginBottom: 16,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
  },
  content: {
    width: '100%',
  }
});
