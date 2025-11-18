export class TestimonialError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'TestimonialError';
  }
}

export class TestimonialNotFoundError extends TestimonialError {
  constructor(id: string) {
    super(`Testimonial with ID ${id} not found`, 404, 'TESTIMONIAL_NOT_FOUND');
    this.name = 'TestimonialNotFoundError';
  }
}

export class TestimonialValidationError extends TestimonialError {
  constructor(message: string, code = 'VALIDATION_ERROR', name = 'TestimonialValidationError') {
    super(message, 400, code);
    this.name = name;
  }
}

export class TestimonialCreationError extends TestimonialError {
  constructor(message: string, code = 'TESTIMONIAL_CREATION_ERROR', name = 'TestimonialCreationError') {
    super(message, 500, code);
    this.name = name;
  }
}

export class TestimonialUpdateError extends TestimonialError {
  constructor(message: string, code = 'TESTIMONIAL_UPDATE_ERROR', name = 'TestimonialUpdateError') {
    super(message, 500, code);
    this.name = name;
  }
}

export class TestimonialDeletionError extends TestimonialError {
  constructor(message: string, code = 'TESTIMONIAL_DELETION_ERROR', name = 'TestimonialDeletionError') {
    super(message, 500, code);
    this.name = name;
  }
}