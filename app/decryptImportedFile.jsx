import React, { useCallback } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { decryptFiles } from "../helpers/cryptoOps";
import LoadingDialog from "../components/loadingDialog";
import PassphraseDialog from "../components/passphraseDialog";
import * as FileSystem from 'expo-file-system/legacy';
import { Ionicons } from '@expo/vector-icons';
import NativeButton from '../components/ui/NativeButton';
import NativeSnackbar from '../components/ui/NativeSnackbar';
import { useThemeColors } from '../components/ui/Theme';

export default function DecryptImportedFile() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const colors = useThemeColors();

    const [visible, setVisible] = React.useState(false);
    const [passPhrase, setPassPhrase] = React.useState("");
    const [resolvePassphrase, setResolvePassphrase] = React.useState(null);
    const [checked, setChecked] = React.useState(false);
    const [snackbar, setSnackbar] = React.useState({ visible: false, message: '' });
    const [isLoading, setIsLoading] = React.useState(false);

    // Params might come as array or string depending on navigation, handle both
    const fileUri = Array.isArray(params.fileUri) ? params.fileUri[0] : params.fileUri;
    const fileName = Array.isArray(params.fileName) ? params.fileName[0] : params.fileName;

    const showDialog = () => setVisible(true);
    const hideDialog = () => {
        setVisible(false)
        setPassPhrase("");
        setChecked(false);
    }
    const hideLoading = () => setIsLoading(false);

    const askPassphrase = () => {
        setIsLoading(false);
        showDialog();
        return new Promise((resolve) => {
            setResolvePassphrase(() => resolve);
        });
    }

    const handleDecryptDialogSubmit = () => {
        if (resolvePassphrase) {
            resolvePassphrase({ passPhrase, useBiometrics: checked });
        }
        hideDialog();
        setIsLoading(true);
    };

    const handleDecrypt = async () => {
        if (!fileUri) {
            setSnackbar({ visible: true, message: 'No file to decrypt.' });
            return;
        }

        try {
            setIsLoading(true);

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
            setIsLoading(false);

            router.push({
                pathname: "/preview",
                params: {
                    files: JSON.stringify(res)
                }
            })

        } catch (err) {
            console.error(err)
            setSnackbar({ visible: true, message: err.message || 'An unexpected error occurred.' });
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen options={{ 
                title: "Decrypt Imported File",
                headerStyle: { backgroundColor: colors.background },
                headerTintColor: colors.text,
                headerShadowVisible: false,
            }}/>

            <View style={styles.content}>
                <Ionicons name="download-outline" size={64} color={colors.text} style={{ alignSelf: 'center', marginBottom: 20 }} />
                
                <Text style={[styles.title, { color: colors.text }]}>
                    Imported File
                </Text>

                <View style={[styles.fileItem, { backgroundColor: colors.surface }]}>
                    <Ionicons name="document-text-outline" size={24} color={colors.text} style={{ marginRight: 16 }} />
                    <View>
                        <Text style={[styles.fileName, { color: colors.text }]}>{fileName || "Unknown File"}</Text>
                        <Text style={[styles.fileDesc, { color: colors.placeholder }]}>Ready to decrypt</Text>
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

            <PassphraseDialog
                visible={visible}
                onDismiss={hideDialog}
                onSubmit={handleDecryptDialogSubmit}
                passPhrase={passPhrase}
                setPassPhrase={setPassPhrase}
                checked={checked}
                setChecked={setChecked}
                submitLabel="Decrypt"
            />
            
            <NativeSnackbar
                visible={snackbar.visible}
                onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
            >
                {snackbar.message}
            </NativeSnackbar>
            
            <LoadingDialog onDismiss={hideLoading} visible={isLoading} color={colors.primary} />
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
    }
});