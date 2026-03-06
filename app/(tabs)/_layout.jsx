import {NativeTabs} from 'expo-router/unstable-native-tabs';
import React from "react";
import { useThemeColors } from '../../components/ui/Theme';

export default function TabLayout() {
    const colors = useThemeColors();

    return (
        <NativeTabs
            labelStyle={{
                color: colors.text,
            }}
            tintColor={colors.primary}
        >
            <NativeTabs.Trigger name="index">
                <NativeTabs.Trigger.Label>Encrypt/Decrypt</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon sf="lock.fill"/>
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="keys">
                <NativeTabs.Trigger.Label>Keys</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon sf="key.fill"/>
            </NativeTabs.Trigger>
        </NativeTabs>
    );
}
