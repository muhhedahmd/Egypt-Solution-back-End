"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestimonialDeletionError = exports.TestimonialUpdateError = exports.TestimonialCreationError = exports.TestimonialValidationError = exports.TestimonialNotFoundError = exports.TestimonialError = void 0;
class TestimonialError extends Error {
    constructor(message, statusCode = 500, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = 'TestimonialError';
    }
}
exports.TestimonialError = TestimonialError;
class TestimonialNotFoundError extends TestimonialError {
    constructor(id) {
        super(`Testimonial with ID ${id} not found`, 404, 'TESTIMONIAL_NOT_FOUND');
        this.name = 'TestimonialNotFoundError';
    }
}
exports.TestimonialNotFoundError = TestimonialNotFoundError;
class TestimonialValidationError extends TestimonialError {
    constructor(message, code = 'VALIDATION_ERROR', name = 'TestimonialValidationError') {
        super(message, 400, code);
        this.name = name;
    }
}
exports.TestimonialValidationError = TestimonialValidationError;
class TestimonialCreationError extends TestimonialError {
    constructor(message, code = 'TESTIMONIAL_CREATION_ERROR', name = 'TestimonialCreationError') {
        super(message, 500, code);
        this.name = name;
    }
}
exports.TestimonialCreationError = TestimonialCreationError;
class TestimonialUpdateError extends TestimonialError {
    constructor(message, code = 'TESTIMONIAL_UPDATE_ERROR', name = 'TestimonialUpdateError') {
        super(message, 500, code);
        this.name = name;
    }
}
exports.TestimonialUpdateError = TestimonialUpdateError;
class TestimonialDeletionError extends TestimonialError {
    constructor(message, code = 'TESTIMONIAL_DELETION_ERROR', name = 'TestimonialDeletionError') {
        super(message, 500, code);
        this.name = name;
    }
}
exports.TestimonialDeletionError = TestimonialDeletionError;
