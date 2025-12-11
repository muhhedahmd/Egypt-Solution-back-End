"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyInfoDeletionError = exports.CompanyInfoUpdateError = exports.CompanyInfoCreationError = exports.CompanyInfoValidationError = exports.CompanyInfoIsAlreadyExist = exports.CompanyInfoNotFoundError = exports.CompanyInfoError = void 0;
class CompanyInfoError extends Error {
    constructor(message, statusCode = 500, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = 'CompanyInfoError';
    }
}
exports.CompanyInfoError = CompanyInfoError;
class CompanyInfoNotFoundError extends CompanyInfoError {
    constructor(id) {
        super(`CompanyInfo with ID ${id} not found`, 404, 'CompanyInfo_NOT_FOUND');
        this.name = 'CompanyInfoNotFoundError';
    }
}
exports.CompanyInfoNotFoundError = CompanyInfoNotFoundError;
class CompanyInfoIsAlreadyExist extends CompanyInfoError {
    constructor() {
        super(`CompanyInfo with  is already exist`, 400, 'CompanyInfo_ALREADY_EXIST');
        this.name = 'CompanyInfoIsAlreadyExist';
    }
}
exports.CompanyInfoIsAlreadyExist = CompanyInfoIsAlreadyExist;
class CompanyInfoValidationError extends CompanyInfoError {
    constructor(message, code = 'VALIDATION_ERROR', name = 'CompanyInfoValidationError') {
        super(message, 400, code);
        this.name = name;
    }
}
exports.CompanyInfoValidationError = CompanyInfoValidationError;
class CompanyInfoCreationError extends CompanyInfoError {
    constructor(message, code = 'CompanyInfo_CREATION_ERROR', name = 'CompanyInfoCreationError') {
        super(message, 500, code);
        this.name = name;
    }
}
exports.CompanyInfoCreationError = CompanyInfoCreationError;
class CompanyInfoUpdateError extends CompanyInfoError {
    constructor(message, code = 'CompanyInfo_UPDATE_ERROR', name = 'CompanyInfoUpdateError') {
        super(message, 500, code);
        this.name = name;
    }
}
exports.CompanyInfoUpdateError = CompanyInfoUpdateError;
class CompanyInfoDeletionError extends CompanyInfoError {
    constructor(message, code = 'CompanyInfo_DELETION_ERROR', name = 'CompanyInfoDeletionError') {
        super(message, 500, code);
        this.name = name;
    }
}
exports.CompanyInfoDeletionError = CompanyInfoDeletionError;
