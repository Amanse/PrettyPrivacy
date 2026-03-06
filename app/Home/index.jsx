import React, { useCallback } from 'react';
import { useFocusEffect, useRouter } from "expo-router"
import * as Clipboard from "expo-clipboard"
import { ScrollView, View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { decryptMessage, decryptFiles } from "../../helpers/cryptoOps";
import { pickFileAndGetData } from "../../helpers/general";
import { Ionicons } from '@expo/vector-icons';
import NativeSnackbar from '../../components/ui/NativeSnackbar';
import { useThemeColors } from '../../components/ui/Theme';
import NativeDialog from '../../components/ui/NativeDialog';
import NativeInput from '../../components/ui/NativeInput';
import NativeCheckbox from '../../components/ui/NativeCheckbox';
import NativeButton from '../../components/ui/NativeButton';

const EncryptDecryptScreen = () => {
    const colors = useThemeColors();
    const router = useRouter();

    const [activeModal, setActiveModal] = React.useState('none'); // 'none', 'loading', 'passphrase'
    const [passPhrase, setPassPhrase] = React.useState("");
    const [resolvePassphrase, setResolvePassphrase] = React.useState(null);
    const [checked, setChecked] = React.useState(false);
    const [snackbar, setSnackbar] = React.useState({ visible: false, message: '' });

    useFocusEffect(
        useCallback(() => {
            return () => {
                setActiveModal('none');
                setResolvePassphrase(null);
                setPassPhrase("");
                setChecked(false);
                setSnackbar({ visible: false, message: '' });
            };
        }, [])
    )

    const readFromClipboardAndDecrypt = async () => {
        setActiveModal('loading');
        await new Promise(r => setTimeout(r, 100));
        const text = await Clipboard.getStringAsync();
        const result = await decryptMessage(text, askPassphrase);
        setActiveModal('none');
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

    const askPassphrase = async () => {
        setActiveModal('passphrase');
        return new Promise((resolve) => {
            setResolvePassphrase(() => resolve);
        });
    }

    const handleDecryptDialogSubmit = async () => {
        const resolve = resolvePassphrase;
        if (resolve) {
            setResolvePassphrase(null);
            setActiveModal('loading');
            await new Promise(r => setTimeout(r, 100));
            resolve({ passPhrase, useBiometrics: checked });
        }
    };

    const selectAndDecryptFile = async () => {
        try {
            const files = await pickFileAndGetData(false);

            if (!files || files.length === 0) {
                setSnackbar({ visible: true, message: 'Please select at least one file.' });
                return;
            }

            setActiveModal('loading');
            await new Promise(r => setTimeout(r, 100));
            const res = await decryptFiles(files, askPassphrase);
            setActiveModal('none');

            router.push({
                pathname: "/preview",
                params: {
                    files: JSON.stringify(res)
                }
            })

        } catch (err) {
            console.error(err)
            setSnackbar({ visible: true, message: err.message || 'An unexpected error occurred.' });
            setActiveModal('none');
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

                <NativeDialog
                    visible={activeModal !== 'none'}
                    onDismiss={() => setActiveModal('none')}
                    title={activeModal === 'passphrase' ? 'Enter private key password' : null}
                >
                    {activeModal === 'loading' && (
                        <View style={styles.loadingContent}>
                            <ActivityIndicator animating={true} size="large" color={colors.primary}/>
                            <Text style={[styles.loadingText, {color: colors.text}]}>Processing...</Text>
                        </View>
                    )}
                    {activeModal === 'passphrase' && (
                        <View>
                            <NativeInput
                                secureTextEntry={true}
                                autoComplete="current-password"
                                autoCapitalize="none"
                                autoCorrect={false}
                                value={passPhrase}
                                onChangeText={setPassPhrase}
                                placeholder="Passphrase"
                            />
                            <NativeCheckbox
                                label="Save password with biometrics"
                                checked={checked}
                                onChange={setChecked}
                                style={{marginBottom: 20}}
                            />
                            <View style={styles.actions}>
                                <NativeButton
                                    mode="text"
                                    onPress={() => setActiveModal('none')}
                                    style={{flex: 1, marginRight: 8}}
                                >
                                    Cancel
                                </NativeButton>
                                <NativeButton
                                    mode="contained"
                                    onPress={handleDecryptDialogSubmit}
                                    style={{flex: 1, marginLeft: 8}}
                                >
                                    Decrypt
                                </NativeButton>
                            </View>
                        </View>
                    )}
                </NativeDialog>
                
                <NativeSnackbar
                    visible={snackbar.visible}
                    onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
                >
                    {snackbar.message}
                </NativeSnackbar>
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
    },
    loadingContent: {
        alignItems: 'center',
        padding: 10,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: '500',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    }
});

export default EncryptDecryptScreen;
