import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import Share from 'react-native-share';
import React from "react";
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../components/ui/Theme';
import NativeSnackbar from '../components/ui/NativeSnackbar';

export default function TextPreviewScreen() {
    const params = useLocalSearchParams();
    const { text, isVerified } = params;
    const colors = useThemeColors();
    const [snackbar, setSnackbar] = React.useState({ visible: false, message: '' });

    const isSignatureVerified = isVerified === 'true';
    const isSignatureNotVerified = isVerified === 'false';

    const shareText = async () => {
        try {
            await Share.open({
                title: 'Sharing Decrypted Text',
                message: text,
            });
        } catch (e) {
            if (e.message !== "User did not share") {
                console.error(e.message);
            }
        }
    };

    const copyText = async () => {
        await Clipboard.setStringAsync(text);
        setSnackbar({ visible: true, message: 'Copied to clipboard' });
    };

    return (
        <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen options={{
                title: "Decrypted Text",
                headerStyle: { backgroundColor: colors.background },
                headerTintColor: colors.text,
                headerShadowVisible: false,
                headerRight: () => (
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity onPress={shareText} style={{ marginRight: 16 }}>
                            <Ionicons name="share-outline" size={24} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={copyText}>
                            <Ionicons name="copy-outline" size={24} color={colors.primary} />
                        </TouchableOpacity>
                    </View>
                )
            }}/>
            
            {isSignatureVerified && (
                <View style={[styles.statusHeader, { borderBottomColor: colors.border }]}>
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} style={{ marginRight: 16 }} />
                    <Text style={[styles.statusText, { color: colors.primary }]}>Signature verified</Text>
                </View>
            )}
            
            {isSignatureNotVerified && (
                <View style={[styles.statusHeader, { borderBottomColor: colors.border }]}>
                    <Ionicons name="close-circle" size={24} color={colors.error} style={{ marginRight: 16 }} />
                    <Text style={[styles.statusText, { color: colors.error }]}>Signature not verified</Text>
                </View>
            )}

            <ScrollView style={styles.scrollView}>
                <Text selectable style={[styles.text, { color: colors.text }]}>{text}</Text>
            </ScrollView>
            
            <NativeSnackbar
                visible={snackbar.visible}
                onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
            >
                {snackbar.message}
            </NativeSnackbar>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        padding: 16,
    },
    text: {
        fontSize: 16,
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    statusText: {
        fontSize: 16,
        fontWeight: '500',
    }
});
