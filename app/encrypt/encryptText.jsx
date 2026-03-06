import {ScrollView, StyleSheet, View, TouchableOpacity, Platform} from "react-native";
import {SafeAreaView} from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import React, {useCallback} from "react";
import {useData} from "../../helpers/contextProvider";
import {encryptMessage, encryptSymmetricMessage} from "../../helpers/cryptoOps";
import PGPKeyManager from "../../helpers/keyManager";
import LoadingDialog from "../../components/loadingDialog";
import {useFocusEffect, useNavigation} from "expo-router";
import PassphraseDialog from "../../components/passphraseDialog";
import * as UI from '@expo/ui/swift-ui';
import {Ionicons} from '@expo/vector-icons';

import NativeInput from '../../components/ui/NativeInput';
import NativeButton from '../../components/ui/NativeButton';
import NativeCheckbox from '../../components/ui/NativeCheckbox';
import NativeSelect from '../../components/ui/NativeSelect';
import {useThemeColors} from '../../components/ui/Theme';

export default function EncryptText() {
    const [publicKey, setPublicKey] = React.useState("");
    const [signingKey, setSigningKey] = React.useState("");
    const [textToEncrypt, setTextToEncrypt] = React.useState("");
    const [encryptedText, setEncryptedText] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [toSign, setToSign] = React.useState(false);
    const {keys} = useData();
    const colors = useThemeColors();
    const keyManager = new PGPKeyManager();
    const navigation = useNavigation();

    const [passphrase, setPassphrase] = React.useState("");
    const [passphraseVisible, setPassphraseVisible] = React.useState(false);
    const [resolvePassphrase, setResolvePassphrase] = React.useState(null);
    const [checked, setChecked] = React.useState(false);

    const [isSymmetric, setIsSymmetric] = React.useState(false);
    const [symmetricPassphrase, setSymmetricPassphrase] = React.useState("");

    React.useEffect(() => {
        navigation.setOptions({
            headerTitle: "Encrypt Text",
                        headerRight: () => (
                                <UI.Host>
                                    <UI.Menu
                                        label={
                                            <TouchableOpacity style={{ width: 44, height: 44, justifyContent: 'center', alignItems: 'center' }}>
                                                <Ionicons 
                                                    name={Platform.OS === 'ios' ? "ellipsis-horizontal-circle" : "ellipsis-vertical"} 
                                                    size={24} 
                                                    color={colors.primary} 
                                                />
                                            </TouchableOpacity>
                                        }
                                    >
                                        <UI.Button
                                            label={isSymmetric ? "Disable Symmetric" : "Enable Symmetric"}
                                            systemImage={isSymmetric ? "lock.open" : "lock"}
                                            onPress={() => setIsSymmetric(!isSymmetric)}
                                        />
                                    </UI.Menu>
                                </UI.Host>
                        ),
            
        });
    }, [navigation, isSymmetric, colors.primary]);

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

    return <SafeAreaView edges={['bottom', 'left', 'right']}
                         style={[styles.container, {backgroundColor: colors.background}]}>
        {!isSymmetric && (
            <>
                <NativeSelect
                    label="Encrypt for"
                    placeholder="Select Public Key"
                    options={keys.map(key => ({label: key.userId, value: key.id}))}
                    value={publicKey}
                    onSelect={setPublicKey}
                    style={{marginTop: 16}}
                />

                <NativeCheckbox
                    label="Sign"
                    checked={toSign}
                    onChange={setToSign}
                    style={{marginVertical: 8}}
                />

                {toSign && (
                    <NativeSelect
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
            <NativeInput
                label="Passphrase"
                value={symmetricPassphrase}
                onChangeText={setSymmetricPassphrase}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                style={{marginTop: 16}}
            />
        )}

        <ScrollView style={{flex: 1}}>
            <NativeInput
                label="Enter text here..."
                value={textToEncrypt}
                onChangeText={setTextToEncrypt}
                multiline={true}
                style={{marginTop: 16}}
            />
        </ScrollView>

        <NativeButton
            disabled={(isSymmetric ? symmetricPassphrase === "" : publicKey === "") || textToEncrypt === "" || (toSign && signingKey === "")}
            mode="contained"
            style={{margin: 20}}
            onPress={() => encryptAndShowOutput()}
        >
            Encrypt
        </NativeButton>

        {/* Helper text display if needed, though usually copied to clipboard */}

        <LoadingDialog visible={loading} color={colors.primary} onDismiss={hideLoading}/>
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
    </SafeAreaView>;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingLeft: 16,
        paddingRight: 16
    },
});