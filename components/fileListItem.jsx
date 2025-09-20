import {Alert, Pressable, StyleSheet, Text, View} from "react-native";
import {Button} from "react-native-paper";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";

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
            if (!(await Sharing.isAvailableAsync())) {
                Alert.alert("Sharing is not available on your platform");
                return;
            }
            try {
                await Sharing.shareAsync(uri, {dialogTitle: `Save ${name}`, mimeType});
            } catch (error) {
                Alert.alert("Error", "Could not save file.");
            }
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