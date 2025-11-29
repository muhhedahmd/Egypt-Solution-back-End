"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceDeletionError = exports.ServiceUpdateError = exports.ServiceCreationError = exports.ServiceValidationError = exports.ServiceNotFoundError = exports.ServiceError = void 0;
class ServiceError extends Error {
    constructor(message, statusCode = 500, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = 'ServiceError';
    }
}
exports.ServiceError = ServiceError;
class ServiceNotFoundError extends ServiceError {
    constructor(id) {
        super(`Service with ID ${id} not found`, 404, 'SERVICE_NOT_FOUND');
        this.name = 'ServiceNotFoundError';
    }
}
exports.ServiceNotFoundError = ServiceNotFoundError;
class ServiceValidationError extends ServiceError {
    constructor(message, code = 'VALIDATION_ERROR', name = 'ServiceValidationError') {
        super(message, 400, code);
        this.name = name;
    }
}
exports.ServiceValidationError = ServiceValidationError;
class ServiceCreationError extends ServiceError {
    constructor(message, code = 'SERVICE_CREATION_ERROR', name = 'ServiceCreationError') {
        super(message, 500, code);
        this.name = name;
    }
}
exports.ServiceCreationError = ServiceCreationError;
class ServiceUpdateError extends ServiceError {
    constructor(message, code = 'SERVICE_UPDATE_ERROR', name = 'ServiceUpdateError') {
        super(message, 500, code);
        this.name = name;
    }
}
exports.ServiceUpdateError = ServiceUpdateError;
class ServiceDeletionError extends ServiceError {
    constructor(message, code = 'SERVICE_DELETION_ERROR', name = 'ServiceDeletionError') {
        super(message, 500, code);
        this.name = name;
    }
}
exports.ServiceDeletionError = ServiceDeletionError;
