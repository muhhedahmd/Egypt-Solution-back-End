"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeroDeletionError = exports.HeroUpdateError = exports.HeroCreationError = exports.HeroValidationError = exports.HeroNotFoundError = exports.HeroError = void 0;
class HeroError extends Error {
    constructor(message, statusCode = 500, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = 'HeroError';
    }
}
exports.HeroError = HeroError;
class HeroNotFoundError extends HeroError {
    constructor(id) {
        super(`Hero with ID ${id} not found`, 404, 'HERO_NOT_FOUND');
        this.name = 'HeroNotFoundError';
    }
}
exports.HeroNotFoundError = HeroNotFoundError;
class HeroValidationError extends HeroError {
    constructor(message, code = 'VALIDATION_ERROR', name = 'HeroValidationError') {
        super(message, 400, code);
        this.name = name;
    }
}
exports.HeroValidationError = HeroValidationError;
class HeroCreationError extends HeroError {
    constructor(message, code = 'HERO_CREATION_ERROR', name = 'HeroCreationError') {
        super(message, 500, code);
        this.name = name;
    }
}
exports.HeroCreationError = HeroCreationError;
class HeroUpdateError extends HeroError {
    constructor(message, code = 'HERO_UPDATE_ERROR', name = 'HeroUpdateError') {
        super(message, 500, code);
        this.name = name;
    }
}
exports.HeroUpdateError = HeroUpdateError;
class HeroDeletionError extends HeroError {
    constructor(message, code = 'HERO_DELETION_ERROR', name = 'HeroDeletionError') {
        super(message, 500, code);
        this.name = name;
    }
}
exports.HeroDeletionError = HeroDeletionError;
