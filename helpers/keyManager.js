import {generalStorage, getSecureStorage} from './storage';
import OpenPGP from "react-native-fast-openpgp";
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

export default class PGPKeyManager {

    constructor() {
    }

    initStorages() {
        if (!this.publicStorage || !this.privateStorage) {
            this.publicStorage = generalStorage; // Non-encrypted storage for public keys
            this.privateStorage = getSecureStorage(); // Encrypted storage for private keys
            this.storageInit = true;
        }
    }

    getPublicKeys() {
        const keys = this.publicStorage.getAllKeys();
        return keys.map(keyId => JSON.parse(this.publicStorage.getString(keyId)));
    }

    getPrivateKeys() {
        const keys = this.privateStorage.getAllKeys();
        return keys.map(keyId => JSON.parse(this.privateStorage.getString(keyId)));
    }

    getPublicKeyById(keyId) {
        if (!this.publicStorage) {
            this.initStorages()
        }
        console.debug("getPublicKeyById ", keyId);
        try {
            console.log(this.publicStorage)
            const keyData = this.publicStorage.getString(keyId);
            console.debug("getPublicKeyById ", keyData);
            return keyData ? JSON.parse(keyData) : null;
        } catch (e) {
            console.error("Error accessing public storage", e);
            throw e;
        }
    }

    getPrivateKeyById(keyId) {
        console.debug("getPrivateKeyById", keyId);
        try {
            const keyData = this.privateStorage.getString(keyId);
            return keyData ? JSON.parse(keyData) : null;
        } catch (e) {
            console.error("Error accessing private storage", e);
            throw e;
        }
    }

    async importFromFile() {
        if (!this.publicStorage || !this.privateStorage) {
            this.initStorages()
        }
        try {
            // 1. Pick the file
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*', // Allow all file types
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                console.log('File picked:', file.uri);

                // 2. Read the file's content as text
                const content = await FileSystem.readAsStringAsync(file.uri, {
                    encoding: FileSystem.EncodingType.UTF8,
                });

                return await this.saveKey(content)
            } else {
                console.log('File picking was canceled or no file selected.');
            }
        } catch (err) {
            console.error('Error picking or reading file:', err);
            throw err;
        }
    };

    async saveKey(keyString) {
        console.log(keyString)
        const isPrivate = !keyString.includes("PUBLIC");
        let metaData;
        if (isPrivate) {
            metaData = await OpenPGP.getPrivateKeyMetadata(keyString);
        } else {
            metaData = await OpenPGP.getPublicKeyMetadata(keyString);
        }
        const id = metaData.keyID;

        if (this.publicStorage.contains(id)) {
            throw new Error("Key with this ID already exists");
        }

        const userId = metaData.identities[0].id;
        const isEncrypted = metaData.encrypted;

        const keyData = {
            id,
            userId,
            isPrivate,
            keyString,
            isEncrypted,
        }

        if (isPrivate) {
            const pubKey = await OpenPGP.convertPrivateKeyToPublicKey(keyString);
            let pubData = {...keyData};
            pubData.keyString = pubKey;
            pubData.isPrivate = false;
            this.publicStorage.set(id, JSON.stringify(pubData));
            this.privateStorage.set(id, JSON.stringify(keyData));
        } else {
            this.publicStorage.set(id, JSON.stringify(keyData));
        }
        console.log("saved")
        return keyData
    }
}