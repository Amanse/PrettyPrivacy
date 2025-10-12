import {generalStorage, getSecureStorage} from './storage';
import OpenPGP from "react-native-fast-openpgp";
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

export default class PGPKeyManager {
    static instance = null;

    static getInstance() {
        if (!PGPKeyManager.instance) {
            PGPKeyManager.instance = new PGPKeyManager();
        }
        return PGPKeyManager.instance;
    }

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
        try {
            const keyData = this.publicStorage.getString(keyId);
            return keyData ? JSON.parse(keyData) : null;
        } catch (e) {
            console.error("Error accessing public storage", e);
            throw e;
        }
    }

    async deleteKeyById(keyId) {
        if (!this.publicStorage || !this.privateStorage) {
            this.initStorages()
        }
        try {
            this.publicStorage.delete(keyId);
            this.privateStorage.delete(keyId);
            return true;
        } catch (e) {
            console.error("Error deleting key", e);
            throw e;
        }
    }

    async generateKeyPairAndSave(name, email, passphrase) {
        if (!this.publicStorage) {
            this.initStorages()
        }

        const keyPair = await OpenPGP.generate({
            name,
            email,
            passphrase: passphrase || "",
        });

        await this.saveKey(keyPair.privateKey);

        return "success"
    }

    getPrivateKeyById(keyId) {
        console.debug("getPrivateKeyById", keyId);
        if (!this.privateStorage) {
            this.initStorages()
        }
        try {
            const keyData = this.privateStorage.getString(keyId);
            return keyData ? JSON.parse(keyData) : null;
        } catch (e) {
            console.error("Error accessing private storage", e);
            throw e;
        }
    }

    getPrivateKeyBySubKeyId(subKeyId) {
        console.debug("getPrivateKeyBySubKeyId", subKeyId);
        if (!this.privateStorage) {
            this.initStorages()
        }
        try {
            const keys = this.privateStorage.getAllKeys();
            for (let keyId of keys) {
                const keyData = JSON.parse(this.privateStorage.getString(keyId));
                if (keyData.subKeyId === subKeyId) {
                    return keyData;
                }
            }
            return null;
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

    async getPublicKeyFromSigningKey(signingKeyId) {
        console.log('getPublicKeyFromSigningKey', signingKeyId);
        if (!this.publicStorage) {
            this.initStorages()
        }
        const pubKeys = this.publicStorage.getAllKeys();
        for (let keyId of pubKeys) {
            const keyData = JSON.parse(this.publicStorage.getString(keyId));
            if (keyData.signingKey === signingKeyId) {
                return keyData;
            }
            // Backwards Compatibility
            const metaData = await OpenPGP.getPublicKeyMetadata(keyData.keyString);
            if (metaData.canSign) {
                const newKeyData = {...keyData, signingKey: metaData.keyIDNumeric};
                this.publicStorage.set(keyId, JSON.stringify(newKeyData));
            }
            if (signingKeyId === metaData.keyIDNumeric) {
                console.log(keyData)
                return keyData;
            }
        }
        return null;
    }

    async saveKey(keyString) {
        console.log(keyString)
        if (!this.publicStorage || !this.privateStorage) {
            this.initStorages()
        }
        const isPrivate = !keyString.includes("PUBLIC");
        let metaData;
        if (isPrivate) {
            metaData = await OpenPGP.getPrivateKeyMetadata(keyString);
        } else {
            metaData = await OpenPGP.getPublicKeyMetadata(keyString);
        }
        const id = metaData.keyID;

        const alreadyPrivate = this.privateStorage.contains(id);
        const alreadyPublic = this.publicStorage.contains(id);

        if ((isPrivate && alreadyPrivate && alreadyPublic) || (!isPrivate && alreadyPublic)) {
            throw new Error("Key with this ID already exists");
        }

        const userId = metaData.identities[0].id;
        const isEncrypted = metaData.encrypted;
        const subKeyId = metaData.subKeys && metaData.subKeys.length > 0 ? metaData.subKeys[0].keyID : null;
        const canSign = metaData.canSign;

        const keyData = {
            id,
            userId,
            isPrivate,
            keyString,
            subKeyId,
            isEncrypted,
            signingKey: canSign ? metaData.keyIdNumeric : null,
        }

        if (isPrivate) {
            const pubKey = await OpenPGP.convertPrivateKeyToPublicKey(keyString);
            let pubData = {...keyData};
            pubData.keyString = pubKey;
            pubData.isPrivate = false;
            if (!alreadyPublic) {
                this.publicStorage.set(id, JSON.stringify(pubData));
            }
            if (!alreadyPrivate) {
                this.privateStorage.set(id, JSON.stringify(keyData));
            }
        } else {
            this.publicStorage.set(id, JSON.stringify(keyData));
        }
        console.log("saved")
        return keyData
    }
}

