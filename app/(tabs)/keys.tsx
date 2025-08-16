import * as React from 'react';
import {FlatList, StyleSheet, useColorScheme, View} from 'react-native';
import {FAB, PaperProvider, Text, List, MD3DarkTheme, MD3LightTheme} from 'react-native-paper';
import {useEffect, useMemo, useState} from "react";
import {PublicKey} from "@/types/Keys";
import {useMaterial3Theme} from "@pchmn/expo-material3-theme";
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';

export default function Keys() {
    const [publicKeys, setPublicKeys] = useState<PublicKey[]>([]);
    const colorScheme = useColorScheme();
    const {theme} = useMaterial3Theme();
    const [pickedFile, setPickedFile] = useState(null);

    // The 'theme' object will contain both light and dark palettes
    const currentTheme = theme[colorScheme ?? "dark"];

    const renderKey = ({item}: { item: PublicKey }) => (
        <List.Item
            title={item.name}
            description={`Email: ${item.email}\nID: ${item.id}`}
            descriptionNumberOfLines={2} // Allow description to wrap to two lines
            style={{justifyContent: 'center'}}
            left={props => <List.Icon {...props} icon="key-variant"/>}
        />
    );
    const [state, setState] = React.useState({open: false});
    const onStateChange = ({open}) => setState({open});
    const {open} = state;

    useEffect(() => {
        const fetchKeys = async () => {
            try {
                const existingKeys = await SecureStore.getItemAsync('publicKeys');
                if (existingKeys) {
                    setPublicKeys(JSON.parse(existingKeys));
                }
            } catch (error) {
                console.error('Error fetching keys from SecureStore:', error);
            }
        };

        fetchKeys();
    }, [])

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

                const newKey: PublicKey = {
                    id: file.name, // Use the file name as the ID
                    name: file.name,
                    email: '', // You might want to extract this from the content if available
                    key: content, // Store the content of the key
                }

                setPublicKeys((prev) => [...prev, newKey]); // Add the new key to the list
                const existingKeys = await SecureStore.getItemAsync('publicKeys');
                const keysArray = existingKeys ? JSON.parse(existingKeys) : [];
                keysArray.push(newKey);
                await SecureStore.setItemAsync('publicKeys', JSON.stringify(keysArray));
            } else {
                setPickedFile(null); // User cancelled the picker
            }

        } catch (err) {
            console.error('Error picking document:', err);
            // This can happen if the user's device doesn't have a file picker app.
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
            <View style={[styles.container, {backgroundColor: currentTheme.background}]}>
                <FlatList
                    data={publicKeys}
                    renderItem={renderKey}
                    keyExtractor={(item: PublicKey) => item.id}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.text}>No keys found. Press '+' to add one.</Text>
                        </View>
                    }
                    contentContainerStyle={publicKeys.length === 0 ? styles.flatListEmpty : null}
                />

                <FAB.Group
                    open={open}
                    visible
                    icon="plus" // A plus icon from MaterialCommunityIcons
                    label="Add" // Optional text label
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
    fab: {
        position: 'absolute',
        margin: 0,
        right: 0,
        bottom: 0,
    },
});