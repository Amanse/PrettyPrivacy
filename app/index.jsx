import React from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {List, Divider, useTheme} from 'react-native-paper';

const EncryptDecryptScreen = () => {
    const theme = useTheme();

    return (
        <ScrollView style={{flex: 1, backgroundColor: theme.colors.background}}>
            <List.Section>
                <List.Subheader>Encrypt</List.Subheader>
                <List.Item
                    title="Encrypt files"
                    left={props => <List.Icon {...props} icon="file-lock-outline"/>}
                    right={props => <List.Icon {...props} icon="folder-outline"/>}
                />
                <List.Item
                    title="Encrypt text"
                    left={props => <List.Icon {...props} icon="format-letter-case"/>}
                    right={props => <List.Icon {...props} icon="message-text-outline"/>}
                />
            </List.Section>

            <Divider/>

            <List.Section>
                <List.Subheader>Decrypt/Verify</List.Subheader>
                <List.Item
                    title="Select input file"
                    left={props => <List.Icon {...props} icon="file-key-outline"/>}
                    right={props => <List.Icon {...props} icon="folder-open-outline"/>}
                />
                <List.Item
                    title="Read from clipboard"
                    left={props => <List.Icon {...props} icon="clipboard-text-search-outline"/>}
                    right={props => <List.Icon {...props} icon="clipboard-outline"/>}
                />
            </List.Section>
        </ScrollView>
    );
};

export default EncryptDecryptScreen;