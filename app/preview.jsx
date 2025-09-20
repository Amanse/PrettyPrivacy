// To navigate to this screen, use the router and pass the files as a JSON string:
// import { router } from 'expo-router';
// router.push({
//   pathname: '/preview',
//   params: { files: JSON.stringify([{ uri: 'file://...', name: 'file1.txt' }]) },
// });

import {View, Text, FlatList, Pressable, Button, StyleSheet, Alert} from 'react-native';
import {useLocalSearchParams, Stack} from 'expo-router';
import {useTheme} from "react-native-paper";
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

export default function PreviewScreen() {
    const params = useLocalSearchParams();
    // expecting { files: JSON.stringify([{ uri, name }]) }
    const files = params.files ? JSON.parse(params.files) : [];
    const theme = useTheme();

    const handleOpenFile = async (uri) => {
        if (!(await Sharing.isAvailableAsync())) {
            Alert.alert("Sharing is not available on your platform");
            return;
        }
        try {
            await Sharing.shareAsync(uri);
        } catch (error) {
            Alert.alert("Error", "Could not open file.");
        }
    };

    const handleShareFile = async (uri) => {
        if (!(await Sharing.isAvailableAsync())) {
            Alert.alert("Sharing is not available on your platform");
            return;
        }
        try {
            await Sharing.shareAsync(uri, {mimeType: "plain/text"});
        } catch (error) {
            Alert.alert("Error", "Could not share file.");
        }
    };

    const handleSaveFile = async (uri, name) => {
        const isMedia = /\.(jpe?g|png|gif|bmp|mp4|mov)$/i.test(name);
        if (isMedia) {
            try {
                const {status} = await MediaLibrary.requestPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission needed', 'This app needs permission to save files to your media library.');
                    return;
                }
                await MediaLibrary.saveToLibraryAsync(uri);
                Alert.alert('Saved!', 'File saved to your media library.');
            } catch (error) {
                console.error(error);
                Alert.alert('Error', 'Could not save file to media library.');
            }
        } else {
            // For other files, we can use the sharing intent to let the user save it.
            if (!(await Sharing.isAvailableAsync())) {
                Alert.alert("Sharing is not available on your platform");
                return;
            }
            try {
                await Sharing.shareAsync(uri, {dialogTitle: `Save ${name}`});
            } catch (error) {
                Alert.alert("Error", "Could not save file.");
            }
        }
    };

    const renderItem = ({item}) => (
        <View style={[styles.itemContainer, {backgroundColor: theme.colors.background}]}>
            <View style={styles.button}>
                <Button
                    title="Share"
                    color={theme.colors.primary}
                    onPress={() => handleShareFile(item.uri)}
                />
            </View>
            <Pressable
                onPress={() => handleOpenFile(item.uri)}
                style={styles.pressable}
            >
                <Text style={[styles.fileName, {color: "#FFF"}]} numberOfLines={1}>
                    {item.name}
                </Text>
            </Pressable>
            <View style={styles.button}>
                <Button
                    title="Save"
                    color={theme.colors.secondary}
                    onPress={() => handleSaveFile(item.uri, item.name)}
                />
            </View>
        </View>
    );

    return (
        <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
            <Stack.Screen options={{title: 'Decrypted Files'}}/>
            <FlatList
                data={files}
                renderItem={renderItem}
                keyExtractor={(item) => item.uri}
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
