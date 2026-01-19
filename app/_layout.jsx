import {useRouter} from 'expo-router';
import {MD3DarkTheme, Provider as PaperProvider, useTheme} from 'react-native-paper';
import React from "react";
import {NativeTabs, Icon, Label} from 'expo-router/unstable-native-tabs';
import {initializeSecureStorage} from "../helpers/storage";
import {Text, DynamicColorIOS} from "react-native";
import PGPKeyManager from "../helpers/keyManager";
import DataContext from '../helpers/contextProvider';
import {ShareIntentProvider, useShareIntentContext} from "expo-share-intent";

const theme = {...MD3DarkTheme};

function Layout() {
    const theme = useTheme(); // Hook to get theme colors
    const [isStorageInitialized, setIsStorageInitialized] = React.useState(false);
    const [keys, setKeys] = React.useState([]);
    const keyManager = React.useMemo(() => new PGPKeyManager(), []);
    const [updateKey, setUpdateKey] = React.useState(true);
    const router = useRouter();

    const {hasShareIntent, shareIntent, resetShareIntent} = useShareIntentContext();

    React.useEffect(() => {
        const setup = async () => {
            await initializeSecureStorage();
            keyManager.initStorages();
            const publicKeys = keyManager.getPublicKeys();
            const privateKeys = keyManager.getPrivateKeys();

            const finalKeys = publicKeys.map(pubKeyObj => {
                const keyId = pubKeyObj.id;
                const privKeyObj = privateKeys.find(privKey => privKey.id === keyId);
                return {
                    id: keyId,
                    userId: pubKeyObj.userId,
                    isPrivate: privKeyObj !== undefined,
                    subKeyId: pubKeyObj.subKeyId,
                };
            });

            setKeys(finalKeys);
        };
        setup().then(() => setIsStorageInitialized(true));

    }, [updateKey, keyManager]);

    React.useEffect(() => {
        if (hasShareIntent && shareIntent && shareIntent.files && shareIntent.files.length > 0 && isStorageInitialized) {
            const file = shareIntent.files[0];
            router.push({
                pathname: '/decryptImportedFile',
                params: {
                    fileUri: file.path || file.uri, // expo-share-intent usually uses 'path' for files
                    fileName: file.fileName || (file.path ? file.path.split('/').pop() : "Imported File")
                }
            });
            resetShareIntent();
        }
    }, [hasShareIntent, shareIntent, isStorageInitialized, router, resetShareIntent]);

    return isStorageInitialized ? (
        <DataContext.Provider value={{keys, setUpdateKey}}>
            <NativeTabs
                labelStyle={{
                    color: DynamicColorIOS({dark: 'white', light: 'black'}),
                }}
                tintColor={DynamicColorIOS({dark: 'white', light: 'black'})}
            >
                <NativeTabs.Trigger name="index">
                    <Label>Encrypt/Decrypt</Label>
                    <Icon sf="lock.fill"/>
                </NativeTabs.Trigger>
                <NativeTabs.Trigger name="keys">
                    <Label>Keys</Label>
                    <Icon sf="key.fill"/>
                </NativeTabs.Trigger>
            </NativeTabs>
        </DataContext.Provider>
    ) : (<Text>Loading</Text>);
}

export default function RootLayout() {
    return (
        <ShareIntentProvider>
            <PaperProvider theme={theme}>
                <Layout/>
            </PaperProvider>
        </ShareIntentProvider>
    );
}
