import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { useMaterial3Theme } from '@pchmn/expo-material3-theme';

export default function App() {
    const colorScheme = useColorScheme();
    const { theme } = useMaterial3Theme();

    // The 'theme' object will contain both light and dark palettes
    const currentTheme = theme[colorScheme ?? "dark"];

    return (
        <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
            <Text style={[styles.text, { color: currentTheme.onBackground }]}>
                Hello, Material You!
            </Text>
            <View style={[styles.button, { backgroundColor: currentTheme.primary }]}>
                <Text style={[styles.buttonText, { color: currentTheme.onPrimary }]}>
                    Dynamic Button
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        marginBottom: 20,
    },
    button: {
        padding: 15,
        borderRadius: 8,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});