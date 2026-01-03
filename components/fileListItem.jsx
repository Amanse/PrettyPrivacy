import {Alert, Platform, Pressable, StyleSheet, Text, View} from "react-native";
import {IconButton} from "react-native-paper";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import * as IntentLauncher from 'expo-intent-launcher';

export default function FileListItem({item, theme, allowOpen, showIndividualStatus}) {
    const {uri, name, mimeType, isVerified} = item;

    const handleOpenFile = async () => {
        if (allowOpen) {
            return await handleShareFile();
        }
        
        try {
            if (Platform.OS === 'android') {
                const contentUri = await FileSystem.getContentUriAsync(uri);
                await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                    data: contentUri,
                    flags: 1,
                    type: mimeType,
                });
            } else {
                 await Sharing.shareAsync(uri, {mimeType});
            }
        } catch (_error) {
            console.error(_error)
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
        } catch (_error) {
            Alert.alert("Error", "Could not share file.");
        }
    };

    const handleSaveFile = async () => {
        try {
            if (Platform.OS === 'android') {
                const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
                if (!permissions.granted) {
                    return;
                }

                const directoryUri = permissions.directoryUri;
                const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(directoryUri, name, mimeType);

                const content = await FileSystem.readAsStringAsync(uri, {encoding: FileSystem.EncodingType.Base64});
                await FileSystem.writeAsStringAsync(fileUri, content, {encoding: FileSystem.EncodingType.Base64});

                Alert.alert('File Saved', `Successfully saved ${name}.`);
            } else {
                 await Sharing.shareAsync(uri, {mimeType});
            }

        } catch (_error) {
            console.error(_error);
            Alert.alert('Error', 'An error occurred while saving the file.');
        }
    };

    return (
        <View style={[styles.itemContainer, {borderBottomColor: theme.colors.border}]}>
             <Pressable
                onPress={handleOpenFile}
                style={styles.pressable}
            >
                <View>
                    <Text style={[styles.fileName, {color: theme.colors.onBackground}]} numberOfLines={1} ellipsizeMode="middle">
                        {name}
                    </Text>
                    {showIndividualStatus && isVerified && (
                        <Text style={{color: theme.colors.primary, textAlign: 'left', fontSize: 12}}>Verified</Text>
                    )}
                </View>
            </Pressable>
            
            <View style={styles.actionContainer}>
                <IconButton
                    icon="share-variant"
                    mode="contained-tonal"
                    onPress={handleShareFile}
                    size={20}
                />
                <IconButton
                    icon="download"
                    mode="contained-tonal"
                    onPress={handleSaveFile}
                    size={20}
                />
            </View>
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
        marginRight: 8,
    },
    fileName: {
        fontSize: 16,
        textAlign: 'left',
    },
    actionContainer: {
        flexDirection: 'row',
    }
});