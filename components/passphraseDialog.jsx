import React from 'react';
import { View, StyleSheet } from 'react-native';
import NativeDialog from './ui/NativeDialog';
import NativeInput from './ui/NativeInput';
import NativeButton from './ui/NativeButton';
import NativeCheckbox from './ui/NativeCheckbox';

const PassphraseDialog = ({ visible, onDismiss, onSubmit, passPhrase, setPassPhrase, checked, setChecked, title, submitLabel }) => {
    return (
        <NativeDialog visible={visible} onDismiss={onDismiss} title={title || 'Enter private key password'}>
            <View>
                <NativeInput
                    secureTextEntry={true}
                    autoComplete="current-password" // Native prop
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
                    style={{ marginBottom: 20 }}
                />
                <View style={styles.actions}>
                    <NativeButton 
                        mode="text" 
                        onPress={onDismiss} 
                        style={{ flex: 1, marginRight: 8 }}
                    >
                        Cancel
                    </NativeButton>
                    <NativeButton 
                        mode="contained" 
                        onPress={onSubmit} 
                        style={{ flex: 1, marginLeft: 8 }}
                    >
                        {submitLabel || 'Submit'}
                    </NativeButton>
                </View>
            </View>
        </NativeDialog>
    );
};

const styles = StyleSheet.create({
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    }
});

export default PassphraseDialog;