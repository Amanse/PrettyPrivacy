import * as React from 'react';
import {FlatList, StyleSheet, useColorScheme, View} from 'react-native';
import {FAB, PaperProvider, Text, List, MD3DarkTheme, MD3LightTheme} from 'react-native-paper';
import {useEffect, useMemo, useState} from "react";
import {useMaterial3Theme} from "@pchmn/expo-material3-theme";
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import PGPKeyManager from "@/helpers/keyManager";

export default function Keys() {
    const [publicKeys, setPublicKeys] = useState([]);
    const colorScheme = useColorScheme();
    const {theme} = useMaterial3Theme();
    const keyManager = useMemo(() => new PGPKeyManager(), []);

    const removeKeyFromStore = async (keyId) => {
        try {
            await keyManager.deleteKey(keyId);
            // Refresh the key list
            const keys = await keyManager.getKeyList();
            setPublicKeys(keys.filter(k => k.type === 'public'));
        } catch (error) {
            console.error('Error removing key:', error);
        }
    }

    const renderPublicKey = ({item}) => (
        <List.Item
            title={item.name}
            description={`ID: ${item.keyIDShort}`}
            descriptionNumberOfLines={1}
            style={{justifyContent: 'center'}}
            onLongPress={() => removeKeyFromStore(item.keyID)}
            left={props => <List.Icon {...props} icon="key-variant"/>}
        />
    );

    const renderEmailGroup = ({item}) => (
        <View>
            <Text style={styles.emailHeader}>{item.email}</Text>
            {item.keys.map(key => renderPublicKey({item: key}))}
        </View>
    );

    const [state, setState] = React.useState({open: false});
    const onStateChange = ({open}) => setState({open});
    const {open} = state;

    useEffect(() => {
        const fetchKeys = async () => {
            try {
                const keys = await keyManager.getKeyList();
                setPublicKeys(keys.filter(k => k.type === 'public'));
            } catch (error) {
                console.error('Error fetching keys:', error);
            }
        };

        fetchKeys();
    }, [keyManager]);

    // Group keys by email
    const groupedKeys = useMemo(() => {
        const groups = publicKeys.reduce((acc, key) => {
            const email = key.email || 'No Email';
            if (!acc[email]) {
                acc[email] = [];
            }
            acc[email].push(key);
            return acc;
        }, {});

        return Object.entries(groups).map(([email, keys]) => ({
            email,
            keys
        }));
    }, [publicKeys]);

    const importKeyFromFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                // To filter for PGP/GPG files, we use their MIME types.
                type: [
                    'application/pgp-encrypted',
                    'application/pgp-keys',
                    'application/pgp-signature',
                    'application/octet-stream', // A general fallback for unknown binary files
                ],
                copyToCacheDirectory: true, // Recommended to get a stable file path
            });

            console.log(result);

            // The new API returns a `canceled` boolean and an `assets` array.
            if (!result.canceled && result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                const content = await FileSystem.readAsStringAsync(file.uri);

                // Determine if it's a public or private key by checking content
                const isPrivate = content.includes('PRIVATE KEY');
                const keyData = await keyManager.storeKey(content, isPrivate ? 'private' : 'public');

                // Refresh the key lists
                const keys = await keyManager.getKeyList();
                setPublicKeys(keys.filter(k => k.type === 'public'));
            }
        } catch (err) {
            console.error('Error importing key:', err);
        }
    }

    const paperTheme = useMemo(
        () =>
            colorScheme === 'dark'
                ? {...MD3DarkTheme, colors: theme.dark}
                : {...MD3LightTheme, colors: theme.light},
        [colorScheme, theme]
    );

    return (
        <PaperProvider theme={paperTheme}>
            <View style={[styles.container, {backgroundColor: paperTheme.colors.background}]}>
                <FlatList
                    data={groupedKeys}
                    renderItem={renderEmailGroup}
                    keyExtractor={(item) => item.email}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.text}>No public keys found. Press '+' to add one.</Text>
                        </View>
                    }
                    contentContainerStyle={publicKeys.length === 0 ? styles.flatListEmpty : null}
                />

                <FAB.Group
                    open={open}
                    visible
                    icon="plus"
                    style={styles.fab}
                    onStateChange={onStateChange}
                    actions={[
                        {
                            icon: 'folder',
                            label: 'Import from file',
                            onPress: importKeyFromFile,
                        },
                        {
                            icon: 'key-remove',
                            label: 'Remove Key',
                            onPress: () => console.log('Remove Key pressed'),
                        },
                    ]}
                />
            </View>
        </PaperProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    flatListEmpty: {
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 18,
        textAlign: 'center',
    },
    emailHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    fab: {
        position: 'absolute',
        margin: 0,
        right: 0,
        bottom: 0,
    },
});
