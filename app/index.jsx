import React from 'react';
import {useRouter} from "expo-router"
import * as Clipboard from "expo-clipboard"
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import {ScrollView} from 'react-native';
import {
    List,
    Divider,
    useTheme,
    Dialog,
    Portal,
    Button,
    TextInput,
    Checkbox,
    Text,
    Snackbar,
    ActivityIndicator
} from 'react-native-paper';
import {decryptMessage, decryptFiles} from "../helpers/cryptoOps";
import {pickFileAndGetData} from "../helpers/general";
import LoadingDialog from "../components/loadingDialog";

const EncryptDecryptScreen = () => {
    const theme = useTheme();
    const router = useRouter();

    const [visible, setVisible] = React.useState(false);
    const [passPhrase, setPassPhrase] = React.useState("");
    const [resolvePassphrase, setResolvePassphrase] = React.useState(null);
    const [checked, setChecked] = React.useState(false);
    const [snackbar, setSnackbar] = React.useState({visible: false, message: ''});
    const [isLoading, setIsLoading] = React.useState(false);

    const showDialog = () => setVisible(true);
    const hideDialog = () => setVisible(false);
    const hideLoading = () => setIsLoading(false);

    const readFromClipboardAndDecrypt = async () => {
        setIsLoading(true);
        const text = await Clipboard.getStringAsync();
        const result = await decryptMessage(text, askPassphrase);
        setIsLoading(false);
        if (result.error) {
            setSnackbar({visible: true, message: result.error});
        } else {
            await Clipboard.setStringAsync(result.msg);
            setSnackbar({visible: true, message: 'Decrypted message copied to clipboard.'});
        }
    }

    const askPassphrase = () => {
        setIsLoading(false);
        showDialog();
        return new Promise((resolve) => {
            setResolvePassphrase(() => resolve);
        });
    }

    const handleDecrypt = () => {
        if (resolvePassphrase) {
            resolvePassphrase({passPhrase, useBiometrics: checked});
        }
        hideDialog();
        setIsLoading(true);
    };

    const selectAndDecryptFile = async () => {
        try {
            const files = await pickFileAndGetData(false);

            if (files.length <= 0) {
                setSnackbar({visible: true, message: 'Please select at least one file.'});
                return;
            }

            setIsLoading(true);
            const res = await decryptFiles(files, askPassphrase);
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
        }
    };

    return (
        <ScrollView style={{flex: 1, backgroundColor: theme.colors.background}}>
            <List.Section>
                <List.Subheader>Encrypt</List.Subheader>
                <List.Item
                    title="Encrypt files"
                    onPress={() => router.navigate("/encrypt/encryptFiles")}
                    left={props => <List.Icon {...props} icon="file-lock-outline"/>}
                    right={props => <List.Icon {...props} icon="folder-outline"/>}
                />
                <List.Item
                    title="Encrypt text"
                    onPress={() => router.navigate("/encrypt/encryptText")}
                    left={props => <List.Icon {...props} icon="format-letter-case"/>}
                    right={props => <List.Icon {...props} icon="message-text-outline"/>}
                />
            </List.Section>

            <Divider/>

            <List.Section>
                <List.Subheader>Decrypt/Verify</List.Subheader>
                <List.Item
                    title="Select input files"
                    onPress={selectAndDecryptFile}
                    left={props => <List.Icon {...props} icon="file-key-outline"/>}
                    right={props => <List.Icon {...props} icon="folder-open-outline"/>}
                />
                <List.Item
                    title="Read from clipboard"
                    left={props => <List.Icon {...props} icon="clipboard-text-search-outline"/>}
                    right={props => <List.Icon {...props} icon="clipboard-outline"/>}
                    onPress={() => readFromClipboardAndDecrypt()}
                />
            </List.Section>

            <Portal>
                <Dialog visible={visible} onDismiss={hideDialog}>
                    <Dialog.Title>Enter private key password</Dialog.Title>
                    <Dialog.Content>
                        <TextInput value={passPhrase} onChangeText={setPassPhrase} multiline={false}/>
                        <Checkbox.Item
                            label="Save password with biometrics"
                            status={checked ? 'checked' : 'unchecked'}
                            onPress={() => {
                                setChecked(!checked);
                            }}
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={handleDecrypt}>Decrypt</Button>
                    </Dialog.Actions>
                </Dialog>
                <Snackbar
                    visible={snackbar.visible}
                    onDismiss={() => setSnackbar({...snackbar, visible: false})}
                    duration={Snackbar.DURATION_SHORT}>
                    {snackbar.message}
                </Snackbar>
            </Portal>
            <LoadingDialog onDismiss={hideLoading} isLoading={isLoading} color={theme.colors.primary}/>
        </ScrollView>
    );
};

export default EncryptDecryptScreen;