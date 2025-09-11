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

export async function decryptMessage(message, askPassphraseCallback) {
    try {
        const binaryData = dearmor(message);
        if (!binaryData) {
            return {msg: null, error: 'Invalid PGP message format.'}
        }

        const keyId = findKeyId(binaryData);
        if (!keyId) {
            return {msg: null, error: 'Could not find Key ID in the PGP message.'}
        }

        const privateKeyEntry = keyManager.getPrivateKeyBySubKeyId(keyId);
        if (!privateKeyEntry) {
            return {msg: null, error: `No private key found for Key ID: ${keyId}`}
        }

        let msg = "";
        if (privateKeyEntry.isEncrypted) {
            const pass = await askPassphraseCallback();
            if (!pass) {
                return {msg: null, error: 'Passphrase is required to decrypt the private key.'};
            }
            msg = await OpenPGP.decrypt(message, privateKeyEntry.keyString, pass);
        } else {
            msg = await OpenPGP.decrypt(message, privateKeyEntry.keyString, "");
        }

        return {msg, error: null}
    } catch (e) {
        console.error(e);
        throw e;
    }
}

/**
 * Removes PGP armor and base64 decodes the message.
 * @param {string} armoredText The ASCII-armored PGP message.
 * @returns {Uint8Array|null} The raw binary data or null if invalid.
 */
function dearmor(armoredText) {
    const pgpMessageRegex = /-----BEGIN PGP MESSAGE-----\s*([\s\S]+?)\s*-----END PGP MESSAGE-----/;
    const match = armoredText.match(pgpMessageRegex);

    if (!match || !match[1]) {
        return null;
    }

    const lines = match[1].trim().split('\n');
    const base64Lines = [];
    let headersEnded = false;

    for (let line of lines) {
        line = line.trim();
        // An empty line signifies the end of headers.
        if (!line) {
            headersEnded = true;
            continue;
        }

        // If the line contains a colon and we haven't passed the headers yet, it's a header. Skip it.
        if (line.includes(':') && !headersEnded) {
            continue;
        }

        // The checksum line starts with '=', so we ignore it.
        if (line.startsWith('=')) {
            continue;
        }

        // If we've passed all checks, it's a line of base64 data.
        base64Lines.push(line);
    }

    const base64Content = base64Lines.join('');

    if (!base64Content) {
        throw new Error("Could not extract Base64 content from the PGP message.");
    }

    try {
        const binaryString = atob(base64Content);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    } catch (e) {
        throw new Error("Invalid Base64 encoding in PGP message body.");
    }
}

/**
 * Parses PGP packets to find the Key ID from the first session key packet.
 * @param {Uint8Array} data The raw binary data of the PGP message.
 * @returns {string|null} The Key ID as a hex string or null if not found.
 */
function findKeyId(data) {
    let i = 0;
    while (i < data.length) {
        const packetInfo = parsePacketHeader(data, i);
        if (!packetInfo) {
            // Could not parse header, stop processing
            return null;
        }

        // Packet Tag 1 is a Public-Key Encrypted Session Key packet
        if (packetInfo.tag === 1) {
            const packetDataStart = i + packetInfo.headerLength;
            const version = data[packetDataStart];

            // Check for version 3, the only one with a Key ID in this position
            if (version === 3) {
                const keyIdStart = packetDataStart + 1; // 1 byte for version
                const keyIdEnd = keyIdStart + 8; // Key ID is 8 bytes
                if (keyIdEnd > data.length) return null; // Corrupted packet

                const keyIdBytes = data.subarray(keyIdStart, keyIdEnd);
                return bytesToHexString(keyIdBytes);
            }
        }

        // Move to the next packet
        const nextPacketIndex = i + packetInfo.headerLength + packetInfo.bodyLength;
        if (nextPacketIndex <= i) {
            // Avoid infinite loops on malformed packets
            return null;
        }
        i = nextPacketIndex;
    }
    return null;
}

/**
 * Parses a PGP packet header (RFC 4880 Section 4.2).
 * @param {Uint8Array} data The binary data.
 * @param {number} offset The starting offset for the packet.
 * @returns {{tag: number, headerLength: number, bodyLength: number}|null}
 */
function parsePacketHeader(data, offset) {
    if (offset >= data.length) return null;

    const tagByte = data[offset];
    // Check if it's a valid packet tag (bit 7 must be 1)
    if (!(tagByte & 0x80)) return null;

    let tag, headerLength, bodyLength;

    // New format packet (bit 6 is 1)
    if (tagByte & 0x40) {
        tag = tagByte & 0x3F;

        let lengthOctet1 = data[offset + 1];
        if (lengthOctet1 < 192) {
            // One-Octet Length
            bodyLength = lengthOctet1;
            headerLength = 2;
        } else if (lengthOctet1 >= 192 && lengthOctet1 <= 223) {
            // Two-Octet Length
            let lengthOctet2 = data[offset + 2];
            bodyLength = ((lengthOctet1 - 192) << 8) + lengthOctet2 + 192;
            headerLength = 3;
        } else if (lengthOctet1 === 255) {
            // Five-Octet Length
            bodyLength = (data[offset + 2] << 24) | (data[offset + 3] << 16) | (data[offset + 4] << 8) | data[offset + 5];
            headerLength = 6;
        } else {
            // Partial body length, not fully supported for this simple parser
            bodyLength = 1 << (lengthOctet1 & 0x1F);
            headerLength = 2;
        }
    } else { // Old format packet
        tag = (tagByte >> 2) & 0x0F;
        const lengthType = tagByte & 0x03;
        headerLength = 2; // Minimum length
        switch (lengthType) {
            case 0: // The packet has a one-octet length.
                bodyLength = data[offset + 1];
                break;
            case 1: // The packet has a two-octet length.
                bodyLength = (data[offset + 1] << 8) | data[offset + 2];
                headerLength = 3;
                break;
            case 2: // The packet has a four-octet length.
                bodyLength = (data[offset + 1] << 24) | (data[offset + 2] << 16) | (data[offset + 3] << 8) | data[offset + 4];
                headerLength = 5;
                break;
            case 3: // The packet is of indeterminate length.
                // For simplicity, we won't handle this here as the key ID packet has a defined length.
                bodyLength = data.length - (offset + 1);
                headerLength = 1;
                break;
        }
    }
    return {tag, headerLength, bodyLength};
}

/**
 * Converts a Uint8Array to a hexadecimal string.
 * @param {Uint8Array} bytes
 * @returns {string} The hex representation.
 */
function bytesToHexString(bytes) {
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0').toUpperCase()).join('');
}

