import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack } from 'expo-router';
import * as Sharing from 'expo-sharing';
import FileListItem from "../components/fileListItem";
import { useThemeColors } from '../components/ui/Theme';
import { Ionicons } from '@expo/vector-icons';

export default function PreviewScreen() {
    const params = useLocalSearchParams();
    const files = params.files ? JSON.parse(params.files) : [];
    const colors = useThemeColors();

    const showSignatures = params.showSignatures !== 'false';
    const allVerified = showSignatures && files.length > 0 && files.every(file => file.isVerified);
    const noneVerified = showSignatures && files.length > 0 && !files.some(file => file.isVerified);

    const shareAllFiles = async () => {
        if (!(await Sharing.isAvailableAsync())) {
            Alert.alert("Sharing not available", "Sharing is not supported on this device.");
            return;
        }

        try {
            if (files.length === 1) {
                await Sharing.shareAsync(files[0].uri);
            } else if (files.length > 1) {
                // expo-sharing doesn't natively support multiple files in one call.
                // We could loop, but it's annoying. For now, let's share the first or just let the user know.
                // Actually, let's just loop and share them sequentially as a fallback for pure expo.
                for (const file of files) {
                    await Sharing.shareAsync(file.uri);
                }
            }
        } catch (e) {
            console.error(e.message)
        }
    }

    const StatusHeader = () => {
        if (!showSignatures) return null;

        let iconName = "alert-circle";
        let color = colors.error;
        let text = "Some file signatures verified";

        if (allVerified) {
            iconName = "checkmark-circle";
            color = colors.primary;
            text = "All file signatures verified";
        } else if (noneVerified) {
            iconName = "close-circle";
            color = colors.error;
            text = "File signatures not verified";
        }

        return (
            <View style={[styles.statusHeader, { borderBottomColor: colors.border }]}>
                <Ionicons name={iconName} size={24} color={color} style={{ marginRight: 16 }} />
                <Text style={[styles.statusText, { color }]}>{text}</Text>
            </View>
        );
    }

    return (
        <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen options={{
                title: `${params.isEncrypted === 'true' ? "Encrypted" : "Decrypted"} Files`,
                headerStyle: { backgroundColor: colors.background },
                headerTintColor: colors.text,
                headerShadowVisible: false,
                headerRight: () => (
                    <TouchableOpacity onPress={shareAllFiles}>
                        <Ionicons name="share-outline" size={24} color={colors.primary} />
                    </TouchableOpacity>
                )
            }}/>
            
            <StatusHeader />
            
            <FlatList
                data={files}
                renderItem={({ item }) => (
                    <FileListItem 
                        item={item} 
                        allowOpen={true} // Assuming preview allows open/share
                        showIndividualStatus={showSignatures && !allVerified && !noneVerified}
                    />
                )}
                keyExtractor={(item, index) => item.uri + index}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={{ color: colors.text }}>No files to preview.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    }
});
