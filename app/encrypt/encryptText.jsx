import {Dropdown} from "react-native-paper-dropdown"
import {ScrollView, StyleSheet, View} from "react-native";
import * as Clipboard from 'expo-clipboard';
import {useTheme, TextInput, Button, Text, Checkbox, Menu, IconButton} from "react-native-paper";
import React, {useCallback} from "react";
import {useData} from "../../helpers/contextProvider";
import {encryptMessage, encryptSymmetricMessage} from "../../helpers/cryptoOps";
import PGPKeyManager from "../../helpers/keyManager";
import LoadingDialog from "../../components/loadingDialog";
import {useFocusEffect, useNavigation} from "expo-router";
import PassphraseDialog from "../../components/passphraseDialog";

export default function EncryptText() {
    const [publicKey, setPublicKey] = React.useState("");
    const [signingKey, setSigningKey] = React.useState("");
    const [textToEncrypt, setTextToEncrypt] = React.useState("");
    const [encryptedText, setEncryptedText] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [toSign, setToSign] = React.useState(false);
    const {keys} = useData();
    const theme = useTheme();
    const keyManager = new PGPKeyManager();
    const navigation = useNavigation();

    const [passphrase, setPassphrase] = React.useState("");
    const [passphraseVisible, setPassphraseVisible] = React.useState(false);
    const [resolvePassphrase, setResolvePassphrase] = React.useState(null);
    const [checked, setChecked] = React.useState(false);

    const [isSymmetric, setIsSymmetric] = React.useState(false);
    const [symmetricPassphrase, setSymmetricPassphrase] = React.useState("");
    const [menuVisible, setMenuVisible] = React.useState(false);

    const openMenu = () => setMenuVisible(true);
    const closeMenu = () => setMenuVisible(false);

    React.useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Menu
                    visible={menuVisible}
                    onDismiss={closeMenu}
                    anchor={<IconButton icon="dots-vertical" onPress={openMenu} />}
                >
                    <Menu.Item onPress={() => {
                        setIsSymmetric(!isSymmetric);
                        closeMenu();
                    }} title={isSymmetric ? "Disable Symmetric" : "Enable Symmetric"} />
                </Menu>
            ),
        });
    }, [navigation, menuVisible, isSymmetric]);

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
                setIsSymmetric(false);
                setSymmetricPassphrase("");
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

        try {
            let msg;
            if (isSymmetric) {
                if (!symmetricPassphrase) {
                    alert("Please enter a passphrase.");
                    setLoading(false);
                    return;
                }
                msg = await encryptSymmetricMessage(textToEncrypt, symmetricPassphrase);
            } else {
                const key = keyManager.getPublicKeyById(publicKey);
                if (!key) {
                    alert("Selected public key not found.");
                    setLoading(false);
                    return;
                }
                msg = await encryptMessage(textToEncrypt, key.keyString, toSign ? signingKey : null, askPassphrase);
            }
            
            setEncryptedText(msg)
            await Clipboard.setStringAsync(msg)
        } catch (error) {
            console.error(error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    }

    return <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
        {!isSymmetric && (
            <>
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
            </>
        )}

        {isSymmetric && (
            <TextInput
                label="Passphrase"
                value={symmetricPassphrase}
                onChangeText={setSymmetricPassphrase}
                secureTextEntry
                style={{marginTop: 16}}
            />
        )}

        <ScrollView style={{flex: 1}}>
            <TextInput
                label="Enter text here..."
                value={textToEncrypt}
                onChangeText={setTextToEncrypt}
                multiline={true}
                style={{marginTop: 16}}
            />
        </ScrollView>

        <Button
            disabled={(isSymmetric ? symmetricPassphrase === "" : publicKey === "") || textToEncrypt === "" || (toSign && signingKey === "")}
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