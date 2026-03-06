import React, { useCallback } from 'react';
import {View, StyleSheet, Text, ActivityIndicator} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useLocalSearchParams, useRouter, Stack, useFocusEffect} from 'expo-router';
import {decryptFiles} from "../helpers/cryptoOps";
import * as FileSystem from 'expo-file-system/legacy';
import {Ionicons} from '@expo/vector-icons';
import NativeButton from '../components/ui/NativeButton';
import NativeSnackbar from '../components/ui/NativeSnackbar';
import {useThemeColors} from '../components/ui/Theme';
import NativeDialog from '../components/ui/NativeDialog';
import NativeInput from '../components/ui/NativeInput';
import NativeCheckbox from '../components/ui/NativeCheckbox';

export default function DecryptImportedFile() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const colors = useThemeColors();

    const [activeModal, setActiveModal] = React.useState('none'); // 'none', 'loading', 'passphrase'
    const [passPhrase, setPassPhrase] = React.useState("");
    const [resolvePassphrase, setResolvePassphrase] = React.useState(null);
    const [checked, setChecked] = React.useState(false);
    const [snackbar, setSnackbar] = React.useState({visible: false, message: ''});

    // Params might come as array or string depending on navigation, handle both
    const fileUri = Array.isArray(params.fileUri) ? params.fileUri[0] : params.fileUri;
    const fileName = Array.isArray(params.fileName) ? params.fileName[0] : params.fileName;

    useFocusEffect(
        useCallback(() => {
            return () => {
                setActiveModal('none');
                setPassPhrase("");
                setResolvePassphrase(null);
            };
        }, [])
    );

    const askPassphrase = async () => {
        // Switch content within the same dialog instead of dismissing/re-presenting
        setActiveModal('passphrase');
        return new Promise((resolve) => {
            setResolvePassphrase(() => resolve);
        });
    }

    const handleDecryptDialogSubmit = async () => {
        const resolve = resolvePassphrase;
        if (resolve) {
            setResolvePassphrase(null);
            setActiveModal('loading');
            // Allow a small tick for the UI to update content before blocking
            await new Promise(r => setTimeout(r, 100));
            resolve({ passPhrase, useBiometrics: checked });
        }
    };

    const handleDecrypt = async () => {
        if (!fileUri) {
            setSnackbar({ visible: true, message: 'No file to decrypt.' });
            return;
        }

        try {
            setActiveModal('loading');
            // Small delay to ensure the modal is visible before the thread gets busy
            await new Promise(resolve => setTimeout(resolve, 100));

            // expo-share-intent might provide a file path that needs 'file://' prefix if not present
            let inputUri = fileUri;
            if (!inputUri.startsWith('file://')) {
                inputUri = 'file://' + inputUri;
            }

            const safeName = fileName.replace(/\.(pgp|gpg|asc)$/i, '');
            const destination = `${FileSystem.cacheDirectory}${safeName}`;

            const fileObj = {
                inputUri: inputUri,
                outputUri: destination,
                outputFilename: safeName,
                // fallback if helper expects these
                uri: inputUri,
                name: fileName
            };

            const res = await decryptFiles([fileObj], askPassphrase);
            setActiveModal('none');

            router.push({
                pathname: "/preview",
                params: {
                    files: JSON.stringify(res)
                }
            })

        } catch (err) {
            console.error(err)
            setSnackbar({ visible: true, message: err.message || 'An unexpected error occurred.' });
            setActiveModal('none');
        }
    };

    return (
        <SafeAreaView edges={['bottom', 'left', 'right']}
                      style={[styles.container, {backgroundColor: colors.background}]}>
            <Stack.Screen options={{
                title: "Decrypt Imported File",
                headerStyle: {backgroundColor: colors.background},
                headerTintColor: colors.text,
                headerShadowVisible: false,
            }}/>

            <View style={styles.content}>
                <Ionicons name="download-outline" size={64} color={colors.text}
                          style={{alignSelf: 'center', marginBottom: 20}}/>

                <Text style={[styles.title, {color: colors.text}]}>
                    Imported File
                </Text>

                <View style={[styles.fileItem, {backgroundColor: colors.surface}]}>
                    <Ionicons name="document-text-outline" size={24} color={colors.text} style={{marginRight: 16}}/>
                    <View>
                        <Text style={[styles.fileName, {color: colors.text}]}>{fileName || "Unknown File"}</Text>
                        <Text style={[styles.fileDesc, {color: colors.placeholder}]}>Ready to decrypt</Text>
                    </View>
                </View>

                <NativeButton
                    mode="contained"
                    onPress={handleDecrypt}
                    style={styles.button}
                >
                    Decrypt
                </NativeButton>
            </View>

            <NativeDialog
                visible={activeModal !== 'none'}
                onDismiss={() => setActiveModal('none')}
                title={activeModal === 'passphrase' ? 'Enter private key password' : null}
            >
                {activeModal === 'loading' && (
                    <View style={styles.loadingContent}>
                        <ActivityIndicator animating={true} size="large" color={colors.primary}/>
                        <Text style={[styles.loadingText, {color: colors.text}]}>Processing...</Text>
                    </View>
                )}
                {activeModal === 'passphrase' && (
                    <View>
                        <NativeInput
                            secureTextEntry={true}
                            autoComplete="current-password"
                            autoCapitalize="none"
                            autoCorrect={false}
                            value={passPhrase}
                            onChangeText={setPassPhrase}
                            placeholder="Passphrase"
                        />
                        <NativeCheckbox
                            label="Save password with biometrics"
                            checked={checked}
                            onChange={setChecked}
                            style={{marginBottom: 20}}
                        />
                        <View style={styles.actions}>
                            <NativeButton
                                mode="text"
                                onPress={() => setActiveModal('none')}
                                style={{flex: 1, marginRight: 8}}
                            >
                                Cancel
                            </NativeButton>
                            <NativeButton
                                mode="contained"
                                onPress={handleDecryptDialogSubmit}
                                style={{flex: 1, marginLeft: 8}}
                            >
                                Decrypt
                            </NativeButton>
                        </View>
                    </View>
                )}
            </NativeDialog>

            <NativeSnackbar
                visible={snackbar.visible}
                onDismiss={() => setSnackbar({...snackbar, visible: false})}
            >
                {snackbar.message}
            </NativeSnackbar>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 20,
    },
    fileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 8,
        marginBottom: 24,
    },
    fileName: {
        fontSize: 16,
        fontWeight: '500',
    },
    fileDesc: {
        fontSize: 14,
    },
    button: {
        marginTop: 8,
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