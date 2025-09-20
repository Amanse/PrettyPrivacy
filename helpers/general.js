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