import React, { useState } from 'react';
import { View, Text, Pressable, Modal, FlatList, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { useThemeColors } from './Theme';
import NativeButton from './NativeButton';

export default function NativeSelect({ label, value, options, onSelect, placeholder, style }) {
  const [visible, setVisible] = useState(false);
  const colors = useThemeColors();

  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : '';

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
      <Pressable
        onPress={() => setVisible(true)}
        style={({ pressed }) => [
          styles.selector,
          { 
            backgroundColor: colors.surface, 
            borderColor: colors.border,
            opacity: pressed ? 0.7 : 1,
          }
        ]}
      >
        <Text style={[styles.value, { color: value ? colors.text : colors.placeholder }]}>
          {value ? displayValue : (placeholder || 'Select...')}
        </Text>
        {/* Simple chevron could be added here */}
        <Text style={{ color: colors.placeholder }}>▼</Text>
      </Pressable>

      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet" // iOS native feel
        onRequestClose={() => setVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>{label || 'Select'}</Text>
            <NativeButton mode="text" onPress={() => setVisible(false)}>Close</NativeButton>
          </View>
          <FlatList
            data={options}
            keyExtractor={item => item.value}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [
                  styles.option,
                  { 
                    backgroundColor: item.value === value ? colors.primary + '20' : 'transparent',
                    borderBottomColor: colors.border 
                  },
                  pressed && { backgroundColor: colors.border }
                ]}
                onPress={() => {
                  onSelect(item.value);
                  setVisible(false);
                }}
              >
                <Text style={[
                  styles.optionText, 
                  { 
                    color: item.value === value ? colors.primary : colors.text,
                    fontWeight: item.value === value ? '600' : '400'
                  }
                ]}>
                  {item.label}
                </Text>
                {item.value === value && (
                  <Text style={{ color: colors.primary }}>✓</Text>
                )}
              </Pressable>
            )}
          />
        </SafeAreaView>
      </Modal>
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
  selector: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
  },
  value: {
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  option: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
  }
});
