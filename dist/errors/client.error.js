"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientDeletionError = exports.ClientUpdateError = exports.ClientCreationError = exports.ClientValidationError = exports.ClientNotFoundError = exports.ClientError = void 0;
class ClientError extends Error {
    constructor(message, statusCode = 500, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = 'ClientError';
    }
}
exports.ClientError = ClientError;
class ClientNotFoundError extends ClientError {
    constructor(id) {
        super(`Client with ID ${id} not found`, 404, 'CLIENT_NOT_FOUND');
        this.name = 'ClientNotFoundError';
    }
}
exports.ClientNotFoundError = ClientNotFoundError;
class ClientValidationError extends ClientError {
    constructor(message, code = 'VALIDATION_ERROR', name = 'ClientValidationError') {
        super(message, 400, code);
        this.name = name;
    }
}
exports.ClientValidationError = ClientValidationError;
class ClientCreationError extends ClientError {
    constructor(message, code = 'CLIENT_CREATION_ERROR', name = 'ClientCreationError') {
        super(message, 500, code);
        this.name = name;
    }
}
exports.ClientCreationError = ClientCreationError;
class ClientUpdateError extends ClientError {
    constructor(message, code = 'CLIENT_UPDATE_ERROR', name = 'ClientUpdateError') {
        super(message, 500, code);
        this.name = name;
    }
}
exports.ClientUpdateError = ClientUpdateError;
class ClientDeletionError extends ClientError {
    constructor(message, code = 'CLIENT_DELETION_ERROR', name = 'ClientDeletionError') {
        super(message, 500, code);
        this.name = name;
    }
}
exports.ClientDeletionError = ClientDeletionError;
