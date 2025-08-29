import storage from './storage';

export default class PGPKeyManager {

    constructor() {
    }

    getKeyList() {
        try {
            const keysJson = storage.getString('keyPair');
            if (keysJson) {
                return JSON.parse(keysJson);
            }
            return [];
        } catch (error) {
            console.error('Error retrieving keys from storage:', error);
            return [];
        }
    }

    async saveKey(key) {
        try {
            const keys = this.getKeyList();
            if (keys.some(k => k.keyID === key.keyID)) {
                throw new Error('This key is already imported.');
            }
            keys.push(key);
            storage.set('keyPair', JSON.stringify(keys));
        } catch (error) {
            console.error('Error saving key to storage:', error);
            throw error;
        }
    }

}