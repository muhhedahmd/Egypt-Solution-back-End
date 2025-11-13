
export class ClientError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'ClientError';
  }
}

export class ClientNotFoundError extends ClientError {
  constructor(id: string) {
    super(`Client with ID ${id} not found`, 404, 'CLIENT_NOT_FOUND');
    this.name = 'ClientNotFoundError';
  }
}

export class ClientValidationError extends ClientError {
  constructor(message: string, code = 'VALIDATION_ERROR', name = 'ClientValidationError') {
    super(message, 400, code);
    this.name = name;
  }
}

export class ClientCreationError extends ClientError {
  constructor(message: string, code = 'CLIENT_CREATION_ERROR', name = 'ClientCreationError') {
    super(message, 500, code);
    this.name = name;
  }
}

export class ClientUpdateError extends ClientError {
  constructor(message: string, code = 'CLIENT_UPDATE_ERROR', name = 'ClientUpdateError') {
    super(message, 500, code);
    this.name = name;
  }
}

export class ClientDeletionError extends ClientError {
  constructor(message: string, code = 'CLIENT_DELETION_ERROR', name = 'ClientDeletionError') {
    super(message, 500, code);
    this.name = name;
  }
}