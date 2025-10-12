// To navigate to this screen, use the router and pass the files as a JSON string:
// import { router } from 'expo-router';
// router.push({
//   pathname: '/preview',
//   params: { files: JSON.stringify([{ uri: 'file://...', name: 'file1.txt' }]) },
// });

import {View, Text, FlatList, StyleSheet} from 'react-native';
import {useLocalSearchParams, Stack} from 'expo-router';
import {Appbar, List, useTheme} from "react-native-paper";
import fileListItem from "../components/fileListItem";
import Share from 'react-native-share';

export default function PreviewScreen() {
    const params = useLocalSearchParams();
    const files = params.files ? JSON.parse(params.files) : [];
    const theme = useTheme();

    const showSignatures = params.showSignatures !== 'false';
    const allVerified = showSignatures && files.length > 0 && files.every(file => file.isVerified);
    const noneVerified = showSignatures && files.length > 0 && !files.some(file => file.isVerified);

    const statusHeader = () => {
        if (showSignatures) {
            if (allVerified) {
                return (
                    <List.Item
                        title="All file signatures verified"
                        left={props => <List.Icon {...props} icon="check-circle" color={theme.colors.primary}/>}
                        titleStyle={{color: theme.colors.primary}}
                    />
                );
            } else if (noneVerified) {
                return (
                    <List.Item
                        title="File signatures not verified"
                        left={props => <List.Icon {...props} icon="close-circle" color={theme.colors.error}/>}
                        titleStyle={{color: theme.colors.error}}
                    />
                );
            } else {
                return (
                    <List.Item
                        title="Some file signatures verified"
                        left={props => <List.Icon {...props} icon="alert-circle" color={theme.colors.error}/>}
                        titleStyle={{color: theme.colors.error}}
                    />
                );
            }
        } else {
            return null
        }
    }


    const shareAllFiles = async () => {
        try {
            const fileUris = files.map(file => file.uri);

            const shareOptions = {
                title: 'Sharing Decrypted files',
                message: 'Here are some files for you!',
                urls: fileUris
            }

            await Share.open(shareOptions)
        } catch (e) {
            if (e.message !== "User did not share") {
                console.error(e.message)
            }
        }
    }

    return (
        <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
            <Stack.Screen options={{
                header: (props) => (
                    <Appbar.Header>
                        <Appbar.Content
                            title={`${params.isEncrypted === 'true' ? "Encrypted" : "Decrypted"} Files`}/>
                        <Appbar.Action icon="share-variant" onPress={shareAllFiles}/>
                    </Appbar.Header>
                )
            }}/>
            {statusHeader()}
            <FlatList
                data={files}
                renderItem={({item}) => fileListItem({item, theme, isEncrypted: params.isEncrypted === 'true', showIndividualStatus: showSignatures && !allVerified && !noneVerified})}
                keyExtractor={(item, index) => item.uri + index}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={{color: theme.colors.text}}>No files to preview.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
    },
    pressable: {
        flex: 1,
        marginHorizontal: 8,
    },
    fileName: {
        fontSize: 16,
        textAlign: 'center',
    },
    button: {
        minWidth: 80,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    }
});