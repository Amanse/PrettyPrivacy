// To navigate to this screen, use the router and pass the files as a JSON string:
// import { router } from 'expo-router';
// router.push({
//   pathname: '/preview',
//   params: { files: JSON.stringify([{ uri: 'file://...', name: 'file1.txt' }]) },
// });

import {View, Text, FlatList, StyleSheet} from 'react-native';
import {useLocalSearchParams, Stack} from 'expo-router';
import {Appbar, useTheme} from "react-native-paper";
import fileListItem from "../components/fileListItem";
import Share from 'react-native-share';

export default function PreviewScreen() {
    const params = useLocalSearchParams();
    // expecting { files: JSON.stringify([{ uri, name }]), isEncrypted: 'true' | 'false' }
    const files = params.files ? JSON.parse(params.files) : [];
    const theme = useTheme();

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
                            title={`${params.isEncrypted ? "Encrypted" : "Decrypted"} Files`}/>
                        <Appbar.Action icon="share-variant" onPress={shareAllFiles}/>
                    </Appbar.Header>
                )
            }}/>
            <FlatList
                data={files}
                renderItem={({item}) => fileListItem({item, theme, isEncrypted: !params.isEncrypted})}
                keyExtractor={(item, index) => item.uri+index}
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
