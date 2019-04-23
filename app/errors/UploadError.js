class UploadError extends Error {
    constructor(message, data) {
        super(message);

        this.name = 'UploadError';
        this.fieldName = data.fieldName;
        this.errors = data.errors;
    }
}

module.exports = UploadError;
