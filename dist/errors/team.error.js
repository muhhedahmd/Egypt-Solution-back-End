"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamDeletionError = exports.TeamUpdateError = exports.TeamCreationError = exports.TeamValidationError = exports.TeamNotFoundError = exports.TeamError = void 0;
class TeamError extends Error {
    constructor(message, statusCode = 500, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = 'TeamError';
    }
}
exports.TeamError = TeamError;
class TeamNotFoundError extends TeamError {
    constructor(id) {
        super(`Team member with ID ${id} not found`, 404, 'TEAM_NOT_FOUND');
        this.name = 'TeamNotFoundError';
    }
}
exports.TeamNotFoundError = TeamNotFoundError;
class TeamValidationError extends TeamError {
    constructor(message, code = 'VALIDATION_ERROR', name = 'TeamValidationError') {
        super(message, 400, code);
        this.name = name;
    }
}
exports.TeamValidationError = TeamValidationError;
class TeamCreationError extends TeamError {
    constructor(message, code = 'TEAM_CREATION_ERROR', name = 'TeamCreationError') {
        super(message, 500, code);
        this.name = name;
    }
}
exports.TeamCreationError = TeamCreationError;
class TeamUpdateError extends TeamError {
    constructor(message, code = 'TEAM_UPDATE_ERROR', name = 'TeamUpdateError') {
        super(message, 500, code);
        this.name = name;
    }
}
exports.TeamUpdateError = TeamUpdateError;
class TeamDeletionError extends TeamError {
    constructor(message, code = 'TEAM_DELETION_ERROR', name = 'TeamDeletionError') {
        super(message, 500, code);
        this.name = name;
    }
}
exports.TeamDeletionError = TeamDeletionError;
