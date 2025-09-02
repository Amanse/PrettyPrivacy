import {generalStorage, getSecureStorage} from './storage';
import OpenPGP from "react-native-fast-openpgp";
import Message from "@isomorphic-pgp/parser/Message"

export default class PGPKeyManager {

    constructor() {
        this.publicStorage = generalStorage; // Non-encrypted storage for public keys
        this.privateStorage = getSecureStorage(); // Encrypted storage for private keys
    }

    getPublicKeys() {
        const keys = this.publicStorage.getAllKeys();
        console.log(keys)
        return keys.map(keyId => ({[keyId]: JSON.parse(this.publicStorage.getString(keyId))}));
    }

    getPrivateKeys() {
        const keys = this.privateStorage.getAllKeys();
        return keys.map(keyId => JSON.parse(this.privateStorage.getString(keyId)));
    }

    getPublicKeyById(keyId) {
        const keyData = this.publicStorage.getString(keyId);
        return keyData ? JSON.parse(keyData) : null;
    }

    getPrivateKeyById(keyId) {
        const keyData = this.privateStorage.getString(keyId);
        return keyData ? JSON.parse(keyData) : null;
    }

    async saveKey(keyString) {
        console.log(keyString)
        const parsedString = Message.parse(keyString);
        const userId = parsedString.packets[1]["packet"]["userid"];
        let isPrivate = false;
        console.log("here")
        let metaData;
        if (isPrivate) {
            metaData = await OpenPGP.getPrivateKeyMetadata(keyString);
        } else {
            metaData = await OpenPGP.getPublicKeyMetadata(keyString);
        }

        const keyId = metaData["keyID"];

        const keyData = {
            id: keyId,
            userId,
            isPrivate,
            keyString,
        }
        if (isPrivate) {
            this.privateStorage.set(keyId, JSON.stringify(keyData));
        } else {
            this.publicStorage.set(keyId, JSON.stringify(keyData));
        }
        console.log("saved")
    }
}