import {View, ScrollView, StyleSheet} from 'react-native';
import {useLocalSearchParams, Stack} from 'expo-router';
import {Appbar, List, useTheme, Text, Portal, Snackbar} from "react-native-paper";
import * as Clipboard from 'expo-clipboard';
import Share from 'react-native-share';
import React from "react";

export default function TextPreviewScreen() {
    const params = useLocalSearchParams();
    // expecting { text: '...', isVerified: 'true' | 'false' }
    const { text, isVerified } = params;
    const theme = useTheme();
    const [snackbar, setSnackbar] = React.useState({visible: false, message: ''});

    const isSignatureVerified = isVerified === 'true';
    const isSignatureNotVerified = isVerified === 'false';

    const shareText = async () => {
        try {
            await Share.open({
                title: 'Sharing Decrypted Text',
                message: text,
            });
        } catch (e) {
            if (e.message !== "User did not share") {
                console.error(e.message);
            }
        }
    };

    const copyText = async () => {
        await Clipboard.setStringAsync(text);
        setSnackbar({visible: true, message: 'Copied to clipboard'});
    };

    return (
        <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
            <Stack.Screen options={{
                header: (props) => (
                    <Appbar.Header>
                        <Appbar.Content title="Decrypted Text" />
                        <Appbar.Action icon="share-variant" onPress={shareText} />
                        <Appbar.Action icon="content-copy" onPress={copyText} />
                    </Appbar.Header>
                )
            }}/>
            {isSignatureVerified && (
                <List.Item
                    title="Signature verified"
                    left={props => <List.Icon {...props} icon="check-circle" color={theme.colors.primary}/>}
                    titleStyle={{color: theme.colors.primary}}
                />
            )}
            {isSignatureNotVerified && (
                <List.Item
                    title="Signature not verified"
                    left={props => <List.Icon {...props} icon="close-circle" color={theme.colors.error}/>}
                    titleStyle={{color: theme.colors.error}}
                />
            )}
            <ScrollView style={styles.scrollView}>
                <Text selectable style={styles.text}>{text}</Text>
            </ScrollView>
            <Portal>
                <Snackbar
                    visible={snackbar.visible}
                    onDismiss={() => setSnackbar({...snackbar, visible: false})}
                    duration={Snackbar.DURATION_SHORT}>
                    {snackbar.message}
                </Snackbar>
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        paddingHorizontal: 16,
    },
    text: {
        fontSize: 16,
    }
});