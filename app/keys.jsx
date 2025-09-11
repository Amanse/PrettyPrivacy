import React, {useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import {FAB, List, Text, useTheme, Divider, Chip} from 'react-native-paper';
import {useData} from "../helpers/contextProvider";
import PGPKeyManager from "../helpers/keyManager";

const KeysScreen = () => {
    const theme = useTheme();
    const {keys, setKeys} = useData();
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
                            <List.Item
                                title={key.userId}
                                description={key.id}
                                left={props => <List.Icon {...props} icon="key-variant"/>}
                                right={props => <Chip>{key.isPrivate ? "Private" : "Public"}</Chip>}
                            />
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
                            const key = await keyManager.importFromFile();
                            setKeys((k) => [...k, key]);
                        },
                        size: 'medium',
                    },
                    {
                        icon: 'plus-box-outline',
                        label: 'Generate',
                        onPress: () => console.log('Pressed Generate'),
                        size: 'medium',
                    },
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