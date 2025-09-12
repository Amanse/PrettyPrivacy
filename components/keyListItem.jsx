import React from "react";
import {Chip, Button, Divider, List, Menu, Snackbar} from "react-native-paper";
import {View, Alert} from "react-native";
import PGPKeyManager from "../helpers/keyManager";
import * as Clipboard from "expo-clipboard"
import {useData} from "../helpers/contextProvider";
import * as SecureStore from "expo-secure-store"
import CustomSnackbar from "./snackBar";

export default function KeyListItem({item}) {
    const [visible, setVisible] = React.useState(false);
    const {setUpdateKey} = useData();
    const [showClearPassSnackbar, setShowClearPassSnackbar] = React.useState(false);

    const openMenu = React.useCallback(() => setVisible(true), []);
    const keyManager = React.useMemo(() => new PGPKeyManager(), []);
    const closeMenu = React.useCallback(() => setVisible(false), []);
    const copyToClipboard = React.useCallback(async (text) => {
        await Clipboard.setStringAsync(text);
    }, []);

    const copyPublicKeyToClipboard = React.useCallback(async (keyId) => {
        const key = keyManager.getPublicKeyById(keyId);
        if (key) {
            await copyToClipboard(key.keyString)
        } else {
            alert("Key not found.");
        }
    }, [keyManager, copyToClipboard]);

    const copyPrivateKeyToClipboard = React.useCallback(async (keyId) => {
        const key = keyManager.getPrivateKeyById(keyId);
        if (key) {
            await copyToClipboard(key.keyString)
        } else {
            alert("Key not found.");
        }
    }, [keyManager, copyToClipboard]);


    const showConfirmAlert = React.useCallback(() => {
        Alert.alert(
            "Confirm Action", // Alert Title
            "Are you sure you want to remove this key?", // Alert Message
            [
                {
                    text: "No",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel" // Style for the cancel button
                },
                {
                    text: "Yes",
                    onPress: async () => {
                        await keyManager.deleteKeyById(item.id);
                        setUpdateKey(a => !a)
                    },
                    style: "destructive" // Style for a destructive action (optional)
                }
            ],
            {cancelable: false} // Prevents dismissing the alert by tapping outside
        );
    }, [setUpdateKey, item.id]);

    return (
        <View>
            <Menu
                visible={visible}
                onDismiss={closeMenu}
                anchor={(
                    <List.Item
                        title={item.userId}
                        description={item.id}
                        onLongPress={openMenu}
                        left={props => <List.Icon {...props} icon="key-variant"/>}
                        right={props => <Chip>{item.isPrivate ? "Private" : "Public"}</Chip>}
                    />
                )}
            >
                <Menu.Item onPress={() => {
                    showConfirmAlert()
                    closeMenu()
                }} title="Delete"/>
                <Menu.Item onPress={async () => {
                    await copyPublicKeyToClipboard(item.id);
                    closeMenu();
                }} title="Copy public key"/>
                <Divider/>
                {item.isPrivate ? <Menu.Item onPress={async () => {
                    await copyPrivateKeyToClipboard(item.id);
                    closeMenu();
                }} title="Copy private key"/> : null}
                {item.isPrivate ? <Menu.Item onPress={async () => {
                    await SecureStore.deleteItemAsync(`passphrase_${item.subKeyId}`);
                    setShowClearPassSnackbar(true);
                    closeMenu();
                }} title="Clear saved passwords"/> : null}
            </Menu>

            <CustomSnackbar
                visible={showClearPassSnackbar}
                onDismissSnackBar={() => setShowClearPassSnackbar(false)}
                title="Cleared Saved passwords"
                label="dismiss"
            />
        </View>
    )
}