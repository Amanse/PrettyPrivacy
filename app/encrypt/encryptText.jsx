import {Dropdown} from "react-native-paper-dropdown"
import {StyleSheet, View} from "react-native";
import * as Clipboard from 'expo-clipboard';
import {useTheme, TextInput, Button, Text, Checkbox} from "react-native-paper";
import React, {useCallback} from "react";
import {useData} from "../../helpers/contextProvider";
import {encryptMessage} from "../../helpers/cryptoOps";
import PGPKeyManager from "../../helpers/keyManager";
import LoadingDialog from "../../components/loadingDialog";
import {useFocusEffect} from "expo-router";
import PassphraseDialog from "../../components/passphraseDialog";

export default function () {
    const [publicKey, setPublicKey] = React.useState("");
    const [signingKey, setSigningKey] = React.useState("");
    const [textToEncrypt, setTextToEncrypt] = React.useState("");
    const [encryptedText, setEncryptedText] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [toSign, setToSign] = React.useState(false);
    const {keys} = useData();
    const theme = useTheme();
    const keyManager = new PGPKeyManager();

    const [passphrase, setPassphrase] = React.useState("");
    const [passphraseVisible, setPassphraseVisible] = React.useState(false);
    const [resolvePassphrase, setResolvePassphrase] = React.useState(null);
    const [checked, setChecked] = React.useState(false);

    const hideLoading = () => setLoading(false);
    const hidePassphrase = () => {
        setPassphraseVisible(false);
        setPassphrase("");
        setChecked(false);
    }

    useFocusEffect(
        useCallback(() => {
            return () => {
                setPublicKey("");
                setTextToEncrypt("");
                setEncryptedText("");
                setLoading(false);
                setSigningKey("");
                setToSign(false);
            }
        }, [])
    )

    const askPassphrase = () => {
        setLoading(false);
        setPassphraseVisible(true);
        return new Promise((resolve) => {
            setResolvePassphrase(() => resolve);
        });
    }

    const handlePassphrase = () => {
        if (resolvePassphrase) {
            resolvePassphrase({passPhrase: passphrase, useBiometrics: checked});
        }
        hidePassphrase();
        setLoading(true);
    };

    const encryptAndShowOutput = async () => {
        setLoading(true);
        const key = keyManager.getPublicKeyById(publicKey);
        if (!key) {
            alert("Selected public key not found.");
            setLoading(false);
            return;
        }

        const msg = await encryptMessage(textToEncrypt, key.keyString, toSign ? signingKey : null, askPassphrase);
        setLoading(false);
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

        <Checkbox.Item status={toSign ? 'checked' : 'unchecked'} label="Sign" onPress={() => setToSign(val => !val)}/>

        {toSign && (
            <Dropdown
                label="Sign with"
                placeholder="Select Private Key"
                options={keys.filter(k => k.isPrivate).map(key => ({label: key.userId, value: key.id}))}
                value={signingKey}
                onSelect={setSigningKey}
                style={{marginTop: 16}}
            />
        )}

        <TextInput
            label="Enter text here..."
            value={textToEncrypt}
            onChangeText={setTextToEncrypt}
            multiline={true}
            style={{marginTop: 16}}
        />

        <Button
            disabled={publicKey === "" || textToEncrypt === "" || (toSign && signingKey === "")}
            mode="contained"
            style={{margin: 20}}
            onPress={() => encryptAndShowOutput()}
        >
            Encrypt
        </Button>

        <Text>{encryptedText}</Text>
        <LoadingDialog visible={loading} color={theme.colors.primary} onDismiss={hideLoading}/>
        <PassphraseDialog
            visible={passphraseVisible}
            onDismiss={hidePassphrase}
            onSubmit={handlePassphrase}
            passPhrase={passphrase}
            setPassPhrase={setPassphrase}
            checked={checked}
            setChecked={setChecked}
            submitLabel="Sign"
        />
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