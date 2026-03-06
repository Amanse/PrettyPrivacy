import {StyleSheet, View, FlatList, TouchableOpacity, Text, Platform, ActivityIndicator} from "react-native";
import {SafeAreaView} from 'react-native-safe-area-context';
import React, {useCallback} from "react";
import {useData} from "../../helpers/contextProvider";
import PGPKeyManager from "../../helpers/keyManager";
import * as DocumentPicker from 'expo-document-picker';
import * as cryptoOpts from '../../helpers/cryptoOps'
import {useFocusEffect, useRouter, useNavigation} from "expo-router";
import * as UI from '@expo/ui/swift-ui';
import {Ionicons} from '@expo/vector-icons';

import NativeInput from '../../components/ui/NativeInput';
import NativeButton from '../../components/ui/NativeButton';
import NativeCheckbox from '../../components/ui/NativeCheckbox';
import NativeSelect from '../../components/ui/NativeSelect';
import {useThemeColors} from '../../components/ui/Theme';
import NativeDialog from '../../components/ui/NativeDialog';

export default function EncryptFiles() {
    const [publicKey, setPublicKey] = React.useState("");
    const [signingKey, setSigningKey] = React.useState("");
    const [files, setFiles] = React.useState([]);
    const [activeModal, setActiveModal] = React.useState('none'); // 'none', 'loading', 'passphrase'
    const [toSign, setToSign] = React.useState(false);
    const {keys} = useData();
    const colors = useThemeColors();
    const keyManager = new PGPKeyManager();
    const router = useRouter();
    const navigation = useNavigation();

    const [passphrase, setPassphrase] = React.useState("");
    const [resolvePassphrase, setResolvePassphrase] = React.useState(null);
    const [checked, setChecked] = React.useState(false);

    const [isSymmetric, setIsSymmetric] = React.useState(false);
    const [symmetricPassphrase, setSymmetricPassphrase] = React.useState("");

    React.useEffect(() => {
        navigation.setOptions({
            headerTitle: "Encrypt Files",
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

    const hidePassphrase = () => {
        setActiveModal('none');
        setPassphrase("");
        setChecked(false);
    }

    useFocusEffect(
        useCallback(() => {
            return () => {
                setFiles([]);
                setPublicKey("");
                setActiveModal('none');
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

    const askPassphrase = async () => {
        setActiveModal('passphrase');
        return new Promise((resolve) => {
            setResolvePassphrase(() => resolve);
        });
    }

    const handlePassphrase = async () => {
        const resolve = resolvePassphrase;
        if (resolve) {
            setResolvePassphrase(null);
            setActiveModal('loading');
            await new Promise(r => setTimeout(r, 100));
            resolve({passPhrase: passphrase, useBiometrics: checked});
        }
    };

    const encryptFiles = async () => {
        setActiveModal('loading');
        await new Promise(resolve => setTimeout(resolve, 200));
        let res;
        try {
            if (isSymmetric) {
                if (!symmetricPassphrase) {
                    alert("Please enter a passphrase.");
                    setActiveModal('none');
                    return;
                }
                res = await cryptoOpts.encryptSymmetricFiles(files, symmetricPassphrase);
            } else {
                const key = keyManager.getPublicKeyById(publicKey);
                if (!key) {
                    alert("Selected public key not found.");
                    setActiveModal('none');
                    return;
                }
                res = await cryptoOpts.encryptFiles(files, key.keyString, toSign ? signingKey : null, askPassphrase);
            }

            setActiveModal('none');
            router.push({
                pathname: '/preview',
                params: {files: JSON.stringify(res), showSignatures: false}
            });
        } catch (e) {
            console.error(e);
            alert(e.message);
            setActiveModal('none');
        }
    }

    return (
        <SafeAreaView edges={['bottom', 'left', 'right']}
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

            <NativeButton
                mode="text"
                style={{marginVertical: 20}}
                onPress={pickDocuments}
            >
                Add Files
            </NativeButton>

            <FlatList
                data={files}
                keyExtractor={(item) => item.uri}
                renderItem={({item}) => (
                    <View style={[styles.fileItem, {borderBottomColor: colors.border}]}>
                        <Ionicons name="document-text-outline" size={24} color={colors.text} style={{marginRight: 16}}/>
                        <Text style={{color: colors.text, fontSize: 16}}>{item.name}</Text>
                    </View>
                )}
            />

            <NativeButton
                disabled={(isSymmetric ? symmetricPassphrase === "" : publicKey === "") || files.length === 0 || (toSign && signingKey === "")}
                mode="contained"
                style={{margin: 20}}
                onPress={encryptFiles}
            >
                Encrypt Files
            </NativeButton>

            <NativeDialog 
                visible={activeModal !== 'none'} 
                onDismiss={() => setActiveModal('none')}
                title={activeModal === 'passphrase' ? 'Enter private key password' : null}
            >
                {activeModal === 'loading' && (
                    <View style={styles.loadingContent}>
                        <ActivityIndicator animating={true} size="large" color={colors.primary} />
                        <Text style={[styles.loadingText, { color: colors.text }]}>Processing...</Text>
                    </View>
                )}
                {activeModal === 'passphrase' && (
                    <View>
                        <NativeInput
                            secureTextEntry={true}
                            autoCapitalize="none"
                            autoCorrect={false}
                            value={passphrase}
                            onChangeText={setPassphrase}
                            placeholder="Passphrase"
                        />
                        <NativeCheckbox
                            label="Save password with biometrics"
                            checked={checked}
                            onChange={setChecked}
                            style={{ marginBottom: 20 }}
                        />
                        <View style={styles.actions}>
                            <NativeButton 
                                mode="text" 
                                onPress={() => setActiveModal('none')} 
                                style={{ flex: 1, marginRight: 8 }}
                            >
                                Cancel
                            </NativeButton>
                            <NativeButton 
                                mode="contained" 
                                onPress={handlePassphrase} 
                                style={{ flex: 1, marginLeft: 8 }}
                            >
                                Sign
                            </NativeButton>
                        </View>
                    </View>
                )}
            </NativeDialog>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingLeft: 16,
        paddingRight: 16
    },
    fileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    loadingContent: {
        alignItems: 'center',
        padding: 10,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: '500',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    }
});