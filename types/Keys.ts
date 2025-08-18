import {PrivateKeyMetadata, PublicKeyMetadata} from "react-native-fast-openpgp";

export interface PublicKey extends PublicKeyMetadata {
    key: string
}

export interface PrivateKey extends PrivateKeyMetadata {
    key: string
}
