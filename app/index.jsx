import React from 'react';
import {useRouter} from "expo-router"
import * as Clipboard from "expo-clipboard"
import {ScrollView} from 'react-native';
import {List, Divider, useTheme, Dialog, Portal, Button, TextInput, Checkbox, Text} from 'react-native-paper';
import {decryptMessage} from "../helpers/cryptoOps";

const EncryptDecryptScreen = () => {
    const theme = useTheme();
    const router = useRouter();

    const [visible, setVisible] = React.useState(false);
    const [passPhrase, setPassPhrase] = React.useState("");
    const [resolvePassphrase, setResolvePassphrase] = React.useState(null);
    const [checked, setChecked] = React.useState(false);

    const showDialog = () => setVisible(true);
    const hideDialog = () => setVisible(false);

    const readFromClipboardAndDecrypt = async () => {
        const text = await Clipboard.getStringAsync();
        const result = await decryptMessage(text, askPassphrase);
        await Clipboard.setStringAsync(result.msg)
        console.log(result.msg)
    }

    const askPassphrase = () => {
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
    };

    return (
        <ScrollView style={{flex: 1, backgroundColor: theme.colors.background}}>
            <List.Section>
                <List.Subheader>Encrypt</List.Subheader>
                <List.Item
                    title="Encrypt files"
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
                    title="Select input file"
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
            </Portal>
        </ScrollView>
    );
};

export default EncryptDecryptScreen;