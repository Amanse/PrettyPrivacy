import React, {useState} from 'react';
import {View} from 'react-native';
import {Button, TextInput, HelperText, useTheme} from 'react-native-paper';
import PGPKeyManager from "../../helpers/keyManager";
import {useRouter} from "expo-router";
import {useData} from "../../helpers/contextProvider";

export default function GenerateKeyForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [passphrase, setPassphrase] = useState('');
    const router = useRouter();

    const {setUpdateKey} = useData();
    const keyManager = new PGPKeyManager();

    const handleGenerateKey = () => {
        // Handle key generation logic here
        console.log('Generating key with:', {name, email, passphrase});
        keyManager.generateKeyPairAndSave(name, email, passphrase).then(res => {
            if (res === "success") {
                setUpdateKey((c) => !c)
                router.navigate("/keys");
            }
        })
    };

    const theme = useTheme();

    return (
        <View style={{padding: 16, backgroundColor: theme.colors.background, height: '100%'}}>
            <TextInput
                label="Name"
                value={name}
                onChangeText={setName}
                mode="outlined"
                style={{marginBottom: 16}}
            />
            <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                style={{marginBottom: 16}}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                label="Passphrase (optional)"
                value={passphrase}
                onChangeText={setPassphrase}
                mode="outlined"
                style={{marginBottom: 16}}
                secureTextEntry
            />
            <HelperText type="info" style={{marginBottom: 16}}>
                An optional passphrase to protect your key.
            </HelperText>
            <Button mode="contained" onPress={handleGenerateKey}>
                Generate Key
            </Button>
        </View>
    );
}
