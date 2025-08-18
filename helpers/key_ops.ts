import * as FileSystem from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import OpenPGP, {PrivateKeyMetadata, PublicKeyMetadata} from "react-native-fast-openpgp";
import {PublicKey, PrivateKey} from "@/types/Keys";

function isPrivateKey(key: string): boolean {
    return key.startsWith('-----BEGIN PGP PRIVATE KEY BLOCK-----');
}

export async function getPublicKeys(): Promise<PublicKey[]> {
    const publicKeys = await SecureStore.getItemAsync('publicKeys');
    if (publicKeys) {
        return JSON.parse(publicKeys);
    }
    return [];
}

export default async function key_ops(uri: string) {
    console.debug("key ops called with uri:", uri);
    try {
        const contents = await FileSystem.readAsStringAsync(uri);
        if (isPrivateKey(contents)) {
            await importPrivateKey(contents);
        } else {
            await importPublicKey(contents);
        }
    } catch (error) {
        console.error('Error reading file:', error);
        throw new Error('Failed to read the key file. Please check the file path and try again.');
    }
}

export async function importPrivateKey(contents: string) {
    console.debug("importPrivateKey: " + contents);
    const keyData = await OpenPGP.getPrivateKeyMetadata(contents);
    if (!keyData) {
        throw new Error('Invalid private key format.');
    }

    const key: PrivateKey = keyData as PrivateKeyMetadata;
    key.key = contents;

    const existingKeys = await SecureStore.getItemAsync('privateKeys');
    let newData;
    if (existingKeys) {
        const parsedKeys = JSON.parse(existingKeys);
        if (parsedKeys.some((key: PrivateKeyMetadata) => key.keyID === keyData.keyID)) {
            throw new Error('This private key is already imported.');
        }
        parsedKeys.push(keyData);
        newData = JSON.stringify(parsedKeys);
    } else {
        newData = JSON.stringify([keyData]);
    }
    await SecureStore.setItemAsync('privateKeys', newData, {requireAuthentication: true})
    console.debug("importPrivateKey imported: " + newData);
    const publickey = await OpenPGP.convertPrivateKeyToPublicKey(contents);
    if (!publickey) {
        throw new Error('Failed to convert private key to public key.');
    }
    await importPublicKey(publickey);
}

export async function importPublicKey(contents: string) {
    console.debug("importPublicKey: " + contents);
    const keyData = await OpenPGP.getPublicKeyMetadata(contents);
    if (!keyData) {
        throw new Error('Invalid public key format.');
    }

    const key: PublicKey = keyData as PublicKey;
    key.key = contents;

    const existingKeys = await SecureStore.getItemAsync('publicKeys');
    let newData;
    if (existingKeys) {
        const parsedKeys = JSON.parse(existingKeys);
        if (parsedKeys.some((key: { keyID: string }) => key.keyID === keyData.keyID)) {
            throw new Error('This public key is already imported.');
        }
        parsedKeys.push(keyData);
        newData = JSON.stringify(parsedKeys);
    } else {
        newData = JSON.stringify([keyData]);
    }
    await SecureStore.setItemAsync('publicKeys', newData);
}