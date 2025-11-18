export class TeamError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'TeamError';
  }
}

export class TeamNotFoundError extends TeamError {
  constructor(id: string) {
    super(`Team member with ID ${id} not found`, 404, 'TEAM_NOT_FOUND');
    this.name = 'TeamNotFoundError';
  }
}

export class TeamValidationError extends TeamError {
  constructor(message: string, code = 'VALIDATION_ERROR', name = 'TeamValidationError') {
    super(message, 400, code);
    this.name = name;
  }
}

export class TeamCreationError extends TeamError {
  constructor(message: string, code = 'TEAM_CREATION_ERROR', name = 'TeamCreationError') {
    super(message, 500, code);
    this.name = name;
  }
}

export class TeamUpdateError extends TeamError {
  constructor(message: string, code = 'TEAM_UPDATE_ERROR', name = 'TeamUpdateError') {
    super(message, 500, code);
    this.name = name;
  }
}

export class TeamDeletionError extends TeamError {
  constructor(message: string, code = 'TEAM_DELETION_ERROR', name = 'TeamDeletionError') {
    super(message, 500, code);
    this.name = name;
  }
}