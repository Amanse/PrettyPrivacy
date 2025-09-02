import {Tabs} from 'expo-router';
import {MD3DarkTheme, Provider as PaperProvider, useTheme} from 'react-native-paper';
import {IconSymbol} from "../app-example/components/ui/IconSymbol";
import React from "react";
import {FontAwesome5} from "@expo/vector-icons";
import {initializeSecureStorage} from "../helpers/storage";
import {Text} from "react-native";
import PGPKeyManager from "../helpers/keyManager";

const theme = {...MD3DarkTheme};

function Layout() {
    const theme = useTheme(); // Hook to get theme colors
    const [isStorageInitialized, setIsStorageInitialized] = React.useState(false);
    const [keys, setKeys] = React.useState([]);

    React.useEffect(() => {
        const setup = async () => {
            await initializeSecureStorage();
            const keyManager = new PGPKeyManager();
            const publicKeys = keyManager.getPublicKeys();
            const privateKeys = keyManager.getPrivateKeys();
            setKeys(publicKeys);
            console.log(keys)
        };
        setup().then(() => setIsStorageInitialized(true));
    }, []);

    return isStorageInitialized ? (
        <Tabs
            screenOptions={{
                // Style the header bar
                headerStyle: {
                    backgroundColor: theme.colors.surface,
                },
                headerTintColor: theme.colors.onSurface,
                // Style the tab bar
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                },
                tabBarActiveTintColor: theme.colors.primary,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Encrypt/Decrypt',
                    tabBarIcon: ({color}) => (
                        <FontAwesome5 name="lock" size={24} color={color}/>
                    ),
                    // ... your other options
                }}
            />
            <Tabs.Screen
                name="keys"
                options={{
                    title: 'Keys',
                    tabBarIcon: ({color}) => (
                        <FontAwesome5 name="key" size={24} color={color}/>
                    ),
                }}
            />
        </Tabs>
    ) : (<Text>Loading</Text>);
}

export default function RootLayout() {
    return (
        <PaperProvider theme={theme}>
            <Layout/>
        </PaperProvider>
    );
}