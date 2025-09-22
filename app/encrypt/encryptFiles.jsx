import {Dropdown} from "react-native-paper-dropdown"
import {StyleSheet, View, FlatList} from "react-native";
import {useTheme, Button, List} from "react-native-paper";
import React from "react";
import {useData} from "../../helpers/contextProvider";
import PGPKeyManager from "../../helpers/keyManager";
import * as DocumentPicker from 'expo-document-picker';
import * as cryptoOpts from '../../helpers/cryptoOps'
import {useRouter} from "expo-router";

export default function EncryptFiles() {
    const [publicKey, setPublicKey] = React.useState("");
    const [files, setFiles] = React.useState([]);
    const {keys} = useData();
    const theme = useTheme();
    const keyManager = new PGPKeyManager();
    const router = useRouter();

    const pickDocuments = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
                multiple: true,
            });

            if (!result.canceled) {
                setFiles((files) => [...files, ...result.assets.map((file) => ({uri: file.uri, name: file.name}))]);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const encryptFiles = async () => {
        const key = keyManager.getPublicKeyById(publicKey);
        if (!key) {
            alert("Selected public key not found.");
            return;
        }
        console.log(`starting encryption for ${files.length} files`)
        // File encryption logic to be implemented here
        const res = await cryptoOpts.encryptFiles(files, key.keyString);
        console.log(res)
        router.push({
            pathname: '/preview',
            params: {files: JSON.stringify(res)}
        });
        console.log('Encrypting files:', files.map(f => f.name).join(', '));
    }

    return (
        <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
            <Dropdown
                label="Encrypt for"
                placeholder="Select Public Key"
                options={keys.map(key => ({label: key.userId, value: key.id}))}
                value={publicKey}
                onSelect={setPublicKey}
                style={{marginTop: 16}}
            />

            <Button
                mode="outlined"
                style={{marginVertical: 20}}
                onPress={pickDocuments}
                icon="file-plus"
            >
                Add Files
            </Button>

            <FlatList
                data={files}
                keyExtractor={(item) => item.uri}
                renderItem={({item}) => (
                    <List.Item
                        title={item.name}
                        left={props => <List.Icon {...props} icon="file-document-outline"/>}
                    />
                )}
            />

            <Button
                disabled={publicKey === "" || files.length === 0}
                mode="contained"
                style={{margin: 20}}
                onPress={encryptFiles}
            >
                Encrypt Files
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingLeft: 16,
        paddingRight: 16
    },
});
