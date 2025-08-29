import React from 'react';
import {View, Text, StyleSheet, useColorScheme} from 'react-native';
import {TextInput, Button} from 'react-native-paper';
import {useMaterial3Theme} from '@pchmn/expo-material3-theme';
import {getPublicKeys} from "@/helpers/key_ops";
import {encryptMessage} from "@/helpers/crypto_ops";
import * as Clipboard from 'expo-clipboard';


export default function App() {
    const colorScheme = useColorScheme();
    const {theme} = useMaterial3Theme();
    const [input, setInput] = React.useState("");
    const [output, setOutput] = React.useState("");

    // The 'theme' object will contain both light and dark palettes
    const currentTheme = theme[colorScheme ?? "dark"];

    const encryptAndSetOutput = async () => {
        const publicKeys = await getPublicKeys();
        if (publicKeys.length === 0) {
            setOutput("No public keys available. Please import a key first.");
            return;
        }
        try {
            const publicKey = publicKeys[0].key; // Use the first public key for encryption
            const encryptedMessage = await encryptMessage(input, publicKey);
            setOutput(encryptedMessage);
        } catch (error) {
            console.error('Encryption failed:', error);
            setOutput('Encryption failed. Please check the input and try again.');
        }
    }

    return (
        <View style={[styles.container, {backgroundColor: currentTheme.background}]}>
            <Text style={[styles.text, {color: currentTheme.onBackground}]}>
                Hello, Material You!
            </Text>
            <TextInput style={{width: '50%', marginBottom: 20}} theme={currentTheme} dense={true}
                       value={input}
                       onChangeText={text => setInput(text)}/>
            <View style={[styles.button, {backgroundColor: currentTheme.primary}]}>
                <Text onPress={encryptAndSetOutput} style={[styles.buttonText, {color: currentTheme.onPrimary}]}>
                    Encrypt
                </Text>
            </View>
            <Text style={[styles.text, {color: currentTheme.primary}]}>
                {output}
            </Text>
            {output ?
                <Button onPress={() => Clipboard.setStringAsync(output)}>Copy output</Button>
                : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        marginBottom: 20,
    },
    button: {
        padding: 15,
        borderRadius: 8,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});
