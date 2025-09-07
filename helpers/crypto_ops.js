import OpenPGP from "react-native-fast-openpgp";
import PGPKeyManager from "./keyManager";

const keyManager = new PGPKeyManager()

export async function encryptMessage(message, publicKey) {
    try {
        const encrypted = await OpenPGP.encrypt(
            message,
            publicKey,
        );
        return encrypted;
    } catch (error) {
        console.error('Encryption failed:', error);
        throw new Error('Failed to encrypt the message. Please check the public key and try again.');
    }
}

export async function decryptMessage(message) {
    try {
        keyManager.initStorages();
        const privateKey = keyManager.getPrivateKeyById("C0E52C217A7905FF");
        console.log(privateKey)
        return await OpenPGP.decrypt(
            message,
            privateKey.keyString,
            ""
        );

    } catch (e) {
        console.error(e);
        throw e;
    }
}
