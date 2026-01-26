import React from 'react';
import { Modal, View, StyleSheet, Text, Platform, KeyboardAvoidingView } from 'react-native';
import { useThemeColors } from './Theme';

export default function NativeDialog({ visible, onDismiss, children, title }) {
  const colors = useThemeColors();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={[styles.dialog, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {title && (
              <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            )}
            <View style={styles.content}>
              {children}
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 14, // iOS-like rounded corners
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  content: {
    //
  }
});
