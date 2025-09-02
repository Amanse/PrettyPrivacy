import React from 'react';
import {View, StyleSheet} from 'react-native';
import {FAB, List, Text, useTheme, Divider} from 'react-native-paper';
import keyManager from "../helpers/keyManager";
import {useLocalSearchParams} from "expo-router";

const KeysScreen = () => {
    const theme = useTheme();
    const {getKeys} = useLocalSearchParams();
    const [keys, setKeys] = React.useState([]);
    const [fabState, setFabState] = React.useState({open: false});

    const onStateChange = ({open}) => setFabState({open});
    const {open} = fabState;

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
                            />
                            {index < keys.length - 1 && <Divider/>}
                        </React.Fragment>
                    ))}
                </List.Section>
            ) : (
                // Show a message if no keys exist
                <View style={styles.emptyContainer}>
                    <Text variant="titleMedium">No keys found</Text>
                    <Text variant="bodySmall">Press 'Add' to import or generate a new key.</Text>
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
                        onPress: () => console.log('Pressed Import'),
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