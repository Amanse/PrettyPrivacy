import {Tabs} from "expo-router";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import {useColorScheme} from 'react-native';
import {useMaterial3Theme} from "@pchmn/expo-material3-theme";

export default function TabsLayout() {
    const colorScheme = useColorScheme();
    const {theme} = useMaterial3Theme();

    // The 'theme' object will contain both light and dark palettes
    const currentTheme = theme[colorScheme ?? "dark"];
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: currentTheme.primary,
                tabBarInactiveTintColor: currentTheme.onSurfaceVariant,
                tabBarStyle: {
                    backgroundColor: currentTheme.surface,
                    borderTopColor: currentTheme.outline,
                    borderTopWidth: 1,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontFamily: 'SpaceMono',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Encrypt/Decrypt",
                    tabBarIcon: ({color}) => (
                        <FontAwesome5 name="lock" size={24} color={color}/>
                    ),
                }}
            />
            <Tabs.Screen
                name="keys"
                options={{
                    title: "Keys Management",
                    tabBarIcon: ({color}) => (
                        <FontAwesome5 name="key" size={24} color={color}/>
                    ),
                }}
            />
        </Tabs>
    );
}
