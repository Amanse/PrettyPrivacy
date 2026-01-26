import React from "react";
import { View, Text, Pressable, StyleSheet, Alert, Platform } from "react-native";
import PGPKeyManager from "../helpers/keyManager";
import * as Clipboard from "expo-clipboard";
import { useData } from "../helpers/contextProvider";
import * as SecureStore from "expo-secure-store";
import CustomSnackbar from "./snackBar";
import * as DropdownMenu from 'zeego/dropdown-menu';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from './ui/Theme';

export default function KeyListItem({ item }) {
    const { setUpdateKey } = useData();
    const [showClearPassSnackbar, setShowClearPassSnackbar] = React.useState(false);
    const keyManager = React.useMemo(() => new PGPKeyManager(), []);
    const colors = useThemeColors();

    const copyToClipboard = React.useCallback(async (text) => {
        await Clipboard.setStringAsync(text);
    }, []);

    const copyPublicKeyToClipboard = React.useCallback(async (keyId) => {
        const key = keyManager.getPublicKeyById(keyId);
        if (key) {
            await copyToClipboard(key.keyString);
        } else {
            alert("Key not found.");
        }
    }, [keyManager, copyToClipboard]);

    const copyPrivateKeyToClipboard = React.useCallback(async (keyId) => {
        const key = keyManager.getPrivateKeyById(keyId);
        if (key) {
            await copyToClipboard(key.keyString);
        } else {
            alert("Key not found.");
        }
    }, [keyManager, copyToClipboard]);

    const handleDelete = async () => {
        Alert.alert(
            "Confirm Action",
            "Are you sure you want to remove this key?",
            [
                { text: "No", style: "cancel" },
                {
                    text: "Yes",
                    style: "destructive",
                    onPress: async () => {
                        await keyManager.deleteKeyById(item.id);
                        setUpdateKey(a => !a);
                    }
                }
            ]
        );
    };

    const handleClearPasswords = async () => {
        await SecureStore.deleteItemAsync(`passphrase_${item.subKeyId}`);
        setShowClearPassSnackbar(true);
    };

    return (
        <View>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                    <Pressable style={({ pressed }) => [styles.container, pressed && { backgroundColor: colors.border + '40' }]}>
                        <View style={styles.left}>
                            <Ionicons name="key" size={24} color={colors.text} style={styles.icon} />
                            <View>
                                <Text style={[styles.title, { color: colors.text }]}>{item.userId}</Text>
                                <Text style={[styles.description, { color: colors.placeholder }]}>{item.id}</Text>
                            </View>
                        </View>
                        <View style={[styles.chip, { backgroundColor: colors.border }]}>
                            <Text style={[styles.chipText, { color: colors.text }]}>
                                {item.isPrivate ? "Private" : "Public"}
                            </Text>
                        </View>
                    </Pressable>
                </DropdownMenu.Trigger>

                <DropdownMenu.Content>
                    <DropdownMenu.Item key="copy-public" onSelect={() => copyPublicKeyToClipboard(item.id)}>
                        <DropdownMenu.ItemTitle>Copy Public Key</DropdownMenu.ItemTitle>
                    </DropdownMenu.Item>
                    
                    {item.isPrivate && (
                        <DropdownMenu.Item key="copy-private" onSelect={() => copyPrivateKeyToClipboard(item.id)}>
                            <DropdownMenu.ItemTitle>Copy Private Key</DropdownMenu.ItemTitle>
                        </DropdownMenu.Item>
                    )}

                    {item.isPrivate && (
                        <DropdownMenu.Item key="clear-pass" onSelect={handleClearPasswords}>
                            <DropdownMenu.ItemTitle>Clear Saved Passwords</DropdownMenu.ItemTitle>
                        </DropdownMenu.Item>
                    )}

                    <DropdownMenu.Item key="delete" onSelect={handleDelete} destructive>
                        <DropdownMenu.ItemTitle>Delete Key</DropdownMenu.ItemTitle>
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Root>

            <CustomSnackbar
                visible={showClearPassSnackbar}
                onDismissSnackBar={() => setShowClearPassSnackbar(false)}
                title="Cleared Saved passwords"
                label="dismiss"
                onPress={() => setShowClearPassSnackbar(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ccc',
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    icon: {
        marginRight: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: '500',
    },
    description: {
        fontSize: 12,
        marginTop: 2,
    },
    chip: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
        marginLeft: 8,
    },
    chipText: {
        fontSize: 10,
        fontWeight: '600',
    }
});
