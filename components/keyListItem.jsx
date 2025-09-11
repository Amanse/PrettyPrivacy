import React from "react";
import {Chip, Button, Divider, List, Menu} from "react-native-paper";
import {View} from "react-native";
import PGPKeyManager from "../helpers/keyManager";
import * as Clipboard from "expo-clipboard"

export default function KeyListItem({item}) {
    const [visible, setVisible] = React.useState(false);

    const openMenu = () => setVisible(true);
    const keyManager = new PGPKeyManager();
    const closeMenu = () => setVisible(false);
    const copyPublicKeyToClipboard = async (keyId) => {
        const key = keyManager.getPublicKeyById(keyId);
        if (key) {
            await copyToClipboard(key.keyString)
        } else {
            alert("Key not found.");
        }
    }

    const copyPrivateKeyToClipboard = async (keyId) => {
        const key = keyManager.getPrivateKeyById(keyId);
        if (key) {
            await copyToClipboard(key.keyString)
        } else {
            alert("Key not found.");
        }
    }

    const copyToClipboard = async (text) => {
        await Clipboard.setStringAsync(text);
    }

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
            </Menu>
        </View>
    )
}