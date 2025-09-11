import React, {useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import {FAB, List, Text, useTheme, Divider, Chip} from 'react-native-paper';
import {useData} from "../helpers/contextProvider";
import PGPKeyManager from "../helpers/keyManager";
import {useRouter} from "expo-router";
import KeyListItem from "../components/keyListItem"
import * as Clipboard from 'expo-clipboard';

const KeysScreen = () => {
    const theme = useTheme();
    const {keys, setUpdateKey} = useData();
    const router = useRouter();
    const [fabState, setFabState] = React.useState({open: false});

    const onStateChange = ({open}) => setFabState({open});
    const {open} = fabState;
    const keyManager = new PGPKeyManager();

    useEffect(() => {
        keyManager.initStorages()
    }, [])

    return (
        <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
            {/* Display a list of existing keys */}
            {keys.length > 0 ? (
                <List.Section>
                    {keys.map((key, index) => (
                        <React.Fragment key={key.id}>
                            <KeyListItem item={key}/>
                            {index < keys.length - 1 && <Divider/>}
                        </React.Fragment>
                    ))}
                </List.Section>
            ) : (
                // Show a message if no keys exist
                <View style={styles.emptyContainer}>
                    <Text variant="titleMedium">No keys found</Text>
                    <Text variant="bodySmall">Press &apos;Add&apos; to import or generate a new key.</Text>
                </View>
            )}

            {/* Floating Action Button Group */}
            <FAB.Group
                open={open}
                visible
                icon={open ? 'key-variant' : 'plus'}
                label="Add"
                actions={[
                    {
                        icon: 'file-import-outline',
                        label: 'Import from file',
                        onPress: async () => {
                            await keyManager.importFromFile();
                            setUpdateKey(a => !a)
                        },
                        size: 'medium',
                    },
                    {
                        icon: 'plus-box-outline',
                        label: 'Generate',
                        onPress: () => {
                            router.navigate("/encrypt/generateKey")
                        },
                        size: 'medium',
                    },
                    {
                        icon: 'clipboard-outline',
                        label: 'Import from clipboard',
                        onPress: async () => {
                            try {
                                const key = await Clipboard.getStringAsync();
                                await keyManager.saveKey(key);
                                setUpdateKey(a => !a)
                            } catch (e) {
                                console.error(e)
                            }
                        },
                        size: 'medium',
                    }
                ]}
                onStateChange={onStateChange}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default KeysScreen;