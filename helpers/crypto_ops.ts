import OpenPGP from "react-native-fast-openpgp";

export async function encryptMessage(message: string, publicKey: string): Promise<string> {
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