import {Tabs} from 'expo-router';
import {MD3DarkTheme, Provider as PaperProvider, useTheme} from 'react-native-paper';

import React from "react";
import {FontAwesome5} from "@expo/vector-icons";
import {initializeSecureStorage} from "../helpers/storage";
import {Text} from "react-native";
import PGPKeyManager from "../helpers/keyManager";
import DataContext from '../helpers/contextProvider'; // Import the context

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

            setKeys(publicKeys);
        };
        setup().then(() => setIsStorageInitialized(true));
    }, []);

    return isStorageInitialized ? (
        <DataContext.Provider value={{keys}}>
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
        </DataContext.Provider>
    ) : (<Text>Loading</Text>);
}

export default function RootLayout() {
    return (
        <PaperProvider theme={theme}>
            <Layout/>
        </PaperProvider>
    );
}