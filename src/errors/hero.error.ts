
export class HeroError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'HeroError';
  }
}

export class HeroNotFoundError extends HeroError {
  constructor(id: string) {
    super(`Hero with ID ${id} not found`, 404, 'HERO_NOT_FOUND');
    this.name = 'HeroNotFoundError';
  }
}

export class HeroValidationError extends HeroError {
  constructor(
    message: string,
    code = 'VALIDATION_ERROR',
    name = 'HeroValidationError'
  ) {
    super(message, 400, code);
    this.name = name;
  }
}

export class HeroCreationError extends HeroError {
  constructor(
    message: string,
    code = 'HERO_CREATION_ERROR',
    name = 'HeroCreationError'
  ) {
    super(message, 500, code);
    this.name = name;
  }
}

export class HeroUpdateError extends HeroError {
  constructor(
    message: string,
    code = 'HERO_UPDATE_ERROR',
    name = 'HeroUpdateError'
  ) {
    super(message, 500, code);
    this.name = name;
  }
}

export class HeroDeletionError extends HeroError {
  constructor(
    message: string,
    code = 'HERO_DELETION_ERROR',
    name = 'HeroDeletionError'
  ) {
    super(message, 500, code);
    this.name = name;
  }
}