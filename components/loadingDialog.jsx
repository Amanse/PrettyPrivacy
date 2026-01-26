import React from 'react';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import NativeDialog from './ui/NativeDialog';
import { useThemeColors } from './ui/Theme';

export default function LoadingDialog({ visible, onDismiss, color }) { // Props changed: isLoading -> visible
    const colors = useThemeColors();

    return (
        <NativeDialog visible={visible} onDismiss={onDismiss}>
            <View style={styles.content}>
                <ActivityIndicator animating={true} size="large" color={color || colors.primary} />
                <Text style={[styles.text, { color: colors.text }]}>Processing...</Text>
            </View>
        </NativeDialog>
    );
}

const styles = StyleSheet.create({
    content: {
        alignItems: 'center',
        padding: 10,
    },
    text: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: '500',
    }
});
