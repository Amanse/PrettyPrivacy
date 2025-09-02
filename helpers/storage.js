import {MMKV} from 'react-native-mmkv';
import * as SecureStore from 'expo-secure-store'; // Or use react-native-keychain

const MASTER_KEY_ID = 'mmkv.master.encryption.key';

// 1. General, non-encrypted storage for everyday use
export const generalStorage = new MMKV({
    id: 'general-storage',
});

// 2. A placeholder for our secure storage
let secureStorage = null;

/**
 * This function initializes the secure, encrypted storage.
 * It must be called once when the app starts.
 */
export async function initializeSecureStorage() {
    // If already initialized, do nothing
    if (secureStorage) {
        return;
    }

    // A. Try to get the master key from the device's secure vault
    let masterKey = await SecureStore.getItemAsync(MASTER_KEY_ID);

    if (!masterKey) {
        // B. If no key exists, generate a new one
        // In a real app, use a library like 'react-native-randombytes' to generate 32 random bytes.
        // For this example, we'll create a simple pseudo-random key.
        masterKey = [...Array(32)].map(() => Math.floor(Math.random() * 256)).join('');

        // C. Store the new key securely for future sessions
        await SecureStore.setItemAsync(MASTER_KEY_ID, masterKey);
    }

    // D. Initialize the secure MMKV instance with the key
    secureStorage = new MMKV({
        id: 'secure-storage',
        encryptionKey: masterKey,
    });
}

/**
 * A getter function to access the secure storage.
 * Throws an error if the storage hasn't been initialized.
 */
export function getSecureStorage() {
    if (!secureStorage) {
        throw new Error("Secure storage has not been initialized! Call initializeSecureStorage() first.");
    }
    return secureStorage;
}