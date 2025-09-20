import {Alert, Pressable, StyleSheet, Text, View} from "react-native";
import {Button} from "react-native-paper";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";

export default function FileListItem({item, theme}) {
    const {uri, name, mimeType} = item;

    const handleOpenFile = async () => {
        if (!(await Sharing.isAvailableAsync())) {
            Alert.alert("Sharing is not available on your platform");
            return;
        }
        try {
            await Sharing.shareAsync(uri, {mimeType});
        } catch (error) {
            Alert.alert("Error", "Could not open file.");
        }
    };

    const handleShareFile = async () => {
        if (!(await Sharing.isAvailableAsync())) {
            Alert.alert("Sharing is not available on your platform");
            return;
        }
        try {
            await Sharing.shareAsync(uri, {mimeType});
        } catch (error) {
            Alert.alert("Error", "Could not share file.");
        }
    };

    const handleSaveFile = async () => {
        try {
            const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
            if (!permissions.granted) {
                // User cancelled the picker
                return;
            }

            const directoryUri = permissions.directoryUri;
            const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(directoryUri, name, mimeType);

            const content = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
            await FileSystem.writeAsStringAsync(fileUri, content, { encoding: FileSystem.EncodingType.Base64 });

            Alert.alert('File Saved', `Successfully saved ${name}.`);

        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'An error occurred while saving the file.');
        }
    };

    return (
        <View style={[styles.itemContainer, {borderBottomColor: theme.colors.border}]}>
            <Button
                mode="contained-tonal"
                onPress={handleShareFile}
            >
                Share
            </Button>
            <Pressable
                onPress={handleOpenFile}
                style={styles.pressable}
            >
                <Text style={[styles.fileName, {color: theme.colors.onBackground}]} numberOfLines={1}>
                    {name}
                </Text>
            </Pressable>
            <Button
                mode="contained-tonal"
                onPress={handleSaveFile}
            >
                Save
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
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
});