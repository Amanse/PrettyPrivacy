import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";

export function mimeLookup(filename) {
    const extension = filename.split('.').pop()?.toLowerCase();

    switch (extension) {
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'png':
            return 'image/png';
        case 'gif':
            return 'image/gif';
        case 'pdf':
            return 'application/pdf';
        case 'doc':
            return 'application/msword';
        case 'docx':
            return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        case 'xls':
            return 'application/vnd.ms-excel';
        case 'xlsx':
            return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        case 'txt':
            return 'text/plain';
        case 'mp4':
            return 'video/mp4';
        case 'zip':
            return 'application/zip';
        // Add more cases here as needed...
        default:
            return 'application/octet-stream';
    }
}

export async function pickFileAndGetData(isEncrypt) {
    const pickerResult = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
    });

    if (pickerResult.canceled) {
        return;
    }

    const asset = pickerResult.assets[0];
    let outputFilename;

    if (isEncrypt) {
        outputFilename = asset.name + '.gpg';
    } else {
        outputFilename = asset.name.replace(/\.(gpg|pgp)$/i, '');
    }

    const tempUri = FileSystem.cacheDirectory + outputFilename;

    return {tempUri, outputFilename, asset}
}