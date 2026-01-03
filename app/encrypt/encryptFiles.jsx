import {Dropdown} from "react-native-paper-dropdown"
import {StyleSheet, View, FlatList} from "react-native";
import {useTheme, Button, List, Checkbox, Menu, IconButton, TextInput} from "react-native-paper";
import React, {useCallback} from "react";
import {useData} from "../../helpers/contextProvider";
import PGPKeyManager from "../../helpers/keyManager";
import * as DocumentPicker from 'expo-document-picker';
import * as cryptoOpts from '../../helpers/cryptoOps'
import {useFocusEffect, useRouter, useNavigation} from "expo-router";
import LoadingDialog from "../../components/loadingDialog";
import PassphraseDialog from "../../components/passphraseDialog";

export default function EncryptFiles() {
    const [publicKey, setPublicKey] = React.useState("");
    const [signingKey, setSigningKey] = React.useState("");
    const [files, setFiles] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [toSign, setToSign] = React.useState(false);
    const {keys} = useData();
    const theme = useTheme();
    const keyManager = new PGPKeyManager();
    const router = useRouter();
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
                setFiles([]);
                setPublicKey("");
                setLoading(false);
                setSigningKey("");
                setToSign(false);
                setIsSymmetric(false);
                setSymmetricPassphrase("");
            }
        }, [])
    )

    const pickDocuments = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
                multiple: true,
            });

            if (!result.canceled) {
                setFiles((files) => [...files, ...result.assets.map((file) => ({uri: file.uri, name: file.name}))]);
            }
        } catch (err) {
            console.log(err);
        }
    };

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

    const encryptFiles = async () => {
        setLoading(true);
        let res;
        try {
            if (isSymmetric) {
                if (!symmetricPassphrase) {
                    alert("Please enter a passphrase.");
                    setLoading(false);
                    return;
                }
                res = await cryptoOpts.encryptSymmetricFiles(files, symmetricPassphrase);
            } else {
                const key = keyManager.getPublicKeyById(publicKey);
                if (!key) {
                    alert("Selected public key not found.");
                    setLoading(false);
                    return;
                }
                res = await cryptoOpts.encryptFiles(files, key.keyString, toSign ? signingKey : null, askPassphrase);
            }
            
            setLoading(false);
            router.push({
                pathname: '/preview',
                params: {files: JSON.stringify(res), showSignatures: false}
            });
        } catch (e) {
            console.error(e);
            alert(e.message);
            setLoading(false);
        }
    }

    return (
        <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
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

                    <Checkbox.Item status={toSign ? 'checked' : 'unchecked'} label="Sign"
                                   onPress={() => setToSign(val => !val)}/>

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

            <Button
                mode="outlined"
                style={{marginVertical: 20}}
                onPress={pickDocuments}
                icon="file-plus"
            >
                Add Files
            </Button>

            <FlatList
                data={files}
                keyExtractor={(item) => item.uri}
                renderItem={({item}) => (
                    <List.Item
                        title={item.name}
                        left={props => <List.Icon {...props} icon="file-document-outline"/>}
                    />
                )}
            />

            <Button
                disabled={(isSymmetric ? symmetricPassphrase === "" : publicKey === "") || files.length === 0 || (toSign && signingKey === "")}
                mode="contained"
                style={{margin: 20}}
                onPress={encryptFiles}
            >
                Encrypt Files
            </Button>
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingLeft: 16,
        paddingRight: 16
    },
});
