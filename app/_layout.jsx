import {Stack, useRouter} from 'expo-router';
import {MD3DarkTheme, Provider as PaperProvider} from 'react-native-paper';
import React from "react";
import {initializeSecureStorage} from "../helpers/storage";
import {Text} from "react-native";
import PGPKeyManager from "../helpers/keyManager";
import DataContext from '../helpers/contextProvider';
import {ShareIntentProvider, useShareIntentContext} from "expo-share-intent";

const theme = {...MD3DarkTheme};

function Layout() {
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
            <Stack>
                <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
            </Stack>
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
