import {Stack, useRouter} from 'expo-router';
import React from "react";
import {initializeSecureStorage} from "../helpers/storage";
import {Text, View, useColorScheme} from "react-native";
import PGPKeyManager from "../helpers/keyManager";
import DataContext from '../helpers/contextProvider';
import {ShareIntentProvider, useShareIntentContext} from "expo-share-intent";
import { Colors } from '../components/ui/Theme';

function Layout() {
    const [isStorageInitialized, setIsStorageInitialized] = React.useState(false);
    const [keys, setKeys] = React.useState([]);
    const keyManager = React.useMemo(() => new PGPKeyManager(), []);
    const [updateKey, setUpdateKey] = React.useState(true);
    const router = useRouter();
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

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
            <Stack
                screenOptions={{
                    headerStyle: {
                        backgroundColor: themeColors.background,
                    },
                    headerTintColor: themeColors.text,
                    headerShadowVisible: false, // Cleaner native look
                }}
            >
                <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
            </Stack>
        </DataContext.Provider>
    ) : (<View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: themeColors.background}}><Text style={{color: themeColors.text}}>Loading...</Text></View>);
}

export default function RootLayout() {
    return (
        <ShareIntentProvider>
            <Layout/>
        </ShareIntentProvider>
    );
}
