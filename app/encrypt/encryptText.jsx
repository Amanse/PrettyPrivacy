import {Dropdown} from "react-native-paper-dropdown"
import {StyleSheet, View} from "react-native";
import * as Clipboard from 'expo-clipboard';
import {useTheme, TextInput, Button, Text, Snackbar} from "react-native-paper";
import React from "react";
import {useData} from "../../helpers/contextProvider";
import {encryptMessage} from "../../helpers/crypto_ops";

export default function () {
    const [publicKey, setPublicKey] = React.useState("");
    const [textToEncrypt, setTextToEncrypt] = React.useState("");
    const [encryptedText, setEncryptedText] = React.useState("");
    const {keys} = useData();
    console.log(keys)
    const theme = useTheme();

    const encryptAndShowOutput = async () => {
        const keyString = keys.find(key => key.id === publicKey)?.keyString;
        if (!keyString) {
            alert("Selected public key not found.");
            return;
        }

        const msg = await encryptMessage(textToEncrypt, keyString);
        setEncryptedText(msg)
        await Clipboard.setStringAsync(msg)

    }

    return <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
        <Dropdown
            label="Encrypt for"
            placeholder="Select Public Key"
            options={keys.map(key => ({label: key.userId, value: key.id}))}
            value={publicKey}
            onSelect={setPublicKey}
            style={{marginTop: 16}}
        />

        <TextInput
            label="Enter text here..."
            value={textToEncrypt}
            onChangeText={setTextToEncrypt}
            multiline={true}
            style={{marginTop: 16}}
        />

        <Button
            disabled={publicKey === "" || textToEncrypt === ""}
            mode="contained"
            style={{margin: 20}}
            onPress={() => encryptAndShowOutput()}
        >
            Encrypt
        </Button>

        <Text>{encryptedText}</Text>
    </View>;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingLeft: 16,
        paddingRight: 16
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
