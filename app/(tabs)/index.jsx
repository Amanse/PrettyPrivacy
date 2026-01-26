import React, { useCallback } from 'react';
import { useFocusEffect, useRouter } from "expo-router"
import * as Clipboard from "expo-clipboard"
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { decryptMessage, decryptFiles } from "../../helpers/cryptoOps";
import { pickFileAndGetData } from "../../helpers/general";
import LoadingDialog from "../../components/loadingDialog";
import PassphraseDialog from "../../components/passphraseDialog";
import { Ionicons } from '@expo/vector-icons';
import NativeSnackbar from '../../components/ui/NativeSnackbar';
import { useThemeColors } from '../../components/ui/Theme';

const EncryptDecryptScreen = () => {
    const colors = useThemeColors();
    const router = useRouter();

    const [visible, setVisible] = React.useState(false);
    const [passPhrase, setPassPhrase] = React.useState("");
    const [resolvePassphrase, setResolvePassphrase] = React.useState(null);
    const [checked, setChecked] = React.useState(false);
    const [snackbar, setSnackbar] = React.useState({ visible: false, message: '' });
    const [isLoading, setIsLoading] = React.useState(false);

    const showDialog = () => setVisible(true);
    const hideDialog = () => {
        setVisible(false)
        setPassPhrase("");
        setChecked(false);
    }
    const hideLoading = () => setIsLoading(false);

    useFocusEffect(
        useCallback(() => {
            return () => {
                setIsLoading(false);
                setVisible(false);
                setResolvePassphrase(null);
                setPassPhrase("");
                setChecked(false);
                setSnackbar({ visible: false, message: '' });
            };
        }, [])
    )

    const readFromClipboardAndDecrypt = async () => {
        setIsLoading(true);
        const text = await Clipboard.getStringAsync();
        const result = await decryptMessage(text, askPassphrase);
        setIsLoading(false);
        if (result.error) {
            setSnackbar({ visible: true, message: result.error });
        } else {
            router.push({
                pathname: '/textPreview',
                params: {
                    text: result.msg,
                    isVerified: result.isVerified,
                }
            });
        }
    }

    const askPassphrase = () => {
        setIsLoading(false);
        showDialog();
        return new Promise((resolve) => {
            setResolvePassphrase(() => resolve);
        });
    }

    const handleDecrypt = () => {
        if (resolvePassphrase) {
            resolvePassphrase({ passPhrase, useBiometrics: checked });
        }
        hideDialog();
        setIsLoading(true);
    };

    const selectAndDecryptFile = async () => {
        try {
            const files = await pickFileAndGetData(false);

            if (!files || files.length === 0) {
                setSnackbar({ visible: true, message: 'Please select at least one file.' });
                return;
            }

            setIsLoading(true);
            const res = await decryptFiles(files, askPassphrase);
            setIsLoading(false);

            router.push({
                pathname: "/preview",
                params: {
                    files: JSON.stringify(res)
                }
            })

        } catch (err) {
            console.error(err)
            setSnackbar({ visible: true, message: err.message || 'An unexpected error occurred.' });
        }
    };

    const MenuItem = ({ title, icon, rightIcon, onPress }) => (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.menuItem,
                pressed && { backgroundColor: colors.surface }
            ]}
        >
            <View style={styles.menuLeft}>
                <Ionicons name={icon} size={24} color={colors.text} style={styles.menuIcon} />
                <Text style={[styles.menuTitle, { color: colors.text }]}>{title}</Text>
            </View>
            <Ionicons name={rightIcon || "chevron-forward"} size={20} color={colors.placeholder} />
        </Pressable>
    );

    const SectionHeader = ({ title }) => (
        <Text style={[styles.sectionHeader, { color: colors.primary }]}>{title}</Text>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
                <SectionHeader title="Encrypt" />
                <MenuItem
                    title="Encrypt files"
                    icon="lock-closed-outline"
                    rightIcon="folder-outline"
                    onPress={() => router.navigate("/encrypt/encryptFiles")}
                />
                <MenuItem
                    title="Encrypt text"
                    icon="text-outline"
                    rightIcon="chatbubble-ellipses-outline"
                    onPress={() => router.navigate("/encrypt/encryptText")}
                />

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <SectionHeader title="Decrypt/Verify" />
                <MenuItem
                    title="Select input files"
                    icon="key-outline"
                    rightIcon="folder-open-outline"
                    onPress={selectAndDecryptFile}
                />
                <MenuItem
                    title="Read from clipboard"
                    icon="clipboard-outline"
                    rightIcon="copy-outline"
                    onPress={() => readFromClipboardAndDecrypt()}
                />

                <PassphraseDialog
                    visible={visible}
                    onDismiss={hideDialog}
                    onSubmit={handleDecrypt}
                    passPhrase={passPhrase}
                    setPassPhrase={setPassPhrase}
                    checked={checked}
                    setChecked={setChecked}
                    submitLabel="Decrypt"
                />
                
                <NativeSnackbar
                    visible={snackbar.visible}
                    onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
                >
                    {snackbar.message}
                </NativeSnackbar>
                
                <LoadingDialog onDismiss={hideLoading} visible={isLoading} color={colors.primary} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    sectionHeader: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 24,
        marginBottom: 8,
        marginLeft: 16,
        textTransform: 'uppercase',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIcon: {
        marginRight: 16,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '400',
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        marginVertical: 8,
        marginHorizontal: 16,
    }
});

export default EncryptDecryptScreen;
