import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from "../../helpers/contextProvider";
import PGPKeyManager from "../../helpers/keyManager";
import { useRouter } from "expo-router";
import KeyListItem from "../../components/keyListItem";
import * as Clipboard from 'expo-clipboard';
import * as UI from '@expo/ui/swift-ui';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../components/ui/Theme';

const KeysScreen = () => {
    const colors = useThemeColors();
    const { keys, setUpdateKey } = useData();
    const router = useRouter();
    const keyManager = React.useMemo(() => new PGPKeyManager(), []);

    useEffect(() => {
        keyManager.initStorages()
    }, [keyManager])

    const handleImportFile = async () => {
        await keyManager.importFromFile();
        setUpdateKey(a => !a);
    };

    const handleGenerate = () => {
        router.navigate("/encrypt/generateKey");
    };

    const handleImportClipboard = async () => {
        try {
            const key = await Clipboard.getStringAsync();
            await keyManager.saveKey(key);
            setUpdateKey(a => !a);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                {keys.length > 0 ? (
                    <ScrollView contentContainerStyle={styles.listContent}>
                        {keys.map((key, index) => (
                            <React.Fragment key={key.id}>
                                <KeyListItem item={key} />
                                {index < keys.length - 1 && (
                                    <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border }} />
                                )}
                            </React.Fragment>
                        ))}
                    </ScrollView>
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.title, { color: colors.text }]}>No keys found</Text>
                        <Text style={[styles.subtitle, { color: colors.placeholder }]}>
                            Press &apos;+&apos; to import or generate a new key.
                        </Text>
                    </View>
                )}

                <View style={styles.fabContainer}>
                    <UI.Host>
                        <UI.Menu
                            label={
                                <View style={[
                                    styles.fab, 
                                    { backgroundColor: colors.primary }
                                ]}>
                                    <Ionicons name="add" size={28} color="#FFF" />
                                </View>
                            }
                        >
                            <UI.Button
                                label="Import from file"
                                systemImage="doc"
                                onPress={handleImportFile}
                            />
                            <UI.Button
                                label="Generate new key"
                                systemImage="plus.square"
                                onPress={handleGenerate}
                            />
                            <UI.Button
                                label="Import from clipboard"
                                systemImage="doc.on.clipboard"
                                onPress={handleImportClipboard}
                            />
                        </UI.Menu>
                    </UI.Host>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 80, // Space for FAB
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
    },
    fabContainer: {
        position: 'absolute',
        right: 20,
        bottom: 20,
    },
    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    }
});

export default KeysScreen;
