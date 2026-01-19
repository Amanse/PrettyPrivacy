import React, {useCallback} from 'react';
import {View, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useLocalSearchParams, useRouter, Stack} from 'expo-router';
import {Button, List, Text, useTheme, Portal, Snackbar} from 'react-native-paper';
import {decryptFiles} from "../helpers/cryptoOps";
import LoadingDialog from "../components/loadingDialog";
import PassphraseDialog from "../components/passphraseDialog";
import * as FileSystem from 'expo-file-system/legacy';

export default function DecryptImportedFile() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const theme = useTheme();

    const [visible, setVisible] = React.useState(false);
    const [passPhrase, setPassPhrase] = React.useState("");
    const [resolvePassphrase, setResolvePassphrase] = React.useState(null);
    const [checked, setChecked] = React.useState(false);
    const [snackbar, setSnackbar] = React.useState({visible: false, message: ''});
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
            resolvePassphrase({passPhrase, useBiometrics: checked});
        }
        hideDialog();
        setIsLoading(true);
    };

    const handleDecrypt = async () => {
        if (!fileUri) {
            setSnackbar({visible: true, message: 'No file to decrypt.'});
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
            setSnackbar({visible: true, message: err.message || 'An unexpected error occurred.'});
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.container, {backgroundColor: theme.colors.background}]}>
            <Stack.Screen options={{title: "Decrypt Imported File"}}/>

            <View style={styles.content}>
                <List.Icon icon="file-import" style={{alignSelf: 'center', marginBottom: 20}}/>
                <Text variant="headlineSmall"
                      style={{textAlign: 'center', marginBottom: 20, color: theme.colors.onBackground}}>
                    Imported File
                </Text>

                <List.Item
                    title={fileName || "Unknown File"}
                    description="Ready to decrypt"
                    left={props => <List.Icon {...props} icon="file-document-outline"/>}
                    style={styles.fileItem}
                />

                <Button
                    mode="contained"
                    onPress={handleDecrypt}
                    style={styles.button}
                    icon="lock-open"
                >
                    Decrypt
                </Button>
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
            <Portal>
                <Snackbar
                    visible={snackbar.visible}
                    onDismiss={() => setSnackbar({...snackbar, visible: false})}
                    duration={Snackbar.DURATION_SHORT}>
                    {snackbar.message}
                </Snackbar>
            </Portal>
            <LoadingDialog onDismiss={hideLoading} isLoading={isLoading} color={theme.colors.primary}/>
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
    fileItem: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
        marginBottom: 24,
    },
    button: {
        marginTop: 8,
    }
});
