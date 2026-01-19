import {NativeTabs, Icon, Label} from 'expo-router/unstable-native-tabs';
import {DynamicColorIOS} from "react-native";
import React from "react";

export default function TabLayout() {
    return (
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
    );
}
