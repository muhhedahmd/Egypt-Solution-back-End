"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactDeletionError = exports.ContactUpdateError = exports.ContactCreationError = exports.ContactValidationError = exports.ContactNotFoundError = exports.ContactError = void 0;
class ContactError extends Error {
    constructor(message, statusCode = 500, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = 'ContactError';
    }
}
exports.ContactError = ContactError;
class ContactNotFoundError extends ContactError {
    constructor(id) {
        super(`Contact with ID ${id} not found`, 404, 'Contact_NOT_FOUND');
        this.name = 'ContactNotFoundError';
    }
}
exports.ContactNotFoundError = ContactNotFoundError;
class ContactValidationError extends ContactError {
    constructor(message, code = 'VALIDATION_ERROR', name = 'ContactValidationError') {
        super(message, 400, code);
        this.name = name;
    }
}
exports.ContactValidationError = ContactValidationError;
class ContactCreationError extends ContactError {
    constructor(message, code = 'Contact_CREATION_ERROR', name = 'ContactCreationError') {
        super(message, 500, code);
        this.name = name;
    }
}
exports.ContactCreationError = ContactCreationError;
class ContactUpdateError extends ContactError {
    constructor(message, code = 'Contact_UPDATE_ERROR', name = 'ContactUpdateError') {
        super(message, 500, code);
        this.name = name;
    }
}
exports.ContactUpdateError = ContactUpdateError;
class ContactDeletionError extends ContactError {
    constructor(message, code = 'Contact_DELETION_ERROR', name = 'ContactDeletionError') {
        super(message, 500, code);
        this.name = name;
    }
}
exports.ContactDeletionError = ContactDeletionError;
