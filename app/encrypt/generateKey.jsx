import React, {useCallback, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import PGPKeyManager from "../../helpers/keyManager";
import {useFocusEffect, useNavigation, useRouter} from "expo-router";
import {useData} from "../../helpers/contextProvider";
import NativeInput from '../../components/ui/NativeInput';
import NativeButton from '../../components/ui/NativeButton';
import {useThemeColors} from '../../components/ui/Theme';

export default function GenerateKeyForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [passphrase, setPassphrase] = useState('');
    const router = useRouter();
    const navigation = useNavigation();

    const {setUpdateKey} = useData();
    const keyManager = PGPKeyManager.getInstance();
    const colors = useThemeColors();

    useFocusEffect(
        useCallback(() => {
            return () => {
                setName('');
                setEmail('');
                setPassphrase('');
            }
        }, [])
    )

    React.useEffect(() => {
        navigation.setOptions({headerTitle: "Generate Key"});
    })

    const handleGenerateKey = () => {
        keyManager.generateKeyPairAndSave(name, email, passphrase).then(res => {
            if (res === "success") {
                setUpdateKey((c) => !c)
                router.navigate("/keys");
            }
        })
    };

    return (
        <SafeAreaView edges={['bottom', 'left', 'right']}
                      style={{padding: 16, backgroundColor: colors.background, height: '100%'}}>
            <NativeInput
                label="Name"
                value={name}
                onChangeText={setName}
            />
            <NativeInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <NativeInput
                label="Passphrase (optional)"
                value={passphrase}
                onChangeText={setPassphrase}
                secureTextEntry
            />
            <Text style={[styles.helperText, {color: colors.placeholder}]}>
                An optional passphrase to protect your key.
            </Text>

            <NativeButton mode="contained" onPress={handleGenerateKey} style={{marginTop: 20}}>
                Generate Key
            </NativeButton>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    helperText: {
        fontSize: 12,
        marginTop: -10,
        marginBottom: 16,
        marginLeft: 4,
    }
});