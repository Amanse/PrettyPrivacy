import React from 'react';
import { Dialog, Portal, Button, TextInput, Checkbox } from 'react-native-paper';

const PassphraseDialog = ({ visible, onDismiss, onSubmit, passPhrase, setPassPhrase, checked, setChecked, title, submitLabel }) => {
    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onDismiss}>
                <Dialog.Title>{title || 'Enter private key password'}</Dialog.Title>
                <Dialog.Content>
                    <TextInput
                        secureTextEntry={true}
                        autoComplete="current-password"
                        value={passPhrase}
                        onChangeText={setPassPhrase}
                        multiline={false}
                    />
                    <Checkbox.Item
                        label="Save password with biometrics"
                        status={checked ? 'checked' : 'unchecked'}
                        onPress={() => setChecked(!checked)}
                    />
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={onSubmit}>{submitLabel || 'Submit'}</Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

PassphraseDialog.displayName = "PassphraseDialog";

export default PassphraseDialog;
