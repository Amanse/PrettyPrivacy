import React from "react";
import {Chip, Button, Divider, List, Menu} from "react-native-paper";
import {View} from "react-native";
import PGPKeyManager from "../helpers/keyManager";
import * as Clipboard from "expo-clipboard"

export default function KeyListItem({item}) {
    const [visible, setVisible] = React.useState(false);

    const openMenu = () => setVisible(true);

    const closeMenu = () => setVisible(false);
    const copyKeyToClipboard = async (keyId) => {
        const keyManager = new PGPKeyManager();
        const key = keyManager.getPublicKeyById(keyId);
        if (key) {
            console.log("key -> ", key.keyString);
            try {
                await Clipboard.setStringAsync(key.keyString);
            } catch (e) {
                console.error(e)
            }
        } else {
            alert("Key not found.");
        }
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
                    await copyKeyToClipboard(item.id);
                    closeMenu();
                }} title="Copy public key"/>
                <Divider/>
                {item.isPrivate ? <Menu.Item onPress={() => {
                }} title="Copy private key"/> : null}
            </Menu>
        </View>
    )
}